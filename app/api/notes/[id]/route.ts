import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { z } from 'zod';

const noteUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(['note', 'checklist', 'idea']).optional(),
  content: z.string().optional(),
  color: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Se debe proporcionar al menos un campo para actualizar',
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notes = await query('SELECT * FROM notes WHERE id = $1', [params.id]);
    if (!notes.length) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
    }
    return NextResponse.json(notes[0]);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const result = noteUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.errors }, { status: 400 });
  }

  const data = result.data;
  const entries = Object.entries(data);
  if (!entries.length) {
    return NextResponse.json(
      { error: 'No se proporcionaron campos para actualizar' },
      { status: 400 }
    );
  }

  const setClause = entries
    .map(([key], index) => `${key} = $${index + 1}`)
    .join(', ');
  const values = entries.map(([, value]) => value);
  values.push(params.id);

  try {
    const [note] = await query(
      `UPDATE notes SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await query('DELETE FROM notes WHERE id = $1', [params.id]);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
