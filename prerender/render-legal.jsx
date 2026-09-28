import ReactDOMServer from 'react-dom/server';
import LegalPage from '../src/components/LegalPage.jsx';
import { PRIVACY_POLICY, TERMS_CONDITIONS } from '../src/data/legalContent.js';

// Server-rendered markup for the two standalone legal pages, used only by
// scripts/generate-legal-pages.mjs (a build step, not something that ships
// to the browser). The SPA renders these same components client-side too -
// this just produces a byte-identical static copy so a direct HTTP fetch
// (a compliance reviewer's bot, an ad platform's crawler, curl) gets real
// policy text without needing to execute JavaScript first. See that
// script's own comment for the full story.
export function renderPrivacyPolicy() {
  return ReactDOMServer.renderToStaticMarkup(<LegalPage content={PRIVACY_POLICY} />);
}

export function renderTermsConditions() {
  return ReactDOMServer.renderToStaticMarkup(<LegalPage content={TERMS_CONDITIONS} />);
}

export { PRIVACY_POLICY, TERMS_CONDITIONS };
