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
        received_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_leads_received_at ON leads (received_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
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

export default pool;
