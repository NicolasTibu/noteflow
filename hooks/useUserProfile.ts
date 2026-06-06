import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getUserProfile, UserProfile } from '../lib/auth';

interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.uid]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
