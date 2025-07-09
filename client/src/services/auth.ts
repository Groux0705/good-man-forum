import api from '../utils/api';
import { ApiResponse, User, AuthUser } from '../types';

export const authService = {
  login: async (username: string, password: string): Promise<AuthUser> => {
    const response = await api.post<ApiResponse<AuthUser>>('/auth/login', {
      username,
      password,
    });
    return response.data.data!;
  },

  register: async (username: string, email: string, password: string): Promise<AuthUser> => {
    const response = await api.post<ApiResponse<AuthUser>>('/auth/register', {
      username,
      email,
      password,
    });
    return response.data.data!;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data!;
  },
};