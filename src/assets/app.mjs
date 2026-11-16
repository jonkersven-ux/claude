import { TEAMS, COMPS, RIVALRIES, META } from './data.mjs';
import { T, NATION_EN, COUNTRY } from './i18n.mjs';
import {
  reference, diffParts, statusKey, modesFor, isNation, teamName, shortName, lastWin,
  fmtNum, fmtDate, fill, ranking, facts, shareText, compareLine, parseDate,
} from './core.mjs';

const body = document.body;
const ROOT = body.dataset.root || './';
const PREVIEW = body.dataset.preview === '1';
const app = document.getElementById('app');
const byId = Object.fromEntries(TEAMS.map((t) => [t.id, t]));
const params = new URLSearchParams(location.search);

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* geen opslag */ } },
};

let lang = store.get('nt-lang') || ((navigator.language || 'nl').toLowerCase().startsWith('nl') ? 'nl' : 'en');
let t = T[lang];
const ctx = () => ({ t, lang, comps: COMPS, teams: TEAMS, NATION_EN });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const name = (tm) => teamName(tm, lang, NATION_EN);
const short = (tm) => shortName(tm, lang, NATION_EN);
const compName = (w) => COMPS[w.c][lang];
const link = (path) => `${ROOT}${path}${path && PREVIEW ? 'index.html' : ''}`;
const teamLink = (id) => link(`${id}/`);
const pairSlug = (a, b) => RIVALRIES.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
const compareLink = (a, b) => {
  const r = pairSlug(a, b);
  return r ? link(`${r.a}-vs-${r.b}/`) : `${link('vs/')}?a=${a}&b=${b}`;
};
const shareUrl = (path) => `${META.siteUrl}/${path}`;

// ---------- kleuren ----------
function lum(hex) {
  const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
function scarfVars(tm) {
  const [c1, c2] = tm.colors;
  const fg = contrast(c1, c2) >= 3 ? c2 : (lum(c1) > 0.4 ? '#12161C' : '#FFFFFF');
  return `--c1:${c1};--c2:${c2};--cfg:${fg}`;
}

// ---------- mode ----------
function getMode(tm) {
  const m = params.get('m') || store.get('nt-mode') || 'all';
  return tm && !modesFor(tm).includes(m) ? 'all' : m;
}
function setMode(m) {
  store.set('nt-mode', m);
  const u = new URL(location.href);
  if (m === 'all') u.searchParams.delete('m'); else u.searchParams.set('m', m);
  history.replaceState(null, '', u);
  params.set('m', m);
  render();
}
function modeSwitch(tm, mode, nationOnly = false) {
  const modes = tm ? modesFor(tm) : (nationOnly ? ['all', 'real'] : ['all', 'real', 'league', 'intl']);
  const labels = tm && isNation(tm) ? t.modesNation : t.modes;
  return `<div class="modes" role="group" aria-label="${esc(t.modes.all)}">${modes.map((m) =>
    `<button type="button" class="mode${m === mode ? ' on' : ''}" data-mode="${m}" aria-pressed="${m === mode}">${esc(labels[m])}</button>`).join('')}</div>
    <p class="mode-help">${esc(t.modeHelp[mode] || '')}</p>`;
}

// ---------- teller ----------
function counterHtml(ref, size = 'xl') {
  return `<div class="counter counter-${size}" data-from="${ref.date.getTime()}">
    ${['years', 'days', 'hours', 'minutes', 'seconds'].map((u) =>
    `<div class="cell cell-${u}"><span class="num" data-u="${u}">0</span><span class="unit">${esc(t.unit[u])}</span></div>`).join('')}
  </div>`;
}
function tick() {
  const now = new Date();
  document.querySelectorAll('[data-from]').forEach((el) => {
    const p = diffParts(new Date(Number(el.dataset.from)), now);
    el.querySelectorAll('[data-u]').forEach((n) => {
      const u = n.dataset.u;
      const v = p[u];
      n.textContent = (u === 'hours' || u === 'minutes' || u === 'seconds') ? String(v).padStart(2, '0') : fmtNum(v, lang);
    });
  });
  document.querySelectorAll('[data-days-from]').forEach((el) => {
    el.textContent = fmtNum(diffParts(new Date(Number(el.dataset.daysFrom)), now).totalDays, lang);
  });
}

const statusChip = (ref) => { const k = statusKey(ref); return `<span class="chip st-${k}">${esc(t.status[k])}</span>`; };

// ---------- delen ----------
function shareBlock(text, url, label) {
  const enc = encodeURIComponent;
  return `<section class="share" aria-label="${esc(label)}">
    <h2 class="h-sec">${esc(label)}</h2>
    <a class="btn btn-wa" href="https://wa.me/?text=${enc(text)}" target="_blank" rel="noopener">${waIcon}<span>${esc(t.shareWhatsApp)}</span></a>
    <div class="share-row">
      <a class="btn btn-ghost" href="https://twitter.com/intent/tweet?text=${enc(text)}" target="_blank" rel="noopener">${esc(t.shareX)}</a>
      <a class="btn btn-ghost" href="https://t.me/share/url?url=${enc(url)}&text=${enc(text.replace(url, '').trim())}" target="_blank" rel="noopener">${esc(t.shareTelegram)}</a>
      <a class="btn btn-ghost" href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}" target="_blank" rel="noopener">${esc(t.shareFacebook)}</a>
      <button type="button" class="btn btn-ghost" data-copy="${esc(text)}">${esc(t.shareCopy)}</button>
      ${navigator.share ? `<button type="button" class="btn btn-ghost" data-native="${esc(text)}" data-url="${esc(url)}">${esc(t.shareMore)}</button>` : ''}
    </div>
    <p class="share-preview">${esc(text)}</p>
  </section>`;
}
const waIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>';

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

// ---------- teampagina ----------
function renderTeam(id) {
  const tm = byId[id];
  if (!tm) return renderHome();
  const mode = getMode(tm);
  const ref = reference(tm, mode, COMPS);
  const p = diffParts(ref.date);
  const nm = name(tm);
  document.documentElement.lang = lang;
  document.title = ref.never ? `${nm} · NoTrophy` : `${nm}: ${fmtNum(p.totalDays, lang)} ${t.unit.days} · NoTrophy`;
  const url = shareUrl(tm.id + (mode !== 'all' ? `?m=${mode}` : ''));
  const shareTxt = shareText(tm, mode, ctx(), url);

  const head = ref.never
    ? `<p class="kicker">${esc(nm)}</p><h1 class="headline">${esc(t.neverHeadline)}</h1>`
    : `<h1 class="headline"><span class="hl-name">${esc(nm)}</span> ${esc(t.waitingFor)}</h1>`;
  const tail = ref.never
    ? `<p class="sub">${esc(fill(isNation(tm) ? t.neverSubNation : t.neverSub, { year: tm.founded.slice(0, 4) }))}</p>`
    : `<p class="sub">${esc(t.onAPrize)} · <span data-days-from="${ref.date.getTime()}"></span> ${esc(t.unit.days)}</p>`;

  const last = ref.win ? `<section class="last">
      <h2 class="h-sec">${esc(t.lastPrize)}</h2>
      <p class="last-comp">${esc(compName(ref.win))}${ref.win.s ? ` <span class="season">${esc(ref.win.s)}</span>` : ''}</p>
      <p class="last-date">${esc(fmtDate(ref.win.d, lang, ref.win.approx))}${ref.win.approx ? ` <span class="approx">(${esc(t.approx)})</span>` : ''}</p>
      <p class="last-match">${esc(ref.win.m)}</p>
    </section>` : '';

  const comps = [...tm.wins].sort((a, b) => (a.d < b.d ? 1 : -1));
  const table = comps.length ? `<section class="percomp">
      <h2 class="h-sec">${esc(t.perComp)}</h2>
      <ul class="rows">${comps.map((w) => `<li class="row${ref.win && w === ref.win ? ' row-hit' : ''}">
        <span class="r-comp">${esc(compName(w))}</span>
        <span class="r-date">${esc(fmtDate(w.d, lang, w.approx))}</span>
        <span class="r-days"><span data-days-from="${parseDate(w.d).getTime()}"></span> ${esc(t.unit.days)}</span>
      </li>`).join('')}</ul>
    </section>` : '';

  const rivals = (tm.rivals || []).map((r) => byId[r]).filter(Boolean);
  const rivalsHtml = rivals.length ? `<section class="rivals">
      <h2 class="h-sec">${esc(t.rivalsTitle)}</h2>
      <div class="rival-list">${rivals.map((r) => {
        const rr = reference(r, 'all', COMPS);
        return `<a class="rival" href="${compareLink(tm.id, r.id)}" style="${scarfVars(r)}">
          <span class="dot" aria-hidden="true"></span><span class="rv-name">${esc(short(tm))} vs ${esc(short(r))}</span>
          <span class="rv-days">${rr.never ? esc(t.never) : `<span data-days-from="${rr.date.getTime()}"></span> d`}</span></a>`;
      }).join('')}</div>
    </section>` : '';

  const factList = facts(ref, tm, ctx());

  app.innerHTML = `
    <a class="back" href="${link('')}">← ${esc(t.backHome)}</a>
    <section class="scarf" style="${scarfVars(tm)}" aria-hidden="true"><span class="scarf-name">${esc(short(tm))}</span></section>
    <section class="hero-team">
      ${head}
      ${counterHtml(ref)}
      ${tail}
      <div class="status-line">${statusChip(ref)}</div>
      ${modeSwitch(tm, mode)}
    </section>
    <div class="grid-2">
      <div class="col">${last}${shareBlock(shareTxt, url, fill(t.shareTitle, { name: short(tm) }))}</div>
      <div class="col">
        <section class="facts"><h2 class="h-sec">${esc(t.since)}</h2><ul>${factList.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></section>
        ${table}${rivalsHtml}
      </div>
    </div>`;
}

// ---------- vergelijken ----------
function teamOptions(sel) {
  const groups = {};
  for (const tm of TEAMS) (groups[tm.country] ||= []).push(tm);
  return Object.entries(groups).map(([c, list]) => `<optgroup label="${esc(COUNTRY[lang][c])}">${list
    .map((tm) => `<option value="${tm.id}"${tm.id === sel ? ' selected' : ''}>${esc(name(tm))}</option>`).join('')}</optgroup>`).join('');
}
function renderCompare() {
  const a = byId[body.dataset.a || params.get('a')] || byId.ajax;
  const b = byId[body.dataset.b || params.get('b')] || byId.feyenoord;
  const bothClubs = !isNation(a) && !isNation(b);
  let mode = getMode();
  if (!bothClubs && !['all', 'real'].includes(mode)) mode = 'all';
  const res = compareLine(a, b, mode, ctx());
  const r = pairSlug(a.id, b.id);
  const url = r ? shareUrl(`${r.a}-vs-${r.b}`) : shareUrl(`vs/?a=${a.id}&b=${b.id}`);
  const txt = fill(t.share.compare, { a: name(a), b: name(b), line: res.line, url });
  document.title = `${name(a)} vs ${name(b)} · NoTrophy`;
  document.documentElement.lang = lang;

  const side = (tm, ref) => `<div class="vs-side${res.worse === tm ? ' worse' : ''}" style="${scarfVars(tm)}">
      <div class="scarf scarf-sm" aria-hidden="true"><span class="scarf-name">${esc(short(tm))}</span></div>
      <a class="vs-name" href="${teamLink(tm.id)}">${esc(name(tm))}</a>
      ${counterHtml(ref, 'md')}
      <p class="vs-last">${ref.never ? esc(t.neverHeadline) : `${esc(compName(ref.win))} · ${esc(fmtDate(ref.win.d, lang, ref.win.approx))}`}</p>
      ${statusChip(ref)}
    </div>`;

  app.innerHTML = `
    <section class="hero-compare">
      ${r ? `<p class="kicker">${esc(r[lang])}</p>` : ''}
      <h1 class="headline">${esc(t.compareTitle)}</h1>
      <form class="pickers" id="pickers">
        <label class="sr" for="pick-a">${esc(t.comparePick)} 1</label>
        <select id="pick-a">${teamOptions(a.id)}</select>
        <span class="vs-word">${esc(t.vs)}</span>
        <label class="sr" for="pick-b">${esc(t.comparePick)} 2</label>
        <select id="pick-b">${teamOptions(b.id)}</select>
      </form>
      ${modeSwitch(bothClubs ? a : null, mode, !bothClubs)}
    </section>
    <section class="vs-grid">${side(a, res.ra)}${side(b, res.rb)}</section>
    <section class="verdict"><p class="verdict-line">${esc(res.line)}</p>${res.verdict ? `<p class="verdict-sub">${esc(res.verdict)}</p>` : ''}</section>
    ${shareBlock(txt, url, t.shareTitle.replace('{name}', `${short(a)}/${short(b)}`))}`;

  const go = () => {
    const na = document.getElementById('pick-a').value, nb = document.getElementById('pick-b').value;
    location.href = compareLink(na, nb) + (mode !== 'all' ? `${compareLink(na, nb).includes('?') ? '&' : '?'}m=${mode}` : '');
  };
  document.getElementById('pick-a').addEventListener('change', go);
  document.getElementById('pick-b').addEventListener('change', go);
}

// ---------- home ----------
let homeFilter = 'ALL';
function norm(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
const ALIASES = { spurs: 'tottenham', 'man u': 'man-utd', united: 'man-utd', city: 'man-city', barca: 'barcelona', oranje: 'nederland', 'rode duivels': 'belgie', 'three lions': 'engeland', gae: 'go-ahead-eagles', 'de kuip': 'feyenoord', psv: 'psv', om: 'marseille', bvb: 'dortmund', 'die mannschaft': 'duitsland' };
function search(q) {
  const n = norm(q.trim());
  if (!n) return [];
  const hits = TEAMS.filter((tm) => [tm.name, tm.short || '', tm.id, NATION_EN[tm.id] || ''].some((s) => norm(s).includes(n)));
  for (const [k, id] of Object.entries(ALIASES)) if (k.startsWith(n) && !hits.includes(byId[id])) hits.push(byId[id]);
  return hits.slice(0, 8);
}

function rankRow(item, i) {
  const tm = item.team;
  return `<li><a class="rank" href="${teamLink(tm.id)}" style="${scarfVars(tm)}">
    <span class="rk-pos">${i + 1}</span><span class="dot" aria-hidden="true"></span>
    <span class="rk-name">${esc(name(tm))}</span>
    <span class="rk-meta">${item.ref.never ? esc(t.never) : esc(fmtDate(item.ref.win.d, lang, item.ref.win.approx))}</span>
    <span class="rk-days">${item.ref.never ? `${fmtNum(diffParts(item.ref.date).years, lang)} ${esc(t.unit.years)}` : `<span data-days-from="${item.ref.date.getTime()}"></span> d`}</span>
  </a></li>`;
}

function renderHome() {
  document.documentElement.lang = lang;
  document.title = `NoTrophy · ${t.tagline}`;
  const mode = getMode();
  const pool = TEAMS.filter((tm) => homeFilter === 'ALL' || tm.country === homeFilter);
  const rank = ranking(pool, mode, COMPS);
  const dry = rank.filter((x) => !x.ref.never).slice(0, 15);
  const never = ranking(TEAMS, 'all', COMPS).filter((x) => x.ref.never);
  const fresh = ranking(TEAMS, 'all', COMPS).filter((x) => !x.ref.never).reverse().slice(0, 6);
  const featured = RIVALRIES.slice(0, 8);

  app.innerHTML = `
    <section class="hero-home">
      <h1 class="headline headline-home">${esc(t.tagline)}</h1>
      <div class="search">
        <label class="sr" for="q">${esc(t.searchLabel)}</label>
        <input id="q" type="search" autocomplete="off" placeholder="${esc(t.searchPlaceholder)}" aria-controls="q-list">
        <ul id="q-list" class="q-list" role="listbox" hidden></ul>
      </div>
      <div class="quick">${['ajax', 'feyenoord', 'psv', 'twente', 'tottenham', 'real-madrid', 'nederland'].map((id) =>
        `<a class="quick-chip" href="${teamLink(id)}" style="${scarfVars(byId[id])}"><span class="dot" aria-hidden="true"></span>${esc(short(byId[id]))}</a>`).join('')}</div>
    </section>

    <section class="derbies">
      <h2 class="h-big">${esc(t.rivalriesTitle)}</h2>
      <div class="derby-grid">${featured.map((r) => {
        const a = byId[r.a], b = byId[r.b];
        const ra = reference(a, 'all', COMPS), rb = reference(b, 'all', COMPS);
        const cell = (tm, rf) => `<span class="d-team" style="${scarfVars(tm)}"><span class="dot" aria-hidden="true"></span><span class="d-name">${esc(short(tm))}</span><span class="d-days">${rf.never ? esc(t.never) : `<span data-days-from="${rf.date.getTime()}"></span> d`}</span></span>`;
        return `<a class="derby" href="${compareLink(r.a, r.b)}"><span class="d-title">${esc(r[lang])}</span>${cell(a, ra)}${cell(b, rb)}</a>`;
      }).join('')}</div>
    </section>

    <section class="hall">
      <div class="hall-head"><h2 class="h-big">${esc(t.hallTitle)}</h2><p class="muted">${esc(t.hallSub)}</p></div>
      <div class="filters" role="group">${Object.keys(COUNTRY[lang]).map((c) =>
        `<button type="button" class="mode${c === homeFilter ? ' on' : ''}" data-filter="${c}" aria-pressed="${c === homeFilter}">${esc(COUNTRY[lang][c])}</button>`).join('')}</div>
      ${modeSwitch(null, mode, homeFilter === 'INT')}
      <ol class="rank-list">${dry.map(rankRow).join('')}</ol>
    </section>

    <div class="grid-2">
      <section><h2 class="h-big">${esc(t.neverTitle)}</h2><ol class="rank-list">${never.map(rankRow).join('')}</ol></section>
      <section><h2 class="h-big">${esc(t.freshTitle)}</h2><ol class="rank-list">${fresh.map(rankRow).join('')}</ol></section>
    </div>`;

  const q = document.getElementById('q'), list = document.getElementById('q-list');
  let active = -1;
  const draw = () => {
    const hits = search(q.value);
    list.hidden = !q.value.trim();
    active = -1;
    list.innerHTML = hits.length ? hits.map((tm) => {
      const rf = reference(tm, 'all', COMPS);
      return `<li role="option"><a href="${teamLink(tm.id)}" style="${scarfVars(tm)}"><span class="dot" aria-hidden="true"></span><span>${esc(name(tm))}</span><span class="q-days">${rf.never ? esc(t.never) : `${fmtNum(diffParts(rf.date).totalDays, lang)} d`}</span></a></li>`;
    }).join('') : `<li class="q-empty">${esc(t.noResults)}</li>`;
  };
  q.addEventListener('input', draw);
  q.addEventListener('keydown', (e) => {
    const items = [...list.querySelectorAll('a')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      active = Math.max(0, Math.min(items.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
      items.forEach((a, i) => a.classList.toggle('active', i === active));
    } else if (e.key === 'Enter' && items.length) {
      e.preventDefault(); location.href = items[Math.max(0, active)].href;
    }
  });
}

function renderRules() {
  document.documentElement.lang = lang;
  document.title = `${t.rulesTitle} · NoTrophy`;
  app.innerHTML = `<section class="rules"><h1 class="headline">${esc(t.rulesTitle)}</h1>
    <ul>${t.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>`;
}

function renderFoot() {
  const id = body.dataset.id;
  const subj = encodeURIComponent(`NoTrophy: fout bij ${id || 'de site'}`);
  document.getElementById('foot').innerHTML = `
    <p class="muted">${esc(fill(t.dataNote, { date: fmtDate(META.verifiedAt, lang) }))}</p>
    <p class="foot-links"><a href="${link('regels/')}">${esc(t.rulesLink)}</a>
    <span>${esc(t.reportLink)}: <a href="mailto:${META.reportEmail}?subject=${subj}">${esc(META.reportEmail)}</a></span></p>
    <p class="muted small">NoTrophy is een fanproject en heeft geen band met de genoemde clubs of bonden.</p>`;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t[el.dataset.i18n]; });
  document.getElementById('lang-toggle').textContent = t.lang;
}

function render() {
  const kind = body.dataset.page;
  if (kind === 'team') renderTeam(body.dataset.id);
  else if (kind === 'compare') renderCompare();
  else if (kind === 'rules') renderRules();
  else if (params.get('team') && byId[params.get('team')]) renderTeam(params.get('team'));
  else renderHome();
  renderFoot();
  tick();
}

// ---------- events ----------
document.addEventListener('click', async (e) => {
  const m = e.target.closest('[data-mode]');
  if (m) { setMode(m.dataset.mode); return; }
  const f = e.target.closest('[data-filter]');
  if (f) { homeFilter = f.dataset.filter; render(); return; }
  const c = e.target.closest('[data-copy]');
  if (c) {
    try { await navigator.clipboard.writeText(c.dataset.copy); toast(t.shareCopied); } catch {
      const pre = c.closest('.share').querySelector('.share-preview');
      const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    return;
  }
  const n = e.target.closest('[data-native]');
  if (n) { try { await navigator.share({ text: n.dataset.native, url: n.dataset.url }); } catch { /* geannuleerd */ } return; }
  if (e.target.closest('#lang-toggle')) {
    lang = lang === 'nl' ? 'en' : 'nl'; t = T[lang]; store.set('nt-lang', lang); render();
  }
});

render();
setInterval(tick, 1000);
