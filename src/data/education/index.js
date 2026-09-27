// Aggregates the 15 Education Center articles (each its own file under
// ./articles/ so they're easy for a non-engineer/CMS-style workflow to
// find and edit individually) into the lookups the site actually needs.
import howHealthInsuranceWorks from './articles/how-health-insurance-works.js';
import marketplaceVsPrivateVsEmployer from './articles/marketplace-vs-private-vs-employer-insurance.js';
import ppoVsHmoVsEpo from './articles/ppo-vs-hmo-vs-epo.js';
import whatIsAnHsa from './articles/what-is-an-hsa.js';
import termsGlossary from './articles/health-insurance-terms-glossary.js';
import copayVsCoinsurance from './articles/copay-vs-coinsurance.js';
import whatIsADeductible from './articles/what-is-a-health-insurance-deductible.js';
import whatIsMaxOop from './articles/what-is-maximum-out-of-pocket.js';
import inNetworkVsOutOfNetwork from './articles/in-network-vs-out-of-network.js';
import whatIsFirstDollarCoverage from './articles/what-is-first-dollar-coverage.js';
import marketplace2026Changes from './articles/marketplace-health-insurance-2026-changes.js';
import howClaimsWork from './articles/how-health-insurance-claims-work.js';
import whatIsAnEob from './articles/what-is-an-eob.js';
import howToChooseAPlan from './articles/how-to-choose-a-health-insurance-plan.js';
import tenQuestions from './articles/10-questions-before-buying-health-insurance.js';

export const ARTICLES = [
  howHealthInsuranceWorks,
  marketplaceVsPrivateVsEmployer,
  ppoVsHmoVsEpo,
  whatIsAnHsa,
  termsGlossary,
  copayVsCoinsurance,
  whatIsADeductible,
  whatIsMaxOop,
  inNetworkVsOutOfNetwork,
  whatIsFirstDollarCoverage,
  marketplace2026Changes,
  howClaimsWork,
  whatIsAnEob,
  howToChooseAPlan,
  tenQuestions,
];

export const ARTICLES_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));

// `accent` maps to a .cat-tint-* class in global.css (a gradient, a text
// color, and a soft wash, all built from the existing brand tokens) and
// `icon` to a symbol id in IconSprite.jsx. Together they give each topic a
// consistent color + icon everywhere it appears (card eyebrows, category
// badges, article breadcrumbs) instead of one flat teal repeated site-wide.
export const CATEGORIES = [
  {
    key: 'basics',
    label: 'Health Insurance Basics',
    description: 'Start here to understand how coverage actually works.',
    accent: 'teal',
    icon: 'i-shield',
  },
  {
    key: 'choosing',
    label: 'Choosing Coverage',
    description: 'How to evaluate and compare plans before you enroll.',
    accent: 'icy',
    icon: 'i-checkbig',
  },
  {
    key: 'networks',
    label: 'Networks & Plan Types',
    description: 'PPO, HMO, EPO, HSAs, and how provider networks work.',
    accent: 'navy',
    icon: 'i-group',
  },
  {
    key: 'benefits',
    label: 'Understanding Your Benefits',
    description: 'Deductibles, copays, coinsurance, and the terms on your plan.',
    accent: 'ice',
    icon: 'i-doc',
  },
  {
    key: 'marketplace',
    label: 'Marketplace Updates',
    description: 'What changed for 2026 and what to check before you enroll.',
    accent: 'deep',
    icon: 'i-briefcase',
  },
  {
    key: 'using',
    label: 'Using Your Coverage',
    description: 'Claims, EOBs, and making sense of coverage after enrollment.',
    accent: 'duo',
    icon: 'i-health',
  },
];

export function getArticlesByCategory(key) {
  return ARTICLES.filter((a) => a.category === key);
}

export function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key);
}

// Curated, not derived - these are editorial picks, the kind a real content
// team would set deliberately rather than compute from a metric we don't
// have (pageviews, recency alone, etc).
export const FEATURED_SLUG = 'marketplace-health-insurance-2026-changes';
export const POPULAR_SLUGS = [
  'health-insurance-terms-glossary',
  'how-health-insurance-works',
  'how-to-choose-a-health-insurance-plan',
  'what-is-maximum-out-of-pocket',
];

export const LATEST_SLUGS = ARTICLES.filter((a) => a.updated)
  .sort((a, b) => (a.updated < b.updated ? 1 : -1))
  .map((a) => a.slug);
