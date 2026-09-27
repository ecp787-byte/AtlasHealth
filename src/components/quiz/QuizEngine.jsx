import { useEffect, useMemo, useState } from 'react';
import {
  STEP_TYPES,
  getActiveSteps,
  getTargetBudgetOptions,
} from '../../data/quizConfig.js';
import { saveProgress, loadProgress, clearProgress } from '../../lib/progress.js';
import { trackEvent, EVENTS } from '../../lib/tracking.js';
import ProgressBar from './ProgressBar.jsx';
import StepShell from './StepShell.jsx';
import StepCards from './StepCards.jsx';
import StepYesNo from './StepYesNo.jsx';
import StepAge, { isValidAge } from './StepAge.jsx';
import StepDob, { isValidDob } from './StepDob.jsx';
import StepDependentAges, { dependentAgesValid } from './StepDependentAges.jsx';
import StepZip from './StepZip.jsx';
import { isValidZip } from '../../lib/zipToState.js';
import StepContact, { contactValid } from './StepContact.jsx';
import StepPhone, { isValidPhone } from './StepPhone.jsx';
import StepOtp from './StepOtp.jsx';
import StepConsent from './StepConsent.jsx';

const AUTO_ADVANCE_TYPES = new Set([STEP_TYPES.CARDS, STEP_TYPES.YES_NO]);

const HOUSEHOLD_SUMMARY_LABELS = {
  just_me: 'Just me', spouse: 'Me + spouse', children: 'Me + child(ren)',
  family: 'Family', children_only: 'Child(ren) only',
};

const COVERAGE_START_SUMMARY_LABELS = {
  asap: 'As soon as possible', within_30: 'Within 30 days',
  within_60: 'Within 60 days', researching: 'Researching for later',
};

function formatPhoneDisplay(digits) {
  const d = (digits || '').replace(/\D/g, '');
  if (d.length !== 10) return digits;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function QuizEngine({ onComplete }) {
  const [answers, setAnswers] = useState(() => loadProgress()?.answers || {});
  const [stepIndex, setStepIndex] = useState(() => loadProgress()?.stepIndex || 0);
  const [started, setStarted] = useState(false);

  const activeSteps = useMemo(() => getActiveSteps(answers), [answers]);
  // Clamp in case answers changed in a way that shrinks the active list
  // (e.g. going back and changing "household" from "family" to "just_me"
  // drops the dependent-ages step).
  const safeIndex = Math.min(stepIndex, activeSteps.length - 1);
  const step = activeSteps[safeIndex];

  useEffect(() => {
    if (!started) {
      trackEvent(EVENTS.QUIZ_STARTED);
      setStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveProgress({ answers, stepIndex: safeIndex });
  }, [answers, safeIndex]);

  useEffect(() => {
    if (step) {
      trackEvent(EVENTS.QUIZ_PROGRESS, { step: step.id, index: safeIndex, total: activeSteps.length });
    }
  }, [step?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!step) return null;

  function setField(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    if (safeIndex + 1 >= activeSteps.length) {
      finish();
      return;
    }
    setStepIndex(safeIndex + 1);
  }

  function goBack() {
    if (safeIndex === 0) return;
    setStepIndex(safeIndex - 1);
  }

  function finish() {
    const finalAnswers = { ...answers, assessmentCompleted: true };
    trackEvent(EVENTS.LEAD);
    clearProgress();
    onComplete(finalAnswers);
  }

  const field = step.field;
  const value = answers[field];
  const progressBar = <ProgressBar current={safeIndex + 1} total={activeSteps.length} />;

  const shellCommon = {
    question: step.question,
    helper: step.helper,
    onBack: goBack,
    canGoBack: safeIndex > 0,
    progressBar,
  };

  switch (step.type) {
    case STEP_TYPES.CARDS: {
      const options = step.dynamicOptions === 'targetBudget' ? getTargetBudgetOptions(answers) : step.options;
      return (
        <StepShell {...shellCommon} showContinue={false}>
          <StepCards
            options={options}
            value={value}
            onSelect={(v) => {
              setField(field, v);
              // Let the selection render before advancing so the user sees
              // the checkmark land.
              requestAnimationFrame(goNext);
            }}
          />
        </StepShell>
      );
    }

    case STEP_TYPES.YES_NO:
      return (
        <StepShell {...shellCommon} showContinue={false}>
          <StepYesNo
            value={value}
            onSelect={(v) => {
              setField(field, v);
              requestAnimationFrame(goNext);
            }}
          />
        </StepShell>
      );

    case STEP_TYPES.AGE:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!isValidAge(value)}
          onContinue={goNext}
        >
          <StepAge value={value} onChange={(v) => setField(field, v)} autoFocus />
        </StepShell>
      );

    case STEP_TYPES.DOB:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!isValidDob(value)}
          onContinue={goNext}
        >
          <StepDob value={value} onChange={(v) => setField(field, v)} autoFocus />
        </StepShell>
      );

    case STEP_TYPES.DEPENDENT_AGES:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!dependentAgesValid(value)}
          onContinue={goNext}
        >
          <StepDependentAges value={value} onChange={(v) => setField(field, v)} />
        </StepShell>
      );

    case STEP_TYPES.ZIP:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!isValidZip(value)}
          onContinue={goNext}
        >
          <StepZip value={value} onChange={(v) => setField(field, v)} autoFocus />
        </StepShell>
      );

    case STEP_TYPES.CONTACT:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!contactValid(value)}
          onContinue={goNext}
        >
          <StepContact value={value} onChange={(v) => setField(field, v)} />
        </StepShell>
      );

    case STEP_TYPES.TEXT:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!value}
          onContinue={goNext}
        >
          <div className="quiz-single-input">
            <input
              type={step.inputType || 'text'}
              className="quiz-input quiz-input-large"
              value={value || ''}
              onChange={(e) => setField(field, e.target.value)}
            />
          </div>
        </StepShell>
      );

    case STEP_TYPES.PHONE:
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueDisabled={!isValidPhone(value)}
          continueLabel="Send code"
          onContinue={() => {
            trackEvent(EVENTS.PHONE_SUBMITTED);
            goNext();
          }}
        >
          <StepPhone value={value} onChange={(v) => setField(field, v)} autoFocus />
        </StepShell>
      );

    case STEP_TYPES.OTP:
      return (
        <StepShell {...shellCommon} showContinue={false}>
          <StepOtp
            phone={formatPhoneDisplay(answers.phone)}
            onVerified={() => {
              setField(field, true);
              trackEvent(EVENTS.OTP_VERIFIED);
              requestAnimationFrame(goNext);
            }}
            onChangeNumber={goBack}
          />
        </StepShell>
      );

    case STEP_TYPES.CONSENT: {
      const summary = [
        { label: 'Name', value: answers.contact ? `${answers.contact.firstName} ${answers.contact.lastName}` : '—' },
        { label: 'ZIP code', value: answers.zip || '—' },
        { label: 'Household', value: HOUSEHOLD_SUMMARY_LABELS[answers.household] || '—' },
        { label: 'Coverage start', value: COVERAGE_START_SUMMARY_LABELS[answers.coverageStart] || '—' },
      ];
      return (
        <StepShell
          {...shellCommon}
          showContinue
          continueLabel="Submit"
          continueDisabled={!value}
          onContinue={finish}
        >
          <StepConsent checked={value} onChange={(v) => setField(field, v)} summary={summary} />
        </StepShell>
      );
    }

    default:
      return null;
  }
}
