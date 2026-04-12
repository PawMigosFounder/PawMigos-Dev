import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError, forbidden } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (user.role !== 'ADMIN') return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('verificationStatus');
    const city = searchParams.get('city');

    const where: Record<string, unknown> = {};
    if (status) where.verificationStatus = status;
    if (city) where.city = city;

    const providers = await prisma.provider.findMany({
      where,
      include: {
        user: { select: { phone: true, name: true } },
        verificationRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(providers);
  } catch (err) {
    return handleApiError(err);
  }
}
