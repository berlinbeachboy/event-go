import { create } from 'zustand';
import { axiosInstance } from '../axios-instance';
import { User, Shift, SpotType } from '@/models/models';
// import { Factory } from 'lucide-react';

interface AdminState {
  // Users state and actions
  users: User[];
  spots: SpotType[];
  shifts: Shift[];
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

  // Shift management
  fetchShifts: () => Promise<void>;
  createShift: (shiftData: Partial<Shift>) => Promise<void>;
  updateShift: (shiftId: number, spotData: Partial<SpotType>) => Promise<void>;
  deleteShift: (shiftId: number) => Promise<void>;

  addUserToShift: (shiftId: number, userId: number) => Promise<boolean>;
  removeUserFromShift: (shiftId: number, userId: number) => Promise<boolean>;
}

export const useAdmin = create<AdminState>((set) => ({
  users: [],
  spots: [],
  shifts: [],
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

  // Mock API functions - replace these with your actual API calls
  fetchShifts: async () => {
    try {
      const { data } = await axiosInstance.get<Shift[]>('/admin/shifts/');
      console.error('Got shifts:', data);
      if (!data){
        set({ shifts: [], isLoading: false }) 
      } else {
        set({ shifts: data, isLoading: false })
      }
      
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.error('Error fetching shifts:', error);
      throw error;
    }
  },
  
  createShift: async (shiftData: Partial<Shift>) => {
    
    try {
      set({ isLoading: true, error: null });
      console.log(shiftData)
      const { data } = await axiosInstance.post<Shift>('/admin/shifts/', shiftData);
      set(state => ({
        shifts: [...state.shifts, data],
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
    
  },
  
  updateShift: async (shiftId: number, shiftData: Partial<Shift>) => {

    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.put<Shift>(`/admin/shifts/${shiftId}`, shiftData);
      set(state => ({
        shifts: state.shifts.map(shift => shift.id === shiftId ? data : shift),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  deleteShift: async (shiftId: number) => {

    try {
      set({ isLoading: true, error: null });
      await axiosInstance.delete(`/admin/shifts/${shiftId}`);
      set(state => ({
        users: state.users.filter(shift => shift.id !== shiftId),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }

  },
  
  addUserToShift: async (shiftId: number, userId: number): Promise<boolean> => {
    
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.post<Shift>(`/admin/shifts/${shiftId}/user/${userId}`);
      set(state => ({
        shifts: state.shifts.map(shift => shift.id === shiftId ? data : shift),
        isLoading: false
      }));
      return true
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.log(error)
      return false
    }
    
  },
  
  removeUserFromShift: async (shiftId: number, userId: number): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await axiosInstance.delete<Shift>(`/admin/shifts/${shiftId}/user/${userId}`);
      set(state => ({
        shifts: state.shifts.map(shift => shift.id === shiftId ? data : shift),
        isLoading: false
      }));
      return true
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      console.log(error)
      // throw error;
      return false
    }
  }
}));