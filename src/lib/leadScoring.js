// ============================================================================
// LEAD SCORING
// ----------------------------------------------------------------------------
// Produces a 0-100 internal quality score plus a HOT / WARM / NURTURE tier.
// This score is NEVER shown to the consumer — it exists to help agents
// prioritize their callback queue and to feed lead-value data back into ad
// platforms (see tracking.js / server CAPI integration).
//
// Everything that affects the score lives in SCORING_WEIGHTS below so it can
// be tuned by whoever owns funnel performance without touching engine code.
// This module is intentionally framework-free (no React) so it can be
// imported unchanged by both the frontend (dev-only visibility/debugging)
// and a Node backend (server/, at lead-write time) — same scoring logic in
// both places, no drift.
// ============================================================================

export const SCORING_WEIGHTS = {
  // Verification carries the single heaviest weight: an unverified phone
  // number is close to worthless to a call center, no matter how well the
  // prospect otherwise fits.
  otpVerified: 30,

  // Urgency / timeframe to purchase.
  coverageStart: {
    asap: 25,
    within_30: 20,
    within_60: 10,
    researching: 0,
  },

  // Losing coverage soon or already uninsured signals real urgency
  // independent of the stated timeframe.
  primaryNeed: {
    losing_coverage: 10,
    family_coverage: 4,
    lower_premium: 2,
    better_coverage: 2,
    network_access: 2,
    comparing: 0,
  },

  // Budget realism: does the stated target budget fall within a range the
  // agency can plausibly place a plan in? Coarse buckets, deliberately not
  // tied to real premiums (those vary by carrier/state/age) — this is a
  // "did they give us a serious number" signal, not an underwriting input.
  budgetRealism: {
    realistic: 15, // not the cheapest bucket and not "not sure"
    low: 5, // cheapest bucket - still workable, lower placement odds
    unknown: 0,
  },

  // Completing the full assessment vs. dropping contact info early.
  assessmentCompleted: 10,

  // Household with dependents tends to be a higher-value / higher-premium
  // placement.
  hasDependents: 5,

  // Currently uninsured for a long stretch can mean price-sensitivity but
  // also urgency; currently insured via employer/marketplace and actively
  // shopping tends to convert faster than "just comparing."
  currentlyInsured: 5,
};

const REALISTIC_BUDGET_VALUES = new Set([
  '150_300', '300_450', '450_600', 'over_600',
  '400_700', '700_1000', '1000_1400', 'over_1400',
]);
const LOW_BUDGET_VALUES = new Set(['under_150', 'under_400']);

function budgetRealismBucket(targetBudget) {
  if (!targetBudget) return 'unknown';
  if (REALISTIC_BUDGET_VALUES.has(targetBudget)) return 'realistic';
  if (LOW_BUDGET_VALUES.has(targetBudget)) return 'low';
  return 'unknown';
}

/**
 * Score a completed (or partially completed) set of quiz answers.
 * `answers` is the same shape the quiz engine accumulates; `otpVerified`
 * should reflect actual server-confirmed verification, not client state
 * alone, once this runs server-side.
 */
export function scoreLead(answers = {}) {
  const w = SCORING_WEIGHTS;
  let score = 0;
  const breakdown = {};

  if (answers.otpVerified) {
    breakdown.otpVerified = w.otpVerified;
    score += w.otpVerified;
  }

  const startPts = w.coverageStart[answers.coverageStart] ?? 0;
  breakdown.coverageStart = startPts;
  score += startPts;

  const needPts = w.primaryNeed[answers.primaryNeed] ?? 0;
  breakdown.primaryNeed = needPts;
  score += needPts;

  const bucket = budgetRealismBucket(answers.targetBudget);
  const budgetPts = w.budgetRealism[bucket] ?? 0;
  breakdown.budgetRealism = budgetPts;
  score += budgetPts;

  if (answers.assessmentCompleted) {
    breakdown.assessmentCompleted = w.assessmentCompleted;
    score += w.assessmentCompleted;
  }

  const hasDependents =
    Array.isArray(answers.dependentAges) && answers.dependentAges.length > 0;
  if (hasDependents) {
    breakdown.hasDependents = w.hasDependents;
    score += w.hasDependents;
  }

  const currentlyInsured =
    answers.currentCoverage && answers.currentCoverage !== 'none';
  if (currentlyInsured) {
    breakdown.currentlyInsured = w.currentlyInsured;
    score += w.currentlyInsured;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, tier: tierForScore(score, answers), breakdown };
}

/**
 * Tiering follows the example logic from the funnel spec:
 *  HOT     verified phone + immediate/30-day need + realistic budget +
 *          a completed assessment
 *  WARM    verified, but a longer timeline or less urgency
 *  NURTURE researching / incomplete / long timeframe
 * The numeric score is used as a tie-breaker / fallback for cases that
 * don't cleanly match one of the example patterns.
 */
export function tierForScore(score, answers = {}) {
  const verified = !!answers.otpVerified;
  const urgent = ['asap', 'within_30'].includes(answers.coverageStart);
  const realisticBudget = budgetRealismBucket(answers.targetBudget) !== 'unknown';
  const completed = !!answers.assessmentCompleted;

  if (verified && urgent && realisticBudget && completed) return 'HOT';
  if (verified) return 'WARM';
  if (!completed || answers.coverageStart === 'researching') return 'NURTURE';
  return score >= 60 ? 'WARM' : 'NURTURE';
}
