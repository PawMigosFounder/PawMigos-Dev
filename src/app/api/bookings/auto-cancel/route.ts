// Cron endpoint to auto-cancel expired pending bookings
// Should be called periodically (e.g., every 15 minutes)

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { bookingNotifications } from '@/lib/services/notifications';

export async function POST(request: NextRequest) {
  try {
    // Simple auth: check for cron secret header
    const cronSecret = request.headers.get('x-cron-secret');
    if (process.env.NODE_ENV === 'production' && cronSecret !== process.env.CRON_SECRET) {
      return error('Unauthorized', 401);
    }

    // Find all pending bookings past their response deadline
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        providerResponseDeadline: { lt: new Date() },
      },
      include: {
        service: true,
        user: { select: { id: true, phone: true } },
      },
    });

    let cancelled = 0;
    for (const booking of expiredBookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'EXPIRED' },
      });

      await bookingNotifications.autoCancelled(
        booking.id,
        booking.userId,
        booking.user.phone,
        booking.service.title
      );

      cancelled++;
    }

    console.log(`[Auto-Cancel] Expired ${cancelled} pending bookings`);
    return success({ cancelled });
  } catch (err) {
    return handleApiError(err);
  }
}
