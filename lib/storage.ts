import { Platform } from 'react-native';
import { getAuthToken, getCurrentUser } from './auth';

let firestore: any;

try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (e) {
  // Firebase no disponible, usar mocks
  const mocks = require('./firebase-mock');
  firestore = mocks.createFirestoreMock;
}

export interface UploadResult {
  publicUrl: string;
  s3Key: string;
}

/**
 * Obtiene una presigned URL del backend para subir a S3
 */
export async function getPresignedUrl(
  filename: string,
  contentType: string,
  folder: 'profiles' | 'notes' | 'attachments' = 'profiles'
): Promise<{ signedUrl: string; publicUrl: string; s3Key: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No hay usuario autenticado');
    }

    const defaultBackendUrl =
      Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    const expoApiUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
    const backendUrl = expoApiUrl
      ? Platform.OS === 'android' && expoApiUrl.startsWith('http://localhost')
        ? expoApiUrl.replace('http://localhost', 'http://10.0.2.2')
        : expoApiUrl
      : defaultBackendUrl;
    const response = await fetch(`${backendUrl}/api/upload/get-presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename,
        contentType,
        folder,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error || 'Error al obtener presigned URL');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Sube un archivo a S3 usando una presigned URL
 */
export async function uploadFileToS3(
  localUri: string,
  signedUrl: string,
  contentType: string
): Promise<void> {
  try {
    // Obtener el archivo como blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Subir a S3 usando PUT
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Error al subir a S3: ${uploadResponse.statusText}`);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Sube una imagen de perfil a S3 y retorna la URL pública
 */
export async function uploadProfileImage(uri: string): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No hay usuario autenticado');
  }

  try {
    const filename = `profile-${Date.now()}.jpg`;
    const { signedUrl, publicUrl } = await getPresignedUrl(
      filename,
      'image/jpeg',
      'profiles'
    );

    await uploadFileToS3(uri, signedUrl, 'image/jpeg');

    // Actualizar Firestore con la nueva URL pública si aún se usa Firestore en el proyecto.
    try {
      await firestore()
        .collection('users')
        .doc(user.id)
        .update({
          avatarUrl: publicUrl,
        });
    } catch {
      // Ignorar si la actualización de Firestore no está disponible.
    }

    return publicUrl;
  } catch (error) {
    throw error;
  }
}

export async function uploadNoteImage(uri: string): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No hay usuario autenticado');
  }

  try {
    const filename = `note-${Date.now()}.jpg`;
    const { signedUrl, publicUrl } = await getPresignedUrl(
      filename,
      'image/jpeg',
      'notes'
    );

    await uploadFileToS3(uri, signedUrl, 'image/jpeg');
    return publicUrl;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene la URL pública de una imagen de S3
 * (Útil si solo tienes el s3Key)
 */
export function getPublicUrl(s3Key: string, s3Bucket?: string, s3Region?: string): string {
  const bucket = s3Bucket || process.env.EXPO_PUBLIC_AWS_S3_BUCKET;
  const region = s3Region || process.env.EXPO_PUBLIC_AWS_S3_REGION || 'us-east-1';

  if (!bucket) {
    throw new Error('Falta configurar AWS_S3_BUCKET');
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}
