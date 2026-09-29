import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE, useMotionSafe } from '../motion/primitives.jsx';

// A lightweight two-question "wayfinding" widget, not a lead form - no
// name/email/phone here. It exists to give an undecided visitor a sense of
// motion and progress ("your next step") before they ever hit the real
// qualification flow at /otp-landing. Selections aren't submitted anywhere;
// they only steer the closing message and the CTA's destination.
const WHO_OPTIONS = ['Individual', 'Family', 'Self-Employed', 'Business'];
const CURRENT_OPTIONS = ['Marketplace', 'Employer', 'Private', 'Not Insured', 'Not Sure'];

// Small grounded glyphs for the "who" tiles only - step 2/3 stay plain text
// rows since they don't map to a tidy 2x2 grid.
const WHO_ICONS = {
  Individual: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
    </svg>
  ),
  Family: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9.2" r="2.3" />
      <path d="M2.5 20c0-3.3 2.68-6 6-6s6 2.7 6 6" />
      <path d="M14.5 14.6c2.6.4 4.5 2.5 4.5 5.4" />
    </svg>
  ),
  'Self-Employed': (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
  Business: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 21v-4h6v4M8.5 8h1.2M14.3 8h1.2M8.5 12h1.2M14.3 12h1.2" />
    </svg>
  ),
};

const NEXT_STEP_COPY = {
  'Not Insured': 'Since you’re not currently covered, the fastest path is usually seeing what you qualify for directly.',
  'Not Sure': 'When it’s not clear what you have, a quick side-by-side of your options is the easiest way to find out.',
  default: 'Based on what you told us, comparing your options directly is the fastest way to see what fits.',
};

function StepShell({ stepKey, children }) {
  const safe = useMotionSafe();
  if (!safe) return <div className="coverage-path-step">{children}</div>;
  return (
    <motion.div
      key={stepKey}
      className="coverage-path-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function CoveragePathStepper() {
  const [step, setStep] = useState(1);
  const [who, setWho] = useState(null);
  const [current, setCurrent] = useState(null);

  function reset() {
    setStep(1);
    setWho(null);
    setCurrent(null);
  }

  const nextStepCopy = current && NEXT_STEP_COPY[current] ? NEXT_STEP_COPY[current] : NEXT_STEP_COPY.default;

  return (
    <div className="coverage-path">
      <div className="coverage-path-head">
        <span className="coverage-path-eyebrow">Find your direction</span>
        <div className="coverage-path-progress" aria-hidden="true">
          <span className={step >= 1 ? 'is-active' : ''} />
          <span className={step >= 2 ? 'is-active' : ''} />
          <span className={step >= 3 ? 'is-active' : ''} />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <StepShell stepKey="step1">
            <h3 className="coverage-path-q">What are you looking for?</h3>
            <div className="coverage-path-options coverage-path-options-tiles">
              {WHO_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className="coverage-path-option coverage-path-option-tile"
                  onClick={() => {
                    setWho(opt);
                    setStep(2);
                  }}
                >
                  <span className="coverage-path-option-icon" aria-hidden="true">{WHO_ICONS[opt]}</span>
                  {opt}
                  <span className="coverage-path-option-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell stepKey="step2">
            <button type="button" className="coverage-path-back" onClick={() => setStep(1)}>
              ← {who}
            </button>
            <h3 className="coverage-path-q">Where do you get coverage now?</h3>
            <div className="coverage-path-options">
              {CURRENT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className="coverage-path-option"
                  onClick={() => {
                    setCurrent(opt);
                    setStep(3);
                  }}
                >
                  {opt}
                  <span className="coverage-path-option-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell stepKey="step3">
            <button type="button" className="coverage-path-back" onClick={() => setStep(2)}>
              ← {current}
            </button>
            <h3 className="coverage-path-q">Your next step</h3>
            <p className="coverage-path-result-copy">{nextStepCopy}</p>
            <div className="coverage-path-result-actions">
              <a className="btn btn-primary" href="/otp-landing?start=1">
                See My Options →
              </a>
              <button type="button" className="coverage-path-restart" onClick={reset}>
                Start over
              </button>
            </div>
          </StepShell>
        )}
      </AnimatePresence>
    </div>
  );
}
