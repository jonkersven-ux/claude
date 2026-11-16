// Bouwt de statische site naar dist/.
// Gebruik: node scripts/build.mjs            (productie, nette URL's: /ajax/)
//          PREVIEW=1 node scripts/build.mjs  (links naar .../index.html, voor lokaal openen of previews)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, REPORT_EMAIL, VERIFIED_AT, RIVALRIES } from './config.mjs';
import { reference, fmtDate, teamName, isNation } from '../src/assets/core.mjs';
import { NATION_EN } from '../src/assets/i18n.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PREVIEW = process.env.PREVIEW === '1';

const TEAMS = JSON.parse(readFileSync(join(ROOT, 'data/teams.json'), 'utf8'));
const COMPS = JSON.parse(readFileSync(join(ROOT, 'data/competitions.json'), 'utf8'));
delete COMPS._comment;
const byId = Object.fromEntries(TEAMS.map((t) => [t.id, t]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ogLang = (t) => (t.country === 'NL' || ['nederland', 'belgie'].includes(t.id) ? 'nl' : 'en');
const latest = (t) => t.wins.reduce((m, w) => (w.d > m ? w.d : m), t.founded.length === 4 ? `${t.founded}-01-01` : t.founded);
const hasOg = existsSync(join(DIST, 'og')) || process.env.OG === '1';

function page({ depth, kind, id = '', title, desc, path, ogImage, body, lang = 'nl', extraData = '', ogVersion = VERIFIED_AT }) {
  const pre = depth === 0 ? './' : '../'.repeat(depth);
  const url = `${SITE_URL}/${path}`;
  // ?v= verandert zodra er een nieuwe prijs is, zodat WhatsApp de oude preview niet uit de cache blijft tonen.
  const img = `${SITE_URL}/og/${ogImage}.png?v=${ogVersion.replace(/-/g, '')}`;
  return `<!doctype html>
<html lang="${lang}">
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
  <nav class="topnav">
    <a href="${pre}vs/${PREVIEW ? 'index.html' : ''}" data-i18n="compareCta">Vergelijk</a>
    <button type="button" id="lang-toggle" class="lang" aria-label="Switch language">EN</button>
  </nav>
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

// --- start ---
rmSync(DIST, { recursive: true, force: true, maxRetries: 2 });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'src/assets'), join(DIST, 'assets'), { recursive: true });

// Client-data: zonder interne bronstatus.
const clientTeams = TEAMS.map((t) => ({ ...t, wins: t.wins.map(({ v, ...w }) => w) }));
writeFileSync(join(DIST, 'assets/data.mjs'),
  `export const TEAMS = ${JSON.stringify(clientTeams)};\n` +
  `export const COMPS = ${JSON.stringify(COMPS)};\n` +
  `export const RIVALRIES = ${JSON.stringify(RIVALRIES)};\n` +
  `export const META = ${JSON.stringify({ siteUrl: SITE_URL, reportEmail: REPORT_EMAIL, verifiedAt: VERIFIED_AT })};\n`);

// Home
write('index.html', page({
  depth: 0, kind: 'home', path: '', ogImage: 'home',
  title: 'NoTrophy: hoe lang wacht jouw rivaal al op een prijs?',
  desc: 'Live tellers voor ruim 90 clubs en landen. Zoek de rivaal, kijk hoe lang het geleden is en stuur het door.',
  body: '<noscript><p>NoTrophy telt hoe lang clubs en landen al zonder prijs zitten. Zet JavaScript aan voor de tellers.</p></noscript>',
}));

// Teampagina's
for (const t of TEAMS) {
  const lang = ogLang(t);
  const name = teamName(t, lang, NATION_EN);
  const ref = reference(t, 'all', COMPS);
  let title, desc;
  if (ref.never) {
    const y = t.founded.slice(0, 4);
    title = lang === 'nl' ? `${name} heeft nog nooit een prijs gewonnen` : `${name} have never won a trophy`;
    desc = lang === 'nl' ? `Sinds ${y}: niks. Kijk de teller tikken en stuur 'm naar een ${name}-fan.` : `Since ${y}: nothing. Watch the clock and send it to a ${name} fan.`;
  } else {
    const when = fmtDate(ref.win.d, lang, ref.win.approx);
    const comp = COMPS[ref.win.c][lang];
    title = lang === 'nl' ? `${name} wacht sinds ${when} op een prijs` : `${name}: no trophy since ${when}`;
    desc = lang === 'nl' ? `Laatste prijs: ${comp}. Kijk de teller tikken en stuur 'm naar een ${name}-fan.` : `Last trophy: ${comp}. Watch the clock tick and send it to a ${name} fan.`;
  }
  write(`${t.id}/index.html`, page({
    depth: 1, kind: 'team', id: t.id, path: t.id, ogImage: t.id, title, desc, lang, ogVersion: latest(t),
    body: `<noscript><h1>${esc(title)}</h1><p>${esc(desc)}</p></noscript>`,
  }));
}

// Vergelijken (vrij) + uitgelichte rivaliteiten
write('vs/index.html', page({
  depth: 1, kind: 'compare', path: 'vs/', ogImage: 'home',
  title: 'NoTrophy: wie wacht het langst op een prijs?',
  desc: 'Zet twee clubs of landen naast elkaar en zie wie het langst zonder prijs zit.',
  body: '',
}));
for (const r of RIVALRIES) {
  const a = byId[r.a], b = byId[r.b];
  const lang = ogLang(a);
  const title = `${teamName(a, lang, NATION_EN)} vs ${teamName(b, lang, NATION_EN)}: ${lang === 'nl' ? 'wie wacht het langst op een prijs?' : 'who has waited longest for a trophy?'}`;
  write(`${r.a}-vs-${r.b}/index.html`, page({
    depth: 1, kind: 'compare', path: `${r.a}-vs-${r.b}`, ogImage: `${r.a}-vs-${r.b}`, lang, title,
    desc: lang === 'nl' ? `${r.nl}. Live tellers, één winnaar van de schaamte. Stuur 'm door.` : `${r.en}. Live clocks, one winner of shame. Send it on.`,
    body: '', extraData: ` data-a="${r.a}" data-b="${r.b}"`, ogVersion: [latest(a), latest(b)].sort().pop(),
  }));
}

// Regels
write('regels/index.html', page({
  depth: 1, kind: 'rules', path: 'regels/', ogImage: 'home',
  title: 'NoTrophy: wat telt als prijs?',
  desc: 'De spelregels van NoTrophy: welke prijzen tellen mee en hoe we de datum bepalen.',
  body: '',
}));

write('404.html', page({ depth: 0, kind: 'home', path: '', ogImage: 'home', title: 'NoTrophy', desc: 'Pagina niet gevonden.', body: '' }));

// Sitemap + robots
const urls = ['', 'vs/', 'regels/', ...TEAMS.map((t) => t.id), ...RIVALRIES.map((r) => `${r.a}-vs-${r.b}`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Gebouwd: ${TEAMS.length} teams, ${RIVALRIES.length} rivaliteiten → dist/${PREVIEW ? ' (preview-links)' : ''}`);
if (!hasOg) console.log('Tip: draai "npm run og" voor de WhatsApp/social preview-afbeeldingen.');
