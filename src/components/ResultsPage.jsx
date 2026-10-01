import { useEffect, useMemo, useState } from 'react';
import { zipToState } from '../lib/zipToState.js';
import { scoreLead } from '../lib/leadScoring.js';
import { getEligibilityRoute } from '../lib/leadRouting.js';
import { trackEvent, EVENTS } from '../lib/tracking.js';
import { submitLead, bookAppointment } from '../lib/api.js';
import { AGENT_SMS_HREF, AGENT_PHONE_DISPLAY, AGENT_PHONE_TEL } from '../data/legalContent.js';
import { CONSENT_COPY } from './quiz/StepConsent.jsx';
import { getTrustedFormCertUrl } from '../lib/trustedForm.js';

const COVERAGE_START_LABELS = {
  asap: 'As soon as possible',
  within_30: 'Within 30 days',
  within_60: 'Within 60 days',
  researching: 'Researching for later',
};

const BUDGET_LABELS = {
  under_150: 'Under $150/mo', '150_300': '$150–$300/mo', '300_450': '$300–$450/mo',
  '450_600': '$450–$600/mo', over_600: '$600+/mo', under_400: 'Under $400/mo',
  '400_700': '$400–$700/mo', '700_1000': '$700–$1,000/mo', '1000_1400': '$1,000–$1,400/mo',
  over_1400: '$1,400+/mo',
};

const HOUSEHOLD_LABELS = {
  just_me: 'Just you', spouse: 'You + spouse', children: 'You + child(ren)',
  family: 'Your family', children_only: 'Child(ren) only',
};

const TIME_SLOTS = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'];

export default function ResultsPage({ answers, attribution }) {
  const [scheduled, setScheduled] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedSlot, setSchedSlot] = useState(TIME_SLOTS[0]);
  // Set once submitLead()'s response comes back — the backend's row id for
  // this lead, needed so a later booking (confirmSchedule below) can tell
  // the backend *which* lead is booking, so it can look up the right Lead
  // Prosper buyer to invite. Comes back after render (it's a network call),
  // so it's genuinely possible (though rare) for someone to click "Schedule"
  // before this resolves — confirmSchedule() below handles that case.
  const [leadId, setLeadId] = useState(null);

  const state = useMemo(() => zipToState(answers.zip), [answers.zip]);
  const { score, tier } = useMemo(() => scoreLead(answers), [answers]);
  const routing = useMemo(() => getEligibilityRoute(answers), [answers]);
  const firstName = answers.contact?.firstName || 'there';
  // declineAndFinish() (QuizEngine.jsx) is the only path that sets
  // consent to the literal boolean false (everyone who completes the
  // normal path has consent:true, since the primary CTA on that step is
  // disabled until the box is checked). We use that to recognize the
  // "don't text me" exit and skip selling the lead below — see the
  // comment on the effect for why.
  const declined = answers.consent === false;

  // Submit once, on mount — but ONLY when the visitor didn't decline SMS
  // consent. We never got an OTP-verified phone number for a decline, so
  // we have no way to confirm the number is real; selling/sharing an
  // unverified number is exactly the bad-data problem we're avoiding.
  // Compliance-wise this is fine: Twilio's requirement (Error 30923) is
  // that declining consent must not block someone from *completing the
  // funnel and getting help* — it says nothing about whether we choose
  // to sell that submission. The UI below still gives decliners a real,
  // honest way to reach an agent (calling in themselves), so the funnel
  // is still "complete" for them even though nothing gets sold.
  //
  // Fire-and-forget from the UI's perspective — submitLead() (src/lib/api.js)
  // never throws and a failed/slow backend (e.g. Render's free tier waking
  // from idle) doesn't block this page from rendering; it just gets logged
  // as a warning. The leadId from the response is captured into state once
  // it arrives, for confirmSchedule().
  useEffect(() => {
    if (declined) return;
    submitLead({
      contact: answers.contact,
      phone: answers.phone,
      otpVerified: !!answers.otpVerified,
      dob: answers.dob,
      zip: answers.zip,
      state,
      household: answers.household,
      dependentAges: answers.dependentAges || [],
      primaryNeed: answers.primaryNeed,
      currentCoverage: answers.currentCoverage,
      coverageStatus: answers.coverageStatus,
      targetBudget: answers.targetBudget,
      coverageStart: answers.coverageStart,
      healthcareUsage: answers.healthcareUsage,
      takesMedication: answers.takesMedication,
      leadScore: score,
      leadTier: tier,
      routing: routing.route,
      attribution,
      // Always true here (the declined path returns above before this
      // runs), but kept explicit rather than hardcoded true in case this
      // function is ever reused for a path that isn't fully gated above.
      smsConsent: !!answers.consent,
      ...(answers.consent ? { tcpaText: CONSENT_COPY.text } : {}),
      trustedFormCertUrl: getTrustedFormCertUrl(),
      submittedAt: new Date().toISOString(),
    }).then((result) => {
      if (result?.data?.leadId != null) setLeadId(result.data.leadId);
    });
    trackEvent(EVENTS.QUALIFIED_LEAD, { tier });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmSchedule() {
    setScheduled(true);
    trackEvent(EVENTS.APPOINTMENT_SCHEDULED, { slot: schedSlot });
    // Fire-and-forget, same pattern as submitLead above — the consumer
    // already sees their confirmation on screen regardless of how this
    // resolves; a failure here only means the buyer/lead calendar invite
    // doesn't go out (logged server-side), not that the booking is lost.
    bookAppointment(leadId, { date: schedDate, slot: schedSlot });
  }

  // No submission happened for a decline (see the effect above) — a
  // scheduling box, booking confirmation, or "we'll call you" promise
  // here would all be lies, since nothing was sent anywhere. This screen
  // is the honest version: the funnel still "completes" (satisfying
  // Twilio's requirement that declining consent can't block someone from
  // finishing and getting help), but it's a self-service call-in, not a
  // promise that an agent will reach out.
  if (declined) {
    return (
      <div className="results-page">
        <div className="results-check" aria-hidden="true">✓</div>
        <h1 className="results-title">Thanks, {firstName}</h1>
        <p className="results-subtitle">
          Since we weren't able to verify your number, we're not able to automatically match
          you with an agent — but you can still get your questions answered right now.
        </p>
        <a className="btn btn-primary btn-block results-cta" href={AGENT_PHONE_TEL}>
          Call Us Now — {AGENT_PHONE_DISPLAY}
        </a>
        <p className="results-footnote">
          No plan recommendations or pricing are shown here; a licensed agent reviews real,
          current plan options with you directly.
        </p>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-check" aria-hidden="true">✓</div>
      <h1 className="results-title">Your Coverage Assessment Is Complete</h1>
      <p className="results-subtitle">
        Thanks, {firstName} — {routing.message}
      </p>

      <div className="results-summary">
        <div className="results-summary-row">
          <span>Household</span>
          <span>{HOUSEHOLD_LABELS[answers.household] || '—'}</span>
        </div>
        <div className="results-summary-row">
          <span>Location</span>
          <span>{state ? `${state} (${answers.zip})` : answers.zip || '—'}</span>
        </div>
        <div className="results-summary-row">
          <span>Desired start</span>
          <span>{COVERAGE_START_LABELS[answers.coverageStart] || '—'}</span>
        </div>
        <div className="results-summary-row">
          <span>Target budget</span>
          <span>{BUDGET_LABELS[answers.targetBudget] || '—'}</span>
        </div>
      </div>

      <div className="results-schedule">
        <p className="results-schedule-label">
          Pick a time that works best for you:
        </p>
        {!scheduled ? (
          <>
            <input
              type="date"
              className="quiz-input"
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
            />
            <div className="results-slots">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`quiz-card quiz-card-compact${schedSlot === slot ? ' is-selected' : ''}`}
                  onClick={() => setSchedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block results-cta"
              disabled={!schedDate}
              onClick={confirmSchedule}
            >
              Schedule My Coverage Review
            </button>
          </>
        ) : (
          <p className="results-scheduled-confirm">
            You're booked for {schedDate} at {schedSlot}. A licensed agent will call{' '}
            {answers.phone ? `(${answers.phone.slice(0, 3)}) ${answers.phone.slice(3, 6)}-${answers.phone.slice(6)}` : 'you'} then.
          </p>
        )}
      </div>

      <a className="btn btn-ghost btn-block results-secondary" href={AGENT_SMS_HREF}>
        Text an Agent Now — {AGENT_PHONE_DISPLAY}
      </a>

      <p className="results-footnote">
        No plan recommendations or pricing are shown here; a licensed agent reviews real, current
        plan options with you directly.
      </p>
    </div>
  );
}
