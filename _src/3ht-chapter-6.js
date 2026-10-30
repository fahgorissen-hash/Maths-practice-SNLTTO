const { ri, pick, shuffle, gcd, M, fr, ratText } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => { d = d === undefined ? 6 : d; return Math.round(x * Math.pow(10, d) + 1e-9) / Math.pow(10, d); };
const must = (a, b) => { if (!(Math.abs(a - b) < 1e-6)) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const A_ = s => '∠' + s;   // angle name
const deg = n => n + '°';
const dec = x => String(rd(x, 4));
const LET = ['ABC', 'DEF', 'KLM', 'PQR', 'STU', 'XYZ'];
/* angle question: the answer is a calculation (in-between step needed) or equals a given angle (no step) */
const angQ = (html, ans, hint, steps, calc) => nu(html, ans, hint, steps, Object.assign({ ansText: deg(ans) }, calc ? { needStep: true } : { noStep: true }));
const HINT_STEP = ' Type your calculation first, for example 180 − 36 − 119.';
const svg = (w, h, body) => '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" style="width:' + w + 'px;max-width:100%" role="img" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
const gridBox = (o, px) => '<div style="max-width:' + px + 'px">' + NX.gridSVG(o) + '</div>';
const lab = (s, x, y, fs, anchor, bold, col) => '<text x="' + rd(x, 1) + '" y="' + rd(y, 1) + '" font-size="' + (fs || 13) + '" text-anchor="' + (anchor || 'middle') + '"' + (bold ? ' font-weight="700"' : '') + ' fill="' + (col || '#17222d') + '" style="paint-order:stroke;stroke:#fff;stroke-width:3px">' + s + '</text>';
/* Flat figure. P: {A:[x,y],...} (y up). o.poly: list of vertex names (outline); o.polys: extra outlines;
   o.sides: [[U,V,label]] labels outside the figure; o.dash: [[U,V,label?]] auxiliary lines; o.right: [[V,U,W]] right-angle marks;
   o.ticks: [[U,V]] equal-length marks; o.hl: [U,V] highlighted side */
function flatFig(P, o) {
  const W = o.W || 300, H = o.H || 210, pad = 40, ks = Object.keys(P);
  const xs = ks.map(k => P[k][0]), ys = ks.map(k => P[k][1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((W - 2 * pad) / Math.max(x1 - x0, 1e-6), (H - 2 * pad) / Math.max(y1 - y0, 1e-6));
  const w = (x1 - x0) * s + 2 * pad, h = (y1 - y0) * s + 2 * pad;
  const X = k => pad + (P[k][0] - x0) * s, Y = k => h - pad - (P[k][1] - y0) * s;
  const cx = ks.reduce((a, k) => a + X(k), 0) / ks.length, cy = ks.reduce((a, k) => a + Y(k), 0) / ks.length;
  let b = '';
  [o.poly].concat(o.polys || []).filter(Boolean).forEach((pl, i) => { b += '<polygon points="' + pl.map(k => rd(X(k), 1) + ',' + rd(Y(k), 1)).join(' ') + '" fill="' + (i ? 'none' : 'rgba(27,95,168,.08)') + '" stroke="#1b5fa8" stroke-width="2.2" stroke-linejoin="round"/>'; });
  (o.dash || []).forEach(d => { b += '<line x1="' + rd(X(d[0]), 1) + '" y1="' + rd(Y(d[0]), 1) + '" x2="' + rd(X(d[1]), 1) + '" y2="' + rd(Y(d[1]), 1) + '" stroke="#d1471f" stroke-width="1.8" stroke-dasharray="6 4"/>'; });
  if (o.hl) b += '<line x1="' + rd(X(o.hl[0]), 1) + '" y1="' + rd(Y(o.hl[0]), 1) + '" x2="' + rd(X(o.hl[1]), 1) + '" y2="' + rd(Y(o.hl[1]), 1) + '" stroke="#d1471f" stroke-width="3.2"/>';
  (o.right || []).forEach(r => {
    const [V, U, Wn] = r, vx = X(V), vy = Y(V); const u = [X(U) - vx, Y(U) - vy], w_ = [X(Wn) - vx, Y(Wn) - vy]; const lu = Math.hypot(...u), lw = Math.hypot(...w_), m = 11;
    const a = [vx + u[0] / lu * m, vy + u[1] / lu * m], c = [vx + w_[0] / lw * m, vy + w_[1] / lw * m], bb = [a[0] + w_[0] / lw * m, a[1] + w_[1] / lw * m];
    b += '<polyline points="' + [a, bb, c].map(q => rd(q[0], 1) + ',' + rd(q[1], 1)).join(' ') + '" fill="none" stroke="#223" stroke-width="1.3"/>';
  });
  (o.ticks || []).forEach(t => { const mx = (X(t[0]) + X(t[1])) / 2, my = (Y(t[0]) + Y(t[1])) / 2, dx = X(t[1]) - X(t[0]), dy = Y(t[1]) - Y(t[0]), L = Math.hypot(dx, dy), nx = -dy / L * 6, ny = dx / L * 6; b += '<line x1="' + rd(mx - nx, 1) + '" y1="' + rd(my - ny, 1) + '" x2="' + rd(mx + nx, 1) + '" y2="' + rd(my + ny, 1) + '" stroke="#223" stroke-width="1.6"/>'; });
  const outward = (mx, my, dx, dy, k) => { const L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; } return [mx + nx * k, my + ny * k + 4]; };
  (o.sides || []).forEach(sd => { if (!sd[2]) return; const mx = (X(sd[0]) + X(sd[1])) / 2, my = (Y(sd[0]) + Y(sd[1])) / 2; const q = outward(mx, my, X(sd[1]) - X(sd[0]), Y(sd[1]) - Y(sd[0]), typeof sd[3] === 'number' ? sd[3] : 15); b += lab(sd[2], q[0], q[1], 13, 'middle', true, sd[2] === '?' ? '#d1471f' : '#17222d'); });
  (o.angles || []).forEach(an => { const dx = cx - X(an[0]), dy = cy - Y(an[0]), L = Math.hypot(dx, dy) || 1, k = an[2] || 30; b += lab(an[1], X(an[0]) + dx / L * k, Y(an[0]) + dy / L * k + 4, 12, 'middle', true, an[1].indexOf('?') >= 0 ? '#d1471f' : '#17222d'); });
  ks.forEach(k => { if (o.noLabel && o.noLabel.includes(k)) return; const dx = X(k) - cx, dy = Y(k) - cy, L = Math.hypot(dx, dy) || 1; b += lab(k, X(k) + dx / L * 14, Y(k) + dy / L * 14 + 5, 14, 'middle', true, '#1b5fa8'); });
  return svg(rd(w, 1), rd(h, 1), b);
}


const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const pick2 = a => { const s = shuffle(a.slice()); return [s[0], s[1]]; };
const sp = n => String(n);
const R1 = x => rd(x, 1);
const D = Math.PI / 180;
const T = { sin: x => Math.sin(x * D), cos: x => Math.cos(x * D), tan: x => Math.tan(x * D) };
const INV = { sin: x => Math.asin(x) / D, cos: x => Math.acos(x) / D, tan: x => Math.atan(x) / D };
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];
const isSq = n => Number.isInteger(Math.sqrt(n));
function rootForm(n) { if (isSq(n)) return String(Math.sqrt(n)); const [o, r] = NX.sqrtSplit(n); return o === 1 ? '√' + n : o + '√' + r; }
/* rounded numeric answer with a tolerance of half a unit in the last place; typed working (like 6*tan(35)) is required */
const nr = (html, exact, d, hint, steps, extra) => nu(html, rd(exact, d), hint, steps, Object.assign({ tol: .51 * Math.pow(10, -d), needStep: true }, extra || {}));
const KEYS = ['sin', 'cos', 'tan', '^-1', '(', ')', '√'].map(k => k);
/* right-angled triangle: n[0] is the right angle, leg n[0]n[1] has length a, leg n[0]n[2] has length b.
   sl = labels [n0n1, n0n2, n1n2], an = labels for the angles at n[1] and n[2] */
function rt(n, a, b, sl, an, rot, flip) {
  const ra = Math.max(.5, Math.min(2.2, a / b)), t = (rot || 0) * D, Rr = q => [q[0] * Math.cos(t) - q[1] * Math.sin(t), q[0] * Math.sin(t) + q[1] * Math.cos(t)];
  const P = {}; P[n[0]] = Rr([0, 0]); P[n[1]] = Rr([ra * (flip ? -1 : 1), 0]); P[n[2]] = Rr([0, 1]);
  an = an || [];
  return flatFig(P, { poly: n.split(''), right: [[n[0], n[1], n[2]]], sides: [[n[0], n[1], sl[0]], [n[0], n[2], sl[1]], [n[1], n[2], sl[2]]], angles: [[n[1], an[0], 34], [n[2], an[1], 34]].filter(x => x[1]), W: 290, H: 210 });
}
const ROT = l => l === 0 ? pick([0, 0, 180]) : pick([0, 90, 180, 270, 20, 160, 200, 340]);
const side = (n, i, j) => n[i] + n[j];
/* the three sides seen from the angle at vertex v (n[1] or n[2]) */
function sidesFrom(n, v) { const other = v === n[1] ? n[2] : n[1]; return { opp: (n[0] + other).split('').sort().join(''), adj: (n[0] + v).split('').sort().join(''), hyp: (n[1] + n[2]).split('').sort().join('') }; }
const SOH = 'SOH CAH TOA: sin = opposite / hypotenuse, cos = adjacent / hypotenuse, tan = opposite / adjacent.';

/* ======================= 6.1 Pythagoras and similar right triangles ======================= */
G['6.1'] = [
  function hypotenuse(l) {
    const n = pick(LET), a = l === 0 ? pick(TRIPLES.slice(0, 4))[0] : ri(2, 15), b = l === 0 ? null : ri(2, 15);
    let A = a, B = b; if (l === 0) { const t = pick(TRIPLES.slice(0, 5)); A = t[0]; B = t[1]; }
    const c2 = A * A + B * B, c = Math.sqrt(c2), H = side(n, 1, 2);
    return nr(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, ' + side(n, 0, 1) + ' = ' + A + ' and ' + side(n, 0, 2) + ' = ' + B + '. Calculate ' + H + '. Round to 1 decimal.') + rt(n, A, B, [A, B, '?'], null, ROT(l)), c, 1, 'The side opposite the right angle is the hypotenuse: ' + side(n, 0, 1) + '² + ' + side(n, 0, 2) + '² = ' + H + '².', side(n, 0, 1) + '² + ' + side(n, 0, 2) + '² = ' + H + '²<br>' + A + '² + ' + B + '² = ' + H + '²<br>' + A * A + ' + ' + B * B + ' = ' + H + '²<br>' + H + '² = ' + c2 + '<br>' + H + ' = √' + c2 + (isSq(c2) ? ' = ' + c : ' ≈ ' + R1(c)));
  },
  function leg(l) {
    const n = pick(LET); let A, C; if (l === 0) { const t = pick(TRIPLES.slice(0, 5)); A = t[0]; C = t[2]; } else { A = ri(2, 15); C = A + ri(2, 10); }
    const b2 = C * C - A * A, b = Math.sqrt(b2), Bn = side(n, 0, 2), H = side(n, 1, 2);
    return nr(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, ' + side(n, 0, 1) + ' = ' + A + ' and ' + H + ' = ' + C + '. Calculate ' + Bn + '. Round to 1 decimal.') + rt(n, A, b, [A, '?', C], null, ROT(l)), b, 1, 'You know the hypotenuse, so you subtract: ' + Bn + '² = ' + H + '² − ' + side(n, 0, 1) + '².', side(n, 0, 1) + '² + ' + Bn + '² = ' + H + '²<br>' + A + '² + ' + Bn + '² = ' + C + '²<br>' + A * A + ' + ' + Bn + '² = ' + C * C + '<br>' + Bn + '² = ' + C * C + ' − ' + A * A + ' = ' + b2 + '<br>' + Bn + ' = √' + b2 + (isSq(b2) ? ' = ' + b : ' ≈ ' + R1(b)));
  },
  function isRight(l) {
    const t = pick(TRIPLES), k = l >= 2 ? pick([0.5, 1.5, 2.5, 0.3]) : pick([1, 1, 2, 0.5]), right = Math.random() < .5; let s = t.map(v => rd(v * k)); if (!right) s = [s[0], rd(s[1] + pick([1, -1]) * (l >= 2 ? 0.5 : 1)), s[2]];
    if (l >= 2) {   // spicy: decimals, the longest side is not always last
      const ok2 = rd(s[0] * s[0] + s[1] * s[1]) === rd(s[2] * s[2]), sh = shuffle(s.slice()), so = s.slice().sort((x, y) => x - y);
      return ch(p('A triangle has sides ' + sh.join(', ') + '. Is it a right-angled triangle?'), ok2 ? 'yes' : 'no', [ok2 ? 'no' : 'yes'], 'Find the longest side first. Check if the two short sides squared add up to the longest side squared.', 'Longest side: ' + so[2] + '. ' + so[0] + '² + ' + so[1] + '² = ' + rd(so[0] * so[0]) + ' + ' + rd(so[1] * so[1]) + ' = ' + rd(so[0] * so[0] + so[1] * so[1]) + ' and ' + so[2] + '² = ' + rd(so[2] * so[2]) + '. ' + (ok2 ? 'These are equal: yes, right-angled.' : 'These are not equal: no.'));
    }
    const ok = rd(s[0] * s[0] + s[1] * s[1]) === rd(s[2] * s[2]);
    return ch(p('A triangle has sides ' + s[0] + ', ' + s[1] + ' and ' + s[2] + '. Is it a right-angled triangle?'), ok ? 'yes' : 'no', [ok ? 'no' : 'yes'], 'Check if the two short sides squared add up to the longest side squared.', s[0] + '² + ' + s[1] + '² = ' + rd(s[0] * s[0]) + ' + ' + rd(s[1] * s[1]) + ' = ' + rd(s[0] * s[0] + s[1] * s[1]) + ' and ' + s[2] + '² = ' + rd(s[2] * s[2]) + '. ' + (ok ? 'These are equal: yes, right-angled.' : 'These are not equal: no.'));
  },
  function similarRight(l) {
    const t = pick(TRIPLES), k = pick([1.5, 2, 2.5, 3, 0.5]), n1 = 'ABC', n2 = 'DEF', ask = ri(0, 2), big = t.map(v => rd(v * k));
    const known = [0, 1, 2].filter(i => i !== ask), lbl = ['the short side', 'the other side next to the right angle', 'the hypotenuse'];
    if (l >= 2) {   // spicy: BC is not given, so Pythagoras first (or after)
      const j = ri(0, 1);
      return nu(p('Triangles ABC and DEF are similar right-angled triangles (∠A = ∠D = 90° and ∠B = ∠E). AB = ' + t[0] + ', AC = ' + t[1] + ' and ' + ['DE', 'DF'][j] + ' = ' + big[j] + '. Calculate <b>EF</b>.'), big[2], 'Find BC with Pythagoras, or first find the other side of DEF. Then use the enlargement factor.', p('BC² = ' + t[0] + '² + ' + t[1] + '² = ' + t[2] * t[2] + ', so BC = ' + t[2]) + p('factor = ' + ['DE', 'DF'][j] + ' / ' + ['AB', 'AC'][j] + ' = ' + big[j] + ' / ' + t[j] + ' = ' + k) + p('EF = ' + k + ' · ' + t[2] + ' = ' + big[2]), { needStep: true });
    }
    return nu(p('Triangles ABC and DEF are similar right-angled triangles (∠A = ∠D = 90° and ∠B = ∠E). AB = ' + t[0] + ', AC = ' + t[1] + ', BC = ' + t[2] + ' and ' + ['DE', 'DF', 'EF'][known[0]] + ' = ' + big[known[0]] + '. Calculate ' + ['DE', 'DF', 'EF'][ask] + '.'), big[ask], 'Find the enlargement factor from a pair of corresponding sides.', p('factor = ' + ['DE', 'DF', 'EF'][known[0]] + ' / ' + ['AB', 'AC', 'BC'][known[0]] + ' = ' + big[known[0]] + ' / ' + t[known[0]] + ' = ' + k) + p(['DE', 'DF', 'EF'][ask] + ' = ' + k + ' · ' + t[ask] + ' = ' + big[ask]), { needStep: true });
  }
];
XG['6.1'] = [
  function ladderWall(l) {
    const L = pick([4, 5, 6, 7.5, 8]), d = pick([1.2, 1.5, 2, 2.4]), h = Math.sqrt(L * L - d * d);
    return nr(p('A ladder of ' + L + ' m leans against a wall. The foot of the ladder is ' + d + ' m from the wall. How high does the ladder reach? Round to 2 decimals.'), h, 2, 'The ladder is the hypotenuse.', 'h² + ' + d + '² = ' + L + '²<br>h² = ' + rd(L * L) + ' − ' + rd(d * d) + ' = ' + rd(L * L - d * d) + '<br>h = √' + rd(L * L - d * d) + ' ≈ ' + rd(h, 2) + ' m');
  }
];

/* ======================= 6.2 Special triangles and the ratios ======================= */
G['6.2'] = [
  function tri3060(l) {
    const n = pick(LET), x = ri(1, 9), ask = pick(['hyp', 'long']), given = l === 0 ? 'short' : pick(['short', 'hyp']);
    // n[0] = 90°, n[1] = 60°, n[2] = 30°; short side n0n1 = x, long side n0n2 = x√3, hypotenuse n1n2 = 2x
    const S = side(n, 0, 1), Lg = side(n, 0, 2), H = side(n, 1, 2);
    if (given === 'hyp') { const h = 2 * x; return ex(p('Triangle ' + n + ' has ∠' + n[0] + ' = 90°, ∠' + n[1] + ' = 60° and ' + H + ' = ' + h + '. Calculate ' + Lg + ' exactly.') + rt(n, 1, Math.sqrt(3), ['', '?', h], ['60°', '30°'], ROT(l)), x === 1 ? '√3' : x + '√3', 'root', 'In a 30°-60°-90° triangle the short side is half the hypotenuse, and the long side is short side · √3.', p(S + ' = ' + h + ' / 2 = ' + x) + p(Lg + ' = ' + S + ' · √3 = ' + (x === 1 ? '√3' : x + '√3')), { keys: ['√'] }); }
    const ans = ask === 'hyp' ? String(2 * x) : x === 1 ? '√3' : x + '√3';
    return ex(p('Triangle ' + n + ' has ∠' + n[0] + ' = 90°, ∠' + n[1] + ' = 60° and ' + S + ' = ' + x + '. Calculate ' + (ask === 'hyp' ? H : Lg) + ' exactly.') + rt(n, 1, Math.sqrt(3), [x, ask === 'hyp' ? '' : '?', ask === 'hyp' ? '?' : ''], ['60°', '30°'], ROT(l)), ans, 'root', 'A 30°-60°-90° triangle is half of an equilateral triangle: hypotenuse = 2 · short side, long side = short side · √3.', ask === 'hyp' ? H + ' = 2 · ' + S + ' = 2 · ' + x + ' = ' + 2 * x : Lg + ' = ' + S + ' · √3 = ' + ans, { keys: ['√'] });
  },
  function tri4545(l) {
    const n = pick(LET), x = ri(1, 12), fromLeg = l === 0 || Math.random() < .5, S = side(n, 0, 1), H = side(n, 1, 2);
    if (fromLeg) return ex(p('Triangle ' + n + ' has ∠' + n[0] + ' = 90° and ∠' + n[1] + ' = 45°. ' + S + ' = ' + x + '. Calculate ' + H + ' exactly.') + rt(n, 1, 1, [x, '', '?'], ['45°', ''], ROT(l)), x === 1 ? '√2' : x + '√2', 'root', 'A 45°-45°-90° triangle is half a square: both short sides are equal, the hypotenuse is side · √2.', p(side(n, 0, 2) + ' = ' + S + ' = ' + x) + p(H + '² = ' + x + '² + ' + x + '² = ' + 2 * x * x + ', so ' + H + ' = √' + 2 * x * x + ' = ' + (x === 1 ? '√2' : x + '√2')), { keys: ['√'] });
    const h = 2 * x;
    return ex(p('Triangle ' + n + ' has ∠' + n[0] + ' = 90°, ∠' + n[1] + ' = 45° and ' + H + ' = ' + h + '. Calculate ' + S + ' exactly.') + rt(n, 1, 1, ['?', '', h], ['45°', ''], ROT(l)), x === 1 ? '√2' : x + '√2', 'root', 'Both short sides are equal: ' + S + '² + ' + S + '² = ' + H + '².', p('2 · ' + S + '² = ' + h + '² = ' + h * h) + p(S + '² = ' + h * h / 2) + p(S + ' = √' + h * h / 2 + ' = ' + (x === 1 ? '√2' : x + '√2')), { keys: ['√'] });
  },
  function nameRatio(l) {
    const n = pick(LET), v = pick([n[1], n[2]]), s = sidesFrom(n, v), f = pick(['sin', 'cos', 'tan']), right = f === 'sin' ? s.opp + ' / ' + s.hyp : f === 'cos' ? s.adj + ' / ' + s.hyp : s.opp + ' / ' + s.adj;
    const all = [s.opp + ' / ' + s.hyp, s.adj + ' / ' + s.hyp, s.opp + ' / ' + s.adj, s.adj + ' / ' + s.opp];
    return ch(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°. Which ratio is ' + f + '(∠' + v + ')?') + rt(n, ri(3, 6), ri(3, 6), ['', '', ''], [v === n[1] ? '•' : '', v === n[2] ? '•' : ''], ROT(l)), right, all.filter(o => o !== right), SOH, 'Seen from ∠' + v + ': opposite side ' + s.opp + ', adjacent side ' + s.adj + ', hypotenuse ' + s.hyp + '. ' + f + '(∠' + v + ') = ' + right + '.');
  },
  function exactRatio(l) {
    const n = pick(LET), t = pick(TRIPLES.slice(0, l === 0 ? 3 : 8)), v = n[1], f = pick(['sin', 'cos', 'tan']);
    // leg n0n1 = t[0] (adjacent to v), leg n0n2 = t[1] (opposite v), hyp = t[2]
    const num = f === 'cos' ? t[0] : t[1], den = f === 'tan' ? t[0] : t[2], g = NX.gcd(num, den), s = sidesFrom(n, v);
    return ex(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, ' + side(n, 0, 1) + ' = ' + t[0] + ', ' + side(n, 0, 2) + ' = ' + t[1] + ' and ' + side(n, 1, 2) + ' = ' + t[2] + '. Give ' + f + '(∠' + v + ') as a fraction in lowest terms.') + rt(n, t[0], t[1], [t[0], t[1], t[2]], ['•', ''], ROT(l)), (num / g) + '/' + (den / g), 'lowest', SOH, f + '(∠' + v + ') = ' + (f === 'sin' ? s.opp + ' / ' + s.hyp : f === 'cos' ? s.adj + ' / ' + s.hyp : s.opp + ' / ' + s.adj) + ' = ' + num + '/' + den + (g > 1 ? ' = ' + num / g + '/' + den / g : ''), { keys: ['/'] });
  },
  function tanSide(l) {
    const n = pick(LET), t = pick(TRIPLES.slice(0, 6)), k = ri(1, 4), adj = t[0] * k, opp = t[1] * k, g = NX.gcd(t[0], t[1]);
    if (l >= 2) {   // spicy: the hypotenuse is asked (tan, then Pythagoras)
      const hyp = t[2] * k;
      return nu(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, tan(∠' + n[1] + ') = ' + t[1] / g + '/' + t[0] / g + ' and ' + side(n, 0, 1) + ' = ' + adj + '. Calculate ' + side(n, 1, 2) + '.') + rt(n, t[0], t[1], [adj, '', '?'], ['•', ''], ROT(l)), hyp, 'First find ' + side(n, 0, 2) + ' with tan. Then use Pythagoras for ' + side(n, 1, 2) + '.', p(side(n, 0, 2) + ' = ' + adj + ' · ' + t[1] / g + ' / ' + t[0] / g + ' = ' + opp) + p(side(n, 1, 2) + '² = ' + adj + '² + ' + opp + '² = ' + hyp * hyp) + p(side(n, 1, 2) + ' = √' + hyp * hyp + ' = ' + hyp), { needStep: true });
    }
    return nu(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, tan(∠' + n[1] + ') = ' + t[1] / g + '/' + t[0] / g + ' and ' + side(n, 0, 1) + ' = ' + adj + '. Calculate ' + side(n, 0, 2) + '.') + rt(n, t[0], t[1], [adj, '?', ''], ['•', ''], ROT(l)), opp, 'tan(∠' + n[1] + ') = opposite / adjacent = ' + side(n, 0, 2) + ' / ' + side(n, 0, 1) + '.', p('tan(∠' + n[1] + ') = ' + side(n, 0, 2) + ' / ' + side(n, 0, 1)) + p(t[1] / g + '/' + t[0] / g + ' = ' + side(n, 0, 2) + ' / ' + adj) + p(side(n, 0, 2) + ' = ' + adj + ' · ' + t[1] / g + ' / ' + t[0] / g + ' = ' + opp), { needStep: true });
  }
];
XG['6.1'].push(function tvScreen(l) {
  const [w, h] = pick([[16, 9], [4, 3], [21, 9]]), d = pick([32, 40, 43, 50, 55, 65]), k = d / Math.sqrt(w * w + h * h), W = rd(w * k, 1), H_ = rd(h * k, 1), askW = Math.random() < .5;
  return nu(p('A TV screen has width : height = ' + w + ' : ' + h + '. The diagonal of the screen is ' + d + ' inch. Calculate the <b>' + (askW ? 'width' : 'height') + '</b> of the screen in inches. <small>(Round to 1 decimal.)</small>'), askW ? W : H_, 'Call the width ' + w + X_k + ' and the height ' + h + X_k + '. Use Pythagoras with the diagonal to find ' + X_k + '.', p('(' + w + X_k + ')² + (' + h + X_k + ')² = ' + d + '²') + p((w * w + h * h) + X_k + '² = ' + d * d + ' → ' + X_k + ' = √(' + d * d + ' : ' + (w * w + h * h) + ') ≈ ' + rd(k, 4)) + p((askW ? 'width = ' + w : 'height = ' + h) + ' · ' + rd(k, 4) + ' ≈ ' + (askW ? W : H_)), { tol: .051, needStep: true });
});
const X_k = '<i>k</i>';
XG['6.2'] = [
  function hexagonArea(l) {
    const s = ri(2, 10), A = rd(6 * s * s * Math.sqrt(3) / 4, 1);
    return nr(p('A regular hexagon has sides of ' + s + ' cm. It consists of six equilateral triangles. Calculate its area in cm². Round to 1 decimal.'), 6 * s * s * Math.sqrt(3) / 4, 1, 'The height of an equilateral triangle with side ' + s + ' is (' + s + '/2) · √3.', p('height = ' + rd(s / 2) + ' · √3 ≈ ' + rd(s / 2 * Math.sqrt(3), 3)) + p('one triangle = ½ · ' + s + ' · ' + rd(s / 2 * Math.sqrt(3), 3) + ' ≈ ' + rd(s * s * Math.sqrt(3) / 4, 3)) + p('hexagon = 6 · ' + rd(s * s * Math.sqrt(3) / 4, 3) + ' ≈ ' + A + ' cm²'));
  }
];

/* ======================= 6.3 Calculating sides and angles ======================= */XG['6.2'].push(function equilateralFromHeight(l) {
  const h = pick([3, 4, 5, 6, 7.5, 9, 10]), side = 2 * h / Math.sqrt(3), A = h * h / Math.sqrt(3), askA = Math.random() < .5;
  return nu(p('An equilateral triangle has a height of ' + h + ' cm. Calculate the ' + (askA ? '<b>area</b> (in cm²)' : 'length of a <b>side</b> (in cm)') + '. <small>(Round to 2 decimals.)</small>'), rd(askA ? A : side, 2), 'The height cuts the triangle into two 30°-60°-90° triangles. The height is the side opposite the 60° angle: half the side · √3.', p('half the side · √3 = ' + h + ' → half the side = ' + h + ' : √3 ≈ ' + rd(h / Math.sqrt(3), 4)) + p('side ≈ ' + rd(side, 4)) + (askA ? p('area = ½ · ' + rd(side, 4) + ' · ' + h + ' ≈ ' + rd(A, 2)) : ''), { tol: .0051, needStep: true });
});

G['6.3'] = [
  function trigValue(l) {
    const f = pick(['sin', 'cos', 'tan']), a = ri(5, 85);
    return nu(p('Use your calculator (in degrees): ' + f + '(' + a + '°) ≈ ? Round to 2 decimals.'), rd(T[f](a), 2), 'Check that your calculator is in degrees (D or DEG).', f + '(' + a + '°) ≈ ' + rd(T[f](a), 2), { tol: .0051, noStep: true });
  },
  function whichRatio(l) {
    const n = pick(LET), v = n[1], s = sidesFrom(n, v), pairs = [['opp', 'hyp', 'sin'], ['adj', 'hyp', 'cos'], ['opp', 'adj', 'tan']], pr = pick(pairs), giv = pick([0, 1]);
    const known = s[pr[giv]], want = s[pr[1 - giv]];
    return ch(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°. You know ∠' + v + ' and ' + known + '. You want to calculate ' + want + '. Which ratio do you use?'), pr[2], ['sin', 'cos', 'tan'].filter(o => o !== pr[2]), SOH, 'Seen from ∠' + v + ': ' + known + ' is the ' + { opp: 'opposite side', adj: 'adjacent side', hyp: 'hypotenuse' }[pr[giv]] + ' and ' + want + ' is the ' + { opp: 'opposite side', adj: 'adjacent side', hyp: 'hypotenuse' }[pr[1 - giv]] + '. Use ' + pr[2] + '.');
  },
  function sideMultiply(l) {
    const n = pick(LET), v = n[1], a = ri(15, 75), f = pick(['sin', 'cos', 'tan']), s = sidesFrom(n, v), k = ri(3, 20), adjL = 1, oppL = Math.tan(a * D);
    // known side is the denominator; unknown is the numerator: unknown = known · f(a)
    const den = f === 'tan' ? s.adj : s.hyp, num = f === 'cos' ? s.adj : s.opp, ans = k * T[f](a);
    const sl = ['', '', '']; const lab = (nm, val) => { const i = [side(n, 0, 1), side(n, 0, 2), side(n, 1, 2)].map(x => x.split('').sort().join('')).indexOf(nm); sl[i] = val; }; lab(den, k); lab(num, '?');
    return nr(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, ∠' + v + ' = ' + a + '° and ' + den + ' = ' + k + '. Calculate ' + num + '. Round to 1 decimal.') + rt(n, adjL, oppL, sl, [a + '°', ''], ROT(l)), ans, 1, SOH + ' Then multiply.', p(f + '(∠' + v + ') = ' + num + ' / ' + den) + p(f + '(' + a + '°) = ' + num + ' / ' + k) + p(num + ' = ' + k + ' · ' + f + '(' + a + '°) ≈ ' + R1(ans)), { keys: KEYS });
  },
  function sideDivide(l) {
    const n = pick(LET), v = n[1], a = ri(15, 75), f = pick(['sin', 'cos', 'tan']), s = sidesFrom(n, v), k = ri(3, 20);
    // known side is the numerator; unknown is the denominator: unknown = known / f(a)
    const den = f === 'tan' ? s.adj : s.hyp, num = f === 'cos' ? s.adj : s.opp, ans = k / T[f](a);
    const sl = ['', '', '']; const lab = (nm, val) => { const i = [side(n, 0, 1), side(n, 0, 2), side(n, 1, 2)].map(x => x.split('').sort().join('')).indexOf(nm); sl[i] = val; }; lab(num, k); lab(den, '?');
    return nr(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, ∠' + v + ' = ' + a + '° and ' + num + ' = ' + k + '. Calculate ' + den + '. Round to 1 decimal.') + rt(n, 1, Math.tan(a * D), sl, [a + '°', ''], ROT(l)), ans, 1, SOH + ' The unknown side is in the denominator, so you divide.', p(f + '(∠' + v + ') = ' + num + ' / ' + den) + p(f + '(' + a + '°) = ' + k + ' / ' + den) + p(den + ' · ' + f + '(' + a + '°) = ' + k) + p(den + ' = ' + k + ' / ' + f + '(' + a + '°) ≈ ' + R1(ans)), { keys: KEYS });
  },
  function findAngle(l) {
    const n = pick(LET), v = n[1], s = sidesFrom(n, v), f = pick(['sin', 'cos', 'tan']); let x, y; do { x = ri(2, 15); y = ri(2, 15); } while (f !== 'tan' && x >= y || x === y);
    // f = x / y
    const num = f === 'cos' ? s.adj : s.opp, den = f === 'tan' ? s.adj : s.hyp, ang = INV[f](x / y);
    const opp = f === 'tan' ? x : f === 'sin' ? x : Math.sqrt(y * y - x * x), adj = f === 'tan' ? y : f === 'cos' ? x : Math.sqrt(y * y - x * x);
    const sl = ['', '', '']; const lab = (nm, val) => { const i = [side(n, 0, 1), side(n, 0, 2), side(n, 1, 2)].map(z => z.split('').sort().join('')).indexOf(nm); sl[i] = val; }; lab(num, x); lab(den, y);
    return nr(p('In triangle ' + n + ', ∠' + n[0] + ' = 90°, ' + num + ' = ' + x + ' and ' + den + ' = ' + y + '. Calculate ∠' + v + '. Round to whole degrees.') + rt(n, adj, opp, sl, ['?', ''], ROT(l)), ang, 0, SOH + ' Then use ' + f + '<sup>−1</sup> on your calculator.', p(f + '(∠' + v + ') = ' + num + ' / ' + den + ' = ' + x + '/' + y) + p('∠' + v + ' = ' + f + '<sup>−1</sup>(' + x + '/' + y + ') ≈ ' + rd(ang, 0) + '°'), { keys: KEYS, ansText: rd(ang, 0) + '°' });
  },
  function otherAngle(l) {
    const a = ri(12, 78), n = pick(LET);
    return nu(p('In triangle ' + n + ', ∠' + n[0] + ' = 90° and ∠' + n[1] + ' = ' + a + '°. Calculate ∠' + n[2] + '.'), 90 - a, 'The angles of a triangle add up to 180°.', '∠' + n[2] + ' = 180° − 90° − ' + a + '° = ' + (90 - a) + '°', { needStep: true, ansText: (90 - a) + '°' });
  }
];
XG['6.3'] = [
  function treeHeight(l) {
    const d = pick([12, 15, 20, 25, 30]), a = ri(25, 50), eye = pick([1.5, 1.6, 1.7]), h = d * T.tan(a) + eye;
    return nr(p('You stand ' + d + ' m from a tree. You look up to the top of the tree at an angle of ' + a + '°. Your eyes are ' + eye + ' m above the ground. How tall is the tree? Round to 1 decimal.'), h, 1, 'Make a right-angled triangle from your eyes to the top. Then add your eye height.', p('tan(' + a + '°) = ? / ' + d) + p('? = ' + d + ' · tan(' + a + '°) ≈ ' + rd(d * T.tan(a), 2)) + p('height ≈ ' + rd(d * T.tan(a), 2) + ' + ' + eye + ' ≈ ' + R1(h) + ' m'), { keys: KEYS });
  },
  function rhombusAngle(l) {
    const d1 = ri(4, 12) * 2, d2 = ri(4, 12) * 2; if (d1 === d2) return XG['6.3'][1](l);
    const half = INV.tan((d2 / 2) / (d1 / 2)), A = 2 * half;
    return nr(p('A rhombus ABCD has diagonals AC = ' + d1 + ' and BD = ' + d2 + '. The diagonals cross at right angles at S. Calculate ∠BAD. Round to whole degrees.'), A, 0, 'Use triangle ABS: AS = ' + d1 / 2 + ' and BS = ' + d2 / 2 + '. Find ∠BAS first.', p('tan(∠BAS) = BS / AS = ' + d2 / 2 + '/' + d1 / 2) + p('∠BAS = tan<sup>−1</sup>(' + d2 / 2 + '/' + d1 / 2 + ') ≈ ' + rd(half, 2) + '°') + p('∠BAD = 2 · ∠BAS ≈ ' + rd(A, 0) + '°'), { keys: KEYS, ansText: rd(A, 0) + '°' });
  }
];

/* ======================= 6.4 Applications: angle of inclination and slope ======================= */
G['6.4'] = [
  function slopePercent(l) {
    const run = pick([100, 200, 250, 400, 500, 800]), rise = ri(2, l === 0 ? 20 : 60) * run / 100, pc = rd(rise / run * 100, 1);
    if (l >= 2) { const L = pick([100, 150, 200, 250, 400]), up = ri(5, Math.round(L / 3)), hz = Math.sqrt(L * L - up * up), pc2 = rd(up / hz * 100, 1);   // spicy: the length along the road is given
      return nu(p('A road is ' + L + ' m long (measured along the road) and rises ' + up + ' m. What is the slope percentage? Round to 1 decimal.'), pc2, 'slope percentage = vertical / horizontal · 100%. First the horizontal distance with Pythagoras.', p('horizontal = √(' + L + '² − ' + up + '²) ≈ ' + rd(hz, 2) + ' m') + p(up + ' / ' + rd(hz, 2) + ' · 100% ≈ ' + pc2 + '%'), { needStep: true, tol: .051, ansText: pc2 + '%' }); }
    return nu(p('A road rises ' + rise + ' m over a horizontal distance of ' + run + ' m. What is the slope percentage?'), pc, 'slope percentage = vertical / horizontal · 100%.', rise + ' / ' + run + ' · 100% = ' + pc + '%', { needStep: true, ansText: pc + '%' });
  },
  function inclinationFromPercent(l) {
    const pc = pick([5, 8, 10, 12, 14, 20, 25, 40, 60, 75, 100]), a = INV.tan(pc / 100);
    if (l >= 2) { const L = pick([4, 5, 6, 8, 12]), up = rd(L * pick([0.08, 0.12, 0.15, 0.2, 0.25]), 2), a2 = INV.sin(up / L);   // spicy: the ramp length and the height are given
      return nr(p('A ramp is ' + L + ' m long and rises ' + up + ' m. Calculate the angle of inclination. Round to 1 decimal.'), a2, 1, 'The ramp itself is the hypotenuse, the height is opposite the angle: use sin<sup>−1</sup>.', p('sin(angle) = ' + up + ' / ' + L) + p('angle = sin<sup>−1</sup>(' + up + ' / ' + L + ') ≈ ' + rd(a2, 1) + '°'), { keys: KEYS, ansText: rd(a2, 1) + '°' }); }
    return nr(p('A ramp has a slope of ' + pc + '%. Calculate the angle of inclination. Round to whole degrees.'), a, 0, pc + '% means ' + pc + ' up for every 100 along: tan(angle) = ' + pc + '/100.', p('tan(angle) = ' + pc + ' / 100 = ' + rd(pc / 100)) + p('angle = tan<sup>−1</sup>(' + rd(pc / 100) + ') ≈ ' + rd(a, 0) + '°'), { keys: KEYS, ansText: rd(a, 0) + '°' });
  },
  function percentFromAngle(l) {
    const a = ri(2, 35), pc = T.tan(a) * 100;
    if (l >= 2) { const pc2 = ri(4, 60), a2 = Math.atan(pc2 / 100) / D;   // spicy: from the slope percentage back to the angle
      return nr(p('A road has a slope of ' + pc2 + '%. Calculate the angle of inclination. Round to 1 decimal.'), a2, 1, 'tan(angle) = ' + pc2 + ' / 100. Use tan<sup>−1</sup>.', 'tan(α) = ' + pc2 / 100 + '<br>α = tan<sup>−1</sup>(' + pc2 / 100 + ') ≈ ' + R1(a2) + '°', { keys: KEYS, ansText: R1(a2) + '°' }); }
    return nr(p('A road has an angle of inclination of ' + a + '°. Calculate the slope percentage. Round to 1 decimal.'), pc, 1, 'slope percentage = tan(angle) · 100%.', 'tan(' + a + '°) · 100% ≈ ' + R1(pc) + '%', { keys: KEYS, ansText: R1(pc) + '%' });
  },
  function ladderAngle(l) {
    const L = pick([3, 4, 5, 6, 8]), a = ri(60, 78), kind = pick(['height', 'foot']), v = kind === 'height' ? L * T.sin(a) : L * T.cos(a);
    if (l >= 2) { const H = rd(L * T.sin(a) - pick([0.3, 0.2, 0.1]), 1), ang = Math.asin(H / L) / D;   // spicy: the angle is asked
      return nr(p('A ladder of ' + L + ' m reaches ' + H + ' m up a wall. What angle does the ladder make with the ground? Round to 1 decimal.'), ang, 1, 'The ladder is the hypotenuse, the height is opposite the angle: use sin<sup>−1</sup>.', p('sin(α) = ' + H + ' / ' + L) + p('α = sin<sup>−1</sup>(' + H + ' / ' + L + ') ≈ ' + R1(ang) + '°'), { keys: KEYS, ansText: R1(ang) + '°' }); }
    return nr(p('A ladder of ' + L + ' m makes an angle of ' + a + '° with the ground. ' + (kind === 'height' ? 'How high up the wall does it reach?' : 'How far is the foot of the ladder from the wall?') + ' Round to 2 decimals.'), v, 2, 'The ladder is the hypotenuse. The ' + (kind === 'height' ? 'height is opposite' : 'distance to the wall is adjacent to') + ' the angle.', p((kind === 'height' ? 'sin' : 'cos') + '(' + a + '°) = ? / ' + L) + p('? = ' + L + ' · ' + (kind === 'height' ? 'sin' : 'cos') + '(' + a + '°) ≈ ' + rd(v, 2) + ' m'), { keys: KEYS });
  },
  function walkUp(l) {
    const d = pick([200, 300, 400, 500, 800, 1000]), a = ri(3, 15), h = d * T.sin(a);
    if (l >= 2) { const up = pick([25, 40, 60, 75, 120]), len = up / T.sin(a);   // spicy: the length of the path is asked
      return nr(p('A straight path up a hill makes an angle of ' + a + '° with the horizontal. You climb ' + up + ' m in height. How long is the path? Round to whole metres.'), len, 0, 'The path is the hypotenuse; the height is opposite the angle. Now the hypotenuse is unknown: divide.', p('sin(' + a + '°) = ' + up + ' / ?') + p('? = ' + up + ' / sin(' + a + '°) ≈ ' + rd(len, 0) + ' m'), { keys: KEYS }); }
    return nr(p('You walk ' + d + ' m along a straight path up a hill. The path makes an angle of ' + a + '° with the horizontal. How many metres higher are you? Round to whole metres.'), h, 0, 'The path is the hypotenuse; the height is opposite the angle.', p('sin(' + a + '°) = ? / ' + d) + p('? = ' + d + ' · sin(' + a + '°) ≈ ' + rd(h, 0) + ' m'), { keys: KEYS });
  }
];
XG['6.4'] = [
  function runFromSlope(l) {
    const h = pick([25, 30, 40, 50]), pc = pick([10, 12, 14, 16, 20]), run = h / (pc / 100);
    return nu(p('A mountain road has a slope of ' + pc + '% and goes up ' + h + ' m. How long is the horizontal distance (in m)?'), rd(run, 1), pc + '%: ' + pc + ' up for every 100 along.', pc + ' / 100 = ' + h + ' / run, so run = ' + h + ' · 100 / ' + pc + ' = ' + rd(run, 1) + ' m', { needStep: true, tol: .051 });
  },
  function isoscelesSide(l) {
    const AC = ri(4, 10), a = pick([50, 60, 70, 80]), half = AC / 2, x = half / T.tan(a / 2) , side2 = half / T.sin(a / 2);
    return nr(p('Isosceles triangle ABC has AB = BC, AC = ' + AC + ' cm and ∠ABC = ' + a + '°. Calculate AB. Round to 1 decimal.'), side2, 1, 'Draw the height from B to the midpoint M of AC. Then ∠ABM = ' + a / 2 + '° and AM = ' + half + '.', p('sin(∠ABM) = AM / AB') + p('sin(' + a / 2 + '°) = ' + half + ' / AB') + p('AB = ' + half + ' / sin(' + a / 2 + '°) ≈ ' + R1(side2) + ' cm'), { keys: KEYS });
  }
];

const SECTIONS = [
  { id: '6.1', title: '6.1 Pythagoras and similar triangles', sub: 'Right-angled triangles, revision' },
  { id: '6.2', title: '6.2 Special triangles and ratios', sub: '30°-60°-90°, 45°-45°-90°, sin, cos, tan' },
  { id: '6.3', title: '6.3 Calculating sides and angles', sub: 'SOH CAH TOA with your calculator' },
  { id: '6.4', title: '6.4 Applications', sub: 'Angle of inclination, slope percentage' }
];
const GOALS = [
  ['6.1', 'I can use Pythagoras and similar right-angled triangles', ['hypotenuse', 'leg', 'isRight', 'similarRight'], 'a² + b² = c²'],
  ['6.2', 'I can use special triangles and the ratios sin, cos and tan', ['tri3060', 'tri4545', 'nameRatio', 'exactRatio', 'tanSide'], 'SOH CAH TOA'],
  ['6.3', 'I can calculate sides and angles with sin, cos and tan', ['trigValue', 'whichRatio', 'sideMultiply', 'sideDivide', 'findAngle', 'otherAngle'], 'Unknown in the denominator: divide.'],
  ['6.4', 'I can use trigonometry in real situations', ['slopePercent', 'inclinationFromPercent', 'percentFromAngle', 'ladderAngle', 'walkUp'], 'slope % = tan(angle) · 100%']
];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "3HT": [
      {"id": "D1", "title": "Lesson · 6.1 A Pythagoras and similar triangles", "sub": "Wed 17 Feb · ex 1, 2, 6, 7, 8, 9, 10", "date": "2027-02-17", "gens": [["6.1", "hypotenuse"], ["6.1", "leg"], ["6.1", "isRight"]], "xg": [["6.1", "ladderWall"]]},
      {"id": "D2", "title": "Lesson · 6.1 B Pythagoras and similar triangles", "sub": "Thu 18 Feb · ex 11, 12, 13, 15, 16, 17, 18", "date": "2027-02-18", "gens": [["6.1", "hypotenuse"], ["6.1", "leg"], ["6.1", "isRight"]], "xg": [["6.1", "ladderWall"]]},
      {"id": "D3", "title": "Lesson · 6.2 A Special triangles and ratios", "sub": "Fri 19 Feb · ex 24, 25, 26, 27, 28, 29", "date": "2027-02-19", "gens": [["6.2", "tri3060"], ["6.2", "tri4545"], ["6.2", "nameRatio"]], "xg": [["6.2", "hexagonArea"]]},
      {"id": "D4", "title": "Lesson · 6.2 B Special triangles and ratios", "sub": "Wed 3 Mar · ex 30, 31, 32, 33, 34", "date": "2027-03-03", "gens": [["6.2", "tri4545"], ["6.2", "nameRatio"], ["6.2", "exactRatio"]], "xg": [["6.2", "hexagonArea"]]},
      {"id": "D5", "title": "Lesson · 6.3 A Calculating sides and angles", "sub": "Thu 4 Mar · ex 41, 42, 43, 44, 45, 46, 47", "date": "2027-03-04", "gens": [["6.3", "trigValue"], ["6.3", "whichRatio"], ["6.3", "sideMultiply"]], "xg": [["6.3", "treeHeight"], ["6.3", "rhombusAngle"]]},
      {"id": "D6", "title": "Lesson · 6.3 B Calculating sides and angles", "sub": "Fri 5 Mar · ex 48, 49, 50, 51, 52, 53, 54", "date": "2027-03-05", "gens": [["6.3", "sideMultiply"], ["6.3", "sideDivide"], ["6.3", "findAngle"]], "xg": [["6.3", "treeHeight"], ["6.3", "rhombusAngle"]]},
      {"id": "D7", "title": "Lesson · 6.4 Applications", "sub": "Thu 11 Mar · ex 59, 60, 61, 62, 63, 64", "date": "2027-03-11", "gens": [["6.4", "slopePercent"], ["6.4", "inclinationFromPercent"], ["6.4", "percentFromAngle"]], "xg": [["6.4", "runFromSlope"], ["6.4", "isoscelesSide"]]},
      {"id": "D8", "title": "Test prep · chapters 5 & 6", "sub": "Fri 12 Mar", "date": "2027-03-12", "gens": [["6.1", "hypotenuse"], ["6.1", "leg"], ["6.1", "isRight"], ["6.1", "similarRight"], ["6.2", "tri3060"], ["6.2", "tri4545"], ["6.2", "nameRatio"], ["6.2", "exactRatio"], ["6.2", "tanSide"], ["6.3", "trigValue"], ["6.3", "whichRatio"], ["6.3", "sideMultiply"], ["6.3", "sideDivide"], ["6.3", "findAngle"], ["6.3", "otherAngle"], ["6.4", "slopePercent"], ["6.4", "inclinationFromPercent"], ["6.4", "percentFromAngle"], ["6.4", "ladderAngle"], ["6.4", "walkUp"]], "xg": [["6.1", "ladderWall"], ["6.2", "hexagonArea"], ["6.3", "treeHeight"], ["6.3", "rhombusAngle"], ["6.4", "runFromSlope"], ["6.4", "isoscelesSide"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: [...new Set(o.gens.map(g => g[0]))].reduce((a, s) => a.concat((XG[s] || []).map(f => [s, f.name])), []) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-3ht-ch6-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['nameRatio', 'whichRatio', 'trigValue', 'otherAngle'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
