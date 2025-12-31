import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dashboard Stats
  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard/stats');
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get All Videos (Admin)
  const getAllVideos = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/videos', { params });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete Video
  const deleteVideo = useCallback(async (videoId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/admin/videos/${videoId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete video');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Video Analytics
  const getVideoAnalytics = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/analytics/videos', { params });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get All Channels
  const getAllChannels = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/channels', { params });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch channels');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle User Admin Status
  const toggleUserAdmin = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(`/admin/users/${userId}/toggle-admin`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle admin status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete User
  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/user/login', credentials);
      const { accessToken, refreshToken, user } = response.data.data;
      
      if (!user.isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post('/user/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, []);

  const value = {
    loading,
    error,
    getDashboardStats,
    getAllVideos,
    deleteVideo,
    getVideoAnalytics,
    getAllChannels,
    toggleUserAdmin,
    deleteUser,
    login,
    logout,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
