import { create } from 'zustand';
import { axiosInstance } from '../axios-instance';
import { User, SpotType } from '@/models/models';

interface AdminState {
  // Users state and actions
  users: User[];
  spots: SpotType[];
  isLoading: boolean;
  error: Error | null;

  // User management
  fetchUsers: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userId: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;

  // Spot management
  fetchSpots: () => Promise<void>;
  createSpot: (spotData: Partial<SpotType>) => Promise<void>;
  updateSpot: (spotId: number, spotData: Partial<SpotType>) => Promise<void>;
  deleteSpot: (spotId: number) => Promise<void>;

  // Batch operations
  bulkUpdateSpots: (spots: Partial<SpotType>[]) => Promise<void>;
  bulkDeleteSpots: (spotIds: number[]) => Promise<void>;

  // Additional admin actions
  toggleSpotStatus: (spotId: number) => Promise<void>;
  assignUserToSpot: (userId: number, spotId: number) => Promise<void>;
  removeUserFromSpot: (userId: number, spotId: number) => Promise<void>;
}

export const useAdmin = create<AdminState>((set) => ({
  users: [],
  spots: [],
  isLoading: false,
  error: null,

  // User management
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

  // Spot management
  fetchSpots: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.get<SpotType[]>('/admin/spots/');
      set({ spots: data, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  createSpot: async (spotData: Partial<SpotType>) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.post<SpotType>('/admin/spots/', spotData);
      set(state => ({
        spots: [...state.spots, data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateSpot: async (spotId: number, spotData: Partial<SpotType>) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.put<SpotType>(`/admin/spots/${spotId}`, spotData);
      set(state => ({
        spots: state.spots.map(spot => spot.id === spotId ? data : spot),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  deleteSpot: async (spotId: number) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.delete(`/admin/spots/${spotId}`);
      set(state => ({
        spots: state.spots.filter(spot => spot.id !== spotId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Batch operations
  bulkUpdateSpots: async (spots: Partial<SpotType>[]) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.put<SpotType[]>('/admin/spots/bulk', { spots });
      set(state => ({
        spots: state.spots.map(spot => {
          const updatedSpot = data.find(s => s.id === spot.id);
          return updatedSpot || spot;
        }),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  bulkDeleteSpots: async (spotIds: number[]) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.delete('/admin/spots/bulk', { data: { spotIds } });
      set(state => ({
        spots: state.spots.filter(spot => !spotIds.includes(spot.id)),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Additional admin actions
  toggleSpotStatus: async (spotId: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.patch<SpotType>(`/admin/spots/${spotId}/toggle`);
      set(state => ({
        spots: state.spots.map(spot => spot.id === spotId ? data : spot),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  assignUserToSpot: async (userId: number, spotId: number) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.post(`/admin/spots/${spotId}/users/${userId}`);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  removeUserFromSpot: async (userId: number, spotId: number) => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.delete(`/admin/spots/${spotId}/users/${userId}`);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
}));