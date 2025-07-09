import api from '../utils/api';
import { ApiResponse, Topic } from '../types';

export interface SearchResult {
  topics: Topic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  query: string;
}

export const searchService = {
  searchTopics: async (query: string, page = 1, limit = 10): Promise<SearchResult> => {
    const response = await api.get<ApiResponse<SearchResult>>('/topics/search', {
      params: { q: query, page, limit }
    });
    return response.data.data!;
  },

  getSuggestions: async (query: string): Promise<Topic[]> => {
    if (!query || query.trim().length < 2) return [];
    
    const response = await api.get<ApiResponse<SearchResult>>('/topics/search', {
      params: { q: query, limit: 5 }
    });
    return response.data.data?.topics || [];
  }
};