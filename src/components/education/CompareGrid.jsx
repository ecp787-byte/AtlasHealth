// An N-column labeled comparison (PPO/HMO/EPO, Marketplace/Employer/
// Private) for identity content the brand's muted palette can't safely
// color-code - validated against the palette validator earlier in this
// project: every categorical combination from the brand's own tokens
// failed the chroma-floor / lightness-band checks, so identity here is
// carried entirely by column position + label + icon, never by color.
// Deliberately a condensed "at a glance" summary (3-4 facts per column)
// rather than a restatement of the full comparison table already in the
// article body below it.
export default function CompareGrid({ title, columns, footnote }) {
  return (
    <figure className="article-diagram diagram-grid">
      <figcaption className="article-chart-title">{title}</figcaption>

      <div className={`diagram-grid-row diagram-grid-cols-${columns.length}`}>
        {columns.map((col) => (
          <div className="diagram-grid-card" key={col.label}>
            <p className="diagram-grid-label">{col.label}</p>
            {col.tag && <p className="diagram-grid-tag">{col.tag}</p>}
            <ul className="diagram-grid-facts">
              {col.facts.map((fact) => (
                <li key={fact.label}>
                  <span className="diagram-grid-fact-label">{fact.label}</span>
                  <span className="diagram-grid-fact-value">{fact.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {footnote && <p className="diagram-footnote">{footnote}</p>}
    </figure>
  );
}
