import { useEffect, useState } from 'react';
import IconSprite from './components/IconSprite.jsx';
import LandingHero from './components/LandingHero.jsx';
import ComplianceFooter from './components/ComplianceFooter.jsx';
import LegalPage from './components/LegalPage.jsx';
import Homepage from './components/Homepage.jsx';
import LearnLanding from './components/education/LearnLanding.jsx';
import ArticlePage from './components/education/ArticlePage.jsx';
import QuizEngine from './components/quiz/QuizEngine.jsx';
import ResultsPage from './components/ResultsPage.jsx';
import { loadProgress } from './lib/progress.js';
import { trackPageView, getAttribution } from './lib/tracking.js';
import { PRIVACY_POLICY, TERMS_CONDITIONS } from './data/legalContent.js';
import { ARTICLES_BY_SLUG } from './data/education/index.js';

// Plain path -> content lookup for the three standalone legal pages. No
// router library - a lookup on window.location.pathname is simpler than a
// dependency for a site this size. public/_redirects makes any of these
// paths work on Render's static hosting (serves index.html for any path,
// letting this run client-side) and is also what a real custom domain
// (compasscares.co) needs for the same reason.
const LEGAL_PAGES = {
  '/privacy': PRIVACY_POLICY,
  '/terms': TERMS_CONDITIONS,
};

// The ad-traffic funnel lives at its own path, separate from the real
// homepage at "/" - paid campaigns can link straight to the lean,
// single-purpose funnel while organic/direct visitors land on a fuller
// marketing site with nav and the Education Center.
const FUNNEL_PATH = '/otp-landing';
const LEARN_PREFIX = '/learn';

// Internal CTAs (homepage, Education Center, the Coverage Path widget) link
// here with ?start=1 - the visitor already got the pitch and the "Check My
// Options" framing on the page they came from, so re-showing the ad-landing
// intro (LandingHero) would just be a second copy of the same page asking
// them to click "Check My Options" again. Cold paid-ad traffic still lands
// on plain /otp-landing (no query param) and sees LandingHero first, since
// that page carries the required ad-landing disclaimers/trust copy for
// visitors with no other site context.
function shouldSkipLandingIntro() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('start') === '1';
}

function FunnelApp() {
  // If there's saved in-progress quiz state (e.g. the person switched to
  // their messages app to read an OTP code and came back), resume straight
  // into the quiz instead of dropping them back on the landing page.
  const [stage, setStage] = useState(() => {
    if (loadProgress()) return 'quiz';
    return shouldSkipLandingIntro() ? 'quiz' : 'landing';
  });
  const [finalAnswers, setFinalAnswers] = useState(null);

  return (
    <>
      {stage === 'landing' && (
        <>
          <LandingHero onStart={() => setStage('quiz')} />
          <ComplianceFooter />
        </>
      )}

      {stage === 'quiz' && (
        <QuizEngine
          onComplete={(answers) => {
            setFinalAnswers(answers);
            setStage('results');
          }}
        />
      )}

      {stage === 'results' && finalAnswers && (
        <>
          <ResultsPage answers={finalAnswers} attribution={getAttribution()} />
          <ComplianceFooter />
        </>
      )}
    </>
  );
}

export default function App() {
  const path = window.location.pathname;
  const legalContent = LEGAL_PAGES[path];
  const isFunnelPath = path === FUNNEL_PATH;
  const isHome = path === '/';
  const isLearnIndex = path === LEARN_PREFIX || path === `${LEARN_PREFIX}/`;
  const learnSlug = path.startsWith(`${LEARN_PREFIX}/`) ? path.slice(LEARN_PREFIX.length + 1) : null;
  const article = learnSlug ? ARTICLES_BY_SLUG[learnSlug] : null;
  const isKnownPath = legalContent || isFunnelPath || isHome || isLearnIndex || article;

  useEffect(() => {
    trackPageView();
  }, []);

  // Anything unrecognized (including an unknown /learn/<slug>) redirects to
  // the homepage rather than erroring. Doing this as an effect keeps it a
  // well-behaved side effect; the null return below avoids flashing the
  // wrong content first.
  useEffect(() => {
    if (!isKnownPath) {
      window.location.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (legalContent) {
    return (
      <>
        <IconSprite />
        <LegalPage content={legalContent} />
      </>
    );
  }

  if (isLearnIndex) {
    return (
      <>
        <IconSprite />
        <LearnLanding />
      </>
    );
  }

  if (article) {
    return (
      <>
        <IconSprite />
        <ArticlePage article={article} />
      </>
    );
  }

  if (isFunnelPath) {
    return (
      <>
        <IconSprite />
        <FunnelApp />
      </>
    );
  }

  if (isHome) {
    return (
      <>
        <IconSprite />
        <Homepage />
      </>
    );
  }

  return null;
}
