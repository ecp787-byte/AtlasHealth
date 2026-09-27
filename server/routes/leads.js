import { Router } from 'express';
import { scoreLead } from '../lib/leadScoring.js';
import { upsertContact } from '../lib/ghl.js';
import { sendConversionEvent } from '../lib/meta.js';
import { postToLeadProsper } from '../lib/leadProsper.js';

const router = Router();

// In-memory store so this scaffold is runnable/testable without a database.
// Replace with real persistence (Postgres, etc.) before going live - lead
// data should not live only in server memory.
const leads = [];

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

  leads.push(lead);

  // req.ip resolves to the visitor's real IP (not Render's proxy) because
  // index.js sets `trust proxy` - required for this to be meaningful.
  const requestMeta = { ip: req.ip, userAgent: req.get('user-agent') };

  const [ghlResult, metaResult, leadProsperResult] = await Promise.all([
    upsertContact(lead),
    lead.otpVerified ? sendConversionEvent('QualifiedLead', lead) : Promise.resolve({ skipped: true }),
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

// Debug/dev-only listing - remove or protect with auth before deploying.
router.get('/', (_req, res) => {
  res.json({ count: leads.length, leads });
});

export default router;
