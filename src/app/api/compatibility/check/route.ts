// Public compatibility check endpoint — used by UI for preview before booking

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { evaluateCompatibility } from '@/lib/services/compatibility';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const { petId, providerId } = body;

    if (!petId || !providerId) {
      return error('petId and providerId are required', 400);
    }

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: user.id, isActive: true },
      include: { careProfile: true },
    });
    if (!pet) return notFound('Pet not found');

    const provider = await prisma.provider.findFirst({
      where: { id: providerId, isActive: true },
      include: { hostingRestrictions: true, accommodationProfile: true },
    });
    if (!provider) return notFound('Provider not found');

    if (!provider.hostingRestrictions) {
      return success({
        outcome: 'COMPATIBLE',
        reasons: [],
        summary: 'Provider has not set hosting restrictions. Default compatibility applies.',
      });
    }

    const result = evaluateCompatibility(
      pet,
      provider.hostingRestrictions,
      provider.accommodationProfile
    );

    return success(result);
  } catch (err) {
    return handleApiError(err);
  }
}
