import { create } from 'zustand';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../lib/auth';

interface AuthStore {
  user: any;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  initializeAuth: () => {
    (async () => {
      const user = await getCurrentUser();
      set({ user, isInitializing: false });
    })();
    return () => {};
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginUser(email, password);
      set({ user });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const user = await registerUser(email, password, name);
      set({ user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logoutUser();
      set({ user: null, isInitializing: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
