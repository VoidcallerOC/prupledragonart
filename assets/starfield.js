/* Interactive starfield behind the page content.
   - Fixed full-viewport canvas, pointer-events: none (never captures clicks or scroll).
   - Fine pointer: stars spring toward the cursor and are dragged along by its motion,
     leaving short trails, then ease back home when the pointer stops.
   - Touch / no hover: gentle ambient drift only.
   - prefers-reduced-motion: one still frame, no trails, no pointer response.
   - Stars behind text blocks and buttons are drawn dimmer to keep copy readable. */
(function () {
  'use strict';
  var canvas = document.querySelector('.starfield');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Restrained violet, amber, pink and cool white, weighted toward white.
  var PALETTE = [
    { rgb: '232,238,255', w: 0.44 }, // cool white
    { rgb: '186,158,255', w: 0.20 }, // violet
    { rgb: '244,198,120', w: 0.19 }, // amber
    { rgb: '255,146,206', w: 0.17 }  // pink
  ];
  var LAYERS = [ // depth drives size, brightness, parallax and pointer pull
    { depth: 0.35, share: 0.48, r: [0.8, 1.3], a: [0.45, 0.70] },
    { depth: 0.65, share: 0.34, r: [1.2, 1.8], a: [0.60, 0.85] },
    { depth: 1.00, share: 0.18, r: [1.7, 2.5], a: [0.80, 1.00] }
  ];
  var DIM_SELECTORS = '.site-header .wrap, .hero-top, .head, .cap, .label, .btn, .hio-intro, .k-copy, .ff-row, .site-footer .wrap';

  var W = 0, H = 0, DPR = 1;
  var stars = [];
  var sprites = {};
  var dimRects = [];
  var pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999, vx: 0, vy: 0, energy: 0, active: false };
  var scrollY = window.scrollY || 0;
  var running = false, last = 0, frameMs = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick() {
    var t = Math.random(), acc = 0;
    for (var i = 0; i < PALETTE.length; i++) { acc += PALETTE[i].w; if (t <= acc) return PALETTE[i].rgb; }
    return PALETTE[0].rgb;
  }

  // Soft round sprite per color: bright core with a glow falloff.
  function sprite(rgb) {
    if (sprites[rgb]) return sprites[rgb];
    var s = document.createElement('canvas'), n = 64;
    s.width = s.height = n;
    var g = s.getContext('2d');
    var grad = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    grad.addColorStop(0, 'rgba(' + rgb + ',1)');
    grad.addColorStop(0.22, 'rgba(' + rgb + ',0.95)');
    grad.addColorStop(0.42, 'rgba(' + rgb + ',0.35)');
    grad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, n, n);
    return (sprites[rgb] = s);
  }

  function build() {
    stars = [];
    var count = Math.min(460, Math.max(150, Math.round((W * H) / 3800)));
    LAYERS.forEach(function (L) {
      var n = Math.round(count * L.share);
      for (var i = 0; i < n; i++) {
        var big = L.depth === 1 && Math.random() < 0.3; // a few larger points
        var hx = Math.random() * W, hy = Math.random() * H;
        stars.push({
          hx: hx, hy: hy, x: hx, y: hy, vx: 0, vy: 0,
          depth: L.depth,
          r: big ? rand(3, 4.4) : rand(L.r[0], L.r[1]),
          a: big ? rand(0.8, 1) : rand(L.a[0], L.a[1]),
          rgb: big ? (Math.random() < 0.5 ? PALETTE[1].rgb : PALETTE[2].rgb) : pick(),
          tw: rand(0.4, 1.4), ph: rand(0, Math.PI * 2),
          dx: rand(-0.06, 0.06) * L.depth, dy: rand(-0.05, 0.02) * L.depth
        });
      }
    });
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
    measure();
    if (!running) draw(performance.now(), true);
  }

  function measure() {
    dimRects = [];
    var els = document.querySelectorAll(DIM_SELECTORS);
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.bottom > -40 && r.top < H + 40 && r.width > 0) dimRects.push([r.left - 8, r.top - 8, r.right + 8, r.bottom + 8]);
    }
  }
  function dimAt(x, y) {
    for (var i = 0; i < dimRects.length; i++) {
      var q = dimRects[i];
      if (x > q[0] && x < q[2] && y > q[1] && y < q[3]) return 0.32;
    }
    return 1;
  }

  function interactive() { return fineMQ.matches && !reduceMQ.matches; }

  function step(dt) {
    var k = dt / 16.67;
    // Pointer smoothing and energy: energy rises with movement and decays when it stops.
    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, 0.35 * k);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, 0.35 * k);
    pointer.energy *= Math.pow(0.955, k);
    pointer.vx *= Math.pow(0.86, k); pointer.vy *= Math.pow(0.86, k);

    var R = Math.max(220, Math.min(340, W * 0.22));
    var useP = interactive() && pointer.active;
    var ambient = !fineMQ.matches; // touch: drift only

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      // Ambient drift (stronger on touch screens), wrapping at the edges.
      var drift = ambient ? 1 : 0.35;
      s.hx += s.dx * drift * k; s.hy += s.dy * drift * k;
      if (s.hx < -10) s.hx += W + 20; else if (s.hx > W + 10) s.hx -= W + 20;
      if (s.hy < -10) s.hy += H + 20; else if (s.hy > H + 10) s.hy -= H + 20;

      // Springs work in home space; scroll parallax is applied only when drawing,
      // so scrolling never turns into trails.
      var tx = s.hx, ty = s.hy;

      if (useP && pointer.energy > 0.01) {
        var ddx = pointer.sx - tx, ddy = pointer.sy - wrapY(ty - parallax(s));
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < R) {
          var f = 1 - d / R; f = f * f;
          var pull = Math.min(d, 120) * f * (0.4 + 0.6 * s.depth) * pointer.energy;
          var inv = d > 0.001 ? 1 / d : 0;
          tx += ddx * inv * pull + pointer.vx * 12 * f * s.depth;
          ty += ddy * inv * pull + pointer.vy * 12 * f * s.depth;
        }
      }
      // Spring toward the target with damping: gives the lag and trailing ease-back.
      s.vx = (s.vx + (tx - s.x) * 0.075 * k) * Math.pow(0.8, k);
      s.vy = (s.vy + (ty - s.y) * 0.075 * k) * Math.pow(0.8, k);
      s.x += s.vx * k; s.y += s.vy * k;
      // Keep the wrap seamless when the home position jumps across an edge.
      if (Math.abs(tx - s.x) > W * 0.5 || Math.abs(ty - s.y) > H * 0.5) { s.x = tx; s.y = ty; s.vx = s.vy = 0; }
    }
  }

  function parallax(s) { return (scrollY * 0.08 * s.depth) % (H + 20); }
  function wrapY(y) { var span = H + 20; return ((y + 10) % span + span) % span - 10; }

  function draw(now, still) {
    ctx.clearRect(0, 0, W, H);
    var t = now / 1000;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var x = still ? s.hx : s.x, y = still ? s.hy : wrapY(s.y - parallax(s));
      var tw = still ? 1 : 0.78 + 0.22 * Math.sin(t * s.tw + s.ph);
      var alpha = s.a * tw * dimAt(x, y);
      if (alpha < 0.02) continue;

      // Soft trail along the velocity.
      if (!still) {
        var sp = Math.abs(s.vx) + Math.abs(s.vy);
        if (sp > 0.35) {
          var len = Math.min(16, 1.5 + sp * 1.4);
          var ex = x - s.vx * len, ey = y - s.vy * len;
          var gr = ctx.createLinearGradient(x, y, ex, ey);
          gr.addColorStop(0, 'rgba(' + s.rgb + ',' + (alpha * 0.8).toFixed(3) + ')');
          gr.addColorStop(1, 'rgba(' + s.rgb + ',0)');
          ctx.strokeStyle = gr;
          ctx.lineWidth = Math.max(1, s.r * 1.2);
          ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
        }
      }
      var size = s.r * 6;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite(s.rgb), x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
  }

  function loop(now) {
    if (!running) return;
    var dt = last ? Math.min(50, now - last) : 16.67;
    last = now;
    var t0 = performance.now();
    step(dt);
    draw(now, false);
    frameMs = frameMs * 0.9 + (performance.now() - t0) * 0.1;
    requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMQ.matches) { running = false; draw(performance.now(), true); return; }
    if (running) return;
    running = true; last = 0;
    requestAnimationFrame(loop);
  }
  function applyMotionPref() {
    running = false;
    stars.forEach(function (s) { s.x = s.hx; s.y = s.hy; s.vx = s.vy = 0; });
    start();
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (!pointer.active) { pointer.sx = e.clientX; pointer.sy = e.clientY; }
    var mx = e.clientX - pointer.x, my = e.clientY - pointer.y;
    if (pointer.active) {
      pointer.vx = pointer.vx * 0.5 + Math.max(-40, Math.min(40, mx)) * 0.5;
      pointer.vy = pointer.vy * 0.5 + Math.max(-40, Math.min(40, my)) * 0.5;
      pointer.energy = Math.min(1, pointer.energy + Math.sqrt(mx * mx + my * my) / 70);
    }
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.active = false; }, { passive: true });
  window.addEventListener('blur', function () { pointer.active = false; });

  var measureQueued = false;
  function queueMeasure() {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(function () { measureQueued = false; scrollY = window.scrollY || 0; measure(); if (!running) draw(performance.now(), true); });
  }
  window.addEventListener('scroll', queueMeasure, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', queueMeasure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueMeasure);
  if (reduceMQ.addEventListener) { reduceMQ.addEventListener('change', applyMotionPref); fineMQ.addEventListener('change', applyMotionPref); }

  // Read-only hooks for local verification.
  canvas._starfield = {
    stars: function () { return stars; },
    pointer: pointer,
    running: function () { return running; },
    frameMs: function () { return frameMs; }
  };

  resize();
  start();
})();
