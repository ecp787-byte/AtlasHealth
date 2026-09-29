# Atlas Health Coverage Assessment — Funnel Architecture

This document describes the lead-generation funnel built in this repository: a
mobile-first, one-question-per-screen coverage assessment for private health
insurance leads. It's organized in the order requested — architecture, question
flow, conditional logic, scoring, data schema, CRM mapping, tracking,
compliance, page structure, and follow-up automation — followed by a review
pass and an honest list of what is and isn't wired to real services yet.

## 1. Funnel architecture

Three stages, one React SPA (`src/App.jsx`):

```
Landing (LandingHero.jsx)
   │  tap "Check My Options"
   ▼
Quiz (QuizEngine.jsx, driven by src/data/quizConfig.js)
   │  each step: card select / input → validate → advance
   │  progress saved to sessionStorage after every step (src/lib/progress.js)
   │  ...primary_need → household → dob → current_coverage
   │     → [aca_subsidy] → [uninsured_duration]
   │     → target_budget → coverage_start
   │     → healthcare_usage → takes_medication
   │     → [eligibility questions, disabled] → contact_info (name, phone,
   │        email, ZIP - one screen) → OTP verify → consent → submit
   ▼
Results (ResultsPage.jsx)
   - scores the lead (src/lib/leadScoring.js)
   - routes it (src/lib/leadRouting.js) — never a hard rejection
   - submits it (stubbed — see §10)
   - shows business-hours-aware next step (call now vs. schedule)
```

Design principle: **question logic lives in `quizConfig.js`, completely
separate from the rendering components** (`src/components/quiz/*`). Adding,
reordering, rewording, or branching a question means editing that one file —
no component changes required. `getActiveSteps(answers)` recomputes the live,
filtered step list (and therefore the progress bar denominator) from the
current answers on every change, which is what makes conditional branching
possible without special-casing the engine.

## 2. Complete question flow

| # | Step id | Question | Type | Shown when |
|---|---|---|---|---|
| 1 | `primary_need` | What are you primarily looking for? | cards | always |
| 2 | `household` | Who needs coverage? | cards | always |
| 3 | `dob` | What is your date of birth? | typed MM/DD/YYYY | always |
| 4 | `current_coverage` | What type of coverage do you currently have? | cards | always |
| 5 | `aca_subsidy` | Do you receive a premium tax credit? | yes/no | current_coverage = marketplace |
| 6 | `uninsured_duration` | How long have you been without coverage? | cards | current_coverage = none |
| 7 | `target_budget` | What would you ideally like to spend? | cards, household-scaled | always |
| 8 | `coverage_start` | When would you like new coverage to begin? | cards | always |
| 9 | `healthcare_usage` | How often do you use healthcare? | cards | always |
| 10 | `takes_medication` | Do you take prescription medications? | yes/no | always |
| — | *(eligibility questions)* | *placeholder, disabled* | yes/no | `ELIGIBILITY_ENABLED` (false) |
| 11 | `contact_info` | Name, phone, email, ZIP — one screen | text fields | always |
| 12 | `otp` | 6-digit verification code | OTP | immediately after contact_info |
| 13 | `consent` | Review & submit | consent + summary | last |

Date of birth, not a bare age integer — typed as MM/DD/YYYY
(`StepDob.jsx`), not a native calendar picker, same input pattern the Fast
Track variant already used. This also fixes a real gap: `ResultsPage.jsx`'s
submit payload has always read `answers.dob`, not `answers.age` — so the
Guided flow's old age-integer answer was silently never making it into the
lead payload at all. Collecting DOB directly means the Guided flow now
actually submits it, same as Fast Track always has.

**Step-count cuts (this revision):** several changes were made purely to
reduce steps and abandonment risk, with no loss of anything
`leadScoring.js` actually uses:

- **Removed the `dependent_ages` follow-up.** The `household` step already
  asks who needs coverage as a category (spouse / children / family /
  child(ren) only) — that's the real signal. Asking for each dependent's
  individual age afterward was extra friction that fed only cosmetic detail;
  `leadScoring.js`'s has-dependents signal now reads the `household`
  category directly (`MULTI_PERSON_HOUSEHOLDS`) instead of a dependent-ages
  array.
- **Merged `zip` + `contact` + `phone` into one `contact_info` screen**
  (`StepContactInfo.jsx`) — name, phone, email, and ZIP collected together
  instead of three separate steps. These four fields have no branching and
  nothing to react to mid-entry, so there was no UX reason to force three
  taps-to-continue. Phone is still verified by OTP immediately afterward,
  unchanged.
- **Removed `coverage_end_date`.** Like `dependentAges`, this field was
  never actually included in `ResultsPage.jsx`'s submit payload — it was
  collected (via a native, unstyled `<input type="date">`, the one step
  that broke from the rest of the funnel's card/typed-input pattern) and
  then silently dropped. No scoring, routing, or CRM mapping referenced it
  either, so removing it costs nothing and drops a step for exactly the
  segment (losing coverage / on COBRA) that's most time-sensitive to get to
  an agent fast.
- **Removed `current_premium`** ("What are you currently paying per
  month?"). Unlike the fields above, this one *was* wired to a CRM field
  (`current_premium_range`, §6) — that field will go empty going forward.
  It was never part of `leadScoring.js`, though: only *whether* someone is
  currently insured feeds the score (`current_coverage != none`), not what
  they pay. Cut by explicit request to prioritize step count over that one
  CRM field.
- **Removed `ongoing_medication`** ("Are these regular, ongoing
  prescriptions?"), the yes/no follow-up to `takes_medication`. Also never
  included in the submit payload — `takesMedication` alone was already
  being sent — so this was pure friction with no data loss. `healthcare_usage`
  and `takes_medication` themselves stay; only this one follow-up is gone.

Together these cut 5–6 steps off every completion (6 for multi-person
households losing coverage or on COBRA who take regular medication), on
top of the steps that were already conditional.

## 3. Conditional logic map

Implemented as `showIf(answers)` predicates in `quizConfig.js`:

- `current_coverage = marketplace` → show `aca_subsidy`.
- `current_coverage = none` → show `uninsured_duration`.
- `healthcare_usage = ongoing` (or any eligibility signal) → would route through
  the eligibility question block once it's enabled — see below.

**Soft-decline routing** (`src/lib/leadRouting.js`, `getEligibilityRoute()`):
the funnel never hard-rejects a prospect. Today the eligibility question
block is disabled (`ELIGIBILITY_ENABLED = false` in `quizConfig.js`) because
no real underwriting rules have been supplied — asking a placeholder medical
question and quietly deciding qualification on it would be worse than not
asking at all. Once real carrier rules exist: add the real questions to
`ELIGIBILITY_QUESTIONS`, flip the flag, and encode the actual disqualifying
logic inside `getEligibilityRoute()`. Whatever that logic decides, the
function returns either the standard route or:

> "Let's review other coverage options that may be available."

— never "you don't qualify." This keeps the policy enforced in exactly one
place instead of scattered through the UI.

## 4. Lead scoring model

`src/lib/leadScoring.js`, framework-free so it can be imported unchanged by a
future Node backend (no drift between what the frontend shows in dev and what
the backend actually scores on write). All weights live in one exported
object, `SCORING_WEIGHTS` — nothing is hardcoded inline:

| Factor | Points |
|---|---|
| OTP verified | 30 |
| Coverage start: ASAP | 25 |
| Coverage start: within 30 days | 20 |
| Coverage start: within 60 days | 10 |
| Coverage start: researching | 0 |
| Primary need: losing coverage | 10 |
| Primary need: family/premium/coverage/network | 2–4 |
| Budget realism: realistic bucket | 15 |
| Budget realism: cheapest bucket | 5 |
| Assessment fully completed | 10 |
| Has dependents | 5 |
| Currently insured (any type) | 5 |

Score is clamped to 0–100 and **never returned to the client-facing UI** —
`ResultsPage.jsx` computes it for the submission payload only, never renders
it.

Tiering follows the example logic from the brief directly:

- **HOT** — verified + (ASAP or within 30 days) + realistic budget + completed assessment.
- **WARM** — verified, but doesn't meet all of HOT's conditions.
- **NURTURE** — assessment incomplete, or coverage_start = researching.
- Anything else falls back to the numeric score (≥60 → WARM, else NURTURE).

## 5. Data schema

Shape submitted per lead (see `ResultsPage.jsx`'s `submitLead()` payload —
this is the contract a real `/api/leads` endpoint should accept):

```
{
  contact: { firstName, lastName, email },
  phone: "5555550123",
  otpVerified: true,
  dob: "1990-06-18",
  zip: "78701",
  state: "TX",                 // derived, approximate — see zipToState.js
  household: "family",
  dependentAges: [],           // always empty now — see §2, "Step-count cuts"
  currentCoverage: "marketplace",
  targetBudget: "400_700",
  coverageStart: "asap",
  healthcareUsage: "few_per_year",
  takesMedication: "yes",
  leadScore: 78,
  leadTier: "HOT",
  routing: "standard",
  attribution: {
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    fbclid, landing_page, referrer, first_seen_at
  },
  submittedAt: "2026-09-12T18:04:00.000Z"
}
```

Not included above but tracked separately: funnel abandonment step (via
`progress.js`'s saved `stepIndex`) and lead source constants (source =
"veritas-coverage-funnel", campaign/ad = from `utm_campaign`/`utm_content`).

## 6. CRM field mapping (GoHighLevel)

| Funnel field | GHL field | Notes |
|---|---|---|
| `contact.firstName` / `lastName` | Contact: First Name / Last Name | standard fields |
| `contact.email` | Contact: Email | standard |
| `phone` | Contact: Phone | standard; only write after OTP success |
| `otpVerified` | Custom field: `phone_verified` (boolean) | gates automations below |
| `zip` / `state` | Contact: Postal Code / State | standard |
| `household` | Custom field: `household_composition` | picklist matching quiz values |
| `dependentAges` | Custom field: `dependent_ages` (text, comma-joined) | always empty now — kept in the payload shape in case per-dependent detail is wanted again later; `household` carries the real signal |
| `dob` | Contact: Date of Birth | standard; replaces the old plain-integer `age` field for the Guided flow (Fast Track already sent this) |
| `currentCoverage` | Custom field: `current_coverage_type` | picklist |
| `targetBudget` | Custom field: `target_budget_range` | picklist |
| `coverageStart` | Custom field: `coverage_start_timeframe` | picklist |
| `healthcareUsage` | Custom field: `healthcare_usage` | picklist |
| `takesMedication` | Custom field: `medication_status` | picklist; `ongoingMedication` follow-up removed (§2) — this field alone still reaches GHL |
| `leadScore` | Custom field: `lead_score` (number) | internal only — no consumer-facing surface in GHL either |
| `leadTier` | Tag: `tier:hot` / `tier:warm` / `tier:nurture` | tags drive GHL workflow triggers |
| `routing` | Tag: `route:standard` / `route:alt-coverage` | drives which pipeline/workflow picks it up |
| `attribution.utm_*`, `fbclid` | Custom fields: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid` | for attribution reporting inside GHL |
| — | Tag: `source:veritas-funnel` | applied on every contact from this funnel |
| `submittedAt` | Contact: Date Added (native) | GHL sets this automatically |

`server/lib/ghl.js` is the stub that should perform: contact upsert by
phone/email → apply tags → set custom fields → trigger the workflow that
does SMS/email/agent-notify/call-task (see §10).

## 7. Tracking / event architecture

`src/lib/tracking.js`. Captures UTM + `fbclid` once per session on load,
persists to `sessionStorage`, and fires named events to `fbq` (Meta Pixel)
and `gtag` (GA4) — both guarded to no-op safely when no real Pixel/GA4 ID is
configured (`VITE_META_PIXEL_ID`, `VITE_GA4_MEASUREMENT_ID` env vars).

Events fired: `PageView`, `QuizStarted`, `QuizProgress` (per step),
`Lead` (assessment completed, pre-results), `PhoneSubmitted`, `OTPVerified`,
`QualifiedLead` (on reaching results), `AppointmentScheduled`.

**Per the brief's explicit instruction**, Meta ad-platform *optimization*
should not target `QuizStarted`/every form start. `OPTIMIZATION_CANDIDATE_EVENTS`
in `tracking.js` documents the intended optimization targets — `OTPVerified`,
`QualifiedLead`, `AppointmentScheduled` — but the actual optimization-event
selection happens in Meta Ads Manager / the CAPI dataset config, not in this
codebase; this file only makes sure those events exist and fire with enough
fidelity to be selected there once volume supports it.

**No PII in client-side events.** Names, emails, and phone numbers are never
passed to `fbq`/`gtag`. Full-fidelity match keys (email, phone) for Meta's
Conversions API must be SHA-256 hashed and sent **server-side only**
(`server/lib/meta.js`, stubbed) — never from the browser, never as URL
parameters, never logged to the console in production.

## 8. Compliance / consent placement

`src/components/quiz/StepConsent.jsx`, the **last** step before submission:

- Consent checkbox is unchecked by default and the Submit button is disabled
  until it's checked — no pre-checked box, per requirement.
- Full TCPA-style consent text is visible inline (not hidden behind a
  tooltip/modal), stating that Atlas Health and its agents may call/text using an
  autodialer/prerecorded voice, that consent isn't a condition of purchase,
  and that STOP opts out.
- Links to Privacy Policy / Terms & Conditions / Licensing & Disclosures are
  present as placeholders (`href="#"`).
- The exact copy is isolated in one `CONSENT_COPY` constant at the top of
  `StepConsent.jsx` specifically so legal/compliance can edit it without
  touching any component logic.
- **This copy is a sample.** It must be reviewed and finalized by actual
  compliance/legal counsel before this funnel runs with paid traffic — the
  component and the footer both carry a visible "sample — confirm with
  compliance" tag so this isn't mistaken for finished legal language.

`ComplianceFooter.jsx` carries the licensed-agency disclaimer (placeholder
license states / NPN), the "not affiliated with any government agency"
statement, and Privacy/Terms/Contact links, shown on both the landing and
results pages.

### 8a. Why `/privacy` and `/terms` are statically prerendered

This app is a client-rendered SPA with no server-side rendering — `App.jsx`
picks what to show based on `window.location.pathname`, entirely inside
React, after the JS bundle loads. That's fine for a real browser, but a
plain HTTP fetch with no JS execution (a compliance bot, an ad platform's
crawler, `curl`) gets back nothing but an empty `<div id="root"></div>` and
a `<script>` tag — no policy text at all. Twilio's A2P 10DLC campaign
review fetches the submitted Privacy Policy URL exactly that way, and
rejected an earlier submission with error 30908 ("a compliant privacy
policy can not be verified") for this reason. The same failure mode likely
also affects other ad platforms' automated policy-URL checks (Google Ads,
Meta, TikTok), not just Twilio.

The fix (`scripts/generate-legal-pages.mjs`, run automatically as part of
`npm run build`): server-render the exact same `LegalPage` component (same
data source as the live SPA, so it can never drift out of sync) to a
static HTML string at build time, and write it to `dist/privacy/index.html`
and `dist/terms/index.html`.

That alone isn't enough, because of how this project serves `dist/` in
production (`npx serve dist -l $PORT`, Render's start command for
`atlas-health-web`). The original start command used `serve`'s `-s`
(`--single`) flag, meant for SPA fallback — but `-s` installs an *implicit
catch-all rewrite* that matches every extensionless path (including
`/privacy` and `/terms`) straight to `index.html`, and `serve-handler`
checks that rewrite *before* checking whether a real file exists on disk.
So the generated static pages were being silently shadowed by the SPA
shell even though they existed and were correct.

The fix for that: drop `-s` entirely, and use `public/serve.json`
(copied into `dist/` by Vite automatically) with `rewrites` scoped only to
the two paths that actually need SPA fallback:

```json
{
  "rewrites": [
    { "source": "/otp-landing", "destination": "/index.html" },
    { "source": "/otp-landing/**", "destination": "/index.html" },
    { "source": "/learn", "destination": "/index.html" },
    { "source": "/learn/**", "destination": "/index.html" }
  ]
}
```

With no rewrite claiming `/privacy` or `/terms`, `serve` falls through to
its normal static/directory lookup and serves the real prerendered files.
`scripts/generate-legal-pages.mjs` also copies the SPA shell to
`dist/404.html`, so a genuinely unknown path (stray old link, typo) still
gets the SPA shell body — preserving `App.jsx`'s client-side
redirect-to-`/` for bad links — while correctly returning a real HTTP 404
status instead of the old silent 200.

**Render's start command for `atlas-health-web` must be
`npx serve dist -l $PORT`** (no `-s`) for this to work — verified locally
by running the built `dist/` through `serve` without `-s` and fetching
`/privacy`, `/terms`, `/`, `/otp-landing`, `/learn/...`, and an unknown
path directly.

## 9. Page structure

```
src/
  App.jsx                  landing → quiz → results orchestration
  components/
    LandingHero.jsx         minimal ad-landing page
    ComplianceFooter.jsx    shared disclaimer + links
    ResultsPage.jsx         confirmation + next-step CTA
    IconSprite.jsx / Icon.jsx
    quiz/
      QuizEngine.jsx         reads quizConfig.js, renders the active step
      ProgressBar.jsx
      StepShell.jsx          shared header/question/CTA-bar chrome
      StepCards.jsx / StepYesNo.jsx / StepAge.jsx / StepDob.jsx
      StepZip.jsx / StepContact.jsx / StepPhone.jsx  (still used by the
        Fast Track variant's step list; the default Guided flow uses
        StepContactInfo.jsx instead, which combines all three)
      StepDependentAges.jsx  (no longer referenced by either step list —
        kept in case per-dependent detail is wanted again)
      StepOtp.jsx / StepConsent.jsx
  data/
    quizConfig.js           question flow — the single source of truth
  lib/
    zipToState.js  leadScoring.js  leadRouting.js
    tracking.js  progress.js  businessHours.js
  styles/
    tokens.css (palette)  global.css (everything else, mobile-first)
```

## 10. Follow-up automation architecture

Intended speed-to-lead sequence once a lead is OTP-verified and submitted:

1. `POST /api/leads` (server, stubbed) receives the payload from §5.
2. Server re-scores with the same `leadScoring.js` logic (never trusts a
   client-computed score) and re-validates OTP status server-side.
3. `server/lib/ghl.js` (stub): upsert GHL contact, apply tags, set custom
   fields per §6, which should trigger GHL workflows for: immediate SMS,
   immediate email, agent Slack/SMS notification, and a call task assigned
   to the right agent/team by routing rules.
4. `server/lib/meta.js` (stub): send the server-side Conversions API event
   (hashed email/phone) for the same event tracked client-side, so Meta gets
   a first-party-verified duplicate signal alongside the Pixel event.
5. Downstream outcome tracking (contacted / quoted / applied / enrolled /
   sold) is **not** something the frontend can know — it has to be written
   back into GHL as the deal progresses (by agents or GHL automations) and
   then optionally re-sent to Meta as an offline conversion event days/weeks
   later. The data model above is intentionally CRM-first so that pipeline
   is possible; no funnel code needs to change to support it.

---

## Review pass

**Conversion friction.** Landing → quiz is a single tap. Every quiz step is
single-question, and card/yes-no steps auto-advance without a second
"Continue" tap. Text/numeric steps (age, ZIP, phone) still require Continue
because those need a value to validate first. Consent is the one screen with
real reading load — that's unavoidable given the compliance requirement, so
it's placed last, after the person has already invested time, and it shows a
compact summary rather than repeating the whole quiz.

**Mobile UX.** Every step is a `min-height: 100svh/100dvh` flex column, one
question fits the viewport without scrolling, inputs are 16px+ (blocks iOS
auto-zoom), tap targets are 52px+ minimum, the CTA bar respects
`env(safe-area-inset-bottom)`, OTP boxes carry `autoComplete="one-time-code"`
for SMS autofill, and progress persists to `sessionStorage` so switching to
the Messages app for the OTP code and back doesn't lose state. What's
**not** verified here: actual behavior inside the Facebook/Instagram in-app
browser, actual SMS autofill behavior on a real device, and real Core Web
Vitals under cellular throttling — those need a real device/network QA pass
this environment can't perform. Flagging that gap explicitly rather than
claiming it's been tested.

**Lead quality.** Phone is collected last and gated by OTP before a lead
counts as submitted; scoring weights verification most heavily; the funnel
never asks for phone up front, which keeps early-funnel abandonment from
generating unverified "leads" with a live phone number attached.

**Speed-to-lead.** Architecture is in place (§10) but **not live** — see
"what's stubbed" below.

**Tracking accuracy.** Event names match the spec exactly; UTM/fbclid
capture happens once per session and is preserved across the funnel; no PII
travels through client-side tracking calls. Not verified: real Pixel/CAPI
event-match quality, which depends on real Pixel/dataset IDs this project
doesn't have.

**Privacy/security.** No sensitive data appears in URLs (ZIP/phone/etc. are
posted in the request body of the eventual API call, not query strings); no
PII reaches `fbq`/`gtag`; OTP codes are 6-digit and expire on resend; the
in-browser "demo mode" OTP banner is clearly labeled as non-production and
must be removed once real Twilio Verify is wired in — it currently displays
the code so the funnel is testable end-to-end without a backend, which is
correct for this stage but would be a real vulnerability if shipped as-is.

**Misleading insurance claims.** No government branding, no Medicare
imagery, no countdown/scarcity, no "everyone qualifies" language, no
specific savings claims — checked against every copy string in
`LandingHero.jsx`, `ResultsPage.jsx`, and `StepConsent.jsx`.

**TCPA/consent risk.** Consent is unchecked by default, visible, and
specific about autodialer/prerecorded-voice contact — but it is placeholder
copy that has not been reviewed by actual counsel, and this document says so
in two places on purpose. Do not launch paid traffic against this consent
language without that review.

**Health-insurance advertising compliance.** The one open structural
question is the eligibility/underwriting question block, which is
deliberately left disabled rather than guessed at — see §3. Building that
block with placeholder logic would have been worse than leaving it out: an
invented disqualification rule could plausibly violate actual insurance
advertising regulations in ways generic engineering judgment can't catch.

### What's stubbed vs. what's real

**Real and working**: the full quiz flow and branching logic, mobile-first
responsive layout, progress persistence, lead scoring, ZIP→state lookup,
OTP UX (client-side simulated), consent gating, results-page business-hours
logic, and the tracking event layer's shape (fires real `fbq`/`gtag` calls
*if* real IDs are configured).

**Stubbed, clearly marked, not live**: actual SMS delivery (Twilio Verify),
actual CRM writes (GoHighLevel API), actual server-side Meta CAPI calls, and
the `/api/leads` /`/api/otp/*` backend itself — see `server/README.md` for
exactly what's stubbed and what credentials/setup are needed to make each
piece real.
