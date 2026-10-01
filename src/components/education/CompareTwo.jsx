// A two-card side-by-side comparison for content with a genuine identity
// distinction (in-network vs. out-of-network, copay vs. coinsurance,
// comprehensive vs. supplemental) rather than an ordered progression. Per
// the site's data-viz approach, identity is never color-alone here: both
// cards use the same neutral surface and are told apart by their label and
// position, not by a red-card/green-card "good vs. bad" treatment that
// would editorialize content that's genuinely neutral (out-of-network
// coverage isn't "bad," it's just a different, costlier structure).
export default function CompareTwo({ title, left, right, footnote }) {
  const sides = [left, right];

  return (
    <figure className="article-diagram diagram-compare2">
      <figcaption className="article-chart-title">{title}</figcaption>

      <div className="diagram-compare2-grid">
        {sides.map((side) => (
          <div className="diagram-compare2-card" key={side.label}>
            <div className="diagram-compare2-head">
              <p className="diagram-compare2-label">{side.label}</p>
              {side.tag && <span className="diagram-compare2-tag">{side.tag}</span>}
            </div>

            <dl className="diagram-compare2-stats">
              {side.stats.map((stat) => (
                <div className="diagram-compare2-stat" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>

            {side.note && <p className="diagram-compare2-note">{side.note}</p>}
          </div>
        ))}
      </div>

      {footnote && <p className="diagram-footnote">{footnote}</p>}
    </figure>
  );
}
