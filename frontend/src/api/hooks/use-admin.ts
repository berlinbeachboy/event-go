// hooks/use-admin.ts
import { create } from 'zustand';
import { axiosInstance } from '../axios-instance';
import { User } from '@/models/models';

interface AdminState {
  users: User[];
  isLoading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userId: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
}

export const useAdmin = create<AdminState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.get<User[]>('/admin/users/');
      set({ users: data, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  createUser: async (userData: Partial<User>) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.post<User>('/admin/users/', userData);
      set(state => ({
        users: [...state.users, data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateUser: async (userId: number, userData: Partial<User>) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.put<User>(`/admin/users/${userId}`, userData);
      set(state => ({
        users: state.users.map(user => user.id === userId ? data : user),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (userId: number) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.delete(`/admin/users/${userId}`);
      set(state => ({
        users: state.users.filter(user => user.id !== userId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
}));