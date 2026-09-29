import { useEffect, useMemo, useState } from 'react';
import AtlasMark from '../AtlasMark.jsx';
import ComplianceFooter from '../ComplianceFooter.jsx';
import {
  ARTICLES,
  ARTICLES_BY_SLUG,
  CATEGORIES,
  FEATURED_SLUG,
  POPULAR_SLUGS,
  LATEST_SLUGS,
  getCategory,
} from '../../data/education/index.js';

function ArticleCard({ article }) {
  const category = getCategory(article.category);
  return (
    <a
      className={`learn-card${category ? ` cat-tint-${category.accent}` : ''}`}
      href={`/learn/${article.slug}`}
    >
      <span className="learn-card-top">
        {category?.icon && (
          <span className="cat-badge cat-badge-sm" aria-hidden="true">
            <svg className="icon">
              <use href={`#${category.icon}`} />
            </svg>
          </span>
        )}
        <span className="learn-card-eyebrow">{category?.label}</span>
      </span>
      <span className="learn-card-title">{article.h1}</span>
      <span className="learn-card-dek">{article.dek}</span>
      {article.readTime && <span className="learn-card-meta">{article.readTime}</span>}
    </a>
  );
}

export default function LearnLanding() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Health Insurance, Made Clear. | Atlas Health Learn';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const isFiltering = query.trim().length > 0 || activeCategory;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      if (activeCategory && a.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [a.h1, a.dek, a.seo.primaryKeyword, ...(a.seo.secondaryKeywords || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, activeCategory]);

  const featured = ARTICLES_BY_SLUG[FEATURED_SLUG];
  const popular = POPULAR_SLUGS.map((s) => ARTICLES_BY_SLUG[s]).filter(Boolean);
  const latest = LATEST_SLUGS.slice(0, 4)
    .map((s) => ARTICLES_BY_SLUG[s])
    .filter((a) => a.slug !== FEATURED_SLUG);

  return (
    <div className="learn-page">
      <div className="wrap">
        <div className="landing-brand legal-brand">
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <AtlasMark />
            <span>
              <span className="brand-word">ATLAS HEALTH</span>
              <span className="brand-sub">A VERITAS COMPANY</span>
            </span>
          </a>
        </div>

        <div className="learn-hero">
          <h1 className="learn-h1">
            Health Insurance, <span className="text-gradient">Made Clear.</span>
          </h1>
          <p className="learn-hero-copy">
            Health coverage comes with a language of its own. Atlas Health helps you understand
            your options, your benefits, and how your coverage actually works.
          </p>
          <input
            type="search"
            className="learn-search"
            placeholder="Search the Education Center — e.g. “deductible” or “hsa”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search articles"
          />
        </div>

        <nav className="learn-categories" aria-label="Browse by category">
          <button
            type="button"
            className={`learn-category-pill${!activeCategory ? ' is-active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All Topics
          </button>
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.key}
              className={`learn-category-pill${activeCategory === c.key ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === c.key ? null : c.key)}
            >
              {c.label}
            </button>
          ))}
        </nav>

        {isFiltering ? (
          <section className="learn-section">
            <h2 className="learn-section-title">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              {activeCategory ? ` in ${getCategory(activeCategory)?.label}` : ''}
              {query.trim() ? ` for “${query.trim()}”` : ''}
            </h2>
            {filtered.length > 0 ? (
              <div className="learn-grid">
                {filtered.map((a) => (
                  <ArticleCard article={a} key={a.slug} />
                ))}
              </div>
            ) : (
              <p className="article-p">
                Nothing matched that search. Try a different term, or browse all topics below.
              </p>
            )}
          </section>
        ) : (
          <>
            {featured && (() => {
              const featuredCategory = getCategory(featured.category);
              return (
                <section className="learn-section">
                  <h2 className="learn-section-title">Featured</h2>
                  <a
                    className={`learn-featured-card${featuredCategory ? ` cat-tint-${featuredCategory.accent}` : ''}`}
                    href={`/learn/${featured.slug}`}
                  >
                    <span className="learn-card-top">
                      {featuredCategory?.icon && (
                        <span className="cat-badge cat-badge-sm" aria-hidden="true">
                          <svg className="icon">
                            <use href={`#${featuredCategory.icon}`} />
                          </svg>
                        </span>
                      )}
                      <span className="learn-card-eyebrow">{featuredCategory?.label}</span>
                    </span>
                    <span className="learn-featured-title">{featured.h1}</span>
                    <span className="learn-card-dek">{featured.dek}</span>
                  </a>
                </section>
              );
            })()}

            {popular.length > 0 && (
              <section className="learn-section">
                <h2 className="learn-section-title">Most popular guides</h2>
                <div className="learn-grid">
                  {popular.map((a) => (
                    <ArticleCard article={a} key={a.slug} />
                  ))}
                </div>
              </section>
            )}

            {latest.length > 0 && (
              <section className="learn-section">
                <h2 className="learn-section-title">Latest updates</h2>
                <div className="learn-grid">
                  {latest.map((a) => (
                    <ArticleCard article={a} key={a.slug} />
                  ))}
                </div>
              </section>
            )}

            <section className="learn-section">
              <h2 className="learn-section-title">Browse every topic</h2>
              {CATEGORIES.map((c) => {
                const articlesInCategory = ARTICLES.filter((a) => a.category === c.key);
                if (!articlesInCategory.length) return null;
                return (
                  <div className={`learn-category-block cat-tint-${c.accent}`} key={c.key}>
                    <div className="learn-category-top">
                      {c.icon && (
                        <span className="cat-badge" aria-hidden="true">
                          <svg className="icon">
                            <use href={`#${c.icon}`} />
                          </svg>
                        </span>
                      )}
                      <h3 className="learn-category-heading">{c.label}</h3>
                    </div>
                    <p className="learn-category-desc">{c.description}</p>
                    <div className="learn-grid">
                      {articlesInCategory.map((a) => (
                        <ArticleCard article={a} key={a.slug} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          </>
        )}

        <section className="learn-cta">
          <h2 className="learn-section-title">Ready to see your options?</h2>
          <p className="article-p">
            Once you understand how your coverage works, comparing plans is a lot less
            overwhelming.
          </p>
          <a className="btn btn-primary article-cta-btn" href="/otp-landing?start=1">
            Find Your Coverage
          </a>
        </section>
      </div>

      <ComplianceFooter />
    </div>
  );
}
