import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest, getUserFromRequest } from '@/lib/auth';
import { createPostSchema } from '@/lib/validators';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE));

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        include: {
          user: { select: { id: true, name: true, profilePhoto: true } },
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.communityPost.count(),
    ]);

    return success({
      posts,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: user.id,
        content: parsed.data.content,
        mediaUrl: parsed.data.mediaUrl,
      },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
      },
    });

    return success(post, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
