/* =========================================================================
   DataPath - study & career tracker.  Vanilla JS, no network, no eval.
   - All dynamic text goes through esc(); no inline handlers (strict CSP).
   - Data lives only in this browser (localStorage) + JSON export/import.
   ========================================================================= */
(function () {
  "use strict";

  const C = window.CURRICULUM;
  const KEY = "datapath.v1";
  const RIDX = { A: 0, S: 1, M: 2 };
  const ROLE_SHORT = { A: "Analyst", S: "Scientist", M: "ML Eng" };
  const STATUS = { todo: "Not started", doing: "In progress", done: "Completed", revisit: "Needs revisit" };
  const LEVEL = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
  const JOB_STAGES = ["Wishlist", "Applied", "Screening", "Interview", "Offer", "Rejected"];
  const PROJ_STAGES = ["Idea", "Building", "Done", "Published"];
  const NOTE_TAGS = ["General", "Interview", "Mistakes", "Cheatsheet", "Ideas"];
  const COLOR_NAMES = ["Green", "Amber", "Blue", "Pink", "Teal", "Violet", "Red", "Slate", "Brown", "Emerald"];
  const ID_RE = /^[A-Za-z0-9_.:-]{1,80}$/;
  const BAD_KEYS = new Set(["__proto__", "constructor", "prototype"]);

  /* ------------------------------------------------------------ helpers */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = (n) => String(n).padStart(2, "0");
  const dkey = (d) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  const today = () => dkey(new Date());
  const pd = (s) => { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const daysBetween = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
  const fmtDate = (s) => (s ? pd(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
  const fmtMins = (m) => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? h + "h" + (r ? " " + r + "m" : "") : r + "m"; };
  const nd = (n) => n + (n === 1 ? " day" : " days");
  const fmtH = (m) => +(m / 60).toFixed(1) + "h";
  const safeUrl = (u) => { try { const x = new URL(String(u).trim()); return x.protocol === "https:" || x.protocol === "http:" ? x.href : ""; } catch (e) { return ""; } };
  const opts = (list, cur) => list.map((o) => { const v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return `<option value="${esc(v)}"${String(v) === String(cur) ? " selected" : ""}>${esc(l)}</option>`; }).join("");

  /* -------------------------------------------------------------- state */
  let memOnly = false;
  function defaults() {
    return { v: 1, profile: { name: "Yogesh Mohite", role: "A", target: "", goal: 2, planStart: today() }, theme: "auto", progress: {}, custom: { tracks: [], topics: [] }, log: [], qs: {}, myqs: [], projects: [], jobs: [], notes: [], timer: null };
  }
  const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");
  const num = (v, lo, hi, def) => { v = Number(v); return Number.isFinite(v) ? clamp(v, lo, hi) : def; };
  const dstr = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");
  const idOf = (v) => (typeof v === "string" && ID_RE.test(v) && !BAD_KEYS.has(v) ? v : "");
  const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
  function eachKey(o, fn) { if (!o || typeof o !== "object" || Array.isArray(o)) return; Object.keys(o).forEach((k) => { if (!BAD_KEYS.has(k) && ID_RE.test(k)) fn(k, o[k]); }); }
  function cleanSteps(v) { return arr(v, 40).map((s) => str(s, 160)).filter(Boolean); }
  function cleanChecks(v) { const r = {}; if (v && typeof v === "object") Object.keys(v).forEach((i) => { if (/^\d{1,3}$/.test(i) && v[i]) r[i] = 1; }); return r; }

  /* Rebuilds a state object from untrusted JSON, keeping only known, type-checked fields. */
  function sanitize(o) {
    const d = defaults();
    if (!o || typeof o !== "object") return d;
    const p = o.profile && typeof o.profile === "object" ? o.profile : {};
    d.profile = { name: str(p.name, 60) || d.profile.name, role: ["A", "S", "M"].includes(p.role) ? p.role : "A", target: dstr(p.target), goal: num(p.goal, 0.25, 16, 2), planStart: dstr(p.planStart) || today() };
    d.theme = ["auto", "light", "dark"].includes(o.theme) ? o.theme : "auto";
    eachKey(o.progress, (k, v) => {
      if (!v || typeof v !== "object") return;
      d.progress[k] = { s: ["todo", "doing", "done", "revisit"].includes(v.s) ? v.s : "todo", c: cleanChecks(v.c), n: str(v.n, 20000), cf: Math.round(num(v.cf, 0, 5, 0)), at: num(v.at, 0, 4e12, 0), rev: Math.round(num(v.rev, 0, 10, 0)), last: num(v.last, 0, 4e12, 0), u: num(v.u, 0, 4e12, 0) };
    });
    const cu = o.custom && typeof o.custom === "object" ? o.custom : {};
    arr(cu.tracks, 30).forEach((t) => { if (t && idOf(t.id) && str(t.name, 40)) d.custom.tracks.push({ id: t.id, name: str(t.name, 40), icon: str(t.icon, 4) || "📘", c: Math.round(num(t.c, 0, 9, 2)), desc: str(t.desc, 240) }); });
    arr(cu.topics, 400).forEach((t) => {
      if (!t || !idOf(t.id) || !idOf(t.track) || !str(t.title, 100)) return;
      const w = arr(t.w, 3).map((x) => Math.round(num(x, 0, 10, 5))); while (w.length < 3) w.push(5);
      d.custom.topics.push({ id: t.id, track: t.track, title: str(t.title, 100), w: w, h: num(t.h, 0, 500, 5), l: Math.round(num(t.l, 1, 3, 2)), subs: arr(t.subs, 40).map((s) => str(s, 120)).filter(Boolean), tip: str(t.tip, 240) });
    });
    arr(o.log, 6000).forEach((e) => { if (e && dstr(e.d) && idOf(e.id)) d.log.push({ id: e.id, d: e.d, m: Math.round(num(e.m, 1, 1440, 1)), t: idOf(e.t), n: str(e.n, 200) }); });
    eachKey(o.qs, (k, v) => { if (v === "known" || v === "review") d.qs[k] = v; });
    arr(o.myqs, 500).forEach((q) => { if (q && idOf(q.id) && str(q.q, 300)) d.myqs.push({ id: q.id, track: str(q.track, 80), q: str(q.q, 300), a: str(q.a, 3000) }); });
    arr(o.projects, 200).forEach((p2) => { if (p2 && idOf(p2.id) && str(p2.title, 120)) d.projects.push({ id: p2.id, src: str(p2.src, 20), title: str(p2.title, 120), tools: str(p2.tools, 160), desc: str(p2.desc, 500), stage: PROJ_STAGES.includes(p2.stage) ? p2.stage : "Idea", link: safeUrl(p2.link || ""), steps: cleanSteps(p2.steps), done: cleanChecks(p2.done), notes: str(p2.notes, 3000) }); });
    arr(o.jobs, 1000).forEach((j) => { if (j && idOf(j.id) && str(j.company, 100)) d.jobs.push({ id: j.id, company: str(j.company, 100), role: str(j.role, 120), link: safeUrl(j.link || ""), stage: JOB_STAGES.includes(j.stage) ? j.stage : "Wishlist", applied: dstr(j.applied), follow: dstr(j.follow), notes: str(j.notes, 2000) }); });
    arr(o.notes, 1000).forEach((n) => { if (n && idOf(n.id)) d.notes.push({ id: n.id, title: str(n.title, 120), body: str(n.body, 30000), tag: NOTE_TAGS.includes(n.tag) ? n.tag : "General", u: num(n.u, 0, 4e12, 0) }); });
    const t = o.timer;
    if (t && typeof t === "object" && num(t.mins, 1, 600, 0)) {
      d.timer = { run: !!t.run, mins: Math.round(num(t.mins, 1, 600, 25)), topic: idOf(t.topic) };
      if (d.timer.run) d.timer.end = num(t.end, 0, 4e12, 0); else d.timer.left = num(t.left, 0, 36e6, 0);
    }
    return d;
  }

  let state = (function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { memOnly = true; }
    if (!raw) return defaults();
    try { return sanitize(JSON.parse(raw)); } catch (e) {
      try { localStorage.setItem(KEY + ".corrupt", raw); } catch (e2) { /* ignore */ }
      return defaults();
    }
  })();

  let saveTimer = 0;
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 250); }
  function flush() {
    clearTimeout(saveTimer);
    if (memOnly) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { memOnly = true; toast("⚠️ Browser storage unavailable - export a backup from Settings."); }
  }
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });

  /* -------------------------------------------------- curriculum / metrics */
  let _cache = null;
  function build() {
    const tracks = C.TRACKS.map((t) => ({ id: t.id, name: t.name, icon: t.icon, c: t.c, desc: t.desc, res: t.res || [], custom: false, topics: t.topics.map((x) => Object.assign({}, x, { track: t.id })) }));
    const byTrack = {};
    tracks.forEach((t) => { byTrack[t.id] = t; });
    state.custom.tracks.forEach((t) => { const tr = { id: t.id, name: t.name, icon: t.icon, c: t.c, desc: t.desc, res: [], custom: true, topics: [] }; tracks.push(tr); byTrack[t.id] = tr; });
    state.custom.topics.forEach((t) => { const tr = byTrack[t.track]; if (tr) tr.topics.push({ id: t.id, title: t.title, w: t.w, h: t.h, l: t.l, subs: t.subs, tip: t.tip, custom: true, track: t.track }); });
    const topics = {};
    tracks.forEach((t) => t.topics.forEach((x) => { topics[x.id] = x; }));
    _cache = { tracks, byTrack, topics, flat: tracks.flatMap((t) => t.topics) };
    return _cache;
  }
  const cur = () => _cache || build();
  const tracks = () => cur().tracks;
  const flat = () => cur().flat;
  const topicById = (id) => (own(cur().topics, id) ? cur().topics[id] : null);
  const trackById = (id) => (own(cur().byTrack, id) ? cur().byTrack[id] : null);
  const invalidate = () => { _cache = null; };

  const role = () => state.profile.role;
  const W = (t) => t.w[RIDX[role()]];
  const pri = (w) => (w >= 8 ? [3, "Must-have"] : w >= 5 ? [2, "Important"] : w >= 1 ? [1, "Good to have"] : [0, "Optional"]);
  const P = (id) => (own(state.progress, id) ? state.progress[id] : null);
  function ensure(id) {
    if (!own(state.progress, id)) state.progress[id] = { s: "todo", c: {}, n: "", cf: 0, at: 0, rev: 0, last: 0, u: 0 };
    return state.progress[id];
  }
  const status = (t) => { const p = P(t.id); return p ? p.s : "todo"; };
  const isDone = (t) => status(t) === "done";
  function checked(t) {
    const p = P(t.id); if (!p) return 0;
    if (p.s === "done") return t.subs.length;
    let n = 0; for (let i = 0; i < t.subs.length; i++) if (p.c && p.c[i]) n++;
    return n;
  }
  const comp = (t) => (t.subs.length ? checked(t) / t.subs.length : isDone(t) ? 1 : 0);
  function ready(list) { let a = 0, b = 0; list.forEach((t) => { const w = W(t); a += w * comp(t); b += w; }); return b ? (a / b) * 100 : 0; }
  const shareOf = (tr) => { const tot = flat().reduce((s, t) => s + W(t), 0); return tot ? (tr.topics.reduce((s, t) => s + W(t), 0) / tot) * 100 : 0; };
  function revision(t) {
    const p = P(t.id);
    if (!p || p.s !== "done" || !p.at || (p.rev || 0) >= 4) return null;
    const iv = [3, 7, 21, 45][p.rev || 0], days = (Date.now() - (p.last || p.at)) / 864e5;
    return days >= iv ? { due: true, over: days - iv } : { due: false, inDays: Math.ceil(iv - days) };
  }
  function topicMinutes(id) { let m = 0; state.log.forEach((e) => { if (e.t === id) m += e.m; }); return m; }
  function minsByDate() { const m = {}; state.log.forEach((e) => { m[e.d] = (m[e.d] || 0) + e.m; }); return m; }
  function weekMinutes() { const m = minsByDate(); let s = 0; for (let i = 0; i < 7; i++) s += m[dkey(addDays(new Date(), -i))] || 0; return s; }
  function streaks() {
    const m = minsByDate(); let d = new Date(), n = 0;
    if (!m[dkey(d)]) d = addDays(d, -1);
    while (m[dkey(d)]) { n++; d = addDays(d, -1); }
    const keys = Object.keys(m).sort(); let best = 0, run = 0, prev = null;
    keys.forEach((k) => { run = prev && daysBetween(prev, k) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = k; });
    return { cur: n, best: best };
  }
  const levelOf = (p) => (p < 20 ? "Getting started" : p < 40 ? "Building foundations" : p < 60 ? "Intermediate" : p < 80 ? "Almost job-ready" : "Job-ready 🚀");
  function addLog(mins, topic, note, date) {
    state.log.push({ id: uid(), d: date || today(), m: Math.round(clamp(mins, 1, 1440)), t: topic || "", n: str(note || "", 200) });
    if (state.log.length > 6000) state.log.shift();
    save();
  }

  /* ------------------------------------------------------------ ui state */
  const ui = { open: new Set(), tf: { q: "", st: "all", pri: "all", sort: "road" }, pr: { track: "all", f: "todo", i: 0, show: false, mode: "card" }, nq: "", ntag: "all", planRole: "", focus: "", lastRoute: "" };
  const route = () => {
    const raw = location.hash.replace(/^#\/?/, "").split("/").slice(0, 3);
    const p = raw.map((x) => { try { return decodeURIComponent(x); } catch (e) { return ""; } });
    return [p[0] || "dashboard", p[1] || "", p[2] || ""];
  };

  /* --------------------------------------------------------- small views */
  const meter = (pct, cls) => `<div class="meter ${cls || ""}"><i data-w="${clamp(pct, 0, 100).toFixed(1)}"></i></div>`;
  const tcls = (tr) => "tc" + tr.c;
  const chipLink = (href, inner, cls) => `<a class="chip ${cls || ""}" href="${esc(href)}">${inner}</a>`;
  function ring(pct) {
    const C2 = 2 * Math.PI * 54, off = C2 * (1 - clamp(pct, 0, 100) / 100);
    return `<div class="hero-ring" role="img" aria-label="Job readiness ${Math.round(pct)} percent"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="54" fill="none" stroke-width="10"/><circle class="fg" cx="60" cy="60" r="54" fill="none" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C2.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/></svg><div class="num"><b>${Math.round(pct)}%</b><span>job-ready</span></div></div>`;
  }
  const empty = (title, text) => `<div class="empty"><b>${esc(title)}</b>${esc(text)}</div>`;
  const wbar = (w) => `<span class="wbar" data-tip="Industry weightage ${w}/10 for ${esc(C.ROLES[role()])}">${Array.from({ length: 10 }, (_, i) => `<i class="${i < w ? "on" : ""}"></i>`).join("")}</span>`;
  const topicLink = (t) => `#/track/${encodeURIComponent(t.track)}/${encodeURIComponent(t.id)}`;

  function niceMax(v) { const steps = [30, 60, 120, 180, 240, 360, 480, 600, 720, 960]; for (const s of steps) if (v <= s) return s; return Math.ceil(v / 240) * 240; }

  /* 7-day column chart: one hue, today emphasised, hairline grid, goal reference, hover + table view */
  function weekChart() {
    const m = minsByDate(), days = [];
    for (let i = 6; i >= 0; i--) { const d = addDays(new Date(), -i); days.push({ k: dkey(d), lab: d.toLocaleDateString(undefined, { weekday: "short" }), full: d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" }), v: m[dkey(d)] || 0 }); }
    const goal = state.profile.goal * 60, max = niceMax(Math.max(goal, ...days.map((d) => d.v)));
    const Wd = 560, H = 210, pl = 38, pr = 8, pt = 18, pb = 26, iw = Wd - pl - pr, ih = H - pt - pb, slot = iw / 7, bw = Math.min(24, slot * 0.5), r = 4;
    const y = (v) => pt + ih - (v / max) * ih;
    let s = `<svg class="chart" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Study time over the last 7 days">`;
    [0, max / 2, max].forEach((v) => { s += `<line class="${v === 0 ? "axis-l" : "grid-l"}" x1="${pl}" x2="${Wd - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${fmtH(v)}</text>`; });
    days.forEach((d, i) => {
      const x = pl + i * slot + (slot - bw) / 2, h = (d.v / max) * ih, last = i === 6;
      s += `<g><rect class="hit" x="${pl + i * slot}" y="${pt}" width="${slot}" height="${ih}" data-tip="${esc(d.full + ": " + (d.v ? fmtMins(d.v) : "no study logged"))}"/>`;
      if (h > 0) { const hh = Math.max(h, r + 1); s += `<path class="bar ${last ? "hl" : ""}" d="M${x},${pt + ih} V${pt + ih - hh + r} a${r},${r} 0 0 1 ${r},-${r} h${bw - 2 * r} a${r},${r} 0 0 1 ${r},${r} V${pt + ih} Z"/>`; }
      if (last && d.v > 0) s += `<text class="val" x="${x + bw / 2}" y="${pt + ih - h - 6}" text-anchor="middle">${fmtH(d.v)}</text>`;
      s += `<text x="${pl + i * slot + slot / 2}" y="${H - 8}" text-anchor="middle">${esc(d.lab)}</text></g>`;
    });
    s += `<line class="goal" x1="${pl}" x2="${Wd - pr}" y1="${y(goal)}" y2="${y(goal)}"/><text x="${Wd - pr}" y="${y(goal) - 4}" text-anchor="end">Daily goal ${fmtH(goal)}</text></svg>`;
    s += `<details class="tv"><summary>Table view</summary><table><tr><th>Day</th><th>Time</th></tr>${days.map((d) => `<tr><td>${esc(d.full)}</td><td>${d.v ? fmtMins(d.v) : "-"}</td></tr>`).join("")}</table></details>`;
    return s;
  }

  function heatmap(weeks) {
    const m = minsByDate(), end = new Date(), dow = (end.getDay() + 6) % 7, start = addDays(end, -(dow + 7 * (weeks - 1)));
    const cell = 14, gap = 3, left = 30, top = 16, Wd = left + weeks * (cell + gap), H = top + 7 * (cell + gap);
    let s = `<svg class="heat" width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Study activity heatmap, last ${weeks} weeks">`;
    ["Mon", "", "Wed", "", "Fri", "", ""].forEach((l, i) => { if (l) s += `<text x="0" y="${top + i * (cell + gap) + 11}">${l}</text>`; });
    let lastMonth = -1, lastLabel = -10;
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const dt = addDays(start, w * 7 + d); if (dt > end) continue;
        const v = m[dkey(dt)] || 0, lvl = v === 0 ? 0 : v < 30 ? 1 : v < 60 ? 2 : v < 120 ? 3 : 4;
        if (d === 0 && dt.getMonth() !== lastMonth) { lastMonth = dt.getMonth(); if (w - lastLabel >= 3) { lastLabel = w; s += `<text x="${left + w * (cell + gap)}" y="10">${dt.toLocaleDateString(undefined, { month: "short" })}</text>`; } }
        s += `<rect class="c${lvl}" rx="3" x="${left + w * (cell + gap)}" y="${top + d * (cell + gap)}" width="${cell}" height="${cell}" data-tip="${esc(dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) + ": " + (v ? fmtMins(v) : "no study"))}"/>`;
      }
    }
    return `<div class="table-wrap">${s}</svg></div><div class="heat-legend mt-s">Less <i class="c0"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i> More <span class="ml8">(&lt;30m, &lt;1h, &lt;2h, 2h+)</span></div>`;
  }

  /* ============================================================== VIEWS */
  const V = {};

  /* ---------------------------------------------------------- dashboard */
  V.dashboard = function () {
    const all = flat(), R = ready(all), doneN = all.filter(isDone).length, allMin = state.log.reduce((s, e) => s + e.m, 0);
    const st = streaks(), qsAll = allQs(), known = qsAll.filter((q) => state.qs[q.id] === "known").length;
    const apps = state.jobs.filter((j) => j.stage !== "Wishlist").length, ints = state.jobs.filter((j) => j.stage === "Interview" || j.stage === "Offer").length;
    const tdMin = minsByDate()[today()] || 0, goalMin = state.profile.goal * 60;
    const tgt = state.profile.target ? daysBetween(today(), state.profile.target) : null;
    const dayTip = C.TIPS[Math.floor(Date.now() / 864e5) % C.TIPS.length];
    const hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
    const trs = tracks().slice().sort((a, b) => shareOf(b) - shareOf(a));
    const next = all.filter((t) => W(t) > 0 && !isDone(t)).map((t, i) => ({ t, i, k: (status(t) === "doing" || status(t) === "revisit" ? 100 : 0) + W(t) * 10 - i * 0.01 })).sort((a, b) => b.k - a.k).slice(0, 6).map((x) => x.t);
    const due = all.map((t) => ({ t, r: revision(t) })).filter((x) => x.r && x.r.due).sort((a, b) => b.r.over - a.r.over).slice(0, 5);
    const stages = JOB_STAGES.map((s) => [s, state.jobs.filter((j) => j.stage === s).length]);
    return `
    <section class="card hero">
      <div>
        <h1>${greet}, ${esc(state.profile.name.split(" ")[0])} 👋</h1>
        <p>Your path to <b>${esc(C.ROLES[role()])}</b>. Readiness is weighted by what employers actually ask for - the heavier the topic, the more it counts.</p>
        <div class="row mt-s"><span class="chip">${esc(levelOf(R))}</span>${tgt === null ? `<a class="chip" href="#/settings">Set a target date</a>` : `<span class="chip">🎯 ${tgt >= 0 ? nd(tgt) + " to target" : "Target date passed"}</span>`}<span class="chip">🔥 ${st.cur}-day streak</span></div>
        <div class="tipline">💡 ${esc(dayTip)}</div>
      </div>
      ${ring(R)}
    </section>

    <div class="grid g3 mt fit170">
      <div class="tile"><div class="l">Topics completed</div><div class="v">${doneN}<span class="muted unit"> / ${all.length}</span></div><div class="d">${Math.round(all.length ? (doneN / all.length) * 100 : 0)}% of curriculum</div></div>
      <div class="tile"><div class="l">Total study time</div><div class="v">${fmtH(allMin)}</div><div class="d">${fmtH(weekMinutes())} in last 7 days</div></div>
      <div class="tile"><div class="l">Study streak</div><div class="v">${st.cur}<span class="muted unit"> ${st.cur === 1 ? "day" : "days"}</span></div><div class="d">Best: ${nd(st.best)}</div></div>
      <div class="tile"><div class="l">Interview Qs mastered</div><div class="v">${known}<span class="muted unit"> / ${qsAll.length}</span></div><div class="d"><a href="#/practice">Practice now</a></div></div>
      <div class="tile"><div class="l">Applications</div><div class="v">${apps}</div><div class="d">${ints} at interview / offer</div></div>
    </div>

    <div class="grid g-main mt">
      <section class="card"><h2>🧭 Skill coverage by track <span class="sub">weightage for ${esc(ROLE_SHORT[role()])}</span></h2>
        <div class="meter-list">${trs.map((tr) => { const p = ready(tr.topics); return `<a class="meter-row ${tcls(tr)}" href="#/track/${esc(tr.id)}" data-tip="${esc(tr.name + " is " + shareOf(tr).toFixed(0) + "% of the " + C.ROLES[role()] + " skill weightage")}"><span class="n"><span class="tico sm">${esc(tr.icon)}</span><span class="ell">${esc(tr.name)}</span></span>${meter(p)}<span class="p">${Math.round(p)}%</span></a>`; }).join("")}</div>
      </section>
      <div class="grid astart">
        <section class="card"><h2>⏱️ Today</h2>
          <div class="row between"><span class="b">${fmtMins(tdMin)} <span class="muted b fw5">of ${fmtMins(goalMin)} goal</span></span><span class="muted small">${Math.round(Math.min(100, (tdMin / Math.max(1, goalMin)) * 100))}%</span></div>
          <div class="mt-s">${meter(Math.min(100, (tdMin / Math.max(1, goalMin)) * 100), "thick good")}</div>
          <div class="row mt"><button class="btn primary small" data-action="timer-quick">▶ Start 25-min focus</button><button class="btn small" data-action="quick-log">＋ Log time</button></div>
        </section>
        <section class="card"><h2>🔁 Revision due <span class="sub">spaced 3 / 7 / 21 / 45 days</span></h2>
          ${due.length ? due.map((x) => `<div class="row between lrow"><a href="${topicLink(x.t)}" class="grow inh">${esc(x.t.title)}</a><button class="btn small" data-action="revised" data-id="${esc(x.t.id)}">✓ Revised</button></div>`).join("") : empty("Nothing due", "Completed topics will appear here when it is time to revise them.")}
        </section>
      </div>
    </div>

    <div class="grid g-main mt">
      <section class="card"><h2>🎯 Next up <span class="sub">highest weightage first</span></h2>
        ${next.length ? next.map((t) => topicRow(t)).join("") : empty("All caught up!", "Every weighted topic is complete. Time to build projects and apply for jobs.")}
      </section>
      <div class="grid astart">
        <section class="card"><h2>📊 Last 7 days</h2>${weekChart()}</section>
        <section class="card"><h2>💼 Job pipeline <span class="sub"><a href="#/jobs">open tracker</a></span></h2>
          <div class="row">${stages.map((s) => `<span class="chip">${esc(s[0])} <b>${s[1]}</b></span>`).join("")}</div></section>
      </div>
    </div>`;
  };

  function topicRow(t) {
    const tr = trackById(t.track), p = Math.round(comp(t) * 100), pr2 = pri(W(t));
    return `<a class="meter-row ${tcls(tr)} row-topic" href="${topicLink(t)}"><span class="n"><span class="tico sm">${esc(tr.icon)}</span><span class="ell">${esc(t.title)}</span></span><span class="pri p${pr2[0]} tcenter">${pr2[1]}</span><span class="p">${p}%</span></a>`;
  }

  /* ------------------------------------------------------ roadmap/skills */
  V.skills = function () {
    const trs = tracks(), all = flat();
    const top = all.filter((t) => W(t) > 0).map((t, i) => ({ t, i })).sort((a, b) => W(b.t) - W(a.t) || a.i - b.i).slice(0, 15).map((x) => x.t);
    const totals = { A: 0, S: 0, M: 0 };
    all.forEach((t) => { totals.A += t.w[0]; totals.S += t.w[1]; totals.M += t.w[2]; });
    return `
    <div class="page-head"><div><h1>🗺️ Roadmap & Skills</h1><p>Every skill an industry-ready <b>${esc(C.ROLES[role()])}</b> needs, with weightage. Weightages are curated estimates from typical job descriptions and interview patterns - not a measured survey. Add your own skills to tune them.</p></div>
      <div class="row"><button class="btn" data-action="add-track">＋ New track</button><button class="btn primary" data-action="add-topic">＋ Add skill / topic</button></div></div>
    <div class="grid g3">${trs.map((tr) => { const p = ready(tr.topics), n = tr.topics.filter(isDone).length, hrs = tr.topics.reduce((s, t) => s + t.h, 0);
      return `<a class="card tcard ${tcls(tr)}" href="#/track/${esc(tr.id)}"><div class="row"><span class="tico">${esc(tr.icon)}</span><div class="grow"><h3>${esc(tr.name)}</h3><span class="muted tiny">${tr.topics.length} topics · ~${Math.round(hrs)}h · weight ${shareOf(tr).toFixed(0)}%</span></div></div><p>${esc(tr.desc)}</p>${meter(p)}<div class="row between mt-s tiny"><span class="muted">${n}/${tr.topics.length} completed</span><b>${Math.round(p)}%</b></div></a>`; }).join("")}</div>

    <div class="grid g-main mt">
      <section class="card"><h2>🏆 Top 15 skills for ${esc(ROLE_SHORT[role()])} <span class="sub">ranked by weightage (10 = must-know)</span></h2>
        <div class="meter-list">${top.map((t) => { const tr = trackById(t.track); return `<a class="meter-row ${tcls(tr)}" href="${topicLink(t)}"><span class="n"><span class="tico sm">${esc(tr.icon)}</span><span class="ell">${esc(t.title)}</span></span>${meter(W(t) * 10)}<span class="p">${W(t)}/10</span></a>`; }).join("")}</div></section>
      <section class="card"><h2>⚖️ Weightage by role <span class="sub">% share of all skills</span></h2>
        <div class="table-wrap"><table class="wtable"><tr><th>Track</th><th>Analyst</th><th>Scientist</th><th>ML Eng</th></tr>
        ${trs.map((tr) => `<tr><td><a class="inh" href="#/track/${esc(tr.id)}">${esc(tr.icon)} ${esc(tr.name.length > 22 ? tr.name.slice(0, 21) + "…" : tr.name)}</a></td>${["A", "S", "M"].map((r, i) => { const v = (tr.topics.reduce((s, t) => s + t.w[i], 0) / (totals[r] || 1)) * 100; return `<td><div class="wcell">${meter(v * 3)}<span>${v.toFixed(0)}%</span></div></td>`; }).join("")}</tr>`).join("")}
        </table></div>
        <p class="tiny muted mt-s">Bars are scaled for readability; the percentage is each track's share of that role's total skill weight.</p></section>
    </div>`;
  };

  /* -------------------------------------------------------- track detail */
  V.track = function (id, focusId) {
    const tr = trackById(id);
    if (!tr) return `<div class="empty"><b>Track not found</b><a href="#/skills">Back to roadmap</a></div>`;
    if (focusId && topicById(focusId) && ui.lastRoute !== route().join("/")) { ui.open.add(focusId); ui.focus = focusId; }
    const f = ui.tf, q = f.q.trim().toLowerCase();
    let list = tr.topics.map((t, i) => ({ t, i }));
    if (q) list = list.filter((x) => x.t.title.toLowerCase().includes(q) || x.t.subs.some((s) => s.toLowerCase().includes(q)));
    if (f.st !== "all") list = list.filter((x) => status(x.t) === f.st);
    if (f.pri !== "all") list = list.filter((x) => pri(W(x.t))[0] === +f.pri);
    const order = { doing: 0, revisit: 1, todo: 2, done: 3 };
    if (f.sort === "weight") list.sort((a, b) => W(b.t) - W(a.t) || a.i - b.i);
    else if (f.sort === "status") list.sort((a, b) => order[status(a.t)] - order[status(b.t)] || a.i - b.i);
    else if (f.sort === "hours") list.sort((a, b) => a.t.h - b.t.h || a.i - b.i);
    const p = ready(tr.topics), cnt = { todo: 0, doing: 0, done: 0, revisit: 0 };
    tr.topics.forEach((t) => { cnt[status(t)]++; });
    const hrs = tr.topics.reduce((s, t) => s + t.h, 0), left = tr.topics.reduce((s, t) => s + t.h * (1 - comp(t)), 0);
    const chip = (k, v, label) => `<button class="chip ${f[k] === v ? "on" : ""}" data-action="tf" data-k="${k}" data-v="${v}">${label}</button>`;
    return `
    <div class="page-head ${tcls(tr)}"><div class="row"><span class="tico lg">${esc(tr.icon)}</span><div><h1>${esc(tr.name)}</h1><p>${esc(tr.desc)}</p></div></div>
      <div class="row"><a class="btn" href="#/skills">← All tracks</a><button class="btn primary" data-action="add-topic" data-track="${esc(tr.id)}">＋ Add topic</button>${tr.custom ? `<button class="btn danger" data-action="del-track" data-id="${esc(tr.id)}">Delete track</button>` : ""}</div></div>
    <section class="card"><div class="grid g3 fit200c">
        <div><div class="muted small b">Track readiness</div><div class="big30">${Math.round(p)}%</div>${meter(p, "thick")}</div>
        <div class="small"><div class="muted b">Weightage for ${esc(ROLE_SHORT[role()])}</div><b class="big22">${shareOf(tr).toFixed(0)}%</b> of all skills</div>
        <div class="small"><div class="muted b">Study effort</div><b class="big22">~${Math.round(hrs)}h</b> total · ${Math.round(left)}h left</div>
        <div class="small"><div class="muted b">Status</div>✅ ${cnt.done} done · ◐ ${cnt.doing} in progress · ↻ ${cnt.revisit} revisit · ○ ${cnt.todo} to do</div></div>
      ${tr.res.length ? `<div class="links mt"><span class="muted small b">Free resources: </span>${tr.res.map((r) => { const u = safeUrl(r[1]); return u ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(r[0])} ↗</a>` : ""; }).join("")}</div>` : ""}
    </section>
    <div class="toolbar mt">
      <input class="search-in" type="search" data-input="tq" placeholder="Filter topics in ${esc(tr.name)}…" value="${esc(f.q)}" maxlength="60" aria-label="Filter topics">
      ${chip("st", "all", "All")}${chip("st", "todo", "To do")}${chip("st", "doing", "In progress")}${chip("st", "done", "Done")}${chip("st", "revisit", "Revisit")}
      <select data-change="tpri" aria-label="Priority">${opts([["all", "Any priority"], ["3", "Must-have"], ["2", "Important"], ["1", "Good to have"], ["0", "Optional"]], f.pri)}</select>
      <select data-change="tsort" aria-label="Sort">${opts([["road", "Roadmap order"], ["weight", "Highest weightage"], ["status", "By status"], ["hours", "Shortest first"]], f.sort)}</select>
    </div>
    <div id="topics">${list.length ? list.map((x) => topicCard(x.t, tr)).join("") : empty("No topics match", "Clear the filters or add your own topic.")}</div>`;
  };

  function topicCard(t, tr) {
    const st = status(t), open = ui.open.has(t.id), pct = Math.round(comp(t) * 100), w = W(t), pr2 = pri(w), n = checked(t), p = P(t.id) || {};
    let body = "";
    if (open) {
      const rev = revision(t), tm = topicMinutes(t.id), tq = encodeURIComponent(t.title);
      body = `<div class="t-body">
        ${t.tip ? `<div class="tip">💡 ${esc(t.tip)}</div>` : ""}
        ${t.subs.length ? `<ul class="subs">${t.subs.map((s, i) => `<li><label><input type="checkbox" data-change="sub" data-id="${esc(t.id)}" data-i="${i}" ${(p.s === "done" || (p.c && p.c[i])) ? "checked" : ""}><span>${esc(s)}</span></label></li>`).join("")}</ul>` : `<p class="muted small mt">No subtopics - use the status selector above.</p>`}
        <div class="row between"><div class="row"><span class="small b">Confidence</span><span class="stars" role="group" aria-label="Confidence">${[1, 2, 3, 4, 5].map((i) => `<button class="${(p.cf || 0) >= i ? "on" : ""}" data-action="star" data-id="${esc(t.id)}" data-n="${i}" aria-label="${i} star${i > 1 ? "s" : ""}">★</button>`).join("")}</span></div>
          <div class="small ink2">${tm ? "⏱ " + fmtMins(tm) + " studied" : "⏱ No time logged yet"}</div></div>
        ${st === "done" ? `<div class="row between mt-s small"><span>${p.at ? "Completed " + fmtDate(dkey(new Date(p.at))) + " · revised " + (p.rev || 0) + "×" : "Completed"}${rev ? (rev.due ? ` · <b>🔁 Revision due</b>` : ` · next revision in ${rev.inDays} day${rev.inDays === 1 ? "" : "s"}`) : ""}</span><button class="btn small" data-action="revised" data-id="${esc(t.id)}">✓ Mark revised</button></div>` : ""}
        <div class="row mt-s"><button class="btn small" data-action="log-topic" data-id="${esc(t.id)}">＋ Log study time</button>
          <span class="links"><a href="https://www.youtube.com/results?search_query=${tq}%20tutorial" target="_blank" rel="noopener noreferrer">▶ YouTube ↗</a><a href="https://www.google.com/search?q=${tq}%20explained" target="_blank" rel="noopener noreferrer">🔎 Google ↗</a></span>
          ${t.custom ? `<button class="btn small" data-action="edit-topic" data-id="${esc(t.id)}">✎ Edit</button><button class="btn small danger" data-action="del-topic" data-id="${esc(t.id)}">🗑 Delete</button>` : ""}</div>
        <div class="notes-area"><label class="f" for="n-${esc(t.id)}">My notes <span class="saved" id="sv-${esc(t.id)}"></span></label>
          <textarea id="n-${esc(t.id)}" data-input="tnote" data-id="${esc(t.id)}" maxlength="20000" placeholder="Key formulas, mistakes, links, examples… (saved automatically in this browser)">${esc(p.n || "")}</textarea></div>
      </div>`;
    }
    return `<article class="topic ${tcls(tr)} ${open ? "open" : ""} ${st === "done" ? "done" : ""}" id="t-${esc(t.id)}">
      <div class="t-head">
        <button class="t-title" data-action="toggle-topic" data-id="${esc(t.id)}" aria-expanded="${open}"><span class="car">▶</span><span>${esc(t.title)}</span></button>
        <div class="t-prog"><div class="meter"><i data-w="${pct}"></i></div><span>${n}/${t.subs.length}</span></div>
        <div class="t-meta"><span class="pri p${pr2[0]}">${pr2[1]}</span>${wbar(w)}<span>⏱ ${t.h}h</span><span class="chip">${LEVEL[t.l]}</span>
          <label class="badge s-${st}"><select data-change="status" data-id="${esc(t.id)}" aria-label="Status of ${esc(t.title)}">${opts(Object.entries(STATUS), st)}</select></label>
          ${p.n ? `<span title="Has notes">📝</span>` : ""}${(p.cf || 0) ? `<span title="Confidence">${"★".repeat(p.cf)}</span>` : ""}</div>
      </div>${body}</article>`;
  }

  /* ----------------------------------------------------------- study plan */
  V.plan = function () {
    const r = ui.planRole || role(), weeks = C.PLAN[r], start = state.profile.planStart, wkNow = Math.floor(daysBetween(start, today()) / 7);
    let totH = 0, doneH = 0;
    const planIds = new Set(weeks.flatMap((wk) => wk[1])), extras = flat().filter((t) => !planIds.has(t.id) && W(t) > 0).sort((a, b) => W(b) - W(a));
    const cards = weeks.map((wk, i) => {
      const ts = wk[1].map(topicById).filter(Boolean), h = ts.reduce((s, t) => s + t.h, 0), dh = ts.reduce((s, t) => s + t.h * comp(t), 0), pct = h ? (dh / h) * 100 : 0;
      totH += h; doneH += dh;
      const state2 = pct >= 99.5 ? ["✓ Done", ""] : i === wkNow ? ["◔ This week", ""] : i < wkNow ? ["⚠ Behind", ""] : ["Upcoming", ""];
      return `<div class="week ${i === wkNow ? "now" : ""}"><div class="wk"><b>${i + 1}</b><span>Week</span></div><div>
        <div class="row between"><h3>${esc(wk[0])}</h3><span class="chip">${state2[0]}</span></div>
        <div class="chips">${ts.map((t) => { const s = status(t); return chipLink(topicLink(t), `<span class="ck">${s === "done" ? "✓" : s === "doing" ? "◐" : s === "revisit" ? "↻" : "○"}</span> ${esc(t.title)}`); }).join("")}</div>
        <div class="row"><div class="grow">${meter(pct)}</div><span class="small b">${Math.round(pct)}%</span></div>
        <div class="tiny muted mt-s">~${Math.round(h)}h of study · about ${(h / 7).toFixed(1)}h/day to finish within the week${wkNow <= i && h / 7 > state.profile.goal ? ` <b>(above your ${state.profile.goal}h daily goal - extend this week or raise the goal)</b>` : ""}</div></div></div>`;
    }).join("");
    return `
    <div class="page-head"><div><h1>📅 Study Plan</h1><p>A ${weeks.length}-week roadmap for <b>${esc(C.ROLES[r])}</b>. Start date: <b>${esc(fmtDate(start))}</b> (change in Settings). ${wkNow < 0 ? "Your plan has not started yet." : wkNow >= weeks.length ? "Plan period is over - keep going, or reset the start date." : "You are in <b>week " + (wkNow + 1) + "</b>."} Treat the pace as a guide - depth matters more than speed.</p></div>
      <div class="row"><select data-change="planRole" aria-label="Plan for role">${opts([["A", "Data Analyst plan"], ["S", "Data Scientist plan"], ["M", "ML Engineer plan"]], r)}</select></div></div>
    <section class="card"><div class="row between"><b>Overall plan progress</b><span class="b">${Math.round(totH ? (doneH / totH) * 100 : 0)}%</span></div><div class="mt-s">${meter(totH ? (doneH / totH) * 100 : 0, "thick")}</div>
      <p class="small ink2 mt-s">The plan holds ~${Math.round(totH)}h of study. At your goal of <b>${state.profile.goal}h/day</b> that takes about <b>${Math.ceil(totH / (state.profile.goal * 7))} weeks</b> (the ${weeks.length} weekly blocks assume roughly ${Math.round(totH / weeks.length / 7 * 10) / 10}h/day on average). Adjust your daily goal in Settings.</p></section>
    <div class="mt">${cards}</div>
    ${extras.length ? `<section class="card mt"><h2>➕ Bonus topics (not scheduled) <span class="sub">add when you have time</span></h2><div class="chips-wrap">${extras.map((t) => chipLink(topicLink(t), `${esc(trackById(t.track).icon)} ${esc(t.title)}`)).join("")}</div></section>` : ""}`;
  };

  /* ------------------------------------------------------------- practice */
  function allQs() {
    return C.QS.map((q, i) => ({ id: "q" + i, track: q[0], q: q[1], a: q[2] })).concat(state.myqs.map((q) => ({ id: q.id, track: q.track, q: q.q, a: q.a, mine: true })));
  }
  function deck() {
    const f = ui.pr;
    return allQs().filter((q) => (f.track === "all" || q.track === f.track) && (f.f === "all" || (f.f === "todo" ? !state.qs[q.id] : state.qs[q.id] === f.f)));
  }
  V.practice = function () {
    const f = ui.pr, qs = allQs(), d = deck();
    if (f.i >= d.length) f.i = 0;
    const known = qs.filter((q) => state.qs[q.id] === "known").length, rev = qs.filter((q) => state.qs[q.id] === "review").length;
    const tname = (id) => { const t = trackById(id); return t ? t.icon + " " + t.name : id || "Custom"; };
    const q = d[f.i];
    let main;
    if (!d.length) main = empty("Nothing in this deck", "Change the filter above, or add your own questions.");
    else if (f.mode === "list") main = d.map((x) => `<details class="card mt-s"><summary class="b ptr">${esc(x.q)} <span class="muted tiny">${esc(tname(x.track))}${state.qs[x.id] ? " · " + (state.qs[x.id] === "known" ? "✓ known" : "↻ review") : ""}</span></summary><p class="mt-s ink2 pre">${esc(x.a)}</p><div class="row mt-s"><button class="btn small" data-action="pr-mark" data-id="${esc(x.id)}" data-v="known">✓ I know this</button><button class="btn small" data-action="pr-mark" data-id="${esc(x.id)}" data-v="review">↻ Review later</button>${x.mine ? `<button class="btn small danger" data-action="pr-del" data-id="${esc(x.id)}">Delete</button>` : ""}</div></details>`).join("");
    else main = `<div class="flash-wrap"><div class="row between small muted"><span>Card ${f.i + 1} of ${d.length} · ${esc(tname(q.track))}</span><span>${state.qs[q.id] === "known" ? "✓ known" : state.qs[q.id] === "review" ? "↻ review" : "new"}</span></div>
      <div class="fcard mt-s"><div class="q">${esc(q.q)}</div>${f.show ? `<div class="a">${esc(q.a)}</div>` : `<div><button class="btn primary" data-action="pr-flip">Show answer <span class="muted">(Space)</span></button></div>`}</div>
      <div class="row between mt"><button class="btn" data-action="pr-prev">← Prev</button>
        <div class="row"><button class="btn" data-action="pr-mark" data-id="${esc(q.id)}" data-v="review">↻ Review later (R)</button><button class="btn primary" data-action="pr-mark" data-id="${esc(q.id)}" data-v="known">✓ Got it (K)</button></div>
        <button class="btn" data-action="pr-next">Next →</button></div>
      ${q.mine ? `<div class="mt-s"><button class="btn small danger" data-action="pr-del" data-id="${esc(q.id)}">Delete this question</button></div>` : ""}</div>`;
    const tl = [["all", "All tracks"]].concat(Array.from(new Set(qs.map((x) => x.track))).map((id) => [id, tname(id)]));
    return `
    <div class="page-head"><div><h1>🧩 Interview Practice</h1><p>${qs.length} questions with model answers. Try to answer out loud <i>before</i> revealing - then mark honestly. Add your own questions from real interviews.</p></div>
      <div class="row"><button class="btn primary" data-action="pr-add">＋ Add question</button></div></div>
    <section class="card"><div class="row between"><b>Mastery</b><span class="small muted">${known} known · ${rev} to review · ${qs.length - known - rev} new</span></div><div class="mt-s">${meter(qs.length ? (known / qs.length) * 100 : 0, "thick good")}</div></section>
    <div class="toolbar mt">
      <select data-change="prtrack" aria-label="Track">${opts(tl, f.track)}</select>
      <select data-change="prf" aria-label="Filter">${opts([["todo", "New only"], ["review", "Needs review"], ["known", "Known"], ["all", "All"]], f.f)}</select>
      <button class="chip ${f.mode === "card" ? "on" : ""}" data-action="pr-mode" data-v="card">Flashcards</button><button class="chip ${f.mode === "list" ? "on" : ""}" data-action="pr-mode" data-v="list">List</button>
      <button class="btn small" data-action="pr-shuffle">🔀 Shuffle</button><span class="muted small">${d.length} in deck</span>
    </div>${main}`;
  };

  /* ---------------------------------------------------------------- notes */
  V.notes = function () {
    const q = ui.nq.trim().toLowerCase(), items = [];
    state.notes.forEach((n) => items.push({ key: "n:" + n.id, id: n.id, title: n.title || "Untitled note", body: n.body, tag: n.tag, u: n.u, kind: "note" }));
    flat().forEach((t) => { const p = P(t.id); if (p && p.n && p.n.trim()) items.push({ key: "t:" + t.id, id: t.id, title: t.title, body: p.n, tag: "Topic", u: p.u || 0, kind: "topic", t: t }); });
    const list = items.filter((x) => (ui.ntag === "all" || x.tag === ui.ntag) && (!q || (x.title + " " + x.body).toLowerCase().includes(q))).sort((a, b) => b.u - a.u);
    const tags = ["all", "Topic"].concat(NOTE_TAGS);
    return `
    <div class="page-head"><div><h1>📝 Notes</h1><p>All your notes in one place - topic notes written inside the roadmap appear here too. Search across everything.</p></div>
      <div class="row"><button class="btn" data-action="notes-export">⬇ Export .md</button><button class="btn primary" data-action="note-new">＋ New note</button></div></div>
    <div class="toolbar"><input class="search-in" type="search" data-input="nq" value="${esc(ui.nq)}" placeholder="Search notes…" maxlength="60" aria-label="Search notes">${tags.map((t) => `<button class="chip ${ui.ntag === t ? "on" : ""}" data-action="ntag" data-v="${esc(t)}">${t === "all" ? "All" : esc(t)}</button>`).join("")}</div>
    ${list.length ? `<div class="grid g3">${list.map((x) => `<${x.kind === "note" ? 'button data-action="note-edit"' : 'a href="' + topicLink(x.t) + '"'} ${x.kind === "note" ? `data-id="${esc(x.id)}"` : ""} class="card note-card inh nodec"><div class="row between"><b>${esc(x.title)}</b><span class="chip">${esc(x.tag)}</span></div><p>${esc(x.body.slice(0, 400))}</p><span class="tiny muted">${x.u ? fmtDate(dkey(new Date(x.u))) : ""}${x.kind === "topic" ? " · opens topic" : ""}</span></${x.kind === "note" ? "button" : "a"}>`).join("")}</div>` : empty("No notes yet", "Create a note, or write notes inside any topic of the roadmap.")}`;
  };

  /* ------------------------------------------------------------- projects */
  V.projects = function () {
    const mine = state.projects, sug = C.PROJECTS.filter((p) => p.roles.includes(role()));
    return `
    <div class="page-head"><div><h1>🚀 Portfolio Projects</h1><p>Projects are the strongest proof of skill. Aim for 3-5 end-to-end projects with a business question, clean code on GitHub and a clear write-up.</p></div>
      <div class="row"><button class="btn primary" data-action="proj-new">＋ New project</button></div></div>
    <h2 class="mb10">My projects <span class="muted small">(${mine.length})</span></h2>
    ${mine.length ? `<div class="grid g3">${mine.map((p) => { const dn = p.steps.filter((_, i) => p.done[i]).length;
      return `<article class="card pcard"><div class="row between"><b>${esc(p.title)}</b><label class="badge s-${p.stage === "Published" || p.stage === "Done" ? "done" : p.stage === "Building" ? "doing" : "todo"}"><select data-change="pstage" data-id="${esc(p.id)}" aria-label="Project stage">${opts(PROJ_STAGES, p.stage)}</select></label></div>
        ${p.tools ? `<div class="tiny muted">🛠 ${esc(p.tools)}</div>` : ""}${p.desc ? `<p class="small ink2">${esc(p.desc)}</p>` : ""}
        ${p.steps.length ? `${meter(p.steps.length ? (dn / p.steps.length) * 100 : 0)}<ul>${p.steps.map((s, i) => `<li><label><input type="checkbox" data-change="pstep" data-id="${esc(p.id)}" data-i="${i}" ${p.done[i] ? "checked" : ""}><span>${esc(s)}</span></label></li>`).join("")}</ul>` : ""}
        ${p.link ? `<a class="small" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">🔗 Open project link ↗</a>` : ""}
        <div class="row"><button class="btn small" data-action="proj-edit" data-id="${esc(p.id)}">✎ Edit</button><button class="btn small danger" data-action="proj-del" data-id="${esc(p.id)}">🗑 Delete</button></div></article>`; }).join("")}</div>` : empty("No projects yet", "Pick one of the suggestions below and click “Add to my projects”.")}
    <h2 class="h2gap">💡 Suggested for ${esc(C.ROLES[role()])}</h2>
    <div class="grid g3">${sug.map((p) => { const added = mine.some((m) => m.src === p.id);
      return `<article class="card pcard"><b>${esc(p.title)}</b><div class="tiny muted">🛠 ${esc(p.tools)}</div><p class="small ink2">${esc(p.desc)}</p><details class="small"><summary class="ptr acc">Steps (${p.steps.split("|").length})</summary><ol class="ol-sm">${p.steps.split("|").map((s) => `<li>${esc(s)}</li>`).join("")}</ol></details>
        <div><button class="btn small ${added ? "" : "primary"}" data-action="proj-from" data-id="${esc(p.id)}" ${added ? "disabled" : ""}>${added ? "✓ Added" : "＋ Add to my projects"}</button></div></article>`; }).join("")}</div>`;
  };

  /* ----------------------------------------------------------------- jobs */
  V.jobs = function () {
    const t = today();
    return `
    <div class="page-head"><div><h1>💼 Job Tracker</h1><p>Track every application from wishlist to offer. Set follow-up dates so nothing slips - most replies come after a polite follow-up.</p></div>
      <div class="row"><button class="btn primary" data-action="job-new">＋ Add application</button></div></div>
    ${state.jobs.length ? "" : empty("No applications yet", "Add roles you want to apply to. Aim for 5-10 quality applications a week, tailored to each job description.")}
    <div class="kanban mt">${JOB_STAGES.map((s) => { const js = state.jobs.filter((j) => j.stage === s);
      return `<div class="col"><h3>${esc(s)} <span>${js.length}</span></h3>${js.map((j) => `<div class="job ${j.follow && j.follow <= t && s !== "Offer" && s !== "Rejected" ? "due" : ""}"><b>${esc(j.company)}</b><span class="ink2">${esc(j.role)}</span>
        <div class="tiny muted">${j.applied ? "Applied " + esc(fmtDate(j.applied)) : ""}${j.follow ? (j.applied ? " · " : "") + (j.follow <= t && s !== "Offer" && s !== "Rejected" ? "<b>⏰ Follow up due</b>" : "Follow up " + esc(fmtDate(j.follow))) : ""}</div>
        ${j.notes ? `<div class="tiny ink2 mt-s pre">${esc(j.notes.slice(0, 160))}${j.notes.length > 160 ? "…" : ""}</div>` : ""}
        <div class="row"><select data-change="jstage" data-id="${esc(j.id)}" aria-label="Stage for ${esc(j.company)}">${opts(JOB_STAGES, j.stage)}</select>${j.link ? `<a class="icon-btn tiny" href="${esc(j.link)}" target="_blank" rel="noopener noreferrer" aria-label="Open job posting" title="Open posting">↗</a>` : ""}<button class="icon-btn tiny" data-action="job-edit" data-id="${esc(j.id)}" aria-label="Edit" title="Edit">✎</button><button class="icon-btn tiny" data-action="job-del" data-id="${esc(j.id)}" aria-label="Delete" title="Delete">🗑</button></div></div>`).join("")}</div>`; }).join("")}</div>
    <section class="card mt"><h2>✅ Job-search checklist</h2><div class="grid g3 small fit260">
      <div>• Resume: one page, quantified bullets, tailored keywords<br>• LinkedIn headline: “Data Analyst | SQL · Python · Power BI”</div>
      <div>• 3+ projects on GitHub with README and screenshots<br>• Ask for referrals - they beat cold applications</div>
      <div>• Practise SQL daily and 2 mock interviews a week<br>• Never share personal documents or pay for “guaranteed” jobs</div></div></section>`;
  };

  /* ------------------------------------------------------------------ log */
  function timerLeft() { const t = state.timer; if (!t) return 0; return t.run ? Math.max(0, t.end - Date.now()) : t.left; }
  const mmss = (ms) => { const s = Math.ceil(ms / 1000); return pad2(Math.floor(s / 60)) + ":" + pad2(s % 60); };
  function topicOptions(sel) {
    return `<option value="">General (no topic)</option>` + tracks().map((tr) => `<optgroup label="${esc(tr.icon + " " + tr.name)}">${tr.topics.map((t) => `<option value="${esc(t.id)}"${t.id === sel ? " selected" : ""}>${esc(t.title)}</option>`).join("")}</optgroup>`).join("");
  }
  V.log = function () {
    const tm = state.timer, st = streaks(), allMin = state.log.reduce((s, e) => s + e.m, 0), days = Object.keys(minsByDate()).length;
    const byTrack = {};
    state.log.forEach((e) => { const t = e.t ? topicById(e.t) : null; const k = t ? t.track : "_"; byTrack[k] = (byTrack[k] || 0) + e.m; });
    const rows = Object.keys(byTrack).sort((a, b) => byTrack[b] - byTrack[a]), mx = Math.max(1, ...rows.map((k) => byTrack[k]));
    const recent = state.log.slice().sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0)).slice(0, 25);
    let timerHtml;
    if (!tm) timerHtml = `<div class="timer-face" id="tface">25:00</div><div class="row jcc">${[25, 45, 60, 90].map((m) => `<button class="chip" data-action="preset" data-m="${m}">${m} min</button>`).join("")}<input class="w84" type="number" id="tmins" value="25" min="1" max="600" aria-label="Minutes"></div>
      <div class="mt"><label class="f" for="ttopic">Studying</label><select class="w100" id="ttopic">${topicOptions("")}</select></div><div class="row mt jcc"><button class="btn primary" data-action="timer-start">▶ Start focus session</button></div>`;
    else timerHtml = `<div class="timer-face" id="tface">${mmss(timerLeft())}</div>${meter(0, "thick")}<p class="small muted mt-s tcenter">${tm.mins}-min session${tm.topic && topicById(tm.topic) ? " · " + esc(topicById(tm.topic).title) : ""}</p>
      <div class="row mt jcc">${tm.run ? `<button class="btn" data-action="timer-pause">⏸ Pause</button>` : `<button class="btn primary" data-action="timer-resume">▶ Resume</button>`}<button class="btn danger" data-action="timer-reset">✕ Cancel</button></div>`;
    return `
    <div class="page-head"><div><h1>⏱️ Study Log & Timer</h1><p>Consistency compounds. Use the focus timer (it logs automatically) or add time manually.</p></div><div class="row"><button class="btn primary" data-action="quick-log">＋ Add manual entry</button></div></div>
    <div class="grid g3 fit160">
      <div class="tile"><div class="l">Total time</div><div class="v">${fmtH(allMin)}</div></div><div class="tile"><div class="l">Last 7 days</div><div class="v">${fmtH(weekMinutes())}</div></div>
      <div class="tile"><div class="l">Current streak</div><div class="v">${st.cur}<span class="muted unit"> ${st.cur === 1 ? "day" : "days"}</span></div></div><div class="tile"><div class="l">Longest streak</div><div class="v">${st.best}<span class="muted unit"> ${st.best === 1 ? "day" : "days"}</span></div></div>
      <div class="tile"><div class="l">Avg per active day</div><div class="v">${days ? fmtMins(allMin / days) : "-"}</div></div></div>
    <div class="grid g2 mt"><section class="card"><h2>🍅 Focus timer</h2>${timerHtml}</section><section class="card"><h2>📊 Last 7 days</h2>${weekChart()}</section></div>
    <section class="card mt"><h2>🗓️ Consistency <span class="sub">last 18 weeks</span></h2>${heatmap(18)}</section>
    <div class="grid g2 mt">
      <section class="card"><h2>⏳ Time by track</h2>${rows.length ? `<div class="meter-list">${rows.map((k) => { const tr = k === "_" ? null : trackById(k); return `<div class="meter-row ${tr ? tcls(tr) : ""}"><span class="n">${tr ? `<span class="tico sm">${esc(tr.icon)}</span><span class="ell">${esc(tr.name)}</span>` : "General"}</span>${meter((byTrack[k] / mx) * 100)}<span class="p">${fmtH(byTrack[k])}</span></div>`; }).join("")}</div>` : empty("No time logged", "Start the timer or add a manual entry.")}</section>
      <section class="card"><h2>🧾 Recent entries</h2>${recent.length ? recent.map((e) => { const t = e.t ? topicById(e.t) : null; return `<div class="row between lrow"><div class="grow small"><b>${fmtMins(e.m)}</b> · ${esc(t ? t.title : "General")}<div class="tiny muted">${esc(fmtDate(e.d))}${e.n ? " · " + esc(e.n) : ""}</div></div><button class="icon-btn tiny" data-action="log-del" data-id="${esc(e.id)}" aria-label="Delete entry">🗑</button></div>`; }).join("") : empty("Nothing yet", "Your sessions will appear here.")}</section></div>`;
  };

  /* ------------------------------------------------------------- settings */
  V.settings = function () {
    const p = state.profile;
    let used = 0; try { used = (localStorage.getItem(KEY) || "").length; } catch (e) { /* ignore */ }
    return `
    <div class="page-head"><div><h1>⚙️ Settings & Data</h1><p>Everything is stored locally in this browser. Nothing is sent anywhere - the app makes no network requests.</p></div></div>
    <div class="grid g2"><section class="card"><h2>👤 Profile & goals</h2>
      <label class="f" for="s-name">Your name</label><input id="s-name" type="text" data-change="pf" data-k="name" value="${esc(p.name)}" maxlength="60">
      <label class="f" for="s-role">Target role (changes weightage everywhere)</label><select class="w100" id="s-role" data-change="pf" data-k="role">${opts([["A", "Data Analyst"], ["S", "Data Scientist"], ["M", "ML Engineer"]], p.role)}</select>
      <div class="cols2"><div><label class="f" for="s-target">Target job-ready date</label><input id="s-target" type="date" data-change="pf" data-k="target" value="${esc(p.target)}"></div><div><label class="f" for="s-goal">Daily study goal (hours)</label><input id="s-goal" type="number" min="0.25" max="16" step="0.25" data-change="pf" data-k="goal" value="${esc(p.goal)}"></div></div>
      <label class="f" for="s-ps">Study plan start date</label><input id="s-ps" type="date" data-change="pf" data-k="planStart" value="${esc(p.planStart)}">
      <label class="f" for="s-theme">Theme</label><select class="w100" id="s-theme" data-change="pf" data-k="theme">${opts([["auto", "Match system"], ["light", "Light"], ["dark", "Dark"]], state.theme)}</select></section>
    <section class="card"><h2>💾 Backup & restore</h2><p class="small ink2">Your progress lives in this browser only. Clearing site data or switching browser/PC loses it - export a backup regularly (for example weekly) and keep it somewhere private.</p>
      <div class="row mt"><button class="btn primary" data-action="export">⬇ Export backup (.json)</button><button class="btn" data-action="import">⬆ Import backup</button><button class="btn" data-action="notes-export">⬇ Notes (.md)</button></div>
      <p class="tiny muted mt-s">Storage used: ${(used / 1024).toFixed(1)} KB · Imports are validated and only known fields are accepted.</p>
      <h2 class="mt">🧹 Danger zone</h2><button class="btn danger" data-action="reset">Reset all progress…</button></section></div>
    <section class="card mt"><h2>ℹ️ About the weightage</h2><p class="small ink2">Each topic has a 0-10 weight for Data Analyst, Data Scientist and ML Engineer, reflecting how frequently the skill appears in typical job descriptions and interviews. Job readiness = Σ(weight × completion) ÷ Σ(weight). Completion = subtopics checked ÷ total. Topics with weight 0 are “Optional” and ignored for your role. Use <b>＋ Add skill / topic</b> to add anything missing, with your own weightage.</p></section>`;
  };

  /* =============================================================== render */
  const view = $("#view");
  function banner() { return memOnly ? `<div class="banner">⚠️ Browser storage is unavailable (private mode or blocked), so progress will <b>not</b> be saved. Use <a href="#/settings">Settings → Export</a> before closing.</div>` : ""; }
  function focusSel(el) {
    if (!el || !el.closest || !el.closest("#view")) return "";
    const d = el.dataset || {}, k = d.change ? "change" : d.action ? "action" : "";
    if (!k) return "";
    let q = "[data-" + k + "=\"" + CSS.escape(d[k]) + "\"]";
    ["id", "i", "n", "v", "k"].forEach((a) => { if (d[a] !== undefined) q += "[data-" + a + "=\"" + CSS.escape(d[a]) + "\"]"; });
    return q;
  }
  function render() {
    const rt = route(), key = rt.join("/"), sameView = ui.lastRoute === key, y = window.scrollY, fsel = focusSel(document.activeElement);
    if (ui.lastRoute.split("/")[0] === "track" && rt[0] !== "track") ui.tf.q = "";
    const fn = V[rt[0]] || V.dashboard;
    view.innerHTML = banner() + fn(rt[1], rt[2]);
    $$("[data-w]", view).forEach((el) => { if (sameView) el.style.transition = "none"; el.style.width = el.dataset.w + "%"; });
    ui.lastRoute = key;
    if (fsel && sameView) { const fe = view.querySelector(fsel); if (fe) fe.focus({ preventScroll: true }); }
    renderSidebar(); updatePill();
    document.title = "DataPath · " + ({ dashboard: "Dashboard", skills: "Roadmap", track: (trackById(rt[1]) || {}).name || "Track", plan: "Study Plan", practice: "Practice", notes: "Notes", projects: "Projects", jobs: "Jobs", log: "Study Log", settings: "Settings" }[rt[0]] || "Dashboard");
    if (ui.focus) { const el = document.getElementById("t-" + ui.focus); ui.focus = ""; if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); } }
    else window.scrollTo(0, sameView ? y : 0);
  }
  function renderSidebar() {
    const rt = route(), nav = [["dashboard", "🏠", "Dashboard"], ["skills", "🗺️", "Roadmap & Skills"], ["plan", "📅", "Study Plan"], ["practice", "🧩", "Interview Practice"], ["notes", "📝", "Notes"], ["projects", "🚀", "Projects"], ["jobs", "💼", "Job Tracker"], ["log", "⏱️", "Study Log & Timer"], ["settings", "⚙️", "Settings"]];
    $("#sidebar").innerHTML = `<div class="brand"><div class="logo">📈</div><div><b>DataPath</b><small>Analyst · Scientist · ML</small></div></div>
      <div class="role-box"><label>Target role</label><div class="seg">${["A", "S", "M"].map((r) => `<button class="${role() === r ? "on" : ""}" data-action="set-role" data-role="${r}">${ROLE_SHORT[r]}</button>`).join("")}</div></div>
      <nav class="nav" aria-label="Pages"><div class="nav-sec">Menu</div>${nav.map((n) => `<a href="#/${n[0]}" class="${rt[0] === n[0] ? "active" : ""}"><span class="ico">${n[1]}</span><span class="nm">${n[2]}</span></a>`).join("")}
      <div class="nav-sec">Skill tracks</div>${tracks().map((tr) => `<a href="#/track/${esc(tr.id)}" class="${rt[0] === "track" && rt[1] === tr.id ? "active" : ""}"><span class="ico">${esc(tr.icon)}</span><span class="nm">${esc(tr.name)}</span><span class="pct">${Math.round(ready(tr.topics))}%</span></a>`).join("")}</nav>
      <div class="side-foot">Data stays in your browser.<br>Press <b>/</b> to search.</div>`;
    const dark = isDark(); const b = $("#themeBtn"); if (b) b.textContent = dark ? "☀️" : "🌙";
  }
  function isDark() { return state.theme === "dark" || (state.theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches); }
  function applyTheme() { if (state.theme === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", state.theme); }

  /* ------------------------------------------------------ toast / tooltip */
  function toast(msg) {
    const el = document.createElement("div"); el.className = "toast"; el.textContent = msg; $("#toasts").appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
  const tip = $("#tip");
  function showTip(el, x, y) {
    tip.textContent = el.getAttribute("data-tip"); tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = clamp(x + 14, 6, window.innerWidth - r.width - 6) + "px"; tip.style.top = clamp(y + 16, 6, window.innerHeight - r.height - 6) + "px";
  }
  document.addEventListener("mouseover", (e) => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) showTip(el, e.clientX, e.clientY); });
  document.addEventListener("mousemove", (e) => { if (!tip.hidden) { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) showTip(el, e.clientX, e.clientY); else tip.hidden = true; } });
  document.addEventListener("mouseout", (e) => { if (e.target.closest && e.target.closest("[data-tip]")) tip.hidden = true; });

  /* --------------------------------------------------------------- modal */
  const modal = $("#modal");
  let modalSave = null;
  function openModal(title, body, saveLabel, onSave) {
    modalSave = onSave || null;
    modal.innerHTML = `<div class="m-head"><h2>${esc(title)}</h2><button class="icon-btn tiny" data-action="modal-close" aria-label="Close">✕</button></div><div class="m-body">${body}</div><div class="m-foot"><button class="btn" data-action="modal-close">Cancel</button>${onSave ? `<button class="btn primary" data-action="modal-save">${esc(saveLabel || "Save")}</button>` : ""}</div>`;
    if (!modal.open) modal.showModal();
    const first = $("input:not([type=hidden]), textarea, select", modal); if (first && onSave) first.focus();
  }
  function closeModal() { if (modal.open) modal.close(); modalSave = null; }
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  const ask = (title, msg, yes, fn) => openModal(title, `<p class="mt">${esc(msg)}</p>`, yes, () => { fn(); return true; });

  /* -------------------------------------------------------- data actions */
  function celebrate(t) {
    const tr = trackById(t.track);
    if (tr && tr.topics.every(isDone)) toast("🏆 Track complete: " + tr.name + "!"); else toast("🎉 Completed: " + t.title);
  }
  function setStatus(id, s) {
    const t = topicById(id); if (!t) return; const p = ensure(id), prev = p.s;
    p.s = s; p.u = Date.now(); if (!p.c) p.c = {};
    if (s === "done") { t.subs.forEach((_, i) => { p.c[i] = 1; }); if (prev !== "done") { p.at = Date.now(); p.last = p.at; p.rev = 0; celebrate(t); } }
    else if (s === "todo") p.c = {};
    else if (prev === "done" && t.subs.length) { delete p.c[t.subs.length - 1]; }
    save(); render();
  }
  function toggleSub(id, i, on) {
    const t = topicById(id); if (!t) return; const p = ensure(id); p.u = Date.now();
    if (!p.c) p.c = {};
    if (p.s === "done") { t.subs.forEach((_, k) => { p.c[k] = 1; }); }
    if (on) p.c[i] = 1; else delete p.c[i];
    const n = t.subs.reduce((s, _, k) => s + (p.c[k] ? 1 : 0), 0);
    if (n === t.subs.length) { if (p.s !== "done") { p.s = "done"; p.at = Date.now(); p.last = p.at; p.rev = 0; celebrate(t); } }
    else if (p.s === "done") p.s = "doing";
    else if (p.s === "todo" && n > 0) p.s = "doing";
    else if (p.s === "doing" && n === 0) p.s = "todo";
    save(); render();
  }
  function groupedTopicSelect(id, selected) { return `<select class="w100" id="${id}">${topicOptions(selected)}</select>`; }

  function logDialog(topic) {
    openModal("Log study time", `<div class="cols2"><div><label class="f" for="l-d">Date</label><input id="l-d" type="date" value="${today()}" max="${today()}"></div><div><label class="f" for="l-m">Minutes</label><input id="l-m" type="number" min="1" max="1440" value="30"></div></div>
      <label class="f" for="l-t">Topic</label>${groupedTopicSelect("l-t", topic || "")}<label class="f" for="l-n">Note (optional)</label><input id="l-n" type="text" maxlength="200" placeholder="What did you cover?">`, "Add entry", () => {
      const m = +val("l-m"), d = val("l-d") || today();
      if (!(m >= 1 && m <= 1440)) { toast("Enter minutes between 1 and 1440."); return false; }
      if (d > today()) { toast("Date cannot be in the future."); return false; }
      addLog(m, val("l-t"), val("l-n"), d); toast("✅ Logged " + fmtMins(m)); render(); return true;
    });
  }
  function trackSelect(id, sel) { return `<select class="w100" id="${id}">${tracks().map((t) => `<option value="${esc(t.id)}"${t.id === sel ? " selected" : ""}>${esc(t.icon + " " + t.name)}</option>`).join("")}</select>`; }
  function topicDialog(editId, trackId) {
    const e = editId ? state.custom.topics.find((t) => t.id === editId) : null;
    const w = e ? e.w : [7, 7, 7];
    openModal(e ? "Edit topic" : "Add skill / topic", `<label class="f" for="u-track">Track</label>${trackSelect("u-track", e ? e.track : trackId || "excel")}
      <label class="f" for="u-title">Skill / topic name</label><input id="u-title" type="text" maxlength="100" value="${esc(e ? e.title : "")}" placeholder="e.g. Power Pivot DAX time intelligence">
      <label class="f">Industry weightage (0 = not needed, 10 = must-know)</label><div class="cols3"><div><label class="f tiny" for="u-w0">Analyst</label><input id="u-w0" type="number" min="0" max="10" value="${w[0]}"></div><div><label class="f tiny" for="u-w1">Scientist</label><input id="u-w1" type="number" min="0" max="10" value="${w[1]}"></div><div><label class="f tiny" for="u-w2">ML Eng</label><input id="u-w2" type="number" min="0" max="10" value="${w[2]}"></div></div>
      <div class="cols2"><div><label class="f" for="u-h">Estimated hours</label><input id="u-h" type="number" min="0" max="500" value="${e ? e.h : 6}"></div><div><label class="f" for="u-l">Level</label><select class="w100" id="u-l">${opts([[1, "Beginner"], [2, "Intermediate"], [3, "Advanced"]], e ? e.l : 2)}</select></div></div>
      <label class="f" for="u-subs">Subtopics (one per line - becomes your checklist)</label><textarea id="u-subs" maxlength="4000" placeholder="Syntax basics&#10;Practice problems&#10;Mini project">${esc(e ? e.subs.join("\n") : "")}</textarea>
      <label class="f" for="u-tip">Tip / why it matters (optional)</label><input id="u-tip" type="text" maxlength="240" value="${esc(e ? e.tip : "")}">`, "Save topic", () => {
      const title = val("u-title"); if (!title) { toast("Please enter a topic name."); return false; }
      const o = { id: e ? e.id : "u-" + uid(), track: val("u-track"), title: title.slice(0, 100), w: [0, 1, 2].map((i) => Math.round(clamp(+val("u-w" + i) || 0, 0, 10))), h: clamp(+val("u-h") || 0, 0, 500), l: +val("u-l") || 2, subs: val("u-subs").split(/\r?\n/).map((s) => s.trim().slice(0, 120)).filter(Boolean).slice(0, 40), tip: val("u-tip").slice(0, 240) };
      if (e) Object.assign(e, o); else state.custom.topics.push(o);
      invalidate(); save(); toast("✅ Topic saved"); location.hash = "#/track/" + encodeURIComponent(o.track) + "/" + encodeURIComponent(o.id); render(); return true;
    });
  }
  function trackDialog() {
    openModal("New skill track", `<label class="f" for="k-name">Track name</label><input id="k-name" type="text" maxlength="40" placeholder="e.g. Cloud, R, Power Apps">
      <div class="cols2"><div><label class="f" for="k-icon">Icon (emoji)</label><input id="k-icon" type="text" maxlength="4" value="📘"></div><div><label class="f" for="k-c">Accent colour</label><select class="w100" id="k-c">${opts(COLOR_NAMES.map((n, i) => [i, n]), 2)}</select></div></div>
      <label class="f" for="k-desc">Description</label><input id="k-desc" type="text" maxlength="240">`, "Create track", () => {
      const name = val("k-name"); if (!name) { toast("Please enter a track name."); return false; }
      const t = { id: "u-" + uid(), name: name.slice(0, 40), icon: val("k-icon").slice(0, 4) || "📘", c: Math.round(clamp(+val("k-c") || 0, 0, 9)), desc: val("k-desc").slice(0, 240) };
      state.custom.tracks.push(t); invalidate(); save(); toast("✅ Track created - now add topics to it"); location.hash = "#/track/" + encodeURIComponent(t.id); render(); return true;
    });
  }
  function noteDialog(id) {
    const n = id ? state.notes.find((x) => x.id === id) : null;
    openModal(n ? "Edit note" : "New note", `<label class="f" for="nt-t">Title</label><input id="nt-t" type="text" maxlength="120" value="${esc(n ? n.title : "")}">
      <label class="f" for="nt-g">Tag</label><select class="w100" id="nt-g">${opts(NOTE_TAGS, n ? n.tag : "General")}</select>
      <label class="f" for="nt-b">Note</label><textarea class="mh220" id="nt-b" maxlength="30000" placeholder="Write anything: formulas, SQL snippets, interview feedback, mistakes…">${esc(n ? n.body : "")}</textarea>
      ${n ? `<div class="mt-s"><button class="btn small danger" data-action="note-del" data-id="${esc(n.id)}">🗑 Delete note</button></div>` : ""}`, "Save note", () => {
      const title = val("nt-t"), body = document.getElementById("nt-b").value;
      if (!title && !body.trim()) { toast("Write something first."); return false; }
      const o = { title: title.slice(0, 120), body: body.slice(0, 30000), tag: val("nt-g"), u: Date.now() };
      if (n) Object.assign(n, o); else state.notes.push(Object.assign({ id: uid() }, o));
      save(); render(); toast("📝 Note saved"); return true;
    });
  }
  function projectDialog(id, src) {
    const p = id ? state.projects.find((x) => x.id === id) : null, s = src ? C.PROJECTS.find((x) => x.id === src) : null;
    const v = p || (s ? { title: s.title, tools: s.tools, desc: s.desc, steps: s.steps.split("|"), link: "", stage: "Idea", notes: "" } : { title: "", tools: "", desc: "", steps: [], link: "", stage: "Idea", notes: "" });
    openModal(p ? "Edit project" : s ? "Add suggested project" : "New project", `<label class="f" for="pj-t">Title</label><input id="pj-t" type="text" maxlength="120" value="${esc(v.title)}">
      <label class="f" for="pj-tools">Tools</label><input id="pj-tools" type="text" maxlength="160" value="${esc(v.tools)}">
      <label class="f" for="pj-d">Description</label><textarea class="mh70" id="pj-d" maxlength="500">${esc(v.desc)}</textarea>
      <div class="cols2"><div><label class="f" for="pj-s">Stage</label><select class="w100" id="pj-s">${opts(PROJ_STAGES, v.stage)}</select></div><div><label class="f" for="pj-l">GitHub / demo link (https)</label><input id="pj-l" type="url" maxlength="300" value="${esc(v.link)}" placeholder="https://github.com/…"></div></div>
      <label class="f" for="pj-steps">Steps / checklist (one per line)</label><textarea id="pj-steps" maxlength="4000">${esc(v.steps.join("\n"))}</textarea>`, "Save project", () => {
      const title = val("pj-t"); if (!title) { toast("Please enter a title."); return false; }
      const link = val("pj-l"); if (link && !safeUrl(link)) { toast("Link must start with http:// or https://"); return false; }
      const steps = val("pj-steps").split(/\r?\n/).map((x) => x.trim().slice(0, 160)).filter(Boolean).slice(0, 40);
      const o = { title: title.slice(0, 120), tools: val("pj-tools").slice(0, 160), desc: val("pj-d").slice(0, 500), stage: val("pj-s"), link: safeUrl(link), steps: steps };
      if (p) { const old = { steps: p.steps.slice(), done: Object.assign({}, p.done) }; Object.assign(p, o); p.done = keepChecks(old, steps); }
      else state.projects.push(Object.assign({ id: uid(), src: s ? s.id : "", done: {}, notes: "" }, o));
      save(); render(); toast("🚀 Project saved"); return true;
    });
  }
  function keepChecks(old, steps) { const d = {}; const od = old.done || {}; steps.forEach((st, i) => { const j = old.steps.indexOf(st); if (j >= 0 && od[j]) d[i] = 1; }); return d; }
  function jobDialog(id) {
    const j = id ? state.jobs.find((x) => x.id === id) : null;
    openModal(j ? "Edit application" : "Add application", `<div class="cols2"><div><label class="f" for="j-c">Company</label><input id="j-c" type="text" maxlength="100" value="${esc(j ? j.company : "")}"></div><div><label class="f" for="j-r">Role</label><input id="j-r" type="text" maxlength="120" value="${esc(j ? j.role : "")}" placeholder="Data Analyst"></div></div>
      <div class="cols2"><div><label class="f" for="j-s">Stage</label><select class="w100" id="j-s">${opts(JOB_STAGES, j ? j.stage : "Wishlist")}</select></div><div><label class="f" for="j-l">Posting link (https)</label><input id="j-l" type="url" maxlength="400" value="${esc(j ? j.link : "")}"></div></div>
      <div class="cols2"><div><label class="f" for="j-a">Applied on</label><input id="j-a" type="date" value="${esc(j ? j.applied : "")}"></div><div><label class="f" for="j-f">Follow-up date</label><input id="j-f" type="date" value="${esc(j ? j.follow : "")}"></div></div>
      <label class="f" for="j-n">Notes (contacts, referral, interview rounds…)</label><textarea id="j-n" maxlength="2000">${esc(j ? j.notes : "")}</textarea>
      <p class="tiny muted mt-s">Tip: do not store passwords or personal ID numbers here.</p>`, "Save", () => {
      const company = val("j-c"); if (!company) { toast("Company name is required."); return false; }
      const link = val("j-l"); if (link && !safeUrl(link)) { toast("Link must start with http:// or https://"); return false; }
      const o = { company: company.slice(0, 100), role: val("j-r").slice(0, 120), stage: val("j-s"), link: safeUrl(link), applied: dstr(val("j-a")), follow: dstr(val("j-f")), notes: val("j-n").slice(0, 2000) };
      if (j) Object.assign(j, o); else state.jobs.push(Object.assign({ id: uid() }, o));
      save(); render(); toast("💼 Saved"); return true;
    });
  }
  function qDialog() {
    const tl = tracks().map((t) => [t.id, t.icon + " " + t.name]);
    openModal("Add interview question", `<label class="f" for="q-t">Track</label><select class="w100" id="q-t">${opts(tl, "sql")}</select><label class="f" for="q-q">Question</label><input id="q-q" type="text" maxlength="300"><label class="f" for="q-a">Your model answer</label><textarea class="mh140" id="q-a" maxlength="3000"></textarea>`, "Add", () => {
      const q = val("q-q"); if (!q) { toast("Enter the question."); return false; }
      state.myqs.push({ id: "m" + uid(), track: val("q-t"), q: q.slice(0, 300), a: val("q-a").slice(0, 3000) }); save(); render(); toast("➕ Question added"); return true;
    });
  }

  /* timer */
  function startTimer(mins, topic) { state.timer = { run: true, end: Date.now() + mins * 60000, mins: mins, topic: topic || "" }; save(); render(); }
  function finishTimer() { const t = state.timer; if (!t) return; addLog(t.mins, t.topic, "Focus session"); state.timer = null; save(); beep(); toast("🎉 Session complete - " + t.mins + " min logged!"); render(); }
  function beep() { try { const ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain(); o.connect(g); g.connect(ac.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.12, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8); o.start(); o.stop(ac.currentTime + 0.8); } catch (e) { /* audio not available */ } }
  function updatePill() { const pill = $("#timerPill"), t = state.timer; if (!t) { pill.hidden = true; return; } pill.hidden = false; pill.textContent = (t.run ? "⏱ " : "⏸ ") + mmss(timerLeft()); }
  setInterval(() => {
    const t = state.timer; if (!t) return;
    if (t.run && timerLeft() <= 0) { finishTimer(); return; }
    updatePill(); const f = $("#tface"); if (f) { f.textContent = mmss(timerLeft()); const b = $(".meter i", f.parentNode); if (b) { b.style.transition = "none"; b.style.width = (100 - (timerLeft() / (t.mins * 60000)) * 100) + "%"; } }
  }, 500);
  if (state.timer && state.timer.run && state.timer.end <= Date.now()) { state.timer = null; save(); setTimeout(() => toast("⏱ A timer ended while the app was closed - add the time manually if you studied."), 600); }

  /* export / import */
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type: type })), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function exportNotes() {
    let md = "# My Study Notes\n\n";
    state.notes.forEach((n) => { md += "## " + (n.title || "Untitled") + "  _(" + n.tag + ")_\n\n" + n.body + "\n\n"; });
    flat().forEach((t) => { const p = P(t.id); if (p && p.n && p.n.trim()) md += "## " + t.title + "  _(topic)_\n\n" + p.n + "\n\n"; });
    download("study-notes-" + today() + ".md", md, "text/markdown"); toast("⬇ Notes exported");
  }
  function importFile() {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
    inp.addEventListener("change", () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      if (f.size > 5 * 1024 * 1024) { toast("File too large (max 5 MB)."); return; }
      const r = new FileReader();
      r.onload = () => {
        let data; try { data = JSON.parse(String(r.result)); } catch (e) { toast("That file is not valid JSON."); return; }
        if (!data || typeof data !== "object" || !data.profile) { toast("This does not look like a DataPath backup."); return; }
        const clean = sanitize(data);
        ask("Replace current data?", "This replaces ALL current progress, notes, logs and jobs with the backup (" + Object.keys(clean.progress).length + " topics, " + clean.notes.length + " notes, " + clean.log.length + " log entries). Export first if unsure.", "Replace", () => { state = clean; invalidate(); applyTheme(); save(); flush(); render(); toast("✅ Backup restored"); });
      };
      r.readAsText(f);
    });
    inp.click();
  }

  /* ----------------------------------------------------------- event wiring */
  const actions = {
    "open-menu": () => $("#app").classList.add("menu-open"),
    "close-menu": () => $("#app").classList.remove("menu-open"),
    "toggle-theme": () => { state.theme = isDark() ? "light" : "dark"; applyTheme(); save(); renderSidebar(); },
    "set-role": (el) => { state.profile.role = el.dataset.role; ui.planRole = ""; save(); render(); toast("Weightage switched to " + C.ROLES[state.profile.role]); },
    "quick-log": () => logDialog(""),
    "log-topic": (el) => logDialog(el.dataset.id),
    "toggle-topic": (el) => { const id = el.dataset.id; if (ui.open.has(id)) ui.open.delete(id); else ui.open.add(id); render(); },
    "star": (el) => { const p = ensure(el.dataset.id), n = +el.dataset.n; p.cf = p.cf === n ? 0 : n; p.u = Date.now(); save(); render(); },
    "revised": (el) => { const t = topicById(el.dataset.id), p = P(el.dataset.id); if (!t || !p) return; p.rev = (p.rev || 0) + 1; p.last = Date.now(); save(); render(); toast("🔁 Revision logged - great for retention!"); },
    "tf": (el) => { ui.tf[el.dataset.k] = el.dataset.v; render(); },
    "add-track": trackDialog,
    "add-topic": (el) => topicDialog("", el.dataset.track || (route()[0] === "track" ? route()[1] : "")),
    "edit-topic": (el) => topicDialog(el.dataset.id),
    "del-topic": (el) => { const t = topicById(el.dataset.id); if (t) ask("Delete topic?", "Delete “" + t.title + "” and its progress and notes?", "Delete", () => { state.custom.topics = state.custom.topics.filter((x) => x.id !== t.id); delete state.progress[t.id]; invalidate(); save(); render(); toast("Topic deleted"); }); },
    "del-track": (el) => { const t = trackById(el.dataset.id); if (t) ask("Delete track?", "Delete the track “" + t.name + "” with all its topics, progress and notes?", "Delete", () => { t.topics.forEach((x) => { delete state.progress[x.id]; }); state.custom.topics = state.custom.topics.filter((x) => x.track !== t.id); state.custom.tracks = state.custom.tracks.filter((x) => x.id !== t.id); invalidate(); save(); location.hash = "#/skills"; render(); toast("Track deleted"); }); },
    "modal-close": closeModal,
    "modal-save": () => { if (modalSave && modalSave() !== false) closeModal(); },
    "preset": (el) => { const i = $("#tmins"); if (i) i.value = el.dataset.m; },
    "timer-start": () => { const m = Math.round(+val("tmins")); if (!(m >= 1 && m <= 600)) { toast("Choose 1-600 minutes."); return; } startTimer(m, val("ttopic")); },
    "timer-quick": () => { startTimer(25, ""); toast("▶ 25-minute focus started"); },
    "timer-pause": () => { const t = state.timer; if (t && t.run) { t.left = timerLeft(); t.run = false; delete t.end; save(); render(); } },
    "timer-resume": () => { const t = state.timer; if (t && !t.run) { t.end = Date.now() + t.left; t.run = true; delete t.left; save(); render(); } },
    "timer-reset": () => ask("Cancel session?", "The running session will be discarded and no time will be logged.", "Cancel session", () => { state.timer = null; save(); render(); }),
    "log-del": (el) => { state.log = state.log.filter((e) => e.id !== el.dataset.id); save(); render(); },
    "pr-flip": () => { ui.pr.show = !ui.pr.show; render(); },
    "pr-next": () => { ui.pr.i = (ui.pr.i + 1) % Math.max(1, deck().length); ui.pr.show = false; render(); },
    "pr-prev": () => { const n = Math.max(1, deck().length); ui.pr.i = (ui.pr.i - 1 + n) % n; ui.pr.show = false; render(); },
    "pr-mark": (el) => { const id = el.dataset.id, v = el.dataset.v; if (state.qs[id] === v) delete state.qs[id]; else state.qs[id] = v; save(); ui.pr.show = false; if (ui.pr.mode === "card" && ui.pr.f !== "all") { /* card leaves deck; index now points to the next one */ } else if (ui.pr.mode === "card") ui.pr.i = (ui.pr.i + 1) % Math.max(1, deck().length); render(); },
    "pr-mode": (el) => { ui.pr.mode = el.dataset.v; ui.pr.show = false; render(); },
    "pr-shuffle": () => { const d = deck(); ui.pr.i = Math.floor(Math.random() * Math.max(1, d.length)); ui.pr.show = false; ui.pr.mode = "card"; render(); },
    "pr-add": qDialog,
    "pr-del": (el) => { state.myqs = state.myqs.filter((q) => q.id !== el.dataset.id); delete state.qs[el.dataset.id]; save(); render(); },
    "note-new": () => noteDialog(""),
    "note-edit": (el) => noteDialog(el.dataset.id),
    "note-del": (el) => { const id = el.dataset.id; closeModal(); ask("Delete note?", "This cannot be undone.", "Delete", () => { state.notes = state.notes.filter((n) => n.id !== id); save(); render(); toast("Note deleted"); }); },
    "ntag": (el) => { ui.ntag = el.dataset.v; render(); },
    "notes-export": exportNotes,
    "proj-new": () => projectDialog("", ""),
    "proj-from": (el) => projectDialog("", el.dataset.id),
    "proj-edit": (el) => projectDialog(el.dataset.id),
    "proj-del": (el) => { const id = el.dataset.id; ask("Delete project?", "This cannot be undone.", "Delete", () => { state.projects = state.projects.filter((p) => p.id !== id); save(); render(); }); },
    "job-new": () => jobDialog(""),
    "job-edit": (el) => jobDialog(el.dataset.id),
    "job-del": (el) => { const id = el.dataset.id; ask("Delete application?", "This cannot be undone.", "Delete", () => { state.jobs = state.jobs.filter((j) => j.id !== id); save(); render(); }); },
    "export": () => { flush(); download("datapath-backup-" + today() + ".json", JSON.stringify(state, null, 2), "application/json"); toast("⬇ Backup downloaded - store it somewhere private"); },
    "import": importFile,
    "reset": () => ask("Reset everything?", "This permanently deletes all progress, notes, logs, projects and applications in this browser. Export a backup first if you might need it.", "Delete everything", () => { state = defaults(); invalidate(); applyTheme(); save(); flush(); location.hash = "#/dashboard"; render(); toast("All data reset"); })
  };
  document.addEventListener("click", (e) => { const el = e.target.closest("[data-action]"); if (!el) return; const fn = actions[el.dataset.action]; if (fn) { if (el.tagName === "A") e.preventDefault(); fn(el, e); } });
  document.addEventListener("click", (e) => { if (e.target.closest(".nav a") || e.target.closest(".search-results a")) { $("#app").classList.remove("menu-open"); } });

  const changes = {
    status: (el) => setStatus(el.dataset.id, el.value),
    sub: (el) => toggleSub(el.dataset.id, +el.dataset.i, el.checked),
    tpri: (el) => { ui.tf.pri = el.value; render(); },
    tsort: (el) => { ui.tf.sort = el.value; render(); },
    planRole: (el) => { ui.planRole = el.value; render(); },
    prtrack: (el) => { ui.pr.track = el.value; ui.pr.i = 0; ui.pr.show = false; render(); },
    prf: (el) => { ui.pr.f = el.value; ui.pr.i = 0; ui.pr.show = false; render(); },
    pstage: (el) => { const p = state.projects.find((x) => x.id === el.dataset.id); if (p && PROJ_STAGES.includes(el.value)) { p.stage = el.value; save(); render(); } },
    pstep: (el) => { const p = state.projects.find((x) => x.id === el.dataset.id); if (p) { if (el.checked) p.done[el.dataset.i] = 1; else delete p.done[el.dataset.i]; save(); render(); } },
    jstage: (el) => { const j = state.jobs.find((x) => x.id === el.dataset.id); if (j && JOB_STAGES.includes(el.value)) { j.stage = el.value; if (el.value === "Applied" && !j.applied) j.applied = today(); save(); render(); if (el.value === "Offer") toast("🎉 Congratulations on the offer!"); } },
    pf: (el) => {
      const k = el.dataset.k, p = state.profile;
      if (k === "name") p.name = el.value.trim().slice(0, 60) || "Learner";
      else if (k === "role" && ["A", "S", "M"].includes(el.value)) p.role = el.value;
      else if (k === "target") p.target = dstr(el.value);
      else if (k === "goal") p.goal = num(el.value, 0.25, 16, 2);
      else if (k === "planStart") p.planStart = dstr(el.value) || today();
      else if (k === "theme" && ["auto", "light", "dark"].includes(el.value)) { state.theme = el.value; applyTheme(); }
      save(); renderSidebar(); toast("Saved");
    }
  };
  document.addEventListener("change", (e) => { const el = e.target.closest("[data-change]"); if (el && changes[el.dataset.change]) changes[el.dataset.change](el); });

  let noteTimers = {};
  document.addEventListener("input", (e) => {
    const el = e.target.closest("[data-input]"); if (!el) return;
    const k = el.dataset.input;
    if (k === "tnote") {
      const id = el.dataset.id; if (!topicById(id)) return;
      const p = ensure(id); p.n = el.value.slice(0, 20000); p.u = Date.now(); save();
      const sv = document.getElementById("sv-" + id); if (sv) { sv.textContent = "saving…"; clearTimeout(noteTimers[id]); noteTimers[id] = setTimeout(() => { sv.textContent = "saved ✓"; }, 500); }
    } else if (k === "tq") { ui.tf.q = el.value; const pos = el.selectionStart; render(); const n = $(".search-in"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    else if (k === "nq") { ui.nq = el.value; const pos = el.selectionStart; render(); const n = $(".search-in"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
  });

  /* global search */
  const gs = $("#gsearch"), sr = $("#sresults");
  function runSearch() {
    const q = gs.value.trim().toLowerCase();
    if (q.length < 2) { sr.hidden = true; sr.innerHTML = ""; return; }
    const hits = [];
    tracks().forEach((tr) => tr.topics.forEach((t) => { const inT = t.title.toLowerCase().includes(q), sub = t.subs.find((s) => s.toLowerCase().includes(q)); if (inT || sub) hits.push({ tr, t, sub: inT ? "" : sub }); }));
    sr.innerHTML = hits.length ? hits.slice(0, 8).map((h) => `<a href="${topicLink(h.t)}"><span class="tico sm ${tcls(h.tr)}">${esc(h.tr.icon)}</span><span><b>${esc(h.t.title)}</b><small>${esc(h.tr.name)}${h.sub ? " · " + esc(h.sub) : ""}</small></span></a>`).join("") : `<div class="muted small pad14">No matching topics</div>`;
    sr.hidden = false;
  }
  gs.addEventListener("input", runSearch);
  gs.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = $("a", sr); if (a) { location.hash = a.getAttribute("href"); gs.value = ""; sr.hidden = true; gs.blur(); } } if (e.key === "Escape") { gs.value = ""; sr.hidden = true; gs.blur(); } });
  document.addEventListener("click", (e) => { if (!e.target.closest("#searchBox")) sr.hidden = true; else if (e.target.closest(".search-results a")) { gs.value = ""; sr.hidden = true; } });
  document.addEventListener("keydown", (e) => {
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "")) || e.target.isContentEditable;
    if (e.key === "/" && !inField && !modal.open) { e.preventDefault(); gs.focus(); gs.select(); return; }
    if (inField || modal.open || route()[0] !== "practice" || ui.pr.mode !== "card") return;
    const q = deck()[ui.pr.i]; if (!q) return;
    if (e.key === " ") { e.preventDefault(); actions["pr-flip"](); }
    else if (e.key === "ArrowRight") actions["pr-next"]();
    else if (e.key === "ArrowLeft") actions["pr-prev"]();
    else if (e.key.toLowerCase() === "k") actions["pr-mark"]({ dataset: { id: q.id, v: "known" } });
    else if (e.key.toLowerCase() === "r") actions["pr-mark"]({ dataset: { id: q.id, v: "review" } });
  });

  window.addEventListener("hashchange", render);
  if (window.matchMedia) { const mq = window.matchMedia("(prefers-color-scheme: dark)"); if (mq.addEventListener) mq.addEventListener("change", () => { if (state.theme === "auto") renderSidebar(); }); }
  applyTheme();
  if (!location.hash) location.hash = "#/dashboard";
  render();
})();
