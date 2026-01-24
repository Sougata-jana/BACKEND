import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext({});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (unreadOnly = false) => {
    if (!isAuthenticated) {
      console.log('NotificationContext: User not authenticated, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      console.log('NotificationContext: Fetching notifications...', { unreadOnly });
      const params = unreadOnly ? { unreadOnly: true } : {};
      const response = await api.get('/notifications', { params });
      console.log('NotificationContext: Notifications fetched:', response.data.data);
      setNotifications(response.data.data.notifications);
    } catch (error) {
      console.error('NotificationContext: Error fetching notifications:', error);
      console.error('NotificationContext: Error response:', error.response?.data);
      // Only show error toast if it's not a 404 (no notifications)
      if (error.response?.status !== 404) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      console.log('NotificationContext: User not authenticated, skipping unread count fetch');
      return;
    }
    
    try {
      console.log('NotificationContext: Fetching unread count...');
      const response = await api.get('/notifications/unread-count');
      console.log('NotificationContext: Unread count:', response.data.data.unreadCount);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('NotificationContext: Error fetching unread count:', error);
      console.error('NotificationContext: Error response:', error.response?.data);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Update local state
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Poll for new notifications periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      // Poll every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
