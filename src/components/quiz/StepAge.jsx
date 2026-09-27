export default function StepAge({ value, onChange, autoFocus }) {
  return (
    <div className="quiz-single-input">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={3}
        autoFocus={autoFocus}
        className="quiz-input quiz-input-large"
        placeholder="Age"
        value={value || ''}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
          onChange(digits);
        }}
      />
    </div>
  );
}

export function isValidAge(value) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n >= 0 && n <= 120;
}
