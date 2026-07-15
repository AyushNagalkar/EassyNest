import { SeekerProfile, Property } from '@prisma/client';

/**
 * Rule-based compatibility scoring fallback.
 * Used when Gemini is unavailable or times out.
 * Produces scores on the same 0-100 scale as the LLM.
 */

interface ScoreResult {
  score: number;
  explanation: string;
}

/**
 * Score a tenant against a property listing.
 */
export function scoreSeekerVsProperty(
  seeker: SeekerProfile,
  property: Property & { amenities?: string[]; rules?: string[] },
): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Location (0-50 points)
  const cityMatch =
    seeker.preferredCity.toLowerCase().trim() === property.city.toLowerCase().trim();
  if (cityMatch) {
    score += 50;
    reasons.push('Same city');
  } else {
    score += 15;
    reasons.push('Different city (-35)');
  }

  // Budget fit (0-30 points)
  if (property.rent >= seeker.budgetMin && property.rent <= seeker.budgetMax) {
    const range = seeker.budgetMax - seeker.budgetMin;
    const midpoint = seeker.budgetMin + range / 2;
    const distFromMid = Math.abs(property.rent - midpoint);
    const fitRatio = 1 - distFromMid / (range / 2 || 1);
    const budgetScore = Math.round(30 * Math.max(fitRatio, 0.5));
    score += budgetScore;
    reasons.push(`Rent ₹${property.rent} within budget (₹${seeker.budgetMin}-₹${seeker.budgetMax})`);
  } else if (property.rent < seeker.budgetMin) {
    score += 20; // Under budget is still ok
    reasons.push('Rent is below budget range');
  } else {
    const overBy = ((property.rent - seeker.budgetMax) / seeker.budgetMax) * 100;
    if (overBy <= 10) {
      score += 10;
      reasons.push(`Rent is ${overBy.toFixed(0)}% over budget`);
    } else {
      reasons.push(`Rent ₹${property.rent} exceeds budget by ${overBy.toFixed(0)}%`);
    }
  }

  // Move-in date proximity (0 to -10 penalty)
  const daysDiff = Math.abs(
    (new Date(seeker.moveInDate).getTime() - new Date(property.availableFrom).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (daysDiff <= 7) {
    score += 10;
    reasons.push('Move-in dates align well');
  } else if (daysDiff <= 30) {
    score += 5;
    reasons.push(`Move-in dates ${Math.round(daysDiff)} days apart`);
  } else {
    const penalty = Math.min(Math.round(daysDiff / 6), 10);
    score -= penalty;
    reasons.push(`Move-in dates ${Math.round(daysDiff)} days apart (-${penalty})`);
  }

  // Gender preference compatibility (0 or -15)
  if (
    seeker.genderPreference !== 'ANY' &&
    property.genderPreference !== 'ANY' &&
    seeker.genderPreference !== property.genderPreference
  ) {
    score -= 15;
    reasons.push('Gender preference mismatch');
  }

  // Pet compatibility
  if (seeker.pets === 'has_pets' && !(property as any).petFriendly) {
    score -= 10;
    reasons.push('Property is not pet-friendly');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    explanation: reasons.join('. ') + '. Score computed using budget, location, and preference match (AI scoring temporarily unavailable).',
  };
}

/**
 * Score two seekers against each other for flatmate compatibility.
 */
export function scoreSeekerVsSeeker(
  a: SeekerProfile,
  b: SeekerProfile,
): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Location match (0-40 points)
  const cityMatch =
    a.preferredCity.toLowerCase().trim() === b.preferredCity.toLowerCase().trim();
  if (cityMatch) {
    score += 40;
    reasons.push('Same preferred city');
  } else {
    score += 10;
    reasons.push('Different preferred cities');
  }

  // Budget overlap (0-20 points)
  const overlapMin = Math.max(a.budgetMin, b.budgetMin);
  const overlapMax = Math.min(a.budgetMax, b.budgetMax);
  if (overlapMax >= overlapMin) {
    const overlapRange = overlapMax - overlapMin;
    const maxRange = Math.max(a.budgetMax - a.budgetMin, b.budgetMax - b.budgetMin, 1);
    const overlapRatio = Math.min(overlapRange / maxRange, 1);
    score += Math.round(20 * overlapRatio);
    reasons.push(`Budget overlap: ₹${overlapMin}-₹${overlapMax}`);
  } else {
    reasons.push('No budget overlap');
  }

  // Move-in date proximity (0-10 points)
  const daysDiff = Math.abs(
    (new Date(a.moveInDate).getTime() - new Date(b.moveInDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (daysDiff <= 7) {
    score += 10;
    reasons.push('Move-in dates align');
  } else if (daysDiff <= 30) {
    score += 5;
  } else {
    const penalty = Math.min(Math.round(daysDiff / 10), 10);
    score -= penalty;
  }

  // Lifestyle compatibility (0-30 points, 6 each)
  const lifestyleFactors = [
    { field: 'sleepSchedule' as const, label: 'Sleep schedule' },
    { field: 'cleanliness' as const, label: 'Cleanliness' },
    { field: 'smoking' as const, label: 'Smoking preference' },
    { field: 'pets' as const, label: 'Pet preference' },
    { field: 'workFromHome' as const, label: 'Work-from-home' },
  ];

  let lifestyleMatches = 0;
  let lifestyleTotal = 0;

  for (const factor of lifestyleFactors) {
    const valA = a[factor.field];
    const valB = b[factor.field];
    if (valA != null && valB != null) {
      lifestyleTotal++;
      if (valA === valB) {
        lifestyleMatches++;
      } else if (factor.field === 'smoking') {
        // Partial match: smoker vs outdoors_only is better than smoker vs non_smoker
        if (
          (valA === 'outdoors_only' || valB === 'outdoors_only') &&
          (valA !== 'non_smoker' && valB !== 'non_smoker')
        ) {
          lifestyleMatches += 0.5;
        }
      } else if (factor.field === 'pets') {
        // pet_friendly is compatible with both has_pets and no_pets
        if (valA === 'pet_friendly' || valB === 'pet_friendly') {
          lifestyleMatches += 0.5;
        }
      }
    }
  }

  if (lifestyleTotal > 0) {
    const lifestyleScore = Math.round(30 * (lifestyleMatches / lifestyleTotal));
    score += lifestyleScore;
    if (lifestyleMatches >= lifestyleTotal * 0.7) {
      reasons.push('Strong lifestyle compatibility');
    } else if (lifestyleMatches >= lifestyleTotal * 0.4) {
      reasons.push('Moderate lifestyle compatibility');
    } else {
      reasons.push('Limited lifestyle compatibility');
    }
  }

  // Gender preference
  if (
    a.genderPreference !== 'ANY' &&
    b.genderPreference !== 'ANY' &&
    a.genderPreference !== b.genderPreference
  ) {
    score -= 15;
    reasons.push('Gender preference mismatch');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    explanation: reasons.join('. ') + '. Score computed using budget, location, lifestyle, and preference match (AI scoring temporarily unavailable).',
  };
}
