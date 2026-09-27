// ============================================================================
// GOHIGHLEVEL CRM INTEGRATION — STUB
// ----------------------------------------------------------------------------
// Not wired to a real GHL account. This logs the payload it WOULD send so
// the call site (routes/leads.js) doesn't need to change once this is real.
//
// TO MAKE THIS REAL:
//   1. Get a GHL Private Integration API key + Location ID from the agency's
//      GHL sub-account (Settings -> Business Profile -> API Keys, or the
//      newer Private Integrations flow under Settings -> Private Integrations).
//   2. Create the custom fields listed in ARCHITECTURE.md §6 in that GHL
//      location (Settings -> Custom Fields) and note their field keys.
//   3. Replace the body of upsertContact() below with real calls to the GHL
//      v2 REST API, e.g.:
//
//      const res = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
//        method: 'POST',
//        headers: {
//          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
//          Version: '2021-07-28',
//          'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({
//          locationId: process.env.GHL_LOCATION_ID,
//          firstName: lead.contact.firstName,
//          lastName: lead.contact.lastName,
//          email: lead.contact.email,
//          phone: lead.phone,
//          tags: buildTags(lead),
//          customFields: buildCustomFields(lead),
//        }),
//      });
//
//   4. GHL workflows (built inside GHL, not in this code) should trigger off
//      the tags this function applies - e.g. a workflow watching for
//      "tier:hot" sends the immediate SMS/email/agent-notify/call-task
//      described in ARCHITECTURE.md §10.
//
// Required env vars once real: GHL_API_KEY, GHL_LOCATION_ID.
// ============================================================================

export function buildTags(lead) {
  return [
    'source:veritas-funnel',
    `tier:${lead.leadTier.toLowerCase()}`,
    `route:${lead.routing}`,
  ];
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
    firstName: lead.contact?.firstName,
    lastName: lead.contact?.lastName,
    email: lead.contact?.email,
    phone: lead.phone,
    tags: buildTags(lead),
    customFields: buildCustomFields(lead),
  };
  // eslint-disable-next-line no-console
  console.log('[ghl stub] would upsert contact:', JSON.stringify(payload));
  return { ok: true, stub: true };
}
