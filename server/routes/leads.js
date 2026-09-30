import { Router } from 'express';
import { scoreLead } from '../lib/leadScoring.js';
import { upsertContact } from '../lib/ghl.js';
import { sendConversionEvent } from '../lib/meta.js';
import { postToLeadProsper } from '../lib/leadProsper.js';
import { retainTrustedFormCert } from '../lib/trustedFormRetain.js';
import { getLeadBuyer } from '../lib/leadProsperLookup.js';
import { buildIcs, sendCalendarInvite } from '../lib/calendarInvite.js';
import {
  isDbConfigured, insertLead, listLeads, countLeads,
  setLeadProsperId, getLeadById, recordBooking, markInviteSent,
  getBuyerEmail, upsertBuyerEmail, listBuyerEmails,
} from '../lib/db.js';

const router = Router();

// Fallback store used ONLY when DATABASE_URL isn't set - e.g. local dev
// without a database attached. In production DATABASE_URL must always be
// set (see server/lib/db.js), so leads persist in Postgres and survive
// restarts/redeploys instead of living only in this process's memory.
// Booking (see POST /:id/book below) needs a stable id per lead even in
// this fallback mode, so each entry gets a simple incrementing id - note
// this table (and any booking made against it) is still lost on restart,
// same as everything else in memoryLeads.
const memoryLeads = [];
let memoryLeadIdSeq = 1;
if (!isDbConfigured()) {
  // eslint-disable-next-line no-console
  console.warn('[leads] DATABASE_URL not set - leads will NOT persist across restarts. Set DATABASE_URL before going live.');
}

// Shared admin-auth check (already used by GET / below) - a booking's
// buyer-email mapping is exactly the kind of data that must not be public.
function requireAdmin(req, res) {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    res.status(503).json({ error: 'Admin access is not configured.' });
    return false;
  }
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (providedKey !== configuredKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

router.post('/', async (req, res) => {
  const answers = req.body || {};

  // Never trust a client-computed score - recompute here from the raw
  // answers, same logic as the frontend (see server/lib/leadScoring.js's
  // file header for why this is a hand-synced copy, not a shared import).
  const { score, tier } = scoreLead(answers);
  const lead = { ...answers, leadScore: score, leadTier: tier, receivedAt: new Date().toISOString() };

  // Minimum-necessary-data guard: refuse to persist a lead with no contact
  // path at all (defensive - the frontend shouldn't be able to reach this
  // state, but the server shouldn't trust that).
  if (!lead.contact?.email && !lead.phone) {
    return res.status(400).json({ error: 'A contact email or phone number is required.' });
  }

  // req.ip resolves to the visitor's real IP (not Render's proxy) because
  // index.js sets `trust proxy` - required for this to be meaningful.
  const requestMeta = { ip: req.ip, userAgent: req.get('user-agent') };

  // leadId is this lead's row id (DB or memory-fallback) - returned to the
  // frontend below so that if this consumer later books an appointment on
  // ResultsPage.jsx, that request can say *which* lead it's booking for.
  let leadId = null;
  try {
    if (isDbConfigured()) {
      leadId = await insertLead(lead, requestMeta);
    } else {
      leadId = memoryLeadIdSeq++;
      memoryLeads.push({ ...lead, id: leadId });
    }
  } catch (err) {
    // A lead that made it this far (passed validation) should never be
    // silently dropped - log loudly and still attempt delivery downstream
    // rather than failing the whole request over a storage hiccup.
    // eslint-disable-next-line no-console
    console.error('[leads] failed to persist lead:', err.message);
  }

  const [ghlResult, metaResult, leadProsperResult, trustedFormRetainResult] = await Promise.all([
    upsertContact(lead),
    lead.otpVerified ? sendConversionEvent('QualifiedLead', lead, requestMeta) : Promise.resolve({ skipped: true }),
    // Only sell verified leads into the exchange - an unverified phone
    // number isn't a lead a buyer should pay for.
    lead.otpVerified ? postToLeadProsper(lead, requestMeta) : Promise.resolve({ skipped: true }),
    // Permanently retain the TrustedForm certificate now, at submission
    // time - ActiveProspect auto-deletes an unretained certificate within
    // days, and this account's Auto-Retain toggle isn't usable, so this is
    // the only thing standing between "we have consent proof" and "we
    // don't" a few days from now. Retain regardless of otpVerified - even
    // an unverified visit's certificate is worth keeping as a record.
    retainTrustedFormCert(lead),
  ]);

  // Stash Lead Prosper's own lead_id (present on an ACCEPTED direct_post)
  // against our row, so a later booking event can look up which buyer
  // bought this lead via lib/leadProsperLookup.js. Never blocks the
  // response - a failure here just means booking won't be able to find a
  // buyer for this particular lead, which is logged and handled there.
  if (leadId != null && leadProsperResult?.lead_id) {
    if (isDbConfigured()) {
      setLeadProsperId(leadId, leadProsperResult.lead_id).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[leads] failed to store lp_lead_id:', err.message);
      });
    } else {
      const entry = memoryLeads.find((l) => l.id === leadId);
      if (entry) entry.lpLeadId = leadProsperResult.lead_id;
    }
  }

  res.status(201).json({
    ok: true,
    leadId,
    leadScore: score,
    leadTier: tier,
    ghl: ghlResult,
    meta: metaResult,
    leadProsper: leadProsperResult,
    trustedFormRetain: trustedFormRetainResult,
  });
});

// Called when the consumer books a time on the results page. Always
// records the booking itself first (so it's never lost even if the rest
// fails), then best-effort looks up which Lead Prosper buyer purchased
// this lead and emails both that buyer and the lead an .ics calendar
// invite. See lib/leadProsperLookup.js and lib/calendarInvite.js for why
// this needs two separate integrations (Lead Prosper tells us WHICH buyer;
// our own buyer_emails table, populated by you, tells us their email).
router.post('/:id/book', async (req, res) => {
  const id = isDbConfigured() ? req.params.id : Number(req.params.id);
  const { date, slot } = req.body || {};
  if (!date || !slot) {
    return res.status(400).json({ error: 'date and slot are required.' });
  }

  const lead = isDbConfigured()
    ? await getLeadById(id).catch(() => null)
    : memoryLeads.find((l) => l.id === id) || null;

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found.' });
  }

  try {
    if (isDbConfigured()) {
      await recordBooking(id, { date, slot });
    } else {
      lead.bookingScheduledFor = date;
      lead.bookingSlot = slot;
      lead.bookedAt = new Date().toISOString();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[leads] failed to record booking:', err.message);
    return res.status(500).json({ error: 'Failed to record booking.' });
  }

  // Booking is recorded either way by this point - everything below is
  // best-effort delivery of the calendar invite, reported back but never
  // turned into a failed booking response.
  const lpLeadId = lead.lpLeadId;
  const leadEmail = lead.contact?.email;
  const leadName = [lead.contact?.firstName, lead.contact?.lastName].filter(Boolean).join(' ');

  const buyerLookup = await getLeadBuyer(lpLeadId);
  if (!buyerLookup.ok) {
    return res.status(201).json({ ok: true, booked: true, invite: { ok: false, reason: buyerLookup.reason || buyerLookup.error || 'buyer lookup unavailable' } });
  }

  const buyerRecord = await getBuyerEmail(String(buyerLookup.buyer.id)).catch(() => null);
  if (!buyerRecord?.email) {
    // eslint-disable-next-line no-console
    console.log('[leads] no email on file for buyer id', buyerLookup.buyer.id, '- add it via POST /api/leads/buyers');
    return res.status(201).json({
      ok: true,
      booked: true,
      invite: { ok: false, reason: `no email on file for buyer ${buyerLookup.buyer.id} (${buyerLookup.buyer.name || 'unnamed'})` },
    });
  }

  const ics = buildIcs({
    date, slot, leadName,
    attendees: [buyerRecord.email, leadEmail],
    uid: `atlas-health-booking-${id}@atlashealthcare.us`,
  });
  const inviteResult = await sendCalendarInvite({
    to: [buyerRecord.email, leadEmail],
    subject: `Coverage Review Call — ${leadName || 'New Atlas Health Lead'} — ${date} ${slot}`,
    html: `<p>A coverage review call is scheduled for <strong>${date} at ${slot}</strong> with ${leadName || 'the lead'}.</p>`,
    ics,
  });

  if (inviteResult.ok && isDbConfigured()) {
    markInviteSent(id).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[leads] failed to mark invite sent:', err.message);
    });
  }

  res.status(201).json({ ok: true, booked: true, invite: inviteResult });
});

// Buyer-email mapping admin routes - same ADMIN_API_KEY gate as GET / below.
// Lead Prosper's API won't give us a buyer's email (confirmed against their
// public lookup API), so this is how you tell us: for each buyer you've
// set up in Lead Prosper, POST its numeric buyer id + the email you gave
// it there. GET lists what's currently on file so you can double-check it.
router.post('/buyers', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!isDbConfigured()) {
    return res.status(503).json({ error: 'Buyer-email mapping requires DATABASE_URL to be set.' });
  }
  const { buyerId, email, buyerName } = req.body || {};
  if (!buyerId || !email) {
    return res.status(400).json({ error: 'buyerId and email are required.' });
  }
  try {
    await upsertBuyerEmail(String(buyerId), email, buyerName);
    res.status(200).json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[leads] failed to save buyer email:', err.message);
    res.status(500).json({ error: 'Failed to save buyer email.' });
  }
});

router.get('/buyers', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!isDbConfigured()) {
    return res.status(503).json({ error: 'Buyer-email mapping requires DATABASE_URL to be set.' });
  }
  try {
    const buyers = await listBuyerEmails();
    res.status(200).json({ buyers });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[leads] failed to list buyer emails:', err.message);
    res.status(500).json({ error: 'Failed to list buyer emails.' });
  }
});

// Admin-only listing, gated behind a shared secret (ADMIN_API_KEY) sent as
// `Authorization: Bearer <key>`. The original version of this endpoint had
// no auth at all and returned every lead's PII to anyone who found the URL
// - if ADMIN_API_KEY isn't set, this now refuses to serve anything rather
// than falling back to open access.
router.get('/', async (req, res) => {
  const configuredKey = process.env.ADMIN_API_KEY;
  if (!configuredKey) {
    return res.status(503).json({ error: 'Admin access is not configured.' });
  }
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (providedKey !== configuredKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (isDbConfigured()) {
      const [leads, count] = await Promise.all([listLeads(), countLeads()]);
      return res.json({ count, leads });
    }
    return res.json({ count: memoryLeads.length, leads: memoryLeads });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[leads] admin listing failed:', err.message);
    return res.status(500).json({ error: 'Failed to load leads.' });
  }
});

export default router;
