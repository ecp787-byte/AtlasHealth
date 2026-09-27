import { useEffect, useRef, useState } from 'react';
import AtlasMark from './AtlasMark.jsx';
import ComplianceFooter from './ComplianceFooter.jsx';
import CoveragePathStepper from './CoveragePathStepper.jsx';
import GoalsPathCard from './GoalsPathCard.jsx';
import { FadeUp, SectionReveal, StaggerContainer, StaggerItem, TextReveal } from '../motion/primitives.jsx';
import { ARTICLES_BY_SLUG, POPULAR_SLUGS, getCategory } from '../data/education/index.js';
import mountainHiker from '../assets/mountain-hiker.jpg';
import heroEmbrace from '../assets/hero-embrace-panel.jpg';
import floristShop from '../assets/florist-shop.jpg';
import businessMeeting from '../assets/business-meeting.jpg';
import heroHikerValley from '../assets/hero-hiker-valley.jpg';

// The real compasscares.co homepage - a "sophisticated national healthcare
// platform" front door, distinct from the lean, single-purpose funnel at
// /otp-landing built for paid ad traffic. This page's job is to orient an
// organic/direct visitor, point them at the Education Center, and offer the
// same "check your options" path without the funnel's ad-landing urgency.
//
// Redesigned onto a light Parchment surface throughout (no full-bleed dark
// Obsidian hero) per the approved mockup direction - the hero photo now
// lives in its own panel beside the copy rather than behind it, and two new
// sections ("Different paths" photo cards, "How Atlas Health works" steps)
// replace the old icon-grid and photo+list sections that covered similar
// ground with a heavier footprint.
const COVERAGE_LINKS = [
  {
    href: '#coverage-individual',
    label: 'Individuals & Families',
    body: 'Coverage for you and the people who matter most.',
  },
  {
    href: '#coverage-self-employed',
    label: 'Self-Employed',
    body: 'Health insurance built for your independence.',
  },
  {
    href: '#coverage-business',
    label: 'Business',
    body: 'Group plans to support your team and its growth.',
  },
];

// Small stroke-style glyphs, matching the icon language already used
// throughout the page (CoveragePathStepper's "who" tiles, the old coverage
// icon grid) rather than importing a new icon set for the hero trust row
// and the three "how it works" steps.
const ICON_PEOPLE = (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="8.5" cy="8" r="3" />
    <circle cx="16" cy="9.2" r="2.3" />
    <path d="M2.5 20c0-3.3 2.68-6 6-6s6 2.7 6 6" />
    <path d="M14.5 14.6c2.6.4 4.5 2.5 4.5 5.4" />
  </svg>
);
const ICON_SHIELD = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const ICON_GUIDE = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M12 3a9 9 0 100 18 9 9 0 000-18z" />
    <path d="M12 3a13 13 0 010 18M12 3a13 13 0 000 18M3 12h18" />
  </svg>
);
const ICON_DOC = (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);
const ICON_SEARCH = (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
const ICON_CHECK = (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

// "Different paths" photo cards - the same four coverage segments the old
// icon-grid ("Coverage for every stage of life") covered, now told with
// photography instead of icon badges, and reusing the same anchor ids so
// the header's Coverage dropdown still lands in the right place.
const DIFFERENT_PATHS = [
  {
    id: 'coverage-individual',
    title: 'Individual & Family',
    body: 'Coverage for you and the people who matter most.',
    href: '/otp-landing?start=1',
    kind: 'photo',
    image: heroEmbrace,
    imagePosition: '42% 40%',
  },
  {
    id: 'coverage-self-employed',
    title: 'Self-Employed',
    body: 'Flexible options for your independence.',
    href: '/otp-landing?start=1',
    kind: 'photo',
    image: floristShop,
    imagePosition: '50% 35%',
  },
  {
    id: 'coverage-business',
    title: 'Business',
    body: 'Health benefits to support your team and growth.',
    href: '/otp-landing?start=1',
    kind: 'photo',
    image: businessMeeting,
    imagePosition: '50% 30%',
  },
  {
    id: 'coverage-marketplace',
    title: 'Explore All Options',
    body: 'Marketplace, private plans, supplemental coverage and more.',
    href: '/learn/marketplace-vs-private-vs-employer-insurance',
    kind: 'photo',
    image: mountainHiker,
    imagePosition: '50% 30%',
  },
];

const HOW_STEPS = [
  { num: 1, title: 'Tell us what you need', body: 'Answer a few quick questions.', icon: ICON_DOC },
  { num: 2, title: 'Explore your options', body: 'Compare with expert guidance.', icon: ICON_SEARCH },
  { num: 3, title: 'Choose with confidence', body: 'Get the support you need.', icon: ICON_CHECK },
];

function useScrolledHeader(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let ticking = false;
    function update() {
      setScrolled(window.scrollY > threshold);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export default function Homepage() {
  useEffect(() => {
    const prevTitle = document.title;
    const prevDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
    document.title = 'Atlas Health, a Veritas Company | Modern Health Coverage Guidance';

    let metaTag = document.querySelector('meta[name="description"]');
    let createdMeta = false;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
      createdMeta = true;
    }
    metaTag.setAttribute(
      'content',
      'Atlas Health helps individuals, families, and businesses understand their healthcare options and find coverage that fits - plus a free Education Center covering deductibles, copays, HSAs, and the marketplace.'
    );

    return () => {
      document.title = prevTitle;
      if (createdMeta) {
        metaTag.remove();
      } else if (prevDescription !== null) {
        metaTag.setAttribute('content', prevDescription);
      }
    };
  }, []);

  // The hero is a full-bleed dark photo again, so the header floats
  // transparently over it (light mark, light text) until the visitor
  // scrolls past it, at which point it switches to an opaque light surface
  // with the dark mark - the same crossfade pattern used before the
  // light-hero redesign.
  const scrolled = useScrolledHeader();
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const coverageMenuRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!coverageOpen && !mobileMenuOpen) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setCoverageOpen(false);
        setMobileMenuOpen(false);
      }
    }
    function onClickOutside(e) {
      if (coverageOpen && coverageMenuRef.current && !coverageMenuRef.current.contains(e.target)) {
        setCoverageOpen(false);
      }
      if (mobileMenuOpen && headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [coverageOpen, mobileMenuOpen]);

  const featuredArticles = POPULAR_SLUGS.slice(0, 4)
    .map((s) => ARTICLES_BY_SLUG[s])
    .filter(Boolean);
  const [heroArticle, ...secondaryArticles] = featuredArticles;
  const heroCategory = heroArticle ? getCategory(heroArticle.category) : null;

  return (
    <div className="home-page">
      <header className={`home-header${scrolled ? ' is-scrolled' : ''}`} ref={headerRef}>
        <div className="wrap home-header-inner">
          <a href="/" className="home-brand">
            <AtlasMark onDark={!scrolled} />
            <span>
              <span className="brand-word">ATLAS HEALTH</span>
              <span className="brand-sub">A VERITAS COMPANY</span>
            </span>
          </a>
          <nav className="home-nav" aria-label="Primary">
            <div className="home-nav-dropdown" ref={coverageMenuRef}>
              <button
                type="button"
                className="home-nav-dropdown-trigger"
                aria-haspopup="true"
                aria-expanded={coverageOpen}
                onClick={() => setCoverageOpen((v) => !v)}
              >
                Coverage
                <svg className="home-nav-dropdown-caret" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {coverageOpen && (
                <div className="home-nav-dropdown-menu" role="menu">
                  {COVERAGE_LINKS.map((c) => (
                    <a role="menuitem" href={c.href} key={c.href} onClick={() => setCoverageOpen(false)}>
                      <span className="home-nav-dropdown-item-label">{c.label}</span>
                      <span className="home-nav-dropdown-item-body">{c.body}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="/learn">Learn</a>
            <a className="btn btn-primary home-nav-cta home-nav-pill" href="/otp-landing?start=1">
              Get Started
            </a>
          </nav>

          <button
            type="button"
            className="home-nav-burger"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-haspopup="true"
            aria-expanded={mobileMenuOpen}
            aria-controls="home-mobile-menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className={`home-nav-burger-bar${mobileMenuOpen ? ' is-open' : ''}`} />
            <span className={`home-nav-burger-bar${mobileMenuOpen ? ' is-open' : ''}`} />
            <span className={`home-nav-burger-bar${mobileMenuOpen ? ' is-open' : ''}`} />
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="home-mobile-menu" id="home-mobile-menu" aria-label="Mobile">
            <span className="home-mobile-menu-label">Coverage</span>
            {COVERAGE_LINKS.map((c) => (
              <a href={c.href} key={c.href} onClick={() => setMobileMenuOpen(false)}>
                {c.label}
              </a>
            ))}
            <a href="/learn" onClick={() => setMobileMenuOpen(false)}>
              Learn
            </a>
          </nav>
        )}
      </header>

      <section
        className="home-hero"
        style={{ '--home-hero-image': `url(${heroHikerValley})` }}
      >
        <div className="home-hero-bg" aria-hidden="true" />
        <div className="home-hero-scrim" aria-hidden="true" />

        <div className="wrap home-hero-row">
          <div className="home-hero-copy-col">
            <FadeUp mode="load" delay={0}>
              <span className="pill-badge">
                <span className="pill-badge-dot" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                More than insurance
              </span>
            </FadeUp>

            <TextReveal
              as="h1"
              className="home-hero-title"
              mode="load"
              delay={0.12}
              stagger={0.11}
              lines={[
                <span className="hero-line-emph">Coverage that</span>,
                <span className="hero-line-emph">moves with you.</span>,
              ]}
            />

            <FadeUp mode="load" delay={0.42}>
              <p className="home-hero-copy">
                Clear guidance. Real options. A healthier tomorrow.
              </p>
            </FadeUp>

            <FadeUp mode="load" delay={0.52}>
              <div className="home-hero-actions">
                <a className="btn btn-primary" href="/otp-landing?start=1">
                  Find My Coverage <span className="cta-arrow">→</span>
                </a>
                <a className="btn btn-ghost" href="/otp-landing?start=1">
                  Speak With an Expert
                </a>
              </div>
            </FadeUp>

            <FadeUp mode="load" delay={0.62}>
              <ul className="home-hero-trust-row">
                <li>
                  <span className="home-hero-trust-icon" aria-hidden="true">{ICON_PEOPLE}</span>
                  Licensed in all 50 states
                </li>
                <li>
                  <span className="home-hero-trust-icon" aria-hidden="true">{ICON_SHIELD}</span>
                  No obligation to enroll
                </li>
                <li>
                  <span className="home-hero-trust-icon" aria-hidden="true">{ICON_GUIDE}</span>
                  Real people, real guidance
                </li>
              </ul>
            </FadeUp>
          </div>
        </div>

        <FadeUp mode="load" delay={0.9} className="home-hero-vertical-tag" aria-hidden="true">
          <span>Further</span>
          <span>Together</span>
        </FadeUp>
      </section>

      {/* Two complementary "find your way in" widgets, not mockups of them -
          full logic, state, and CTA destination intact on both. They sit in
          their own section on the light surface below the hero rather than
          floating as cards over the hero photo, so neither ever has a
          chance to overlap anyone's face in the photo again. One asks who
          you are (CoveragePathStepper); the other asks what you're after
          (GoalsPathCard) - two different on-ramps into the same
          /otp-landing flow, side by side rather than picking one. */}
      <section className="home-stepper-section">
        <div className="wrap">
          <div className="home-stepper-grid">
            <FadeUp mode="load" delay={0.15}>
              <CoveragePathStepper />
            </FadeUp>
            <FadeUp mode="load" delay={0.22}>
              <GoalsPathCard />
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="home-paths">
        <div className="wrap">
          <SectionReveal className="home-paths-head">
            <div className="home-paths-head-text">
              <span className="section-label">Coverage options</span>
              <h2 className="home-paths-title">
                Different paths.
                <br />A clearer way forward.
              </h2>
            </div>
            <div className="home-paths-head-copy">
              <p>
                From individuals and families to self-employed professionals and growing
                businesses, we help you navigate your options with clarity and confidence.
              </p>
              <a href="#coverage-individual" className="home-paths-link">
                View all coverage options <span className="cta-arrow">→</span>
              </a>
            </div>
          </SectionReveal>

          <StaggerContainer className="home-paths-grid">
            {DIFFERENT_PATHS.map((p) => (
              <StaggerItem className="home-path-card" id={p.id} key={p.id}>
                {p.kind === 'photo' ? (
                  <div className="home-path-card-photo">
                    <img src={p.image} alt="" loading="lazy" style={{ objectPosition: p.imagePosition }} />
                  </div>
                ) : (
                  <div className={`home-path-card-photo home-path-card-tint cat-tint-${p.tint}`}>
                    <span className="home-path-card-tint-icon" aria-hidden="true">{p.icon}</span>
                  </div>
                )}
                <div className="home-path-card-body">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
                <a href={p.href} className="home-path-card-arrow" aria-label={`Learn more about ${p.title}`}>
                  <span className="cta-arrow">→</span>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="home-how">
        <div className="wrap">
          <SectionReveal className="home-how-head">
            <div className="home-how-head-text">
              <span className="section-label">A simpler process</span>
              <h2 className="home-how-title">How Atlas Health works.</h2>
            </div>
            <p className="home-how-head-copy">
              A more informed, more confident way to find the right coverage.
            </p>
          </SectionReveal>

          <StaggerContainer className="home-how-grid">
            {HOW_STEPS.map((s) => (
              <StaggerItem className="home-how-step" key={s.num}>
                <span className="home-how-step-icon" aria-hidden="true">{s.icon}</span>
                <h3>
                  {s.num}. {s.title}
                </h3>
                <p>{s.body}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="home-options-explainer">
        <div className="wrap">
          <SectionReveal className="home-options-head">
            <span className="section-label">Understanding your options</span>
            <h2 className="home-options-title">Coverage tends to come from one of three places.</h2>
          </SectionReveal>

          <StaggerContainer className="home-options-grid">
            <StaggerItem className="home-options-col">
              <span className="home-options-col-num">01</span>
              <h3>Marketplace</h3>
              <p>
                Plans sold through the federal or state Health Insurance Marketplace, open to
                individuals and families shopping for coverage on their own.
              </p>
            </StaggerItem>
            <StaggerItem className="home-options-col">
              <span className="home-options-col-num">02</span>
              <h3>Employer-sponsored</h3>
              <p>
                Coverage offered through a job, where the employer typically covers part of the
                monthly premium.
              </p>
            </StaggerItem>
            <StaggerItem className="home-options-col">
              <span className="home-options-col-num">03</span>
              <h3>Private plans</h3>
              <p>
                Coverage purchased directly from an insurance carrier, outside the Marketplace,
                for people who want more flexibility in timing or plan design.
              </p>
            </StaggerItem>
          </StaggerContainer>

          <FadeUp delay={0.1}>
            <a className="home-options-link" href="/learn/marketplace-vs-private-vs-employer-insurance">
              Compare all three in detail <span className="cta-arrow">→</span>
            </a>
          </FadeUp>
        </div>
      </section>

      {heroArticle && (
        <section className="home-learn-teaser">
          <div className="wrap">
            <SectionReveal>
              <div className="home-learn-teaser-header">
                <div>
                  <span className="section-label">Knowledge center</span>
                  <h2>From the Education Center</h2>
                </div>
                <a href="/learn">
                  See all guides <span className="cta-arrow">→</span>
                </a>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.08}>
              <div className="home-learn-teaser-layout">
                <a
                  className={`home-learn-featured${heroCategory ? ` cat-tint-${heroCategory.accent}` : ''}`}
                  href={`/learn/${heroArticle.slug}`}
                >
                  <span className="learn-card-top">
                    {heroCategory?.icon && (
                      <span className="cat-badge cat-badge-sm" aria-hidden="true">
                        <svg className="icon">
                          <use href={`#${heroCategory.icon}`} />
                        </svg>
                      </span>
                    )}
                    <span className="learn-card-eyebrow">{heroCategory?.label}</span>
                  </span>
                  <span className="home-learn-featured-title">{heroArticle.h1}</span>
                  <span className="home-learn-featured-dek">{heroArticle.dek}</span>
                </a>

                <div className="home-learn-secondary-list">
                  {secondaryArticles.map((a) => {
                    const category = getCategory(a.category);
                    return (
                      <a
                        className={`home-learn-secondary-row${category ? ` cat-tint-${category.accent}` : ''}`}
                        href={`/learn/${a.slug}`}
                        key={a.slug}
                      >
                        <span>
                          <span className="home-learn-secondary-row-eyebrow">{category?.label}</span>
                          <span className="home-learn-secondary-row-title">{a.h1}</span>
                        </span>
                        <span className="cta-arrow" aria-hidden="true">→</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      )}

      <section className="home-final-cta">
        <div className="wrap home-final-cta-inner">
          <SectionReveal className="home-final-cta-copy">
            <span className="section-label">Real guidance, real people</span>
            <h2>A healthier tomorrow is a conversation away.</h2>
            <p>
              Answer a few questions and see coverage paths that may fit your household, budget,
              and timing &mdash; no obligation to enroll.
            </p>
          </SectionReveal>
          <FadeUp delay={0.12} className="home-final-cta-actions">
            <a className="btn btn-primary" href="/otp-landing?start=1">
              Check My Options <span className="cta-arrow">→</span>
            </a>
            <p className="home-final-cta-note">Licensed in all 50 states &middot; Takes about 2 minutes</p>
          </FadeUp>
        </div>
      </section>

      <ComplianceFooter />
    </div>
  );
}
