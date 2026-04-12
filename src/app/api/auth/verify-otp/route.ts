import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { verifyOtpSchema } from '@/lib/validators';
import { generateToken } from '@/lib/auth';
import { OTP_MAX_ATTEMPTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { phone, code } = parsed.data;

    // Find most recent unexpired OTP for this phone
    const otpRecord = await prisma.otpRecord.findFirst({
      where: {
        phone,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return error('OTP expired or not found. Please request a new one.', 400);
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      return error('Too many attempts. Please request a new OTP.', 429);
    }

    // Increment attempt count
    await prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    if (otpRecord.code !== code) {
      return error('Invalid OTP', 400);
    }

    // Mark OTP as verified
    await prisma.otpRecord.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    let isNew = false;

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      });
      isNew = true;
    }

    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    const response = success({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        city: user.city,
      },
      isNew,
    });

    response.cookies.set('pawmigos_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
