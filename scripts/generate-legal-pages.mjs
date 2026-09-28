// Post-build step: writes real, static HTML for /privacy and /terms.
//
// Why this exists: this site is a client-rendered SPA with no server-side
// rendering - App.jsx picks what to show based on window.location.pathname,
// entirely inside React, after the JS bundle loads. That's fine for a real
// browser, but a plain HTTP fetch (no JS execution) gets back nothing but
// an empty <div id="root"></div> and a <script> tag - no policy text at
// all. Twilio's A2P 10DLC campaign review (and likely other ad platforms'
// automated compliance checks) fetch the Privacy Policy URL exactly that
// way, so the review comes back "a compliant privacy policy can not be
// verified" (error 30908) even though the real page reads fine in a
// browser. Confirmed by fetching the live /privacy route directly and
// checking the raw response body - see ARCHITECTURE.md.
//
// The fix: server-render the exact same LegalPage component (same data
// source, so this can never drift out of sync with the in-app version) to
// a static HTML string at build time, and write it to dist/privacy/index.html
// and dist/terms/index.html.
//
// IMPORTANT - this only works together with a serving-config change: the
// old start command (`npx serve -s dist`) used `serve`'s `-s`/`--single`
// flag, which installs an implicit catch-all rewrite that matches every
// extensionless path (including /privacy and /terms) straight to
// index.html, BEFORE serve ever checks whether a real matching file exists
// on disk - so these generated pages were being silently shadowed by the
// SPA shell even though they existed. The fix was to drop `-s` and use a
// `public/serve.json` (copied into dist/ by Vite) with `rewrites` scoped
// only to the paths that actually need SPA fallback (/otp-landing/**,
// /learn/**). With no rewrite claiming /privacy or /terms, `serve` falls
// through to its normal static/directory lookup and finds these real
// files. See ARCHITECTURE.md and public/serve.json.
//
// A direct request to /privacy or /terms now gets real, crawlable text -
// no JavaScript required. This app has no client-side router (every link,
// including the footer's Privacy/Terms links, is a plain <a href> that
// triggers a full page load), so real visitors land on these same static
// files too - not just bots.
import { build } from 'vite';
import { readFile, writeFile, copyFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const ssrOutDir = path.join(root, '.ssr-tmp');
const distDir = path.join(root, 'dist');

async function buildSsrBundle() {
  await build({
    root,
    build: {
      ssr: path.join(root, 'prerender/render-legal.jsx'),
      outDir: '.ssr-tmp',
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        output: { entryFileNames: 'render-legal.mjs' },
      },
    },
    logLevel: 'warn',
  });
}

// Pull the exact hashed asset URLs the client build just produced, so the
// static pages load the identical CSS (and fonts) as the rest of the site
// instead of guessing a filename.
async function readHeadAssets() {
  const indexHtml = await readFile(path.join(distDir, 'index.html'), 'utf-8');
  const cssMatch = indexHtml.match(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/);
  if (!cssMatch) throw new Error('Could not find built CSS link in dist/index.html - did `vite build` run first?');
  return { cssHref: cssMatch[1] };
}

function pageShell({ title, description, cssHref, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0b0b0b" />
    <meta name="description" content="${description}" />
    <title>${title} | Atlas Health</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" crossorigin href="${cssHref}" />
  </head>
  <body>
    <div id="legal-static">${bodyHtml}</div>
  </body>
</html>
`;
}

async function main() {
  if (!existsSync(distDir)) {
    throw new Error('dist/ not found - run `vite build` before this script.');
  }

  await buildSsrBundle();
  const { cssHref } = await readHeadAssets();

  const mod = await import(path.join(ssrOutDir, 'render-legal.mjs'));
  const pages = [
    {
      slug: 'privacy',
      title: mod.PRIVACY_POLICY.title,
      description: 'Atlas Health’s privacy policy: what information we collect, how we use it, and your choices.',
      bodyHtml: mod.renderPrivacyPolicy(),
    },
    {
      slug: 'terms',
      title: mod.TERMS_CONDITIONS.title,
      description: 'Atlas Health’s terms and conditions of use.',
      bodyHtml: mod.renderTermsConditions(),
    },
  ];

  for (const page of pages) {
    const outDir = path.join(distDir, page.slug);
    await mkdir(outDir, { recursive: true });
    const html = pageShell({ title: page.title, description: page.description, cssHref, bodyHtml: page.bodyHtml });
    await writeFile(path.join(outDir, 'index.html'), html, 'utf-8');
    console.log(`[generate-legal-pages] wrote dist/${page.slug}/index.html (${html.length} bytes, real static text)`);
  }

  // Without `-s`, `serve` no longer has a catch-all rewrite for every
  // extensionless path, so a genuinely unknown path (a stray old link, a
  // typo) now gets a real 404 instead of silently loading the SPA. That's
  // more correct, but this app's only "unknown route" handling lives
  // client-side (App.jsx redirects to `/` once the JS bundle runs), so it
  // needs the SPA shell to load first. `serve` serves `404.html` off disk
  // for any unmatched path (with a real 404 status), so writing a copy of
  // the SPA shell there preserves that graceful redirect for stray links
  // without adding a catch-all rewrite that would shadow /privacy or
  // /terms again.
  await copyFile(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
  console.log('[generate-legal-pages] wrote dist/404.html (SPA shell, for graceful redirects on unknown paths)');

  await rm(ssrOutDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error('[generate-legal-pages] failed:', err);
  process.exit(1);
});
