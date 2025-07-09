import React, { useState } from 'react';
import { Reply } from '../types';
import { formatRelativeTime } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import { replyService } from '../services/reply';
import ReplyForm from './ReplyForm';

interface ReplyListProps {
  replies: Reply[];
  onReplyUpdated?: () => void;
  topicId: string;
}

interface ReplyItemProps {
  reply: Reply;
  onReplyUpdated?: () => void;
  topicId: string;
  isChild?: boolean;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ 
  reply, 
  onReplyUpdated, 
  topicId,
  isChild = false 
}) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isOwner = user && user.id === reply.userId;
  const isEditing = editingId === reply.id;

  const handleEdit = (reply: Reply) => {
    setEditingId(reply.id);
    setEditContent(reply.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (replyId: string) => {
    try {
      setUpdating(true);
      await replyService.updateReply(replyId, editContent);
      setEditingId(null);
      setEditContent('');
      if (onReplyUpdated) {
        onReplyUpdated();
      }
    } catch (error) {
      console.error('Failed to update reply:', error);
      alert('更新失败，请重试');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (replyId: string) => {
    if (window.confirm('确定要删除这条回复吗？此操作不可撤销。')) {
      try {
        await replyService.deleteReply(replyId);
        if (onReplyUpdated) {
          onReplyUpdated();
        }
      } catch (error) {
        console.error('Failed to delete reply:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleReply = () => {
    setShowReplyForm(true);
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
  };

  const handleReplyCreated = () => {
    setShowReplyForm(false);
    if (onReplyUpdated) {
      onReplyUpdated();
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`flex items-start space-x-3 ${isChild ? 'ml-12 pl-4' : ''}`}
        style={isChild ? { borderLeft: '2px solid var(--color-border)' } : {}}
      >
        <img
          src={reply.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${reply.user?.username}`}
          alt={reply.user?.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium theme-text text-sm">{reply.user?.username}</span>
              {reply.replyToUsername && (
                <span className="text-xs theme-text-secondary">
                  回复 @{reply.replyToUsername}
                </span>
              )}
              <span className="text-xs theme-text-secondary">{formatRelativeTime(reply.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <button
                  onClick={handleReply}
                  className="theme-primary hover:opacity-80 text-xs"
                >
                  回复
                </button>
              )}
              {isOwner && (
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => handleEdit(reply)}
                        className="theme-primary hover:opacity-80 text-xs"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(reply.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        删除
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSaveEdit(reply.id)}
                        disabled={updating}
                        className="text-green-600 hover:text-green-800 text-xs disabled:opacity-50"
                      >
                        {updating ? '保存中...' : '保存'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="theme-text-secondary hover:opacity-80 text-xs"
                      >
                        取消
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 theme-input text-sm"
              placeholder="回复内容"
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="theme-text text-sm whitespace-pre-wrap">{reply.content}</p>
            </div>
          )}
          
          {/* 回复表单 */}
          {showReplyForm && (
            <div className="mt-4 ml-2">
              <ReplyForm
                topicId={topicId}
                parentId={reply.id}
                parentUsername={reply.user?.username}
                onReplyCreated={handleReplyCreated}
                onCancel={handleCancelReply}
                compact={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReplyList: React.FC<ReplyListProps> = ({ replies, onReplyUpdated, topicId }) => {
  return (
    <div className="space-y-6">
      {replies.map((reply) => (
        <div key={reply.id} className="space-y-4">
          {/* 顶级回复 */}
          <ReplyItem
            reply={reply}
            onReplyUpdated={onReplyUpdated}
            topicId={topicId}
            isChild={false}
          />
          
          {/* 子回复 - 平铺显示，所有子回复都在第二层 */}
          {reply.children && reply.children.length > 0 && (
            <div className="space-y-3">
              {reply.children.map((childReply) => (
                <ReplyItem
                  key={childReply.id}
                  reply={childReply}
                  onReplyUpdated={onReplyUpdated}
                  topicId={topicId}
                  isChild={true}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReplyList;