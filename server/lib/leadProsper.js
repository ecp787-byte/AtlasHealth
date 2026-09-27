// ============================================================================
// LEAD PROSPER — sells/delivers each qualified lead into the Lead Prosper
// exchange via their direct-post API.
// ----------------------------------------------------------------------------
// Activates automatically the moment LP_CAMPAIGN_ID, LP_SUPPLIER_ID, and
// LP_KEY are all set on the server (same pattern as Twilio in lib/otp.js) —
// no code changes or redeploys needed once those are configured. Until
// then, posts are logged as a stub so routes/leads.js never has to change.
//
// Campaign-specific spec (fields, auth, endpoint) confirmed directly from
// Lead Prosper's per-campaign API doc: POST JSON or form-encoded to
// https://api.leadprosper.io/direct_post, authenticated via lp_campaign_id
// + lp_supplier_id + lp_key IN THE PAYLOAD (not headers) — that's their
// model, not a mistake here. See LP's docs (link in .env.example) for the
// full field list; this only sends what the funnel actually collects.
//
// Fields intentionally omitted because this funnel doesn't collect them:
// gender, street address, city. date_of_birth is only sent for the
// fast_track funnel variant (it asks DOB directly) — the default guided
// variant only collects an age, and a birthdate should never be guessed
// from that. trustedform_cert_url and jornaya_leadid are sent only when
// present on the lead (see ResultsPage.jsx / TrustedForm installation).
//
// QUIZ-SELECTION DATA (household, primaryNeed, currentCoverage,
// currentPremium, targetBudget, coverageStart, healthcareUsage,
// takesMedication, leadScore/leadTier) is NOT part of this campaign's
// official field spec — Lead Prosper's per-campaign field list is set by
// whoever administers the "Compass Health OTP" campaign in the Lead
// Prosper dashboard (Campaign Settings -> custom fields), not by adding
// extra keys to this JSON body. Unlisted keys are almost certainly
// dropped silently on their end. Until the campaign is reconfigured with
// named custom fields (and LP sends an updated spec with those field
// names), this packs the highest-value selections into the two
// general-purpose lp_subid1/lp_subid2 tracking fields (75 chars each,
// free text) as a stopgap so at least some of it reaches the buyer via
// their lead_data/analytics view. Swap CUSTOM_FIELD_MAP below for the
// real field names the moment Lead Prosper confirms them.
// ============================================================================

const LP_ENDPOINT = 'https://api.leadprosper.io/direct_post';

const { LP_CAMPAIGN_ID, LP_SUPPLIER_ID, LP_KEY } = process.env;
export const USING_LEAD_PROSPER_STUB = !(LP_CAMPAIGN_ID && LP_SUPPLIER_ID && LP_KEY);

// Once Lead Prosper adds named custom fields for this campaign (see the
// comment above), map { <lead property> : <LP field name> } here and spread
// the result into payload in buildPayload() below — no other changes needed.
// e.g. { household: 'household_composition', primaryNeed: 'coverage_need' }
export const CUSTOM_FIELD_MAP = {};

// Packs "key=value;key=value" pairs into a single string, stopping before
// the next pair would push past maxLen (default 75, Lead Prosper's cap on
// lp_subid1/lp_subid2), rather than cutting a value off mid-word.
function packFields(pairs, maxLen = 75) {
  let out = '';
  for (const [key, value] of pairs) {
    if (value === undefined || value === null || value === '') continue;
    const piece = `${key}=${value}`;
    const candidate = out ? `${out};${piece}` : piece;
    if (candidate.length > maxLen) break;
    out = candidate;
  }
  return out || undefined;
}

function buildPayload(lead, { ip, userAgent }) {
  const payload = {
    lp_campaign_id: LP_CAMPAIGN_ID,
    lp_supplier_id: LP_SUPPLIER_ID,
    lp_key: LP_KEY,
    first_name: lead.contact?.firstName,
    last_name: lead.contact?.lastName,
    email: lead.contact?.email,
    phone: lead.phone,
    zip_code: lead.zip,
    state: lead.state,
    ip_address: ip,
    user_agent: userAgent,
    landing_page_url: lead.attribution?.landing_page,
    tcpa_text: lead.tcpaText,
    // Stopgap until named custom fields exist on the campaign (see header
    // comment): pack the most valuable quiz selections into the two
    // general-purpose tracking fields every Lead Prosper campaign has.
    lp_subid1: packFields([
      ['need', lead.primaryNeed],
      ['hh', lead.household],
      ['cov', lead.currentCoverage],
      ['covstat', lead.coverageStatus],
      ['start', lead.coverageStart],
    ]),
    lp_subid2: packFields([
      ['budget', lead.targetBudget],
      ['premium', lead.currentPremium],
      ['usage', lead.healthcareUsage],
      ['meds', lead.takesMedication],
      ['tier', lead.leadTier],
      ['score', lead.leadScore],
      ['deps', (lead.dependentAges || []).length || undefined],
    ]),
  };
  // Once CUSTOM_FIELD_MAP is filled in (real LP field names), send the full
  // quiz data properly instead of relying on the subid packing above.
  Object.entries(CUSTOM_FIELD_MAP).forEach(([leadKey, lpField]) => {
    payload[lpField] = lead[leadKey];
  });
  // Only present for the fast_track variant, which collects a real DOB —
  // never derived/guessed from the guided variant's age field.
  if (lead.dob) payload.date_of_birth = lead.dob;
  if (lead.trustedFormCertUrl) payload.trustedform_cert_url = lead.trustedFormCertUrl;
  if (lead.jornayaLeadId) payload.jornaya_leadid = lead.jornayaLeadId;
  // Drop undefined/empty values rather than posting empty strings for
  // everything the funnel doesn't collect.
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
  });
  return payload;
}

export async function postToLeadProsper(lead, requestMeta = {}) {
  const payload = buildPayload(lead, requestMeta);

  if (USING_LEAD_PROSPER_STUB) {
    // eslint-disable-next-line no-console
    console.log('[lead prosper stub] would post:', JSON.stringify(payload));
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch(LP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === 'ERROR') {
      // eslint-disable-next-line no-console
      console.log('[lead prosper] rejected:', res.status, JSON.stringify(data));
      return { ok: false, ...data };
    }
    // eslint-disable-next-line no-console
    console.log('[lead prosper] delivered:', data.status, data.lead_id);
    return { ok: true, ...data };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[lead prosper] request failed:', err.message);
    return { ok: false, error: err.message };
  }
}
