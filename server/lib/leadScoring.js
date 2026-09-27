// Server-side copy of src/lib/leadScoring.js. Kept as a literal duplicate
// (not a symlink/import across the frontend/server boundary) so the server
// package has zero dependency on the Vite frontend build. IMPORTANT: if you
// change the scoring weights or tiering rules in src/lib/leadScoring.js,
// change them here too - these two files must stay in sync by hand until
// this project is restructured as a monorepo with a shared package. This
// duplication is a known rough edge, documented rather than hidden.
export const SCORING_WEIGHTS = {
  otpVerified: 30,
  coverageStart: { asap: 25, within_30: 20, within_60: 10, researching: 0 },
  primaryNeed: {
    losing_coverage: 10, family_coverage: 4, lower_premium: 2,
    better_coverage: 2, network_access: 2, comparing: 0,
  },
  budgetRealism: { realistic: 15, low: 5, unknown: 0 },
  assessmentCompleted: 10,
  hasDependents: 5,
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

export function scoreLead(answers = {}) {
  const w = SCORING_WEIGHTS;
  let score = 0;
  if (answers.otpVerified) score += w.otpVerified;
  score += w.coverageStart[answers.coverageStart] ?? 0;
  score += w.primaryNeed[answers.primaryNeed] ?? 0;
  score += w.budgetRealism[budgetRealismBucket(answers.targetBudget)] ?? 0;
  if (answers.assessmentCompleted) score += w.assessmentCompleted;
  if (Array.isArray(answers.dependentAges) && answers.dependentAges.length) score += w.hasDependents;
  if (answers.currentCoverage && answers.currentCoverage !== 'none') score += w.currentlyInsured;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, tier: tierForScore(score, answers) };
}

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
