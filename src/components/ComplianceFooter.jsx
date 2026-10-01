import AtlasMark from './AtlasMark.jsx';
import { CONTACT_EMAIL } from '../data/legalContent.js';

// Shared footer for the informational pages (Homepage, Learn, legal pages) -
// a dark Obsidian band carrying the full brand lockup and the brand kit's
// "PEOPLE · PLANS · PROGRESS" tagline pattern, with the compliance copy
// underneath. The lean /otp-landing ad page intentionally skips this in
// favor of its own short .landing-footnote - see LandingHero.jsx.
export default function ComplianceFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap narrow site-footer-inner">
        <div className="site-footer-brand">
          <AtlasMark onDark className="brand-mark" />
          <span>
            <span className="brand-word">ATLAS HEALTH</span>
            <span className="brand-sub">A VERITAS COMPANY</span>
          </span>
        </div>
        <p className="site-footer-tagline">PEOPLE &middot; PLANS &middot; PROGRESS &mdash; A BRIGHTER TOMORROW</p>

        <div className="compliance-footer">
          <p>
            Atlas Health, a Veritas company, is a lead-generation service that connects consumers
            with licensed insurance agents contracted with Veritas Insurance Solutions. Atlas
            Health does not sell insurance directly. Not affiliated with or endorsed by any
            government agency, including the federal Health Insurance Marketplace or Medicare. Plan
            availability and pricing vary by state and eligibility.
          </p>
          <nav className="compliance-links">
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact Us</a>
          </nav>
          <p className="copyright">© {new Date().getFullYear()} Atlas Health. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
