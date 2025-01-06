import { create } from 'zustand';
  import { axiosInstance } from '../axios-instance';
  import { SpotType } from '@/models/models';
  
  interface SpotState {
    spots: SpotType[];
    isLoading: boolean;
    error: Error | null;
    fetchSpots: () => Promise<void>;
    updateSpot: (id: number, data: Partial<SpotType>) => Promise<void>;
    createSpot: (data: Omit<SpotType, 'id' | 'createdAt' | 'updatedAt' | 'currentCount'>) => Promise<void>;
    deleteSpot: (id: number) => Promise<void>;
  }
  
  export const useSpots = create<SpotState>((set, get) => ({
    spots: [],
    isLoading: false,
    error: null,
  
    fetchSpots: async () => {
      try {
        const response = await axiosInstance.get('/user/spots/');
        set({ spots: response.data, isLoading: false });
      } catch (error) {
        console.error('Error fetching spots:', error);
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    updateSpot: async (id: number, data: Partial<SpotType>) => {
      try {
        set({ isLoading: true, error: null });
        const response = await axiosInstance.patch<SpotType>(`/user/spots/${id}`, data);
        const spots = get().spots.map(spot => 
          spot.id === id ? response.data : spot
        );
        set({ spots, isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    createSpot: async (data) => {
      try {
        set({ isLoading: true, error: null });
        const response = await axiosInstance.post<SpotType>('/user/spots', data);
        set(state => ({ 
          spots: [...state.spots, response.data], 
          isLoading: false 
        }));
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    deleteSpot: async (id: number) => {
      try {
        set({ isLoading: true, error: null });
        await axiosInstance.delete(`/user/spots/${id}`);
        set(state => ({ 
          spots: state.spots.filter(spot => spot.id !== id), 
          isLoading: false 
        }));
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    }
  }));