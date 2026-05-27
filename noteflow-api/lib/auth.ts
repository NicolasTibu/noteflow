import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be defined for the backend');
  }
  return secret;
};

export interface AuthPayload {
  userId: string;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};

export const signToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, getJwtSecret()) as AuthPayload;
};

export const unauthorizedResponse = () =>
  NextResponse.json({ error: 'No autorizado' }, { status: 401 });

export const requireAuth = (request: Request): AuthPayload | NextResponse => {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return unauthorizedResponse();
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    return unauthorizedResponse();
  }

  try {
    return verifyToken(token);
  } catch {
    return unauthorizedResponse();
  }
};
