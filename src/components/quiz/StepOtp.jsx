import { useEffect, useRef, useState } from 'react';
import { sendOtp, verifyOtp } from '../../lib/api.js';

// ============================================================================
// PHONE OTP VERIFICATION STEP
// ----------------------------------------------------------------------------
// Flow: enter number (previous step) -> code auto-sends -> this screen ->
// autofill/manual entry -> verify -> continue immediately. Never forces a
// full funnel restart on failure - wrong/expired code just clears the boxes
// and shows an inline error; "Change phone number" goes back one step
// without losing any other answers.
//
// Calls the real backend (src/lib/api.js -> POST /api/otp/send and
// /api/otp/verify). The backend's OTP delivery is still the documented stub
// (see server/lib/otp.js) — no real SMS goes out yet — so the API echoes
// the code back as `devCode` while that's true, which is the only reason
// the demo banner below can still show a code. Once Twilio is wired in on
// the backend, devCode stops coming back and the banner just disappears;
// nothing here needs to change.
// ============================================================================

const RESEND_COOLDOWN = 30;

export default function StepOtp({ phone, onVerified, onChangeNumber }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [devCode, setDevCode] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sendError, setSendError] = useState(null);
  const refs = useRef([]);

  async function sendCode() {
    setSending(true);
    setSendError(null);
    setDigits(['', '', '', '', '', '']);
    setInvalid(false);
    const result = await sendOtp(phone);
    setSending(false);
    if (!result.sent) {
      // Prefer the backend's actual error (e.g. a Twilio-side rejection)
      // over the generic "still waking up" message when we have one.
      setSendError(result.error || 'generic');
      return;
    }
    setDevCode(result.devCode);
    setResendSeconds(RESEND_COOLDOWN);
  }

  useEffect(() => {
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refs.current[0]?.focus();
  }, [devCode]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  function handleChange(index, raw) {
    const val = raw.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setInvalid(false);
    if (val && refs.current[index + 1]) refs.current[index + 1].focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && refs.current[index - 1]) {
      refs.current[index - 1].focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      text.split('').forEach((ch, i) => {
        if (i < 6) next[i] = ch;
      });
      return next;
    });
    const focusIndex = Math.min(text.length, 5);
    requestAnimationFrame(() => refs.current[focusIndex]?.focus());
  }

  async function verify() {
    const entered = digits.join('');
    if (entered.length < 6) return;
    setVerifying(true);
    const result = await verifyOtp(phone, entered);
    setVerifying(false);
    if (!result.verified) {
      setInvalid(true);
      return;
    }
    onVerified();
  }

  useEffect(() => {
    if (digits.every((d) => d !== '')) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  return (
    <div className="quiz-otp-wrap">
      <p className="quiz-otp-sentto">
        {sending ? `Sending a code to ${phone}…` : `Code sent to ${phone}`}
      </p>

      <div className="otp-group" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            disabled={sending || verifying}
            className={`otp-box${invalid ? ' is-invalid' : ''}`}
            value={digit}
            ref={(el) => (refs.current[i] = el)}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>

      {invalid && <p className="quiz-otp-error">That code didn't match. Please try again.</p>}
      {sendError && sendError !== 'generic' && (
        <p className="quiz-otp-error">Couldn't send a code: {sendError}</p>
      )}
      {sendError === 'generic' && (
        <p className="quiz-otp-error">
          Couldn't reach the server to send a code — the backend may just be waking up (it can take
          up to a minute after being idle). Try Resend in a moment.
        </p>
      )}
      {verifying && <p className="quiz-helper">Verifying…</p>}

      {/* Only appears while the backend's OTP delivery is still a stub (see
          server/lib/otp.js) — a real Twilio integration never returns a
          code to the client, so this banner disappears on its own once
          that's wired in. */}
      {devCode && (
        <div className="quiz-demo-banner">
          Demo mode — no SMS is actually sent yet. Your code is <b>{devCode}</b>
        </div>
      )}

      <div className="quiz-otp-actions">
        <button type="button" disabled={resendSeconds > 0 || sending} onClick={sendCode}>
          {resendSeconds > 0 ? `Resend code (${resendSeconds}s)` : 'Resend code'}
        </button>
        <button type="button" onClick={onChangeNumber}>
          Change phone number
        </button>
      </div>
    </div>
  );
}
