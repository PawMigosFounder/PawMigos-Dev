// Signzy Verification Service Abstraction
// Dev mode returns mock verification results. Production mode integrates with Signzy API.

export interface VerificationInitResult {
  success: boolean;
  requestId: string;
  error?: string;
}

export interface VerificationCompleteResult {
  success: boolean;
  verified: boolean;
  maskedAadhaar?: string;
  vendorRefId?: string;
  faceMatchScore?: number;
  failureReason?: string;
}

interface SignzyProvider {
  initAadhaarOtp(aadhaarOrVid: string): Promise<VerificationInitResult>;
  verifyAadhaarOtp(requestId: string, otp: string): Promise<{ success: boolean; kycData?: unknown }>;
  performFaceMatch(requestId: string, selfieBase64: string): Promise<VerificationCompleteResult>;
}

class DevSignzyProvider implements SignzyProvider {
  async initAadhaarOtp(aadhaarOrVid: string): Promise<VerificationInitResult> {
    console.log(`[DEV SIGNZY] Init Aadhaar OTP for: ${aadhaarOrVid.slice(0, 4)}****`);
    // Simulate success. In dev mode, any 12-digit number works.
    if (aadhaarOrVid.length < 12) {
      return { success: false, requestId: '', error: 'Invalid Aadhaar/VID number' };
    }
    return {
      success: true,
      requestId: `dev_req_${Date.now()}`,
    };
  }

  async verifyAadhaarOtp(requestId: string, otp: string): Promise<{ success: boolean; kycData?: unknown }> {
    console.log(`[DEV SIGNZY] Verify OTP for request: ${requestId}, OTP: ${otp}`);
    // In dev mode, OTP "123456" always works
    if (otp === '123456') {
      return {
        success: true,
        kycData: {
          name: 'Dev Provider',
          maskedAadhaar: 'XXXX-XXXX-1234',
        },
      };
    }
    return { success: false };
  }

  async performFaceMatch(requestId: string, _selfieBase64: string): Promise<VerificationCompleteResult> {
    console.log(`[DEV SIGNZY] Face match for request: ${requestId}`);
    // Dev mode always returns a high match score
    return {
      success: true,
      verified: true,
      maskedAadhaar: 'XXXX-XXXX-1234',
      vendorRefId: `dev_vendor_${Date.now()}`,
      faceMatchScore: 0.95,
    };
  }
}

class ProductionSignzyProvider implements SignzyProvider {
  private baseUrl: string;
  private apiKey: string;
  private clientId: string;

  constructor() {
    this.baseUrl = process.env.SIGNZY_BASE_URL || 'https://api.signzy.com';
    this.apiKey = process.env.SIGNZY_API_KEY || '';
    this.clientId = process.env.SIGNZY_CLIENT_ID || '';
  }

  async initAadhaarOtp(aadhaarOrVid: string): Promise<VerificationInitResult> {
    // Integration point: POST to Signzy Aadhaar OTP init endpoint
    // Implementation will call Signzy's e-KYC API
    console.warn('[SIGNZY] Production Signzy not configured. Returning error.');
    return {
      success: false,
      requestId: '',
      error: 'Signzy production integration not configured. Set SIGNZY_API_KEY and SIGNZY_CLIENT_ID.',
    };
  }

  async verifyAadhaarOtp(requestId: string, otp: string): Promise<{ success: boolean; kycData?: unknown }> {
    console.warn('[SIGNZY] Production Signzy not configured.');
    return { success: false };
  }

  async performFaceMatch(requestId: string, selfieBase64: string): Promise<VerificationCompleteResult> {
    console.warn('[SIGNZY] Production Signzy not configured.');
    return {
      success: false,
      verified: false,
      failureReason: 'Signzy production integration not configured.',
    };
  }
}

function createSignzyProvider(): SignzyProvider {
  if (process.env.SIGNZY_MODE === 'dev' || process.env.NODE_ENV === 'development') {
    return new DevSignzyProvider();
  }
  return new ProductionSignzyProvider();
}

export const signzyService = createSignzyProvider();
