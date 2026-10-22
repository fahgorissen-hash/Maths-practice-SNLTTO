const { ri, pick, shuffle, gcd, M } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const pt = (html, x, y, hint, steps, extra) => Object.assign({ type: 'point', ans: [x, y], html: html + p('<small>Type a point like (3, −2).</small>'), hint, steps, noStep: true }, extra || {});
const mu = (html, fields, ans, hint, steps, extra) => Object.assign({ type: 'multi', fields, ans, html, hint, steps, noStep: true }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
const rd = (x, d) => Math.round(x * Math.pow(10, d === undefined ? 6 : d)) / Math.pow(10, d === undefined ? 6 : d);
const must = (a, b) => { if (!(Math.abs(a - b) < 1e-6)) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const neg = n => (n < 0 ? '−' : '') + String(rd(Math.abs(n)));
const par = n => n < 0 ? '(' + neg(n) + ')' : neg(n);
const X = v => '<i>' + (v || 'x') + '</i>';
const Y = '<i>y</i>';
const P2 = (x, y) => '(' + neg(x) + ', ' + neg(y) + ')';
function poly(terms) {   // [[coef, 'x²'], [coef, 'x'], [coef, '']] -> "3x² − x + 2"
  let s = '';
  terms.forEach(t => { const c = rd(t[0]), v = t[1]; if (c === 0) return; const ab = Math.abs(c), body = v && ab === 1 ? v : neg(ab) + v; s += s === '' ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body; });
  return s === '' ? '0' : s;
}
const lin = (m, b) => poly([[m, X()], [b, '']]);
const quad = (a, b, c) => poly([[a, X() + '²'], [b, X()], [c, '']]);
const fx = (a, b, c) => x => a * x * x + b * x + c;
const sub = (a, b, c, x) => [[a, par(x) + '²'], [b, par(x)], [c, '']].filter(t => t[0] !== 0).map((t, i) => { const c_ = t[0]; const s = (Math.abs(c_) === 1 && t[1] ? '' : neg(Math.abs(c_)) + (t[1] ? ' · ' : '')) + t[1]; return (i === 0 ? (c_ < 0 ? '−' : '') : (c_ < 0 ? ' − ' : ' + ')) + s; }).join('');
const aq = (a, b, c) => [[a, '*x^2'], [b, '*x'], [c, '']].filter(t => rd(t[0]) !== 0).map(t => '(' + rd(t[0]) + ')' + t[1]).join('+') || '0';
const U = n => Math.abs(n) + (Math.abs(n) === 1 ? ' unit' : ' units');
const svgWrap = (h, px) => '<div style="max-width:' + (px || 320) + 'px">' + h + '</div>';
/* a curve as many short segments, for gridSVG */
function curve(f, xmin, xmax, ymin, ymax, color, step) {
  const segs = []; step = step || 0.1; let prev = null;
  for (let x = xmin; x <= xmax + 1e-9; x += step) { const y = f(x); const ok = isFinite(y) && y >= ymin - 1 && y <= ymax + 1; if (ok && prev) segs.push({ a: prev, b: [x, y], color: color || '#d1471f' }); prev = ok ? [x, y] : null; }
  return segs;
}
const grid = (o, px) => svgWrap(NX.gridSVG(Object.assign({ u: 18 }, o)), px || 320);
const lineSeg = (m, b, r, color) => { const c = NX.clipLine([0, b], [1, m], -r, r, -r, r); return c ? [{ a: c.a, b: c.b, color: color || '#1b5fa8' }] : []; };

/* ======================= 3.1 Linear relationships ======================= */
G['3.1'] = [
  function axisPoints(l) {
    let m, b; do { m = l === 0 ? nz(-5, 5) : pick([-4, -3, -2, -0.5, 0.5, 2, 3, 4, 5, 1.5]); b = l === 0 ? m * nz(-5, 5) : nz(-12, 12); } while (!Number.isInteger(rd(-b / m * 100, 6)) || b === 0);
    const x0 = rd(-b / m), which = pick(['x', 'y']), f = Math.random() < .5 ? lin(m, b) : poly([[b, ''], [m, X()]]);
    if (which === 'y') return pt(p('Where does the graph of ' + Y + ' = ' + f + ' intersect the <b>' + X('y') + '-axis</b>?'), 0, b, 'On the ' + X('y') + '-axis ' + X() + ' = 0.', p(X() + ' = 0 gives ' + Y + ' = ' + b + '.') + p('The point of intersection is ' + P2(0, b) + '.'));
    return pt(p('Where does the graph of ' + Y + ' = ' + f + ' intersect the <b>' + X() + '-axis</b>?'), x0, 0, 'On the ' + X() + '-axis ' + Y + ' = 0. Solve ' + f + ' = 0.', p(f + ' = 0 gives ' + neg(m) + X() + ' = ' + neg(-b) + ', so ' + X() + ' = ' + neg(-b) + ' : ' + par(m) + ' = ' + neg(x0) + '.') + p('The point of intersection is ' + P2(x0, 0) + '.'));
  },
  function gradientTwoPoints(l) {
    let x1, y1, x2, y2; do { x1 = ri(-8, 8); x2 = ri(-8, 8); y1 = ri(-10, 10); y2 = ri(-10, 10); } while (x1 === x2 || (l < 2 && (y2 - y1) % (x2 - x1) !== 0) || (l === 2 && !Number.isInteger(rd((y2 - y1) / (x2 - x1) * 100, 6))));
    const m = (y2 - y1) / (x2 - x1);
    return nu(p('A line passes through A' + P2(x1, y1) + ' and B' + P2(x2, y2) + '. Calculate the gradient ' + X('m') + '.'), rd(m), X('m') + ' = Δ' + X('y') + ' / Δ' + X() + ' = (' + X('y') + '<sub>B</sub> − ' + X('y') + '<sub>A</sub>) / (' + X() + '<sub>B</sub> − ' + X() + '<sub>A</sub>).', X('m') + ' = (' + neg(y2) + ' − ' + par(y1) + ') / (' + neg(x2) + ' − ' + par(x1) + ') = ' + neg(y2 - y1) + ' / ' + neg(x2 - x1) + ' = ' + neg(m));
  },
  function lineTwoPoints(l) {
    let x1, y1, x2, y2, m; do { x1 = ri(-6, 8); x2 = ri(-6, 10); m = l === 0 ? nz(-4, 4) : pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3, 1.5, -1.5, 0.25]); y1 = ri(-10, 10); y2 = y1 + m * (x2 - x1); } while (x1 === x2 || !Number.isInteger(y2) || Math.abs(y2) > 30);
    const b = rd(y1 - m * x1);
    return mu(p('Find the formula ' + Y + ' = ' + X('m') + X() + ' + ' + X('b') + ' of the line through ' + P2(x1, y1) + ' and ' + P2(x2, y2) + '.'), ['m =', 'b ='], [m, b], 'First the gradient ' + X('m') + ' = Δ' + X('y') + ' / Δ' + X() + '. Then substitute one point to find ' + X('b') + '.', p(X('m') + ' = (' + neg(y2) + ' − ' + par(y1) + ') / (' + neg(x2) + ' − ' + par(x1) + ') = ' + neg(y2 - y1) + ' / ' + neg(x2 - x1) + ' = ' + neg(m)) + p('Substitute ' + P2(x1, y1) + ': ' + neg(y1) + ' = ' + neg(m) + ' · ' + par(x1) + ' + ' + X('b') + ', so ' + X('b') + ' = ' + neg(y1) + ' − ' + par(rd(m * x1)) + ' = ' + neg(b) + '.') + p('The formula is ' + Y + ' = ' + lin(m, b) + '.'), { ansText: Y + ' = ' + lin(m, b) });
  },
  function parallelThrough(l) {
    const m = l === 0 ? nz(-5, 5) : pick([-3, -2, -0.5, 0.5, 2, 3, -0.25, 1.5]), c = nz(-9, 9); let x0, y0, b; do { x0 = ri(-8, 8); y0 = ri(-10, 10); b = rd(y0 - m * x0); } while (b === c || !Number.isInteger(b * 4));
    return nu(p('Line ' + X('l') + ' is parallel to ' + Y + ' = ' + lin(m, c) + ' and passes through ' + P2(x0, y0) + '. The formula of ' + X('l') + ' is ' + Y + ' = ' + neg(m) + X() + ' + ' + X('b') + '. Calculate ' + X('b') + '.'), b, 'Parallel lines have the same gradient. Substitute the point to find ' + X('b') + '.', p('Parallel, so ' + X('m') + ' = ' + neg(m) + '.') + p(neg(y0) + ' = ' + neg(m) + ' · ' + par(x0) + ' + ' + X('b') + ', so ' + X('b') + ' = ' + neg(y0) + ' − ' + par(rd(m * x0)) + ' = ' + neg(b)), { noStep: true });
  },
  function lineFromGraph(l) {
    let m, b, x1, x2; do { m = pick(l === 0 ? [-2, -1, 1, 2, 3] : [-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 1 / 3, -1 / 3]); b = ri(-5, 5); x1 = pick([-6, -4, -3, -2, 0]); x2 = x1 + (Math.abs(m) < 1 ? 6 : Math.abs(m) === 1.5 ? 4 : 2); } while (!Number.isInteger(rd(m * x1 + b)) || !Number.isInteger(rd(m * x2 + b)) || Math.abs(m * x1 + b) > 7 || Math.abs(m * x2 + b) > 7);
    const y1 = rd(m * x1 + b), y2 = rd(m * x2 + b), mm = rd(m, 4);
    return mu(p('The graph shows a line through two grid points. Give its formula ' + Y + ' = ' + X('m') + X() + ' + ' + X('b') + '. <small>(Round ' + X('m') + ' to 2 decimals if needed.)</small>') + grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, segs: lineSeg(m, b, 8), pts: [{ x: x1, y: y1 }, { x: x2, y: y2 }] }), ['m =', 'b ='], [rd(m, 2), b], 'Read two grid points. ' + X('m') + ' = Δ' + X('y') + ' / Δ' + X() + '. ' + X('b') + ' is where the line crosses the ' + X('y') + '-axis.', p('Points ' + P2(x1, y1) + ' and ' + P2(x2, y2) + '.') + p(X('m') + ' = ' + neg(y2 - y1) + ' / ' + neg(x2 - x1) + (rd(mm, 2) === mm ? ' = ' : ' ≈ ') + neg(rd(mm, 2))) + p('The line crosses the ' + X('y') + '-axis at ' + P2(0, b) + ', so ' + X('b') + ' = ' + neg(b) + '.'), { tol: .006, ansText: X('m') + ' = ' + neg(rd(m, 2)) + ', ' + X('b') + ' = ' + neg(b) });
  },
  function verticalLine(l) {
    const a = nz(-7, 7), b1 = ri(-6, 6), b2 = b1 + ri(1, 6), vert = Math.random() < .5;
    const A = vert ? [a, b1] : [b1, a], B = vert ? [a, b2] : [b2, a], right = vert ? X() + ' = ' + neg(a) : Y + ' = ' + neg(a);
    return ch(p('Which equation belongs to the line through ' + P2(A[0], A[1]) + ' and ' + P2(B[0], B[1]) + '?'), right, [vert ? Y + ' = ' + neg(a) : X() + ' = ' + neg(a), Y + ' = ' + neg(a) + X(), Y + ' = ' + X() + ' + ' + neg(a)].filter(o => o !== right), 'Look at which coordinate stays the same.', vert ? 'The ' + X() + '-coordinate is ' + neg(a) + ' for both points: a vertical line, ' + right + '.' : 'The ' + X('y') + '-coordinate is ' + neg(a) + ' for both points: a horizontal line, ' + right + '. The gradient is 0.');
  }
];
XG['3.1'] = [
  function tankDrain(l) {
    const V0 = pick([600, 800, 1000, 1200, 1500]), r = pick([25, 40, 50, 60, 75]), t = rd(V0 / r, 2);
    return nu(p('A tank holds ' + V0 + ' litres of water. Every hour ' + r + ' litres run out. The formula is ' + X('V') + ' = ' + V0 + ' − ' + r + X('t') + '. After how many hours is the tank empty? <small>(Round to 2 decimals.)</small>'), t, 'Empty means ' + X('V') + ' = 0. Solve ' + V0 + ' − ' + r + X('t') + ' = 0.', V0 + ' − ' + r + X('t') + ' = 0 gives ' + r + X('t') + ' = ' + V0 + ', so ' + X('t') + ' = ' + V0 + ' : ' + r + ' ≈ ' + t + ' hours.', { noStep: true, tol: .006 });
  },
  function shoeSize(l) {
    const a1 = 38, a2 = 46, u1 = 5, u2 = 11, m = (u2 - u1) / (a2 - a1), b = u1 - m * a1, eu = pick([40, 42, 43, 44]);
    return nu(p('A UK shoe size depends linearly on the EU shoe size. EU 38 is UK 5 and EU 46 is UK 11. Which UK size belongs to EU ' + eu + '?'), rd(m * eu + b, 2), 'Make the formula ' + X('UK') + ' = ' + X('m') + ' · ' + X('EU') + ' + ' + X('b') + ' first.', p(X('m') + ' = (11 − 5) / (46 − 38) = 6/8 = 0.75') + p('5 = 0.75 · 38 + ' + X('b') + ', so ' + X('b') + ' = 5 − 28.5 = −23.5') + p(X('UK') + ' = 0.75 · ' + eu + ' − 23.5 = ' + rd(m * eu + b, 2)), { tol: .01 });
  }
];

/* ======================= 3.2 Quadratic relationships ======================= */
const vtxNice = l => { let a, b, c; do { a = l === 0 ? pick([1, -1]) : pick([1, -1, 2, -2, 3, 0.5]); const xv = l === 2 ? nz(-8, 8) / 2 : nz(-5, 5); b = rd(-2 * a * xv); c = ri(-10, 10); } while (!Number.isInteger(b * 2)); return [a, b, c]; };
G['3.2'] = [
  function readABC(l) {
    let a, b, c; do { a = pick([1, -1, 2, -3, 0.5, -7, 4]); b = ri(-8, 8); c = ri(-12, 12); } while (b === 0 && c === 0);
    const terms = shuffle([[a, X() + '²'], [b, X()], [c, '']].filter(t => t[0] !== 0));
    return mu(p('The formula ' + Y + ' = ' + poly(terms) + ' has the form ' + Y + ' = ' + X('a') + X() + '² + ' + X('b') + X() + ' + ' + X('c') + '. What are ' + X('a') + ', ' + X('b') + ' and ' + X('c') + '?'), ['a =', 'b =', 'c ='], [a, b, c], X('a') + ' belongs to ' + X() + '², ' + X('b') + ' to ' + X() + ' and ' + X('c') + ' is the number without ' + X() + '. A missing term means 0.', p(Y + ' = ' + quad(a, b, c)) + p(X('a') + ' = ' + neg(a) + ', ' + X('b') + ' = ' + neg(b) + ' and ' + X('c') + ' = ' + neg(c)), { ansText: X('a') + ' = ' + neg(a) + ', ' + X('b') + ' = ' + neg(b) + ', ' + X('c') + ' = ' + neg(c) });
  },
  function maxOrMin(l) {
    const a = pick([3, 2, 0.5, 0.01, -1, -4, -0.2, -3]), b = ri(-6, 6), c = ri(-9, 9), up = a > 0;
    const right = up ? 'opens upwards, so it has a lowest point (minimum)' : 'opens downwards, so it has a highest point (maximum)';
    return ch(p('What do you know about the graph of ' + Y + ' = ' + quad(a, b, c) + '?'), right, ['opens upwards, so it has a highest point (maximum)', 'opens downwards, so it has a lowest point (minimum)', up ? 'opens downwards, so it has a highest point (maximum)' : 'opens upwards, so it has a lowest point (minimum)'], 'Look at the sign of ' + X('a') + ', the number in front of ' + X() + '².', X('a') + ' = ' + neg(a) + (up ? ' > 0' : ' < 0') + ', so the parabola ' + right + '.');
  },
  function valueAt(l) {
    const [a, b, c] = l === 0 ? [pick([1, 2, -1]), ri(-5, 5), ri(-9, 9)] : [pick([-4, -2, 3, 0.5, -1]), ri(-6, 6), ri(-12, 12)], x = l === 0 ? ri(-3, 4) : nz(-5, 6), y = rd(fx(a, b, c)(x));
    const parts = [[a, a * x * x], [b, b * x], [c, c]].filter(t => t[0] !== 0).map(t => t[1]);
    return nu(p('Calculate ' + Y + ' for ' + X() + ' = ' + neg(x) + ' if ' + Y + ' = ' + quad(a, b, c) + '.'), y, 'Put ' + X() + ' = ' + par(x) + ' in brackets. Square first.', Y + ' = ' + sub(a, b, c, x) + ' = ' + parts.map((v, i) => i === 0 ? neg(v) : (v < 0 ? ' − ' : ' + ') + neg(Math.abs(v))).join('') + ' = ' + neg(y));
  },
  function vertexAbc(l) {
    const [a, b, c] = vtxNice(l), xv = rd(-b / (2 * a)), yv = rd(fx(a, b, c)(xv));
    return pt(p('Calculate the coordinates of the vertex of the graph of ' + Y + ' = ' + quad(a, b, c) + '.'), xv, yv, X() + '<sub>vertex</sub> = −' + X('b') + ' / 2' + X('a') + '. Then substitute to find ' + Y + '<sub>vertex</sub>.', p(X() + '<sub>vertex</sub> = −' + par(b) + ' / (2 · ' + par(a) + ') = ' + neg(xv)) + p(Y + '<sub>vertex</sub> = ' + sub(a, b, c, xv) + ' = ' + neg(yv)) + p('The vertex is ' + P2(xv, yv) + '.'));
  },
  function factoredZeros(l) {
    const a = l === 0 ? 1 : pick([2, 3, -1, -2, 0.5]); let r1, r2; do { r1 = ri(-9, 9); r2 = ri(-9, 9); } while (r1 === r2);
    const f = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '(' + lin(1, -r1) + ')(' + lin(1, -r2) + ')', rs = [r1, r2].sort((u, v) => u - v);
    return mu(p('Where does the graph of ' + Y + ' = ' + f + ' intersect the ' + X() + '-axis? Give both ' + X() + '-coordinates.') + p('<small>Type the smallest first.</small>'), ['smallest x =', 'largest x ='], rs, 'A product is 0 when one of the factors is 0.', p(f + ' = 0') + p(lin(1, -r1) + ' = 0 or ' + lin(1, -r2) + ' = 0') + p(X() + ' = ' + neg(r1) + ' or ' + X() + ' = ' + neg(r2)), { ansText: X() + ' = ' + neg(rs[0]) + ' and ' + X() + ' = ' + neg(rs[1]) });
  },
  function factoredVertex(l) {
    const a = l === 0 ? pick([1, -1]) : pick([2, 3, -1, -2, 0.5, -3]); let r1, r2; do { r1 = ri(-9, 9); r2 = ri(-9, 9); } while (r1 === r2 || (l < 2 && (r1 + r2) % 2 !== 0));
    const xv = (r1 + r2) / 2, yv = rd(a * (xv - r1) * (xv - r2)), f = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '(' + lin(1, -r1) + ')(' + lin(1, -r2) + ')';
    return pt(p('Calculate the vertex of the graph of ' + Y + ' = ' + f + '.'), xv, yv, 'The graph crosses the ' + X() + '-axis at ' + X() + ' = ' + neg(r1) + ' and ' + X() + ' = ' + neg(r2) + '. The vertex is exactly in the middle.', p(X() + '<sub>vertex</sub> = (' + neg(r1) + ' + ' + par(r2) + ') / 2 = ' + neg(xv)) + p(Y + '<sub>vertex</sub> = ' + (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '(' + neg(xv) + ' − ' + par(r1) + ')(' + neg(xv) + ' − ' + par(r2) + ') = ' + neg(yv)) + p('The vertex is ' + P2(xv, yv) + '.'));
  },
  function interceptCount(l) {
    const a = pick([3.5, 2, 1, 0.5, -0.01, -1, -2, 25]), pp = nz(-9, 9), q = pick([-8, -5, -2, 0, 3, 7, 1]), up = a > 0;
    const n = q === 0 ? 1 : (up && q < 0) || (!up && q > 0) ? 2 : 0, f = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '(' + lin(1, -pp) + ')²' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '');
    const right = n === 0 ? 'no points' : n === 1 ? 'one point' : 'two points';
    return ch(p('The graph of ' + Y + ' = ' + f + ' has vertex ' + P2(pp, q) + '. In how many points does it intersect the ' + X() + '-axis?'), right, ['no points', 'one point', 'two points'].filter(o => o !== right), 'Opens it upwards or downwards? Is the vertex above, on or below the ' + X() + '-axis?', 'The parabola opens ' + (up ? 'upwards' : 'downwards') + ' (' + X('a') + ' = ' + neg(a) + ') and the vertex ' + P2(pp, q) + ' lies ' + (q === 0 ? 'on' : q > 0 ? 'above' : 'below') + ' the ' + X() + '-axis, so ' + right + '.');
  }
];
XG['3.2'] = [
  function symmetryPartner(l) {
    const s = nz(-6, 8), d = ri(1, 9), y0 = ri(-15, 15), x1 = s - d;
    return pt(p('A parabola has line of symmetry ' + X() + ' = ' + neg(s) + '. Point ' + P2(x1, y0) + ' lies on the graph. Which other point on the graph has the same height?'), s + d, y0, 'The line of symmetry is exactly in the middle of the two points.', p(P2(x1, y0) + ' is ' + d + ' to the left of ' + X() + ' = ' + neg(s) + '.') + p('The other point is ' + d + ' to the right: ' + X() + ' = ' + neg(s) + ' + ' + d + ' = ' + neg(s + d) + '. The point is ' + P2(s + d, y0) + '.'));
  },
  function cannonball(l) {
    const D = pick([60, 80, 100, 120]), k = pick([0.01, 0.02, 0.005]), xv = D / 2, h = rd(k * xv * (D - xv));
    return nu(p('A cannonball follows ' + X('h') + ' = ' + k + X('d') + '(' + D + ' − ' + X('d') + '), with ' + X('d') + ' the distance and ' + X('h') + ' the height in metres. How high does the cannonball get?'), h, 'The ball is at ' + X('h') + ' = 0 for ' + X('d') + ' = 0 and ' + X('d') + ' = ' + D + '. The top is in the middle.', p(X('d') + '<sub>top</sub> = (0 + ' + D + ') / 2 = ' + xv) + p(X('h') + ' = ' + k + ' · ' + xv + ' · (' + D + ' − ' + xv + ') = ' + h + ' m'));
  }
];

/* ======================= 3.3 Other relationships ======================= */
G['3.3'] = [
  function isDirect(l) {
    const k = nz(-6, 9), c = nz(-5, 5), kind = pick(['yes1', 'yes2', 'no']);
    let f, right, st;
    if (kind === 'yes1') { const a = nz(2, 5), b = ri(1, 4); f = a + '(' + lin(b, -c) + ') + ' + neg(a * c).replace('−', '− '); right = 'Yes, with constant ' + neg(a * b); st = Y + ' = ' + lin(a * b, -a * c) + ' + ' + neg(a * c) + ' = ' + neg(a * b) + X() + '. This has the form ' + Y + ' = ' + X('k') + X() + '.'; f = a + '(' + lin(b, -c) + ')' + (a * c < 0 ? ' − ' : ' + ') + Math.abs(a * c); }
    else if (kind === 'yes2') { const a = nz(-7, 7), b = nz(-5, 5); if (a + b === 0) return G['3.3'][0](l); f = poly([[a, X()], [b, X()]]); right = 'Yes, with constant ' + neg(a + b); st = Y + ' = ' + neg(a + b) + X() + ', the form ' + Y + ' = ' + X('k') + X() + '.'; }
    else { f = lin(k, c); right = 'No, it is not directly proportional'; st = 'There is a constant term ' + neg(c) + ', so the graph does not pass through (0, 0). Not directly proportional.'; }
    const wr = ['No, it is not directly proportional', 'Yes, with constant ' + neg(k), 'Yes, with constant ' + neg(k + 1), 'Yes, with constant ' + neg(c)].filter(o => o !== right);
    return ch(p('Is ' + Y + ' = ' + f + ' a directly proportional relationship? If so, what is the constant of proportionality?'), right, wr.slice(0, 3), 'Simplify the formula. Directly proportional means ' + Y + ' = ' + X('k') + X() + ' (no extra number).', st);
  },
  function inverseTable(l) {
    const k = pick([12, 18, 24, 36, 60, 100, 225, 10]), xs = []; for (let d = 1; d <= k && xs.length < 6; d++) if (k % d === 0) xs.push(d);
    const pick4 = shuffle(xs).slice(0, 4).sort((a, b) => a - b), miss = ri(0, 3), ys = pick4.map(x => k / x);
    return nu(p(X('x') + ' and ' + Y + ' are inversely proportional. Calculate the missing value.') + '<table class="tbl"><tr><th>' + X() + '</th>' + pick4.map(x => '<td>' + x + '</td>').join('') + '</tr><tr><th>' + Y + '</th>' + ys.map((y, i) => '<td>' + (i === miss ? '?' : y) + '</td>').join('') + '</tr></table>', ys[miss], 'Inversely proportional: ' + X() + ' · ' + Y + ' is always the same number ' + X('k') + '.', p(X('k') + ' = ' + pick4[(miss + 1) % 4] + ' · ' + ys[(miss + 1) % 4] + ' = ' + k) + p('? = ' + k + ' : ' + pick4[miss] + ' = ' + ys[miss]));
  },
  function inverseFormula(l) {
    const k = pick([10, 12, 20, 24, 36, 48, 225, 0.6]), x0 = pick([2, 4, 5, 0.5, 10]), y0 = rd(k / x0), x1 = pick([3, 8, 6, 1.5, 0.1]), y1 = rd(k / x1, 4);
    return nu(p(X('y') + ' is inversely proportional to ' + X() + '. For ' + X() + ' = ' + x0 + ' you get ' + Y + ' = ' + y0 + '. Calculate ' + Y + ' for ' + X() + ' = ' + x1 + '. <small>(Round to 2 decimals if needed.)</small>'), rd(y1, 2), 'First ' + X('k') + ' = ' + X() + ' · ' + Y + '. The formula is ' + Y + ' = ' + X('k') + ' / ' + X() + '.', p(X('k') + ' = ' + x0 + ' · ' + y0 + ' = ' + k) + p(Y + ' = ' + k + ' / ' + x1 + (Number.isInteger(y1 * 100) ? ' = ' : ' ≈ ') + rd(y1, 2)), { tol: .006, needStep: true });
  },
  function whichRelation(l) {
    const R = [['linear', () => Y + ' = ' + lin(nz(-5, 5), nz(-9, 9))], ['directly proportional', () => Y + ' = ' + neg(nz(-9, 9)) + X()], ['inversely proportional', () => Y + ' = ' + ri(2, 30) + ' / ' + X()], ['quadratic', () => Y + ' = ' + quad(nz(-3, 3), ri(-6, 6), ri(-9, 9))], ['square root', () => Y + ' = √(' + lin(1, -ri(1, 9)) + ')' + ' + ' + ri(1, 5)]];
    const r = pick(R), right = r[0];
    return ch(p('What kind of relationship is ' + r[1]() + '?'), right, shuffle(R.map(x => x[0]).filter(x => x !== right)).slice(0, 3), 'Look at the form: ' + X() + ' in a square root, ' + X() + '², ' + X() + ' in the denominator, or only ' + X() + '.', 'The formula is ' + right + '.');
  },
  function sqrtStart(l) {
    const a = ri(-6, 9), b = ri(-5, 5), f = '√(' + lin(1, -a) + ')' + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '');
    return pt(p('What is the starting point of the graph of ' + Y + ' = ' + f + '?'), a, b, 'The graph starts where the number under the root is 0.', p(lin(1, -a) + ' = 0 gives ' + X() + ' = ' + neg(a) + '.') + p(Y + ' = √0' + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = ' + neg(b) + '. The starting point is ' + P2(a, b) + '.'));
  },
  function sqrtValue(l) {
    const a = ri(-5, 9), b = ri(-6, 6), s = ri(0, 7), x = a + s * s, f = '√(' + lin(1, -a) + ')' + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '');
    return nu(p('Calculate ' + Y + ' for ' + X() + ' = ' + neg(x) + ' if ' + Y + ' = ' + f + '.'), s + b, 'First the number under the root, then the root.', Y + ' = √(' + neg(x) + ' − ' + par(a) + ')' + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = √' + s * s + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = ' + s + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = ' + neg(s + b));
  }
];
XG['3.3'] = [
  function tsunami(l) {
    const d = pick([1000, 2500, 3300, 4000]), v = rd(Math.sqrt(9.8 * d), 0);
    return nu(p('The speed of a tsunami is ' + X('v') + ' = √(9.8' + X('d') + '), with ' + X('d') + ' the depth of the sea in metres and ' + X('v') + ' in m/s. Calculate the speed at a depth of ' + d + ' m. Round to whole m/s.'), v, 'Substitute ' + X('d') + ' = ' + d + '.', X('v') + ' = √(9.8 · ' + d + ') = √' + rd(9.8 * d) + ' ≈ ' + v + ' m/s', { tol: .51 });
  },
  function skateTour(l) {
    const v0 = pick([20, 25, 16]), t0 = pick([10, 8, 12]), dist = v0 * t0, t1 = pick([5, 16, 20]), v1 = rd(dist / t1, 2);
    return nu(p('Skating a tour at ' + v0 + ' km/h takes ' + t0 + ' hours. Time and speed are inversely proportional. What average speed (km/h) do you need to do the tour in ' + t1 + ' hours?'), v1, 'speed · time = the length of the tour, always the same.', p('length = ' + v0 + ' · ' + t0 + ' = ' + dist + ' km') + p(X('v') + ' = ' + dist + ' / ' + t1 + ' = ' + v1 + ' km/h'), { tol: .01 });
  }
];

/* ======================= 3.4 Transformations ======================= */
G['3.4'] = [
  function shiftUp(l) {
    const a = pick([0.5, 1, 2, -1, 3]), b = l === 0 ? 0 : ri(-4, 4), c = ri(-6, 6), k = nz(-9, 9);
    return ex(p('The graph of ' + Y + ' = ' + quad(a, b, c) + ' is translated ' + U(k) + ' ' + (k > 0 ? 'up' : 'down') + '. Give the new formula. <small>Type only the right side, like 0.5x^2 + 3.</small>'), aq(a, b, c + k), 'poly', 'Up: add to the formula. Down: subtract.', Y + ' = ' + quad(a, b, c) + (k > 0 ? ' + ' : ' − ') + Math.abs(k) + ' = ' + quad(a, b, c + k), { keys: ['^', '(', ')'], ansText: Y + ' = ' + quad(a, b, c + k) });
  },
  function shiftRight(l) {
    const a = pick([1, 2, 3, -1, 0.5]), h = nz(-6, 6), q = l === 0 ? 0 : ri(-6, 6);
    const base = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + X() + '²' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : ''), res = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '(' + lin(1, -h) + ')²' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '');
    return ex(p('The graph of ' + Y + ' = ' + base + ' is translated ' + U(h) + ' to the ' + (h > 0 ? 'right' : 'left') + '. Give the new formula. <small>Type only the right side, like 2(x − 3)^2 + 1.</small>'), a + '*(x-(' + h + '))^2+(' + q + ')', null, 'To the right: replace ' + X() + ' by (' + X() + ' − number). To the left: (' + X() + ' + number).', Y + ' = ' + res, { keys: ['^', '(', ')'], ansText: Y + ' = ' + res });
  },
  function multiplyX(l) {
    const a = pick([0.5, 1, 2, -1]), b = ri(-4, 4), c = ri(-6, 6), k = pick([2, 3, 4, 5, -1, -2, -4, 0.5]);
    return ex(p('The graph of ' + Y + ' = ' + quad(a, b, c) + ' is multiplied by ' + neg(k) + ' with respect to the ' + X() + '-axis. Give the new formula without brackets. <small>Type only the right side.</small>'), aq(a * k, b * k, c * k), 'poly', 'Multiply the whole formula by ' + neg(k) + ': every ' + Y + '-value becomes ' + neg(k) + ' times as big.', Y + ' = ' + neg(k) + '(' + quad(a, b, c) + ') = ' + quad(rd(a * k), rd(b * k), rd(c * k)), { keys: ['^', '(', ')'], ansText: Y + ' = ' + quad(rd(a * k), rd(b * k), rd(c * k)) });
  },
  function vertexAfter(l) {
    const a = pick([1, 2, 3, -1, -2]), h = nz(-6, 6), q = nz(-8, 8), order = l === 2 && Math.random() < .5;
    if (order) { const k = pick([2, 3, -1, -2]); return pt(p('The graph of ' + Y + ' = ' + X() + '² is translated ' + Math.abs(h) + ' to the ' + (h > 0 ? 'right' : 'left') + ', then ' + Math.abs(q) + ' ' + (q > 0 ? 'up' : 'down') + ', and then multiplied by ' + neg(k) + ' with respect to the ' + X() + '-axis. What is the vertex now?'), h, rd(k * q), 'Translating moves the vertex. Multiplying with respect to the ' + X() + '-axis multiplies the ' + Y + '-coordinate.', p(Y + ' = (' + lin(1, -h) + ')²' + (q < 0 ? ' − ' : ' + ') + Math.abs(q) + ' has vertex ' + P2(h, q) + '.') + p('Multiplying by ' + neg(k) + ': ' + Y + ' = ' + neg(k) + '((' + lin(1, -h) + ')²' + (q < 0 ? ' − ' : ' + ') + Math.abs(q) + '), vertex ' + P2(h, rd(k * q)) + '.')); }
    return pt(p('The graph of ' + Y + ' = ' + (a === 1 ? '' : a === -1 ? '−' : a) + X() + '² is translated ' + U(h) + ' to the ' + (h > 0 ? 'right' : 'left') + ' and ' + U(q) + ' ' + (q > 0 ? 'up' : 'down') + '. What is the vertex of the new graph?'), h, q, 'The vertex of ' + Y + ' = ' + X('a') + X() + '² is (0, 0). Move it the same way.', p('(0, 0) moves to ' + P2(h, q) + '.') + p('The new formula is ' + Y + ' = ' + (a === 1 ? '' : a === -1 ? '−' : a) + '(' + lin(1, -h) + ')²' + (q < 0 ? ' − ' : ' + ') + Math.abs(q) + '.'));
  },
  function whichTransform(l) {
    const m = pick([2, 3, -0.5, 0.5]), b = nz(-5, 5), kind = pick(['up', 'mult']), k = kind === 'up' ? nz(-6, 6) : pick([2, 3, -1, -3]);
    const nm = kind === 'up' ? rd(m) : rd(m * k), nb = kind === 'up' ? b + k : rd(b * k);
    const right = kind === 'up' ? 'translate ' + U(k) + ' ' + (k > 0 ? 'up' : 'down') : 'multiply by ' + neg(k) + ' with respect to the ' + X() + '-axis';
    const wr = ['translate ' + U(k) + ' ' + (k > 0 ? 'down' : 'up'), 'multiply by ' + neg(kind === 'up' ? k : -k) + ' with respect to the ' + X() + '-axis', 'translate ' + U(k) + ' to the right', 'multiply by ' + neg(k) + ' with respect to the ' + X() + '-axis', 'translate ' + U(k) + ' ' + (k > 0 ? 'up' : 'down')].filter(o => o !== right);
    return ch(p('Which transformation changes ' + Y + ' = ' + lin(m, b) + ' into ' + Y + ' = ' + lin(nm, nb) + '?'), right, shuffle(wr).slice(0, 3), 'Did only the number change (translation up/down), or did both numbers change by the same factor (multiplying)?', kind === 'up' ? 'The gradient stays ' + neg(m) + '; ' + neg(b) + ' becomes ' + neg(nb) + ': ' + right + '.' : 'Both numbers are multiplied by ' + neg(k) + ': ' + neg(k) + '(' + lin(m, b) + ') = ' + lin(nm, nb) + '.');
  }
];
XG['3.4'] = [
  function bridgeArch(l) {
    let a, w, top, xv, rise, base; do { a = pick([-0.01, -0.02, -0.04, -0.05]); w = pick([100, 50, 80, 60]); top = pick([25, 30, 40, 45]); xv = w / 2; rise = rd(-a * xv * xv); base = rd(top - rise); } while (base < 2);
    return nu(p('A bridge arch has the formula ' + X('h') + ' = ' + neg(a) + X() + '² + ' + rd(-a * w) + X() + ' + ' + base + ', with ' + X('h') + ' the height above the water in m. How high is the top of the arch?'), top, 'Find ' + X() + '<sub>vertex</sub> = −' + X('b') + ' / 2' + X('a') + ' first.', p(X() + '<sub>vertex</sub> = −' + rd(-a * w) + ' / (2 · ' + par(a) + ') = ' + xv) + p(X('h') + ' = ' + neg(a) + ' · ' + xv + '² + ' + rd(-a * w) + ' · ' + xv + ' + ' + base + ' = ' + top + ' m'));
  }
];

/* ======================= 3.5 Periodic relationships ======================= */
function periodicFig(pattern, period, eq) {   // pattern: points [x, y] over one period starting at x = 0
  const segs = [], xmin = -2, xmax = 16; let ymax = 0, ymin = 0; pattern.forEach(q => { ymax = Math.max(ymax, q[1]); ymin = Math.min(ymin, q[1]); });
  for (let s = -period * 2; s < xmax + period; s += period) for (let i = 0; i < pattern.length - 1; i++) { const A = [pattern[i][0] + s, pattern[i][1]], B = [pattern[i + 1][0] + s, pattern[i + 1][1]]; if (B[0] < xmin || A[0] > xmax) continue; segs.push({ a: A, b: B, color: '#d1471f' }); }
  return grid({ xmin, xmax, ymin: Math.min(-1, ymin - 1), ymax: ymax + 1, segs, u: 18 }, 360);
}
G['3.5'] = [
  function readPeriodic(l) {
    const period = pick([4, 5, 6]), eq = ri(2, 4), amp = ri(1, 3), hi = eq + amp, lo = eq - amp;
    const half = period / 2, pattern = period === 5 ? [[0, eq], [1.25, hi], [2.5, eq], [3.75, lo], [5, eq]] : [[0, eq], [half / 2, hi], [half, eq], [half * 1.5, lo], [period, eq]];
    return mu(p('The graph is periodic. Give the period, the equilibrium and the amplitude.') + periodicFig(pattern, period, eq), ['period =', 'equilibrium =', 'amplitude ='], [period, eq, amp], 'Period: the length of one full pattern. Equilibrium: halfway between highest and lowest value. Amplitude: highest value − equilibrium.', p('One pattern runs from ' + X() + ' = 0 to ' + X() + ' = ' + period + ', so the period is ' + period + '.') + p('Highest ' + hi + ', lowest ' + lo + ': equilibrium = (' + hi + ' + ' + lo + ') / 2 = ' + eq + '.') + p('Amplitude = ' + hi + ' − ' + eq + ' = ' + amp + '.'), { ansText: 'period ' + period + ', equilibrium ' + eq + ', amplitude ' + amp });
  },
  function farValue(l) {
    const period = pick([4, 5, 6, 7, 8]), vals = Array.from({ length: period }, () => ri(-5, 9)), n = l === 0 ? ri(2, 9) : ri(11, 60), r = ri(0, period - 1), x = n * period + r * (l === 2 && Math.random() < .5 ? -1 : 1);
    const rr = ((x % period) + period) % period;
    return nu(p('A periodic graph has period ' + period + '. Over one period you have:') + '<table class="tbl"><tr><th>' + X() + '</th>' + vals.map((v, i) => '<td>' + i + '</td>').join('') + '</tr><tr><th>' + Y + '</th>' + vals.map(v => '<td>' + neg(v) + '</td>').join('') + '</tr></table>' + p('What is ' + Y + ' at ' + X() + ' = ' + x + '?'), vals[rr], 'Subtract whole periods: ' + x + ' = … · ' + period + ' + remainder.', p(neg(x) + ' = ' + Math.floor(x / period) + ' · ' + period + ' + ' + rr) + p('So ' + Y + ' is the same as at ' + X() + ' = ' + rr + ': ' + Y + ' = ' + neg(vals[rr]) + '.'), { noStep: true });
  },
  function dayOfWeek(l) {
    const D = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], s = ri(0, 6), n = l === 0 ? ri(8, 30) : ri(40, 1000), e = (s + n) % 7;
    return ch(p('Today is ' + D[s] + '. Which day of the week is it in ' + n + ' days?'), D[e], D.filter(d => d !== D[e]), 'A week has 7 days: the days repeat with period 7.', p(n + ' = ' + Math.floor(n / 7) + ' · 7 + ' + n % 7) + p('Whole weeks change nothing. ' + D[s] + ' + ' + n % 7 + ' days = ' + D[e] + '.'));
  },
  function frequency(l) {
    const ms = pick([2, 2.5, 4, 5, 0.5, 1.25, 8]), f = rd(1000 / ms, 2);
    return nu(p('A tuning fork vibrates with a period of ' + ms + ' ms (milliseconds). Calculate the frequency in Hz (vibrations per second).'), f, '1 s = 1000 ms. Frequency = 1 / period (period in seconds).', 'period = ' + ms + ' ms = ' + rd(ms / 1000) + ' s<br>frequency = 1 / ' + rd(ms / 1000) + ' = ' + f + ' Hz', { tol: .01 });
  },
  function heartbeat(l) {
    const T = pick([0.75, 0.8, 0.9, 1.2, 0.6]), bpm = rd(60 / T, 0);
    return nu(p('The period of a heartbeat is ' + T + ' s. How many heartbeats is that per minute? Round to a whole number.'), bpm, 'One minute is 60 seconds. How many periods fit in 60 s?', '60 : ' + T + ' ≈ ' + bpm + ' beats per minute', { tol: .51 });
  }
];
XG['3.5'] = [
  function wheelHeight(l) {
    const period = pick([4, 8, 10]), eq = pick([31.5, 40, 25]), amp = pick([28.5, 20, 15]), t = ri(20, 300), start = pick(['top', 'equilibrium']);
    const r = ((t % period) + period) % period, q = r / period;
    if (![0, 0.25, 0.5, 0.75].includes(q)) return XG['3.5'][0](l);
    const heights = start === 'top' ? [eq + amp, eq, eq - amp, eq] : [eq, eq + amp, eq, eq - amp], h = heights[q * 4];
    return nu(p('A valve on a wheel moves up and down. Period ' + period + ' s, equilibrium ' + eq + ' cm, amplitude ' + amp + ' cm. At ' + X('t') + ' = 0 the valve is at ' + (start === 'top' ? 'its highest point' : 'the equilibrium, going up') + '. How high is the valve at ' + X('t') + ' = ' + t + '?'), h, 'Subtract whole periods. A quarter period later it is at the next "special" point.', p(neg(t) + ' = ' + Math.floor(t / period) + ' · ' + period + ' + ' + r) + p('So the height is the same as at ' + X('t') + ' = ' + r + ' (' + q * 4 + ' quarter period' + (q * 4 === 1 ? '' : 's') + '): ' + h + ' cm.'), { noStep: true });
  }
];

/* ======================= 3VT extras (function notation, power / rational functions, even and odd) ======================= */
const VT = P.cls === '3VT';
const F = (f, x) => X(f) + '(' + x + ')';
const aTxt = a => a === 1 ? '' : a === -1 ? '−' : neg(a);
const sq = (h, q) => '(' + lin(1, -h) + ')²' + (q ? (q < 0 ? ' − ' : ' + ') + neg(Math.abs(q)) : '');
if (VT) {
  G['3.1'].unshift(
    function fValue(l) {
      const m = l === 0 ? nz(-6, 6) : pick([-4, -3, -0.5, 0.5, 2, 5, 1.5, -2.5]), b = nz(-12, 12), x = l === 0 ? ri(-5, 8) : nz(-10, 10), y = rd(m * x + b);
      return nu(p('Given ' + F('f', X()) + ' = ' + lin(m, b) + '. Calculate ' + F('f', neg(x)) + '.'), y, 'Replace ' + X() + ' by ' + par(x) + '.', F('f', neg(x)) + ' = ' + neg(m) + ' · ' + par(x) + (b < 0 ? ' − ' : ' + ') + Math.abs(b) + ' = ' + neg(rd(m * x)) + (b < 0 ? ' − ' : ' + ') + Math.abs(b) + ' = ' + neg(y), { needStep: true });
    },
    function fSolve(l) {
      let m, b, c, x; do { m = nz(-6, 6); b = nz(-12, 12); x = l === 2 ? nz(-16, 16) / 4 : nz(-9, 9); c = rd(m * x + b); } while (m === 1 || !Number.isInteger(c));
      return nu(p('Given ' + F('f', X()) + ' = ' + lin(m, b) + '. Solve ' + F('f', X()) + ' = ' + neg(c) + '.'), x, 'Write the equation ' + lin(m, b) + ' = ' + neg(c) + ' and solve it.', p(lin(m, b) + ' = ' + neg(c)) + p(lin(m, 0) + ' = ' + neg(rd(c - b))) + p(X() + ' = ' + neg(rd(c - b)) + ' : ' + par(m) + ' = ' + neg(x)), { noStep: true });
    }
  );
  G['3.2'].push(
    function vertexFormFind(l) {
      const a = l === 0 ? pick([1, -1, 2, -2]) : pick([-3, -2, -0.5, 0.5, 2, 3, 0.25]), h = nz(-6, 6), q = ri(-9, 9), d = pick([2, -2, 3, -3, 4]), x0 = h + d, y0 = rd(a * d * d + q);
      return nu(p('A parabola has vertex ' + P2(h, q) + ' and passes through ' + P2(x0, y0) + '. The formula is ' + F('f', X()) + ' = ' + X('a') + sq(h, q) + '. Calculate ' + X('a') + '.'), a, 'Use the vertex form ' + F('f', X()) + ' = ' + X('a') + '(' + X() + ' − ' + X('p') + ')² + ' + X('q') + '. Then substitute the point.', p(F('f', neg(x0)) + ' = ' + neg(y0)) + p(X('a') + '(' + neg(x0) + ' − ' + par(h) + ')²' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '') + ' = ' + neg(y0)) + p(neg(d * d) + X('a') + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '') + ' = ' + neg(y0)) + p(neg(d * d) + X('a') + ' = ' + neg(rd(y0 - q))) + p(X('a') + ' = ' + neg(rd(y0 - q)) + ' : ' + d * d + ' = ' + neg(a)), { noStep: true });
    },
    function factoredFind(l) {
      let r1, r2, x0, a; do { r1 = ri(-8, 6); r2 = r1 + ri(2, 9); x0 = ri(-9, 9); a = l === 0 ? pick([1, -1, 2, -2]) : pick([-3, -2, -0.5, 0.5, 2, 3, 0.1]); } while (x0 === r1 || x0 === r2);
      const k = (x0 - r1) * (x0 - r2), y0 = rd(a * k), fac = r => '(' + lin(1, -r) + ')';
      return nu(p('A parabola intersects the ' + X() + '-axis at ' + P2(r1, 0) + ' and ' + P2(r2, 0) + ' and passes through ' + P2(x0, y0) + '. The formula is ' + F('f', X()) + ' = ' + X('a') + fac(r1) + fac(r2) + '. Calculate ' + X('a') + '.'), a, 'Substitute the point ' + P2(x0, y0) + ' in the factored form.', p(X('a') + '(' + neg(x0) + ' − ' + par(r1) + ')(' + neg(x0) + ' − ' + par(r2) + ') = ' + neg(y0)) + p(X('a') + ' · ' + par(x0 - r1) + ' · ' + par(x0 - r2) + ' = ' + neg(y0)) + p(neg(k) + X('a') + ' = ' + neg(y0)) + p(X('a') + ' = ' + neg(y0) + ' : ' + par(k) + ' = ' + neg(a)), { noStep: true });
    },
    function vertexFormZeros(l) {
      const a = l === 0 ? pick([1, -1]) : pick([1, -1, 2, -2, 3, 0.5, -4]), h = ri(-6, 6), r = ri(1, 6), q = rd(-a * r * r);
      return mu(p('Calculate where the graph of ' + F('f', X()) + ' = ' + aTxt(a) + sq(h, q) + ' intersects the ' + X() + '-axis. Give both ' + X() + '-coordinates.') + p('<small>Type the smallest first.</small>'), ['smallest x =', 'largest x ='], [h - r, h + r], 'Solve ' + F('f', X()) + ' = 0. Get the square on its own first.', p(aTxt(a) + sq(h, q) + ' = 0') + (a === 1 ? '' : p(aTxt(a) + sq(h, 0) + ' = ' + neg(-q))) + p(sq(h, 0) + ' = ' + r * r) + p(lin(1, -h) + ' = −' + r + ' or ' + lin(1, -h) + ' = ' + r) + p(X() + ' = ' + neg(h - r) + ' or ' + X() + ' = ' + neg(h + r)), { ansText: X() + ' = ' + neg(h - r) + ' and ' + X() + ' = ' + neg(h + r) });
    }
  );
  G['3.3'].push(
    function powerValue(l) {
      const a = l === 0 ? pick([1, 2, -1]) : pick([2, 3, -2, 0.5, -0.25, 4]), n = l === 0 ? pick([3, 4]) : pick([3, 4, 5, 6]), x = n > 4 ? pick([-2, -1, 2]) : nz(-3, 3), y = rd(a * Math.pow(x, n));
      return nu(p('Given the power function ' + F('f', X()) + ' = ' + aTxt(a) + X() + '<sup>' + n + '</sup>. Calculate ' + F('f', neg(x)) + '.'), y, 'Calculate the power first, then multiply by ' + neg(a) + '.', F('f', neg(x)) + ' = ' + (a === 1 ? '' : a === -1 ? '−' : neg(a) + ' · ') + par(x) + '<sup>' + n + '</sup> = ' + (a === 1 ? '' : a === -1 ? '−' : neg(a) + ' · ') + par(Math.pow(x, n)) + ' = ' + neg(y), { needStep: a !== 1 });
    },
    function asymptotes(l) {
      const a = nz(-12, 12), h = ri(-7, 7), q = ri(-6, 6), den = h === 0 ? X() : lin(1, -h);
      return mu(p('Give the equations of the asymptotes of the graph of ' + F('f', X()) + ' = ' + neg(a) + ' / (' + den + ')' + (q ? (q < 0 ? ' − ' : ' + ') + Math.abs(q) : '') + '.'), ['vertical: x =', 'horizontal: y ='], [h, q], 'Vertical asymptote: where the denominator is 0. Horizontal asymptote: the fraction gets close to 0, so ' + X('y') + ' gets close to the number that is added.', p('Denominator ' + den + ' = 0 gives ' + X() + ' = ' + neg(h) + ': vertical asymptote ' + X() + ' = ' + neg(h) + '.') + p('The fraction is never 0, so ' + F('f', X()) + ' never reaches ' + neg(q) + ': horizontal asymptote ' + X('y') + ' = ' + neg(q) + '.'), { ansText: X() + ' = ' + neg(h) + ' and ' + X('y') + ' = ' + neg(q) });
    },
    function rootEndpoint(l) {
      const c = l === 0 ? 1 : pick([2, 3, -1, -2, 4]), e = ri(-6, 6), d = rd(-c * e), k = pick([1, 2, 3, -1, -2, 0.5]), q = ri(-8, 8);
      const inside = poly([[c, X()], [d, '']]), f = (q ? neg(q) + (k < 0 ? ' − ' : ' + ') : (k < 0 ? '−' : '')) + (Math.abs(k) === 1 ? '' : neg(Math.abs(k))) + '√(' + inside + ')';
      return pt(p('What are the coordinates of the endpoint of the graph of ' + F('f', X()) + ' = ' + f + '?'), e, q, 'The graph ends where the number under the root is 0.', p(inside + ' = 0 gives ' + X() + ' = ' + neg(e) + '.') + p(F('f', neg(e)) + ' = ' + neg(q) + ' + ' + neg(k) + ' · √0 = ' + neg(q) + '. The endpoint is ' + P2(e, q) + '.') + p(X() + ' must make ' + inside + ' ≥ 0, so ' + X() + (c > 0 ? ' ≥ ' : ' ≤ ') + neg(e) + '.'));
    }
  );
  G['3.4'].push(
    function transformFunc(l) {
      const a = nz(-9, 9), q = nz(-5, 5), k = pick([2, 3, 4, -1, -2, 0.5]), add = nz(-6, 6), mult = Math.random() < .5, type = pick(['rat', 'root']);
      const fmt = (A, Q) => type === 'rat' ? neg(A) + ' / ' + X() + (Q ? (Q < 0 ? ' − ' : ' + ') + neg(Math.abs(Q)) : '') : (A === 1 ? '' : A === -1 ? '−' : neg(A)) + '√' + X() + (Q ? (Q < 0 ? ' − ' : ' + ') + neg(Math.abs(Q)) : '');
      const right = mult ? fmt(rd(k * a), rd(k * q)) : fmt(a, q + add), wr = mult ? [fmt(rd(k * a), q), fmt(a, rd(k * q)), fmt(rd(a + k), rd(q + k))] : [fmt(rd(a + add), q), fmt(a, rd(q - add)), fmt(rd(a + add), rd(q + add))];
      const how = mult ? F('g', X()) + ' = ' + neg(k) + ' · ' + F('f', X()) : F('g', X()) + ' = ' + F('f', X()) + (add < 0 ? ' − ' : ' + ') + Math.abs(add);
      return ch(p('Given ' + F('f', X()) + ' = ' + fmt(a, q) + ' and ' + how + '. Which formula belongs to ' + X('g') + '?'), F('g', X()) + ' = ' + right, wr.filter(w => w !== right).map(w => F('g', X()) + ' = ' + w), mult ? 'Multiply every term of ' + F('f', X()) + ' by ' + neg(k) + '.' : 'Only the number at the end changes.', mult ? F('g', X()) + ' = ' + neg(k) + '(' + fmt(a, q) + ') = ' + right : F('g', X()) + ' = ' + fmt(a, q) + (add < 0 ? ' − ' : ' + ') + Math.abs(add) + ' = ' + right);
    }
  );
  G['3.5'].unshift(
    function evenOdd(l) {
      const a = nz(-5, 5), c = nz(-9, 9), T = [
        [() => aTxt(a) + X() + '<sup>' + pick([2, 4, 6]) + '</sup>', 'even', 'only even powers of ' + X() + ', so ' + F('f', '−' + X()) + ' = ' + F('f', X()) + '.'],
        [() => aTxt(a) + X() + '<sup>' + pick([3, 5]) + '</sup>', 'odd', 'only odd powers of ' + X() + ', so ' + F('f', '−' + X()) + ' = −' + F('f', X()) + '.'],
        [() => aTxt(a) + X() + '²' + (c < 0 ? ' − ' : ' + ') + Math.abs(c), 'even', F('f', '−' + X()) + ' = ' + aTxt(a) + '(−' + X() + ')²' + (c < 0 ? ' − ' : ' + ') + Math.abs(c) + ' = ' + F('f', X()) + '.'],
        [() => aTxt(a) + X() + '³' + (c < 0 ? ' − ' : ' + ') + Math.abs(c), 'neither', 'the number ' + neg(c) + ' does not change sign: ' + F('f', '−' + X()) + ' is not ' + F('f', X()) + ' and not −' + F('f', X()) + '.'],
        [() => neg(a) + ' / ' + X(), 'odd', F('f', '−' + X()) + ' = ' + neg(a) + ' / (−' + X() + ') = −' + F('f', X()) + '.'],
        [() => X() + '³ + ' + X() + '⁵', 'odd', F('f', '−' + X()) + ' = −' + X() + '³ − ' + X() + '⁵ = −' + F('f', X()) + '.'],
        [() => X() + '³ + ' + X() + '²', 'neither', 'one odd and one even power: for example ' + F('f', '1') + ' = 2 and ' + F('f', '−1') + ' = 0.'],
        [() => aTxt(a) + X() + '⁴ − ' + X() + '²', 'even', 'only even powers of ' + X() + ', so ' + F('f', '−' + X()) + ' = ' + F('f', X()) + '.']
      ], t = pick(T), right = t[1] === 'even' ? 'even: symmetric in the y-axis' : t[1] === 'odd' ? 'odd: point symmetric in the origin' : 'neither even nor odd';
      return ch(p('Is ' + F('f', X()) + ' = ' + t[0]() + ' even, odd or neither?'), right, ['even: symmetric in the y-axis', 'odd: point symmetric in the origin', 'neither even nor odd'].filter(o => o !== right), 'Calculate ' + F('f', '−' + X()) + '. Even: ' + F('f', '−' + X()) + ' = ' + F('f', X()) + '. Odd: ' + F('f', '−' + X()) + ' = −' + F('f', X()) + '.', right.charAt(0).toUpperCase() + right.slice(1) + ': ' + t[2]);
    }
  );
}

const SECTIONS = VT ? [
  { id: '3.1', title: '3.1 Linear functions', sub: 'f(x) notation, gradient, formula of a line' },
  { id: '3.2', title: '3.2 Quadratic functions', sub: 'Vertex, vertex form, factored form' },
  { id: '3.3', title: '3.3 Other functions', sub: 'Power, square root and rational functions' },
  { id: '3.4', title: '3.4 Transformations', sub: 'Translating and multiplying graphs' },
  { id: '3.5', title: '3.5 Symmetry and periodic functions', sub: 'Even and odd, period, equilibrium, amplitude' }
] : [
  { id: '3.1', title: '3.1 Linear relationships', sub: 'Intercepts, gradient, formula of a line' },
  { id: '3.2', title: '3.2 Quadratic relationships', sub: 'a, b, c, vertex, intercepts' },
  { id: '3.3', title: '3.3 Other relationships', sub: 'Direct and inverse proportion, square roots' },
  { id: '3.4', title: '3.4 Transformations', sub: 'Translating and multiplying graphs' },
  { id: '3.5', title: '3.5 Periodic relationships', sub: 'Period, equilibrium, amplitude' }
];
const GOALS = [
  ['3.1', 'I can find intercepts and the formula of a line', ['axisPoints', 'gradientTwoPoints', 'lineTwoPoints', 'parallelThrough', 'lineFromGraph', 'verticalLine'], 'm = Δy / Δx; then substitute a point to find b.'],
  ['3.2', 'I can calculate the vertex and intercepts of a parabola', ['readABC', 'maxOrMin', 'valueAt', 'vertexAbc', 'factoredZeros', 'factoredVertex', 'interceptCount'], 'x_vertex = −b / 2a'],
  ['3.3', 'I can recognise and use proportional and square root relationships', ['isDirect', 'inverseTable', 'inverseFormula', 'whichRelation', 'sqrtStart', 'sqrtValue'], 'Inverse: x · y = k. Direct: y = kx.'],
  ['3.4', 'I can translate and multiply graphs', ['shiftUp', 'shiftRight', 'multiplyX', 'vertexAfter', 'whichTransform'], 'To the right by 3: replace x by (x − 3).'],
  ['3.5', 'I can work with periodic relationships', ['readPeriodic', 'farValue', 'dayOfWeek', 'frequency', 'heartbeat'], 'Subtract whole periods.']
];
if (VT) {
  const add = { '3.1': ['fValue', 'fSolve'], '3.2': ['vertexFormFind', 'factoredFind', 'vertexFormZeros'], '3.3': ['powerValue', 'asymptotes', 'rootEndpoint'], '3.4': ['transformFunc'], '3.5': ['evenOdd'] };
  GOALS.forEach(g => { g[2] = add[g[0]].concat(g[2]); });
  GOALS[2][1] = 'I can work with power, square root and rational functions';
  GOALS[4][1] = 'I can work with even, odd and periodic functions';
}
return { key: 'nx-' + P.cls.toLowerCase() + '-ch3-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
