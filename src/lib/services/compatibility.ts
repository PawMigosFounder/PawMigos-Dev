// Deterministic Compatibility Engine
// Evaluates pet attributes against provider hosting restrictions.
// Returns structured result with blocking/warning reasons.

import { WEIGHT_RANGE_ORDER } from '../constants';
import type {
  Pet,
  PetCareProfile,
  HostingRestrictions,
  AccommodationProfile,
} from '@/generated/prisma/client';
import { CompatibilityOutcome } from '@/generated/prisma/client';

export interface CompatibilityReason {
  field: string;
  rule: string;
  message: string;
  severity: 'blocking' | 'warning';
}

export interface CompatibilityResult {
  outcome: CompatibilityOutcome;
  reasons: CompatibilityReason[];
  summary: string;
}

type PetWithCare = Pet & { careProfile: PetCareProfile | null };

export function evaluateCompatibility(
  pet: PetWithCare,
  restrictions: HostingRestrictions,
  _accommodation?: AccommodationProfile | null
): CompatibilityResult {
  const reasons: CompatibilityReason[] = [];

  // --- BLOCKING CHECKS ---

  // 1. Pet type acceptance
  if (pet.type === 'DOG' && !restrictions.acceptsDogs) {
    reasons.push({
      field: 'pet.type',
      rule: 'provider.acceptsDogs',
      message: 'This provider does not accept dogs.',
      severity: 'blocking',
    });
  }
  if (pet.type === 'CAT' && !restrictions.acceptsCats) {
    reasons.push({
      field: 'pet.type',
      rule: 'provider.acceptsCats',
      message: 'This provider does not accept cats.',
      severity: 'blocking',
    });
  }
  if (pet.type === 'OTHER' && !restrictions.acceptsOtherPets) {
    reasons.push({
      field: 'pet.type',
      rule: 'provider.acceptsOtherPets',
      message: 'This provider does not accept this pet type.',
      severity: 'blocking',
    });
  }

  // 2. Pet size check
  if (pet.weightRange) {
    const petSize = WEIGHT_RANGE_ORDER[pet.weightRange];
    const maxSize = WEIGHT_RANGE_ORDER[restrictions.maxPetSizeAllowed];
    if (petSize > maxSize) {
      reasons.push({
        field: 'pet.weightRange',
        rule: 'provider.maxPetSizeAllowed',
        message: `Your pet's size (${pet.weightRange.toLowerCase()}) exceeds the provider's maximum allowed size (${restrictions.maxPetSizeAllowed.toLowerCase()}).`,
        severity: 'blocking',
      });
    }
  }

  // 3. Large breed check
  if (pet.weightRange && (pet.weightRange === 'LARGE' || pet.weightRange === 'GIANT') && !restrictions.acceptsLargeBreeds) {
    reasons.push({
      field: 'pet.weightRange',
      rule: 'provider.acceptsLargeBreeds',
      message: 'This provider does not accept large breeds.',
      severity: 'blocking',
    });
  }

  // 4. Vaccination check
  if (pet.careProfile) {
    if (
      pet.careProfile.vaccinationStatus !== 'UP_TO_DATE' &&
      !restrictions.acceptsUnvaccinatedPets
    ) {
      reasons.push({
        field: 'pet.vaccinationStatus',
        rule: 'provider.acceptsUnvaccinatedPets',
        message: 'This provider requires up-to-date vaccinations. Your pet\'s vaccination status does not meet the requirement.',
        severity: 'blocking',
      });
    }

    // 5. Heat status
    if (pet.careProfile.femaleInHeatCurrently && !restrictions.acceptsPetsInHeat) {
      reasons.push({
        field: 'pet.femaleInHeatCurrently',
        rule: 'provider.acceptsPetsInHeat',
        message: 'This provider does not accept pets currently in heat.',
        severity: 'blocking',
      });
    }

    // 6. Neutered/spayed status
    if (!pet.neuteredOrSpayed && !restrictions.acceptsUnneuteredUnspayed) {
      reasons.push({
        field: 'pet.neuteredOrSpayed',
        rule: 'provider.acceptsUnneuteredUnspayed',
        message: 'This provider requires pets to be neutered/spayed.',
        severity: 'blocking',
      });
    }

    // 7. Medication check
    if (pet.careProfile.medicationRequired && !restrictions.acceptsMedicationCases) {
      reasons.push({
        field: 'pet.medicationRequired',
        rule: 'provider.acceptsMedicationCases',
        message: 'This provider does not accept pets that require medication.',
        severity: 'blocking',
      });
    }

    // 8. Aggression check
    if (pet.careProfile.aggressionHistory && !restrictions.acceptsAggressiveReactive) {
      reasons.push({
        field: 'pet.aggressionHistory',
        rule: 'provider.acceptsAggressiveReactive',
        message: 'This provider does not accept pets with aggression history.',
        severity: 'blocking',
      });
    }

    // 9. Special needs check
    if (pet.careProfile.medicalConditions && !restrictions.acceptsSpecialNeedsPets) {
      reasons.push({
        field: 'pet.medicalConditions',
        rule: 'provider.acceptsSpecialNeedsPets',
        message: 'This provider does not accept pets with special medical needs.',
        severity: 'blocking',
      });
    }
  }

  // 10. Senior pet check
  if (pet.ageGroup === 'SENIOR' && !restrictions.acceptsSeniorPets) {
    reasons.push({
      field: 'pet.ageGroup',
      rule: 'provider.acceptsSeniorPets',
      message: 'This provider does not accept senior pets.',
      severity: 'blocking',
    });
  }

  // 11. Puppy/kitten check
  if (pet.ageGroup === 'PUPPY_KITTEN' && !restrictions.acceptsPuppiesOrKittens) {
    reasons.push({
      field: 'pet.ageGroup',
      rule: 'provider.acceptsPuppiesOrKittens',
      message: 'This provider does not accept puppies/kittens.',
      severity: 'blocking',
    });
  }

  // 12. Breed restrictions
  if (restrictions.breedRestrictions && pet.breed) {
    const restricted = restrictions.breedRestrictions
      .split(',')
      .map((b) => b.trim().toLowerCase());
    if (restricted.includes(pet.breed.toLowerCase())) {
      reasons.push({
        field: 'pet.breed',
        rule: 'provider.breedRestrictions',
        message: `This provider has a restriction for the breed: ${pet.breed}.`,
        severity: 'blocking',
      });
    }
  }

  // --- WARNING CHECKS ---

  if (pet.careProfile) {
    // Bite history — warning, not blocking (unless provider specifically blocks)
    if (pet.careProfile.biteHistory) {
      reasons.push({
        field: 'pet.biteHistory',
        rule: 'safety.biteHistory',
        message: 'Your pet has a recorded bite history. The provider will be notified for review.',
        severity: 'warning',
      });
    }

    // Separation anxiety — warning
    if (pet.careProfile.separationAnxiety) {
      reasons.push({
        field: 'pet.separationAnxiety',
        rule: 'care.separationAnxiety',
        message: 'Your pet has separation anxiety. The provider should be aware.',
        severity: 'warning',
      });
    }

    // Escape risk — warning
    if (pet.careProfile.escapeRisk) {
      reasons.push({
        field: 'pet.escapeRisk',
        rule: 'safety.escapeRisk',
        message: 'Your pet is flagged as an escape risk. Please confirm the provider has a secured area.',
        severity: 'warning',
      });
    }

    // Pregnant — warning
    if (pet.careProfile.pregnant) {
      reasons.push({
        field: 'pet.pregnant',
        rule: 'care.pregnant',
        message: 'Your pet is pregnant. Please ensure the provider can accommodate special care needs.',
        severity: 'warning',
      });
    }

    // No care profile completed — warning for relevant services
    if (!pet.careProfileCompleted) {
      reasons.push({
        field: 'pet.careProfileCompleted',
        rule: 'care.profileRequired',
        message: 'Your pet\'s care profile is incomplete. Please complete it before booking boarding/sitting services.',
        severity: 'warning',
      });
    }
  } else {
    // No care profile at all — warning
    reasons.push({
      field: 'pet.careProfile',
      rule: 'care.profileMissing',
      message: 'Your pet does not have a care profile. This is required for boarding/sitting services.',
      severity: 'warning',
    });
  }

  // Determine outcome
  const hasBlocking = reasons.some((r) => r.severity === 'blocking');
  const hasWarning = reasons.some((r) => r.severity === 'warning');

  let outcome: CompatibilityOutcome;
  let summary: string;

  if (hasBlocking) {
    outcome = CompatibilityOutcome.NOT_COMPATIBLE;
    const blockingReasons = reasons.filter((r) => r.severity === 'blocking');
    summary = `Booking cannot proceed: ${blockingReasons.map((r) => r.message).join(' ')}`;
  } else if (hasWarning) {
    outcome = CompatibilityOutcome.REVIEW_REQUIRED;
    summary = 'Booking can proceed but the provider should review flagged items before accepting.';
  } else {
    outcome = CompatibilityOutcome.COMPATIBLE;
    summary = 'Pet and provider are fully compatible. Booking can proceed.';
  }

  return { outcome, reasons, summary };
}
