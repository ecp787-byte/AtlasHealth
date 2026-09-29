// ============================================================================
// TRUSTEDFORM CERTIFICATE — read-only helper
// ----------------------------------------------------------------------------
// TrustedForm (ActiveProspect) is what generates the trustedform_cert_url
// Lead Prosper (and most lead buyers) expect as proof of consent capture.
// It's a real, account-specific script that has to come from YOUR
// ActiveProspect/TrustedForm account (Setup -> Field Recording -> copy the
// snippet) - there's no generic public script to embed, so it's NOT wired
// up here yet.
//
// Once you have your account's real snippet, add it once, near the top of
// index.html's <body> (this is a single-page app; TrustedForm's SDK is
// fine with recording the whole visit as one certificate across the quiz
// flow — no per-step reinitialization needed). The snippet injects a
// hidden <input name="xxTrustedFormCertUrl"> and fills it in asynchronously
// after the visitor has been on the page a moment.
//
// This helper just reads that field, if present, right before the lead is
// submitted (see ResultsPage.jsx). Until the real script is installed, the
// field never appears and this safely returns undefined - the lead still
// submits normally, just without a trustedform_cert_url (Lead Prosper
// treats that field as optional).
// ============================================================================

export function getTrustedFormCertUrl() {
  if (typeof document === 'undefined') return undefined;
  const field = document.querySelector('input[name="xxTrustedFormCertUrl"]');
  return field?.value || undefined;
}
