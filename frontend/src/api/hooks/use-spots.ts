import { create } from 'zustand';
  import { axiosInstance } from '../axios-instance';
  import { SpotType } from '@/models/models';
  
  interface SpotState {
    userSpots: SpotType[];
    isLoading: boolean;
    error: Error | null;
    fetchUserSpots: () => Promise<void>;
  }
  
  export const useSpots = create<SpotState>((set) => ({
    userSpots: [],
    isLoading: false,
    error: null,
  
    fetchUserSpots: async () => {
      try {
        const response = await axiosInstance.get('/user/spots/');
        set({ userSpots: response.data, isLoading: false });
      } catch (error) {
        console.error('Error fetching spots:', error);
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },

  }));