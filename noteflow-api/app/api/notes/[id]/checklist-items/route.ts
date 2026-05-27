import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { requireAuth } from '../../../../../lib/auth';
import { z } from 'zod';

const checklistItemSchema = z.object({
  text: z.string().min(1),
  is_completed: z.boolean().optional(),
});

export async function GET(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { id } = context.params;
    const noteExists = await query(
      'SELECT 1 FROM notes WHERE id = $1 AND owner_id = $2',
      [id, auth.userId]
    );

    if (!noteExists.length) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    const items = await query(
      'SELECT * FROM checklist_items WHERE note_id = $1 ORDER BY id',
      [id]
    );
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const result = checklistItemSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const { id } = context.params;
  const noteExists = await query(
    'SELECT 1 FROM notes WHERE id = $1 AND owner_id = $2',
    [id, auth.userId]
  );

  if (!noteExists.length) {
    return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
  }

  const { text, is_completed = false } = result.data;
  const [item] = await query(
    'INSERT INTO checklist_items (note_id, text, is_completed) VALUES ($1, $2, $3) RETURNING *',
    [id, text, is_completed]
  );

  return NextResponse.json(item, { status: 201 });
}
