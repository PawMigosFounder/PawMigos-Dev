import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, handleApiError, forbidden } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (user.role !== 'ADMIN') return forbidden();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 50;

    const [logs, total] = await Promise.all([
      prisma.adminAuditLog.findMany({
        include: {
          adminUser: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.adminAuditLog.count(),
    ]);

    return success({
      logs,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
