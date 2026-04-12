// Notification Service
// Creates in-app notifications and sends SMS for critical events.

import { prisma } from '../prisma';
import { smsService } from './sms';
import type { NotificationType } from '@/generated/prisma/client';

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  sendSms?: boolean;
  phone?: string;
}

export async function createNotification(payload: NotificationPayload) {
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      data: payload.data ? JSON.stringify(payload.data) : null,
      channel: payload.sendSms ? 'SMS' : 'IN_APP',
      sentAt: new Date(),
    },
  });

  if (payload.sendSms && payload.phone) {
    try {
      await smsService.sendMessage(payload.phone, `${payload.title}: ${payload.message}`);
    } catch (err) {
      console.error('[Notification] SMS send failed:', err);
      await prisma.notification.update({
        where: { id: notification.id },
        data: { failedAt: new Date() },
      });
    }
  }

  return notification;
}

// Convenience methods for booking notifications
export const bookingNotifications = {
  async requestCreated(bookingId: string, consumerUserId: string, providerUserId: string, providerPhone: string, serviceName: string) {
    await createNotification({
      userId: consumerUserId,
      type: 'BOOKING_REQUESTED',
      title: 'Booking Request Sent',
      message: `Your booking request for ${serviceName} has been submitted.`,
      data: { bookingId },
    });
    await createNotification({
      userId: providerUserId,
      type: 'BOOKING_REQUESTED',
      title: 'New Booking Request',
      message: `You have a new booking request for ${serviceName}. Please respond within 24 hours.`,
      data: { bookingId },
      sendSms: true,
      phone: providerPhone,
    });
  },

  async accepted(bookingId: string, consumerUserId: string, consumerPhone: string, serviceName: string) {
    await createNotification({
      userId: consumerUserId,
      type: 'BOOKING_ACCEPTED',
      title: 'Booking Accepted',
      message: `Your booking for ${serviceName} has been accepted!`,
      data: { bookingId },
      sendSms: true,
      phone: consumerPhone,
    });
  },

  async rejected(bookingId: string, consumerUserId: string, consumerPhone: string, serviceName: string) {
    await createNotification({
      userId: consumerUserId,
      type: 'BOOKING_REJECTED',
      title: 'Booking Rejected',
      message: `Your booking for ${serviceName} was not accepted. Try another provider.`,
      data: { bookingId },
      sendSms: true,
      phone: consumerPhone,
    });
  },

  async cancelled(bookingId: string, targetUserId: string, phone: string, serviceName: string, cancelledBy: string) {
    await createNotification({
      userId: targetUserId,
      type: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      message: `The booking for ${serviceName} was cancelled by ${cancelledBy}.`,
      data: { bookingId },
      sendSms: true,
      phone,
    });
  },

  async autoCancelled(bookingId: string, consumerUserId: string, consumerPhone: string, serviceName: string) {
    await createNotification({
      userId: consumerUserId,
      type: 'BOOKING_AUTO_CANCELLED',
      title: 'Booking Auto-Cancelled',
      message: `Your booking for ${serviceName} was auto-cancelled because the provider did not respond in time.`,
      data: { bookingId },
      sendSms: true,
      phone: consumerPhone,
    });
  },

  async completed(bookingId: string, consumerUserId: string, serviceName: string) {
    await createNotification({
      userId: consumerUserId,
      type: 'BOOKING_COMPLETED',
      title: 'Booking Completed',
      message: `Your booking for ${serviceName} is complete. Please leave a review!`,
      data: { bookingId },
    });
  },
};

export const verificationNotifications = {
  async outcome(providerUserId: string, phone: string, verified: boolean) {
    await createNotification({
      userId: providerUserId,
      type: 'VERIFICATION_OUTCOME',
      title: verified ? 'Verification Successful' : 'Verification Failed',
      message: verified
        ? 'Your identity has been verified. Your profile is now active!'
        : 'Your identity verification was unsuccessful. Please try again or contact support.',
      sendSms: true,
      phone,
    });
  },
};
