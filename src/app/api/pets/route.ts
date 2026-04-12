import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { createPetSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const pets = await prisma.pet.findMany({
      where: { userId: user.id, isActive: true },
      include: { careProfile: true },
      orderBy: { createdAt: 'asc' },
    });
    return success(pets);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = createPetSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const pet = await prisma.pet.create({
      data: {
        userId: user.id,
        ...parsed.data,
      },
    });

    return success(pet, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
