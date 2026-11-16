import { TEAMS, COMPS, RIVALRIES, FANBASES, META } from './data.mjs';
import { T as t, LEAGUES, LEAGUE_ORDER } from './i18n.mjs';
import {
  reference, diffParts, statusKey, shortName, compName as cName,
  fmtNum, fmtDate, fill, ranking, facts, shareText, compareLine, parseDate, MODES,
} from './core.mjs';

const body = document.body;
const ROOT = body.dataset.root || './';
const PREVIEW = body.dataset.preview === '1';
const app = document.getElementById('app');
const byId = Object.fromEntries(TEAMS.map((x) => [x.id, x]));
const params = new URLSearchParams(location.search);

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

const ctx = () => ({ t, comps: COMPS, teams: TEAMS });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const short = (tm) => shortName(tm);
const compName = (w) => cName(COMPS, w);
const link = (path) => `${ROOT}${path}${path && PREVIEW ? 'index.html' : ''}`;
const teamLink = (id) => link(`${id}/`);
const pairSlug = (a, b) => RIVALRIES.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a));
const compareLink = (a, b) => {
  const r = pairSlug(a, b);
  return r ? link(`${r.a}-vs-${r.b}/`) : `${link('vs/')}?a=${a}&b=${b}`;
};
const shareUrl = (path) => `${META.siteUrl}/${path}`;

// ---------- colours ----------
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
function getMode() {
  const m = params.get('m') || store.get('nt-mode') || 'all';
  return MODES.includes(m) ? m : 'all';
}
function setMode(m) {
  store.set('nt-mode', m);
  const u = new URL(location.href);
  if (m === 'all') u.searchParams.delete('m'); else u.searchParams.set('m', m);
  history.replaceState(null, '', u);
  params.set('m', m);
  render();
}
function modeSwitch(mode) {
  return `<div class="modes" role="group" aria-label="${esc(t.modesLabel)}">${MODES.map((m) =>
    `<button type="button" class="mode${m === mode ? ' on' : ''}" data-mode="${m}" aria-pressed="${m === mode}">${esc(t.modes[m])}</button>`).join('')}</div>
    <p class="mode-help">${esc(t.modeHelp[mode])}</p>`;
}

// ---------- counter ----------
function counterHtml(ref, size = 'xl') {
  // Only the year is known: show whole years, no fake precision in days and seconds.
  if (ref.approx) {
    return `<div class="counter counter-${size} counter-years" data-from="${ref.date.getTime()}">
      <div class="cell cell-years"><span class="num" data-u="years">0</span><span class="unit">${esc(t.unit.years)}</span></div></div>`;
  }
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
      n.textContent = (u === 'hours' || u === 'minutes' || u === 'seconds') ? String(p[u]).padStart(2, '0') : fmtNum(p[u]);
    });
  });
  document.querySelectorAll('[data-days-from]').forEach((el) => {
    el.textContent = fmtNum(diffParts(new Date(Number(el.dataset.daysFrom)), now).totalDays);
  });
}

const statusChip = (ref) => { const k = statusKey(ref); return `<span class="chip st-${k}">${esc(t.status[k])}</span>`; };
const daysOrNever = (ref) => (ref.never ? esc(t.never) : `<span data-days-from="${ref.date.getTime()}"></span> d`);

// ---------- sharing ----------
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

// ---------- club page ----------
function renderTeam(id) {
  const tm = byId[id];
  if (!tm) return renderHome();
  const mode = getMode();
  const ref = reference(tm, mode, COMPS);
  const p = diffParts(ref.date);
  document.title = ref.never ? `${tm.name} · NoTrophy` : `${tm.name}: ${fmtNum(p.totalDays)} days without a trophy · NoTrophy`;
  const url = shareUrl(tm.id + (mode !== 'all' ? `?m=${mode}` : ''));
  const shareTxt = shareText(tm, mode, ctx(), url);

  const head = ref.never
    ? `<p class="kicker">${esc(tm.name)} · ${esc(tm.league)}</p><h1 class="headline">${esc(t.neverHeadline)}</h1>`
    : `<p class="kicker">${esc(tm.league)}</p><h1 class="headline"><span class="hl-name">${esc(tm.name)}</span> ${esc(t.waitingFor)}</h1>`;
  const tail = ref.never
    ? `<p class="sub">${esc(fill(t.neverSub, { year: tm.founded.slice(0, 4) }))}</p>`
    : `<p class="sub">${esc(t.onAPrize)}${ref.approx ? '' : ` · <span data-days-from="${ref.date.getTime()}"></span> ${esc(t.unit.days)}`}</p>`;

  const last = ref.win ? `<section class="last">
      <h2 class="h-sec">${esc(t.lastPrize)}</h2>
      <p class="last-comp">${esc(compName(ref.win))}${ref.win.s ? ` <span class="season">${esc(ref.win.s)}</span>` : ''}</p>
      <p class="last-date">${esc(fmtDate(ref.win.d, ref.win.approx))}${ref.win.approx ? ` <span class="approx">(${esc(t.approx)})</span>` : ''}</p>
      <p class="last-match">${esc(ref.win.m)}</p>
    </section>` : '';

  const wins = [...tm.wins].sort((a, b) => (a.d < b.d ? 1 : -1));
  const table = wins.length ? `<section class="percomp">
      <h2 class="h-sec">${esc(t.perComp)}</h2>
      <ul class="rows">${wins.map((w) => `<li class="row${ref.win && w === ref.win ? ' row-hit' : ''}">
        <span class="r-comp">${esc(compName(w))}</span>
        <span class="r-date">${esc(fmtDate(w.d, w.approx))}</span>
        <span class="r-days"><span data-days-from="${parseDate(w.d).getTime()}"></span> ${esc(t.unit.days)}</span>
      </li>`).join('')}</ul>
    </section>` : '';

  const rivals = (tm.rivals || []).map((r) => byId[r]).filter(Boolean);
  const rivalsHtml = rivals.length ? `<section class="rivals">
      <h2 class="h-sec">${esc(t.rivalsTitle)}</h2>
      <div class="rival-list">${rivals.map((r) => `<a class="rival" href="${compareLink(tm.id, r.id)}" style="${scarfVars(r)}">
          <span class="dot" aria-hidden="true"></span><span class="rv-name">${esc(short(tm))} vs ${esc(short(r))}</span>
          <span class="rv-days">${daysOrNever(reference(r, 'all', COMPS))}</span></a>`).join('')}</div>
    </section>` : '';

  app.innerHTML = `
    <a class="back" href="${link('')}">← ${esc(t.backHome)}</a>
    <section class="scarf" style="${scarfVars(tm)}" aria-hidden="true"><span class="scarf-name">${esc(short(tm))}</span></section>
    <section class="hero-team">
      ${head}
      ${counterHtml(ref)}
      ${tail}
      <div class="status-line">${statusChip(ref)}</div>
      ${modeSwitch(mode)}
    </section>
    <div class="grid-2">
      <div class="col">${last}${shareBlock(shareTxt, url, fill(t.shareTitle, { name: short(tm) }))}</div>
      <div class="col">
        <section class="facts"><h2 class="h-sec">${esc(t.since)}</h2><ul>${facts(ref, tm, ctx()).map((f) => `<li>${esc(f)}</li>`).join('')}</ul></section>
        ${table}${rivalsHtml}
      </div>
    </div>`;
}

// ---------- compare ----------
function teamOptions(sel) {
  return LEAGUE_ORDER.map((c) => `<optgroup label="${esc(LEAGUES[c])}">${TEAMS.filter((x) => x.country === c)
    .map((tm) => `<option value="${tm.id}"${tm.id === sel ? ' selected' : ''}>${esc(tm.name)}</option>`).join('')}</optgroup>`).join('');
}
function renderCompare() {
  const a = byId[body.dataset.a || params.get('a')] || byId['real-madrid'];
  const b = byId[body.dataset.b || params.get('b')] || byId.barcelona;
  const mode = getMode();
  const res = compareLine(a, b, mode, ctx());
  const r = pairSlug(a.id, b.id);
  const url = r ? shareUrl(`${r.a}-vs-${r.b}`) : shareUrl(`vs/?a=${a.id}&b=${b.id}`);
  const txt = fill(t.share.compare, { a: a.name, b: b.name, line: res.line, url });
  document.title = `${a.name} vs ${b.name} · NoTrophy`;

  const side = (tm, ref) => `<div class="vs-side${res.worse === tm ? ' worse' : ''}" style="${scarfVars(tm)}">
      <div class="scarf scarf-sm" aria-hidden="true"><span class="scarf-name">${esc(short(tm))}</span></div>
      <a class="vs-name" href="${teamLink(tm.id)}">${esc(tm.name)}</a>
      ${counterHtml(ref, 'md')}
      <p class="vs-last">${ref.never ? esc(t.neverHeadline) : `${esc(compName(ref.win))} · ${esc(fmtDate(ref.win.d, ref.win.approx))}`}</p>
      ${statusChip(ref)}
    </div>`;

  app.innerHTML = `
    <section class="hero-compare">
      ${r ? `<p class="kicker">${esc(r.name)}</p>` : ''}
      <h1 class="headline">${esc(t.compareTitle)}</h1>
      <form class="pickers" id="pickers">
        <label class="sr" for="pick-a">${esc(t.comparePick)} 1</label>
        <select id="pick-a">${teamOptions(a.id)}</select>
        <span class="vs-word">${esc(t.vs)}</span>
        <label class="sr" for="pick-b">${esc(t.comparePick)} 2</label>
        <select id="pick-b">${teamOptions(b.id)}</select>
      </form>
      ${modeSwitch(mode)}
    </section>
    <section class="vs-grid">${side(a, res.ra)}${side(b, res.rb)}</section>
    <section class="verdict"><p class="verdict-line">${esc(res.line)}</p>${res.verdict ? `<p class="verdict-sub">${esc(res.verdict)}</p>` : ''}</section>
    ${shareBlock(txt, url, fill(t.shareTitle, { name: `${short(a)}/${short(b)}` }))}`;

  const go = () => {
    const na = document.getElementById('pick-a').value, nb = document.getElementById('pick-b').value;
    const to = compareLink(na, nb);
    location.href = to + (mode !== 'all' ? `${to.includes('?') ? '&' : '?'}m=${mode}` : '');
  };
  document.getElementById('pick-a').addEventListener('change', go);
  document.getElementById('pick-b').addEventListener('change', go);
}

// ---------- home ----------
let homeFilter = 'ALL';
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ALIASES = {
  spurs: 'tottenham', 'man u': 'man-utd', 'man utd': 'man-utd', united: 'man-utd', city: 'man-city', barca: 'barcelona', blancos: 'real-madrid',
  gunners: 'arsenal', reds: 'liverpool', toffees: 'everton', magpies: 'newcastle', villans: 'aston-villa', blues: 'chelsea',
  'atleti': 'atletico', 'juve': 'juventus', 'nerazzurri': 'inter', 'rossoneri': 'milan', 'bvb': 'dortmund', 'fcb': 'bayern',
  'om': 'marseille', 'ol': 'lyon', 'gae': 'go-ahead-eagles', 'kuip': 'feyenoord',
};
function search(q) {
  const n = norm(q.trim());
  if (!n) return [];
  const hits = TEAMS.filter((tm) => [tm.name, tm.short || '', tm.id].some((s) => norm(s).includes(n)));
  for (const [k, id] of Object.entries(ALIASES)) if (k.startsWith(n) && byId[id] && !hits.includes(byId[id])) hits.push(byId[id]);
  return hits.slice(0, 8);
}

function rankRow(item, i) {
  const tm = item.team;
  return `<li><a class="rank" href="${teamLink(tm.id)}" style="${scarfVars(tm)}">
    <span class="rk-pos">${i + 1}</span><span class="dot" aria-hidden="true"></span>
    <span class="rk-name">${esc(tm.name)}</span>
    <span class="rk-meta">${item.ref.never ? `${esc(tm.league)} · ${esc(t.never)}` : `${esc(tm.league)} · ${esc(fmtDate(item.ref.win.d, item.ref.win.approx))}`}</span>
    <span class="rk-days">${item.ref.never ? `${fmtNum(diffParts(item.ref.date).years)} ${esc(t.unit.years)}` : `<span data-days-from="${item.ref.date.getTime()}"></span> d`}</span>
  </a></li>`;
}

function fanCard(id, mode) {
  const tm = byId[id];
  const ref = reference(tm, mode, COMPS);
  return `<a class="fan" href="${teamLink(tm.id)}${mode !== 'all' ? `?m=${mode}` : ''}" style="${scarfVars(tm)}">
    <span class="fan-band" aria-hidden="true"></span>
    <span class="fan-name">${esc(tm.name)}</span>
    <span class="fan-days">${ref.never ? esc(t.never) : `<span data-days-from="${ref.date.getTime()}"></span>`}<small>${ref.never ? '' : ` ${esc(t.unit.days)}`}</small></span>
    <span class="fan-meta">${ref.never ? '' : `${esc(compName(ref.win))} · ${esc(fmtDate(ref.win.d, ref.win.approx))}`}</span>
    ${statusChip(ref)}
  </a>`;
}

function renderHome() {
  document.title = `NoTrophy · ${t.tagline}`;
  const mode = getMode();
  const pool = TEAMS.filter((tm) => homeFilter === 'ALL' || tm.country === homeFilter);
  const dry = ranking(pool, mode, COMPS).filter((x) => !x.ref.never).slice(0, 15);
  const all = ranking(TEAMS, 'all', COMPS);
  const never = all.filter((x) => x.ref.never);
  const fresh = all.filter((x) => !x.ref.never).reverse().slice(0, 8);

  app.innerHTML = `
    <section class="hero-home">
      <h1 class="headline headline-home">${esc(t.tagline)}</h1>
      <div class="search">
        <label class="sr" for="q">${esc(t.searchLabel)}</label>
        <input id="q" type="search" autocomplete="off" placeholder="${esc(t.searchPlaceholder)}" aria-controls="q-list">
        <ul id="q-list" class="q-list" role="listbox" hidden></ul>
      </div>
    </section>

    <section class="fans">
      <div class="hall-head"><h2 class="h-big">${esc(t.fansTitle)}</h2><p class="muted">${esc(t.fansSub)}</p></div>
      ${modeSwitch(mode)}
      <div class="fan-grid">${FANBASES.filter((id) => byId[id]).map((id) => fanCard(id, mode)).join('')}</div>
    </section>

    <section class="derbies">
      <h2 class="h-big">${esc(t.rivalriesTitle)}</h2>
      <div class="derby-grid">${RIVALRIES.map((r) => {
        const a = byId[r.a], b = byId[r.b];
        const cell = (tm) => `<span class="d-team" style="${scarfVars(tm)}"><span class="dot" aria-hidden="true"></span><span class="d-name">${esc(short(tm))}</span><span class="d-days">${daysOrNever(reference(tm, 'all', COMPS))}</span></span>`;
        return `<a class="derby" href="${compareLink(r.a, r.b)}"><span class="d-title">${esc(r.name)}</span>${cell(a)}${cell(b)}</a>`;
      }).join('')}</div>
    </section>

    <section class="hall">
      <div class="hall-head"><h2 class="h-big">${esc(t.hallTitle)}</h2><p class="muted">${esc(t.hallSub)}</p></div>
      <div class="filters" role="group" aria-label="League">${['ALL', ...LEAGUE_ORDER].map((c) =>
        `<button type="button" class="mode${c === homeFilter ? ' on' : ''}" data-filter="${c}" aria-pressed="${c === homeFilter}">${esc(LEAGUES[c])}</button>`).join('')}</div>
      <ol class="rank-list">${dry.map(rankRow).join('')}</ol>
    </section>

    <div class="grid-2">
      <section><h2 class="h-big">${esc(t.neverTitle)}</h2><ol class="rank-list">${never.map(rankRow).join('')}</ol></section>
      <section><h2 class="h-big">${esc(t.freshTitle)}</h2><ol class="rank-list">${fresh.map(rankRow).join('')}</ol></section>
    </div>`;

  const q = document.getElementById('q'), list = document.getElementById('q-list');
  let active = -1;
  q.addEventListener('input', () => {
    const hits = search(q.value);
    list.hidden = !q.value.trim();
    active = -1;
    list.innerHTML = hits.length ? hits.map((tm) => `<li role="option"><a href="${teamLink(tm.id)}" style="${scarfVars(tm)}"><span class="dot" aria-hidden="true"></span><span>${esc(tm.name)}</span><span class="q-days">${(() => { const rf = reference(tm, 'all', COMPS); return rf.never ? esc(t.never) : `${fmtNum(diffParts(rf.date).totalDays)} d`; })()}</span></a></li>`).join('')
      : `<li class="q-empty">${esc(t.noResults)}</li>`;
  });
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
  document.title = `${t.rulesTitle} · NoTrophy`;
  app.innerHTML = `<section class="rules"><h1 class="headline">${esc(t.rulesTitle)}</h1>
    <ul>${t.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>`;
}

function renderFoot() {
  const id = body.dataset.id;
  const subj = encodeURIComponent(`NoTrophy: mistake on ${id || 'the site'}`);
  document.getElementById('foot').innerHTML = `
    <p class="muted">${esc(fill(t.dataNote, { date: fmtDate(META.verifiedAt) }))}</p>
    <p class="foot-links"><a href="${link('rules/')}">${esc(t.rulesLink)}</a>
    <span>${esc(t.reportLink)}: <a href="mailto:${META.reportEmail}?subject=${subj}">${esc(META.reportEmail)}</a></span></p>
    <p class="muted small">NoTrophy is an independent fan project and is not affiliated with any club, league or federation.</p>`;
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
  if (n) { try { await navigator.share({ text: n.dataset.native, url: n.dataset.url }); } catch { /* cancelled */ } }
});

render();
setInterval(tick, 1000);
