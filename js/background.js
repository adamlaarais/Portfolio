(function () {
  'use strict';

  // ---- Perlin noise 2D ----
  const _perm = new Uint8Array(512);
  const _g2   = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  (function () {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) _perm[i] = p[i & 255];
  })();
  function _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function _dot2(g, x, y) { return g[0] * x + g[1] * y; }
  function _lerp(a, b, t) { return a + t * (b - a); }
  function noise(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = _fade(x), v = _fade(y);
    const a = _perm[X] + Y, b = _perm[X + 1] + Y;
    return _lerp(
      _lerp(_dot2(_g2[_perm[a    ] & 7], x,     y    ), _dot2(_g2[_perm[b    ] & 7], x - 1, y    ), u),
      _lerp(_dot2(_g2[_perm[a + 1] & 7], x,     y - 1), _dot2(_g2[_perm[b + 1] & 7], x - 1, y - 1), u),
      v
    );
  }

  // ---- Canvas ----
  const canvas  = document.getElementById('wave-bg');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const off  = document.createElement('canvas');
  const octx = off.getContext('2d');
  const lcanvas = document.getElementById('loader-bg');
  const lctx    = lcanvas ? lcanvas.getContext('2d') : null;

  // ---- Marching squares table ----
  // Bit encoding: TL=8, TR=4, BR=2, BL=1
  // Edge encoding: 0=top, 1=right, 2=bottom, 3=left
  const MS = [
    [],                  // 0  0000
    [[3, 2]],            // 1  0001  BL
    [[2, 1]],            // 2  0010  BR
    [[3, 1]],            // 3  0011  BL+BR
    [[0, 1]],            // 4  0100  TR
    [[0, 1], [3, 2]],    // 5  0101  saddle TR+BL
    [[0, 2]],            // 6  0110  TR+BR
    [[0, 3]],            // 7  0111  not-TL
    [[0, 3]],            // 8  1000  TL
    [[0, 2]],            // 9  1001  TL+BL
    [[0, 3], [1, 2]],    // 10 1010  saddle TL+BR
    [[0, 1]],            // 11 1011  not-TR
    [[3, 1]],            // 12 1100  TL+TR
    [[2, 1]],            // 13 1101  not-BR
    [[3, 2]],            // 14 1110  not-BL
    [],                  // 15 1111
  ];

  const CELL   = 9;    // grid cell size px
  const LEVELS = 16;   // iso-contour count
  const NFREQ  = 0.0022;
  const GAIN   = 1.35; // widen noise range so all levels are visible
  const SPEED  = 0.00020;
  const PULL_R = 300;
  const GLOW_R = 300;

  const CFG = {
    baseOpaDark:  0.14,
    glowOpaDark:  0.42,
    baseOpaLight: 0.09,
    glowOpaLight: 0.26,
  };

  let W = 0, H = 0, time = 0;
  let cols = 0, rows = 0, grid = null;
  let mx = -9999, my = -9999, lx = -9999, ly = -9999;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    W = canvas.width  = off.width  = window.innerWidth;
    H = canvas.height = off.height = window.innerHeight;
    if (lcanvas) { lcanvas.width = W; lcanvas.height = H; }
    cols = Math.ceil(W / CELL) + 2;
    rows = Math.ceil(H / CELL) + 2;
    grid = new Float32Array(cols * rows);
  }

  function buildGrid() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = noise(c * CELL * NFREQ, r * CELL * NFREQ + time) * GAIN;
        grid[r * cols + c] = v < -1 ? -1 : v > 1 ? 1 : v;
      }
    }
  }

  function colors() {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    return dark
      ? { rgb: '255,255,255', base: CFG.baseOpaDark,  glow: CFG.glowOpaDark  }
      : { rgb: '10,10,10',    base: CFG.baseOpaLight, glow: CFG.glowOpaLight };
  }

  // reusable variables to avoid per-call allocation
  let _x1 = 0, _y1 = 0;
  function edgePt(e, cx, cy, TL, TR, BR, BL, T) {
    let ax, ay, va, bx, by, vb;
    if      (e === 0) { ax = cx;        ay = cy;        va = TL; bx = cx + CELL; by = cy;        vb = TR; }
    else if (e === 1) { ax = cx + CELL; ay = cy;        va = TR; bx = cx + CELL; by = cy + CELL; vb = BR; }
    else if (e === 2) { ax = cx;        ay = cy + CELL; va = BL; bx = cx + CELL; by = cy + CELL; vb = BR; }
    else              { ax = cx;        ay = cy;        va = TL; bx = cx;        by = cy + CELL; vb = BL; }
    const t = Math.abs(vb - va) < 1e-9 ? 0.5 : (T - va) / (vb - va);
    _x1 = ax + t * (bx - ax);
    _y1 = ay + t * (by - ay);
  }

  function pull(x, y) {
    const dx = x - lx, dy = y - ly;
    const d  = dx * dx + dy * dy;
    if (d >= PULL_R * PULL_R || d === 0) return;
    const dist = Math.sqrt(d);
    const f    = (1 - dist / PULL_R) * (1 - dist / PULL_R) * 0.13;
    _x1 = x + (lx - x) * f;
    _y1 = y + (ly - y) * f;
  }

  function drawContours(c, opa, rgb) {
    c.lineCap     = 'butt';
    c.lineWidth   = 1;
    c.strokeStyle = 'rgba(' + rgb + ',' + opa + ')';
    const doPull  = lx > -1000;

    c.beginPath();

    for (let li = 0; li < LEVELS; li++) {
      const T = -0.9 + (1.8 / (LEVELS - 1)) * li;

      for (let r = 0; r < rows - 1; r++) {
        for (let col = 0; col < cols - 1; col++) {
          const TL = grid[r       * cols + col    ];
          const TR = grid[r       * cols + col + 1];
          const BR = grid[(r + 1) * cols + col + 1];
          const BL = grid[(r + 1) * cols + col    ];

          const caseIdx = ((TL > T) ? 8 : 0)
                        | ((TR > T) ? 4 : 0)
                        | ((BR > T) ? 2 : 0)
                        | ((BL > T) ? 1 : 0);

          const segs = MS[caseIdx];
          if (!segs.length) continue;

          const cx = col * CELL;
          const cy = r   * CELL;

          for (let s = 0; s < segs.length; s++) {
            const [e1, e2] = segs[s];

            edgePt(e1, cx, cy, TL, TR, BR, BL, T);
            let x1 = _x1, y1 = _y1;
            if (doPull) { pull(x1, y1); x1 = _x1; y1 = _y1; }

            edgePt(e2, cx, cy, TL, TR, BR, BL, T);
            let x2 = _x1, y2 = _y1;
            if (doPull) { pull(x2, y2); x2 = _x1; y2 = _y1; }

            c.moveTo(x1, y1);
            c.lineTo(x2, y2);
          }
        }
      }
    }

    c.stroke();
  }

  function tick() {
    if (!reduced) time += SPEED;
    lx += (mx - lx) * 0.08;
    ly += (my - ly) * 0.08;

    buildGrid();
    ctx.clearRect(0, 0, W, H);
    const { rgb, base, glow } = colors();

    drawContours(ctx, base, rgb);

    if (lx > -1000) {
      octx.clearRect(0, 0, W, H);
      octx.globalCompositeOperation = 'source-over';
      drawContours(octx, glow, rgb);

      const grad = octx.createRadialGradient(lx, ly, 0, lx, ly, GLOW_R);
      grad.addColorStop(0,    'rgba(0,0,0,1)');
      grad.addColorStop(0.55, 'rgba(0,0,0,0.45)');
      grad.addColorStop(1,    'rgba(0,0,0,0)');
      octx.globalCompositeOperation = 'destination-in';
      octx.fillStyle = grad;
      octx.fillRect(0, 0, W, H);

      ctx.drawImage(off, 0, 0);
    }

    // mirror to loader canvas while it's visible
    if (lctx && document.documentElement.classList.contains('loading')) {
      lctx.clearRect(0, 0, W, H);
      lctx.drawImage(canvas, 0, 0);
    }
  }

  // ---- Boot ----
  resize();
  window.addEventListener('resize',    resize,                                           { passive: true });
  window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

  if (reduced) {
    buildGrid(); tick();
  } else if (window.gsap) {
    gsap.ticker.add(tick);
  } else {
    (function loop() { tick(); requestAnimationFrame(loop); })();
  }
})();
