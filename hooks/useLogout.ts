import { useAuthStore } from '../store/authStore';

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);

  return { logout, isLoading };
}
