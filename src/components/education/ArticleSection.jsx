// Renders one entry from an article's `sections` array. Kept separate from
// ArticlePage so the section-type -> markup mapping is easy to find and
// extend (a new `type` in the content data needs one new case here).
//
// Inline links: any text field (p/list items/example/callout text) may
// contain `[label](target)` — parsed below into a real <a>. `target` is
// either another article's slug (rendered as `/learn/<slug>`) or a full
// `https://` URL (rendered as an external link, new tab). This is how body
// copy cross-links terms to their own glossary entries and how the three
// audience guides link to each other, without hand-writing JSX per article.
function renderInline(text) {
  if (typeof text !== 'string') return text;
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (!re.test(text)) return text;
  re.lastIndex = 0;

  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const [, label, target] = match;
    const isExternal = /^https?:\/\//.test(target);
    parts.push(
      <a
        key={`lnk-${key++}`}
        className="article-link"
        href={isExternal ? target : `/learn/${target}`}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label}
      </a>
    );
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function ArticleSection({ section }) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 id={section.id} className="article-h2">
          {section.text}
        </h2>
      );
    case 'h3':
      return <h3 className="article-h3">{section.text}</h3>;
    case 'p':
      return <p className="article-p">{renderInline(section.text)}</p>;
    case 'list':
      return section.ordered ? (
        <ol className="article-list article-list-ordered">
          {section.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul className="article-list">
          {section.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
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
                    <td key={j}>{renderInline(cell)}</td>
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
          <p>{renderInline(section.text)}</p>
        </div>
      );
    case 'callout':
      return (
        <div className="article-callout">
          <p>{renderInline(section.text)}</p>
        </div>
      );
    // Repeatable mid-article CTA — distinct from the single CTA block
    // ArticlePage.jsx renders at the bottom, so an article can place 2-3 of
    // these through its body (a data-driven `sections` entry, not a
    // one-off component) to route to the funnel without waiting for a
    // reader to scroll all the way down.
    case 'cta':
      return (
        <div className="article-cta-inline">
          {section.text && <p>{renderInline(section.text)}</p>}
          <a className="btn btn-primary article-cta-inline-btn" href={section.href}>
            {section.label}
          </a>
        </div>
      );
    default:
      return null;
  }
}
