// Mirrors the subset of Prisma types we consume on mobile.
// Keep in sync with pawmigos-app/src/generated/prisma/models.ts.

export type UserRole = 'CONSUMER' | 'PROVIDER' | 'ADMIN';
export type OnboardingIntent = 'HAS_PET' | 'EXPLORING';
export type PetType = 'DOG' | 'CAT' | 'RABBIT' | 'BIRD' | 'OTHER';
export type PetSex = 'MALE' | 'FEMALE';
export type AgeGroup = 'PUPPY' | 'YOUNG' | 'ADULT' | 'SENIOR';
export type WeightRange = 'TOY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'GIANT';
export type VaccinationStatus = 'UP_TO_DATE' | 'PARTIAL' | 'NONE' | 'UNKNOWN';
export type ServiceCategory =
  | 'BOARDING'
  | 'SITTING'
  | 'WALKING'
  | 'GROOMING'
  | 'TRAINING'
  | 'DAYCARE';
export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'ADMIN_OVERRIDE';
export type ProviderOnboardingState =
  | 'SIGNUP'
  | 'PROFILE_CREATED'
  | 'SERVICES_ADDED'
  | 'AVAILABILITY_SET'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'ACTIVE';
export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';
export type CompatibilityOutcome = 'COMPATIBLE' | 'REVIEW_REQUIRED' | 'NOT_COMPATIBLE';
export type NotificationType =
  | 'BOOKING_REQUESTED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'VERIFICATION_COMPLETED'
  | 'VERIFICATION_REJECTED'
  | 'REVIEW_RECEIVED'
  | 'SYSTEM';

export interface User {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  profilePhoto: string | null;
  role: UserRole;
  onboardingIntent: OnboardingIntent | null;
  onboardingCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  type: PetType;
  breed: string | null;
  sex: PetSex | null;
  ageGroup: AgeGroup | null;
  weightRange: WeightRange | null;
  photo: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  careProfile?: PetCareProfile | null;
}

export interface PetCareProfile {
  id: string;
  petId: string;
  vaccinationStatus: VaccinationStatus | null;
  isSpayedNeutered: boolean | null;
  isInHeat: boolean | null;
  isPregnant: boolean | null;
  medications: string[];
  hasAggressionHistory: boolean | null;
  hasBiteHistory: boolean | null;
  hasSeparationAnxiety: boolean | null;
  isEscapeRisk: boolean | null;
  feedingInstructions: string | null;
  walkingInstructions: string | null;
  specialNeeds: string | null;
  emergencyContact: string | null;
  vetContact: string | null;
  completedAt: string | null;
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  businessName: string | null;
  city: string;
  phone: string;
  profilePhoto: string | null;
  description: string | null;
  experience: string | null;
  mediaGallery: string[];
  categories: ServiceCategory[];
  onboardingState: ProviderOnboardingState;
  verificationStatus: VerificationStatus;
  isActive: boolean;
  hostingProfileCompleted: boolean;
  totalCompletedBookings: number;
  averageRating: number;
  reviewCount: number;
  services?: Service[];
  availability?: Availability[];
  accommodationProfile?: AccommodationProfile | null;
}

export interface Service {
  id: string;
  providerId: string;
  category: ServiceCategory;
  title: string;
  description: string | null;
  price: number;
  serviceType: 'PER_DAY' | 'PER_HOUR' | 'PER_SESSION' | 'PER_VISIT';
  isActive: boolean;
}

export interface Availability {
  id: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AccommodationProfile {
  id: string;
  providerId: string;
  propertyType: string | null;
  hasYard: boolean | null;
  hasPool: boolean | null;
  hasOtherPets: boolean | null;
  smokingAllowed: boolean | null;
  maxPetsAtOnce: number | null;
  description: string | null;
  restrictions?: HostingRestrictions | null;
}

export interface HostingRestrictions {
  id: string;
  accommodationId: string;
  acceptedPetTypes: PetType[];
  maxWeightRange: WeightRange | null;
  acceptsUnvaccinated: boolean;
  acceptsUnspayedInHeat: boolean;
  acceptsAggressive: boolean;
  acceptsMedicated: boolean;
  breedRestrictions: string[];
  minAgeGroup: AgeGroup | null;
  maxAgeGroup: AgeGroup | null;
}

export interface Booking {
  id: string;
  consumerId: string;
  providerId: string;
  serviceId: string;
  petId: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentMode: 'CASH' | 'ONLINE' | null;
  compatibilityOutcome: CompatibilityOutcome | null;
  compatibilitySummary: string | null;
  responseDeadline: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  pet?: Pet;
  provider?: Provider;
  service?: Service;
  consumer?: User;
  review?: Review | null;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  providerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer?: Pick<User, 'id' | 'name'>;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author?: Pick<User, 'id' | 'name' | 'profilePhoto'>;
  hasLiked?: boolean;
  comments?: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: Pick<User, 'id' | 'name' | 'profilePhoto'>;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface CompatibilityResult {
  outcome: CompatibilityOutcome;
  summary: string;
  reasons: Array<{
    field: string;
    severity: 'BLOCKING' | 'WARNING' | 'INFO';
    message: string;
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
