import { useEffect, useMemo, useState } from 'react';
import ArticleSection from './ArticleSection.jsx';
import BeforeAfterChart from './BeforeAfterChart.jsx';
import FlowSteps from './FlowSteps.jsx';
import CompareTwo from './CompareTwo.jsx';
import CompareGrid from './CompareGrid.jsx';
import CostMeter from './CostMeter.jsx';
import PlanCostBarChart from './PlanCostBarChart.jsx';
import IconCluster from './IconCluster.jsx';
import AnnotatedDoc from './AnnotatedDoc.jsx';
import ComplianceFooter from '../ComplianceFooter.jsx';
import { ARTICLES_BY_SLUG, getCategory } from '../../data/education/index.js';

// A registry rather than importing each component directly into every
// article data file - keeps the data files as plain data (just a `type`
// string + props) instead of mixing JSX component references into them.
const DIAGRAM_COMPONENTS = {
  FlowSteps,
  CompareTwo,
  CompareGrid,
  CostMeter,
  PlanCostBarChart,
  IconCluster,
  AnnotatedDoc,
};

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Stamps a unique #id onto every h2 section (de-duped in the rare case two
// headings produce the same slug) and hands back the matching jump-link
// list for the "In this article" sidebar nav - built from the article's own
// section data rather than a hand-maintained list, so it can never drift
// out of sync with the actual headings on the page.
function useTableOfContents(article) {
  return useMemo(() => {
    const seen = new Map();
    const toc = [];
    const sections = article.sections.map((section) => {
      if (section.type !== 'h2') return section;
      let id = slugify(section.text);
      const count = seen.get(id) || 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      toc.push({ id, text: section.text });
      return { ...section, id };
    });
    if (article.faq?.length) toc.push({ id: 'faqs', text: 'FAQs' });
    return { sections, toc };
  }, [article]);
}

// Highlights whichever heading is currently nearest the top of the
// viewport as the reader scrolls, the way Thatch's article sidebar does -
// a plain jump-link list works, but the active-state cue is what makes it
// read as "your place in the article" instead of just a table of contents.
function useActiveTocId(tocIds) {
  const [activeId, setActiveId] = useState(tocIds[0] || null);

  useEffect(() => {
    if (!tocIds.length) return undefined;
    const elements = tocIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tocIds]);

  return activeId;
}

export default function ArticlePage({ article }) {
  useArticleSeo(article);
  const category = getCategory(article.category);
  const { sections, toc } = useTableOfContents(article);
  const tocIds = useMemo(() => toc.map((t) => t.id), [toc]);
  const activeId = useActiveTocId(tocIds);

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
      <div className="wrap article-layout">
        <aside className="article-sidebar">
          {toc.length > 0 && (
            <nav className="article-toc" aria-label="Table of contents">
              <p className="article-toc-title">In this article</p>
              <ul>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className={activeId === item.id ? 'is-active' : ''}>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="article-sidebar-cta">
            <p>See what coverage actually costs for you.</p>
            <a className="btn btn-primary" href={article.cta.href}>
              {article.cta.label}
            </a>
          </div>
        </aside>

        <div className="article-main">
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

          {article.image?.photo ? (
            <img
              className="article-photo"
              src={article.image.photo}
              alt={article.image.alt || ''}
              style={article.image.photoPosition ? { objectPosition: article.image.photoPosition } : undefined}
            />
          ) : article.image?.chart ? (
            <BeforeAfterChart {...article.image.chart} />
          ) : article.image?.diagram ? (
            (() => {
              const Diagram = DIAGRAM_COMPONENTS[article.image.diagram.type];
              return Diagram ? <Diagram {...article.image.diagram.props} /> : null;
            })()
          ) : (
            <div
              className={`article-image-placeholder${category ? ` cat-tint-${category.accent}` : ''}`}
              role="img"
              aria-label={article.image?.alt || ''}
            >
              {category?.icon && (
                <svg className="icon article-image-placeholder-icon" aria-hidden="true">
                  <use href={`#${category.icon}`} />
                </svg>
              )}
            </div>
          )}

          <div className="article-body">
            {sections.map((section, i) => (
              <ArticleSection section={section} key={i} />
            ))}
          </div>

          {article.faq?.length > 0 && (
            <section className="article-faq" id="faqs">
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
      </div>

      <ComplianceFooter />
    </div>
  );
}
