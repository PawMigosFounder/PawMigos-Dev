import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { success, error, notFound, handleApiError } from '@/lib/api-response';
import { requireAuthFromRequest } from '@/lib/auth';
import { initVerificationSchema, completeVerificationSchema } from '@/lib/validators';
import { signzyService } from '@/lib/services/signzy';
import { verificationNotifications } from '@/lib/services/notifications';

// POST /api/providers/verification - init
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
    });
    if (!provider) return notFound('Provider not found');

    const body = await request.json();

    // Determine action based on body
    if (body.action === 'complete') {
      // Complete verification flow
      const parsed = completeVerificationSchema.safeParse(body);
      if (!parsed.success) {
        return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
      }

      const { requestId, otp, selfieBase64 } = parsed.data;

      // Step 1: Verify Aadhaar OTP
      const otpResult = await signzyService.verifyAadhaarOtp(requestId, otp);
      if (!otpResult.success) {
        await prisma.verificationRecord.updateMany({
          where: { providerId: provider.id, vendorRefId: requestId },
          data: { verificationStatus: 'FAILED', failureReason: 'OTP verification failed' },
        });
        await prisma.provider.update({
          where: { id: provider.id },
          data: { verificationStatus: 'FAILED' },
        });
        return error('Aadhaar OTP verification failed', 400);
      }

      // Step 2: Face match
      const faceResult = await signzyService.performFaceMatch(requestId, selfieBase64 || '');

      if (faceResult.verified) {
        await prisma.verificationRecord.updateMany({
          where: { providerId: provider.id, vendorRefId: requestId },
          data: {
            verificationStatus: 'VERIFIED',
            maskedIdentifier: faceResult.maskedAadhaar,
            faceMatchScore: faceResult.faceMatchScore,
            completedAt: new Date(),
          },
        });
        await prisma.provider.update({
          where: { id: provider.id },
          data: {
            verificationStatus: 'VERIFIED',
            onboardingState: 'VERIFIED',
            isActive: true,
          },
        });
        await verificationNotifications.outcome(user.id, provider.phone, true);
        return success({ status: 'verified', faceMatchScore: faceResult.faceMatchScore });
      } else {
        await prisma.verificationRecord.updateMany({
          where: { providerId: provider.id, vendorRefId: requestId },
          data: {
            verificationStatus: 'FAILED',
            failureReason: faceResult.failureReason || 'Face match failed',
            faceMatchScore: faceResult.faceMatchScore,
          },
        });
        await prisma.provider.update({
          where: { id: provider.id },
          data: { verificationStatus: 'FAILED', onboardingState: 'FAILED' },
        });
        await verificationNotifications.outcome(user.id, provider.phone, false);
        return error('Face match verification failed', 400);
      }
    }

    // Init verification flow
    const parsed = initVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return error('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    const result = await signzyService.initAadhaarOtp(parsed.data.aadhaarNumber);
    if (!result.success) {
      return error(result.error || 'Failed to initiate verification', 400);
    }

    // Create verification record
    await prisma.verificationRecord.create({
      data: {
        providerId: provider.id,
        vendorRefId: result.requestId,
        verificationStatus: 'PENDING',
      },
    });

    await prisma.provider.update({
      where: { id: provider.id },
      data: {
        verificationStatus: 'PENDING',
        onboardingState: 'PENDING_VERIFICATION',
      },
    });

    return success({ requestId: result.requestId, message: 'OTP sent to Aadhaar-linked mobile' });
  } catch (err) {
    return handleApiError(err);
  }
}

// GET /api/providers/verification - status
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    const provider = await prisma.provider.findUnique({
      where: { userId: user.id },
      include: {
        verificationRecords: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });
    if (!provider) return notFound('Provider not found');

    return success({
      verificationStatus: provider.verificationStatus,
      onboardingState: provider.onboardingState,
      records: provider.verificationRecords,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
