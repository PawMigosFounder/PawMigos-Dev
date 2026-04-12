import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      include: {
        services: true,
        availability: true,
        accommodationProfile: true,
        hostingRestrictions: true,
        verificationRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!provider) return notFound('Provider profile not found');
    return success(provider);
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
    if (!provider) return notFound('Provider profile not found');

    const allowedFields = [
      'name', 'businessName', 'city', 'phone', 'profilePhoto',
      'description', 'experience', 'categories', 'mediaGallery',
    ];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error('No valid fields to update', 400);
    }

    const updated = await prisma.provider.update({
      where: { id: provider.id },
      data: updateData,
    });

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
