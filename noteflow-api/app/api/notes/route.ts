import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['note', 'checklist', 'idea']),
  content: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const notes = await query(
      'SELECT id, title, content, type, color, created_at, updated_at FROM public.notes WHERE owner_id = $1 ORDER BY created_at DESC',
      [auth.userId]
    );
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const result = noteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const { title, type, content, color } = result.data;
  const [note] = await query(
    'INSERT INTO public.notes (owner_id, title, type, content, color) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, content, type, color, created_at, updated_at',
    [auth.userId, title, type, content, color]
  );

  return NextResponse.json(note, { status: 201 });
}
