// Mirrors pawmigos-app/src/lib/constants.ts

export const SUPPORTED_CITIES = [
  'Ahmedabad',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Jaipur',
  'Kochi',
];

export const SERVICE_CATEGORIES = [
  { value: 'BOARDING', label: 'Boarding' },
  { value: 'SITTING', label: 'Pet Sitting' },
  { value: 'WALKING', label: 'Dog Walking' },
  { value: 'GROOMING', label: 'Grooming' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'DAYCARE', label: 'Daycare' },
];

export const COMPATIBILITY_REQUIRED_CATEGORIES = ['BOARDING', 'DAYCARE', 'SITTING'];

export const PET_TYPES = [
  { value: 'DOG', label: 'Dog' },
  { value: 'CAT', label: 'Cat' },
  { value: 'RABBIT', label: 'Rabbit' },
  { value: 'BIRD', label: 'Bird' },
  { value: 'OTHER', label: 'Other' },
];

export const PET_SEX = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

export const AGE_GROUPS = [
  { value: 'PUPPY', label: 'Puppy / Kitten (< 1 yr)' },
  { value: 'YOUNG', label: 'Young (1–3 yrs)' },
  { value: 'ADULT', label: 'Adult (3–7 yrs)' },
  { value: 'SENIOR', label: 'Senior (7+ yrs)' },
];

export const WEIGHT_RANGES = [
  { value: 'TOY', label: 'Toy (< 5 kg)' },
  { value: 'SMALL', label: 'Small (5–10 kg)' },
  { value: 'MEDIUM', label: 'Medium (10–25 kg)' },
  { value: 'LARGE', label: 'Large (25–40 kg)' },
  { value: 'GIANT', label: 'Giant (40+ kg)' },
];

export const VACCINATION_STATUS = [
  { value: 'UP_TO_DATE', label: 'Up to date' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'NONE', label: 'Not vaccinated' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

export const BOOKING_STATUS_LABELS: Record<string, { label: string; tone: 'info' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  PENDING: { label: 'Awaiting provider', tone: 'warning' },
  ACCEPTED: { label: 'Confirmed', tone: 'success' },
  REJECTED: { label: 'Declined', tone: 'danger' },
  IN_PROGRESS: { label: 'In progress', tone: 'info' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
};
