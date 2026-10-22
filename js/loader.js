/* js/loader.js — the loading ritual. Classic script (not a module) so it runs
   even if the module graph fails. Frames are inlined in index.html.

   A little figure walks a plug toward a socket. His walk speed is fixed in
   px/sec, so it looks the same on any screen. The counter is just how far
   he's walked. Real progress sets how far he's *allowed* to walk.

   Page code calls:  __loader.expect(n)  then  __loader.tick()  per asset.
   Fails open after 8s no matter what (and CSS has its own 8.5s fallback). */

(function (root) {
  'use strict';

  var SPEED_PX_S = 130;   // walk speed
  var FAIL_OPEN_MS = 8000;
  var CREEP = 0.12;       // how far he may walk before we know the asset count
  var SPARK_MS = 450;

  /* ---- pure helpers (unit-tested) ---- */
  function step(pos, target, dtSec, speed) {
    if (pos >= target) return target < pos ? pos : target; // never walks backwards
    return Math.min(target, pos + speed * dtSec);
  }
  function percent(pos, dist) {
    if (dist <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((pos / dist) * 100)));
  }
  function targetFor(loaded, total, dist, failedOpen) {
    if (failedOpen) return dist;
    if (!total) return dist * CREEP;
    return dist * Math.min(1, loaded / total);
  }
  root.LoaderMath = { step: step, percent: percent, targetFor: targetFor, SPEED_PX_S: SPEED_PX_S };

  if (typeof document === 'undefined') return;

  /* ---- DOM ---- */
  var html = document.documentElement;
  var el = document.getElementById('loader');
  if (!el) return;
  var countEl = el.querySelector('.ld-count');
  var srEl = el.querySelector('.ld-sr');
  var track = el.querySelector('.ld-track');
  var fig = el.querySelector('.ld-fig');
  var plug = el.querySelector('.ld-plug');
  var cable = el.querySelector('.ld-cable path');
  var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var total = 0, loaded = 0, failedOpen = false, finished = false;
  var pos = 0, last = 0, shown = -1;

  function geometry() {
    var w = track.clientWidth;
    return { start: 70, end: w - 74, w: w };   // figure x range inside the track
  }

  function renderCount(p) {
    if (p === shown) return;
    shown = p;
    var s = String(p), out = '';
    for (var i = 0; i < s.length; i++) out += '<span class="hw ld-d' + s[i] + '"></span>';
    countEl.innerHTML = out + '<span class="hw ld-dpct"></span>';
    if (p % 25 === 0 || p === 100) srEl.textContent = 'Loading ' + p + '%';
  }

  function renderFigure(g, moving) {
    var x = g.start + pos;
    fig.style.transform = 'translateX(' + x + 'px)';
    plug.style.transform = 'translateX(' + (x + 30) + 'px)';
    fig.classList.toggle('walking', moving && !reduce);
    // cable: from the power strip to the back of the plug, sagging a bit
    var x0 = 58, y0 = 44, x1 = x + 32, y1 = 40;
    var sag = 18 + Math.min(14, (x1 - x0) * 0.06);
    cable.setAttribute('d', 'M' + x0 + ' ' + y0 + ' Q' + ((x0 + x1) / 2) + ' ' + (Math.max(y0, y1) + sag) + ' ' + x1 + ' ' + y1);
  }

  function frame(now) {
    if (finished) return;
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    var g = geometry(), dist = Math.max(1, g.end - g.start);
    var target = targetFor(loaded, total, dist, failedOpen);
    var prev = pos;
    pos = reduce ? target : step(pos, target, dt, SPEED_PX_S);
    renderFigure(g, pos > prev + 0.01);
    renderCount(percent(pos, dist));
    if (pos >= dist) return plugIn();
    requestAnimationFrame(frame);
  }

  function plugIn() {
    if (finished) return;
    finished = true;
    var g = geometry();
    pos = Math.max(1, g.end - g.start);
    renderFigure(g, false);
    renderCount(100);
    el.classList.add('is-plugged');
    fig.classList.remove('walking');
    setTimeout(done, reduce ? 0 : SPARK_MS);
  }

  function done() {
    html.classList.add('is-loaded');
    html.classList.remove('is-loading');
    el.setAttribute('aria-busy', 'false');
    srEl.textContent = 'Loaded';
    root.dispatchEvent(new CustomEvent('loader:done'));
    setTimeout(function () { el.hidden = true; }, reduce ? 0 : 500);
  }

  function failOpen() {
    if (failedOpen) return;
    failedOpen = true;
    // rAF doesn't run in background tabs; make sure we finish anyway
    setTimeout(function () { if (!finished) plugIn(); }, 1200);
  }

  root.__loader = {
    expect: function (n) { total += n; },
    tick: function () { loaded++; },
    skip: failOpen,
    get done() { return html.classList.contains('is-loaded'); },
  };

  setTimeout(failOpen, FAIL_OPEN_MS);
  // impatient? click or press any key to hurry him along
  el.addEventListener('click', failOpen);
  root.addEventListener('keydown', function onKey() { failOpen(); root.removeEventListener('keydown', onKey); });

  renderCount(0);
  requestAnimationFrame(frame);
})(typeof window !== 'undefined' ? window : globalThis);
