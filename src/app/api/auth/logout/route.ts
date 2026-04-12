import { NextRequest } from 'next/server';
import { success } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const response = success({ message: 'Logged out successfully' });
  response.cookies.set('pawmigos_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
