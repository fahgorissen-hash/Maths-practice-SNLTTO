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
/* ======================= 1HVT chapter 8: algebra (substituting, like terms, expanding, factorising, special products) ======================= */
if (P.cls === '1HVT') {
  const cap = (f, m) => { const g = function (l) { return f(Math.min(l, m)); }; Object.defineProperty(g, 'name', { value: f.name }); return g; };
  const find = n => G['8.3'].find(f => f.name === n);
  const N_ = n => (n < 0 ? '−' : '') + Math.abs(n), Pa = n => n < 0 ? '(' + N_(n) + ')' : String(n);
  const PA = n => n < 0 ? '(' + n + ')' : String(n);
  const lt = (a, b) => CS([T(a, 'x'), String(b)].filter(t => t !== '0'));            // a x + b as source
  const mt = s => M(s);
  const psRows = P_ => { const r = []; for (let a = 1; a * a <= Math.abs(P_); a++) if (P_ % a === 0) { const b = P_ / a; r.push([a, b], [-a, -b]); } return r; };
  const psTable = (P_, S_) => '<table class="tbl"><tr><th>product ' + N_(P_) + '</th><th>sum ' + N_(S_) + '</th></tr>' + psRows(P_).map(q => '<tr><td>' + N_(q[0]) + ' × ' + N_(q[1]) + '</td><td>' + N_(q[0]) + (q[1] < 0 ? ' − ' + -q[1] : ' + ' + q[1]) + ' = ' + N_(q[0] + q[1]) + (q[0] + q[1] === S_ ? ' ✓' : '') + '</td></tr>').join('') + '</table>';
  const fac = (v, r) => '(' + v + (r < 0 ? '-' + -r : '+' + r) + ')';
  const H1 = [
    function substitute(l) {
      const x = l === 0 ? ri(1, 5) : pick([-1, -2, -3, 2, 3, -4]), kind = l === 0 ? ri(0, 2) : ri(0, 4); let s, st, ans;
      const a = ri(2, 9), b = nz(-9, 9);
      if (kind === 0) { s = lt(a, b); const v1 = a * x; ans = v1 + b; st = [a + ' · ' + Pa(x) + (b < 0 ? ' − ' + -b : ' + ' + b), N_(v1) + (b < 0 ? ' − ' + -b : ' + ' + b), N_(ans)]; }
      else if (kind === 1) { const c = ri(3, 12); s = c + '-' + a + 'x'; ans = c - a * x; st = [c + ' − ' + a + ' · ' + Pa(x), c + ' − ' + Pa(a * x), N_(ans)]; }
      else if (kind === 2) { s = 'x^2' + (b < 0 ? '-' : '+') + Math.abs(b) + 'x'; ans = x * x + b * x; st = [Pa(x) + '² ' + (b < 0 ? '− ' + -b : '+ ' + b) + ' · ' + Pa(x), x * x + ' + ' + Pa(b * x), N_(ans)]; }
      else if (kind === 3) { const c = nz(-5, 5), k = ri(2, 3); s = '(' + k + 'x' + (c < 0 ? '-' + -c : '+' + c) + ')^2'; const in_ = k * x + c; ans = in_ * in_; st = ['(' + k + ' · ' + Pa(x) + (c < 0 ? ' − ' + -c : ' + ' + c) + ')²', Pa(in_) + '²', N_(ans)]; }
      else { const c = ri(2, 12); s = a + 'x^2-' + c; ans = a * x * x - c; st = [a + ' · ' + Pa(x) + '² − ' + c, a + ' · ' + x * x + ' − ' + c, N_(ans)]; }
      return nu(p('Calculate the value of ' + mt(s) + ' for ' + mt('x = ' + x) + '.'), ans, 'Replace <i>x</i> by ' + Pa(x) + '. Powers first, then multiply, then add and subtract.' + (x < 0 ? ' Put a negative number in brackets: (−2)² = 4.' : ''), st.join(' = '));
    },
    function likeTerms(l) {
      const [v, w] = V2(); let kinds = l === 0 ? [v, w] : l === 1 ? [v + '^2', v, ''] : [v + w, v, '', v + '^2'];
      let L = []; kinds.forEach(k => { L.push([l === 0 ? ri(1, 9) : nz(-9, 9), k]); L.push([nz(-9, 9), k]); });
      if (l === 0) L.forEach((t, i) => { if (i === 1 || i === 3) t[0] = nz(-6, 9); });
      L = shuffle(L); const s = src(L), ans = C(s);
      if (ans === '0' || !/[a-z]/.test(ans)) return H1[1](l);
      const order = []; L.forEach(t => { if (!order.includes(t[1])) order.push(t[1]); });
      const grouped = order.reduce((acc, k) => acc.concat(L.filter(t => t[1] === k)), []);
      return alg(p('Simplify: ' + mt(s) + '.'), [s, src(grouped)], 'poly', 'You can only add or subtract like terms: the same letters with the same powers. ' + (l > 0 ? M(v + '^2') + ' and ' + M(v) + ' are not like terms.' : M('3' + v + '+2' + v + '=5' + v) + ', but ' + M('3' + v + '+2' + w) + ' stays the same.'));
    },
    function multiplyTerms(l) {
      const [v, w] = V2(), same = l > 0 && Math.random() < .4, W = same ? v : w;
      const c1 = l === 0 ? ri(2, 9) : pick([2, 3, 4, 5, -2, -3, -1]), c2 = l === 0 ? ri(2, 9) : pick([2, 3, 4, 6, -4, -5, -2]);
      const s1 = T(c1, v) + '*' + T(c2, W), k = same ? v + '^2' : v + w;
      if (l < 2) return alg(p('Simplify: ' + mt(s1) + '.'), [s1, PA(c1) + '*' + PA(c2) + '*' + v + '*' + W], 'mono', 'Multiply the numbers. Then write the letters behind it, in alphabetical order.' + (same ? ' ' + v + ' · ' + v + ' = ' + v + '².' : ''));
      const c3 = ri(2, 6), c4 = ri(2, 6), s = s1 + '+' + T(c3, v) + '*' + T(c4, W);
      if (c1 * c2 + c3 * c4 === 0) return H1[2](l);
      return alg(p('Simplify: ' + mt(s) + '.'), [s, CS([T(c1 * c2, k), T(c3 * c4, k)])], 'poly', 'First do the multiplications. Then the two terms are like terms, so you can add them.');
    },
    function rectExpr(l) {
      const a = ri(2, 9), b = ri(2, 9), v = pick(['x', 'a', 'p']), area = Math.random() < .5;
      const fig = '<svg viewBox="0 0 220 120" style="width:220px"><rect x="30" y="20" width="160" height="80" fill="rgba(27,95,168,.08)" stroke="#1b5fa8" stroke-width="2"/><text x="110" y="15" text-anchor="middle" font-size="13">' + a + v + '</text><text x="20" y="64" text-anchor="end" font-size="13">' + b + v + '</text></svg>';
      if (area) return alg(p('A rectangle is ' + mt(a + v) + ' long and ' + mt(b + v) + ' wide. Write a formula for its <b>area</b> as short as possible.') + fig, [a + v + '*' + b + v, a + '*' + b + '*' + v + '*' + v], 'mono', 'area = length · width. Multiply the numbers and multiply the letters.');
      return alg(p('A rectangle is ' + mt(a + v) + ' long and ' + mt(b + v) + ' wide. Write a formula for its <b>perimeter</b> as short as possible.') + fig, [a + v + '+' + b + v + '+' + a + v + '+' + b + v], 'mono', 'The perimeter is the sum of all four sides. Add the like terms.');
    }
  ];
  const H2 = [
    cap(find('singleBracket'), 1),
    function bracketsSimplify(l) {
      const v = 'x', a = l === 0 ? ri(2, 6) : pick([2, 3, 4, 5, -2, -3, -4]), B = [[ri(1, 5), v], [nz(-9, 9), '']];
      const k = l === 0 ? ri(1, 9) : nz(-9, 9), d = l === 2 ? T(nz(-5, 5), v) : String(nz(-9, 9));
      const s = (Math.random() < .5 ? k + (a < 0 ? '-' : '+') + Math.abs(a) + '(' + src(B) + ')' : T(k, v) + (a < 0 ? '-' : '+') + Math.abs(a) + '(' + src(B) + ')') + (d[0] === '-' ? d : '+' + d);
      const first = s.split(/[+-]\d*\(/)[0], mid = CS([first].concat(prodVals([[a, '']], B)).concat([d]));
      if (!/[a-z]/.test(C(s))) return H2[1](l);
      return alg(p('Expand the brackets and simplify: ' + mt(s) + '.'), [s, mid], 'poly', 'First expand the brackets: multiply every term inside by ' + N_(a) + '.' + (a < 0 ? ' The minus belongs to the number: multiply by ' + N_(a) + '.' : '') + ' Then add the like terms.');
    },
    cap(find('doubleBracket'), 1),
    function bracketEq(l) {
      const a = ri(2, 6), b = nz(-9, 9), x = ri(-8, 10), c = l === 0 ? 0 : nz(-9, 9), rhs = a * (x + b) + c;
      const L = a + '(' + lt(1, b) + ')' + (c === 0 ? '' : c < 0 ? '-' + -c : '+' + c);
      const st = [[L, rhs], [CS([T(a, 'x'), String(a * b)].concat(c ? [String(c)] : [])), rhs]];
      if (c !== 0) st.push([lt(a, a * b + c), rhs]);
      st.push([a + 'x', a * x], ['x', x]);
      return nu(p('Solve: ' + mt(L) + ' = ' + N_(rhs) + '.'), x, 'First expand the brackets. Then use the balance method.', st.filter((r, k) => k === 0 || r[0] !== st[k - 1][0]).map(r => p(mt(r[0]) + ' = ' + N_(r[1]))).join(''), { noStep: true, eqStep: 'x', ansText: 'x = ' + N_(x) });
    },
    find('areaExpr')
  ];
  const H3 = [
    function hcf(l) {
      const g = pick([2, 3, 4, 5, 6, 8, 9]), withV = l > 0, m1 = ri(1, 7), m2 = ri(2, 9); if (gcd(m1, m2) !== 1) return H3[0](l);
      const t1 = withV ? T(g * m1, 'x^2') : T(g * m1, 'x'), t2 = withV ? T(g * m2, 'x') : String(g * m2), right = withV ? T(g, 'x') : String(g);
      const wr = withV ? [String(g), T(g, 'x^2'), 'x', T(g * m1 * m2, 'x')] : [String(g * m1), 'x', T(g, 'x'), String(g * m1 * m2)];
      return ch(p('What is the highest common factor of ' + mt(t1) + ' and ' + mt(t2) + '?'), mt(right), wr.filter(w => w !== right).map(mt), 'Find the biggest number that divides both numbers. Then look at the letters: which letter is in both terms?', mt(t1) + ' = ' + mt(right) + ' · ' + mt(withV ? T(m1, 'x') : T(m1, 'x')) + ' and ' + mt(t2) + ' = ' + mt(right) + ' · ' + m2 + '. The highest common factor is ' + mt(right) + '.');
    },
    function commonFactor(l) {
      const v = pick(['x', 'a', 'p', 'q']), g = pick([2, 3, 4, 5, 6, 7]); let m1 = ri(1, 9), m2 = l === 0 ? ri(1, 9) : nz(-9, 9); if (gcd(m1, Math.abs(m2)) !== 1 || m1 === 1 && l === 0) return H3[1](l);
      let G_ = String(g), A = [[m1, v], [m2, '']];
      if (l >= 1 && Math.random() < .5) { G_ = T(g, v); A = [[m1, v], [m2, '']]; }
      if (l === 2 && Math.random() < .5) { G_ = '-' + G_; A = A.map(t => [-t[0], t[1]]); }
      const inner = src(A), right = G_ + '(' + inner + ')', expr = C(right);
      const d = [2, 3].find(z => g % z === 0 && g !== z), wrongs = [G_ + '(' + src([A[0], [-A[1][0], '']]) + ')', G_ + '(' + src([[A[0][0] * g, A[0][1]], A[1]]) + ')'];
      if (d) wrongs.push(G_.replace(String(g), String(d)) + '(' + src(A.map(t => [t[0] * g / d, t[1]])) + ')'); else wrongs.push(G_ + '(' + src([A[0], [A[1][0] * g, '']]) + ')');
      return ch(p('Factorise as far as possible: ' + mt(expr) + '.'), mt(right), wrongs.filter(w => w !== right).map(mt), 'Find the highest common factor of both terms (number AND letter). Put it in front of the brackets and divide every term by it.', 'The highest common factor is ' + mt(G_) + '. ' + mt(expr) + ' = ' + mt(right) + '.<br>Check by expanding: ' + mt(right) + ' = ' + mt(expr) + '.');
    },
    function productSum(l) {
      const v = l === 2 ? pick(['a', 'p', 'z', 'x']) : 'x'; let r1, r2;
      do { r1 = l === 0 ? ri(1, 9) : nz(-9, 9); r2 = l === 0 ? ri(1, 9) : nz(-9, 9); } while ((l === 1 && r1 * r2 > 0) || r1 + r2 === 0);
      const S_ = r1 + r2, P_ = r1 * r2, expr = C(fac(v, r1) + fac(v, r2)); if (S_ === 0) return H3[2](l);
      const right = r1 === r2 ? fac(v, r1) + '^2' : fac(v, r1) + fac(v, r2);
      const wr = [fac(v, -r1) + fac(v, -r2), fac(v, r1) + fac(v, -r2), fac(v, -r1) + fac(v, r2), fac(v, S_) + fac(v, 1)].filter(w => C(w) !== expr);
      return ch(p('Factorise: ' + mt(expr) + '.'), mt(right), wr.map(mt), 'Find two numbers with product ' + N_(P_) + ' and sum ' + N_(S_) + '. Then write (' + v + ' + …)(' + v + ' + …).', psTable(P_, S_) + p(mt(expr) + ' = ' + mt(right)));
    }
  ];
  const H4 = [
    cap(find('special'), 1),
    find('identifyForm'),
    function factorSpecial(l) {
      const v = pick(['x', 'a', 'p', 'y']), b = ri(1, 12), k = l === 2 ? ri(2, 5) : 1, A = k === 1 ? v : k + v, kind = pick(['diff', 'sq+', 'sq-']);
      const right = kind === 'diff' ? '(' + A + '+' + b + ')(' + A + '-' + b + ')' : '(' + A + (kind === 'sq+' ? '+' : '-') + b + ')^2', expr = C(right);
      const wr = kind === 'diff' ? ['(' + A + '-' + b + ')^2', '(' + A + '+' + b + ')^2', '(' + A + '-' + b * b + ')(' + A + '+1)'] : kind === 'sq+' ? ['(' + A + '+' + b * b + ')^2', '(' + A + '+' + b + ')(' + A + '-' + b + ')', '(' + A + '+' + 2 * b + ')^2'] : ['(' + A + '+' + b + ')^2', '(' + A + '+' + b + ')(' + A + '-' + b + ')', '(' + A + '-' + b * b + ')^2'];
      const why = kind === 'diff' ? mt(expr) + ' = ' + mt(br(A) + '^2-' + b + '^2') + ', so a = ' + mt(A) + ' and b = ' + b + '. Use a² − b² = (a + b)(a − b).' : mt(expr) + ' = ' + mt(br(A) + '^2' + (kind === 'sq+' ? '+' : '-') + '2*' + A + '*' + b + '+' + b + '^2') + ', so a = ' + mt(A) + ' and b = ' + b + '. Use a² ' + (kind === 'sq+' ? '+' : '−') + ' 2ab + b² = (a ' + (kind === 'sq+' ? '+' : '−') + ' b)².';
      return ch(p('Factorise with a special product: ' + mt(expr) + '.'), mt(right), wr.filter(w => C(w) !== expr).map(mt), 'Two squares with a minus between them: a² − b² = (a + b)(a − b). Three terms with two squares: (a + b)² or (a − b)².', why + '<br>' + mt(expr) + ' = ' + mt(right));
    }
  ];
  const XH3 = [
    function primeFactor(l) {
      const pr = [2, 2, 3, 3, 5, 7, 11, 13], f_ = []; const n0 = ri(3, 5); for (let i = 0; i < n0; i++) f_.push(pick(pr)); f_.sort((a, b) => a - b);
      const n = f_.reduce((a, b) => a * b, 1), cnt = {}; f_.forEach(q => cnt[q] = (cnt[q] || 0) + 1);
      const right = Object.keys(cnt).map(q => q + (cnt[q] > 1 ? '<sup>' + cnt[q] + '</sup>' : '')).join(' · ');
      const k = Object.keys(cnt), bad1 = k.map(q => q + (cnt[q] > 1 ? '<sup>' + (cnt[q] + 1) + '</sup>' : '')).join(' · '), bad2 = [f_[0] * f_[1]].concat(f_.slice(2)).join(' · '), bad3 = k.map(q => q).join(' · ');
      return ch(p('Write ' + n + ' as a product of prime factors.'), right, [bad1, bad2, bad3].filter(w => w !== right), 'Keep dividing by the smallest prime number that fits: 2, 3, 5, 7, 11, …', n + ' = ' + f_.join(' · ') + ' = ' + right);
    }
  ];
  const XH2 = [find('expandSimplify')];
  G['8.1'] = H1; G['8.2'] = H2; G['8.3'] = H3; G['8.4'] = H4; delete G['8.5'];
  XG['8.1'] = []; XG['8.2'] = XH2; XG['8.3'] = XH3; XG['8.4'] = []; delete XG['8.5'];
  SECTIONS.splice(0, SECTIONS.length,
    { id: '8.1', title: '8.1 Substituting and simplifying', sub: 'Calculating values, like terms, multiplying terms' },
    { id: '8.2', title: '8.2 Expanding brackets', sub: 'One bracket, two brackets, equations with brackets' },
    { id: '8.3', title: '8.3 Factorising', sub: 'Highest common factor, product-sum method' },
    { id: '8.4', title: '8.4 Special products', sub: '(a + b)², (a − b)², (a + b)(a − b)' });
  GOALS.splice(0, GOALS.length,
    ['8.1', 'I can calculate the value of an expression', ['substitute'], 'Put a negative number in brackets.'],
    ['8.1', 'I can add like terms and multiply terms', ['likeTerms', 'multiplyTerms', 'rectExpr'], 'Like terms: the same letters with the same powers.'],
    ['8.2', 'I can expand brackets and simplify', ['singleBracket', 'bracketsSimplify', 'doubleBracket', 'areaExpr'], 'Every term times every term.'],
    ['8.2', 'I can solve an equation with brackets', ['bracketEq'], 'First expand, then use the balance method.'],
    ['8.3', 'I can factorise with a common factor', ['hcf', 'commonFactor'], 'Put the highest common factor in front of the brackets.'],
    ['8.3', 'I can factorise with the product-sum method', ['productSum'], 'Two numbers: product c and sum b.'],
    ['8.4', 'I can expand and factorise with special products', ['special', 'identifyForm', 'factorSpecial'], '(a + b)² = a² + 2ab + b²; (a − b)² = a² − 2ab + b²; (a + b)(a − b) = a² − b².']);
}
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "1HVT": [
      {"id": "D1", "title": "Lesson · 8.1 A Substituting and simplifying", "sub": "Thu 8 Apr · ex 1, 2, 7, 8, 9, 10", "date": "2027-04-08", "gens": [["8.1", "substitute"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"]], "xg": []},
      {"id": "D2", "title": "Lesson · 8.1 B Substituting and simplifying", "sub": "Fri 9 Apr · ex 11, 12, 13, 14, 15", "date": "2027-04-09", "gens": [["8.1", "substitute"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"]], "xg": []},
      {"id": "D3", "title": "Lesson · 8.1 C Substituting and simplifying", "sub": "Tue 13 Apr · ex 16, 17, 18, 19, 20", "date": "2027-04-13", "gens": [["8.1", "substitute"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"]], "xg": []},
      {"id": "D4", "title": "Lesson · 8.1 D Substituting and simplifying", "sub": "Wed 14 Apr · ex 21, 23, 25, 26", "date": "2027-04-14", "gens": [["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.1", "rectExpr"]], "xg": []},
      {"id": "D5", "title": "Lesson · 8.2 A Expanding brackets", "sub": "Thu 15 Apr · ex 31, 32, 33, 34, 35", "date": "2027-04-15", "gens": [["8.2", "singleBracket"], ["8.2", "bracketsSimplify"], ["8.2", "doubleBracket"]], "xg": [["8.2", "expandSimplify"]]},
      {"id": "D6", "title": "Lesson · 8.2 B Expanding brackets", "sub": "Fri 16 Apr · ex 36, 38, 39, 40, 41", "date": "2027-04-16", "gens": [["8.2", "singleBracket"], ["8.2", "bracketsSimplify"], ["8.2", "doubleBracket"]], "xg": [["8.2", "expandSimplify"]]},
      {"id": "D7", "title": "Lesson · 8.2 C Expanding brackets", "sub": "Tue 11 May · ex 42, 43, 44a, 45", "date": "2027-05-11", "gens": [["8.2", "bracketsSimplify"], ["8.2", "doubleBracket"], ["8.2", "bracketEq"]], "xg": [["8.2", "expandSimplify"]]},
      {"id": "D8", "title": "Lesson · 8.3 A Factorising", "sub": "Wed 12 May · ex 54, 55, 56, 57, 58, 59", "date": "2027-05-12", "gens": [["8.3", "hcf"], ["8.3", "commonFactor"], ["8.3", "productSum"]], "xg": [["8.3", "primeFactor"]]},
      {"id": "D9", "title": "Lesson · 8.3 B Factorising", "sub": "Thu 13 May · ex 60, 61, 63, 64, 65", "date": "2027-05-13", "gens": [["8.3", "hcf"], ["8.3", "commonFactor"], ["8.3", "productSum"]], "xg": [["8.3", "primeFactor"]]},
      {"id": "D10", "title": "Lesson · 8.3 C Factorising", "sub": "Fri 14 May · ex 66, 67, 68, 69, 70, 71", "date": "2027-05-14", "gens": [["8.3", "hcf"], ["8.3", "commonFactor"], ["8.3", "productSum"]], "xg": [["8.3", "primeFactor"]]},
      {"id": "D11", "title": "Lesson · 8.4 A Special products", "sub": "Tue 18 May · ex 77, 78, 79, 80, 81", "date": "2027-05-18", "gens": [["8.4", "special"], ["8.4", "identifyForm"], ["8.4", "factorSpecial"]], "xg": []},
      {"id": "D12", "title": "Lesson · 8.4 B Special products", "sub": "Wed 19 May · ex 82, 83, 84, 85, 86", "date": "2027-05-19", "gens": [["8.4", "special"], ["8.4", "identifyForm"], ["8.4", "factorSpecial"]], "xg": []},
      {"id": "D13", "title": "Lesson · 8.4 C Special products", "sub": "Thu 20 May · ex 87, 88, 89, 90, 91", "date": "2027-05-20", "gens": [["8.4", "special"], ["8.4", "identifyForm"], ["8.4", "factorSpecial"]], "xg": []},
      {"id": "D14", "title": "Test prep · chapter 8", "sub": "Fri 21 May", "date": "2027-05-21", "gens": [["8.1", "substitute"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.1", "rectExpr"], ["8.2", "singleBracket"], ["8.2", "bracketsSimplify"], ["8.2", "doubleBracket"], ["8.2", "bracketEq"], ["8.2", "areaExpr"], ["8.3", "hcf"], ["8.3", "commonFactor"], ["8.3", "productSum"], ["8.4", "special"], ["8.4", "identifyForm"], ["8.4", "factorSpecial"]], "xg": [["8.2", "expandSimplify"], ["8.3", "primeFactor"]], "rev": true},
      {"id": "D15", "title": "Test prep · chapter 8", "sub": "Tue 25 May", "date": "2027-05-25", "gens": [["8.1", "substitute"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.1", "rectExpr"], ["8.2", "singleBracket"], ["8.2", "bracketsSimplify"], ["8.2", "doubleBracket"], ["8.2", "bracketEq"], ["8.2", "areaExpr"], ["8.3", "hcf"], ["8.3", "commonFactor"], ["8.3", "productSum"], ["8.4", "special"], ["8.4", "identifyForm"], ["8.4", "factorSpecial"]], "xg": [["8.2", "expandSimplify"], ["8.3", "primeFactor"]], "rev": true}
    ],
    "2HT": [
      {"id": "D1", "title": "Lesson · 8.1 A Powers and like terms", "sub": "Wed 31 Mar · ex 1, 2, 7, 8, 9abc", "date": "2027-03-31", "gens": [["8.1", "writePower"], ["8.1", "bracketPower"], ["8.1", "substitute"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"]]},
      {"id": "D2", "title": "Lesson · 8.1 B Powers and like terms", "sub": "Thu 1 Apr · ex 10aef, 11, 12, 13, 14", "date": "2027-04-01", "gens": [["8.1", "writePower"], ["8.1", "bracketPower"], ["8.1", "substitute"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"]]},
      {"id": "D3", "title": "Lesson · 8.1 C Powers and like terms", "sub": "Fri 2 Apr · ex 15, 16, 17, 18", "date": "2027-04-02", "gens": [["8.1", "bracketPower"], ["8.1", "substitute"], ["8.1", "productPower"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"]]},
      {"id": "D4", "title": "Lesson · 8.1 D Powers and like terms", "sub": "Wed 7 Apr · ex 19, 20, 21, 22", "date": "2027-04-07", "gens": [["8.1", "productPower"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"]]},
      {"id": "D5", "title": "Lesson · 8.2 A Rules of powers", "sub": "Thu 8 Apr · ex 28, 29, 30, 31", "date": "2027-04-08", "gens": [["8.2", "productRule"], ["8.2", "quotientRule"], ["8.2", "powerOfPower"]], "xg": [["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"]]},
      {"id": "D6", "title": "Lesson · 8.2 B Rules of powers", "sub": "Fri 9 Apr · ex 32, 33, 34, 35", "date": "2027-04-09", "gens": [["8.2", "productRule"], ["8.2", "quotientRule"], ["8.2", "powerOfPower"]], "xg": [["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"]]},
      {"id": "D7", "title": "Lesson · 8.2 C Rules of powers", "sub": "Wed 14 Apr · ex 36, 37, 38, 40", "date": "2027-04-14", "gens": [["8.2", "quotientRule"], ["8.2", "powerOfPower"], ["8.2", "mixedRules"]], "xg": [["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"]]},
      {"id": "D8", "title": "Lesson · 8.3 A Expanding brackets", "sub": "Thu 15 Apr · ex 46, 47, 48, 49", "date": "2027-04-15", "gens": [["8.3", "singleBracket"], ["8.3", "twoBrackets"], ["8.3", "doubleBracket"]], "xg": [["8.3", "threeFactors"], ["8.3", "numberSquare"]]},
      {"id": "D9", "title": "Lesson · 8.3 B Expanding brackets", "sub": "Fri 16 Apr · ex 50, 51, 53, 54, 55", "date": "2027-04-16", "gens": [["8.3", "twoBrackets"], ["8.3", "doubleBracket"], ["8.3", "special"], ["8.3", "identifyForm"]], "xg": [["8.3", "threeFactors"], ["8.3", "numberSquare"]]},
      {"id": "D10", "title": "Test prep · chapter 8", "sub": "Wed 12 May · ex 56, 114, 115, 116", "date": "2027-05-12", "gens": [["8.1", "writePower"], ["8.1", "bracketPower"], ["8.1", "substitute"], ["8.1", "productPower"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.1", "likeChoice"], ["8.2", "productRule"], ["8.2", "quotientRule"], ["8.2", "powerOfPower"], ["8.2", "mixedRules"], ["8.2", "ruleChoice"], ["8.3", "singleBracket"], ["8.3", "twoBrackets"], ["8.3", "doubleBracket"], ["8.3", "special"], ["8.3", "identifyForm"], ["8.3", "expandSimplify"], ["8.3", "areaExpr"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"], ["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"], ["8.3", "threeFactors"], ["8.3", "numberSquare"]], "rev": true},
      {"id": "D11", "title": "Test prep · chapter 8", "sub": "Thu 13 May · ex 117, 118, 119, 120", "date": "2027-05-13", "gens": [["8.1", "writePower"], ["8.1", "bracketPower"], ["8.1", "substitute"], ["8.1", "productPower"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.1", "likeChoice"], ["8.2", "productRule"], ["8.2", "quotientRule"], ["8.2", "powerOfPower"], ["8.2", "mixedRules"], ["8.2", "ruleChoice"], ["8.3", "singleBracket"], ["8.3", "twoBrackets"], ["8.3", "doubleBracket"], ["8.3", "special"], ["8.3", "identifyForm"], ["8.3", "expandSimplify"], ["8.3", "areaExpr"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"], ["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"], ["8.3", "threeFactors"], ["8.3", "numberSquare"]], "rev": true}
    ],
    "2VT": [
      {"id": "D1", "title": "Lesson · 8.1 A Powers and like terms", "sub": "Tue 30 Mar · ex 1, 2, 7, 8, 9, 10, 11, 12", "date": "2027-03-30", "gens": [["8.1", "writePower"], ["8.1", "bracketPower"], ["8.1", "substitute"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"]]},
      {"id": "D2", "title": "Lesson · 8.1 B Powers and like terms", "sub": "Wed 31 Mar · ex 14, 15, 16, 17, 18, 19, 20", "date": "2027-03-31", "gens": [["8.1", "substitute"], ["8.1", "productPower"], ["8.1", "likeTerms"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"]]},
      {"id": "D3", "title": "Lesson · 8.1 Powers and like terms + 8.2 Rules of powers", "sub": "Fri 2 Apr · ex 22, 24, 26, 28, 29, 30", "date": "2027-04-02", "gens": [["8.1", "productPower"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.2", "productRule"], ["8.2", "quotientRule"], ["8.2", "powerOfPower"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"], ["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"], ["8.2", "negFactor"]]},
      {"id": "D4", "title": "Lesson · 8.2 Rules of powers", "sub": "Tue 6 Apr · ex 31, 32, 33, 34, 36, 37", "date": "2027-04-06", "gens": [["8.2", "quotientRule"], ["8.2", "powerOfPower"], ["8.2", "mixedRules"]], "xg": [["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"], ["8.2", "negFactor"]]},
      {"id": "D5", "title": "Lesson · 8.2 Rules of powers + 8.3 Expanding brackets", "sub": "Wed 7 Apr · ex 39, 42, 46, 47, 48, 49", "date": "2027-04-07", "gens": [["8.2", "powerOfPower"], ["8.2", "mixedRules"], ["8.2", "ruleChoice"], ["8.3", "singleBracket"], ["8.3", "twoBrackets"], ["8.3", "doubleBracket"]], "xg": [["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"], ["8.2", "negFactor"], ["8.3", "threeFactors"], ["8.3", "numberSquare"]]},
      {"id": "D6", "title": "Lesson · 8.3 Expanding brackets", "sub": "Fri 9 Apr · ex 50, 51, 52, 53, 54, 55, 56", "date": "2027-04-09", "gens": [["8.3", "twoBrackets"], ["8.3", "doubleBracket"], ["8.3", "special"], ["8.3", "identifyForm"]], "xg": [["8.3", "threeFactors"], ["8.3", "numberSquare"]]},
      {"id": "D7", "title": "Lesson · 8.4 A Roots with letters", "sub": "Tue 13 Apr · ex 62, 63, 64, 65, 66, 67", "date": "2027-04-13", "gens": [["8.4", "likeRoots"], ["8.4", "mulRoots"], ["8.4", "rootSquare"]], "xg": []},
      {"id": "D8", "title": "Lesson · 8.4 B Roots with letters", "sub": "Wed 14 Apr · ex 69, 70, 71, 72, 73", "date": "2027-04-14", "gens": [["8.4", "mulRoots"], ["8.4", "rootSquare"], ["8.4", "rootOfPower"]], "xg": []},
      {"id": "D9", "title": "Lesson · 8.5 Completing the square", "sub": "Fri 16 Apr · ex 80, 81, 82, 83, 84, 85, 86", "date": "2027-04-16", "gens": [["8.5", "csForm"], ["8.5", "csVertex"], ["8.5", "csSolve"]], "xg": [["8.5", "csWithA"]]},
      {"id": "D10", "title": "Test prep · chapter 8", "sub": "Tue 11 May", "date": "2027-05-11", "gens": [["8.1", "writePower"], ["8.1", "bracketPower"], ["8.1", "substitute"], ["8.1", "productPower"], ["8.1", "likeTerms"], ["8.1", "multiplyTerms"], ["8.1", "likeChoice"], ["8.2", "productRule"], ["8.2", "quotientRule"], ["8.2", "powerOfPower"], ["8.2", "mixedRules"], ["8.2", "ruleChoice"], ["8.2", "negExponent"], ["8.2", "negToFraction"], ["8.3", "singleBracket"], ["8.3", "twoBrackets"], ["8.3", "doubleBracket"], ["8.3", "special"], ["8.3", "identifyForm"], ["8.3", "expandSimplify"], ["8.3", "areaExpr"], ["8.4", "likeRoots"], ["8.4", "mulRoots"], ["8.4", "rootSquare"], ["8.4", "rootOfPower"], ["8.4", "expandRoot"], ["8.5", "csForm"], ["8.5", "csVertex"], ["8.5", "csSolve"]], "xg": [["8.1", "boxVolume"], ["8.1", "missingTerm"], ["8.2", "baseChange"], ["8.2", "heightFromVolume"], ["8.2", "cubeOfPower"], ["8.2", "negFactor"], ["8.3", "threeFactors"], ["8.3", "numberSquare"], ["8.5", "csWithA"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: o.xg.filter(g => __has(XG, g)) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-' + P.cls.toLowerCase() + '-ch8-v1', SECTIONS, LESSONS: __LESSONS, G, XG, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
