// Controleert data/teams.json op fouten en laat zien wat nog nagelopen moet worden.
// Faalt (exit 1) bij harde fouten. Waarschuwt bij open checks.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERIFIED_AT, RIVALRIES, FANBASES } from './config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEAMS = JSON.parse(readFileSync(join(ROOT, 'data/teams.json'), 'utf8'));
const COMPS = JSON.parse(readFileSync(join(ROOT, 'data/competitions.json'), 'utf8'));
const UPCOMING = JSON.parse(readFileSync(join(ROOT, 'data/upcoming.json'), 'utf8'));
const today = new Date().toISOString().slice(0, 10);
const errors = [], warnings = [];
const ids = new Set();
const LEAGUE_SIZE = { ENG: 20, ESP: 20, ITA: 20, GER: 18, FRA: 18, NL: 18 };
const COUNTRIES = Object.keys(LEAGUE_SIZE);
const COUNTRY_PREFIX = { NL: 'nl-', ENG: 'en-', ESP: 'es-', ITA: 'it-', GER: 'de-', FRA: 'fr-' };

const validDate = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

for (const t of TEAMS) {
  const where = `[${t.id}]`;
  if (!/^[a-z0-9-]+$/.test(t.id)) errors.push(`${where} id mag alleen a-z, 0-9 en - bevatten`);
  if (ids.has(t.id)) errors.push(`${where} dubbele id`);
  ids.add(t.id);
  if (!t.name) errors.push(`${where} naam ontbreekt`);
  if (!COUNTRIES.includes(t.country)) errors.push(`${where} onbekend land ${t.country}`);
  if (!Array.isArray(t.colors) || t.colors.length !== 2 || !t.colors.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c))) errors.push(`${where} colors moet twee #RRGGBB-kleuren zijn`);
  if (!/^\d{4}(-\d{2}-\d{2})?$/.test(t.founded || '')) errors.push(`${where} founded moet YYYY of YYYY-MM-DD zijn`);
  if (!t.league) errors.push(`${where} league ontbreekt`);
  const seenComp = new Set();
  for (const w of t.wins) {
    const ww = `${where} ${w.c} ${w.d}`;
    if (!COMPS[w.c]) { errors.push(`${ww}: onbekende competitie`); continue; }
    if (!validDate(w.d)) errors.push(`${ww}: ongeldige datum`);
    if (w.d > today) errors.push(`${ww}: datum ligt in de toekomst`);
    if (w.d > VERIFIED_AT) warnings.push(`${ww}: na VERIFIED_AT (${VERIFIED_AT}), zet VERIFIED_AT bij`);
    if (seenComp.has(w.c)) errors.push(`${ww}: competitie staat dubbel, bewaar alleen de laatste winst`);
    seenComp.add(w.c);
    if (!w.m) errors.push(`${ww}: wedstrijd/omschrijving (m) ontbreekt`);
    if (!['web', 'mem', 'api'].includes(w.v)) errors.push(`${ww}: v moet "web", "api" of "mem" zijn`);
    const pre = COUNTRY_PREFIX[t.country];
    if (pre && /^(nl|en|es|it|de|fr|sc)-/.test(w.c) && !w.c.startsWith(pre)) errors.push(`${ww}: nationale prijs van een ander land`);
    if (t.founded && w.d.slice(0, 4) < t.founded.slice(0, 4)) errors.push(`${ww}: prijs vóór oprichting`);
  }
}
for (const t of TEAMS) for (const r of t.rivals || []) if (!ids.has(r)) errors.push(`[${t.id}] rivaal "${r}" bestaat niet`);
for (const r of RIVALRIES) for (const id of [r.a, r.b]) if (!ids.has(id)) errors.push(`rivaliteit ${r.a}-vs-${r.b}: "${id}" bestaat niet`);
for (const id of FANBASES) if (!ids.has(id)) errors.push(`FANBASES: "${id}" bestaat niet`);
for (const [c, n] of Object.entries(LEAGUE_SIZE)) {
  const have = TEAMS.filter((t) => t.country === c).length;
  if (have !== n) errors.push(`${c}: ${have} clubs, verwacht ${n} (volledige competitie 2026/27)`);
}

// Open checks
const mem = TEAMS.flatMap((t) => t.wins.filter((w) => w.v === 'mem').map((w) => ({ t, w })));
const approx = TEAMS.flatMap((t) => t.wins.filter((w) => w.approx).map((w) => ({ t, w })));
const due = UPCOMING.filter((u) => u.check <= today);

const total = TEAMS.reduce((n, t) => n + t.wins.length, 0);
console.log(`NoTrophy data: ${TEAMS.length} teams, ${total} prijzen. Nagelopen t/m ${VERIFIED_AT}.`);
console.log(`  web-geverifieerd: ${total - mem.length}   nog dubbelchecken (mem): ${mem.length}   datum bij benadering: ${approx.length}`);
if (process.argv.includes('--todo')) {
  console.log('\nNog dubbelchecken tegen een tweede bron:');
  for (const { t, w } of mem) console.log(`  ${t.id.padEnd(16)} ${w.c.padEnd(10)} ${w.d}  ${w.m}`);
  console.log('\nDatum bij benadering (exacte datum opzoeken):');
  for (const { t, w } of approx) console.log(`  ${t.id.padEnd(16)} ${w.c.padEnd(10)} ${w.d}  ${w.m}`);
}
if (due.length) {
  console.log('\n⚠ Deze wedstrijden zijn gespeeld en moeten verwerkt worden:');
  for (const u of due) console.log(`  ${u.check}  ${u.what}${u.teams.length ? `  (${u.teams.join(', ')})` : ''}`);
}
for (const w of warnings) console.log(`waarschuwing: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} fout(en):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('✓ Geen fouten.');
