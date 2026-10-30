const { ri, pick, shuffle } = NX;
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => { d = d === undefined ? 6 : d; return Math.round(x * Math.pow(10, d) + 1e-9) / Math.pow(10, d); };
const nz = (a, b) => { let v = 0; while (v === 0) v = ri(a, b); return v; };
const neg = n => (n < 0 ? '−' : '') + String(rd(Math.abs(n)));
const par = n => n < 0 ? '(' + neg(n) + ')' : neg(n);
const X = v => '<i>' + (v || 'x') + '</i>';
const sp = n => { const s = String(n), m = s.split('.'); m[0] = m[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); return m.join('.'); };
const F = (f, a) => X(f || 'f') + '(' + a + ')';
function poly(terms) { let s = ''; terms.forEach(t => { const c = rd(t[0]), v = t[1]; if (c === 0) return; const ab = Math.abs(c), body = v && ab === 1 ? v : neg(ab) + v; s += s === '' ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body; }); return s === '' ? '0' : s; }
const lin = (m, b) => poly([[m, X()], [b, '']]);
const quad = (a, b, c) => poly([[a, X() + '²'], [b, X()], [c, '']]);
/* substitution text a·(x)² + b·(x) + c with brackets around negative x */
const subQ = (a, b, c, x) => [[a, par(x) + '²'], [b, par(x)], [c, '']].filter(t => t[0] !== 0).map((t, i) => { const v = t[0], s = (Math.abs(v) === 1 && t[1] ? '' : neg(Math.abs(v)) + (t[1] ? ' · ' : '')) + t[1]; return (i === 0 ? (v < 0 ? '−' : '') : (v < 0 ? ' − ' : ' + ')) + s; }).join('');
const prodTxt = a => a.join(' · ');
const prod = a => a.reduce((s, v) => s * v, 1);
const desc = (n, k) => Array.from({ length: k }, (_, i) => n - i);

/* ======================= 8.1 Rate of change ======================= */
const LA = '⟨', RA = '⟩';
G['8.1'] = [
  function intervalNotation(l) {
    let a, b; do { a = ri(-8, 5); b = ri(-5, 9); } while (b <= a);
    const kind = pick(['cc', 'co', 'oc', 'oo', 'left', 'right']), A = neg(a), B = neg(b);
    const ineq = { cc: A + ' ≤ ' + X() + ' ≤ ' + B, co: A + ' ≤ ' + X() + ' &lt; ' + B, oc: A + ' &lt; ' + X() + ' ≤ ' + B, oo: A + ' &lt; ' + X() + ' &lt; ' + B, left: X() + ' ≤ ' + B, right: X() + ' &gt; ' + A }[kind];
    const nt = { cc: '[' + A + ', ' + B + ']', co: '[' + A + ', ' + B + RA, oc: LA + A + ', ' + B + ']', oo: LA + A + ', ' + B + RA, left: LA + '←, ' + B + ']', right: LA + A + ', →' + RA }[kind];
    const all = kind === 'left' || kind === 'right' ? [LA + '←, ' + B + ']', LA + '←, ' + B + RA, LA + A + ', →' + RA, '[' + A + ', →' + RA] : ['[' + A + ', ' + B + ']', '[' + A + ', ' + B + RA, LA + A + ', ' + B + ']', LA + A + ', ' + B + RA];
    return ch(p('Write ' + ineq + ' as an interval.'), nt, all.filter(o => o !== nt), 'A square bracket [ ] means the end number is included (≤ or ≥). A pointed bracket ' + LA + ' ' + RA + ' means it is not included (&lt; or &gt;).', ineq + ' is ' + nt + '.');
  },
  function avgGradient(l) {
    const a = l === 0 ? 1 : pick([1, -1, 2, 0.5, -2]), b = ri(-6, 6), c = ri(-9, 9), f = x => a * x * x + b * x + c; let x1, x2; do { x1 = ri(-5, 3); x2 = x1 + ri(1, 6); } while (false);
    const dy = rd(f(x2) - f(x1)), dx = x2 - x1, m = rd(dy / dx);
    return nu(p('Calculate the average gradient of ' + F('f', X()) + ' = ' + quad(a, b, c) + ' on the interval [' + neg(x1) + ', ' + neg(x2) + '].'), m, 'Average gradient = Δ' + X('y') + ' / Δ' + X() + ' = (' + F('f', neg(x2)) + ' − ' + F('f', neg(x1)) + ') / (' + neg(x2) + ' − ' + par(x1) + ').', p(F('f', neg(x1)) + ' = ' + neg(rd(f(x1))) + ' and ' + F('f', neg(x2)) + ' = ' + neg(rd(f(x2)))) + p('Δ' + X('y') + ' / Δ' + X() + ' = (' + neg(rd(f(x2))) + ' − ' + par(rd(f(x1))) + ') / (' + neg(x2) + ' − ' + par(x1) + ') = ' + neg(dy) + ' / ' + dx + ' = ' + neg(m)), { needStep: true });
  },
  function avgFromTable(l) {
    const xs = [0, 5, 10, 15, 20], T0 = ri(70, 90), ys = xs.map((t, i) => i === 0 ? T0 : 0); for (let i = 1; i < 5; i++) ys[i] = ys[i - 1] - ri(3, 12); const i = ri(0, 2), j = ri(i + 1, 4), m = rd((ys[j] - ys[i]) / (xs[j] - xs[i]), 2);
    return nu(p('The table shows the temperature ' + X('T') + ' (°C) of a cup of tea after ' + X('t') + ' minutes. Calculate the average change in temperature per minute on [' + xs[i] + ', ' + xs[j] + ']. <small>(Round to 2 decimals.)</small>') + '<table class="tbl"><tr><th>' + X('t') + '</th>' + xs.map(x => '<td>' + x + '</td>').join('') + '</tr><tr><th>' + X('T') + '</th>' + ys.map(y => '<td>' + y + '</td>').join('') + '</tr></table>', m, 'Δ' + X('T') + ' / Δ' + X('t') + '.', 'Δ' + X('T') + ' / Δ' + X('t') + ' = (' + ys[j] + ' − ' + ys[i] + ') / (' + xs[j] + ' − ' + xs[i] + ') = ' + neg(ys[j] - ys[i]) + ' / ' + (xs[j] - xs[i]) + (rd((ys[j] - ys[i]) / (xs[j] - xs[i])) === m ? ' = ' : ' ≈ ') + neg(m) + ' °C per minute', { needStep: true, tol: .0051 });
  },
  function gradientShape(l) {
    const up = Math.random() < .5, incr = Math.random() < .5, d0 = ri(1, 4), dd = pick([0.2, 0.5, 1]);
    const diffs = [0, 1, 2, 3, 4].map(i => rd((d0 + (incr ? i : 4 - i) * dd) * (up ? 1 : -1)));
    let y = ri(10, 30); const ys = [y]; diffs.forEach(d => { y = rd(y + d); ys.push(y); });
    const right = (incr === up ? 'increasing' : 'decreasing') + ' ' + (up ? 'positive' : 'negative') + ' gradient';
    // for negative values: differences -1,-1.5,-2 get steeper (more negative): that is a decreasing negative gradient
    const real = up ? (incr ? 'increasing positive gradient' : 'decreasing positive gradient') : (incr ? 'decreasing negative gradient' : 'increasing negative gradient');
    return ch(p('Look at the differences in this table. What kind of graph is it?') + '<table class="tbl"><tr><th>' + X() + '</th>' + ys.map((_, i) => '<td>' + i + '</td>').join('') + '</tr><tr><th>' + X('y') + '</th>' + ys.map(v => '<td>' + v + '</td>').join('') + '</tr></table>', real, ['increasing positive gradient', 'decreasing positive gradient', 'increasing negative gradient', 'decreasing negative gradient'].filter(o => o !== real), 'Calculate the differences. Positive: the graph rises. Do the differences get bigger or smaller?', 'Differences: ' + diffs.map(d => (d > 0 ? '+' : '') + neg(d)).join('; ') + '. ' + (up ? 'The graph rises (positive gradient) and the differences get ' + (incr ? 'bigger: increasing.' : 'smaller: decreasing.') : 'The graph falls (negative gradient) and the differences get ' + (incr ? 'more negative: the gradient decreases.' : 'closer to 0: the gradient increases.')));
  },
  function avgSpeed(l) {
    const k = pick([1.25, 2.5, 5, 0.5]), t1 = ri(1, 4), t2 = t1 + pick([1, 2, 0.5]), c = l >= 2 ? ri(2, 9) : 0, d = t => k * t * t + c * t, v = rd((d(t2) - d(t1)) / (t2 - t1), 4);   // spicy: a second term
    return nu(p('A car drives ' + X('d') + ' = ' + k + X('t') + '²' + (c ? ' + ' + c + X('t') : '') + ' metres in ' + X('t') + ' seconds. Calculate the average speed (m/s) between ' + X('t') + ' = ' + t1 + ' and ' + X('t') + ' = ' + t2 + '.'), v, 'Average speed = Δ' + X('d') + ' / Δ' + X('t') + '.', p(X('d') + '(' + t1 + ') = ' + rd(d(t1)) + ' and ' + X('d') + '(' + t2 + ') = ' + rd(d(t2))) + p('(' + rd(d(t2)) + ' − ' + rd(d(t1)) + ') / (' + t2 + ' − ' + t1 + ') = ' + rd(d(t2) - d(t1)) + ' / ' + rd(t2 - t1) + ' = ' + v + ' m/s'), { needStep: true });
  }
];
XG['8.1'] = [
  function averageCost(l) {
    const fix = pick([20000, 50000, 80000]), var_ = pick([1.25, 2, 0.75]), q = pick([1000, 10000, 40000, 100000]), C = fix + var_ * q, avg = rd(C / q, 2);
    return nu(p('A company makes ' + X('q') + ' kg of product. The costs are ' + X('C') + ' = ' + sp(fix) + ' + ' + var_ + X('q') + ' euros. Calculate the average cost per kg for ' + X('q') + ' = ' + sp(q) + '.'), avg, 'Average cost = total cost / number of kg.', p(X('C') + ' = ' + sp(fix) + ' + ' + var_ + ' · ' + sp(q) + ' = ' + sp(C)) + p(sp(C) + ' / ' + sp(q) + ' = ' + avg + ' euros per kg'), { needStep: true, tol: .0051 });
  }
];
XG['8.1'].push(function findEndpoint(l) {
  const c = ri(-6, 6), a = ri(-3, 4), bb = a + ri(2, 7), r = a + bb + c, f = x => x * x + c * x;
  return nu(p('Given ' + F('f', X()) + ' = ' + poly([[1, X() + '²'], [c, X()]]) + '. The average rate of change of ' + X('f') + ' on the interval [' + neg(a) + ', ' + X('b') + '] is ' + neg(r) + '. Calculate ' + X('b') + '.'), bb, 'average rate of change = (' + F('f', X('b')) + ' − ' + F('f', neg(a)) + ') / (' + X('b') + ' − ' + (a < 0 ? '(' + neg(a) + ')' : neg(a)) + '). Try values for ' + X('b') + ', or simplify the fraction.', p('Try ' + X('b') + ' = ' + bb + ': (' + neg(f(bb)) + ' − ' + (f(a) < 0 ? '(' + neg(f(a)) + ')' : neg(f(a))) + ') / (' + bb + ' − ' + (a < 0 ? '(' + neg(a) + ')' : neg(a)) + ') = ' + neg(f(bb) - f(a)) + ' / ' + (bb - a) + ' = ' + neg(r)) + p('(In general the fraction simplifies to ' + X('b') + ' + ' + (a < 0 ? '(' + neg(a) + ')' : neg(a)) + ' + ' + (c < 0 ? '(' + neg(c) + ')' : neg(c)) + '.)'));
});

/* ======================= 8.2 Counting ======================= */
G['8.2'] = [
  function menu(l) {
    const a = ri(2, 6), b = ri(2, 8), c = ri(2, 5), three = l > 0;
    const parts = three ? [a, b, c] : [a, b], txt = three ? a + ' starters, ' + b + ' main courses and ' + c + ' desserts' : a + ' main courses and ' + b + ' desserts';
    return nu(p('A restaurant has ' + txt + '. How many different menus can you choose (one of each)?'), prod(parts), 'Multiply the numbers of choices (the product rule). A tree diagram shows why.', prodTxt(parts) + ' = ' + prod(parts) + ' menus', { needStep: true });
  },
  function codeRepeat(l) {
    const n = l === 0 ? ri(2, 4) : ri(4, 6), digits = Math.random() < .7, k = digits ? 10 : pick([3, 4, 6]);
    return nu(p(digits ? 'A PIN code has ' + n + ' digits (0 to 9). Digits may be used more than once. How many different codes are possible?' : 'A key has ' + n + ' positions. Each position can have one of ' + k + ' depths. How many different keys are possible?'), Math.pow(k, n), 'Each position has ' + k + ' choices: ' + k + ' · ' + k + ' · … (' + n + ' times).', prodTxt(Array(n).fill(k)) + ' = ' + k + '<sup>' + n + '</sup> = ' + sp(Math.pow(k, n)), { needStep: true });
  },
  function codeNoRepeat(l) {
    const n = ri(3, 5), arr = desc(10, n);
    if (l >= 2) { const a2 = [9].concat(desc(9, n - 1));   // spicy: the first digit may not be 0
      return nu(p('A code has ' + n + ' digits (0 to 9). Every digit may be used only <b>once</b>, and the code may <b>not start with 0</b>. How many different codes are possible?'), prod(a2), 'Start with the first digit: it has 9 choices. The second digit may be 0 again, but not the first digit: also 9 choices.', prodTxt(a2) + ' = ' + sp(prod(a2)), { needStep: true }); }
    return nu(p('A PIN code has ' + n + ' digits (0 to 9). Every digit may be used only <b>once</b>. How many different codes are possible?'), prod(arr), 'The first digit has 10 choices, the next one 9, and so on.', prodTxt(arr) + ' = ' + sp(prod(arr)), { needStep: true });
  },
  function arrange(l) {
    const n = l === 0 ? ri(3, 5) : ri(5, 8), what = pick(['books on a shelf', 'runners in a row', 'students in a line']), arr = desc(n, n);
    return nu(p('In how many different orders can you put ' + n + ' ' + what + '?'), prod(arr), 'The first place has ' + n + ' choices, the second ' + (n - 1) + ', and so on.', prodTxt(arr) + ' = ' + sp(prod(arr)), { needStep: true });
  },
  function roles(l) {
    const n = ri(12, 30), k = pick([2, 3, 3, 4]), roles = ['a chairperson', 'a secretary', 'a treasurer', 'a reporter'].slice(0, k), arr = desc(n, k);
    if (l >= 2) { const g = ri(4, n - 6), k2 = Math.max(k, 3), r2 = ['a chairperson', 'a secretary', 'a treasurer', 'a reporter'].slice(0, k2), a2 = [g].concat(desc(n - 1, k2 - 1));   // spicy: an extra condition for the first job
      return nu(p('A club has ' + n + ' members: ' + g + ' girls and ' + (n - g) + ' boys. You choose ' + r2.slice(0, -1).join(', ') + ' and ' + r2[k2 - 1] + '. One person cannot have two jobs, and the chairperson must be a <b>girl</b>. In how many ways can you do this?'), prod(a2), 'Start with the job that has a condition: the chairperson. Then the other jobs, with one person fewer each time.', prodTxt(a2) + ' = ' + sp(prod(a2)) + ' ways', { needStep: true }); }
    return nu(p('A club has ' + n + ' members. You choose ' + roles.slice(0, -1).join(', ') + ' and ' + roles[k - 1] + '. One person cannot have two jobs. In how many ways can you do this?'), prod(arr), 'The order matters (different jobs). For the second job there is one person fewer.', prodTxt(arr) + ' = ' + sp(prod(arr)) + ' ways', { needStep: true });
  },
  function plates(l) {
    const L = ri(1, 3), D = ri(1, 4), letters = pick([26, 20]), parts = Array(L).fill(letters).concat(Array(D).fill(10));
    if (l >= 2) { const D2 = Math.max(D, 2), p2 = Array(L).fill(letters).concat([9]).concat(Array(D2 - 1).fill(10));   // spicy: the digits may not start with 0
      return nu(p('A licence plate has ' + L + ' letter' + (L > 1 ? 's' : '') + ' followed by ' + D2 + ' digits. You can use ' + letters + ' letters' + (letters === 20 ? ' (only consonants)' : '') + ' and the digits 0 to 9, more than once, but the <b>first digit may not be 0</b>. How many plates are possible?'), prod(p2), 'Multiply the number of choices for every position. The first digit has only 9 choices.', prodTxt(p2) + ' = ' + sp(prod(p2)), { needStep: true }); }
    return nu(p('A licence plate has ' + L + ' letter' + (L > 1 ? 's' : '') + ' followed by ' + D + ' digit' + (D > 1 ? 's' : '') + '. You can use ' + letters + ' letters' + (letters === 20 ? ' (only consonants)' : '') + ' and the digits 0 to 9, more than once. How many plates are possible?'), prod(parts), 'Multiply the number of choices for every position.', prodTxt(parts) + ' = ' + sp(prod(parts)), { needStep: true });
  },
  function whichCount(l) {
    const n = ri(4, 7), k = 3, opts = [prodTxt(desc(n, k)), n + '<sup>' + k + '</sup>', prodTxt(desc(n, n)), n + ' · ' + k], rep = Math.random() < .5, right = rep ? opts[1] : opts[0];
    return ch(p('You make a code of ' + k + ' letters from the letters ' + 'ABCDEFG'.slice(0, n).split('').join(', ') + '. Letters may ' + (rep ? '' : '<b>not</b> ') + 'be used more than once. Which calculation gives the number of codes?'), right, opts.filter(o => o !== right), rep ? 'Every position has all ' + n + ' choices.' : 'Every next position has one choice fewer.', rep ? n + ' choices for each of the ' + k + ' positions: ' + opts[1] + ' = ' + Math.pow(n, k) + '.' : n + ', then ' + (n - 1) + ', then ' + (n - 2) + ' choices: ' + opts[0] + ' = ' + prod(desc(n, k)) + '.');
  }
];
XG['8.2'] = [
  function routesVia(l) {
    const ab = ri(2, 4), bc = ri(2, 4), ad = ri(1, 4), dc = ri(1, 3), ce = ri(2, 3);
    const toC = ab * bc + ad * dc, tot = toC * ce;
    return nu(p('From A to C you can go via B or via D. A→B: ' + ab + ' roads, B→C: ' + bc + ' roads, A→D: ' + ad + ' roads, D→C: ' + dc + ' roads. From C to E there are ' + ce + ' roads. How many routes are there from A to E?'), tot, 'Via B and via D are separate cases: add them. Then multiply by the roads from C to E.', p('A to C: ' + ab + ' · ' + bc + ' + ' + ad + ' · ' + dc + ' = ' + toC) + p('A to E: ' + toC + ' · ' + ce + ' = ' + tot), { needStep: true });
  },
  function samePawns(l) {
    const sq = pick([16, 25, 36, 64]), k = 3, ordered = prod(desc(sq, k));
    return nu(p('You place ' + k + ' identical white pawns on a board with ' + sq + ' squares (at most one pawn per square). In how many ways can you do this?'), ordered / 6, 'First count as if the pawns were different. Then divide by the number of orders of the 3 pawns (3 · 2 · 1).', p('different pawns: ' + prodTxt(desc(sq, k)) + ' = ' + sp(ordered)) + p('identical: ' + sp(ordered) + ' : 6 = ' + sp(ordered / 6)), { needStep: true });
  }
];

/* ======================= 8.3 Functions ======================= */
G['8.3'] = [
  function evalLinear(l) {
    const m = nz(-6, 6), b = ri(-9, 9), x = l === 0 ? ri(-5, 6) : pick([nz(-8, 8), 0.5, -1.5, 2.5]), y = rd(m * x + b);
    return nu(p('Given ' + F('f', X()) + ' = ' + lin(m, b) + '. Calculate ' + F('f', neg(x)) + '.'), y, 'Replace ' + X() + ' by ' + par(x) + '.', F('f', neg(x)) + ' = ' + neg(m) + ' · ' + par(x) + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = ' + neg(rd(m * x)) + (b ? (b < 0 ? ' − ' : ' + ') + Math.abs(b) : '') + ' = ' + neg(y), { needStep: b !== 0 });
  },
  function evalQuad(l) {
    const a = l === 0 ? pick([1, 2, -1]) : pick([-4, 2, 3, -1, -2]), b = ri(-6, 6), c = ri(-9, 9), x = l === 0 ? ri(-3, 4) : nz(-8, 8), y = a * x * x + b * x + c;
    return nu(p('Given ' + F('g', X()) + ' = ' + quad(a, b, c) + '. Calculate ' + F('g', neg(x)) + '.'), y, 'Put ' + par(x) + ' in brackets and square it first.', F('g', neg(x)) + ' = ' + subQ(a, b, c, x) + ' = ' + [[a, a * x * x], [b, b * x], [c, c]].filter(t => t[0] !== 0).map((t, i) => (i === 0 ? neg(t[1]) : (t[1] < 0 ? ' − ' : ' + ') + neg(Math.abs(t[1])))).join('') + ' = ' + neg(y));
  },
  function solveFx(l) {
    const m = nz(-6, 6), b = ri(-12, 12); let x; do { x = l === 0 ? ri(-6, 8) : ri(-12, 12) / pick([1, 2]); } while (m === 1 && x === 0);
    const c = rd(m * x + b);
    return nu(p('Given ' + F('f', X()) + ' = ' + lin(m, b) + '. For which ' + X() + ' is ' + F('f', X()) + ' = ' + neg(c) + '?'), x, 'Solve the equation ' + lin(m, b) + ' = ' + neg(c) + '.', p(lin(m, b) + ' = ' + neg(c)) + p(lin(m, 0) + ' = ' + neg(rd(c - b))) + p(X() + ' = ' + neg(rd(c - b)) + ' : ' + par(m) + ' = ' + neg(x)), { noStep: true });
  },
  function difference(l) {
    const a = nz(-5, 5), b = ri(-9, 9), x1 = ri(-4, 6), x2 = ri(-4, 6); if (x1 === x2) return difference(l);
    const f = x => a * x + b, d = f(x1) - f(x2);
    return nu(p('Given ' + F('g', X()) + ' = ' + poly([[b, ''], [a, X()]]) + '. Calculate ' + F('g', neg(x1)) + ' − ' + F('g', neg(x2)) + '.'), d, 'Calculate both function values first.', p(F('g', neg(x1)) + ' = ' + neg(f(x1)) + ' and ' + F('g', neg(x2)) + ' = ' + neg(f(x2))) + p(neg(f(x1)) + ' − ' + par(f(x2)) + ' = ' + neg(d)));
  },
  function maxMin(l) {
    let a, b, c, xv; do { a = pick([1, 2, -1, -2, 3, -3, 0.5]); xv = l === 2 ? nz(-9, 9) / 2 : nz(-6, 6); b = rd(-2 * a * xv); c = ri(-12, 12); } while (!Number.isInteger(b * 2));
    const yv = rd(a * xv * xv + b * xv + c), kind = a > 0 ? 'minimum' : 'maximum';
    return nu(p('The function ' + F('f', X()) + ' = ' + quad(a, b, c) + ' has a maximum or a minimum. Calculate this value.'), yv, X() + '<sub>vertex</sub> = −' + X('b') + ' / 2' + X('a') + '. The ' + kind + ' is ' + X('f') + '(' + X() + '<sub>vertex</sub>).', p(X('a') + ' = ' + neg(a) + (a > 0 ? ' > 0: the parabola opens upwards, a minimum.' : ' < 0: the parabola opens downwards, a maximum.')) + p(X() + '<sub>vertex</sub> = −' + par(b) + ' / (2 · ' + par(a) + ') = ' + neg(xv)) + p(F('f', neg(xv)) + ' = ' + subQ(a, b, c, xv) + ' = ' + neg(yv)) + p('The ' + kind + ' is ' + neg(yv) + '.'), { needStep: true });
  },
  function maxMinFactored(l) {
    const a = pick([1, 2, -1, -2, 3]); let r1, r2; do { r1 = ri(-10, 6); r2 = ri(-6, 10); } while (r1 >= r2 || (l < 2 && (r1 + r2) % 2 !== 0));
    const xv = (r1 + r2) / 2, yv = rd(a * (xv - r1) * (xv - r2)), kind = a > 0 ? 'minimum' : 'maximum', fac = r => '(' + lin(1, -r) + ')', A = a === 1 ? '' : a === -1 ? '−' : String(a);
    return nu(p('Calculate the ' + kind + ' of ' + F('h', X()) + ' = ' + A + fac(r1) + fac(r2) + '.'), yv, 'The zeros are ' + neg(r1) + ' and ' + neg(r2) + '. The vertex is in the middle.', p(X() + '<sub>vertex</sub> = (' + neg(r1) + ' + ' + par(r2) + ') / 2 = ' + neg(xv)) + p(F('h', neg(xv)) + ' = ' + A + '(' + neg(xv) + ' − ' + par(r1) + ')(' + neg(xv) + ' − ' + par(r2) + ') = ' + neg(yv)) + p('The ' + kind + ' is ' + neg(yv) + '.'), { needStep: true });
  },
  function onGraph(l) {
    const a = pick([-4, -1, 2, 3]), b = ri(-6, 6), c = ri(-9, 9), x = nz(-6, 8), y = a * x * x + b * x + c, on = Math.random() < .5, yy = on ? y : y + pick([-1, 1, 2]);
    if (l >= 2) {   // spicy: a missing number in the formula
      const qc = quad(a, b, 0) + ' + ' + X('c');
      return nu(p('The point (' + neg(x) + ', ' + neg(y) + ') lies on the graph of ' + F('f', X()) + ' = ' + qc + '. Calculate ' + X('c') + '.'), c, 'Substitute ' + X() + ' = ' + neg(x) + ' and ' + X('y') + ' = ' + neg(y) + '. Then solve for ' + X('c') + '.', neg(y) + ' = ' + subQ(a, b, 0, x) + ' + ' + X('c') + ' = ' + neg(a * x * x + b * x) + ' + ' + X('c') + ', so ' + X('c') + ' = ' + neg(c) + '.', { needStep: true }); }
    return ch(p('Does the point (' + neg(x) + ', ' + neg(yy) + ') lie on the graph of ' + F('f', X()) + ' = ' + quad(a, b, c) + '?'), on ? 'yes' : 'no', [on ? 'no' : 'yes'], 'Calculate ' + F('f', neg(x)) + ' and compare it with ' + neg(yy) + '.', F('f', neg(x)) + ' = ' + subQ(a, b, c, x) + ' = ' + neg(y) + (on ? '. This equals ' + neg(yy) + ': yes.' : ', not ' + neg(yy) + ': no.'));
  }
];
XG['8.3'] = [
  function familyP(l) {
    const x = ri(2, 5), pp = nz(-6, 6), c = ri(-3, 3), target = x * x + pp * x + c;
    return nu(p('For every number ' + X('p') + ' you have the function ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = ' + X() + '² + ' + X('p') + X() + (c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : '') + '. For which ' + X('p') + ' is ' + X('f') + '<sub>' + X('p') + '</sub>(' + x + ') = ' + neg(target) + '?'), pp, 'Substitute ' + X() + ' = ' + x + ' and solve the equation for ' + X('p') + '.', p(x + '² + ' + X('p') + ' · ' + x + (c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : '') + ' = ' + neg(target)) + p((x * x + c) + ' + ' + x + X('p') + ' = ' + neg(target)) + p(x + X('p') + ' = ' + neg(target - x * x - c)) + p(X('p') + ' = ' + neg(pp)), { noStep: true });
  },
  function newFunction(l) {
    let a, b, k, c; do { a = nz(-6, 6); b = ri(-20, 20); k = nz(-5, 5); c = pick([2, 3, -1, -2, 0.5]); } while (c * (a * k + b) === 0);
    const A = rd(c * a), B = rd(c * (a * k + b)), inner = X() + (k < 0 ? ' − ' + -k : ' + ' + k);
    return { type: 'expr', html: p('Given ' + F('g', X()) + ' = ' + poly([[b, ''], [a, X()]]) + ' and ' + F('h', X()) + ' = ' + (c === -1 ? '−' : c) + F('g', inner) + '. Give the formula of ' + X('h') + ' as simple as possible. <small>Type only the right side.</small>'), ans: A + '*x+(' + B + ')', form: 'poly', hint: 'In the formula of ' + X('g') + ', replace every ' + X() + ' by (' + inner + '). Then multiply by ' + neg(c) + '.', steps: F('g', inner) + ' = ' + poly([[b, ''], [a, '(' + inner + ')']]) + ' = ' + poly([[a * k + b, ''], [a, X()]]) + '<br>' + F('h', X()) + ' = ' + neg(c) + ' · (' + poly([[a * k + b, ''], [a, X()]]) + ') = ' + poly([[B, ''], [A, X()]]), keys: ['(', ')'], ansText: F('h', X()) + ' = ' + poly([[B, ''], [A, X()]]) };
  }
];

const SECTIONS = [
  { id: '8.1', title: '8.1 Rate of change', sub: 'Intervals, average gradient, increasing and decreasing' },
  { id: '8.2', title: '8.2 Counting', sub: 'Product rule, codes, orders' },
  { id: '8.3', title: '8.3 Functions', sub: 'f(x) notation, function values, maximum and minimum' }
];
const GOALS = [
  ['8.1', 'I can calculate the average rate of change', ['intervalNotation', 'avgGradient', 'avgFromTable', 'gradientShape', 'avgSpeed'], 'average gradient = Δy / Δx'],
  ['8.2', 'I can count possibilities', ['menu', 'codeRepeat', 'codeNoRepeat', 'arrange', 'roles', 'plates', 'whichCount'], 'Multiply the numbers of choices.'],
  ['8.3', 'I can work with function notation', ['evalLinear', 'evalQuad', 'solveFx', 'difference', 'maxMin', 'maxMinFactored', 'onGraph'], 'f(3) means: replace x by 3.']
];
/* ======================= 3VT chapter 8: select topics from mathematics A, B, C and D ======================= */
if (P.cls === '3VT') {
  const { gcd, fr, ratText } = NX;
  const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
  const frq = (html, n, d, hint, steps) => ex(html + p('<small>Give the answer as a fraction, for example 5/36.</small>'), ratText(n, d), 'frac', hint, steps, { keys: ['/'] });
  const fl = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : fr(n, d); };
  const C3 = [1, 3, 3, 1];
  const V2 = [
    function diceSum(l) {
      const k = ri(2, 12), pairs = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === k) pairs.push('(' + a + ', ' + b + ')');
      if (l >= 2) { const pr = pick([4, 6, 8, 12, 18]), pp = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a * b === pr) pp.push('(' + a + ', ' + b + ')');   // spicy: the product of the pips
        return frq(p('You throw two dice and <b>multiply</b> the pips. What is the probability that the product is ' + pr + '?'), pp.length, 36, 'There are 6 · 6 = 36 outcomes. Make a table of products and count.', 'Product ' + pr + ': ' + pp.join(', ') + ', that is ' + pp.length + ' outcomes.<br>P = ' + fr(pp.length, 36) + (gcd(pp.length, 36) > 1 ? ' = ' + fl(pp.length, 36) : '')); }
      return frq(p('You throw two dice and add the pips. What is the probability that the sum is ' + k + '?'), pairs.length, 36, 'There are 6 · 6 = 36 outcomes. Count the outcomes with sum ' + k + ' (use a table of sums).', 'Sum ' + k + ': ' + pairs.join(', ') + ', that is ' + pairs.length + ' outcomes.<br>P(sum = ' + k + ') = ' + fr(pairs.length, 36) + (gcd(pairs.length, 36) > 1 ? ' = ' + fl(pairs.length, 36) : ''));
    },
    function diceAtMost(l) {
      if (l >= 2) { const k2 = ri(1, 3); let c2 = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (Math.abs(a - b) <= k2) c2++;   // spicy: the difference of the pips
        return frq(p('You throw two dice. What is the probability that the <b>difference</b> of the pips (big − small) is <b>at most ' + k2 + '</b>?'), c2, 36, 'Make a 6 by 6 table of differences and count the outcomes with a difference of 0 to ' + k2 + '.', 'Difference 0: 6 outcomes' + [1, 2, 3].filter(d => d <= k2).map(d => ', difference ' + d + ': ' + 2 * (6 - d)).join('') + '. Together ' + c2 + '.<br>P = ' + fr(c2, 36) + (gcd(c2, 36) > 1 ? ' = ' + fl(c2, 36) : '')); }
      const most = Math.random() < .5, k = most ? ri(3, 8) : ri(6, 11); let c = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (most ? a + b <= k : a + b >= k) c++;
      const parts = []; for (let s = most ? 2 : k; most ? s <= k : s <= 12; s++) parts.push(6 - Math.abs(s - 7));
      return frq(p('You throw two dice and add the pips. What is the probability that the sum is <b>' + (most ? 'at most ' : 'at least ') + k + '</b>?'), c, 36, 'Add the numbers of outcomes for every sum that fits. There are 36 outcomes.', 'Outcomes per sum: ' + parts.join(' + ') + ' = ' + c + '<br>P = ' + fr(c, 36) + (gcd(c, 36) > 1 ? ' = ' + fl(c, 36) : ''));
    },
    function drawTwo(l) {
      const o = ri(2, 6), w = ri(2, 6), N = o + w, k = ri(0, 2), repl = l === 2 && Math.random() < .5;
      const D = repl ? N * N : N * (N - 1), n = k === 2 ? o * (repl ? o : o - 1) : k === 0 ? w * (repl ? w : w - 1) : 2 * o * w;
      const st = k === 1 ? fr(o, N) + ' · ' + fr(w, repl ? N : N - 1) + ' + ' + fr(w, N) + ' · ' + fr(o, repl ? N : N - 1) : k === 2 ? fr(o, N) + ' · ' + fr(repl ? o : o - 1, repl ? N : N - 1) : fr(w, N) + ' · ' + fr(repl ? w : w - 1, repl ? N : N - 1);
      return frq(p('A bag has ' + o + ' orange and ' + w + ' white marbles. You take two marbles ' + (repl ? '<b>with</b> replacement' : 'without replacement') + '. ' + X('X') + ' is the number of orange marbles. Calculate P(' + X('X') + ' = ' + k + ').'), n, D, 'Use a tree diagram. ' + (k === 1 ? 'One orange marble can happen in two orders: OW and WO.' : '') + (repl ? '' : ' After the first draw there is one marble less.'), 'P(' + X('X') + ' = ' + k + ') = ' + st + ' = ' + fr(n, D) + (gcd(n, D) > 1 ? ' = ' + fl(n, D) : ''));
    },
    function gamesWon(l) {
      const pw = pick([[1, 2], [1, 3], [2, 3], [1, 4]]), k = ri(0, 3), a = pw[0], b = pw[1], q = b - a;
      const n = C3[k] * Math.pow(a, k) * Math.pow(q, 3 - k), D = Math.pow(b, 3);
      if (l >= 2) { const n2 = 3 * a * a * q + a * a * a;   // spicy: at least 2 of the 3 games
        return frq(p('The probability that Sam wins a game is ' + fr(a, b) + '. Sam plays 3 games. Calculate the probability that Sam wins <b>at least 2</b> games.'), n2, D, 'At least 2 means exactly 2 or exactly 3. Calculate both and add.', 'P(2 wins) = 3 · (' + fr(a, b) + ')² · ' + fr(q, b) + ' = ' + fr(3 * a * a * q, D) + '<br>P(3 wins) = (' + fr(a, b) + ')³ = ' + fr(a * a * a, D) + '<br>P = ' + fr(n2, D) + (gcd(n2, D) > 1 ? ' = ' + fl(n2, D) : '')); }
      return frq(p('The probability that Sam wins a game is ' + fr(a, b) + '. Sam plays 3 games. Calculate the probability that Sam wins exactly ' + k + ' game' + (k === 1 ? '' : 's') + '.'), n, D, 'Each order of wins and losses has the same probability. There ' + (C3[k] === 1 ? 'is 1 order' : 'are ' + C3[k] + ' orders') + ' with ' + k + ' win' + (k === 1 ? '' : 's') + '.', C3[k] + ' · (' + fr(a, b) + ')<sup>' + k + '</sup> · (' + fr(q, b) + ')<sup>' + (3 - k) + '</sup> = ' + fr(n, D) + (gcd(n, D) > 1 ? ' = ' + fl(n, D) : ''));
    },
    function missingProb(l) {
      const d = pick([12, 20, 24, 36]); let ps; do { ps = [ri(1, d / 2), ri(1, d / 2), ri(1, d / 2)]; } while (ps.reduce((s, v) => s + v, 0) >= d);
      const last = d - ps.reduce((s, v) => s + v, 0);
      if (l >= 2) { let q1, q2, rest; do { q1 = ri(1, d / 3); q2 = ri(1, d / 3); rest = d - q1 - q2; } while (rest <= 0 || rest % 3);   // spicy: P(X = 3) is twice P(X = 2)
        const x = rest / 3;
        return frq(p('This is a probability distribution. P(' + X('X') + ' = 3) is twice as big as P(' + X('X') + ' = 2). What is P(' + X('X') + ' = 3)?') + '<table class="tbl"><tr><th>' + X('x') + '</th><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th>P(' + X('X') + ' = ' + X('x') + ')</th><td>' + fl(q1, d) + '</td><td>' + fl(q2, d) + '</td><td>' + X('p') + '</td><td>2' + X('p') + '</td></tr></table>', 2 * x, d, 'All probabilities add up to 1: ' + X('p') + ' + 2' + X('p') + ' = 3' + X('p') + ' is what is left.', '3' + X('p') + ' = 1 − ' + fl(q1, d) + ' − ' + fl(q2, d) + ' = ' + fr(rest, d) + '<br>' + X('p') + ' = ' + fr(x, d) + ', so P(' + X('X') + ' = 3) = 2' + X('p') + ' = ' + fr(2 * x, d) + (gcd(2 * x, d) > 1 ? ' = ' + fl(2 * x, d) : '')); }
      return frq(p('This is a probability distribution. What is P(' + X('X') + ' = 3)?') + '<table class="tbl"><tr><th>' + X('x') + '</th><td>0</td><td>1</td><td>2</td><td>3</td></tr><tr><th>P(' + X('X') + ' = ' + X('x') + ')</th>' + ps.map(v => '<td>' + fl(v, d) + '</td>').join('') + '<td>?</td></tr></table>', last, d, 'All probabilities in a distribution add up to 1.', '1 − ' + ps.map(v => fl(v, d)).join(' − ') + ' = ' + fr(d, d) + ' − ' + fr(ps.reduce((s, v) => s + v, 0), d) + ' = ' + fr(last, d) + (gcd(last, d) > 1 ? ' = ' + fl(last, d) : ''));
    },
    function targetProb(l) {
      const r1 = ri(2, 5), r2 = r1 + ri(2, 5), r3 = r2 + ri(2, 5), k = ri(0, 2), A = [r1 * r1, r2 * r2 - r1 * r1, r3 * r3 - r2 * r2][k], T = r3 * r3, nm = ['the inner circle', 'the middle ring', 'the outer ring'][k];
      if (l >= 2) { const A2 = T - (r2 * r2 - r1 * r1);   // spicy: NOT the middle ring
        return frq(p('A target has circles with radius ' + r1 + ', ' + r2 + ' and ' + r3 + ' cm. A dart hits the target at a random point. What is the probability that it does <b>not</b> hit the middle ring?'), A2, T, 'First the probability of the middle ring (area of the ring / area of the target). Then 1 minus that.', 'area of the middle ring = π · ' + r2 + '² − π · ' + r1 + '² = ' + (r2 * r2 - r1 * r1) + 'π<br>area of the target = π · ' + r3 + '² = ' + T + 'π<br>P(middle ring) = ' + fl(r2 * r2 - r1 * r1, T) + ', so P(not) = 1 − ' + fl(r2 * r2 - r1 * r1, T) + ' = ' + fl(A2, T)); }
      return frq(p('A target has circles with radius ' + r1 + ', ' + r2 + ' and ' + r3 + ' cm. A dart hits the target at a random point. What is the probability that it hits ' + nm + '?'), A, T, 'Probability = area of the part / area of the whole target. The π cancels out.', 'area of ' + nm + ' = ' + (k === 0 ? 'π · ' + r1 + '² = ' + A + 'π' : 'π · ' + [r2, r3][k - 1] + '² − π · ' + [r1, r2][k - 1] + '² = ' + A + 'π') + '<br>area of the target = π · ' + r3 + '² = ' + T + 'π<br>P = ' + fr(A + 'π', T + 'π') + ' = ' + fl(A, T));
    }
  ];
  const familyP = XG['8.3'][0];
  const V3 = [
    function evalFp(l) {
      const pp = nz(-5, 5), c = ri(-6, 6), x = nz(-4, 4), a = l === 2 ? pick([2, -1]) : 1, v = a * x * x + pp * x + c;
      return nu(p('For every ' + X('p') + ' you have ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = ' + poly([[a, X() + '²'], [1, X('p') + X()], [c, '']]) + '. Calculate ' + X('f') + '<sub>' + neg(pp) + '</sub>(' + neg(x) + ').'), v, 'First put ' + X('p') + ' = ' + neg(pp) + ' in the formula, then ' + X() + ' = ' + neg(x) + '.', X('f') + '<sub>' + neg(pp) + '</sub>(' + X() + ') = ' + quad(a, pp, c) + '<br>' + X('f') + '<sub>' + neg(pp) + '</sub>(' + neg(x) + ') = ' + subQ(a, pp, c, x) + ' = ' + neg(v));
    },
    familyP,
    function vertexP(l) {
      const v = nz(-6, 6), c = ri(-5, 5), pp = -2 * v;
      if (l >= 2) { const b = pick([-12, -6, 6, 12, 24]), vv = pick([1, 2, 3, -1, -2, -3].filter(z => Number.isInteger(-b / (2 * z)))), P = -b / (2 * vv);   // spicy: the parameter is in front of x²
        return nu(p('Given ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = ' + X('p') + X() + '² ' + (b < 0 ? '− ' : '+ ') + Math.abs(b) + X() + (c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : '') + '. For which ' + X('p') + ' is the ' + X() + '-coordinate of the vertex equal to ' + neg(vv) + '?'), P, X() + '<sub>vertex</sub> = −' + X('b') + ' / 2' + X('a') + ', with ' + X('a') + ' = ' + X('p') + '.', '−' + par(b) + ' / (2' + X('p') + ') = ' + neg(vv) + '<br>' + neg(-b) + ' = ' + neg(2 * vv) + X('p') + '<br>' + X('p') + ' = ' + neg(P)); }
      return nu(p('Given ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = ' + X() + '² + ' + X('p') + X() + (c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : '') + '. For which ' + X('p') + ' is the ' + X() + '-coordinate of the vertex equal to ' + neg(v) + '?'), pp, X() + '<sub>vertex</sub> = −' + X('b') + ' / 2' + X('a') + ' = −' + X('p') + ' / 2.', '−' + X('p') + ' / 2 = ' + neg(v) + '<br>' + X('p') + ' = ' + neg(pp));
    },
    function touchP(l) {
      const b = 2 * nz(-6, 6), a = l === 2 ? pick([1, 2, -1]) : 1, pp = rd(b * b / (4 * a));
      return nu(p('For which ' + X('p') + ' does the graph of ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = ' + poly([[a, X() + '²'], [b, X()]]) + ' + ' + X('p') + ' touch the ' + X() + '-axis?'), pp, 'The graph touches the ' + X() + '-axis when the equation ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = 0 has exactly one solution: D = 0.', 'D = ' + par(b) + '² − 4 · ' + par(a) + ' · ' + X('p') + ' = ' + b * b + ' − ' + neg(4 * a) + X('p') + '<br>' + b * b + ' − ' + neg(4 * a) + X('p') + ' = 0<br>' + X('p') + ' = ' + b * b + ' / ' + neg(4 * a) + ' = ' + neg(pp));
    },
    function intersectCount(l) {
      const a = pick([1, 2, -1, -2, 3]), b = ri(-6, 6), c = ri(-6, 6), m = ri(-4, 4), q = ri(-6, 6), A = a, B = b - m, Cc = c - q, D = B * B - 4 * A * Cc;
      const right = D > 0 ? '2' : D === 0 ? '1' : '0';
      return ch(p('How many points of intersection do the graphs of ' + X('f') + '(' + X() + ') = ' + quad(a, b, c) + ' and ' + X('g') + '(' + X() + ') = ' + lin(m, q) + ' have?'), right, ['0', '1', '2'].filter(o => o !== right), 'Set f(x) = g(x), rearrange to ax² + bx + c = 0 and calculate the discriminant.', quad(a, b, c) + ' = ' + lin(m, q) + '<br>' + quad(A, B, Cc) + ' = 0<br>D = ' + par(B) + '² − 4 · ' + par(A) + ' · ' + par(Cc) + ' = ' + neg(D) + '<br>' + (D > 0 ? 'D > 0: two points.' : D === 0 ? 'D = 0: one point (they touch).' : 'D < 0: no points.'));
    }
  ];
  const ptQ = (html, x, y, hint, steps) => ({ type: 'point', ans: [x, y], html: html + p('<small>Type a point like (3, −2).</small>'), hint, steps, noStep: true });
  const PT = (x, y) => '(' + neg(x) + ', ' + neg(y) + ')';
  const V4 = [
    function distance(l) {
      const x1 = ri(-6, 6), y1 = ri(-6, 6), x2 = ri(-6, 6), y2 = ri(-6, 6); if (x1 === x2 && y1 === y2) return distance(l);
      const s = (x2 - x1) ** 2 + (y2 - y1) ** 2, d = rd(Math.sqrt(s), 2);
      return nu(p('Calculate the distance between A' + PT(x1, y1) + ' and B' + PT(x2, y2) + '. <small>(Round to 2 decimals.)</small>'), d, '|AB| = √((x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)²)', '|AB| = √((' + neg(x2) + ' − ' + par(x1) + ')² + (' + neg(y2) + ' − ' + par(y1) + ')²) = √(' + par(x2 - x1) + '² + ' + par(y2 - y1) + '²) = √' + s + (Number.isInteger(Math.sqrt(s)) ? ' = ' : ' ≈ ') + d, { tol: .0051, needStep: true });
    },
    function midpoint(l) {
      const x1 = ri(-8, 8), y1 = ri(-8, 8), x2 = x1 + 2 * ri(-5, 5), y2 = y1 + 2 * ri(-5, 5) + (l === 2 ? 1 : 0), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return ptQ(p('Calculate the midpoint M of A' + PT(x1, y1) + ' and B' + PT(x2, y2) + '.'), mx, my, 'M = ((x<sub>A</sub> + x<sub>B</sub>) / 2, (y<sub>A</sub> + y<sub>B</sub>) / 2)', 'x<sub>M</sub> = (' + neg(x1) + ' + ' + par(x2) + ') / 2 = ' + neg(mx) + '<br>y<sub>M</sub> = (' + neg(y1) + ' + ' + par(y2) + ') / 2 = ' + neg(my) + '<br>M = ' + PT(mx, my));
    },
    function lineThrough(l) {
      const m = nz(-4, 4), x1 = ri(-5, 5), y1 = ri(-8, 8), b = y1 - m * x1;
      if (l >= 2) { const c = nz(-9, 9), given = (m === -1 ? '' : m === 1 ? '−' : neg(-m)) + X() + ' + ' + X('y') + ' = ' + neg(c);   // spicy: parallel to a line that is not written as y = ...
        return ex(p('Line ' + X('k') + ' is parallel to the line ' + given + ' and passes through ' + PT(x1, y1) + '. Give the formula of ' + X('k') + ' as ' + X('y') + ' = … <small>Type only the right side.</small>'), m + '*x' + (b ? '+(' + b + ')' : ''), 'poly', 'Write the given line as ' + X('y') + ' = …: then you see the gradient. Parallel lines have the same gradient.', X('y') + ' = ' + lin(m, c) + ', so the gradient is ' + neg(m) + '.<br>' + X('y') + ' − ' + par(y1) + ' = ' + neg(m) + '(' + X() + ' − ' + par(x1) + ')<br>' + X('y') + ' = ' + lin(m, b), { keys: ['(', ')'], ansText: X('y') + ' = ' + lin(m, b) }); }
      return ex(p('Line ' + X('k') + ' has gradient ' + neg(m) + ' and passes through ' + PT(x1, y1) + '. Give the formula of ' + X('k') + ' as ' + X('y') + ' = … <small>Type only the right side.</small>'), m + '*x' + (b ? '+(' + b + ')' : ''), 'poly', 'Use ' + X('y') + ' − ' + X('y') + '<sub>1</sub> = ' + X('m') + '(' + X() + ' − ' + X() + '<sub>1</sub>).', X('y') + ' − ' + par(y1) + ' = ' + neg(m) + '(' + X() + ' − ' + par(x1) + ')<br>' + X('y') + ' = ' + lin(m, b), { keys: ['(', ')'], ansText: X('y') + ' = ' + lin(m, b) });
    },
    function parPerp(l) {
      const mk = pick([[1, 2], [2, 1], [3, 1], [1, 3], [2, 3], [3, 2]]), k = ri(0, 2);
      const a = mk[0], b = mk[1], c1 = ri(-9, 9), c2 = ri(-9, 9);
      const L1 = poly([[a, X()], [b, X('y')]]) + ' = ' + neg(c1);
      const L2 = k === 0 ? poly([[2 * a, X()], [2 * b, X('y')]]) + ' = ' + neg(2 * c2 + 1) : k === 1 ? poly([[b, X()], [-a, X('y')]]) + ' = ' + neg(c2) : poly([[b, X()], [a, X('y')]]) + ' = ' + neg(c2);
      const m1 = -a / b, m2 = k === 0 ? -a / b : k === 1 ? b / a : -b / a, right = k === 0 ? 'parallel' : k === 1 ? 'perpendicular' : (a === b ? 'parallel' : 'neither');
      const fm = (n, d) => (n * d < 0 ? '−' : '') + fl(Math.abs(n), Math.abs(d));
      return ch(p('Lines ' + X('k') + ': ' + L1 + ' and ' + X('l') + ': ' + L2 + '. Are they parallel, perpendicular or neither?'), right, ['parallel', 'perpendicular', 'neither'].filter(o => o !== right), 'Write both lines as y = mx + q. Parallel: equal gradients. Perpendicular: m<sub>k</sub> · m<sub>l</sub> = −1.', 'm<sub>k</sub> = ' + fm(-a, b) + ' and m<sub>l</sub> = ' + fm(k === 0 ? -a : k === 1 ? b : -b, k === 0 ? b : a) + '. ' + (right === 'parallel' ? 'The gradients are equal: parallel.' : right === 'perpendicular' ? 'm<sub>k</sub> · m<sub>l</sub> = −1: perpendicular.' : 'Not equal and the product is not −1: neither.'));
    },
    function circleO(l) {
      const tr = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [0, 7, 7], [8, 15, 17]]), sx = pick([1, -1]), sy = pick([1, -1]), x = sx * tr[0], y = sy * tr[1], r = tr[2], ask = Math.random() < .5;
      if (ask) return nu(p('A circle has centre O(0, 0) and passes through ' + PT(x, y) + '. Calculate the radius.'), r, 'r² = x² + y² (Pythagoras).', 'r² = ' + par(x) + '² + ' + par(y) + '² = ' + r * r + '<br>r = ' + r);
      const on = Math.random() < .5, yy = on ? y : y + 1;
      return ch(p('Does the point ' + PT(x, yy) + ' lie on the circle ' + X() + '² + ' + X('y') + '² = ' + r * r + '?'), on ? 'yes' : 'no', [on ? 'no' : 'yes'], 'Substitute the point and check if you get ' + r * r + '.', par(x) + '² + ' + par(yy) + '² = ' + (x * x + yy * yy) + (on ? ': yes.' : ', not ' + r * r + ': no.'));
    }
  ];
  const V5 = [
    function isProposition(l) {
      const S = [['The square root of 25 is 5.', 'yes'], ['There are infinitely many prime numbers.', 'yes'], ['Is it raining?', 'no'], ['Close the door!', 'no'], ['Amsterdam is the capital of Belgium.', 'yes'], ['Chocolate ice cream is the best.', 'no'], ['7 is an even number.', 'yes'], ['What time is it?', 'no']];
      const s = pick(S);
      return ch(p('Is this a proposition?') + p('<i>' + s[0] + '</i>'), s[1], [s[1] === 'yes' ? 'no' : 'yes'], 'A proposition is a statement that is either true or false. Questions, orders and opinions are not propositions.', s[1] === 'yes' ? 'It is either true or false, so it is a proposition.' : 'It cannot be true or false (a question, an order or an opinion), so it is not a proposition.');
    },
    function symbols(l) {
      const A = 'I drink tea', B = 'I eat a biscuit', forms = [['A ∧ B', A + ' and ' + B + '.'], ['A ∨ B', A + ' or ' + B + '.'], ['A ∧ ¬B', A + ' and I do not eat a biscuit.'], ['¬A ∧ ¬B', 'I do not drink tea and I do not eat a biscuit.'], ['¬A ∨ B', 'I do not drink tea or ' + B + '.']];
      const f = pick(forms);
      return ch(p('A: <i>' + A + '</i>. B: <i>' + B + '</i>. Which sentence means <b>' + f[0] + '</b>?'), f[1], forms.filter(x => x !== f).map(x => x[1]).slice(0, 3), '¬ means NOT, ∧ means AND, ∨ means OR.', f[0] + ' means: ' + f[1]);
    },
    function truthValue(l) {
      const a = Math.random() < .5, b = Math.random() < .5, forms = [['A ∧ B', a && b], ['A ∨ B', a || b], ['¬A', !a], ['A ∧ ¬B', a && !b], ['¬A ∨ B', !a || b], ['¬(A ∧ B)', !(a && b)]], f = pick(l === 0 ? forms.slice(0, 3) : forms);
      const T = v => v ? 'true' : 'false';
      return ch(p('A is ' + T(a) + ' and B is ' + T(b) + '. Is <b>' + f[0] + '</b> true or false?'), T(f[1]), [T(!f[1])], 'A ∧ B is only true when both are true. A ∨ B is true when at least one is true. ¬ turns true into false.', f[0] + ' is ' + T(f[1]) + '.');
    },
    function validConclusion(l) {
      const C = [['When it rains, I carry an umbrella. It rains.', 'So I carry an umbrella.', 'valid'], ['When it rains, I carry an umbrella. I carry an umbrella.', 'So it rains.', 'not valid'], ['All birds have feathers. A parrot is a bird.', 'So a parrot has feathers.', 'valid'], ['All mathematicians like puzzles. Some British people like puzzles.', 'So some British people are mathematicians.', 'not valid'], ['It rains on Sunday. Today is not Sunday.', 'So it does not rain today.', 'not valid'], ['All squares are rectangles. ABCD is a square.', 'So ABCD is a rectangle.', 'valid']];
      const c = pick(C);
      return ch(p('Premises: <i>' + c[0] + '</i>') + p('Conclusion: <i>' + c[1] + '</i> Is this conclusion valid?'), c[2], [c[2] === 'valid' ? 'not valid' : 'valid'], 'A conclusion is valid only if it must be true whenever the premises are true.', c[2] === 'valid' ? 'If the premises are true, the conclusion must be true: valid.' : 'The premises can be true while the conclusion is false: not valid.');
    }
  ];
  const V6 = [
    function spaceDiagonal(l) {
      const a = ri(2, 10), b = ri(2, 10), c = ri(2, 10), s = a * a + b * b + c * c, d = rd(Math.sqrt(s), 2);
      if (l >= 2) { const Q = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15]]), k = pick([1, 2, 3]);   // spicy: the other way round, an edge is asked
        return nu(p('A cuboid is ' + Q[0] * k + ' by ' + Q[1] * k + ' cm at the bottom. Its space diagonal is ' + Q[3] * k + ' cm. How high is the cuboid?'), Q[2] * k, 'Space diagonal² = a² + b² + c². Fill in what you know and solve for c².', (Q[3] * k) + '² = ' + Q[0] * k + '² + ' + Q[1] * k + '² + c²<br>' + (Q[3] * k) ** 2 + ' = ' + ((Q[0] * k) ** 2 + (Q[1] * k) ** 2) + ' + c²<br>c² = ' + (Q[2] * k) ** 2 + ', c = ' + Q[2] * k + ' cm', { needStep: true }); }
      return nu(p('A cuboid is ' + a + ' by ' + b + ' by ' + c + ' cm. Calculate the length of a space diagonal. <small>(Round to 2 decimals.)</small>'), d, 'First the diagonal of the bottom face, then Pythagoras again. Or: √(a² + b² + c²).', 'bottom diagonal² = ' + a + '² + ' + b + '² = ' + (a * a + b * b) + '<br>space diagonal = √(' + (a * a + b * b) + ' + ' + c + '²) = √' + s + (Number.isInteger(Math.sqrt(s)) ? ' = ' : ' ≈ ') + d, { tol: .0051, needStep: true });
    },
    function diagonalAngle(l) {
      const a = ri(2, 10), b = ri(2, 10), c = ri(2, 10), base = Math.sqrt(a * a + b * b), ang = rd(Math.atan(c / base) * 180 / Math.PI, 1);
      if (l >= 2) { const al = ri(20, 60), hh = rd(base * Math.tan(al * Math.PI / 180), 2);   // spicy: the angle is given, the height is asked
        return nu(p('A cuboid is ' + a + ' by ' + b + ' cm at the bottom. A space diagonal makes an angle of ' + al + '° with the bottom face. How high is the cuboid? <small>(Round to 2 decimals.)</small>'), hh, 'The space diagonal, the bottom diagonal and a vertical edge form a right-angled triangle. Use tan.', 'bottom diagonal = √(' + a + '² + ' + b + '²) = √' + (a * a + b * b) + ' ≈ ' + rd(base, 3) + '<br>height = √' + (a * a + b * b) + ' · tan(' + al + '°) ≈ ' + hh + ' cm', { tol: .0051, needStep: true }); }
      return nu(p('A cuboid is ' + a + ' by ' + b + ' cm at the bottom and ' + c + ' cm high. Calculate the angle between a space diagonal and the bottom face. <small>(Round to 1 decimal.)</small>'), ang, 'The space diagonal, the bottom diagonal and a vertical edge form a right-angled triangle.', 'bottom diagonal = √(' + a + '² + ' + b + '²) = √' + (a * a + b * b) + '<br>tan(α) = ' + c + ' / √' + (a * a + b * b) + '<br>α ≈ ' + ang + '°', { tol: .051, needStep: true });
    },
    function frustum(l) {
      const top = pick([1.5, 2, 3]), k = pick([2, 3, 4]), bot = top * k, x = pick([3, 4, 5, 6]), h = x * (k - 1);
      if (l >= 2) { const V = (bot * bot * (h + x) - top * top * x) / 3;   // spicy: the volume of the frustum
        return nu(p('A frustum (a pyramid with the top cut off) has height ' + h + '. The bottom square has side ' + bot + ' and the top square has side ' + top + '. Calculate the <b>volume</b> of the frustum. <small>(Round to 1 decimal.)</small>'), rd(V, 1), 'First find the height of the original pyramid with similar triangles. Volume of the frustum = big pyramid − small pyramid.', 'small top part: x = ' + x + ' (similar triangles), original height ' + (h + x) + '<br>V = ⅓ · ' + bot + '² · ' + (h + x) + ' − ⅓ · ' + top + '² · ' + x + ' = ' + rd(bot * bot * (h + x) / 3, 2) + ' − ' + rd(top * top * x / 3, 2) + ' ≈ ' + rd(V, 1), { tol: .051, needStep: true }); }
      return nu(p('A frustum (a pyramid with the top cut off) has height ' + h + '. The bottom square has side ' + bot + ' and the top square has side ' + top + '. Calculate the height of the original pyramid.'), h + x, 'Call the height of the cut-off top part x. Similar triangles: ' + top + ' / ' + bot + ' = x / (x + ' + h + ').', top + ' · (x + ' + h + ') = ' + bot + 'x<br>' + rd(top * h) + ' = ' + rd(bot - top) + 'x<br>x = ' + x + '<br>height = ' + h + ' + ' + x + ' = ' + (h + x), { needStep: true });
    },
    function hypercube(l) {
      const n = ri(2, 6), what = pick(['vertices', 'edges']), v = Math.pow(2, n), e = n * Math.pow(2, n - 1);
      return nu(p('A cube in ' + n + ' dimensions is made by copying a cube in ' + (n - 1) + ' dimensions and connecting the corresponding vertices. How many <b>' + what + '</b> does it have?'), what === 'vertices' ? v : e, 'Every step doubles the number of vertices. Edges: 2 · (old edges) + (old vertices).', what === 'vertices' ? '2<sup>' + n + '</sup> = ' + v : 'vertices of the ' + (n - 1) + '-cube: ' + Math.pow(2, n - 1) + ', edges: ' + (n - 1) * Math.pow(2, n - 2) + '<br>2 · ' + (n - 1) * Math.pow(2, n - 2) + ' + ' + Math.pow(2, n - 1) + ' = ' + e);
    }
  ];
  G['8.2'] = V2; G['8.3'] = V3; G['8.4'] = V4; G['8.5'] = V5; G['8.6'] = V6;
  XG['8.2'] = []; XG['8.3'] = []; XG['8.4'] = []; XG['8.5'] = []; XG['8.6'] = [];
  SECTIONS.splice(0, SECTIONS.length, SECTIONS[0],
    { id: '8.2', title: '8.2 Probability distributions', sub: 'Two dice, drawing marbles, games, areas' },
    { id: '8.3', title: '8.3 Functions with a parameter', sub: 'f with p, vertex, touching, number of intersections' },
    { id: '8.4', title: '8.4 Analytic geometry', sub: 'Distance, midpoint, lines, parallel and perpendicular, circles' },
    { id: '8.5', title: '8.5 Logic', sub: 'Propositions, ¬ ∧ ∨, valid conclusions' },
    { id: '8.6', title: '8.6 Spatial geometry', sub: 'Space diagonals, angles, frustums, hypercubes' });
  GOALS.splice(1, GOALS.length - 1,
    ['8.2', 'I can make and use a probability distribution', ['diceSum', 'diceAtMost', 'drawTwo', 'gamesWon', 'missingProb', 'targetProb'], 'All probabilities add up to 1.'],
    ['8.3', 'I can work with functions with a parameter', ['evalFp', 'familyP', 'vertexP', 'touchP', 'intersectCount'], 'Touching: D = 0.'],
    ['8.4', 'I can calculate distances, midpoints and line formulas', ['distance', 'midpoint', 'lineThrough', 'parPerp', 'circleO'], 'Perpendicular: m₁ · m₂ = −1.'],
    ['8.5', 'I can work with propositions and logical symbols', ['isProposition', 'symbols', 'truthValue', 'validConclusion'], '¬ not, ∧ and, ∨ or.'],
    ['8.6', 'I can calculate lengths and angles in solids', ['spaceDiagonal', 'diagonalAngle', 'frustum', 'hypercube'], 'Look for a right-angled triangle.']);
}
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "3HT": [
      {"id": "D1", "title": "Lesson · 8.1 A Rate of change", "sub": "Wed 2 Jun · ex 1, 2, 3, 4, 5, 6", "date": "2027-06-02", "gens": [["8.1", "intervalNotation"], ["8.1", "avgGradient"], ["8.1", "avgFromTable"]], "xg": [["8.1", "averageCost"]]},
      {"id": "D2", "title": "Lesson · 8.1 B Rate of change", "sub": "Thu 3 Jun · ex 7, 9, 10, 12", "date": "2027-06-03", "gens": [["8.1", "avgFromTable"], ["8.1", "gradientShape"], ["8.1", "avgSpeed"]], "xg": [["8.1", "averageCost"]]},
      {"id": "D3", "title": "Lesson · 8.2 A Counting", "sub": "Fri 4 Jun · ex 14, 15, 16, 17, 18, 19", "date": "2027-06-04", "gens": [["8.2", "menu"], ["8.2", "codeRepeat"], ["8.2", "codeNoRepeat"]], "xg": [["8.2", "routesVia"], ["8.2", "samePawns"]]},
      {"id": "D4", "title": "Lesson · 8.2 B Counting", "sub": "Wed 9 Jun · ex 20, 21, 22, 23, 24", "date": "2027-06-09", "gens": [["8.2", "codeNoRepeat"], ["8.2", "arrange"], ["8.2", "roles"], ["8.2", "plates"]], "xg": [["8.2", "routesVia"], ["8.2", "samePawns"]]},
      {"id": "D5", "title": "Lesson · 8.3 A Functions", "sub": "Thu 10 Jun · ex 29, 30, 31, 32, 33, 34", "date": "2027-06-10", "gens": [["8.3", "evalLinear"], ["8.3", "evalQuad"], ["8.3", "solveFx"]], "xg": [["8.3", "familyP"], ["8.3", "newFunction"]]},
      {"id": "D6", "title": "Lesson · 8.3 B Functions", "sub": "Fri 11 Jun · ex 35, 36, 37, 38, 39, 40", "date": "2027-06-11", "gens": [["8.3", "solveFx"], ["8.3", "difference"], ["8.3", "maxMin"], ["8.3", "maxMinFactored"]], "xg": [["8.3", "familyP"], ["8.3", "newFunction"]]},
      {"id": "D7", "title": "Test prep · chapters 7 & 8", "sub": "Wed 16 Jun", "date": "2027-06-16", "gens": [["8.1", "intervalNotation"], ["8.1", "avgGradient"], ["8.1", "avgFromTable"], ["8.1", "gradientShape"], ["8.1", "avgSpeed"], ["8.2", "menu"], ["8.2", "codeRepeat"], ["8.2", "codeNoRepeat"], ["8.2", "arrange"], ["8.2", "roles"], ["8.2", "plates"], ["8.2", "whichCount"], ["8.3", "evalLinear"], ["8.3", "evalQuad"], ["8.3", "solveFx"], ["8.3", "difference"], ["8.3", "maxMin"], ["8.3", "maxMinFactored"], ["8.3", "onGraph"]], "xg": [["8.1", "averageCost"], ["8.2", "routesVia"], ["8.2", "samePawns"], ["8.3", "familyP"], ["8.3", "newFunction"]], "rev": true},
      {"id": "D8", "title": "Test prep · chapters 7 & 8", "sub": "Thu 17 Jun", "date": "2027-06-17", "gens": [["8.1", "intervalNotation"], ["8.1", "avgGradient"], ["8.1", "avgFromTable"], ["8.1", "gradientShape"], ["8.1", "avgSpeed"], ["8.2", "menu"], ["8.2", "codeRepeat"], ["8.2", "codeNoRepeat"], ["8.2", "arrange"], ["8.2", "roles"], ["8.2", "plates"], ["8.2", "whichCount"], ["8.3", "evalLinear"], ["8.3", "evalQuad"], ["8.3", "solveFx"], ["8.3", "difference"], ["8.3", "maxMin"], ["8.3", "maxMinFactored"], ["8.3", "onGraph"]], "xg": [["8.1", "averageCost"], ["8.2", "routesVia"], ["8.2", "samePawns"], ["8.3", "familyP"], ["8.3", "newFunction"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: [...new Set(o.gens.map(g => g[0]))].reduce((a, s) => a.concat((XG[s] || []).map(f => [s, f.name])), []) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-' + P.cls.toLowerCase() + '-ch8-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['intervalNotation', 'whichCount', 'evalLinear'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
