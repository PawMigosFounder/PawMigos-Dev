import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { providerOnboardingSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = providerOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    // Check if provider already exists
    const existing = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (existing) {
      return error('Provider profile already exists', 409);
    }

    const provider = await prisma.provider.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        businessName: parsed.data.businessName,
        city: parsed.data.city,
        phone: parsed.data.phone,
        profilePhoto: parsed.data.profilePhoto,
        description: parsed.data.description,
        experience: parsed.data.experience,
        categories: parsed.data.categories,
        onboardingState: 'DRAFT',
      },
    });

    // Update user role to PROVIDER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'PROVIDER' },
    });

    return success(provider, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
