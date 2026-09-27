import { useState } from 'react';

// Full date of birth — used instead of a bare age field where a funnel
// variant wants the more precise/standard input. Typed MM/DD/YYYY (not a
// native calendar picker) so it's fast to fill by hand and, via
// autoComplete="bday", eligible for browser/password-manager autofill or
// pre-fill from stored lead data — a calendar widget can't be prefilled the
// same way. The value stored in answers.dob (and sent to the backend) stays
// a plain ISO "YYYY-MM-DD" string throughout, unchanged from before, so
// nothing downstream (leadScoring, ResultsPage, the API payload) needs to
// change.

function isoToDisplay(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return '';
  return `${m[2]}/${m[3]}/${m[1]}`;
}

function digitsToDisplay(digits) {
  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  let out = mm;
  if (digits.length > 2) out += `/${dd}`;
  if (digits.length > 4) out += `/${yyyy}`;
  return out;
}

// Round-trips through Date to reject calendar-impossible input like 02/30.
function digitsToIso(digits) {
  if (digits.length !== 8) return '';
  const month = Number(digits.slice(0, 2));
  const day = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (month < 1 || month > 12 || day < 1 || day > 31) return '';
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return '';
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export default function StepDob({ value, onChange, autoFocus }) {
  const [digits, setDigits] = useState(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return m ? `${m[2]}${m[3]}${m[1]}` : '';
  });
  const [touched, setTouched] = useState(false);

  function handleChange(raw) {
    const nextDigits = raw.replace(/\D/g, '').slice(0, 8);
    setDigits(nextDigits);
    setTouched(true);
    onChange(digitsToIso(nextDigits));
  }

  const showInvalid = touched && digits.length === 8 && !digitsToIso(digits);

  return (
    <div className="quiz-single-input">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="bday"
        autoFocus={autoFocus}
        maxLength={10}
        className="quiz-input quiz-input-large"
        placeholder="MM/DD/YYYY"
        value={digits ? digitsToDisplay(digits) : isoToDisplay(value)}
        onChange={(e) => handleChange(e.target.value)}
      />
      {showInvalid && <p className="quiz-otp-error">That's not a valid date.</p>}
    </div>
  );
}

function computeAge(isoValue) {
  const dob = new Date(`${isoValue}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function isValidDob(isoValue) {
  if (!isoValue) return false;
  const age = computeAge(isoValue);
  return age !== null && age >= 18 && age <= 120;
}

export function ageFromDob(isoValue) {
  return computeAge(isoValue);
}
