// Minimal, compliant ad-landing hero. This is deliberately short: for paid
// social traffic, a long scroll before the CTA is friction, not
// persuasion. Copy follows the funnel spec exactly, including the required
// trust bullets and the explicit prohibitions (no government branding, no
// Medicare imagery, no fake countdowns/scarcity, no "everyone qualifies"
// language, no unsubstantiated savings figures).
import AtlasMark from './AtlasMark.jsx';

const TRUST_BULLETS = [
  'Takes about 2 minutes',
  'No obligation to enroll',
  'Reviewed by licensed insurance professionals',
  'Plans and pricing vary by state and eligibility',
];

const PRODUCT_CHIPS = ['PPO', 'Self-Employed', 'Individual', 'Family', 'Small Business'];

export default function LandingHero({ onStart }) {
  return (
    <div className="landing">
      <div className="landing-brand">
        <AtlasMark />
        <span>
          <span className="brand-word">ATLAS HEALTH</span>
          <span className="brand-sub">A VERITAS COMPANY</span>
        </span>
      </div>

      <div className="landing-body">
        <span className="pill-badge pill-badge-light" style={{ alignSelf: 'center' }}>
          <span className="pill-badge-dot" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          No obligation to enroll
        </span>

        <h1 className="landing-headline">See What Private Health Plans You May Qualify For</h1>
        <p className="landing-subcopy">
          Answer a few questions to compare health coverage options available in your area.
        </p>

        <button type="button" className="btn btn-primary btn-block landing-cta" onClick={onStart}>
          Check My Options
        </button>

        <ul className="landing-chips" aria-label="Coverage types">
          {PRODUCT_CHIPS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <ul className="landing-trust">
          {TRUST_BULLETS.map((t) => (
            <li key={t}>
              <span className="landing-trust-dot" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <p className="landing-footnote">
        Atlas Health, a Veritas company, connects you with licensed insurance agents
        contracted with Veritas Insurance Solutions. Atlas Health does not sell insurance
        directly and is not affiliated with or endorsed by any government agency, including the
        federal Health Insurance Marketplace or Medicare.
      </p>
    </div>
  );
}
