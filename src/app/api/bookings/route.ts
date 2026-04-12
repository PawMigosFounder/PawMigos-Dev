import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validators';
import { evaluateCompatibility } from '@/lib/services/compatibility';
import { bookingNotifications } from '@/lib/services/notifications';
import { COMPATIBILITY_REQUIRED_CATEGORIES, BOOKING_RESPONSE_SLA_HOURS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role') || 'consumer';

    const where: Record<string, unknown> = {};

    if (role === 'provider') {
      const provider = await prisma.provider.findUnique({ where: { userId: user.id } });
      if (!provider) return notFound('Provider not found');
      where.providerId = provider.id;
    } else {
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        pet: true,
        provider: { select: { id: true, name: true, city: true, profilePhoto: true, phone: true } },
        user: { select: { id: true, name: true, phone: true, profilePhoto: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return success(bookings);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { providerId, serviceId, petId, date, startTime, endTime, paymentMode } = parsed.data;

    // Validate provider exists and is active+verified
    const provider = await prisma.provider.findFirst({
      where: { id: providerId, isActive: true, verificationStatus: 'VERIFIED' },
      include: { hostingRestrictions: true, accommodationProfile: true },
    });
    if (!provider) return error('Provider not found or not available', 404);

    // Validate service belongs to provider
    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId, isActive: true },
    });
    if (!service) return error('Service not found', 404);

    // Validate pet belongs to user and is active
    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: user.id, isActive: true },
      include: { careProfile: true },
    });
    if (!pet) return error('Pet not found or inactive', 404);

    // Check if booking date is in the future
    const bookingDate = new Date(date);
    if (bookingDate < new Date(new Date().toDateString())) {
      return error('Booking date must be in the future', 400);
    }

    // Check provider availability for the requested day
    const dayOfWeek = bookingDate.getDay();
    const availableSlots = await prisma.availability.findMany({
      where: { providerId, dayOfWeek, isActive: true },
    });

    if (availableSlots.length === 0) {
      return error('Provider is not available on the requested day', 400);
    }

    // Check if requested time falls within an available slot
    const timeInSlot = availableSlots.some(
      (slot) => startTime >= slot.startTime && startTime < slot.endTime
    );
    if (!timeInSlot) {
      return error('Requested time is outside provider availability', 400);
    }

    // Check for conflicting accepted bookings (double-booking prevention)
    const conflicting = await prisma.booking.findFirst({
      where: {
        providerId,
        date: bookingDate,
        startTime,
        status: 'ACCEPTED',
      },
    });
    if (conflicting) {
      return error('This time slot is already booked', 409);
    }

    // Duplicate submission prevention
    const duplicate = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        providerId,
        serviceId,
        petId,
        date: bookingDate,
        startTime,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
    });
    if (duplicate) {
      return error('A similar booking request already exists', 409);
    }

    // Run compatibility check for relevant categories
    let compatibilityResult = null;
    let compatibilityNotes = null;
    const requiresCompatibility = COMPATIBILITY_REQUIRED_CATEGORIES.includes(
      service.category as typeof COMPATIBILITY_REQUIRED_CATEGORIES[number]
    );

    if (requiresCompatibility) {
      if (!pet.careProfileCompleted) {
        return error(
          'Please complete your pet\'s care profile before booking boarding/sitting services.',
          400
        );
      }

      if (!provider.hostingRestrictions) {
        return error('Provider has not configured hosting restrictions yet', 400);
      }

      const compat = evaluateCompatibility(
        pet,
        provider.hostingRestrictions,
        provider.accommodationProfile
      );

      compatibilityResult = compat.outcome;
      compatibilityNotes = JSON.stringify({
        summary: compat.summary,
        reasons: compat.reasons,
      });

      if (compat.outcome === 'NOT_COMPATIBLE') {
        return error(compat.summary, 400, { compatibilityResult: compat });
      }
    }

    // Create booking
    const responseDeadline = new Date(Date.now() + BOOKING_RESPONSE_SLA_HOURS * 60 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        providerId,
        serviceId,
        petId,
        date: bookingDate,
        startTime,
        endTime: endTime || null,
        price: service.price,
        paymentMode: paymentMode || null,
        compatibilityResult,
        compatibilityNotes,
        providerResponseDeadline: responseDeadline,
      },
      include: {
        service: true,
        pet: true,
        provider: { select: { name: true, phone: true, userId: true } },
      },
    });

    // Send notifications
    await bookingNotifications.requestCreated(
      booking.id,
      user.id,
      booking.provider.userId,
      booking.provider.phone,
      booking.service.title
    );

    return success(booking, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
