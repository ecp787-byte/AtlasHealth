// Common shell every quiz step renders inside: back button + progress bar up
// top, question + helper text, the step's own content, and an optional
// sticky bottom continue button. Steps that auto-advance (single-select
// cards, yes/no) pass showContinue={false} so there's nothing to tap beyond
// the choice itself - fewer taps, faster funnel, per the mobile-first spec.
//
// quiz-step-body/cta-bar/legal-footer are wrapped together in
// quiz-step-center (below quiz-step-top, which stays pinned to the very
// top always) so the question, its input, the Continue button, and the
// footer get centered on screen as ONE block, instead of each fighting
// for space independently. The earlier version gave quiz-step-body its
// own flex:1 + center, while quiz-cta-bar lived outside it pinned via
// position:sticky to the literal bottom of the viewport - on a short
// phone screen that's invisible (there's no slack to show), but on a
// tall desktop browser window it meant the button sat hundreds of
// pixels below the (separately centered) question, with a big dead gap
// between them. Grouping them removes that gap; position:sticky on the
// CTA bar still takes over gracefully if a step's content is ever long
// enough to need scrolling (e.g. consent's full legal text on a short
// screen), so nothing is lost there.
//
// Every step also renders a small Privacy Policy / Terms & Conditions link
// row at the very bottom (quiz-legal-footer below) - not just the consent
// step. Twilio's A2P reviewers hit this funnel directly at
// /otp-landing?start=1 (that's the literal URL in the campaign's message_flow
// and in their rejection notices), which skips LandingHero/ComplianceFooter
// entirely and drops them straight into question 1 - before this was added,
// a reviewer landing there saw zero policy links until clicking through
// several unrelated quiz questions to reach the consent step. Twilio's
// Error 30923 docs list "the opt-in website lacks accessible Terms and
// Conditions and Privacy Policy links" as one of the specific rejection
// triggers, separate from the forced-consent issue already fixed - this is
// what closes that gap. Keep this present on every step; don't gate it
// behind the consent step or move it back to landing-only.
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
  // Optional second, lower-emphasis action below the primary button — used
  // by the consent step for its required "decline and still continue"
  // path (Twilio A2P error 30923: SMS consent must be optional, with a
  // visible way to proceed without it — see quizConfig.js/QuizEngine.jsx).
  // Not used by any other step today.
  secondaryLabel,
  onSecondary,
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
      <div className="quiz-step-center">
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
            {secondaryLabel && onSecondary && (
              <button
                type="button"
                className="btn btn-ghost btn-block quiz-secondary-action"
                onClick={onSecondary}
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
        <nav className="quiz-legal-footer" aria-label="Legal">
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <span aria-hidden="true">&middot;</span>
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
        </nav>
      </div>
    </div>
  );
}
