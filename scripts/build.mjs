// Builds the static site into dist/.
// Usage: node scripts/build.mjs            (production, clean URLs: /ajax/)
//        PREVIEW=1 node scripts/build.mjs  (links to .../index.html, to open dist/ without a server)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, REPORT_EMAIL, VERIFIED_AT, RIVALRIES, FANBASES } from './config.mjs';
import { reference, fmtDate, compName } from '../src/assets/core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PREVIEW = process.env.PREVIEW === '1';

const TEAMS = JSON.parse(readFileSync(join(ROOT, 'data/teams.json'), 'utf8'));
const COMPS = JSON.parse(readFileSync(join(ROOT, 'data/competitions.json'), 'utf8'));
delete COMPS._comment;
const byId = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Version of a team's preview image: changes when a new trophy comes in, so WhatsApp refetches it.
const latest = (t) => t.wins.reduce((m, w) => (w.d > m ? w.d : m), t.founded.length === 4 ? `${t.founded}-01-01` : t.founded);

function page({ depth, kind, id = '', title, desc, path, ogImage, body, extraData = '', ogVersion = VERIFIED_AT }) {
  const pre = depth === 0 ? './' : '../'.repeat(depth);
  const url = `${SITE_URL}/${path}`;
  const img = `${SITE_URL}/og/${ogImage}.png?v=${ogVersion.replace(/-/g, '')}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="NoTrophy">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<meta name="theme-color" content="#12161C">
<link rel="icon" href="${pre}assets/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800&family=Big+Shoulders+Display:wght@700;800;900&display=swap">
<link rel="stylesheet" href="${pre}assets/style.css">
</head>
<body data-page="${kind}" data-id="${esc(id)}" data-root="${pre}" data-preview="${PREVIEW ? 1 : 0}"${extraData}>
<header class="topbar"><div class="wrap topbar-in">
  <a class="logo" href="${pre}${PREVIEW ? 'index.html' : ''}" aria-label="NoTrophy home"><span class="logo-no">No</span>Trophy</a>
  <nav class="topnav"><a href="${pre}vs/${PREVIEW ? 'index.html' : ''}">Compare</a></nav>
</div></header>
<main id="app" class="wrap">${body}</main>
<footer class="foot"><div class="wrap foot-in" id="foot"></div></footer>
<script type="module" src="${pre}assets/app.mjs"></script>
</body>
</html>
`;
}

function write(rel, html) {
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

rmSync(DIST, { recursive: true, force: true, maxRetries: 2 });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'src/assets'), join(DIST, 'assets'), { recursive: true });

// Client data, without the internal source status.
const clientTeams = TEAMS.map((t) => ({ ...t, wins: t.wins.map(({ v, ...w }) => w) }));
writeFileSync(join(DIST, 'assets/data.mjs'),
  `export const TEAMS = ${JSON.stringify(clientTeams)};\n` +
  `export const COMPS = ${JSON.stringify(COMPS)};\n` +
  `export const RIVALRIES = ${JSON.stringify(RIVALRIES)};\n` +
  `export const FANBASES = ${JSON.stringify(FANBASES)};\n` +
  `export const META = ${JSON.stringify({ siteUrl: SITE_URL, reportEmail: REPORT_EMAIL, verifiedAt: VERIFIED_AT })};\n`);

write('index.html', page({
  depth: 0, kind: 'home', path: '', ogImage: 'home',
  title: 'NoTrophy: how long has your rival gone without a trophy?',
  desc: `Live trophy-drought clocks for all ${TEAMS.length} clubs in the Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and Eredivisie. Find your rival and send it on.`,
  body: '<noscript><p>NoTrophy counts how long football clubs have gone without a trophy. Turn on JavaScript to see the clocks.</p></noscript>',
}));

for (const t of TEAMS) {
  const ref = reference(t, 'all', COMPS);
  let title, desc;
  if (ref.never) {
    title = `${t.name} have never won a trophy`;
    desc = `Founded in ${t.founded.slice(0, 4)}. Trophies since: none. Watch the clock and send it to a ${t.short || t.name} fan.`;
  } else {
    title = `${t.name}: no trophy since ${fmtDate(ref.win.d, ref.win.approx)}`;
    desc = `Last trophy: ${compName(COMPS, ref.win)}. Watch the clock tick and send it to a ${t.short || t.name} fan.`;
  }
  write(`${t.id}/index.html`, page({
    depth: 1, kind: 'team', id: t.id, path: t.id, ogImage: t.id, title, desc, ogVersion: latest(t),
    body: `<noscript><h1>${esc(title)}</h1><p>${esc(desc)}</p></noscript>`,
  }));
}

write('vs/index.html', page({
  depth: 1, kind: 'compare', path: 'vs/', ogImage: 'home',
  title: 'NoTrophy: who has waited longest for a trophy?',
  desc: 'Put two clubs side by side and see who has gone longest without a trophy.',
  body: '',
}));
for (const r of RIVALRIES) {
  const a = byId[r.a], b = byId[r.b];
  write(`${r.a}-vs-${r.b}/index.html`, page({
    depth: 1, kind: 'compare', path: `${r.a}-vs-${r.b}`, ogImage: `${r.a}-vs-${r.b}`,
    title: `${a.name} vs ${b.name}: who has waited longest for a trophy?`,
    desc: `${r.name}. Two live clocks, one winner of shame. Send it on.`,
    body: '', extraData: ` data-a="${r.a}" data-b="${r.b}"`, ogVersion: [latest(a), latest(b)].sort().pop(),
  }));
}

write('rules/index.html', page({
  depth: 1, kind: 'rules', path: 'rules/', ogImage: 'home',
  title: 'NoTrophy: what counts as a trophy?',
  desc: 'The NoTrophy rules: which trophies count and how we date them.',
  body: '',
}));

write('404.html', page({ depth: 0, kind: 'home', path: '', ogImage: 'home', title: 'NoTrophy', desc: 'Page not found.', body: '' }));

const urls = ['', 'vs/', 'rules/', ...TEAMS.map((t) => t.id), ...RIVALRIES.map((r) => `${r.a}-vs-${r.b}`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built: ${TEAMS.length} clubs, ${RIVALRIES.length} derbies → dist/${PREVIEW ? ' (preview links)' : ''}`);
