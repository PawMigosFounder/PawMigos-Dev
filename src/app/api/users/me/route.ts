import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pets: {
          where: { isActive: true },
          include: { careProfile: true },
          orderBy: { createdAt: 'asc' },
        },
        provider: true,
      },
    });
    return success(fullUser);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();

    const allowedFields = ['name', 'city', 'profilePhoto'];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error('No valid fields to update', 400);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
