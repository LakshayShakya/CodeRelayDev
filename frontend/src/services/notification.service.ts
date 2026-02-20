import api from './api';

export interface Notification {
  _id: string;
  userId: string;
  pullRequestId: {
    _id: string;
    title: string;
    projectId: string;
  };
  type: 'approved' | 'rejected' | 'created' | 'assigned';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  // Get all notifications for the authenticated user
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};
