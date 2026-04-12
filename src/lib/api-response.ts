import { NextResponse } from 'next/server';

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  );
}

export function unauthorized(message = 'Authentication required') {
  return error(message, 401);
}

export function forbidden(message = 'Access denied') {
  return error(message, 403);
}

export function notFound(message = 'Resource not found') {
  return error(message, 404);
}

export function handleApiError(err: unknown) {
  console.error('[API Error]', err);

  if (err instanceof Error) {
    if (err.message === 'UNAUTHORIZED') return unauthorized();
    if (err.message === 'FORBIDDEN') return forbidden();
    return error(err.message, 500);
  }

  return error('Internal server error', 500);
}
