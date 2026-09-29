// ============================================================================
// PROGRESS PERSISTENCE
// ----------------------------------------------------------------------------
// Saves the quiz's current step + answers after every step so a refresh,
// backgrounding, accidental back-nav, or (most importantly) switching to the
// Messages app to read an OTP code and coming back doesn't lose progress.
//
// Uses sessionStorage (not localStorage) deliberately: progress should
// survive within the same browsing session/tab but not silently persist a
// stranger's partial answers on a shared device indefinitely. It's cleared
// on successful submission.
// ============================================================================

const KEY = 'veritas_quiz_progress_v1';

export function saveProgress(state) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {
    /* storage unavailable - funnel still works, just without resume */
  }
}

export function loadProgress() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire saved progress after 24h so someone doesn't resume a stale,
    // half-answered assessment from days ago.
    if (!parsed.savedAt || Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      clearProgress();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearProgress() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
