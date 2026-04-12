import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { accommodationProfileSchema, hostingRestrictionsSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      include: { accommodationProfile: true, hostingRestrictions: true },
    });
    if (!provider) return notFound('Provider not found');

    return success({
      accommodationProfile: provider.accommodationProfile,
      hostingRestrictions: provider.hostingRestrictions,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();

    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    // Parse and save accommodation profile
    if (body.accommodation) {
      const accParsed = accommodationProfileSchema.safeParse(body.accommodation);
      if (!accParsed.success) {
        return error('Accommodation validation failed', 400, accParsed.error.flatten().fieldErrors);
      }
      await prisma.accommodationProfile.upsert({
        where: { providerId: provider.id },
        create: { providerId: provider.id, ...accParsed.data },
        update: accParsed.data,
      });
    }

    // Parse and save hosting restrictions
    if (body.restrictions) {
      const resParsed = hostingRestrictionsSchema.safeParse(body.restrictions);
      if (!resParsed.success) {
        return error('Restrictions validation failed', 400, resParsed.error.flatten().fieldErrors);
      }
      await prisma.hostingRestrictions.upsert({
        where: { providerId: provider.id },
        create: { providerId: provider.id, ...resParsed.data },
        update: resParsed.data,
      });
    }

    // Mark hosting profile completed
    await prisma.provider.update({
      where: { id: provider.id },
      data: { hostingProfileCompleted: true },
    });

    const updated = await prisma.provider.findUnique({
      where: { id: provider.id },
      include: { accommodationProfile: true, hostingRestrictions: true },
    });

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
