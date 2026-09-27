// ============================================================================
// LEAD ROUTING
// ----------------------------------------------------------------------------
// Decides where a prospect goes next based on their answers. The one rule
// that matters most: this module never produces a hard rejection. A
// prospect who looks like a poor fit for a private medically-underwritten
// plan is routed to a softer, still-helpful message and a still-real path
// forward — never "you don't qualify."
//
// getEligibilityRoute() is deliberately conservative right now because the
// eligibility questions themselves are disabled (see quizConfig.js -
// ELIGIBILITY_ENABLED). Until real underwriting rules are supplied, this
// function has nothing to disqualify on and always returns the standard
// route. Wire in real logic here — not in quizConfig.js, not in the UI
// components — once carrier rules exist, so the "never hard-reject" policy
// stays enforced in exactly one place.
// ============================================================================

export const ROUTES = {
  STANDARD: 'standard', // default: "Speak with an agent" / "Schedule a review"
  ALTERNATIVE_COVERAGE: 'alternative_coverage', // soft reroute
};

/**
 * @param {object} answers - accumulated quiz answers
 * @returns {{ route: string, message: string }}
 */
export function getEligibilityRoute(answers = {}) {
  // No underwriting rules are configured yet (ELIGIBILITY_ENABLED is false
  // in quizConfig.js), so every prospect gets the standard route. This stub
  // exists so the call site (ResultsPage) never has to change when real
  // rules are added later - only this function's body does.
  //
  // When real rules exist, this should look something like:
  //
  //   if (answers.eligibilitySample === 'yes' /* disqualifying answer */) {
  //     return {
  //       route: ROUTES.ALTERNATIVE_COVERAGE,
  //       message: "Let's review other coverage options that may be available.",
  //     };
  //   }

  return {
    route: ROUTES.STANDARD,
    message: 'Your assessment is complete — a licensed agent can walk you through your options.',
  };
}
