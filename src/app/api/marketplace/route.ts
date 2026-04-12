import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, handleApiError } from '@/lib/api-response';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const minRating = searchParams.get('minRating');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE)),
      MAX_PAGE_SIZE
    );

    // Build provider filter — only verified and active
    const providerWhere: Record<string, unknown> = {
      isActive: true,
      verificationStatus: 'VERIFIED',
    };

    if (city) {
      providerWhere.city = { equals: city, mode: 'insensitive' };
    }
    if (category) {
      providerWhere.categories = { has: category };
    }
    if (minRating) {
      providerWhere.averageRating = { gte: parseFloat(minRating) };
    }

    // Service price filter
    const serviceWhere: Record<string, unknown> = { isActive: true };
    if (minPrice) serviceWhere.price = { ...((serviceWhere.price as object) || {}), gte: parseFloat(minPrice) };
    if (maxPrice) serviceWhere.price = { ...((serviceWhere.price as object) || {}), lte: parseFloat(maxPrice) };

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where: providerWhere,
        include: {
          services: { where: serviceWhere },
          availability: true,
        },
        orderBy: [{ averageRating: 'desc' }, { totalCompletedBookings: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.provider.count({ where: providerWhere }),
    ]);

    return success({
      providers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
