import api from './api';
import { AuthResponse } from '../types/auth';

export const login = async (email: string, password: string):Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const register = async (name: string, email: string, password: string):Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data.data;
};

export const logout = async ():Promise<void> => {
  await api.post('/auth/logout');
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.data;
};
