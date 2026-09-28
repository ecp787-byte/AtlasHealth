// A horizontal threshold/fill bar for a single dollar amount building up
// toward a cap (a deductible being met, cost-sharing climbing toward the
// out-of-pocket maximum). This is a genuinely ORDINAL measure - each zone
// is a further stage of the same accumulating total, not a separate
// category - so it reuses the site's validated 2-step ordinal ramp
// (--accent for the earlier/first zone, --accent-2 for the next), the same
// pairing BeforeAfterChart uses, rather than inventing a new categorical
// palette.
const fmt = (n) => `$${Math.round(n).toLocaleString('en-US')}`;

export default function CostMeter({ title, max, bars, footnote }) {
  return (
    <figure className="article-diagram diagram-meter">
      <figcaption className="article-chart-title">{title}</figcaption>

      <div className="diagram-meter-body">
        {bars.map((bar) => (
          <div className="diagram-meter-row" key={bar.label}>
            {bar.label && <p className="diagram-meter-row-label">{bar.label}</p>}

            <div className="diagram-meter-track" role="img" aria-label={bar.aria}>
              {bar.segments.map((seg) => (
                <div
                  key={seg.label}
                  className={`diagram-meter-seg diagram-meter-seg-${seg.tone || 'a'}`}
                  style={{ width: `${Math.max(0, ((seg.to - seg.from) / max) * 100)}%` }}
                >
                  <span className="diagram-meter-seg-label">{seg.label}</span>
                </div>
              ))}
            </div>

            <div className="diagram-meter-ticks">
              <span>$0</span>
              {bar.marker && <span className="diagram-meter-marker-text">{bar.marker}</span>}
              <span>{fmt(max)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible data table - the same segment values, for screen
          readers and anyone who'd rather read numbers than parse a bar. */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Zone</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar) =>
            bar.segments.map((seg) => (
              <tr key={`${bar.label}-${seg.label}`}>
                <th scope="row">{bar.label}</th>
                <td>{seg.label}</td>
                <td>
                  {fmt(seg.from)} – {fmt(seg.to)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {footnote && <p className="diagram-footnote">{footnote}</p>}
    </figure>
  );
}
