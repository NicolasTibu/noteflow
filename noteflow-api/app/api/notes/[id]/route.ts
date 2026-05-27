import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';
import { z } from 'zod';

const noteUpdateSchema = z
  .object({
    title: z.string().min(3).optional(),
    type: z.enum(['note', 'checklist', 'idea']).optional(),
    content: z.string().optional(),
    color: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Se debe proporcionar al menos un campo para actualizar',
  });

export async function GET(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { id } = context.params;
    const notes = await query(
      'SELECT id, title, content, type, color, created_at, updated_at FROM notes WHERE id = $1 AND owner_id = $2',
      [id, auth.userId]
    );

    if (!notes.length) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(notes[0]);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const result = noteUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const data = result.data;
  const entries = Object.entries(data);
  if (!entries.length) {
    return NextResponse.json(
      { error: 'No se proporcionaron campos para actualizar' },
      { status: 400 }
    );
  }

  const setClause = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  const { id } = context.params;
  values.push(id, auth.userId);

  try {
    const [note] = await query(
      `UPDATE notes SET ${setClause}, updated_at = NOW() WHERE id = $${values.length - 1} AND owner_id = $${values.length} RETURNING id, title, content, type, color, created_at, updated_at`,
      values
    );

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { id } = context.params;
    const [note] = await query(
      'DELETE FROM notes WHERE id = $1 AND owner_id = $2 RETURNING id',
      [id, auth.userId]
    );

    if (!note) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
