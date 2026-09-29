// A small "before -> after" dumbbell chart: one shared dollar axis, one row
// per item, a light dot for the earlier value and a dark dot for the later
// one, connected by a line, with the actual dollar amounts labeled directly
// on the marks rather than left to a legend to explain. Built as a plain,
// dependency-free inline SVG (no chart library) so it renders instantly and
// matches the article's own typography.
//
// Per the site's data-viz approach: two time points on the same measure is
// an ORDINAL comparison (earlier -> later), not two unrelated categories, so
// it takes a single hue in two lightness steps (--accent for the earlier
// value, --accent-2 for the later one) rather than two arbitrary colors -
// validated as a 2-step ordinal ramp, not a categorical pair.
const WIDTH = 640;
const ROW_HEIGHT = 74;
const TOP_PAD = 54; // legend + top margin
const AXIS_HEIGHT = 34;
const BOTTOM_PAD = 16;
const LABEL_COL = 108;
const RIGHT_PAD = 28;

function niceMax(max) {
  const step = max > 12000 ? 5000 : max > 1200 ? 500 : 50;
  return Math.ceil(max / step) * step * 1.15 - ((Math.ceil(max / step) * step * 1.15) % step);
}

function formatDollars(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function BeforeAfterChart({ title, series, rows, footnote }) {
  const allValues = rows.flatMap((r) => r.values);
  const domainMax = niceMax(Math.max(...allValues));
  const tickCount = 5;
  const tickStep = domainMax / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

  const plotX0 = LABEL_COL;
  const plotX1 = WIDTH - RIGHT_PAD;
  const plotWidth = plotX1 - plotX0;
  const scaleX = (v) => plotX0 + (v / domainMax) * plotWidth;

  const axisY = TOP_PAD + rows.length * ROW_HEIGHT + 10;
  const height = axisY + AXIS_HEIGHT + BOTTOM_PAD + (footnote ? 22 : 0);

  return (
    <figure className="article-chart">
      <figcaption className="article-chart-title">{title}</figcaption>

      <svg
        className="article-chart-svg"
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-labelledby="chart-title-desc"
      >
        <desc id="chart-title-desc">
          {rows.map((r) => `${r.label}: ${formatDollars(r.values[0])} in ${series[0]}, ${formatDollars(r.values[1])} in ${series[1]}.`).join(' ')}
        </desc>

        {/* Legend - always present for 2 series, per the identity rule */}
        <g transform="translate(0, 8)">
          <circle cx={LABEL_COL} cy="10" r="5" fill="var(--accent)" />
          <text x={LABEL_COL + 12} y="14" className="article-chart-legend-text">
            {series[0]}
          </text>
          <circle cx={LABEL_COL + 90} cy="10" r="5" fill="var(--accent-2)" />
          <text x={LABEL_COL + 102} y="14" className="article-chart-legend-text">
            {series[1]}
          </text>
        </g>

        {/* Gridlines - hairline, recessive, behind everything */}
        {ticks.map((t) => (
          <line
            key={t}
            x1={scaleX(t)}
            x2={scaleX(t)}
            y1={TOP_PAD - 12}
            y2={axisY}
            className="article-chart-gridline"
          />
        ))}

        {/* Rows */}
        {rows.map((row, i) => {
          const y = TOP_PAD + i * ROW_HEIGHT + ROW_HEIGHT / 2;
          const [before, after] = row.values;
          const x0 = scaleX(before);
          const x1 = scaleX(after);
          const delta = after - before;
          // Two separate value labels only read cleanly when the dots are
          // far enough apart not to collide - below that, per the "don't
          // stack colliding end-labels" rule, merge into a single label
          // above the pair instead of overlapping text.
          const labelsCollide = Math.abs(x1 - x0) < 72;

          return (
            <g key={row.label}>
              <text x={0} y={y + 4} className="article-chart-row-label">
                {row.label}
              </text>

              <line x1={x0} x2={x1} y1={y} y2={y} className="article-chart-connector" />

              <title>{`${row.label}: ${formatDollars(before)} → ${formatDollars(after)}`}</title>

              {/* Earlier value */}
              <circle cx={x0} cy={y} r="7" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
              {!labelsCollide && (
                <text x={x0} y={y - 16} textAnchor="middle" className="article-chart-value article-chart-value-muted">
                  {formatDollars(before)}
                </text>
              )}

              {/* Later value */}
              <circle cx={x1} cy={y} r="7" fill="var(--accent-2)" stroke="var(--surface)" strokeWidth="2" />
              {!labelsCollide && (
                <text x={x1} y={y - 16} textAnchor="middle" className="article-chart-value">
                  {formatDollars(after)}
                </text>
              )}
              {labelsCollide && (
                <text x={(x0 + x1) / 2} y={y - 16} textAnchor="middle" className="article-chart-value">
                  {formatDollars(before)} → {formatDollars(after)}
                </text>
              )}

              {/* Delta, neutral text - not a good/bad status */}
              <text x={x1 + 16} y={y + 4} className="article-chart-delta">
                +{formatDollars(delta)}
              </text>
            </g>
          );
        })}

        {/* Axis */}
        <line x1={plotX0} x2={plotX1} y1={axisY} y2={axisY} className="article-chart-axis" />
        {ticks.map((t) => (
          <text key={t} x={scaleX(t)} y={axisY + 20} textAnchor="middle" className="article-chart-tick">
            {t === 0 ? '$0' : `$${t.toLocaleString('en-US')}`}
          </text>
        ))}

        {footnote && (
          <text x={0} y={height - 4} className="article-chart-footnote">
            {footnote}
          </text>
        )}
      </svg>

      {/* Accessible data table - same numbers, for screen readers and anyone
          who'd rather read than parse a chart. Visually hidden, not removed. */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">{series[0]}</th>
            <th scope="col">{series[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{formatDollars(row.values[0])}</td>
              <td>{formatDollars(row.values[1])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
