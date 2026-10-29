/* 1hvt-chapter-2: moved from the older engine to NX on 2026-10-22. Generators unchanged; only the engine around them changed. */
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
  const f = n => (n < 0 ? '−' : '') + Math.abs(n);           // number with real minus
  const par = n => n < 0 ? '(' + f(n) + ')' : String(n);           // (−2)
  const pt = (x, y) => '(' + f(x) + ', ' + f(y) + ')';
  const linTxt = (a, b, v) => {                                    // "3x − 2"
    v = v || 'x'; let s = '';
    if (a === 1) s = v; else if (a === -1) s = '−' + v; else if (a !== 0) s = f(a) + v;
    if (b !== 0) s += (s === '' ? f(b) : (b < 0 ? ' − ' : ' + ') + Math.abs(b));
    return s === '' ? '0' : s;
  };
  const quadTxt = (a, c) => {                                      // "−x² + 3"
    let s = a === 1 ? 'x²' : a === -1 ? '−x²' : f(a) + 'x²';
    if (c !== 0) s += (c < 0 ? ' − ' : ' + ') + Math.abs(c);
    return s;
  };
  const ev = (a, b, x) => a * x + b;
  const subStep = (a, b, x, v) => {
    v = v || 'x';
    let s = a === 0 ? '' : (a === 1 ? par(x) : a === -1 ? '−' + par(x) : f(a) + ' · ' + par(x));
    if (b !== 0) s += (s === '' ? f(b) : (b < 0 ? ' − ' : ' + ') + Math.abs(b));
    return s + ' = ' + f(ev(a, b, x));
  };
  const tbl = (xs, ys, xl, yl) => {
    let h = '<table class="tbl"><tr><th>' + (xl || 'x') + '</th>' + xs.map(x => '<td>' + f(x) + '</td>').join('') + '</tr>';
    h += '<tr><th>' + (yl || 'y') + '</th>' + ys.map(y => '<td>' + (y === null ? '?' : f(y)) + '</td>').join('') + '</tr></table>';
    return h;
  };

  /* ---------- SVG grid ---------- */
  let gid = 0;
  function grid(o) {
    const u = 26, pad = 24, xmin = o.xmin, xmax = o.xmax, ymin = o.ymin, ymax = o.ymax;
    const w = (xmax - xmin) * u + 2 * pad, h = (ymax - ymin) * u + 2 * pad;
    const X = x => pad + (x - xmin) * u, Y = y => pad + (ymax - y) * u;
    const id = 'c' + (++gid);
    let s = '<svg class="grid" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="grid"' +
      (o.click ? ' data-click="1" data-xmin="' + xmin + '" data-ymax="' + ymax + '" data-u="' + u + '" data-pad="' + pad + '" data-w="' + w + '"' : '') + '>';
    s += '<defs><clipPath id="' + id + '"><rect x="' + X(xmin) + '" y="' + Y(ymax) + '" width="' + (xmax - xmin) * u + '" height="' + (ymax - ymin) * u + '"/></clipPath></defs>';
    s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#fff"/>';
    for (let x = xmin; x <= xmax; x++) s += '<line x1="' + X(x) + '" y1="' + Y(ymin) + '" x2="' + X(x) + '" y2="' + Y(ymax) + '" stroke="#dbe3ea" stroke-width="1"/>';
    for (let y = ymin; y <= ymax; y++) s += '<line x1="' + X(xmin) + '" y1="' + Y(y) + '" x2="' + X(xmax) + '" y2="' + Y(y) + '" stroke="#dbe3ea" stroke-width="1"/>';
    if (!o.plain) {
    s += '<line x1="' + X(xmin) + '" y1="' + Y(0) + '" x2="' + X(xmax) + '" y2="' + Y(0) + '" stroke="#334" stroke-width="1.6"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(ymin) + '" x2="' + X(0) + '" y2="' + Y(ymax) + '" stroke="#334" stroke-width="1.6"/>';
    s += '<text x="' + (X(xmax) + 4) + '" y="' + (Y(0) + 4) + '" font-size="12" font-style="italic" fill="#334">x</text>';
    s += '<text x="' + (X(0) + 6) + '" y="' + (Y(ymax) - 8) + '" font-size="12" font-style="italic" fill="#334">y</text>';
    const stx = xmax - xmin > 16 ? 2 : 1, sty = ymax - ymin > 16 ? 2 : 1;
    for (let x = xmin; x <= xmax; x++) if (x !== 0 && x % stx === 0) s += '<text x="' + X(x) + '" y="' + (Y(0) + 14) + '" font-size="10" text-anchor="middle" fill="#556">' + f(x) + '</text>';
    for (let y = ymin; y <= ymax; y++) if (y !== 0 && y % sty === 0) s += '<text x="' + (X(0) - 5) + '" y="' + (Y(y) + 3.5) + '" font-size="10" text-anchor="end" fill="#556">' + f(y) + '</text>';
    }
    (o.curves || []).forEach(c => {
      let d = '', pen = false;
      for (let x = xmin; x <= xmax + 1e-9; x += 0.05) {
        const y = c.f(x);
        if (y < ymin - 2 || y > ymax + 2) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); pen = true;
      }
      s += '<path d="' + d + '" fill="none" stroke="' + (c.color || '#d1471f') + '" stroke-width="2.4" clip-path="url(#' + id + ')"/>';
    });
    (o.polys || []).forEach(p => {
      s += '<polygon points="' + p.v.map(q => X(q[0]) + ',' + Y(q[1])).join(' ') + '" fill="' + (p.fill || 'rgba(27,95,168,.12)') + '" stroke="' + (p.color || '#1b5fa8') + '" stroke-width="2"/>';
      if (p.label) p.v.forEach((q, i) => { s += '<text x="' + (X(q[0]) + 7) + '" y="' + (Y(q[1]) - 7) + '" font-size="13" font-weight="700" fill="#123">' + p.label[i] + '</text>'; });
    });
    (o.segs || []).forEach(g => {
      s += '<line x1="' + X(g.a[0]) + '" y1="' + Y(g.a[1]) + '" x2="' + X(g.b[0]) + '" y2="' + Y(g.b[1]) + '" stroke="' + (g.color || '#d1471f') + '" stroke-width="' + (g.w || 2.4) + '"' + (g.dash ? ' stroke-dasharray="6 5"' : '') + '/>';
      if (g.label) s += '<text x="' + (X(g.b[0]) + 6) + '" y="' + (Y(g.b[1]) - 6) + '" font-size="14" font-weight="700" fill="' + (g.color || '#d1471f') + '">' + g.label + '</text>';
    });
    (o.pts || []).forEach(p => {
      s += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="4.6" fill="' + (p.color || '#1b5fa8') + '" stroke="#fff" stroke-width="1.2"/>';
      if (p.label) s += '<text x="' + (X(p.x) + 7) + '" y="' + (Y(p.y) - 7) + '" font-size="13" font-weight="700" fill="#123">' + p.label + '</text>';
    });
    (o.texts || []).forEach(t => { s += '<text x="' + X(t.x) + '" y="' + (Y(t.y) + 5) + '" font-size="14" font-weight="700" text-anchor="middle" fill="#123">' + t.t + '</text>'; });   // centred labels, e.g. corners placed outside a shape
    s += '<g class="marks"></g></svg>';
    return s;
  }

  /* ---------- Question builders. Each returns a question object ----------
     type: num | multi | point | choice | click
     correct: a right answer in "user format" (used by tests)                  */
  const G = {};   // section id -> array of generators (lvl)=>Q

  /* ---------- helpers for plane figures ---------- */
  const MIR = '#d1471f', ptc = '#1b5fa8';
  const rad = d => d * Math.PI / 180;
  function angleSvg(deg, rot, lab) {
    const vx = 110, vy = 100, L = 85, r = 26, p1 = rad(rot), p2 = rad(rot + deg);
    const P = (a, d) => (vx + d * Math.cos(a)).toFixed(1) + ' ' + (vy - d * Math.sin(a)).toFixed(1);
    let s = '<svg class="grid" viewBox="0 0 220 200" style="max-width:260px" role="img" aria-label="an angle"><rect width="220" height="200" fill="#fff"/>';
    s += '<path d="M' + P(p1, L) + ' L' + vx + ' ' + vy + ' L' + P(p2, L) + '" fill="none" stroke="#223" stroke-width="2.4" stroke-linecap="round"/>';
    if (deg >= 359.9) s += '<circle cx="' + vx + '" cy="' + vy + '" r="' + r + '" fill="none" stroke="' + MIR + '" stroke-width="2.4"/>';
    else if (Math.abs(deg - 90) < 0.01) { const a = P(p1, 16), b = P(p1 + 0, 0); s += '<path d="M' + P(p1, 16) + ' L' + (vx + 16 * Math.cos(p1) + 16 * Math.cos(p2)).toFixed(1) + ' ' + (vy - 16 * Math.sin(p1) - 16 * Math.sin(p2)).toFixed(1) + ' L' + P(p2, 16) + '" fill="none" stroke="' + MIR + '" stroke-width="2.4"/>'; }
    else s += '<path d="M' + P(p1, r) + ' A' + r + ' ' + r + ' 0 ' + (deg > 180 ? 1 : 0) + ' 0 ' + P(p2, r) + '" fill="none" stroke="' + MIR + '" stroke-width="2.4"/>';
    s += '<circle cx="' + vx + '" cy="' + vy + '" r="3.5" fill="#223"/>';
    if (lab) s += '<text x="' + (vx + 8) + '" y="' + (vy + 18) + '" font-size="14" font-weight="700" fill="#123">' + lab + '</text>';
    return s + '</svg>';
  }
  /* ---------- protractor ---------- */
  function protractor(o) {
    const W = 380, H = 214, cx = 190, cy = 188, R = 160, start = o.start || 'R';
    const A = d => d * Math.PI / 180, X = (d, r) => (cx + r * Math.cos(A(d))).toFixed(1), Y = (d, r) => (cy - r * Math.sin(A(d))).toFixed(1);
    let s = '<svg class="proto grid" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="protractor"' + (o.click ? ' data-proto="1" data-w="' + W + '" data-h="' + H + '" data-cx="' + cx + '" data-cy="' + cy + '" data-r="' + R + '"' : '') + ' style="max-width:520px;cursor:' + (o.click ? 'crosshair' : 'default') + '">';
    s += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    s += '<path d="M' + (cx - R) + ' ' + cy + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy + ' Z" fill="rgba(80,170,230,.14)" stroke="#2b6fa3" stroke-width="1.6"/>';
    s += '<path d="M' + (cx - 40) + ' ' + cy + ' A40 40 0 0 1 ' + (cx + 40) + ' ' + cy + '" fill="none" stroke="#9cc4e4" stroke-width="1"/>';
    for (let d = 0; d <= 180; d++) {
      const len = d % 10 === 0 ? 16 : d % 5 === 0 ? 11 : 6;
      s += '<line x1="' + X(d, R) + '" y1="' + Y(d, R) + '" x2="' + X(d, R - len) + '" y2="' + Y(d, R - len) + '" stroke="#2b6fa3" stroke-width="' + (d % 10 === 0 ? 1.3 : 0.8) + '"/>';
      if (d % 10 === 0) {
        s += '<text x="' + X(d, R - 27) + '" y="' + (+Y(d, R - 27) + 3.5) + '" font-size="10.5" text-anchor="middle" fill="#123" font-weight="700">' + d + '</text>';
        s += '<text x="' + X(d, R - 44) + '" y="' + (+Y(d, R - 44) + 3.5) + '" font-size="9" text-anchor="middle" fill="#5b6b7a">' + (180 - d) + '</text>';
      }
    }
    s += '<line x1="' + (cx - R - 12) + '" y1="' + cy + '" x2="' + (cx + R + 12) + '" y2="' + cy + '" stroke="#2b6fa3" stroke-width="1"/>';
    const base = start === 'R' ? 0 : 180;
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(base, R + 22) + '" y2="' + Y(base, R + 22) + '" stroke="' + MIR + '" stroke-width="3.4" stroke-linecap="round"/>';
    if (o.arm !== undefined) {
      const a = o.arm;
      const lo = Math.min(base, a), hi = Math.max(base, a);
      s += '<path d="M' + X(lo, 62) + ' ' + Y(lo, 62) + ' A62 62 0 0 0 ' + X(hi, 62) + ' ' + Y(hi, 62) + '" fill="none" stroke="' + MIR + '" stroke-width="0" />';
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(a, R + 22) + '" y2="' + Y(a, R + 22) + '" stroke="#223" stroke-width="3" stroke-linecap="round"/>';
    }
    if (o.arm2 !== undefined) s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + X(o.arm2, R + 22) + '" y2="' + Y(o.arm2, R + 22) + '" stroke="#1b5fa8" stroke-width="3" stroke-linecap="round"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#223"/><g class="pm"></g></svg>';
    return s;
  }
  const gr = (o) => grid(Object.assign({ xmin: -7, xmax: 7, ymin: -7, ymax: 7 }, o));
  const grp = (o) => gr(Object.assign({ plain: true }, o));
  const inR = (p, r) => Math.abs(p[0]) <= r && Math.abs(p[1]) <= r;
  const cornerLabels = (V, L) => V.map((p, i) => { const r = Math.hypot(p[0], p[1]) || 1; return { x: p[0] * (1 + .8 / r), y: p[1] * (1 + .8 / r), t: L[i] }; });   // corner letters just outside a shape centred on (0, 0)
  const clickQ = (html, targets, hint, steps, extra) => Object.assign({ type: 'click', targets, correct: targets, html, hint, steps }, extra || {});
  const revLine = (P, e) => {            // full line through P with primitive direction e, plus lattice points on it
    const pts = [], R = 7; let k = 0;
    while (Math.abs(P[0] + (k + 1) * e[0]) <= R && Math.abs(P[1] + (k + 1) * e[1]) <= R) k++;
    let j = 0; while (Math.abs(P[0] - (j + 1) * e[0]) <= R && Math.abs(P[1] - (j + 1) * e[1]) <= R) j++;
    for (let t = -j; t <= k; t++) pts.push([P[0] + t * e[0], P[1] + t * e[1]]);
    return { seg: { a: pts[0], b: pts[pts.length - 1] }, pts };
  };
  const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'K', 'L', 'M', 'P', 'Q', 'R', 'S', 'T'];

  /* 2.1 Lines and distances */
  const GN = (sec, n) => G[sec].concat(XG[sec] || []).find(fn => fn.name === n);   // generator by name (so moving one between G and XG is safe)
  G['2.1'] = [
    function nameIt(l) {
      const items = [
        ['A line goes on for ever in both directions. It has no starting point and no end point.', 'Line'],
        ['It has one end point and goes on for ever in one direction.', 'Ray'],
        ['It has two end points. You can measure its length.', 'Line segment'],
        ['Two lines that never meet, because they stay at the same distance from each other.', 'Parallel lines'],
        ['Two lines that meet at an angle of 90°.', 'Perpendicular lines']
      ];
      const it = pick(items), opts = ['Line', 'Ray', 'Line segment', 'Parallel lines', 'Perpendicular lines'].slice(0, l === 0 ? 3 : 5);
      const pool = l === 0 ? items.slice(0, 3) : items; const q = pick(pool);
      return { type: 'choice', opts, ans: opts.indexOf(q[1]), correct: opts.indexOf(q[1]), html: '<p>Which word fits? <i>' + q[0] + '</i></p>',
        hint: 'Think about the end points: none, one or two. Or about the angle between two lines.', steps: q[1] + '.' };
    },
    function relation(l) {
      const kinds = ['parallel', 'perpendicular', 'intersect'], kind = pick(kinds);
      let m1, m2, b1 = ri(-3, 3), b2;
      if (kind === 'parallel') { m1 = pick([0, 1, -1, 2, 'v']); m2 = m1; b2 = b1 + pick([-3, -2, 2, 3]); }
      else if (kind === 'perpendicular') { const pr = pick([[0, 'v'], [1, -1], [2, -0.5]]); m1 = pr[0]; m2 = pr[1]; b2 = ri(-2, 2); }
      else { const pr = pick([[0, 1], [1, 2], [-1, 0.5], ['v', 1], [2, 'v']]); m1 = pr[0]; m2 = pr[1]; b2 = ri(-2, 2); }
      const mk = (m, b, col, lab) => m === 'v' ? { a: [b, -7], b: [b, 7], color: col, label: lab } : { a: [-7, m * -7 + b], b: [7, m * 7 + b], color: col };
      const s1 = mk(m1, b1, ptc, 'l'), s2 = mk(m2, b2, MIR, 'm');
      if (kind === 'intersect' && ((m1 === 'v' ? 1 : 0) + (m2 === 'v' ? 1 : 0)) === 2) return GN('2.1', 'relation')(l);
      const opts = ['l // m (parallel)', 'l ⊥ m (perpendicular)', 'l and m intersect, but not at 90°'], ans = kinds.indexOf(kind);
      return { type: 'choice', opts, ans, correct: ans,
        html: '<p>Look at the lines l (blue) and m (red). Which statement is true?</p>' + grp({ segs: [s1, s2] }),
        hint: 'Parallel: same direction, never meet. Perpendicular: they meet in a right angle (like a horizontal and a vertical line).',
        steps: kind === 'parallel' ? 'The lines have the same direction and never meet.' : kind === 'perpendicular' ? 'The lines meet at a right angle.' : 'The lines meet, but not at a right angle.' };
    },
    function distPointLine(l) {
      const horiz = Math.random() < .5, k = ri(-3, 3), A = horiz ? [ri(-5, 5), k + nz(-5, 5)] : [k + nz(-5, 5), ri(-5, 5)];
      if (!inR(A, 7)) return GN('2.1', 'distPointLine')(l);
      const d = horiz ? Math.abs(A[1] - k) : Math.abs(A[0] - k);
      return { type: 'num', ans: d, correct: String(d),
        html: '<p>What is the distance from point <b>P</b> to line <b>l</b>? One square is 1 cm. (Give the number of cm.)</p>' + grp({ segs: [horiz ? { a: [-7, k], b: [7, k], color: ptc, label: 'l' } : { a: [k, -7], b: [k, 7], color: ptc, label: 'l' }], pts: [{ x: A[0], y: A[1], label: 'P', color: MIR }] }),
        hint: 'The distance to a line is the shortest way: straight (at 90°) to the line. Count the squares.', steps: 'Count squares in a straight line from P to l: ' + d + ' cm.' };
    },
    function atDistance(l) {
      const k = ri(-2, 2), d = ri(1, 3), x = ri(-4, 4), horiz = Math.random() < .5;
      const t = horiz ? [[x, k + d], [x, k - d]] : [[k + d, x], [k - d, x]];
      const line = horiz ? { a: [-7, k], b: [7, k], color: ptc, label: 'l' } : { a: [k, -7], b: [k, 7], color: ptc, label: 'l' };
      const other = horiz ? { a: [x, -7], b: [x, 7], color: '#16803c', label: 'n', dash: true } : { a: [-7, x], b: [7, x], color: '#16803c', label: 'n', dash: true };
      return clickQ('<p>Click <b>all points</b> on line <b>n</b> (green) that are <b>' + d + ' cm</b> from line <b>l</b> (blue). One square is 1 cm.</p>' + grp({ segs: [line, other], click: true }), t,
        'Points at distance ' + d + ' from a line lie on both sides of the line. There are two of them.', 'Go ' + d + ' squares from l in both directions along n. That gives two points (marked in green).');
    },
    function clickParPerp(l) {
      const dirs = l === 0 ? [[1, 0], [0, 1], [1, 1], [1, -1]] : [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2], [3, 1], [1, -3]];
      const d = pick(dirs), rel = Math.random() < .5 ? 'par' : 'perp';
      const A = [ri(-2, 2), ri(-2, 2)];
      const far = (P, v) => { let k = 0; while (Math.abs(P[0] + (k + 1) * v[0]) <= 7 && Math.abs(P[1] + (k + 1) * v[1]) <= 7) k++; let j = 0; while (Math.abs(P[0] - (j + 1) * v[0]) <= 7 && Math.abs(P[1] - (j + 1) * v[1]) <= 7) j++; return { a: [P[0] - j * v[0], P[1] - j * v[1]], b: [P[0] + k * v[0], P[1] + k * v[1]] }; };
      const seg = far(A, d); const m = { a: seg.a, b: seg.b, color: ptc, label: 'm' };
      const e = rel === 'par' ? d : [-d[1], d[0]];
      let C, D, tries = 0;
      do { C = [ri(-6, 6), ri(-6, 6)]; D = [C[0] + e[0], C[1] + e[1]]; tries++; }
      while (tries < 200 && (!inR(C, 6) || !inR(D, 6) || (rel === 'par' && (C[0] - A[0]) * d[1] - (C[1] - A[1]) * d[0] === 0)));
      const word = rel === 'par' ? 'parallel' : 'perpendicular';
      return { type: 'click', rel, dir: d, base: A, targets: [C, D], correct: [C, D], example: true,
        html: '<p>Click <b>two points</b> that a line <b>' + word + '</b> to line <b>m</b> would pass through' + (rel === 'par' ? ' (not m itself)' : '') + '.</p>' + grp({ segs: [m], click: true }),
        hint: rel === 'par' ? 'A parallel line has the same direction as m. Look at how m goes: steps right and up or down. Start at a point and take the same steps.' : 'A perpendicular line meets m at 90°. Swap the steps of m: if m goes 2 right and 1 up, a perpendicular line goes 1 right and 2 down (or 1 left and 2 up).',
        steps: 'Many answers are correct. The green lines show some possible lines; any two (or more) points on one of them are right.',
        reveal: (() => { const L = [revLine(C, e)]; for (let i = 0; i < 2; i++) { let P2, tr = 0; do { P2 = [ri(-5, 5), ri(-5, 5)]; tr++; } while (tr < 50 && (rel === 'par' && (P2[0] - A[0]) * d[1] - (P2[1] - A[1]) * d[0] === 0)); L.push(revLine(P2, e)); } return { segs: L.map(x => x.seg), pts: [].concat(...L.map(x => x.pts)) }; })() };
    },
    function lineSymbols(l) {   // four lines: which are parallel, which perpendicular (written with // and ⊥, as in the test)
      const D = l === 1 ? [[1, 0], [0, 1], [1, 1], [1, -1]] : [[1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2]];
      const d = pick(D), e = [-d[1], d[0]], cr = (u, v) => u[0] * v[1] - u[1] * v[0], dot = (u, v) => u[0] * v[0] + u[1] * v[1];
      const o = pick([[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2], [3, 1], [1, 3]].filter(v => cr(v, d) && cr(v, e) && dot(v, d) && dot(v, e)));
      const far = (P, v) => { let k = 0; while (Math.abs(P[0] + (k + 1) * v[0]) <= 7 && Math.abs(P[1] + (k + 1) * v[1]) <= 7) k++; let j = 0; while (Math.abs(P[0] - (j + 1) * v[0]) <= 7 && Math.abs(P[1] - (j + 1) * v[1]) <= 7) j++; return { a: [P[0] - j * v[0], P[1] - j * v[1]], b: [P[0] + k * v[0], P[1] + k * v[1]] }; };
      const A = [ri(-3, 0), ri(-3, 0)]; let B, t = 0;
      do { B = [ri(1, 4), ri(1, 4)]; t++; } while (t < 50 && Math.abs(cr([B[0] - A[0], B[1] - A[1]], d)) < 3 * Math.hypot(d[0], d[1]));
      const dirs = [d, d, e, o], base = [A, B, [ri(-2, 2), ri(-2, 2)], [ri(-2, 2), ri(-2, 2)]], nm = shuffle(['k', 'l', 'm', 'n']), cols = [ptc, MIR, '#16803c', '#7a3db8'];
      const segs = dirs.map((v, i) => Object.assign(far(base[i], v), { color: cols[i], label: nm[i] }));
      const par = (i, j) => cr(dirs[i], dirs[j]) === 0, perp = (i, j) => dot(dirs[i], dirs[j]) === 0, all = [];
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) if (i + '' + j !== a + '' + b) all.push({ t: nm[i] + ' // ' + nm[j] + ' and ' + nm[a] + ' ⊥ ' + nm[b], ok: par(i, j) && perp(a, b) });
      const good = pick(all.filter(x => x.ok)), opts = shuffle([good].concat(shuffle(all.filter(x => !x.ok)).slice(0, 3)));
      const pp = nm[0] + ' // ' + nm[1], pq = nm[2] + ' ⊥ ' + nm[0] + ' and ' + nm[2] + ' ⊥ ' + nm[1];
      return { type: 'choice', opts: opts.map(x => x.t), ans: opts.indexOf(good), correct: opts.indexOf(good),
        html: '<p>Look at the lines k, l, m and n. Which statement is <b>true</b>? (// means parallel, ⊥ means perpendicular.)</p>' + grp({ segs }),
        hint: 'Follow each line square by square: how many steps right and how many up or down? Parallel lines take the same steps. For perpendicular lines the steps are swapped and one changes direction.',
        steps: nm[0] + ' and ' + nm[1] + ' have the same direction, so ' + pp + '. Line ' + nm[2] + ' makes right angles with both of them, so ' + pq + '. Line ' + nm[3] + ' is neither. The true statement is: ' + good.t + '.' };
    }
  ];

  /* 2.2 Angles */
  const ATYPES = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Full'];
  const aType = d => d < 90 ? 0 : d === 90 ? 1 : d < 180 ? 2 : d === 180 ? 3 : d < 360 ? 4 : 5;
  G['2.2'] = [
    function typeByDegrees(l) {
      const edge = [89, 91, 179, 181, 359, 1, 270, 90, 180, 360];
      const d = l === 2 ? pick(edge) : l === 0 ? pick([25, 45, 60, 90, 120, 135, 180, 200, 250, 360]) : ri(5, 355);
      const opts = l === 0 ? ['Acute', 'Right', 'Obtuse', 'Reflex'].filter(o => true) : ATYPES;
      const ans = opts.indexOf(ATYPES[aType(d)]);
      if (ans < 0) return GN('2.2', 'typeByDegrees')(l);
      return { type: 'choice', opts, ans, correct: ans, html: '<p>What kind of angle is an angle of <b>' + d + '°</b>?</p>',
        hint: 'Acute: less than 90°. Right: exactly 90°. Obtuse: between 90° and 180°. Straight: 180°. Reflex: between 180° and 360°. Full: 360°.', steps: d + '° is ' + (aType(d) === 0 ? 'an acute' : 'a' + (ATYPES[aType(d)] === 'Obtuse' ? 'n' : '') + ' ' + ATYPES[aType(d)].toLowerCase()) + ' angle.' };
    },
    function typeByPicture(l) {
      const d = pick([20, 35, 50, 70, 90, 110, 130, 150, 180, 210, 240, 290, 320]), rot = ri(0, 359);
      const opts = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex'], ans = opts.indexOf(ATYPES[aType(d)]);
      return { type: 'choice', opts, ans, correct: ans, html: '<p>What kind of angle is this? (The red arc shows the angle.)</p>' + angleSvg(d, rot),
        hint: 'Compare with a right angle (a square corner). Is the red arc smaller or bigger? Does it go around more than half a turn?', steps: 'This angle is ' + ATYPES[aType(d)].toLowerCase() + '.' };
    },
    function reflex(l) {
      const small = l === 0 ? ri(2, 17) * 10 : ri(11, 179), toBig = Math.random() < .6;
      return toBig ? { type: 'num', ans: 360 - small, correct: String(360 - small), html: '<p>The (small) angle between two lines is <b>' + small + '°</b>. What is the <b>reflex angle</b> on the other side?</p>',
        hint: 'A full turn is 360°. Subtract the small angle.', steps: '360° − ' + small + '° = ' + (360 - small) + '°.' } :
        { type: 'num', ans: small, correct: String(small), html: '<p>A reflex angle is <b>' + (360 - small) + '°</b>. What is the (small) angle on the other side?</p>',
        hint: 'A full turn is 360°. Subtract the reflex angle from 360°.', steps: '360° − ' + (360 - small) + '° = ' + small + '°.' };
    },
    function clock(l) {   // whole hours only (1HVT scope: no hour hand between two numbers)
      const h = l === 0 ? ri(1, 6) : ri(1, 12), k = h > 6 ? 12 - h : h, d = k * 30;
      return { type: 'num', ans: d, correct: String(d), html: '<p>What is the <b>(smaller) angle between the hands</b> of a clock at <b>' + h + ':00</b>?</p>',
        hint: 'A clock has 12 hours, so each hour is 360° : 12 = 30°. Count how many hours the hands are apart' + (h > 6 ? ', the short way round.' : '.'),
        steps: (h > 6 ? 'The short way round, from ' + h + ' to 12 is ' + k + ' hours. ' : 'From 12 to ' + h + ' is ' + k + ' hour' + (k > 1 ? 's' : '') + '. ') + k + ' · 30° = ' + d + '°.' };
    },
    function compass(l) {
      const dirs = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'], i = ri(0, 7);
      const turns = l === 0 ? [90, 180] : l === 1 ? [45, 90, 135, 180, 270] : [45, 135, 225, 270, 315];
      const t = pick(turns), side = pick(['right', 'left']), j = ((i + (side === 'right' ? 1 : -1) * t / 45) % 8 + 8) % 8;
      const opts = l === 0 ? ['North', 'East', 'South', 'West'] : dirs, ans = opts.indexOf(dirs[j]);
      if (ans < 0) return GN('2.2', 'clock')(l);
      if (l === 0 && i % 2) return GN('2.2', 'clock')(l);
      return { type: 'choice', opts, ans, correct: ans, html: '<p>You face <b>' + dirs[i] + '</b>. You turn <b>' + t + '° to the ' + side + '</b> (clockwise = right). In which direction do you face now?</p>',
        hint: 'Between North, East, South and West there are 90° turns. 45° is half of that. Turning right goes North → East → South → West.', steps: 'Start ' + dirs[i] + ', turn ' + t + '° ' + side + ': ' + dirs[j] + '.' };
    },
    function vertexName(l) {   // the book names an angle by its vertex only (∠A), not with three letters
      const nm = shuffle(['A', 'B', 'C', 'D', 'K', 'L', 'M', 'P', 'Q', 'R']).slice(0, 3), d = pick([40, 60, 75, 110, 130, 150]), rot = ri(0, 359), R = 80;
      const u = a => [Math.cos(rad(a)), -Math.sin(rad(a))];
      let P = [[0, 0], [R * u(rot)[0], R * u(rot)[1]], [R * u(rot + d)[0], R * u(rot + d)[1]]];
      const xs = P.map(p => p[0]), ys = P.map(p => p[1]), dx = 120 - (Math.min(...xs) + Math.max(...xs)) / 2, dy = 90 - (Math.min(...ys) + Math.max(...ys)) / 2;
      P = P.map(p => [p[0] + dx, p[1] + dy]);
      const bis = u(rot + d / 2), lab = [[P[0][0] - 18 * bis[0], P[0][1] - 18 * bis[1]], [P[1][0] + 16 * u(rot)[0], P[1][1] + 16 * u(rot)[1]], [P[2][0] + 16 * u(rot + d)[0], P[2][1] + 16 * u(rot + d)[1]]];
      const svg = '<svg class="grid" viewBox="0 0 240 180" style="max-width:280px"><rect width="240" height="180" fill="#fff"/><path d="M' + P[1].map(v => v.toFixed(1)).join(' ') + ' L' + P[0].map(v => v.toFixed(1)).join(' ') + ' L' + P[2].map(v => v.toFixed(1)).join(' ') + '" fill="none" stroke="#223" stroke-width="2.6" stroke-linejoin="round"/>' +
        P.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2" fill="#223"/>').join('') +
        lab.map((p, k) => '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" font-size="16" font-weight="700" fill="#123" text-anchor="middle" dominant-baseline="central">' + nm[k] + '</text>').join('') + '</svg>';
      const right = '∠' + nm[0], o2 = shuffle(nm.map(c => '∠' + c));
      return { type: 'choice', opts: o2, ans: o2.indexOf(right), correct: o2.indexOf(right), html: '<p>What is the name of the angle between the two lines?</p>' + svg,
        hint: 'An angle is named after its vertex: the point where the two lines meet.', steps: 'The lines meet at point ' + nm[0] + ', so the angle is called ' + right + '.' };
    },
    function complete(l) {
      const nm = { 90: 'a right angle', 180: 'a straight angle', 360: 'a full angle' };
      if (l === 0) {                       // two known angles, one missing
        const T = pick([90, 180]), x = 5 * ri(2, T / 5 - 6), a = 5 * ri(2, (T - x) / 5 - 2), b = T - x - a;
        if (b <= 0 || a <= 0) return GN('2.2', 'complete')(l);
        return { type: 'num', ans: x, correct: String(x),
          html: '<p>The angles <b>' + a + '°</b> and <b>' + b + '°</b> are next to each other, together with a third angle <b>x</b>. All three together make <b>' + nm[T] + '</b> (' + T + '°). How big is <b>x</b>? (Give the number of degrees.)</p>',
          hint: 'Add the two angles you know. Then subtract the total from ' + T + '°.', steps: a + ' + ' + b + ' = ' + (a + b) + '°. Then ' + T + ' − ' + (a + b) + ' = ' + x + '°.' };
      }
      if (l === 1) {                       // three known angles, full turn or straight angle
        const T = pick([180, 360]), n = T === 180 ? 2 : 3; let ang = [], sum = 0;
        for (let i = 0; i < n; i++) { const v = ri(18, Math.floor((T - 30) / (n + 0.5))); ang.push(v); sum += v; }
        const x = T - sum;
        if (x < 10) return GN('2.2', 'complete')(l);
        return { type: 'num', ans: x, correct: String(x),
          html: '<p>Around a point (or on a straight line) the angles ' + ang.map(v => '<b>' + v + '°</b>').join(', ') + ' and one more angle <b>x</b> together make <b>' + nm[T] + '</b> (' + T + '°). How big is <b>x</b>? (Give the number of degrees.)</p>',
          hint: 'Add all the angles you know. Then subtract the total from ' + T + '°.', steps: ang.join(' + ') + ' = ' + sum + '°. Then ' + T + ' − ' + sum + ' = ' + x + '°.' };
      }
      const ang = []; let sum = 0;
      for (let i = 0; i < 3; i++) { const v = ri(31, 99); ang.push(v); sum += v; }
      const x = 360 - sum;
      return { type: 'num', ans: x, correct: String(x),
        html: '<p>Four angles around a point make a <b>full angle</b> (360°). Three of them are <b>' + ang[0] + '°</b>, <b>' + ang[1] + '°</b> and <b>' + ang[2] + '°</b>. How big is the fourth angle? (Give the number of degrees.)</p>',
        hint: 'Add the three angles. Then subtract the total from 360°.', steps: ang.join(' + ') + ' = ' + sum + '°. Then 360 − ' + sum + ' = ' + x + '°.' };
    },
    function drawAngle(l) {
      const start = l === 0 ? 'R' : pick(['R', 'L']);
      const deg = l === 0 ? 10 * ri(2, 16) : l === 1 ? 5 * ri(2, 34) : ri(8, 172), target = start === 'R' ? deg : 180 - deg;
      return { type: 'proto', target, tol: 1, correct: target,
        html: '<p>The red arm is one side of an angle. Draw an angle of <b>' + deg + '°</b> with the red arm. Click on the protractor <b>scale</b> where the <b>second arm</b> goes through.</p>' + protractor({ start, click: true }),
        hint: start === 'R' ? 'The red arm points to the <b>right</b> and goes through the 0 on the right. Use the scale that starts with 0 on the right (the bold numbers) and count up to ' + deg + '.' : 'The red arm points to the <b>left</b> and goes through the 0 on the left. Use the scale that starts with 0 on the left (the small grey numbers) and count up to ' + deg + '.',
        steps: 'Use the scale that has 0 at the red arm and count up to ' + deg + '°. The green arm shows where the second arm goes.' };
    },
    function readAngle(l) {
      const start = l === 0 ? 'R' : pick(['R', 'L']);
      const deg = l === 0 ? 10 * ri(2, 16) : l === 1 ? 5 * ri(2, 34) : ri(8, 172), arm = start === 'R' ? deg : 180 - deg;
      return { type: 'num', ans: deg, tol: 1, correct: String(deg),
        html: '<p>What is the size of the angle between the red arm and the black arm? (Give the number of degrees. A difference of 1° is fine.)</p>' + protractor({ start, arm }),
        hint: start === 'R' ? 'The red arm goes through the 0 on the <b>right</b>. Read the scale that starts with 0 on the right (the bold numbers).' : 'The red arm goes through the 0 on the <b>left</b>. Read the scale that starts with 0 on the left (the small grey numbers).',
        steps: 'Start at the 0 where the red arm is. The black arm is at ' + deg + '°.' };
    },
    function pickReading(l) {
      const start = pick(['R', 'L']), small = l === 2 ? ri(65, 85) : ri(25, 80), deg = Math.random() < .5 ? small : 180 - small, arm = start === 'R' ? deg : 180 - deg;
      const o = shuffle([deg, 180 - deg]), ans = o.indexOf(deg);
      return { type: 'choice', opts: o.map(v => v + '°'), ans, correct: ans,
        html: '<p>The protractor shows two numbers where the black arm crosses the scale. Which one is the size of the angle between the <b>red arm</b> and the <b>black arm</b>?</p>' + protractor({ start, arm }),
        hint: 'First decide: is the angle smaller or bigger than a right angle (90°)? Then choose the number that fits. Also check where the 0 is.',
        steps: 'The 0 is where the red arm is. The angle is ' + (deg < 90 ? 'acute (smaller than 90°)' : 'obtuse (bigger than 90°)') + ', so the answer is ' + deg + '°.' };
    }
  ];

  /* 2.3 Triangles, quadrilaterals and circles */
  function tri3(l) {
    const mode = pick(['equi', 'iso', 'scal', 'right', 'obt']);
    let a, b, c;
    if (mode === 'equi') { a = b = c = 60; }
    else if (mode === 'iso') { a = ri(20, 80); b = a; c = 180 - 2 * a; if (c === a) a = b = 50, c = 80; }
    else if (mode === 'right') { a = 90; b = ri(20, 70); c = 90 - b; if (b === c) { b = 30; c = 60; } }
    else if (mode === 'obt') { a = ri(95, 140); b = ri(10, Math.floor((175 - a) / 2)); c = 180 - a - b; if (b === c) { b = 20; c = 180 - a - 20; if (b === c) c++, a--; } }
    else { do { a = ri(30, 100); b = ri(30, 100); c = 180 - a - b; } while (c < 20 || a === b || b === c || a === c || a === 90 || b === 90 || c === 90); }
    return shuffle([a, b, c]);
  }
  G['2.3'] = [
    function triByAngles(l) {
      const t = tri3(l), mx = Math.max.apply(null, t), kind = mx === 90 ? 1 : mx > 90 ? 2 : 0, opts = ['An acute triangle', 'A right-angled triangle', 'An obtuse triangle'];
      return { type: 'choice', opts, ans: kind, correct: kind, html: '<p>A triangle has angles of <b>' + t.join('°, ') + '°</b>. What kind of triangle is it (looking at the angles)?</p>',
        hint: 'Look at the largest angle. Is it 90°? Bigger than 90°? Or are all three angles smaller than 90°?', steps: 'The largest angle is ' + mx + '°: ' + opts[kind].toLowerCase() + '.' };
    },
    function triBySidesFromAngles(l) {
      const t = tri3(l), s = t.slice().sort((x, y) => x - y), eq = (s[0] === s[1] ? 1 : 0) + (s[1] === s[2] ? 1 : 0), kind = eq === 2 ? 0 : eq === 1 ? 1 : 2;
      const opts = ['Equilateral', 'Isosceles', 'Scalene'];
      return { type: 'choice', opts, ans: kind, correct: kind, html: '<p>A triangle has angles of <b>' + t.join('°, ') + '°</b>. Is it equilateral, isosceles or scalene?</p>',
        hint: 'Equal angles belong to equal sides. Three equal: equilateral. Two equal: isosceles. None equal: scalene.', steps: kind === 0 ? 'All angles are equal: equilateral.' : kind === 1 ? 'Exactly two angles are equal: isosceles.' : 'No angles are equal: scalene.' };
    },
    function triBySides(l) {
      const kind = ri(0, 2); let a, b, c;
      if (kind === 0) { a = b = c = ri(3, 9); } else if (kind === 1) { a = b = ri(4, 9); c = ri(2, a + a - 1); if (c === a) c = a - 1; } else { do { a = ri(3, 9); b = ri(3, 9); c = ri(3, 9); } while (a === b || b === c || a === c || Math.max(a, b, c) >= a + b + c - Math.max(a, b, c)); }
      const opts = ['Equilateral', 'Isosceles', 'Scalene'], t = shuffle([a, b, c]);
      return { type: 'choice', opts, ans: kind, correct: kind, html: '<p>A triangle has sides of <b>' + t.join(' cm, ') + ' cm</b>. What kind of triangle is it?</p>',
        hint: 'Count how many sides are equal.', steps: kind === 0 ? 'All three sides are equal: equilateral.' : kind === 1 ? 'Exactly two sides are equal: isosceles.' : 'No sides are equal: scalene.' };
    },
    function quadName(l) {
      const items = [
        ['four equal sides and four right angles', 'Square'],
        ['four right angles, but the sides are not necessarily all equal', 'Rectangle'],
        ['four equal sides, but the angles are not necessarily right angles', 'Rhombus'],
        ['two pairs of parallel sides, but not necessarily right angles or equal sides', 'Parallelogram']
      ];
      const q = pick(l === 0 ? items.slice(0, 2) : items), opts = ['Square', 'Rectangle', 'Rhombus', 'Parallelogram'].slice(0, l === 0 ? 2 : 4);
      return { type: 'choice', opts, ans: opts.indexOf(q[1]), correct: opts.indexOf(q[1]), html: '<p>Which quadrilateral has <b>' + q[0] + '</b>?</p>',
        hint: 'Think about sides and angles: which shape fits all the properties?', steps: q[1] + '.' };
    },
    function alwaysSometimes(l) {
      const S = [['A square is a rectangle.', 0], ['A rectangle is a square.', 1], ['A rhombus has four equal sides.', 0], ['A triangle has a right angle.', 1], ['A quadrilateral has four sides.', 0], ['A triangle has four sides.', 2],
        ['An equilateral triangle is isosceles.', 0], ['An isosceles triangle is equilateral.', 1], ['A parallelogram has four right angles.', 1], ['The diameter of a circle is twice the radius.', 0], ['An obtuse triangle has two obtuse angles.', 2], ['A rectangle has four right angles.', 0], ['A square is a rhombus.', 0], ['A circle has corners.', 2]];
      const q = pick(S), opts = ['Always true', 'Sometimes true', 'Never true'];
      return { type: 'choice', opts, ans: q[1], correct: q[1], html: '<p>Is this statement always, sometimes or never true?</p><p><i>' + q[0] + '</i></p>',
        hint: 'Look for an example that makes it false, and an example that makes it true.', steps: opts[q[1]] + ': ' + q[0] };
    },
    function circleConv(l) {
      const toD = Math.random() < .5, r = l === 0 ? ri(2, 9) : pick([2.5, 3.5, 4.5, 6.5, 7.5, 12, 15]);
      return toD ? { type: 'num', ans: 2 * r, correct: String(2 * r), html: '<p>A circle has a <b>radius</b> of <b>' + r + ' cm</b>. What is its <b>diameter</b>?</p>', hint: 'The diameter goes through the centre. It is twice the radius.', steps: '2 · ' + r + ' = ' + 2 * r + ' cm.' }
        : { type: 'num', ans: r, correct: String(r), html: '<p>A circle has a <b>diameter</b> of <b>' + 2 * r + ' cm</b>. What is its <b>radius</b>?</p>', hint: 'The radius is half of the diameter.', steps: f(2 * r) + ' : 2 = ' + r + ' cm.' };
    },
    function diagonals(l) {   // 1HVT scope: quadrilateral or pentagon only, with a drawing as scaffolding
      const n = l === 0 ? pick([4, 5]) : l === 1 ? pick([4, 5, 5]) : 5, ans = n * (n - 3) / 2, hs = Math.random() < .25 && l > 0;
      if (hs) { const p = ri(3, 5), h = p * (p - 1) / 2;
        return { type: 'num', ans: h, correct: String(h), html: '<p><b>' + p + ' friends</b> each shake hands once with every other friend. How many handshakes are there?</p>',
          hint: 'Give the friends letters: A, B, C' + (p > 3 ? ', D' : '') + (p > 4 ? ', E' : '') + '. Write down every pair: AB, AC, … AB and BA are the same handshake, so count it once.',
          steps: 'Each friend shakes ' + (p - 1) + ' hands: ' + p + ' · ' + (p - 1) + ' = ' + p * (p - 1) + '. Every handshake is counted twice, so ' + p * (p - 1) + ' : 2 = ' + h + '.' }; }
      const L = 'ABCDE'.slice(0, n).split('');
      const V = n === 4 ? [[-5, -4], [5, -3], [4, 4], [-3, 5]] : [0, 1, 2, 3, 4].map(k => { const t = (90 + 72 * k + 144) * Math.PI / 180; return [+(5.5 * Math.cos(t)).toFixed(2), +(5.5 * Math.sin(t)).toFixed(2)]; });
      const fromA = V.slice(2, n - 1).map(p => ({ a: V[0], b: p, color: '#16803c', dash: true }));
      const shape = n === 4 ? 'quadrilateral ABCD' : 'pentagon ABCDE', mode = l === 0 ? 'fromA' : l === 1 ? 'shown' : 'total';
      const others = L.slice(2, n - 1), list = [];
      for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) list.push(L[i] + L[j]);
      if (mode === 'fromA') return { type: 'num', ans: n - 3, correct: String(n - 3),
        html: '<p>This is ' + shape + '. A <b>diagonal</b> is a line segment from one corner to another corner that is <b>not next to it</b>. How many diagonals start at corner <b>A</b>?</p>' + grp({ polys: [{ v: V }], texts: cornerLabels(V, L) }),
        hint: 'The corners next to A are ' + L[1] + ' and ' + L[n - 1] + '. A line from A to them is a side, not a diagonal. Which corners are left?',
        steps: 'From A you can go to ' + others.join(' and ') + ' (' + L[1] + ' and ' + L[n - 1] + ' are next to A). So ' + (n - 3) + ' diagonal' + (n - 3 > 1 ? 's' : '') + ' start at A: ' + others.map(c => 'A' + c).join(' and ') + '.' };
      return { type: 'num', ans, correct: String(ans),
        html: '<p>This is ' + shape + '. A <b>diagonal</b> goes from one corner to another corner that is <b>not next to it</b>.' + (mode === 'shown' ? ' The diagonals from corner A are drawn (dashed).' : '') + ' How many diagonals does the ' + (n === 4 ? 'quadrilateral' : 'pentagon') + ' have <b>in total</b>?</p>' + grp({ polys: [{ v: V }], texts: cornerLabels(V, L), segs: mode === 'shown' ? fromA : [] }),
        hint: 'Start at A and count its diagonals. Then go to B, then C, and so on. Do not count a diagonal twice: AC and CA are the same diagonal.',
        steps: 'The diagonals are ' + list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1] + '. That is ' + ans + ' diagonals. (Check: ' + n + ' corners · ' + (n - 3) + ' diagonal' + (n > 4 ? 's' : '') + ' each = ' + n * (n - 3) + ', and every diagonal is counted twice: ' + n * (n - 3) + ' : 2 = ' + ans + '.)' };
    },
    function circlesInRect(l) {   // equal circles that fit exactly in a rectangle
      const rows = l === 2 && Math.random() < .5 ? 2 : 1, cols = rows === 2 ? pick([2, 3]) : pick([2, 3, 4]), r = pick([2, 2.5, 3, 4, 5, 6, 7.5]);
      const L = 2 * r * cols, W = 2 * r * rows, ask = l === 2 ? pick(['r', 'L']) : 'r', u = Math.min(300 / L, 140 / W);
      let svg = '<svg class="grid" viewBox="0 0 ' + (L * u + 20).toFixed(0) + ' ' + (W * u + 20).toFixed(0) + '" style="max-width:340px"><rect width="100%" height="100%" fill="#fff"/><rect x="10" y="10" width="' + (L * u).toFixed(1) + '" height="' + (W * u).toFixed(1) + '" fill="none" stroke="#223" stroke-width="2"/>';
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) svg += '<circle cx="' + (10 + (2 * i + 1) * r * u).toFixed(1) + '" cy="' + (10 + (2 * j + 1) * r * u).toFixed(1) + '" r="' + (r * u).toFixed(1) + '" fill="rgba(27,95,168,.10)" stroke="' + ptc + '" stroke-width="2"/>';
      svg += '</svg>';
      const n = rows * cols, fmt = v => String(v).replace('.', ','), lay = rows === 2 ? n + ' equal circles (2 rows of ' + cols + ')' : cols + ' equal circles';
      if (ask === 'r') return { type: 'num', ans: r, correct: String(r),
        html: '<p>' + lay + ' fit exactly in a rectangle of <b>' + fmt(L) + ' cm</b> by <b>' + fmt(W) + ' cm</b> (see the figure). Calculate the <b>radius</b> of one circle. (Give the number of cm.)</p>' + svg,
        hint: 'Look at the width of the rectangle: how many diameters fit in it? The radius is half of a diameter.',
        steps: (rows === 1 ? 'The width of the rectangle is one diameter, so the diameter = ' + fmt(W) + ' cm.' : 'Two diameters fit in the width, so the diameter = ' + fmt(W) + ' : 2 = ' + fmt(2 * r) + ' cm.') + ' Radius = ' + fmt(2 * r) + ' : 2 = ' + fmt(r) + ' cm. (Check: ' + cols + ' · ' + fmt(2 * r) + ' = ' + fmt(L) + ' cm, the length.)' };
      return { type: 'num', ans: L, correct: String(L),
        html: '<p>' + lay + ' with a radius of <b>' + fmt(r) + ' cm</b> fit exactly in a rectangle (see the figure). How long is the <b>long side</b> of the rectangle? (Give the number of cm.)</p>' + svg,
        hint: 'First work out the diameter. How many diameters fit along the long side?',
        steps: 'Diameter = 2 · ' + fmt(r) + ' = ' + fmt(2 * r) + ' cm. Along the long side there are ' + cols + ' diameters: ' + cols + ' · ' + fmt(2 * r) + ' = ' + fmt(L) + ' cm.' };
    },
    function fourthVertex(l) {   // click the missing corner S
      const kind = pick(l === 1 ? ['rectangle', 'square'] : ['square', 'parallelogram', 'rectangle']);
      for (let t = 0; t < 300; t++) {
        let v, w;
        if (kind === 'square') { v = l === 1 ? pick([[ri(2, 4), 0], [0, ri(2, 4)]]) : [ri(1, 3), ri(1, 3) * pick([-1, 1])]; w = [-v[1], v[0]]; if (Math.abs(v[0]) + Math.abs(v[1]) < 3) continue; }
        else if (kind === 'rectangle') { if (l === 1) { v = [ri(2, 5), 0]; w = [0, ri(2, 4)]; if (w[1] === v[0]) continue; } else { v = [ri(1, 2), ri(1, 2) * pick([-1, 1])]; w = [-2 * v[1], 2 * v[0]]; } }
        else { v = [ri(2, 4), 0]; w = [ri(1, 3) * pick([-1, 1]), ri(2, 4)]; }
        const P = [ri(-6, 2), ri(-6, 2)], Q = [P[0] + v[0], P[1] + v[1]], R = [Q[0] + w[0], Q[1] + w[1]], S = [P[0] + w[0], P[1] + w[1]];
        if (![P, Q, R, S].every(p => inR(p, 6))) continue;
        return clickQ('<p>P, Q and R are three corners of <b>' + kind + ' PQRS</b>. Click the fourth corner <b>S</b>.</p>' + grp({ click: true, segs: [{ a: P, b: Q, color: ptc }, { a: Q, b: R, color: ptc }], pts: [{ x: P[0], y: P[1], label: 'P' }, { x: Q[0], y: Q[1], label: 'Q' }, { x: R[0], y: R[1], label: 'R' }] }), [S],
          'In a ' + kind + ' the opposite sides are parallel and equally long. Count the steps from Q to R. Start at P and take the same steps.',
          'From Q to R is ' + Math.abs(w[0]) + ' step' + (Math.abs(w[0]) === 1 ? '' : 's') + (w[0] >= 0 ? ' right' : ' left') + ' and ' + Math.abs(w[1]) + (w[1] >= 0 ? ' up' : ' down') + '. Take the same steps from P to find S (marked in green). Then PS // QR and SR // PQ.');
      }
      return GN('2.3', 'fourthVertex')(l);
    }
  ];

  /* 2.4 Constructing and reflecting */
  G['2.4'] = [
    function tools(l) {
      const Q = [['draw a circle', 'Compass'], ['measure the length of a line segment', 'Ruler'], ['measure an angle', 'Protractor'], ['draw an arc with a given radius', 'Compass'], ['draw a line segment of 7 cm', 'Ruler'], ['draw an angle of 65°', 'Protractor']];
      const q = pick(Q), opts = ['Compass', 'Ruler', 'Protractor'];
      return { type: 'choice', opts, ans: opts.indexOf(q[1]), correct: opts.indexOf(q[1]), html: '<p>Which tool do you use to <b>' + q[0] + '</b>?</p>', hint: 'Compass: circles and arcs. Ruler: lengths. Protractor: angles.', steps: q[1] + '.' };
    },
    function reflectPoint(l) {
      let P, A, B; const tri = l > 0;
      for (let k = 0; k < 200; k++) {
        P = [ri(-3, 3), ri(-3, 3)]; A = [ri(-5, 5), ri(-5, 5)]; if (!tri) { B = null; } else { B = [A[0] + ri(1, 3), A[1] + ri(-3, 3)]; }
        const quad = l === 2, w = ri(2, 3), h = ri(2, 3);
        const pts = quad ? [A, [A[0] + w, A[1] + ri(-1, 1)], [A[0] + w + ri(-1, 1), A[1] + h], [A[0] + ri(-1, 0), A[1] + h + ri(0, 1)]] : tri ? [A, B, [A[0] - ri(0, 2), A[1] + ri(1, 3)]] : [A];
        const im = pts.map(p => [2 * P[0] - p[0], 2 * P[1] - p[1]]);
        if (pts.every(p => inR(p, 6)) && im.every(p => inR(p, 6)) && !pts.some(p => p[0] === P[0] && p[1] === P[1])) {
          if (pts.some(p => im.some(q => q[0] === p[0] && q[1] === p[1]))) continue;
          if (quad) {   // convex, and P outside the quadrilateral so the image does not overlap it
            const cr = pts.map((p, i) => { const a = pts[(i + 1) % 4], b = pts[(i + 2) % 4]; return (a[0] - p[0]) * (b[1] - a[1]) - (a[1] - p[1]) * (b[0] - a[0]); });
            if (!(cr.every(c => c > 0) || cr.every(c => c < 0))) continue;
            const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
            if (P[0] >= Math.min(...xs) - 1 && P[0] <= Math.max(...xs) + 1 && P[1] >= Math.min(...ys) - 1 && P[1] <= Math.max(...ys) + 1) continue;
          }
          return clickQ('<p>Reflect ' + (quad ? 'quadrilateral <b>ABCD</b>' : tri ? 'triangle <b>ABC</b>' : 'point <b>A</b>') + ' in point <b>P</b>. Click ' + (quad ? 'the four corners of the image' : tri ? 'the three corners of the image' : 'the image A′') + '. (Click again to remove a point.)</p>' + grp({ click: true, polys: tri ? [{ v: pts, label: ['A', 'B', 'C', 'D'] }] : [], pts: (tri ? [] : [{ x: pts[0][0], y: pts[0][1], label: 'A' }]).concat([{ x: P[0], y: P[1], label: 'P', color: MIR }]) }), im,
            'The image is at the same distance from P as the original, but on the other side of P. Go from A to P, and just as far again.', 'The image is marked in green on the grid.');
        }
      }
    
      return GN('2.4', 'reflectPoint')(l);
    },
    function reflectLine(l) {
      const tri = l > 0, kind = l === 2 ? pick(['x', 'y', 'd', 'd']) : pick(['x', 'y']), k = kind === 'd' ? 0 : ri(-2, 3);
      for (let t = 0; t < 300; t++) {
        const A = [ri(-5, 5), ri(-5, 5)], pts = tri ? [A, [A[0] + ri(1, 3), A[1] + ri(-2, 2)], [A[0] + ri(-2, 1), A[1] + ri(1, 3)]] : [A];
        const refl = p => kind === 'x' ? [2 * k - p[0], p[1]] : kind === 'y' ? [p[0], 2 * k - p[1]] : [p[1], p[0]];
        const im = pts.map(refl);
        const onLine = pts.some(p => (kind === 'x' ? p[0] === k : kind === 'y' ? p[1] === k : p[0] === p[1]));
        if (pts.every(p => inR(p, 6)) && im.every(p => inR(p, 6)) && !onLine && new Set(pts.map(String)).size === pts.length) {
          const mirror = kind === 'x' ? { a: [k, -7], b: [k, 7], dash: true, color: MIR, label: 'n' } : kind === 'y' ? { a: [-7, k], b: [7, k], dash: true, color: MIR, label: 'n' } : { a: [-7, -7], b: [7, 7], dash: true, color: MIR, label: 'n' };
          const nm = kind === 'x' ? 'x = ' + f(k) : kind === 'y' ? 'y = ' + f(k) : 'y = x';
          return clickQ('<p>Reflect ' + (tri ? 'triangle <b>ABC</b>' : 'point <b>A</b>') + ' in the mirror line <b>n</b>. Click ' + (tri ? 'the three corners of the image' : 'the image A′') + '.</p>' + grp({ click: true, segs: [mirror], polys: tri ? [{ v: pts, label: ['A', 'B', 'C'] }] : [], pts: tri ? [] : [{ x: A[0], y: A[1], label: 'A' }] }), im,
            'The image is at the same distance from the mirror line as the original, on the other side, and the line between them is at 90° to the mirror line.', 'The image is marked in green on the grid.');
        }
      }
    
      return GN('2.4', 'reflectLine')(l);
    },
    function midpoint(l) {
      const a = [ri(-6, 6), ri(-6, 6)], dx = 2 * ri(1, 4) * pick([-1, 1]), dy = 2 * ri(0, 3) * pick([-1, 1]), b = [a[0] + dx, a[1] + dy];
      if (!inR(b, 6)) return GN('2.4', 'midpoint')(l);
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      return clickQ('<p>Click the <b>middle</b> of line segment <b>AB</b>.</p>' + grp({ click: true, segs: [{ a, b, color: ptc }], pts: [{ x: a[0], y: a[1], label: 'A' }, { x: b[0], y: b[1], label: 'B' }] }), [m],
        'The middle is exactly as far from A as from B. Count the squares from A to B and go half of that way.', 'Go from A to B in two equal parts. The middle is marked in green.');
    },
    function whereIsP(l) {
      const P = [ri(-4, 4), ri(-4, 4)], A = [ri(-5, 5), ri(-5, 5)], A2 = [2 * P[0] - A[0], 2 * P[1] - A[1]];
      if (!inR(A2, 6) || (A[0] === A2[0] && A[1] === A2[1])) return GN('2.4', 'whereIsP')(l);
      return clickQ('<p>Point <b>A</b> is reflected in a point <b>P</b>. The image is <b>A′</b>. Click point <b>P</b>.</p>' + grp({ click: true, pts: [{ x: A[0], y: A[1], label: 'A' }, { x: A2[0], y: A2[1], label: 'A′' }] }), [P],
        'P is exactly in the middle of A and A′.', 'P is the middle of A and A′ (marked in green).');
    },
    function mirrorDist(l) {
      const d = ri(2, 9), line = pick(['line l', 'mirror line n']), mode = pick(['line', 'point']);
      return mode === 'line' ? { type: 'num', ans: 2 * d, correct: String(2 * d), html: '<p>Point A is <b>' + d + ' cm</b> from a mirror line. A is reflected in the line. What is the distance between <b>A and its image A′</b>?</p>',
        hint: 'A′ is also ' + d + ' cm from the mirror line, on the other side.', steps: d + ' + ' + d + ' = ' + 2 * d + ' cm.' }
        : { type: 'num', ans: d, correct: String(d), html: '<p>Point A is reflected in point P. The distance between A and A′ is <b>' + 2 * d + ' cm</b>. What is the distance from <b>A to P</b>?</p>',
        hint: 'P is exactly in the middle between A and A′.', steps: f(2 * d) + ' : 2 = ' + d + ' cm.' };
    },
    function rhombusFacts(l) {   // side facts only: perimeter is not in 1HVT ch2
      const side = ri(3, 9), p = ri(3, 8), q = p + ri(1, 5), mode = ri(0, 2);
      if (mode === 0) { const s2 = pick(['BC', 'CD', 'DA']); return { type: 'num', ans: side, correct: String(side),
        html: '<p>ABCD is a <b>rhombus</b>. Side AB is <b>' + side + ' cm</b>. How long is side <b>' + s2 + '</b>? (Give the number of cm.)</p>',
        hint: 'All four sides of a rhombus are equally long.', steps: 'All sides of a rhombus are equal, so ' + s2 + ' = ' + side + ' cm.' }; }
      if (mode === 1) return { type: 'num', ans: p, correct: String(p),
        html: '<p>KLMN is a <b>parallelogram</b>. KL = <b>' + p + ' cm</b> and LM = <b>' + q + ' cm</b>. How long is side <b>MN</b>? (Give the number of cm.)</p>',
        hint: 'In a parallelogram the opposite sides are equally long. Which side is opposite to MN?', steps: 'MN is opposite to KL, so MN = ' + p + ' cm.' };
      const opts = ['LM', 'MN', 'NK'];
      return { type: 'choice', opts, ans: 1, correct: 1, html: '<p>KLMN is a <b>parallelogram</b>. Which side is <b>parallel</b> to side <b>KL</b>?</p>',
        hint: 'In a parallelogram the opposite sides are parallel. Draw KLMN and look at the side across from KL.', steps: 'MN is opposite to KL, so KL // MN.' };
    },
    function compassCircle(l) {
      const r = ri(2, 8), mode = ri(0, 1);
      return mode === 0 ? { type: 'num', ans: r, correct: String(r),
        html: '<p>You draw a circle with your compass. The compass is opened <b>' + r + ' cm</b>. What is the <b>radius</b> of the circle? (Give the number of cm.)</p>',
        hint: 'The opening of the compass is the distance between the point and the pencil.', steps: 'The radius is ' + r + ' cm.' }
        : { type: 'num', ans: r, correct: String(r),
        html: '<p>You want to draw a circle with a <b>diameter of ' + 2 * r + ' cm</b>. How many cm do you open your compass?</p>',
        hint: 'You open the compass to the radius. The radius is half of the diameter.', steps: 'Radius = ' + 2 * r + ' : 2 = ' + r + ' cm.' };
    }
  ];

  const XG = {};   // extra spicy generators per section
  /* ---------- Extra spicy (level 4): challenge questions ---------- */
  XG['2.1'] = [
    function parDist(l) {
      const horiz = Math.random() < .5, k1 = ri(-5, 0), d = ri(2, 6), k2 = k1 + d;
      const s = (k, c, lab) => horiz ? { a: [-7, k], b: [7, k], color: c, label: lab } : { a: [k, -7], b: [k, 7], color: c, label: lab };
      return { type: 'num', ans: d, correct: String(d),
        html: '<p>Lines <b>l</b> and <b>m</b> are parallel. What is the distance between l and m? One square is 1 cm. (Give the number of cm.)</p>' + grp({ segs: [s(k1, ptc, 'l'), s(Math.min(k2, 6), MIR, 'm')] }),
        hint: 'Choose a point on l. Measure the distance from that point straight to the other line. The distance between parallel lines is the same everywhere.', steps: 'Distance = ' + d + ' cm.' };
    },
    function maxIntersect(l) {
      const n = l === 0 ? ri(2, 3) : ri(3, 4), ans = n * (n - 1) / 2;
      return { type: 'num', ans, correct: String(ans),
        html: '<p>You draw <b>' + n + ' lines</b> in a plane. What is the <b>maximum</b> number of points of intersection?</p>',
        hint: 'Make a drawing. Every line can cross every other line once. Each line crosses ' + (n - 1) + ' others, but every point is then counted twice.',
        steps: n + ' · ' + (n - 1) + ' = ' + n * (n - 1) + ', counted twice, so ' + n * (n - 1) + ' : 2 = ' + ans + '.' };
    },
    function maxIntersect5() {
      const n = pick([5, 6, 7]), ans = n * (n - 1) / 2, prev = (n - 1) * (n - 2) / 2;
      return { type: 'num', ans, correct: String(ans),
        html: '<p>You draw <b>' + n + ' lines</b> in a plane. What is the <b>maximum</b> number of points of intersection? (Pattern: 2 lines give 1, 3 lines give 3, 4 lines give 6, …)</p>',
        hint: 'Every line can cross each of the other ' + (n - 1) + ' lines once. But then every point is counted twice. Or continue the pattern: it goes up by 1 more each time.',
        steps: n + ' · ' + (n - 1) + ' = ' + n * (n - 1) + ', counted twice: ' + n * (n - 1) + ' : 2 = ' + ans + '. (Pattern: ' + prev + ' + ' + (n - 1) + ' = ' + ans + '.)' };
    },
    function distParallelPoints() {
      const horiz = Math.random() < .5, c1 = ri(-4, 0), d = ri(2, 7), c2 = c1 + d, a1 = ri(-6, 6), a2 = ri(-6, 6);
      const P = horiz ? [a1, c1] : [c1, a1], Q = horiz ? [a2, c2] : [c2, a2];
      const line = (k, col, lab) => horiz ? { a: [-7, k], b: [7, k], color: col, label: lab } : { a: [k, -7], b: [k, 7], color: col, label: lab };
      return { type: 'num', ans: d, correct: String(d),
        html: '<p>Line <b>l</b> goes through point <b>P</b> and line <b>m</b> goes through point <b>Q</b>. Both lines are <b>' + (horiz ? 'horizontal' : 'vertical') + '</b>. What is the distance between l and m? One square is 1 cm. (Give the number of cm.)</p>' + grp({ segs: [line(c1, ptc, 'l'), line(c2, MIR, 'm')], pts: [{ x: P[0], y: P[1], label: 'P', color: ptc }, { x: Q[0], y: Q[1], label: 'Q', color: MIR }] }),
        hint: 'The lines are ' + (horiz ? 'horizontal' : 'vertical') + ', so only the ' + (horiz ? 'up-and-down' : 'left-and-right') + ' distance matters. Where the points are along the lines does not change the distance.',
        steps: 'Count the squares between the two lines: ' + d + ' cm.' };
    },
    function throughPoint() {
      const dirs = [[1, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [2, -1], [1, -2]];
      const d = pick(dirs), rel = Math.random() < .5 ? 'par' : 'perp', A = [ri(-2, 2), ri(-2, 2)];
      const far = (P, v) => { let k = 0; while (Math.abs(P[0] + (k + 1) * v[0]) <= 7 && Math.abs(P[1] + (k + 1) * v[1]) <= 7) k++; let j = 0; while (Math.abs(P[0] - (j + 1) * v[0]) <= 7 && Math.abs(P[1] - (j + 1) * v[1]) <= 7) j++; return { a: [P[0] - j * v[0], P[1] - j * v[1]], b: [P[0] + k * v[0], P[1] + k * v[1]] }; };
      const s = far(A, d), e = rel === 'par' ? d : [-d[1], d[0]];
      let P, T, n = 0;
      do { P = [ri(-5, 5), ri(-5, 5)]; T = [P[0] + e[0], P[1] + e[1]]; n++; } while (n < 200 && (!inR(T, 6) || (rel === 'par' && (P[0] - A[0]) * d[1] - (P[1] - A[1]) * d[0] === 0)));
      return { type: 'click', rel, dir: d, base: A, through: P, targets: [T], correct: [T], example: true,
        html: '<p>Line <b>n</b> goes through point <b>P</b> and is <b>' + (rel === 'par' ? 'parallel' : 'perpendicular') + '</b> to line <b>m</b>. Click <b>one more point</b> that line n goes through.</p>' + grp({ segs: [{ a: s.a, b: s.b, color: ptc, label: 'm' }], pts: [{ x: P[0], y: P[1], label: 'P', color: MIR }], click: true }),
        hint: rel === 'par' ? 'Look at the steps of m (right and up or down). Start at P and take the same steps.' : 'Look at the steps of m. For a perpendicular line, swap the steps and make one of them the opposite (for example 2 right, 3 up becomes 3 right, 2 down). Start at P.',
        steps: 'Every point on line n is correct. The green line and points show them.', reveal: (() => { const L = revLine(P, e); return { segs: [L.seg], pts: L.pts.filter(p => !(p[0] === P[0] && p[1] === P[1])) }; })() };
    }
  ];
  XG['2.2'] = [
    function angleReason() {
      const kinds = [
        ['an <b>acute</b> angle', 'twice as big', 'acute, right or obtuse', 0],
        ['an <b>obtuse</b> angle', 'half as big', 'acute', 1],
        ['a <b>right</b> angle', 'twice as big', 'straight', 2],
        ['an <b>obtuse</b> angle', 'twice as big', 'reflex', 3],
        ['a <b>straight</b> angle', 'half as big', 'right', 4]
      ];
      const k = pick(kinds), all = ['acute', 'right', 'obtuse', 'straight', 'reflex'];
      const opts = ['acute only', 'right only', 'obtuse only', 'straight only', 'reflex only', 'acute, right or obtuse'];
      const want = k[2] === 'acute, right or obtuse' ? 'acute, right or obtuse' : k[2] + ' only';
      const o = shuffle([want].concat(shuffle(opts.filter(x => x !== want)).slice(0, 3))), ans = o.indexOf(want);
      const why = ['An acute angle is between 0° and 90°. Twice as big is between 0° and 180°: that can be acute, right or obtuse.', 'An obtuse angle is between 90° and 180°. Half as big is between 45° and 90°: acute.', 'A right angle is 90°. Twice as big is 180°: a straight angle.', 'An obtuse angle is between 90° and 180°. Twice as big is between 180° and 360°: reflex.', 'A straight angle is 180°. Half as big is 90°: a right angle.'][k[3]];
      return { type: 'choice', opts: o.map(x => x[0].toUpperCase() + x.slice(1)), ans, correct: ans,
        html: '<p>Angle A is ' + k[0] + '. Angle B is <b>' + k[1] + '</b> as angle A. What kind of angle is B?</p>',
        hint: 'Think about the smallest and the biggest size that angle A can have. Then double it (or halve it).', steps: why };
    },
    function turnSequence() {
      const dirs = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'];
      let i = ri(0, 7), pos = i, txt = [];
      const turns = [45, 90, 135, 180, 225, 270];
      for (let n = 0; n < 2; n++) { const t = pick(turns), side = pick(['right', 'left']); pos = ((pos + (side === 'right' ? 1 : -1) * t / 45) % 8 + 8) % 8; txt.push(t + '° to the ' + side); }
      const ans = pos, o = dirs;
      return { type: 'choice', opts: o, ans, correct: ans,
        html: '<p>You face <b>' + dirs[i] + '</b>. First you turn <b>' + txt[0] + '</b>. Then you turn <b>' + txt[1] + '</b>. In which direction do you face now? (Clockwise = right.)</p>',
        hint: 'Do the turns one at a time. Between North, East, South and West there is a 90° turn; 45° is half of that.', steps: 'Start ' + dirs[i] + '. After the two turns you face ' + dirs[ans] + '.' };
    },
    function twoArms() {
      const a = ri(12, 90), b = Math.min(172, a + ri(21, 80)), start = Math.random() < .5 ? 'R' : 'L';
      const A = start === 'R' ? a : 180 - a, B = start === 'R' ? b : 180 - b;
      return { type: 'num', ans: b - a, tol: 1, correct: String(b - a),
        html: '<p>The <b>black arm</b> and the <b>blue arm</b> are the two sides of an angle. Neither arm is on the zero line. What is the size of the angle between the black and the blue arm? (Give the number of degrees. A difference of 1° is fine.)</p>' + protractor({ start, arm: A, arm2: B }),
        hint: 'Read both arms on the same scale. Then subtract: bigger number minus smaller number.', steps: 'On the scale that starts at the red arm: black = ' + a + '°, blue = ' + b + '°. The angle between them is ' + b + ' − ' + a + ' = ' + (b - a) + '°.' };
    },
    function clockAngle() {
      const h = ri(1, 11), m = 10 * ri(0, 5);
      const hand = (30 * h + m / 2) % 360, min = 6 * m, diff = Math.abs(hand - min), ang = diff > 180 ? 360 - diff : diff;
      if (ang === 0 || ang === 180) return GN('2.2', 'turnSequence')();
      const t = h + ':' + (m < 10 ? '0' : '') + m;
      return { type: 'num', ans: ang, correct: String(ang),
        html: '<p>A clock shows <b>' + t + '</b>. What is the <b>smaller</b> angle between the hour hand and the minute hand? (Give the number of degrees.)</p>',
        hint: 'The minute hand turns 6° per minute. The hour hand turns 30° per hour, so 0,5° per minute.',
        steps: 'Minute hand: ' + m + ' · 6 = ' + min + '°. Hour hand: ' + h + ' · 30 + ' + m + ' · 0,5 = ' + hand + '°. Difference: ' + diff + '°' + (diff > 180 ? ', and the smaller angle is 360° − ' + diff + '° = ' + ang + '°.' : '.') };
    }
  ];
  XG['2.3'] = [
    function thirdAngle(l) {
      const a = ri(25, 90), b = ri(20, 175 - a - 10), c = 180 - a - b;
      return { type: 'num', ans: c, correct: String(c), html: '<p>Two angles of a triangle are <b>' + a + '°</b> and <b>' + b + '°</b>. How large is the third angle?</p>',
        hint: 'The three angles of a triangle add up to 180°.', steps: '180° − ' + a + '° − ' + b + '° = ' + c + '°.' };
    },
    function diagonalsPattern() {   // challenge, still at most a pentagon: where do the diagonals cross?
      const V = [0, 1, 2, 3, 4].map(k => { const t = (90 + 72 * k + 144) * Math.PI / 180; return [+(5.5 * Math.cos(t)).toFixed(2), +(5.5 * Math.sin(t)).toFixed(2)]; });
      const segs = []; for (let i = 0; i < 5; i++) for (let j = i + 2; j < 5; j++) if (!(i === 0 && j === 4)) segs.push({ a: V[i], b: V[j], color: '#16803c' });
      const q = pick([['How many diagonals does the pentagon have?', 5, 'The diagonals are AC, AD, BD, BE and CE: 5 diagonals.'], ['Inside the pentagon, how many points are there where two diagonals cross?', 5, 'Each diagonal crosses two others. The crossing points form a small pentagon in the middle: 5 points.']]);
      return { type: 'num', ans: q[1], correct: String(q[1]),
        html: '<p>All diagonals of pentagon ABCDE are drawn. ' + q[0] + '</p>' + grp({ polys: [{ v: V }], texts: cornerLabels(V, 'ABCDE'.split('')), segs }),
        hint: 'Count carefully and tick off each one you have counted. A diagonal goes from a corner to a corner that is not next to it.', steps: q[2] };
    },
    function circlesMeet() {
      const r1 = ri(2, 5), r2 = ri(2, 5), mode = ri(0, 2), d = mode === 0 ? r1 + r2 : mode === 1 ? Math.abs(r1 - r2) + ri(1, Math.min(r1, r2) * 2 - 1) : r1 + r2 + ri(1, 3);
      if (mode === 1 && (d <= Math.abs(r1 - r2) || d >= r1 + r2)) return GN('2.3', 'circlesMeet')();
      const ans = d === r1 + r2 ? 1 : d < r1 + r2 ? 2 : 0, o = ['0 points', '1 point', '2 points'];
      return { type: 'choice', opts: o, ans, correct: ans,
        html: '<p>Points A and C are <b>' + d + ' cm</b> apart. You draw a circle with centre A and radius <b>' + r1 + ' cm</b>, and a circle with centre C and radius <b>' + r2 + ' cm</b>. How many points do the two circles have in common?</p>',
        hint: 'Compare the distance between A and C with the sum of the two radii: ' + r1 + ' + ' + r2 + ' = ' + (r1 + r2) + ' cm.',
        steps: 'Radii together: ' + (r1 + r2) + ' cm. ' + (ans === 1 ? 'That is exactly ' + d + ' cm: the circles just touch, so 1 point.' : ans === 2 ? d + ' cm is less than ' + (r1 + r2) + ' cm (and the circles are not inside each other): they cross in 2 points.' : d + ' cm is more than ' + (r1 + r2) + ' cm: the circles do not reach each other, so 0 points.') };
    },
    function isosceles() {
      const apex = pick([20, 30, 40, 50, 70, 80, 100, 110, 120, 140]), base = (180 - apex) / 2, rev = Math.random() < .5;
      return rev ? { type: 'num', ans: apex, correct: String(apex),
        html: '<p>Triangle ABC is <b>isosceles</b> with <b>AB = AC</b>. The angles at B and C are both <b>' + base + '°</b>. How big is angle <b>A</b>? (Give the number of degrees.)</p>',
        hint: 'The three angles of a triangle add up to 180°.', steps: '180 − ' + base + ' − ' + base + ' = ' + apex + '°.' }
        : { type: 'num', ans: base, correct: String(base),
        html: '<p>Triangle ABC is <b>isosceles</b> with <b>AB = AC</b>. Angle <b>A = ' + apex + '°</b>. How big is angle <b>B</b>? (Give the number of degrees.)</p>',
        hint: 'AB = AC, so the angles at B and C are equal. Together they make 180° − ' + apex + '°.', steps: '180 − ' + apex + ' = ' + (180 - apex) + '°. Then ' + (180 - apex) + ' : 2 = ' + base + '°.' };
    },
    function radiiTriangle() {
      const th = pick([40, 50, 60, 70, 80, 100, 120, 140]), base = (180 - th) / 2;
      return { type: 'num', ans: base, correct: String(base),
        html: '<p>O is the centre of a circle. A and B lie on the circle and the angle <b>AOB = ' + th + '°</b>. How big is angle <b>OAB</b>? (Give the number of degrees.)</p>',
        hint: 'OA and OB are both radii, so they are equally long. What kind of triangle is OAB? Its base angles are equal.',
        steps: 'Triangle OAB is isosceles (OA = OB). The other two angles together: 180 − ' + th + ' = ' + (180 - th) + '°. So each is ' + (180 - th) + ' : 2 = ' + base + '°.' };
    },
  ];
  XG['2.4'] = [
    function canMake(l) {
      const yes = Math.random() < .5; let a, b, c;
      if (yes) { do { a = ri(2, 9); b = ri(2, 9); c = ri(2, 9); } while (Math.max(a, b, c) >= a + b + c - Math.max(a, b, c)); }
      else { a = ri(2, 6); b = ri(2, 6); c = a + b + (l === 0 ? ri(1, 5) : l === 1 ? pick([0, 1, 2]) : pick([0, 0, 1])); }
      const t = shuffle([a, b, c]);
      return { type: 'choice', opts: ['Yes, you can make this triangle', 'No, you cannot make this triangle'], ans: yes ? 0 : 1, correct: yes ? 0 : 1,
        html: '<p>Can you construct a triangle with sides of <b>' + t.join(' cm, ') + ' cm</b>?</p>', hint: 'The longest side must be less than the sum of the other two sides.',
        steps: 'Longest side: ' + Math.max(a, b, c) + ' cm. The other two: ' + (a + b + c - Math.max(a, b, c)) + ' cm. ' + (yes ? 'The longest side is smaller, so yes.' : 'The longest side is not smaller, so no.') };
    },
    function thirdSide() {
      const a = ri(3, 6), b = a + ri(2, 6), lo = b - a, hi = a + b;
      const bad = pick([lo - 1 > 0 ? lo - 1 : 1, lo, hi, hi + ri(1, 3)]), good = [];
      for (let v = lo + 1; v < hi; v++) good.push(v);
      const g3 = shuffle(good).slice(0, 3);
      if (g3.length < 3 || g3.includes(bad)) return GN('2.4', 'thirdSide')();
      const o = shuffle(g3.concat([bad])), ans = o.indexOf(bad);
      return { type: 'choice', opts: o.map(v => v + ' cm'), ans, correct: ans,
        html: '<p>A triangle has two sides of <b>' + a + ' cm</b> and <b>' + b + ' cm</b>. Which length can the <b>third side NOT</b> be?</p>',
        hint: 'The third side must be shorter than the other two sides together, and longer than their difference.',
        steps: 'The third side must be longer than ' + b + ' − ' + a + ' = ' + lo + ' cm and shorter than ' + b + ' + ' + a + ' = ' + hi + ' cm. So ' + bad + ' cm is not possible.' };
    },
    function doubleReflect() {
      let k, A, P, B, C, n = 0;
      do { k = ri(-3, 3); A = [ri(-5, 5), ri(-5, 5)]; P = [ri(-5, 5), ri(-5, 5)]; B = [A[0], 2 * k - A[1]]; C = [2 * P[0] - B[0], 2 * P[1] - B[1]]; n++; }
      while (n < 300 && (!inR(B, 6) || !inR(C, 6) || A[1] === k || (C[0] === P[0] && C[1] === P[1]) || (C[0] === A[0] && C[1] === A[1])));   // A″ must not sit on a given point
      return clickQ('<p>Point <b>A</b> is reflected in the <b>mirror line n</b> (dashed). The image is called <b>A′</b>. Then A′ is reflected in <b>point P</b>, which gives <b>A″</b>. Click <b>A″</b>.</p>' + grp({ click: true, segs: [{ a: [-7, k], b: [7, k], color: '#16803c', label: 'n', dash: true }], pts: [{ x: A[0], y: A[1], label: 'A' }, { x: P[0], y: P[1], label: 'P', color: MIR }] }), [C],
        'Do it in two steps. Step 1: A′ is as far below/above n as A is, on the other side. Step 2: A″ is as far from P as A′, on the opposite side (a half turn around P).',
        'A′ is on the other side of the mirror line (same distance). A″ is on the other side of P (same distance). A″ is marked in green.');
    }
  ];

  const SECTIONS = [
    { id: '2.1', title: '2.1 Lines and distances', sub: 'Parallel, perpendicular, distances' },
    { id: '2.2', title: '2.2 Angles', sub: 'Types, reflex, clocks, compass' },
    { id: '2.3', title: '2.3 Triangles and circles', sub: 'Triangles, quadrilaterals, circles' },
    { id: '2.4', title: '2.4 Constructing and reflecting', sub: 'Can you make it? Reflect in a point or line' }
  ];

  /* ---------- lessons (follow the study guide) ---------- */
  const ALL = (sec) => (G[sec] || []).map(f => [sec, f.name]);
  const LESSONS = [
    { id: 'L1', title: 'Lesson 1 · 2.1 Lines and distances', sub: 'Thu 1 Oct', date: '2026-10-01', gens: ALL('2.1'), xg: [['2.1', 'distParallelPoints'], ['2.1', 'throughPoint'], ['2.1', 'maxIntersect5']] },
    { id: 'L2', title: 'Lesson 2 · 2.2 Angles', sub: 'Fri 2 Oct', date: '2026-10-02',
      gens: [['2.2', 'typeByDegrees'], ['2.2', 'typeByPicture'], ['2.2', 'reflex'], ['2.2', 'clock'], ['2.2', 'compass'], ['2.2', 'vertexName'], ['2.2', 'complete']], xg: [['2.2', 'angleReason'], ['2.2', 'clockAngle'], ['2.2', 'turnSequence']] },
    { id: 'L3', title: 'Lesson 3 · 2.2 Measuring and drawing angles', sub: 'Tue 6 Oct', date: '2026-10-06',
      gens: [['2.2', 'drawAngle'], ['2.2', 'readAngle'], ['2.2', 'pickReading'], ['2.2', 'complete'], ['2.4', 'tools']], xg: [['2.2', 'twoArms'], ['2.2', 'angleReason']] },
    { id: 'L4', title: 'Lesson 4 · 2.3 Triangles', sub: 'Wed 7 Oct', date: '2026-10-07',
      gens: [['2.3', 'triByAngles'], ['2.3', 'triBySidesFromAngles'], ['2.3', 'triBySides']], xg: [['2.3', 'thirdAngle'], ['2.3', 'isosceles'], ['2.4', 'thirdSide']] },
    { id: 'L5', title: 'Lesson 5 · 2.3 Quadrilaterals and circles', sub: 'Thu 8 Oct', date: '2026-10-08',
      gens: [['2.3', 'quadName'], ['2.3', 'alwaysSometimes'], ['2.3', 'circleConv'], ['2.3', 'circlesInRect'], ['2.3', 'fourthVertex'], ['2.3', 'diagonals']], xg: [['2.3', 'radiiTriangle'], ['2.3', 'circlesMeet'], ['2.3', 'diagonalsPattern']] },
    { id: 'L6', title: 'Lesson 6 · 2.4 Constructing triangles', sub: 'Fri 9 Oct', date: '2026-10-09',
      gens: [['2.4', 'tools'], ['2.4', 'compassCircle'], ['2.3', 'triBySides']], xg: [['2.4', 'canMake'], ['2.3', 'thirdAngle'], ['2.4', 'thirdSide'], ['2.3', 'isosceles']] },
    { id: 'L7', title: 'Lesson 7 · 2.4 Constructing with a compass', sub: 'Tue 27 Oct', date: '2026-10-27',
      gens: [['2.4', 'tools'], ['2.4', 'compassCircle'], ['2.4', 'rhombusFacts']], xg: [['2.4', 'canMake'], ['2.3', 'circlesMeet'], ['2.4', 'thirdSide']] },
    { id: 'L8', title: 'Lesson 8 · 2.4 Reflecting in a point', sub: 'Wed 28 Oct', date: '2026-10-28',
      gens: [['2.4', 'reflectPoint'], ['2.4', 'midpoint'], ['2.4', 'whereIsP'], ['2.4', 'mirrorDist']], xg: [['2.4', 'doubleReflect']] },
    { id: 'L9', title: 'Lesson 9 · 2.4 Reflecting in a line', sub: 'Thu 29 Oct', date: '2026-10-29',
      gens: [['2.4', 'reflectLine'], ['2.4', 'reflectPoint'], ['2.4', 'mirrorDist']], xg: [['2.4', 'doubleReflect']] },
    { id: 'L10', title: 'Revision · whole chapter', sub: 'Fri 30 Oct', date: '2026-10-30',
      gens: [].concat(ALL('2.1'), ALL('2.2'), ALL('2.3'), ALL('2.4')), xg: [].concat(...Object.keys(XG).map(k => XG[k].map(f => [k, f.name]))) }
  ];

  /* ---------- NX glue ---------- */
  const __gradeOld = (q, u) => {   // grading of the older engine for the question types NX does not know
    if (q.type === 'proto') return typeof u === 'number' && Math.abs(u - q.target) <= q.tol;
    if (q.type === 'click' && q.rel) {   // parallel/perpendicular line: any number of clicked points (at least the number asked), all on one line in the right direction
      const pts = Array.isArray(u) ? u : [], d = q.dir, e = q.rel === 'perp' ? [-d[1], d[0]] : d;
      const word = q.rel === 'perp' ? 'perpendicular' : 'parallel', no = msg => ({ ok: false, why: 'form', msg });
      const off = (p, o) => (p[0] - o[0]) * e[1] - (p[1] - o[1]) * e[0];   // 0 when p lies on the line through o in direction e
      if (q.through) {
        if (!pts.some(p => p[0] !== q.through[0] || p[1] !== q.through[1])) return no('Click a point on line n other than P.');
        return pts.every(p => off(p, q.through) === 0) || no('Not all your points are on line n. Line n goes through P and is ' + word + ' to m.');
      }
      if (pts.length < 2) return no('Click at least two points.');
      if (!pts.every(p => off(p, pts[0]) === 0)) return no('Your points are not all on one line that is ' + word + ' to m.');
      if (q.rel === 'par' && off(pts[0], q.base) === 0) return no('Those points are on m itself. Choose points on a different line.');
      return true;
    }
    return false;
  };
  const __noStep = new Set(['xIntercept', 'missingCoord', 'solveX', 'solveNeg', 'whereCrossesX', 'timeFor', 'breakEven']);   // equations: the working is solving, not one calculation
  const __conv = (q, name) => {
    if (!q) return q;
    if (__noStep.has(name) && q.type === 'num') q.noStep = true;
    if (q.type === 'proto') { q.grade = u => __gradeOld(q, u); q.ansText = 'the green arm on the protractor'; }
    else if (q.type === 'click' && q.rel) { q.grade = u => __gradeOld(q, u); q.ansText = 'see the green point' + ((q.targets || []).length > 1 ? 's' : '') + ' on the grid'; }
    else if (q.type === 'click' && q.targets && !q.ans) { q.ans = q.targets; q.ansText = 'see the green point' + (q.targets.length > 1 ? 's' : '') + ' on the grid'; }
    return q;
  };
  const __wrap = L => { for (const k in L) L[k] = L[k].map(fn => { const g = l => __conv(fn(l), fn.name); Object.defineProperty(g, 'name', { value: fn.name }); return g; }); };
  __wrap(G); __wrap(XG);
  const GOALS = [["2.1", "I can name lines, rays and segments and say how lines are related", ["nameIt", "relation", "lineSymbols", "maxIntersect", "maxIntersect5"]], ["2.1", "I can measure distances between points and lines, and draw parallel lines", ["distPointLine", "parDist", "atDistance", "clickParPerp", "distParallelPoints", "throughPoint"]], ["2.2", "I can name and classify angles", ["typeByDegrees", "typeByPicture", "reflex", "vertexName", "angleReason"]], ["2.2", "I can calculate with angles, clocks and compass directions", ["clock", "compass", "complete", "turnSequence", "clockAngle"]], ["2.2", "I can read and draw angles with a protractor", ["drawAngle", "readAngle", "pickReading", "twoArms"]], ["2.3", "I can classify triangles and quadrilaterals", ["triByAngles", "triBySidesFromAngles", "triBySides", "quadName", "fourthVertex", "alwaysSometimes"]], ["2.3", "I can use angle sums, circles and diagonals", ["thirdAngle", "circleConv", "circlesInRect", "diagonals", "diagonalsPattern", "circlesMeet", "isosceles", "radiiTriangle"]], ["2.4", "I can decide whether a triangle can be constructed and choose the right tool", ["canMake", "tools", "compassCircle", "thirdSide"]], ["2.4", "I can reflect points in a point or a line and find a midpoint", ["reflectPoint", "reflectLine", "midpoint", "whereIsP", "mirrorDist", "rhombusFacts", "doubleReflect"]]];
  /* test preparation: one-step recall items stay in practice only (compared with the 2026-27 test and book ex 91-104) */
  const TEST = { skip: ['relation', 'typeByPicture', 'vertexName', 'pickReading', 'triBySides', 'circleConv', 'tools', 'midpoint', 'whereIsP', 'mirrorDist', 'rhombusFacts', 'compassCircle'] };
  return { key: 'ch2-1hvt-plane-figures-v1', SECTIONS, LESSONS: LESSONS, G, XG, GOALS, TEST };
