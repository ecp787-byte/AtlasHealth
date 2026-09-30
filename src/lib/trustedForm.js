// ============================================================================
// TRUSTEDFORM CERTIFICATE — read-only helper
// ----------------------------------------------------------------------------
// TrustedForm (ActiveProspect) is what generates the trustedform_cert_url
// Lead Prosper (and most lead buyers) expect as proof of consent capture.
// The real account snippet IS installed on the live site (loaded from
// cdn.trustedform.com) and is actively recording — confirmed live via
// window.trustedForm.certificateUploaded === true.
//
// That snippet's default behavior is to insert a hidden
// <input name="xxTrustedFormCertUrl"> into a <form> element and fill it in
// asynchronously. This site is a single-page React app with no actual
// <form> tag for it to attach to, so that field is never created — reading
// it (the old approach here) always silently returned undefined, meaning
// trustedFormCertUrl was never actually reaching the backend/Lead Prosper
// even though TrustedForm itself was working fine.
//
// Fix: read window.trustedForm.cert_id directly and build the certificate
// URL from TrustedForm's documented pattern (https://cert.trustedform.com/
// {cert_id}) — confirmed live to produce a real, valid certificate URL.
// The hidden-field lookup is kept as a fallback in case the install is
// ever switched to a form-attached snippet later.
// ============================================================================

export function getTrustedFormCertUrl() {
  if (typeof window === 'undefined') return undefined;
  const certId = window.trustedForm?.cert_id;
  if (certId) return `https://cert.trustedform.com/${certId}`;
  if (typeof document === 'undefined') return undefined;
  const field = document.querySelector('input[name="xxTrustedFormCertUrl"]');
  return field?.value || undefined;
}
