import { Router } from 'express';
import { sendOtp, verifyOtp, USING_OTP_STUB } from '../lib/otp.js';

const router = Router();

router.post('/send', async (req, res) => {
  const { phone } = req.body || {};
  if (!/^\d{10}$/.test(String(phone || '').replace(/\D/g, ''))) {
    return res.status(400).json({ error: 'A valid 10-digit phone number is required.' });
  }
  try {
    const { code } = await sendOtp(phone);
    // Only echo the code back while OTP delivery is still the stub (no real
    // SMS goes out) — this is what keeps the live site testable before
    // Twilio is wired in. Remove USING_OTP_STUB (or let it go false) and this
    // stops happening automatically; see lib/otp.js.
    res.json({ sent: true, ...(USING_OTP_STUB ? { devCode: code } : {}) });
  } catch (err) {
    // Without this, a Twilio-side error (e.g. a trial account rejecting an
    // unverified destination number) previously left the request hanging
    // with no response at all instead of a clear failure.
    // eslint-disable-next-line no-console
    console.error('[otp send] failed:', err?.message || err);
    res.status(502).json({ sent: false, error: err?.message || 'Failed to send code.' });
  }
});

router.post('/verify', async (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) {
    return res.status(400).json({ error: 'phone and code are required.' });
  }
  try {
    const ok = await verifyOtp(phone, code);
    if (!ok) return res.status(400).json({ verified: false, error: 'Invalid or expired code.' });
    res.json({ verified: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[otp verify] failed:', err?.message || err);
    res.status(502).json({ verified: false, error: err?.message || 'Failed to verify code.' });
  }
});

export default router;
