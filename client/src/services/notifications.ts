import api from '../utils/api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  read: boolean;
  data?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

class NotificationService {
  async getNotifications(page = 1, limit = 10) {
    console.log('🔔 Fetching notifications:', { page, limit });
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      console.log('🔔 Full axios response:', response);
      console.log('🔔 Response.data:', response.data);
      console.log('🔔 Response.data.data:', response.data.data);
      return response.data.data; // 返回嵌套的data对象，与项目其他API保持一致
    } catch (error) {
      console.error('🔔 Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    console.log('🔔 Fetching unread count');
    try {
      const response = await api.get('/notifications/unread-count');
      console.log('🔔 Unread count response:', response.data);
      return response.data.data.count;
    } catch (error) {
      console.error('🔔 Error fetching unread count:', error);
      throw error;
    }
  }

  async markAsRead(id: string) {
    console.log('🔔 Marking notification as read:', id);
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data;
  }

  async markAllAsRead() {
    console.log('🔔 Marking all notifications as read');
    const response = await api.put('/notifications/mark-all-read');
    return response.data.data;
  }

  async deleteNotification(id: string) {
    console.log('🔔 Deleting notification:', id);
    const response = await api.delete(`/notifications/${id}`);
    return response.data.data;
  }
}

export const notificationService = new NotificationService();