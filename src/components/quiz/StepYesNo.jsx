export default function StepYesNo({ value, onSelect }) {
  return (
    <div className="quiz-cards quiz-cards-2col" role="radiogroup">
      {[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ].map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`quiz-card quiz-card-compact${value === opt.value ? ' is-selected' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          <span className="quiz-card-label">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
