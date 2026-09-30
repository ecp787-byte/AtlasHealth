// A decorative numbered/iconed composition for content that's a list of
// discrete, equally-weighted items rather than a chart in the strict sense
// (the HSA's triple tax advantage, the 10 pre-purchase questions, the
// glossary's four term groups) - per the "this is not a chart" guidance,
// forcing list content into an axis-and-marks chart just to have a visual
// would misrepresent it, so this renders it as a clean grid of badges
// instead. Every badge shares one accent treatment (never a rainbow of
// per-item colors), consistent with the rest of the site's restrained
// palette.
export default function IconCluster({ title, items, footnote }) {
  return (
    <figure className={`article-diagram diagram-cluster diagram-cluster-${items.length <= 4 ? 'wide' : 'compact'}`}>
      <figcaption className="article-chart-title">{title}</figcaption>

      <ul className="diagram-cluster-grid">
        {items.map((item) => (
          <li className="diagram-cluster-item" key={item.label}>
            <span className="diagram-cluster-badge" aria-hidden="true">
              {item.icon ? (
                <svg className="icon">
                  <use href={`#${item.icon}`} />
                </svg>
              ) : (
                item.n
              )}
            </span>
            <div className="diagram-cluster-copy">
              <p className="diagram-cluster-label">{item.label}</p>
              {item.detail && <p className="diagram-cluster-detail">{item.detail}</p>}
            </div>
          </li>
        ))}
      </ul>

      {footnote && <p className="diagram-footnote">{footnote}</p>}
    </figure>
  );
}
