import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reference, diffParts, lastWin, ranking, compareLine } from '../src/assets/core.mjs';
import { T } from '../src/assets/i18n.mjs';
import { FANBASES, RIVALRIES } from '../scripts/config.mjs';

const TEAMS = JSON.parse(readFileSync(new URL('../data/teams.json', import.meta.url)));
const COMPS = JSON.parse(readFileSync(new URL('../data/competitions.json', import.meta.url)));
const team = (id) => TEAMS.find((t) => t.id === id);

test('diffParts telt jaren via de verjaardag en dagen daarna', () => {
  const p = diffParts(new Date(2022, 4, 11), new Date(2026, 10, 16, 12, 30, 15));
  assert.equal(p.years, 4);
  assert.equal(p.days, 189);
  assert.equal(p.hours, 12);
  assert.equal(p.minutes, 30);
  assert.equal(p.seconds, 15);
});

test('supercups vallen weg in modus "real"', () => {
  assert.equal(lastWin(team('arsenal'), 'all', COMPS).c, 'en-super');
  assert.equal(lastWin(team('arsenal'), 'real', COMPS).c, 'en-league');
  assert.equal(lastWin(team('real-madrid'), 'real', COMPS).c, 'ucl');
});

test('nooit gewonnen telt vanaf oprichting', () => {
  const ref = reference(team('nec'), 'all', COMPS);
  assert.equal(ref.never, true);
  assert.equal(ref.date.getFullYear(), 1900);
});

test('modus zonder prijs in die categorie geeft "nooit"', () => {
  assert.equal(reference(team('heerenveen'), 'league', COMPS).never, true);
});

test('ranglijst zet nooit-winnaars bovenaan, daarna langste droogte', () => {
  const r = ranking(TEAMS, 'all', COMPS, new Date(2026, 10, 16));
  const firstWinner = r.findIndex((x) => !x.ref.never);
  assert.ok(r.slice(0, firstWinner).every((x) => x.ref.never));
  for (let i = firstWinner + 1; i < r.length; i++) assert.ok(r[i - 1].days >= r[i].days);
});

test('vergelijking wijst de langste wachter aan', () => {
  const res = compareLine(team('ajax'), team('feyenoord'), 'all', { t: T, comps: COMPS, now: new Date(2026, 10, 16) });
  assert.equal(res.worse.id, 'ajax');
  assert.match(res.line, /711 days/);
});

test('fanbase list and derbies point at existing clubs', () => {
  for (const id of FANBASES) assert.ok(team(id), id);
  for (const r of RIVALRIES) { assert.ok(team(r.a), r.a); assert.ok(team(r.b), r.b); }
});

test('Real Madrid: last trophy in December 2024, none in 2025/26', () => {
  assert.equal(lastWin(team('real-madrid'), 'all', COMPS).d, '2024-12-18');
});
