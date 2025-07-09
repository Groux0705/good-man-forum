import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { replyService } from '../services/reply';
import toast from 'react-hot-toast';

interface ReplyFormProps {
  topicId: string;
  parentId?: string;
  parentUsername?: string;
  onReplyCreated: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

interface FormData {
  content: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ 
  topicId, 
  parentId, 
  parentUsername, 
  onReplyCreated, 
  onCancel,
  compact = false 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  if (!user) {
    return (
      <div className="theme-surface p-6 rounded-lg text-center">
        <p className="theme-text-secondary">请登录后再回复</p>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await replyService.createReply(data.content, topicId, parentId, parentUsername);
      reset();
      onReplyCreated();
      if (onCancel) {
        onCancel();
      }
      toast.success('回复发表成功');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '回复发表失败');
    } finally {
      setLoading(false);
    }
  };

  const formClassName = compact 
    ? "theme-surface p-4 rounded-lg theme-border border space-y-3" 
    : "theme-card p-6 rounded-lg shadow space-y-4";

  return (
    <div className={formClassName}>
      {!compact && <h3 className="text-lg font-medium mb-4 theme-text">添加回复</h3>}
      {parentUsername && (
        <div className="text-sm theme-text-secondary mb-2">
          回复给 <span className="font-medium theme-primary">@{parentUsername}</span>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <textarea
            {...register('content', { required: '请输入回复内容' })}
            rows={compact ? 3 : 4}
            className="w-full px-3 py-2 theme-input text-sm"
            placeholder={parentUsername ? `回复 @${parentUsername}...` : "请输入你的回复..."}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 theme-text-secondary hover:opacity-80 text-sm"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="theme-button px-6 py-2 rounded-md disabled:opacity-50 text-sm"
          >
            {loading ? '发表中...' : '发表回复'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;