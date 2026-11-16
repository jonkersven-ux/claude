// Maakt de preview-afbeeldingen (1200x630) die WhatsApp, X en Facebook tonen bij een gedeelde link.
// De tekst bevat alleen de datum van de laatste prijs, dus de afbeelding veroudert niet tot er een nieuwe prijs bij komt.
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { RIVALRIES } from './config.mjs';
import { reference, fmtDate, teamName, shortName } from '../src/assets/core.mjs';
import { NATION_EN } from '../src/assets/i18n.mjs';

// Playwright: lokaal geïnstalleerd (npm i -D playwright) of globaal beschikbaar.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist/og');
mkdirSync(OUT, { recursive: true });
const TEAMS = JSON.parse(readFileSync(join(ROOT, 'data/teams.json'), 'utf8'));
const COMPS = JSON.parse(readFileSync(join(ROOT, 'data/competitions.json'), 'utf8'));
const byId = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
const ogLang = (t) => (t.country === 'NL' || ['nederland', 'belgie'].includes(t.id) ? 'nl' : 'en');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function lum(hex) {
  const c = hex.slice(1).match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const fgFor = ([c1, c2]) => (ratio(c1, c2) >= 3 ? c2 : (lum(c1) > 0.4 ? '#12161C' : '#FFFFFF'));

const BASE = `
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Big+Shoulders+Display:wght@800;900&display=block">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#12161C;color:#F4F6F8;font-family:Archivo,Arial,sans-serif;overflow:hidden;display:flex;flex-direction:column}
.scarf{height:150px;display:flex;align-items:center;justify-content:center;background:repeating-linear-gradient(90deg,var(--c1) 0 34px,var(--c2) 34px 68px)}
.scarf b{background:var(--c1);color:var(--fg);font:900 92px/1 'Big Shoulders Display',Impact,sans-serif;text-transform:uppercase;letter-spacing:.05em;padding:14px 48px;border-left:10px solid var(--c2);border-right:10px solid var(--c2);max-width:1000px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.main{flex:1;padding:36px 60px 0;display:flex;flex-direction:column;justify-content:center;gap:10px}
.k{font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:26px;color:#AEB8C2}
.big{font:900 132px/.9 'Big Shoulders Display',Impact,sans-serif;text-transform:uppercase;color:#F2C200}
.m{font-size:30px;font-weight:700;color:#DDE2E7}
.bar{height:84px;display:flex;align-items:center;justify-content:space-between;padding:0 60px;background:#F2C200;color:#12161C;font:900 44px 'Big Shoulders Display',Impact,sans-serif;text-transform:uppercase}
.bar>span{font:800 24px Archivo,Arial,sans-serif;text-transform:none}
.no{text-decoration:line-through;text-decoration-color:#D21F2A;text-decoration-thickness:5px}
.vs{display:grid;grid-template-columns:1fr 1fr;flex:1}
.vs>div{display:flex;flex-direction:column}
.vs .scarf b{font-size:62px;padding:10px 26px;max-width:520px}
.vs .main{padding:28px 44px 0}
.vs .big{font-size:96px}
.vs .m{font-size:24px}
</style>`;

function teamBlock(t, lang) {
  const ref = reference(t, 'all', COMPS);
  const nl = lang === 'nl';
  const k = ref.never ? (nl ? 'Nog nooit een prijs' : 'Never won a trophy') : (nl ? 'Geen prijs sinds' : 'No trophy since');
  const big = ref.never ? (nl ? `Sinds ${t.founded.slice(0, 4)}` : `Since ${t.founded.slice(0, 4)}`) : fmtDate(ref.win.d, lang, ref.win.approx);
  const m = ref.never ? (nl ? 'Helemaal niks. Nul.' : 'Nothing. Zero.') : COMPS[ref.win.c][lang];
  return { k, big, m };
}

const footer = (lang) => `<div class="bar"><div><span class="no">No</span>Trophy.com</div><span>${lang === 'nl' ? 'Kijk de teller tikken →' : 'Watch the clock tick →'}</span></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
async function shot(file, html) {
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8">${BASE}</head><body>${html}</body></html>`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.screenshot({ path: join(OUT, `${file}.png`) });
}

for (const t of TEAMS) {
  const lang = ogLang(t);
  const b = teamBlock(t, lang);
  await shot(t.id, `<div class="scarf" style="--c1:${t.colors[0]};--c2:${t.colors[1]};--fg:${fgFor(t.colors)}"><b>${esc(shortName(t, lang, NATION_EN))}</b></div>
    <div class="main"><div class="k">${esc(b.k)}</div><div class="big">${esc(b.big)}</div><div class="m">${esc(b.m)}</div></div>${footer(lang)}`);
}
for (const r of RIVALRIES) {
  const a = byId[r.a], c = byId[r.b];
  const lang = ogLang(a);
  const side = (t) => { const b = teamBlock(t, lang); return `<div><div class="scarf" style="--c1:${t.colors[0]};--c2:${t.colors[1]};--fg:${fgFor(t.colors)}"><b>${esc(shortName(t, lang, NATION_EN))}</b></div>
    <div class="main"><div class="k">${esc(b.k)}</div><div class="big">${esc(b.big)}</div><div class="m">${esc(b.m)}</div></div></div>`; };
  await shot(`${r.a}-vs-${r.b}`, `<div class="vs">${side(a)}${side(c)}</div>${footer(lang)}`);
}
await shot('home', `<div class="scarf" style="--c1:#12161C;--c2:#F2C200;--fg:#F2C200"><b><span class="no">No</span>Trophy</b></div>
  <div class="main"><div class="k">Hoe lang wacht jouw rivaal al op een prijs?</div><div class="big">Ajax · Spurs · Real</div><div class="m">Live tellers voor ruim 90 clubs en landen. Zoek, lach, stuur door.</div></div>${footer('nl')}`);

await browser.close();
console.log(`OG-afbeeldingen: ${TEAMS.length + RIVALRIES.length + 1} → dist/og/`);
