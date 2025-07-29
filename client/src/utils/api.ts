import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 检查是否在管理员页面，避免不必要的重定向
      const currentPath = window.location.pathname;
      const isAdminPage = currentPath.startsWith('/admin');
      
      // 只有在非管理员页面或者是真实的认证失败时才重定向
      if (!isAdminPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        // 在管理员页面，只是记录错误但不重定向
        console.warn('API request failed with 401 in admin area, but not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

export default api;