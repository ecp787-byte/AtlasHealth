// ============================================================================
// OTP DELIVERY — Twilio Verify, with an in-memory stub fallback
// ----------------------------------------------------------------------------
// Wired to Twilio Verify (handles code generation, expiry, and rate limiting
// for you). It activates automatically once all three env vars are set on
// the server:
//
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID
//
// Until then, sendOtp/verifyOtp fall back to a simple in-memory stub (code
// "sent" via a server log line + echoed back to the client as `devCode` —
// see routes/otp.js) so the funnel stays fully testable end-to-end with no
// real SMS provider configured. See .env.example.
// ============================================================================

import twilio from 'twilio';

// Real Twilio Verify is used automatically the moment all three env vars
// below are set (e.g. on Render, under the service's Environment tab) — no
// further code changes or redeploys needed. Until then, everything falls
// back to the in-memory stub so the funnel stays fully testable.
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
const USING_REAL_TWILIO = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID);
const client = USING_REAL_TWILIO ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

// routes/otp.js uses this to decide whether to echo the code back in the
// /send response — real SMS delivery should never do that; the echo exists
// only so the funnel stays testable end-to-end before Twilio is wired in.
export const USING_OTP_STUB = !USING_REAL_TWILIO;

// US-only assumption matches the 10-digit validation in routes/otp.js.
function toE164(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

const codes = new Map(); // phone -> { code, expiresAt } — stub path only
const CODE_TTL_MS = 5 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtp(phone) {
  if (USING_REAL_TWILIO) {
    await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create({
      to: toE164(phone),
      channel: 'sms',
    });
    return { sent: true, code: null };
  }
  const code = generateCode();
  codes.set(phone, { code, expiresAt: Date.now() + CODE_TTL_MS });
  // eslint-disable-next-line no-console
  console.log(`[otp stub] would SMS ${phone} the code ${code} (not actually sent - set TWILIO_* env vars, see file header)`);
  return { sent: true, code };
}

export async function verifyOtp(phone, submittedCode) {
  if (USING_REAL_TWILIO) {
    const check = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
      to: toE164(phone),
      code: submittedCode,
    });
    return check.status === 'approved';
  }
  const entry = codes.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    codes.delete(phone);
    return false;
  }
  const ok = entry.code === submittedCode;
  if (ok) codes.delete(phone);
  return ok;
}
