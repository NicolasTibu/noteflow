import { create } from 'zustand';
import { login as loginApi, register as registerApi } from '../lib/api';
import { clearAuthToken, saveAuthToken } from '../lib/auth';

interface AuthStore {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginApi(email, password);
      await saveAuthToken(response.token);
      set({ token: response.token });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerApi(email, password);
      await saveAuthToken(response.token);
      set({ token: response.token });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al registrarse',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    await clearAuthToken();
    set({ token: null });
  },
}));
