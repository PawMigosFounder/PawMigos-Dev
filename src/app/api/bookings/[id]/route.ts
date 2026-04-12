import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { respondBookingSchema, cancelBookingSchema } from '@/lib/validators';
import { bookingNotifications } from '@/lib/services/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;

    const booking = await prisma.booking.findFirst({
      where: { id },
      include: {
        service: true,
        pet: { include: { careProfile: true } },
        provider: {
          select: {
            id: true, name: true, city: true, phone: true,
            profilePhoto: true, accommodationProfile: true,
          },
        },
        user: { select: { id: true, name: true, phone: true } },
        review: true,
      },
    });

    if (!booking) return notFound('Booking not found');

    // Verify access: must be consumer or provider
    const provider = await prisma.provider.findUnique({ where: { userId: user.id } });
    if (booking.userId !== user.id && provider?.id !== booking.providerId) {
      return error('Access denied', 403);
    }

    return success(booking);
  } catch (err) {
    return handleApiError(err);
  }
}

// Provider responds (accept/reject) or marks complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;
    const body = await request.json();

    const provider = await prisma.provider.findUnique({ where: { userId: user.id } });
    if (!provider) return error('Only providers can respond to bookings', 403);

    const booking = await prisma.booking.findFirst({
      where: { id, providerId: provider.id },
      include: {
        service: true,
        user: { select: { id: true, phone: true } },
      },
    });
    if (!booking) return notFound('Booking not found');

    // Handle completion
    if (body.action === 'complete') {
      if (booking.status !== 'ACCEPTED') {
        return error('Only accepted bookings can be completed', 400);
      }
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
      // Update provider stats
      await prisma.provider.update({
        where: { id: provider.id },
        data: { totalCompletedBookings: { increment: 1 } },
      });
      await bookingNotifications.completed(id, booking.userId, booking.service.title);
      return success(updated);
    }

    // Handle payment marking
    if (body.action === 'mark_paid') {
      if (booking.status !== 'ACCEPTED' && booking.status !== 'COMPLETED') {
        return error('Can only mark payment for accepted or completed bookings', 400);
      }
      const updated = await prisma.booking.update({
        where: { id },
        data: {
          paymentStatus: 'PAID',
          paymentMode: body.paymentMode || booking.paymentMode,
        },
      });
      return success(updated);
    }

    // Handle accept/reject
    const parsed = respondBookingSchema.safeParse(body);
    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    if (booking.status !== 'PENDING') {
      return error(`Cannot respond to a booking with status: ${booking.status}`, 400);
    }

    if (parsed.data.action === 'accept') {
      // Double-booking check at acceptance time
      const conflict = await prisma.booking.findFirst({
        where: {
          providerId: provider.id,
          date: booking.date,
          startTime: booking.startTime,
          status: 'ACCEPTED',
          id: { not: id },
        },
      });
      if (conflict) {
        return error('Conflicting booking exists for this time slot', 409);
      }

      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'ACCEPTED' },
      });
      await bookingNotifications.accepted(id, booking.userId, booking.user.phone, booking.service.title);
      return success(updated);
    }

    if (parsed.data.action === 'reject') {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: 'REJECTED', cancellationReason: parsed.data.reason },
      });
      await bookingNotifications.rejected(id, booking.userId, booking.user.phone, booking.service.title);
      return success(updated);
    }

    return error('Invalid action', 400);
  } catch (err) {
    return handleApiError(err);
  }
}

// Cancel booking (consumer or provider)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = cancelBookingSchema.safeParse(body);

    if (!parsed.success) {
      return error('Cancellation reason is required', 400);
    }

    const booking = await prisma.booking.findFirst({
      where: { id },
      include: {
        service: true,
        provider: { select: { id: true, userId: true, phone: true } },
        user: { select: { id: true, phone: true } },
      },
    });
    if (!booking) return notFound('Booking not found');

    // Verify access
    const isConsumer = booking.userId === user.id;
    const isProvider = booking.provider.userId === user.id;
    if (!isConsumer && !isProvider) return error('Access denied', 403);

    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return error(`Cannot cancel a booking with status: ${booking.status}`, 400);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: parsed.data.reason,
      },
    });

    // Notify the other party
    const cancelledBy = isConsumer ? 'consumer' : 'provider';
    if (isConsumer) {
      await bookingNotifications.cancelled(
        id, booking.provider.userId, booking.provider.phone,
        booking.service.title, cancelledBy
      );
    } else {
      await bookingNotifications.cancelled(
        id, booking.userId, booking.user.phone,
        booking.service.title, cancelledBy
      );
    }

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
