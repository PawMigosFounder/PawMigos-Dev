// Service categories that require compatibility checks
export const COMPATIBILITY_REQUIRED_CATEGORIES = [
  'BOARDING',
  'SITTING',
] as const;

// Service categories that require hosting profile
export const HOSTING_PROFILE_REQUIRED_CATEGORIES = [
  'BOARDING',
  'SITTING',
] as const;

// Weight range ordering for size comparison
export const WEIGHT_RANGE_ORDER = {
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
  GIANT: 4,
} as const;

// Booking response SLA in hours
export const BOOKING_RESPONSE_SLA_HOURS = parseInt(
  process.env.BOOKING_RESPONSE_SLA_HOURS || '24'
);

// OTP settings
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5');
export const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');
export const OTP_LENGTH = 6;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// Brand colors
export const BRAND = {
  primary: '#F26F28',
  primaryDark: '#C47238',
  primaryLight: '#F0A86A',
  background: '#FAF3E3',
  backgroundDark: '#F5EBD9',
  text: '#2D2D2D',
  textLight: '#6B7280',
  white: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

// Cities supported in Phase 1
export const SUPPORTED_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Gurgaon',
  'Noida',
  'Goa',
] as const;
