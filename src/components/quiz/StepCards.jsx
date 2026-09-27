// Large, fully-tappable selectable cards (never a <select> dropdown).
// Auto-advances on selection - no separate "Continue" tap needed, which
// matters a lot on mobile where every extra tap costs completion rate.
export default function StepCards({ options, value, onSelect }) {
  return (
    <div className="quiz-cards" role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`quiz-card${value === opt.value ? ' is-selected' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          <span className="quiz-card-label">{opt.label}</span>
          <span className="quiz-card-check" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
