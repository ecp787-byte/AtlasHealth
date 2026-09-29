import AtlasMark from './AtlasMark.jsx';
import ComplianceFooter from './ComplianceFooter.jsx';

// Generic renderer for the legal/compliance pages (Privacy, Terms) - see
// src/data/legalContent.js for the actual copy. Keeping
// this component free of any page-specific text means legal can revise the
// content data file without touching layout/markup.
export default function LegalPage({ content }) {
  return (
    <div className="legal-page">
      <div className="wrap narrow">
        <a className="legal-back" href="/">
          ← Back to Atlas Health
        </a>

        <div className="landing-brand legal-brand">
          <AtlasMark />
          <span>
            <span className="brand-word">ATLAS HEALTH</span>
            <span className="brand-sub">A VERITAS COMPANY</span>
          </span>
        </div>

        <h1 className="legal-title">{content.title}</h1>
        <p className="legal-effective">Effective date: {content.effectiveDate}</p>

        {content.intro && <p className="legal-intro">{content.intro}</p>}

        {content.sections.map((section) => (
          <section className="legal-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {Array.isArray(section.body) ? (
              section.body.map((para, i) => <p key={i}>{para}</p>)
            ) : (
              <p>{section.body}</p>
            )}
          </section>
        ))}
      </div>

      <ComplianceFooter />
    </div>
  );
}
