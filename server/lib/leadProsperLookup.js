// ============================================================================
// LEAD PROSPER LOOKUP — finds which buyer purchased a given lead, after the
// fact, via Lead Prosper's public per-lead API.
// ----------------------------------------------------------------------------
// Separate from lib/leadProsper.js (which SELLS a lead via direct_post,
// authenticated with LP_CAMPAIGN_ID/LP_SUPPLIER_ID/LP_KEY in the payload).
// This is a different Lead Prosper API with different auth: a Bearer token
// generated for your Lead Prosper ACCOUNT (not per-campaign), from Lead
// Prosper's dashboard - look under Settings / Integrations for an "API" or
// "Personal Access Token" section; contact Lead Prosper support if it isn't
// obvious where to generate one.
//
// GET https://api.leadprosper.io/public/lead/{lead_id}
//   Auth: Authorization: Bearer <LP_API_TOKEN>
//   Response includes a `buyers` array - each entry has id/name/client,
//   status (ACCEPTED/PINGED/etc), sell_price - but NOT a buyer email
//   address. That's why buyer_emails (db.js) exists: Lead Prosper's API
//   gives us WHICH buyer bought the lead, and our own table (populated by
//   you, since you enter each buyer's email when creating them in Lead
//   Prosper) gives us WHERE to send that buyer's invite.
//
// Rate limit per Lead Prosper's docs: 100 requests/minute - fine for this
// use (one lookup per booking event, not a bulk job).
// ============================================================================

const LP_LOOKUP_ENDPOINT = 'https://api.leadprosper.io/public/lead';

const { LP_API_TOKEN } = process.env;
export const USING_LEAD_PROSPER_LOOKUP_STUB = !LP_API_TOKEN;

/**
 * Look up a delivered lead by Lead Prosper's own lead_id and return the
 * buyer(s) it was sold to. Picks the first ACCEPTED buyer as "the" buyer -
 * in a multi-buyer campaign a lead can in principle go to more than one
 * buyer, but this funnel sells each lead to a single winning buyer, so the
 * first accepted entry is the right one in practice.
 */
export async function getLeadBuyer(lpLeadId) {
  if (!lpLeadId) return { ok: false, reason: 'no lead_id to look up' };

  if (USING_LEAD_PROSPER_LOOKUP_STUB) {
    // eslint-disable-next-line no-console
    console.log('[lead prosper lookup stub] would look up buyer for lead_id:', lpLeadId);
    return { ok: false, stub: true, reason: 'LP_API_TOKEN not set' };
  }

  try {
    const res = await fetch(`${LP_LOOKUP_ENDPOINT}/${encodeURIComponent(lpLeadId)}`, {
      headers: { Authorization: `Bearer ${LP_API_TOKEN}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.log('[lead prosper lookup] failed:', res.status, JSON.stringify(data));
      return { ok: false, status: res.status, ...data };
    }
    const buyers = Array.isArray(data.buyers) ? data.buyers : [];
    const buyer = buyers.find((b) => b.status === 'ACCEPTED') || buyers[0] || null;
    if (!buyer) {
      // eslint-disable-next-line no-console
      console.log('[lead prosper lookup] no buyer found for lead_id:', lpLeadId);
      return { ok: false, reason: 'no buyer on this lead yet' };
    }
    return { ok: true, buyer, raw: data };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[lead prosper lookup] request failed:', err.message);
    return { ok: false, error: err.message };
  }
}
