import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'noteflow_auth_token';
const AUTH_USER_KEY = 'noteflow_auth_user';

const defaultApiUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
const expoApiUrl = process.env.EXPO_PUBLIC_API_URL as string | undefined;
const BASE_URL = expoApiUrl
  ? Platform.OS === 'android' && expoApiUrl.startsWith('http://localhost')
    ? expoApiUrl.replace('http://localhost', 'http://10.0.2.2')
    : expoApiUrl
  : defaultApiUrl;

export interface AuthUser {
  id: string;
  email: string;
}

let authToken: string | null = null;
let authUser: AuthUser | null = null;

async function saveAuthData(token: string, user: AuthUser): Promise<void> {
  authToken = token;
  authUser = user;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

async function clearAuthData(): Promise<void> {
  authToken = null;
  authUser = null;
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(AUTH_USER_KEY);
}

export async function initializeAuth(): Promise<AuthUser | null> {
  if (authUser) {
    return authUser;
  }

  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);

  if (!token || !storedUser) {
    await clearAuthData();
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser) as AuthUser;
    authToken = token;
    authUser = parsedUser;
    return parsedUser;
  } catch {
    await clearAuthData();
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (authUser) {
    return authUser;
  }
  return initializeAuth();
}

export async function getAuthToken(): Promise<string | null> {
  if (authToken) {
    return authToken;
  }

  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  authToken = token;
  return token;
}

async function parseJsonResponse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorMessage(data: any, defaultMessage: string): string {
  if (!data) {
    return defaultMessage;
  }

  if (typeof data.error === 'string' && data.error.length > 0) {
    return data.error;
  }

  if (Array.isArray(data.errors)) {
    return data.errors
      .map((item: any) => {
        if (typeof item.message === 'string') return item.message;
        if (typeof item === 'string') return item;
        return null;
      })
      .filter(Boolean)
      .join(' - ') || defaultMessage;
  }

  if (typeof data.message === 'string' && data.message.length > 0) {
    return data.message;
  }

  return defaultMessage;
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthUser> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    const message = getApiErrorMessage(data, 'Error al registrarse');
    throw new Error(message);
  }

  if (!data?.token || !data?.user) {
    throw new Error('Respuesta inválida del servidor');
  }

  const user = data.user as AuthUser;
  await saveAuthData(data.token, user);
  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    const message = getApiErrorMessage(data, 'Error al iniciar sesión');
    throw new Error(message);
  }

  if (!data?.token || !data?.user) {
    throw new Error('Respuesta inválida del servidor');
  }

  const user = data.user as AuthUser;
  await saveAuthData(data.token, user);
  return user;
}

export async function logoutUser(): Promise<void> {
  await clearAuthData();
}
