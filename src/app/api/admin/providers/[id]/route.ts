import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError, forbidden } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    if (user.role !== 'ADMIN') return forbidden();
    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: { select: { phone: true, name: true, city: true } },
        services: true,
        availability: true,
        accommodationProfile: true,
        hostingRestrictions: true,
        verificationRecords: { orderBy: { createdAt: 'desc' } },
        bookings: { take: 20, orderBy: { createdAt: 'desc' } },
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!provider) return notFound('Provider not found');

    return success(provider);
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
    if (user.role !== 'ADMIN') return forbidden();
    const { id } = await params;
    const body = await request.json();

    const provider = await prisma.provider.findUnique({ where: { id } });
    if (!provider) return notFound('Provider not found');

    const updateData: Record<string, unknown> = {};
    let actionType: string | null = null;

    if (body.action === 'activate') {
      if (provider.verificationStatus !== 'VERIFIED') {
        return error('Cannot activate unverified provider', 400);
      }
      updateData.isActive = true;
      updateData.onboardingState = 'ACTIVE';
      actionType = 'PROVIDER_ACTIVATED';
    } else if (body.action === 'suspend') {
      updateData.isActive = false;
      updateData.onboardingState = 'SUSPENDED';
      actionType = 'PROVIDER_SUSPENDED';
    } else if (body.action === 'deactivate') {
      updateData.isActive = false;
      actionType = 'PROVIDER_DEACTIVATED';
    } else if (body.action === 'override_verification') {
      updateData.verificationStatus = body.verificationStatus || 'VERIFIED';
      if (body.verificationStatus === 'VERIFIED') {
        updateData.isActive = true;
        updateData.onboardingState = 'ACTIVE';
      }
      actionType = 'VERIFICATION_OVERRIDE';
    } else {
      return error('Invalid action', 400);
    }

    const updated = await prisma.provider.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    if (actionType) {
      await prisma.adminAuditLog.create({
        data: {
          adminUserId: user.id,
          actionType: actionType as any,
          targetEntity: 'Provider',
          targetId: id,
          details: JSON.stringify({ action: body.action, reason: body.reason }),
        },
      });
    }

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
