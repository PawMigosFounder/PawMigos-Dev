import { z } from 'zod';

// Phone validation (Indian format)
export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'OTP must be 6 digits'),
});

// Consumer onboarding
export const consumerOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  city: z.string().min(2, 'City is required'),
  onboardingIntent: z.enum(['HAS_PET', 'PROVIDER']),
  profilePhoto: z.string().optional(),
});

// Pet
export const createPetSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(50),
  type: z.enum(['DOG', 'CAT', 'OTHER']),
  breed: z.string().max(100).optional(),
  ageGroup: z.enum(['PUPPY_KITTEN', 'YOUNG', 'ADULT', 'SENIOR']),
  sex: z.enum(['MALE', 'FEMALE']),
  weightRange: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'GIANT']).optional(),
  photo: z.string().optional(),
  neuteredOrSpayed: z.boolean().default(false),
});

export const updatePetSchema = createPetSchema.partial();

// Pet care profile
export const petCareProfileSchema = z.object({
  vaccinationStatus: z.enum(['UP_TO_DATE', 'PARTIALLY_DONE', 'NOT_VACCINATED', 'UNKNOWN']).default('UNKNOWN'),
  vaccinationDetails: z.string().optional(),
  lastVaccinationDate: z.string().datetime().optional().nullable(),
  rabiesVaccinated: z.boolean().default(false),
  dewormedStatus: z.boolean().default(false),
  fleaTickTreated: z.boolean().default(false),
  medicalConditions: z.string().optional(),
  medicationRequired: z.boolean().default(false),
  medicationInstructions: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  vetName: z.string().optional(),
  vetContact: z.string().optional(),

  femaleInHeatCurrently: z.boolean().default(false),
  pregnant: z.boolean().default(false),
  recentlyDelivered: z.boolean().default(false),
  markingBehavior: z.boolean().default(false),
  toiletTrained: z.boolean().default(true),

  foodType: z.enum(['DRY_KIBBLE', 'WET_FOOD', 'RAW', 'HOME_COOKED', 'MIXED']).optional(),
  feedingSchedule: z.enum(['ONCE_DAILY', 'TWICE_DAILY', 'THREE_TIMES_DAILY', 'FREE_FEEDING']).optional(),
  dietaryRestrictions: z.string().optional(),
  foodAllergies: z.string().optional(),
  treatsAllowed: z.boolean().default(true),
  specialFeedingInstructions: z.string().optional(),

  temperament: z.enum(['CALM', 'FRIENDLY', 'ENERGETIC', 'ANXIOUS', 'AGGRESSIVE', 'SHY']).optional(),
  friendlyWithDogs: z.enum(['VERY_FRIENDLY', 'FRIENDLY', 'NEUTRAL', 'CAUTIOUS', 'NOT_FRIENDLY']).optional(),
  friendlyWithCats: z.enum(['VERY_FRIENDLY', 'FRIENDLY', 'NEUTRAL', 'CAUTIOUS', 'NOT_FRIENDLY']).optional(),
  friendlyWithChildren: z.enum(['VERY_FRIENDLY', 'FRIENDLY', 'NEUTRAL', 'CAUTIOUS', 'NOT_FRIENDLY']).optional(),
  biteHistory: z.boolean().default(false),
  aggressionHistory: z.boolean().default(false),
  separationAnxiety: z.boolean().default(false),
  crateTrained: z.boolean().default(false),
  leashTrained: z.boolean().default(false),
  escapeRisk: z.boolean().default(false),
  specialHandlingNotes: z.string().optional(),

  walkingFrequency: z.string().optional(),
  exerciseNeeds: z.enum(['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']).optional(),
  groomingNeeds: z.string().optional(),
  sleepHabits: z.string().optional(),
  comfortItems: z.string().optional(),
  emergencyInstructions: z.string().optional(),
});

// Provider
export const providerOnboardingSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  businessName: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required'),
  phone: phoneSchema,
  profilePhoto: z.string().optional(),
  description: z.string().max(2000).optional(),
  experience: z.string().max(1000).optional(),
  categories: z.array(z.enum(['GROOMING', 'BOARDING', 'TRAINING', 'SITTING', 'WALKING', 'OTHER'])).min(1, 'Select at least one category'),
});

export const providerServiceSchema = z.object({
  category: z.enum(['GROOMING', 'BOARDING', 'TRAINING', 'SITTING', 'WALKING', 'OTHER']),
  title: z.string().min(2, 'Service title is required').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'Price must be positive'),
  serviceType: z.enum(['HOME_VISIT', 'AT_PROVIDER', 'OUTDOOR']),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
});

export const accommodationProfileSchema = z.object({
  accommodationType: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'FARM', 'OTHER']),
  accommodationSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
  outdoorSpaceAvailable: z.boolean().default(false),
  fencedProperty: z.boolean().default(false),
  numberOfExistingPets: z.number().min(0).default(0),
  existingPetTypes: z.string().optional(),
  childrenInHome: z.boolean().default(false),
  elderlyInHome: z.boolean().default(false),
  smokingInHome: z.boolean().default(false),
  vehicleAvailableForEmergency: z.boolean().default(false),
  emergencyVetAccess: z.boolean().default(false),
});

export const hostingRestrictionsSchema = z.object({
  acceptsDogs: z.boolean().default(true),
  acceptsCats: z.boolean().default(true),
  acceptsOtherPets: z.boolean().default(false),
  maxPetSizeAllowed: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'GIANT']).default('GIANT'),
  maxNumberOfGuestPets: z.number().min(1).default(1),
  acceptsUnvaccinatedPets: z.boolean().default(false),
  acceptsPetsInHeat: z.boolean().default(false),
  acceptsUnneuteredUnspayed: z.boolean().default(true),
  acceptsSeniorPets: z.boolean().default(true),
  acceptsMedicationCases: z.boolean().default(false),
  acceptsSpecialNeedsPets: z.boolean().default(false),
  acceptsAggressiveReactive: z.boolean().default(false),
  acceptsPuppiesOrKittens: z.boolean().default(true),
  acceptsLargeBreeds: z.boolean().default(true),
  breedRestrictions: z.string().optional(),
  ageRestrictions: z.string().optional(),
  healthRestrictions: z.string().optional(),
  behaviorRestrictions: z.string().optional(),
});

// Booking
export const createBookingSchema = z.object({
  providerId: z.string().min(1),
  serviceId: z.string().min(1),
  petId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format').optional(),
  paymentMode: z.enum(['UPI', 'CASH', 'BANK_TRANSFER']).optional(),
});

export const respondBookingSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

// Review
export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(2000).optional(),
});

// Community
export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000),
  mediaUrl: z.string().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000),
});

// Verification
export const initVerificationSchema = z.object({
  aadhaarNumber: z.string().min(12, 'Enter valid Aadhaar number or VID').max(16),
});

export const completeVerificationSchema = z.object({
  requestId: z.string().min(1),
  otp: z.string().length(6),
  selfieBase64: z.string().optional(),
});
