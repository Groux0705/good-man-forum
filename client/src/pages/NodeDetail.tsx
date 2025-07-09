import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { topicService } from '../services/topic';
import { nodeService } from '../services/node';
import { Topic, Node } from '../types';
import TopicList from '../components/TopicList';

const NodeDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [node, setNode] = useState<Node | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchNodeAndTopics = async (pageNum = 1) => {
    if (!name) return;
    
    try {
      setLoading(true);
      const [nodeData, topicsData] = await Promise.all([
        nodeService.getNodes().then(nodes => nodes.find(n => n.name === name)),
        topicService.getTopics(pageNum, 20, name)
      ]);
      
      if (nodeData) {
        setNode(nodeData);
        setTopics(topicsData.topics);
        setPagination(topicsData.pagination);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch node and topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeAndTopics();
  }, [name]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">节点不存在</h1>
          <p className="text-gray-600 mt-2">该节点可能已被删除或不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            {node.avatar ? (
              <img
                src={node.avatar}
                alt={node.title}
                className="w-16 h-16 rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-primary-100 rounded flex items-center justify-center">
                <span className="text-primary-600 font-bold text-xl">
                  {node.title.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{node.title}</h1>
              <p className="text-gray-600 mt-1">{node.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{node.topics} 个主题</span>
                <span>节点名称: {node.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">最新主题</h2>
      </div>

      {topics.length > 0 ? (
        <>
          <TopicList topics={topics} />
          
          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                {page > 1 && (
                  <button
                    onClick={() => fetchNodeAndTopics(page - 1)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    上一页
                  </button>
                )}
                
                <span className="px-3 py-2 text-sm text-gray-600">
                  第 {page} 页，共 {pagination.pages} 页
                </span>
                
                {page < pagination.pages && (
                  <button
                    onClick={() => fetchNodeAndTopics(page + 1)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    下一页
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">该节点暂时还没有主题</p>
        </div>
      )}
    </div>
  );
};

export default NodeDetail;