import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicService } from '../services/topic';
import { Topic } from '../types';
import { formatRelativeTime } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import ReplyList from '../components/ReplyList';
import ReplyForm from '../components/ReplyForm';

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTopic = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await topicService.getTopic(id);
      setTopic(data);
      setEditTitle(data.title);
      setEditContent(data.content);
    } catch (error: any) {
      if (error.response?.status === 404) {
        navigate('/404');
      }
      console.error('Failed to fetch topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (topic) {
      setEditTitle(topic.title);
      setEditContent(topic.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!topic || !id) return;
    
    try {
      setUpdating(true);
      await topicService.updateTopic(id, editTitle, editContent);
      setTopic({ ...topic, title: editTitle, content: editContent });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update topic:', error);
      alert('更新失败，请重试');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!topic || !id) return;
    
    if (window.confirm('确定要删除这个主题吗？此操作不可撤销。')) {
      try {
        await topicService.deleteTopic(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete topic:', error);
        alert('删除失败，请重试');
      }
    }
  };

  useEffect(() => {
    fetchTopic();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 theme-surface rounded w-3/4 mb-4"></div>
          <div className="h-4 theme-surface rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 theme-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold theme-text">主题不存在</h1>
          <p className="theme-text-secondary mt-2">该主题可能已被删除或不存在</p>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === topic.userId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Topic Header */}
        <div className="theme-card rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm theme-text-secondary">
              <span className="theme-surface px-2 py-1 rounded">{topic.node?.title}</span>
              <span>•</span>
              <span>{topic.clicks} 次点击</span>
              <span>•</span>
              <span>{formatRelativeTime(topic.createdAt)}</span>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="theme-primary hover:opacity-80 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={updating}
                      className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                    >
                      {updating ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="theme-text-secondary hover:opacity-80 text-sm"
                    >
                      取消
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 theme-input"
                placeholder="主题标题"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 theme-input"
                placeholder="主题内容"
              />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold theme-text mb-6">{topic.title}</h1>
              
              <div className="flex items-start space-x-4">
                <img
                  src={topic.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${topic.user?.username}`}
                  alt={topic.user?.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="font-medium theme-text">{topic.user?.username}</span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary)' }}>
                      Lv.{topic.user?.level}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="theme-text whitespace-pre-wrap">{topic.content}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Replies */}
        {topic.replyList && topic.replyList.length > 0 && (
          <div className="theme-card rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-6 theme-text">
              {topic.replies} 个回复
            </h2>
            <ReplyList replies={topic.replyList} onReplyUpdated={fetchTopic} topicId={topic.id} />
          </div>
        )}

        {/* Reply Form */}
        <ReplyForm 
          topicId={topic.id} 
          onReplyCreated={fetchTopic}
        />
      </div>
    </div>
  );
};

export default TopicDetail;