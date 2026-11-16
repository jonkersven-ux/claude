// Pure logic shared by the browser and the build scripts.
const DAY = 86400000;

// Datums van WK-finales (mannen), voor de "sindsdien"-feitjes.
const WORLD_CUP_FINALS = [
  '1930-07-30', '1934-06-10', '1938-06-19', '1950-07-16', '1954-07-04', '1958-06-29', '1962-06-17',
  '1966-07-30', '1970-06-21', '1974-07-07', '1978-06-25', '1982-07-11', '1986-06-29', '1990-07-08',
  '1994-07-17', '1998-07-12', '2002-06-30', '2006-07-09', '2010-07-11', '2014-07-13', '2018-07-15',
  '2022-12-18', '2026-07-19',
];

export const MODES = ['all', 'real', 'league', 'intl'];

export function parseDate(s) {
  const [y, m = 1, d = 1] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}


function allowed(cat, mode) {
  if (mode === 'real') return cat !== 'super';
  if (mode === 'league') return cat === 'league';
  if (mode === 'intl') return cat === 'intl';
  return true;
}

// Laatste prijs binnen een modus, of null.
export function lastWin(team, mode, comps) {
  let best = null;
  for (const w of team.wins) {
    const comp = comps[w.c];
    if (!comp || !allowed(comp.cat, mode)) continue;
    if (!best || w.d > best.d) best = w;
  }
  return best;
}

// Startpunt van de teller: laatste prijs, of oprichting als er nooit iets gewonnen is.
export function reference(team, mode, comps) {
  const win = lastWin(team, mode, comps);
  if (win) return { never: false, win, date: parseDate(win.d), approx: !!win.approx };
  return { never: true, win: null, date: parseDate(team.founded), approx: team.founded.length === 4 };
}

export function diffParts(from, now = new Date()) {
  let years = now.getFullYear() - from.getFullYear();
  const anniv = new Date(from);
  anniv.setFullYear(from.getFullYear() + years);
  if (anniv > now) { years -= 1; anniv.setFullYear(from.getFullYear() + years); }
  let rest = Math.max(0, now - anniv);
  const days = Math.floor(rest / DAY); rest -= days * DAY;
  const hours = Math.floor(rest / 3600000); rest -= hours * 3600000;
  const minutes = Math.floor(rest / 60000); rest -= minutes * 60000;
  const seconds = Math.floor(rest / 1000);
  const totalDays = Math.max(0, Math.floor((now - from) / DAY));
  return { years, days, hours, minutes, seconds, totalDays };
}

export function statusKey(ref, now = new Date()) {
  if (ref.never) return 'never';
  const y = (now - ref.date) / (365.25 * DAY);
  if (y < 1) return 'fresh';
  if (y < 3) return 'itch';
  if (y < 7) return 'drought';
  if (y < 15) return 'desert';
  if (y < 30) return 'fossil';
  return 'ancient';
}

export const shortName = (team) => team.short || team.name;
export const compName = (comps, w) => comps[w.c].name;

export function fmtNum(n) {
  return new Intl.NumberFormat('en-GB').format(n);
}
export function fmtDate(s, approx = false) {
  const d = parseDate(s);
  if (approx) return String(d.getFullYear());
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fill(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

// Ranglijst: langste droogte eerst (nooit gewonnen telt vanaf oprichting en staat bovenaan).
export function ranking(teams, mode, comps, now = new Date()) {
  return teams
    .map((t) => { const ref = reference(t, mode, comps); return { team: t, ref, days: diffParts(ref.date, now).totalDays }; })
    .sort((a, b) => (b.ref.never - a.ref.never) || (b.days - a.days));
}

// "Sindsdien"-feitjes, puur uit de datum berekend.
export function facts(ref, team, ctx) {
  const { t, comps, teams, now = new Date() } = ctx;
  const out = [];
  const p = diffParts(ref.date, now);
  const name = shortName(team);
  if (p.years < 1) {
    const months = Math.max(1, Math.floor(p.totalDays / 30.44));
    out.push(fill(t.facts.kidBaby, { months, name }));
  } else {
    const y = p.years;
    let school = '';
    if (y >= 5 && y <= 11) school = t.school.primary;
    else if (y >= 12 && y <= 17) school = t.school.secondary;
    else if (y >= 18 && y < 30) school = t.school.vote;
    else if (y >= 30) school = t.school.adult;
    out.push(fill(t.facts.kid, { years: y, school }));
  }
  let xmas = 0;
  for (let y = ref.date.getFullYear(); y <= now.getFullYear(); y++) {
    const x = new Date(y, 11, 25);
    if (x > ref.date && x <= now) xmas++;
  }
  if (xmas > 0) out.push(fill(t.facts.xmas, { n: fmtNum(xmas) }));
  const wc = WORLD_CUP_FINALS.filter((d) => parseDate(d) > ref.date && parseDate(d) <= now).length;
  if (wc > 0) out.push(fill(t.facts.worldcups, { n: fmtNum(wc) }));
  out.push(fill(t.facts.heart, { n: fmtNum(Math.round(p.totalDays * 24 * 60 * 75)) }));

  // Rivaal die in die periode wel iets won.
  for (const rid of team.rivals || []) {
    const rival = teams.find((x) => x.id === rid);
    if (!rival) continue;
    const rw = lastWin(rival, 'all', comps);
    if (rw && parseDate(rw.d) > ref.date) {
      out.push(fill(t.facts.rivalWon, { rival: shortName(rival), comp: compName(comps, rw), date: fmtDate(rw.d, rw.approx) }));
      break;
    }
  }
  return out;
}

export function shareText(team, mode, ctx, url) {
  const { t, comps, now = new Date() } = ctx;
  const ref = reference(team, mode, comps);
  const p = diffParts(ref.date, now);
  const name = team.name;
  const key = statusKey(ref, now);
  const roastList = t.roast[key];
  const roast = roastList[Math.floor(Math.random() * roastList.length)];
  let tpl;
  if (ref.never) tpl = t.share.never;
  else if (key === 'fresh') tpl = t.share.fresh;
  else if (p.years >= 15) tpl = t.share.long;
  else tpl = t.share.normal;
  const vars = {
    name, url, years: fmtNum(p.years), days: fmtNum(p.totalDays),
    comp: ref.win ? compName(comps, ref.win) : '', date: ref.win ? fmtDate(ref.win.d, ref.win.approx) : '',
  };
  return `${fill(tpl, vars)}\n${roast}`;
}

export function compareLine(a, b, mode, ctx) {
  const { t, comps, now = new Date() } = ctx;
  const ra = reference(a, mode, comps), rb = reference(b, mode, comps);
  const da = diffParts(ra.date, now).totalDays, db = diffParts(rb.date, now).totalDays;
  // Nooit gewonnen is altijd erger.
  const aWorse = (ra.never && !rb.never) || (ra.never === rb.never && da > db);
  if (!ra.never && !rb.never && da === db) return { line: t.sameLine, worse: null, ra, rb, da, db };
  const worse = aWorse ? a : b, better = aWorse ? b : a;
  const diff = fmtNum(Math.abs(da - db));
  return {
    line: fill(t.diffLine, { a: shortName(worse), b: shortName(better), diff }),
    verdict: fill(t.verdict, { a: shortName(worse) }),
    worse, ra, rb, da, db,
  };
}
