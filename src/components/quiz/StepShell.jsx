// Common shell every quiz step renders inside: back button + progress bar up
// top, question + helper text, the step's own content, and an optional
// sticky bottom continue button. Steps that auto-advance (single-select
// cards, yes/no) pass showContinue={false} so there's nothing to tap beyond
// the choice itself - fewer taps, faster funnel, per the mobile-first spec.
export default function StepShell({
  question,
  helper,
  children,
  onBack,
  canGoBack,
  current,
  total,
  progressBar,
  showContinue,
  continueLabel = 'Continue',
  continueDisabled,
  onContinue,
}) {
  return (
    <div className="quiz-step">
      <div className="quiz-step-top">
        <button
          type="button"
          className="quiz-back"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Back"
        >
          ←
        </button>
        {progressBar}
      </div>
      <div className="quiz-step-body">
        <h1 className="quiz-question">{question}</h1>
        {helper && <p className="quiz-helper">{helper}</p>}
        <div className="quiz-step-content">{children}</div>
      </div>
      {showContinue && (
        <div className="quiz-cta-bar">
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={continueDisabled}
            onClick={onContinue}
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}
