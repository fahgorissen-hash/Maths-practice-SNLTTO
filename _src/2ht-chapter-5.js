const { ri, pick, shuffle, gcd, M, fr, sqrtSplit } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const must = (a, b) => { if (Math.abs(a - b) > 1e-6) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const rd = (x, d) => Math.round(x * Math.pow(10, d) + 1e-9) / Math.pow(10, d);
const sp = n => { const s = String(n), m = s.split('.'); m[0] = m[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return m.join('.'); };   // 10816 -> 10 816
const sq = x => sp(rd(x * x, 6));
const s2 = v => (typeof v === 'string' ? v : sp(v)) + '²';                    // "6²" or "√13" squared shown as (√13)²
const RT = n => '√' + sp(n);
const isSq = n => Number.isInteger(Math.sqrt(n));
/* exact form of √n: "10", "√74" or "6√2" */
function rootForm(n) { if (isSq(n)) return String(Math.sqrt(n)); const [o, r] = sqrtSplit(n); return o === 1 ? '√' + n : o + '√' + r; }
/* rounded numeric answer: tolerance half a unit in the last place, answer shown with a decimal point */
const RW = ['to a whole number', 'to 1 decimal place', 'to 2 decimal places'];
function nr(html, exact, d, hint, steps, extra) { const a = rd(exact, d); return nu(html, a, hint, steps, Object.assign({ tol: .51 * Math.pow(10, -d), ansText: sp(a), needStep: true }, extra || {})); }
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [15, 20, 25], [10, 24, 26], [20, 21, 29], [9, 40, 41], [12, 35, 37], [18, 24, 30], [16, 30, 34], [11, 60, 61], [28, 45, 53]];
const tripleL = l => pick(TRIPLES.slice(0, l === 0 ? 6 : l === 1 ? 11 : TRIPLES.length));
const LETTERS = ['ABC', 'DEF', 'KLM', 'PQR', 'STU', 'XYZ', 'GHI'];
const unitOf = () => pick(['cm', 'cm', 'm', 'mm', 'dm']);
const HINT_HYP = 'The hypotenuse is the longest side, opposite the right angle. Square the two shorter sides, add, then take the square root.';
const HINT_LEG = 'You know the hypotenuse, so you SUBTRACT: (hypotenuse)² − (other side)². Then take the square root.';
const HINT_TYPE = ' You can type your working as one calculation, for example sqrt(8^2+6^2).';
/* worked solution in the book's layout: a² + b² = c², names, numbers, squares, ... */
function hypWork(nA, nB, nC, a, b, d) {          // find nC from legs a, b (numbers or root strings)
  const A2 = typeof a === 'string' ? +a.slice(1) : a * a, B2 = typeof b === 'string' ? +b.slice(1) : b * b, C2 = rd(A2 + B2, 6);
  const show = v => typeof v === 'string' ? '(' + v + ')²' : s2(v);
  let s = 'a² + b² = c²<br>' + nA + '² + ' + nB + '² = ' + nC + '²<br>' + show(a) + ' + ' + show(b) + ' = ' + nC + '²<br>' + sp(rd(A2, 6)) + ' + ' + sp(rd(B2, 6)) + ' = ' + nC + '²<br>' + nC + '² = ' + sp(C2) + '<br>' + nC + ' = ' + RT(C2);
  if (isSq(C2)) s += ' = ' + Math.sqrt(C2); else if (d !== undefined) s += ' ≈ ' + sp(rd(Math.sqrt(C2), d)); else if (rootForm(C2) !== '√' + C2) s += ' = ' + RT(sqrtSplit(C2)[0] ** 2) + ' · ' + RT(sqrtSplit(C2)[1]) + ' = ' + rootForm(C2);
  return s;
}
function legWork(nA, nB, nC, a, c, d) {          // find nB from leg a and hypotenuse c
  const A2 = typeof a === 'string' ? +a.slice(1) : a * a, C2 = typeof c === 'string' ? +c.slice(1) : c * c, B2 = rd(C2 - A2, 6);
  const show = v => typeof v === 'string' ? '(' + v + ')²' : s2(v);
  let s = 'a² + b² = c²<br>' + nA + '² + ' + nB + '² = ' + nC + '²<br>' + show(a) + ' + ' + nB + '² = ' + show(c) + '<br>' + sp(rd(A2, 6)) + ' + ' + nB + '² = ' + sp(rd(C2, 6)) + '<br>' + nB + '² = ' + sp(rd(C2, 6)) + ' − ' + sp(rd(A2, 6)) + ' = ' + sp(B2) + '<br>' + nB + ' = ' + RT(B2);
  if (isSq(B2)) s += ' = ' + Math.sqrt(B2); else if (d !== undefined) s += ' ≈ ' + sp(rd(Math.sqrt(B2), d)); else if (rootForm(B2) !== '√' + B2) s += ' = ' + rootForm(B2);
  return s;
}

/* ---------- SVG helpers ---------- */
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
  ks.forEach(k => { if (o.noLabel && o.noLabel.includes(k)) return; const dx = X(k) - cx, dy = Y(k) - cy, L = Math.hypot(dx, dy) || 1; b += lab(k, X(k) + dx / L * 14, Y(k) + dy / L * 14 + 5, 14, 'middle', true, '#1b5fa8'); });
  return svg(rd(w, 1), rd(h, 1), b);
}
/* right-angled triangle with legs a (horizontal) and b (vertical) drawn to scale, rotated by rot degrees.
   names [right-angle vertex, end of a, end of b]; lab: labels for [leg a, leg b, hypotenuse] */
function rightTri(names, a, b, lab3, rot, flip) {
  const ra = Math.max(.45, Math.min(2.2, a / b)), A = [0, 0], B = [ra * (flip ? -1 : 1), 0], C = [0, 1];
  const t = (rot || 0) * Math.PI / 180, R = q => [q[0] * Math.cos(t) - q[1] * Math.sin(t), q[0] * Math.sin(t) + q[1] * Math.cos(t)];
  const P = {}; P[names[0]] = R(A); P[names[1]] = R(B); P[names[2]] = R(C);
  return flatFig(P, { poly: names.split ? names.split('') : names, right: [[names[0], names[1], names[2]]], sides: [[names[0], names[1], lab3[0]], [names[0], names[2], lab3[1]], [names[1], names[2], lab3[2]]], W: 280, H: 200 });
}
const ROTS = l => l === 0 ? pick([0, 0, 180]) : pick([0, 90, 180, 270, 25, 160, 210, 300]);
/* cuboid ABCD.EFGH in oblique projection; L along AB, Wd along BC (depth), Hh height; o.diag: list of [U,V] to draw dashed red */
function cuboidFig(L, Wd, Hh, o) {
  o = o || {}; const s = 150 / Math.max(L, Wd * .6, Hh), dx = Wd * s * .55, dy = Wd * s * .4, l = L * s, h = Hh * s, ox = 30, oy = 40 + h + dy;
  const P = { A: [ox, oy], B: [ox + l, oy], C: [ox + l + dx, oy - dy], D: [ox + dx, oy - dy] };
  ['A', 'B', 'C', 'D'].forEach((k, i) => { P['EFGH'[i]] = [P[k][0], P[k][1] - h]; });
  const ln = (u, v, dash, col, w) => '<line x1="' + rd(P[u][0], 1) + '" y1="' + rd(P[u][1], 1) + '" x2="' + rd(P[v][0], 1) + '" y2="' + rd(P[v][1], 1) + '" stroke="' + (col || '#1b5fa8') + '" stroke-width="' + (w || 2) + '"' + (dash ? ' stroke-dasharray="5 4"' : '') + '/>';
  let b = '';
  [['A', 'B'], ['B', 'C'], ['A', 'E'], ['B', 'F'], ['C', 'G'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E']].forEach(e => { b += ln(e[0], e[1]); });
  [['A', 'D'], ['D', 'C'], ['D', 'H']].forEach(e => { b += ln(e[0], e[1], true, '#7d8fa3', 1.4); });
  (o.diag || []).forEach(d => { b += ln(d[0], d[1], true, '#d1471f', 2.4); });
  const W = ox + l + dx + 40, H = oy + 30;
  const C0 = [(P.A[0] + P.G[0]) / 2, (P.A[1] + P.G[1]) / 2];
  Object.keys(P).forEach(k => { const vx = P[k][0] - C0[0], vy = P[k][1] - C0[1], Lh = Math.hypot(vx, vy) || 1; b += lab(k, P[k][0] + vx / Lh * 13, P[k][1] + vy / Lh * 13 + 5, 13, 'middle', true, '#1b5fa8'); });
  if (o.labL) b += lab(o.labL, (P.A[0] + P.B[0]) / 2, P.A[1] + 20, 13, 'middle', true);
  if (o.labW) b += lab(o.labW, (P.B[0] + P.C[0]) / 2 + 16, (P.B[1] + P.C[1]) / 2 + 10, 13, 'start', true);
  if (o.labH) b += lab(o.labH, P.C[0] + 8, (P.C[1] + P.G[1]) / 2 + 4, 13, 'start', true);
  return svg(rd(W + 20, 1), rd(H, 1), b);
}
/* square pyramid T.ABCD, base side a, height h. o.show: 'edge' | 'height' | 'apothem' */
function pyramidFig(o) {
  const l = 150, dx = 60, dy = 42, h = 130, ox = 30, oy = 40 + h + dy;
  const P = { A: [ox, oy], B: [ox + l, oy], C: [ox + l + dx, oy - dy], D: [ox + dx, oy - dy] };
  const M = [(P.A[0] + P.C[0]) / 2, (P.A[1] + P.C[1]) / 2]; P.M = M; P.T = [M[0], M[1] - h]; P.N = [(P.B[0] + P.C[0]) / 2, (P.B[1] + P.C[1]) / 2];
  const ln = (u, v, dash, col, w) => '<line x1="' + rd(P[u][0], 1) + '" y1="' + rd(P[u][1], 1) + '" x2="' + rd(P[v][0], 1) + '" y2="' + rd(P[v][1], 1) + '" stroke="' + (col || '#1b5fa8') + '" stroke-width="' + (w || 2) + '"' + (dash ? ' stroke-dasharray="5 4"' : '') + '/>';
  let b = ln('A', 'B') + ln('B', 'C') + ln('A', 'T') + ln('B', 'T') + ln('C', 'T') + ln('A', 'D', 1, '#7d8fa3', 1.4) + ln('D', 'C', 1, '#7d8fa3', 1.4) + ln('D', 'T', 1, '#7d8fa3', 1.4);
  b += ln('T', 'M', 1, '#d1471f', 2.2);
  if (o.show === 'edge' || o.show === 'height') b += ln('A', 'M', 1, '#d1471f', 2.2);
  if (o.show === 'apothem') b += ln('M', 'N', 1, '#d1471f', 2.2) + ln('T', 'N', 1, '#d1471f', 2.2);
  const names = ['A', 'B', 'C', 'D', 'T'].concat(o.show === 'apothem' ? ['N'] : []).concat(['M']);
  names.forEach(k => { const off = { A: [-10, 14], B: [8, 16], C: [12, 4], D: [-12, -4], T: [0, -10], M: [-12, 14], N: [12, 14] }[k]; b += lab(k, P[k][0] + off[0], P[k][1] + off[1], 13, 'middle', true, '#1b5fa8'); });
  if (o.labA) b += lab(o.labA, (P.A[0] + P.B[0]) / 2, P.A[1] + 20, 13, 'middle', true);
  if (o.labE) b += lab(o.labE, (P.B[0] + P.T[0]) / 2 + 14, (P.B[1] + P.T[1]) / 2, 13, 'start', true);
  if (o.labH) b += lab(o.labH, P.T[0] - 8, (P.T[1] + P.M[1]) / 2 + 10, 13, 'end', true);
  return svg(l + dx + 70, oy + 30, b);
}

/* ======================= 5.1 Pythagoras' theorem ======================= */
G['5.1'] = [
  function hypName(l) {
    const nm = pick(LETTERS), rot = ROTS(l), k = ri(0, 2), names = nm.slice(k) + nm.slice(0, k);   // names[0] has the right angle
    const hyp = [names[1], names[2]].sort().join(''), legs = [[names[0], names[1]].sort().join(''), [names[0], names[2]].sort().join('')];
    return ch(p('In triangle ' + nm + ' angle <b>' + names[0] + '</b> is a right angle. Which side is the <b>hypotenuse</b>?') + rightTri(names, ri(3, 8), ri(3, 8), ['', '', ''], rot, Math.random() < .5),
      hyp, legs.concat(l === 0 ? [] : []), 'The hypotenuse is the side opposite the right angle. It does not touch the right angle.', 'Angle ' + names[0] + ' is the right angle. The side that does not touch ' + names[0] + ' is ' + hyp + '. So ' + hyp + ' is the hypotenuse; ' + legs.join(' and ') + ' are the other two sides (the catheti).');
  },
  function writeFormula(l) {
    const nm = pick(LETTERS), k = ri(0, 2), n = nm.slice(k) + nm.slice(0, k), sd = (a, b) => [a, b].sort().join('');
    const hyp = sd(n[1], n[2]), a = sd(n[0], n[1]), b = sd(n[0], n[2]);
    const right = a + '² + ' + b + '² = ' + hyp + '²';
    return ch(p('In triangle ' + nm + ' angle <b>' + n[0] + '</b> is 90°. Which formula is correct?') + (l === 0 ? rightTri(n, 5, 4, ['', '', ''], 0) : ''), right,
      [a + '² + ' + hyp + '² = ' + b + '²', hyp + '² + ' + b + '² = ' + a + '²', a + ' + ' + b + ' = ' + hyp], 'In a² + b² = c², c is the hypotenuse: the side opposite the right angle.', 'The hypotenuse is ' + hyp + ' (opposite angle ' + n[0] + '). So ' + right + '.');
  },
  function squaresArea(l) {
    const t = tripleL(l), find = l === 0 ? 2 : ri(0, 2), A = [t[0] ** 2, t[1] ** 2, t[2] ** 2], u = 'cm²';
    const nm = ['the square on the first short side', 'the square on the second short side', 'the square on the hypotenuse'];
    const known = [0, 1, 2].filter(i => i !== find).map(i => nm[i] + ' is <b>' + A[i] + ' ' + u + '</b>').join(' and ');
    const ans = A[find];
    must(A[0] + A[1], A[2]);
    const st2 = find === 2 ? A[0] + ' + ' + A[1] + ' = ' + ans : A[2] + ' − ' + A[1 - find] + ' = ' + ans;
    return nu(p('Squares are drawn on the three sides of a right-angled triangle. The area of ' + known + '. What is the area of ' + nm[find] + ' (in ' + u + ')?'), ans, 'Pythagoras: the two small squares together have the same area as the big square on the hypotenuse.', 'area small square + area small square = area big square.<br>' + st2 + ' ' + u + '.', { noStep: true });
  },
  function hypInt(l) {
    const t = tripleL(l), nm = pick(LETTERS), u = unitOf(), n = nm, sd = (a, b) => [a, b].sort().join(''), m = l === 2 ? pick([1, 2, 3]) : 1;
    const a = t[0] * m, b = t[1] * m, c = t[2] * m, hyp = sd(n[1], n[2]), A = sd(n[0], n[1]), B = sd(n[0], n[2]);
    return nu(p('Triangle ' + nm + ' has a right angle at <b>' + n[0] + '</b>. ' + A + ' = ' + a + ' ' + u + ' and ' + B + ' = ' + b + ' ' + u + '. Calculate the length of <b>' + hyp + '</b> (in ' + u + ').') + rightTri(n, a, b, [a + ' ' + u, b + ' ' + u, '?'], ROTS(l)), c, HINT_HYP + HINT_TYPE, hypWork(A, B, hyp, a, b), { needStep: true });
  },
  function tiltedSquare(l) {
    const a = LR(l, 1, 4), b = LR(l, 2, 5), n = a + b, area = a * a + b * b;
    const pts = [[a, 0], [n, a], [b, n], [0, b]];
    const fig = gridBox({ xmin: 0, xmax: n, ymin: 0, ymax: n, noAxes: true, u: 26, polys: [{ pts, fill: 'rgba(209,71,31,.25)', stroke: '#d1471f' }] }, 40 + 26 * n);
    if (l >= 2) {   // spicy: the perimeter, via the length of one side
      const side = Math.sqrt(area);
      return nr(p('A tilted square is drawn on grid paper (each box is 1 by 1). Calculate the <b>perimeter</b> of the tilted square, rounded <b>to 1 decimal place</b>.') + fig, 4 * side, 1, 'Use Pythagoras for one side: it is the long side of a right-angled triangle with sides ' + a + ' and ' + b + '. Round only at the end.' + HINT_TYPE, 'side² = ' + a + '² + ' + b + '² = ' + a * a + ' + ' + b * b + ' = ' + area + '<br>side = √' + area + ' ≈ ' + rd(side, 3) + '<br>perimeter = 4 · √' + area + ' ≈ ' + sp(rd(4 * side, 1)));
    }
    return nu(p('A tilted square is drawn on grid paper (each box is 1 by 1). What is the <b>area</b> of the tilted square?') + fig, area, 'Draw the box around it (' + n + ' by ' + n + '). Subtract the four right-angled triangles in the corners. Or use Pythagoras for one side.', 'Box: ' + n + ' · ' + n + ' = ' + n * n + '.<br>Each corner triangle: ½ · ' + a + ' · ' + b + ' = ' + (a * b / 2) + '.<br>Area = ' + n * n + ' − 4 · ' + (a * b / 2) + ' = ' + area + '.<br>(Check: side² = ' + a + '² + ' + b + '² = ' + area + '.)', { needStep: true });
  }
];
XG['5.1'] = [
  function tripleScale(l) {
    const t = pick(TRIPLES.slice(0, 4)), k = pick([3, 4, 5, 7, 10]), knots = (t[0] + t[1] + t[2]) * k;
    return nu(p('A rope has <b>' + knots + '</b> knots at equal distances (a closed loop). You want to make a right-angled triangle with sides in the ratio ' + t.join(' : ') + '. How many intervals long is the <b>longest</b> side?'), t[2] * k, 'Add the parts of the ratio. How many intervals is one part?', t.join(' + ') + ' = ' + (t[0] + t[1] + t[2]) + ' parts.<br>' + knots + ' : ' + (t[0] + t[1] + t[2]) + ' = ' + k + ' intervals per part.<br>Longest side = ' + t[2] + ' · ' + k + ' = ' + t[2] * k + ' intervals.', { needStep: true });
  },
  function tiltedSide(l) {
    const a = ri(1, 4), b = ri(2, 5), n = a + b, area = a * a + b * b;
    const fig = gridBox({ xmin: 0, xmax: n, ymin: 0, ymax: n, noAxes: true, u: 26, polys: [{ pts: [[a, 0], [n, a], [b, n], [0, b]], fill: 'rgba(209,71,31,.25)', stroke: '#d1471f' }] }, 40 + 26 * n);
    return ex(p('Each box is 1 by 1. Give the <b>exact</b> length of one side of the tilted square (use √ if needed).') + fig, rootForm(area), 'root', 'One side is the hypotenuse of a right-angled triangle with sides ' + a + ' and ' + b + '.', 'side² = ' + a + '² + ' + b + '² = ' + a * a + ' + ' + b * b + ' = ' + area + '<br>side = ' + RT(area) + (rootForm(area) !== '√' + area ? ' = ' + rootForm(area) : ''), { keys: ['√', '(', ')', '^'] });
  }
];

/* ======================= 5.2 Calculating sides ======================= */
function sideQ(l, mode, exact) {
  // mode 'hyp' | 'leg'; exact: answer as root form, else rounded
  const nm = pick(LETTERS), n = nm, sd = (a, b) => [a, b].sort().join(''), u = unitOf(), d = l === 2 ? pick([1, 2]) : 1;
  const hyp = sd(n[1], n[2]), A = sd(n[0], n[1]), B = sd(n[0], n[2]);
  let a, b, c;
  if (mode === 'hyp') { do { a = LR(l, 2, 14); b = LR(l, 2, 14); } while (isSq(a * a + b * b) && !exact); c = Math.sqrt(a * a + b * b); }
  else { do { c = LR(l, 5, 20); a = ri(2, c - 1); } while (isSq(c * c - a * a) && !exact); b = Math.sqrt(c * c - a * a); }
  if (l === 2 && !exact && Math.random() < .5) { a = rd(a + pick([.5, .2, .4]), 1); if (mode === 'hyp') { b = rd(b + .5, 1); c = Math.sqrt(a * a + b * b); } else { if (a >= c) a = rd(c - 1.5, 1); b = Math.sqrt(c * c - a * a); } }
  const fig = mode === 'hyp' ? rightTri(n, a, b, [sp(a) + ' ' + u, sp(b) + ' ' + u, '?'], ROTS(l)) : rightTri(n, a, b, [sp(a) + ' ' + u, '?', sp(c) + ' ' + u], ROTS(l));
  const ask = mode === 'hyp' ? hyp : B, given = mode === 'hyp' ? A + ' = ' + sp(a) + ' ' + u + ' and ' + B + ' = ' + sp(b) + ' ' + u : A + ' = ' + sp(a) + ' ' + u + ' and ' + hyp + ' = ' + sp(c) + ' ' + u;
  const qtxt = 'Triangle ' + nm + ' has a right angle at <b>' + n[0] + '</b>. ' + given + '. Calculate <b>' + ask + '</b>' + (exact ? ' <b>exactly</b> (use √ and simplify if possible).' : ', rounded <b>' + RW[d] + '</b> (in ' + u + ').');
  if (exact) {
    const v = mode === 'hyp' ? a * a + b * b : c * c - a * a, ans = rootForm(v);
    return ex(p(qtxt) + fig, ans, 'root', (mode === 'hyp' ? HINT_HYP : HINT_LEG) + ' Write √' + v + ' as simple as possible: look for a square factor (4, 9, 16, 25, ...).', mode === 'hyp' ? hypWork(A, B, hyp, a, b) : legWork(A, B, hyp, a, c), { keys: ['√', '(', ')', '^'] });
  }
  return nr(p(qtxt) + fig, mode === 'hyp' ? c : b, d, (mode === 'hyp' ? HINT_HYP : HINT_LEG) + HINT_TYPE, mode === 'hyp' ? hypWork(A, B, hyp, a, b, d) : legWork(A, B, hyp, a, c, d));
}
G['5.2'] = [
  function findHyp(l) { return sideQ(l, 'hyp', false); },
  function findLeg(l) { return sideQ(l, 'leg', false); },
  function legInt(l) {
    const t = tripleL(l), nm = pick(LETTERS), n = nm, sd = (a, b) => [a, b].sort().join(''), u = unitOf(), sw = Math.random() < .5;
    const a = sw ? t[1] : t[0], b = sw ? t[0] : t[1], c = t[2], hyp = sd(n[1], n[2]), A = sd(n[0], n[1]), B = sd(n[0], n[2]);
    return nu(p('Triangle ' + nm + ': angle ' + n[0] + ' = 90°, ' + A + ' = ' + a + ' ' + u + ' and ' + hyp + ' = ' + c + ' ' + u + '. Calculate <b>' + B + '</b>.') + rightTri(n, a, b, [a + ' ' + u, '?', c + ' ' + u], ROTS(l)), b, HINT_LEG + HINT_TYPE.replace('sqrt(8^2+6^2)', 'sqrt(13^2-5^2)'), legWork(A, B, hyp, a, c), { needStep: true });
  },
  function exactSide(l) { return sideQ(Math.max(l, 1), pick(['hyp', 'leg']), true); },
  function rootSides(l) {
    // sides given as roots, like the book: KM² + 5² = (5√3)² etc. Keep the numbers small.
    const nm = pick(LETTERS), n = nm, sd = (a, b) => [a, b].sort().join(''), hyp = sd(n[1], n[2]), A = sd(n[0], n[1]), B = sd(n[0], n[2]);
    const a2 = pick([3, 5, 7, 8, 10, 11, 12, 13, 18, 20]), b2 = ri(2, 30), legMode = l > 0 && Math.random() < .6;
    if (!legMode) { const v = a2 + b2, ans = rootForm(v), a = RT(a2), b = isSq(b2) ? Math.sqrt(b2) : RT(b2);
      return ex(p('Triangle ' + nm + ': angle ' + n[0] + ' = 90°, ' + A + ' = ' + M(a) + ' and ' + B + ' = ' + M(String(b)) + '. Calculate <b>' + hyp + '</b> exactly.'), ans, 'root', 'Remember (√' + a2 + ')² = ' + a2 + '. ' + HINT_HYP, hypWork(A, B, hyp, a, b), { needStep: true, keys: ['√', '(', ')', '^'] }); }
    const c2 = a2 + b2 + ri(1, 25), v = c2 - a2, ans = rootForm(v);
    return ex(p('Triangle ' + nm + ': angle ' + n[0] + ' = 90°, ' + A + ' = ' + M(RT(a2)) + ' and ' + hyp + ' = ' + M(RT(c2)) + '. Calculate <b>' + B + '</b> exactly.'), ans, 'root', 'Remember (√' + a2 + ')² = ' + a2 + '. ' + HINT_LEG, legWork(A, B, hyp, RT(a2), RT(c2)), { needStep: true, keys: ['√', '(', ')', '^'] });
  },
  function gridDistance(l) {
    let x1, y1, x2, y2; do { x1 = ri(-4, 3); y1 = ri(-4, 3); x2 = x1 + ri(1, 6) * pick([1, -1]); y2 = y1 + ri(1, 6) * pick([1, -1]); } while (Math.abs(x2) > 6 || Math.abs(y2) > 6 || (l === 0 && !isSq((x2 - x1) ** 2 + (y2 - y1) ** 2) && Math.random() < .6));
    if (l >= 2) {   // spicy: larger coordinates and no picture
      x1 = ri(-15, 10); y1 = ri(-15, 10); x2 = x1 + ri(4, 18) * pick([1, -1]); y2 = y1 + ri(4, 18) * pick([1, -1]);
      const ex = Math.abs(x2 - x1), ey = Math.abs(y2 - y1), w = ex * ex + ey * ey, m = n => n < 0 ? '(' + n + ')' : n;
      return nr(p('A = (' + x1 + ', ' + y1 + ') and B = (' + x2 + ', ' + y2 + '). Calculate the length of line segment AB' + (isSq(w) ? '.' : ', rounded <b>to 1 decimal place</b>.') + ' <small>(There is no picture: make a sketch.)</small>'), Math.sqrt(w), isSq(w) ? 0 : 1, 'Horizontal difference: subtract the x-coordinates. Vertical difference: subtract the y-coordinates. Then use Pythagoras.' + HINT_TYPE, 'Horizontal: ' + Math.max(x1, x2) + ' − ' + m(Math.min(x1, x2)) + ' = ' + ex + '. Vertical: ' + Math.max(y1, y2) + ' − ' + m(Math.min(y1, y2)) + ' = ' + ey + '.<br>AB² = ' + ex + '² + ' + ey + '² = ' + ex * ex + ' + ' + ey * ey + ' = ' + w + '<br>AB = √' + w + (isSq(w) ? ' = ' + Math.sqrt(w) : ' ≈ ' + rd(Math.sqrt(w), 1)));
    }
    const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1), v = dx * dx + dy * dy;
    const fig = gridBox({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, u: 18, pts: [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }], segs: [{ a: [x1, y1], b: [x2, y2], color: '#d1471f' }, { a: [x1, y1], b: [x2, y1], dash: 1, color: '#7d8fa3', w: 1.6 }, { a: [x2, y1], b: [x2, y2], dash: 1, color: '#7d8fa3', w: 1.6 }] }, 300);
    const st = 'Horizontal: ' + Math.max(x1, x2) + ' − ' + (Math.min(x1, x2) < 0 ? '(' + Math.min(x1, x2) + ')' : Math.min(x1, x2)) + ' = ' + dx + '. Vertical: ' + Math.max(y1, y2) + ' − ' + (Math.min(y1, y2) < 0 ? '(' + Math.min(y1, y2) + ')' : Math.min(y1, y2)) + ' = ' + dy + '.<br>AB² = ' + dx + '² + ' + dy + '² = ' + dx * dx + ' + ' + dy * dy + ' = ' + v + '<br>AB = √' + v + (isSq(v) ? ' = ' + Math.sqrt(v) : ' ≈ ' + rd(Math.sqrt(v), 1));
    const q = p('A = (' + x1 + ', ' + y1 + ') and B = (' + x2 + ', ' + y2 + '). Calculate the length of line segment AB' + (isSq(v) ? '.' : ', rounded <b>to 1 decimal place</b>.')) + fig;
    return nr(q, Math.sqrt(v), isSq(v) ? 0 : 1, 'Make a right-angled triangle with a horizontal and a vertical side. Count how long they are, then use Pythagoras.' + HINT_TYPE, st);
  }
];
XG['5.2'] = [
  function areaThenHyp(l) {
    const t = tripleL(2), m = pick([1, 2]), a = t[0] * m, b = t[1] * m, c = t[2] * m, area = a * b / 2, nm = pick(LETTERS), n = nm, sd = (x, y) => [x, y].sort().join(''), hyp = sd(n[1], n[2]), A = sd(n[0], n[1]), B = sd(n[0], n[2]);
    return nu(p('Triangle ' + nm + ' has a right angle at ' + n[0] + '. ' + A + ' = ' + a + ' and the area of the triangle is <b>' + area + '</b>. Calculate <b>' + hyp + '</b>.'), c, 'First use the area: ½ · ' + A + ' · ' + B + ' = ' + area + '. Then use Pythagoras.', 'area = ½ · ' + A + ' · ' + B + '<br>' + area + ' = ½ · ' + a + ' · ' + B + ' = ' + (a / 2) + ' · ' + B + '<br>' + B + ' = ' + area + ' : ' + (a / 2) + ' = ' + b + '<br>' + hypWork(A, B, hyp, a, b), { needStep: true });
  },
  function twoTriangles(l) {
    // quadrilateral ABCD with right angles at B and D, diagonal AC shared (book ex. 31)
    let ad, cd, bc, ac2, ab2; do { ad = ri(4, 9); cd = ri(3, 8); bc = ri(2, 6); ac2 = ad * ad + cd * cd; ab2 = ac2 - bc * bc; } while (!isSq(ab2) || ab2 <= 0 || cd === bc || ad === bc);
    const ab = Math.sqrt(ab2), ang = Math.atan2(cd, ad);
    const P = { A: [0, 0], B: [ab, 0], C: [ab, bc] }; const t = Math.atan2(bc, ab) + Math.atan2(cd, ad); P.D = [ad * Math.cos(t), ad * Math.sin(t)];
    return nu(p('In quadrilateral ABCD the angles B and D are right angles. AD = ' + ad + ', CD = ' + cd + ' and BC = ' + bc + '. Calculate <b>AB</b>.') + flatFig(P, { poly: ['A', 'B', 'C', 'D'], dash: [['A', 'C']], right: [['B', 'A', 'C'], ['D', 'A', 'C']], sides: [['A', 'D', String(ad)], ['C', 'D', String(cd)], ['B', 'C', String(bc)], ['A', 'B', '?']] }), ab, 'Draw diagonal AC. It is the hypotenuse of both triangles. First calculate AC² in triangle ACD.', hypWork('AD', 'CD', 'AC', ad, cd).replace(/AC = √\d+.*$/, 'AC = √' + ac2) + '<br><br>' + legWork('BC', 'AB', 'AC', bc, RT(ac2)), { needStep: true });
  }
];

/* ---------- 5.2 continued: auxiliary lines ---------- */
G['5.2'] = G['5.2'].concat([
  function isoHeight(l) {
    let half, leg; do { half = LR(l, 2, 10); leg = half + LR(l, 1, 8); } while (l === 0 && !isSq(leg * leg - half * half) && Math.random() < .7);
    const base = 2 * half, h2 = leg * leg - half * half, d = isSq(h2) ? 0 : 1, u = pick(['cm', 'm']), area = l === 2;
    const P = { K: [0, 0], L: [base, 0], M: [half, Math.sqrt(h2)], N: [half, 0] };
    const fig = flatFig(P, { poly: ['K', 'L', 'M'], dash: [['M', 'N']], right: [['N', 'L', 'M']], ticks: [['K', 'M'], ['L', 'M']], sides: [['K', 'L', base + ' ' + u, 32], ['L', 'M', leg + ' ' + u]] });
    const st = 'Height MN divides base KL into two equal parts: KN = NL = ' + base + ' : 2 = ' + half + '.<br>' + legWork('NL', 'MN', 'LM', half, leg, d);
    if (area) { const h = Math.sqrt(h2), A = half * h; return nr(p('Triangle KLM is isosceles with KM = LM = ' + leg + ' ' + u + ' and base KL = ' + base + ' ' + u + '. Calculate the <b>area</b> of the triangle, rounded <b>to 1 decimal place</b> (in ' + u + '²).') + fig, A, 1, 'Draw the height from M. It cuts the base in half. Use Pythagoras for the height, then area = ½ · base · height.', st.replace(/MN = √(\d+)( ≈ [\d.]+)?$/, 'MN = √$1') + '<br>area = ½ · ' + base + ' · √' + h2 + ' ≈ ' + sp(rd(A, 1)) + ' ' + u + '²'); }
    return nr(p('Triangle KLM is isosceles with KM = LM = ' + leg + ' ' + u + ' and base KL = ' + base + ' ' + u + '. Calculate the <b>height</b> MN' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + fig, Math.sqrt(h2), d, 'The height from M cuts the base in two equal parts. Use the right-angled triangle MNL.' + HINT_TYPE.replace('sqrt(8^2+6^2)', 'sqrt(' + leg + '^2-' + half + '^2)'), st);
  },
  function trapSide(l) {
    // right trapezium ABCD: AB bottom, DC top, AD vertical; find BC
    const hgt = LR(l, 3, 12), top = LR(l, 3, 12), ext = LR(l, 2, 9), bot = top + ext, u = 'cm', v = hgt * hgt + ext * ext, d = isSq(v) ? 0 : 1, per = l === 2;
    const P = { A: [0, 0], B: [bot, 0], C: [top, hgt], D: [0, hgt], E: [top, 0] };
    const fig = flatFig(P, { poly: ['A', 'B', 'C', 'D'], dash: [['C', 'E']], right: [['A', 'B', 'D'], ['D', 'A', 'C'], ['E', 'B', 'C']], sides: [['A', 'B', bot + ' ' + u, 32], ['D', 'C', top + ' ' + u], ['A', 'D', hgt + ' ' + u]], noLabel: [] });
    const st = 'Draw auxiliary line CE perpendicular to AB. CE = AD = ' + hgt + ' and EB = ' + bot + ' − ' + top + ' = ' + ext + '.<br>' + hypWork('EB', 'CE', 'BC', ext, hgt, d);
    if (per) { const pe = bot + top + hgt + Math.sqrt(v); return nr(p('ABCD is a trapezium with right angles at A and D. AB = ' + bot + ' cm, DC = ' + top + ' cm and AD = ' + hgt + ' cm. Calculate the <b>perimeter</b> of ABCD' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + fig, pe, d, 'First find BC with an auxiliary line from C, perpendicular to AB.', st + '<br>perimeter = ' + bot + ' + ' + top + ' + ' + hgt + ' + ' + (d ? 'BC ≈ ' : '') + sp(rd(pe, d)) + ' cm'); }
    return nr(p('ABCD is a trapezium with right angles at A and D. AB = ' + bot + ' cm, DC = ' + top + ' cm and AD = ' + hgt + ' cm. Calculate <b>BC</b>' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + fig, Math.sqrt(v), d, 'Draw an auxiliary line from C perpendicular to AB. You get a rectangle and a right-angled triangle.', st);
  },
  function rectDiag(l) {
    let a, b; do { a = LR(l, 3, 20); b = LR(l, 2, 15); } while (a === b);
    const v = a * a + b * b, d = isSq(v) ? 0 : 1, u = pick(['cm', 'm']), P = { A: [0, 0], B: [a, 0], C: [a, b], D: [0, b] };
    return nr(p('Rectangle ABCD has length AB = ' + a + ' ' + u + ' and width BC = ' + b + ' ' + u + '. Calculate the length of diagonal <b>AC</b>' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + flatFig(P, { poly: ['A', 'B', 'C', 'D'], dash: [['A', 'C']], right: [['B', 'A', 'C']], sides: [['A', 'B', a + ' ' + u], ['B', 'C', b + ' ' + u]] }), Math.sqrt(v), d, 'The diagonal cuts the rectangle into two right-angled triangles. AC is the hypotenuse.' + HINT_TYPE, hypWork('AB', 'BC', 'AC', a, b, d));
  },
  function equiHeight(l) {
    const s = LR(l, 2, 12) * 2, h2 = s * s - (s / 2) ** 2, d = 1;
    const P = { A: [0, 0], B: [s, 0], C: [s / 2, s * Math.sqrt(3) / 2], D: [s / 2, 0] };
    return nr(p('Triangle ABC is equilateral with sides of ' + s + ' cm. Calculate the height CD, rounded <b>to 1 decimal place</b>.') + flatFig(P, { poly: ['A', 'B', 'C'], dash: [['C', 'D']], right: [['D', 'B', 'C']], sides: [['A', 'B', s + ' cm', 32]], ticks: [['A', 'C'], ['B', 'C'], ['A', 'B']] }), Math.sqrt(h2), d, 'The height cuts the base in half: DB = ' + s / 2 + ' cm. CB is the hypotenuse.', 'DB = ' + s + ' : 2 = ' + s / 2 + '<br>' + legWork('DB', 'CD', 'BC', s / 2, s, d));
  },
  function rhombusSide(l) {
    const e = LR(l, 3, 12) * 2, f = LR(l, 2, 10) * 2, v = (e / 2) ** 2 + (f / 2) ** 2, d = isSq(v) ? 0 : 1, per = l > 0;
    const P = { A: [0, f / 2], B: [e / 2, 0], C: [e, f / 2], D: [e / 2, f], S: [e / 2, f / 2] };
    const fig = flatFig(P, { poly: ['A', 'B', 'C', 'D'], dash: [['A', 'C'], ['B', 'D']], right: [['S', 'C', 'D']], noLabel: [] });
    const st = 'The diagonals of a rhombus cut each other in half at right angles: AS = ' + e + ' : 2 = ' + e / 2 + ' and DS = ' + f + ' : 2 = ' + f / 2 + '.<br>' + hypWork('AS', 'DS', 'AD', e / 2, f / 2, d);
    if (per) return nr(p('Rhombus ABCD has diagonals AC = ' + e + ' cm and BD = ' + f + ' cm. Calculate the <b>perimeter</b> of the rhombus' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + fig, 4 * Math.sqrt(v), d, 'First calculate one side with half of each diagonal. A rhombus has 4 equal sides.', st + '<br>perimeter = 4 · ' + (d ? '√' + v : Math.sqrt(v)) + (d ? ' ≈ ' : ' = ') + sp(rd(4 * Math.sqrt(v), d)) + ' cm');
    return nr(p('Rhombus ABCD has diagonals AC = ' + e + ' cm and BD = ' + f + ' cm. They meet in S. Calculate side <b>AD</b>' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + fig, Math.sqrt(v), d, 'The diagonals cut each other in half at right angles. Use triangle ASD.', st);
  }
]);
XG['5.2'] = XG['5.2'].concat([
  function isoTrapArea(l) {
    // isosceles trapezium: parallel sides p<q, legs s; find height then area (book ex. 30)
    let a, q, s, x; do { a = ri(3, 10); x = ri(2, 6); q = a + 2 * x; s = x + ri(1, 5); } while (!isSq(s * s - x * x));
    const h = Math.sqrt(s * s - x * x), area = (a + q) / 2 * h;
    const P = { A: [0, 0], B: [q, 0], C: [x + a, h], D: [x, h], E: [x, 0] };
    return nu(p('ABCD is an isosceles trapezium. AB = ' + q + ', DC = ' + a + ' and AD = BC = ' + s + '. Calculate the <b>area</b>.') + flatFig(P, { poly: ['A', 'B', 'C', 'D'], dash: [['D', 'E']], right: [['E', 'B', 'D']], sides: [['A', 'B', String(q), 32], ['D', 'C', String(a)], ['A', 'D', String(s)], ['B', 'C', String(s)]] }), area, 'Draw the height DE. AE = (' + q + ' − ' + a + ') : 2. Then area = ½ · (sum of the parallel sides) · height.', 'AE = (' + q + ' − ' + a + ') : 2 = ' + x + '<br>' + legWork('AE', 'DE', 'AD', x, s) + '<br>area = ½ · (' + q + ' + ' + a + ') · ' + h + ' = ' + area, { needStep: true });
  },
  function kiteAux(l) {
    // quadrilateral ABCD: right angles at A and B, AD=4-ish; DE perpendicular to BC (book ex. 24)
    let ab, ad, ce, cd; do { ad = ri(2, 6); ce = ri(2, 7); ab = ri(4, 12); cd = Math.sqrt(ab * ab + ce * ce); } while (!Number.isInteger(cd));
    const P = { A: [0, 0], B: [ab, 0], C: [ab, ad + ce], D: [0, ad], E: [ab, ad] }, per = ab + ad + ce + ad + cd;
    return nu(p('In quadrilateral ABCD the angles A and B are right angles. AB = ' + ab + ', AD = ' + ad + ' and BC = ' + (ad + ce) + '. Calculate the <b>perimeter</b> of ABCD.') + flatFig(P, { poly: ['A', 'B', 'C', 'D'], dash: [['D', 'E']], right: [['A', 'B', 'D'], ['B', 'A', 'C'], ['E', 'D', 'C']], sides: [['A', 'B', String(ab)], ['A', 'D', String(ad)], ['B', 'C', String(ad + ce), 30]] }), per, 'Draw DE perpendicular to BC. Then DE = AB and EC = BC − AD.', 'DE = AB = ' + ab + ' and EC = ' + (ad + ce) + ' − ' + ad + ' = ' + ce + '.<br>' + hypWork('DE', 'EC', 'CD', ab, ce) + '<br>perimeter = ' + ab + ' + ' + (ad + ce) + ' + ' + cd + ' + ' + ad + ' = ' + per, { needStep: true });
  }
]);

/* ======================= 5.3 Applications ======================= */
G['5.3'] = [
  function ladder(l) {
    const L = rd(LR(l, 3, 8) + pick([0, .5]), 1), foot = rd(L * pick([.2, .25, .3, .35]) , 1), v = L * L - foot * foot, d = 1, u = 'm';
    const P = { A: [0, 0], B: [foot, 0], C: [0, Math.sqrt(v)] };
    return nr(p('A ladder of <b>' + sp(L) + ' m</b> leans against a wall. The foot of the ladder is <b>' + sp(foot) + ' m</b> from the wall. How high up the wall does the ladder reach? Round <b>to 1 decimal place</b>.') + flatFig(P, { poly: ['A', 'B', 'C'], right: [['A', 'B', 'C']], sides: [['A', 'B', sp(foot) + ' m'], ['B', 'C', sp(L) + ' m'], ['A', 'C', '?']], W: 200 }), Math.sqrt(v), d, 'The ladder is the hypotenuse. The wall and the ground make a right angle.' + HINT_TYPE.replace('sqrt(8^2+6^2)', 'sqrt(' + L + '^2-' + foot + '^2)'), legWork('AB', 'AC', 'BC', foot, L, d) + ' m');
  },
  function shortcut(l) {
    const t = tripleL(l), m = pick([10, 20, 25, 30, 40]), a = t[0] * m, b = t[1] * m, c = Math.sqrt(a * a + b * b), exact = Number.isInteger(c);
    const P = { A: [0, 0], B: [a, 0], C: [a, b] };
    return nr(p('Lisa walks from A to B (' + sp(a) + ' m) and then to C (' + sp(b) + ' m), along the edges of a rectangular field. Tom walks straight across the field from A to C. How many metres <b>shorter</b> is Tom\'s route?') + flatFig(P, { poly: ['A', 'B', 'C'], right: [['B', 'A', 'C']], sides: [['A', 'B', sp(a) + ' m'], ['B', 'C', sp(b) + ' m'], ['A', 'C', '?']] }), a + b - c, 0, 'First calculate AC with Pythagoras. Then subtract it from AB + BC.', hypWork('AB', 'BC', 'AC', a, b) + '<br>Lisa: ' + a + ' + ' + b + ' = ' + (a + b) + ' m. Difference: ' + (a + b) + ' − ' + c + ' = ' + (a + b - c) + ' m');
  },
  function screenDiag(l) {
    const w = LR(l, 60, 140), h = Math.round(w * pick([9 / 16, 10 / 16, 3 / 4])), dcm = Math.sqrt(w * w + h * h), inch = dcm / 2.54;
    return nr(p('A TV screen is <b>' + w + ' cm</b> wide and <b>' + h + ' cm</b> high. The size of a screen is the length of its diagonal in inches (1 inch = 2.54 cm). How many inches is this screen? Round <b>to a whole number</b>.'), inch, 0, 'First calculate the diagonal in cm with Pythagoras. Then divide by 2.54.', 'diagonal² = ' + w + '² + ' + h + '² = ' + sq(w) + ' + ' + sq(h) + ' = ' + sp(w * w + h * h) + '<br>diagonal = √' + sp(w * w + h * h) + ' ≈ ' + rd(dcm, 1) + ' cm<br>' + rd(dcm, 1) + ' : 2.54 ≈ ' + Math.round(inch) + ' inches');
  },
  function ramp(l) {
    const hcm = LR(l, 20, 80), len = LR(l, 150, 400), base = Math.sqrt(len * len - hcm * hcm);
    return nr(p('A wheelchair ramp is <b>' + len + ' cm</b> long and goes up <b>' + hcm + ' cm</b>. How far does the ramp reach horizontally? Round <b>to a whole number</b> of cm.') + flatFig({ A: [0, 0], B: [base, 0], C: [base, hcm * 1.6] }, { poly: ['A', 'B', 'C'], right: [['B', 'A', 'C']], sides: [['A', 'B', '?'], ['B', 'C', hcm + ' cm'], ['A', 'C', len + ' cm']], noLabel: ['A', 'B', 'C'], W: 300, H: 120 }), base, 0, 'The ramp itself is the hypotenuse.' + HINT_TYPE.replace('sqrt(8^2+6^2)', 'sqrt(' + len + '^2-' + hcm + '^2)'), 'horizontal² + ' + hcm + '² = ' + len + '²<br>horizontal² = ' + sq(len) + ' − ' + sq(hcm) + ' = ' + sp(len * len - hcm * hcm) + '<br>horizontal = √' + sp(len * len - hcm * hcm) + ' ≈ ' + Math.round(base) + ' cm');
  },
  function fitCheck(l) {
    const a = LR(l, 150, 230), b = ri(40, 70), ceil = Math.round(Math.sqrt(a * a + b * b)) + pick([-6, -3, 4, 8]), dg = Math.sqrt(a * a + b * b), fits = dg <= ceil;
    return ch(p('A wardrobe is lying on its back. It is <b>' + a + ' cm</b> high and <b>' + b + ' cm</b> deep. The ceiling is <b>' + ceil + ' cm</b> high. Can you tip the wardrobe up without touching the ceiling?') + flatFig({ A: [0, 0], B: [a, 0], C: [a, b], D: [0, b] }, { poly: ['A', 'B', 'C', 'D'], dash: [['A', 'C']], sides: [['A', 'B', a + ' cm'], ['B', 'C', b + ' cm']], noLabel: ['A', 'B', 'C', 'D'], W: 300, H: 120 }), fits ? 'Yes, it fits' : 'No, it touches the ceiling', [fits ? 'No, it touches the ceiling' : 'Yes, it fits'], 'While you tip it up, the diagonal of the side is the longest part. Compare the diagonal with the ceiling height.', 'diagonal² = ' + a + '² + ' + b + '² = ' + sq(a) + ' + ' + sq(b) + ' = ' + sp(a * a + b * b) + '<br>diagonal = √' + sp(a * a + b * b) + ' ≈ ' + rd(dg, 1) + ' cm<br>' + rd(dg, 1) + (fits ? ' ≤ ' : ' > ') + ceil + ', so ' + (fits ? 'it fits.' : 'it touches the ceiling.'));
  }
];
XG['5.3'] = [
  function towerRoof(l) {
    const wall = rd(ri(80, 200) / 10, 1), half = rd(ri(15, 40) / 10, 1), slant = rd(half + ri(15, 50) / 10, 1), top = Math.sqrt(slant * slant - half * half), tot = wall + top;
    return nr(p('A tower has walls of <b>' + sp(wall) + ' m</b> high. On top is a roof shaped like a triangle (side view): the base is <b>' + sp(2 * half) + ' m</b> wide and the sloping sides are <b>' + sp(slant) + ' m</b> long. How high is the tower in total? Round <b>to 1 decimal place</b>.'), tot, 1, 'Draw the height of the roof. It cuts the base in half. Use Pythagoras for the height of the roof, then add the wall.', 'half of the base = ' + sp(2 * half) + ' : 2 = ' + sp(half) + '<br>roof height² = ' + sp(slant) + '² − ' + sp(half) + '² = ' + sq(slant) + ' − ' + sq(half) + ' = ' + sp(rd(slant * slant - half * half, 4)) + '<br>roof height = √' + sp(rd(slant * slant - half * half, 4)) + ' ≈ ' + rd(top, 2) + ' m<br>total ≈ ' + sp(wall) + ' + ' + rd(top, 2) + ' ≈ ' + sp(rd(tot, 1)) + ' m');
  },
  function twoStepRoute(l) {
    const a = pick([300, 400, 500, 600]), b = pick([150, 200, 250]), c = pick([100, 200, 300]), d = pick([200, 300, 400]);
    const r = Math.sqrt(a * a + b * b) + Math.sqrt(c * c + d * d);
    return nr(p('A drone flies from A in a straight line to B: <b>' + a + ' m</b> east and <b>' + b + ' m</b> north. Then it flies in a straight line to C: <b>' + c + ' m</b> east and <b>' + d + ' m</b> north. How many metres does it fly in total? Round <b>to a whole number</b>.'), r, 0, 'Use Pythagoras twice: once for A to B, once for B to C. Then add.', 'AB = √(' + a + '² + ' + b + '²) = √' + sp(a * a + b * b) + ' ≈ ' + rd(Math.sqrt(a * a + b * b), 1) + ' m<br>BC = √(' + c + '² + ' + d + '²) = √' + sp(c * c + d * d) + ' ≈ ' + rd(Math.sqrt(c * c + d * d), 1) + ' m<br>total ≈ ' + Math.round(r) + ' m');
  }
];

/* ======================= 5.4 Pythagoras in space ======================= */
G['5.4'] = [
  function faceDiag(l) {
    const L = LR(l, 3, 12), W = LR(l, 2, 9), H = LR(l, 2, 10), which = pick(['AC', 'AF', 'BG']), v = which === 'AC' ? L * L + W * W : which === 'AF' ? L * L + H * H : W * W + H * H, d = isSq(v) ? 0 : 1;
    const parts = which === 'AC' ? ['AB', 'BC', L, W, 'bottom face ABCD'] : which === 'AF' ? ['AB', 'BF', L, H, 'front face ABFE'] : ['BC', 'CG', W, H, 'side face BCGF'];
    return nr(p('Cuboid ABCD.EFGH has AB = ' + L + ' cm, BC = ' + W + ' cm and AE = ' + H + ' cm. Calculate the length of face diagonal <b>' + which + '</b>' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + cuboidFig(L, W, H, { diag: [[which[0], which[1]]], labL: L + ' cm', labW: W + ' cm', labH: H + ' cm' }), Math.sqrt(v), d, which + ' lies in the ' + parts[4] + '. Draw that face flat: it is a rectangle, and ' + which + ' is its diagonal.' + HINT_TYPE, 'Look at the ' + parts[4] + ' (a rectangle).<br>' + hypWork(parts[0], parts[1], which, parts[2], parts[3], d));
  },
  function spaceDiag(l) {
    let L, W, H; if (l === 0) { const c = pick([[2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [2, 10, 11], [6, 6, 7], [3, 4, 12]]); [L, W, H] = shuffle(c); } else { L = LR(l, 3, 12); W = LR(l, 2, 9); H = LR(l, 2, 10); }
    const ac2 = L * L + W * W, v = ac2 + H * H, d = isSq(v) ? 0 : 1;
    return nr(p('Cuboid ABCD.EFGH has AB = ' + L + ' cm, BC = ' + W + ' cm and AE = ' + H + ' cm. Calculate the length of space diagonal <b>AG</b>' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + cuboidFig(L, W, H, { diag: [['A', 'G'], ['A', 'C']], labL: L + ' cm', labW: W + ' cm', labH: H + ' cm' }), Math.sqrt(v), d, 'Two steps. First face diagonal AC in the bottom face. Then triangle ACG: it has a right angle at C. Keep AC² (or AC as a root), do not round in between.', 'Step 1, bottom face:<br>' + hypWork('AB', 'BC', 'AC', L, W).replace(/<br>AC = √.*$/, '<br>AC = √' + ac2) + '<br><br>Step 2, triangle ACG (right angle at C):<br>' + hypWork('AC', 'CG', 'AG', RT(ac2), H, d));
  },
  function cubeDiag(l) {
    const r = LR(l, 2, 12), face = l === 0, v = face ? 2 * r * r : 3 * r * r, exact = l === 2;
    const nm = face ? 'face diagonal AC' : 'space diagonal AG', fig = cuboidFig(r, r, r, { diag: face ? [['A', 'C']] : [['A', 'C'], ['A', 'G']], labL: r + ' cm' });
    const st = face ? hypWork('AB', 'BC', 'AC', r, r, exact ? undefined : 1) : 'AC² = ' + r + '² + ' + r + '² = ' + 2 * r * r + '<br>' + hypWork('AC', 'CG', 'AG', RT(2 * r * r), r, exact ? undefined : 1);
    if (exact) return ex(p('A cube ABCD.EFGH has edges of ' + r + ' cm. Calculate the ' + nm + ' <b>exactly</b> (simplify the root).') + fig, rootForm(v), 'root', face ? 'Use the bottom face.' : 'First the face diagonal AC, then triangle ACG.', st, { keys: ['√', '(', ')', '^'], needStep: true });
    return nr(p('A cube ABCD.EFGH has edges of ' + r + ' cm. Calculate the length of the ' + nm + ', rounded <b>to 1 decimal place</b>.') + fig, Math.sqrt(v), 1, face ? 'The diagonal of the bottom face is the hypotenuse of a right-angled triangle with two edges.' : 'Two steps: first face diagonal AC, then triangle ACG with the right angle at C.', st);
  },
  function pyramidHeight(l) {
    const a = pick([4, 6, 8, 10, 12]), e = a + LR(l, 1, 6), half2 = a * a / 2, h2 = e * e - half2;
    return nr(p('Pyramid T.ABCD has a square base with sides of ' + a + ' cm. All the slanting edges (such as TA) are ' + e + ' cm. The top T is right above M, the centre of the base. Calculate the height <b>TM</b>, rounded <b>to 1 decimal place</b>.') + pyramidFig({ show: 'edge', labA: a + ' cm', labE: e + ' cm' }), Math.sqrt(h2), 1, 'AM is half of diagonal AC. First calculate AC (or AM), then use triangle AMT with the right angle at M.', 'AC² = ' + a + '² + ' + a + '² = ' + 2 * a * a + ', AC = √' + 2 * a * a + '<br>AM = ½ · AC, so AM² = ' + 2 * a * a + ' : 4 = ' + half2 + '<br>a² + b² = c²<br>AM² + TM² = TA²<br>' + half2 + ' + TM² = ' + e * e + '<br>TM² = ' + rd(h2, 4) + '<br>TM = √' + rd(h2, 4) + ' ≈ ' + sp(rd(Math.sqrt(h2), 1)) + ' cm');
  },
  function apothem(l) {
    const a = pick([4, 6, 8, 10, 12, 16]), h = LR(l, 3, 12), v = (a / 2) ** 2 + h * h, d = isSq(v) ? 0 : 1;
    return nr(p('Pyramid T.ABCD has a square base with sides of ' + a + ' cm and height TM = ' + h + ' cm. N is the middle of BC. Calculate <b>TN</b>, the height of side face BCT' + (d ? ', rounded <b>to 1 decimal place</b>' : '') + '.') + pyramidFig({ show: 'apothem', labA: a + ' cm', labH: h + ' cm' }), Math.sqrt(v), d, 'MN is half of a side of the base. Triangle TMN has a right angle at M.', 'MN = ' + a + ' : 2 = ' + a / 2 + '<br>' + hypWork('MN', 'TM', 'TN', a / 2, h, d));
  }
];
XG['5.4'] = [
  function boxFit(l) {
    const L = pick([40, 50, 60, 80]), W = pick([30, 35, 40]), H = pick([25, 30, 40, 45]), d2 = L * L + W * W + H * H, dg = Math.sqrt(d2);
    if (isSq(d2)) return XG['5.4'][0](l);
    return nu(p('A box is ' + L + ' cm long, ' + W + ' cm wide and ' + H + ' cm high. What is the longest stick that fits in the box? Give a whole number of cm (round <b>down</b>, otherwise it does not fit).') + cuboidFig(L, W, H, { diag: [['A', 'G'], ['A', 'C']], labL: L + ' cm', labW: W + ' cm', labH: H + ' cm' }), Math.floor(dg), 'The longest stick goes from one corner to the opposite corner: the space diagonal. First a face diagonal, then the space diagonal.', 'AC² = ' + L + '² + ' + W + '² = ' + sq(L) + ' + ' + sq(W) + ' = ' + sp(L * L + W * W) + '<br>AG² = AC² + CG² = ' + sp(L * L + W * W) + ' + ' + sq(H) + ' = ' + sp(d2) + '<br>AG = √' + sp(d2) + ' ≈ ' + rd(dg, 2) + ' cm. Round down: ' + Math.floor(dg) + ' cm', { noStep: true, tol: 0 });
  },
  function spiderNet(l) {
    // shortest route over two faces: unfold (like book ex. 62)
    const a = pick([6, 8, 10]), b = pick([3, 4, 5, 6]), c = pick([4, 6, 8]), r = Math.sqrt(a * a + (b + c) ** 2);
    return nr(p('A spider walks over the outside of a box from corner A to corner G. The box is ' + a + ' dm long, ' + b + ' dm wide and ' + c + ' dm high. It walks over the front face and then the top face. Unfold the two faces to one flat rectangle of ' + a + ' by ' + (b + c) + ' dm. How long is the shortest route? Round <b>to 1 decimal place</b>.'), r, 1, 'On the unfolded net the shortest route is a straight line: the diagonal of a rectangle of ' + a + ' by ' + (b + c) + '.', 'route² = ' + a + '² + ' + (b + c) + '² = ' + a * a + ' + ' + (b + c) ** 2 + ' = ' + (a * a + (b + c) ** 2) + '<br>route = √' + (a * a + (b + c) ** 2) + ' ≈ ' + sp(rd(r, 1)) + ' dm');
  }
];

/* ======================= 5.5 Right-angled or not? ======================= */
function sideSet(l, kind) {   // kind 'right' | 'acute' | 'obtuse'
  if (kind === 'right') { const t = tripleL(l), m = l === 2 ? pick([1, 2, 3]) : 1; return t.map(x => x * m); }
  for (;;) { const a = LR(l, 4, 20), b = LR(l, 4, 20), c = Math.max(a, b) + ri(1, 8); const s = a * a + b * b; if (s === c * c || c >= a + b) continue; if ((kind === 'acute') === (s > c * c)) return [a, b, c]; }
}
G['5.5'] = [
  function isRight(l) {
    if (l > 0) {
      const sets = shuffle([sideSet(l, 'right'), sideSet(l, 'acute'), sideSet(l, 'obtuse')]), r = sets.find(x => x[0] ** 2 + x[1] ** 2 === x[2] ** 2), txt = x => x.join(', ');
      return ch(p('Three triangles have these sides. Which triangle is <b>right-angled</b>?'), txt(r), sets.filter(x => x !== r).map(txt), 'For each triangle: take the longest side as c and check if a² + b² = c².', sets.map(x => x.join(', ') + ': ' + x[0] + '² + ' + x[1] + '² = ' + (x[0] ** 2 + x[1] ** 2) + ' and ' + x[2] + '² = ' + x[2] ** 2 + (x === r ? ', equal: right-angled.' : ', not equal.')).join('<br>'));
    }
    const right = Math.random() < .5, s = sideSet(l, right ? 'right' : pick(['acute', 'obtuse'])), [a, b, c] = s, nm = pick(LETTERS), show = shuffle(s);
    const lhs = a * a + b * b, rhs = c * c;
    return ch(p('A triangle ' + nm + ' has sides of <b>' + show.join('</b>, <b>') + '</b>. Is the triangle right-angled?'), right ? 'Yes, it is right-angled' : 'No, it is not right-angled', [right ? 'No, it is not right-angled' : 'Yes, it is right-angled'], 'Take the longest side as c. Check if a² + b² is equal to c².', 'The longest side is ' + c + ', so c = ' + c + '.<br>a² + b² = ' + a + '² + ' + b + '² = ' + a * a + ' + ' + b * b + ' = ' + lhs + '<br>c² = ' + c + '² = ' + rhs + '<br>' + (right ? 'a² + b² = c², so the triangle is right-angled.' : 'a² + b² ≠ c², so the triangle is not right-angled.'));
  },
  function classify(l) {
    const kind = pick(['right', 'acute', 'obtuse']), s = sideSet(l, kind), [a, b, c] = s, lhs = a * a + b * b, rhs = c * c;
    const name = { right: 'right-angled', acute: 'acute (all angles smaller than 90°)', obtuse: 'obtuse (one angle bigger than 90°)' };
    return ch(p('A triangle has sides of <b>' + shuffle(s).join('</b>, <b>') + '</b>. What kind of triangle is it?'), name[kind], [name.right, name.acute, name.obtuse], 'Compare a² + b² with c² (c is the longest side). Equal: right-angled. Bigger: acute. Smaller: obtuse.', 'c = ' + c + '<br>a² + b² = ' + a * a + ' + ' + b * b + ' = ' + lhs + '<br>c² = ' + rhs + '<br>' + (kind === 'right' ? lhs + ' = ' + rhs + ': right-angled.' : kind === 'acute' ? lhs + ' > ' + rhs + ', so a² + b² > c²: acute.' : lhs + ' < ' + rhs + ', so a² + b² < c²: obtuse.'));
  },
  function whichRight(l) {
    const nm = pick(LETTERS), t = tripleL(l), sides = shuffle([[nm[0] + nm[1], t[0]], [nm[1] + nm[2], t[1]], [nm[0] + nm[2], t[2]]]);
    const hyp = sides.find(x => x[1] === t[2])[0], ang = nm.split('').find(ch_ => !hyp.includes(ch_));
    return ch(p('In triangle ' + nm + ': ' + sides.map(x => x[0] + ' = ' + x[1]).join(', ') + '. The triangle is right-angled. Which angle is 90°?'), 'angle ' + ang, nm.split('').filter(x => x !== ang).map(x => 'angle ' + x), 'The right angle is opposite the longest side (the hypotenuse).', t[0] + '² + ' + t[1] + '² = ' + t[0] ** 2 + ' + ' + t[1] ** 2 + ' = ' + t[2] ** 2 + ' = ' + t[2] + '². The longest side is ' + hyp + ', so the right angle is opposite it: angle ' + ang + '.');
  },
  function isTriple(l) {
    const right = Math.random() < .5, s = right ? sideSet(Math.max(l, 1), 'right') : sideSet(l, pick(['acute', 'obtuse'])), [a, b, c] = s;
    return ch(p('Is <b>(' + s.join(', ') + ')</b> a Pythagorean triple?'), right ? 'Yes' : 'No', [right ? 'No' : 'Yes'], 'A Pythagorean triple is three whole numbers a, b, c with a² + b² = c².', a + '² + ' + b + '² = ' + a * a + ' + ' + b * b + ' = ' + (a * a + b * b) + '<br>' + c + '² = ' + c * c + '<br>' + (right ? 'Equal, so it is a Pythagorean triple.' : 'Not equal, so it is not a Pythagorean triple.'));
  }
];
XG['5.5'] = [
  function makeRight(l) {
    const t = pick(TRIPLES), m = pick([1, 2]), a = t[0] * m, b = t[1] * m, c = t[2] * m;
    return nu(p('A triangle has sides ' + a + ' and ' + b + '. How long must the third side be to make it right-angled with the third side as the <b>longest</b> side?'), c, 'The third side is the hypotenuse.', hypWork('a', 'b', 'c', a, b), { needStep: true });
  },
  function maxSideAcute(l) {
    const a = pick([6, 8, 9, 12, 15]), b = pick([8, 10, 12, 16, 20]), c2 = a * a + b * b, c = Math.sqrt(c2), lim = isSq(c2) ? c - 1 : Math.floor(c);
    if (lim <= Math.max(a, b)) return XG['5.5'][1](l);
    return nu(p('A triangle has sides ' + a + ' and ' + b + ' and a third side c that is the longest side. c is a whole number. What is the <b>largest</b> value of c for which the triangle is still <b>acute</b>?'), lim, 'Acute means a² + b² > c². First find c for a right angle.', 'a² + b² = ' + a * a + ' + ' + b * b + ' = ' + c2 + '<br>Right-angled when c = √' + c2 + (isSq(c2) ? ' = ' + c : ' ≈ ' + rd(c, 2)) + '.<br>Acute needs c² < ' + c2 + '. ' + lim + '² = ' + lim * lim + ' < ' + c2 + ' but ' + (lim + 1) + '² = ' + (lim + 1) ** 2 + ' ≥ ' + c2 + '.<br>So the largest whole number is c = ' + lim + '.', { noStep: true });
  }
];

const SECTIONS = [
  { id: '5.1', title: '5.1 Pythagoras\' theorem', sub: 'Hypotenuse, a² + b² = c², squares on the sides' },
  { id: '5.2', title: '5.2 Calculating sides', sub: 'Any side, exact or rounded, auxiliary lines' },
  { id: '5.3', title: '5.3 Applications', sub: 'Ladders, ramps, screens and routes' },
  { id: '5.4', title: '5.4 Pythagoras in space', sub: 'Diagonals in cuboids and cubes, pyramids' },
  { id: '5.5', title: '5.5 Right-angled or not?', sub: 'Acute, right-angled or obtuse' }
];
const GOALS = [
  ['5.1', 'I can find the hypotenuse and write down a² + b² = c² for a triangle', ['hypName', 'writeFormula', 'squaresArea'], 'The hypotenuse is opposite the right angle and is the longest side.'],
  ['5.1', 'I can calculate the hypotenuse', ['hypInt', 'tiltedSquare'], 'Square, add, square root.'],
  ['5.2', 'I can calculate any side of a right-angled triangle', ['findHyp', 'findLeg', 'legInt', 'gridDistance'], 'Hypotenuse: add the squares. Other side: subtract the squares.'],
  ['5.2', 'I can give an exact answer with a root', ['exactSide', 'rootSides'], '√72 = √36 · √2 = 6√2.'],
  ['5.2', 'I can draw an auxiliary line to make a right-angled triangle', ['isoHeight', 'trapSide', 'rectDiag', 'equiHeight', 'rhombusSide'], 'Look for a height or a diagonal that makes a right angle.'],
  ['5.3', 'I can use Pythagoras in everyday problems', ['ladder', 'shortcut', 'screenDiag', 'ramp', 'fitCheck'], 'Make a sketch, find the right angle, mark the hypotenuse.'],
  ['5.4', 'I can calculate diagonals in a cuboid and a cube', ['faceDiag', 'spaceDiag', 'cubeDiag'], 'Space diagonal: first a face diagonal, then a second triangle.'],
  ['5.4', 'I can calculate heights in a pyramid', ['pyramidHeight', 'apothem']],
  ['5.5', 'I can check if a triangle is right-angled, acute or obtuse', ['isRight', 'classify', 'whichRight', 'isTriple'], 'Compare a² + b² with c², where c is the longest side.']
];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "2HT": [
      {"id": "D1", "title": "Lesson · 5.1 Pythagoras' theorem", "sub": "Wed 19 May · ex 1, 2, 6, 7, 8, 9, 10", "date": "2027-05-19", "gens": [["5.1", "hypName"], ["5.1", "writeFormula"], ["5.1", "squaresArea"]], "xg": [["5.1", "tripleScale"], ["5.1", "tiltedSide"]]},
      {"id": "D2", "title": "Lesson · 5.1 Pythagoras' theorem + 5.2 Calculating sides", "sub": "Thu 20 May · ex 11, 12, 13, 18, 19, 20", "date": "2027-05-20", "gens": [["5.1", "hypName"], ["5.1", "writeFormula"], ["5.1", "squaresArea"], ["5.2", "findHyp"], ["5.2", "findLeg"], ["5.2", "legInt"]], "xg": [["5.1", "tripleScale"], ["5.1", "tiltedSide"], ["5.2", "areaThenHyp"], ["5.2", "twoTriangles"], ["5.2", "isoTrapArea"], ["5.2", "kiteAux"]]},
      {"id": "D3", "title": "Lesson · 5.2 Calculating sides + 5.3 Applications", "sub": "Fri 21 May · ex 21, 23, 24, 33, 34, 35", "date": "2027-05-21", "gens": [["5.2", "findLeg"], ["5.2", "legInt"], ["5.2", "exactSide"], ["5.2", "rootSides"], ["5.3", "ladder"], ["5.3", "shortcut"], ["5.3", "screenDiag"]], "xg": [["5.2", "areaThenHyp"], ["5.2", "twoTriangles"], ["5.2", "isoTrapArea"], ["5.2", "kiteAux"], ["5.3", "towerRoof"], ["5.3", "twoStepRoute"]]},
      {"id": "D4", "title": "Lesson · 5.3 Applications", "sub": "Wed 26 May · ex 37, 38, 39, 40, 41, 42", "date": "2027-05-26", "gens": [["5.3", "shortcut"], ["5.3", "screenDiag"], ["5.3", "ramp"]], "xg": [["5.3", "towerRoof"], ["5.3", "twoStepRoute"]]},
      {"id": "D5", "title": "Lesson · 5.4 A Pythagoras in space", "sub": "Thu 27 May · ex 48, 49, 50, 51, 52", "date": "2027-05-27", "gens": [["5.4", "faceDiag"], ["5.4", "spaceDiag"], ["5.4", "cubeDiag"]], "xg": [["5.4", "boxFit"], ["5.4", "spiderNet"]]},
      {"id": "D6", "title": "Lesson · 5.4 B Pythagoras in space", "sub": "Fri 28 May · ex 53, 54, 55, 56, 57", "date": "2027-05-28", "gens": [["5.4", "faceDiag"], ["5.4", "spaceDiag"], ["5.4", "cubeDiag"]], "xg": [["5.4", "boxFit"], ["5.4", "spiderNet"]]}
    ],
    "2VT": [
      {"id": "D1", "title": "Lesson · 5.1 Pythagoras' theorem", "sub": "Fri 14 May · ex 1, 2, 6, 7, 8, 9, 10", "date": "2027-05-14", "gens": [["5.1", "hypName"], ["5.1", "writeFormula"], ["5.1", "squaresArea"]], "xg": [["5.1", "tripleScale"], ["5.1", "tiltedSide"]]},
      {"id": "D2", "title": "Lesson · 5.1 Pythagoras' theorem + 5.2 Calculating sides", "sub": "Tue 18 May · ex 11, 12, 13, 15, 18, 19", "date": "2027-05-18", "gens": [["5.1", "writeFormula"], ["5.1", "squaresArea"], ["5.1", "hypInt"], ["5.2", "findHyp"], ["5.2", "findLeg"], ["5.2", "legInt"]], "xg": [["5.1", "tripleScale"], ["5.1", "tiltedSide"], ["5.2", "areaThenHyp"], ["5.2", "twoTriangles"], ["5.2", "isoTrapArea"], ["5.2", "kiteAux"]]},
      {"id": "D3", "title": "Lesson · 5.2 Calculating sides", "sub": "Wed 19 May · ex 20, 21, 22, 24, 26, 27", "date": "2027-05-19", "gens": [["5.2", "findLeg"], ["5.2", "legInt"], ["5.2", "exactSide"], ["5.2", "rootSides"], ["5.2", "gridDistance"], ["5.2", "isoHeight"], ["5.2", "trapSide"]], "xg": [["5.2", "areaThenHyp"], ["5.2", "twoTriangles"], ["5.2", "isoTrapArea"], ["5.2", "kiteAux"]]},
      {"id": "D4", "title": "Lesson · 5.3 Applications", "sub": "Fri 21 May · ex 33, 35, 36, 38, 39, 40", "date": "2027-05-21", "gens": [["5.3", "ladder"], ["5.3", "shortcut"], ["5.3", "screenDiag"]], "xg": [["5.3", "towerRoof"], ["5.3", "twoStepRoute"]]},
      {"id": "D5", "title": "Lesson · 5.4 A Pythagoras in space", "sub": "Wed 26 May · ex 48, 49, 50, 52, 53", "date": "2027-05-26", "gens": [["5.4", "faceDiag"], ["5.4", "spaceDiag"], ["5.4", "cubeDiag"]], "xg": [["5.4", "boxFit"], ["5.4", "spiderNet"]]},
      {"id": "D6", "title": "Lesson · 5.4 B Pythagoras in space", "sub": "Fri 28 May · ex 55, 56, 57, 58", "date": "2027-05-28", "gens": [["5.4", "spaceDiag"], ["5.4", "cubeDiag"], ["5.4", "pyramidHeight"]], "xg": [["5.4", "boxFit"], ["5.4", "spiderNet"]]},
      {"id": "D7", "title": "Lesson · 5.5 A Right-angled or not?", "sub": "Tue 1 Jun · ex 65, 66, 68, 69, 70", "date": "2027-06-01", "gens": [["5.5", "isRight"], ["5.5", "classify"], ["5.5", "whichRight"]], "xg": [["5.5", "makeRight"], ["5.5", "maxSideAcute"]]},
      {"id": "D8", "title": "Lesson · 5.5 B Right-angled or not?", "sub": "Wed 2 Jun · ex 71, 72, 73, 74", "date": "2027-06-02", "gens": [["5.5", "isRight"], ["5.5", "classify"], ["5.5", "whichRight"]], "xg": [["5.5", "makeRight"], ["5.5", "maxSideAcute"]]}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: o.xg.filter(g => __has(XG, g)) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-' + P.cls.toLowerCase() + '-ch5-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['hypName', 'writeFormula'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
