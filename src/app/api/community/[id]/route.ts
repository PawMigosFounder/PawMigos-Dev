import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
        comments: { orderBy: { createdAt: 'asc' } },
        _count: { select: { comments: true } },
      },
    });
    if (!post) return notFound('Post not found');
    return success(post);
  } catch (err) {
    return handleApiError(err);
  }
}

// Add comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthFromRequest(request);
    const { id } = await params;
    const body = await request.json();

    // Handle like action
    if (body.action === 'like') {
      const post = await prisma.communityPost.findUnique({ where: { id } });
      if (!post) return notFound('Post not found');
      const updated = await prisma.communityPost.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
      return success(updated);
    }

    // Add comment
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return notFound('Post not found');

    const comment = await prisma.communityComment.create({
      data: {
        postId: id,
        userId: user.id,
        content: parsed.data.content,
      },
    });

    return success(comment, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
