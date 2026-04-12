import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { providerServiceSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'asc' },
    });
    return success(services);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = providerServiceSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    // Validate category belongs to provider's selected categories
    if (!provider.categories.includes(parsed.data.category)) {
      return error(`Category ${parsed.data.category} is not in your selected categories`, 400);
    }

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        ...parsed.data,
      },
    });

    return success(service, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
