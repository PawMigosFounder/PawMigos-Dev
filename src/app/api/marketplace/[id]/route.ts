import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, notFound, handleApiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const provider = await prisma.provider.findFirst({
      where: { id, isActive: true, verificationStatus: 'VERIFIED' },
      include: {
        services: { where: { isActive: true } },
        availability: { where: { isActive: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
        accommodationProfile: true,
        hostingRestrictions: true,
        reviews: {
          include: { user: { select: { name: true, profilePhoto: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!provider) return notFound('Provider not found');

    return success(provider);
  } catch (err) {
    return handleApiError(err);
  }
}
