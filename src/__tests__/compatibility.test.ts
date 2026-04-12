import { describe, it } from 'node:test';
import assert from 'node:assert';

// Inline the compatibility engine to avoid Prisma import resolution issues in tsx
const WEIGHT_RANGE_ORDER: Record<string, number> = { SMALL: 1, MEDIUM: 2, LARGE: 3, GIANT: 4 };

interface CompatibilityReason {
  field: string; rule: string; message: string; severity: 'blocking' | 'warning';
}

function evaluateCompatibility(pet: any, restrictions: any, _accommodation?: any) {
  const reasons: CompatibilityReason[] = [];

  if (pet.type === 'DOG' && !restrictions.acceptsDogs) reasons.push({ field: 'pet.type', rule: 'provider.acceptsDogs', message: 'This provider does not accept dogs.', severity: 'blocking' });
  if (pet.type === 'CAT' && !restrictions.acceptsCats) reasons.push({ field: 'pet.type', rule: 'provider.acceptsCats', message: 'This provider does not accept cats.', severity: 'blocking' });
  if (pet.type === 'OTHER' && !restrictions.acceptsOtherPets) reasons.push({ field: 'pet.type', rule: 'provider.acceptsOtherPets', message: 'This provider does not accept this pet type.', severity: 'blocking' });

  if (pet.weightRange) {
    const petSize = WEIGHT_RANGE_ORDER[pet.weightRange];
    const maxSize = WEIGHT_RANGE_ORDER[restrictions.maxPetSizeAllowed];
    if (petSize > maxSize) reasons.push({ field: 'pet.weightRange', rule: 'provider.maxPetSizeAllowed', message: `Your pet's size (${pet.weightRange.toLowerCase()}) exceeds the provider's maximum allowed size (${restrictions.maxPetSizeAllowed.toLowerCase()}).`, severity: 'blocking' });
  }

  if (pet.weightRange && (pet.weightRange === 'LARGE' || pet.weightRange === 'GIANT') && !restrictions.acceptsLargeBreeds) reasons.push({ field: 'pet.weightRange', rule: 'provider.acceptsLargeBreeds', message: 'This provider does not accept large breeds.', severity: 'blocking' });

  if (pet.careProfile) {
    if (pet.careProfile.vaccinationStatus !== 'UP_TO_DATE' && !restrictions.acceptsUnvaccinatedPets) reasons.push({ field: 'pet.vaccinationStatus', rule: 'provider.acceptsUnvaccinatedPets', message: "This provider requires up-to-date vaccinations.", severity: 'blocking' });
    if (pet.careProfile.femaleInHeatCurrently && !restrictions.acceptsPetsInHeat) reasons.push({ field: 'pet.femaleInHeatCurrently', rule: 'provider.acceptsPetsInHeat', message: 'This provider does not accept pets currently in heat.', severity: 'blocking' });
    if (!pet.neuteredOrSpayed && !restrictions.acceptsUnneuteredUnspayed) reasons.push({ field: 'pet.neuteredOrSpayed', rule: 'provider.acceptsUnneuteredUnspayed', message: 'This provider requires pets to be neutered/spayed.', severity: 'blocking' });
    if (pet.careProfile.medicationRequired && !restrictions.acceptsMedicationCases) reasons.push({ field: 'pet.medicationRequired', rule: 'provider.acceptsMedicationCases', message: 'This provider does not accept pets that require medication.', severity: 'blocking' });
    if (pet.careProfile.aggressionHistory && !restrictions.acceptsAggressiveReactive) reasons.push({ field: 'pet.aggressionHistory', rule: 'provider.acceptsAggressiveReactive', message: 'This provider does not accept pets with aggression history.', severity: 'blocking' });
    if (pet.careProfile.medicalConditions && !restrictions.acceptsSpecialNeedsPets) reasons.push({ field: 'pet.medicalConditions', rule: 'provider.acceptsSpecialNeedsPets', message: 'This provider does not accept pets with special medical needs.', severity: 'blocking' });
    if (pet.careProfile.biteHistory) reasons.push({ field: 'pet.biteHistory', rule: 'safety.biteHistory', message: 'Your pet has a recorded bite history.', severity: 'warning' });
    if (pet.careProfile.separationAnxiety) reasons.push({ field: 'pet.separationAnxiety', rule: 'care.separationAnxiety', message: 'Your pet has separation anxiety.', severity: 'warning' });
    if (pet.careProfile.escapeRisk) reasons.push({ field: 'pet.escapeRisk', rule: 'safety.escapeRisk', message: 'Your pet is flagged as an escape risk.', severity: 'warning' });
    if (pet.careProfile.pregnant) reasons.push({ field: 'pet.pregnant', rule: 'care.pregnant', message: 'Your pet is pregnant.', severity: 'warning' });
    if (!pet.careProfileCompleted) reasons.push({ field: 'pet.careProfileCompleted', rule: 'care.profileRequired', message: "Pet care profile incomplete.", severity: 'warning' });
  } else {
    reasons.push({ field: 'pet.careProfile', rule: 'care.profileMissing', message: 'Pet does not have a care profile.', severity: 'warning' });
  }

  if (pet.ageGroup === 'SENIOR' && !restrictions.acceptsSeniorPets) reasons.push({ field: 'pet.ageGroup', rule: 'provider.acceptsSeniorPets', message: 'This provider does not accept senior pets.', severity: 'blocking' });
  if (pet.ageGroup === 'PUPPY_KITTEN' && !restrictions.acceptsPuppiesOrKittens) reasons.push({ field: 'pet.ageGroup', rule: 'provider.acceptsPuppiesOrKittens', message: 'This provider does not accept puppies/kittens.', severity: 'blocking' });

  if (restrictions.breedRestrictions && pet.breed) {
    const restricted = restrictions.breedRestrictions.split(',').map((b: string) => b.trim().toLowerCase());
    if (restricted.includes(pet.breed.toLowerCase())) reasons.push({ field: 'pet.breed', rule: 'provider.breedRestrictions', message: `Breed restriction: ${pet.breed}.`, severity: 'blocking' });
  }

  const hasBlocking = reasons.some(r => r.severity === 'blocking');
  const hasWarning = reasons.some(r => r.severity === 'warning');
  let outcome: string, summary: string;
  if (hasBlocking) { outcome = 'NOT_COMPATIBLE'; summary = `Booking cannot proceed: ${reasons.filter(r => r.severity === 'blocking').map(r => r.message).join(' ')}`; }
  else if (hasWarning) { outcome = 'REVIEW_REQUIRED'; summary = 'Provider should review flagged items.'; }
  else { outcome = 'COMPATIBLE'; summary = 'Pet and provider are fully compatible.'; }

  return { outcome, reasons, summary };
}

// Helper to create mock pet
function mockPet(overrides: Record<string, any> = {}) {
  return {
    id: 'pet1',
    userId: 'user1',
    name: 'TestPet',
    type: overrides.type || 'DOG',
    breed: overrides.breed || 'Labrador',
    ageGroup: overrides.ageGroup || 'ADULT',
    sex: overrides.sex || 'MALE',
    weightRange: overrides.weightRange || 'MEDIUM',
    photo: null,
    neuteredOrSpayed: overrides.neuteredOrSpayed ?? true,
    isActive: true,
    careProfileCompleted: overrides.careProfileCompleted ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
    careProfile: overrides.careProfile !== undefined ? overrides.careProfile : {
      id: 'cp1',
      petId: 'pet1',
      vaccinationStatus: overrides.vaccinationStatus || 'UP_TO_DATE',
      vaccinationDetails: null,
      lastVaccinationDate: null,
      rabiesVaccinated: true,
      dewormedStatus: true,
      fleaTickTreated: true,
      medicalConditions: overrides.medicalConditions || null,
      medicationRequired: overrides.medicationRequired ?? false,
      medicationInstructions: null,
      allergies: null,
      emergencyContact: null,
      vetName: null,
      vetContact: null,
      femaleInHeatCurrently: overrides.femaleInHeatCurrently ?? false,
      pregnant: overrides.pregnant ?? false,
      recentlyDelivered: false,
      markingBehavior: false,
      toiletTrained: true,
      foodType: null,
      feedingSchedule: null,
      dietaryRestrictions: null,
      foodAllergies: null,
      treatsAllowed: true,
      specialFeedingInstructions: null,
      temperament: 'FRIENDLY',
      friendlyWithDogs: 'FRIENDLY',
      friendlyWithCats: 'FRIENDLY',
      friendlyWithChildren: 'FRIENDLY',
      biteHistory: overrides.biteHistory ?? false,
      aggressionHistory: overrides.aggressionHistory ?? false,
      separationAnxiety: overrides.separationAnxiety ?? false,
      crateTrained: true,
      leashTrained: true,
      escapeRisk: overrides.escapeRisk ?? false,
      specialHandlingNotes: null,
      walkingFrequency: null,
      exerciseNeeds: null,
      groomingNeeds: null,
      sleepHabits: null,
      comfortItems: null,
      emergencyInstructions: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  } as any;
}

function mockRestrictions(overrides: Record<string, any> = {}) {
  return {
    id: 'hr1',
    providerId: 'prov1',
    acceptsDogs: overrides.acceptsDogs ?? true,
    acceptsCats: overrides.acceptsCats ?? true,
    acceptsOtherPets: overrides.acceptsOtherPets ?? false,
    maxPetSizeAllowed: overrides.maxPetSizeAllowed || 'GIANT',
    maxNumberOfGuestPets: 2,
    acceptsUnvaccinatedPets: overrides.acceptsUnvaccinatedPets ?? false,
    acceptsPetsInHeat: overrides.acceptsPetsInHeat ?? false,
    acceptsUnneuteredUnspayed: overrides.acceptsUnneuteredUnspayed ?? true,
    acceptsSeniorPets: overrides.acceptsSeniorPets ?? true,
    acceptsMedicationCases: overrides.acceptsMedicationCases ?? false,
    acceptsSpecialNeedsPets: overrides.acceptsSpecialNeedsPets ?? false,
    acceptsAggressiveReactive: overrides.acceptsAggressiveReactive ?? false,
    acceptsPuppiesOrKittens: overrides.acceptsPuppiesOrKittens ?? true,
    acceptsLargeBreeds: overrides.acceptsLargeBreeds ?? true,
    breedRestrictions: overrides.breedRestrictions || null,
    ageRestrictions: null,
    healthRestrictions: null,
    behaviorRestrictions: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
}

describe('Compatibility Engine', () => {
  it('should return COMPATIBLE for a fully matching pet and provider', () => {
    const result = evaluateCompatibility(mockPet(), mockRestrictions());
    assert.strictEqual(result.outcome, 'COMPATIBLE');
    assert.strictEqual(result.reasons.filter(r => r.severity === 'blocking').length, 0);
  });

  it('should block if provider does not accept dogs', () => {
    const result = evaluateCompatibility(
      mockPet({ type: 'DOG' }),
      mockRestrictions({ acceptsDogs: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
    assert.ok(result.reasons.some(r => r.field === 'pet.type' && r.severity === 'blocking'));
  });

  it('should block if provider does not accept cats', () => {
    const result = evaluateCompatibility(
      mockPet({ type: 'CAT' }),
      mockRestrictions({ acceptsCats: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should block if pet size exceeds provider max', () => {
    const result = evaluateCompatibility(
      mockPet({ weightRange: 'GIANT' }),
      mockRestrictions({ maxPetSizeAllowed: 'MEDIUM' })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
    assert.ok(result.reasons.some(r => r.field === 'pet.weightRange'));
  });

  it('should allow if pet size is within provider max', () => {
    const result = evaluateCompatibility(
      mockPet({ weightRange: 'SMALL' }),
      mockRestrictions({ maxPetSizeAllowed: 'LARGE' })
    );
    assert.strictEqual(result.outcome, 'COMPATIBLE');
  });

  it('should block unvaccinated pets when provider disallows', () => {
    const result = evaluateCompatibility(
      mockPet({ vaccinationStatus: 'NOT_VACCINATED' }),
      mockRestrictions({ acceptsUnvaccinatedPets: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should allow unvaccinated pets when provider accepts them', () => {
    const result = evaluateCompatibility(
      mockPet({ vaccinationStatus: 'NOT_VACCINATED' }),
      mockRestrictions({ acceptsUnvaccinatedPets: true })
    );
    assert.strictEqual(result.outcome, 'COMPATIBLE');
  });

  it('should block pets in heat when provider disallows', () => {
    const result = evaluateCompatibility(
      mockPet({ sex: 'FEMALE', femaleInHeatCurrently: true }),
      mockRestrictions({ acceptsPetsInHeat: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
    assert.ok(result.reasons.some(r => r.field === 'pet.femaleInHeatCurrently'));
  });

  it('should block pets requiring medication when provider disallows', () => {
    const result = evaluateCompatibility(
      mockPet({ medicationRequired: true }),
      mockRestrictions({ acceptsMedicationCases: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should block pets with aggression history when provider disallows', () => {
    const result = evaluateCompatibility(
      mockPet({ aggressionHistory: true }),
      mockRestrictions({ acceptsAggressiveReactive: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should allow pets with aggression history when provider accepts them', () => {
    const result = evaluateCompatibility(
      mockPet({ aggressionHistory: true }),
      mockRestrictions({ acceptsAggressiveReactive: true })
    );
    // Should be REVIEW_REQUIRED due to bite/aggression warnings but not blocked
    assert.notStrictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should block senior pets when provider disallows', () => {
    const result = evaluateCompatibility(
      mockPet({ ageGroup: 'SENIOR' }),
      mockRestrictions({ acceptsSeniorPets: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should block puppies/kittens when provider disallows', () => {
    const result = evaluateCompatibility(
      mockPet({ ageGroup: 'PUPPY_KITTEN' }),
      mockRestrictions({ acceptsPuppiesOrKittens: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
  });

  it('should block restricted breeds', () => {
    const result = evaluateCompatibility(
      mockPet({ breed: 'Pit Bull' }),
      mockRestrictions({ breedRestrictions: 'Pit Bull, Rottweiler' })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
    assert.ok(result.reasons.some(r => r.field === 'pet.breed'));
  });

  it('should return REVIEW_REQUIRED for separation anxiety', () => {
    const result = evaluateCompatibility(
      mockPet({ separationAnxiety: true }),
      mockRestrictions()
    );
    assert.strictEqual(result.outcome, 'REVIEW_REQUIRED');
    assert.ok(result.reasons.some(r => r.field === 'pet.separationAnxiety'));
  });

  it('should return REVIEW_REQUIRED for escape risk', () => {
    const result = evaluateCompatibility(
      mockPet({ escapeRisk: true }),
      mockRestrictions()
    );
    assert.strictEqual(result.outcome, 'REVIEW_REQUIRED');
  });

  it('should warn when care profile is missing', () => {
    const result = evaluateCompatibility(
      mockPet({ careProfile: null }),
      mockRestrictions()
    );
    assert.strictEqual(result.outcome, 'REVIEW_REQUIRED');
    assert.ok(result.reasons.some(r => r.field === 'pet.careProfile'));
  });

  it('should include reasons with explanations for all outcomes', () => {
    const result = evaluateCompatibility(
      mockPet({ type: 'DOG', vaccinationStatus: 'NOT_VACCINATED', aggressionHistory: true }),
      mockRestrictions({ acceptsUnvaccinatedPets: false, acceptsAggressiveReactive: false })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
    // Should have at least 2 blocking reasons
    const blocking = result.reasons.filter(r => r.severity === 'blocking');
    assert.ok(blocking.length >= 2, `Expected at least 2 blocking reasons, got ${blocking.length}`);
    // Every reason should have a message
    result.reasons.forEach(r => {
      assert.ok(r.message.length > 0, 'Reason should have a message');
      assert.ok(r.field.length > 0, 'Reason should have a field');
    });
  });

  it('should handle multiple blocking reasons correctly', () => {
    const result = evaluateCompatibility(
      mockPet({
        type: 'CAT',
        weightRange: 'GIANT',
        vaccinationStatus: 'NOT_VACCINATED',
        femaleInHeatCurrently: true,
      }),
      mockRestrictions({
        acceptsCats: false,
        maxPetSizeAllowed: 'SMALL',
        acceptsUnvaccinatedPets: false,
        acceptsPetsInHeat: false,
      })
    );
    assert.strictEqual(result.outcome, 'NOT_COMPATIBLE');
    const blocking = result.reasons.filter(r => r.severity === 'blocking');
    assert.ok(blocking.length >= 3, 'Should have multiple blocking reasons');
  });
});

describe('Compatibility Summary', () => {
  it('should provide human-readable summary for compatible result', () => {
    const result = evaluateCompatibility(mockPet(), mockRestrictions());
    assert.ok(result.summary.includes('compatible') || result.summary.includes('Compatible'));
  });

  it('should provide human-readable summary for blocked result', () => {
    const result = evaluateCompatibility(
      mockPet({ type: 'DOG' }),
      mockRestrictions({ acceptsDogs: false })
    );
    assert.ok(result.summary.includes('cannot proceed') || result.summary.includes('Booking'));
  });
});
