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
  CONTACT_INFO: 'contact-info',
  TEXT: 'text',
  PHONE: 'phone',
  OTP: 'otp',
  CONSENT: 'consent',
  INCOME_SLIDER: 'income-slider',
};

// --------------------------------------------------------------------------
// SECTIONS (Guided Match only — see each step's `section` below)
// --------------------------------------------------------------------------
// Groups steps into named phases for the progress UI: a pill reading
// "{label} {n} of {count in this section}" plus an overall progress bar that
// never resets, same two-layer pattern as competitor funnels we benchmarked
// against (grouped sections read as shorter/less daunting than one flat "4
// of 17", while the underlying bar still shows true total progress). Purely
// presentational — SECTION_ORDER/SECTION_LABELS below, consumed by
// QuizEngine.jsx's progress calculation. Steps with no `section` (currently:
// none in QUIZ_STEPS, all of FAST_TRACK_STEPS) fall back to an unlabeled
// single-counter progress bar, so Fast Track is unaffected by this.
// --------------------------------------------------------------------------
export const SECTION_LABELS = {
  about_you: 'About you',
  your_situation: 'Your situation',
  your_match: 'Your match',
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
// scale the target budget ranges and (in leadScoring.js) as the
// has-dependents scoring signal now that we no longer collect individual
// dependent ages (see the removed `dependent_ages` step below).
export const MULTI_PERSON_HOUSEHOLDS = ['spouse', 'children', 'family'];

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

// Household monthly income, as a single-thumb slider over discrete buckets
// (not a free-text number) — asks for a realistic range without demanding
// a precise figure nobody has memorized. Distinct from `target_budget`
// below: this is what a household actually brings in (relevant to ACA
// subsidy eligibility, which scales with income), where target_budget is
// what someone would like to spend on a premium. Six buckets span roughly
// $0–$10,000+/mo in ~$1,700 steps; `min`/`max` are used for the live label,
// `value` is what's actually stored on the lead.
export const INCOME_BUCKETS = [
  { value: 'under_2500', min: 0, max: 2500, label: 'Under $2,500 a month' },
  { value: '2500_4170', min: 2500, max: 4170, label: '$2,500 to $4,170 a month' },
  { value: '4170_6250', min: 4170, max: 6250, label: '$4,170 to $6,250 a month' },
  { value: '6250_8330', min: 6250, max: 8330, label: '$6,250 to $8,330 a month' },
  { value: '8330_10420', min: 8330, max: 10420, label: '$8,330 to $10,420 a month' },
  { value: 'over_10420', min: 10420, max: null, label: '$10,420 or more a month' },
];

export const QUIZ_STEPS = [
  // --- About you -----------------------------------------------------------
  // Who/age/ZIP first, before anything situational — coarse, fast-to-answer
  // questions that make the next section feel personalized ("plans in your
  // ZIP") rather than a cold start. See SECTION_LABELS above.
  {
    id: 'household',
    type: STEP_TYPES.CARDS,
    section: 'about_you',
    question: 'Who needs coverage?',
    field: 'household',
    options: HOUSEHOLD_OPTIONS,
  },
  {
    id: 'dob',
    type: STEP_TYPES.DOB,
    section: 'about_you',
    question: 'What is your date of birth?',
    helper: 'This helps us match you to plans you actually qualify for.',
    field: 'dob',
  },
  {
    id: 'zip',
    type: STEP_TYPES.ZIP,
    section: 'about_you',
    question: 'What is your ZIP code?',
    helper: 'Plans and prices change with your ZIP, so we start there.',
    field: 'zip',
  },
  // --- Your situation --------------------------------------------------
  {
    id: 'primary_need',
    type: STEP_TYPES.CARDS,
    section: 'your_situation',
    question: 'Why are you looking for coverage?',
    field: 'primaryNeed',
    options: PRIMARY_NEED_OPTIONS,
  },
  // Medicaid and employer-coverage are asked as their own yes/no screens,
  // ahead of the detailed current_coverage breakdown below, rather than only
  // as two of its seven options. Both matter for ACA Marketplace eligibility
  // specifically (Medicaid enrollees and employer-plan holders generally
  // aren't Marketplace-subsidy candidates) — surfacing them this early lets
  // a licensed agent route the call correctly before the rest of the
  // assessment even runs, the same way current_coverage/aca_subsidy already
  // branch the flow. Neither disqualifies or skips any step here — routing
  // on the answer is for the agent/CRM side, not this funnel — they're
  // additional scoring/routing signals like everything else in this file.
  {
    id: 'on_medicaid',
    type: STEP_TYPES.YES_NO,
    section: 'your_situation',
    question: 'Are you on Medicaid right now?',
    field: 'onMedicaid',
  },
  {
    id: 'employer_coverage',
    type: STEP_TYPES.YES_NO,
    section: 'your_situation',
    question: 'Do you have coverage through work?',
    field: 'employerCoverage',
  },
  {
    id: 'current_coverage',
    type: STEP_TYPES.CARDS,
    section: 'your_situation',
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
    section: 'your_situation',
    question: 'Do you currently receive a premium tax credit (subsidy) on your Marketplace plan?',
    helper: "This affects what you'd actually pay for alternative coverage — no wrong answer here.",
    field: 'acaSubsidy',
    showIf: (a) => a.currentCoverage === 'marketplace',
  },
  {
    id: 'uninsured_duration',
    type: STEP_TYPES.CARDS,
    section: 'your_situation',
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
    id: 'household_income',
    type: STEP_TYPES.INCOME_SLIDER,
    section: 'your_situation',
    question: "What's your approximate monthly household income?",
    helper: 'Move the dot to your monthly range.',
    field: 'monthlyIncome',
  },
  {
    id: 'target_budget',
    type: STEP_TYPES.CARDS,
    section: 'your_situation',
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
    section: 'your_situation',
    question: 'When would you like your new coverage to begin?',
    field: 'coverageStart',
    options: COVERAGE_START_OPTIONS,
  },
  {
    id: 'healthcare_usage',
    type: STEP_TYPES.CARDS,
    section: 'your_situation',
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
    section: 'your_situation',
    question: 'Do you currently take prescription medications?',
    field: 'takesMedication',
  },
  // Eligibility/underwriting questions (disabled by default — see above).
  ...eligibilityEnabledSteps(),
  // Name, phone, and email collected together on one screen instead of three
  // separate steps — see StepContactInfo.jsx. ZIP is no longer asked here;
  // it moved up to the 'zip' step in "About you" above, so this screen only
  // merges the three fields that still have nowhere earlier to live. Phone
  // is still verified by OTP immediately afterward, per spec.
  {
    id: 'contact_info',
    type: STEP_TYPES.CONTACT_INFO,
    section: 'your_match',
    question: "Almost done — where should we send your options?",
    helper: "Next, we'll ask you to confirm you're okay being texted before we send a verification code.",
  },
  // MUST come before 'otp' — the otp step sends a real text the instant it
  // mounts (see StepOtp.jsx's sendCode() on-mount effect), so consent has
  // to be captured here, before that happens, not after. This funnel used
  // to ask for consent as the very last screen (after the OTP text had
  // already gone out) - that's a real TCPA/A2P compliance problem, not just
  // a paperwork one, and is what got the Twilio campaign rejected (Error
  // 30896: opt-in doesn't show consent before messaging). Do not move this
  // back below 'otp'.
  //
  // Also note: the checkbox here is NOT required to continue (see
  // QuizEngine.jsx's secondaryLabel/onSecondary on this step) — Twilio
  // separately rejected the campaign a second time (Error 30923, "Forced
  // Consent Violation") for making SMS consent a condition of completing
  // the form. A2P review requires a real, visible way to decline SMS and
  // still finish/use the service - that's declineAndFinish() in
  // QuizEngine.jsx, which skips 'otp' entirely and submits unverified.
  {
    id: 'consent',
    type: STEP_TYPES.CONSENT,
    section: 'your_match',
    question: "Before we text you a verification code",
    helper: "This is optional. If you'd rather not be texted, you can decline below and we'll still connect you with a licensed agent by phone.",
    field: 'consent',
  },
  {
    id: 'otp',
    type: STEP_TYPES.OTP,
    section: 'your_match',
    question: 'Enter the 6-digit code we just sent you',
    helper: "We'll use this number to securely verify your request and connect you with a licensed agent who can review available options.",
    field: 'otpVerified',
    // Skipped entirely when the consent step was declined (see above) -
    // never sent a text without consent, and never shown a "verify this
    // code" screen for a code that (correctly) was never sent.
    showIf: (answers) => answers.consent !== false,
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
    helper: "Next, we'll ask you to confirm you're okay being texted before we send a verification code.",
    field: 'phone',
  },
  // See the identical comment in QUIZ_STEPS above — must stay before 'otp',
  // and the checkbox is optional there for the same Error 30923 reason.
  {
    id: 'consent',
    type: STEP_TYPES.CONSENT,
    question: "Before we text you a verification code",
    helper: "This is optional. If you'd rather not be texted, you can decline below and we'll still connect you with a licensed agent by phone.",
    field: 'consent',
  },
  {
    id: 'otp',
    type: STEP_TYPES.OTP,
    question: 'Enter the 6-digit code we just sent you',
    helper: "We'll use this number to securely verify your request and connect you with a licensed agent who can review available options.",
    field: 'otpVerified',
    showIf: (answers) => answers.consent !== false,
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

// Resolve the progress-pill info for the step at `index` within
// `activeSteps`: which named section it's in, its 1-based position within
// that section's run of active steps, and how many active steps that
// section has in total. Returns null when the step has no `section` (Fast
// Track today — getActiveSteps() filters FAST_TRACK_STEPS, none of which
// set `section`), so ProgressBar falls back to its plain "no pill" look
// rather than showing a broken/empty label. Section membership is read off
// each active step as encountered, so a showIf-skipped step (e.g.
// aca_subsidy when currentCoverage isn't 'marketplace') never counts toward
// its section's total — the pill always matches what the user actually saw.
export function getSectionProgress(activeSteps, index) {
  const step = activeSteps[index];
  if (!step?.section) return null;
  let position = 0;
  let total = 0;
  activeSteps.forEach((s, i) => {
    if (s.section !== step.section) return;
    total += 1;
    if (i <= index) position = total;
  });
  return { key: step.section, label: SECTION_LABELS[step.section] || step.section, position, total };
}
