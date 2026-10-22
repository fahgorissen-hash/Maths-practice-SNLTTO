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
    const k = pick([1.25, 2.5, 5, 0.5]), t1 = ri(1, 4), t2 = t1 + pick([1, 2, 0.5]), d = t => k * t * t, v = rd((d(t2) - d(t1)) / (t2 - t1), 4);
    return nu(p('A car drives ' + X('d') + ' = ' + k + X('t') + '² metres in ' + X('t') + ' seconds. Calculate the average speed (m/s) between ' + X('t') + ' = ' + t1 + ' and ' + X('t') + ' = ' + t2 + '.'), v, 'Average speed = Δ' + X('d') + ' / Δ' + X('t') + '.', p(X('d') + '(' + t1 + ') = ' + rd(d(t1)) + ' and ' + X('d') + '(' + t2 + ') = ' + rd(d(t2))) + p('(' + rd(d(t2)) + ' − ' + rd(d(t1)) + ') / (' + t2 + ' − ' + t1 + ') = ' + rd(d(t2) - d(t1)) + ' / ' + rd(t2 - t1) + ' = ' + v + ' m/s'), { needStep: true });
  }
];
XG['8.1'] = [
  function averageCost(l) {
    const fix = pick([20000, 50000, 80000]), var_ = pick([1.25, 2, 0.75]), q = pick([1000, 10000, 40000, 100000]), C = fix + var_ * q, avg = rd(C / q, 2);
    return nu(p('A company makes ' + X('q') + ' kg of product. The costs are ' + X('C') + ' = ' + sp(fix) + ' + ' + var_ + X('q') + ' euros. Calculate the average cost per kg for ' + X('q') + ' = ' + sp(q) + '.'), avg, 'Average cost = total cost / number of kg.', p(X('C') + ' = ' + sp(fix) + ' + ' + var_ + ' · ' + sp(q) + ' = ' + sp(C)) + p(sp(C) + ' / ' + sp(q) + ' = ' + avg + ' euros per kg'), { needStep: true, tol: .0051 });
  }
];

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
    return nu(p('A PIN code has ' + n + ' digits (0 to 9). Every digit may be used only <b>once</b>. How many different codes are possible?'), prod(arr), 'The first digit has 10 choices, the next one 9, and so on.', prodTxt(arr) + ' = ' + sp(prod(arr)), { needStep: true });
  },
  function arrange(l) {
    const n = l === 0 ? ri(3, 5) : ri(5, 8), what = pick(['books on a shelf', 'runners in a row', 'students in a line']), arr = desc(n, n);
    return nu(p('In how many different orders can you put ' + n + ' ' + what + '?'), prod(arr), 'The first place has ' + n + ' choices, the second ' + (n - 1) + ', and so on.', prodTxt(arr) + ' = ' + sp(prod(arr)), { needStep: true });
  },
  function roles(l) {
    const n = ri(12, 30), k = pick([2, 3, 3, 4]), roles = ['a chairperson', 'a secretary', 'a treasurer', 'a reporter'].slice(0, k), arr = desc(n, k);
    return nu(p('A club has ' + n + ' members. You choose ' + roles.slice(0, -1).join(', ') + ' and ' + roles[k - 1] + '. One person cannot have two jobs. In how many ways can you do this?'), prod(arr), 'The order matters (different jobs). For the second job there is one person fewer.', prodTxt(arr) + ' = ' + sp(prod(arr)) + ' ways', { needStep: true });
  },
  function plates(l) {
    const L = ri(1, 3), D = ri(1, 4), letters = pick([26, 20]), parts = Array(L).fill(letters).concat(Array(D).fill(10));
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
    const a = nz(-5, 5), b = ri(-9, 9), x1 = ri(-4, 6), x2 = ri(-4, 6); if (x1 === x2) return G['8.3'][3](l);
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
    return ch(p('Does the point (' + neg(x) + ', ' + neg(yy) + ') lie on the graph of ' + F('f', X()) + ' = ' + quad(a, b, c) + '?'), on ? 'yes' : 'no', [on ? 'no' : 'yes'], 'Calculate ' + F('f', neg(x)) + ' and compare it with ' + neg(yy) + '.', F('f', neg(x)) + ' = ' + subQ(a, b, c, x) + ' = ' + neg(y) + (on ? '. This equals ' + neg(yy) + ': yes.' : ', not ' + neg(yy) + ': no.'));
  }
];
XG['8.3'] = [
  function familyP(l) {
    const x = ri(2, 5), pp = nz(-6, 6), c = ri(-3, 3), target = x * x + pp * x + c;
    return nu(p('For every number ' + X('p') + ' you have the function ' + X('f') + '<sub>' + X('p') + '</sub>(' + X() + ') = ' + X() + '² + ' + X('p') + X() + (c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : '') + '. For which ' + X('p') + ' is ' + X('f') + '<sub>' + X('p') + '</sub>(' + x + ') = ' + neg(target) + '?'), pp, 'Substitute ' + X() + ' = ' + x + ' and solve the equation for ' + X('p') + '.', p(x + '² + ' + X('p') + ' · ' + x + (c ? (c < 0 ? ' − ' : ' + ') + Math.abs(c) : '') + ' = ' + neg(target)) + p((x * x + c) + ' + ' + x + X('p') + ' = ' + neg(target)) + p(x + X('p') + ' = ' + neg(target - x * x - c)) + p(X('p') + ' = ' + neg(pp)), { noStep: true });
  },
  function newFunction(l) {
    let a, b, k; do { a = nz(-6, 6); b = ri(-20, 20); k = nz(-12, 12); } while (b + k === 0);
    return { type: 'expr', html: p('Given ' + F('g', X()) + ' = ' + poly([[b, ''], [a, X()]]) + ' and ' + F('h', X()) + ' = ' + F('g', X()) + (k < 0 ? ' − ' + -k : ' + ' + k) + '. Give the formula of ' + X('h') + ' as simple as possible. <small>Type only the right side.</small>'), ans: a + '*x+(' + (b + k) + ')', form: 'poly', hint: 'Write the formula of ' + X('g') + ' in place of ' + F('g', X()) + ' and add up the numbers.', steps: F('h', X()) + ' = ' + poly([[b, ''], [a, X()]]) + (k < 0 ? ' − ' + -k : ' + ' + k) + ' = ' + poly([[b + k, ''], [a, X()]]), keys: ['(', ')'], ansText: F('h', X()) + ' = ' + poly([[b + k, ''], [a, X()]]) };
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
return { key: 'nx-3ht-ch8-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
