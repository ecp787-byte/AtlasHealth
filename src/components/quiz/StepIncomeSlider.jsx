import { INCOME_BUCKETS } from '../../data/quizConfig.js';

// Single-thumb slider over discrete income buckets (see INCOME_BUCKETS in
// quizConfig.js) rather than a free-text number — nobody has their exact
// monthly household income memorized, but most people can place a dot on a
// range. Native <input type="range"> drives it (full keyboard/a11y support
// for free: arrow keys, Home/End, screen-reader value announcement) styled
// to look like a custom track+thumb rather than a bare system slider.
export default function StepIncomeSlider({ value, onChange }) {
  const index = Math.max(0, INCOME_BUCKETS.findIndex((b) => b.value === value));
  const bucket = INCOME_BUCKETS[index];
  const pct = (index / (INCOME_BUCKETS.length - 1)) * 100;

  return (
    <div className="quiz-income-slider">
      {value && <p className="quiz-income-value">{bucket.label}</p>}
      <div className="quiz-income-track-wrap">
        <input
          type="range"
          className="quiz-income-range"
          min={0}
          max={INCOME_BUCKETS.length - 1}
          step={1}
          value={index}
          onChange={(e) => onChange(INCOME_BUCKETS[Number(e.target.value)].value)}
          aria-label="Approximate monthly household income"
          aria-valuetext={bucket.label}
          style={{ '--quiz-income-pct': `${pct}%` }}
        />
      </div>
      <div className="quiz-income-endpoints">
        <span>{INCOME_BUCKETS[0].label}</span>
        <span>{INCOME_BUCKETS[INCOME_BUCKETS.length - 1].label}</span>
      </div>
    </div>
  );
}
