import api from '../utils/api';
import { ApiResponse, Reply } from '../types';

export const replyService = {
  createReply: async (content: string, topicId: string, parentId?: string, replyToUsername?: string): Promise<Reply> => {
    const response = await api.post<ApiResponse<Reply>>('/replies', {
      content,
      topicId,
      parentId,
      replyToUsername
    });
    return response.data.data!;
  },

  updateReply: async (id: string, content: string): Promise<Reply> => {
    const response = await api.put<ApiResponse<Reply>>(`/replies/${id}`, {
      content,
    });
    return response.data.data!;
  },

  deleteReply: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/replies/${id}`);
  },
};