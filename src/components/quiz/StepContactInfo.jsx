import { contactValid } from './StepContact.jsx';
import { isValidPhone } from './StepPhone.jsx';

// Combined "how do we reach you" screen: name, phone, and email on one page
// instead of three separate steps. ZIP used to live here too, but moved up
// to its own early step in "About you" (see quizConfig.js's 'zip' step) so
// it happens before the situational questions instead of at the very end —
// this screen now only merges the three fields that still have no earlier
// natural home. Phone is still verified by OTP immediately afterward, same
// as before; this step only merges the *collection* of the fields, not the
// verification step that follows it.
//
// Writes to the same top-level answer fields the old separate steps did
// (`contact`, `phone`) so nothing downstream (ResultsPage's submit payload,
// the consent summary, CRM field mapping) needs to change.
function formatPhone(digits) {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function StepContactInfo({ contact, phone, onChangeContact, onChangePhone }) {
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
    </div>
  );
}

export function contactInfoValid({ contact, phone }) {
  return contactValid(contact) && isValidPhone(phone);
}
