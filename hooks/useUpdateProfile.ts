let firestore: any;

try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (e) {
  // Firebase no disponible, usar mocks
  const mocks = require('../lib/firebase-mock');
  firestore = mocks.createFirestoreMock;
}

import { useAuthStore } from '../store/authStore';

interface UpdateProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}

export function useUpdateProfile() {
  const user = useAuthStore((state) => state.user);

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    try {
      const firestoreInstance = typeof firestore === 'function' ? firestore() : firestore;
      await firestoreInstance.collection('users').doc(user.uid).update(data);
    } catch (error) {
      throw error;
    }
  };

  return { updateProfile, isAuthenticated: !!user };
}
