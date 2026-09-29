// ============================================================================
// TRUSTEDFORM RETAIN — permanently retains each verified lead's TrustedForm
// certificate via ActiveProspect's Certificate API.
// ----------------------------------------------------------------------------
// Why this exists: TrustedForm certificates are NOT kept permanently by
// default — ActiveProspect auto-deletes an unretained certificate within a
// few days of creation. This account's "Auto-Retain" toggle (account
// settings -> Certify -> Auto-retain certificates) is greyed out/unusable
// for this account, so retention has to happen programmatically instead,
// per lead, at submission time.
//
// Activates automatically the moment TRUSTEDFORM_API_KEY is set (same stub
// pattern as Twilio/Lead Prosper elsewhere in this folder) — until then,
// retention attempts are logged as a stub so routes/leads.js never has to
// change again once the real key is added.
//
// API reference (ActiveProspect Certificate API v4.0 — Retain operation):
//   POST https://cert.trustedform.com/<cert_id>
//   Auth: HTTP Basic, username "API", password = your TrustedForm API key
//   Headers: Content-Type: application/json, Api-Version: 4.0
//   Body: { match_lead: { email?, phone? }, retain: { reference, vendor } }
//   The `retain` operation MUST be paired with `match_lead` in the same
//   request — ActiveProspect requires the two together, not retain alone.
// Docs: https://support.activeprospect.com/hc/en-us/articles/44098371450388-Retain-API-Operation
// ============================================================================

const { TRUSTEDFORM_API_KEY } = process.env;
export const USING_TRUSTEDFORM_RETAIN_STUB = !TRUSTEDFORM_API_KEY;

// Shown on the certificate in ActiveProspect's dashboard as who retained it.
const VENDOR_NAME = 'Atlas Health';

function buildRetainBody(lead) {
  const matchLead = {};
  if (lead.contact?.email) matchLead.email = lead.contact.email;
  if (lead.phone) matchLead.phone = lead.phone;

  return {
    match_lead: matchLead,
    retain: {
      // receivedAt is set by routes/leads.js before this runs, so it's
      // always present and unique enough to use as our reference id.
      reference: lead.receivedAt || `${lead.phone || lead.contact?.email || 'lead'}-${Date.now()}`,
      vendor: VENDOR_NAME,
    },
  };
}

/**
 * Retain (permanently store) a lead's TrustedForm certificate so it
 * survives past ActiveProspect's default few-day auto-deletion window.
 * Only called for leads that actually have a cert URL — see routes/leads.js.
 */
export async function retainTrustedFormCert(lead) {
  const certUrl = lead.trustedFormCertUrl;
  if (!certUrl) return { skipped: true, reason: 'no trustedform cert url on this lead' };

  const body = buildRetainBody(lead);

  if (USING_TRUSTEDFORM_RETAIN_STUB) {
    // eslint-disable-next-line no-console
    console.log('[trustedform retain stub] would retain:', certUrl, JSON.stringify(body));
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch(certUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Version': '4.0',
        Authorization: 'Basic ' + Buffer.from(`API:${TRUSTEDFORM_API_KEY}`).toString('base64'),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.outcome !== 'success') {
      // eslint-disable-next-line no-console
      console.log('[trustedform retain] failed:', res.status, JSON.stringify(data));
      return { ok: false, status: res.status, ...data };
    }
    // eslint-disable-next-line no-console
    console.log('[trustedform retain] retained, expires_at:', data.retain?.expires_at);
    return { ok: true, ...data };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[trustedform retain] request failed:', err.message);
    return { ok: false, error: err.message };
  }
}
