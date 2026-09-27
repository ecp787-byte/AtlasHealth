// ============================================================================
// META CONVERSIONS API — STUB
// ----------------------------------------------------------------------------
// Not wired to a real Meta dataset. Server-side CAPI events are what let
// Meta's optimization see high-quality events (OTPVerified, QualifiedLead,
// AppointmentScheduled, and later a downstream sale/enrollment event) even
// when the browser-side Pixel call is blocked, delayed, or lost (ad
// blockers, in-app browser quirks, iOS tracking restrictions).
//
// PII HANDLING: Meta requires match keys (email, phone) to be SHA-256
// hashed, lowercased/normalized, BEFORE they leave this server. Never send
// raw email/phone to Meta, and never do this hashing in the browser - it
// belongs here specifically so raw PII never has to travel through
// client-side code at all.
//
// TO MAKE THIS REAL:
//   1. Get a Meta Pixel ID and a system-user access token with
//      ads_management permission for that Pixel's ad account.
//   2. Replace sendConversionEvent() below with a real call to
//      https://graph.facebook.com/v19.0/{pixel_id}/events?access_token=...
//      following https://developers.facebook.com/docs/marketing-api/conversions-api
//
// Required env vars once real: META_PIXEL_ID, META_CAPI_ACCESS_TOKEN.
// ============================================================================
import { createHash } from 'node:crypto';

function sha256(value) {
  if (!value) return undefined;
  return createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

/**
 * @param {string} eventName - e.g. 'OTPVerified', 'QualifiedLead', 'AppointmentScheduled'
 * @param {object} lead - the lead payload (see ARCHITECTURE.md §5)
 */
export async function sendConversionEvent(eventName, lead) {
  const payload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: {
      em: sha256(lead.contact?.email),
      ph: sha256(lead.phone),
    },
    custom_data: {
      utm_campaign: lead.attribution?.utm_campaign,
      lead_tier: lead.leadTier,
    },
  };
  // eslint-disable-next-line no-console
  console.log('[meta capi stub] would send:', JSON.stringify(payload));
  return { ok: true, stub: true };
}
