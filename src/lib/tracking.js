// ============================================================================
// TRACKING / EVENT LAYER
// ----------------------------------------------------------------------------
// Thin wrapper around Meta Pixel (fbq), Google tag (gtag - both GA4 and
// Google Ads conversions share one loader), and TikTok Pixel (ttq) that:
//   1. Captures UTM params + fbclid once on first load and persists them for
//      the whole session (so a step 9 conversion still carries the ad that
//      originally drove the click).
//   2. No-ops safely when no real Pixel/Tag ID is configured, so this code
//      is safe to ship before those IDs exist.
//   3. Names a fixed, deliberate set of funnel events instead of firing an
//      event per click. Per the funnel spec: ad platforms should NOT be
//      optimized toward "every form start" - the highest-quality event with
//      enough volume (OTPVerified, QualifiedLead, AppointmentScheduled, or a
//      downstream sale/enrollment event fed back later) is the one that
//      should drive ad-platform optimization. Firing cheap, high-volume
//      events (QuizStarted) is fine for funnel analytics, but never wire a
//      platform's campaign optimization to them.
//   4. Never puts PII in the client-side event payload. Names, emails, and
//      phone numbers are NOT sent to fbq/gtag/ttq from here - only anonymous
//      identifiers (a generated lead/session id) and non-identifying
//      qualifiers (state, tier). Full PII match keys for Meta CAPI are
//      hashed (SHA-256) and sent server-side only - see server/lib/meta.js.
// ============================================================================

const PIXEL_ID = import.meta.env?.VITE_META_PIXEL_ID || '';
const GA4_ID = import.meta.env?.VITE_GA4_MEASUREMENT_ID || '';
const GOOGLE_ADS_ID = import.meta.env?.VITE_GOOGLE_ADS_CONVERSION_ID || ''; // format: AW-XXXXXXXXX
const GOOGLE_ADS_LEAD_LABEL = import.meta.env?.VITE_GOOGLE_ADS_CONVERSION_LABEL || '';
const TIKTOK_PIXEL_ID = import.meta.env?.VITE_TIKTOK_PIXEL_ID || '';

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

// Events safe to consider as Meta/Google/TikTok optimization targets once
// volume exists. (Documentation only - actual campaign-level optimization
// event selection happens in each platform's ads manager / CAPI dataset
// config, not in this file.)
export const OPTIMIZATION_CANDIDATE_EVENTS = [
  EVENTS.OTP_VERIFIED,
  EVENTS.QUALIFIED_LEAD,
  EVENTS.APPOINTMENT_SCHEDULED,
];

// TikTok only tracks its own standard event vocabulary well (custom names
// still record, but skip optimization/reporting) - map our funnel events to
// the closest real TikTok standard event, confirmed against TikTok Ads
// Manager's own docs (Assets -> Events -> Standard Events and Parameters).
const TIKTOK_EVENT_MAP = {
  [EVENTS.OTP_VERIFIED]: 'CompleteRegistration',
  [EVENTS.QUALIFIED_LEAD]: 'SubmitForm',
  [EVENTS.APPOINTMENT_SCHEDULED]: 'Schedule',
};

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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Standard Meta Pixel base code (Events Manager -> Set up Pixel -> Install
// code manually), adapted to load async via loadScript() instead of the
// inline IIFE Meta's snippet normally uses.
function initMetaPixel() {
  if (!PIXEL_ID || typeof window === 'undefined' || window.fbq) return;
  const n = (window.fbq = function fbq(...args) {
    if (n.callMethod) n.callMethod.apply(n, args);
    else n.queue.push(args);
  });
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  loadScript('https://connect.facebook.net/en_US/fbevents.js').catch(() => {});
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

// Standard Google tag (gtag.js) loader - one script + loader tag ID shared
// by both GA4 (G-...) and Google Ads (AW-...); each gets its own `config`
// call once the loader is in place.
function initGoogleTag() {
  const tagId = GA4_ID || GOOGLE_ADS_ID;
  if (!tagId || typeof window === 'undefined' || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args) {
    window.dataLayer.push(args);
  };
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${tagId}`).catch(() => {});
  window.gtag('js', new Date());
  if (GA4_ID) window.gtag('config', GA4_ID);
  if (GOOGLE_ADS_ID) window.gtag('config', GOOGLE_ADS_ID);
}

// Standard TikTok Pixel base code (Ads Manager -> Assets -> Events -> Set up
// web events -> Manually install pixel code), adapted the same way as Meta's
// above.
function initTikTokPixel() {
  if (!TIKTOK_PIXEL_ID || typeof window === 'undefined' || window.ttq) return;
  (function bootstrapTtq(w, d, sdkKey) {
    w.TiktokAnalyticsObject = sdkKey;
    const ttq = (w[sdkKey] = w[sdkKey] || []);
    ttq.methods = [
      'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
      'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
      'holdConsent', 'revokeConsent', 'grantConsent',
    ];
    ttq.setAndDefer = function setAndDefer(target, method) {
      target[method] = function deferred(...args) {
        target.push([method, ...args]);
      };
    };
    ttq.methods.forEach((method) => ttq.setAndDefer(ttq, method));
    ttq.load = function load(pixelId) {
      const url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[pixelId] = [];
      ttq._i[pixelId]._u = url;
      ttq._t = ttq._t || {};
      ttq._t[pixelId] = Date.now();
      loadScript(`${url}?sdkid=${pixelId}&lib=${sdkKey}`).catch(() => {});
    };
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  })(window, document, 'ttq');
}

let trackingInitialized = false;

/**
 * Loads whichever ad-platform pixels have a real ID configured. Idempotent
 * and safe to call from multiple places - only runs once per page load, and
 * each individual pixel no-ops if its env var isn't set. Called
 * automatically by trackPageView(), so most call sites never need this
 * directly.
 */
export function initTracking() {
  if (trackingInitialized || typeof window === 'undefined') return;
  trackingInitialized = true;
  try { initMetaPixel(); } catch { /* never let a tracking failure break the funnel */ }
  try { initGoogleTag(); } catch { /* same - degrade silently */ }
  try { initTikTokPixel(); } catch { /* same - degrade silently */ }
}

function pixelReady() {
  return !!PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function';
}

function ga4Ready() {
  return !!GA4_ID && typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function ttqReady() {
  return !!TIKTOK_PIXEL_ID && typeof window !== 'undefined' && typeof window.ttq?.track === 'function';
}

function googleAdsReady() {
  return !!GOOGLE_ADS_ID && !!GOOGLE_ADS_LEAD_LABEL && typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Fire a named funnel event to whichever analytics tools are configured.
 * `payload` should contain NO PII (see file header) - non-identifying
 * qualifiers only (funnel step, tier, state, etc).
 */
export function trackEvent(eventName, payload = {}) {
  const attribution = getAttribution();
  const enriched = { ...payload, utm_campaign: attribution.utm_campaign };

  // The Meta base pixel already fires a standard 'track' PageView the
  // moment it loads - sending it again here as a 'trackCustom' would double
  // count the same page load in Events Manager, so PageView skips fbq here.
  if (pixelReady() && eventName !== EVENTS.PAGE_VIEW) {
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

  if (ttqReady()) {
    const ttqEvent = TIKTOK_EVENT_MAP[eventName];
    if (ttqEvent) {
      try {
        window.ttq.track(ttqEvent, enriched);
      } catch {
        /* same - degrade silently */
      }
    }
  }

  // Google Ads only optimizes off a dedicated 'conversion' event tied to a
  // specific conversion action (send_to: AW-ID/LABEL) - a generic
  // gtag('event', ...) call does nothing for Google Ads. Wired to a single
  // conversion action (QualifiedLead) for now, matching Meta's own
  // highest-signal event; if separate Google Ads conversion actions get set
  // up later for OTPVerified/AppointmentScheduled, add their labels here.
  if (googleAdsReady() && eventName === EVENTS.QUALIFIED_LEAD) {
    try {
      window.gtag('event', 'conversion', {
        send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}`,
      });
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
  initTracking();
  captureAttribution();
  trackEvent(EVENTS.PAGE_VIEW);
}
