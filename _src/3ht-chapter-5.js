const { ri, pick, shuffle, gcd, M, fr, ratText } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {}, H = {}, HX = {};

/* ---------- helpers ---------- */
const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
const must = (a, b) => { if (!(Math.abs(a - b) < 1e-6)) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const neg = n => n < 0 ? '−' + Math.abs(n) : String(n);
const X = v => '<i>' + (v || 'x') + '</i>';
/* a·x + b as text, e.g. 3x − 5, −x + 2, 7 */
function lin(a, b, v, first) {
  v = v || 'x'; let s = '';
  if (a !== 0) s = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + X(v);
  if (b !== 0 || a === 0) s += s ? (b < 0 ? ' − ' + Math.abs(b) : ' + ' + b) : neg(b);
  return s;
}
/* fraction value n/d as html: whole number, mixed number or fraction (with sign) */
function fv(n, d, mixed) {
  if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; if (d === 1) return neg(n);
  const s = n < 0 ? '−' : '', a = Math.abs(n);
  if (mixed && a > d) return s + Math.floor(a / d) + fr(a % d, d);
  return s + fr(a, d);
}
/* the answer of "x = n/d": num if it is a whole number or a short decimal, else a typed fraction */
function solQ(html, n, d, v, hint, steps, extra) {
  if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); n /= g; d /= g; v = v || 'x';
  const q = d === 1 ? nu(html, n, hint, steps) : ex(html + p('<small>Give the exact value of ' + X(v) + ': a fraction like 7/3, a mixed number like 2 1/3, or a decimal if it ends.</small>'), ratText(n, d), null, hint, steps, { keys: ['/', '−', '(', ')'] });
  q.noStep = true; q.eqStep = v; q.ansText = X(v) + ' = ' + fv(n, d, true); return Object.assign(q, extra || {});
}
/* balance-method steps: rows [equation html, operation] */
const bal = rows => '<table style="border-collapse:collapse;margin:6px 0">' + rows.map(r => '<tr><td style="text-align:right;padding:3px 16px 3px 0">' + r[0] + '</td><td style="color:#d1471f;padding:3px 0">' + (r[1] || '') + '</td></tr>').join('') + '</table>';
const op = (s, n) => s + ' ' + (n < 0 ? '(' + neg(n) + ')' : n);
/* solve ax + b = cx + d, return rows of the balance method and the solution as [n, den] */
function solveLin(a, b, c, d, v) {
  const rows = [[lin(a, b, v) + ' = ' + lin(c, d, v)]];
  let A = a, B = b, C = c, D = d;
  if (B !== 0) { rows[rows.length - 1][1] = B > 0 ? '− ' + B : '+ ' + (-B); D -= B; B = 0; rows.push([lin(A, 0, v) + ' = ' + lin(C, D, v)]); }
  if (C !== 0) { rows[rows.length - 1][1] = C > 0 ? '− ' + lin(C, 0, v) : '+ ' + lin(-C, 0, v); A -= C; C = 0; rows.push([lin(A, 0, v) + ' = ' + neg(D)]); }
  if (A !== 1) { rows[rows.length - 1][1] = ': ' + (A < 0 ? '(' + neg(A) + ')' : A); rows.push([X(v) + ' = ' + fv(D, A, true)]); }
  const xs = D / A; must(a * xs + b, c * xs + d);
  return { rows, n: D, d: A };
}
const ineqSym = { '<': '&lt;', '>': '&gt;', '≤': '≤', '≥': '≥' };
const flip = s => ({ '<': '>', '>': '<', '≤': '≥', '≥': '≤' })[s];
const svgWrap = (h, px) => '<div style="max-width:' + (px || 300) + 'px">' + h + '</div>';
function linesFig(L1, L2, lab1, lab2, rng) {
  rng = rng || 8; const segs = [];
  [[L1, '#1b5fa8'], [L2, '#d1471f']].forEach(e => { const c = NX.clipLine([0, e[0][1]], [1, e[0][0]], -rng, rng, -rng, rng); if (c) segs.push({ a: c.a, b: c.b, color: e[1] }); });
  return svgWrap(NX.gridSVG({ xmin: -rng, xmax: rng, ymin: -rng, ymax: rng, u: 16, segs }), 300) + p('<span style="color:#1b5fa8"><b>' + lab1 + '</b></span>: ' + X('y') + ' = ' + lin(L1[0], L1[1]) + ' &nbsp; <span style="color:#d1471f"><b>' + lab2 + '</b></span>: ' + X('y') + ' = ' + lin(L2[0], L2[1]));
}

/* ======================= 6.1 Linear equations ======================= */
H.a1 = [
  function oneStep(l) {
    let a, b, rhs; do { a = nz(-9, 9); b = nz(-15, 15); rhs = l === 0 ? a * ri(-9, 12) + b : nz(-30, 30); } while (a === 1 || (l === 0 && a < 0));
    const s = solveLin(a, b, 0, rhs);
    return solQ(p('Solve: ' + lin(a, b) + ' = ' + neg(rhs)), s.n, s.d, 'x', 'Use the balance method: first get rid of the number on the left (do the same on the right), then divide by the number in front of ' + X() + '.', bal(s.rows));
  },
  function bothSides(l) {
    let a, c, b, d; do { a = nz(-9, 12); c = nz(-9, 12); b = ri(-15, 15); d = ri(-15, 15); } while (a === c || (l === 0 && (d - b) % (a - c) !== 0));
    const s = solveLin(a, b, c, d);
    return solQ(p('Solve: ' + lin(a, b) + ' = ' + lin(c, d)), s.n, s.d, 'x', 'Get all the ' + X() + '-terms on one side and all the numbers on the other side. Do the same thing on both sides.', bal(s.rows));
  },
  function decimals(l) {
    const a = pick([.5, 1.5, 2.5, .25, .75, 1.25]), c = pick([2, 1.5, -1.75, .5, 3.5, -.5]); if (a === c) return H.a1[2](l);
    const x = ri(-8, 8) * (l === 2 ? .5 : 1), b = pick([-6, -4, -3, 2, 3, 4, 6]), d = Math.round((a * x + b - c * x) * 1e6) / 1e6;
    const st = [[lin(a, b) + ' = ' + lin(c, d), (b > 0 ? '− ' + b : '+ ' + -b)], [lin(a, 0) + ' = ' + lin(c, Math.round((d - b) * 1e6) / 1e6), c > 0 ? '− ' + lin(c, 0) : '+ ' + lin(-c, 0)], [lin(Math.round((a - c) * 1e6) / 1e6, 0) + ' = ' + neg(Math.round((d - b) * 1e6) / 1e6), ': ' + (a - c < 0 ? '(' + neg(a - c) + ')' : a - c)], [X() + ' = ' + neg(x)]];
    return nu(p('Solve: ' + lin(a, b) + ' = ' + lin(c, d)), x, 'Decimals work the same as whole numbers. You can also first multiply both sides by 4 (or 2) to get rid of the decimals.', bal(st), { noStep: true, eqStep: 'x', ansText: X() + ' = ' + neg(x) });
  },
  function withFractions(l) {
    // (p/q)x + r = s with nice numbers: multiply by q
    const q = pick([2, 3, 4, 5]), pp = l === 0 ? 1 : ri(1, q - 1), x = ri(-6, 9) * q, r = nz(-8, 8), s = pp * x / q + r;
    if (gcd(pp, q) !== 1) return H.a1[3](l);
    const rows = [[fr(pp, q) + X() + ' ' + (r < 0 ? '− ' + -r : '+ ' + r) + ' = ' + neg(s), '× ' + q], [lin(pp, r * q) + ' = ' + neg(s * q), r > 0 ? '− ' + r * q : '+ ' + -r * q], [lin(pp, 0) + ' = ' + neg(s * q - r * q), pp === 1 ? '' : ': ' + pp]];
    if (pp !== 1) rows.push([X() + ' = ' + fv(s * q - r * q, pp, true)]);
    return solQ(p('Solve: ' + fr(pp, q) + X() + ' ' + (r < 0 ? '− ' + -r : '+ ' + r) + ' = ' + neg(s)), s * q - r * q, pp, 'x', 'First multiply both sides by ' + q + ' to get rid of the fraction.', bal(rows));
  },
  function lcmFractions(l) {
    // (a/q1)x + b = (c/q2)x + d : multiply by lcm
    const q1 = pick([2, 3, 4, 6]), q2 = pick([2, 3, 4, 5, 6].filter(z => z !== q1)), m = q1 * q2 / gcd(q1, q2);
    const a = pick([1, 1, 2, 3].filter(z => gcd(z, q1) === 1)), c = pick([1, 1, 2, 5].filter(z => gcd(z, q2) === 1)), b = nz(-6, 6), d = nz(-6, 6);
    const A = a * m / q1, C = c * m / q2; if (A === C) return H.a1[4](l);
    const s = solveLin(A, b * m, C, d * m);
    const head = [fr(a, q1) + X() + ' ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' = ' + fr(c, q2) + X() + ' ' + (d < 0 ? '− ' + -d : '+ ' + d), '× ' + m];
    return solQ(p('Solve: ' + head[0]), s.n, s.d, 'x', 'Multiply both sides by ' + m + ', the lowest common multiple of ' + q1 + ' and ' + q2 + '. Then use the balance method.', p('Multiply by ' + m + ' (the LCM of ' + q1 + ' and ' + q2 + ').') + bal([head].concat(s.rows)));
  },
  function brackets(l) {
    const k = nz(-6, 6), h = nz(-9, 9), b = ri(-10, 10), c = nz(-5, 5), d = ri(-12, 12);
    if (k === c) return H.a1[5](l);
    const s = solveLin(k, k * h + b, c, d);
    const first = (k === -1 ? '−' : neg(k)) + '(' + lin(1, h) + ')' + (b === 0 ? '' : b < 0 ? ' − ' + -b : ' + ' + b) + ' = ' + lin(c, d);
    return solQ(p('Solve: ' + first), s.n, s.d, 'x', 'First remove the brackets: multiply ' + neg(k) + ' by both terms inside. Then use the balance method.', bal([[first, 'remove brackets']].concat(s.rows)));
  },
  function intersect(l) {
    const x0 = ri(-5, 5), y0 = ri(-6, 6); let m1, m2; do { m1 = nz(-4, 4); m2 = nz(-4, 4); } while (m1 === m2);
    const b1 = y0 - m1 * x0, b2 = y0 - m2 * x0, s = solveLin(m1, b1, m2, b2);
    return Object.assign({ type: 'point', ans: [x0, y0], html: p('Calculate the coordinates of the point of intersection of the lines ' + X('k') + ': ' + X('y') + ' = ' + lin(m1, b1) + ' and ' + X('m') + ': ' + X('y') + ' = ' + lin(m2, b2) + '.') + p('<small>Type your answer like (2, −5).</small>'), hint: 'Make the two formulas equal and solve the equation. Then put the ' + X() + ' you found into one of the formulas to find ' + X('y') + '.', steps: bal(s.rows) + p(X('y') + ' = ' + neg(m1) + ' · ' + (x0 < 0 ? '(' + neg(x0) + ')' : x0) + (b1 < 0 ? ' − ' + -b1 : ' + ' + b1) + ' = ' + neg(y0)) + p('The point of intersection is (' + neg(x0) + ', ' + neg(y0) + ').'), noStep: true });
  },
  function rectangleEq(l) {
    const w = ri(3, 20), dd = ri(2, 9), len = w + dd, P = 2 * (w + len);
    return nu(p('A rectangle is <b>' + dd + ' cm</b> longer than it is wide. Its perimeter is <b>' + P + ' cm</b>. Use ' + X() + ' for the width. Set up an equation and calculate the <b>width</b> (in cm).'), w, 'The length is ' + X() + ' + ' + dd + '. Perimeter = 2 · width + 2 · length.', p('2' + X() + ' + 2(' + X() + ' + ' + dd + ') = ' + P) + bal([['2' + X() + ' + 2' + X() + ' + ' + 2 * dd + ' = ' + P, '− ' + 2 * dd], ['4' + X() + ' = ' + (P - 2 * dd), ': 4'], [X() + ' = ' + w]]) + p('The length is ' + len + ' cm and the width is ' + w + ' cm.'), { noStep: true, eqStep: 'x' });
  }
];
HX.a1 = [
  function fracBothSides(l) {
    const q = pick([3, 4, 5, 6]), a = pick([1, 2].filter(z => gcd(z, q) === 1)), c = pick([1, 2, 3]), b = nz(-8, 8), d = nz(-8, 8);
    const A = a, C = c * q; if (A === C) return HX.a1[0](l);
    const s = solveLin(A, b * q, C, d * q), head = [fr(a, q) + X() + ' ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' = ' + lin(c, d), '× ' + q];
    return solQ(p('Solve: ' + head[0]), s.n, s.d, 'x', 'Multiply BOTH sides (every term!) by ' + q + '.', bal([head].concat(s.rows)));
  },
  function costCompare(l) {
    const f1 = pick([5, 8, 10, 12, 15]), r1 = pick([.2, .25, .3, .4]), f2 = f1 + pick([5, 10, 15, 20]), r2 = r1 - pick([.05, .1, .15].filter(z => z < r1));
    const t = Math.round((f2 - f1) / (r1 - r2) * 1000) / 1000;
    if (!Number.isInteger(t)) return HX.a1[1](l);
    return nu(p('Phone plan A costs €' + f1 + ' per month plus €' + r1.toFixed(2) + ' per minute. Plan B costs €' + f2 + ' per month plus €' + r2.toFixed(2) + ' per minute. For how many minutes do both plans cost the <b>same</b>?'), t, 'Write a formula for each plan with ' + X('t') + ' minutes. Make them equal and solve.', p('A: ' + f1 + ' + ' + r1 + X('t') + ' &nbsp; B: ' + f2 + ' + ' + Math.round(r2 * 100) / 100 + X('t')) + bal([[f1 + ' + ' + r1 + X('t') + ' = ' + f2 + ' + ' + Math.round(r2 * 100) / 100 + X('t'), '− ' + Math.round(r2 * 100) / 100 + X('t')], [f1 + ' + ' + Math.round((r1 - r2) * 100) / 100 + X('t') + ' = ' + f2, '− ' + f1], [Math.round((r1 - r2) * 100) / 100 + X('t') + ' = ' + (f2 - f1), ': ' + Math.round((r1 - r2) * 100) / 100], [X('t') + ' = ' + t]]) + p('After ' + t + ' minutes both plans cost the same.'), { noStep: true, eqStep: 't' });
  }
];

/* ======================= 6.2 Inequalities ======================= */
function ineqChoice(html, sym, n, d, hint, steps) {
  const val = fv(n, d, true), opts = ['<', '>', '≤', '≥'].map(s => X() + ' ' + ineqSym[s] + ' ' + val);
  return ch(html, X() + ' ' + ineqSym[sym] + ' ' + val, opts.filter(o => o !== X() + ' ' + ineqSym[sym] + ' ' + val), hint, steps);
}
H.b1 = [
  function ineqSimple(l) {
    let a, b, c, sym = pick(['<', '>', '≤', '≥']); do { a = l === 0 ? ri(2, 9) : nz(-9, 9); b = ri(-10, 10); c = ri(-12, 15); } while (a === 1 || a === -1 || (l === 0 && (c - b) % a !== 0));
    const rows = [[lin(a, b) + ' ' + ineqSym[sym] + ' ' + neg(c), b === 0 ? '' : b > 0 ? '− ' + b : '+ ' + -b]];
    if (b !== 0) rows.push([lin(a, 0) + ' ' + ineqSym[sym] + ' ' + neg(c - b), ': ' + (a < 0 ? '(' + neg(a) + ')' : a) + (a < 0 ? ' — the sign turns around!' : '')]); else rows[0][1] = ': ' + (a < 0 ? '(' + neg(a) + ') — the sign turns around!' : a);
    const s2 = a < 0 ? flip(sym) : sym; rows.push([X() + ' ' + ineqSym[s2] + ' ' + fv(c - b, a, true)]);
    return ineqChoice(p('Solve the inequality: ' + rows[0][0]), s2, c - b, a, 'Solve it like an equation. When you multiply or divide by a <b>negative</b> number, the inequality sign turns around.', bal(rows));
  },
  function ineqBoth(l) {
    let a, b, c, d; do { a = nz(-8, 10); c = nz(-8, 10); b = ri(-12, 12); d = ri(-12, 12); } while (a === c || (l === 0 && ((d - b) % (a - c) !== 0 || a - c < 0)));
    const sym = pick(['<', '>', '≤', '≥']), s = solveLin(a, b, c, d), A = a - c;
    const rows = s.rows.map((r, i) => [r[0].replace(' = ', ' ' + ineqSym[i === s.rows.length - 1 && A < 0 ? flip(sym) : sym] + ' '), r[1]]);
    if (A < 0 && rows.length > 1) rows[rows.length - 2][1] += ' — the sign turns around!';
    return ineqChoice(p('Solve the inequality: ' + rows[0][0]), A < 0 ? flip(sym) : sym, s.n, s.d, 'Get the ' + X() + '-terms on one side. Watch out: dividing by a negative number turns the sign around.', bal(rows));
  },
  function ineqGraph(l) {
    const x0 = ri(-4, 4), y0 = ri(-4, 4); let m1, m2; do { m1 = nz(-3, 3); m2 = nz(-3, 3); } while (m1 === m2);
    const L1 = [m1, y0 - m1 * x0], L2 = [m2, y0 - m2 * x0], above = Math.random() < .5;
    // l above n where (m1 - m2)(x - x0) > 0
    const sym = (m1 > m2) === above ? '>' : '<';
    return ch(p('The graphs of the lines ' + X('l') + ' and ' + X('n') + ' intersect at ' + X() + ' = ' + neg(x0) + '. For which values of ' + X() + ' is line ' + X('l') + ' <b>' + (above ? 'above' : 'below') + '</b> line ' + X('n') + '?') + linesFig(L1, L2, 'l', 'n'), X() + ' ' + ineqSym[sym] + ' ' + neg(x0), [X() + ' ' + ineqSym[flip(sym)] + ' ' + neg(x0), X() + ' ' + ineqSym[sym] + ' ' + neg(y0 === x0 ? y0 + 1 : y0), X() + ' ' + ineqSym[flip(sym)] + ' ' + neg(y0 === x0 ? y0 + 1 : y0)], 'Look left and right of the point of intersection. Where is the blue line ' + X('l') + ' higher (or lower) than the red line?', 'The lines intersect at (' + neg(x0) + ', ' + neg(y0) + '). ' + (sym === '>' ? 'To the right' : 'To the left') + ' of the point of intersection, line ' + X('l') + ' is ' + (above ? 'above' : 'below') + ' line ' + X('n') + '. So ' + X() + ' ' + ineqSym[sym] + ' ' + neg(x0) + '.');
  },
  function ineqContext(l) {
    const f1 = pick([20, 25, 30, 40, 50]), r1 = pick([.3, .35, .4, .45]), f2 = f1 + pick([10, 15, 20, 25]), r2 = Math.round((r1 - pick([.1, .15, .2])) * 100) / 100;
    if (r2 <= 0) return H.b1[3](l);
    const t = (f2 - f1) / (r1 - r2), ans = Number.isInteger(Math.round(t * 1e6) / 1e6) ? Math.round(t) + 1 : Math.ceil(t);
    return nu(p('Car rental A: €' + f1 + ' plus €' + r1.toFixed(2) + ' per km. Car rental B: €' + f2 + ' plus €' + r2.toFixed(2) + ' per km. From how many km (whole number) is B <b>cheaper</b> than A?'), ans, 'Solve ' + f2 + ' + ' + r2 + X('k') + ' &lt; ' + f1 + ' + ' + r1 + X('k') + '.', bal([[f2 + ' + ' + r2 + X('k') + ' &lt; ' + f1 + ' + ' + r1 + X('k'), '− ' + r1 + X('k')], [f2 + ' − ' + Math.round((r1 - r2) * 100) / 100 + X('k') + ' &lt; ' + f1, '− ' + f2], ['−' + Math.round((r1 - r2) * 100) / 100 + X('k') + ' &lt; ' + neg(f1 - f2), ': (−' + Math.round((r1 - r2) * 100) / 100 + ') — the sign turns around!'], [X('k') + ' &gt; ' + Math.round(t * 1000) / 1000]]) + p('So B is cheaper from ' + ans + ' km.'), { noStep: true });
  },
  function signTurn(l) {
    const a = nz(-6, 6), sym = pick(['<', '>', '≤', '≥']), c = nz(-20, 20) * Math.abs(a);
    return ch(p('You solve ' + lin(a, 0) + ' ' + ineqSym[sym] + ' ' + neg(c) + ' by dividing both sides by ' + neg(a) + '. Which answer is correct?'), X() + ' ' + ineqSym[a < 0 ? flip(sym) : sym] + ' ' + neg(c / a), [X() + ' ' + ineqSym[a < 0 ? sym : flip(sym)] + ' ' + neg(c / a), X() + ' ' + ineqSym[a < 0 ? flip(sym) : sym] + ' ' + neg(-c / a)], 'Dividing by a negative number turns the inequality sign around. Dividing by a positive number does not.', neg(c) + ' : ' + (a < 0 ? '(' + neg(a) + ')' : a) + ' = ' + neg(c / a) + '. ' + (a < 0 ? 'You divide by a negative number, so ' + ineqSym[sym] + ' becomes ' + ineqSym[flip(sym)] + '.' : 'You divide by a positive number, so the sign stays the same.'));
  }
];
HX.b1 = [
  function ineqFrac(l) {
    const q = pick([2, 3, 4]), b = nz(-6, 6), c = nz(-6, 6), sym = pick(['<', '≥']), k = nz(-3, 3);
    // (1/q)(x + b) sym c  -> x + b sym qc -> x sym qc - b ; or with negative factor k: k/q ... keep: −(1/q)x
    const negA = Math.random() < .5, A = negA ? -1 : 1;
    const rows = [[(negA ? '−' : '') + fr(1, q) + X() + ' ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' ' + ineqSym[sym] + ' ' + neg(c), '× ' + q], [lin(A, b * q) + ' ' + ineqSym[sym] + ' ' + neg(c * q), b > 0 ? '− ' + b * q : '+ ' + -b * q], [lin(A, 0) + ' ' + ineqSym[sym] + ' ' + neg(c * q - b * q), negA ? ': (−1) — the sign turns around!' : '']];
    const fs = negA ? flip(sym) : sym, val = (c * q - b * q) * A; if (negA) rows.push([X() + ' ' + ineqSym[fs] + ' ' + neg(val)]);
    return ineqChoice(p('Solve the inequality: ' + rows[0][0]), fs, val, 1, 'Multiply both sides by ' + q + ' first (a positive number, so the sign stays).', bal(rows));
  }
];

/* ======================= 6.3 Quadratic equations x² = c ======================= */
const fields2 = ['smallest solution: x =', 'largest solution: x ='];
const multi = (html, a, b, hint, steps, extra) => Object.assign({ type: 'multi', fields: fields2, ans: [Math.min(a, b), Math.max(a, b)], html: html + p('<small>Type the smallest solution first.</small>'), hint, steps, noStep: true, ansText: X() + ' = ' + neg(Math.min(a, b)) + ' or ' + X() + ' = ' + neg(Math.max(a, b)) }, extra || {});
const r2 = x => Math.round(x * 100) / 100;
H.a2 = [
  function howMany(l) {
    const kind = pick(['pos', 'zero', 'neg']), a = l === 0 ? 1 : pick([1, 2, 3, -1, -2]), q = ri(1, 10);
    // a(x + p)^2 + b = c  ->  (x+p)^2 = (c-b)/a
    const pp = l === 0 ? 0 : nz(-6, 6), rhs = kind === 'pos' ? q * q : kind === 'zero' ? 0 : -q, b = ri(-10, 10), c = a * rhs + b;
    const left = (a === 1 ? '' : a === -1 ? '−' : a) + (pp === 0 ? X() + '²' : '(' + lin(1, pp) + ')²') + (b === 0 ? '' : b < 0 ? ' − ' + -b : ' + ' + b);
    const ans = { pos: '2 solutions', zero: '1 solution', neg: 'no solutions' }[kind];
    return ch(p('How many solutions does this equation have? &nbsp; ' + left + ' = ' + neg(c)), ans, ['2 solutions', '1 solution', 'no solutions'], 'Rewrite it to (something)² = number. A square is never negative.', p(left + ' = ' + neg(c)) + p((pp === 0 ? X() + '²' : '(' + lin(1, pp) + ')²') + ' = ' + neg(rhs)) + p(kind === 'pos' ? 'A positive number: two solutions.' : kind === 'zero' ? 'Equal to 0: one solution.' : 'A square can never be negative: no solutions.'));
  },
  function squareEq(l) {
    const r = LR(l, 2, 12), a = l === 0 ? 1 : pick([1, 2, 3, 5]), b = l === 0 ? 0 : nz(-20, 20), c = a * r * r + b;
    const left = (a === 1 ? '' : a) + X() + '²' + (b === 0 ? '' : b < 0 ? ' − ' + -b : ' + ' + b), rows = [[left + ' = ' + c, b === 0 ? (a === 1 ? '±√' : ': ' + a) : (b > 0 ? '− ' + b : '+ ' + -b)]];
    if (b !== 0) rows.push([(a === 1 ? '' : a) + X() + '² = ' + (c - b), a === 1 ? '±√' : ': ' + a]);
    if (a !== 1) rows.push([X() + '² = ' + r * r, '±√']);
    rows.push([X() + ' = −√' + r * r + ' or ' + X() + ' = √' + r * r]); rows.push([X() + ' = ' + neg(-r) + ' or ' + X() + ' = ' + r]);
    [-r, r].forEach(x => must(a * x * x + b, c));
    return multi(p('Solve: ' + left + ' = ' + c), -r, r, 'Get ' + X() + '² alone on one side. Then take the square root: there is a positive AND a negative solution.', bal(rows));
  },
  function bracketSq(l) {
    const pp = nz(-9, 9), r = LR(l, 1, 9), k = l === 2 ? pick([2, 3]) : 1, m = l === 2 ? nz(-10, 10) : 0, c = k * r * r + m;
    const left = (k === 1 ? '' : k) + '(' + lin(1, pp) + ')²' + (m === 0 ? '' : m < 0 ? ' − ' + -m : ' + ' + m);
    const rows = [[left + ' = ' + neg(c), m !== 0 ? (m > 0 ? '− ' + m : '+ ' + -m) : k !== 1 ? ': ' + k : '±√']];
    if (m !== 0) rows.push([(k === 1 ? '' : k) + '(' + lin(1, pp) + ')² = ' + (c - m), k !== 1 ? ': ' + k : '±√']);
    if (k !== 1) rows.push(['(' + lin(1, pp) + ')² = ' + r * r, '±√']);
    rows.push([lin(1, pp) + ' = ' + neg(-r) + ' or ' + lin(1, pp) + ' = ' + r, pp > 0 ? '− ' + pp : '+ ' + -pp]);
    rows.push([X() + ' = ' + neg(-r - pp) + ' or ' + X() + ' = ' + neg(r - pp)]);
    [-r - pp, r - pp].forEach(x => must(k * (x + pp) ** 2 + m, c));
    return multi(p('Solve: ' + left + ' = ' + neg(c)), -r - pp, r - pp, 'Get the square (the part with brackets) alone. Take the square root (±). Then solve two simple equations.', bal(rows));
  },
  function roundedSq(l) {
    const pp = l === 0 ? 0 : nz(-6, 6); let c; do { c = ri(2, 40); } while (Number.isInteger(Math.sqrt(c)));
    const s = Math.sqrt(c), a = -s - pp, b = s - pp, sq = pp === 0 ? X() + '²' : '(' + lin(1, pp) + ')²';
    const rows = [[sq + ' = ' + c, '±√'], [(pp === 0 ? X() : lin(1, pp)) + ' = −√' + c + ' or ' + (pp === 0 ? X() : lin(1, pp)) + ' = √' + c, pp === 0 ? '' : pp > 0 ? '− ' + pp : '+ ' + -pp]];
    if (pp !== 0) rows.push([X() + ' = −√' + c + ' ' + (pp > 0 ? '− ' + pp : '+ ' + -pp) + ' or ' + X() + ' = √' + c + ' ' + (pp > 0 ? '− ' + pp : '+ ' + -pp)]);
    rows.push([X() + ' ≈ ' + r2(a) + ' or ' + X() + ' ≈ ' + r2(b)]);
    return multi(p('Solve: ' + sq + ' = ' + c + '. Round your answers <b>to 2 decimal places</b>.'), r2(a), r2(b), 'Take the square root on both sides: ± √' + c + '. Use your calculator at the end.', bal(rows), { tol: .0051, ansText: X() + ' ≈ ' + r2(a) + ' or ' + X() + ' ≈ ' + r2(b) });
  },
  function exactSq(l) {
    let c; do { c = ri(2, 30); } while (Number.isInteger(Math.sqrt(c)));
    const k = l === 0 ? 1 : pick([2, 3]), m = l === 0 ? 0 : ri(1, 9), right = X() + ' = −√' + c + ' or ' + X() + ' = √' + c;
    const left = (k === 1 ? '' : k) + X() + '²' + (m ? ' + ' + m : ''), rhs = k * c + m;
    return ch(p('Solve exactly: ' + left + ' = ' + rhs), right, [X() + ' = √' + c, X() + ' = −' + c / 2 + ' or ' + X() + ' = ' + c / 2, X() + ' = −√' + rhs + ' or ' + X() + ' = √' + rhs].filter(o => o !== right), 'Get ' + X() + '² alone first. Then ±√.', bal([[left + ' = ' + rhs, m ? '− ' + m : k !== 1 ? ': ' + k : '±√']].concat(m ? [[(k === 1 ? '' : k) + X() + '² = ' + k * c, k === 1 ? '±√' : ': ' + k]] : []).concat(k !== 1 ? [[X() + '² = ' + c, '±√']] : []).concat([[right]])));
  }
];
HX.a2 = [
  function cubeArea(l) {
    const z = pick([2, 3, 4, 5, 6, 7, 8, 10]), A = 6 * z * z;
    return nu(p('A cube has a total surface area of <b>' + A + ' cm²</b>. How long is one edge of the cube (in cm)?'), z, 'A cube has 6 equal square faces: area = 6' + X('z') + '². Solve 6' + X('z') + '² = ' + A + '.', bal([['6' + X('z') + '² = ' + A, ': 6'], [X('z') + '² = ' + z * z, '±√'], [X('z') + ' = −' + z + ' or ' + X('z') + ' = ' + z]]) + p('A length cannot be negative, so the edge is ' + z + ' cm.'), { noStep: true });
  },
  function negSquare(l) {
    const pp = nz(-6, 6), r = ri(1, 6), k = ri(2, 4), m = ri(1, 20), c = m - k * r * r;
    [-r - pp, r - pp].forEach(x => must(m - k * (x + pp) ** 2, c));
    return multi(p('Solve: ' + m + ' − ' + k + '(' + lin(1, pp) + ')² = ' + neg(c)), -r - pp, r - pp, 'First subtract ' + m + ' on both sides, then divide by −' + k + '.', bal([[m + ' − ' + k + '(' + lin(1, pp) + ')² = ' + neg(c), '− ' + m], ['−' + k + '(' + lin(1, pp) + ')² = ' + neg(c - m), ': (−' + k + ')'], ['(' + lin(1, pp) + ')² = ' + r * r, '±√'], [lin(1, pp) + ' = ' + neg(-r) + ' or ' + lin(1, pp) + ' = ' + r, pp > 0 ? '− ' + pp : '+ ' + -pp], [X() + ' = ' + neg(-r - pp) + ' or ' + X() + ' = ' + neg(r - pp)]]));
  }
];

/* ======================= 6.4 Factorising ======================= */
const quad = (a, b, c, v) => { v = v || 'x'; let s = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + X(v) + '²'; if (b) s += (b < 0 ? ' − ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + X(v); if (c) s += (c < 0 ? ' − ' : ' + ') + Math.abs(c); return s; };
const fac = (r, v) => '(' + lin(1, -r, v) + ')';   // (x − r)
function psTable(P, S) {   // product-sum table (whole number pairs with product P), highlight the pair with sum S
  const rows = []; for (let a = 1; a * a <= Math.abs(P); a++) if (P % a === 0) { const b = P / a; rows.push([a, b]); if (b !== -a) rows.push([-a, -b]); }
  return '<table class="tbl"><tr><th>product ' + neg(P) + '</th><th>sum ' + neg(S) + '</th></tr>' + rows.map(pr => '<tr' + (pr[0] + pr[1] === S ? ' style="background:#fde3d8"' : '') + '><td>' + neg(pr[0]) + ' × ' + neg(pr[1]) + '</td><td>' + neg(pr[0]) + ' + ' + neg(pr[1]) + ' = ' + neg(pr[0] + pr[1]) + '</td></tr>').join('') + '</table>';
}
H.b2 = [
  function productZero(l) {
    let r1, r2_; do { r1 = ri(-9, 9); r2_ = ri(-9, 9); } while (r1 === r2_);
    if (l === 2) { const a = pick([2, 3, 5]), b = nz(-12, 12); // (ax − b)(x − r2) = 0 with nice b/a
      const n = b, d = a, frac = n % d === 0; if (!frac) return H.b2[0](1);
      return multi(p('Solve: (' + lin(a, -b) + ')' + fac(r2_) + ' = 0'), b / a, r2_, 'A product is 0 when one of the factors is 0.', p(lin(a, -b) + ' = 0 or ' + lin(1, -r2_) + ' = 0') + p(lin(a, 0) + ' = ' + neg(b) + ' or ' + X() + ' = ' + neg(r2_)) + p(X() + ' = ' + neg(b / a) + ' or ' + X() + ' = ' + neg(r2_))); }
    const left = (r1 === 0 ? X() : fac(r1)) + fac(r2_);
    return multi(p('Solve: ' + left + ' = 0'), r1, r2_, 'A product is 0 when one of the factors is 0. Make each factor 0.', p((r1 === 0 ? X() : lin(1, -r1)) + ' = 0 or ' + lin(1, -r2_) + ' = 0') + p(X() + ' = ' + neg(r1) + ' or ' + X() + ' = ' + neg(r2_)));
  },
  function commonFactor(l) {
    const k = l === 0 ? 1 : pick([2, 3, 4, 5, -1, -2, -3]), r = nz(-9, 9), a = k, b = -k * r;   // k x (x - r)
    const K = k === 1 ? '' : k === -1 ? '−' : neg(k), right = K + X() + fac(r);
    const wrongs = [K + X() + fac(-r), K + X() + '(' + lin(1, b) + ')', K + fac(r), X() + '(' + lin(k, -r) + ')'];
    return ch(p('Factorise as far as possible: ' + quad(a, b, 0)), right, wrongs.filter(w => w !== right), 'Look for the highest common factor of both terms (number AND letter). Put it in front of the brackets.', 'Both terms contain ' + (k === 1 ? X() : K + X()) + '. ' + quad(a, b, 0) + ' = ' + right + '.<br>Check by expanding: ' + right + ' = ' + quad(a, b, 0) + '.');
  },
  function commonFactorEq(l) {
    const k = l === 0 ? 1 : pick([2, 3, -1, -2, 4]), r = nz(-9, 9), a = k, b = -k * r, rhs = l === 2 ? nz(-5, 5) : 0;
    const left = l === 2 ? quad(a, b + rhs, 0) + ' = ' + lin(rhs, 0) : quad(a, b, 0) + ' = 0';
    const steps = (l === 2 ? p(quad(a, b, 0) + ' = 0') : '') + p((k === 1 ? '' : k === -1 ? '−' : neg(k)) + X() + fac(r) + ' = 0') + p((k === 1 ? X() : lin(k, 0)) + ' = 0 or ' + lin(1, -r) + ' = 0') + p(X() + ' = 0 or ' + X() + ' = ' + neg(r));
    return multi(p('Solve: ' + left), 0, r, (l === 2 ? 'First make one side 0. ' : '') + 'Take ' + X() + ' (and the common number) outside the brackets. Then a product = 0.', steps);
  },
  function productSum(l) {
    let r1, r2_; do { r1 = ri(-9, 9); r2_ = ri(-9, 9); } while (r1 === r2_ || r1 === 0 || r2_ === 0 || (l === 0 && (r1 > 0 || r2_ > 0)));
    const S = -(r1 + r2_), P = r1 * r2_;
    [r1, r2_].forEach(x => must(x * x + S * x + P, 0));
    return multi(p('Solve: ' + quad(1, S, P) + ' = 0'), r1, r2_, 'Find two numbers with product ' + neg(P) + ' and sum ' + neg(S) + '. Then write (' + X() + ' + .. )(' + X() + ' + .. ) = 0.', psTable(P, S) + p(fac(r1) + fac(r2_) + ' = 0') + p(lin(1, -r1) + ' = 0 or ' + lin(1, -r2_) + ' = 0') + p(X() + ' = ' + neg(r1) + ' or ' + X() + ' = ' + neg(r2_)));
  },
  function factorTrinomial(l) {
    let r1, r2_; do { r1 = nz(-9, 9); r2_ = nz(-9, 9); } while (r1 === r2_);
    const S = -(r1 + r2_), P = r1 * r2_, right = fac(r1) + fac(r2_);
    return ch(p('Factorise: ' + quad(1, S, P)), right, [fac(-r1) + fac(-r2_), fac(r1) + fac(-r2_), fac(-r1) + fac(r2_)].filter(o => o !== right), 'Find two numbers with product ' + neg(P) + ' and sum ' + neg(S) + '.', psTable(P, S) + p(quad(1, S, P) + ' = ' + right));
  },
  function rearrange(l) {
    let r1, r2_; do { r1 = nz(-8, 8); r2_ = nz(-8, 8); } while (r1 === r2_);
    const S = -(r1 + r2_), P = r1 * r2_, m = nz(-6, 6), k = ri(-12, 12);
    // x² + (S+m)x + (P+k) = m x + k
    const left = quad(1, S + m, P + k), right = lin(m, k);
    [r1, r2_].forEach(x => must(x * x + (S + m) * x + P + k, m * x + k));
    return multi(p('Solve: ' + left + ' = ' + right), r1, r2_, 'First make the right side 0: bring all terms to the left. Then use product-sum.', p(quad(1, S, P) + ' = 0') + psTable(P, S) + p(fac(r1) + fac(r2_) + ' = 0') + p(X() + ' = ' + neg(r1) + ' or ' + X() + ' = ' + neg(r2_)));
  }
];
HX.b2 = [
  function areaEq(l) {
    const w = ri(2, 12), dd = ri(1, 8), L = w + dd, A = w * L;
    return nu(p('A rectangle is <b>' + dd + ' cm</b> longer than it is wide. Its area is <b>' + A + ' cm²</b>. Use ' + X() + ' for the width. How wide is the rectangle (in cm)?'), w, X() + '(' + X() + ' + ' + dd + ') = ' + A + '. Make one side 0 and use product-sum.', p(X() + '(' + lin(1, dd) + ') = ' + A) + p(quad(1, dd, -A) + ' = 0') + psTable(-A, dd) + p(fac(w) + fac(-L) + ' = 0') + p(X() + ' = ' + w + ' or ' + X() + ' = ' + neg(-L)) + p('A width cannot be negative, so the width is ' + w + ' cm.'), { noStep: true });
  },
  function vertexFromZeros(l) {
    const a = pick([1, -1]), r = nz(-8, 8) * 2;   // y = a x (x - r): zeros 0 and r, vertex at r/2
    const xv = r / 2, yv = a * xv * (xv - r);
    return Object.assign({ type: 'point', ans: [xv, yv], html: p('The graph of ' + X('y') + ' = ' + quad(a, -a * r, 0) + ' is a parabola. Calculate the coordinates of the <b>vertex</b>.') + p('<small>Type your answer like (3, −9).</small>'), hint: 'First find where the graph crosses the ' + X() + '-axis (' + X('y') + ' = 0). The vertex is exactly in the middle.', steps: p(quad(a, -a * r, 0) + ' = 0') + p((a === -1 ? '−' : '') + X() + fac(r) + ' = 0, so ' + X() + ' = 0 or ' + X() + ' = ' + neg(r)) + p(X() + '<sub>vertex</sub> = (0 + ' + neg(r) + ') : 2 = ' + neg(xv)) + p(X('y') + ' = ' + neg(yv)) + p('The vertex is (' + neg(xv) + ', ' + neg(yv) + ').'), noStep: true });
  }
];


/* ======================= 5.3 The quadratic formula ======================= */
const par = n => n < 0 ? '(' + neg(n) + ')' : String(n);
const Dtxt = (a, b, c) => 'D = ' + X('b') + '² − 4' + X('a') + X('c') + ' = ' + par(b) + '² − 4 · ' + par(a) + ' · ' + par(c) + ' = ' + neg(b * b - 4 * a * c);
const abcLine = (a, b, c) => X('a') + ' = ' + neg(a) + ', ' + X('b') + ' = ' + neg(b) + ' and ' + X('c') + ' = ' + neg(c);
const formula = (a, b, D, sgn) => M('(' + (b === 0 ? '' : '-' + par(b)) + (sgn < 0 ? '-' : '+') + 'sqrt(' + D + '))/(2*' + par(a) + ')');
const solveSteps = (a, b, c, roots, exact) => { const D = b * b - 4 * a * c; return p(abcLine(a, b, c)) + p(Dtxt(a, b, c)) + p(X() + ' = ' + formula(a, b, D, -1) + ' or ' + X() + ' = ' + formula(a, b, D, 1)) + p(X() + (exact ? ' = ' : ' ≈ ') + neg(roots[0]) + ' or ' + X() + (exact ? ' = ' : ' ≈ ') + neg(roots[1])); };
const nice = x => Math.round(x * 1e6) / 1e6;
const fracTxt = x => { for (const d of [1, 2, 3, 4, 5, 6, 8]) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return d === 1 ? neg(n) : (n < 0 ? '−' : '') + Math.abs(n) / gcd(Math.abs(n), d) + '/' + d / gcd(Math.abs(n), d); } return neg(r2(x)); };
G['5.3'] = [
  function readABC(l) {
    let a, b, c; do { a = nz(-5, 5); b = ri(-9, 9); c = ri(-9, 9); } while (c === 0 && b === 0);
    const terms = [[a, X() + '²'], [b, X()], [c, '']].filter(t => t[0] !== 0), order = l === 0 ? terms : shuffle(terms);
    const txt = order.map((t, i) => { const v = t[0], s = Math.abs(v) === 1 && t[1] ? t[1] : Math.abs(v) + t[1]; return (i === 0 ? (v < 0 ? '−' : '') : (v < 0 ? ' − ' : ' + ')) + s; }).join('');
    return { type: 'multi', fields: ['a =', 'b =', 'c ='], ans: [a, b, c], html: p('The equation ' + txt + ' = 0 has the form ' + X('a') + X() + '² + ' + X('b') + X() + ' + ' + X('c') + ' = 0. What are ' + X('a') + ', ' + X('b') + ' and ' + X('c') + '?'), hint: X('a') + ' is the number in front of ' + X() + '², ' + X('b') + ' the number in front of ' + X() + ' and ' + X('c') + ' the number without ' + X() + '. Take the sign with it. No term means 0.', steps: p('In the right order: ' + quad(a, b, c) + ' = 0') + p(abcLine(a, b, c)), noStep: true, ansText: abcLine(a, b, c) };
  },
  function discriminant(l) {
    const a = l === 0 ? pick([1, 2, 3]) : nz(-6, 6), b = ri(-10, 10), c = l === 0 ? ri(-9, 9) : nz(-9, 9), D = b * b - 4 * a * c;
    return nu(p('Calculate the discriminant ' + X('D') + ' = ' + X('b') + '² − 4' + X('a') + X('c') + ' of ' + quad(a, b, c) + ' = 0.'), D, 'First write down ' + X('a') + ', ' + X('b') + ' and ' + X('c') + '. Put negative numbers in brackets.', p(abcLine(a, b, c)) + p(Dtxt(a, b, c)), { needStep: true });
  },
  function numSolutions(l) {
    const kind = pick(['two', 'one', 'none']); let a, b, c;
    if (kind === 'one') { const r = nz(-6, 6), k = l === 0 ? 1 : pick([1, 2, -1, 3]); a = k; b = -2 * k * r; c = k * r * r; }
    else do { a = nz(-5, 5); b = ri(-9, 9); c = nz(-9, 9); } while ((kind === 'two') !== (b * b - 4 * a * c > 0) || b * b - 4 * a * c === 0);
    const D = b * b - 4 * a * c, right = kind === 'two' ? 'two solutions' : kind === 'one' ? 'one solution' : 'no solutions';
    return ch(p('How many solutions does ' + quad(a, b, c) + ' = 0 have?'), right, ['two solutions', 'one solution', 'no solutions'].filter(o => o !== right), 'Calculate the discriminant ' + X('D') + ' = ' + X('b') + '² − 4' + X('a') + X('c') + '. ' + X('D') + ' > 0: two, ' + X('D') + ' = 0: one, ' + X('D') + ' < 0: none.', p(abcLine(a, b, c)) + p(Dtxt(a, b, c) + (D > 0 ? ' > 0' : D < 0 ? ' < 0' : '')) + p('So the equation has ' + right + '.'));
  },
  function abcExact(l) {
    let a, r1, r2_; do { a = l === 0 ? 1 : pick([1, 2, 3, 4, -1, -2]); const dn = l === 0 ? 1 : pick([1, 2, a]); r1 = nz(-6, 6) / dn; r2_ = nz(-6, 6) / (l === 2 ? pick([1, 2, 3]) : 1); } while (r1 === r2_ || !Number.isInteger(a * (r1 + r2_)) || !Number.isInteger(a * r1 * r2_));
    const b = nice(-a * (r1 + r2_)), c = nice(a * r1 * r2_), D = b * b - 4 * a * c, rs = [r1, r2_].sort((x, y) => x - y);
    must(a * r1 * r1 + b * r1 + c, 0);
    return multi(p('Solve with the quadratic formula: ' + quad(a, b, c) + ' = 0. <small>(Fractions like 1/2 are fine.)</small>'), rs[0], rs[1], X('x') + ' = (−' + X('b') + ' ± √' + X('D') + ') / 2' + X('a') + ' with ' + X('D') + ' = ' + X('b') + '² − 4' + X('a') + X('c') + '.', solveSteps(a, b, c, [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].map(fracTxt), true), { ansText: X() + ' = ' + fracTxt(rs[0]) + ' or ' + X() + ' = ' + fracTxt(rs[1]) });
  },
  function abcRounded(l) {
    let a, b, c, D; do { a = l === 0 ? 1 : nz(-4, 5); b = ri(-9, 9); c = nz(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
    const x1 = (-b - Math.sqrt(D)) / (2 * a), x2 = (-b + Math.sqrt(D)) / (2 * a), rs = [x1, x2].map(r2);
    return multi(p('Solve with the quadratic formula: ' + quad(a, b, c) + ' = 0. Round your answers <b>to 2 decimal places</b>.'), rs[0], rs[1], 'Write down ' + X('a') + ', ' + X('b') + ', ' + X('c') + ', calculate ' + X('D') + ', then use ' + X() + ' = (−' + X('b') + ' ± √' + X('D') + ') / 2' + X('a') + '.', solveSteps(a, b, c, rs, false), { tol: .0051, ansText: X() + ' ≈ ' + Math.min(...rs) + ' or ' + X() + ' ≈ ' + Math.max(...rs) });
  },
  function abcRearrange(l) {
    let a, b, c, D; do { a = nz(-4, 5); b = ri(-9, 9); c = nz(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
    const m = nz(-3, 3), k = ri(-6, 6);   // a x² + b x + c = 0 written as (a+... ) = m x + k  ->  left side a x² + (b+m) x + (c+k)
    const left = quad(a, b + m, c + k), right = lin(m, k);
    const x1 = (-b - Math.sqrt(D)) / (2 * a), x2 = (-b + Math.sqrt(D)) / (2 * a), rs = [x1, x2].map(r2);
    must(a * x1 * x1 + (b + m) * x1 + c + k, m * x1 + k);
    return multi(p('Solve: ' + left + ' = ' + right + '. Round your answers <b>to 2 decimal places</b>.'), rs[0], rs[1], 'First make the right side 0. Then use the quadratic formula.', p(left + ' = ' + right) + p(quad(a, b, c) + ' = 0') + solveSteps(a, b, c, rs, false), { tol: .0051, ansText: X() + ' ≈ ' + Math.min(...rs) + ' or ' + X() + ' ≈ ' + Math.max(...rs) });
  }
];
XG['5.3'] = [
  function oneSolution(l) {
    const r = ri(2, 9), cc = r * r, pAns = 2 * r;   // x² + p x + c = 0 has one solution when p² = 4c
    return nu(p('For which <b>positive</b> number ' + X('p') + ' does ' + X() + '² + ' + X('p') + X() + ' + ' + cc + ' = 0 have exactly <b>one</b> solution?'), pAns, 'One solution means ' + X('D') + ' = 0.', p(X('D') + ' = ' + X('p') + '² − 4 · 1 · ' + cc + ' = ' + X('p') + '² − ' + 4 * cc) + p(X('p') + '² − ' + 4 * cc + ' = 0, so ' + X('p') + '² = ' + 4 * cc) + p(X('p') + ' = −' + pAns + ' or ' + X('p') + ' = ' + pAns + '. Positive: ' + X('p') + ' = ' + pAns + '.'), { noStep: true });
  },
  function parabolaLine(l) {
    let b, c, D; do { b = nz(-8, 8); c = nz(-12, 12); D = b * b + 4 * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
    // y = x² and y = b x + c  ->  x² − b x − c = 0
    const x1 = (b - Math.sqrt(D)) / 2, x2 = (b + Math.sqrt(D)) / 2, rs = [x1, x2].map(r2);
    return multi(p('Calculate the ' + X() + '-coordinates of the points of intersection of ' + X('y') + ' = ' + X() + '² and ' + X('y') + ' = ' + lin(b, c) + '. Round to 2 decimal places.'), rs[0], rs[1], 'Make the formulas equal and make one side 0. Then use the quadratic formula.', p(X() + '² = ' + lin(b, c)) + p(quad(1, -b, -c) + ' = 0') + solveSteps(1, -b, -c, rs, false), { tol: .0051, fields: ['smallest x =', 'largest x ='] });
  }
];
const rd = (x, d) => Math.round(x * Math.pow(10, d === undefined ? 6 : d)) / Math.pow(10, d === undefined ? 6 : d);

/* sections 5.1 and 5.2 use the 2HT generators above */
G['5.1'] = H.a1.concat(H.b1); XG['5.1'] = HX.a1.concat(HX.b1);
G['5.2'] = H.a2.concat(H.b2); XG['5.2'] = HX.a2.concat(HX.b2);

/* ======================= 5.4 Quadratic inequalities ======================= */
const OR = ' ∨ ';
/* the four interval answers for zeros a < b */
function intervals(a, b, strict) {
  const lt = strict ? '&lt;' : '≤', gt = strict ? '&gt;' : '≥', A = typeof a === 'number' ? neg(a) : a, B = typeof b === 'number' ? neg(b) : b;
  return { inside: A + ' ' + lt + ' ' + X() + ' ' + lt + ' ' + B, outside: X() + ' ' + lt + ' ' + A + OR + X() + ' ' + gt + ' ' + B };
}
function intervalQ(html, a, b, strict, inside, hint, steps) {
  const I = intervals(a, b, strict), J = intervals(a, b, !strict), right = inside ? I.inside : I.outside;
  return ch(html, right, [inside ? I.outside : I.inside, J.inside, J.outside].filter(o => o !== right), hint, steps);
}
const parabolaFig = (f, r1, r2) => { const lo = Math.min(r1, r2) - 4, hi = Math.max(r1, r2) + 4, m = Math.max(Math.abs(f((r1 + r2) / 2)), 4); const ym = Math.ceil(Math.min(m + 1, 12)); const segs = []; let prev = null; for (let x = lo; x <= hi + 1e-9; x += .1) { const y = f(x); if (prev && Math.abs(y) <= ym && Math.abs(prev[1]) <= ym) segs.push({ a: prev, b: [x, y], color: '#d1471f' }); prev = [x, y]; } return svgWrap(NX.gridSVG({ xmin: Math.floor(lo), xmax: Math.ceil(hi), ymin: -ym, ymax: ym, u: 300 / (Math.ceil(hi) - Math.floor(lo)) > 22 ? 22 : 300 / (Math.ceil(hi) - Math.floor(lo)), segs, pts: [{ x: r1, y: 0 }, { x: r2, y: 0 }] }), 300); };
G['5.4'] = [
  function readIneq(l) {
    let r1, r2_; do { r1 = ri(-6, 4); r2_ = ri(-4, 6); } while (r2_ - r1 < 2);
    const a = pick([1, -1]), f = x => a * (x - r1) * (x - r2_), want = pick(['&gt; 0', '&lt; 0', '≥ 0', '≤ 0']), strict = want[0] === '&', pos = want.includes('&gt;') || want.includes('≥'), inside = (a > 0) !== pos;
    return intervalQ(p('The graph of ' + X('f') + '(' + X() + ') = ' + (a < 0 ? '−' : '') + fac(r1) + fac(r2_) + ' is shown. Solve ' + X('f') + '(' + X() + ') ' + want + '.') + parabolaFig(f, r1, r2_), r1, r2_, strict, inside, (pos ? 'Above' : 'Below') + ' the ' + X() + '-axis: where is the graph ' + (pos ? 'above' : 'below') + ' the ' + X() + '-axis?' + (strict ? '' : ' The zeros themselves count too.'), p('The graph crosses the ' + X() + '-axis at ' + X() + ' = ' + neg(r1) + ' and ' + X() + ' = ' + neg(r2_) + '.') + p('It opens ' + (a > 0 ? 'upwards' : 'downwards') + ', so it is ' + (pos ? 'above' : 'below') + ' the axis ' + (inside ? 'between the zeros' : 'outside the zeros') + '.') + p('Solution: ' + (inside ? intervals(r1, r2_, strict).inside : intervals(r1, r2_, strict).outside)));
  },
  function solveIneq(l) {
    let r1, r2_; do { r1 = nz(-8, 8); r2_ = nz(-8, 8); } while (r1 >= r2_);
    const S = -(r1 + r2_), P = r1 * r2_, sym = pick(['&lt;', '&gt;', '≤', '≥']), strict = sym[0] === '&', pos = sym === '&gt;' || sym === '≥', inside = !pos;
    return intervalQ(p('Solve: ' + quad(1, S, P) + ' ' + sym + ' 0'), r1, r2_, strict, inside, 'First solve the equation ' + quad(1, S, P) + ' = 0. Then sketch the parabola: it opens upwards.', p('Solve ' + quad(1, S, P) + ' = 0: ' + fac(r1) + fac(r2_) + ' = 0, so ' + X() + ' = ' + neg(r1) + ' or ' + X() + ' = ' + neg(r2_) + '.') + p('The parabola opens upwards (' + X('a') + ' = 1 > 0), so it is ' + (pos ? 'above' : 'below') + ' the ' + X() + '-axis ' + (inside ? 'between' : 'outside') + ' these values.') + p('Solution: ' + (inside ? intervals(r1, r2_, strict).inside : intervals(r1, r2_, strict).outside)));
  },
  function squareIneq(l) {
    const k = l === 0 ? pick([1, 4, 9, 16, 25, 36, 49]) : ri(2, 30), sym = pick(['&lt;', '&gt;', '≤', '≥']), strict = sym[0] === '&', pos = sym === '&gt;' || sym === '≥', r = Number.isInteger(Math.sqrt(k)) ? Math.sqrt(k) : null, A = r !== null ? -r : '−√' + k, B = r !== null ? r : '√' + k;
    return intervalQ(p('Solve exactly: ' + X() + '² ' + sym + ' ' + k), A, B, strict, !pos, 'Solve ' + X() + '² = ' + k + ' first. Then think of the graph of ' + X('y') + ' = ' + X() + '² and the line ' + X('y') + ' = ' + k + '.', p(X() + '² = ' + k + ' gives ' + X() + ' = ' + (r !== null ? neg(-r) : '−√' + k) + ' or ' + X() + ' = ' + (r !== null ? r : '√' + k) + '.') + p('The parabola ' + X('y') + ' = ' + X() + '² is ' + (pos ? 'above' : 'below') + ' the line ' + X('y') + ' = ' + k + ' ' + (pos ? 'outside' : 'between') + ' these values.') + p('Solution: ' + (pos ? intervals(A, B, strict).outside : intervals(A, B, strict).inside)));
  },
  function rearrangeIneq(l) {
    let r1, r2_; do { r1 = nz(-7, 7); r2_ = nz(-7, 7); } while (r1 >= r2_);
    const a = pick([-1, 1]), S = -(r1 + r2_), P = r1 * r2_, m = nz(-5, 5), k = ri(-9, 9), sym = pick(['&lt;', '&gt;', '≤', '≥']), strict = sym[0] === '&', pos = sym === '&gt;' || sym === '≥', inside = (a > 0) !== pos;
    // a(x² + Sx + P) + (m x + k) sym m x + k
    const left = quad(a, a * S + m, a * P + k), right = lin(m, k);
    return intervalQ(p('Solve: ' + left + ' ' + sym + ' ' + right), r1, r2_, strict, inside, 'Make the right side 0 first. Then solve the equation, and sketch the parabola.', p(quad(a, a * S, a * P) + ' ' + sym + ' 0') + p('Equation: ' + quad(a, a * S, a * P) + ' = 0 gives ' + X() + ' = ' + neg(r1) + ' or ' + X() + ' = ' + neg(r2_) + '.') + p('The parabola opens ' + (a > 0 ? 'upwards' : 'downwards') + ', so it is ' + (pos ? 'above' : 'below') + ' the ' + X() + '-axis ' + (inside ? 'between' : 'outside') + ' these values.') + p('Solution: ' + (inside ? intervals(r1, r2_, strict).inside : intervals(r1, r2_, strict).outside)));
  },
  function alwaysNever(l) {
    const c = pick([2, 3, 5, 6, 7, 8, 10]), sym = pick(['&lt;', '&gt;']), right = sym === '&gt;' ? 'every number ' + X() + ' is a solution' : 'there are no solutions';
    return ch(p('Solve: ' + X() + '² + ' + c + ' ' + sym + ' 0'), right, ['every number ' + X() + ' is a solution', 'there are no solutions', '−√' + c + ' &lt; ' + X() + ' &lt; √' + c, X() + ' &lt; −√' + c + OR + X() + ' &gt; √' + c].filter(o => o !== right), X() + '² is never negative. What do you know about ' + X() + '² + ' + c + '?', X() + '² ≥ 0, so ' + X() + '² + ' + c + ' ≥ ' + c + ' &gt; 0 for every ' + X() + '. So ' + right + '.');
  }
];
XG['5.4'] = [
  function ballHeight(l) {
    const T = pick([4, 5, 6, 8]), H0 = pick([2, 4, 6]), t1 = pick([1, 2]), t2 = T - t1;   // h = −5(t − t1)(t − t2) + H0
    const a = -5, b = rd(5 * (t1 + t2)), c = rd(-5 * t1 * t2 + H0);
    return intervalQ(p('A ball follows ' + X('h') + ' = ' + quad(a, b, c, 't') + ' with ' + X('h') + ' in metres and ' + X('t') + ' in seconds. When is the ball higher than ' + H0 + ' m?'), t1, t2, true, true, 'Solve ' + X('h') + ' = ' + H0 + ' first.', p(quad(a, b, c, 't') + ' = ' + H0) + p(quad(a, b, c - H0, 't') + ' = 0, divide by −5: ' + quad(1, -(t1 + t2), t1 * t2, 't') + ' = 0') + p(fac(t1, 't') + fac(t2, 't') + ' = 0, so ' + X('t') + ' = ' + t1 + ' or ' + X('t') + ' = ' + t2) + p('The parabola opens downwards, so it is higher than ' + H0 + ' between ' + t1 + ' and ' + t2 + '.').replace(/<i>x<\/i>/g, X('t')));
  }
];

/* ======================= 5.5 Higher powers ======================= */
const sup = n => ({ 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷' })[n];
G['5.5'] = [
  function oddPower(l) {
    let n, r; do { n = pick([3, 3, 5]); r = n === 3 ? nz(-9, 9) : nz(-4, 4); } while (Math.abs(r) < 2); const c = Math.pow(r, n);
    return nu(p('Solve: ' + X() + sup(n) + ' = ' + neg(c)), r, 'For an odd power there is exactly one solution: ' + X() + ' = <sup>' + n + '</sup>√(' + neg(c) + ').', p('Check: ' + (r < 0 ? '(' + neg(r) + ')' : r) + sup(n) + ' = ' + neg(c) + '.') + p(X() + ' = <sup>' + n + '</sup>√(' + neg(c) + ') = ' + neg(r)), { noStep: true, ansText: X() + ' = ' + neg(r) });
  },
  function evenPower(l) {
    const n = pick([2, 4, 4, 6]), r = n === 6 ? ri(1, 3) : n === 4 ? ri(1, 5) : ri(2, 12), c = Math.pow(r, n);
    return multi(p('Solve: ' + X() + sup(n) + ' = ' + c), -r, r, 'For an even power and a positive number there are two solutions: ± <sup>' + n + '</sup>√' + c + '.', p(X() + ' = −<sup>' + n + '</sup>√' + c + ' or ' + X() + ' = <sup>' + n + '</sup>√' + c) + p(X() + ' = ' + neg(-r) + ' or ' + X() + ' = ' + r));
  },
  function howManyPower(l) {
    const n = ri(2, 7), c = pick([nz(-50, 50), 0]), right = c === 0 ? 'one solution' : n % 2 ? 'one solution' : c > 0 ? 'two solutions' : 'no solutions';
    return ch(p('How many solutions does ' + X() + sup(n) + ' = ' + neg(c) + ' have?'), right, ['one solution', 'two solutions', 'no solutions'].filter(o => o !== right), 'Is the power even or odd? Is the number positive, negative or 0?', c === 0 ? X() + sup(n) + ' = 0 only for ' + X() + ' = 0: one solution.' : n % 2 ? 'The power ' + n + ' is odd: always exactly one solution.' : 'The power ' + n + ' is even' + (c > 0 ? ' and ' + c + ' is positive: two solutions.' : ', so ' + X() + sup(n) + ' is never negative: no solutions.'));
  },
  function powerRounded(l) {
    const n = pick([3, 4, 5]), k = pick([2, 3, 4, 5]); let c; do { c = k * ri(3, 60); } while (Number.isInteger(rd(Math.pow(c / k, 1 / n), 6)));
    const v = c / k, r = rd(Math.pow(v, 1 / n), 2);
    if (n % 2) return nu(p('Solve: ' + k + X() + sup(n) + ' = ' + c + '. Round to 2 decimals.'), r, 'Divide by ' + k + ' first. Then take the ' + n + 'th root.', p(X() + sup(n) + ' = ' + c + ' : ' + k + ' = ' + rd(v, 4)) + p(X() + ' = <sup>' + n + '</sup>√' + rd(v, 4) + ' ≈ ' + r), { tol: .0051, ansText: X() + ' ≈ ' + r });
    return multi(p('Solve: ' + k + X() + sup(n) + ' = ' + c + '. Round to 2 decimals.'), -r, r, 'Divide by ' + k + ' first. The power is even: two solutions.', p(X() + sup(n) + ' = ' + c + ' : ' + k + ' = ' + rd(v, 4)) + p(X() + ' = −<sup>' + n + '</sup>√' + rd(v, 4) + ' or ' + X() + ' = <sup>' + n + '</sup>√' + rd(v, 4)) + p(X() + ' ≈ ' + neg(-r) + ' or ' + X() + ' ≈ ' + r), { tol: .0051, ansText: X() + ' ≈ ' + neg(-r) + ' or ' + X() + ' ≈ ' + r });
  },
  function shiftedPower(l) {
    const h = nz(-8, 8), n = pick([3, 3, 4]), r = n === 3 ? nz(-4, 4) : ri(1, 3), c = Math.pow(r, n), base = '(' + lin(1, h) + ')' + sup(n);
    if (n === 3) return nu(p('Solve: ' + base + ' = ' + neg(c)), r - h, 'First find what is inside the brackets: ' + lin(1, h) + ' = <sup>3</sup>√(' + neg(c) + ').', bal([[base + ' = ' + neg(c), '<sup>3</sup>√'], [lin(1, h) + ' = ' + neg(r), h > 0 ? '− ' + h : '+ ' + -h], [X() + ' = ' + neg(r - h)]]), { noStep: true, ansText: X() + ' = ' + neg(r - h) });
    return multi(p('Solve: ' + base + ' = ' + c), -r - h, r - h, 'The power is even: ' + lin(1, h) + ' = ± <sup>4</sup>√' + c + '.', bal([[base + ' = ' + c, '±<sup>4</sup>√'], [lin(1, h) + ' = ' + neg(-r) + ' or ' + lin(1, h) + ' = ' + r, h > 0 ? '− ' + h : '+ ' + -h], [X() + ' = ' + neg(-r - h) + ' or ' + X() + ' = ' + neg(r - h)]]));
  }
];
XG['5.5'] = [
  function boxVolume(l) {
    const x = ri(2, 6), k = pick([2, 3, 4]), V = k * k * x * x * x;
    return nu(p('A box has length ' + k + X() + ', width ' + k + X() + ' and height ' + X() + ' (in cm). Its volume is ' + V + ' cm³. Calculate ' + X() + '.'), x, 'Volume = length · width · height = ' + k * k + X() + '³.', bal([[k * k + X() + '³ = ' + V, ': ' + k * k], [X() + '³ = ' + x * x * x, '<sup>3</sup>√'], [X() + ' = ' + x]]), { noStep: true });
  },
  function sphereRadius(l) {
    const V = pick([500, 1000, 2000, 4000, 300]), r = rd(Math.pow(3 * V / (4 * Math.PI), 1 / 3), 1);
    return nu(p('The volume of a ball is ' + X('V') + ' = ' + fr(4, 3) + 'π' + X('r') + '³. A ball has a volume of ' + V + ' cm³. Calculate the radius. Round to 1 decimal.'), r, 'Solve ' + fr(4, 3) + 'π' + X('r') + '³ = ' + V + ': divide by ' + fr(4, 3) + 'π first.', p(X('r') + '³ = ' + V + ' : (' + fr(4, 3) + 'π) ≈ ' + rd(3 * V / (4 * Math.PI), 2)) + p(X('r') + ' = <sup>3</sup>√' + rd(3 * V / (4 * Math.PI), 2) + ' ≈ ' + r + ' cm'), { tol: .051 });
  }
];

/* ======================= 3VT: systems of equations, completing the square, root and fractional equations ======================= */
const VT = P.cls === '3VT';
if (VT) {
  const mu2 = (html, fields, ans, hint, steps, extra) => Object.assign({ type: 'multi', fields, ans, html, hint, steps, noStep: true }, extra || {});
  const rn = x => neg(rd(x));
  const sgnT = (c, t, first) => first ? (c < 0 ? '−' : '') + (Math.abs(c) === 1 && t ? '' : Math.abs(rd(c))) + t : (c < 0 ? ' − ' : ' + ') + (Math.abs(c) === 1 && t ? '' : Math.abs(rd(c))) + t;
  const lin2 = (a, b, c) => (a ? sgnT(a, X(), true) : '') + (b ? sgnT(b, X('y'), !a) : '') + ' = ' + rn(c);   // ax + by = c
  const sys = (e1, e2) => '<div style="margin:6px 0;padding-left:10px;border-left:3px solid #1b5fa8">' + e1 + '<br>' + e2 + '</div>';
  const xy = (x, y) => X() + ' = ' + rn(x) + ' and ' + X('y') + ' = ' + rn(y);
  const V1 = [
    function slopeForm(l) {
      let a, b, c; do { a = nz(-9, 9); b = pick(l === 0 ? [1, -1, 2, 3] : [2, 3, 4, 5, -2, -4, 6]); c = ri(-24, 24); } while (!Number.isInteger(rd(a / b * 100, 6)) || !Number.isInteger(rd(c / b * 100, 6)));
      const m = rd(-a / b), q = rd(c / b);
      return mu2(p('Write the line ' + lin2(a, b, c) + ' in the form ' + X('y') + ' = ' + X('m') + X() + ' + ' + X('b') + '. Give ' + X('m') + ' and ' + X('b') + '.'), ['m =', 'b ='], [m, q], 'Get ' + X('y') + ' on its own: first move the ' + X() + '-term to the other side, then divide by ' + neg(b) + '.', p(lin2(a, b, c)) + p((b === 1 ? '' : b === -1 ? '−' : neg(b)) + X('y') + ' = ' + rn(c) + sgnT(-a, X())) + (b === 1 ? '' : p(X('y') + ' = ' + rn(q) + sgnT(m, X()))) + p('So ' + X('m') + ' = ' + rn(m) + ' and ' + X('b') + ' = ' + rn(q) + '.'), { ansText: X('y') + ' = ' + lin(m, q) });
    },
    function axisIntercepts(l) {
      let a, b, c; do { a = nz(-6, 6); b = nz(-6, 6); c = nz(-6, 6) * a * b; } while (Math.abs(c) > 60);
      const which = Math.random() < .5 ? 'x' : 'y', v = which === 'x' ? c / a : c / b;
      return Object.assign({ type: 'point', ans: which === 'x' ? [v, 0] : [0, v], html: p('Where does the line ' + lin2(a, b, c) + ' intersect the <b>' + X(which) + '-axis</b>?') + p('<small>Type a point like (3, −2).</small>'), hint: 'On the ' + X(which) + '-axis ' + (which === 'x' ? X('y') : X()) + ' = 0.', steps: which === 'x' ? p('Substitute ' + X('y') + ' = 0: ' + sgnT(a, X(), true) + ' = ' + rn(c) + ', so ' + X() + ' = ' + rn(v) + '.') + p('The point is (' + rn(v) + ', 0).') : p('Substitute ' + X() + ' = 0: ' + sgnT(b, X('y'), true) + ' = ' + rn(c) + ', so ' + X('y') + ' = ' + rn(v) + '.') + p('The point is (0, ' + rn(v) + ').'), noStep: true });
    },
    function substitution(l) {
      const x0 = ri(-6, 6), y0 = ri(-6, 6), a1 = nz(-5, 5); let a2, b2; do { a2 = nz(-6, 6); b2 = nz(-6, 6); } while (a2 - b2 * a1 === 0);
      const c1 = a1 * x0 + y0, c2 = a2 * x0 + b2 * y0, k = a2 - b2 * a1, r = c2 - b2 * c1;
      return mu2(p('Solve the system of equations by substitution.') + sys(lin2(a1, 1, c1), lin2(a2, b2, c2)), ['x =', 'y ='], [x0, y0], 'Make ' + X('y') + ' the subject of the first equation. Substitute it into the second equation.', p('Equation 1: ' + X('y') + ' = ' + rn(c1) + sgnT(-a1, X())) + p('Substitute: ' + sgnT(a2, X(), true) + sgnT(b2, '(' + rn(c1) + sgnT(-a1, X()) + ')') + ' = ' + rn(c2)) + p(sgnT(a2, X(), true) + ' ' + (b2 * c1 < 0 ? '− ' : '+ ') + Math.abs(b2 * c1) + sgnT(-a1 * b2, X()) + ' = ' + rn(c2)) + p(sgnT(k, X(), true) + ' = ' + rn(r) + ', so ' + X() + ' = ' + rn(x0)) + p(X('y') + ' = ' + rn(c1) + ' − ' + par(a1) + ' · ' + par(x0) + ' = ' + rn(y0)), { ansText: xy(x0, y0) });
    },
    function elimination(l) {
      const x0 = ri(-6, 6), y0 = ri(-6, 6), a1 = nz(-5, 5), b1 = nz(-4, 4), k = l === 0 ? pick([1, -1]) : pick([2, 3, -2, -3]); let a2; do { a2 = nz(-6, 6); } while (a2 === -k * a1 || a2 === a1 * -k);
      const b2 = -k * b1, c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0, A = k * a1 + a2, C = k * c1 + c2;
      if (A === 0) return V1[3](l);
      return mu2(p('Solve the system of equations by elimination.') + sys(lin2(a1, b1, c1), lin2(a2, b2, c2)), ['x =', 'y ='], [x0, y0], 'Multiply the first equation by ' + neg(k) + ' so the ' + X('y') + '-terms are opposite numbers. Then add the equations.', (k === 1 ? '' : p('Equation 1 × ' + par(k) + ': ' + lin2(k * a1, k * b1, k * c1))) + p('Add: ' + sgnT(A, X(), true) + ' = ' + rn(C) + ', so ' + X() + ' = ' + rn(C) + ' : ' + par(A) + ' = ' + rn(x0)) + p('Substitute ' + X() + ' = ' + rn(x0) + ' into equation 1: ' + rn(a1 * x0) + sgnT(b1, X('y')) + ' = ' + rn(c1)) + p(sgnT(b1, X('y'), true) + ' = ' + rn(c1 - a1 * x0) + (b1 === 1 ? '' : ', so ' + X('y') + ' = ' + rn(y0))), { ansText: xy(x0, y0) });
    },
    function checkSolution(l) {
      const x0 = ri(-5, 5), y0 = ri(-5, 5), a1 = nz(-5, 5), b1 = nz(-5, 5), a2 = nz(-5, 5), b2 = nz(-5, 5), good = Math.random() < .5, off = good ? 0 : nz(-2, 2);
      const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0 + off, right = good ? 'yes, it fits both equations' : 'no';
      return ch(p('Is ' + xy(x0, y0) + ' the solution of this system?') + sys(lin2(a1, b1, c1), lin2(a2, b2, c2)), right, ['yes, it fits both equations', 'no'].filter(o => o !== right), 'Substitute the values into both equations.', p(par(a1) + ' · ' + par(x0) + ' + ' + par(b1) + ' · ' + par(y0) + ' = ' + rn(c1) + ' ✓') + p(par(a2) + ' · ' + par(x0) + ' + ' + par(b2) + ' · ' + par(y0) + ' = ' + rn(c2 - off) + (good ? ' ✓' : ', not ' + rn(c2) + ' ✗')));
    }
  ];
  const VX1 = [
    function tickets(l) {
      const pc = pick([2.5, 4, 6, 7.5]), pa = pc + pick([2.5, 3, 5]), ch_ = ri(40, 150), ad = ri(30, 120), N = ch_ + ad, R = rd(pc * ch_ + pa * ad);
      return mu2(p('A theatre sells ' + N + ' tickets: tickets for children cost € ' + pc.toFixed(2) + ' and tickets for adults € ' + pa.toFixed(2) + '. The total is € ' + R.toFixed(2) + '. How many tickets of each kind were sold?'), ['children =', 'adults ='], [ch_, ad], 'Let ' + X() + ' = children and ' + X('y') + ' = adults. Write two equations: one for the number of tickets and one for the money.', sys(X() + ' + ' + X('y') + ' = ' + N, pc + X() + ' + ' + pa + X('y') + ' = ' + R) + p(X('y') + ' = ' + N + ' − ' + X() + ', so ' + pc + X() + ' + ' + pa + '(' + N + ' − ' + X() + ') = ' + R) + p(rn(pc - pa) + X() + ' + ' + rd(pa * N) + ' = ' + R + ', so ' + rn(pc - pa) + X() + ' = ' + rn(R - pa * N)) + p(X() + ' = ' + ch_ + ' and ' + X('y') + ' = ' + N + ' − ' + ch_ + ' = ' + ad), { ansText: ch_ + ' children and ' + ad + ' adults' });
    }
  ];
  const V2 = [
    function completeSquare(l) {
      const h = l === 0 ? nz(-5, 5) : nz(-9, 9), r = l === 2 ? null : ri(1, 8), c = r === null ? ri(-20, h * h - 1) : h * h - r * r, R2 = h * h - c, s = Math.sqrt(R2);
      const a1 = rd(-h - s, 2), a2 = rd(-h + s, 2), exact = Number.isInteger(s);
      return multi(p('Solve by completing the square: ' + quad(1, 2 * h, c) + ' = 0.' + (exact ? '' : ' <small>Round to 2 decimals.</small>')), a1, a2, X() + '² ' + (h < 0 ? '−' : '+') + ' ' + Math.abs(2 * h) + X() + ' = (' + lin(1, h) + ')² − ' + h * h + '.', p('(' + lin(1, h) + ')² − ' + h * h + (c < 0 ? ' − ' + -c : ' + ' + c) + ' = 0') + p('(' + lin(1, h) + ')² = ' + R2) + p(lin(1, h) + ' = −' + (exact ? s : '√' + R2) + ' or ' + lin(1, h) + ' = ' + (exact ? s : '√' + R2)) + p(exact ? X() + ' = ' + neg(a1) + ' or ' + X() + ' = ' + neg(a2) : X() + ' = ' + neg(-h) + ' − √' + R2 + ' ≈ ' + a1 + ' or ' + X() + ' = ' + neg(-h) + ' + √' + R2 + ' ≈ ' + a2), exact ? {} : { tol: .006 });
    }
  ];
  const V4 = [
    function rootEq(l) {
      const s = ri(1, 9), a = l === 0 ? 1 : pick([2, 3, 5, -2, 4]), b = ri(-9, 9), c = l === 0 ? 0 : nz(-12, 12), d = a * s + c, x = s * s - b;
      const inside = b === 0 ? X() : lin(1, b), lhs = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '√(' + inside + ')' + (c ? (c < 0 ? ' − ' + -c : ' + ' + c) : '');
      return nu(p('Solve ' + lhs + ' = ' + neg(d) + '.'), x, 'Get the root on its own. Then square both sides. Check your answer.', (c ? p((a === 1 ? '' : neg(a)) + '√(' + inside + ') = ' + neg(a * s)) : '') + (a === 1 ? '' : p('√(' + inside + ') = ' + s)) + p(inside + ' = ' + s + '² = ' + s * s) + p(X() + ' = ' + x) + p('Check: ' + (a === 1 ? '' : neg(a) + ' · ') + '√(' + par(x) + (b ? (b < 0 ? ' − ' + -b : ' + ' + b) : '') + ')' + (c ? (c < 0 ? ' − ' + -c : ' + ' + c) : '') + ' = ' + neg(d) + ' ✓') + p('So ' + X() + ' = ' + x + '.'), { noStep: true });
    },
    function rootSolvable(l) {
      const s = ri(1, 8), a = pick([1, 2, 3, -1, -2]), c = ri(-6, 6), sign = pick([1, -1]), d = a * sign * s + c, ok = sign > 0;
      const lhs = (a === 1 ? '' : a === -1 ? '−' : neg(a)) + '√' + X() + (c ? (c < 0 ? ' − ' + -c : ' + ' + c) : ''), right = ok ? X() + ' = ' + s * s : 'no solution';
      return ch(p('Solve ' + lhs + ' = ' + neg(d) + '.'), right, [ok ? 'no solution' : X() + ' = ' + s * s, X() + ' = ' + neg(-s * s), X() + ' = ' + s].filter(o => o !== right), 'Get √' + X() + ' on its own. A square root is never negative.', p((a === 1 ? '' : a === -1 ? '−' : neg(a)) + '√' + X() + ' = ' + neg(d - c)) + p('√' + X() + ' = ' + neg(sign * s)) + p(ok ? X() + ' = ' + s + '² = ' + s * s : 'A square root cannot be negative: no solution.'));
    }
  ];
  const VX4 = [
    function soundSpeed(l) {
      const v = pick([320, 330, 340, 300]), T = rd(Math.pow(v / 20, 2) - 273, 2);
      return nu(p('The speed of sound is ' + X('v') + ' = 20√(273 + ' + X('T') + ') m/s, with ' + X('T') + ' the temperature in °C. At what temperature is the speed ' + v + ' m/s? <small>(Round to 1 decimal.)</small>'), rd(T, 1), 'Divide by 20, then square both sides.', p('√(273 + ' + X('T') + ') = ' + v + ' : 20 = ' + rd(v / 20)) + p('273 + ' + X('T') + ' = ' + rd(v / 20) + '² = ' + rd(Math.pow(v / 20, 2))) + p(X('T') + ' = ' + rd(Math.pow(v / 20, 2)) + ' − 273 ≈ ' + rd(T, 1) + ' °C'), { tol: .051, noStep: true });
    }
  ];
  const V5 = [
    function crossMultiply(l) {
      let a, b, c, d, e, x; do { b = l === 0 ? 1 : pick([2, 3, -2, 4]); x = ri(-6, 8); c = ri(-9, 9); e = pick([2, 3, 4, 5, 6]); d = nz(-6, 6); a = d * (b * x + c) / e; } while (b * x + c === 0 || !Number.isInteger(a) || a === 0 || Math.abs(a) > 40);
      const den = lin(b, c);
      return nu(p('Solve ' + fr(neg(a), den) + ' = ' + fr(neg(d), e) + '.'), x, 'Cross-multiply: ' + fr('A', 'B') + ' = ' + fr('C', 'D') + ' gives A · D = B · C.', p(neg(a) + ' · ' + e + ' = ' + neg(d) + '(' + den + ')') + p(neg(a * e) + ' = ' + lin(d * b, d * c)) + p(lin(d * b, 0) + ' = ' + neg(a * e - d * c)) + p(X() + ' = ' + neg(x)) + p('Check: the denominator ' + den + ' is not 0 for ' + X() + ' = ' + neg(x) + '.'), { noStep: true });
    },
    function notAllowed(l) {
      const b = pick([1, 2, 3, 5]), r = nz(-8, 8), c = -b * r, a = nz(-6, 6), k = ri(-9, 9), right = X() + ' = ' + neg(r);
      return ch(p('Which value of ' + X() + ' is not allowed in ' + fr(lin(a, k), lin(b, c)) + '?'), right, [X() + ' = ' + neg(-r), X() + ' = 0', X() + ' = ' + neg(c), X() + ' = ' + neg(r + 1)].filter(o => o !== right).slice(0, 3), 'You cannot divide by 0. When is the denominator 0?', lin(b, c) + ' = 0 gives ' + X() + ' = ' + neg(r) + '. So ' + X() + ' ≠ ' + neg(r) + '.');
    },
    function fracZero(l) {
      const a = nz(-5, 5), z = ri(-8, 8), b = -a * z; let q; do { q = nz(-8, 8); } while (q === z);
      const den = lin(1, -q), excl = l === 2 && Math.random() < .4, num = excl ? lin(a, -a * q) : lin(a, b), right = excl ? 'no solution' : X() + ' = ' + neg(z);
      return ch(p('Solve ' + fr(num, den) + ' = 0.'), right, [excl ? X() + ' = ' + neg(q) : 'no solution', X() + ' = ' + neg(excl ? -q : q), X() + ' = ' + neg(excl ? 0 : -z)].filter(o => o !== right), 'A fraction is 0 when the numerator is 0 and the denominator is not 0.', p('Condition: ' + den + ' ≠ 0, so ' + X() + ' ≠ ' + neg(q) + '.') + p(num + ' = 0 gives ' + X() + ' = ' + neg(excl ? q : z) + '.') + p(excl ? X() + ' = ' + neg(q) + ' is not allowed: no solution.' : 'This is allowed, so ' + X() + ' = ' + neg(z) + '.'));
    },
    function rationalZero(l) {
      let a, h, q; do { a = nz(-12, 12); h = ri(-6, 6); q = nz(-6, 6); } while (!Number.isInteger(rd(-a / q * 4, 6)));
      const den = h === 0 ? X() : lin(1, h), x = rd(-a / q - h);
      return nu(p('Calculate where the graph of ' + X('f') + '(' + X() + ') = ' + fr(neg(a), den) + (q < 0 ? ' − ' + -q : ' + ' + q) + ' intersects the ' + X() + '-axis. Give the ' + X() + '-coordinate.'), x, 'Solve ' + X('f') + '(' + X() + ') = 0: first get the fraction on its own, then cross-multiply.', p(fr(neg(a), den) + ' = ' + neg(-q)) + p(neg(a) + ' = ' + (h === 0 ? neg(-q) + ' · ' + X() : neg(-q) + '(' + den + ')')) + p(neg(a) + ' = ' + lin(-q, -q * h)) + p(lin(-q, 0) + ' = ' + rn(a + q * h)) + p(X() + ' = ' + rn(x)), { noStep: true });
    }
  ];
  const VX5 = [
    function soilMoisture(l) {
      const N = pick([280, 300, 240]), L = pick([110, 120, 100]), pct = pick([10, 20, 30, 40, 60]), d = rd(L - N / pct, 2);
      return nu(p('The moisture content of soil is ' + X('p') + ' = ' + fr(N, L + ' − ' + X('d')) + ' %, with ' + X('d') + ' the depth in cm. At what depth is the moisture content ' + pct + '%? <small>(Round to 2 decimals if needed.)</small>'), d, 'Write ' + fr(N, L + ' − ' + X('d')) + ' = ' + pct + ' and cross-multiply.', p(N + ' = ' + pct + '(' + L + ' − ' + X('d') + ')') + p(N + ' = ' + pct * L + ' − ' + pct + X('d')) + p(pct + X('d') + ' = ' + (pct * L - N)) + p(X('d') + ' = ' + d + ' cm'), { tol: .006, noStep: true });
    }
  ];
  const lin51 = H.a1.filter(f => f.name === 'intersect');
  G['5.1'] = V1.concat(lin51); XG['5.1'] = VX1;
  G['5.2'] = H.a2.concat(H.b2, G['5.3'], V2); XG['5.2'] = HX.a2.concat(HX.b2, XG['5.3']);
  G['5.3'] = H.b1.concat(G['5.4']); XG['5.3'] = HX.b1.concat(XG['5.4']);
  G['5.4'] = G['5.5'].concat(V4); XG['5.4'] = XG['5.5'].concat(VX4);
  G['5.5'] = V5; XG['5.5'] = VX5;
}

const SECTIONS = VT ? [
  { id: '5.1', title: '5.1 Systems of equations', sub: 'ax + by = c, substitution, elimination' },
  { id: '5.2', title: '5.2 Quadratic equations', sub: 'Factorising, completing the square, the quadratic formula' },
  { id: '5.3', title: '5.3 Inequalities', sub: 'Linear and quadratic inequalities' },
  { id: '5.4', title: '5.4 Power and root equations', sub: 'xⁿ = c, √ equations' },
  { id: '5.5', title: '5.5 Fractional equations', sub: 'Cross-multiplying, conditions' }
] : [
  { id: '5.1', title: '5.1 Linear equations and inequalities', sub: 'Balance method, intersections, inequalities' },
  { id: '5.2', title: '5.2 Quadratic equations', sub: 'x² = c, (x + p)² = c, factorising' },
  { id: '5.3', title: '5.3 The quadratic formula', sub: 'a, b, c, the discriminant and the formula' },
  { id: '5.4', title: '5.4 Quadratic inequalities', sub: 'Solve the equation, sketch, read off' },
  { id: '5.5', title: '5.5 Higher powers', sub: 'x³ = c, x⁴ = c and roots' }
];
const GOALS = [
  ['5.1', 'I can solve linear equations and inequalities', ['oneStep', 'bothSides', 'decimals', 'withFractions', 'lcmFractions', 'brackets', 'intersect', 'rectangleEq', 'ineqSimple', 'ineqBoth', 'ineqGraph', 'ineqContext', 'signTurn'], 'Dividing by a negative number turns the inequality sign around.'],
  ['5.2', 'I can solve quadratic equations by taking roots and by factorising', ['howMany', 'squareEq', 'bracketSq', 'roundedSq', 'exactSq', 'productZero', 'commonFactor', 'commonFactorEq', 'productSum', 'factorTrinomial', 'rearrange'], 'A · B = 0 gives A = 0 or B = 0.'],
  ['5.3', 'I can use the quadratic formula', ['readABC', 'discriminant', 'numSolutions', 'abcExact', 'abcRounded', 'abcRearrange'], 'x = (−b ± √D) / 2a with D = b² − 4ac'],
  ['5.4', 'I can solve quadratic inequalities', ['readIneq', 'solveIneq', 'squareIneq', 'rearrangeIneq', 'alwaysNever'], 'Solve the equation, sketch the graph, read off.'],
  ['5.5', 'I can solve equations with higher powers', ['oddPower', 'evenPower', 'howManyPower', 'powerRounded', 'shiftedPower'], 'Odd power: one solution. Even power: 0, 1 or 2.']
];
const GV = [
  ['5.1', 'I can solve systems of linear equations', ['slopeForm', 'axisIntercepts', 'substitution', 'elimination', 'checkSolution', 'intersect'], 'Make one variable the subject and substitute, or add multiples of the equations.'],
  ['5.2', 'I can solve quadratic equations', ['howMany', 'squareEq', 'bracketSq', 'roundedSq', 'exactSq', 'productZero', 'commonFactor', 'commonFactorEq', 'productSum', 'factorTrinomial', 'rearrange', 'readABC', 'discriminant', 'numSolutions', 'abcExact', 'abcRounded', 'abcRearrange', 'completeSquare'], 'x = (−b ± √D) / 2a with D = b² − 4ac'],
  ['5.3', 'I can solve linear and quadratic inequalities', ['ineqSimple', 'ineqBoth', 'ineqGraph', 'ineqContext', 'signTurn', 'readIneq', 'solveIneq', 'squareIneq', 'rearrangeIneq', 'alwaysNever'], 'Solve the equation first, then read off.'],
  ['5.4', 'I can solve power and root equations', ['oddPower', 'evenPower', 'howManyPower', 'powerRounded', 'shiftedPower', 'rootEq', 'rootSolvable'], 'Get the root on its own, square, and check.'],
  ['5.5', 'I can solve fractional equations', ['crossMultiply', 'notAllowed', 'fracZero', 'rationalZero'], 'A/B = C/D gives A · D = B · C. The denominator may not be 0.']
];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "3HT": [
      {"id": "D1", "title": "Lesson · 5.1 A Linear equations and inequalities", "sub": "Fri 8 Jan · ex 1, 2, 5, 6, 7, 8, 9, 10", "date": "2027-01-08", "gens": [["5.1", "oneStep"], ["5.1", "bothSides"], ["5.1", "decimals"], ["5.1", "withFractions"], ["5.1", "lcmFractions"], ["5.1", "brackets"]], "xg": [["5.1", "fracBothSides"], ["5.1", "costCompare"], ["5.1", "ineqFrac"]]},
      {"id": "D2", "title": "Lesson · 5.1 B Linear equations and inequalities", "sub": "Wed 13 Jan · ex 11, 12, 13, 14, 15", "date": "2027-01-13", "gens": [["5.1", "brackets"], ["5.1", "intersect"], ["5.1", "rectangleEq"], ["5.1", "ineqSimple"], ["5.1", "ineqBoth"]], "xg": [["5.1", "fracBothSides"], ["5.1", "costCompare"], ["5.1", "ineqFrac"]]},
      {"id": "D3", "title": "Lesson · 5.2 A Quadratic equations", "sub": "Fri 15 Jan · ex 20, 22, 23, 24, 25", "date": "2027-01-15", "gens": [["5.2", "howMany"], ["5.2", "squareEq"], ["5.2", "bracketSq"], ["5.2", "roundedSq"]], "xg": [["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"]]},
      {"id": "D4", "title": "Lesson · 5.2 B Quadratic equations", "sub": "Wed 20 Jan · ex 26, 27, 28, 29, 30, 31", "date": "2027-01-20", "gens": [["5.2", "roundedSq"], ["5.2", "exactSq"], ["5.2", "productZero"], ["5.2", "commonFactor"], ["5.2", "commonFactorEq"]], "xg": [["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"]]},
      {"id": "D5", "title": "Lesson · 5.3 A The quadratic formula", "sub": "Thu 21 Jan · ex 37, 38, 39, 40, 41", "date": "2027-01-21", "gens": [["5.3", "readABC"], ["5.3", "discriminant"], ["5.3", "numSolutions"]], "xg": [["5.3", "oneSolution"], ["5.3", "parabolaLine"]]},
      {"id": "D6", "title": "Lesson · 5.3 B The quadratic formula", "sub": "Wed 27 Jan · ex 43, 45, 46, 47, 49, 50", "date": "2027-01-27", "gens": [["5.3", "numSolutions"], ["5.3", "abcExact"], ["5.3", "abcRounded"]], "xg": [["5.3", "oneSolution"], ["5.3", "parabolaLine"]]},
      {"id": "D7", "title": "Lesson · 5.4 A Quadratic inequalities", "sub": "Thu 28 Jan · ex 55, 56, 57, 58", "date": "2027-01-28", "gens": [["5.4", "readIneq"], ["5.4", "solveIneq"], ["5.4", "squareIneq"]], "xg": [["5.4", "ballHeight"]]},
      {"id": "D8", "title": "Lesson · 5.4 B Quadratic inequalities", "sub": "Fri 29 Jan · ex 59, 60, 61, 62", "date": "2027-01-29", "gens": [["5.4", "solveIneq"], ["5.4", "squareIneq"], ["5.4", "rearrangeIneq"]], "xg": [["5.4", "ballHeight"]]},
      {"id": "D9", "title": "Lesson · 5.5 A Higher powers", "sub": "Wed 3 Feb · ex 65, 66, 67, 68, 69", "date": "2027-02-03", "gens": [["5.5", "oddPower"], ["5.5", "evenPower"], ["5.5", "howManyPower"], ["5.5", "powerRounded"], ["5.5", "shiftedPower"]], "xg": [["5.5", "boxVolume"], ["5.5", "sphereRadius"]]},
      {"id": "D10", "title": "Lesson · 5.5 B Higher powers", "sub": "Thu 4 Feb · ex 70, 71, 72, 73, 74", "date": "2027-02-04", "gens": [["5.5", "howManyPower"], ["5.5", "powerRounded"], ["5.5", "shiftedPower"]], "xg": [["5.5", "boxVolume"], ["5.5", "sphereRadius"]]},
      {"id": "D11", "title": "Lesson · 5.5 C Higher powers", "sub": "Fri 5 Feb · ex 75, 76, 77, 78", "date": "2027-02-05", "gens": [["5.5", "howManyPower"], ["5.5", "powerRounded"], ["5.5", "shiftedPower"]], "xg": [["5.5", "boxVolume"], ["5.5", "sphereRadius"]]},
      {"id": "D12", "title": "Test prep · chapter 5", "sub": "Thu 11 Feb", "date": "2027-02-11", "gens": [["5.1", "oneStep"], ["5.1", "bothSides"], ["5.1", "decimals"], ["5.1", "withFractions"], ["5.1", "lcmFractions"], ["5.1", "brackets"], ["5.1", "intersect"], ["5.1", "rectangleEq"], ["5.1", "ineqSimple"], ["5.1", "ineqBoth"], ["5.1", "ineqGraph"], ["5.1", "ineqContext"], ["5.1", "signTurn"], ["5.2", "howMany"], ["5.2", "squareEq"], ["5.2", "bracketSq"], ["5.2", "roundedSq"], ["5.2", "exactSq"], ["5.2", "productZero"], ["5.2", "commonFactor"], ["5.2", "commonFactorEq"], ["5.2", "productSum"], ["5.2", "factorTrinomial"], ["5.2", "rearrange"], ["5.3", "readABC"], ["5.3", "discriminant"], ["5.3", "numSolutions"], ["5.3", "abcExact"], ["5.3", "abcRounded"], ["5.3", "abcRearrange"], ["5.4", "readIneq"], ["5.4", "solveIneq"], ["5.4", "squareIneq"], ["5.4", "rearrangeIneq"], ["5.4", "alwaysNever"], ["5.5", "oddPower"], ["5.5", "evenPower"], ["5.5", "howManyPower"], ["5.5", "powerRounded"], ["5.5", "shiftedPower"]], "xg": [["5.1", "fracBothSides"], ["5.1", "costCompare"], ["5.1", "ineqFrac"], ["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.3", "oneSolution"], ["5.3", "parabolaLine"], ["5.4", "ballHeight"], ["5.5", "boxVolume"], ["5.5", "sphereRadius"]], "rev": true},
      {"id": "D13", "title": "Test prep · chapters 5 & 6", "sub": "Fri 12 Mar", "date": "2027-03-12", "gens": [["5.1", "oneStep"], ["5.1", "bothSides"], ["5.1", "decimals"], ["5.1", "withFractions"], ["5.1", "lcmFractions"], ["5.1", "brackets"], ["5.1", "intersect"], ["5.1", "rectangleEq"], ["5.1", "ineqSimple"], ["5.1", "ineqBoth"], ["5.1", "ineqGraph"], ["5.1", "ineqContext"], ["5.1", "signTurn"], ["5.2", "howMany"], ["5.2", "squareEq"], ["5.2", "bracketSq"], ["5.2", "roundedSq"], ["5.2", "exactSq"], ["5.2", "productZero"], ["5.2", "commonFactor"], ["5.2", "commonFactorEq"], ["5.2", "productSum"], ["5.2", "factorTrinomial"], ["5.2", "rearrange"], ["5.3", "readABC"], ["5.3", "discriminant"], ["5.3", "numSolutions"], ["5.3", "abcExact"], ["5.3", "abcRounded"], ["5.3", "abcRearrange"], ["5.4", "readIneq"], ["5.4", "solveIneq"], ["5.4", "squareIneq"], ["5.4", "rearrangeIneq"], ["5.4", "alwaysNever"], ["5.5", "oddPower"], ["5.5", "evenPower"], ["5.5", "howManyPower"], ["5.5", "powerRounded"], ["5.5", "shiftedPower"]], "xg": [["5.1", "fracBothSides"], ["5.1", "costCompare"], ["5.1", "ineqFrac"], ["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.3", "oneSolution"], ["5.3", "parabolaLine"], ["5.4", "ballHeight"], ["5.5", "boxVolume"], ["5.5", "sphereRadius"]], "rev": true}
    ],
    "3VT": [
      {"id": "D1", "title": "Lesson · 5.1 A Systems of equations", "sub": "Tue 2 Feb · ex 1, 2, 9, 10, 11, 12", "date": "2027-02-02", "gens": [["5.1", "slopeForm"], ["5.1", "axisIntercepts"], ["5.1", "substitution"]], "xg": [["5.1", "tickets"]]},
      {"id": "D2", "title": "Lesson · 5.1 B Systems of equations", "sub": "Thu 4 Feb · ex 13, 14, 15, 16, 17", "date": "2027-02-04", "gens": [["5.1", "slopeForm"], ["5.1", "axisIntercepts"], ["5.1", "substitution"]], "xg": [["5.1", "tickets"]]},
      {"id": "D3", "title": "Lesson · 5.1 C Systems of equations", "sub": "Fri 5 Feb · ex 18, 19, 20, 21, 22", "date": "2027-02-05", "gens": [["5.1", "substitution"], ["5.1", "elimination"], ["5.1", "checkSolution"]], "xg": [["5.1", "tickets"]]},
      {"id": "D4", "title": "Lesson · 5.1 Systems of equations + 5.2 Quadratic equations", "sub": "Tue 9 Feb · ex 23, 24, 29, 30, 31", "date": "2027-02-09", "gens": [["5.1", "substitution"], ["5.1", "elimination"], ["5.1", "checkSolution"], ["5.2", "howMany"], ["5.2", "squareEq"], ["5.2", "bracketSq"]], "xg": [["5.1", "tickets"], ["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.2", "oneSolution"], ["5.2", "parabolaLine"]]},
      {"id": "D5", "title": "Lesson · 5.2 A Quadratic equations", "sub": "Thu 11 Feb · ex 32, 33, 34, 35, 36", "date": "2027-02-11", "gens": [["5.2", "bracketSq"], ["5.2", "roundedSq"], ["5.2", "exactSq"], ["5.2", "productZero"], ["5.2", "commonFactor"], ["5.2", "commonFactorEq"]], "xg": [["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.2", "oneSolution"], ["5.2", "parabolaLine"]]},
      {"id": "D6", "title": "Lesson · 5.2 B Quadratic equations", "sub": "Fri 12 Feb · ex 37, 38, 39, 40, 41, 42", "date": "2027-02-12", "gens": [["5.2", "commonFactorEq"], ["5.2", "productSum"], ["5.2", "factorTrinomial"], ["5.2", "rearrange"], ["5.2", "readABC"], ["5.2", "discriminant"], ["5.2", "numSolutions"]], "xg": [["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.2", "oneSolution"], ["5.2", "parabolaLine"]]},
      {"id": "D7", "title": "Lesson · 5.2 Quadratic equations + 5.3 Inequalities", "sub": "Tue 16 Feb · ex 43, 44, 48, 49, 50", "date": "2027-02-16", "gens": [["5.2", "readABC"], ["5.2", "discriminant"], ["5.2", "numSolutions"], ["5.3", "ineqSimple"], ["5.3", "ineqBoth"], ["5.3", "ineqGraph"]], "xg": [["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.2", "oneSolution"], ["5.2", "parabolaLine"], ["5.3", "ineqFrac"], ["5.3", "ballHeight"]]},
      {"id": "D8", "title": "Lesson · 5.3 A Inequalities", "sub": "Thu 18 Feb · ex 51, 52, 53, 54, 55", "date": "2027-02-18", "gens": [["5.3", "ineqBoth"], ["5.3", "ineqGraph"], ["5.3", "ineqContext"], ["5.3", "signTurn"]], "xg": [["5.3", "ineqFrac"], ["5.3", "ballHeight"]]},
      {"id": "D9", "title": "Lesson · 5.3 B Inequalities", "sub": "Fri 19 Feb · ex 56, 57, 58, 59, 60", "date": "2027-02-19", "gens": [["5.3", "signTurn"], ["5.3", "readIneq"], ["5.3", "solveIneq"], ["5.3", "squareIneq"]], "xg": [["5.3", "ineqFrac"], ["5.3", "ballHeight"]]},
      {"id": "D10", "title": "Lesson · 5.4 A Power and root equations", "sub": "Tue 2 Mar · ex 65, 66, 67, 68, 69", "date": "2027-03-02", "gens": [["5.4", "oddPower"], ["5.4", "evenPower"], ["5.4", "howManyPower"]], "xg": [["5.4", "boxVolume"], ["5.4", "sphereRadius"], ["5.4", "soundSpeed"]]},
      {"id": "D11", "title": "Lesson · 5.4 B Power and root equations", "sub": "Thu 4 Mar · ex 70, 71, 72, 73, 74", "date": "2027-03-04", "gens": [["5.4", "howManyPower"], ["5.4", "powerRounded"], ["5.4", "shiftedPower"]], "xg": [["5.4", "boxVolume"], ["5.4", "sphereRadius"], ["5.4", "soundSpeed"]]},
      {"id": "D12", "title": "Lesson · 5.4 C Power and root equations", "sub": "Fri 5 Mar · ex 75, 76, 77, 78", "date": "2027-03-05", "gens": [["5.4", "powerRounded"], ["5.4", "shiftedPower"], ["5.4", "rootEq"]], "xg": [["5.4", "boxVolume"], ["5.4", "sphereRadius"], ["5.4", "soundSpeed"]]},
      {"id": "D13", "title": "Lesson · 5.5 A Fractional equations", "sub": "Tue 9 Mar · ex 82, 83, 84, 85, 86", "date": "2027-03-09", "gens": [["5.5", "crossMultiply"], ["5.5", "notAllowed"], ["5.5", "fracZero"], ["5.5", "rationalZero"]], "xg": [["5.5", "soilMoisture"]]},
      {"id": "D14", "title": "Lesson · 5.5 B Fractional equations", "sub": "Thu 11 Mar · ex 87, 88, 89, 90", "date": "2027-03-11", "gens": [["5.5", "notAllowed"], ["5.5", "fracZero"], ["5.5", "rationalZero"]], "xg": [["5.5", "soilMoisture"]]},
      {"id": "D15", "title": "Lesson · 5.5 C Fractional equations", "sub": "Fri 12 Mar · ex 91, 92, 93, 94, 95", "date": "2027-03-12", "gens": [["5.5", "notAllowed"], ["5.5", "fracZero"], ["5.5", "rationalZero"]], "xg": [["5.5", "soilMoisture"]]},
      {"id": "D16", "title": "Test prep · chapters 3 & 5", "sub": "Tue 16 Mar", "date": "2027-03-16", "gens": [["5.1", "slopeForm"], ["5.1", "axisIntercepts"], ["5.1", "substitution"], ["5.1", "elimination"], ["5.1", "checkSolution"], ["5.1", "intersect"], ["5.2", "howMany"], ["5.2", "squareEq"], ["5.2", "bracketSq"], ["5.2", "roundedSq"], ["5.2", "exactSq"], ["5.2", "productZero"], ["5.2", "commonFactor"], ["5.2", "commonFactorEq"], ["5.2", "productSum"], ["5.2", "factorTrinomial"], ["5.2", "rearrange"], ["5.2", "readABC"], ["5.2", "discriminant"], ["5.2", "numSolutions"], ["5.2", "abcExact"], ["5.2", "abcRounded"], ["5.2", "abcRearrange"], ["5.2", "completeSquare"], ["5.3", "ineqSimple"], ["5.3", "ineqBoth"], ["5.3", "ineqGraph"], ["5.3", "ineqContext"], ["5.3", "signTurn"], ["5.3", "readIneq"], ["5.3", "solveIneq"], ["5.3", "squareIneq"], ["5.3", "rearrangeIneq"], ["5.3", "alwaysNever"], ["5.4", "oddPower"], ["5.4", "evenPower"], ["5.4", "howManyPower"], ["5.4", "powerRounded"], ["5.4", "shiftedPower"], ["5.4", "rootEq"], ["5.4", "rootSolvable"], ["5.5", "crossMultiply"], ["5.5", "notAllowed"], ["5.5", "fracZero"], ["5.5", "rationalZero"]], "xg": [["5.1", "tickets"], ["5.2", "cubeArea"], ["5.2", "negSquare"], ["5.2", "areaEq"], ["5.2", "vertexFromZeros"], ["5.2", "oneSolution"], ["5.2", "parabolaLine"], ["5.3", "ineqFrac"], ["5.3", "ballHeight"], ["5.4", "boxVolume"], ["5.4", "sphereRadius"], ["5.4", "soundSpeed"], ["5.5", "soilMoisture"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: o.xg.filter(g => __has(XG, g)) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-' + P.cls.toLowerCase() + '-ch5-v1', SECTIONS, LESSONS: __LESSONS, G, XG, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS: VT ? GV : GOALS };
