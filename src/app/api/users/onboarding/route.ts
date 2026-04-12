import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { consumerOnboardingSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = consumerOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { name, city, onboardingIntent, profilePhoto } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        city,
        onboardingIntent,
        profilePhoto,
        onboardingCompleted: true,
      },
    });

    return success({
      id: updated.id,
      name: updated.name,
      city: updated.city,
      onboardingIntent: updated.onboardingIntent,
      onboardingCompleted: updated.onboardingCompleted,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
