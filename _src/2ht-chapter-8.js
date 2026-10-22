/* shared algebra helpers (copied from 3HT chapter 1): canonical strings from rational functions */
const ALG = (function (NX) {
  const { Poly, gcd } = NX;
  const keyVars = k => { const m = {}; const re = /([^\d])(\d+)/g; let x; while ((x = re.exec(k))) m[x[1]] = +x[2]; return m; };
  const mkKey = m => Object.keys(m).filter(v => m[v] > 0).sort().map(v => v + m[v]).join('');
  const vstr = m => Object.keys(m).filter(v => m[v] > 0).sort().map(v => v + (m[v] > 1 ? '^' + m[v] : '')).join('');
  function polyStr(N) {
    const ks = Object.keys(N); if (!ks.length) return '0';
    const tdeg = k => Object.values(keyVars(k)).reduce((a, b) => a + b, 0);
    ks.sort((a, b) => tdeg(b) - tdeg(a) || (a < b ? -1 : 1));
    return ks.map((k, i) => { const c = N[k], ab = Math.abs(c), vs = vstr(keyVars(k)); let body = vs ? (ab === 1 ? '' : String(+ab.toFixed(8))) + vs : String(+ab.toFixed(8)); return (c < 0 ? '-' : i ? '+' : '') + body; }).join('');
  }
  function rfStr(rf) {
    let N = Object.assign({}, rf.N), D = Object.assign({}, rf.D); const dk = Object.keys(D); if (dk.length !== 1) throw new Error('den not monomial');
    if (!Object.keys(N).length) return '0';
    let dc = D[dk[0]]; let dv = keyVars(dk[0]);
    if (dc < 0) { dc = -dc; Object.keys(N).forEach(k => N[k] = -N[k]); }
    let g = Math.round(Math.abs(dc)); if (Number.isInteger(dc) && Object.values(N).every(Number.isInteger)) { Object.values(N).forEach(c => { g = gcd(g, c); }); } else g = 1;
    if (g > 1) { dc /= g; Object.keys(N).forEach(k => N[k] /= g); }
    for (const v of Object.keys(dv)) { let m = Infinity; Object.keys(N).forEach(k => { m = Math.min(m, keyVars(k)[v] || 0); }); const t = Math.min(m, dv[v]); if (t > 0) { dv[v] -= t; const N2 = {}; Object.keys(N).forEach(k => { const kv = keyVars(k); kv[v] -= t; N2[mkKey(kv)] = (N2[mkKey(kv)] || 0) + N[k]; }); N = N2; } }
    const ns = polyStr(N); const dvs = vstr(dv); const dstr = (dc === 1 ? '' : String(dc)) + dvs; const nTerms = Object.keys(N).length;
    if (dstr === '') return ns; const nn = nTerms > 1 ? '(' + ns + ')' : ns; const dd = (dc !== 1 && dvs) || /[\^]/.test(dstr) || dstr.length > 1 ? '(' + dstr + ')' : dstr; return nn + '/' + dd;
  }
  const canon = src => { const rf = NX.toRF(NX.parse(src)); if (!rf) throw new Error('canon ' + src); return rfStr(rf); };
  const terms = (arr) => arr.map((t, i) => (t[0] < 0 ? '-' : i ? '+' : '') + (Math.abs(t[0]) === 1 && t[1] ? '' : Math.abs(t[0])) + t[1]).join('');   // [[c,'x^2'],...] -> '3x^2-4'
  return { canon, rfStr, polyStr, terms, keyVars };
})(NX);


const { ri, pick, shuffle, nz, gcd, M } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const V = () => pick(['a', 'b', 'k', 'm', 'p', 'q', 'r', 't', 'x', 'y', 'z']);
const V2 = () => { const a = V(); let b; do { b = V(); } while (b === a); return [a, b].sort(); };
const pw = (v, e) => e === 0 ? '' : e === 1 ? v : v + '^' + e;
const T = (c, m) => (c < 0 ? '-' : '') + (Math.abs(c) === 1 && m ? '' : String(Math.abs(c))) + m;   // one term as source text
const C = src => ALG.canon(src);
const CS = list => list.map((x, i) => i && x[0] !== '-' ? '+' + x : x).join('');                     // join terms with signs
const br = s => /^([a-z]|\d+)$/.test(s) ? s : '(' + s + ')';                                               // brackets around a base unless it is one letter
const chain = arr => arr.filter((s, i) => i === 0 || s !== arr[i - 1]).map(s => M(s)).join(' = ');
/* expression question: list = [question, step, step, ...]; the answer is the simplified form of the question */
const alg = (html, list, form, hint, extra) => { const ans = C(list[0]); list.forEach(x => must(C(x.replace(/\^\(([\d+*-]+)\)/g, (m, e) => '^' + Function('return ' + e)())), ans)); return ex(html, ans, form, hint, chain(list.concat([ans])), Object.assign({ negExp: false }, extra || {})); };
/* every term of A times every term of B, written out (A and B are lists of [coefficient, letters]) */
function prodLine(A, B, first) {
  let s = '';
  A.forEach(a => B.forEach(b => { const neg = a[0] < 0, con = s === '' && first !== false ? (neg ? '-' : '') : (neg ? '-' : '+'); s += con + T(Math.abs(a[0]), a[1]) + '*' + T(b[0], b[1]); }));
  return s;
}
const prodVals = (A, B) => { const o = []; A.forEach(a => B.forEach(b => o.push(C(T(a[0], a[1]) + '*(' + T(b[0], b[1]) + ')')))); return o; };
const src = L => CS(L.map(t => T(t[0], t[1])));
const linBr = (a, v, b) => src([[a, v], [b, '']].filter(t => t[0] !== 0));   // a·v + b
const must = (a, b) => { if (a !== b) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const HSUB = ' Put the number in brackets: (−2)⁴ is not the same as −2⁴.';

/* ======================= 8.1 Powers and like terms ======================= */
G['8.1'] = [
  function writePower(l) {
    if (l === 0 || Math.random() < .5) {
      const v = V(), n = ri(3, 7), s = Array(n).fill(v).join('*');
      return alg(p('Write as a power: ' + M(s) + '.'), [s], 'mono', 'Count how many times the letter is multiplied by itself. That number is the exponent.');
    }
    const [v, w] = V2(), n = ri(2, 5), s = Array(n).fill(v + w).join('*');
    return alg(p('Write as short as possible, using powers: ' + M(s) + '.'), [s, '(' + v + w + ')^' + n], 'mono', 'You multiply ' + v + w + ' by itself ' + n + ' times. Then raise every letter to that power.');
  },
  function bracketPower(l) {
    const c = ri(2, 5), v = V(), n = ri(3, 5), s = Array(n).fill(c + v).join('*');
    const right = M('(' + c + v + ')^' + n);
    return ch(p('Which power is the same as ' + M(s) + '?'), right, [M(c + v + '^' + n), M(n * c + v), M(c * n + v + '^' + n)], 'The whole term ' + c + v + ' is multiplied by itself, so the brackets go around ' + c + v + '.', M(s) + ' = ' + right + ' = ' + M(c + '^' + n + '*' + v + '^' + n) + ' = ' + M(C(s)));
  },
  function substitute(l) {
    const x0 = pick(l === 0 ? [-1, -2, 2, 3] : [-2, -3, -1, 2, -2]); let terms;
    if (l === 0) terms = [[pick([1, -1, 2, 3, -2]), ri(2, 3)]];
    else if (l === 1) terms = Math.random() < .5 ? [[pick([1, -1, 2, 3, -2, 5]), Math.abs(x0) === 3 ? ri(2, 3) : ri(2, 5)]] : [[pick([1, -1, 2]), 3], [pick([-1, 1, 3, -2]), 2]];
    else { terms = [[pick([1, -1, 2, 3]), ri(2, 3)], [nz(-5, 5), 1], [nz(-9, 9), 0]]; if (Math.random() < .5) terms[0][0] = -terms[0][0]; }
    const s = src(terms.map(t => [t[0], pw('x', t[1])]));
    const line1 = terms.map((t, i) => { const neg = t[0] < 0, con = i === 0 ? (neg ? '-' : '') : (neg ? '-' : '+'), a = Math.abs(t[0]); if (t[1] === 0) return con + a; return con + (a === 1 ? '' : a + '*') + (x0 < 0 ? '(' + x0 + ')' : x0) + (t[1] > 1 ? '^' + t[1] : ''); }).join('');
    const vals = terms.map(t => t[0] * Math.pow(x0, t[1])), ans = vals.reduce((a, b) => a + b, 0);
    const line2 = vals.map((v, i) => i === 0 ? String(v) : (v < 0 ? '-' : '+') + Math.abs(v)).join('');
    return nu(p('Calculate the value of ' + M(s) + ' for ' + M('x = ' + x0) + '.'), ans, 'Replace x by (' + x0 + '). Powers first, then multiply, then add and subtract.' + (x0 < 0 ? HSUB : ''), chain([s, line1, line2, String(ans)]));
  },
  function productPower(l) {
    const [v, w] = V2(); let c, a, b = 0, n;
    if (l === 0) { c = ri(2, 4); a = 1; n = ri(2, 3); }
    else if (l === 1) { c = pick([-3, -2, 2, 3, 4, 5]); a = ri(1, 3); n = ri(2, 3); if (Math.random() < .4) b = 1; }
    else { c = pick([-2, -1, 2, 3, -3]); a = ri(1, 4); b = ri(1, 3); n = Math.abs(c) === 3 ? 3 : ri(2, 4); }
    const inner = T(c, pw(v, a) + pw(w, b)), s = '(' + inner + ')^' + n;
    const parts = [(c === -1 ? '(-1)^' + n : Math.abs(c) === 1 ? '' : (c < 0 ? '(' + c + ')' : c) + '^' + n), (a === 1 ? v : '(' + pw(v, a) + ')') + '^' + n, b ? (b === 1 ? w : '(' + pw(w, b) + ')') + '^' + n : ''].filter(Boolean);
    return alg(p('Write without brackets: ' + M(s) + '.'), [s, parts.join('*')], 'mono', 'Raise every factor inside the brackets to the power ' + n + ': the number and each letter.' + (c < 0 ? ' A negative number to an even power is positive.' : ''));
  },
  function likeTerms(l) {
    const v = V(); let kinds;
    if (l === 0) kinds = [pw(v, ri(2, 5)), ''];
    else if (l === 1) { const a = ri(2, 4); kinds = [pw(v, a), pw(v, a + 1), '']; }
    else { const [x, y] = V2(), a = ri(2, 4), b = ri(1, 3); kinds = [pw(x, a) + pw(y, b), pw(x, b) + pw(y, a + 1), pw(x, a)]; }
    let L = []; kinds.forEach((k, i) => { L.push([nz(-9, 9), k]); if (i < 2 || l === 2) L.push([nz(-9, 9), k]); }); if (l >= 1) L.push([nz(-6, 6), kinds[0]]);
    L = shuffle(L); const s = src(L), ans = C(s);
    if (ans === '0' || ans.replace(/[^+-]/g, '').length < 1 && l > 0) return G['8.1'][4](l);
    const order = []; L.forEach(t => { if (!order.includes(t[1])) order.push(t[1]); });
    const grouped = order.reduce((acc, k) => acc.concat(L.filter(t => t[1] === k)), []);
    return alg(p('Simplify: ' + M(s) + '.'), [s, src(grouped)], 'poly', 'You can only add or subtract like terms: the same letters with the same exponents.');
  },
  function multiplyTerms(l) {
    const [v, w] = V2(), same = l === 0 && Math.random() < .4, W = same ? v : w, a = l === 0 ? 1 : ri(1, 3), b = l === 0 ? 1 : ri(1, 3);
    const c1 = pick([2, 3, 4, 5, 6, -2, -3]), c2 = l === 0 ? ri(2, 9) : pick([2, 3, 4, 5, 7, -4, -5, -2]);
    const s1 = T(c1, pw(v, a)) + '*' + T(c2, pw(W, b)), prodSteps = c1 + '*' + (c2 < 0 ? c2 : c2) + '*' + (same ? pw(v, a) + '*' + pw(v, b) : pw(v, a) + '*' + pw(w, b));
    if (l === 0) return alg(p('Simplify: ' + M(s1) + '.'), [s1, prodSteps], 'mono', 'Multiply the numbers. Then write the letters behind it, in alphabetical order.' + (same ? ' ' + v + ' · ' + v + ' = ' + v + '².' : ''));
    const c3 = nz(-12, 12), k = pw(v, a) + pw(w, b);
    if (c1 * c2 + c3 === 0) return G['8.1'][5](l);
    const s = s1 + (c3 < 0 ? '-' : '+') + T(Math.abs(c3), k);
    return alg(p('Simplify: ' + M(s) + '.'), [s, prodSteps + (c3 < 0 ? '-' : '+') + T(Math.abs(c3), k), CS([T(c1 * c2, k), T(c3, k)])], 'poly', 'First do the multiplication. Then the two terms are like terms, so you can add them.');
  },
  function likeChoice(l) {
    const [v, w] = V2(), a = ri(2, 4), b = ri(1, a - 1), c1 = ri(2, 9), c2 = nz(-9, 9);
    const right = M(T(c1, pw(v, a) + pw(w, b))) + ' and ' + M(T(c2, pw(v, a) + pw(w, b)));
    const wrongs = [M(T(c1, pw(v, a) + pw(w, b))) + ' and ' + M(T(c1, pw(v, b) + pw(w, a))), M(T(c2, pw(v, a))) + ' and ' + M(T(c2, pw(v, a + 1))), M(T(c1, pw(v, a))) + ' and ' + M(T(c1, pw(w, a)))];
    return ch(p('Which two terms are <b>like terms</b>?'), right, wrongs, 'Like terms have exactly the same letters with the same exponents. The numbers in front may be different.', right + ': both have ' + M(pw(v, a) + pw(w, b)) + '.');
  }
];
XG['8.1'] = [
  function boxVolume(l) {
    const v = V(), c1 = ri(2, 5), c2 = pick([1, 2, 3]), s = c1 + v + '*' + T(c2, v) + '*' + v;
    return alg(p('A box is ' + M(c1 + v) + ' long, ' + M(T(c2, v)) + ' wide and ' + M(v) + ' high. Write the volume as short as possible.'), [s, c1 * c2 + '*' + v + '*' + v + '*' + v], 'mono', 'volume = length · width · height. Multiply the numbers, then the letters.');
  },
  function missingTerm(l) {
    const v = V(), n = ri(2, 6), a = nz(-6, 6), b = nz(-9, 9); if (a === b) return XG['8.1'][1](l);
    const left = T(a, pw(v, n)), part = T(b, pw(v, n));
    return alg(p('Fill in the missing term: ' + M(left) + ' = … ' + (b < 0 ? '− ' : '+ ') + M(T(Math.abs(b), pw(v, n))) + '.'), [left + '-(' + part + ')'], 'mono', 'The missing term plus the given term must give ' + M(left) + '. So calculate ' + M(left + '-(' + part + ')') + '.');
  }
];

/* ======================= 8.2 Rules of powers ======================= */
G['8.2'] = [
  function productRule(l) {
    const v = V(); let F;
    if (l === 0) F = [[1, ri(2, 6)], [1, ri(2, 6)]];
    else if (l === 1) F = [[pick([2, 3, 4, 5, 8, 10]), ri(2, 6)], [pick([2, 3, 5, 6, -2, -3, -6]), ri(2, 6)]];
    else F = [[pick([2, 3, 4, -5]), ri(2, 5)], [1, 1], [pick([-3, 2, 6, -2]), ri(2, 6)]];
    const s = F.map(f => T(f[0], pw(v, f[1]))).join('*'), cs = F.map(f => f[0]).filter(c => c !== 1), exps = F.map(f => f[1]).join('+');
    const line = (cs.length ? cs.join('*') + '*' : '') + v + '^(' + exps + ')';
    return alg(p('Simplify: ' + M(s) + '.'), [s, line], 'mono', 'Multiplying powers with the same base: <b>add</b> the exponents. Multiply the numbers in front.' + (l === 2 ? ' Remember ' + v + ' = ' + v + '¹.' : ''));
  },
  function quotientRule(l) {
    const v = V();
    if (l === 0) { const a = ri(5, 12), b = ri(2, a - 2), s = pw(v, a) + '/' + pw(v, b); return alg(p('Simplify: ' + M(s) + '.'), [s, v + '^(' + a + '-' + b + ')'], 'mono', 'Dividing powers with the same base: <b>subtract</b> the exponents.'); }
    if (l === 1 || Math.random() < .4) { const k = pick([2, 3, 4, 5, 7, -2, -3]), d = pick([2, 3, 5, -3, 4]), a = ri(5, 10), b = ri(1, a - 1), s = T(k * d, pw(v, a)) + '/(' + T(d, pw(v, b)) + ')';
      return alg(p('Simplify: ' + M(s) + '.'), [s, '(' + T(k * d, v + '^(' + a + '-' + b + ')') + ')/' + (d < 0 ? '(' + d + ')' : d)], 'mono', 'Divide the numbers. For the letter, subtract the exponents.'); }
    const a = ri(1, 4), b = a + ri(1, 4), d = pick([2, 3, 4, 5]), c1 = pick([1, 2, 3]) * (Math.random() < .3 ? -1 : 1), c2 = c1 * d, s = T(c1, pw(v, a)) + '/(' + T(c2, pw(v, b)) + ')';
    return alg(p('Simplify: ' + M(s) + '. <small>(The letter ends up in the denominator. Type it like 1/(3p^2).)</small>'), [s, c1 + '/(' + c2 + v + '^(' + b + '-' + a + '))'], 'lowest', 'There are more factors ' + v + ' below the line than above. Subtract: ' + b + ' − ' + a + ' factors ' + v + ' stay in the denominator. Simplify the numbers too.');
  },
  function powerOfPower(l) {
    const v = V();
    if (l === 0) { const a = ri(2, 4), b = ri(2, 3), s = '(' + pw(v, a) + ')^' + b; return alg(p('Simplify: ' + M(s) + '.'), [s, v + '^(' + a + '*' + b + ')'], 'mono', 'A power of a power: <b>multiply</b> the exponents.'); }
    const [x, w] = V2(), c = l === 1 ? pick([2, 3, 4, -2, 5]) : pick([-1, -2, 2, 3, -3]), a = ri(2, 4), b = l === 2 ? ri(1, 3) : 0, n = Math.abs(c) >= 4 ? 2 : ri(2, 3);
    const s = '(' + T(c, pw(x, a) + pw(w, b)) + ')^' + n;
    const line = [(Math.abs(c) === 1 ? (c < 0 ? '(-1)^' + n : '') : (c < 0 ? '(' + c + ')' : c) + '^' + n), x + '^(' + a + '*' + n + ')', b ? w + '^(' + b + '*' + n + ')' : ''].filter(Boolean).join('*');
    return alg(p('Simplify: ' + M(s) + '.'), [s, line], 'mono', 'Raise the number to the power ' + n + '. For every letter: multiply its exponent by ' + n + '.');
  },
  function mixedRules(l) {
    const v = V(), kind = l === 0 ? 0 : ri(0, 1);
    if (kind === 0) { const a = ri(1, 5), b = ri(2, 5), c1 = pick([2, 3, 4, 5, -2]), c2 = pick([2, 3, 6, -1, 5]), c3 = nz(-12, 12); if (c1 * c2 + c3 === 0) return G['8.2'][3](l);
      const k = pw(v, a + b), s = T(c1, pw(v, a)) + '*' + T(c2, pw(v, b)) + (c3 < 0 ? '-' : '+') + T(Math.abs(c3), k);
      return alg(p('Simplify: ' + M(s) + '.'), [s, CS([C(T(c1, pw(v, a)) + '*(' + T(c2, pw(v, b)) + ')'), T(c3, k)])], 'poly', 'First multiply (add the exponents). Then add the like terms.'); }
    const a = ri(2, 4), n = ri(2, 3), c = pick([2, 3, -2]), d = nz(-20, 20), k = pw(v, a * n); if (Math.pow(c, n) + d === 0) return G['8.2'][3](l);
    const s = '(' + T(c, pw(v, a)) + ')^' + n + (d < 0 ? '-' : '+') + T(Math.abs(d), k);
    return alg(p('Simplify: ' + M(s) + '.'), [s, CS([C('(' + T(c, pw(v, a)) + ')^' + n), T(d, k)])], 'poly', 'First work out the power of the brackets (multiply the exponents). Then add the like terms.');
  },
  function ruleChoice(l) {
    const R = [['multiply powers with the same base', 'add'], ['divide powers with the same base', 'subtract'], ['raise a power to a power', 'multiply']], r = pick(R);
    const ex1 = r[1] === 'add' ? 'a³ · a⁴ = a⁷' : r[1] === 'subtract' ? 'a⁷ : a³ = a⁴' : '(a³)⁴ = a¹²';
    return ch(p('When you ' + r[0] + ', you … the exponents.'), r[1], ['add', 'subtract', 'multiply', 'divide'].filter(x => x !== r[1]), 'Try it with an example: write the powers out as a · a · a …', 'You ' + r[1] + ' the exponents, for example ' + ex1 + '.');
  }
];
XG['8.2'] = [
  function baseChange(l) {
    const [b, e] = pick([[2, 2], [2, 3], [3, 2], [2, 4], [5, 2], [3, 3]]), n = ri(2, 5), big = Math.pow(b, e);
    return nu(p(big + ' = ' + M(b + '^' + e) + '. Write ' + M(big + '^' + n) + ' as a power of ' + b + ': ' + M(big + '^' + n) + ' = ' + b + '<sup>?</sup>. What is the exponent?'), e * n, 'Replace ' + big + ' by ' + M(b + '^' + e) + ' and use: power of a power, multiply the exponents.', M(big + '^' + n) + ' = ' + M('(' + b + '^' + e + ')^' + n) + ' = ' + M(b + '^(' + e + '*' + n + ')') + ' = ' + M(b + '^' + e * n) + ', so the exponent is ' + e * n + '.', { noStep: true });
  },
  function heightFromVolume(l) {
    const [v, w] = V2(), c1 = ri(2, 5), c2 = ri(2, 4), k = ri(1, 3), a = ri(2, 4), b = ri(2, 3), vol = T(c1 * c2 * k, pw(v, a) + pw(w, b));
    return alg(p('A box is ' + M(c1 + v) + ' long and ' + M(c2 + w) + ' wide. Its volume is ' + M(vol) + '. Write the height as short as possible.'), [vol + '/(' + c1 + v + '*' + c2 + w + ')', vol + '/(' + (c1 * c2) + v + w + ')'], 'mono', 'length · width · height = volume, so height = volume ÷ (length · width).');
  },
  function cubeOfPower(l) {
    const v = V(), a = ri(2, 4), c = l === 2 ? ri(2, 3) : 1, edge = T(c, pw(v, a));
    return alg(p('A cube has edges of length ' + M(edge) + '. Write the volume of the cube without brackets.'), ['(' + edge + ')^3'], 'mono', 'volume of a cube = edge³. Use the power of a power: multiply the exponents.');
  }
];

/* ======================= 8.3 Expanding brackets ======================= */
G['8.3'] = [
  function singleBracket(l) {
    const v = V(); let A, B;
    if (l === 0) { A = [[ri(2, 9), '']]; B = [[ri(1, 5), v], [nz(-9, 9), '']]; }
    else if (l === 1) { const k = ri(0, 2); if (k === 0) { A = [[pick([-2, -3, -4, -5, -6, -7]), '']]; B = [[nz(-6, 6), v], [nz(-9, 9), '']]; } else if (k === 1) { A = [[-1, '']]; B = shuffle([[nz(-5, 5), pw(v, ri(1, 2))], [nz(-9, 9), '']]); } else { A = [[pick([2, 3, 5, -2, -4]), v]]; B = [[ri(1, 4), v], [nz(-9, 9), '']]; } }
    else { const a = ri(1, 4); A = [[pick([2, 3, 5, -2, -8, 10]), pw(v, a)]]; B = [[nz(-6, 6), pw(v, ri(1, 4))], [nz(-9, 9), '']]; }
    const outer = T(A[0][0], A[0][1]), s = (outer === '-1' ? '-' : outer) + '(' + src(B) + ')';
    return alg(p('Expand the brackets: ' + M(s) + '.'), [s, prodLine(A, B), CS(prodVals(A, B))], 'poly', 'Multiply every term inside the brackets by what is in front of the brackets.' + (A[0][0] < 0 ? ' Watch the signs: a minus times a minus is a plus.' : ''));
  },
  function twoBrackets(l) {
    const v = V(), a1 = ri(2, 6), A2 = (l === 0 ? ri(2, 5) : pick([-2, -3, -4, -5, 3, 4]));
    const B1 = [[ri(1, 5), v], [nz(-9, 9), '']], B2 = shuffle([[nz(-7, 7), v], [nz(-9, 9), '']]);
    const s = a1 + '(' + src(B1) + ')' + (A2 < 0 ? '-' : '+') + Math.abs(A2) + '(' + src(B2) + ')', ans = C(s);
    if (!/[a-z]/.test(ans)) return G['8.3'][1](l);
    return alg(p('Expand and simplify: ' + M(s) + '.'), [s, prodLine([[a1, '']], B1) + prodLine([[A2, '']], B2, false), CS(prodVals([[a1, '']], B1).concat(prodVals([[A2, '']], B2)))], 'poly', 'Expand both brackets. ' + (A2 < 0 ? 'The minus belongs to the ' + Math.abs(A2) + ': multiply by ' + A2 + '. ' : '') + 'Then add the like terms.');
  },
  function doubleBracket(l) {
    const v = V(); let A, B;
    if (l === 0) { A = [[1, v], [nz(-9, 9), '']]; B = [[1, v], [nz(-9, 9), '']]; }
    else if (l === 1) { A = [[ri(1, 4), v], [nz(-7, 7), '']]; B = [[ri(2, 5), v], [nz(-7, 7), '']]; }
    else if (Math.random() < .5) { const a = ri(2, 4), b = ri(1, 3); A = [[ri(1, 3), pw(v, a)], [nz(-6, 6), '']]; B = [[1, pw(v, b)], [nz(-5, 5), '']]; }
    else { const [x, y] = V2(); A = [[ri(1, 4), x], [nz(-5, 5), y]]; B = [[ri(1, 3), x], [nz(-5, 5), y]]; }
    const s = '(' + src(A) + ')(' + src(B) + ')';
    return alg(p('Expand and simplify: ' + M(s) + '.'), [s, prodLine(A, B), CS(prodVals(A, B))], 'poly', 'Multiply every term of the first bracket by every term of the second bracket (4 products). Then add the like terms.');
  },
  function special(l) {
    const v = V(), t = pick(['sq+', 'sq-', 'diff']); let A, B;
    if (l === 0) { A = v; B = String(ri(1, 9)); }
    else if (l === 1) { A = ri(2, 5) + v; B = String(ri(1, 7)); }
    else if (Math.random() < .5) { const [x, y] = V2(); A = ri(2, 5) + x; B = T(ri(1, 4), y); }
    else { A = pw(v, ri(2, 3)); B = String(ri(2, 6)); }
    const s = t === 'sq+' ? '(' + A + '+' + B + ')^2' : t === 'sq-' ? '(' + A + '-' + B + ')^2' : '(' + A + '+' + B + ')(' + A + '-' + B + ')';
    const sq = x => br(x) + '^2', line = t === 'diff' ? sq(A) + '-' + sq(B) : sq(A) + (t === 'sq+' ? '+' : '-') + '2*' + A + '*' + B + '+' + sq(B);
    const vals = t === 'diff' ? CS([C(sq(A)), '-' + C(sq(B))]) : CS([C(sq(A)), (t === 'sq+' ? '' : '-') + C('2*' + A + '*' + B), C(sq(B))]);
    return alg(p('Expand: ' + M(s) + '.'), [s, line, vals], 'poly', 'Special products: (a + b)² = a² + 2ab + b², (a − b)² = a² − 2ab + b² and (a + b)(a − b) = a² − b². Here a = ' + M(A) + ' and b = ' + M(B) + '.');
  },
  function identifyForm(l) {
    const a = ri(2, 9), v = V(), kind = pick(['sq+', 'sq-', 'diff']), s = kind === 'sq+' ? '(' + v + '+' + a + ')^2' : kind === 'sq-' ? '(' + v + '-' + a + ')^2' : '(' + v + '-' + a + ')(' + v + '+' + a + ')', right = C(s);
    const wr = kind === 'diff' ? [v + '^2+' + a * a, v + '^2-' + 2 * a + v + '-' + a * a, v + '^2-' + 2 * a + v + '+' + a * a] : kind === 'sq+' ? [v + '^2+' + a * a, v + '^2+' + a + v + '+' + a * a, v + '^2+' + 2 * a + v + '+' + 2 * a] : [v + '^2-' + a * a, v + '^2+' + a * a, v + '^2-' + a + v + '+' + a * a];
    return ch(p('Which expression is equal to ' + M(s) + '?'), M(right), wr.map(x => M(x)), 'Common mistake: (x + a)² is NOT x² + a². Write it as (x + a)(x + a) and multiply.', M(s) + ' = ' + M(right) + '.');
  },
  function expandSimplify(l) {
    const v = V(), kind = l === 0 ? 0 : ri(0, 2);
    if (kind === 0) { const k = ri(10, 40), b = nz(-6, 6), part = C('(' + v + (b < 0 ? '' : '+') + b + ')^2'), s = k + '-(' + v + (b < 0 ? '' : '+') + b + ')^2';
      return alg(p('Expand and simplify: ' + M(s) + '.'), [s, k + '-(' + part + ')', k + C('-(' + part + ')')], 'poly', 'First expand the square and keep it in brackets. Then remove the brackets: the minus changes every sign inside.'); }
    if (kind === 1) { const a = nz(-6, 6), b = nz(-6, 6), c = ri(1, 9), part = C('(' + linBr(1, v, a) + ')(' + linBr(1, v, b) + ')'), s = '(' + linBr(1, v, a) + ')(' + linBr(1, v, b) + ')-(' + c + '-' + v + ')';
      return alg(p('Expand and simplify: ' + M(s) + '.'), [s, '(' + part + ')-(' + c + '-' + v + ')', part + C('-(' + c + '-' + v + ')').replace(/^(?=[^-])/, '+')], 'poly', 'Expand the two brackets first. A minus in front of a bracket changes every sign inside it.'); }
    const c = pick([2, 3, 6, -2]), a = ri(1, 5), d = pick([3, 5, 6]), part = C('(' + v + '-' + a + ')^2'), s = d + v + '-' + (c < 0 ? '(' + c + ')' : c) + '(' + v + '-' + a + ')^2';
    return alg(p('Expand and simplify: ' + M(s) + '.'), [s, d + v + '-' + (c < 0 ? '(' + c + ')' : c) + '(' + part + ')', d + v + C('-' + (c < 0 ? '(' + c + ')' : c) + '*(' + part + ')').replace(/^(?=[^-])/, '+')], 'poly', 'First the square, then multiply by the number in front, then add the like terms.');
  },
  function areaExpr(l) {
    const v = V(), c = ri(2, 5), a = ri(1, 3), b = nz(-6, 9), A = [[c, v]], B = [[a, v], [b, '']];
    const s = c + v + '*(' + src(B) + ')';
    return alg(p('A rectangle is ' + M(src(B)) + ' long and ' + M(c + v) + ' wide. Write its area without brackets.'), [s, prodLine(A, B), CS(prodVals(A, B))], 'poly', 'area = length · width. Multiply ' + M(c + v) + ' by every term in the brackets.');
  }
];
XG['8.3'] = [
  function threeFactors(l) {
    const v = V(), c = pick([2, 3, 5, 6, -2]), a = nz(-6, 6), b = nz(-6, 6), inner = C('(' + linBr(1, v, a) + ')(' + linBr(1, v, b) + ')'), s = c + '(' + linBr(1, v, a) + ')(' + linBr(1, v, b) + ')';
    return alg(p('Expand and simplify: ' + M(s) + '.'), [s, c + '(' + inner + ')'], 'poly', 'First multiply the two brackets. Keep the result in brackets, then multiply every term by ' + c + '.');
  },
  function numberSquare(l) {
    const c = pick([2, 3, 5, -3, -5]), v = V(), a = ri(2, 3), b = ri(2, 9), A = pw(v, a), part = C('(' + b + '-' + A + ')^2'), s = (c < 0 ? '-' : '') + Math.abs(c) + '(' + b + '-' + A + ')^2';
    return alg(p('Expand and simplify: ' + M(s) + '.'), [s, (c < 0 ? '-' : '') + Math.abs(c) + '(' + b + '^2-2*' + b + '*' + A + '+(' + A + ')^2)', (c < 0 ? '-' : '') + Math.abs(c) + '(' + part + ')'], 'poly', 'Use (a − b)² = a² − 2ab + b² with a = ' + b + ' and b = ' + M(A) + '. Then multiply every term by ' + c + '.');
  }
];

/* ======================= 2VT extras: negative exponents, roots with letters (8.4), completing the square (8.5) ======================= */
const VT = P.cls !== '2HT';
/* own grading: the value must be right and the answer must not be longer than the simplest form (no letter or root used more often) */
const shape = u => { const t = String(u).replace(/sqrt/g, '√').replace(/\s+/g, ''); const L = {}; (t.match(/[a-z]/g) || []).forEach(c => { L[c] = (L[c] || 0) + 1; }); return { L, roots: (t.match(/√/g) || []).length, terms: (t.replace(/^[+-]/, '').replace(/\([^()]*\)/g, 'B').match(/[+-]/g) || []).length + 1 }; };
const simplerThan = (u, ans) => { const a = shape(ans), b = shape(u); if (b.roots > a.roots || b.terms > a.terms) return false; for (const k in b.L) if (b.L[k] > (a.L[k] || 0)) return false; return true; };
const ownGrade = (q, alsoFraction) => u => {
  const base = Object.assign({}, q, { grade: undefined, form: null });
  const r = NX.gradeExpr(base, u); if (!r.ok) return r;
  if (!simplerThan(u, alsoFraction ? alsoFraction : q.ans) && !simplerThan(u, q.ans)) return { ok: false, why: 'form', msg: 'Not fully simplified yet: write it as short as possible.' };
  return { ok: true };
};
if (VT) {
  G['8.2'].push(
    function negExponent(l) {
      const v = V(), kind = l === 0 ? 0 : ri(0, 2); let s, line, hint;
      if (kind === 0) { const a = ri(3, 9), b = ri(a + 1, 12); s = pw(v, a) + '*' + v + '^-' + b; line = v + '^(' + a + '+-' + b + ')'; hint = 'Add the exponents, also when one is negative.'; }
      else if (kind === 1) { const a = ri(2, 6), b = ri(a + 1, 9); s = pw(v, a) + '/' + pw(v, b); line = v + '^(' + a + '-' + b + ')'; hint = 'Subtract the exponents. The result may be negative.'; }
      else { const a = ri(2, 4), n = ri(2, 3); s = '(' + v + '^-' + a + ')^' + n; line = v + '^(-' + a + '*' + n + ')'; hint = 'Power of a power: multiply the exponents.'; }
      const e = kind === 0 ? +s.match(/\^(\d+)\*/)[1] - +s.match(/\^-(\d+)/)[1] : kind === 1 ? +s.split('/')[0].split('^')[1] - +s.split('^').pop() : -(+s.match(/\^-(\d+)/)[1]) * +s.split(')^')[1];
      const ans = v + '^' + e, q = ex(p('Simplify: ' + M(s) + '. <small>(A negative exponent is fine, like ' + v + '^-3, or write it as a fraction.)</small>'), ans, null, hint, chain([s, line, ans]) + ' = ' + M('1/' + pw(v, -e)), { negExp: true });
      q.grade = ownGrade(q, '1/' + pw(v, -e)); return q;
    },
    function negToFraction(l) {
      const v = V(), n = ri(2, 5), c = l === 0 ? 1 : pick([2, 3, 5]), s = (c > 1 ? c : '') + v + '^-' + n, ans = c + '/' + pw(v, n);
      return ex(p('Write without a negative exponent: ' + M(s) + '.'), ans, 'lowest', M(v + '^-' + n) + ' = ' + M('1/' + pw(v, n)) + '.', M(s) + ' = ' + (c > 1 ? c + ' · ' : '') + M('1/' + pw(v, n)) + ' = ' + M(ans));
    }
  );
  G['8.4'] = [
    function likeRoots(l) {
      const v = V(), a = nz(-6, 8), b = nz(-7, 7); if (a + b === 0) return G['8.4'][0](l);
      const k = l === 2 ? ri(1, 9) : 0, s = T(a, 'sqrt(' + v + ')') + (b < 0 ? '-' : '+') + T(Math.abs(b), 'sqrt(' + v + ')') + (k ? '+' + k : ''), ans = T(a + b, 'sqrt(' + v + ')') + (k ? '+' + k : '');
      const q = ex(p('Simplify: ' + M(s) + '.'), ans, null, 'You can add like roots: 3√' + v + ' + 5√' + v + ' = 8√' + v + ', just like 3' + v + ' + 5' + v + ' = 8' + v + '.', M(s) + ' = ' + M(ans), { keys: ['√', '(', ')'] });
      q.grade = ownGrade(q); return q;
    },
    function mulRoots(l) {
      const [v, w] = V2(), c1 = l === 0 ? 1 : ri(2, 6), c2 = l === 0 ? 1 : nz(-6, 6), k1 = l === 2 ? pick([2, 3]) : 1, k2 = l === 2 ? pick([5, 7]) : 1;
      const r1 = (k1 > 1 ? k1 : '') + v, r2 = (k2 > 1 ? k2 : '') + w, s = T(c1, 'sqrt(' + r1 + ')') + '*' + (c2 < 0 ? '-' : '') + T(Math.abs(c2), 'sqrt(' + r2 + ')');
      const ans = T(c1 * c2, 'sqrt(' + (k1 * k2 > 1 ? k1 * k2 : '') + v + w + ')');
      const q = ex(p('Simplify: ' + M(s) + '.'), ans, null, '√A · √B = √(A·B). Multiply the numbers in front separately.', M(s) + ' = ' + (c1 * c2 !== 1 ? c1 + ' · ' + c2 + ' · ' : '') + M('sqrt(' + r1 + '*' + r2 + ')') + ' = ' + M(ans), { keys: ['√', '(', ')'] });
      q.grade = ownGrade(q); return q;
    },
    function rootSquare(l) {
      const v = V(), c = ri(2, 9), kind = l === 0 ? 0 : ri(0, 1);
      if (kind === 0) { const s = '(' + c + 'sqrt(' + v + '))^2'; return ex(p('Simplify: ' + M(s) + '.'), c * c + v, 'mono', '(√' + v + ')² = ' + v + '. Square the number in front too.', M(s) + ' = ' + M(c + '^2*(sqrt(' + v + '))^2') + ' = ' + M(c * c + '*' + v) + ' = ' + M(c * c + v)); }
      const s = 'sqrt(' + v + ')*' + c + 'sqrt(' + v + ')';
      const q = ex(p('Simplify: ' + M(s) + '.'), c + v, 'mono', '√' + v + ' · √' + v + ' = ' + v + '.', M(s) + ' = ' + c + ' · ' + M('sqrt(' + v + ')*sqrt(' + v + ')') + ' = ' + M(c + v));
      return q;
    },
    function rootOfPower(l) {
      const v = V(), even = l === 0 || Math.random() < .4, n = even ? 2 * ri(1, 4) : 2 * ri(1, 4) + 1, k = Math.floor(n / 2);
      const s = 'sqrt(' + v + '^' + n + ')', ans = even ? pw(v, k) : pw(v, k) + '*sqrt(' + v + ')';
      const st = even ? M(s) + ' = ' + M('sqrt((' + pw(v, k) + ')^2)') + ' = ' + M(pw(v, k)) : M(s) + ' = ' + M('sqrt(' + v + '^' + (n - 1) + '*' + v + ')') + ' = ' + M('sqrt((' + pw(v, k) + ')^2)*sqrt(' + v + ')') + ' = ' + M(ans);
      const q = ex(p('Simplify: ' + M(s) + '. (' + M(v) + ' is positive.)'), ans, null, 'Split off an even power: ' + M('sqrt(' + v + '^' + (2 * k) + ')') + ' = ' + M(pw(v, k)) + '.', st, { keys: ['√', '^', '(', ')'] });
      q.grade = ownGrade(q); return q;
    },
    function expandRoot(l) {
      const v = V(), a = ri(2, 5), b = nz(-6, 6), s = 'sqrt(' + v + ')*(' + a + '-sqrt(' + v + '))', ans = a + 'sqrt(' + v + ')-' + v;
      const q = ex(p('Expand: ' + M(s) + '.'), ans, null, 'Multiply √' + v + ' by both terms. √' + v + ' · √' + v + ' = ' + v + '.', M(s) + ' = ' + M('sqrt(' + v + ')*' + a + '-sqrt(' + v + ')*sqrt(' + v + ')') + ' = ' + M(ans), { keys: ['√', '(', ')'] });
      q.grade = ownGrade(q); return q;
    }
  ];
  const pm = n => (n < 0 ? '-' : '+') + Math.abs(n);                       // signed number for source text
  const xpS = h => '(x' + pm(h) + ')^2';
  const qS = (a, b, c) => src([[a, 'x^2'], [b, 'x'], [c, '']].filter(t => t[0] !== 0));
  const eqs = arr => arr.map(x => M(x)).join(' = ');
  const ME = t => t.split('=').map(x => M(x)).join(' = ');
  G['8.5'] = [
    function csForm(l) {
      const h = l === 2 ? nz(-9, 9) / 2 : nz(-8, 8), b = 2 * h, c = ri(-15, 15), q_ = c - h * h;
      return { type: 'multi', fields: ['p =', 'q ='], ans: [h, q_], html: p('Write ' + M(qS(1, b, c)) + ' in the form ' + M('(x+p)^2+q') + '.'), hint: 'Halve the number in front of x: that is p. Then subtract p² to make up for the extra term.', steps: p(eqs([qS(1, b, c), xpS(h) + '-' + (h < 0 ? '(' + h + ')' : h) + '^2' + (c ? pm(c) : ''), xpS(h) + (q_ ? pm(q_) : '')])) + p('So p = ' + neg(h) + ' and q = ' + neg(q_) + '.'), noStep: true, ansText: 'p = ' + neg(h) + ', q = ' + neg(q_) };
    },
    function csVertex(l) {
      const h = l === 2 ? nz(-9, 9) / 2 : nz(-8, 8), b = 2 * h, c = ri(-15, 15), q_ = c - h * h;
      return { type: 'point', ans: [-h, q_], html: p('Use completing the square to find the vertex of the parabola ' + ME('y=' + qS(1, b, c)) + '.') + p('<small>Type your answer like (3, −9).</small>'), hint: 'Write the formula as y = (x + p)² + q. The vertex is (−p, q).', steps: p(M('y') + ' = ' + eqs([qS(1, b, c), xpS(h) + '-' + (h < 0 ? '(' + h + ')' : h) + '^2' + (c ? pm(c) : ''), xpS(h) + (q_ ? pm(q_) : '')])) + p('The vertex is (' + neg(-h) + ', ' + neg(q_) + ').'), noStep: true };
    },
    function csSolve(l) {
      const h = nz(-6, 6), b = 2 * h, exact = l === 0; let k, c; do { k = exact ? pick([1, 4, 9, 16, 25, 36]) : ri(2, 40); c = h * h - k; } while (!exact && Number.isInteger(Math.sqrt(k)));
      const r = Math.sqrt(k), x1 = -h - r, x2 = -h + r, rs = exact ? [x1, x2] : [x1, x2].map(r2), L = 'x' + pm(h);
      return multi(p('Solve by completing the square: ' + ME(qS(1, b, c) + '=0') + '.' + (exact ? '' : ' Round your answers <b>to 2 decimal places</b>.')), rs[0], rs[1], 'Write the left side as (x + p)² + q. Then (x + p)² = −q and take ± the square root.', p(ME(xpS(h) + '-' + h * h + (c ? pm(c) : '') + '=0')) + p(ME(xpS(h) + '=' + k)) + p(ME(L + '=-sqrt(' + k + ')') + ' or ' + ME(L + '=sqrt(' + k + ')')) + p('x ' + (exact ? '= ' : '≈ ') + neg(rs[0]) + ' or x ' + (exact ? '= ' : '≈ ') + neg(rs[1])), Object.assign({ ansText: 'x ' + (exact ? '= ' : '≈ ') + neg(Math.min(...rs)) + ' or x ' + (exact ? '= ' : '≈ ') + neg(Math.max(...rs)) }, exact ? {} : { tol: .0051 }));
    }
  ];
  XG['8.5'] = [
    function csWithA(l) {
      const a = pick([2, 3, -2, 5]), h = nz(-5, 5), c = ri(-12, 12), q_ = c - a * h * h, b = 2 * a * h;
      return { type: 'multi', fields: ['a =', 'p =', 'q ='], ans: [a, h, q_], html: p('Write ' + M(qS(a, b, c)) + ' in the form ' + M('a(x+p)^2+q') + '.'), hint: 'First take ' + a + ' outside brackets for the x-terms. Then complete the square inside the brackets.', steps: p(eqs([qS(a, b, 0), a + '(' + qS(1, 2 * h, 0) + ')', a + '(' + xpS(h) + '-' + h * h + ')', a + xpS(h) + pm(-a * h * h)])) + p('Then ' + (c < 0 ? 'subtract ' + -c : 'add ' + c) + ': ' + M(a + xpS(h) + (q_ ? pm(q_) : ''))), noStep: true, ansText: 'a = ' + neg(a) + ', p = ' + neg(h) + ', q = ' + neg(q_) };
    }
  ];
  XG['8.2'].push(function negFactor(l) {
    const v = V(), c = pick([2, 3, 4, 5]), n = ri(2, 3), s = '(' + c + v + '^-' + n + ')^-2', ans = pw(v, 2 * n) + '/' + c * c;
    return ex(p('Simplify: ' + M(s) + '. Write the answer without negative exponents.'), ans, 'lowest', 'A power −2 means 1 over the square: ' + M('(' + c + v + '^-' + n + ')^-2') + ' = ' + M('1/(' + c + v + '^-' + n + ')^2') + '.', M(s) + ' = ' + M(c + '^-2*' + v + '^(' + -n + '*-2)') + ' = ' + M('1/' + c * c + '*' + v + '^' + 2 * n) + ' = ' + M(ans));
  });
}
const neg = n => n < 0 ? '−' + Math.abs(n) : String(n);
const multi = (html, a, b, hint, steps, extra) => Object.assign({ type: 'multi', fields: ['smallest solution: x =', 'largest solution: x ='], ans: [Math.min(a, b), Math.max(a, b)], html: html + p('<small>Type the smallest solution first.</small>'), hint, steps, noStep: true }, extra || {});
const r2 = x => Math.round(x * 100) / 100;

const SECTIONS = [
  { id: '8.1', title: '8.1 Powers and like terms', sub: 'Powers, substituting, adding like terms, multiplying terms' },
  { id: '8.2', title: '8.2 Rules of powers', sub: 'Multiply, divide, power of a power' },
  { id: '8.3', title: '8.3 Expanding brackets', sub: 'One bracket, two brackets, special products' }
].concat(VT ? [{ id: '8.4', title: '8.4 Roots with letters', sub: 'Adding, multiplying and simplifying roots' }, { id: '8.5', title: '8.5 Completing the square', sub: '(x + p)² + q, vertex, solving' }] : []);
if (VT) SECTIONS[1].sub = 'Multiply, divide, power of a power, negative exponents';
const GOALS = [
  ['8.1', 'I can write products as powers and calculate them for a negative number', ['writePower', 'bracketPower', 'substitute', 'productPower'], 'Put a negative number in brackets: (−2)² = 4, but −2² = −4.'],
  ['8.1', 'I can multiply terms and add like terms', ['likeTerms', 'multiplyTerms', 'likeChoice'], 'Like terms: the same letters with the same exponents.'],
  ['8.2', 'I can use the rules of powers', ['productRule', 'quotientRule', 'powerOfPower', 'mixedRules', 'ruleChoice'], 'Multiply: add the exponents. Divide: subtract. Power of a power: multiply.'],
  ['8.3', 'I can expand one or two brackets and simplify', ['singleBracket', 'twoBrackets', 'doubleBracket', 'expandSimplify', 'areaExpr'], 'Every term times every term, then add the like terms.'],
  ['8.3', 'I can use the special products', ['special', 'identifyForm'], '(a + b)² = a² + 2ab + b²; (a − b)² = a² − 2ab + b²; (a + b)(a − b) = a² − b².']
].concat(VT ? [
  ['8.2', 'I can work with negative exponents', ['negExponent', 'negToFraction'], 'x⁻³ = 1/x³'],
  ['8.4', 'I can add, multiply and simplify roots with letters', ['likeRoots', 'mulRoots', 'rootSquare', 'rootOfPower', 'expandRoot'], '√a · √b = √(ab) and √a · √a = a.'],
  ['8.5', 'I can complete the square and use it', ['csForm', 'csVertex', 'csSolve'], 'x² + bx = (x + b/2)² − (b/2)²']
] : []);
return { key: 'nx-' + P.cls.toLowerCase() + '-ch8-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
