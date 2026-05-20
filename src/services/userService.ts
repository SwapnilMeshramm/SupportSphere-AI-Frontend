import api from './api';
import { User, Notification } from '../types/user';

export const getUsers = async (params?: Record<string, any>): Promise<User[]> => {
  const response = await api.get('/users', { params });
  return response.data.data.users;
};

export const getUserById = async (id: string | number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data.data.user;
};

export const updateUser = async (
  id: string | number,
  data: { name?: string; email?: string; password?: string }
): Promise<User> => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data.data.user;
};

export const changeUserRole = async (id: string | number, role: string): Promise<User> => {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data.data.user;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getUserNotifications = async (id: string | number): Promise<Notification[]> => {
  const response = await api.get(`/users/${id}/notifications`);
  return response.data.data.notifications;
};

export const markNotificationRead = async (
  userId: string | number,
  notificationId: string | number
): Promise<Notification> => {
  const response = await api.patch(`/users/${userId}/notifications/${notificationId}/read`);
  return response.data.data.notification;
};
