// SMS Service Abstraction
// In dev mode, OTPs are logged to console. In production, swap to a real provider (MSG91, Twilio, etc.)

interface SendOtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<SendOtpResult>;
  sendMessage(phone: string, message: string): Promise<SendOtpResult>;
}

class DevSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    console.log(`[DEV SMS] OTP for ${phone}: ${otp}`);
    return { success: true, messageId: `dev_${Date.now()}` };
  }

  async sendMessage(phone: string, message: string): Promise<SendOtpResult> {
    console.log(`[DEV SMS] To ${phone}: ${message}`);
    return { success: true, messageId: `dev_${Date.now()}` };
  }
}

class ProductionSmsProvider implements SmsProvider {
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY || '';
    this.senderId = process.env.SMS_SENDER_ID || 'PAWMIG';
  }

  async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    // Integration point for real SMS provider (MSG91, Twilio, etc.)
    // Replace this with actual API call
    console.warn('[SMS] Production SMS provider not configured. Falling back to console.');
    console.log(`[SMS FALLBACK] OTP for ${phone}: ${otp}`);
    return { success: true, messageId: `prod_${Date.now()}` };
  }

  async sendMessage(phone: string, message: string): Promise<SendOtpResult> {
    console.warn('[SMS] Production SMS provider not configured. Falling back to console.');
    console.log(`[SMS FALLBACK] To ${phone}: ${message}`);
    return { success: true, messageId: `prod_${Date.now()}` };
  }
}

function createSmsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === 'dev' || process.env.NODE_ENV === 'development') {
    return new DevSmsProvider();
  }
  return new ProductionSmsProvider();
}

export const smsService = createSmsProvider();

export function generateOtp(): string {
  if (process.env.NODE_ENV === 'development' || process.env.SMS_PROVIDER === 'dev') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}
