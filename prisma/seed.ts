import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// Decode the direct database URL from the prisma+postgres:// connection string
const apiKey = new URL(process.env.DATABASE_URL!).searchParams.get('api_key')!;
const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString());
const directUrl = decoded.databaseUrl;

const adapter = new PrismaPg(directUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.adminAuditLog.deleteMany();
  await prisma.communityComment.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.hostingRestrictions.deleteMany();
  await prisma.accommodationProfile.deleteMany();
  await prisma.verificationRecord.deleteMany();
  await prisma.petCareProfile.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.otpRecord.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // USERS
  // ============================================================

  const consumer1 = await prisma.user.create({
    data: {
      phone: '9876543210',
      name: 'Priya Sharma',
      city: 'Mumbai',
      role: 'CONSUMER',
      onboardingIntent: 'HAS_PET',
      onboardingCompleted: true,
    },
  });

  const consumer2 = await prisma.user.create({
    data: {
      phone: '9876543211',
      name: 'Arjun Patel',
      city: 'Bangalore',
      role: 'CONSUMER',
      onboardingIntent: 'HAS_PET',
      onboardingCompleted: true,
    },
  });

  const consumer3 = await prisma.user.create({
    data: {
      phone: '9876543212',
      name: 'Kavya Reddy',
      city: 'Hyderabad',
      role: 'CONSUMER',
      onboardingIntent: 'EXPLORING',
      onboardingCompleted: true,
    },
  });

  const providerUser1 = await prisma.user.create({
    data: {
      phone: '9876543220',
      name: 'Rahul Menon',
      city: 'Mumbai',
      role: 'PROVIDER',
      onboardingCompleted: true,
    },
  });

  const providerUser2 = await prisma.user.create({
    data: {
      phone: '9876543221',
      name: 'Sneha Iyer',
      city: 'Bangalore',
      role: 'PROVIDER',
      onboardingCompleted: true,
    },
  });

  const providerUser3 = await prisma.user.create({
    data: {
      phone: '9876543222',
      name: 'Vikram Singh',
      city: 'Mumbai',
      role: 'PROVIDER',
      onboardingCompleted: true,
    },
  });

  const providerUser4 = await prisma.user.create({
    data: {
      phone: '9876543223',
      name: 'Anjali Desai',
      city: 'Pune',
      role: 'PROVIDER',
      onboardingCompleted: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      phone: '9999999999',
      name: 'PawMigos Admin',
      city: 'Mumbai',
      role: 'ADMIN',
      onboardingCompleted: true,
    },
  });

  // ============================================================
  // PETS
  // ============================================================

  const pet1 = await prisma.pet.create({
    data: {
      userId: consumer1.id,
      name: 'Bruno',
      type: 'DOG',
      breed: 'Golden Retriever',
      ageGroup: 'ADULT',
      sex: 'MALE',
      weightRange: 'LARGE',
      neuteredOrSpayed: true,
      careProfileCompleted: true,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      userId: consumer1.id,
      name: 'Whiskers',
      type: 'CAT',
      breed: 'Persian',
      ageGroup: 'YOUNG',
      sex: 'FEMALE',
      weightRange: 'SMALL',
      neuteredOrSpayed: true,
      careProfileCompleted: true,
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      userId: consumer2.id,
      name: 'Rocky',
      type: 'DOG',
      breed: 'German Shepherd',
      ageGroup: 'ADULT',
      sex: 'MALE',
      weightRange: 'LARGE',
      neuteredOrSpayed: false,
      careProfileCompleted: true,
    },
  });

  const pet4 = await prisma.pet.create({
    data: {
      userId: consumer2.id,
      name: 'Luna',
      type: 'DOG',
      breed: 'Labrador',
      ageGroup: 'PUPPY_KITTEN',
      sex: 'FEMALE',
      weightRange: 'MEDIUM',
      neuteredOrSpayed: false,
      careProfileCompleted: false,
    },
  });

  // Pet care profiles
  await prisma.petCareProfile.create({
    data: {
      petId: pet1.id,
      vaccinationStatus: 'UP_TO_DATE',
      vaccinationDetails: 'DHPP, Rabies, Bordetella - all current',
      rabiesVaccinated: true,
      dewormedStatus: true,
      fleaTickTreated: true,
      medicationRequired: false,
      emergencyContact: '9876543299',
      toiletTrained: true,
      foodType: 'DRY_KIBBLE',
      feedingSchedule: 'TWICE_DAILY',
      treatsAllowed: true,
      temperament: 'FRIENDLY',
      friendlyWithDogs: 'VERY_FRIENDLY',
      friendlyWithCats: 'FRIENDLY',
      friendlyWithChildren: 'VERY_FRIENDLY',
      biteHistory: false,
      aggressionHistory: false,
      separationAnxiety: false,
      crateTrained: true,
      leashTrained: true,
      escapeRisk: false,
      exerciseNeeds: 'HIGH',
      comfortItems: 'Blue blanket, squeaky ball',
    },
  });

  await prisma.petCareProfile.create({
    data: {
      petId: pet2.id,
      vaccinationStatus: 'UP_TO_DATE',
      rabiesVaccinated: true,
      dewormedStatus: true,
      fleaTickTreated: true,
      femaleInHeatCurrently: false,
      toiletTrained: true,
      foodType: 'WET_FOOD',
      feedingSchedule: 'TWICE_DAILY',
      temperament: 'CALM',
      friendlyWithDogs: 'CAUTIOUS',
      friendlyWithCats: 'FRIENDLY',
      friendlyWithChildren: 'NEUTRAL',
      biteHistory: false,
      aggressionHistory: false,
      separationAnxiety: true,
      exerciseNeeds: 'LOW',
    },
  });

  await prisma.petCareProfile.create({
    data: {
      petId: pet3.id,
      vaccinationStatus: 'UP_TO_DATE',
      rabiesVaccinated: true,
      dewormedStatus: true,
      fleaTickTreated: false,
      medicationRequired: true,
      medicationInstructions: 'Joint supplement - 1 tablet with breakfast',
      medicalConditions: 'Mild hip dysplasia',
      emergencyContact: '9876543298',
      toiletTrained: true,
      foodType: 'MIXED',
      feedingSchedule: 'TWICE_DAILY',
      temperament: 'ENERGETIC',
      friendlyWithDogs: 'FRIENDLY',
      friendlyWithCats: 'NOT_FRIENDLY',
      friendlyWithChildren: 'CAUTIOUS',
      biteHistory: false,
      aggressionHistory: true,
      leashTrained: true,
      escapeRisk: true,
      exerciseNeeds: 'VERY_HIGH',
      specialHandlingNotes: 'Can be reactive to unfamiliar dogs on first meeting. Needs slow introduction.',
    },
  });

  // ============================================================
  // PROVIDERS
  // ============================================================

  const provider1 = await prisma.provider.create({
    data: {
      userId: providerUser1.id,
      name: 'Rahul Menon',
      businessName: 'PawHaven Home Boarding',
      city: 'Mumbai',
      phone: '9876543220',
      description: 'Experienced home boarder with 5 years of caring for dogs. Safe, loving environment with a large garden.',
      experience: '5 years professional pet care',
      categories: ['BOARDING', 'SITTING'],
      onboardingState: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      isActive: true,
      hostingProfileCompleted: true,
      totalCompletedBookings: 23,
      averageRating: 4.7,
      reviewCount: 15,
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      userId: providerUser2.id,
      name: 'Sneha Iyer',
      businessName: 'Paws & Claws Grooming',
      city: 'Bangalore',
      phone: '9876543221',
      description: 'Professional grooming services for all breeds. Gentle handling, premium products.',
      experience: '8 years grooming experience',
      categories: ['GROOMING'],
      onboardingState: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      isActive: true,
      totalCompletedBookings: 45,
      averageRating: 4.9,
      reviewCount: 30,
    },
  });

  const provider3 = await prisma.provider.create({
    data: {
      userId: providerUser3.id,
      name: 'Vikram Singh',
      businessName: 'DogFit Training',
      city: 'Mumbai',
      phone: '9876543222',
      description: 'Certified dog trainer specializing in obedience and behavior modification.',
      experience: '10 years with 500+ dogs trained',
      categories: ['TRAINING', 'WALKING'],
      onboardingState: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      isActive: true,
      totalCompletedBookings: 67,
      averageRating: 4.8,
      reviewCount: 42,
    },
  });

  const provider4 = await prisma.provider.create({
    data: {
      userId: providerUser4.id,
      name: 'Anjali Desai',
      city: 'Pune',
      phone: '9876543223',
      description: 'Home-based pet sitter. Treats your pets like family.',
      categories: ['SITTING', 'BOARDING', 'WALKING'],
      onboardingState: 'PENDING_VERIFICATION',
      verificationStatus: 'PENDING',
      isActive: false,
      totalCompletedBookings: 0,
    },
  });

  // ============================================================
  // SERVICES
  // ============================================================

  const service1 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      category: 'BOARDING',
      title: 'Overnight Boarding',
      description: 'Full-day and overnight boarding in a home environment',
      price: 800,
      serviceType: 'AT_PROVIDER',
    },
  });

  const service2 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      category: 'SITTING',
      title: 'Day Care Sitting',
      description: 'Drop off your pet for the day while you work',
      price: 500,
      serviceType: 'AT_PROVIDER',
    },
  });

  const service3 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      category: 'GROOMING',
      title: 'Full Grooming Package',
      description: 'Bath, haircut, nail trim, ear cleaning, teeth brushing',
      price: 1200,
      serviceType: 'AT_PROVIDER',
    },
  });

  const service4 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      category: 'GROOMING',
      title: 'Bath & Brush',
      description: 'Basic bath with brushing and blow dry',
      price: 600,
      serviceType: 'AT_PROVIDER',
    },
  });

  const service5 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      category: 'TRAINING',
      title: 'Basic Obedience (4 sessions)',
      description: 'Sit, stay, come, heel - foundational commands',
      price: 3000,
      serviceType: 'OUTDOOR',
    },
  });

  const service6 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      category: 'WALKING',
      title: 'Daily Walk (1 hour)',
      description: 'Energetic walk with play time in the park',
      price: 300,
      serviceType: 'OUTDOOR',
    },
  });

  // ============================================================
  // AVAILABILITY
  // ============================================================

  // Provider 1 - Mon-Sat
  for (let day = 1; day <= 6; day++) {
    await prisma.availability.create({
      data: { providerId: provider1.id, dayOfWeek: day, startTime: '08:00', endTime: '20:00' },
    });
  }

  // Provider 2 - Mon-Fri
  for (let day = 1; day <= 5; day++) {
    await prisma.availability.create({
      data: { providerId: provider2.id, dayOfWeek: day, startTime: '09:00', endTime: '18:00' },
    });
  }
  await prisma.availability.create({
    data: { providerId: provider2.id, dayOfWeek: 6, startTime: '10:00', endTime: '14:00' },
  });

  // Provider 3 - Mon-Sun
  for (let day = 0; day <= 6; day++) {
    await prisma.availability.create({
      data: { providerId: provider3.id, dayOfWeek: day, startTime: '06:00', endTime: '19:00' },
    });
  }

  // ============================================================
  // ACCOMMODATION & RESTRICTIONS (Provider 1)
  // ============================================================

  await prisma.accommodationProfile.create({
    data: {
      providerId: provider1.id,
      accommodationType: 'HOUSE',
      accommodationSize: 'LARGE',
      outdoorSpaceAvailable: true,
      fencedProperty: true,
      numberOfExistingPets: 2,
      existingPetTypes: 'Dog (Labrador), Cat',
      childrenInHome: false,
      elderlyInHome: false,
      vehicleAvailableForEmergency: true,
      emergencyVetAccess: true,
    },
  });

  await prisma.hostingRestrictions.create({
    data: {
      providerId: provider1.id,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      maxPetSizeAllowed: 'LARGE',
      maxNumberOfGuestPets: 2,
      acceptsUnvaccinatedPets: false,
      acceptsPetsInHeat: false,
      acceptsUnneuteredUnspayed: true,
      acceptsSeniorPets: true,
      acceptsMedicationCases: true,
      acceptsSpecialNeedsPets: false,
      acceptsAggressiveReactive: false,
      acceptsPuppiesOrKittens: true,
      acceptsLargeBreeds: true,
    },
  });

  // ============================================================
  // VERIFICATION RECORDS
  // ============================================================

  await prisma.verificationRecord.create({
    data: {
      providerId: provider1.id,
      vendorRefId: 'signzy_ref_001',
      verificationStatus: 'VERIFIED',
      maskedIdentifier: 'XXXX-XXXX-1234',
      faceMatchScore: 0.95,
      completedAt: new Date('2026-03-15'),
    },
  });

  await prisma.verificationRecord.create({
    data: {
      providerId: provider2.id,
      vendorRefId: 'signzy_ref_002',
      verificationStatus: 'VERIFIED',
      maskedIdentifier: 'XXXX-XXXX-5678',
      faceMatchScore: 0.92,
      completedAt: new Date('2026-03-10'),
    },
  });

  await prisma.verificationRecord.create({
    data: {
      providerId: provider3.id,
      vendorRefId: 'signzy_ref_003',
      verificationStatus: 'VERIFIED',
      maskedIdentifier: 'XXXX-XXXX-9012',
      faceMatchScore: 0.98,
      completedAt: new Date('2026-03-01'),
    },
  });

  // ============================================================
  // BOOKINGS
  // ============================================================

  const booking1 = await prisma.booking.create({
    data: {
      userId: consumer1.id,
      providerId: provider1.id,
      serviceId: service1.id,
      petId: pet1.id,
      date: new Date('2026-04-15'),
      startTime: '10:00',
      endTime: '10:00',
      status: 'COMPLETED',
      price: 800,
      paymentStatus: 'PAID',
      paymentMode: 'UPI',
      compatibilityResult: 'COMPATIBLE',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: consumer1.id,
      providerId: provider2.id,
      serviceId: service3.id,
      petId: pet1.id,
      date: new Date('2026-04-20'),
      startTime: '11:00',
      status: 'ACCEPTED',
      price: 1200,
      paymentStatus: 'PENDING',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: consumer2.id,
      providerId: provider3.id,
      serviceId: service5.id,
      petId: pet3.id,
      date: new Date('2026-04-18'),
      startTime: '07:00',
      status: 'COMPLETED',
      price: 3000,
      paymentStatus: 'PAID',
      paymentMode: 'CASH',
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      userId: consumer2.id,
      providerId: provider1.id,
      serviceId: service1.id,
      petId: pet3.id,
      date: new Date('2026-04-25'),
      startTime: '09:00',
      status: 'PENDING',
      price: 800,
      paymentStatus: 'PENDING',
      compatibilityResult: 'REVIEW_REQUIRED',
      compatibilityNotes: JSON.stringify({
        summary: 'Pet has aggression history. Provider should review.',
        reasons: [{ field: 'pet.aggressionHistory', message: 'Pet has recorded aggression history', severity: 'warning' }],
      }),
      providerResponseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const booking5 = await prisma.booking.create({
    data: {
      userId: consumer1.id,
      providerId: provider3.id,
      serviceId: service6.id,
      petId: pet1.id,
      date: new Date('2026-04-12'),
      startTime: '06:00',
      status: 'CANCELLED',
      price: 300,
      cancellationReason: 'Travel plans changed',
    },
  });

  // ============================================================
  // REVIEWS
  // ============================================================

  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      userId: consumer1.id,
      providerId: provider1.id,
      rating: 5,
      reviewText: 'Amazing experience! Bruno had a wonderful time. Rahul sent us photos and updates throughout the day. Will definitely book again.',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: booking3.id,
      userId: consumer2.id,
      providerId: provider3.id,
      rating: 4,
      reviewText: 'Great training sessions. Rocky learned a lot. Would have liked more detailed feedback notes.',
    },
  });

  // ============================================================
  // COMMUNITY POSTS
  // ============================================================

  const post1 = await prisma.communityPost.create({
    data: {
      userId: consumer1.id,
      content: 'Just got back from Bruno\'s first boarding experience with PawHaven and he was SO happy! 🐾 The home was clean, safe, and Rahul was super communicative. Highly recommend for Mumbai pet parents!',
      likes: 12,
    },
  });

  await prisma.communityPost.create({
    data: {
      userId: consumer2.id,
      content: 'Any recommendations for puppy-friendly groomers in Bangalore? Luna needs her first professional grooming and I want someone gentle with puppies.',
      likes: 5,
    },
  });

  await prisma.communityPost.create({
    data: {
      userId: providerUser2.id,
      content: 'Reminder for all pet parents: summer is coming! Make sure to keep your furry friends hydrated and avoid walks during peak heat hours (12-4 PM). Stay safe!',
      likes: 25,
    },
  });

  await prisma.communityComment.create({
    data: {
      postId: post1.id,
      userId: consumer2.id,
      content: 'That\'s great to hear! We\'re looking for boarding in Mumbai too.',
    },
  });

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  await prisma.notification.create({
    data: {
      userId: consumer1.id,
      type: 'BOOKING_ACCEPTED',
      title: 'Booking Accepted',
      message: 'Your grooming appointment with Paws & Claws has been accepted!',
      data: JSON.stringify({ bookingId: booking2.id }),
      isRead: false,
      sentAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: providerUser1.id,
      type: 'BOOKING_REQUESTED',
      title: 'New Booking Request',
      message: 'You have a new boarding request for Rocky (German Shepherd). Please respond within 24 hours.',
      data: JSON.stringify({ bookingId: booking4.id }),
      isRead: false,
      sentAt: new Date(),
    },
  });

  console.log('Seed data created successfully!');
  console.log(`
  Test accounts:
  - Consumer 1: 9876543210 (Priya, Mumbai - 2 pets)
  - Consumer 2: 9876543211 (Arjun, Bangalore - 2 pets)
  - Consumer 3: 9876543212 (Kavya, Hyderabad - exploring)
  - Provider 1: 9876543220 (Rahul, Mumbai - Boarding/Sitting, verified)
  - Provider 2: 9876543221 (Sneha, Bangalore - Grooming, verified)
  - Provider 3: 9876543222 (Vikram, Mumbai - Training/Walking, verified)
  - Provider 4: 9876543223 (Anjali, Pune - pending verification)
  - Admin:      9999999999

  Dev OTP: Check console output (any 6 digits in dev mode)
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
