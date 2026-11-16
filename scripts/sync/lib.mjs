// Pure functies voor de automatische sync. Geen netwerk, geen bestanden: zo zijn ze te testen met nep-data.

const DONE = ['FT', 'AET', 'PEN'];
export const isFinished = (fx) => DONE.includes(fx.fixture?.status?.short);

// Datum in Nederlandse tijd (een finale om 21:00 UTC-ish valt anders soms op de verkeerde dag).
export function localDate(iso, timeZone = 'Europe/Amsterdam') {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

// API-Football gebruikt het beginjaar van het seizoen (2025 = 2025/26).
export function seasonFor(today, calendar = false) {
  const [y, m] = today.split('-').map(Number);
  if (calendar) return y;
  return m >= 7 ? y : y - 1;
}
export const seasonLabel = (season, calendar) => (calendar ? undefined : `${season}/${String(season + 1).slice(2)}`);

const isFinalRound = (round = '') => /\bfinal\b/i.test(round) && !/semi|quarter|1\/\d|eighth|round of|play-?off/i.test(round);

// Vindt de finale en de winnaar. Ondersteunt één finale, tweeluiken (op totaalscore) en supercups zonder rondenaam.
export function findFinal(fixtures, type) {
  const done = fixtures.filter(isFinished).sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
  let finals = done.filter((fx) => isFinalRound(fx.league?.round));
  if (!finals.length && type === 'super' && done.length === 1) finals = done;
  if (!finals.length) return null;
  // Toernooien kunnen ook een "3rd Place Final" hebben; die vallen af via de regex? Niet altijd: filter expliciet.
  finals = finals.filter((fx) => !/3rd|third/i.test(fx.league?.round || ''));
  if (!finals.length) return null;

  const last = finals[finals.length - 1];
  const legs = finals.filter((fx) => sameTie(fx, last));
  let winner = null;
  if (legs.length === 1) {
    winner = last.teams.home.winner === true ? last.teams.home : last.teams.away.winner === true ? last.teams.away : null;
  } else {
    // Tweeluik: totaalscore, bij gelijkspel de strafschoppen van het laatste duel.
    const goals = {};
    for (const fx of legs) {
      goals[fx.teams.home.id] = (goals[fx.teams.home.id] || 0) + (fx.goals.home ?? 0);
      goals[fx.teams.away.id] = (goals[fx.teams.away.id] || 0) + (fx.goals.away ?? 0);
    }
    const [h, a] = [last.teams.home, last.teams.away];
    if (goals[h.id] !== goals[a.id]) winner = goals[h.id] > goals[a.id] ? h : a;
    else winner = h.winner === true ? h : a.winner === true ? a : null;
  }
  if (!winner) return null;
  return { winner, fixture: last, date: localDate(last.fixture.date), label: matchLabel(last, legs.length > 1) };
}

function sameTie(a, b) {
  const s = (fx) => [fx.teams.home.id, fx.teams.away.id].sort().join('-');
  return s(a) === s(b);
}

export function matchLabel(fx, secondLeg = false) {
  const st = fx.fixture.status.short;
  let s = `${fx.teams.home.name} ${fx.goals.home}-${fx.goals.away} ${fx.teams.away.name}`;
  if (st === 'PEN' && fx.score?.penalty) s += `, ${fx.score.penalty.home}-${fx.score.penalty.away} pen.`;
  else if (st === 'AET') s += ' (n.v.)';
  if (secondLeg) s += ' (2e duel)';
  return s;
}

// Bepaalt wanneer de landstitel wiskundig zeker was.
// games = aantal competitiewedstrijden per team; adjust = puntenaftrek per team-id (uit de stand).
export function leagueChampion(fixtures, { games, adjust = {}, standingsLeader = null }) {
  const league = fixtures
    .filter((fx) => !/relegation|play-?off|final|promotion/i.test(fx.league?.round || ''))
    .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
  const teams = new Map();
  for (const fx of league) for (const t of [fx.teams.home, fx.teams.away]) if (!teams.has(t.id)) teams.set(t.id, { team: t, pts: adjust[t.id] || 0, played: 0 });
  if (teams.size < 2) return null;

  const done = league.filter(isFinished);
  let i = 0;
  while (i < done.length) {
    const day = localDate(done[i].fixture.date);
    while (i < done.length && localDate(done[i].fixture.date) === day) {
      const fx = done[i++];
      const h = teams.get(fx.teams.home.id), a = teams.get(fx.teams.away.id);
      h.played++; a.played++;
      if (fx.goals.home > fx.goals.away) h.pts += 3;
      else if (fx.goals.home < fx.goals.away) a.pts += 3;
      else { h.pts += 1; a.pts += 1; }
    }
    const rows = [...teams.values()].sort((x, y) => y.pts - x.pts);
    const [lead, ...rest] = rows;
    const clinched = rest.every((r) => r.pts + 3 * Math.max(0, games - r.played) < lead.pts);
    if (clinched) return { winner: lead.team, date: day, how: 'clinched' };
  }
  // Seizoen klaar maar beslist op doelsaldo: dan de koploper van de officiële stand, op de laatste speeldag.
  const allDone = [...teams.values()].every((r) => r.played >= games);
  if (allDone && standingsLeader && done.length) {
    return { winner: standingsLeader, date: localDate(done[done.length - 1].fixture.date), how: 'final-day' };
  }
  return null;
}

// Koppelt een API-team aan een NoTrophy-team: eerst op opgeslagen id, dan op naam/alias.
export const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\b(fc|afc|cf|ac|sc|as|ss|ssc|rc|ogc|losc|vfb|vfl|sv|bv|1\.)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
export function resolveTeam(apiTeam, teams, { idMap = {}, aliases = {}, nationEn = {} } = {}) {
  if (idMap[apiTeam.id]) return idMap[apiTeam.id];
  const n = norm(apiTeam.name);
  const hits = teams.filter((t) => [t.name, t.short, nationEn[t.id], ...(aliases[t.id] || [])].filter(Boolean).some((x) => norm(x) === n));
  return hits.length === 1 ? hits[0].id : null;
}

// Voegt een prijs toe als die nieuwer is dan wat er staat. Geeft terug wat er veranderd is (of null).
export function applyWin(teams, teamId, win, today) {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return null;
  if (win.d > today) return null; // nooit een datum in de toekomst
  const i = team.wins.findIndex((w) => w.c === win.c);
  if (i >= 0 && team.wins[i].d >= win.d) return null;
  const before = i >= 0 ? team.wins[i] : null;
  const clean = Object.fromEntries(Object.entries(win).filter(([, v]) => v !== undefined));
  if (i >= 0) team.wins[i] = clean; else team.wins.push(clean);
  return { team: teamId, c: win.c, d: win.d, m: win.m, previous: before?.d || null };
}

export function inWindow(cfg, today, all) {
  if (all) return true;
  const m = Number(today.slice(5, 7));
  return (cfg.months || []).includes(m);
}

export function pointsFromFixtures(fixtures) {
  const pts = {};
  for (const fx of fixtures) for (const t of [fx.teams.home, fx.teams.away]) pts[t.id] ??= 0;
  for (const fx of fixtures.filter(isFinished)) {
    const { home, away } = fx.goals;
    if (home > away) pts[fx.teams.home.id] += 3;
    else if (home < away) pts[fx.teams.away.id] += 3;
    else { pts[fx.teams.home.id] += 1; pts[fx.teams.away.id] += 1; }
  }
  return pts;
}

// Vaste opmaak van data/teams.json: één team per regel, één prijs per regel. Houdt diffs klein en leesbaar.
export function formatTeams(list) {
  const out = list.map((t) => {
    const { wins, ...head } = t;
    const h = JSON.stringify(head).slice(0, -1);
    return wins.length
      ? `  ${h}, "wins": [\n${wins.map((w) => `      ${JSON.stringify(w)}`).join(',\n')}\n    ] }`
      : `  ${h}, "wins": [] }`;
  });
  return `[\n${out.join(',\n')}\n]\n`;
}
