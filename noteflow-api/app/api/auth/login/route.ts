import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '../../../../lib/db';
import { signToken, verifyPassword } from '../../../../lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ errors: result.error.issues }, { status: 400 });
  }

  const { email, password } = result.data;
  const [user] = await query<{
    id: string;
    email: string;
    password_hash: string;
  }>(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email]
  );

  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return NextResponse.json({ user: { id: user.id, email: user.email }, token });
}
