import { create } from 'zustand';
import { Note, ChecklistNote, IdeaNote, AnyNote } from '../types';
import {
  ApiNote,
  CreateNoteInput,
  getNotes,
  createNote as createNoteApi,
} from '../lib/api';

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
  createNote: (data: CreateNoteInput) => Promise<AnyNote>;
  addNote: (note: Note) => void;
  addArchivedNote: (note: Note) => void;
  addChecklist: (checklist: ChecklistNote) => void;
  addIdea: (idea: IdeaNote) => void;
  deleteNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteIdea: (id: string) => void;
  deleteArchivedNote: (id: string) => void;
  deleteArchivedChecklist: (id: string) => void;
  deleteArchivedIdea: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  archiveChecklist: (id: string) => void;
  unarchiveChecklist: (id: string) => void;
  archiveIdea: (id: string) => void;
  unarchiveIdea: (id: string) => void;
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
      const apiNotes = await getNotes();
      const normalizedNotes = apiNotes.map(normalizeApiNote);
      set(splitNotes(normalizedNotes));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al cargar notas',
      });
    } finally {
      set({ isLoading: false });
    }
  },
  createNote: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const apiNote = await createNoteApi(data);
      const normalizedNote = normalizeApiNote(apiNote);

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
  deleteArchivedNote: (id) =>
    set((state) => ({
      archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
    })),
  deleteArchivedChecklist: (id) =>
    set((state) => ({
      archivedChecklists: state.archivedChecklists.filter((c) => c.id !== id),
    })),
  deleteArchivedIdea: (id) =>
    set((state) => ({
      archivedIdeas: state.archivedIdeas.filter((i) => i.id !== id),
    })),
  archiveNote: (id) =>
    set((state) => {
      const note = state.notes.find((n) => n.id === id);
      return {
        notes: state.notes.filter((n) => n.id !== id),
        archivedNotes: note ? [...state.archivedNotes, note] : state.archivedNotes,
      };
    }),
  unarchiveNote: (id) =>
    set((state) => {
      const note = state.archivedNotes.find((n) => n.id === id);
      return {
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
        notes: note ? [...state.notes, note] : state.notes,
      };
    }),
  archiveChecklist: (id) =>
    set((state) => {
      const checklist = state.checklists.find((c) => c.id === id);
      return {
        checklists: state.checklists.filter((c) => c.id !== id),
        archivedChecklists: checklist
          ? [...state.archivedChecklists, checklist]
          : state.archivedChecklists,
      };
    }),
  unarchiveChecklist: (id) =>
    set((state) => {
      const checklist = state.archivedChecklists.find((c) => c.id === id);
      return {
        archivedChecklists: state.archivedChecklists.filter((c) => c.id !== id),
        checklists: checklist
          ? [...state.checklists, checklist]
          : state.checklists,
      };
    }),
  archiveIdea: (id) =>
    set((state) => {
      const idea = state.ideas.find((i) => i.id === id);
      return {
        ideas: state.ideas.filter((i) => i.id !== id),
        archivedIdeas: idea ? [...state.archivedIdeas, idea] : state.archivedIdeas,
      };
    }),
  unarchiveIdea: (id) =>
    set((state) => {
      const idea = state.archivedIdeas.find((i) => i.id === id);
      return {
        archivedIdeas: state.archivedIdeas.filter((i) => i.id !== id),
        ideas: idea ? [...state.ideas, idea] : state.ideas,
      };
    }),
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

