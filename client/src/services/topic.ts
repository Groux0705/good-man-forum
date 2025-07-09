import api from '../utils/api';
import { ApiResponse, Topic } from '../types';

export const topicService = {
  getTopics: async (page = 1, limit = 20, node?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (node) params.append('node', node);
    
    const response = await api.get<ApiResponse<{
      topics: Topic[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>>(`/topics?${params}`);
    return response.data.data!;
  },

  getTopic: async (id: string): Promise<Topic> => {
    const response = await api.get<ApiResponse<Topic>>(`/topics/${id}`);
    return response.data.data!;
  },

  createTopic: async (title: string, content: string, nodeId: string): Promise<Topic> => {
    const response = await api.post<ApiResponse<Topic>>('/topics', {
      title,
      content,
      nodeId,
    });
    return response.data.data!;
  },

  updateTopic: async (id: string, title: string, content: string): Promise<Topic> => {
    const response = await api.put<ApiResponse<Topic>>(`/topics/${id}`, {
      title,
      content,
    });
    return response.data.data!;
  },

  deleteTopic: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/topics/${id}`);
  },
};