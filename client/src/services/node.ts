import api from '../utils/api';
import { ApiResponse, Node } from '../types';

export const nodeService = {
  getNodes: async (): Promise<Node[]> => {
    const response = await api.get<ApiResponse<Node[]>>('/nodes');
    return response.data.data!;
  },

  getNode: async (id: string): Promise<Node> => {
    const response = await api.get<ApiResponse<Node>>(`/nodes/${id}`);
    return response.data.data!;
  },
};