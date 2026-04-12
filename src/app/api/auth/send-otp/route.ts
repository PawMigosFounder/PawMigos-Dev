import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, handleApiError } from '@/lib/api-response';
import { sendOtpSchema } from '@/lib/validators';
import { smsService, generateOtp } from '@/lib/services/sms';
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const { phone } = parsed.data;

    // Rate limit: check if OTP was sent recently
    const recentOtp = await prisma.otpRecord.findFirst({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) }, // 1 minute
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      return error('Please wait before requesting another OTP', 429);
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpRecord.create({
      data: { phone, code, expiresAt },
    });

    await smsService.sendOtp(phone, code);

    return success({ message: 'OTP sent successfully', expiresInSeconds: OTP_EXPIRY_MINUTES * 60 });
  } catch (err) {
    return handleApiError(err);
  }
}
