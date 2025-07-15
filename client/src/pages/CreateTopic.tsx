import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { topicService } from '../services/topic';
import { nodeService } from '../services/node';
import { Node } from '../types';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  content: string;
  nodeId: string;
}

const CreateTopic: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
  const preSelectedNode = searchParams.get('node');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchNodes = async () => {
      try {
        const data = await nodeService.getNodes();
        setNodes(data);
        
        // 如果有预选节点，设置默认值
        if (preSelectedNode) {
          const selectedNode = data.find(node => node.name === preSelectedNode);
          if (selectedNode) {
            setValue('nodeId', selectedNode.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      }
    };

    fetchNodes();
  }, [user, navigate, preSelectedNode, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const topic = await topicService.createTopic(data.title, data.content, data.nodeId);
      toast.success('主题发表成功');
      navigate(`/topic/${topic.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '主题发表失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">发表新主题</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="nodeId" className="block text-sm font-medium text-gray-700 mb-2">
              选择节点
            </label>
            <select
              {...register('nodeId', { required: '请选择一个节点' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">请选择节点</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.title}
                </option>
              ))}
            </select>
            {errors.nodeId && (
              <p className="mt-1 text-sm text-red-600">{errors.nodeId.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              主题标题
            </label>
            <input
              {...register('title', { 
                required: '请输入主题标题',
                minLength: { value: 5, message: '标题至少5个字符' },
                maxLength: { value: 100, message: '标题最多100个字符' }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="请输入主题标题"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              主题内容
            </label>
            <textarea
              {...register('content', { 
                required: '请输入主题内容',
                minLength: { value: 10, message: '内容至少10个字符' }
              })}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="请输入主题内容..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? '发表中...' : '发表主题'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopic;