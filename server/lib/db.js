// ============================================================================
// POSTGRES — persistent lead storage.
// ----------------------------------------------------------------------------
// Activates the moment DATABASE_URL is set on the server (same
// set-the-env-var-and-go pattern as Twilio/Lead Prosper elsewhere in this
// codebase). Until then, routes/leads.js falls back to an in-memory array
// so local dev without a database still runs - but production MUST have
// DATABASE_URL set, or leads are lost on every restart/redeploy.
// ============================================================================
import pg from 'pg';

const { Pool } = pg;

// Render's managed Postgres presents a cert that isn't in Node's default
// trust store; Render's own docs call for disabling strict verification
// for its internal connection strings rather than pinning a CA bundle.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

export function isDbConfigured() {
  return !!pool;
}

let schemaReady = null;

// Idempotent - safe to call on every request, but only actually runs the
// DDL once per process (the promise is cached and reused).
export function ensureSchema() {
  if (!pool) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        lead_score INTEGER,
        lead_tier TEXT,
        email TEXT,
        phone TEXT,
        otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
        ip_address TEXT,
        user_agent TEXT,
        payload JSONB NOT NULL,
        received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        -- Lead Prosper's own lead id from the ACCEPTED direct_post response
        -- (see lib/leadProsper.js) - the join key for looking up which buyer
        -- purchased this lead later, via LP's public lookup API.
        lp_lead_id TEXT,
        -- Set once the consumer books a call on the results page (see
        -- routes/leads.js's POST /:id/book) - kept as separate columns
        -- rather than re-deriving from payload so "has this lead booked"
        -- is a plain indexed lookup, not a JSONB scan.
        booking_scheduled_for TEXT,
        booking_slot TEXT,
        booking_invite_sent BOOLEAN NOT NULL DEFAULT FALSE,
        booked_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_leads_received_at ON leads (received_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
      CREATE INDEX IF NOT EXISTS idx_leads_lp_lead_id ON leads (lp_lead_id);

      -- Lead Prosper's API does not expose a buyer's contact email to the
      -- seller (confirmed against their public lead-lookup API) - only the
      -- campaign owner (you) knows each buyer's email, from entering it
      -- when the buyer was created in the Lead Prosper dashboard. This
      -- table is that mapping, maintained by you (see ADMIN_API_KEY-gated
      -- routes below), so a booking can be routed to the right buyer.
      CREATE TABLE IF NOT EXISTS buyer_emails (
        buyer_id TEXT PRIMARY KEY,
        buyer_name TEXT,
        email TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `).catch((err) => {
      // Let the next call retry rather than caching a failed migration.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function insertLead(lead, meta = {}) {
  await ensureSchema();
  const { rows } = await pool.query(
    `INSERT INTO leads (lead_score, lead_tier, email, phone, otp_verified, ip_address, user_agent, payload, received_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      lead.leadScore ?? null,
      lead.leadTier ?? null,
      lead.contact?.email ?? null,
      lead.phone ?? null,
      !!lead.otpVerified,
      meta.ip ?? null,
      meta.userAgent ?? null,
      lead,
      lead.receivedAt,
    ]
  );
  return rows[0].id;
}

export async function listLeads({ limit = 500 } = {}) {
  await ensureSchema();
  const { rows } = await pool.query(
    `SELECT id, lead_score, lead_tier, email, phone, otp_verified, received_at, payload
     FROM leads ORDER BY received_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({ ...r.payload, id: r.id }));
}

export async function countLeads() {
  await ensureSchema();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM leads');
  return rows[0].count;
}

// Called right after Lead Prosper's direct_post responds ACCEPTED (see
// routes/leads.js) - stores their lead_id against our row so a later
// booking event can look up which buyer purchased this lead.
export async function setLeadProsperId(id, lpLeadId) {
  if (!lpLeadId) return;
  await ensureSchema();
  await pool.query('UPDATE leads SET lp_lead_id = $1 WHERE id = $2', [lpLeadId, id]);
}

export async function getLeadById(id) {
  await ensureSchema();
  const { rows } = await pool.query(
    `SELECT id, lead_score, lead_tier, email, phone, otp_verified, received_at, payload,
            lp_lead_id, booking_scheduled_for, booking_slot, booking_invite_sent, booked_at
     FROM leads WHERE id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return { ...r.payload, id: r.id, lpLeadId: r.lp_lead_id, bookingInviteSent: r.booking_invite_sent };
}

// Records the booking itself (date/slot as the consumer picked them) and,
// separately, whether the calendar-invite email actually went out -
// recordBooking() can succeed even if the invite send later fails, so a
// booking is never lost just because Resend/Lead Prosper hiccuped.
export async function recordBooking(id, { date, slot }) {
  await ensureSchema();
  await pool.query(
    `UPDATE leads SET booking_scheduled_for = $1, booking_slot = $2, booked_at = now() WHERE id = $3`,
    [date, slot, id]
  );
}

export async function markInviteSent(id) {
  await ensureSchema();
  await pool.query('UPDATE leads SET booking_invite_sent = TRUE WHERE id = $1', [id]);
}

// --- buyer_id -> email mapping -------------------------------------------
// Populated by you (see the ADMIN_API_KEY-gated routes in routes/leads.js)
// since Lead Prosper's API won't hand this over programmatically.

export async function upsertBuyerEmail(buyerId, email, buyerName) {
  await ensureSchema();
  await pool.query(
    `INSERT INTO buyer_emails (buyer_id, buyer_name, email, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (buyer_id) DO UPDATE SET buyer_name = $2, email = $3, updated_at = now()`,
    [buyerId, buyerName || null, email]
  );
}

export async function getBuyerEmail(buyerId) {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM buyer_emails WHERE buyer_id = $1', [buyerId]);
  return rows[0] || null;
}

export async function listBuyerEmails() {
  await ensureSchema();
  const { rows } = await pool.query('SELECT * FROM buyer_emails ORDER BY buyer_name NULLS LAST, buyer_id');
  return rows;
}

export default pool;
