import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, handleApiError, forbidden } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (user.role !== 'ADMIN') return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { name: true, phone: true } },
          provider: { select: { name: true, city: true } },
          service: { select: { title: true, category: true } },
          pet: { select: { name: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where }),
    ]);

    return success({
      bookings,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
