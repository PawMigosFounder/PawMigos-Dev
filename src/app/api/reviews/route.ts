import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { bookingId, rating, reviewText } = parsed.data;

    // Verify booking exists and is completed
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: user.id },
    });
    if (!booking) return error('Booking not found', 404);
    if (booking.status !== 'COMPLETED') {
      return error('Reviews can only be submitted for completed bookings', 400);
    }

    // Check for existing review
    const existing = await prisma.review.findUnique({
      where: { bookingId },
    });
    if (existing) {
      return error('A review already exists for this booking', 409);
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        userId: user.id,
        providerId: booking.providerId,
        rating,
        reviewText,
      },
    });

    // Update provider aggregate rating
    const stats = await prisma.review.aggregate({
      where: { providerId: booking.providerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.provider.update({
      where: { id: booking.providerId },
      data: {
        averageRating: stats._avg.rating || 0,
        reviewCount: stats._count.rating || 0,
      },
    });

    return success(review, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) return error('providerId is required', 400);

    const reviews = await prisma.review.findMany({
      where: { providerId },
      include: {
        user: { select: { name: true, profilePhoto: true } },
        booking: { select: { service: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(reviews);
  } catch (err) {
    return handleApiError(err);
  }
}
