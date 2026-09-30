import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE, useMotionSafe } from '../motion/primitives.jsx';

// Sibling to CoveragePathStepper - same card shell and visual language
// (reuses the .coverage-path* classes wholesale), but a single question
// instead of a three-step flow: not "who are you" but "what matters most
// to you", since that's a different, complementary way for an undecided
// visitor to find their way into the same /otp-landing flow. Selections
// aren't submitted anywhere; they only steer the closing message.
//
// Labels are deliberately single words (not "Better coverage", "Save
// money", etc.) so every tile wraps to exactly one line, same as the
// sibling CoveragePathStepper card's options - with two-word labels here
// and mostly-one-word labels there, this card came out visibly taller
// and the pair read as mismatched sitting side by side. The fuller
// phrasing still comes through in the result copy once a tile is picked.
const GOAL_OPTIONS = ['Coverage', 'Savings', 'Flexibility', 'Confidence'];

const GOAL_ICONS = {
  Coverage: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Savings: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.3c0-1.1 1.1-2 2.5-2s2.5.7 2.5 1.8-1.1 1.6-2.5 1.9-2.5.8-2.5 1.9S10.6 15 12 15s2.5-.6 2.5-1.7" />
    </svg>
  ),
  Flexibility: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 7h11M4 7l3.5-3.5M4 7l3.5 3.5" />
      <path d="M20 17H9M20 17l-3.5-3.5M20 17l-3.5 3.5" />
    </svg>
  ),
  Confidence: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 20.5s-7.5-4.3-7.5-10a4.7 4.7 0 018.5-2.8A4.7 4.7 0 0121.5 10.5c0 5.7-7.5 10-7.5 10z" />
    </svg>
  ),
};

const GOAL_RESULT_COPY = {
  Coverage: 'Better coverage usually means comparing what’s actually included, not just the price tag — we’ll help you see the real difference between plans.',
  Savings: 'Saving money often starts with subsidies you may qualify for — we’ll show you real numbers for your situation, not a guess.',
  Flexibility: 'More flexibility usually comes down to plan type and network — we’ll help you find options that fit how and where you actually get care.',
  Confidence: 'Peace of mind comes from understanding your options clearly — we’ll walk through it with you, with no obligation to enroll.',
};

function GoalStepShell({ stepKey, children }) {
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

export default function GoalsPathCard() {
  const [goal, setGoal] = useState(null);

  return (
    <div className="coverage-path">
      {/* Eyebrow only, no right-side decoration - the sibling card's
          progress dots mean something (step 1 of 3); this card is a
          single question, so a matching-but-meaningless decoration would
          just be noise. Keeping the header this plain also means both
          headers sit at the same height and weight, reading as a matched
          pair rather than two different widgets bolted together. */}
      <div className="coverage-path-head">
        <span className="coverage-path-eyebrow">Your goals</span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!goal && (
          <GoalStepShell stepKey="ask">
            <h3 className="coverage-path-q">What matters most to you?</h3>
            <div className="coverage-path-options coverage-path-options-tiles">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className="coverage-path-option coverage-path-option-tile"
                  onClick={() => setGoal(opt)}
                >
                  <span className="coverage-path-option-icon" aria-hidden="true">{GOAL_ICONS[opt]}</span>
                  {opt}
                  <span className="coverage-path-option-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </GoalStepShell>
        )}

        {goal && (
          <GoalStepShell stepKey="result">
            <button type="button" className="coverage-path-back" onClick={() => setGoal(null)}>
              ← {goal}
            </button>
            <h3 className="coverage-path-q">Good to know</h3>
            <p className="coverage-path-result-copy">{GOAL_RESULT_COPY[goal]}</p>
            <div className="coverage-path-result-actions">
              <a className="btn btn-primary" href="/otp-landing?start=1">
                See My Options →
              </a>
              <button type="button" className="coverage-path-restart" onClick={() => setGoal(null)}>
                Choose a different goal
              </button>
            </div>
          </GoalStepShell>
        )}
      </AnimatePresence>
    </div>
  );
}
