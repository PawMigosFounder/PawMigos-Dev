import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, handleApiError, unauthorized } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return unauthorized();

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        pets: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
        provider: {
          include: {
            services: true,
            availability: true,
          },
        },
      },
    });

    return success(userData);
  } catch (err) {
    return handleApiError(err);
  }
}
