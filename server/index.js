import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import otpRoutes from './routes/otp.js';
import leadsRoutes from './routes/leads.js';
import { isDbConfigured, ensureSchema } from './lib/db.js';

const app = express();
// Render puts the app behind a proxy - without this, req.ip is the proxy's
// internal address, not the visitor's, which breaks Lead Prosper's
// ip_address field (and any other IP-based logic).
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

// Reports which integration env vars this running process actually sees, as
// booleans only (never the values) - a quick way to confirm env var config
// actually reached the process without needing to dig through deploy logs.
app.get('/health', (_req, res) => res.json({
  ok: true,
  dbConfigured: isDbConfigured(),
  twilioConfigured: {
    accountSid: !!process.env.TWILIO_ACCOUNT_SID,
    authToken: !!process.env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: !!process.env.TWILIO_VERIFY_SERVICE_SID,
  },
  leadProsperConfigured: {
    campaignId: !!process.env.LP_CAMPAIGN_ID,
    supplierId: !!process.env.LP_SUPPLIER_ID,
    key: !!process.env.LP_KEY,
  },
  ghlConfigured: {
    apiKey: !!process.env.GHL_API_KEY,
    locationId: !!process.env.GHL_LOCATION_ID,
  },
  metaCapiConfigured: {
    pixelId: !!process.env.META_PIXEL_ID,
    accessToken: !!process.env.META_CAPI_ACCESS_TOKEN,
  },
  trustedFormRetainConfigured: !!process.env.TRUSTEDFORM_API_KEY,
  adminApiConfigured: !!process.env.ADMIN_API_KEY,
}));
app.use('/api/otp', otpRoutes);
app.use('/api/leads', leadsRoutes);

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Veritas funnel backend listening on :${PORT}`);

  if (isDbConfigured()) {
    ensureSchema()
      .then(() => console.log('[db] schema ready')) // eslint-disable-line no-console
      .catch((err) => console.error('[db] schema init failed:', err.message)); // eslint-disable-line no-console
  } else {
    // eslint-disable-next-line no-console
    console.warn('[db] DATABASE_URL not set - leads are IN-MEMORY ONLY and will be lost on restart.');
  }

  // eslint-disable-next-line no-console
  console.log(
    '[env check] TWILIO_ACCOUNT_SID set:', !!process.env.TWILIO_ACCOUNT_SID,
    '| TWILIO_AUTH_TOKEN set:', !!process.env.TWILIO_AUTH_TOKEN,
    '| TWILIO_VERIFY_SERVICE_SID set:', !!process.env.TWILIO_VERIFY_SERVICE_SID,
  );
  // eslint-disable-next-line no-console
  console.log(
    '[env check] LP_CAMPAIGN_ID set:', !!process.env.LP_CAMPAIGN_ID,
    '| LP_SUPPLIER_ID set:', !!process.env.LP_SUPPLIER_ID,
    '| LP_KEY set:', !!process.env.LP_KEY,
  );
  // eslint-disable-next-line no-console
  console.log(
    '[env check] GHL_API_KEY set:', !!process.env.GHL_API_KEY,
    '| GHL_LOCATION_ID set:', !!process.env.GHL_LOCATION_ID,
  );
  // eslint-disable-next-line no-console
  console.log(
    '[env check] META_PIXEL_ID set:', !!process.env.META_PIXEL_ID,
    '| META_CAPI_ACCESS_TOKEN set:', !!process.env.META_CAPI_ACCESS_TOKEN,
  );
  // eslint-disable-next-line no-console
  console.log('[env check] TRUSTEDFORM_API_KEY set:', !!process.env.TRUSTEDFORM_API_KEY);
  // eslint-disable-next-line no-console
  console.log('[env check] DATABASE_URL set:', !!process.env.DATABASE_URL, '| ADMIN_API_KEY set:', !!process.env.ADMIN_API_KEY);
});
