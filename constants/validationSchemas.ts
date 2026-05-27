import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(1, 'El contenido no puede estar vacío'),
});

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'El texto del item no puede estar vacío'),
  isCompleted: z.boolean(),
});

export const checklistNoteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  items: z.array(checklistItemSchema).min(1, 'Debe tener al menos un item'),
});

export const ideaNoteSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  tags: z.array(z.string()),
  color: z.string(),
});

export type NoteFormData = z.infer<typeof noteSchema>;
export type ChecklistNoteFormData = z.infer<typeof checklistNoteSchema>;
export type IdeaNoteFormData = z.infer<typeof ideaNoteSchema>;
