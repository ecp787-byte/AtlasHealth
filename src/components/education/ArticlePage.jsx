import { useEffect } from 'react';
import ArticleSection from './ArticleSection.jsx';
import ComplianceFooter from '../ComplianceFooter.jsx';
import { ARTICLES_BY_SLUG, getCategory } from '../../data/education/index.js';

// Sets document.title + the meta description tag, and injects FAQPage
// JSON-LD structured data - the SEO wins available to a client-rendered
// page without adding server-side rendering. Removes what it added on
// unmount so navigating between articles (or back to /learn) doesn't leave
// stale tags behind.
function useArticleSeo(article) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = article.seo.title;

    let meta = document.querySelector('meta[name="description"]');
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const prevContent = meta.getAttribute('content');
    meta.setAttribute('content', article.seo.metaDescription);

    let ld = null;
    if (article.faq?.length) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      });
      document.head.appendChild(ld);
    }

    return () => {
      document.title = prevTitle;
      if (createdMeta) meta.remove();
      else if (prevContent !== null) meta.setAttribute('content', prevContent);
      if (ld) ld.remove();
    };
  }, [article]);
}

export default function ArticlePage({ article }) {
  useArticleSeo(article);
  const category = getCategory(article.category);
  // Cap "Related reading" at 3 cards even when an article's internalLinks
  // data has more - a long wall of cross-links at the bottom of every post
  // reads as clutter rather than a curated recommendation. The full list
  // stays in the data file in case it's useful elsewhere later.
  const related = article.internalLinks
    .map((link) => ARTICLES_BY_SLUG[link.slug])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="learn-page">
      <div className="wrap narrow">
        <nav className="article-breadcrumb" aria-label="Breadcrumb">
          <a href="/learn">Learn</a>
          <span aria-hidden="true">/</span>
          {category && <span>{category.label}</span>}
        </nav>

        <div className={`article-eyebrow-row${category ? ` cat-tint-${category.accent}` : ''}`}>
          {category?.icon && (
            <span className="cat-badge cat-badge-sm" aria-hidden="true">
              <svg className="icon">
                <use href={`#${category.icon}`} />
              </svg>
            </span>
          )}
          <p className="article-eyebrow">{category?.label}</p>
        </div>
        <h1 className="article-title">{article.h1}</h1>
        <p className="article-dek">{article.dek}</p>

        <div className="article-meta">
          {article.readTime && <span>{article.readTime}</span>}
          {article.updated && <span>Updated {article.updated}</span>}
        </div>

        <div className="article-image-placeholder" role="img" aria-label={article.image?.alt}>
          <span className="article-image-caption">{article.image?.suggestion}</span>
        </div>

        <div className="article-body">
          {article.sections.map((section, i) => (
            <ArticleSection section={section} key={i} />
          ))}
        </div>

        {article.faq?.length > 0 && (
          <section className="article-faq">
            <h2 className="article-h2">Frequently asked questions</h2>
            {article.faq.map((f, i) => (
              <details className="article-faq-item" key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}

        {article.sources?.length > 0 && (
          <section className="article-sources">
            <h2 className="article-h2">Sources</h2>
            <ul className="article-list">
              {article.sources.map((s, i) => (
                <li key={i}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  ) : (
                    s.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="article-cta">
          <p>Ready to see what this looks like for your own coverage?</p>
          <a className="btn btn-primary article-cta-btn" href={article.cta.href}>
            {article.cta.label}
          </a>
        </div>

        {related.length > 0 && (
          <section className="article-related">
            <h2 className="article-h2">Related reading</h2>
            <div className="article-related-grid">
              {related.map((r) => {
                const rCategory = getCategory(r.category);
                return (
                  <a
                    className={`article-related-card${rCategory ? ` cat-tint-${rCategory.accent}` : ''}`}
                    href={`/learn/${r.slug}`}
                    key={r.slug}
                  >
                    <span className="article-related-eyebrow">{rCategory?.label}</span>
                    <span className="article-related-title">{r.h1}</span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <a className="legal-back article-back-link" href="/learn">
          ← Back to the Education Center
        </a>
      </div>

      <ComplianceFooter />
    </div>
  );
}
