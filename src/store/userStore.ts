import { create } from 'zustand';
import { User } from '../types/user';
import { getUsers } from '../services/userService';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (params?: Record<string, any>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,
  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const users = await getUsers(params);
      set({ users, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
