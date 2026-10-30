const { ri, pick, shuffle } = NX;
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => { d = d === undefined ? 10 : d; return Math.round(x * Math.pow(10, d)) / Math.pow(10, d); };
const sp = n => { n = rd(n); const neg = n < 0, s = String(Math.abs(n)).indexOf('e') >= 0 ? Math.abs(n).toFixed(12).replace(/0+$/, '') : String(Math.abs(n)), m = s.split('.'); m[0] = m[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return (neg ? '−' : '') + m.join('.'); };
const LEN = ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km'];
const sup = d => d === 2 ? '²' : d === 3 ? '³' : '';
/* convert v from unit a to unit b (indices in LEN) for dimension d (1 length, 2 area, 3 volume) */
const conv = (v, a, b, d) => rd(v * Math.pow(10, d * (a - b)));
function convSteps(v, a, b, d) {
  const f = Math.pow(10, d * Math.abs(a - b)), big = a > b, r = conv(v, a, b, d), u = i => LEN[i] + sup(d);
  const chainU = []; const lo = Math.min(a, b), hi = Math.max(a, b); for (let i = hi; i >= lo; i--) chainU.push(i);
  let line = '1 ' + u(hi); let acc = 1; for (let i = hi - 1; i >= lo; i--) { acc *= Math.pow(10, d); line += ' = ' + sp(acc) + ' ' + u(i); }
  return p(line) + p(sp(v) + ' ' + u(a) + ' = ' + sp(v) + (big ? ' × ' : ' : ') + sp(f) + ' = ' + sp(r) + ' ' + u(b));
}
const okR = r => r >= 1e-4 && r <= 1e9;
const nice = l => l === 0 ? pick([2, 3, 4, 5, 7, 8, 9, 12, 15, 25]) : l === 1 ? pick([1.5, 2.4, 3.75, 0.6, 12, 45, 250, 3.2]) : pick([0.25, 0.04, 6.08, 125, 0.7, 4300, 15.5]);
const svg = (w, h, body) => '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:' + w + 'px;max-width:100%" role="img" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
const txt = (s, x, y, a) => '<text x="' + x + '" y="' + y + '" font-size="13" text-anchor="' + (a || 'middle') + '" fill="#17222d">' + s + '</text>';
const PI = 'π';

/* ======================= 5.1 Length, time and speed ======================= */
G['5.1'] = [
  function lengthUnit(l) {
    const span = l === 0 ? 1 : l === 1 ? ri(1, 3) : ri(2, 5); let a, b; do { a = ri(0, 6); b = a + (Math.random() < .5 ? span : -span); } while (b < 0 || b > 6 || (l === 0 && (a === 4 || a === 5 || b === 4 || b === 5)));
    const v = nice(l), r = conv(v, a, b, 1); if (!okR(r)) return G['5.1'][0](l);
    return nu(p('Convert: ' + sp(v) + ' ' + LEN[a] + ' = … ' + LEN[b]), r, 'mm – cm – dm – m – dam – hm – km. Each step is × 10 or : 10. To a smaller unit you multiply.', convSteps(v, a, b, 1));
  },
  function prefix(l) {
    const P_ = [['kilo', '1000'], ['hecto', '100'], ['deca', '10'], ['deci', '0.1'], ['centi', '0.01'], ['milli', '0.001']], q = pick(P_), ask = Math.random() < .5;
    if (ask) return ch(p('What does <b>' + q[0] + '</b> mean?'), q[1], P_.filter(x => x !== q).map(x => x[1]).slice(0, 4), 'kilo = 1000, hecto = 100, deca = 10, deci = 0.1, centi = 0.01, milli = 0.001.', q[0] + ' means ' + q[1] + '. For example 1 ' + q[0] + 'metre = ' + q[1] + ' m.');
    return ch(p('Which prefix means <b>' + q[1] + '</b>?'), q[0], P_.filter(x => x !== q).map(x => x[0]).slice(0, 4), 'kilo = 1000, hecto = 100, deca = 10, deci = 0.1, centi = 0.01, milli = 0.001.', q[1] + ' is ' + q[0] + '.');
  },
  function timeConvert(l) {
    const k = l === 0 ? ri(0, 2) : ri(0, 4);
    if (k === 0) { const d = ri(2, 9); return nu(p('How many hours are ' + d + ' days?'), 24 * d, '1 day = 24 hours.', d + ' · 24 = ' + 24 * d + ' hours'); }
    if (k === 1) { const w = ri(1, 4); return nu(p('How many minutes are ' + w + ' week' + (w > 1 ? 's' : '') + '?'), w * 7 * 24 * 60, '1 week = 7 days, 1 day = 24 hours, 1 hour = 60 minutes.', w + ' · 7 · 24 · 60 = ' + sp(w * 7 * 24 * 60) + ' minutes'); }
    if (k === 2) { const h = ri(1, 9), q = pick([0.25, 0.5, 0.75]); return nu(p('How many minutes are ' + (h + q) + ' hours?'), 60 * (h + q), '1 hour = 60 minutes. ' + q + ' hour = ' + 60 * q + ' minutes.', '60 · ' + (h + q) + ' = 60 · ' + h + ' + 60 · ' + q + ' = ' + 60 * h + ' + ' + 60 * q + ' = ' + 60 * (h + q) + ' minutes', { needStep: true }); }
    if (k === 3) { const m = ri(1, 15), q = pick([0.2, 0.4, 0.5, 0.8]); return nu(p('How many seconds are ' + (m + q) + ' minutes?'), rd(60 * (m + q)), '1 minute = 60 seconds.', '60 · ' + (m + q) + ' = 60 · ' + m + ' + 60 · ' + q + ' = ' + 60 * m + ' + ' + rd(60 * q) + ' = ' + rd(60 * (m + q)) + ' seconds', { needStep: true }); }
    const h = ri(2, 6), m = pick([12, 15, 24, 30, 36, 45, 48]); return nu(p('Write ' + h + ' hours and ' + m + ' minutes as a decimal number of hours.'), rd(h + m / 60), m + ' minutes = ' + m + '/60 hour.', m + ' : 60 = ' + rd(m / 60) + ', so ' + h + ' h ' + m + ' min = ' + rd(h + m / 60) + ' hours');
  },
  function speedConvert(l) {
    const toMs = Math.random() < .5;
    if (toMs) { const ms = l === 0 ? pick([5, 10, 15, 20, 25, 30]) : pick([2.5, 7.5, 12.5, 22.5, 35]), kmh = rd(ms * 3.6); return nu(p('Convert ' + kmh + ' km/h to m/s.'), ms, 'From km/h to m/s: divide by 3.6 (1 km = 1000 m and 1 hour = 3600 s).', kmh + ' : 3.6 = ' + ms + ' m/s'); }
    const ms = l === 0 ? pick([5, 10, 20, 25]) : pick([6, 8, 12, 15, 2.5, 30]), kmh = rd(ms * 3.6); return nu(p('Convert ' + ms + ' m/s to km/h.'), kmh, 'From m/s to km/h: multiply by 3.6.', ms + ' × 3.6 = ' + kmh + ' km/h');
  },
  function avgSpeed(l) {
    const v = ri(3, l === 0 ? 30 : 110), t = l === 0 ? ri(2, 5) : pick([0.5, 1.5, 2.5, 0.25, 3]), d = rd(v * t), ask = l === 2 ? pick(['v', 'd', 't']) : 'v';
    if (ask === 'd') return nu(p('A car drives at an average speed of ' + v + ' km/h for ' + t + ' hours. How many km does it drive?'), d, 'distance = speed × time.', v + ' × ' + t + ' = ' + d + ' km');
    if (ask === 't') return nu(p('A train travels ' + d + ' km at an average speed of ' + v + ' km/h. How many hours does it take?'), t, 'time = distance : speed.', d + ' : ' + v + ' = ' + t + ' hours');
    return nu(p('A cyclist rides ' + d + ' km in ' + t + ' hours. Calculate the average speed in km/h.'), v, 'speed = distance : time.', d + ' : ' + t + ' = ' + v + ' km/h');
  }
];
XG['5.1'] = [
  function runnerSpeed(l) {
    const ms = pick([4, 5, 6, 4.5, 5.5]), dist = pick([5, 10, 21.1]), kmh = rd(ms * 3.6), mins = rd(dist / kmh * 60, 1);
    return nu(p('A runner runs ' + ms + ' metres per second. How many minutes does the runner need for ' + dist + ' km? <small>(Round to 1 decimal.)</small>'), mins, 'First change m/s to km/h (× 3.6). Then time = distance : speed, in hours. Then × 60.', p(ms + ' m/s = ' + ms + ' × 3.6 = ' + kmh + ' km/h') + p(dist + ' : ' + kmh + ' = ' + rd(dist / kmh, 4) + ' hours') + p(rd(dist / kmh, 4) + ' × 60 ≈ ' + mins + ' minutes'), { tol: .051 });
  }
];

/* ======================= 5.2 Perimeter and area ======================= */
const rectFig = (a, b, la, lb) => svg(240, 130, '<rect x="60" y="20" width="160" height="80" fill="rgba(27,95,168,.08)" stroke="#1b5fa8" stroke-width="2"/>' + txt(la, 140, 14) + txt(lb, 52, 64, 'end'));
G['5.2'] = [
  function perimeterRect(l) {
    const a = ri(3, 15) + (l === 2 ? .5 : 0), b = ri(2, 12), k = l === 0 ? 0 : ri(0, 2);
    if (k === 0) return nu(p('A rectangle is ' + a + ' cm long and ' + b + ' cm wide. Calculate the perimeter.') + rectFig(a, b, a + ' cm', b + ' cm'), 2 * a + 2 * b, 'perimeter = 2 · length + 2 · width.', '2 · ' + a + ' + 2 · ' + b + ' = ' + 2 * a + ' + ' + 2 * b + ' = ' + (2 * a + 2 * b) + ' cm', { needStep: true });
    if (k === 1) { const P_ = 2 * a + 2 * b; return nu(p('A rectangle has perimeter ' + P_ + ' cm. One side is ' + a + ' cm. How long is the other side?'), b, 'The opposite side is also ' + a + ' cm. The other two sides together are ' + P_ + ' − 2 · ' + a + '.', P_ + ' − 2 · ' + a + ' = ' + (P_ - 2 * a) + '<br>' + (P_ - 2 * a) + ' : 2 = ' + b + ' cm', { needStep: true }); }
    const s = ri(3, 15) + pick([0, .5]), P_ = 4 * s; return nu(p('A square has perimeter ' + P_ + ' cm. How long is one side?'), s, 'A square has four equal sides.', P_ + ' : 4 = ' + s + ' cm');
  },
  function areaRect(l) {
    const a = ri(3, 20) + (l === 2 ? pick([.5, .2]) : 0), b = ri(2, 15), A = rd(a * b), sq = l === 0 && Math.random() < .3;
    if (sq) return nu(p('A square has sides of ' + b + ' m. Calculate the area.'), b * b, 'area of a square = side × side.', b + ' × ' + b + ' = ' + b * b + ' m²');
    return nu(p('A rectangle is ' + a + ' m long and ' + b + ' m wide. Calculate the area.') + rectFig(a, b, a + ' m', b + ' m'), A, 'area = length × width.', a + ' × ' + b + ' = ' + A + ' m²');
  },
  function areaUnit(l) {
    const span = l === 0 ? 1 : ri(1, 2) + (l === 2 ? 1 : 0); let a, b; do { a = pick([0, 1, 2, 3, 6]); b = pick([0, 1, 2, 3, 6]); } while (a === b || Math.abs(a - b) > span + (a === 6 || b === 6 ? 3 : 0) || (l < 2 && (a === 6 || b === 6)));
    const v = nice(l === 2 ? 1 : l), r = conv(v, a, b, 2); if (!okR(r)) return G['5.2'][2](l);
    return nu(p('Convert: ' + sp(v) + ' ' + LEN[a] + '² = … ' + LEN[b] + '²'), r, 'For area units every step is × 100 or : 100 (1 m² = 100 dm²).', convSteps(v, a, b, 2));
  },
  function areHectare(l) {
    const k = ri(0, 3), v = pick([2, 3.5, 12, 0.4, 25, 150]);
    if (k === 0) return nu(p('How many m² is ' + v + ' ha (hectare)?'), rd(v * 10000), '1 ha = 1 hm² = 10 000 m².', v + ' × 10 000 = ' + sp(rd(v * 10000)) + ' m²');
    if (k === 1) return nu(p('How many m² is ' + v + ' a (are)?'), rd(v * 100), '1 a = 1 dam² = 100 m².', v + ' × 100 = ' + sp(rd(v * 100)) + ' m²');
    if (k === 2) { const m2 = pick([25000, 8000, 120000, 4500]); return nu(p('A field is ' + sp(m2) + ' m². How many hectares is that?'), rd(m2 / 10000), '1 ha = 10 000 m².', sp(m2) + ' : 10 000 = ' + sp(rd(m2 / 10000)) + ' ha'); }
    const L = ri(10, 30) * 10, W = ri(5, 20) * 10, A = L * W; return nu(p('A field is ' + L + ' m long and ' + W + ' m wide. Calculate the area in hectares.'), rd(A / 10000), 'First calculate the area in m². Then : 10 000.', L + ' × ' + W + ' = ' + sp(A) + ' m²<br>' + sp(A) + ' : 10 000 = ' + sp(rd(A / 10000)) + ' ha', { needStep: true });
  },
  function mixedPerimeter(l) {
    const parts = [[pick([250, 480, 975]), 'm', 3], [pick([1.25, 0.8, 2]), 'km', 6], [pick([5.25, 3.5, 12]), 'hm', 5], [pick([175, 60, 34]), 'dam', 4]];
    const sel = l === 0 ? parts.slice(0, 2) : parts, km = sel.map(q => conv(q[0], q[2], 6, 1)), tot = rd(km.reduce((a, b) => a + b, 0));
    return nu(p('A path has parts of ' + sel.map(q => sp(q[0]) + ' ' + q[1]).join(', ') + '. How many km is the path in total?'), tot, 'First write every length in km. Then add.', sel.map((q, i) => sp(q[0]) + ' ' + q[1] + ' = ' + sp(km[i]) + ' km').join('<br>') + '<br>total = ' + km.map(sp).join(' + ') + ' = ' + sp(tot) + ' km', { needStep: true });
  }
];
XG['5.2'] = [];

/* ======================= 5.3 Area of a triangle ======================= */
function triFig(b, h, off, lb, lh) {
  const s = Math.min(200 / b, 110 / h), W = b * s, H = h * s, x0 = 60, y0 = H + 20, ox = x0 + off * s;
  return svg(W + 70, H + 45, '<polygon points="' + x0 + ',' + y0 + ' ' + (x0 + W) + ',' + y0 + ' ' + ox + ',' + (y0 - H) + '" fill="rgba(27,95,168,.08)" stroke="#1b5fa8" stroke-width="2"/><line x1="' + ox + '" y1="' + (y0 - H) + '" x2="' + ox + '" y2="' + y0 + '" stroke="#d1471f" stroke-width="1.6" stroke-dasharray="5 4"/>' + txt(lb, x0 + W / 2, y0 + 17) + txt(lh, ox - 6, y0 - H / 2, 'end'));
}
G['5.3'] = [
  function triArea(l) {
    const b = ri(4, 20) + (l === 2 ? .5 : 0), h = ri(2, 14), A = rd(b * h / 2);
    return nu(p('A triangle has base ' + b + ' cm and height ' + h + ' cm. Calculate the area.') + triFig(b, h, b * .35, b + ' cm', h + ' cm'), A, 'area of a triangle = ½ × base × height.', '½ × ' + b + ' × ' + h + ' = ' + A + ' cm²', { needStep: true });
  },
  function rightTriArea(l) {
    if (l >= 2) {   // spicy: use the area twice to find the height on the long side
      const t = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]]), A = t[0] * t[1] / 2, h = rd(2 * A / t[2], 2);
      return nu(p('In triangle PQR the angle at P is 90°. PQ = ' + t[0] + ', PR = ' + t[1] + ' and QR = ' + t[2] + '. Calculate the <b>height from P</b> on side QR. <small>(Round to 2 decimals if needed.)</small>'), h, 'First calculate the area with PQ and PR. Then use the same area with base QR.', 'area = ½ × ' + t[0] + ' × ' + t[1] + ' = ' + A + '<br>½ × ' + t[2] + ' × h = ' + A + '<br>' + rd(t[2] / 2) + ' × h = ' + A + ' → h = ' + A + ' : ' + rd(t[2] / 2) + (rd(2 * A / t[2], 6) === h ? ' = ' : ' ≈ ') + h, { needStep: true, tol: .0051 });
    }
    const a = ri(3, 16), b = ri(3, 16), A = rd(a * b / 2);
    return nu(p('In triangle PQR the angle at P is 90°. PQ = ' + a + ' and PR = ' + b + '. Calculate the area.'), A, 'In a right-angled triangle the two sides next to the right angle are base and height.', 'area = ½ × PQ × PR = ½ × ' + a + ' × ' + b + ' = ' + A, { needStep: true });
  },
  function whichHeight(l) {
    const n = pick(['PQR', 'ABC', 'KLM']), V = n[0], legs = [n[0] + n[1], n[0] + n[2]], k = ri(0, 1), base = legs[k], right = legs[1 - k];
    return ch(p('In triangle ' + n + ' the angle at ' + V + ' is 90°. You take side ' + base + ' as the base. Which side is the height?'), right, [base, n[1] + n[2]], 'The height is perpendicular (at 90°) to the base and goes to the opposite vertex.', right + ' is perpendicular to ' + base + ', because the angle at ' + V + ' is 90°. So ' + right + ' is the height.');
  },
  function heightFromArea(l) {
    const b = ri(4, 16), h = ri(2, 12) + (l === 2 ? .5 : 0), A = rd(b * h / 2);
    return nu(p('A triangle has area ' + A + ' cm² and base ' + b + ' cm. Calculate the height.'), h, 'area = ½ × base × height. So ½ × ' + b + ' × height = ' + A + '.', '½ × ' + b + ' × height = ' + A + '<br>' + b / 2 + ' × height = ' + A + '<br>height = ' + A + ' : ' + b / 2 + ' = ' + h + ' cm', { needStep: true });
  }
];
XG['5.3'] = [
  function boxMethod(l) {
    let A, B, C, xs, ys, x0, x1, y0, y1;
    do { A = [0, ri(0, 3)]; B = [ri(5, 8), ri(0, 6)]; C = [ri(1, 6), ri(4, 7)]; xs = [A[0], B[0], C[0]]; ys = [A[1], B[1], C[1]]; x0 = Math.min(...xs); x1 = Math.max(...xs); y0 = Math.min(...ys); y1 = Math.max(...ys); }
    while (Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) < 4 || ![A, B, C].some(q => (q[0] === x0 || q[0] === x1) && (q[1] === y0 || q[1] === y1)));
    const box = (x1 - x0) * (y1 - y0), area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
    const tri = [[A, B], [B, C], [C, A]].map(e => [Math.abs(e[0][0] - e[1][0]), Math.abs(e[0][1] - e[1][1])]).filter(t => t[0] && t[1]), cut = rd(tri.reduce((s_, t) => s_ + t[0] * t[1] / 2, 0));
    if (cut !== box - area) return XG['5.3'][0](l);
    const fig = '<div style="max-width:260px">' + NX.gridSVG({ xmin: 0, xmax: 8, ymin: 0, ymax: 7, u: 26, noAxes: true, polys: [{ pts: [A, B, C], fill: 'rgba(27,95,168,.15)', stroke: '#1b5fa8' }] }) + '</div>';
    return nu(p('The vertices of the triangle are on grid points. Each square is 1 by 1. Calculate the area with the box method.') + fig, area, 'Draw a rectangle (box) around the triangle. Subtract the right-angled triangles around it.', 'box: ' + (x1 - x0) + ' × ' + (y1 - y0) + ' = ' + box + '<br>right-angled triangles around it: ' + tri.map(t => '½ × ' + t[0] + ' × ' + t[1] + ' = ' + rd(t[0] * t[1] / 2)).join(', ') + '<br>together: ' + cut + '<br>area = ' + box + ' − ' + cut + ' = ' + area, { needStep: true });
  }
];

/* ======================= 5.4 Circles ======================= */
G['5.4'] = [
  function circumference(l) {
    const giveD = Math.random() < .5, v = ri(2, 20) + (l === 2 ? .5 : 0), C = giveD ? Math.PI * v : 2 * Math.PI * v, r2 = rd(C, 2);
    return nu(p('A circle has ' + (giveD ? 'diameter' : 'radius') + ' ' + v + ' cm. Calculate the circumference. <small>(Round to 2 decimals.)</small>'), r2, 'circumference = π × diameter = 2 × π × radius.', (giveD ? 'π × ' + v : '2 × π × ' + v) + ' ≈ ' + r2 + ' cm', { tol: .0051 });
  },
  function circleArea(l) {
    const giveD = l > 0 && Math.random() < .5, v = ri(2, 15) * (giveD ? 2 : 1), r = giveD ? v / 2 : v, A = rd(Math.PI * r * r, 2);
    return nu(p('A circle has ' + (giveD ? 'diameter' : 'radius') + ' ' + v + ' m. Calculate the area. <small>(Round to 2 decimals.)</small>'), A, 'area = π × radius². ' + (giveD ? 'First halve the diameter.' : ''), (giveD ? p('radius = ' + v + ' : 2 = ' + r) : '') + p('π × ' + r + '² = π × ' + r * r + ' ≈ ' + A + ' m²'), { tol: .0051, needStep: true });
  },
  function exactPi(l) {
    const r = ri(2, 12), area = Math.random() < .5, right = area ? r * r + PI : 2 * r + PI;
    const wr = area ? [2 * r + PI, r * r * 2 + PI, r + PI] : [r * r + PI, r + PI, 4 * r + PI];
    if (l >= 2) {   // spicy: the diameter is given (and sometimes half a circle)
      const d = 2 * r, half = Math.random() < .4, A2 = r * r, R2 = half ? (A2 % 2 ? A2 + '/2' : A2 / 2) + PI : (area ? A2 + PI : d + PI);
      const W2 = half ? [A2 + PI, d * d / 2 + PI, r + PI] : area ? [d * d + PI, d + PI, 2 * d + PI] : [d * d + PI, r + PI, 2 * d + PI];
      return ch(p('A circle has <b>diameter</b> ' + d + '. What is the exact ' + (half ? 'area of <b>half</b> of the circle' : area ? 'area' : 'circumference') + '?'), R2, W2, 'First find the radius: half of the diameter.', 'r = ' + d + ' : 2 = ' + r + '<br>' + (half ? 'half the area = π × ' + r + '² : 2 = ' + A2 + PI + ' : 2 = ' + R2 : area ? 'π × ' + r + '² = ' + R2 : '2 × π × ' + r + ' = ' + R2));
    }
    return ch(p('A circle has radius ' + r + '. What is the exact ' + (area ? 'area' : 'circumference') + '?'), right, wr, area ? 'area = π × r². Write the answer with π.' : 'circumference = 2 × π × r. Write the answer with π.', area ? 'π × ' + r + '² = ' + r * r + PI : '2 × π × ' + r + ' = ' + 2 * r + PI);
  },
  function radiusBack(l) {
    const r = ri(2, 12), area = Math.random() < .5, give = area ? r * r + PI : 2 * r + PI;
    if (l >= 2) {   // spicy: a measured circumference or area, not a nice multiple of pi
      const C = rd(ri(150, 900) / 10, 1);
      if (area) { const Ar = rd(Math.PI * r * r, 1); return nu(p('The area of a circle is ' + Ar + ' cm² (rounded). Calculate the radius.'), r, 'π × r² = ' + Ar + '. First divide by π. Which number squared gives that?', 'π × r² = ' + Ar + '<br>r² = ' + Ar + ' : π ≈ ' + r * r + '<br>r = ' + r + ' cm, because ' + r + '² = ' + r * r, { tol: .051, needStep: true }); }
      const rr = rd(C / (2 * Math.PI), 1); return nu(p('The circumference of a round table is ' + C + ' cm. Calculate the radius. <small>(Round to 1 decimal.)</small>'), rr, '2 × π × r = ' + C + '. Divide by 2 × π.', '2 × π × r = ' + C + '<br>r = ' + C + ' : (2 × π) ≈ ' + rr + ' cm', { tol: .051, needStep: true });
    }
    return nu(p('The ' + (area ? 'area' : 'circumference') + ' of a circle is ' + give + '. Calculate the radius.'), r, area ? 'π × r² = ' + give + ', so r² = ' + r * r + '.' : '2 × π × r = ' + give + ', so 2r = ' + 2 * r + '.', area ? 'π × r² = ' + give + '<br>r² = ' + r * r + '<br>r = ' + r : '2 × π × r = ' + give + '<br>2r = ' + 2 * r + '<br>r = ' + r);
  }
];
XG['5.4'] = [
  function semicircle(l) {
    const d = ri(4, 20), Pm = rd(Math.PI * d / 2 + d, 2);
    return nu(p('A shape is half a circle with diameter ' + d + ' cm. Calculate the perimeter (the curved part and the straight part). <small>(Round to 2 decimals.)</small>'), Pm, 'Half the circumference plus the diameter.', '½ × π × ' + d + ' + ' + d + ' ≈ ' + rd(Math.PI * d / 2, 2) + ' + ' + d + ' ≈ ' + Pm + ' cm', { tol: .011 });
  },
  function ringArea(l) {
    const R = ri(5, 12), r = ri(2, R - 2), A = R * R - r * r;
    return ch(p('A ring is a circle with radius ' + R + ' with a hole of radius ' + r + ' in the middle. What is the exact area of the ring?'), A + PI, [(R - r) * (R - r) + PI, 2 * (R - r) + PI, (R * R + r * r) + PI], 'Area of the big circle minus area of the small circle.', 'π × ' + R + '² − π × ' + r + '² = ' + R * R + PI + ' − ' + r * r + PI + ' = ' + A + PI);
  },
  function compositeArea(l) {   // composite figures (test questions collection ch5, ex 13-14 and 17-19)
    const k = l === 1 ? pick([0, 2]) : pick([0, 1, 2]), S = 22, st = 'fill="rgba(27,95,168,.18)" stroke="#1b5fa8" stroke-width="2"';
    if (k === 0) {   // rectangle with a semicircle on the short side
      const W = 2 * ri(2, 6), L = W + 2 * ri(1, 4), r = W / 2, A = rd(L * W + Math.PI * r * r / 2, 2);
      const fig = svg(L * S + r * S + 100, W * S + 40, '<g transform="translate(45,0)">'+'<path d="M20 20 h' + L * S + ' a' + r * S + ' ' + r * S + ' 0 0 1 0 ' + W * S + ' h-' + L * S + ' z" ' + st + '/>' + txt(L + ' cm', 20 + L * S / 2, 15) + txt(W + ' cm', 15, 25 + W * S / 2, 'end') + '</g>');
      return nu(p('The figure is a rectangle of ' + L + ' cm by ' + W + ' cm with a half circle on one side. Calculate the area of the whole figure. <small>(Round to 2 decimals.)</small>') + fig, A,
        'Split the figure: a rectangle and half a circle. The diameter of the half circle is ' + W + ' cm.',
        p('rectangle: ' + L + ' × ' + W + ' = ' + L * W + ' cm²') + p('radius = ' + W + ' : 2 = ' + r + ' cm; half circle: ½ × π × ' + r + '² ≈ ' + rd(Math.PI * r * r / 2, 2) + ' cm²') + p('total ≈ ' + L * W + ' + ' + rd(Math.PI * r * r / 2, 2) + ' ≈ ' + A + ' cm²'), { tol: 0.011 });
    }
    if (k === 1) {   // square minus a quarter circle
      const a = ri(4, 10), A = rd(a * a - Math.PI * a * a / 4, 2);
      const fig = svg(a * S + 100, a * S + 40, '<g transform="translate(45,0)">'+'<path d="M20 20 h' + a * S + ' v' + a * S + ' a' + a * S + ' ' + a * S + ' 0 0 0 -' + a * S + ' -' + a * S + ' z" ' + st + '/><rect x="20" y="20" width="' + a * S + '" height="' + a * S + '" fill="none" stroke="#1b5fa8" stroke-width="1" stroke-dasharray="4 3"/>' + txt(a + ' cm', 20 + a * S / 2, 15) + '</g>');
      return nu(p('A square has sides of ' + a + ' cm. A quarter circle with radius ' + a + ' cm is cut out of it (see the figure). Calculate the area of the shaded part. <small>(Round to 2 decimals.)</small>') + fig, A,
        'Shaded part = square − quarter circle. A quarter circle is ¼ of a whole circle.',
        p('square: ' + a + ' × ' + a + ' = ' + a * a + ' cm²') + p('quarter circle: ¼ × π × ' + a + '² ≈ ' + rd(Math.PI * a * a / 4, 2) + ' cm²') + p('shaded ≈ ' + a * a + ' − ' + rd(Math.PI * a * a / 4, 2) + ' ≈ ' + A + ' cm²'), { tol: 0.011 });
    }
    const L = ri(6, 12), W = ri(4, 8), c = ri(2, L - 2), d = ri(2, W - 1), A = L * W - c * d / 2;   // rectangle with a corner triangle cut off
    const fig = svg(L * S + 100, W * S + 40, '<g transform="translate(45,0)">'+'<path d="M20 20 h' + (L - c) * S + ' l' + c * S + ' ' + d * S + ' v' + (W - d) * S + ' h-' + L * S + ' z" ' + st + '/><path d="M' + (20 + (L - c) * S) + ' 20 h' + c * S + ' v' + d * S + '" fill="none" stroke="#1b5fa8" stroke-dasharray="4 3"/>' + txt(L + ' cm', 20 + L * S / 2, W * S + 36) + txt(W + ' cm', 15, 25 + W * S / 2, 'end') + txt(c + ' cm', 20 + (L - c / 2) * S, 15) + txt(d + ' cm', L * S + 26, 25 + d * S / 2, 'start') + '</g>');
    return nu(p('A corner is cut off a rectangle of ' + L + ' cm by ' + W + ' cm (see the figure). The triangle that is cut off has sides of ' + c + ' cm and ' + d + ' cm next to the right angle. Calculate the area of the figure that is left.') + fig, A,
      'Area of the figure = rectangle − triangle.',
      p('rectangle: ' + L + ' × ' + W + ' = ' + L * W + ' cm²') + p('triangle: ½ × ' + c + ' × ' + d + ' = ' + c * d / 2 + ' cm²') + p('left: ' + L * W + ' − ' + c * d / 2 + ' = ' + A + ' cm²'));
  },
];

/* ======================= 5.5 Volume ======================= */
const VOL = ['mm³', 'cm³', 'dm³', 'm³'];
G['5.5'] = [
  function cubeVolume(l) {
    const s = l === 0 ? ri(2, 9) : ri(2, 12) + (l === 2 ? .5 : 0), V = rd(s * s * s);
    return nu(p('A cube has edges of ' + s + ' cm. Calculate the volume.'), V, 'volume of a cube = edge × edge × edge = edge³.', s + ' × ' + s + ' × ' + s + ' = ' + sp(V) + ' cm³', { needStep: true });
  },
  function cuboidVolume(l) {
    const a = ri(2, 20), b = ri(2, 15), c = ri(2, 12) + (l === 2 ? .5 : 0), V = rd(a * b * c);
    return nu(p('A box (cuboid) is ' + a + ' cm long, ' + b + ' cm wide and ' + c + ' cm high. Calculate the volume.'), V, 'volume = length × width × height.', a + ' × ' + b + ' × ' + c + ' = ' + sp(V) + ' cm³', { needStep: true });
  },
  function surfaceArea(l) {
    const a = ri(2, 10), b = ri(2, 8), c = ri(2, 8), S = 2 * (a * b + a * c + b * c);
    if (l >= 2) {   // spicy: a box without a lid
      const S2 = a * b + 2 * a * c + 2 * b * c;
      return nu(p('A box has the shape of a cuboid <b>without a lid</b>. The bottom is ' + a + ' cm by ' + b + ' cm, and the box is ' + c + ' cm high. How much cardboard (in cm²) do you need for the box?'), S2, 'Without a lid the box has only 5 faces: the bottom, the front and back, and two sides.', a + ' · ' + b + ' + 2 · ' + a + ' · ' + c + ' + 2 · ' + b + ' · ' + c + ' = ' + a * b + ' + ' + 2 * a * c + ' + ' + 2 * b * c + ' = ' + S2 + ' cm²', { needStep: true });
    }
    return nu(p('A cuboid is ' + a + ' cm by ' + b + ' cm by ' + c + ' cm. Calculate the total area of all its faces (the surface area).'), S, 'A cuboid has 6 faces: 2 on top and bottom, 2 at the front and back, 2 at the sides.', '2 · ' + a + ' · ' + b + ' + 2 · ' + a + ' · ' + c + ' + 2 · ' + b + ' · ' + c + ' = ' + 2 * a * b + ' + ' + 2 * a * c + ' + ' + 2 * b * c + ' = ' + S + ' cm²', { needStep: true });
  },
  function volumeUnit(l) {
    let a, b; do { a = ri(0, 3); b = ri(0, 3); } while (a === b || (l === 0 && Math.abs(a - b) > 1));
    const v = nice(l === 2 ? 1 : l), r = conv(v, a, b, 3); if (!okR(r)) return G['5.5'][3](l);
    return nu(p('Convert: ' + sp(v) + ' ' + VOL[a] + ' = … ' + VOL[b]), r, 'For volume units every step is × 1000 or : 1000 (1 m³ = 1000 dm³).', convSteps(v, a, b, 3));
  },
  function litres(l) {
    const k = ri(0, 3);
    if (k === 0) { const v = pick([2.5, 0.75, 12, 1.2, 0.33]); return nu(p('How many mL is ' + v + ' L?'), rd(v * 1000), '1 L = 1000 mL.', v + ' × 1000 = ' + sp(rd(v * 1000)) + ' mL'); }
    if (k === 1) { const v = pick([33, 50, 75, 150, 25]); return nu(p('How many L is ' + v + ' cL?'), rd(v / 100), '1 L = 100 cL.', v + ' : 100 = ' + rd(v / 100) + ' L'); }
    if (k === 2) { const a = ri(10, 60), b = ri(10, 40), c = ri(10, 40), V = a * b * c; return nu(p('An aquarium is ' + a + ' cm by ' + b + ' cm by ' + c + ' cm. How many litres of water fit in it?'), rd(V / 1000), 'First calculate the volume in cm³. 1 L = 1 dm³ = 1000 cm³.', a + ' × ' + b + ' × ' + c + ' = ' + sp(V) + ' cm³<br>' + sp(V) + ' : 1000 = ' + sp(rd(V / 1000)) + ' L', { needStep: true }); }
    const m3 = pick([1.5, 2, 0.8, 12]); return nu(p('How many litres is ' + m3 + ' m³?'), rd(m3 * 1000), '1 m³ = 1000 dm³ and 1 dm³ = 1 L.', m3 + ' × 1000 = ' + sp(rd(m3 * 1000)) + ' L');
  },
  function massUnit(l) {
    const U = [['mg', 0], ['g', 3], ['kg', 6], ['ton', 9]]; let a, b; do { a = ri(0, 3); b = ri(0, 3); } while (a === b || Math.abs(a - b) > (l === 0 ? 1 : 2));
    const v = nice(l === 2 ? 1 : l), r = rd(v * Math.pow(10, U[a][1] - U[b][1])); if (!okR(r)) return G['5.5'][5](l);
    return nu(p('Convert: ' + sp(v) + ' ' + U[a][0] + ' = … ' + U[b][0]), r, '1 ton = 1000 kg, 1 kg = 1000 g, 1 g = 1000 mg.', sp(v) + (a > b ? ' × ' : ' : ') + sp(Math.pow(10, Math.abs(U[a][1] - U[b][1]))) + ' = ' + sp(r) + ' ' + U[b][0]);
  }
];
XG['5.5'] = [
  function fillTime(l) {
    const a = ri(4, 10) * 10, b = ri(3, 8) * 10, c = ri(3, 6) * 10, V = a * b * c / 1000, f = pick([5, 8, 10, 12]), t = rd(V / f, 1);
    return nu(p('A tank is ' + a + ' cm by ' + b + ' cm by ' + c + ' cm. A tap fills ' + f + ' litres per minute. How many minutes does it take to fill the tank? <small>(Round to 1 decimal.)</small>'), t, 'Volume in cm³, then in litres (: 1000), then : ' + f + '.', a + ' × ' + b + ' × ' + c + ' = ' + sp(a * b * c) + ' cm³ = ' + sp(V) + ' L<br>' + sp(V) + ' : ' + f + (rd(V / f) === t ? ' = ' : ' ≈ ') + t + ' minutes', { tol: .051, needStep: true });
  }
];

/* ---------- extra challenge items (Extra spicy) ---------- */
XG['5.1'].push(function trainTimes(l) {
  const h0 = ri(6, 18), m0 = ri(0, 11) * 5, dur = ri(5, 40) * 5, v = pick([60, 72, 80, 90, 96, 120, 144]), km = rd(v * dur / 60, 1); if (!Number.isInteger(km * 2)) return trainTimes(l);
  const h1 = Math.floor((h0 * 60 + m0 + dur) / 60), m1 = (m0 + dur) % 60, tt = (h, m) => h + ':' + String(m).padStart(2, '0');
  return nu(p('A train leaves at ' + tt(h0, m0) + ' and arrives at ' + tt(h1, m1) + '. It travels ' + sp(km) + ' km. What is the average speed in <b>km/h</b>?'), v, 'First find the travel time. Write it in hours (as a decimal or a fraction).', 'travel time = ' + Math.floor(dur / 60) + ' h ' + dur % 60 + ' min = ' + dur + '/60 h<br>speed = ' + sp(km) + ' : ' + rd(dur / 60, 4) + ' = ' + v + ' km/h', { needStep: true, tol: .051 });
});
XG['5.2'] = [
  function tilesFloor(l) {
    const t = pick([20, 25, 30, 40, 50]), a = ri(8, 25) * t, b = ri(6, 20) * t, n = (a / t) * (b / t);
    return nu(p('A floor is ' + sp(a / 100) + ' m by ' + sp(b / 100) + ' m. You cover it with square tiles of ' + t + ' cm by ' + t + ' cm. How many tiles do you need?'), n, 'Write everything in cm. How many tiles fit along each side?', sp(a / 100) + ' m = ' + a + ' cm → ' + a + ' : ' + t + ' = ' + a / t + ' tiles<br>' + sp(b / 100) + ' m = ' + b + ' cm → ' + b / t + ' tiles<br>' + a / t + ' · ' + b / t + ' = ' + n + ' tiles', { needStep: true });
  },
  function paintWall(l) {
    const w = rd(ri(35, 70) / 10, 1), h = rd(ri(24, 30) / 10, 1), dw = .9, dh = 2.1, cov = pick([5, 6, 8, 10]), A = rd(w * h - dw * dh, 2), lit = Math.ceil(2 * A / cov - 1e-9);
    if (Number.isInteger(2 * A / cov)) return paintWall(l);
    return nu(p('A wall is ' + w + ' m wide and ' + h + ' m high. In the wall is a door of 0.9 m by 2.1 m. You paint the wall (not the door) <b>twice</b>: two layers of paint. One litre of paint covers ' + cov + ' m². Paint is sold in whole litres. How many litres do you need?'), lit, 'Area of the wall minus area of the door. Two layers: twice that area. Then divide by ' + cov + ' and round <b>up</b>.', 'wall: ' + w + ' · ' + h + ' = ' + rd(w * h, 2) + ' m²<br>door: 0.9 · 2.1 = 1.89 m²<br>paint: ' + rd(w * h, 2) + ' − 1.89 = ' + A + ' m²<br>two layers: 2 · ' + A + ' = ' + rd(2 * A, 2) + ' m²<br>' + rd(2 * A, 2) + ' : ' + cov + ' ≈ ' + rd(2 * A / cov, 2) + ' → ' + lit + ' litres', { needStep: true });
  }
];
XG['5.3'].push(function baseTimesHeight(l) {
  const h = ri(2, 10), k = pick([2, 3, 4]), b = k * h, A = b * h / 2; if (!Number.isInteger(A)) return baseTimesHeight(l);
  return nu(p('A triangle has an area of ' + A + ' cm². The base is ' + k + ' times as long as the height. How long is the <b>height</b>? <small>(Try some numbers if you need to.)</small>'), h, 'Area = ½ · base · height = ½ · ' + k + ' · height · height. So height · height = …', '½ · ' + k + 'h · h = ' + A + ' → h · h = ' + (2 * A / k) + '<br>h = ' + h + ' cm (check: base ' + b + ', ½ · ' + b + ' · ' + h + ' = ' + A + ')', { needStep: true });
});
XG['5.5'].push(function waterHeight(l) {
  const a = ri(4, 10) * 10, b = ri(3, 6) * 10, H = ri(4, 8) * 10, hh = ri(10, H / 10 * 10 - 5), V = a * b * hh / 1000; if (!Number.isInteger(V * 2)) return waterHeight(l);
  return nu(p('An aquarium is ' + a + ' cm long, ' + b + ' cm wide and ' + H + ' cm high. You pour in ' + sp(V) + ' litres of water. How high is the water in the aquarium (in cm)?'), hh, '1 litre = 1 dm³ = 1000 cm³. Volume = length · width · height of the water.', sp(V) + ' litres = ' + sp(V * 1000) + ' cm³<br>' + a + ' · ' + b + ' = ' + a * b + ' cm²<br>' + sp(V * 1000) + ' : ' + a * b + ' = ' + hh + ' cm', { needStep: true });
});

const SECTIONS = [
  { id: '5.1', title: '5.1 Length, time and speed', sub: 'Metric units, converting time, km/h and m/s' },
  { id: '5.2', title: '5.2 Perimeter and area', sub: 'Rectangles, area units, are and hectare' },
  { id: '5.3', title: '5.3 Area of a triangle', sub: '½ × base × height' },
  { id: '5.4', title: '5.4 Circles', sub: 'Circumference and area, with π' },
  { id: '5.5', title: '5.5 Volume', sub: 'Cube, cuboid, volume units, litres, mass' }
];
const GOALS = [
  ['5.1', 'I can convert units of length and time', ['lengthUnit', 'prefix', 'timeConvert'], 'mm – cm – dm – m – dam – hm – km: × 10 each step.'],
  ['5.1', 'I can calculate with speed', ['speedConvert', 'avgSpeed'], 'km/h : 3.6 = m/s'],
  ['5.2', 'I can calculate perimeter and area and convert area units', ['perimeterRect', 'areaRect', 'areaUnit', 'areHectare', 'mixedPerimeter'], 'Area units: × 100 each step.'],
  ['5.3', 'I can calculate the area of a triangle', ['triArea', 'rightTriArea', 'whichHeight', 'heightFromArea'], 'area = ½ × base × height'],
  ['5.4', 'I can calculate the circumference and area of a circle', ['circumference', 'circleArea', 'exactPi', 'radiusBack'], 'C = π × d, A = π × r²'],
  ['5.5', 'I can calculate volume and convert volume units', ['cubeVolume', 'cuboidVolume', 'surfaceArea', 'volumeUnit', 'litres', 'massUnit'], '1 dm³ = 1 L; volume units: × 1000 each step.']
];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "1HVT": [
      {"id": "D1", "title": "Lesson · 5.1 A Length, time and speed", "sub": "Thu 4 Mar · ex 1, 2, 5, 6, 7, 8, 9", "date": "2027-03-04", "gens": [["5.1", "lengthUnit"], ["5.1", "prefix"], ["5.1", "timeConvert"]], "xg": [["5.1", "runnerSpeed"]]},
      {"id": "D2", "title": "Lesson · 5.1 B Length, time and speed", "sub": "Fri 5 Mar · ex 10, 11, 14, 15, 16", "date": "2027-03-05", "gens": [["5.1", "lengthUnit"], ["5.1", "prefix"], ["5.1", "timeConvert"]], "xg": [["5.1", "runnerSpeed"]]},
      {"id": "D3", "title": "Lesson · 5.1 C Length, time and speed", "sub": "Tue 9 Mar · ex 18, 20, 21, 22, 23", "date": "2027-03-09", "gens": [["5.1", "timeConvert"], ["5.1", "speedConvert"], ["5.1", "avgSpeed"]], "xg": [["5.1", "runnerSpeed"]]},
      {"id": "D4", "title": "Lesson · 5.2 A Perimeter and area", "sub": "Thu 11 Mar · ex 27, 28, 30, 32, 33", "date": "2027-03-11", "gens": [["5.2", "perimeterRect"], ["5.2", "areaRect"], ["5.2", "areaUnit"]], "xg": []},
      {"id": "D5", "title": "Lesson · 5.2 B Perimeter and area", "sub": "Fri 12 Mar · ex 34, 36, 38, 39, 40", "date": "2027-03-12", "gens": [["5.2", "areaRect"], ["5.2", "areaUnit"], ["5.2", "areHectare"]], "xg": []},
      {"id": "D6", "title": "Lesson · 5.3 A Area of a triangle", "sub": "Tue 16 Mar · ex 46, 47, 48, 49, 50, 51", "date": "2027-03-16", "gens": [["5.3", "triArea"], ["5.3", "rightTriArea"], ["5.3", "whichHeight"]], "xg": [["5.3", "boxMethod"]]},
      {"id": "D7", "title": "Lesson · 5.3 B Area of a triangle", "sub": "Tue 30 Mar · ex 52, 53, 54, 55, 56", "date": "2027-03-30", "gens": [["5.3", "triArea"], ["5.3", "rightTriArea"], ["5.3", "whichHeight"]], "xg": [["5.3", "boxMethod"]]},
      {"id": "D8", "title": "Lesson · 5.4 Circles", "sub": "Wed 31 Mar · ex 61, 62, 63, 66, 67, 68", "date": "2027-03-31", "gens": [["5.4", "circumference"], ["5.4", "circleArea"], ["5.4", "exactPi"]], "xg": [["5.4", "semicircle"], ["5.4", "ringArea"]]},
      {"id": "D9", "title": "Lesson · 5.4 Circles + 5.5 Volume", "sub": "Thu 1 Apr · ex 69, 70, 72, 75, 76", "date": "2027-04-01", "gens": [["5.4", "circleArea"], ["5.4", "exactPi"], ["5.4", "radiusBack"], ["5.5", "cubeVolume"], ["5.5", "cuboidVolume"], ["5.5", "surfaceArea"], ["5.5", "volumeUnit"], ["5.5", "litres"], ["5.5", "massUnit"]], "xg": [["5.4", "semicircle"], ["5.4", "ringArea"], ["5.5", "fillTime"]]},
      {"id": "D10", "title": "Lesson · 5.5 Volume", "sub": "Fri 2 Apr · ex 77, 79, 80, 81, 82, 83", "date": "2027-04-02", "gens": [["5.5", "cuboidVolume"], ["5.5", "surfaceArea"], ["5.5", "volumeUnit"], ["5.5", "litres"], ["5.5", "massUnit"]], "xg": [["5.5", "fillTime"]]},
      {"id": "D11", "title": "Test prep · chapter 5", "sub": "Tue 6 Apr · ex 86, 87, 88", "date": "2027-04-06", "gens": [["5.1", "lengthUnit"], ["5.1", "prefix"], ["5.1", "timeConvert"], ["5.1", "speedConvert"], ["5.1", "avgSpeed"], ["5.2", "perimeterRect"], ["5.2", "areaRect"], ["5.2", "areaUnit"], ["5.2", "areHectare"], ["5.2", "mixedPerimeter"], ["5.3", "triArea"], ["5.3", "rightTriArea"], ["5.3", "whichHeight"], ["5.3", "heightFromArea"], ["5.4", "circumference"], ["5.4", "circleArea"], ["5.4", "exactPi"], ["5.4", "radiusBack"], ["5.5", "cubeVolume"], ["5.5", "cuboidVolume"], ["5.5", "surfaceArea"], ["5.5", "volumeUnit"], ["5.5", "litres"], ["5.5", "massUnit"]], "xg": [["5.1", "runnerSpeed"], ["5.3", "boxMethod"], ["5.4", "semicircle"], ["5.4", "ringArea"], ["5.5", "fillTime"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: [...new Set(o.gens.map(g => g[0]))].reduce((a, s) => a.concat((XG[s] || []).map(f => [s, f.name])), []) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-1hvt-ch5-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['prefix', 'lengthUnit', 'massUnit', 'areHectare', 'whichHeight', 'cubeVolume', 'areaRect'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
