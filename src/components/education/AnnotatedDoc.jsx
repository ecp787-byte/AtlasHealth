// A labeled document mock-up - styled like a real Explanation of Benefits
// statement rather than a generic data table, since the point of this
// diagram is to make an unfamiliar document type legible at a glance
// (which column is the scary big number vs. the one that's actually your
// responsibility). The "Your Responsibility" column is the one visually
// emphasized - not with a status color (this isn't good/bad/warning), but
// with a soft neutral tint, since it's the column the reader actually
// came here to find.
export default function AnnotatedDoc({ title, columns, rows, footnote }) {
  return (
    <figure className="article-diagram diagram-doc">
      <figcaption className="article-chart-title">{title}</figcaption>

      <div className="diagram-doc-sheet">
        <div className="diagram-doc-sheet-head">
          <span className="diagram-doc-sheet-eyebrow">Sample</span>
          <span className="diagram-doc-sheet-title">Explanation of Benefits</span>
        </div>

        <div className="diagram-doc-table-wrap">
          <table className="diagram-doc-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th scope="col" key={col}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} className={i === row.length - 1 ? 'diagram-doc-cell-emphasis' : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {footnote && <p className="diagram-footnote">{footnote}</p>}
    </figure>
  );
}
