import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { updatePetSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;

    const pet = await prisma.pet.findFirst({
      where: { id, userId: user.id },
      include: { careProfile: true },
    });

    if (!pet) return notFound('Pet not found');
    return success(pet);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePetSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const pet = await prisma.pet.findFirst({
      where: { id, userId: user.id },
    });
    if (!pet) return notFound('Pet not found');

    const updated = await prisma.pet.update({
      where: { id },
      data: parsed.data,
    });

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;
    const body = await request.json();

    const pet = await prisma.pet.findFirst({
      where: { id, userId: user.id },
    });
    if (!pet) return notFound('Pet not found');

    // Check for active bookings before archiving
    if (body.isActive === false) {
      const activeBookings = await prisma.booking.count({
        where: {
          petId: id,
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
      });
      if (activeBookings > 0) {
        return error(
          'Cannot archive this pet. There are active or upcoming bookings linked to it.',
          409
        );
      }
    }

    const updated = await prisma.pet.update({
      where: { id },
      data: { isActive: body.isActive ?? pet.isActive },
    });

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
