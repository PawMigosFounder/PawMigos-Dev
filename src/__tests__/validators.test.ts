import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  sendOtpSchema,
  verifyOtpSchema,
  consumerOnboardingSchema,
  createPetSchema,
  createBookingSchema,
  createReviewSchema,
  providerOnboardingSchema,
  providerServiceSchema,
} from '../lib/validators';

describe('Phone OTP Validators', () => {
  it('should accept valid Indian phone numbers', () => {
    const result = sendOtpSchema.safeParse({ phone: '9876543210' });
    assert.ok(result.success);
  });

  it('should reject invalid phone numbers', () => {
    assert.ok(!sendOtpSchema.safeParse({ phone: '1234567890' }).success); // starts with 1
    assert.ok(!sendOtpSchema.safeParse({ phone: '987654321' }).success);  // 9 digits
    assert.ok(!sendOtpSchema.safeParse({ phone: '' }).success);
    assert.ok(!sendOtpSchema.safeParse({ phone: 'abcdefghij' }).success);
  });

  it('should validate OTP format', () => {
    assert.ok(verifyOtpSchema.safeParse({ phone: '9876543210', code: '123456' }).success);
    assert.ok(!verifyOtpSchema.safeParse({ phone: '9876543210', code: '12345' }).success);  // 5 digits
    assert.ok(!verifyOtpSchema.safeParse({ phone: '9876543210', code: '1234567' }).success); // 7 digits
  });
});

describe('Consumer Onboarding Validator', () => {
  it('should accept valid onboarding data', () => {
    const result = consumerOnboardingSchema.safeParse({
      name: 'Priya Sharma',
      city: 'Mumbai',
      onboardingIntent: 'HAS_PET',
    });
    assert.ok(result.success);
  });

  it('should reject missing name', () => {
    const result = consumerOnboardingSchema.safeParse({
      city: 'Mumbai',
      onboardingIntent: 'HAS_PET',
    });
    assert.ok(!result.success);
  });

  it('should reject invalid intent', () => {
    const result = consumerOnboardingSchema.safeParse({
      name: 'Priya',
      city: 'Mumbai',
      onboardingIntent: 'INVALID',
    });
    assert.ok(!result.success);
  });
});

describe('Pet Validator', () => {
  it('should accept valid pet data', () => {
    const result = createPetSchema.safeParse({
      name: 'Bruno',
      type: 'DOG',
      ageGroup: 'ADULT',
      sex: 'MALE',
    });
    assert.ok(result.success);
  });

  it('should reject missing pet name', () => {
    assert.ok(!createPetSchema.safeParse({ type: 'DOG', ageGroup: 'ADULT', sex: 'MALE' }).success);
  });

  it('should reject invalid pet type', () => {
    assert.ok(!createPetSchema.safeParse({ name: 'Buddy', type: 'FISH', ageGroup: 'ADULT', sex: 'MALE' }).success);
  });

  it('should accept optional fields', () => {
    const result = createPetSchema.safeParse({
      name: 'Bruno',
      type: 'DOG',
      ageGroup: 'ADULT',
      sex: 'MALE',
      breed: 'Labrador',
      weightRange: 'LARGE',
      neuteredOrSpayed: true,
    });
    assert.ok(result.success);
  });
});

describe('Booking Validator', () => {
  it('should accept valid booking data', () => {
    const result = createBookingSchema.safeParse({
      providerId: 'prov123',
      serviceId: 'svc123',
      petId: 'pet123',
      date: '2026-04-20',
      startTime: '10:00',
    });
    assert.ok(result.success);
  });

  it('should reject invalid date format', () => {
    assert.ok(!createBookingSchema.safeParse({
      providerId: 'prov123', serviceId: 'svc123', petId: 'pet123',
      date: '20-04-2026', startTime: '10:00',
    }).success);
  });

  it('should reject invalid time format', () => {
    assert.ok(!createBookingSchema.safeParse({
      providerId: 'prov123', serviceId: 'svc123', petId: 'pet123',
      date: '2026-04-20', startTime: '10am',
    }).success);
  });
});

describe('Review Validator', () => {
  it('should accept valid review', () => {
    assert.ok(createReviewSchema.safeParse({ bookingId: 'b1', rating: 5 }).success);
    assert.ok(createReviewSchema.safeParse({ bookingId: 'b1', rating: 1, reviewText: 'Great' }).success);
  });

  it('should reject rating out of range', () => {
    assert.ok(!createReviewSchema.safeParse({ bookingId: 'b1', rating: 0 }).success);
    assert.ok(!createReviewSchema.safeParse({ bookingId: 'b1', rating: 6 }).success);
  });
});

describe('Provider Onboarding Validator', () => {
  it('should accept valid provider data', () => {
    const result = providerOnboardingSchema.safeParse({
      name: 'Test Provider',
      city: 'Mumbai',
      phone: '9876543210',
      categories: ['GROOMING', 'BOARDING'],
    });
    assert.ok(result.success);
  });

  it('should reject empty categories', () => {
    assert.ok(!providerOnboardingSchema.safeParse({
      name: 'Test', city: 'Mumbai', phone: '9876543210', categories: [],
    }).success);
  });

  it('should reject invalid category', () => {
    assert.ok(!providerOnboardingSchema.safeParse({
      name: 'Test', city: 'Mumbai', phone: '9876543210', categories: ['INVALID'],
    }).success);
  });
});

describe('Provider Service Validator', () => {
  it('should accept valid service data', () => {
    assert.ok(providerServiceSchema.safeParse({
      category: 'GROOMING', title: 'Bath', price: 500, serviceType: 'AT_PROVIDER',
    }).success);
  });

  it('should reject negative price', () => {
    assert.ok(!providerServiceSchema.safeParse({
      category: 'GROOMING', title: 'Bath', price: -100, serviceType: 'AT_PROVIDER',
    }).success);
  });
});
