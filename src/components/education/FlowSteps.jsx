// A horizontal (stacked on mobile) numbered sequence diagram - for
// processes that happen in a fixed order (premium -> deductible ->
// coinsurance -> out-of-pocket max, or the claims pipeline). Every step is
// the same visual weight and the same accent color: order is communicated
// by position and the connecting arrow, never by color-coding each step
// differently, since these are stages of one process, not competing
// categories.
export default function FlowSteps({ title, steps, footnote }) {
  return (
    <figure className="article-diagram diagram-flow">
      <figcaption className="article-chart-title">{title}</figcaption>

      <ol className="diagram-flow-list">
        {steps.map((step, i) => (
          <li className="diagram-flow-item" key={step.label}>
            <div className="diagram-flow-step">
              <span className="diagram-flow-num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="diagram-flow-copy">
                <p className="diagram-flow-label">{step.label}</p>
                {step.detail && <p className="diagram-flow-detail">{step.detail}</p>}
              </div>
            </div>
            {i < steps.length - 1 && (
              <span className="diagram-flow-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="diagram-flow-arrow-icon">
                  <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>

      {footnote && <p className="diagram-footnote">{footnote}</p>}
    </figure>
  );
}
