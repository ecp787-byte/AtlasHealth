// ============================================================================
// GOHIGHLEVEL CRM INTEGRATION
// ----------------------------------------------------------------------------
// Activates automatically the moment GHL_API_KEY and GHL_LOCATION_ID are
// both set (same pattern as Lead Prosper / Meta CAPI elsewhere in this
// codebase) - until then, calls are logged as a stub so routes/leads.js
// never has to change.
//
// Assumes the custom fields listed below already exist in this GHL location
// (Settings -> Custom Fields) - GHL's upsert API accepts unknown field keys
// silently dropping them, so if a field isn't showing up in GHL, check it
// was created there with a matching key first.
// ============================================================================

const { GHL_API_KEY, GHL_LOCATION_ID } = process.env;
export const USING_GHL_STUB = !(GHL_API_KEY && GHL_LOCATION_ID);
const GHL_API_VERSION = '2021-07-28';

export function buildTags(lead) {
  return [
    'source:veritas-funnel',
    `tier:${(lead.leadTier || 'unscored').toLowerCase()}`,
    lead.routing ? `route:${lead.routing}` : null,
  ].filter(Boolean);
}

export function buildCustomFields(lead) {
  return {
    phone_verified: !!lead.otpVerified,
    household_composition: lead.household,
    dependent_ages: (lead.dependentAges || []).join(', '),
    current_coverage_type: lead.currentCoverage,
    current_premium_range: lead.currentPremium,
    target_budget_range: lead.targetBudget,
    coverage_start_timeframe: lead.coverageStart,
    healthcare_usage: lead.healthcareUsage,
    lead_score: lead.leadScore,
    utm_source: lead.attribution?.utm_source,
    utm_medium: lead.attribution?.utm_medium,
    utm_campaign: lead.attribution?.utm_campaign,
    utm_content: lead.attribution?.utm_content,
    utm_term: lead.attribution?.utm_term,
    fbclid: lead.attribution?.fbclid,
  };
}

export async function upsertContact(lead) {
  const payload = {
    locationId: GHL_LOCATION_ID,
    firstName: lead.contact?.firstName,
    lastName: lead.contact?.lastName,
    email: lead.contact?.email,
    phone: lead.phone,
    tags: buildTags(lead),
    customFields: buildCustomFields(lead),
  };

  if (USING_GHL_STUB) {
    // eslint-disable-next-line no-console
    console.log('[ghl stub] would upsert contact:', JSON.stringify(payload));
    return { ok: true, stub: true };
  }

  try {
    const res = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.log('[ghl] rejected:', res.status, JSON.stringify(data));
      return { ok: false, ...data };
    }
    // eslint-disable-next-line no-console
    console.log('[ghl] contact upserted:', data.contact?.id || '(no id returned)');
    return { ok: true, ...data };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[ghl] request failed:', err.message);
    return { ok: false, error: err.message };
  }
}
