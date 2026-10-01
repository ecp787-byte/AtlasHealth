function formatPhone(digits) {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function StepPhone({ value, onChange, autoFocus }) {
  return (
    <div className="quiz-single-input">
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        autoFocus={autoFocus}
        maxLength={14}
        className="quiz-input quiz-input-large"
        placeholder="(555) 555-5555"
        value={formatPhone((value || '').replace(/\D/g, ''))}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
      />
    </div>
  );
}

export function isValidPhone(digits) {
  return /^\d{10}$/.test((digits || '').replace(/\D/g, ''));
}
