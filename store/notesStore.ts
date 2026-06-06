import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Note, ChecklistNote, IdeaNote, AnyNote } from '../types';
import {
  ApiNote,
  CreateNoteInput,
  getNotes,
  createNote as createNoteApi,
  deleteNote as deleteNoteApi,
} from '../lib/api';

const ARCHIVED_IDS_KEY = 'noteflow_archived_note_ids';

const getArchivedIds = async (): Promise<Set<string>> => {
  const raw = await AsyncStorage.getItem(ARCHIVED_IDS_KEY);
  if (!raw) return new Set();
  try {
    const ids = JSON.parse(raw) as string[];
    return new Set(ids);
  } catch {
    return new Set();
  }
};

const saveArchivedIds = async (ids: Set<string>): Promise<void> => {
  await AsyncStorage.setItem(ARCHIVED_IDS_KEY, JSON.stringify([...ids]));
};

interface NotesStore {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  archivedNotes: Note[];
  archivedChecklists: ChecklistNote[];
  archivedIdeas: IdeaNote[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  createNote: (data: CreateNoteInput, archiveOnSave?: boolean) => Promise<AnyNote>;
  addNote: (note: Note) => void;
  addArchivedNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  deleteNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteIdea: (id: string) => void;
  deleteArchivedNote: (id: string) => Promise<void>;
  deleteArchivedChecklist: (id: string) => Promise<void>;
  deleteArchivedIdea: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  unarchiveNote: (id: string) => Promise<void>;
  archiveChecklist: (id: string) => Promise<void>;
  unarchiveChecklist: (id: string) => Promise<void>;
  archiveIdea: (id: string) => Promise<void>;
  unarchiveIdea: (id: string) => Promise<void>;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
}

const normalizeApiNote = (note: ApiNote): AnyNote => {
  const base = {
    id: note.id,
    title: note.title,
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
  };

  if (note.type === 'checklist') {
    return {
      ...base,
      items: [],
    };
  }

  if (note.type === 'idea') {
    return {
      ...base,
      tags: [],
      color: note.color ?? '#FFFFFF',
    };
  }

  return {
    ...base,
    content: note.content ?? '',
  };
};

const splitNotes = (notes: AnyNote[]) => ({
  notes: notes.filter((note) => !('items' in note) && !('tags' in note)) as Note[],
  checklists: notes.filter((note) => 'items' in note) as ChecklistNote[],
  ideas: notes.filter((note) => 'tags' in note) as IdeaNote[],
});

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  checklists: [],
  ideas: [],
  archivedNotes: [],
  archivedChecklists: [],
  archivedIdeas: [],
  isLoading: false,
  error: null,
  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const archivedIds = await getArchivedIds();
      const apiNotes = await getNotes();
      const normalizedNotes = apiNotes.map(normalizeApiNote);
      const activeNotes = normalizedNotes.filter((note) => !archivedIds.has(note.id));
      const archivedNotes = normalizedNotes.filter((note) => archivedIds.has(note.id));

      const splitActive = splitNotes(activeNotes);
      const splitArchived = splitNotes(archivedNotes);

      set({
        ...splitActive,
        archivedNotes: splitArchived.notes,
        archivedChecklists: splitArchived.checklists,
        archivedIdeas: splitArchived.ideas,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar notas',
      });
    } finally {
      set({ isLoading: false });
    }
  },
  createNote: async (data, archiveOnSave = false) => {
    set({ isLoading: true, error: null });
    try {
      const apiNote = await createNoteApi(data);
      const normalizedNote = normalizeApiNote(apiNote);

      if (archiveOnSave) {
        const archivedIds = await getArchivedIds();
        archivedIds.add(normalizedNote.id);
        await saveArchivedIds(archivedIds);
      }

      set((state) => {
        if (apiNote.type === 'checklist') {
          return {
            checklists: [...state.checklists, normalizedNote as ChecklistNote],
          };
        }

        if (apiNote.type === 'idea') {
          return {
            ideas: [...state.ideas, normalizedNote as IdeaNote],
          };
        }

        if (archiveOnSave) {
          return {
            archivedNotes: [...state.archivedNotes, normalizedNote as Note],
          };
        }

        return {
          notes: [...state.notes, normalizedNote as Note],
        };
      });

      return normalizedNote;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear nota';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  addArchivedNote: (note) =>
    set((state) => ({ archivedNotes: [...state.archivedNotes, note] })),
  addChecklist: (checklist) =>
    set((state) => ({ checklists: [...state.checklists, checklist] })),
  addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
  deleteNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  deleteChecklist: (id) =>
    set((state) => ({
      checklists: state.checklists.filter((c) => c.id !== id),
    })),
  deleteIdea: (id) =>
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
  deleteArchivedNote: async (id) => {
    try {
      await deleteNoteApi(id);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'Nota no encontrada') {
        set({ error: 'Error al eliminar nota archivada' });
        return;
      }
    }
    const archivedIds = await getArchivedIds();
    archivedIds.delete(id);
    await saveArchivedIds(archivedIds);
    set((state) => ({
      archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
    }));
  },
  deleteArchivedChecklist: async (id) => {
    try {
      await deleteNoteApi(id);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'Nota no encontrada') {
        set({ error: 'Error al eliminar checklist archivada' });
        return;
      }
    }
    const archivedIds = await getArchivedIds();
    archivedIds.delete(id);
    await saveArchivedIds(archivedIds);
    set((state) => ({
      archivedChecklists: state.archivedChecklists.filter((c) => c.id !== id),
    }));
  },
  deleteArchivedIdea: async (id) => {
    try {
      await deleteNoteApi(id);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== 'Nota no encontrada') {
        set({ error: 'Error al eliminar idea archivada' });
        return;
      }
    }
    const archivedIds = await getArchivedIds();
    archivedIds.delete(id);
    await saveArchivedIds(archivedIds);
    set((state) => ({
      archivedIdeas: state.archivedIdeas.filter((i) => i.id !== id),
    }));
  },
  archiveNote: async (id) => {
    set((state) => {
      const note = state.notes.find((n) => n.id === id);
      return {
        notes: state.notes.filter((n) => n.id !== id),
        archivedNotes: note ? [...state.archivedNotes, note] : state.archivedNotes,
      };
    });
    const archivedIds = await getArchivedIds();
    archivedIds.add(id);
    await saveArchivedIds(archivedIds);
  },
  unarchiveNote: async (id) => {
    set((state) => {
      const note = state.archivedNotes.find((n) => n.id === id);
      return {
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
        notes: note ? [...state.notes, note] : state.notes,
      };
    });
    const archivedIds = await getArchivedIds();
    archivedIds.delete(id);
    await saveArchivedIds(archivedIds);
  },
  archiveChecklist: async (id) => {
    set((state) => {
      const checklist = state.checklists.find((c) => c.id === id);
      return {
        checklists: state.checklists.filter((c) => c.id !== id),
        archivedChecklists: checklist
          ? [...state.archivedChecklists, checklist]
          : state.archivedChecklists,
      };
    });
    const archivedIds = await getArchivedIds();
    archivedIds.add(id);
    await saveArchivedIds(archivedIds);
  },
  unarchiveChecklist: async (id) => {
    set((state) => {
      const checklist = state.archivedChecklists.find((c) => c.id === id);
      return {
        archivedChecklists: state.archivedChecklists.filter((c) => c.id !== id),
        checklists: checklist
          ? [...state.checklists, checklist]
          : state.checklists,
      };
    });
    const archivedIds = await getArchivedIds();
    archivedIds.delete(id);
    await saveArchivedIds(archivedIds);
  },
  archiveIdea: async (id) => {
    set((state) => {
      const idea = state.ideas.find((i) => i.id === id);
      return {
        ideas: state.ideas.filter((i) => i.id !== id),
        archivedIdeas: idea ? [...state.archivedIdeas, idea] : state.archivedIdeas,
      };
    });
    const archivedIds = await getArchivedIds();
    archivedIds.add(id);
    await saveArchivedIds(archivedIds);
  },
  unarchiveIdea: async (id) => {
    set((state) => {
      const idea = state.archivedIdeas.find((i) => i.id === id);
      return {
        archivedIdeas: state.archivedIdeas.filter((i) => i.id !== id),
        ideas: idea ? [...state.ideas, idea] : state.ideas,
      };
    });
    const archivedIds = await getArchivedIds();
    archivedIds.delete(id);
    await saveArchivedIds(archivedIds);
  },
  toggleChecklistItem: (checklistId, itemId) =>
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id !== checklistId
          ? c
          : {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId
                  ? { ...i, isCompleted: !i.isCompleted }
                  : i
              ),
            }
      ),
    })),
}));

