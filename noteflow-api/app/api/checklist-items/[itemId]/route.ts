import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';
import { z } from 'zod';

const checklistItemUpdateSchema = z.object({
  is_completed: z.boolean(),
});

export async function PATCH(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const result = checklistItemUpdateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const { itemId } = context.params;
  const { is_completed } = result.data;
  const [item] = await query(
    'UPDATE checklist_items SET is_completed = $1 FROM notes WHERE checklist_items.id = $2 AND checklist_items.note_id = notes.id AND notes.owner_id = $3 RETURNING checklist_items.*',
    [is_completed, itemId, auth.userId]
  );

  if (!item) {
    return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(request: Request, context: { params: any }) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const { itemId } = context.params;
    const [item] = await query(
      'DELETE FROM checklist_items USING notes WHERE checklist_items.id = $1 AND checklist_items.note_id = notes.id AND notes.owner_id = $2 RETURNING checklist_items.id',
      [itemId, auth.userId]
    );

    if (!item) {
      return NextResponse.json({ error: 'Elemento no encontrado' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
