/* 2ht-chapter-3: moved from the older engine to NX on 2026-10-22. Generators unchanged; only the engine around them changed. */
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
    let s = '<svg class="grid" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="coordinate grid"' +
      (o.click ? ' data-click="1" data-xmin="' + xmin + '" data-ymax="' + ymax + '" data-u="' + u + '" data-pad="' + pad + '" data-w="' + w + '"' : '') + '>';
    s += '<defs><clipPath id="' + id + '"><rect x="' + X(xmin) + '" y="' + Y(ymax) + '" width="' + (xmax - xmin) * u + '" height="' + (ymax - ymin) * u + '"/></clipPath></defs>';
    s += '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#fff"/>';
    for (let x = xmin; x <= xmax; x++) s += '<line x1="' + X(x) + '" y1="' + Y(ymin) + '" x2="' + X(x) + '" y2="' + Y(ymax) + '" stroke="#dbe3ea" stroke-width="1"/>';
    for (let y = ymin; y <= ymax; y++) s += '<line x1="' + X(xmin) + '" y1="' + Y(y) + '" x2="' + X(xmax) + '" y2="' + Y(y) + '" stroke="#dbe3ea" stroke-width="1"/>';
    s += '<line x1="' + X(xmin) + '" y1="' + Y(0) + '" x2="' + X(xmax) + '" y2="' + Y(0) + '" stroke="#334" stroke-width="1.6"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(ymin) + '" x2="' + X(0) + '" y2="' + Y(ymax) + '" stroke="#334" stroke-width="1.6"/>';
    s += '<text x="' + (X(xmax) + 4) + '" y="' + (Y(0) + 4) + '" font-size="12" font-style="italic" fill="#334">x</text>';
    s += '<text x="' + (X(0) + 6) + '" y="' + (Y(ymax) - 8) + '" font-size="12" font-style="italic" fill="#334">y</text>';
    const stx = xmax - xmin > 12 ? 2 : 1, sty = ymax - ymin > 12 ? 2 : 1;
    for (let x = xmin; x <= xmax; x++) if (x !== 0 && x % stx === 0) s += '<text x="' + X(x) + '" y="' + (Y(0) + 14) + '" font-size="10" text-anchor="middle" fill="#556">' + f(x) + '</text>';
    for (let y = ymin; y <= ymax; y++) if (y !== 0 && y % sty === 0) s += '<text x="' + (X(0) - 5) + '" y="' + (Y(y) + 3.5) + '" font-size="10" text-anchor="end" fill="#556">' + f(y) + '</text>';
    (o.curves || []).forEach(c => {
      let d = '', pen = false;
      for (let x = xmin; x <= xmax + 1e-9; x += 0.05) {
        const y = c.f(x);
        if (y < ymin - 2 || y > ymax + 2) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); pen = true;
      }
      s += '<path d="' + d + '" fill="none" stroke="' + (c.color || '#d1471f') + '" stroke-width="2.4" clip-path="url(#' + id + ')"/>';
    });
    (o.pts || []).forEach(p => {
      s += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="4.6" fill="' + (p.color || '#1b5fa8') + '" stroke="#fff" stroke-width="1.2"/>';
      if (p.label) s += '<text x="' + (X(p.x) + 7) + '" y="' + (Y(p.y) - 7) + '" font-size="13" font-weight="700" fill="#123">' + p.label + '</text>';
    });
    s += '<g class="marks"></g></svg>';
    return s;
  }

  /* ---------- Question builders. Each returns a question object ----------
     type: num | multi | point | choice | click
     correct: a right answer in "user format" (used by tests)                  */
  const G = {};   // section id -> array of generators (lvl)=>Q

  /* ---------- 2HT helpers ---------- */
  const poly = terms => {              // terms: [[coef, 'x²'], ...]
    let s = '';
    terms.forEach(t => {
      const c = t[0], v = t[1]; if (c === 0) return;
      const ab = Math.abs(c), body = (v && ab === 1) ? v : String(ab) + v;
      s += s === '' ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body;
    });
    return s === '' ? '0' : s;
  };
  const quad = (a, b, c) => poly([[a, 'x²'], [b, 'x'], [c, '']]);
  const quadShuf = (a, b, c) => poly(shuffle([[a, 'x²'], [b, 'x'], [c, '']]));
  const linShuf = (m, b) => poly(Math.random() < .5 ? [[m, 'x'], [b, '']] : [[b, ''], [m, 'x']]);
  const rnd2 = n => Math.round(n * 100) / 100;
  const half = n => (Math.abs(n * 2 - Math.round(n * 2)) < 1e-9);
  const vtx = (a, b, c) => { const x = -b / (2 * a); return [x, a * x * x + b * x + c]; };

  /* 3.1 Linear relations */
  G['3.1'] = [
    function gradientIntercept(l) {
      let m, b, txt;
      if (l === 0) { m = ri(1, 5); b = ri(-5, 6); txt = poly([[m, 'x'], [b, '']]); }
      else if (l === 1) { m = nz(-5, 5); b = nz(-8, 8); txt = poly([[m, 'x'], [b, '']]); }
      else { m = nz(-6, 6); b = nz(-9, 9); txt = poly([[b, ''], [m, 'x']]); }
      return { type: 'multi', fields: ['gradient m', 'y-intercept b'], ans: [m, b], correct: [String(m), String(b)],
        html: '<p>Give the gradient and the y-intercept of the line <b>y = ' + txt + '</b>.</p>',
        hint: 'Write the formula as y = mx + b. The number with x is m, the number on its own is b.',
        steps: 'y = ' + f(m) + 'x ' + (b < 0 ? '− ' : '+ ') + Math.abs(b) + '. So m = ' + f(m) + ' and b = ' + f(b) + '.' };
    },
    function direction(l) {
      const kind = pick(['inc', 'dec', 'dec', 'inc', 'hor']);
      let m = kind === 'inc' ? ri(1, 6) : kind === 'dec' ? -ri(1, 6) : 0;
      const b = ri(-6, 7), txt = m === 0 ? 'y = ' + f(b) : 'y = ' + (l === 2 ? linShuf(m, b) : poly([[m, 'x'], [b, '']]));
      const opts = ['An increasing line', 'A decreasing line', 'A horizontal line'];
      const ans = kind === 'inc' ? 0 : kind === 'dec' ? 1 : 2;
      return { type: 'choice', opts, ans, correct: ans, html: '<p>What kind of graph does <b>' + txt + '</b> have?</p>',
        hint: 'Look at the sign of the gradient m. m > 0, m < 0, or no x in the formula at all.',
        steps: m === 0 ? 'There is no x, so y is always ' + f(b) + ': a horizontal line.' : 'm = ' + f(m) + (m > 0 ? ' > 0: increasing.' : ' < 0: decreasing.') };
    },
    function gradientTwoPoints(l) {
      const m = l === 0 ? ri(1, 4) : l === 1 ? nz(-4, 4) : pick([-2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5]);
      const dx = l === 2 ? 2 * ri(1, 3) : ri(1, 3), x1 = ri(-4, 3), b = ri(-5, 5), y1 = rnd2(m * x1 + b), x2 = x1 + dx, y2 = rnd2(m * x2 + b);
      if (Math.abs(y1) > 15 || Math.abs(y2) > 15) return G['3.1'][2](l);
      return { type: 'num', ans: m, correct: String(m),
        html: '<p>A line passes through the points <b>' + pt(x1, y1) + '</b> and <b>' + pt(x2, y2) + '</b>. What is the gradient <b>m</b> of the line?</p>',
        hint: 'm = (change in y) / (change in x). Subtract the coordinates: (y₂ − y₁) / (x₂ − x₁).',
        steps: 'm = (' + f(y2) + ' − ' + par(y1) + ') / (' + f(x2) + ' − ' + par(x1) + ') = ' + f(rnd2(y2 - y1)) + ' / ' + f(dx) + ' = ' + f(m) };
    },
    function formulaFromGraph(l) {
      const m = l === 0 ? ri(1, 3) : nz(-3, 3), b = l === 0 ? ri(-3, 3) : ri(-4, 4), help = l < 2;   // spicy: no helper points
      return { type: 'multi', fields: ['m', 'b'], ans: [m, b], correct: [String(m), String(b)],
        html: '<p>The graph of the line <b>y = mx + b</b> is shown. Find <b>m</b> and <b>b</b>.</p>' + grid({ xmin: -5, xmax: 5, ymin: -8, ymax: 8, curves: [{ f: x => m * x + b }], pts: help ? [{ x: 0, y: b, color: '#16803c' }, { x: 1, y: m + b, color: '#16803c' }] : [] }),
        hint: (help ? '' : 'Find two grid points on the line first. ') + 'b is where the line crosses the y-axis. For m: go 1 to the right and see how much y changes.',
        steps: 'b = ' + f(b) + ' (at x = 0). At x = 1, y = ' + f(m + b) + ', so m = ' + f(m + b) + ' − ' + par(b) + ' = ' + f(m) + '.' };
    },
    function tableLinear(l) {
      const m = nz(-4, 4), b = ri(-6, 7), step = l === 2 ? 2 : 1, x0 = l === 0 ? 0 : ri(-2, 2);
      const xs = [0, 1, 2, 3, 4].map(i => x0 + i * step);
      const mode = l === 0 ? 0 : 1;
      if (mode === 0) return { type: 'multi', fields: ['m', 'b'], ans: [m, b], correct: [String(m), String(b)],
        html: '<p>The table shows a linear relationship <b>y = mx + b</b>. Find <b>m</b> and <b>b</b>.</p>' + tbl(xs, xs.map(x => m * x + b)),
        hint: 'm = how much y changes when x increases by 1. b = the y-value at x = 0.', steps: 'm = ' + f(m) + ', b = ' + f(b) + '.' };
      const hid = ri(1, 3), ys = xs.map((x, i) => i === hid ? null : m * x + b);
      return { type: 'num', ans: m * xs[hid] + b, correct: String(m * xs[hid] + b),
        html: '<p>The table shows a linear relationship. Fill in the missing value (<b>?</b>).</p>' + tbl(xs, ys),
        hint: 'Find the change in y for one step in the table, then use it to fill the gap.', steps: 'y changes by ' + f(m * step) + ' per step. At x = ' + f(xs[hid]) + ': y = ' + f(m * xs[hid] + b) + '.' };
    },
    function parallel(l) {
      const m = nz(-4, 4), b0 = ri(-5, 5), x0 = nz(-4, 4), y0 = ri(-6, 6), b = y0 - m * x0;
      return { type: 'multi', fields: ['m', 'b'], ans: [m, b], correct: [String(m), String(b)],
        html: '<p>Line p has the formula <b>y = ' + poly([[m, 'x'], [b0, '']]) + '</b>. Line q is parallel to line p and passes through the point <b>' + pt(x0, y0) + '</b>. Find the formula <b>y = mx + b</b> of line q.</p>',
        hint: 'Parallel lines have the same gradient. Then substitute the point to find b.',
        steps: 'm = ' + f(m) + '. ' + f(y0) + ' = ' + f(m) + ' · ' + par(x0) + ' + b, so b = ' + f(y0) + ' − ' + par(m * x0) + ' = ' + f(b) + '.' };
    },
    function xIntercept(l) {
      let m = nz(-4, 4), x = nz(-6, 6), b = -m * x;
      if (l >= 2) { m = pick([2, -2, 4, -4]); b = (2 * ri(-6, 5) + 1) * (Math.abs(m) / 2); x = -b / m; }   // spicy: the answer is not a whole number
      return { type: 'num', ans: x, correct: String(x),
        html: '<p>At which <b>x</b> does the line <b>y = ' + poly([[m, 'x'], [b, '']]) + '</b> intersect the x-axis?</p>',
        hint: 'On the x-axis y = 0. Solve ' + poly([[m, 'x'], [b, '']]) + ' = 0.',
        steps: poly([[m, 'x'], [b, '']]) + ' = 0 gives ' + f(m) + 'x = ' + f(-b) + ', so x = ' + f(x) + '.' };
    },
    function missingCoord(l) {
      const m = nz(-4, 4), b = ri(-6, 6), x = ri(-4, 5), y = m * x + b, askY = Math.random() < .5;
      return { type: 'num', ans: askY ? y : x, correct: String(askY ? y : x),
        html: '<p>The point <b>' + (askY ? '(' + f(x) + ', p)' : '(p, ' + f(y) + ')') + '</b> lies on the line <b>y = ' + poly([[m, 'x'], [b, '']]) + '</b>. Calculate <b>p</b>.</p>',
        hint: askY ? 'Substitute x = ' + f(x) + ' in the formula.' : 'Substitute y = ' + f(y) + ' in the formula and solve for x.',
        steps: askY ? 'y = ' + subStep(m, b, x) : poly([[m, 'x'], [b, '']]) + ' = ' + f(y) + ' gives x = ' + f(x) };
    }
  ];

  /* 3.2 Directly proportional relationships */
  const PC = [
    { t: (k) => 'A tap fills a bath with ' + k + ' litres every minute.', x: 'time t (min)', y: 'volume V (litres)', v: 't', yv: 'V' },
    { t: (k) => 'One kilogram of apples costs €' + k + '.', x: 'weight w (kg)', y: 'price P (€)', v: 'w', yv: 'P' },
    { t: (k) => 'A cyclist rides at a constant speed of ' + k + ' km/h.', x: 'time t (h)', y: 'distance d (km)', v: 't', yv: 'd' },
    { t: (k) => 'A machine makes ' + k + ' bolts per second.', x: 'time t (s)', y: 'bolts N', v: 't', yv: 'N' }
  ];
  G['3.2'] = [
    function isDirect(l) {
      const dir = Math.random() < .5, k = ri(2, 6), xs = l === 0 ? [1, 2, 3, 4] : [2, 4, 5, 10], b = nz(-4, 5);
      const ys = xs.map(x => dir ? k * x : k * x + b);
      const ratio = xs.map((x, i) => rnd2(ys[i] / x));
      return { type: 'choice', opts: ['Yes, directly proportional', 'No, not directly proportional'], ans: dir ? 0 : 1, correct: dir ? 0 : 1,
        html: '<p>Is this a directly proportional relationship?</p>' + tbl(xs, ys),
        hint: 'Calculate y / x for every pair. If the ratio is always the same, it is directly proportional.',
        steps: 'y / x = ' + ratio.map(f).join(', ') + (dir ? ': always the same, so yes.' : ': not the same, so no.') };
    },
    function findK(l) {
      const k = l === 0 ? ri(2, 6) : l === 1 ? pick([0.5, 1.5, 2.5, 3, 4, 7, 8]) : pick([0.25, 0.4, 1.2, 2.5, 3.5, 12, 0.75]);
      const xs = pick([[2, 4, 6, 8], [1, 3, 5, 10], [4, 8, 10, 20]]);
      return { type: 'num', ans: k, correct: String(k),
        html: '<p>The table shows a directly proportional relationship <b>y = kx</b>. Find the constant of proportionality <b>k</b>.</p>' + tbl(xs, xs.map(x => rnd2(k * x))),
        hint: 'k = y / x. Divide y by x for one pair of the table.', steps: 'k = ' + f(rnd2(k * xs[1])) + ' / ' + xs[1] + ' = ' + f(k) };
    },
    function valueFromPair(l) {
      const k = l === 0 ? ri(2, 5) : pick([1.5, 2.5, 3, 4, 6]), x1 = pick([2, 4, 6, 8]), x2 = pick([3, 5, 7, 10, 12].filter(v => v !== x1)), askY = Math.random() < .6;
      const y1 = rnd2(k * x1), y2 = rnd2(k * x2);
      return { type: 'num', ans: askY ? y2 : x2, correct: String(askY ? y2 : x2),
        html: '<p><b>y</b> is directly proportional to <b>x</b>. When x = ' + x1 + ', y = ' + f(y1) + '. ' + (askY ? 'Calculate y when x = ' + x2 + '.' : 'Calculate x when y = ' + f(y2) + '.') + '</p>',
        hint: 'First find k = y / x. Then use y = kx.', steps: 'k = ' + f(y1) + ' / ' + x1 + ' = ' + f(k) + '. ' + (askY ? 'y = ' + f(k) + ' · ' + x2 + ' = ' + f(y2) : 'x = ' + f(y2) + ' / ' + f(k) + ' = ' + x2) };
    },
    function whichDirect(l) {
      const k = ri(2, 7), c = ri(2, 8);
      const right = 'y = ' + k + 'x';
      const wrong = ['y = ' + k + 'x + ' + c, 'y = ' + k + 'x²', 'y = ' + (k * c) + ' / x'];
      const order = shuffle([right].concat(wrong));
      return { type: 'choice', opts: order, ans: order.indexOf(right), correct: order.indexOf(right),
        html: '<p>Which formula describes a directly proportional relationship?</p>',
        hint: 'A directly proportional relationship has the form y = kx: a straight line through the origin.',
        steps: 'y = kx has no extra number added and no x² or division by x. So ' + right + '.' };
    },
    function context(l) {
      const c = pick(PC), k = l === 0 ? ri(2, 9) : pick([1.5, 2.5, 4, 6, 12, 0.5, 7.5]), t = ri(3, 12), askY = l === 0 || Math.random() < .5;
      const y = rnd2(k * t);
      return { type: 'num', ans: askY ? y : t, correct: String(askY ? y : t),
        html: '<p>' + c.t(k) + ' The formula is <b>' + c.yv + ' = ' + k + c.v + '</b>.</p><p>' + (askY ? 'Calculate ' + c.yv + ' when ' + c.v + ' = ' + t + '.' : 'Calculate ' + c.v + ' when ' + c.yv + ' = ' + f(y) + '.') + '</p>',
        hint: askY ? 'Substitute ' + c.v + ' = ' + t + '.' : 'Solve ' + k + c.v + ' = ' + f(y) + ' by dividing by ' + k + '.',
        steps: askY ? c.yv + ' = ' + k + ' · ' + t + ' = ' + f(y) : c.v + ' = ' + f(y) + ' / ' + k + ' = ' + t };
    },
    function graphK(l) {
      const k = l === 0 ? ri(1, 3) : nz(-3, 3);
      return { type: 'num', ans: k, correct: String(k),
        html: '<p>This is the graph of a directly proportional relationship <b>y = kx</b>. Find <b>k</b>.</p>' + grid({ xmin: -5, xmax: 5, ymin: -8, ymax: 8, curves: [{ f: x => k * x }], pts: [{ x: 1, y: k, color: '#16803c' }, { x: 2, y: 2 * k, color: '#16803c' }] }),
        hint: 'Look at the value of y when x = 1. That is k.', steps: 'At x = 1 the graph has y = ' + f(k) + ', so k = ' + f(k) + '.' };
    },
    function factor(l) {
      const n = ri(2, 6), grow = Math.random() < .5;
      const opts = grow ? ['y becomes ' + n + ' times as large', 'y increases by ' + n, 'y becomes ' + n + ' times as small', 'y stays the same'] : ['y becomes ' + n + ' times as small', 'y decreases by ' + n, 'y becomes ' + n + ' times as large', 'y stays the same'];
      const order = shuffle(opts), right = opts[0];
      return { type: 'choice', opts: order, ans: order.indexOf(right), correct: order.indexOf(right),
        html: '<p><b>y</b> is directly proportional to <b>x</b>. ' + (grow ? 'x becomes ' + n + ' times as large.' : 'x becomes ' + n + ' times as small.') + ' What happens to y?</p>',
        hint: 'In a directly proportional relationship y and x change by the same factor.', steps: 'y = kx, so y changes by the same factor as x: ' + right + '.' };
    }
  ];

  /* 3.3 Quadratic relationships and parabolas */
  G['3.3'] = [
    function abc(l) {
      const a = l === 0 ? ri(1, 4) : nz(-4, 4), b = l === 0 ? 0 : (Math.random() < .3 ? 0 : nz(-6, 6)), c = nz(-8, 8);
      const txt = l === 2 ? quadShuf(a, b, c) : quad(a, b, c);
      return { type: 'multi', fields: ['a', 'b', 'c'], ans: [a, b, c], correct: [String(a), String(b), String(c)],
        html: '<p>Write the formula <b>y = ' + txt + '</b> as <b>y = ax² + bx + c</b>. Give a, b and c.</p>',
        hint: 'a is with x², b is with x, c is the number on its own. If a part is missing, its number is 0.',
        steps: 'a = ' + f(a) + ', b = ' + f(b) + ', c = ' + f(c) + '.' };
    },
    function opening(l) {
      const a = nz(-4, 4), b = ri(-5, 5), c = ri(-6, 6), txt = l < 2 ? quad(a, b, c) : quadShuf(a, b, c);
      return { type: 'choice', opts: ['The parabola opens upwards', 'The parabola opens downwards'], ans: a > 0 ? 0 : 1, correct: a > 0 ? 0 : 1,
        html: '<p>Does the graph of <b>y = ' + txt + '</b> open upwards or downwards?</p>',
        hint: 'Look at the number a in front of x². Positive: a smile. Negative: a frown.', steps: 'a = ' + f(a) + (a > 0 ? ' > 0: opens upwards.' : ' < 0: opens downwards.') };
    },
    function vertexPoint(l) {
      let a, xv;
      if (l === 0) { a = 1; xv = ri(-4, 4); } else if (l === 1) { a = nz(-3, 3); xv = ri(-4, 4); } else { a = pick([-4, -2, -1, 2, 3, 4]); xv = ri(-5, 5); }
      const b = -2 * a * xv, c = ri(-8, 8), v = vtx(a, b, c);
      return { type: 'point', ans: [xv, v[1]], correct: pt(xv, v[1]),
        html: '<p>Find the coordinates of the vertex of the parabola <b>y = ' + quad(a, b, c) + '</b>.</p>',
        hint: 'First x = −b / (2a). Then substitute this x in the formula to find y.',
        steps: 'x = −' + par(b) + ' / (2 · ' + par(a) + ') = ' + f(xv) + '<br>y = ' + quad(a, b, c).replace(/x²/g, par(xv) + '²').replace(/(\d|\)) ?x/g, '$1 · ' + par(xv)) + ' = ' + f(v[1]) };
    },
    function symmetryLine(l) {
      const a = l === 0 ? 1 : nz(-3, 3), b = l === 2 ? ri(-9, 9) : 2 * a * ri(-4, 4), c = ri(-6, 6);
      if (b === 0 && l > 0 && Math.random() < .5) return G['3.3'][3](l);
      const x = -b / (2 * a);
      if (!half(x)) return G['3.3'][3](l);
      return { type: 'num', ans: x, correct: String(x),
        html: '<p>The line of symmetry of the parabola <b>y = ' + quad(a, b, c) + '</b> has the equation <b>x = p</b>. Find <b>p</b>.</p>',
        hint: 'The line of symmetry goes through the vertex: p = −b / (2a).', steps: 'p = −' + par(b) + ' / (2 · ' + par(a) + ') = ' + f(x) };
    },
    function yAxisCross(l) {
      const a = nz(-3, 3), b = ri(-6, 6), c = nz(-9, 9);
      return { type: 'point', ans: [0, c], correct: pt(0, c),
        html: '<p>Where does the parabola <b>y = ' + quadShuf(a, b, c) + '</b> intersect the y-axis? Give the coordinates.</p>',
        hint: 'On the y-axis x = 0. What is y then?', steps: 'x = 0 gives y = c = ' + f(c) + '. The point is ' + pt(0, c) + '.' };
    },
    function valueAt(l) {
      const a = nz(-3, 3), b = l === 0 ? 0 : ri(-5, 5), c = ri(-6, 8), x = l === 0 ? ri(1, 4) : nz(-4, 4), y = a * x * x + b * x + c;
      return { type: 'num', ans: y, correct: String(y),
        html: '<p>Given: <b>y = ' + quad(a, b, c) + '</b>. Calculate <b>y</b> when <b>x = ' + f(x) + '</b>.</p>',
        hint: 'Substitute x = ' + f(x) + '. Do the power first, then multiply, then add.',
        steps: 'y = ' + f(a) + ' · ' + par(x) + '² ' + (b < 0 ? '− ' : '+ ') + Math.abs(b) + ' · ' + par(x) + ' ' + (c < 0 ? '− ' : '+ ') + Math.abs(c) + ' = ' + f(y) };
    },
    function xIntercepts(l) {
      const a = l === 0 ? 1 : pick([1, 1, -1, 2, -2]), p = ri(1, 6), c = -a * p * p;
      return { type: 'multi', fields: ['smaller x', 'larger x'], ans: [-p, p], correct: [String(-p), String(p)],
        html: '<p>The parabola <b>y = ' + quad(a, 0, c) + '</b> intersects the x-axis in two points. Give the x-coordinates (smaller first).</p>',
        hint: 'Put y = 0 and solve: ' + quad(a, 0, c) + ' = 0. The parabola is symmetric, so there are two answers.',
        steps: f(a) + 'x² = ' + f(-c) + ' gives x² = ' + p * p + ', so x = ' + f(-p) + ' or x = ' + p + '.' };
    },
    function maxHeight(l) {
      const xv = pick([50, 100, 150, 200]), bb = xv / 25, h = 2 * xv * xv / 100;
      if (l >= 2) {   // spicy: another number in front of x², and a start height
        const a = pick([0.01, 0.04, 0.05, 0.1]), x2 = pick([10, 20, 30, 40]), b2 = Math.round(2 * a * x2 * 100) / 100, c = pick([1, 1.5, 2, 2.5]), h2 = Math.round((-a * x2 * x2 + b2 * x2 + c) * 100) / 100;
        return { type: 'num', ans: h2, correct: String(h2),
          html: '<p>A ball is thrown. Its height is <b>h = −' + a + 'x² + ' + b2 + 'x + ' + c + '</b> (h and x in metres, x is the horizontal distance). What is the maximum height of the ball?</p>',
          hint: 'The maximum is at the vertex. First x = −b / (2a), then calculate h for that x.',
          steps: 'x = −' + b2 + ' / (2 · −' + a + ') = ' + x2 + '<br>h = −' + a + ' · ' + x2 + '² + ' + b2 + ' · ' + x2 + ' + ' + c + ' = ' + h2 + ' m' };
      }
      return { type: 'num', ans: h, correct: String(h),
        html: '<p>A ball is kicked. Its height is <b>h = −0.02x² + ' + bb + 'x</b> (h and x in metres, x is the horizontal distance). What is the maximum height of the ball?</p>',
        hint: 'The maximum is at the vertex. First x = −b / (2a), then calculate h for that x.',
        steps: 'x = −' + bb + ' / (2 · −0.02) = ' + xv + '<br>h = −0.02 · ' + xv + '² + ' + bb + ' · ' + xv + ' = ' + h + ' m' };
    }
  ];

  /* 3.4 Vertex form and inversely proportional relationships */
  G['3.4'] = [
    function vertexForm(l) {
      const a = l === 0 ? 1 : pick([1, -1, 2, -2, 3]), p = nz(-5, 5), q = ri(-6, 6);
      const inner = p > 0 ? '(x − ' + p + ')' : '(x + ' + Math.abs(p) + ')';
      const txt = (a === 1 ? '' : a === -1 ? '−' : String(a)) + inner + '²' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '');
      return { type: 'point', ans: [p, q], correct: pt(p, q),
        html: '<p>The formula of a parabola is <b>y = ' + txt + '</b>. Which are the coordinates of the vertex?</p>',
        hint: 'The formula has the form y = a(x − p)² + q. The vertex is (p, q). Be careful with the sign of p.',
        steps: (p > 0 ? 'x − ' + p : 'x + ' + Math.abs(p) + ' = x − (' + f(p) + ')') + ', so p = ' + f(p) + ' and q = ' + f(q) + '. Vertex: ' + pt(p, q) + '.' };
    },
    function findA(l) {
      const a = nz(-3, 3), p = ri(-3, 3), q = ri(-5, 5), x1 = p + pick([-2, -1, 1, 2, 3]), y1 = a * (x1 - p) * (x1 - p) + q;
      return { type: 'num', ans: a, correct: String(a),
        html: '<p>A parabola has its vertex at <b>' + pt(p, q) + '</b> and passes through <b>' + pt(x1, y1) + '</b>. Its formula is <b>y = a(x − p)² + q</b>. Find <b>a</b>.</p>',
        hint: 'Fill in p and q from the vertex, and substitute the other point to find a.',
        steps: f(y1) + ' = a(' + f(x1) + ' − ' + par(p) + ')² + ' + par(q) + '<br>' + f(y1 - q) + ' = ' + (x1 - p) * (x1 - p) + 'a, so a = ' + f(a) };
    },
    function isInverse(l) {
      const inv = Math.random() < .5, k = pick([12, 24, 36, 60]), xs = l >= 2 ? [0.5, 2, 2.5, 4] : pick([[1, 2, 3, 4], [2, 3, 4, 6], [1, 2, 4, 6]].filter(s => s.every(v => k % v === 0)));
      const ys = xs.map((x, i) => inv ? k / x : l >= 2 ? (i === 3 ? k / x + 1 : k / x) : k / x + 2);   // spicy: decimals, and only one pair breaks the rule
      return { type: 'choice', opts: ['Yes, inversely proportional', 'No, not inversely proportional'], ans: inv ? 0 : 1, correct: inv ? 0 : 1,
        html: '<p>Is this an inversely proportional relationship?</p>' + tbl(xs, ys),
        hint: 'Calculate x · y for every pair. If the product is always the same, it is inversely proportional.',
        steps: 'x · y = ' + xs.map((x, i) => x * ys[i]).join(', ') + (inv ? ': always the same, so yes.' : ': not the same, so no.') };
    },
    function findKInv(l) {
      const k = pick([12, 20, 24, 30, 36, 40, 60]), xs = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20].filter(v => k % v === 0).slice(0, 4);
      if (l >= 2) {   // spicy: find k, then a missing value that is not a whole number
        const xm = pick([8, 16, 25, 32, 50].filter(v => k % v !== 0)), ym = Math.round(k / xm * 100) / 100;
        return { type: 'num', ans: ym, correct: String(ym), tol: .0051,
          html: '<p>The table shows an inversely proportional relationship <b>y = k / x</b>. Calculate the missing number. <small>(Round to 2 decimals if needed.)</small></p>' + tbl(xs.concat([xm]), xs.map(x => k / x).concat([null])),
          hint: 'First find k = x · y. Then y = k / x.', steps: 'k = ' + xs[1] + ' · ' + (k / xs[1]) + ' = ' + k + '<br>y = ' + k + ' / ' + xm + (Math.abs(k / xm - ym) < 1e-9 ? ' = ' : ' ≈ ') + ym };
      }
      return { type: 'num', ans: k, correct: String(k),
        html: '<p>The table shows an inversely proportional relationship <b>y = k / x</b>. Find <b>k</b>.</p>' + tbl(xs, xs.map(x => k / x)),
        hint: 'k = x · y. Multiply x and y for one pair.', steps: 'k = ' + xs[1] + ' · ' + (k / xs[1]) + ' = ' + k };
    },
    function inverseValue(l) {
      const k = pick([12, 24, 36, 48, 60]), x1 = pick([2, 3, 4, 6]), x2 = pick([1, 2, 3, 4, 6, 8, 12].filter(v => v !== x1 && k % v === 0)), askY = Math.random() < .6, y1 = k / x1;
      if (l >= 2) {   // spicy: decimals
        const xa = pick([0.4, 1.5, 2.5, 0.8]), ya = 10 * ri(2, 9), kk = Math.round(xa * ya * 100) / 100, xb = pick([3, 6, 7, 9, 16].filter(v => v !== xa)), yb = Math.round(kk / xb * 100) / 100;
        return { type: 'num', ans: yb, correct: String(yb), tol: .0051,
          html: '<p><b>y</b> is inversely proportional to <b>x</b>. When x = ' + xa + ', y = ' + ya + '. Calculate y when x = ' + xb + '. <small>(Round to 2 decimals if needed.)</small></p>',
          hint: 'First find k = x · y. Then use y = k / x.', steps: 'k = ' + xa + ' · ' + ya + ' = ' + kk + '. y = ' + kk + ' / ' + xb + (Math.abs(kk / xb - yb) < 1e-9 ? ' = ' : ' ≈ ') + yb };
      }
      return { type: 'num', ans: askY ? k / x2 : x2, correct: String(askY ? k / x2 : x2),
        html: '<p><b>y</b> is inversely proportional to <b>x</b>. When x = ' + x1 + ', y = ' + y1 + '. ' + (askY ? 'Calculate y when x = ' + x2 + '.' : 'Calculate x when y = ' + (k / x2) + '.') + '</p>',
        hint: 'First find k = x · y. Then use y = k / x.', steps: 'k = ' + x1 + ' · ' + y1 + ' = ' + k + '. ' + (askY ? 'y = ' + k + ' / ' + x2 + ' = ' + (k / x2) : 'x = ' + k + ' / ' + (k / x2) + ' = ' + x2) };
    },
    function inverseContext(l) {
      const km = pick([120, 180, 240, 360]), v = pick([40, 60, 80, 90, 120].filter(s => km % s === 0)), t = km / v;
      if (l >= 2) {   // spicy: the time is given in hours and minutes, the speed is asked
        const d2 = pick([90, 150, 180, 210, 270, 300]), t2 = pick([1.25, 1.5, 2.25, 2.5, 3.75, 2.4]), v2 = Math.round(d2 / t2 * 10) / 10, hh = Math.floor(t2), mm = Math.round((t2 - hh) * 60);
        return { type: 'num', ans: v2, correct: String(v2), tol: .051,
          html: '<p>A car drives ' + d2 + ' km. The travel time is <b>t = ' + d2 + ' / v</b>, where v is the speed in km/h and t the time in hours. The trip takes <b>' + hh + ' hours and ' + mm + ' minutes</b>. Calculate the speed. <small>(Round to 1 decimal if needed.)</small></p>',
          hint: 'First write the time in hours (' + mm + ' minutes = ' + mm + '/60 hour). Then v = ' + d2 + ' / t.', steps: hh + ' h ' + mm + ' min = ' + t2 + ' hours<br>' + t2 + ' = ' + d2 + ' / v, so v = ' + d2 + ' / ' + t2 + (Math.abs(d2 / t2 - v2) < 1e-9 ? ' = ' : ' ≈ ') + v2 + ' km/h' };
      }
      return { type: 'num', ans: t, correct: String(t),
        html: '<p>A car drives ' + km + ' km. The travel time is <b>t = ' + km + ' / v</b>, where v is the speed in km/h and t the time in hours. Calculate the time when the speed is <b>' + v + ' km/h</b>.</p>',
        hint: 'Substitute v in the formula.', steps: 't = ' + km + ' / ' + v + ' = ' + t + ' hours' };
    },
    function factorInv(l) {
      const n = ri(2, 6), grow = Math.random() < .5;
      const right = 'y becomes ' + n + ' times as ' + (grow ? 'small' : 'large');
      const opts = [right, 'y becomes ' + n + ' times as ' + (grow ? 'large' : 'small'), grow ? 'y decreases by ' + n : 'y increases by ' + n, 'y stays the same'];
      const order = shuffle(opts);
      return { type: 'choice', opts: order, ans: order.indexOf(right), correct: order.indexOf(right),
        html: '<p><b>y</b> is inversely proportional to <b>x</b>. ' + (grow ? 'x becomes ' + n + ' times as large.' : 'x becomes ' + n + ' times as small.') + ' What happens to y?</p>',
        hint: 'In an inversely proportional relationship y changes by the opposite factor.', steps: 'x · y stays the same, so ' + right + '.' };
    },
    function whichType(l) {
      const types = ['Linear, not directly proportional', 'Directly proportional', 'Quadratic', 'Inversely proportional'];
      const i = ri(0, 3), a = ri(2, 6), b = ri(1, 7);
      const txt = [poly([[a, 'x'], [b, '']]), a + 'x', quad(l === 0 ? a : pick([a, -a]), l === 0 ? 0 : ri(-4, 4), ri(-5, 5)), (a * b) + ' / x'][i];
      return { type: 'choice', opts: types, ans: i, correct: i,
        html: '<p>Which type of relationship is <b>y = ' + txt + '</b>?</p>',
        hint: 'Look at the form: y = mx + b, y = kx, y = ax² + bx + c or y = k / x.',
        steps: 'The formula y = ' + txt + ' is ' + types[i].toLowerCase() + '.' };
    }
  ];

  const XG = {};   // extra spicy generators per section
  /* ---------- Extra spicy (level 4): challenge questions ---------- */
  XG['3.1'] = [
    function formulaFromPoints() {
      const a = nz(-4, 4), b = ri(-6, 6), x1 = ri(-4, 0), x2 = x1 + ri(1, 4);
      const P = [x1, a * x1 + b], Q = [x2, a * x2 + b];
      return { type: 'multi', fields: ['m', 'b'], ans: [a, b], correct: [String(a), String(b)],
        html: '<p>A straight line goes through <b>' + pt(P[0], P[1]) + '</b> and <b>' + pt(Q[0], Q[1]) + '</b>. Find the formula <b>y = mx + b</b>: give m and b.</p>',
        hint: 'm = (change in y) : (change in x). Then use one of the points to find b.',
        steps: 'm = (' + f(Q[1]) + ' − ' + par(P[1]) + ') : (' + f(Q[0]) + ' − ' + par(P[0]) + ') = ' + f(a) + '. b = ' + f(P[1]) + ' − ' + par(a) + ' · ' + par(P[0]) + ' = ' + f(b) + '.' };
    },
    function bFromGradientPoint() {
      const a = nz(-5, 5), b = ri(-8, 8), x = nz(-5, 5), y = a * x + b;
      return { type: 'num', ans: b, correct: String(b),
        html: '<p>A line has gradient <b>m = ' + f(a) + '</b> and goes through the point <b>' + pt(x, y) + '</b>. What is the <b>y-intercept b</b> of the line?</p>',
        hint: 'Write y = ' + f(a) + 'x + b and put in the coordinates of the point. Then solve for b.',
        steps: f(y) + ' = ' + par(a) + ' · ' + par(x) + ' + b = ' + f(a * x) + ' + b, so b = ' + f(y) + ' − ' + par(a * x) + ' = ' + f(b) + '.' };
    }
  ];
  XG['3.2'] = [
    function recipe() {
      const per = pick([75, 40, 25, 30, 50]), n1 = ri(3, 6), n2 = n1 + ri(2, 5), g = per * n1, ask = Math.random() < .5;
      return ask
        ? { type: 'num', ans: Math.floor(1500 / per), correct: String(Math.floor(1500 / per)),
            html: '<p>The amount of flour is directly proportional to the number of people. For <b>' + n1 + ' people</b> you need <b>' + g + ' g</b>. You have a bag of <b>1.5 kg</b> flour. For how many people can you bake <b>at most</b>?</p>',
            hint: 'First find the amount for 1 person (that is the constant k). Write 1.5 kg in grams. Round down: you cannot bake for part of a person.', steps: 'k = ' + g + ' : ' + n1 + ' = ' + per + ' g per person. 1.5 kg = 1500 g. 1500 : ' + per + ' = ' + Math.round(1500 / per * 100) / 100 + ', so at most ' + Math.floor(1500 / per) + ' people.' }
        : { type: 'num', ans: n2, correct: String(n2),
            html: '<p>The amount of flour is directly proportional to the number of people. For <b>' + n1 + ' people</b> you need <b>' + g + ' g</b>. For how many people is <b>' + per * n2 + ' g</b> enough?</p>',
            hint: 'First find the amount for 1 person (that is the constant k). Then divide.', steps: 'k = ' + g + ' : ' + n1 + ' = ' + per + ' g per person. ' + per * n2 + ' : ' + per + ' = ' + n2 + ' people.' };
    },
    function halfK() {
      const k = pick([1.5, 2.5, 3.5, 4.5]), x1 = pick([2, 4, 6]), x2 = pick([8, 10, 12, 14]), y1 = k * x1;
      const s = v => String(v).replace('.', ',');
      return { type: 'num', ans: k * x2, correct: String(k * x2),
        html: '<p><b>y</b> is directly proportional to <b>x</b>. When <b>x = ' + x1 + '</b>, <b>y = ' + s(y1) + '</b>. Calculate <b>y</b> when <b>x = ' + x2 + '</b>.</p>',
        hint: 'Find k first: k = y : x. Then y = kx. Your answer may be a decimal.', steps: 'k = ' + s(y1) + ' : ' + x1 + ' = ' + s(k) + '. y = ' + s(k) + ' · ' + x2 + ' = ' + s(k * x2) + '.' };
    }
  ];
  XG['3.3'] = [
    function otherRoot() {
      let p, q; do { p = ri(-6, 6); q = ri(-6, 6); } while (p === q);
      const b = -(p + q), c = p * q;
      return { type: 'num', ans: q, correct: String(q),
        html: '<p>The parabola <b>y = ' + quad(1, b, c) + '</b> crosses the x-axis at <b>x = ' + f(p) + '</b>. Where is the <b>other</b> point where it crosses the x-axis? Give the x-coordinate.</p>',
        hint: 'A parabola is symmetric. The axis of symmetry is at x = −b / (2a). The two crossing points are equally far from the axis, on opposite sides.',
        steps: 'Axis: x = −' + par(b) + ' / 2 = ' + f(-b / 2) + '. ' + f(p) + ' is ' + Math.abs(p + b / 2) + ' from the axis, so the other point is at ' + f(-b / 2) + (q > -b / 2 ? ' + ' : ' − ') + Math.abs(q + b / 2) + ' = ' + f(q) + '.' };
    },
    function axisFromPoints() {
      const s = ri(-4, 4), d = ri(1, 5), h = ri(-6, 6), a = s - d, b = s + d;
      return { type: 'num', ans: s, correct: String(s),
        html: '<p>The points <b>' + pt(a, h) + '</b> and <b>' + pt(b, h) + '</b> both lie on a parabola. What is the <b>x-coordinate of the axis of symmetry</b>?</p>',
        hint: 'The two points have the same height, so they are mirror images in the axis. The axis is exactly halfway between their x-values.',
        steps: 'x = (' + f(a) + ' + ' + par(b) + ') : 2 = ' + f(s) + '.' };
    }
  ];
  XG['3.4'] = [
    function yIntercept() {
      const a = nz(-3, 3), p = nz(-4, 4), q = ri(-6, 6), y0 = a * p * p + q;
      const inner = p > 0 ? '(x − ' + p + ')' : '(x + ' + Math.abs(p) + ')';
      const txt = (a === 1 ? '' : a === -1 ? '−' : String(a)) + inner + '²' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '');
      return { type: 'num', ans: y0, correct: String(y0),
        html: '<p>A parabola has the formula <b>y = ' + txt + '</b>. At which <b>y</b> does it cross the <b>y-axis</b>?</p>',
        hint: 'On the y-axis x = 0. Substitute x = 0 and calculate carefully: first the bracket, then the square, then multiply.',
        steps: 'x = 0: y = ' + (a === 1 ? '' : a === -1 ? '−' : a + ' · ') + '(0 ' + (p > 0 ? '− ' + p : '+ ' + Math.abs(p)) + ')² ' + (q < 0 ? '− ' : '+ ') + Math.abs(q) + ' = ' + (a === 1 ? '' : a === -1 ? '−' : a + ' · ') + p * p + ' ' + (q < 0 ? '− ' : '+ ') + Math.abs(q) + ' = ' + f(y0) + '.' };
    },
    function inverseSolveX() {
      const k = pick([12, 18, 20, 24, 30, 36, 48]), divs = []; for (let d = 1; d <= k; d++) if (k % d === 0 && d >= 2 && d <= 12) divs.push(d);
      const x1 = pick(divs), y1 = k / x1, y2 = pick(divs.filter(d => d !== y1)) || 2, x2 = k / y2;
      return { type: 'num', ans: x2, correct: String(x2),
        html: '<p><b>y</b> is inversely proportional to <b>x</b> (y = k / x). When <b>x = ' + x1 + '</b>, <b>y = ' + y1 + '</b>. For which <b>x</b> is <b>y = ' + y2 + '</b>?</p>',
        hint: 'Find k first: k = x · y. Then solve k / x = ' + y2 + ', or: x = k : y.',
        steps: 'k = ' + x1 + ' · ' + y1 + ' = ' + k + '. x = ' + k + ' : ' + y2 + ' = ' + x2 + '.' };
    }
  ];

  const SECTIONS = [
    { id: '3.1', title: '3.1 Linear relationships', sub: 'Gradient, y-intercept, y = mx + b' },
    { id: '3.2', title: '3.2 Directly proportional', sub: 'y = kx, tables and graphs' },
    { id: '3.3', title: '3.3 Quadratic relationships', sub: 'Parabolas, vertex, axes' },
    { id: '3.4', title: '3.4 Vertex form and inverse', sub: 'y = a(x \u2212 p)\u00b2 + q and y = k / x' }
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
    else if (q.type === 'click' && q.targets && !q.ans) { q.ans = q.targets; q.ansText = q.targets.map(p => '(' + String(p[0]).replace('-', '−') + ', ' + String(p[1]).replace('-', '−') + ')').join(' and '); }
    return q;
  };
  const __wrap = L => { for (const k in L) L[k] = L[k].map(fn => { const g = l => __conv(fn(l), fn.name); Object.defineProperty(g, 'name', { value: fn.name }); return g; }); };
  __wrap(G); __wrap(XG);
  const GOALS = [["3.1", "I can find the gradient and y-intercept of a line", ["gradientIntercept", "direction", "gradientTwoPoints", "formulaFromGraph", "tableLinear", "formulaFromPoints", "bFromGradientPoint"], "y = mx + b: m is the gradient, b the y-intercept."], ["3.1", "I can work with parallel lines and intercepts", ["parallel", "xIntercept", "missingCoord"]], ["3.2", "I can recognise and use direct proportion", ["isDirect", "findK", "valueFromPair", "whichDirect", "context", "graphK", "factor", "recipe", "halfK"]], ["3.3", "I can work with quadratic formulas and parabolas", ["abc", "opening", "vertexPoint", "symmetryLine", "yAxisCross", "valueAt", "xIntercepts", "maxHeight", "otherRoot", "axisFromPoints"]], ["3.4", "I can use the vertex form of a parabola", ["vertexForm", "findA", "yIntercept"]], ["3.4", "I can recognise and use inverse proportion", ["isInverse", "findKInv", "inverseValue", "inverseContext", "factorInv", "whichType", "inverseSolveX"]]];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "2HT": [
      {"id": "D1", "title": "Lesson · 3.1 A Linear relationships", "sub": "Wed 11 Nov · ex 1, 2, 5, 6, 7, 8", "date": "2026-11-11", "gens": [["3.1", "gradientIntercept"], ["3.1", "direction"], ["3.1", "gradientTwoPoints"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"]]},
      {"id": "D2", "title": "Lesson · 3.1 B Linear relationships", "sub": "Thu 12 Nov · ex 9, 10, 11, 12, 13", "date": "2026-11-12", "gens": [["3.1", "direction"], ["3.1", "gradientTwoPoints"], ["3.1", "formulaFromGraph"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"]]},
      {"id": "D3", "title": "Lesson · 3.1 C Linear relationships", "sub": "Fri 13 Nov · ex 14, 15, 16, 17", "date": "2026-11-13", "gens": [["3.1", "formulaFromGraph"], ["3.1", "tableLinear"], ["3.1", "parallel"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"]]},
      {"id": "D4", "title": "Lesson · 3.1 Linear relationships + 3.2 Directly proportional", "sub": "Wed 18 Nov · ex 22, 23, 24, 25, 26", "date": "2026-11-18", "gens": [["3.1", "parallel"], ["3.1", "xIntercept"], ["3.1", "missingCoord"], ["3.2", "isDirect"], ["3.2", "findK"], ["3.2", "valueFromPair"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"], ["3.2", "recipe"], ["3.2", "halfK"]]},
      {"id": "D5", "title": "Lesson · 3.2 A Directly proportional", "sub": "Thu 19 Nov · ex 27, 28, 30, 31, 32", "date": "2026-11-19", "gens": [["3.2", "findK"], ["3.2", "valueFromPair"], ["3.2", "whichDirect"]], "xg": [["3.2", "recipe"], ["3.2", "halfK"]]},
      {"id": "D6", "title": "Lesson · 3.2 B Directly proportional", "sub": "Fri 20 Nov · ex 33, 34, 35, 36, 37", "date": "2026-11-20", "gens": [["3.2", "whichDirect"], ["3.2", "context"], ["3.2", "graphK"]], "xg": [["3.2", "recipe"], ["3.2", "halfK"]]},
      {"id": "D7", "title": "Lesson · 3.3 A Quadratic relationships", "sub": "Wed 25 Nov · ex 42, 43, 44, 45", "date": "2026-11-25", "gens": [["3.3", "abc"], ["3.3", "opening"], ["3.3", "vertexPoint"]], "xg": [["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D8", "title": "Lesson · 3.3 B Quadratic relationships", "sub": "Thu 26 Nov · ex 46, 47, 48, 49", "date": "2026-11-26", "gens": [["3.3", "opening"], ["3.3", "vertexPoint"], ["3.3", "symmetryLine"]], "xg": [["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D9", "title": "Lesson · 3.3 C Quadratic relationships", "sub": "Fri 27 Nov · ex 50, 51, 52, 53", "date": "2026-11-27", "gens": [["3.3", "symmetryLine"], ["3.3", "yAxisCross"], ["3.3", "valueAt"]], "xg": [["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D10", "title": "Lesson · 3.3 D Quadratic relationships", "sub": "Wed 2 Dec · ex 54, 55, 56", "date": "2026-12-02", "gens": [["3.3", "yAxisCross"], ["3.3", "valueAt"], ["3.3", "xIntercepts"]], "xg": [["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D11", "title": "Lesson · 3.4 A Vertex form and inverse", "sub": "Thu 3 Dec · ex 61, 62, 63, 64, 65", "date": "2026-12-03", "gens": [["3.4", "vertexForm"], ["3.4", "findA"], ["3.4", "isInverse"]], "xg": [["3.4", "yIntercept"], ["3.4", "inverseSolveX"]]},
      {"id": "D12", "title": "Lesson · 3.4 B Vertex form and inverse", "sub": "Fri 4 Dec · ex 66, 67, 68, 69, 70", "date": "2026-12-04", "gens": [["3.4", "isInverse"], ["3.4", "findKInv"], ["3.4", "inverseValue"]], "xg": [["3.4", "yIntercept"], ["3.4", "inverseSolveX"]]},
      {"id": "D13", "title": "Lesson · 3.4 C Vertex form and inverse", "sub": "Wed 9 Dec · ex 71, 72, 73, 74", "date": "2026-12-09", "gens": [["3.4", "inverseValue"], ["3.4", "inverseContext"], ["3.4", "factorInv"]], "xg": [["3.4", "yIntercept"], ["3.4", "inverseSolveX"]]},
      {"id": "D14", "title": "Test prep · chapter 3", "sub": "Thu 10 Dec · ex 93, 95, 97, 100, 104", "date": "2026-12-10", "gens": [["3.1", "gradientIntercept"], ["3.1", "direction"], ["3.1", "gradientTwoPoints"], ["3.1", "formulaFromGraph"], ["3.1", "tableLinear"], ["3.1", "parallel"], ["3.1", "xIntercept"], ["3.1", "missingCoord"], ["3.2", "isDirect"], ["3.2", "findK"], ["3.2", "valueFromPair"], ["3.2", "whichDirect"], ["3.2", "context"], ["3.2", "graphK"], ["3.2", "factor"], ["3.3", "abc"], ["3.3", "opening"], ["3.3", "vertexPoint"], ["3.3", "symmetryLine"], ["3.3", "yAxisCross"], ["3.3", "valueAt"], ["3.3", "xIntercepts"], ["3.3", "maxHeight"], ["3.4", "vertexForm"], ["3.4", "findA"], ["3.4", "isInverse"], ["3.4", "findKInv"], ["3.4", "inverseValue"], ["3.4", "inverseContext"], ["3.4", "factorInv"], ["3.4", "whichType"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"], ["3.2", "recipe"], ["3.2", "halfK"], ["3.3", "otherRoot"], ["3.3", "axisFromPoints"], ["3.4", "yIntercept"], ["3.4", "inverseSolveX"]], "rev": true}
    ],
    "2VT": [
      {"id": "D1", "title": "Lesson · 3.1 A Linear relationships", "sub": "Wed 11 Nov · ex 1, 2, 7, 8, 9, 10, 11", "date": "2026-11-11", "gens": [["3.1", "gradientIntercept"], ["3.1", "direction"], ["3.1", "gradientTwoPoints"], ["3.1", "formulaFromGraph"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"]]},
      {"id": "D2", "title": "Lesson · 3.1 B Linear relationships", "sub": "Fri 13 Nov · ex 12, 13, 14, 15, 16", "date": "2026-11-13", "gens": [["3.1", "formulaFromGraph"], ["3.1", "tableLinear"], ["3.1", "parallel"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"]]},
      {"id": "D3", "title": "Lesson · 3.1 C Linear relationships", "sub": "Tue 17 Nov · ex 17, 18, 19, 20", "date": "2026-11-17", "gens": [["3.1", "parallel"], ["3.1", "xIntercept"], ["3.1", "missingCoord"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"]]},
      {"id": "D4", "title": "Lesson · 3.2 A Directly proportional", "sub": "Wed 18 Nov · ex 23, 24, 26, 27, 28", "date": "2026-11-18", "gens": [["3.2", "isDirect"], ["3.2", "findK"], ["3.2", "valueFromPair"]], "xg": [["3.2", "recipe"], ["3.2", "halfK"]]},
      {"id": "D5", "title": "Lesson · 3.2 B Directly proportional", "sub": "Fri 20 Nov · ex 32, 33, 34, 35, 36, 37", "date": "2026-11-20", "gens": [["3.2", "whichDirect"], ["3.2", "context"], ["3.2", "graphK"]], "xg": [["3.2", "recipe"], ["3.2", "halfK"]]},
      {"id": "D6", "title": "Lesson · 3.2 Directly proportional + 3.3 Quadratic relationships", "sub": "Tue 24 Nov · ex 38, 39, 43, 44, 46", "date": "2026-11-24", "gens": [["3.2", "whichDirect"], ["3.2", "context"], ["3.2", "graphK"], ["3.3", "abc"], ["3.3", "opening"], ["3.3", "vertexPoint"]], "xg": [["3.2", "recipe"], ["3.2", "halfK"], ["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D7", "title": "Lesson · 3.3 A Quadratic relationships", "sub": "Wed 25 Nov · ex 47, 48, 49, 50, 51", "date": "2026-11-25", "gens": [["3.3", "vertexPoint"], ["3.3", "symmetryLine"], ["3.3", "yAxisCross"]], "xg": [["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D8", "title": "Lesson · 3.3 B Quadratic relationships", "sub": "Fri 27 Nov · ex 52, 53, 54, 55, 56", "date": "2026-11-27", "gens": [["3.3", "yAxisCross"], ["3.3", "valueAt"], ["3.3", "xIntercepts"]], "xg": [["3.3", "otherRoot"], ["3.3", "axisFromPoints"]]},
      {"id": "D9", "title": "Lesson · 3.4 A Vertex form and inverse", "sub": "Wed 2 Dec · ex 61, 62, 63, 64, 65", "date": "2026-12-02", "gens": [["3.4", "vertexForm"], ["3.4", "findA"], ["3.4", "isInverse"]], "xg": [["3.4", "yIntercept"], ["3.4", "inverseSolveX"]]},
      {"id": "D10", "title": "Lesson · 3.4 B Vertex form and inverse", "sub": "Fri 4 Dec · ex 66, 68, 69, 70, 71, 72", "date": "2026-12-04", "gens": [["3.4", "isInverse"], ["3.4", "findKInv"], ["3.4", "inverseValue"], ["3.4", "inverseContext"]], "xg": [["3.4", "yIntercept"], ["3.4", "inverseSolveX"]]},
      {"id": "D11", "title": "Test prep · chapter 3", "sub": "Tue 8 Dec · ex 77, 78, 79, 80, 82, 84", "date": "2026-12-08", "gens": [["3.1", "gradientIntercept"], ["3.1", "direction"], ["3.1", "gradientTwoPoints"], ["3.1", "formulaFromGraph"], ["3.1", "tableLinear"], ["3.1", "parallel"], ["3.1", "xIntercept"], ["3.1", "missingCoord"], ["3.2", "isDirect"], ["3.2", "findK"], ["3.2", "valueFromPair"], ["3.2", "whichDirect"], ["3.2", "context"], ["3.2", "graphK"], ["3.2", "factor"], ["3.3", "abc"], ["3.3", "opening"], ["3.3", "vertexPoint"], ["3.3", "symmetryLine"], ["3.3", "yAxisCross"], ["3.3", "valueAt"], ["3.3", "xIntercepts"], ["3.3", "maxHeight"], ["3.4", "vertexForm"], ["3.4", "findA"], ["3.4", "isInverse"], ["3.4", "findKInv"], ["3.4", "inverseValue"], ["3.4", "inverseContext"], ["3.4", "factorInv"], ["3.4", "whichType"]], "xg": [["3.1", "formulaFromPoints"], ["3.1", "bFromGradientPoint"], ["3.2", "recipe"], ["3.2", "halfK"], ["3.3", "otherRoot"], ["3.3", "axisFromPoints"], ["3.4", "yIntercept"], ["3.4", "inverseSolveX"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: [...new Set(o.gens.map(g => g[0]))].reduce((a, s) => a.concat((XG[s] || []).map(f => [s, f.name])), []) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
  return { key: P.cls === '2HT' ? 'ch3-2ht-relationships-v1' : 'nx-' + P.cls.toLowerCase() + '-ch3-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['direction', 'whichDirect', 'factor', 'abc', 'opening', 'factorInv', 'whichType'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
