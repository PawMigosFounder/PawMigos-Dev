import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import type { User } from '@/generated/prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'pawmigos-dev-secret';
const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('pawmigos_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireRole(role: string): Promise<User> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export function getTokenFromRequest(request: Request): TokenPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return verifyToken(authHeader.slice(7));
  }

  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/pawmigos_token=([^;]+)/);
    if (match) {
      return verifyToken(match[1]);
    }
  }

  return null;
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const payload = getTokenFromRequest(request);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
  });
}

export async function requireAuthFromRequest(request: Request): Promise<User> {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
