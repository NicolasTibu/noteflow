import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { hashPassword, signToken } from '../../../../lib/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const { email, password } = result.data;
  const existingUsers = await query('SELECT id FROM users WHERE email = $1', [email]);

  if (existingUsers.length) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await query<{
    id: string;
    email: string;
  }>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash]
  );

  const token = signToken({ userId: user.id, email: user.email });
  return NextResponse.json({ user, token }, { status: 201 });
}
