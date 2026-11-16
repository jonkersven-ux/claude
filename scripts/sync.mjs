// Automatische sync met API-Football (api-football.com / api-sports.io).
// Zoekt per competitie de finale of de beslissende speeldag, en zet een nieuwe prijs in data/teams.json.
//
//   API_FOOTBALL_KEY=... node scripts/sync.mjs            dagelijkse run (alleen competities in hun beslis-maanden)
//   API_FOOTBALL_KEY=... node scripts/sync.mjs --all      alle competities
//   ... --dry-run                                         laat zien wat er zou veranderen, schrijft niets
//   ... --only=nl-cup,en-cup                              alleen deze competities
//   ... --today=2026-05-20                                doen alsof het die dag is (testen)
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findFinal, leagueChampion, pointsFromFixtures, formatTeams, resolveTeam, applyWin, inWindow, seasonFor, seasonLabel, localDate } from './sync/lib.mjs';
import { NATION_EN } from '../src/assets/i18n.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const KEY = process.env.API_FOOTBALL_KEY;
const BASE = process.env.API_FOOTBALL_BASE || 'https://v3.football.api-sports.io';
const today = args.today || localDate(new Date().toISOString());
const DRY = !!args['dry-run'];

const COUNTRY = { nl: 'Netherlands', en: 'England', es: 'Spain', it: 'Italy', de: 'Germany', fr: 'France', sc: 'Scotland' };

if (!KEY) {
  console.log('Geen API_FOOTBALL_KEY ingesteld: sync overgeslagen.');
  process.exit(0);
}

const teams = read('data/teams.json');
const cfgAll = read('data/api-competitions.json'); delete cfgAll._comment;
const aliases = read('data/api-aliases.json'); delete aliases._comment;
const map = read('data/api-map.json');
const changelog = read('data/changelog.json');

let calls = 0;
async function api(path) {
  calls++;
  const res = await fetch(`${BASE}${path}`, { headers: { 'x-apisports-key': KEY } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const json = await res.json();
  const errs = json.errors && (Array.isArray(json.errors) ? json.errors : Object.values(json.errors));
  if (errs && errs.length) throw new Error(`${path}: ${errs.join('; ')}`);
  return json.response || [];
}

// Controleer één keer per league-id dat het echt de bedoelde competitie is.
async function verifyLeague(comp, cfg) {
  if (map.leagues[cfg.league]) return true;
  const [row] = await api(`/leagues?id=${cfg.league}`);
  const name = row?.league?.name || '';
  const country = row?.country?.name || '';
  const wantCountry = COUNTRY[comp.slice(0, 2)];
  const ok = name.toLowerCase().includes(cfg.expect.toLowerCase()) && (!wantCountry || country === wantCountry);
  if (!ok) { report.problems.push(`${comp}: league ${cfg.league} is "${name}" (${country}), verwacht "${cfg.expect}"${wantCountry ? ` in ${wantCountry}` : ''}. Pas data/api-competitions.json aan.`); return false; }
  map.leagues[cfg.league] = `${name} (${country})`;
  return true;
}

async function detect(comp, cfg) {
  let season = seasonFor(today, cfg.calendar);
  if (cfg.type === 'league') {
    const fixtures = await api(`/fixtures?league=${cfg.league}&season=${season}`);
    const finished = fixtures.filter((f) => ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)).length;
    if (!finished) return null;
    // Stand: voor puntenaftrek (officiële punten min zelf berekende punten) en als tiebreak op de laatste speeldag.
    const st = await api(`/standings?league=${cfg.league}&season=${season}`);
    const table = st[0]?.league?.standings?.[0] || [];
    const own = pointsFromFixtures(fixtures);
    const adjust = {};
    for (const row of table) if (own[row.team.id] !== undefined && row.points !== own[row.team.id]) adjust[row.team.id] = row.points - own[row.team.id];
    const res = leagueChampion(fixtures, { games: cfg.games, adjust, standingsLeader: table[0]?.team });
    if (!res) return null;
    if (table[0] && table[0].team.id !== res.winner.id) { report.problems.push(`${comp}: berekende kampioen ${res.winner.name} ≠ koploper stand ${table[0].team.name}. Niets aangepast.`); return null; }
    return { team: res.winner, d: res.date, s: seasonLabel(season, false), m: res.how === 'clinched' ? `Titel wiskundig zeker (${res.date})` : 'Kampioen op de laatste speeldag' };
  }
  let fixtures = await api(`/fixtures?league=${cfg.league}&season=${season}`);
  let fin = findFinal(fixtures, cfg.type);
  // Supercups in januari staan bij sommige bonden onder het kalenderjaar.
  if (!fin && !cfg.calendar && Number(today.slice(5, 7)) <= 6) {
    fixtures = await api(`/fixtures?league=${cfg.league}&season=${season + 1}`);
    fin = findFinal(fixtures, cfg.type);
    if (fin) season += 1;
  }
  if (!fin) return null;
  return { team: fin.winner, d: fin.date, s: cfg.type === 'super' ? undefined : seasonLabel(season, cfg.calendar), m: fin.label };
}

const report = { changes: [], problems: [], unknown: [], checked: [] };
const only = args.only ? String(args.only).split(',') : null;

for (const [comp, cfg] of Object.entries(cfgAll)) {
  if (only && !only.includes(comp)) continue;
  if (!only && !inWindow(cfg, today, !!args.all)) continue;
  try {
    if (!(await verifyLeague(comp, cfg))) continue;
    const hit = await detect(comp, cfg);
    report.checked.push(comp);
    if (!hit) continue;
    // Prijzen ouder dan ~13 maanden negeren: dan is er iets mis met seizoen of data.
    const age = (new Date(today) - new Date(hit.d)) / 86400000;
    if (age > 400 || age < 0) { report.problems.push(`${comp}: verdachte datum ${hit.d}, overgeslagen.`); continue; }
    const id = resolveTeam(hit.team, teams, { idMap: map.teams, aliases, nationEn: NATION_EN });
    if (!id) { report.unknown.push(`${comp}: winnaar "${hit.team.name}" (api-id ${hit.team.id}) staat niet op NoTrophy.`); continue; }
    map.teams[hit.team.id] = id;
    const change = applyWin(teams, id, { c: comp, d: hit.d, s: hit.s, m: hit.m, v: 'api' }, today);
    if (change) report.changes.push(change);
  } catch (e) {
    report.problems.push(`${comp}: ${e.message}`);
  }
}

// --- uitvoer ---
const lines = [`NoTrophy sync ${today}: ${report.checked.length} competities gecheckt, ${calls} API-calls.`];
for (const c of report.changes) lines.push(`  🏆 ${c.team}: ${c.c} op ${c.d} (${c.m})${c.previous ? `, was ${c.previous}` : ''}`);
for (const u of report.unknown) lines.push(`  · ${u}`);
for (const p of report.problems) lines.push(`  ⚠ ${p}`);
if (!report.changes.length) lines.push('  Geen nieuwe prijzen.');
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\`\`\`\n${lines.join('\n')}\n\`\`\`\n`);

if (!DRY) {
  writeFileSync(join(ROOT, 'data/api-map.json'), `${JSON.stringify(map, null, 2)}\n`);
  if (report.changes.length) {
    writeTeams(teams);
    const meta = read('data/meta.json');
    meta.verifiedAt = today;
    writeFileSync(join(ROOT, 'data/meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
    changelog.unshift(...report.changes.map((c) => ({ at: today, ...c })));
    writeFileSync(join(ROOT, 'data/changelog.json'), `${JSON.stringify(changelog.slice(0, 200), null, 2)}\n`);
  }
}
// Exitcode 2 = er zijn problemen die een mens moet bekijken (de workflow maakt dan een issue aan).
process.exit(report.problems.length ? 2 : 0);

function writeTeams(list) { writeFileSync(join(ROOT, 'data/teams.json'), formatTeams(list)); }
