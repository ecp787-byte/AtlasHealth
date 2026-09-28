// ============================================================================
// META CONVERSIONS API
// ----------------------------------------------------------------------------
// Server-side CAPI events are what let Meta's optimization see high-quality
// events (OTPVerified, QualifiedLead, AppointmentScheduled, and later a
// downstream sale/enrollment event) even when the browser-side Pixel call is
// blocked, delayed, or lost (ad blockers, in-app browser quirks, iOS
// tracking restrictions).
//
// Activates automatically the moment META_PIXEL_ID and META_CAPI_ACCESS_TOKEN
// are both set (same pattern as Lead Prosper in lib/leadProsper.js) - until
// then, posts are logged as a stub so routes/leads.js never has to change.
//
// PII HANDLING: Meta requires match keys (email, phone) to be SHA-256
// hashed, lowercased/normalized, BEFORE they leave this server. Raw
// email/phone are never sent to Meta, and this hashing never happens in the
// browser - it happens here specifically so raw PII never has to travel
// through client-side code at all.
// ============================================================================
import { createHash } from 'node:crypto';

const { META_PIXEL_ID, META_CAPI_ACCESS_TOKEN } = process.env;
export const USING_META_CAPI_STUB = !(META_PIXEL_ID && META_CAPI_ACCESS_TOKEN);
const META_GRAPH_VERSION = 'v21.0';

function sha256(value) {
  if (!value) return undefined;
  return createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

/**
 * @param {string} eventName - e.g. 'OTPVerified', 'QualifiedLead', 'AppointmentScheduled'
 * @param {object} lead - the lead payload (see ARCHITECTURE.md §5)
 * @param {object} [requestMeta] - { ip, userAgent } from the originating request
 */
export async function sendConversionEvent(eventName, lead, requestMeta = {}) {
  const payload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: lead.attribution?.landing_page,
    user_data: {
      em: sha256(lead.contact?.email),
      ph: sha256(lead.phone),
      client_ip_address: requestMeta.ip,
      client_user_agent: requestMeta.userAgent,
      fbc: lead.attribution?.fbclid ? `fb.1.${Date.now()}.${lead.attribution.fbclid}` : undefined,
    },
    custom_data: {
      utm_campaign: lead.attribution?.utm_campaign,
      lead_tier: lead.leadTier,
    },
  };

  if (USING_META_CAPI_STUB) {
    // eslint-disable-next-line no-console
    console.log('[meta capi stub] would send:', JSON.stringify(payload));
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [payload] }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.log('[meta capi] rejected:', res.status, JSON.stringify(data));
      return { ok: false, ...data };
    }
    // eslint-disable-next-line no-console
    console.log('[meta capi] delivered:', eventName, JSON.stringify(data));
    return { ok: true, ...data };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[meta capi] request failed:', err.message);
    return { ok: false, error: err.message };
  }
}
