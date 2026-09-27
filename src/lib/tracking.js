// ============================================================================
// TRACKING / EVENT LAYER
// ----------------------------------------------------------------------------
// Thin wrapper around Meta Pixel (fbq) and GA4 (gtag) that:
//   1. Captures UTM params + fbclid once on first load and persists them for
//      the whole session (so a step 9 conversion still carries the ad that
//      originally drove the click).
//   2. No-ops safely when no real Pixel ID / GA4 ID is configured, so this
//      code is safe to ship before those IDs exist.
//   3. Names a fixed, deliberate set of funnel events instead of firing an
//      event per click. Per the funnel spec: Meta should NOT be optimized
//      toward "every form start" — the highest-quality event with enough
//      volume (OTPVerified, QualifiedLead, AppointmentScheduled, or a
//      downstream sale/enrollment event fed back later) is the one that
//      should drive ad-platform optimization. Firing cheap, high-volume
//      events (QuizStarted) is fine for funnel analytics, but never wire
//      Meta's campaign optimization to them.
//   4. Never puts PII in the client-side event payload. Names, emails, and
//      phone numbers are NOT sent to fbq/gtag from here - only anonymous
//      identifiers (a generated lead/session id) and non-identifying
//      qualifiers (state, tier). Full PII match keys for Meta CAPI are
//      hashed (SHA-256) and sent server-side only - see server/lib/meta.js.
// ============================================================================

const PIXEL_ID = import.meta.env?.VITE_META_PIXEL_ID || '';
const GA4_ID = import.meta.env?.VITE_GA4_MEASUREMENT_ID || '';

const STORAGE_KEY = 'veritas_attribution_v1';

export const EVENTS = {
  PAGE_VIEW: 'PageView',
  QUIZ_STARTED: 'QuizStarted',
  QUIZ_PROGRESS: 'QuizProgress',
  LEAD: 'Lead',
  PHONE_SUBMITTED: 'PhoneSubmitted',
  OTP_VERIFIED: 'OTPVerified',
  QUALIFIED_LEAD: 'QualifiedLead',
  APPOINTMENT_SCHEDULED: 'AppointmentScheduled',
};

// Events safe to consider as Meta optimization targets once volume exists.
// (Documentation only — actual campaign-level optimization event selection
// happens in Meta Ads Manager / CAPI dataset config, not in this file.)
export const OPTIMIZATION_CANDIDATE_EVENTS = [
  EVENTS.OTP_VERIFIED,
  EVENTS.QUALIFIED_LEAD,
  EVENTS.APPOINTMENT_SCHEDULED,
];

function readStorage(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, etc.) - tracking degrades silently */
  }
}

/**
 * Capture UTM/fbclid/landing page/timestamp on first load and persist for
 * the session. Safe to call on every page load - it's a no-op after the
 * first call within a session.
 */
export function captureAttribution() {
  const existing = readStorage(STORAGE_KEY);
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const attribution = {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    utm_term: params.get('utm_term') || null,
    fbclid: params.get('fbclid') || null,
    landing_page: window.location.href,
    referrer: document.referrer || null,
    first_seen_at: new Date().toISOString(),
  };
  writeStorage(STORAGE_KEY, attribution);
  return attribution;
}

export function getAttribution() {
  return readStorage(STORAGE_KEY) || captureAttribution();
}

function pixelReady() {
  return !!PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function';
}

function ga4Ready() {
  return !!GA4_ID && typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Fire a named funnel event to whichever analytics tools are configured.
 * `payload` should contain NO PII (see file header) - non-identifying
 * qualifiers only (funnel step, tier, state, etc).
 */
export function trackEvent(eventName, payload = {}) {
  const attribution = getAttribution();
  const enriched = { ...payload, utm_campaign: attribution.utm_campaign };

  if (pixelReady()) {
    try {
      window.fbq('trackCustom', eventName, enriched);
    } catch {
      /* never let a tracking failure break the funnel */
    }
  }

  if (ga4Ready()) {
    try {
      window.gtag('event', eventName, enriched);
    } catch {
      /* same - degrade silently */
    }
  }

  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[tracking]', eventName, enriched);
  }
}

export function trackPageView() {
  captureAttribution();
  trackEvent(EVENTS.PAGE_VIEW);
}
