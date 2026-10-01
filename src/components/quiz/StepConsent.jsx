// Clear, visible, NOT pre-checked TCPA-style consent. Shown right after
// contact info is collected and BEFORE the OTP step (which sends a real
// text the instant it mounts) — see the ordering comment in
// data/quizConfig.js for why that order matters. Keep this component's
// only job "render whatever consent text + links are configured and report
// checked/unchecked state" -
// the actual legal language should be editable without touching engine code
// (swap CONSENT_COPY for values pulled from a CMS/config if that's easier
// for legal to manage).
// Exported so ResultsPage.jsx can send the exact text the visitor saw and
// agreed to as tcpa_text when the lead is sold (Lead Prosper and other
// buyers expect the literal consent language, not a paraphrase of it).
export const CONSENT_COPY = {
  text:
    'I agree Atlas Health may share my information with licensed insurance agents contracted ' +
    'with Veritas Insurance Solutions, and that Atlas Health and those agents may contact me ' +
    'by call, text, or email — including by autodialer — about health ' +
    'insurance options, even if I’m on a Do Not Call list. Calls are not recorded, but may be ' +
    'transcribed for quality assurance purposes. Msg & data rates may apply. Reply STOP to opt out.',
  links: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

export default function StepConsent({ checked, onChange, summary }) {
  return (
    <div className="quiz-consent">
      {summary && (
        <div className="quiz-consent-summary">
          {summary.map((row) => (
            <div className="quiz-consent-row" key={row.label}>
              <span className="quiz-consent-row-label">{row.label}</span>
              <span className="quiz-consent-row-value">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      <label className="quiz-consent-check">
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{CONSENT_COPY.text}</span>
      </label>

      <div className="quiz-consent-links">
        {CONSENT_COPY.links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
