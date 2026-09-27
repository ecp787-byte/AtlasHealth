export default function StepZip({ value, onChange, autoFocus }) {
  return (
    <div className="quiz-single-input">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={5}
        autoFocus={autoFocus}
        autoComplete="postal-code"
        className="quiz-input quiz-input-large"
        placeholder="ZIP code"
        value={value || ''}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
      />
    </div>
  );
}
