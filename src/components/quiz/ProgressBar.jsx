// Two-layer progress: an optional pill above the bar reads "{section} {n} of
// {count}" (resets per named section — see SECTION_LABELS in
// quizConfig.js), while the bar itself always reflects OVERALL position
// across the whole funnel and never resets. `section` is null for any step
// with no `section` set (Fast Track today), so the pill simply doesn't
// render and this falls back to exactly the old plain-bar look.
export default function ProgressBar({ current, total, section }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="quiz-progress-group">
      {section && (
        <span className="quiz-section-pill">
          {section.label}
          <span className="quiz-section-pill-count">{section.position} of {section.total}</span>
        </span>
      )}
      <div
        className="quiz-progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={section ? `${section.label}, overall progress` : 'Progress'}
      >
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
