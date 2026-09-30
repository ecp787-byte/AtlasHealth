# Veritas funnel backend

A runnable Express API with the right shape (`/api/otp/send`,
`/api/otp/verify`, `/api/leads`). SMS OTP delivery is live (Twilio Verify —
active automatically once `TWILIO_*` env vars are set, see `lib/otp.js`).
CRM sync (GoHighLevel) and ad-platform conversion tracking (Meta) are still
stubs — each logs what it *would* send instead of calling the real API.
Lead Prosper (sells each verified lead into the exchange) follows the same
"real once configured" pattern as Twilio.

## Run it

```
cd server
npm install
cp .env.example .env   # fill in real credentials as you wire each piece up
npm run dev
```

It listens on `:8787` by default. Point the frontend's OTP/lead calls at it
once you're ready to replace the frontend's demo-mode simulation (see
`src/components/quiz/StepOtp.jsx` and `src/components/ResultsPage.jsx` —
both have `TODO(backend)` comments at the exact lines to change).

## What's stubbed, and what to do about it

| Piece | File | Status | To make real |
|---|---|---|---|
| SMS OTP delivery | `lib/otp.js` | **live** once `TWILIO_*` env vars are set | Twilio Verify — see file header |
| Lead sale (Lead Prosper) | `lib/leadProsper.js` | **live** once `LP_*` env vars are set | direct-post to Lead Prosper — see file header |
| CRM contact/tags/fields | `lib/ghl.js` | logs the payload instead of calling GHL | GoHighLevel Private Integration API key + Location ID |
| Ad-platform conversion events | `lib/meta.js` | logs the (already-hashed) payload instead of calling Graph API | Meta Pixel ID + a CAPI access token |
| Lead persistence | `routes/leads.js` | in-memory array, lost on restart | swap for a real database before deploying |

Only OTP-verified leads are posted to Lead Prosper (`routes/leads.js`) — an
unverified phone number isn't something a buyer should pay for.

## Security notes specific to this backend

- OTP codes are single-use and expire after 5 minutes (`lib/otp.js`).
- Meta match keys (email, phone) are SHA-256 hashed **before** they would
  leave this server (`lib/meta.js`) — raw PII is never sent to Meta.
- The lead score is recomputed server-side from raw answers on every
  submission (`routes/leads.js`) rather than trusted from the client, so a
  tampered client-side score can't inflate a lead's tier.
- `GET /api/leads` is a debug listing with no auth — remove it or put real
  auth in front of it before this is anywhere near production traffic.
