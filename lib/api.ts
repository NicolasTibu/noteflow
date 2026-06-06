import { Platform } from 'react-native';
import { getAuthToken } from './auth';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');

const fetchApi = async <T>(
  path: string,
  init: RequestInit = {},
  requireAuth = false
): Promise<T> => {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(init.headers ?? {});

  if (requireAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No autorizado');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    // Intentar parsear un JSON de error para mostrar un mensaje legible
    try {
      const json = await response.json();
      if (json) {
        if (typeof json.error === 'string' && json.error.length > 0) {
          throw new Error(json.error);
        }
        if (typeof json.message === 'string' && json.message.length > 0) {
          throw new Error(json.message);
        }
        if (Array.isArray(json.errors) && json.errors.length > 0) {
          const combined = json.errors
            .map((it: any) => (it?.message ? it.message : JSON.stringify(it)))
            .join(' - ');
          throw new Error(combined);
        }
        // Fallback: stringify the JSON body
        throw new Error(JSON.stringify(json));
      }
    } catch (e) {
      // Si no vino JSON, leer texto plano
      const text = await response.text().catch(() => '');
      throw new Error(text || `Error ${response.status}: ${response.statusText}`);
    }
  }

  return response.json();
};

export type NoteType = 'note' | 'checklist' | 'idea';

export interface ApiNote {
  id: string;
  title: string;
  content: string | null;
  type: NoteType;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  type: NoteType;
  content?: string | null;
  color?: string | null;
}

export interface ChecklistItemPayload {
  text: string;
  is_completed?: boolean;
}

export interface ApiChecklistItem {
  id: string;
  note_id: string;
  text: string;
  is_completed: boolean;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export const getNotes = async (): Promise<ApiNote[]> =>
  fetchApi<ApiNote[]>(`/notes`, undefined, true);

export const createNote = async (data: CreateNoteInput): Promise<ApiNote> =>
  fetchApi<ApiNote>(`/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanPayload(data)),
  }, true);

export const getNote = async (id: string): Promise<ApiNote> =>
  fetchApi<ApiNote>(`/notes/${id}`, undefined, true);

export const updateNote = async (
  id: string,
  data: Partial<CreateNoteInput>
): Promise<ApiNote> =>
  fetchApi<ApiNote>(`/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanPayload(data)),
  }, true);

function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val === null || val === undefined) continue;
    out[key as keyof T] = val;
  }
  return out;
}

export const deleteNote = async (id: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${BASE_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const errorMessage = body ? body : 'Error al eliminar nota';
    throw new Error(errorMessage);
  }
};

export const getChecklistItems = async (
  noteId: string
): Promise<ApiChecklistItem[]> =>
  fetchApi<ApiChecklistItem[]>(`/notes/${noteId}/checklist-items`, undefined, true);

export const createChecklistItem = async (
  noteId: string,
  payload: ChecklistItemPayload
): Promise<ApiChecklistItem> =>
  fetchApi<ApiChecklistItem>(`/notes/${noteId}/checklist-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, true);

export const updateChecklistItem = async (
  itemId: string,
  payload: { is_completed: boolean }
): Promise<ApiChecklistItem> =>
  fetchApi<ApiChecklistItem>(`/checklist-items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, true);

export const deleteChecklistItem = async (itemId: string): Promise<void> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${BASE_URL}/checklist-items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al eliminar elemento de checklist');
  }
};

export const register = async (
  email: string,
  password: string
): Promise<AuthResponse> =>
  fetchApi<AuthResponse>(`/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> =>
  fetchApi<AuthResponse>(`/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
