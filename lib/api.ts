import { getAuthToken } from './auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

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
    const body = await response.text().catch(() => '');
    throw new Error(body || 'Error al comunicarse con la API');
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
    body: JSON.stringify(data),
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
    body: JSON.stringify(data),
  }, true);

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
    throw new Error('Error al eliminar nota');
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
