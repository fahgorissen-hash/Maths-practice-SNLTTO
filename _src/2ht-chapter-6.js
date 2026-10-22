const { ri, pick, shuffle, gcd, M, fr, ratText } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

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
  q.noStep = true; q.ansText = X(v) + ' = ' + fv(n, d, true); return Object.assign(q, extra || {});
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
G['6.1'] = [
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
    const a = pick([.5, 1.5, 2.5, .25, .75, 1.25]), c = pick([2, 1.5, -1.75, .5, 3.5, -.5]); if (a === c) return G['6.1'][2](l);
    const x = ri(-8, 8) * (l === 2 ? .5 : 1), b = pick([-6, -4, -3, 2, 3, 4, 6]), d = Math.round((a * x + b - c * x) * 1e6) / 1e6;
    const st = [[lin(a, b) + ' = ' + lin(c, d), (b > 0 ? '− ' + b : '+ ' + -b)], [lin(a, 0) + ' = ' + lin(c, Math.round((d - b) * 1e6) / 1e6), c > 0 ? '− ' + lin(c, 0) : '+ ' + lin(-c, 0)], [lin(Math.round((a - c) * 1e6) / 1e6, 0) + ' = ' + neg(Math.round((d - b) * 1e6) / 1e6), ': ' + (a - c < 0 ? '(' + neg(a - c) + ')' : a - c)], [X() + ' = ' + neg(x)]];
    return nu(p('Solve: ' + lin(a, b) + ' = ' + lin(c, d)), x, 'Decimals work the same as whole numbers. You can also first multiply both sides by 4 (or 2) to get rid of the decimals.', bal(st), { noStep: true, ansText: X() + ' = ' + neg(x) });
  },
  function withFractions(l) {
    // (p/q)x + r = s with nice numbers: multiply by q
    const q = pick([2, 3, 4, 5]), pp = l === 0 ? 1 : ri(1, q - 1), x = ri(-6, 9) * q, r = nz(-8, 8), s = pp * x / q + r;
    if (gcd(pp, q) !== 1) return G['6.1'][3](l);
    const rows = [[fr(pp, q) + X() + ' ' + (r < 0 ? '− ' + -r : '+ ' + r) + ' = ' + neg(s), '× ' + q], [lin(pp, r * q) + ' = ' + neg(s * q), r > 0 ? '− ' + r * q : '+ ' + -r * q], [lin(pp, 0) + ' = ' + neg(s * q - r * q), pp === 1 ? '' : ': ' + pp]];
    if (pp !== 1) rows.push([X() + ' = ' + fv(s * q - r * q, pp, true)]);
    return solQ(p('Solve: ' + fr(pp, q) + X() + ' ' + (r < 0 ? '− ' + -r : '+ ' + r) + ' = ' + neg(s)), s * q - r * q, pp, 'x', 'First multiply both sides by ' + q + ' to get rid of the fraction.', bal(rows));
  },
  function lcmFractions(l) {
    // (a/q1)x + b = (c/q2)x + d : multiply by lcm
    const q1 = pick([2, 3, 4, 6]), q2 = pick([2, 3, 4, 5, 6].filter(z => z !== q1)), m = q1 * q2 / gcd(q1, q2);
    const a = pick([1, 1, 2, 3].filter(z => gcd(z, q1) === 1)), c = pick([1, 1, 2, 5].filter(z => gcd(z, q2) === 1)), b = nz(-6, 6), d = nz(-6, 6);
    const A = a * m / q1, C = c * m / q2; if (A === C) return G['6.1'][4](l);
    const s = solveLin(A, b * m, C, d * m);
    const head = [fr(a, q1) + X() + ' ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' = ' + fr(c, q2) + X() + ' ' + (d < 0 ? '− ' + -d : '+ ' + d), '× ' + m];
    return solQ(p('Solve: ' + head[0]), s.n, s.d, 'x', 'Multiply both sides by ' + m + ', the lowest common multiple of ' + q1 + ' and ' + q2 + '. Then use the balance method.', p('Multiply by ' + m + ' (the LCM of ' + q1 + ' and ' + q2 + ').') + bal([head].concat(s.rows)));
  },
  function brackets(l) {
    const k = nz(-6, 6), h = nz(-9, 9), b = ri(-10, 10), c = nz(-5, 5), d = ri(-12, 12);
    if (k === c) return G['6.1'][5](l);
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
    return nu(p('A rectangle is <b>' + dd + ' cm</b> longer than it is wide. Its perimeter is <b>' + P + ' cm</b>. Use ' + X() + ' for the width. Set up an equation and calculate the <b>width</b> (in cm).'), w, 'The length is ' + X() + ' + ' + dd + '. Perimeter = 2 · width + 2 · length.', p('2' + X() + ' + 2(' + X() + ' + ' + dd + ') = ' + P) + bal([['2' + X() + ' + 2' + X() + ' + ' + 2 * dd + ' = ' + P, '− ' + 2 * dd], ['4' + X() + ' = ' + (P - 2 * dd), ': 4'], [X() + ' = ' + w]]) + p('The length is ' + len + ' cm and the width is ' + w + ' cm.'), { noStep: true });
  }
];
XG['6.1'] = [
  function fracBothSides(l) {
    const q = pick([3, 4, 5, 6]), a = pick([1, 2].filter(z => gcd(z, q) === 1)), c = pick([1, 2, 3]), b = nz(-8, 8), d = nz(-8, 8);
    const A = a, C = c * q; if (A === C) return XG['6.1'][0](l);
    const s = solveLin(A, b * q, C, d * q), head = [fr(a, q) + X() + ' ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' = ' + lin(c, d), '× ' + q];
    return solQ(p('Solve: ' + head[0]), s.n, s.d, 'x', 'Multiply BOTH sides (every term!) by ' + q + '.', bal([head].concat(s.rows)));
  },
  function costCompare(l) {
    const f1 = pick([5, 8, 10, 12, 15]), r1 = pick([.2, .25, .3, .4]), f2 = f1 + pick([5, 10, 15, 20]), r2 = r1 - pick([.05, .1, .15].filter(z => z < r1));
    const t = Math.round((f2 - f1) / (r1 - r2) * 1000) / 1000;
    if (!Number.isInteger(t)) return XG['6.1'][1](l);
    return nu(p('Phone plan A costs €' + f1 + ' per month plus €' + r1.toFixed(2) + ' per minute. Plan B costs €' + f2 + ' per month plus €' + r2.toFixed(2) + ' per minute. For how many minutes do both plans cost the <b>same</b>?'), t, 'Write a formula for each plan with ' + X('t') + ' minutes. Make them equal and solve.', p('A: ' + f1 + ' + ' + r1 + X('t') + ' &nbsp; B: ' + f2 + ' + ' + Math.round(r2 * 100) / 100 + X('t')) + bal([[f1 + ' + ' + r1 + X('t') + ' = ' + f2 + ' + ' + Math.round(r2 * 100) / 100 + X('t'), '− ' + Math.round(r2 * 100) / 100 + X('t')], [f1 + ' + ' + Math.round((r1 - r2) * 100) / 100 + X('t') + ' = ' + f2, '− ' + f1], [Math.round((r1 - r2) * 100) / 100 + X('t') + ' = ' + (f2 - f1), ': ' + Math.round((r1 - r2) * 100) / 100], [X('t') + ' = ' + t]]) + p('After ' + t + ' minutes both plans cost the same.'), { noStep: true });
  }
];

/* ======================= 6.2 Inequalities ======================= */
function ineqChoice(html, sym, n, d, hint, steps) {
  const val = fv(n, d, true), opts = ['<', '>', '≤', '≥'].map(s => X() + ' ' + ineqSym[s] + ' ' + val);
  return ch(html, X() + ' ' + ineqSym[sym] + ' ' + val, opts.filter(o => o !== X() + ' ' + ineqSym[sym] + ' ' + val), hint, steps);
}
G['6.2'] = [
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
    if (r2 <= 0) return G['6.2'][3](l);
    const t = (f2 - f1) / (r1 - r2), ans = Number.isInteger(Math.round(t * 1e6) / 1e6) ? Math.round(t) + 1 : Math.ceil(t);
    return nu(p('Car rental A: €' + f1 + ' plus €' + r1.toFixed(2) + ' per km. Car rental B: €' + f2 + ' plus €' + r2.toFixed(2) + ' per km. From how many km (whole number) is B <b>cheaper</b> than A?'), ans, 'Solve ' + f2 + ' + ' + r2 + X('k') + ' &lt; ' + f1 + ' + ' + r1 + X('k') + '.', bal([[f2 + ' + ' + r2 + X('k') + ' &lt; ' + f1 + ' + ' + r1 + X('k'), '− ' + r1 + X('k')], [f2 + ' − ' + Math.round((r1 - r2) * 100) / 100 + X('k') + ' &lt; ' + f1, '− ' + f2], ['−' + Math.round((r1 - r2) * 100) / 100 + X('k') + ' &lt; ' + neg(f1 - f2), ': (−' + Math.round((r1 - r2) * 100) / 100 + ') — the sign turns around!'], [X('k') + ' &gt; ' + Math.round(t * 1000) / 1000]]) + p('So B is cheaper from ' + ans + ' km.'), { noStep: true });
  },
  function signTurn(l) {
    const a = nz(-6, 6), sym = pick(['<', '>', '≤', '≥']), c = nz(-20, 20) * Math.abs(a);
    return ch(p('You solve ' + lin(a, 0) + ' ' + ineqSym[sym] + ' ' + neg(c) + ' by dividing both sides by ' + neg(a) + '. Which answer is correct?'), X() + ' ' + ineqSym[a < 0 ? flip(sym) : sym] + ' ' + neg(c / a), [X() + ' ' + ineqSym[a < 0 ? sym : flip(sym)] + ' ' + neg(c / a), X() + ' ' + ineqSym[a < 0 ? flip(sym) : sym] + ' ' + neg(-c / a)], 'Dividing by a negative number turns the inequality sign around. Dividing by a positive number does not.', neg(c) + ' : ' + (a < 0 ? '(' + neg(a) + ')' : a) + ' = ' + neg(c / a) + '. ' + (a < 0 ? 'You divide by a negative number, so ' + ineqSym[sym] + ' becomes ' + ineqSym[flip(sym)] + '.' : 'You divide by a positive number, so the sign stays the same.'));
  }
];
XG['6.2'] = [
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
G['6.3'] = [
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
XG['6.3'] = [
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
G['6.4'] = [
  function productZero(l) {
    let r1, r2_; do { r1 = ri(-9, 9); r2_ = ri(-9, 9); } while (r1 === r2_);
    if (l === 2) { const a = pick([2, 3, 5]), b = nz(-12, 12); // (ax − b)(x − r2) = 0 with nice b/a
      const n = b, d = a, frac = n % d === 0; if (!frac) return G['6.4'][0](1);
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
XG['6.4'] = [
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

/* ======================= 6.5 The quadratic formula (2VT only; not in the 2 havo programme) ======================= */
const VT = P.cls !== '2HT';
if (VT) {
  const par = n => n < 0 ? '(' + neg(n) + ')' : String(n);
  const Dtxt = (a, b, c) => 'D = ' + X('b') + '² − 4' + X('a') + X('c') + ' = ' + par(b) + '² − 4 · ' + par(a) + ' · ' + par(c) + ' = ' + neg(b * b - 4 * a * c);
  const abcLine = (a, b, c) => X('a') + ' = ' + neg(a) + ', ' + X('b') + ' = ' + neg(b) + ' and ' + X('c') + ' = ' + neg(c);
  const formula = (a, b, D, sgn) => M('(' + (b === 0 ? '' : '-' + par(b)) + (sgn < 0 ? '-' : '+') + 'sqrt(' + D + '))/(2*' + par(a) + ')');
  const solveSteps = (a, b, c, roots, exact) => { const D = b * b - 4 * a * c; return p(abcLine(a, b, c)) + p(Dtxt(a, b, c)) + p(X() + ' = ' + formula(a, b, D, -1) + ' or ' + X() + ' = ' + formula(a, b, D, 1)) + p(X() + (exact ? ' = ' : ' ≈ ') + neg(roots[0]) + ' or ' + X() + (exact ? ' = ' : ' ≈ ') + neg(roots[1])); };
  const nice = x => Math.round(x * 1e6) / 1e6;
  const fracTxt = x => { for (const d of [1, 2, 3, 4, 5, 6, 8]) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return d === 1 ? neg(n) : (n < 0 ? '−' : '') + Math.abs(n) / gcd(Math.abs(n), d) + '/' + d / gcd(Math.abs(n), d); } return neg(r2(x)); };
  G['6.5'] = [
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
  XG['6.5'] = [
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
}

const SECTIONS = [
  { id: '6.1', title: '6.1 Linear equations', sub: 'Balance method, fractions, brackets, intersections' },
  { id: '6.2', title: '6.2 Inequalities', sub: '<, >, ≤, ≥ and turning the sign around' },
  { id: '6.3', title: '6.3 Quadratic equations', sub: 'x² = c and (x + p)² = c' },
  { id: '6.4', title: '6.4 Factorising', sub: 'Product = 0, common factor, product-sum' }
].concat(VT ? [{ id: '6.5', title: '6.5 The quadratic formula', sub: 'a, b, c, the discriminant and the formula' }] : []);
const GOALS = [
  ['6.1', 'I can solve a linear equation with the balance method', ['oneStep', 'bothSides', 'decimals', 'brackets'], 'Do the same on both sides until ' + 'x = number.'],
  ['6.1', 'I can solve an equation with fractions', ['withFractions', 'lcmFractions'], 'Multiply both sides by the lowest common multiple of the denominators.'],
  ['6.1', 'I can calculate the point of intersection of two lines', ['intersect', 'rectangleEq'], 'Make the formulas equal.'],
  ['6.2', 'I can solve an inequality', ['ineqSimple', 'ineqBoth', 'signTurn'], 'Dividing or multiplying by a negative number turns the sign around.'],
  ['6.2', 'I can use graphs and contexts with inequalities', ['ineqGraph', 'ineqContext']],
  ['6.3', 'I can solve x² = c and (x + p)² = c', ['howMany', 'squareEq', 'bracketSq', 'roundedSq', 'exactSq'], 'Do not forget the negative solution.'],
  ['6.4', 'I can solve an equation of the form A · B = 0', ['productZero', 'commonFactorEq'], 'A · B = 0 means A = 0 or B = 0.'],
  ['6.4', 'I can factorise with a common factor or the product-sum method', ['commonFactor', 'productSum', 'factorTrinomial', 'rearrange'], 'Product-sum: two numbers with product c and sum b.']
].concat(VT ? [
  ['6.5', 'I can use the discriminant to find the number of solutions', ['readABC', 'discriminant', 'numSolutions'], 'D > 0: two solutions, D = 0: one, D < 0: none.'],
  ['6.5', 'I can solve a quadratic equation with the quadratic formula', ['abcExact', 'abcRounded', 'abcRearrange'], 'x = (−b ± √D) / 2a']
] : []);
return { key: 'nx-' + P.cls.toLowerCase() + '-ch6-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
