/* 1hvt-chapter-3: moved from the older engine to NX on 2026-10-22. Generators unchanged; only the engine around them changed. */
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

  /* 3.1 Coordinates */
  G['3.1'] = [
    function readPoint(l) {
      const r = [4, 6, 8][l], x = l === 0 ? ri(1, r) : nz(-r, r), y = l === 0 ? ri(1, r) : nz(-r, r);
      return { type: 'point', ans: [x, y], correct: pt(x, y),
        html: '<p>Which are the coordinates of point <b>P</b>?</p>' + grid({ xmin: -r, xmax: r, ymin: -r, ymax: r, pts: [{ x, y, label: 'P' }] }),
        hint: 'Start at the origin. Go left or right first (x), then up or down (y).',
        steps: 'x = ' + f(x) + ', y = ' + f(y) + ', so P = ' + pt(x, y) + '.' };
    },
    function quadrant(l) {
      const x = nz(-6, 6), y = nz(-6, 6);
      const q = x > 0 && y > 0 ? 0 : x < 0 && y > 0 ? 1 : x < 0 && y < 0 ? 2 : 3;
      const showGrid = l === 0;
      const html = '<p>In which quadrant is the point <b>' + pt(x, y) + '</b>?</p>' + (showGrid ? grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, pts: [{ x, y }] }) : '');
      return { type: 'choice', opts: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'], ans: q, correct: q, html,
        hint: 'Is x positive or negative (right or left)? Is y positive or negative (up or down)? Quadrant I is right and up, (+, +). Then go around anticlockwise: II, III, IV. Example: (−2, 3) is left and up, so quadrant II.',
        steps: 'x is ' + (x > 0 ? 'positive' : 'negative') + ' and y is ' + (y > 0 ? 'positive' : 'negative') + '. That is quadrant ' + ['I', 'II', 'III', 'IV'][q] + '.' };
    },
    function clickPoint(l) {
      const r = [5, 6, 8][l], x = l === 0 ? ri(1, r) : nz(-r, r), y = l === 0 ? ri(1, r) : nz(-r, r);
      return { type: 'click', targets: [[x, y]], correct: [[x, y]],
        html: '<p>Click the point <b>' + pt(x, y) + '</b> on the grid. (Click again to remove a point.)</p>' + grid({ xmin: -r, xmax: r, ymin: -r, ymax: r, click: true }),
        hint: 'First x (left/right), then y (up/down).', steps: 'Go ' + Math.abs(x) + ' ' + (x >= 0 ? 'right' : 'left') + ' and ' + Math.abs(y) + ' ' + (y >= 0 ? 'up' : 'down') + '.' };
    },
    function rectangle(l) {
      const r = [5, 6, 8][l];
      let x1 = l === 0 ? ri(1, 3) : ri(-r, -1), x2 = x1 + ri(2, 4), y1 = l === 0 ? ri(1, 3) : ri(-r, -2), y2 = y1 + ri(2, 4);
      if (x2 > r) x2 = r; if (y2 > r) y2 = r;
      const names = [['A', x1, y1], ['B', x2, y1], ['C', x2, y2], ['D', x1, y2]];
      const sh = l === 2 ? ri(0, 3) : 0, shown = [0, 1, 2].map(i => names[(i + sh) % 4]), miss = names[(3 + sh) % 4];
      const html = '<p>ABCD is a rectangle with its sides parallel to the axes. ' + shown.map(p => p[0] + ' = ' + pt(p[1], p[2])).join(', ') + '. Which are the coordinates of <b>' + miss[0] + '</b>?</p>' +
        (l < 2 ? grid({ xmin: -r, xmax: r, ymin: -r, ymax: r, pts: shown.map(p => ({ x: p[1], y: p[2], label: p[0] })) }) : '');
      return { type: 'point', ans: [miss[1], miss[2]], correct: pt(miss[1], miss[2]), html,
        hint: 'In a rectangle the opposite corners share their x-values or y-values. Look at which x and y are already used.',
        steps: miss[0] + ' = ' + pt(miss[1], miss[2]) + '.' };
    },
    function mirror(l) {
      const x = nz(-6, 6), y = nz(-6, 6);
      const modes = l === 0 ? ['x'] : l === 1 ? ['x', 'y'] : ['x', 'y', 'o'];
      const m = pick(modes);
      const nm = { x: 'the x-axis', y: 'the y-axis', o: 'the origin (0, 0)' }[m];
      const a = m === 'x' ? [x, -y] : m === 'y' ? [-x, y] : [-x, -y];
      return { type: 'point', ans: a, correct: pt(a[0], a[1]),
        html: '<p>Point <b>A = ' + pt(x, y) + '</b> is reflected in ' + nm + '. Which are the coordinates of the image A′?</p>' + (l === 0 ? grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, pts: [{ x, y, label: 'A' }] }) : ''),
        hint: m === 'x' ? 'Reflecting in the x-axis: the x-coordinate stays, the y-coordinate becomes the opposite number (3 becomes −3, −3 becomes 3). Example: (2, 3) becomes (2, −3).' : m === 'y' ? 'Reflecting in the y-axis: the y-coordinate stays, the x-coordinate becomes the opposite number. Example: (2, 3) becomes (−2, 3).' : 'Reflecting in the origin: both numbers become their opposite. Example: (2, 3) becomes (−2, −3).',
        steps: 'A′ = ' + pt(a[0], a[1]) + '.' };
    },
    function axisDist(l) {
      const x = nz(-7, 7), y = nz(-7, 7), toX = Math.random() < 0.5;
      return { type: 'num', ans: toX ? Math.abs(y) : Math.abs(x), correct: String(toX ? Math.abs(y) : Math.abs(x)),
        html: '<p>How far is the point <b>' + pt(x, y) + '</b> from the <b>' + (toX ? 'x' : 'y') + '-axis</b>? (Give a positive number.)</p>' + (l === 0 ? grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, pts: [{ x, y }] }) : ''),
        hint: toX ? 'The distance to the x-axis is how far up or down you go: use the y-coordinate.' : 'The distance to the y-axis is how far left or right you go: use the x-coordinate.',
        steps: 'Distance = |' + f(toX ? y : x) + '| = ' + Math.abs(toX ? y : x) + '.' };
    }
  ];

  /* 3.2 Formulas and tables */
  G['3.2'] = [
    function substitute(l) {
      let a, b, x, kind = 'lin';
      if (l === 0) { a = ri(2, 5); b = 0; x = ri(1, 6); }
      else if (l === 1) { a = nz(-4, 5); b = nz(-6, 6); x = ri(-4, 5); }
      else if (Math.random() < .5) { kind = 'quad'; a = pick([1, 1, 2, -1]); b = ri(-5, 6); x = nz(-4, 4); }
      else { a = nz(-5, 5); b = nz(-9, 9); x = ri(-6, 6); }
      const y = kind === 'lin' ? ev(a, b, x) : a * x * x + b;
      const ftxt = kind === 'lin' ? linTxt(a, b) : quadTxt(a, b);
      const st = kind === 'lin' ? 'y = ' + subStep(a, b, x) : 'y = ' + (a === 1 ? '' : a === -1 ? '−' : f(a) + ' · ') + par(x) + '²' + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = ' + f(y);
      return { type: 'num', ans: y, correct: String(y),
        html: '<p>Given: <b>y = ' + ftxt + '</b>. Calculate <b>y</b> when <b>x = ' + f(x) + '</b>.</p>',
        hint: 'Replace x by ' + f(x) + ' and calculate. Do · and powers first, then + and −.', steps: st };
    },
    function table(l) {
      const a = l === 0 ? ri(2, 4) : nz(-4, 4), b = l === 0 ? ri(0, 3) : nz(-5, 5);
      const xs = l === 0 ? [0, 1, 2, 3] : l === 1 ? shuffle([-3, -2, -1, 0, 1, 2, 3]).slice(0, 4).sort((p, q) => p - q) : shuffle([-5, -3, -2, 0, 2, 4, 6]).slice(0, 4).sort((p, q) => p - q);
      const show = [0, 1, 2, 3], hid = shuffle(show).slice(0, 2).sort();
      return { type: 'multi', fields: hid.map(i => 'y when x = ' + f(xs[i])), ans: hid.map(i => ev(a, b, xs[i])), correct: hid.map(i => String(ev(a, b, xs[i]))),
        html: '<p>Formula: <b>y = ' + linTxt(a, b) + '</b>. Fill in the two missing values in the table.</p>' + tbl(xs, xs.map((x, i) => hid.includes(i) ? null : ev(a, b, x))),
        hint: 'Do the same calculation for each missing x. Write it out: y = ' + subStep(a, b, xs[hid[0]]).split(' = ')[0] + ' …',
        steps: hid.map(i => 'x = ' + f(xs[i]) + ': y = ' + subStep(a, b, xs[i])).join('<br>') };
    },
    function solveX(l) {
      let a = l === 0 ? ri(2, 5) : nz(-5, 5), b = l === 0 ? ri(0, 6) : nz(-8, 8), x = l === 0 ? ri(1, 6) : ri(-6, 7);
      if (l === 2) { a = nz(-6, 6); }
      const y = ev(a, b, x);
      return { type: 'num', ans: x, correct: String(x), eqStep: 'x',
        html: '<p>Given: <b>y = ' + linTxt(a, b) + '</b>. For which <b>x</b> is <b>y = ' + f(y) + '</b>?</p>',
        hint: 'Write the equation ' + linTxt(a, b) + ' = ' + f(y) + ' and solve it step by step. First remove the ' + (b !== 0 ? f(b) : 'multiplication') + '.',
        steps: linTxt(a, b) + ' = ' + f(y) + (b !== 0 ? '<br>' + (a === 1 ? 'x' : f(a) + 'x') + ' = ' + f(y - b) : '') + '<br>x = ' + f(x) };
    },
    function onGraph(l) {
      const lin = l < 2 || Math.random() < .5;
      let a, b, ftxt, fn;
      if (lin) { a = nz(-4, 4); b = ri(-5, 5); ftxt = linTxt(a, b); fn = x => ev(a, b, x); }
      else { a = pick([1, -1, 2]); b = ri(-4, 5); ftxt = quadTxt(a, b); fn = x => a * x * x + b; }
      const x = ri(-4, 4), yes = Math.random() < .5, y = yes ? fn(x) : fn(x) + pick([-2, -1, 1, 2]);
      return { type: 'choice', opts: ['Yes, it is on the graph', 'No, it is not on the graph'], ans: yes ? 0 : 1, correct: yes ? 0 : 1,
        html: '<p>Is the point <b>' + pt(x, y) + '</b> on the graph of <b>y = ' + ftxt + '</b>?</p>',
        hint: 'Put the x-coordinate in the formula. If you get the y-coordinate of the point, it is on the graph.',
        steps: 'x = ' + f(x) + ' gives y = ' + f(fn(x)) + '. The point has y = ' + f(y) + ', so the answer is ' + (yes ? 'yes' : 'no') + '.' };
    },
    function matchFormula(l) {
      const a = l === 0 ? ri(1, 4) : nz(-4, 4), b = l === 0 ? ri(0, 4) : nz(-5, 5);
      const xs = l === 0 ? [0, 1, 2] : [-1, 0, 2];
      const opts = [[a, b], [b === 0 ? a + 1 : b, a], [a, -b === b ? b + 1 : -b], [-a, b]].map(p => linTxt(p[0], p[1]));
      const uniq = Array.from(new Set(opts)); while (uniq.length < 4) uniq.push(linTxt(a + uniq.length, b + 1));
      const order = shuffle(uniq.slice(0, 4)), correctTxt = linTxt(a, b);
      return { type: 'choice', opts: order.map(t => 'y = ' + t), ans: order.indexOf(correctTxt), correct: order.indexOf(correctTxt),
        html: '<p>Which formula belongs to this table?</p>' + tbl(xs, xs.map(x => ev(a, b, x))),
        hint: 'Test each formula with one pair from the table, for example x = ' + f(xs[1]) + '. Test a second pair to be sure.',
        steps: 'x = ' + f(xs[1]) + ' gives y = ' + f(ev(a, b, xs[1])) + '. Only y = ' + correctTxt + ' fits all pairs.' };
    }
  ];

  /* 3.3 Graphs of formulas */
  G['3.3'] = [
    function readLineY(l) {
      const a = l === 0 ? pick([1, 2]) : nz(-3, 3), b = l === 0 ? 0 : ri(-3, 3);
      const k = (() => { let t; do { t = ri(-4, 4); } while (Math.abs(ev(a, b, t)) > 8 || t === 0); return t; })();
      return { type: 'num', ans: ev(a, b, k), correct: String(ev(a, b, k)),
        html: '<p>This is the graph of a line. Which <b>y</b> belongs to <b>x = ' + f(k) + '</b>?</p>' + grid({ xmin: -5, xmax: 5, ymin: -8, ymax: 8, curves: [{ f: x => ev(a, b, x) }] }),
        hint: 'Find x = ' + f(k) + ' on the horizontal axis. Go up or down to the line, then read the y-value.',
        steps: 'At x = ' + f(k) + ' the line is at y = ' + f(ev(a, b, k)) + '.' };
    },
    function lineFormula(l) {
      const a = l === 0 ? pick([1, 2, 3]) : nz(-3, 3), b = l === 0 ? 0 : l === 1 ? ri(-4, 4) : nz(-5, 5), help = l < 2;   // spicy: no helper points, read them yourself
      return { type: 'multi', fields: ['m (y goes up/down by ... when x goes up 1)', 'b (where the line crosses the y-axis)'], ans: [a, b], correct: [String(a), String(b)],
        html: '<p>The line has the formula <b>y = mx + b</b>. Find <b>m</b> and <b>b</b>.</p>' + grid({ xmin: -5, xmax: 5, ymin: -8, ymax: 8, curves: [{ f: x => ev(a, b, x) }], pts: help ? [{ x: 0, y: b, color: '#16803c' }, { x: 1, y: a + b, color: '#16803c' }] : [] }),
        hint: help ? 'b = the y-value at x = 0 (green point). m = how much y changes if you go 1 to the right (compare the two green points).' : 'b = the y-value where the line crosses the y-axis (x = 0). m = how much y changes if you go 1 to the right. Read two grid points on the line.',
        steps: 'At x = 0: y = ' + f(b) + ', so b = ' + f(b) + '.<br>At x = 1: y = ' + f(a + b) + ', so m = ' + f(a + b) + ' − ' + par(b) + ' = ' + f(a) + '.<br>y = ' + linTxt(a, b) };
    },
    function plotLine(l) {
      const a = l === 0 ? ri(1, 2) : nz(-2, 2), b = l === 0 ? 0 : ri(-3, 3);
      const xs = l === 2 ? pick([[-2, 2], [-1, 3], [1, 3]]) : pick([[0, 2], [0, 1], [1, 3]]);
      const t = xs.map(x => [x, ev(a, b, x)]);
      return { type: 'click', targets: t, correct: t,
        html: '<p>Draw points of the graph of <b>y = ' + linTxt(a, b) + '</b>. Click the points with <b>x = ' + f(xs[0]) + '</b> and <b>x = ' + f(xs[1]) + '</b>.</p>' + grid({ xmin: -5, xmax: 5, ymin: -8, ymax: 8, click: true }),
        hint: 'Calculate y for both x-values first. Then click the two points.',
        steps: t.map(p => 'x = ' + f(p[0]) + ': y = ' + subStep(a, b, p[0])).join('<br>') };
    },
    function vertex(l) {
      const a = l === 2 ? -1 : 1, c = l === 0 ? ri(0, 4) : ri(-5, 5);
      return { type: 'point', ans: [0, c], correct: pt(0, c),
        html: '<p>This is the graph of <b>y = ' + quadTxt(a, c) + '</b>. Which are the coordinates of the ' + (a > 0 ? '<b>lowest</b>' : '<b>highest</b>') + ' point?</p>' + grid({ xmin: -5, xmax: 5, ymin: -8, ymax: 8, curves: [{ f: x => a * x * x + c }] }),
        hint: 'Look where the curve turns. Read the x-value and y-value of that point.',
        steps: 'At x = 0: y = ' + f(c) + '. The turning point is ' + pt(0, c) + '.' };
    },
    function shape(l) {
      const lin = Math.random() < .5; let ftxt;
      if (lin) { const a = nz(-4, 4), b = l === 0 ? 0 : ri(-5, 5); ftxt = linTxt(a, b); }
      else { const a = l === 0 ? 1 : pick([1, -1, 2, -2, 3]), c = l === 0 ? 0 : ri(-5, 5); ftxt = quadTxt(a, c); }
      return { type: 'choice', opts: ['A straight line', 'A parabola (a U-shaped curve)'], ans: lin ? 0 : 1, correct: lin ? 0 : 1,
        html: '<p>What does the graph of <b>y = ' + ftxt + '</b> look like?</p>',
        hint: 'Is there an x² in the formula? If yes, it is a parabola. If x only has a plain x, it is a line.',
        steps: lin ? 'There is no x², only x. So it is a straight line.' : 'There is an x². So the graph is a parabola.' };
    },
    function yAxisCross(l) {
      const a = nz(-4, 4), b = nz(-8, 8);
      return { type: 'point', ans: [0, b], correct: pt(0, b),
        html: '<p>Where does the graph of <b>y = ' + linTxt(a, b) + '</b> cross the <b>y-axis</b>? Give the coordinates.</p>',
        hint: 'On the y-axis x is 0. Put x = 0 in the formula.', steps: 'x = 0: y = ' + subStep(a, b, 0) + '. The point is ' + pt(0, b) + '.' };
    }
  ];

  /* 3.4 Linear or not? Patterns in tables */
  G['3.4'] = [
    function isLinear(l) {
      const lin = Math.random() < .5, xs = l === 0 ? [0, 1, 2, 3, 4] : l === 1 ? [-2, -1, 0, 1, 2] : [-3, -2, -1, 0, 1, 2];
      let ys, st;
      if (lin) { const a = nz(-4, 4), b = ri(-5, 6); ys = xs.map(x => ev(a, b, x)); st = 'y changes by ' + f(a) + ' every step: the same each time. It is linear.'; }
      else { const c = ri(-3, 5), a = l === 2 ? -1 : 1; ys = xs.map(x => a * x * x + c); st = 'The steps are ' + ys.slice(1).map((v, i) => f(v - ys[i])).join(', ') + ': not the same. It is not linear.'; }
      return { type: 'choice', opts: ['Yes, linear', 'No, not linear'], ans: lin ? 0 : 1, correct: lin ? 0 : 1,
        html: '<p>Is this a linear relation?</p>' + tbl(xs, ys),
        hint: 'Look at how y changes from one column to the next. For a linear relation the change is always the same.', steps: st };
    },
    function nextValue(l) {
      const a = nz(-5, 5), b = ri(-6, 8);
      let xs = [1, 2, 3, 4, 5], ys = xs.map(x => ev(a, b, x)), ask;
      if (l === 0) { ask = 5; ys[4] = null; }
      else if (l === 1) { const i = ri(1, 3); ask = xs[i]; ys[i] = null; }
      else { xs = [1, 2, 3]; ys = xs.map(x => ev(a, b, x)); ask = 10; }
      const answer = ev(a, b, ask);
      return { type: 'num', ans: answer, correct: String(answer),
        html: '<p>The table shows a linear relation. ' + (l === 2 ? 'Calculate <b>y</b> when <b>x = 10</b>.' : 'Fill in the missing value (<b>?</b>).') + '</p>' + tbl(xs, ys),
        hint: 'Find the change in y for each step of 1 in x. ' + (l === 2 ? 'Then count on, or first find the formula.' : 'Use that change to fill the gap.'),
        steps: 'y changes by ' + f(a) + ' each step. At x = ' + ask + ': y = ' + f(answer) + '.' };
    },
    function findFormula(l) {
      const a = l === 0 ? ri(1, 4) : nz(-4, 4), b = ri(-5, 6), xs = l === 0 ? [0, 1, 2, 3, 4] : l === 1 ? [1, 2, 3, 4, 5] : [2, 3, 4, 5, 6];
      return { type: 'multi', fields: ['m (the change in y per step of 1 in x)', 'b (y when x = 0)'], ans: [a, b], correct: [String(a), String(b)],
        html: '<p>This table belongs to a linear relation <b>y = mx + b</b>. Find <b>m</b> and <b>b</b>.</p>' + tbl(xs, xs.map(x => ev(a, b, x))),
        hint: 'm is the change in y for each step of 1 in x. Then go back (or forward) to x = 0 to find b.',
        steps: 'm = ' + f(a) + '. From x = ' + xs[0] + ' (y = ' + f(ev(a, b, xs[0])) + ') go back to x = 0: b = ' + f(b) + '.<br>y = ' + linTxt(a, b) };
    },
    function changePer(l) {
      const a = nz(-6, 6), b = ri(-8, 8), down = l === 2 && Math.random() < .5, v = down ? 'down 1' : 'up 1';
      return { type: 'num', ans: down ? -a : a, correct: String(down ? -a : a),
        html: '<p>Given: <b>y = ' + linTxt(a, b) + '</b>. By how much does <b>y</b> change when <b>x goes ' + v + '</b>? (A decrease is a negative number.)</p>',
        hint: 'Only the number in front of x matters.', steps: 'The number in front of x is ' + f(a) + '. ' + (down ? 'Going down 1 gives the opposite: ' + f(-a) + '.' : 'So y changes by ' + f(a) + '.') };
    },
    function growth(l) {
      const a = nz(-5, 5), b = ri(0, 9);
      const opts = ['y increases', 'y decreases', 'y stays the same'];
      const ans = a > 0 ? 0 : 1;
      return { type: 'choice', opts: opts.slice(0, 2), ans, correct: ans,
        html: '<p>Given: <b>y = ' + linTxt(a, b) + '</b>. When <b>x gets bigger</b>, what happens to <b>y</b>?</p>',
        hint: 'Is the number in front of x positive or negative?', steps: 'The number in front of x is ' + f(a) + (a > 0 ? ' (positive): y increases.' : ' (negative): y decreases.') };
    }
  ];

  /* 3.5 Relations in context */
  const CTX = [
    { t: (s, r) => 'A taxi has a start price of €' + s + ' and costs €' + r + ' for every km.', v: 'k', y: 'C', xn: 'km', yn: 'cost (€)', sn: 'the start price', rn: 'the price per km' },
    { t: (s, r) => 'A gym has a joining fee of €' + s + ' and costs €' + r + ' per month.', v: 'm', y: 'C', xn: 'months', yn: 'cost (€)', sn: 'the joining fee', rn: 'the price per month' },
    { t: (s, r) => 'A plant is ' + s + ' cm tall. It grows ' + r + ' cm every week.', v: 'w', y: 'H', xn: 'weeks', yn: 'height (cm)', sn: 'the height at the start', rn: 'the growth per week' },
    { t: (s, r) => 'A tank holds ' + s + ' litres of water. Every minute ' + r + ' litres are added.', v: 't', y: 'V', xn: 'minutes', yn: 'volume (litres)', sn: 'the water at the start', rn: 'the water added per minute' }
  ];
  G['3.5'] = [
    function formulaFromText(l) {
      const c = pick(CTX), s = ri(2, 12); let r = ri(2, 6); while (r === s) r = ri(2, 6);
      const right = c.y + ' = ' + s + ' + ' + r + c.v;
      const wrong = [c.y + ' = ' + r + ' + ' + s + c.v, c.y + ' = ' + (s + r) + c.v, c.y + ' = ' + s + c.v + ' + ' + r];
      const order = shuffle([right].concat(wrong));
      return { type: 'choice', opts: order, ans: order.indexOf(right), correct: order.indexOf(right),
        html: '<p>' + c.t(s, r) + ' Which formula gives the ' + c.yn.split(' ')[0] + ' <b>' + c.y + '</b> after <b>' + c.v + '</b> ' + c.xn + '?</p>',
        hint: 'The part that does not change (start) is just a number. The part that grows is multiplied by ' + c.v + '.',
        steps: 'Start: ' + s + '. Per ' + c.xn.replace(/s$/, '') + ': ' + r + '. So ' + right + '.' };
    },
    function valueAt(l) {
      const c = pick(CTX), s = ri(2, 12), r = ri(2, 7), x = l === 0 ? ri(2, 5) : ri(3, 15);
      return { type: 'num', ans: s + r * x, correct: String(s + r * x),
        html: '<p>' + c.t(s, r) + ' The formula is <b>' + c.y + ' = ' + s + ' + ' + r + c.v + '</b>. Calculate ' + c.y + ' when <b>' + c.v + ' = ' + x + '</b>.</p>',
        hint: 'Put ' + c.v + ' = ' + x + ' in the formula. Multiply first.', steps: c.y + ' = ' + s + ' + ' + r + ' · ' + x + ' = ' + s + ' + ' + (r * x) + ' = ' + (s + r * x) };
    },
    function timeFor(l) {
      const c = pick(CTX), sp = l >= 2, s = ri(2, 12), r = sp ? ri(1, 6) + pick([0.25, 0.75]) : ri(2, 7), x = ri(3, 14), tot = Math.round((s + r * x) * 100) / 100;   // spicy: decimals and you write the formula yourself
      return { type: 'num', ans: x, correct: String(x), eqStep: c.v,
        html: '<p>' + c.t(s, r) + (sp ? ' Write a formula for <b>' + c.y + '</b> with the variable <b>' + c.v + '</b>' + ' (' + c.xn + '). For which ' + c.v + ' is <b>' + c.y + ' = ' + tot + '</b>?</p>' : ' The formula is <b>' + c.y + ' = ' + s + ' + ' + r + c.v + '</b>. For which ' + c.v + ' is <b>' + c.y + ' = ' + tot + '</b>?</p>'),
        hint: 'Solve ' + s + ' + ' + r + c.v + ' = ' + tot + '. First subtract ' + s + ' on both sides.', steps: (sp ? 'The formula is ' + c.y + ' = ' + s + ' + ' + r + c.v + '.<br>' + s + ' + ' + r + c.v + ' = ' + tot + '<br>' : '') + r + c.v + ' = ' + tot + ' − ' + s + ' = ' + Math.round((tot - s) * 100) / 100 + '<br>' + c.v + ' = ' + Math.round((tot - s) * 100) / 100 + ' : ' + r + ' = ' + x };
    },
    function meaning(l) {
      const c = pick(CTX), s = ri(2, 12), r = ri(2, 7), askStart = Math.random() < .5;
      if (l >= 2) {   // spicy: what does a number in a worked-out calculation mean?
        const x = ri(3, 12), tot = s + r * x, askX = Math.random() < .5, what = 'the ' + c.yn.replace(/ \(.*\)/, '') + ' after ' + x + ' ' + c.xn;
        const o2 = [c.sn, c.rn, 'the number of ' + c.xn, what], a2 = askX ? 2 : 3;
        return { type: 'choice', opts: o2, ans: a2, correct: a2,
          html: '<p>' + c.t(s, r) + ' The formula is <b>' + c.y + ' = ' + s + ' + ' + r + c.v + '</b>. Tom calculates <b>' + c.y + ' = ' + s + ' + ' + r + ' × ' + x + ' = ' + tot + '</b>. What does the number <b>' + (askX ? x : tot) + '</b> mean?</p>',
          hint: 'Look at where the number is in the formula: ' + c.v + ' stands for the number of ' + c.xn + ', ' + c.y + ' is the result.',
          steps: askX ? x + ' is put in for ' + c.v + ', so it is the number of ' + c.xn + '.' : tot + ' is the result ' + c.y + ' for ' + c.v + ' = ' + x + ', so it is ' + what + '.' };
      }
      const opts = [c.sn, c.rn, 'the total after ' + c.xn];
      const ans = askStart ? 0 : 1;
      return { type: 'choice', opts, ans, correct: ans,
        html: '<p>' + c.t(s, r) + ' The formula is <b>' + c.y + ' = ' + s + ' + ' + r + c.v + '</b>. What does the number <b>' + (askStart ? s : r) + '</b> mean?</p>',
        hint: askStart ? 'Which number is there when ' + c.v + ' = 0?' : 'This number is multiplied by ' + c.v + ', so it is what you get for each step.',
        steps: (askStart ? 'When ' + c.v + ' = 0, ' + c.y + ' = ' + s + '. So ' + s + ' is ' + c.sn + '.' : r + ' is multiplied by ' + c.v + '. So it is ' + c.rn + '.') };
    },
    function breakEven(l) {
      const x0 = ri(2, 8), a1 = ri(1, 3), a2 = a1 + ri(1, 3), b2 = ri(0, 6), b1 = b2 + (a2 - a1) * x0;
      if (l === 0) {
        const x = ri(1, 3), ca = ev(a1, b1, x), cb = ev(a2, b2, x), cheaper = ca < cb ? 0 : 1;
        if (ca === cb) return G['3.5'][4](l);
        return { type: 'choice', opts: ['Plan A', 'Plan B'], ans: cheaper, correct: cheaper,
          html: '<p>Plan A: <b>C = ' + b1 + ' + ' + a1 + 'k</b>. Plan B: <b>C = ' + b2 + ' + ' + a2 + 'k</b> (C in €, k in km). Which plan is cheaper for <b>k = ' + x + '</b>?</p>',
          hint: 'Calculate C for both plans with k = ' + x + '.', steps: 'A: ' + b1 + ' + ' + a1 + ' · ' + x + ' = ' + ca + '<br>B: ' + b2 + ' + ' + a2 + ' · ' + x + ' = ' + cb };
      }
      return { type: 'num', ans: x0, correct: String(x0),
        html: '<p>Plan A: <b>C = ' + b1 + ' + ' + a1 + 'k</b>. Plan B: <b>C = ' + b2 + ' + ' + a2 + 'k</b>. For which <b>k</b> do both plans cost the same?</p>',
        hint: 'Make the two costs equal: ' + b1 + ' + ' + a1 + 'k = ' + b2 + ' + ' + a2 + 'k. Or make a table for k = 1, 2, 3, … and look for equal values.',
        steps: 'Try k = ' + x0 + ': A = ' + (b1 + a1 * x0) + ' and B = ' + (b2 + a2 * x0) + '. They are equal, so k = ' + x0 + '.' };
    },
    function squareArea(l) {
      const side = ri(2, 9), mode = l === 0 ? 0 : ri(0, 1);
      if (mode === 0) return { type: 'num', ans: side * side, correct: String(side * side),
        html: '<p>The area of a square with side <b>s</b> cm is <b>A = s²</b>. Calculate <b>A</b> when <b>s = ' + side + '</b>.</p>',
        hint: 's² means s · s.', steps: 'A = ' + side + ' · ' + side + ' = ' + side * side };
      const h0 = pick([20, 45, 80]), t = ri(1, 2), hh = h0 - 5 * t * t;
      return { type: 'num', ans: hh, correct: String(hh),
        html: '<p>A stone falls from a tower of ' + h0 + ' m. The height is <b>h = ' + h0 + ' − 5t²</b> (h in metres, t in seconds). How high is the stone after <b>t = ' + t + '</b> seconds?</p>',
        hint: 'Do t² first, then multiply by 5, then subtract from ' + h0 + '.', steps: 'h = ' + h0 + ' − 5 · ' + t + '² = ' + h0 + ' − ' + 5 * t * t + ' = ' + hh };
    }
  ];

  const XG = {};   // extra spicy generators per section
  /* ---------- Extra spicy (level 4): challenge questions ---------- */
  XG['3.1'] = [
    function parallelogram() {
      let A, B, C, D, n = 0;
      do { A = [ri(-5, 3), ri(-5, 3)]; B = [A[0] + ri(2, 5), A[1] + ri(-1, 2)]; const v = [ri(-3, 3), ri(2, 4)]; C = [B[0] + v[0], B[1] + v[1]]; D = [A[0] + v[0], A[1] + v[1]]; n++; }
      while (n < 300 && ![A, B, C, D].every(p => Math.abs(p[0]) <= 7 && Math.abs(p[1]) <= 7));
      return { type: 'point', ans: D, correct: pt(D[0], D[1]),
        html: '<p>ABCD is a parallelogram with <b>A = ' + pt(A[0], A[1]) + '</b>, <b>B = ' + pt(B[0], B[1]) + '</b> and <b>C = ' + pt(C[0], C[1]) + '</b>. Which are the coordinates of <b>D</b>?</p>' + grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, pts: [{ x: A[0], y: A[1], label: 'A' }, { x: B[0], y: B[1], label: 'B' }, { x: C[0], y: C[1], label: 'C' }] }),
        hint: 'In a parallelogram the sides AD and BC are equal and parallel. Go from B to C (count the steps), and do the same steps from A.',
        steps: 'From B to C: ' + f(C[0] - B[0]) + ' in x and ' + f(C[1] - B[1]) + ' in y. From A: D = ' + pt(D[0], D[1]) + '.' };
    },
    function twoReflections() {
      const x = nz(-6, 6), y = nz(-6, 6), first = Math.random() < .5 ? 'y' : 'x';
      const B = first === 'y' ? [-x, y] : [x, -y], C = first === 'y' ? [B[0], -B[1]] : [-B[0], B[1]];
      return { type: 'point', ans: C, correct: pt(C[0], C[1]),
        html: '<p>Point <b>A = ' + pt(x, y) + '</b> is reflected in the <b>' + first + '-axis</b>. The image B is then reflected in the <b>' + (first === 'y' ? 'x' : 'y') + '-axis</b>. Which are the coordinates of the final image C?</p>',
        hint: 'Do it in two steps. Reflecting in the y-axis turns x into its opposite number. Reflecting in the x-axis turns y into its opposite number. Example: (2, 3) → y-axis → (−2, 3) → x-axis → (−2, −3).',
        steps: 'B = ' + pt(B[0], B[1]) + ', so C = ' + pt(C[0], C[1]) + '.' };
    }
  ];
  XG['3.2'] = [
    function solveNeg() {
      const a = pick([-5, -4, -3, -2, 2, 3, 4]), b = ri(-8, 8), x = ri(-6, 6), y = a * x + b;
      return { type: 'num', ans: x, correct: String(x), eqStep: 'x',
        html: '<p>Given: <b>y = ' + linTxt(a, b) + '</b>. For which <b>x</b> is <b>y = ' + f(y) + '</b>?</p>',
        hint: 'Solve ' + linTxt(a, b) + ' = ' + f(y) + '. First get the term with x alone, then divide.',
        steps: (b !== 0 ? f(a) + 'x = ' + f(y) + (b > 0 ? ' − ' + b : ' + ' + Math.abs(b)) + ' = ' + f(y - b) + '<br>' : '') + 'x = ' + f(y - b) + ' : ' + par(a) + ' = ' + f(x) };
    },
    function howManyOn() {
      const a = nz(-3, 3), b = ri(-5, 5), pts = [], on = [];
      for (let i = 0; i < 4; i++) { const x = ri(-4, 4); const hit = Math.random() < .5; const y = ev(a, b, x) + (hit ? 0 : pick([-2, -1, 1, 2])); pts.push([x, y]); if (hit) on.push(1); }
      return { type: 'num', ans: on.length, correct: String(on.length),
        html: '<p>How many of the points <b>' + pts.map(p => pt(p[0], p[1])).join(', ') + '</b> lie on the graph of <b>y = ' + linTxt(a, b) + '</b>?</p>',
        hint: 'Put the x of each point in the formula. Is the y you get equal to the y of the point?',
        steps: pts.map(p => pt(p[0], p[1]) + ': y = ' + subStep(a, b, p[0]) + (ev(a, b, p[0]) === p[1] ? ' ✓' : ' ✗ (not ' + f(p[1]) + ')')).join('<br>') + '<br>Answer: ' + on.length };
    }
  ];
  XG['3.3'] = [
    function formulaFromPoints() {
      const a = nz(-3, 3), b = ri(-5, 5), x1 = ri(-3, 1), x2 = x1 + ri(1, 3), P = [x1, ev(a, b, x1)], Q = [x2, ev(a, b, x2)];
      return { type: 'multi', fields: ['m', 'b'], ans: [a, b], correct: [String(a), String(b)],
        html: '<p>A straight line <b>y = mx + b</b> goes through <b>' + pt(P[0], P[1]) + '</b> and <b>' + pt(Q[0], Q[1]) + '</b>. Find <b>m</b> and <b>b</b>.</p>' + grid({ xmin: -6, xmax: 6, ymin: -9, ymax: 9, pts: [{ x: P[0], y: P[1] }, { x: Q[0], y: Q[1] }] }),
        hint: 'm = how much y changes when x goes up 1: (change in y) : (change in x). Then use one point to find b.',
        steps: 'm = (' + f(Q[1]) + ' − ' + par(P[1]) + ') : (' + f(x2) + ' − ' + par(x1) + ') = ' + f(Q[1] - P[1]) + ' : ' + (x2 - x1) + ' = ' + f(a) + '. Then b = ' + f(P[1]) + ' − ' + par(a) + ' · ' + par(x1) + ' = ' + f(b) + '. So y = ' + linTxt(a, b) };
    },
    function whereCrossesX() {
      const a = nz(-3, 3), x0 = ri(-5, 5), b = -a * x0;
      return { type: 'num', ans: x0, correct: String(x0),
        html: '<p>The graph of <b>y = ' + linTxt(a, b) + '</b> crosses the <b>x-axis</b>. At which <b>x</b>?</p>',
        hint: 'On the x-axis y = 0. Solve ' + linTxt(a, b) + ' = 0.',
        steps: 'y = 0: ' + linTxt(a, b) + ' = 0, so ' + f(a) + 'x = ' + f(-b) + ' and x = ' + f(x0) + '.' };
    }
  ];
  XG['3.4'] = [
    function farValue() {
      const a = nz(-4, 4), b = ri(-6, 6), x1 = ri(0, 3), x2 = x1 + ri(2, 4), x3 = x2 + ri(3, 6);
      return { type: 'num', ans: ev(a, b, x3), correct: String(ev(a, b, x3)),
        html: '<p>The table is <b>linear</b> (the points are on a straight line). Find the missing value.</p>' + tbl([x1, x2, x3], [ev(a, b, x1), ev(a, b, x2), null]),
        hint: 'Find how much y changes per 1 step of x: (change in y) : (change in x). Then continue to the new x.',
        steps: 'Per 1 in x, y changes by (' + f(ev(a, b, x2)) + ' − ' + par(ev(a, b, x1)) + ') : ' + (x2 - x1) + ' = ' + f(a) + '. From x = ' + x2 + ' to x = ' + x3 + ' is ' + (x3 - x2) + ' steps: ' + f(ev(a, b, x2)) + ' + ' + (x3 - x2) + ' · ' + par(a) + ' = ' + f(ev(a, b, x3)) + '.' };
    },
    function whichIsLinear() {
      const a = nz(-3, 3), b = ri(-4, 4), xs = [0, 1, 2, 3, 4], good = xs.map(x => ev(a, b, x));
      const bad = good.slice(); const k = ri(1, 3); bad[k + 1] += pick([-2, -1, 1, 2]);
      const opts = shuffle([['Table A', good], ['Table B', bad]]), ans = opts.findIndex(o => o[1] === good);
      return { type: 'choice', opts: opts.map(o => o[0]), ans, correct: ans,
        html: '<p>Which table is <b>linear</b>?</p>' + opts.map(o => '<p><b>' + o[0] + '</b></p>' + tbl(xs, o[1])).join(''),
        hint: 'In a linear table y changes by the same amount for every step of 1 in x. Check the differences.',
        steps: opts[ans][0] + ': y changes by ' + f(a) + ' every step. In the other table the steps are not all the same.' };
    }
  ];
  XG['3.5'] = [
    function equalCost() {
      const x0 = ri(3, 9), a1 = ri(1, 3), a2 = a1 + ri(1, 3), b2 = ri(0, 6), b1 = b2 + (a2 - a1) * x0, cost = b1 + a1 * x0;
      return { type: 'multi', fields: ['k (km)', 'cost in €'], ans: [x0, cost], correct: [String(x0), String(cost)],
        html: '<p>Taxi A: <b>C = ' + b1 + ' + ' + a1 + 'k</b>. Taxi B: <b>C = ' + b2 + ' + ' + a2 + 'k</b> (C in €, k in km). For some distance both taxis cost the same. Find that distance and the cost.</p>',
        hint: 'Make a table for k = 1, 2, 3, … for both taxis, or solve ' + b1 + ' + ' + a1 + 'k = ' + b2 + ' + ' + a2 + 'k.',
        steps: 'At k = ' + x0 + ': A = ' + b1 + ' + ' + a1 + ' · ' + x0 + ' = ' + cost + ' and B = ' + b2 + ' + ' + a2 + ' · ' + x0 + ' = ' + cost + '. Same cost: €' + cost + ' at ' + x0 + ' km.' };
    },
    function candle() {
      const r = ri(2, 5), t1 = ri(1, 3), t2 = t1 + ri(2, 4), H0 = ri(30, 60), h1 = H0 - r * t1, h2 = H0 - r * t2;
      return { type: 'num', ans: H0, correct: String(H0),
        html: '<p>A candle burns down at a constant speed. After <b>' + t1 + ' hour' + (t1 > 1 ? 's' : '') + '</b> it is <b>' + h1 + ' cm</b> tall. After <b>' + t2 + ' hours</b> it is <b>' + h2 + ' cm</b> tall. How tall was the candle at the start (at 0 hours)? (Give the number of cm.)</p>',
        hint: 'First find how many cm the candle loses per hour. Then go back to 0 hours.',
        steps: 'Loss per hour: (' + h1 + ' − ' + h2 + ') : ' + (t2 - t1) + ' = ' + r + ' cm. Back to 0 hours: ' + h1 + ' + ' + t1 + ' · ' + r + ' = ' + H0 + ' cm.' };
    }
  ];

  const SECTIONS = [
    { id: '3.1', title: '3.1 Coordinates', sub: 'Points, quadrants, mirror images' },
    { id: '3.2', title: '3.2 Formulas and tables', sub: 'Calculate y, fill in tables' },
    { id: '3.3', title: '3.3 Graphs of formulas', sub: 'Read, draw and recognise graphs' },
    { id: '3.4', title: '3.4 Linear or not?', sub: 'Patterns in tables' },
    { id: '3.5', title: '3.5 Relations in context', sub: 'Formulas for real situations' }
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
  const GOALS = [["3.1", "I can read and plot points in a coordinate system", ["readPoint", "quadrant", "clickPoint", "axisDist"]], ["3.1", "I can reflect points and use coordinates in shapes", ["rectangle", "mirror", "parallelogram", "twoReflections"]], ["3.2", "I can use a formula and a table", ["substitute", "table", "solveX", "matchFormula", "solveNeg"]], ["3.2", "I can check whether a point is on a graph", ["onGraph", "howManyOn"]], ["3.3", "I can read, draw and describe graphs of formulas", ["readLineY", "lineFormula", "plotLine", "vertex", "shape", "yAxisCross", "formulaFromPoints", "whereCrossesX"]], ["3.4", "I can decide whether a relation is linear and how it changes", ["isLinear", "nextValue", "findFormula", "changePer", "growth", "farValue", "whichIsLinear"]], ["3.5", "I can use formulas in context", ["formulaFromText", "valueAt", "timeFor", "meaning", "breakEven", "squareArea", "equalCost", "candle"]]];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "1HVT": [
      {"id": "D1", "title": "Lesson · 3.1 A Coordinates", "sub": "Wed 11 Nov · ex 1, 2, 5, 6, 7, 8, 9", "date": "2026-11-11", "gens": [["3.1", "readPoint"], ["3.1", "quadrant"], ["3.1", "clickPoint"]], "xg": [["3.1", "parallelogram"], ["3.1", "twoReflections"]]},
      {"id": "D2", "title": "Lesson · 3.1 B Coordinates", "sub": "Thu 12 Nov · ex 10, 11, 12, 13, 14, 15", "date": "2026-11-12", "gens": [["3.1", "quadrant"], ["3.1", "clickPoint"], ["3.1", "rectangle"]], "xg": [["3.1", "parallelogram"], ["3.1", "twoReflections"]]},
      {"id": "D3", "title": "Lesson · 3.1 C Coordinates", "sub": "Fri 13 Nov · ex 16, 17, 18", "date": "2026-11-13", "gens": [["3.1", "clickPoint"], ["3.1", "rectangle"], ["3.1", "mirror"]], "xg": [["3.1", "parallelogram"], ["3.1", "twoReflections"]]},
      {"id": "D4", "title": "Lesson · 3.2 A Formulas and tables", "sub": "Tue 17 Nov · ex 22abc, 23, 24abce, 25, 26", "date": "2026-11-17", "gens": [["3.2", "substitute"], ["3.2", "table"], ["3.2", "solveX"]], "xg": [["3.2", "solveNeg"], ["3.2", "howManyOn"]]},
      {"id": "D5", "title": "Lesson · 3.2 B Formulas and tables", "sub": "Wed 18 Nov · ex 27, 28, 29, 30, 31", "date": "2026-11-18", "gens": [["3.2", "table"], ["3.2", "solveX"], ["3.2", "onGraph"]], "xg": [["3.2", "solveNeg"], ["3.2", "howManyOn"]]},
      {"id": "D6", "title": "Lesson · 3.2 C Formulas and tables", "sub": "Thu 19 Nov · ex 32, 33, 35ac", "date": "2026-11-19", "gens": [["3.2", "solveX"], ["3.2", "onGraph"], ["3.2", "matchFormula"]], "xg": [["3.2", "solveNeg"], ["3.2", "howManyOn"]]},
      {"id": "D7", "title": "Lesson · 3.3 A Graphs of formulas", "sub": "Fri 20 Nov · ex 37, 38, 39, 40, 41", "date": "2026-11-20", "gens": [["3.3", "readLineY"], ["3.3", "lineFormula"], ["3.3", "plotLine"]], "xg": [["3.3", "formulaFromPoints"], ["3.3", "whereCrossesX"]]},
      {"id": "D8", "title": "Lesson · 3.3 B Graphs of formulas", "sub": "Tue 24 Nov · ex 42, 43, 44, 45", "date": "2026-11-24", "gens": [["3.3", "lineFormula"], ["3.3", "plotLine"], ["3.3", "vertex"]], "xg": [["3.3", "formulaFromPoints"], ["3.3", "whereCrossesX"]]},
      {"id": "D9", "title": "Lesson · 3.3 C Graphs of formulas", "sub": "Wed 25 Nov · ex 46, 47, 48, 49, 50", "date": "2026-11-25", "gens": [["3.3", "plotLine"], ["3.3", "vertex"], ["3.3", "shape"]], "xg": [["3.3", "formulaFromPoints"], ["3.3", "whereCrossesX"]]},
      {"id": "D10", "title": "Lesson · 3.4 A Linear or not?", "sub": "Thu 26 Nov · ex 54, 55, 56, 57, 58", "date": "2026-11-26", "gens": [["3.4", "isLinear"], ["3.4", "nextValue"], ["3.4", "findFormula"]], "xg": [["3.4", "farValue"], ["3.4", "whichIsLinear"]]},
      {"id": "D11", "title": "Lesson · 3.4 B Linear or not?", "sub": "Fri 27 Nov · ex 59, 60, 61, 62, 63", "date": "2026-11-27", "gens": [["3.4", "isLinear"], ["3.4", "nextValue"], ["3.4", "findFormula"]], "xg": [["3.4", "farValue"], ["3.4", "whichIsLinear"]]},
      {"id": "D12", "title": "Lesson · 3.4 C Linear or not?", "sub": "Wed 2 Dec · ex 64, 65, 66abcde, 67, 68", "date": "2026-12-02", "gens": [["3.4", "findFormula"], ["3.4", "changePer"], ["3.4", "growth"]], "xg": [["3.4", "farValue"], ["3.4", "whichIsLinear"]]},
      {"id": "D13", "title": "Lesson · 3.5 A Relations in context", "sub": "Thu 3 Dec · ex 72, 73, 74, 75, 76", "date": "2026-12-03", "gens": [["3.5", "formulaFromText"], ["3.5", "valueAt"], ["3.5", "timeFor"]], "xg": [["3.5", "equalCost"], ["3.5", "candle"]]},
      {"id": "D14", "title": "Lesson · 3.5 B Relations in context", "sub": "Fri 4 Dec · ex 77, 78, 79, 80, 81", "date": "2026-12-04", "gens": [["3.5", "valueAt"], ["3.5", "timeFor"], ["3.5", "meaning"]], "xg": [["3.5", "equalCost"], ["3.5", "candle"]]},
      {"id": "D15", "title": "Test prep · chapter 3", "sub": "Tue 8 Dec · ex 82, 83", "date": "2026-12-08", "gens": [["3.1", "readPoint"], ["3.1", "quadrant"], ["3.1", "clickPoint"], ["3.1", "rectangle"], ["3.1", "mirror"], ["3.1", "axisDist"], ["3.2", "substitute"], ["3.2", "table"], ["3.2", "solveX"], ["3.2", "onGraph"], ["3.2", "matchFormula"], ["3.3", "readLineY"], ["3.3", "lineFormula"], ["3.3", "plotLine"], ["3.3", "vertex"], ["3.3", "shape"], ["3.3", "yAxisCross"], ["3.4", "isLinear"], ["3.4", "nextValue"], ["3.4", "findFormula"], ["3.4", "changePer"], ["3.4", "growth"], ["3.5", "formulaFromText"], ["3.5", "valueAt"], ["3.5", "timeFor"], ["3.5", "meaning"], ["3.5", "breakEven"], ["3.5", "squareArea"]], "xg": [["3.1", "parallelogram"], ["3.1", "twoReflections"], ["3.2", "solveNeg"], ["3.2", "howManyOn"], ["3.3", "formulaFromPoints"], ["3.3", "whereCrossesX"], ["3.4", "farValue"], ["3.4", "whichIsLinear"], ["3.5", "equalCost"], ["3.5", "candle"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: o.xg.filter(g => __has(XG, g)) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
  return { key: 'ch3-relations-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['quadrant', 'clickPoint', 'axisDist', 'readPoint', 'readLineY', 'yAxisCross', 'changePer', 'growth'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
