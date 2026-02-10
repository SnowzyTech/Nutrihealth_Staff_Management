import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  position?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null 
      }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
