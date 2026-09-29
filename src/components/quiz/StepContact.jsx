export default function StepContact({ value, onChange }) {
  const v = value || { firstName: '', lastName: '', email: '' };

  function update(field, val) {
    onChange({ ...v, [field]: val });
  }

  return (
    <div className="quiz-contact-fields">
      <input
        type="text"
        autoComplete="given-name"
        className="quiz-input"
        placeholder="First name"
        value={v.firstName}
        onChange={(e) => update('firstName', e.target.value)}
      />
      <input
        type="text"
        autoComplete="family-name"
        className="quiz-input"
        placeholder="Last name"
        value={v.lastName}
        onChange={(e) => update('lastName', e.target.value)}
      />
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        className="quiz-input"
        placeholder="Email address"
        value={v.email}
        onChange={(e) => update('email', e.target.value)}
      />
    </div>
  );
}

export function contactValid(v) {
  if (!v) return false;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email || '');
  return !!(v.firstName?.trim() && v.lastName?.trim() && emailOk);
}
