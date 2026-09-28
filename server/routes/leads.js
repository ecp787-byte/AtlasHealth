import { Router } from 'express';
import { scoreLead } from '../lib/leadScoring.js';
import { upsertContact } from '../lib/ghl.js';
import { sendConversionEvent } from '../lib/meta.js';
import { postToLeadProsper } from '../lib/leadProsper.js';
import { isDbConfigured, insertLead, listLeads, countLeads } from '../lib/db.js';

const router = Router();

// Fallback store used ONLY when DATABASE_URL isn't set - e.g. local dev
// without a database attached. In production DATABASE_URL must always be
// set (see server/lib/db.js), so leads persist in Postgres and survive
// restarts/redeploys instead of living only in this process's memory.
const memoryLeads = [];
if (!isDbConfigured()) {
  // eslint-disable-next-line no-console
  console.warn('[leads] DATABASE_URL not set - leads will NOT persist across restarts. Set DATABASE_URL before going live.');
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

  try {
    if (isDbConfigured()) {
      await insertLead(lead, requestMeta);
    } else {
      memoryLeads.push(lead);
    }
  } catch (err) {
    // A lead that made it this far (passed validation) should never be
    // silently dropped - log loudly and still attempt delivery downstream
    // rather than failing the whole request over a storage hiccup.
    // eslint-disable-next-line no-console
    console.error('[leads] failed to persist lead:', err.message);
  }

  const [ghlResult, metaResult, leadProsperResult] = await Promise.all([
    upsertContact(lead),
    lead.otpVerified ? sendConversionEvent('QualifiedLead', lead, requestMeta) : Promise.resolve({ skipped: true }),
    // Only sell verified leads into the exchange - an unverified phone
    // number isn't a lead a buyer should pay for.
    lead.otpVerified ? postToLeadProsper(lead, requestMeta) : Promise.resolve({ skipped: true }),
  ]);

  res.status(201).json({
    ok: true,
    leadScore: score,
    leadTier: tier,
    ghl: ghlResult,
    meta: metaResult,
    leadProsper: leadProsperResult,
  });
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
