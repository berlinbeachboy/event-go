
  // api/hooks/use-auth.ts
  import { create } from 'zustand';
  import { axiosInstance } from '../axios-instance';
  import { Shift, UserResponse, UserShort } from '@/models/models';
  
  interface LoginData {
    username: string;
    password: string;
  }
  
  interface RegisterData extends LoginData {
    fullName?: string;
    phone?: string;
    givesSoli?: boolean;
    takesSoli?: boolean;
  }
  interface ResetPasswordData {
    token: string;
    password: string;
    passwordConfirm: string;
  }
  
  interface AuthState {
    user: UserResponse | null;
    userShorts: UserShort[] | null;
    isLoading: boolean;
    shifts: Shift[] | null;
    error: Error | null;
    login: (data: LoginData) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (data: ResetPasswordData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    updateUser: (data: Partial<UserResponse>) => Promise<void>;
    fetchShifts: () => Promise<void>;
    addShiftMe: (shiftId: number) => Promise<boolean>;
    removeShiftMe: (shiftId: number) => Promise<boolean>;
  }
  
  export const useAuth = create<AuthState>((set) => ({
    user: null,
    userShorts: null,
    isLoading: false,
    error: null,
    shifts: null,
    
    login: async (data: LoginData) => {
      try {
        set({ isLoading: true, error: null });
        await axiosInstance.post<UserResponse>('/login', data);
        set({ isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },

    requestPasswordReset: async (email: string) => {
      try {
        set({ isLoading: true, error: null });
        const response = await axiosInstance.post<UserResponse>('/requestPasswordReset?username='+email, );
        set({ isLoading: false });
        if (response.status == 200) {
          // redirect to login
          // toast success
        }
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },

    resetPassword: async (data: ResetPasswordData) => {
      try {
        set({ isLoading: true, error: null });
        await axiosInstance.post<UserResponse>('/resetPassword', data);
        set({isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    register: async (data: RegisterData) => {
      try {
        set({ isLoading: true, error: null });
        await axiosInstance.post<UserResponse>('/register', data);
        set({ isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    logout: async () => {
      try {
        set({ isLoading: true, error: null });
        await axiosInstance.post('/user/logout');
        set({ user: null, isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    fetchUser: async () => {
      try {
        set({ isLoading: true, error: null });
        const response = await axiosInstance.get<UserResponse>('/user/me');
        set({ user: response.data, isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
  
    updateUser: async (data: Partial<UserResponse>) => {
      try {
        set({ isLoading: true, error: null });
        const res_user = await axiosInstance.put<UserResponse>('/user/me', data);
        set({ user: res_user.data, isLoading: false });
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        throw error;
      }
    },
    fetchUsers: async () => {
      try {
        const { data } = await axiosInstance.get<UserShort[]>('/user/users/');
        if (!data){
          set({ userShorts: [], isLoading: false }) 
        } else {
          set({ userShorts: data, isLoading: false })
        }
        
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        console.error('Error fetching shifts:', error);
        throw error;
      }
    },

    fetchShifts: async () => {
        try {
          const { data } = await axiosInstance.get<Shift[]>('/user/shifts/');
          // console.error('Got shifts:', data);
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

    addShiftMe: async (shiftId: number): Promise<boolean> => {
      try {
        set({ isLoading: true, error: null });
        const  { data } = await axiosInstance.post<Shift>('/user/shifts/'+shiftId+'/me');
        set(state => ({
          shifts: state.shifts?.map(shift => shift.id === shiftId ? data : shift),
          isLoading: false
        }));
        return true
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        console.log(error)
        return false
      }
    },

    removeShiftMe: async (shiftId: number): Promise<boolean> => {
      try {
        set({ isLoading: true, error: null });
        const  { data } = await axiosInstance.delete<Shift>('/user/shifts/'+shiftId+'/me');
        set(state => ({
          shifts: state.shifts?.map(shift => shift.id === shiftId ? data : shift),
          isLoading: false
        }));
        return true
      } catch (error) {
        set({ error: error as Error, isLoading: false });
        console.log(error)
        return false
      }
    },
  }));