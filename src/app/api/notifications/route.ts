import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const where: Record<string, unknown> = { userId: user.id };
    if (unreadOnly) where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return success({ notifications, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}

// Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (body.notificationIds?.length) {
      await prisma.notification.updateMany({
        where: { id: { in: body.notificationIds }, userId: user.id },
        data: { isRead: true },
      });
    }

    return success({ message: 'Notifications updated' });
  } catch (err) {
    return handleApiError(err);
  }
}
