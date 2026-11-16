import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { findFinal, leagueChampion, resolveTeam, applyWin, seasonFor, localDate, formatTeams } from '../scripts/sync/lib.mjs';

const TEAMS = JSON.parse(readFileSync(new URL('../data/teams.json', import.meta.url)));
const aliases = JSON.parse(readFileSync(new URL('../data/api-aliases.json', import.meta.url)));

let ts = 1_700_000_000;
function fx({ home, away, hg, ag, round = 'Final', status = 'FT', date, pen, hw, aw }) {
  ts += 3600;
  return {
    fixture: { date, timestamp: date ? Date.parse(date) / 1000 : ts, status: { short: status } },
    league: { round },
    teams: { home: { ...home, winner: hw ?? (hg > ag) }, away: { ...away, winner: aw ?? (ag > hg) } },
    goals: { home: hg, away: ag },
    score: { penalty: pen ? { home: pen[0], away: pen[1] } : { home: null, away: null } },
  };
}
const T = (id, name) => ({ id, name });
const AZ = T(201, 'AZ Alkmaar'), NEC = T(413, 'NEC Nijmegen'), PSV = T(197, 'PSV Eindhoven'), AJAX = T(194, 'Ajax');

test('finale met strafschoppen: winnaar volgt de API-vlag, datum in NL-tijd', () => {
  const list = [
    fx({ home: AZ, away: PSV, hg: 2, ag: 1, round: 'Semi-finals', date: '2026-03-01T19:00:00+00:00' }),
    fx({ home: AZ, away: NEC, hg: 1, ag: 1, status: 'PEN', pen: [4, 3], hw: true, aw: false, date: '2026-04-19T22:30:00+00:00' }),
  ];
  const f = findFinal(list, 'cup');
  assert.equal(f.winner.name, 'AZ Alkmaar');
  assert.equal(f.date, '2026-04-20'); // 00:30 in Amsterdam
  assert.equal(f.label, 'AZ Alkmaar 1-1 NEC Nijmegen, 4-3 pen.');
});

test('nog niet gespeelde finale geeft niets', () => {
  assert.equal(findFinal([fx({ home: AZ, away: NEC, hg: null, ag: null, status: 'NS', date: '2027-04-18T16:00:00Z' })], 'cup'), null);
});

test('troostfinale telt niet', () => {
  const list = [fx({ home: AZ, away: NEC, hg: 2, ag: 0, round: '3rd Place Final', date: '2026-07-18T18:00:00Z' })];
  assert.equal(findFinal(list, 'cup'), null);
});

test('supercup zonder rondenaam: enige wedstrijd telt', () => {
  const f = findFinal([fx({ home: PSV, away: AZ, hg: 0, ag: 4, round: '', date: '2026-08-02T16:45:00Z' })], 'super');
  assert.equal(f.winner.id, 201);
  assert.equal(f.date, '2026-08-02');
});

test('tweeluik: totaalscore beslist', () => {
  const list = [
    fx({ home: AJAX, away: PSV, hg: 2, ag: 0, date: '2026-05-01T18:00:00Z' }),
    fx({ home: PSV, away: AJAX, hg: 1, ag: 0, date: '2026-05-08T18:00:00Z' }),
  ];
  const f = findFinal(list, 'cup');
  assert.equal(f.winner.id, 194);
  assert.match(f.label, /2nd leg/);
});

test('landstitel: datum waarop het wiskundig zeker is', () => {
  // 4 teams, dubbele competitie = 6 wedstrijden per team. A wint alles.
  const A = T(1, 'A'), B = T(2, 'B'), C = T(3, 'C'), D = T(4, 'D');
  const days = ['2026-03-01', '2026-03-08', '2026-03-15', '2026-03-22', '2026-03-29', '2026-04-05'];
  const pairs = [[[A, B], [C, D]], [[A, C], [B, D]], [[A, D], [B, C]], [[B, A], [D, C]], [[C, A], [D, B]], [[D, A], [C, B]]];
  const list = [];
  pairs.forEach((round, i) => round.forEach(([h, a]) => {
    const aWins = a.id === 1;
    list.push(fx({ home: h, away: a, hg: aWins ? 0 : (h.id === 1 ? 3 : 1), ag: aWins ? 2 : (h.id === 1 ? 0 : 1), round: `Regular Season - ${i + 1}`, date: `${days[i]}T14:00:00Z` }));
  }));
  const res = leagueChampion(list, { games: 6 });
  assert.equal(res.winner.id, 1);
  // Na 4 rondes: A 12 pt, rest max 4 + 2*3 = 10 < 12 → zeker op dag 4.
  assert.equal(res.date, '2026-03-22');
});

test('landstitel nog niet beslist geeft niets', () => {
  const A = T(1, 'A'), B = T(2, 'B');
  const list = [fx({ home: A, away: B, hg: 1, ag: 0, round: 'Regular Season - 1', date: '2026-03-01T14:00:00Z' }),
    fx({ home: B, away: A, hg: null, ag: null, status: 'NS', round: 'Regular Season - 2', date: '2026-03-08T14:00:00Z' })];
  assert.equal(leagueChampion(list, { games: 2 }), null);
});

test('teams koppelen op naam en alias', () => {
  const o = { aliases };
  assert.equal(resolveTeam({ id: 197, name: 'PSV Eindhoven' }, TEAMS, o), 'psv');
  assert.equal(resolveTeam({ id: 42, name: 'Arsenal' }, TEAMS, o), 'arsenal');
  assert.equal(resolveTeam({ id: 85, name: 'Paris Saint Germain' }, TEAMS, o), 'psg');
  assert.equal(resolveTeam({ id: 165, name: 'Borussia Dortmund' }, TEAMS, o), 'dortmund');
  assert.equal(resolveTeam({ id: 543, name: 'Real Betis' }, TEAMS, o), 'betis');
  assert.equal(resolveTeam({ id: 999, name: 'Kaiserslautern' }, TEAMS, o), null);
  assert.equal(resolveTeam({ id: 500, name: 'Bologna' }, TEAMS, o), 'bologna');
  assert.equal(resolveTeam({ id: 999, name: 'Whatever' }, TEAMS, { idMap: { 999: 'ajax' } }), 'ajax');
});

test('applyWin: alleen nieuwer, nooit in de toekomst', () => {
  const teams = structuredClone(TEAMS);
  assert.equal(applyWin(teams, 'ajax', { c: 'nl-cup', d: '2020-01-01', m: 'x', v: 'api' }, '2026-11-16'), null);
  assert.equal(applyWin(teams, 'ajax', { c: 'nl-cup', d: '2027-04-18', m: 'x', v: 'api' }, '2026-11-16'), null);
  const ch = applyWin(teams, 'ajax', { c: 'nl-cup', d: '2026-11-15', m: 'Ajax 2-0 X', v: 'api' }, '2026-11-16');
  assert.equal(ch.previous, '2021-04-18');
  assert.equal(teams.find((t) => t.id === 'ajax').wins.find((w) => w.c === 'nl-cup').d, '2026-11-15');
  assert.ok(applyWin(teams, 'nec', { c: 'nl-cup', d: '2026-11-15', m: 'NEC wint', v: 'api' }, '2026-11-16'));
});

test('seizoensjaar volgt API-Football', () => {
  assert.equal(seasonFor('2026-05-20'), 2025);
  assert.equal(seasonFor('2026-08-02'), 2026);
  assert.equal(seasonFor('2026-07-19', true), 2026);
  assert.equal(localDate('2026-05-30T20:30:00+00:00'), '2026-05-30');
});

test('formatTeams is stabiel', () => {
  const s = formatTeams(TEAMS);
  assert.deepEqual(JSON.parse(s), TEAMS);
  assert.equal(s, readFileSync(new URL('../data/teams.json', import.meta.url), 'utf8'));
});

test('sync.mjs end-to-end tegen een nep-API (dry run)', async () => {
  const routes = {
    '/leagues?id=90': [{ league: { name: 'KNVB Beker' }, country: { name: 'Netherlands' } }],
    '/fixtures?league=90&season=2026': [fx({ home: AZ, away: NEC, hg: 1, ag: 3, date: '2026-11-15T17:00:00Z' })],
  };
  const server = createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ errors: [], response: routes[req.url] || [] }));
  });
  await new Promise((r) => server.listen(0, r));
  const { port } = server.address();
  const out = await new Promise((resolve) => execFile(process.execPath,
    ['scripts/sync.mjs', '--only=nl-cup', '--dry-run', '--today=2026-11-16'],
    { cwd: new URL('..', import.meta.url).pathname, env: { ...process.env, API_FOOTBALL_KEY: 'test', API_FOOTBALL_BASE: `http://127.0.0.1:${port}` } },
    (err, stdout, stderr) => resolve({ code: err?.code ?? 0, stdout, stderr })));
  server.close();
  assert.equal(out.code, 0, out.stderr);
  assert.match(out.stdout, /🏆 nec: nl-cup op 2026-11-15/);
});
