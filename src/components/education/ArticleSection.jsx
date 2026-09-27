// Renders one entry from an article's `sections` array. Kept separate from
// ArticlePage so the section-type -> markup mapping is easy to find and
// extend (a new `type` in the content data needs one new case here).
export default function ArticleSection({ section }) {
  switch (section.type) {
    case 'h2':
      return <h2 className="article-h2">{section.text}</h2>;
    case 'h3':
      return <h3 className="article-h3">{section.text}</h3>;
    case 'p':
      return <p className="article-p">{section.text}</p>;
    case 'list':
      return section.ordered ? (
        <ol className="article-list article-list-ordered">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="article-list">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className="article-table-wrap">
          <table className="article-table">
            <thead>
              <tr>
                {section.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'example':
      return (
        <div className="article-example">
          <span className="article-example-label">Example</span>
          <p>{section.text}</p>
        </div>
      );
    case 'callout':
      return (
        <div className="article-callout">
          <p>{section.text}</p>
        </div>
      );
    default:
      return null;
  }
}
