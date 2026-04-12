import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { petCareProfileSchema } from '@/lib/validators';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = petCareProfileSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const pet = await prisma.pet.findFirst({
      where: { id, userId: user.id },
    });
    if (!pet) return notFound('Pet not found');

    // Transform date string to Date object if present
    const data = {
      ...parsed.data,
      lastVaccinationDate: parsed.data.lastVaccinationDate
        ? new Date(parsed.data.lastVaccinationDate)
        : null,
    };

    const careProfile = await prisma.petCareProfile.upsert({
      where: { petId: id },
      create: { petId: id, ...data },
      update: data,
    });

    // Mark care profile as completed
    await prisma.pet.update({
      where: { id },
      data: { careProfileCompleted: true },
    });

    return success(careProfile);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;

    const pet = await prisma.pet.findFirst({
      where: { id, userId: user.id },
    });
    if (!pet) return notFound('Pet not found');

    const careProfile = await prisma.petCareProfile.findUnique({
      where: { petId: id },
    });

    return success(careProfile);
  } catch (err) {
    return handleApiError(err);
  }
}
