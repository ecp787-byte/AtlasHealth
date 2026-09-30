import { contactValid } from './StepContact.jsx';
import { isValidPhone } from './StepPhone.jsx';
import { isValidZip } from '../../lib/zipToState.js';

// Combined "how do we reach you" screen: name, phone, email, and ZIP on one
// page instead of three separate steps (contact -> zip -> phone). This is
// the single biggest step-count cut available in the funnel — these four
// fields have no branching, no conditional logic, and nothing to react to
// mid-entry, so there's no UX reason to force three taps-to-continue instead
// of one. Phone is still verified by OTP immediately afterward, same as
// before; this step only merges the *collection* of the fields, not the
// verification step that follows it.
//
// Writes to the same top-level answer fields the old separate steps did
// (`contact`, `phone`, `zip`) so nothing downstream (ResultsPage's submit
// payload, the consent summary, CRM field mapping) needs to change.
function formatPhone(digits) {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function StepContactInfo({ contact, phone, zip, onChangeContact, onChangePhone, onChangeZip }) {
  const c = contact || { firstName: '', lastName: '', email: '' };

  function updateContact(field, val) {
    onChangeContact({ ...c, [field]: val });
  }

  return (
    <div className="quiz-contact-fields">
      <input
        type="text"
        autoComplete="given-name"
        className="quiz-input"
        placeholder="First name"
        value={c.firstName}
        onChange={(e) => updateContact('firstName', e.target.value)}
      />
      <input
        type="text"
        autoComplete="family-name"
        className="quiz-input"
        placeholder="Last name"
        value={c.lastName}
        onChange={(e) => updateContact('lastName', e.target.value)}
      />
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={14}
        className="quiz-input"
        placeholder="Phone number"
        value={formatPhone((phone || '').replace(/\D/g, ''))}
        onChange={(e) => onChangePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
      />
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        className="quiz-input"
        placeholder="Email address"
        value={c.email}
        onChange={(e) => updateContact('email', e.target.value)}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={5}
        autoComplete="postal-code"
        className="quiz-input"
        placeholder="ZIP code"
        value={zip || ''}
        onChange={(e) => onChangeZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
      />
    </div>
  );
}

export function contactInfoValid({ contact, phone, zip }) {
  return contactValid(contact) && isValidPhone(phone) && isValidZip(zip);
}
