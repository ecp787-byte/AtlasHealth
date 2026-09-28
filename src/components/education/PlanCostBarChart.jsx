// A grouped column chart comparing two plans' total potential annual cost
// across two usage scenarios. Built as plain inline SVG, matching
// BeforeAfterChart's approach (no chart library). Plan A and Plan B are an
// ordered pair on a single measure (lower premium/higher deductible vs.
// higher premium/lower deductible) rather than an arbitrary pair of
// categories, so - per the same reasoning as BeforeAfterChart - this reuses
// the validated 2-step ordinal ramp (--accent, --accent-2) instead of a
// new categorical palette.
const WIDTH = 640;
const HEIGHT = 300;
const TOP_PAD = 40; // legend
const BOTTOM_PAD = 34; // group labels
const LEFT_PAD = 52; // $ axis
const RIGHT_PAD = 16;
const BAR_GAP = 6;
const GROUP_GAP = 0.42; // fraction of group width left as whitespace between groups

function niceMax(max) {
  const step = max > 12000 ? 2000 : max > 1200 ? 500 : 50;
  return Math.ceil((max * 1.15) / step) * step;
}

function formatDollars(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function PlanCostBarChart({ title, series, groups, footnote }) {
  const allValues = groups.flatMap((g) => g.values);
  const domainMax = niceMax(Math.max(...allValues));
  const tickCount = 4;
  const tickStep = domainMax / tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickStep);

  const plotX0 = LEFT_PAD;
  const plotX1 = WIDTH - RIGHT_PAD;
  const plotY0 = TOP_PAD;
  const plotY1 = HEIGHT - BOTTOM_PAD;
  const plotWidth = plotX1 - plotX0;
  const plotHeight = plotY1 - plotY0;

  const groupWidth = plotWidth / groups.length;
  const barWidth = (groupWidth * (1 - GROUP_GAP) - BAR_GAP) / 2;

  const scaleY = (v) => plotY1 - (v / domainMax) * plotHeight;

  return (
    <figure className="article-chart">
      <figcaption className="article-chart-title">{title}</figcaption>

      <svg className="article-chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="plan-cost-desc">
        <desc id="plan-cost-desc">
          {groups.map((g) => `${g.label}: ${series[0]} ${formatDollars(g.values[0])}, ${series[1]} ${formatDollars(g.values[1])}.`).join(' ')}
        </desc>

        {/* Legend */}
        <g transform="translate(0, 8)">
          <rect x={LEFT_PAD} y="4" width="12" height="12" rx="3" fill="var(--accent)" />
          <text x={LEFT_PAD + 18} y="14" className="article-chart-legend-text">
            {series[0]}
          </text>
          <rect x={LEFT_PAD + 150} y="4" width="12" height="12" rx="3" fill="var(--accent-2)" />
          <text x={LEFT_PAD + 168} y="14" className="article-chart-legend-text">
            {series[1]}
          </text>
        </g>

        {/* Gridlines */}
        {ticks.map((t) => (
          <line key={t} x1={plotX0} x2={plotX1} y1={scaleY(t)} y2={scaleY(t)} className="article-chart-gridline" />
        ))}

        {/* Axis ticks */}
        {ticks.map((t) => (
          <text key={t} x={plotX0 - 8} y={scaleY(t) + 4} textAnchor="end" className="article-chart-tick">
            {t === 0 ? '$0' : formatDollars(t)}
          </text>
        ))}

        {/* Baseline */}
        <line x1={plotX0} x2={plotX1} y1={plotY1} y2={plotY1} className="article-chart-axis" />

        {/* Groups */}
        {groups.map((group, i) => {
          const groupX0 = plotX0 + i * groupWidth + (groupWidth * GROUP_GAP) / 2;
          const [valA, valB] = group.values;
          const xA = groupX0;
          const xB = groupX0 + barWidth + BAR_GAP;
          const yA = scaleY(valA);
          const yB = scaleY(valB);

          return (
            <g key={group.label}>
              <title>{`${group.label}: ${series[0]} ${formatDollars(valA)}, ${series[1]} ${formatDollars(valB)}`}</title>

              <rect x={xA} y={yA} width={barWidth} height={plotY1 - yA} rx="4" fill="var(--accent)" />
              <text x={xA + barWidth / 2} y={yA - 8} textAnchor="middle" className="article-chart-value">
                {formatDollars(valA)}
              </text>

              <rect x={xB} y={yB} width={barWidth} height={plotY1 - yB} rx="4" fill="var(--accent-2)" />
              <text x={xB + barWidth / 2} y={yB - 8} textAnchor="middle" className="article-chart-value">
                {formatDollars(valB)}
              </text>

              <text x={groupX0 + (barWidth * 2 + BAR_GAP) / 2} y={plotY1 + 22} textAnchor="middle" className="article-chart-row-label">
                {group.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Accessible data table */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            <th scope="col">{series[0]}</th>
            <th scope="col">{series[1]}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.label}>
              <th scope="row">{group.label}</th>
              <td>{formatDollars(group.values[0])}</td>
              <td>{formatDollars(group.values[1])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {footnote && (
        <p className="diagram-footnote diagram-footnote-inset">{footnote}</p>
      )}
    </figure>
  );
}
