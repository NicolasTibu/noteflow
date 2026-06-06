import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage } from '../lib/storage';
import { useUpdateProfile } from './useUpdateProfile';
import { useUserProfile } from './useUserProfile';

type ImageSource = 'camera' | 'library';

interface UseImagePickerResult {
  pickAndUploadImage: (source?: ImageSource) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useImagePicker(): UseImagePickerResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile } = useUpdateProfile();
  const { refetch } = useUserProfile();

  const pickAndUploadImage = async (source: ImageSource = 'library') => {
    try {
      setIsLoading(true);
      setError(null);

      let permissionResult;
      let pickerResult;

      if (source === 'camera') {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          setError('Necesitamos permisos para usar la cámara');
          return;
        }

        pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          setError('Necesitamos permisos para acceder a tu galería');
          return;
        }

        pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (pickerResult.canceled) {
        return;
      }

      const imageUri = pickerResult.assets[0].uri;

      // Subir nueva imagen
      const downloadUrl = await uploadProfileImage(imageUri);

      // Actualizar perfil en Firestore
      await updateProfile({ avatarUrl: downloadUrl });

      // Refrescar perfil
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickAndUploadImage,
    isLoading,
    error,
  };
}
