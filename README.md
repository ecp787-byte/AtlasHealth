# Atlas Health Coverage Assessment Funnel

A mobile-first, one-question-per-screen health-insurance lead-generation
funnel for Atlas Health, a Veritas company: minimal landing page → quiz →
OTP-verified contact capture → results/next-step page. Full design rationale,
question flow, conditional logic, scoring model, data schema, CRM mapping,
tracking architecture, and a compliance/UX review live in
**[ARCHITECTURE.md](./ARCHITECTURE.md)** — read that first.

## Running the frontend

```bash
npm install
npm run dev       # local dev server
npm run build     # production build, output in dist/
npm run preview   # serve the production build locally
```

Requires Node 18+.

## Funnel variants

`src/data/quizConfig.js` supports two question flows, switched at build time
via `VITE_FUNNEL_VARIANT` (defaults to `guided` if unset):

```bash
npm run build                                   # Guided Match (default) — ~12 screens, deepest lead-scoring signal
VITE_FUNNEL_VARIANT=fast_track npm run build     # Fast Track — ~7 single-select questions, built for cold paid-social traffic
```

Both variants share the same engine, lead scoring, results page, and OTP/
consent steps — only the step list in `QUIZ_STEPS` vs. `FAST_TRACK_STEPS`
differs. Fast Track asks date of birth (not a bare age) and skips the
dependent-ages/current-coverage detail questions the Guided flow has, which
is a deliberate trade of lead-scoring resolution for completion rate — see
the comments above `FAST_TRACK_STEPS` in `quizConfig.js`. Add a third
variant the same way: a new step array plus a new `FUNNEL_VARIANT` branch in
`getActiveSteps()`.

## Running the backend scaffold

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

See `server/README.md` — it's a real, runnable Express API, but SMS delivery,
GoHighLevel, and Meta Conversions API are documented stubs, not live
integrations. Read that file before pointing real ad spend at this.

## Project structure

```
src/
  App.jsx                landing -> quiz -> results orchestration
  data/quizConfig.js      the question flow - single source of truth, kept
                           deliberately separate from rendering. Add/reorder/
                           reword/branch a question here, not in a component.
  components/
    LandingHero.jsx        minimal ad-landing page
    ResultsPage.jsx         confirmation + next-step CTA
    ComplianceFooter.jsx    shared disclaimer + links
    quiz/                   QuizEngine + one component per step type
  lib/
    leadScoring.js          0-100 scoring + HOT/WARM/NURTURE tiering
    leadRouting.js          soft-decline routing (never a hard rejection)
    zipToState.js           approximate ZIP -> state lookup
    tracking.js             UTM/fbclid capture + Pixel/GA4 event layer
    progress.js             sessionStorage-backed funnel resume
    businessHours.js        call-now vs. schedule-later logic
  styles/
    tokens.css              color/type palette - a re-theme starts here
    global.css               everything else, mobile-first
server/                    Express API scaffold - see server/README.md
```

## Before this goes live

Everything below is flagged inline (a "Sample" tag in the UI, or a
`TODO(backend)` / stub-file header in code) — this list is just the
consolidated version:

- **OTP delivery** is simulated client-side (`StepOtp.jsx` shows the code in
  a "Demo mode" banner) because the backend's SMS integration
  (`server/lib/otp.js`) is a documented Twilio Verify stub, not live. Never
  ship the demo-mode code display to production traffic.
- **Lead submission** (`ResultsPage.jsx`'s `submitLead`) currently only logs
  the payload to the console. Point it at `POST /api/leads` once the backend
  is deployed.
- **CRM (GoHighLevel) and Meta Conversions API** are stubs that log what they
  would send — see `server/lib/ghl.js` and `server/lib/meta.js` for the exact
  swap-in code and required credentials.
- **Consent/compliance copy** (`StepConsent.jsx`, `ComplianceFooter.jsx`) is
  sample TCPA/disclosure language. Have compliance/legal review and finalize
  it — and fill in the placeholder licensed-states, NPN, and policy links —
  before sending this real traffic.
- **Eligibility/underwriting questions** are intentionally disabled
  (`ELIGIBILITY_ENABLED = false` in `quizConfig.js`) until real carrier
  underwriting rules exist. See ARCHITECTURE.md §3 before enabling.
- **ZIP→state lookup** (`zipToState.js`) is an approximate 3-digit-prefix
  table, fine for personalization copy, not authoritative enough for
  eligibility or legal/licensing decisions.
