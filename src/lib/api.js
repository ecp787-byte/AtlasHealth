// ============================================================================
// BACKEND API CLIENT
// ----------------------------------------------------------------------------
// Talks to the Express scaffold in server/ (see server/README.md for what's
// real vs. stubbed there). Defaults to the deployed Render instance so this
// works out of the box in every build (dev, the Artifact preview, a real
// static-site deploy) without extra configuration — override with
// VITE_API_BASE_URL to point at a different environment (e.g. a local
// `npm run dev` backend, or a future staging/production split).
//
// Every call here degrades gracefully rather than throwing into the UI: the
// funnel should never hard-fail just because the backend is asleep (Render's
// free tier spins down after ~15min idle and takes 30-60s to wake back up)
// or unreachable. Callers get a consistent { ok, ...} shape and decide what
// to show; see StepOtp.jsx and ResultsPage.jsx for how each result is used.
// ============================================================================

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'https://compass-health-funnel-api.onrender.com').replace(/\/$/, '');

// Generous timeout to ride out a cold start on Render's free tier rather
// than erroring out on a service that's simply still waking up.
const REQUEST_TIMEOUT_MS = 45000;

async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: {}, networkError: true, error: err };
  } finally {
    clearTimeout(timeout);
  }
}

/** POST /api/otp/send — { sent, devCode? }. devCode is only present while
 *  the backend's OTP delivery is still the documented stub (see
 *  server/lib/otp.js) — once real Twilio is wired in, it stops appearing
 *  and callers should treat its absence as "a real text was sent". */
export async function sendOtp(phone) {
  const result = await apiFetch('/api/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
  return {
    sent: result.ok,
    devCode: result.data?.devCode ?? null,
    networkError: !!result.networkError,
    error: result.data?.error ?? null,
  };
}

/** POST /api/otp/verify — { verified }. */
export async function verifyOtp(phone, code) {
  const result = await apiFetch('/api/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
  return { verified: !!result.data?.verified, networkError: !!result.networkError };
}

/** POST /api/leads — never throws; a failed/unreachable submit should not
 *  block the results page from rendering (the person already completed the
 *  funnel and verified their phone — don't make that feel wasted). */
export async function submitLead(payload) {
  const result = await apiFetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!result.ok) {
    // eslint-disable-next-line no-console
    console.warn('[lead submit] backend did not accept the lead', result.status, result.data, result.error || '');
  }
  return result;
}

export { API_BASE_URL };
