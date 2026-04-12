import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { availabilitySchema } from '@/lib/validators';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    const availability = await prisma.availability.findMany({
      where: { providerId: provider.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return success(availability);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();

    // Support both single slot and batch creation
    const slots = Array.isArray(body) ? body : [body];
    const batchSchema = z.array(availabilitySchema);
    const parsed = batchSchema.safeParse(slots);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten());
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    // Validate time ordering
    for (const slot of parsed.data) {
      if (slot.startTime >= slot.endTime) {
        return error(`Start time must be before end time for day ${slot.dayOfWeek}`, 400);
      }
    }

    const created = await prisma.availability.createMany({
      data: parsed.data.map((slot) => ({
        providerId: provider.id,
        ...slot,
      })),
    });

    return success({ count: created.count }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('id');

    if (slotId) {
      await prisma.availability.deleteMany({
        where: { id: slotId, providerId: provider.id },
      });
    } else {
      // Delete all availability (for reset)
      await prisma.availability.deleteMany({
        where: { providerId: provider.id },
      });
    }

    return success({ message: 'Availability deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
