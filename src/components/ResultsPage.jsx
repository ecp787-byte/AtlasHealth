import { useMemo, useState } from 'react';
import { zipToState } from '../lib/zipToState.js';
import { scoreLead } from '../lib/leadScoring.js';
import { getEligibilityRoute } from '../lib/leadRouting.js';
import { isDuringBusinessHours } from '../lib/businessHours.js';
import { trackEvent, EVENTS } from '../lib/tracking.js';
import { submitLead } from '../lib/api.js';
import { AGENT_PHONE_TEL, AGENT_PHONE_DISPLAY } from '../data/legalContent.js';
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

  const state = useMemo(() => zipToState(answers.zip), [answers.zip]);
  const { score, tier } = useMemo(() => scoreLead(answers), [answers]);
  const routing = useMemo(() => getEligibilityRoute(answers), [answers]);
  const duringHours = isDuringBusinessHours();
  const firstName = answers.contact?.firstName || 'there';

  // Submit once, on first render of the results page. Fire-and-forget from
  // the UI's perspective — submitLead() (src/lib/api.js) never throws and a
  // failed/slow backend (e.g. Render's free tier waking from idle) doesn't
  // block this page from rendering; it just gets logged as a warning.
  useMemo(() => {
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
      currentPremium: answers.currentPremium,
      targetBudget: answers.targetBudget,
      coverageStart: answers.coverageStart,
      healthcareUsage: answers.healthcareUsage,
      takesMedication: answers.takesMedication,
      leadScore: score,
      leadTier: tier,
      routing: routing.route,
      attribution,
      tcpaText: CONSENT_COPY.text,
      trustedFormCertUrl: getTrustedFormCertUrl(),
      submittedAt: new Date().toISOString(),
    });
    trackEvent(EVENTS.QUALIFIED_LEAD, { tier });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmSchedule() {
    setScheduled(true);
    trackEvent(EVENTS.APPOINTMENT_SCHEDULED, { slot: schedSlot });
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

      {duringHours ? (
        <a className="btn btn-primary btn-block results-cta" href={AGENT_PHONE_TEL}>
          Speak With an Agent Now — {AGENT_PHONE_DISPLAY}
        </a>
      ) : (
        <div className="results-schedule">
          <p className="results-schedule-label">
            Our licensed agents are offline right now — schedule a callback:
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
      )}

      <a className="btn btn-ghost btn-block results-secondary" href={AGENT_PHONE_TEL}>
        Speak With a Licensed Agent — {AGENT_PHONE_DISPLAY}
      </a>

      <p className="results-footnote">
        No plan recommendations or pricing are shown here; a licensed agent reviews real, current
        plan options with you directly.
      </p>
    </div>
  );
}
