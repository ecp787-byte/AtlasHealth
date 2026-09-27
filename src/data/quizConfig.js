// ============================================================================
// QUIZ CONFIGURATION
// ----------------------------------------------------------------------------
// This file is the single source of truth for the question flow. The engine
// (QuizEngine.jsx) renders steps FROM this config — to change, reorder, add,
// or remove a question, edit this file. You should not need to touch the
// rendering components to change wording, options, or branching.
//
// Each step has:
//   id        unique key, also used as the state field name unless `field`
//             is given explicitly
//   type      which step component renders it (see STEP_TYPES below)
//   question  the on-screen question text
//   helper    optional one-line supporting text shown under the question
//   options   for card-based steps: [{ value, label, icon? }]
//   showIf    optional (answers) => boolean — step is skipped when this
//             returns false. Lets the flow branch without special-casing
//             the engine itself.
//   track     optional tracking event name fired when this step is completed
// ============================================================================

export const STEP_TYPES = {
  CARDS: 'cards',
  YES_NO: 'yes-no',
  AGE: 'age',
  DOB: 'dob',
  DEPENDENT_AGES: 'dependent-ages',
  ZIP: 'zip',
  CONTACT: 'contact',
  TEXT: 'text',
  PHONE: 'phone',
  OTP: 'otp',
  CONSENT: 'consent',
};

// --------------------------------------------------------------------------
// FUNNEL VARIANT
// --------------------------------------------------------------------------
// Which step list getActiveSteps() builds from. 'guided' (default) is the
// full Guided Match flow below (QUIZ_STEPS) — deepest lead-scoring signal,
// ~12 screens. 'fast_track' is FAST_TRACK_STEPS, further down this file — a
// minimal single-select qualifier for high-volume paid traffic, ~7 content
// questions plus the DOB/ZIP/contact/phone/OTP/consent steps every variant
// needs. Set at build time: `VITE_FUNNEL_VARIANT=fast_track npm run build`.
// Both variants share the same StepShell/QuizEngine, lead scoring, and
// results page — only the step list differs.
// --------------------------------------------------------------------------
export const FUNNEL_VARIANT =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FUNNEL_VARIANT) || 'guided';

// Household sizes that mean "more than one person needs coverage" — used to
// decide whether to ask the dependent-ages follow-up and to scale the target
// budget ranges.
const MULTI_PERSON_HOUSEHOLDS = ['spouse', 'children', 'family'];

// --------------------------------------------------------------------------
// ELIGIBILITY / MEDICAL UNDERWRITING QUESTIONS
// --------------------------------------------------------------------------
// Left DISABLED by default. Do not enable, and do not treat any answer here
// as a qualify/disqualify decision, until the actual carrier's underwriting
// guidelines have been supplied and reviewed by compliance. The array below
// is a placeholder shape only — swap in real questions and set
// ELIGIBILITY_ENABLED to true once those rules exist. Whatever the answers,
// route the prospect via getEligibilityRoute() (in leadRouting.js) rather
// than rejecting them outright — a prospect who doesn't fit a
// medically-underwritten product may still fit ACA or another product the
// agency offers.
// --------------------------------------------------------------------------
export const ELIGIBILITY_ENABLED = false;

export const ELIGIBILITY_QUESTIONS = [
  {
    id: 'eligibility_sample',
    type: 'yes-no',
    question: 'SAMPLE — replace with the real underwriting question once carrier rules are provided.',
    field: 'eligibilitySample',
  },
];

function eligibilityEnabledSteps() {
  return ELIGIBILITY_ENABLED ? ELIGIBILITY_QUESTIONS : [];
}

// Option sets shared between funnel variants so the Guided Match and Fast
// Track flows can't drift apart on wording/values for the same field — and
// so a value picked in either flow means the same thing to leadScoring.js.
export const PRIMARY_NEED_OPTIONS = [
  { value: 'lower_premium', label: 'Lower monthly premium' },
  { value: 'better_coverage', label: 'Better coverage' },
  { value: 'network_access', label: 'Better doctor/network access' },
  { value: 'family_coverage', label: 'Coverage for my family' },
  { value: 'losing_coverage', label: "I'm losing my current coverage" },
  { value: 'comparing', label: 'Just comparing options' },
];

export const HOUSEHOLD_OPTIONS = [
  { value: 'just_me', label: 'Just me' },
  { value: 'spouse', label: 'Me + spouse' },
  { value: 'children', label: 'Me + child/children' },
  { value: 'family', label: 'Family' },
  { value: 'children_only', label: 'Child/children only' },
];

export const COVERAGE_START_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: 'within_30', label: 'Within 30 days' },
  { value: 'within_60', label: 'Within 60 days' },
  { value: 'researching', label: "I'm researching for later" },
];

// Coarser than the full current_coverage step — Fast Track trades scoring
// resolution for speed, so this collapses "what type of coverage" down to
// the one distinction that actually changes urgency.
export const COVERAGE_STATUS_OPTIONS = [
  { value: 'insured', label: 'Yes, I have coverage now' },
  { value: 'losing_soon', label: "I'm losing my coverage soon" },
  { value: 'uninsured', label: 'No, I’m uninsured' },
];

export const QUIZ_STEPS = [
  {
    id: 'primary_need',
    type: STEP_TYPES.CARDS,
    question: 'What are you primarily looking for?',
    field: 'primaryNeed',
    options: PRIMARY_NEED_OPTIONS,
  },
  {
    id: 'household',
    type: STEP_TYPES.CARDS,
    question: 'Who needs coverage?',
    field: 'household',
    options: HOUSEHOLD_OPTIONS,
  },
  {
    id: 'age',
    type: STEP_TYPES.AGE,
    question: 'What is your age?',
    helper: 'This helps us match you to plans you actually qualify for.',
    field: 'age',
  },
  {
    id: 'dependent_ages',
    type: STEP_TYPES.DEPENDENT_AGES,
    question: 'Who else needs coverage?',
    helper: 'Add the age of each additional family member.',
    field: 'dependentAges',
    // Only asked when the household answer implies more than one person.
    showIf: (a) => MULTI_PERSON_HOUSEHOLDS.includes(a.household),
  },
  {
    id: 'current_coverage',
    type: STEP_TYPES.CARDS,
    question: 'What type of coverage do you currently have?',
    field: 'currentCoverage',
    options: [
      { value: 'marketplace', label: 'Marketplace / ACA' },
      { value: 'employer', label: 'Employer coverage' },
      { value: 'cobra', label: 'COBRA' },
      { value: 'private', label: 'Private health insurance' },
      { value: 'medicaid', label: 'Medicaid' },
      { value: 'none', label: 'No insurance' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'aca_subsidy',
    type: STEP_TYPES.YES_NO,
    question: 'Do you currently receive a premium tax credit (subsidy) on your Marketplace plan?',
    helper: "This affects what you'd actually pay for alternative coverage — no wrong answer here.",
    field: 'acaSubsidy',
    showIf: (a) => a.currentCoverage === 'marketplace',
  },
  {
    id: 'coverage_end_date',
    type: STEP_TYPES.TEXT,
    inputType: 'date',
    question: 'When does your current coverage end?',
    field: 'coverageEndDate',
    showIf: (a) => a.primaryNeed === 'losing_coverage' || a.currentCoverage === 'cobra',
  },
  {
    id: 'uninsured_duration',
    type: STEP_TYPES.CARDS,
    question: 'About how long have you been without coverage?',
    field: 'uninsuredDuration',
    options: [
      { value: 'lt_1mo', label: 'Less than a month' },
      { value: '1_3mo', label: '1–3 months' },
      { value: '3_12mo', label: '3–12 months' },
      { value: 'gt_1yr', label: 'Over a year' },
    ],
    showIf: (a) => a.currentCoverage === 'none',
  },
  {
    id: 'current_premium',
    type: STEP_TYPES.CARDS,
    question: 'What are you currently paying per month?',
    field: 'currentPremium',
    options: [
      { value: 'under_300', label: 'Under $300' },
      { value: '300_500', label: '$300–$500' },
      { value: '500_750', label: '$500–$750' },
      { value: '750_1000', label: '$750–$1,000' },
      { value: 'over_1000', label: '$1,000+' },
      { value: 'not_sure', label: 'Not sure / currently uninsured' },
    ],
    showIf: (a) => a.currentCoverage !== 'none',
  },
  {
    id: 'target_budget',
    type: STEP_TYPES.CARDS,
    question: 'What would you ideally like to spend per month?',
    helper: 'Ranges shown are scaled to the household size you selected.',
    field: 'targetBudget',
    // Options are resolved dynamically by household size — see
    // getTargetBudgetOptions() below, used by QuizEngine instead of a
    // static `options` array for this one step.
    dynamicOptions: 'targetBudget',
  },
  {
    id: 'coverage_start',
    type: STEP_TYPES.CARDS,
    question: 'When would you like your new coverage to begin?',
    field: 'coverageStart',
    options: COVERAGE_START_OPTIONS,
  },
  {
    id: 'healthcare_usage',
    type: STEP_TYPES.CARDS,
    question: 'How often do you typically use healthcare?',
    field: 'healthcareUsage',
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'few_per_year', label: 'A few times per year' },
      { value: 'frequently', label: 'Frequently' },
      { value: 'ongoing', label: 'I have ongoing medical needs' },
    ],
  },
  {
    id: 'takes_medication',
    type: STEP_TYPES.YES_NO,
    question: 'Do you currently take prescription medications?',
    field: 'takesMedication',
  },
  {
    id: 'ongoing_medication',
    type: STEP_TYPES.YES_NO,
    question: 'Are these regular, ongoing prescriptions (taken every month)?',
    field: 'ongoingMedication',
    showIf: (a) => a.takesMedication === 'yes',
  },
  // Eligibility/underwriting questions (disabled by default — see above).
  ...eligibilityEnabledSteps(),
  {
    id: 'zip',
    type: STEP_TYPES.ZIP,
    question: 'What is your ZIP code?',
    helper: "We'll use this to show coverage available in your area.",
    field: 'zip',
  },
  {
    id: 'contact',
    type: STEP_TYPES.CONTACT,
    question: "Almost done — where should we send your options?",
    field: 'contact', // writes { firstName, lastName, email }
  },
  // Phone is collected LAST, after the rest of the assessment, followed
  // immediately by OTP verification — per spec, never earlier in the flow.
  {
    id: 'phone',
    type: STEP_TYPES.PHONE,
    question: "What's the best number to reach you at?",
    helper: "We'll text a one-time code to verify it's really you before connecting you with an agent.",
    field: 'phone',
  },
  {
    id: 'otp',
    type: STEP_TYPES.OTP,
    question: 'Enter the 6-digit code we just sent you',
    helper: "We'll use this number to securely verify your request and connect you with a licensed agent who can review available options.",
    field: 'otpVerified',
  },
  {
    id: 'consent',
    type: STEP_TYPES.CONSENT,
    question: 'Review & submit',
    field: 'consent',
  },
];

// --------------------------------------------------------------------------
// FAST TRACK — minimal single-select qualifier (see FUNNEL_VARIANT above).
// Every question here is single-select except DOB, ZIP, contact, and phone —
// no free-text qualifying questions, no branching, no dependent-ages
// follow-up. Field names intentionally match QUIZ_STEPS where the concept
// is the same (primaryNeed, household, targetBudget, coverageStart, zip,
// contact, phone, otpVerified, consent) so leadScoring.js, the consent
// summary, and ResultsPage all work unchanged for Fast Track leads too —
// only `currentCoverage` and `dependentAges` are absent, which just zeroes
// those two scoring signals rather than breaking anything.
// --------------------------------------------------------------------------
export const FAST_TRACK_STEPS = [
  {
    id: 'household',
    type: STEP_TYPES.CARDS,
    question: 'Who needs coverage?',
    field: 'household',
    options: HOUSEHOLD_OPTIONS,
  },
  {
    id: 'coverage_status',
    type: STEP_TYPES.CARDS,
    question: 'Do you currently have health insurance?',
    field: 'coverageStatus',
    options: COVERAGE_STATUS_OPTIONS,
  },
  {
    id: 'primary_need',
    type: STEP_TYPES.CARDS,
    question: 'What are you primarily looking for?',
    field: 'primaryNeed',
    options: PRIMARY_NEED_OPTIONS,
  },
  {
    id: 'target_budget',
    type: STEP_TYPES.CARDS,
    question: 'What would you ideally like to spend per month?',
    helper: 'Ranges shown are scaled to the household size you selected.',
    field: 'targetBudget',
    dynamicOptions: 'targetBudget',
  },
  {
    id: 'coverage_start',
    type: STEP_TYPES.CARDS,
    question: 'When would you like your new coverage to begin?',
    field: 'coverageStart',
    options: COVERAGE_START_OPTIONS,
  },
  {
    id: 'dob',
    type: STEP_TYPES.DOB,
    question: 'What is your date of birth?',
    helper: 'This helps us match you to plans you actually qualify for.',
    field: 'dob',
  },
  {
    id: 'zip',
    type: STEP_TYPES.ZIP,
    question: 'What is your ZIP code?',
    helper: "We'll use this to show coverage available in your area.",
    field: 'zip',
  },
  {
    id: 'contact',
    type: STEP_TYPES.CONTACT,
    question: 'Almost done — where should we send your options?',
    field: 'contact',
  },
  {
    id: 'phone',
    type: STEP_TYPES.PHONE,
    question: "What's the best number to reach you at?",
    helper: "We'll text a one-time code to verify it's really you before connecting you with an agent.",
    field: 'phone',
  },
  {
    id: 'otp',
    type: STEP_TYPES.OTP,
    question: 'Enter the 6-digit code we just sent you',
    helper: "We'll use this number to securely verify your request and connect you with a licensed agent who can review available options.",
    field: 'otpVerified',
  },
  {
    id: 'consent',
    type: STEP_TYPES.CONSENT,
    question: 'Review & submit',
    field: 'consent',
  },
];

// ----------------------------------------------------------------------
// Dynamic option sets (resolved at render time based on prior answers)
// ----------------------------------------------------------------------
export function getTargetBudgetOptions(answers) {
  const multiPerson = MULTI_PERSON_HOUSEHOLDS.includes(answers.household);
  return multiPerson
    ? [
        { value: 'under_400', label: 'Under $400' },
        { value: '400_700', label: '$400–$700' },
        { value: '700_1000', label: '$700–$1,000' },
        { value: '1000_1400', label: '$1,000–$1,400' },
        { value: 'over_1400', label: '$1,400+' },
      ]
    : [
        { value: 'under_150', label: 'Under $150' },
        { value: '150_300', label: '$150–$300' },
        { value: '300_450', label: '$300–$450' },
        { value: '450_600', label: '$450–$600' },
        { value: 'over_600', label: '$600+' },
      ];
}

// Resolve the ordered, filtered list of steps for a given answers object.
// Steps whose showIf() returns false are skipped entirely (not shown, not
// counted in the progress bar). Which base list this filters depends on
// FUNNEL_VARIANT (see above) — Fast Track has no showIf branches today, but
// filtering unconditionally keeps this one code path correct for both.
export function getActiveSteps(answers) {
  const baseSteps = FUNNEL_VARIANT === 'fast_track' ? FAST_TRACK_STEPS : QUIZ_STEPS;
  return baseSteps.filter((step) => !step.showIf || step.showIf(answers));
}
