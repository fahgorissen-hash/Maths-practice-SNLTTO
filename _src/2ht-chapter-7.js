const { ri, pick, shuffle, gcd, M, fr, ratText } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => Math.round(x * Math.pow(10, d) + 1e-9) / Math.pow(10, d);
const must = (a, b) => { if (!(Math.abs(a - b) < 1e-6)) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const A_ = s => '∠' + s;   // angle name
const deg = n => n + '°';
const dec = x => String(rd(x, 4));
const LET = ['ABC', 'DEF', 'KLM', 'PQR', 'STU', 'XYZ'];
/* angle question: the answer is a calculation (in-between step needed) or equals a given angle (no step) */
const angQ = (html, ans, hint, steps, calc) => nu(html, ans, hint, steps, Object.assign({ ansText: deg(ans) }, calc ? { needStep: true } : { noStep: true }));
const HINT_STEP = ' Type your calculation first, for example 180 − 36 − 119.';
/* ratio table of two figures: names [n1, n2], rows of [side1, value1, side2, value2] */
function ratioTable(n1, n2, cols) {
  return '<table class="tbl"><tr><th>' + n1 + '</th>' + cols.map(c => '<td>' + c[0] + ' = ' + c[1] + '</td>').join('') + '</tr><tr><th>' + n2 + '</th>' + cols.map(c => '<td>' + c[2] + ' = ' + c[3] + '</td>').join('') + '</tr></table>';
}
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

/* triangle from its angles (degrees) at vertices n[0], n[1], n[2]; labels inside at the vertices */
function triFig(n, a, b, labs, o) {
  const c = 180 - a - b, R = Math.PI / 180, AB = 1, AC = Math.sin(b * R) / Math.sin(c * R);
  const P = {}; P[n[0]] = [0, 0]; P[n[1]] = [AB, 0]; P[n[2]] = [AC * Math.cos(a * R), AC * Math.sin(a * R)];
  return flatFig(P, Object.assign({ poly: n.split(''), angles: [[n[0], labs[0]], [n[1], labs[1]], [n[2], labs[2]]].filter(x => x[1]), W: 280, H: 190 }, o || {}));
}
/* two parallel lines (upper with point A, lower with point B) cut by a transversal; th = angle 1 in degrees.
   Angles at each point: 1 upper-right, 2 upper-left, 3 lower-left, 4 lower-right */
function parFig(th, show) {
  const R = Math.PI / 180, W = 330, H = 230, yA = 75, yB = 165, xA = 175, dx = (yB - yA) / Math.tan(th * R), xB = xA - dx;
  const u = [Math.cos(th * R), -Math.sin(th * R)];
  const line = (x1, y1, x2, y2, c, w) => '<line x1="' + rd(x1, 1) + '" y1="' + rd(y1, 1) + '" x2="' + rd(x2, 1) + '" y2="' + rd(y2, 1) + '" stroke="' + c + '" stroke-width="' + w + '"/>';
  let b = line(10, yA, W - 10, yA, '#1b5fa8', 2.2) + line(10, yB, W - 10, yB, '#1b5fa8', 2.2);
  [yA, yB].forEach(y => { b += '<path d="M' + (W - 60) + ' ' + (y - 6) + ' l8 6 l-8 6" fill="none" stroke="#1b5fa8" stroke-width="2"/>'; });
  b += line(xA + u[0] * 70, yA + u[1] * 70, xB - u[0] * 70, yB - u[1] * 70, '#d1471f', 2.2);
  b += lab('k', 18, yA - 8, 13, 'start', true, '#1b5fa8') + lab('l', 18, yB - 8, 13, 'start', true, '#1b5fa8');
  [['A', xA, yA], ['B', xB, yB]].forEach(pt => {
    b += '<circle cx="' + rd(pt[1], 1) + '" cy="' + pt[2] + '" r="3" fill="#223"/>';
    const dirs = [[1, 0, u[0], u[1]], [-1, 0, u[0], u[1]], [-1, 0, -u[0], -u[1]], [1, 0, -u[0], -u[1]]];
    dirs.forEach((d, i) => { const bx = d[0] + d[2], by = d[1] + d[3], L = Math.hypot(bx, by) || 1, k = 17; const t = (show && show[pt[0] + (i + 1)]) || String(i + 1); b += lab(t, pt[1] + bx / L * k, pt[2] + by / L * k + 4, t.length > 2 ? 11 : 12, 'middle', true, t.indexOf('?') >= 0 ? '#d1471f' : '#17222d'); });
    { const bx = pt[0] === 'A' ? u[0] - 1 : 1 - u[0], by = pt[0] === 'A' ? u[1] : -u[1], L = Math.hypot(bx, by); b += lab(pt[0], pt[1] + bx / L * 40, pt[2] + by / L * 40 + 5, 14, 'middle', true, '#1b5fa8'); }
  });
  return svg(W, H, b);
}
const PAIR = {   // relation between angle i at A and angle j at B (A on the upper line)
  name: (i, j, sameP) => sameP ? (Math.abs(i - j) === 2 ? 'vertically opposite angles' : 'angles on a straight line') : i === j ? 'corresponding angles (F-angles)' : ((i === 3 && j === 1) || (i === 4 && j === 2) || (i === 1 && j === 3) || (i === 2 && j === 4)) ? 'alternate angles (Z-angles)' : null
};
const angAt = (th, i) => (i % 2 === 1) ? th : 180 - th;

/* ======================= 7.1 Angles ======================= */
G['7.1'] = [
  function triSum(l) {
    const n = pick(LET); let a, b; do { a = LR(l, 25, 100); b = LR(l, 25, 100); } while (a + b > 160);
    const c = 180 - a - b, right = l === 1 && Math.random() < .5;
    if (right) { const x = ri(20, 70); return angQ(p('In triangle ' + n + ' angle ' + n[0] + ' = 90° and ' + A_(n[1]) + ' = ' + deg(x) + '. Calculate ' + A_(n[2]) + '.') + triFig(n, 90, x, ['90°', deg(x), '?']), 90 - x, 'The angles of a triangle add up to 180°.' + HINT_STEP, A_(n[2]) + ' = 180° − 90° − ' + deg(x) + ' = ' + deg(90 - x) + ' (sum of the angles in a triangle)', true); }
    return angQ(p('In triangle ' + n + ', ' + A_(n[0]) + ' = ' + deg(a) + ' and ' + A_(n[1]) + ' = ' + deg(b) + '. Calculate ' + A_(n[2]) + '.') + triFig(n, a, b, [deg(a), deg(b), '?']), c, 'The angles of a triangle add up to 180°.' + HINT_STEP, A_(n[2]) + ' = 180° − ' + deg(a) + ' − ' + deg(b) + ' = ' + deg(c) + ' (sum of the angles in a triangle)', true);
  },
  function isoTri(l) {
    const n = pick(LET), top = 2 * ri(10, 70), base = (180 - top) / 2, askBase = Math.random() < .5;
    const fig = triFig(n.slice(1) + n[0], base, base, askBase ? ['?', '', deg(top)] : [deg(base), '', '?'], { ticks: [[n[0], n[1]], [n[0], n[2]]] });
    if (askBase) return angQ(p('Triangle ' + n + ' is isosceles with ' + n[0] + n[1] + ' = ' + n[0] + n[2] + '. The top angle ' + A_(n[0]) + ' = ' + deg(top) + '. Calculate ' + A_(n[1]) + '.') + fig, base, 'The two base angles are equal. Together they are 180° − ' + deg(top) + '.' + HINT_STEP.replace('180 − 36 − 119', '(180 − ' + top + ') / 2'), A_(n[1]) + ' + ' + A_(n[2]) + ' = 180° − ' + deg(top) + ' = ' + deg(180 - top) + ' (sum of the angles in a triangle)<br>' + A_(n[1]) + ' = ' + A_(n[2]) + ' = ' + deg(180 - top) + ' : 2 = ' + deg(base) + ' (isosceles triangle)', true);
    return angQ(p('Triangle ' + n + ' is isosceles with ' + n[0] + n[1] + ' = ' + n[0] + n[2] + '. The base angle ' + A_(n[1]) + ' = ' + deg(base) + '. Calculate the top angle ' + A_(n[0]) + '.') + fig, top, 'In an isosceles triangle the base angles are equal.' + HINT_STEP.replace('180 − 36 − 119', '180 − 2 · ' + base), A_(n[2]) + ' = ' + A_(n[1]) + ' = ' + deg(base) + ' (isosceles triangle)<br>' + A_(n[0]) + ' = 180° − ' + deg(base) + ' − ' + deg(base) + ' = ' + deg(top) + ' (sum of the angles in a triangle)', true);
  },
  function quadAngles(l) {
    const kind = pick(l === 0 ? ['parallelogram', 'kite'] : ['parallelogram', 'kite', 'rhombus', 'any']);
    if (kind === 'any') { let a, b, c; do { a = ri(50, 140); b = ri(50, 140); c = ri(50, 140); } while (360 - a - b - c < 30 || 360 - a - b - c > 170);
      const d = 360 - a - b - c; return angQ(p('In quadrilateral PQRS, ' + A_('P') + ' = ' + deg(a) + ', ' + A_('Q') + ' = ' + deg(b) + ' and ' + A_('R') + ' = ' + deg(c) + '. Calculate ' + A_('S') + '.'), d, 'The angles of a quadrilateral add up to 360°.' + HINT_STEP.replace('180 − 36 − 119', '360 − ' + a + ' − ' + b + ' − ' + c), A_('S') + ' = 360° − ' + deg(a) + ' − ' + deg(b) + ' − ' + deg(c) + ' = ' + deg(d) + ' (sum of the angles in a quadrilateral)', true); }
    if (kind === 'kite') { const t = ri(50, 150); const s = ri(40, 130); if (360 - 2 * t - s < 20) return G['7.1'][2](l); const o = 360 - 2 * t - s;
      return angQ(p('KLMN is a kite with KL = KN and ML = MN. ' + A_('L') + ' = ' + A_('N') + ' = ' + deg(t) + ' and ' + A_('K') + ' = ' + deg(s) + '. Calculate ' + A_('M') + '.'), o, 'In this kite ∠L = ∠N. All four angles add up to 360°.' + HINT_STEP.replace('180 − 36 − 119', '360 − ' + t + ' − ' + t + ' − ' + s), A_('M') + ' = 360° − ' + deg(t) + ' − ' + deg(t) + ' − ' + deg(s) + ' = ' + deg(o) + ' (sum of the angles in a quadrilateral)', true); }
    const a = ri(35, 85), adj = Math.random() < .7, nm = kind === 'rhombus' ? 'Rhombus' : 'Parallelogram';
    if (adj) return angQ(p(nm + ' PQRS has ' + A_('P') + ' = ' + deg(a) + '. Calculate ' + A_('Q') + '.'), 180 - a, 'Opposite angles are equal: ∠R = ∠P. All four add up to 360°.' + HINT_STEP.replace('180 − 36 − 119', '(360 − 2 · ' + a + ') / 2'), A_('R') + ' = ' + A_('P') + ' = ' + deg(a) + ' (' + kind + ')<br>' + A_('Q') + ' + ' + A_('S') + ' = 360° − ' + deg(a) + ' − ' + deg(a) + ' = ' + deg(360 - 2 * a) + ' (sum of the angles in a quadrilateral)<br>' + A_('Q') + ' = ' + deg(360 - 2 * a) + ' : 2 = ' + deg(180 - a) + ' (' + kind + ')', true);
    return angQ(p(nm + ' PQRS has ' + A_('P') + ' = ' + deg(a) + '. How big is ' + A_('R') + '?'), a, 'In a ' + kind + ' the opposite angles are equal.', A_('R') + ' = ' + A_('P') + ' = ' + deg(a) + ' (opposite angles of a ' + kind + ')', false);
  },
  function straightVert(l) {
    const a = ri(20, 160), kind = pick(['straight', 'vert', 'full']);
    if (kind === 'vert') return angQ(p('Two lines cross. One of the four angles is ' + deg(a) + '. How big is the angle <b>opposite</b> to it (the vertically opposite angle)?'), a, 'Vertically opposite angles are equal.', 'Vertically opposite angles are equal, so the angle is ' + deg(a) + '.', false);
    if (kind === 'full') { const b = ri(30, 150); if (a + b > 340) return G['7.1'][3](l); return angQ(p('Three angles around one point together make a full turn. Two of them are ' + deg(a) + ' and ' + deg(b) + '. How big is the third angle?'), 360 - a - b, 'A full turn is 360°.' + HINT_STEP.replace('180 − 36 − 119', '360 − ' + a + ' − ' + b), 'third angle = 360° − ' + deg(a) + ' − ' + deg(b) + ' = ' + deg(360 - a - b) + ' (full angle)', true); }
    return angQ(p('Two angles lie next to each other on a straight line. One of them is ' + deg(a) + '. How big is the other one?'), 180 - a, 'Angles on a straight line add up to 180°.' + HINT_STEP.replace('180 − 36 − 119', '180 − ' + a), 'other angle = 180° − ' + deg(a) + ' = ' + deg(180 - a) + ' (straight angle)', true);
  },
  function parallel(l) {
    const th = pick([40, 45, 50, 55, 58, 62, 65, 70, 72, 75]), i = ri(1, 4), j = ri(1, 4), given = angAt(th, i), ans = angAt(th, j), calc = given !== ans;
    const show = {}; show['A' + i] = deg(given); show['B' + j] = '?';
    let st; if (i === j) st = A_('B') + j + ' = ' + A_('A') + i + ' = ' + deg(ans) + ' (corresponding angles)';
    else if (PAIR.name(i, j, false) && PAIR.name(i, j, false).startsWith('alternate')) st = A_('B') + j + ' = ' + A_('A') + i + ' = ' + deg(ans) + ' (alternate angles)';
    else if (Math.abs(i - j) === 2) st = A_('B') + i + ' = ' + A_('A') + i + ' = ' + deg(given) + ' (corresponding angles)<br>' + A_('B') + j + ' = ' + A_('B') + i + ' = ' + deg(ans) + ' (vertically opposite angles)';
    else st = A_('B') + i + ' = ' + A_('A') + i + ' = ' + deg(given) + ' (corresponding angles)<br>' + A_('B') + j + ' = 180° − ' + deg(given) + ' = ' + deg(ans) + ' (straight angle)';
    return angQ(p('Lines ' + '<i>k</i> and <i>l</i> are parallel. ' + A_('A') + '<sub>' + i + '</sub> = ' + deg(given) + '. Calculate ' + A_('B') + '<sub>' + j + '</sub>.') + parFig(th, show), ans, 'Use corresponding angles (F), alternate angles (Z), vertically opposite angles or a straight angle (180°).' + (calc ? HINT_STEP.replace('180 − 36 − 119', '180 − ' + given) : ''), st.replace(/∠A(\d)/g, '∠A<sub>$1</sub>').replace(/∠B(\d)/g, '∠B<sub>$1</sub>'), calc);
  },
  function angleName(l) {
    const th = pick([50, 60, 65, 70]), same = Math.random() < .25; let i, j, nm;
    do { i = ri(1, 4); j = ri(1, 4); nm = PAIR.name(i, j, same); } while (!nm || (same && i === j));
    const show = {}; show['A' + i] = 'A' + i; show[(same ? 'A' : 'B') + j] = (same ? 'A' : 'B') + j;
    const right = nm, all = ['corresponding angles (F-angles)', 'alternate angles (Z-angles)', 'vertically opposite angles', 'angles on a straight line'];
    return ch(p('Lines <i>k</i> and <i>l</i> are parallel. What do you call the pair ' + A_('A') + '<sub>' + i + '</sub> and ' + A_(same ? 'A' : 'B') + '<sub>' + j + '</sub>?') + parFig(th, show), right, all.filter(x => x !== right), 'F-angles: same position at both crossings. Z-angles: on opposite sides of the transversal, between the parallel lines.', 'They are ' + right + '.');
  }
];
function ptFig(b, c) {   // triangle ABC with DE parallel to BC, base angles labelled
  const R = Math.PI / 180, C = Math.sin(b * R) / Math.sin((b + c) * R), P = { B: [0, 0], C: [1, 0], A: [C * Math.cos(b * R) * 0 + 1 - C * Math.cos(c * R), C * Math.sin(c * R)] };
  P.D = [P.A[0] + (P.B[0] - P.A[0]) * .45, P.A[1] + (P.B[1] - P.A[1]) * .45]; P.E = [P.A[0] + (P.C[0] - P.A[0]) * .45, P.A[1] + (P.C[1] - P.A[1]) * .45];
  return flatFig(P, { poly: ['A', 'B', 'C'], polys: [['D', 'E']], angles: [['B', deg(b)], ['C', deg(c)], ['D', '?', 22]], W: 280, H: 200 });
}
XG['7.1'] = [
  function parallelTriangle(l) {
    // triangle ADE with DE parallel to BC: ∠B given, ∠C... book ex. 12
    const b = ri(45, 80), c = ri(40, 80), a = 180 - b - c;
    return angQ(p('In triangle ABC, DE is parallel to BC (D on AB, E on AC). ' + A_('B') + ' = ' + deg(b) + ' and ' + A_('C') + ' = ' + deg(c) + '. Calculate ' + A_('ADE') + '.') + ptFig(b, c), b, '∠ADE and ∠B are corresponding angles (F-angles).', A_('ADE') + ' = ' + A_('B') + ' = ' + deg(b) + ' (corresponding angles, DE ∥ BC)', false);
  },
  function isoParallel(l) {
    const q = 2 * ri(15, 60), pr = (180 - q) / 2;
    return angQ(p('Triangle PQR is isosceles with PQ = RQ and ' + A_('Q') + ' = ' + deg(q) + '. Line <i>m</i> through Q is parallel to PR. Calculate the angle between line <i>m</i> and side QR.'), pr, 'First the base angles of the isosceles triangle. Then use alternate angles (Z) with the parallel line.' + HINT_STEP.replace('180 − 36 − 119', '(180 − ' + q + ') / 2'), A_('P') + ' + ' + A_('R') + ' = 180° − ' + deg(q) + ' = ' + deg(180 - q) + ' (sum of the angles in a triangle)<br>' + A_('R') + ' = ' + deg(180 - q) + ' : 2 = ' + deg(pr) + ' (isosceles triangle)<br>The angle at Q = ' + A_('R') + ' = ' + deg(pr) + ' (alternate angles)', true);
  }
];

/* ======================= 7.2 Similar figures ======================= */
const KS = [[2, 1], [3, 1], [3, 2], [5, 2], [1, 2], [5, 4], [4, 5], [2, 5], [4, 3], [6, 5], [3, 4]];
const kOf = l => pick(l === 0 ? [[2, 1], [3, 1], [1, 2], [4, 1]] : l === 1 ? KS.slice(0, 7) : KS);
const kTxt = k => k[1] === 1 ? String(k[0]) : k[0] % k[1] === 0 ? String(k[0] / k[1]) : dec(k[0] / k[1]).length <= 4 ? dec(k[0] / k[1]) : fr(k[0], k[1]);
G['7.2'] = [
  function scaleFactor(l) {
    const k = kOf(l), base = ri(2, 12) * k[1], img = base * k[0] / k[1], ans = k[0] / k[1], nm = pick(['a photo', 'a rectangle', 'a triangle', 'a map']);
    const html = p('A figure is enlarged (or reduced). A side of <b>' + base + ' cm</b> becomes <b>' + img + ' cm</b>. What is the scale factor? <small>(A decimal or a fraction like 2/3.)</small>'), st = 'scale factor = ' + img + ' : ' + base + ' = ' + kTxt(k);
    if (dec(ans).length > 5) return Object.assign({ type: 'expr', html, ans: ratText(k[0], k[1]), form: null, hint: 'scale factor = new length ÷ old length.', steps: st, keys: ['/'], noStep: true });
    return nu(html, ans, 'scale factor = new length ÷ old length.', st, { noStep: true, ansText: kTxt(k) });
  },
  function missingSide(l) {
    const k = kOf(l), n1 = pick(['ABCD', 'KLMN']), n2 = n1 === 'ABCD' ? 'PQRS' : 'WXYZ', s = [0, 1, 2, 3].map(() => ri(2, 9) * k[1]), t = s.map(x => x * k[0] / k[1]);
    const sd = (n, i) => n[i] + n[(i + 1) % 4], known = ri(0, 3); let ask; do { ask = ri(0, 3); } while (ask === known);
    const toBig = Math.random() < .5, f = kTxt(k);   // ask in the second figure (multiply by k) or in the first (divide by k)
    const cols = [known, ask].map(i => [sd(n1, i), i === ask && !toBig ? '?' : dec(s[i]), sd(n2, i), i === ask && toBig ? '?' : dec(t[i])]);
    const ans = toBig ? t[ask] : s[ask];
    return nu(p('Quadrilaterals ' + n1 + ' and ' + n2 + ' are similar (the letters are in matching order). Calculate the side with the question mark.') + ratioTable(n1, n2, cols), rd(ans, 4), 'Find the scale factor from ' + n1 + ' to ' + n2 + ' with the pair of sides you know. Then multiply or divide.', 'scale factor = ' + sd(n2, known) + ' : ' + sd(n1, known) + ' = ' + dec(t[known]) + ' : ' + dec(s[known]) + ' = ' + f + '<br>' + (toBig ? sd(n2, ask) + ' = ' + f + ' · ' + dec(s[ask]) : sd(n1, ask) + ' = ' + dec(t[ask]) + ' : ' + f) + ' = ' + dec(ans), { noStep: true });
  },
  function whichTrue(l) {
    const T = ['Similar figures have equal corresponding angles.', 'If a figure is enlarged with scale factor 1, it stays the same size.', 'A scale factor smaller than 1 makes a figure smaller.', 'All squares are similar to each other.', 'All circles are similar to each other.'];
    const F = ['Similar figures always have the same size.', 'A scale factor is always bigger than 1.', 'All rectangles are similar to each other.', 'In similar figures all sides are equal.', 'An enlargement changes the angles of a figure.', 'All isosceles triangles are similar to each other.'];
    const right = pick(T);
    return ch(p('Which statement is <b>true</b>?'), right, shuffle(F).slice(0, 3), 'Similar = same shape (equal angles), but not necessarily the same size.', right);
  },
  function rectSimilar(l) {
    const a = ri(2, 8), b = ri(a + 1, 12), k = kOf(l), sim = Math.random() < .5, c = a * k[0] / k[1], d = sim ? b * k[0] / k[1] : b * k[0] / k[1] + pick([1, 2, -1]);
    if (d <= 0 || c === d) return G['7.2'][3](l);
    const right = sim ? 'Yes, they are similar' : 'No, they are not similar';
    return ch(p('Rectangle 1 is ' + a + ' by ' + b + ' cm. Rectangle 2 is ' + dec(c) + ' by ' + dec(d) + ' cm. Are the rectangles similar?'), right, [sim ? 'No, they are not similar' : 'Yes, they are similar', 'You cannot tell without the angles'], 'Rectangles always have 90° angles. Check if both sides are multiplied by the same factor.', 'short sides: ' + dec(c) + ' : ' + a + ' = ' + dec(c / a) + '<br>long sides: ' + dec(d) + ' : ' + b + ' = ' + dec(rd(d / b, 4)) + '<br>' + (sim ? 'The same factor, so the rectangles are similar.' : 'Not the same factor, so not similar.'));
  }
];
XG['7.2'] = [
  function twoWays(l) {
    const a = pick([12, 16, 20]), b = pick([8, 10, 12, 15].filter(x => x < a)), L = pick([24, 28, 30, 36, 40]), k = L / a;
    return nu(p('A photo of ' + a + ' cm by ' + b + ' cm is enlarged. The <b>long</b> side of the enlargement is ' + L + ' cm. How long is the short side of the enlargement (in cm)?'), rd(b * k, 4), 'scale factor = ' + L + ' : ' + a + '.', 'scale factor = ' + L + ' : ' + a + ' = ' + dec(k) + '<br>short side = ' + dec(k) + ' · ' + b + ' = ' + dec(b * k) + ' cm', { noStep: true });
  }
];

/* ======================= 7.3 Area and volume ======================= */
G['7.3'] = [
  function areaTimes(l) {
    const k = l === 0 ? ri(2, 5) : pick([2, 3, 4, 5, 10, 1.5, 2.5]), what = pick(['area', 'volume', 'perimeter']);
    const ans = what === 'area' ? k * k : what === 'volume' ? k ** 3 : k;
    return nu(p('A figure is enlarged with scale factor <b>' + k + '</b>. How many times as large does the <b>' + what + '</b> become?'), rd(ans, 4), 'Lengths (and the perimeter): × k. Area: × k². Volume: × k³.', what + ': ' + (what === 'area' ? k + '² = ' : what === 'volume' ? k + '³ = ' : '') + dec(ans) + ' times as large', { noStep: true });
  },
  function newArea(l) {
    const k = l === 0 ? ri(2, 4) : pick([2, 3, 1.5, 0.5, 2.5, 4]), A = ri(3, 30) * 4, what = l === 2 ? pick(['area', 'volume']) : 'area';
    const f = what === 'area' ? k * k : k ** 3, ans = rd(A * f, 4), u = what === 'area' ? 'cm²' : 'cm³';
    return nu(p('A solid has a ' + (what === 'area' ? 'surface area' : 'volume') + ' of <b>' + A + ' ' + u + '</b>. It is enlarged with scale factor <b>' + k + '</b>. Calculate the new ' + (what === 'area' ? 'surface area' : 'volume') + ' (in ' + u + ').'), ans, what === 'area' ? 'Area becomes k² times as large.' : 'Volume becomes k³ times as large.', (what === 'area' ? k + '² = ' : k + '³ = ') + dec(f) + '<br>new ' + what + ' = ' + dec(f) + ' · ' + A + ' = ' + dec(ans) + ' ' + u, { needStep: true });
  },
  function findK(l) {
    const k = l === 0 ? ri(2, 6) : pick([2, 3, 4, 5, 1.5, 2.5, 10]), vol = l === 2 && Math.random() < .5, f = vol ? k ** 3 : k * k;
    return nu(p('A figure is enlarged. The ' + (vol ? 'volume' : 'area') + ' becomes <b>' + dec(f) + '</b> times as large. What is the scale factor?'), k, vol ? 'Volume factor = k³. Which number to the power 3 gives ' + dec(f) + '?' : 'Area factor = k². Take the square root.', 'k' + (vol ? '³' : '²') + ' = ' + dec(f) + ', so k = ' + (vol ? '∛' : '√') + dec(f) + ' = ' + k, { noStep: true });
  },
  function cubeEnlarge(l) {
    const r = ri(2, 6), k = ri(2, 5), ask = pick(['area', 'volume']);
    const A = 6 * r * r, V = r ** 3, ans = ask === 'area' ? A * k * k : V * k ** 3;
    return nu(p('A cube with edges of ' + r + ' cm is enlarged with scale factor ' + k + '. Calculate the ' + (ask === 'area' ? 'surface area' : 'volume') + ' of the enlarged cube (in ' + (ask === 'area' ? 'cm²' : 'cm³') + ').'), ans, 'First the ' + (ask === 'area' ? 'surface area' : 'volume') + ' of the original cube. Then multiply by k' + (ask === 'area' ? '²' : '³') + '. (Or first enlarge the edge.)', ask === 'area' ? 'original: 6 · ' + r + ' · ' + r + ' = ' + A + ' cm²<br>new: ' + k + '² · ' + A + ' = ' + ans + ' cm²' : 'original: ' + r + ' · ' + r + ' · ' + r + ' = ' + V + ' cm³<br>new: ' + k + '³ · ' + V + ' = ' + ans + ' cm³', { needStep: true });
  }
];
XG['7.3'] = [
  function mapArea(l) {
    const n = pick([10000, 20000, 50000, 100000]), a = ri(2, 12), real = a * n * n / 1e10;
    return nu(p('On a map with scale 1 : ' + n.toLocaleString('en').replace(/,/g, ' ') + ', a lake has an area of <b>' + a + ' cm²</b>. What is the real area in <b>km²</b>?'), rd(real, 6), 'Lengths are ' + n + ' times as large, so areas are ' + n + '² times as large. 1 km² = 10 000 000 000 cm².', 'area factor = ' + n + '²<br>real area = ' + a + ' · ' + n + '² cm² = ' + (a * n * n).toLocaleString('en').replace(/,/g, ' ') + ' cm² = ' + dec(real) + ' km²', { noStep: true });
  },
  function heavier(l) {
    const k = pick([1.5, 2, 3]), w = ri(2, 20) * 10;
    return nu(p('Two marbles are made of the same glass. The big one has a diameter that is ' + k + ' times as large. The small marble weighs ' + w + ' g. How many grams does the big marble weigh?'), rd(w * k ** 3, 3), 'Weight goes with volume: k³.', k + '³ = ' + dec(k ** 3) + '<br>' + dec(k ** 3) + ' · ' + w + ' = ' + dec(w * k ** 3) + ' g', { needStep: true });
  }
];

/* ======================= 7.4 Similar polygons ======================= */
G['7.4'] = [
  function corrSide(l) {
    const n1 = pick(['ABC', 'DEF']), perm = shuffle([0, 1, 2]), n2 = ['K', 'L', 'M'];
    const map = {}; perm.forEach((pp, i) => { map[n1[i]] = n2[pp]; });
    const pairTxt = n1.split('').map(c => A_(c) + ' = ' + A_(map[c])).join(', '), i = ri(0, 2), j = (i + 1) % 3;
    const side = n1[i] + n1[j], right = [map[n1[i]], map[n1[j]]].sort().join('');
    const wrongs = ['KL', 'LM', 'KM'].filter(x => x !== right);
    return ch(p('Triangles ' + n1 + ' and KLM are similar with ' + pairTxt + '. Which side of triangle KLM corresponds to side <b>' + side + '</b>?'), right, wrongs, 'Corresponding sides connect corresponding vertices.', n1[i] + ' corresponds to ' + map[n1[i]] + ' and ' + n1[j] + ' corresponds to ' + map[n1[j]] + ', so ' + side + ' corresponds to ' + right + '.');
  },
  function ratioCheck(l) {
    const k = kOf(l), s = [ri(2, 9), ri(2, 9), ri(2, 9)].map(x => x * k[1]), sim = Math.random() < .55, t = s.map(x => x * k[0] / k[1]);
    if (!sim) t[ri(0, 2)] += pick([1, 2]);
    if (new Set(s).size < 3 && !sim) return G['7.4'][1](l);
    const f = k[0] / k[1], right = sim ? 'Yes, scale factor ' + kTxt(k) : 'No, they are not similar';
    return ch(p('Triangle ABC has AB = ' + dec(s[0]) + ', BC = ' + dec(s[1]) + ', CA = ' + dec(s[2]) + '. Triangle DEF has DE = ' + dec(t[0]) + ', EF = ' + dec(t[1]) + ', FD = ' + dec(t[2]) + '. Are the triangles similar (ABC to DEF)?'), right, [sim ? 'No, they are not similar' : 'Yes, scale factor ' + kTxt(k), 'Yes, scale factor ' + dec(rd(1 / f, 3)), 'Yes, scale factor ' + dec(f + 1)].filter(x => x !== right), 'Make a ratio table. Similar means: every side is multiplied by the same number.', 'DE : AB = ' + dec(rd(t[0] / s[0], 4)) + ', EF : BC = ' + dec(rd(t[1] / s[1], 4)) + ', FD : CA = ' + dec(rd(t[2] / s[2], 4)) + '<br>' + (sim ? 'All the same: it is a ratio table, so the triangles are similar with scale factor ' + kTxt(k) + '.' : 'Not all the same: not a ratio table, so not similar.'));
  },
  function missingAngle(l) {
    const a = ri(60, 120), b = ri(60, 120), c = ri(60, 120), d = 360 - a - b - c;
    if (d < 40 || d > 170) return G['7.4'][2](l);
    return angQ(p('Quadrilateral KLMN is similar to quadrilateral PQRS (K ↔ P, L ↔ Q, M ↔ R, N ↔ S). ' + A_('K') + ' = ' + deg(a) + ', ' + A_('L') + ' = ' + deg(b) + ' and ' + A_('R') + ' = ' + deg(c) + '. Calculate ' + A_('S') + '.'), d, 'Corresponding angles are equal: ∠P = ∠K, ∠Q = ∠L, ∠M = ∠R. Then use the angle sum 360°.' + HINT_STEP.replace('180 − 36 − 119', '360 − ' + a + ' − ' + b + ' − ' + c), A_('P') + ' = ' + A_('K') + ' = ' + deg(a) + ', ' + A_('Q') + ' = ' + A_('L') + ' = ' + deg(b) + '<br>' + A_('S') + ' = 360° − ' + deg(a) + ' − ' + deg(b) + ' − ' + deg(c) + ' = ' + deg(d) + ' (sum of the angles in a quadrilateral)', true);
  },
  function polySide(l) {
    const k = kOf(l), s = [ri(2, 8), ri(2, 8), ri(2, 8), ri(2, 8), ri(2, 8)].map(x => x * k[1] * 2), t = s.map(x => x * k[0] / k[1]), known = ri(0, 4); let ask; do { ask = ri(0, 4); } while (ask === known);
    const n1 = 'ABCDE', n2 = 'PQRST', sd = (n, i) => n[i] + n[(i + 1) % 5];
    return nu(p('Pentagons ABCDE and PQRST are similar. ' + sd(n1, known) + ' = ' + dec(s[known]) + ', ' + sd(n2, known) + ' = ' + dec(t[known]) + ' and ' + sd(n1, ask) + ' = ' + dec(s[ask]) + '. Calculate <b>' + sd(n2, ask) + '</b>.'), rd(t[ask], 4), 'scale factor = ' + sd(n2, known) + ' : ' + sd(n1, known) + '.', 'scale factor = ' + dec(t[known]) + ' : ' + dec(s[known]) + ' = ' + dec(k[0] / k[1]) + '<br>' + sd(n2, ask) + ' = ' + dec(k[0] / k[1]) + ' · ' + dec(s[ask]) + ' = ' + dec(t[ask]), { noStep: true });
  }
];

/* ======================= 7.5 Similar triangles ======================= */
function nestedFig(ad, ab, labs) {   // triangle ABC with D on AB, E on AC, DE parallel to BC
  const t = ad / ab, P = { A: [0, 3], B: [-1.6, 0], C: [2.2, 0] }; P.D = [P.A[0] + (P.B[0] - P.A[0]) * t, P.A[1] + (P.B[1] - P.A[1]) * t]; P.E = [P.A[0] + (P.C[0] - P.A[0]) * t, P.A[1] + (P.C[1] - P.A[1]) * t];
  return flatFig(P, { poly: ['A', 'B', 'C'], polys: [['D', 'E']], sides: labs, W: 280, H: 200 });
}
function hourFig(labs) {   // AB parallel to DE, AE and BD cross at C
  const P = { A: [0, 3], B: [2.4, 3], C: [1.5, 1.8], D: [0.3, 0], E: [3.3, 0] };
  P.D = [P.C[0] - (P.B[0] - P.C[0]) * 1.5, P.C[1] - (P.B[1] - P.C[1]) * 1.5]; P.E = [P.C[0] - (P.A[0] - P.C[0]) * 1.5, P.C[1] - (P.A[1] - P.C[1]) * 1.5];
  return flatFig(P, { polys: [['A', 'B', 'C'], ['C', 'D', 'E']], sides: labs, W: 280, H: 210 });
}
G['7.5'] = [
  function nested(l) {
    const ad = ri(2, 8), db = ri(2, 8), ab = ad + db, de = ri(2, 9) * (l < 2 ? ad / gcd(ab, ad) : 1), bc = de * ab / ad;
    if (l < 2 && !Number.isInteger(rd(bc * 100, 6))) return G['7.5'][0](l);
    return nu(p('In triangle ABC, DE ∥ BC. AD = ' + ad + ', DB = ' + db + ' and DE = ' + dec(de) + '. Calculate <b>BC</b>' + (Number.isInteger(rd(bc * 100, 6)) ? '.' : ', rounded to 1 decimal place.')) + nestedFig(ad, ab, [['A', 'D', String(ad), 'in'], ['D', 'B', String(db)], ['D', 'E', dec(de), 'in'], ['B', 'C', '?']]), Number.isInteger(rd(bc * 100, 6)) ? rd(bc, 4) : rd(bc, 1), 'Triangles ADE and ABC are similar (F-angles). AB = AD + DB. Make a ratio table.', A_('ADE') + ' = ' + A_('B') + ' (corresponding angles) and ' + A_('A') + ' = ' + A_('A') + ' (same angle), so ΔADE ∼ ΔABC.<br>AB = ' + ad + ' + ' + db + ' = ' + ab + '<br>' + ratioTable('ΔADE', 'ΔABC', [['AD', ad, 'AB', ab], ['DE', dec(de), 'BC', '?']]) + 'scale factor = ' + ab + ' : ' + ad + (Number.isInteger(ab / ad) ? ' = ' + ab / ad : '') + '<br>BC = ' + (Number.isInteger(ab / ad) ? ab / ad : ab + '/' + ad) + ' · ' + dec(de) + ' = ' + dec(bc), Object.assign({ noStep: true }, Number.isInteger(rd(bc * 100, 6)) ? {} : { tol: .051 }));
  },
  function hourglass(l) {
    const k = kOf(Math.max(l, 1)), ac = ri(2, 8) * k[1], ab = ri(2, 9) * k[1], ce = ac * k[0] / k[1], de = ab * k[0] / k[1], askDE = Math.random() < .5;
    const labs = askDE ? [['A', 'B', String(ab)], ['A', 'C', String(ac)], ['C', 'E', dec(ce)], ['D', 'E', '?']] : [['A', 'B', String(ab)], ['A', 'C', String(ac)], ['C', 'E', '?'], ['D', 'E', dec(de)]];
    const ans = askDE ? de : ce;
    return nu(p('AB ∥ DE. Lines AE and BD cross at C. AB = ' + ab + ', AC = ' + ac + ' and ' + (askDE ? 'CE = ' + dec(ce) + '. Calculate <b>DE</b>.' : 'DE = ' + dec(de) + '. Calculate <b>CE</b>.')) + hourFig(labs), rd(ans, 4), 'The triangles ABC and EDC are similar: alternate angles (Z) and vertically opposite angles. Match the sides carefully.', A_('A') + ' = ' + A_('E') + ' (alternate angles) and ' + A_('ACB') + ' = ' + A_('ECD') + ' (vertically opposite), so ΔABC ∼ ΔEDC.<br>' + ratioTable('ΔABC', 'ΔEDC', [['AB', ab, 'ED', askDE ? '?' : dec(de)], ['AC', ac, 'EC', askDE ? dec(ce) : '?']]) + 'scale factor = ' + (askDE ? dec(ce) + ' : ' + ac : dec(de) + ' : ' + ab) + ' = ' + kTxt(k) + '<br>' + (askDE ? 'DE = ' + kTxt(k) + ' · ' + ab : 'CE = ' + kTxt(k) + ' · ' + ac) + ' = ' + dec(ans), { noStep: true });
  },
  function shadow(l) {
    const stick = pick([1, 1.5, 2]), ss = pick([0.8, 1.2, 1.5, 2, 2.5, 3]), tsh = ri(5, 25), h = stick * tsh / ss, exact = Number.isInteger(rd(h * 10, 6));
    return nu(p('A stick of <b>' + stick + ' m</b> casts a shadow of <b>' + ss + ' m</b>. At the same moment a tree casts a shadow of <b>' + tsh + ' m</b>. How tall is the tree' + (exact ? ' (in m)?' : ', rounded to 1 decimal place?')), exact ? rd(h, 4) : rd(h, 1), 'The sun makes the same angle at the same moment, so the two triangles are similar.', ratioTable('stick', 'tree', [['height', stick, 'height', '?'], ['shadow', ss, 'shadow', tsh]]) + 'scale factor = ' + tsh + ' : ' + ss + ' = ' + dec(rd(tsh / ss, 4)) + '<br>tree = ' + dec(rd(tsh / ss, 4)) + ' · ' + stick + (exact ? ' = ' + dec(h) : ' ≈ ' + rd(h, 1)) + ' m', Object.assign({ noStep: true }, exact ? {} : { tol: .051 }));
  },
  function whySimilar(l) {
    const kind = pick(['aa', 'aa', 'sss', 'none']);
    let html, right;
    if (kind === 'aa') { const a = ri(30, 80), b = ri(30, 80); html = 'Triangle ABC has ' + A_('A') + ' = ' + deg(a) + ' and ' + A_('B') + ' = ' + deg(b) + '. Triangle KLM has ' + A_('K') + ' = ' + deg(a) + ' and ' + A_('M') + ' = ' + deg(180 - a - b) + '.'; right = 'Similar: two pairs of equal angles'; }
    else if (kind === 'sss') { const s = [ri(3, 9), ri(3, 9), ri(3, 9)], k = pick([2, 3, 1.5]); html = 'Triangle ABC has sides ' + s.join(', ') + '. Triangle KLM has sides ' + s.map(x => dec(x * k)).join(', ') + '.'; right = 'Similar: the sides form a ratio table'; }
    else { const a = ri(30, 70), b = ri(30, 70); html = 'Triangle ABC has ' + A_('A') + ' = ' + deg(a) + ' and ' + A_('B') + ' = ' + deg(b) + '. Triangle KLM has ' + A_('K') + ' = ' + deg(a) + ' and ' + A_('L') + ' = ' + deg(b + pick([5, 10])) + ' and ' + A_('M') + ' = ' + deg(180 - a - b - 5) + '.'; right = 'Not similar'; }
    if (kind === 'none') html = html.replace(/ and ∠M = \d+°\./, '.');
    const st = kind === 'aa' ? 'In triangle KLM: ' + A_('L') + ' = 180° − ' + html.match(/∠K = (\d+)/)[1] + '° − ' + html.match(/∠M = (\d+)/)[1] + '°, which equals ∠B. So two pairs of angles are equal: similar.' : kind === 'sss' ? 'Every side is multiplied by the same factor: it is a ratio table, so similar.' : 'The third angles are different (' + A_('C') + ' and ' + A_('M') + ' do not match), so the angles are not all equal: not similar.';
    return ch(p(html + ' What can you say?'), right, ['Similar: two pairs of equal angles', 'Similar: the sides form a ratio table', 'Not similar'].filter(x => x !== right), 'Similar triangles: two pairs of equal angles, or all three pairs of sides in one ratio table.', st);
  },
  function nestedPart(l) {
    const sm = ri(3, 8), k = pick([1.4, 1.5, 2, 2.5, 3]), sq = rd(sm * k, 4), ml = ri(4, 12), qr = rd(ml * k, 4);
    return nu(p('In triangle SQR, line ML ∥ QR, with M on SQ and L on SR. SM = ' + sm + ', ML = ' + ml + ' and QR = ' + dec(qr) + '. Calculate <b>MQ</b>.'), rd(sq - sm, 4), 'ΔSML ∼ ΔSQR (F-angles). Use the scale factor to find SQ first, then MQ = SQ − SM.', ratioTable('ΔSML', 'ΔSQR', [['SM', sm, 'SQ', '?'], ['ML', ml, 'QR', dec(qr)]]) + 'scale factor = ' + dec(qr) + ' : ' + ml + ' = ' + dec(k) + '<br>SQ = ' + dec(k) + ' · ' + sm + ' = ' + dec(sq) + '<br>MQ = ' + dec(sq) + ' − ' + sm + ' = ' + dec(rd(sq - sm, 4)), { needStep: true });
  }
];
XG['7.5'] = [
  function similarPyth(l) {
    const t = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]), k = pick([2, 3, 0.5]);
    return nu(p('Right-angled triangles ABC and DEF are similar (A ↔ D, B ↔ E, C ↔ F, right angles at C and F). AB = ' + t[2] + ', AC = ' + t[0] + ' and DE = ' + dec(t[2] * k) + '. Calculate <b>EF</b>.'), rd(t[1] * k, 4), 'First calculate BC with Pythagoras. Then use the scale factor.', 'BC² = ' + t[2] + '² − ' + t[0] + '² = ' + (t[2] ** 2 - t[0] ** 2) + ', BC = ' + t[1] + '<br>scale factor = ' + dec(t[2] * k) + ' : ' + t[2] + ' = ' + k + '<br>EF = ' + k + ' · ' + t[1] + ' = ' + dec(t[1] * k), { noStep: true });
  },
  function towerShadow(l) {
    const ab = rd(ri(150, 250) / 10, 1), db = rd(ri(40, 70) / 10, 1), ed = rd(ri(40, 60) / 10, 1), ca = ab * ed / db;
    return nu(p('To measure a tower, Sam stands so that the top of a pole and the top of the tower are in one line from point B on the ground. Distance from B to the tower: ' + ab + ' m. From B to the pole: ' + db + ' m. The pole is ' + ed + ' m high. How high is the tower? Round to 1 decimal place.'), rd(ca, 1), 'Two similar right-angled triangles share angle B.', 'scale factor = ' + ab + ' : ' + db + ' ≈ ' + rd(ab / db, 4) + '<br>tower = ' + rd(ab / db, 4) + ' · ' + ed + ' ≈ ' + rd(ca, 1) + ' m', { noStep: true, tol: .051 });
  }
];

const SECTIONS = [
  { id: '7.1', title: '7.1 Angles', sub: 'Triangles, quadrilaterals, parallel lines (F and Z)' },
  { id: '7.2', title: '7.2 Similar figures', sub: 'Enlarging and the scale factor' },
  { id: '7.3', title: '7.3 Area and volume', sub: 'k² for area, k³ for volume' },
  { id: '7.4', title: '7.4 Similar polygons', sub: 'Corresponding angles and sides, ratio tables' },
  { id: '7.5', title: '7.5 Similar triangles', sub: 'Equal angles, ratio tables, parallel lines, shadows' }
];
const GOALS = [
  ['7.1', 'I can calculate angles in triangles and quadrilaterals and give the reason', ['triSum', 'isoTri', 'quadAngles', 'straightVert'], 'Write the reason after every step, like (sum of the angles in a triangle).'],
  ['7.1', 'I can use corresponding (F) and alternate (Z) angles', ['parallel', 'angleName'], 'With parallel lines: F-angles and Z-angles are equal.'],
  ['7.2', 'I can calculate and use a scale factor', ['scaleFactor', 'missingSide', 'whichTrue', 'rectSimilar'], 'scale factor = new length ÷ old length.'],
  ['7.3', 'I can calculate how area and volume change when you enlarge', ['areaTimes', 'newArea', 'findK', 'cubeEnlarge'], 'Area × k², volume × k³.'],
  ['7.4', 'I can find corresponding sides and angles of similar figures', ['corrSide', 'ratioCheck', 'missingAngle', 'polySide'], 'Corresponding vertices are in the same order.'],
  ['7.5', 'I can show that triangles are similar and calculate sides', ['nested', 'hourglass', 'shadow', 'whySimilar', 'nestedPart'], 'Look for F-angles, Z-angles, vertically opposite angles or a shared angle.']
];
/* ======================= 3VT chapter 7: reasoning, congruence, bisectors, altitudes, medians, circles ======================= */
if (P.cls === '3VT') {
  const N_ = n => (n < 0 ? '−' : '') + Math.abs(n), Pa = n => n < 0 ? '(' + N_(n) + ')' : String(n);
  const P2 = (x, y) => '(' + N_(x) + ', ' + N_(y) + ')';
  const ptQ = (html, x, y, hint, steps) => ({ type: 'point', ans: [x, y], html: html + p('<small>Type a point like (3, −2).</small>'), hint, steps, noStep: true });
  const V1 = [
    function exteriorAngle(l) {
      let a, b; do { a = ri(25, 85); b = ri(25, 85); } while (a + b >= 160);
      const n = pick(LET), ext = a + b;
      return angQ(p('In triangle ' + n + ', ' + A_(n[0]) + ' = ' + deg(a) + ' and ' + A_(n[1]) + ' = ' + deg(b) + '. Side ' + n[1] + n[2] + ' is extended beyond ' + n[2] + '. Calculate the exterior angle at ' + n[2] + '.' + HINT_STEP), ext, 'The exterior angle of a triangle equals the sum of the two opposite interior angles.', p(A_(n[2]) + ' = 180 − ' + a + ' − ' + b + ' = ' + (180 - ext) + '° (sum of the angles in a triangle)') + p('exterior angle = 180 − ' + (180 - ext) + ' = ' + ext + '° (straight angle)') + p('Check: ' + a + ' + ' + b + ' = ' + ext + '.'), true);
    },
    function defOrTheorem(l) {
      const D = [['A rhombus is a quadrilateral with four sides of equal length.', 'definition'], ['A straight angle is 180°.', 'definition'], ['An isosceles triangle has two sides of equal length.', 'definition'], ['An angle bisector divides an angle into two equal angles.', 'definition'], ['A median joins a vertex to the midpoint of the opposite side.', 'definition'],
        ['The sum of the angles in a triangle is 180°.', 'theorem'], ['Vertically opposite angles are equal.', 'theorem'], ['The diagonals of a rhombus are perpendicular.', 'theorem'], ['The exterior angle of a triangle equals the sum of the two opposite interior angles.', 'theorem'], ['The three medians of a triangle meet in one point.', 'theorem']];
      const d = pick(D);
      return ch(p('Is this a definition or a theorem?') + p('<i>' + d[0] + '</i>'), d[1], ['definition', 'theorem', 'conjecture'].filter(o => o !== d[1]), 'A definition describes what a word means. A theorem is a statement that has been proved.', d[1] === 'definition' ? 'This tells you what the word means: a definition.' : 'This is a property that is proved from definitions: a theorem.');
    }
  ];
  const V2 = [
    function whichPostulate(l) {
      const n = pick([['ABC', 'DEF'], ['KLM', 'PQR']]), [a, b] = n, k = pick([2, 3, 1.5, 0.5]);
      const C = [
        ['aa', A_(a[0]) + ' = ' + A_(b[0]) + ' and ' + A_(a[1]) + ' = ' + A_(b[1])],
        ['sss', b[0] + b[1] + ' = ' + k + ' · ' + a[0] + a[1] + ', ' + b[1] + b[2] + ' = ' + k + ' · ' + a[1] + a[2] + ' and ' + b[0] + b[2] + ' = ' + k + ' · ' + a[0] + a[2]],
        ['sas', b[0] + b[1] + ' = ' + k + ' · ' + a[0] + a[1] + ', ' + A_(a[1]) + ' = ' + A_(b[1]) + ' and ' + b[1] + b[2] + ' = ' + k + ' · ' + a[1] + a[2]],
        ['ssr', A_(a[2]) + ' = ' + A_(b[2]) + ' = 90°, ' + b[0] + b[1] + ' = ' + k + ' · ' + a[0] + a[1] + ' and ' + b[1] + b[2] + ' = ' + k + ' · ' + a[1] + a[2]]
      ], c = pick(C);
      return ch(p('For triangles ' + a + ' and ' + b + ' you know: ' + c[1] + '. Which similarity postulate shows that Δ' + a + ' ∼ Δ' + b + '?'), c[0], ['aa', 'sss', 'sas', 'ssr', 'ssa'].filter(o => o !== c[0]).slice(0, 3), 'aa: two angles. sss: three sides with the same factor. sas: two sides and the angle between them. ssr: right angle, hypotenuse and another side.', { aa: 'Two pairs of equal angles: aa.', sss: 'All three sides are multiplied by ' + k + ': sss.', sas: 'Two sides with factor ' + k + ' and the angle between them is equal: sas.', ssr: 'A right angle, the hypotenuse and one other side with factor ' + k + ': ssr.' }[c[0]]);
    },
    function congruentFactor(l) {
      const k = pick([1, 1, 2, 0.5, 3]), right = k === 1 ? 'congruent (and similar)' : 'similar, not congruent';
      return ch(p('Two triangles are similar with scale factor ' + k + '. Are they congruent?'), right, ['congruent (and similar)', 'similar, not congruent', 'neither'].filter(o => o !== right), 'Congruent figures are similar with scale factor 1.', k === 1 ? 'Scale factor 1: the triangles are exactly the same size, so congruent.' : 'Scale factor ' + k + ' is not 1: one triangle is bigger, so not congruent.');
    }
  ];
  const V3 = [
    function whichLocus(l) {
      const C = [['all points at the same distance from A and B', 'the perpendicular bisector of AB'], ['all points at the same distance from the two arms of angle A', 'the bisector of angle A'], ['the line through the midpoint of AB, perpendicular to AB', 'the perpendicular bisector of AB'], ['the line that divides angle A into two equal angles', 'the bisector of angle A']], c = pick(C);
      return ch(p('What do you get: ' + c[0] + '?'), c[1], ['the perpendicular bisector of AB', 'the bisector of angle A', 'the median from A', 'the altitude from A'].filter(o => o !== c[1]), 'Perpendicular bisector: equal distance to two points. Angle bisector: equal distance to two lines.', 'This is ' + c[1] + '.');
    },
    function midpoint(l) {
      let x1, y1, x2, y2; do { x1 = ri(-8, 8); y1 = ri(-8, 8); x2 = ri(-8, 8); y2 = ri(-8, 8); } while ((x1 === x2 && y1 === y2) || (l < 2 && ((x1 + x2) % 2 || (y1 + y2) % 2)));
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return ptQ(p('The perpendicular bisector of AB passes through the midpoint of AB. Calculate this midpoint for A' + P2(x1, y1) + ' and B' + P2(x2, y2) + '.'), mx, my, 'Midpoint: the average of the ' + X_('x') + '-coordinates and the average of the ' + X_('y') + '-coordinates.', p('(' + N_(x1) + ' + ' + Pa(x2) + ') / 2 = ' + N_(mx) + ' and (' + N_(y1) + ' + ' + Pa(y2) + ') / 2 = ' + N_(my)) + p('The midpoint is ' + P2(mx, my) + '.'));
    },
    function bisectorsMeet(l) {
      let a, b; do { a = 2 * ri(15, 50); b = 2 * ri(15, 50); } while (a + b >= 170);
      const S = 180 - a / 2 - b / 2;
      return angQ(p('In triangle ABC, ' + A_('A') + ' = ' + deg(a) + ' and ' + A_('B') + ' = ' + deg(b) + '. The bisectors of angle A and angle B meet at S. Calculate ' + A_('ASB') + '.' + HINT_STEP), S, 'The bisector halves the angle. Then use the sum of the angles in triangle ABS.', p(A_('BAS') + ' = ' + a + ' : 2 = ' + a / 2 + '° (angle bisector)') + p(A_('ABS') + ' = ' + b + ' : 2 = ' + b / 2 + '° (angle bisector)') + p(A_('ASB') + ' = 180 − ' + a / 2 + ' − ' + b / 2 + ' = ' + S + '° (sum of the angles in a triangle)'), true);
    }
  ];
  const X_ = v => '<i>' + v + '</i>';
  const V4 = [
    function altitudeFromArea(l) {
      const base = pick([4, 5, 6, 8, 10, 12, 13]), h = pick([3, 4, 4.8, 6, 7.5, 9, 2.5]), area = rd(base * h / 2, 4), side = pick([5, 6, 8, 10, 15, 16]), h2 = rd(2 * area / side, 2);
      return nu(p('Triangle ABC has base AB = ' + base + ' and altitude CC′ = ' + h + '. Side BC = ' + side + '. Calculate the altitude AA′ from A to BC. <small>(Round to 2 decimals if needed.)</small>'), h2, 'The area is the same whichever side you use as the base: area = ½ · base · altitude.', p('area = ½ · ' + base + ' · ' + h + ' = ' + area) + p('½ · ' + side + ' · AA′ = ' + area) + p('AA′ = ' + rd(2 * area, 4) + ' : ' + side + (rd(2 * area / side, 2) === rd(2 * area / side, 6) ? ' = ' : ' ≈ ') + h2), { tol: .006, needStep: true });
    },
    function centroidSplit(l) {
      const m = 3 * pick([2, 3, 4, 5, 7, 2.5, 1.5]), part = pick(['AZ', 'ZD']), v = part === 'AZ' ? m * 2 / 3 : m / 3;
      return nu(p('In triangle ABC, AD is a median with length ' + m + '. Z is the centroid (where the medians meet). Calculate ' + part + '.'), rd(v, 4), 'The centroid divides each median in the ratio 2 : 1 (the longer part is at the vertex).', p('AZ : ZD = 2 : 1, so AZ = ⅔ · ' + m + ' = ' + rd(m * 2 / 3, 4) + ' and ZD = ⅓ · ' + m + ' = ' + rd(m / 3, 4)) + p(part + ' = ' + rd(v, 4)), { noStep: true });
    },
    function vertexFromCentroid(l) {
      let K, L, Mv; do { K = [ri(-6, 6), ri(-6, 6)]; L = [ri(-6, 6), ri(-6, 6)]; Mv = [ri(-6, 8), ri(-6, 8)]; } while ((K[0] + L[0]) % 2 || (K[1] + L[1]) % 2 || (K[0] + L[0] + Mv[0]) % 3 || (K[1] + L[1] + Mv[1]) % 3 || (K[0] === L[0] && K[1] === L[1]));
      const Pm = [(K[0] + L[0]) / 2, (K[1] + L[1]) / 2], Z = [(K[0] + L[0] + Mv[0]) / 3, (K[1] + L[1] + Mv[1]) / 3];
      return ptQ(p('Triangle KLM has K' + P2(K[0], K[1]) + ' and L' + P2(L[0], L[1]) + '. Its centroid is Z' + P2(Z[0], Z[1]) + '. Calculate the coordinates of M.'), Mv[0], Mv[1], 'P is the midpoint of KL. M lies on line PZ with ZM = 2 · PZ.', p('Midpoint of KL: P' + P2(Pm[0], Pm[1]) + '.') + p('From P to Z: ' + (Z[0] - Pm[0] >= 0 ? '+' : '') + N_(Z[0] - Pm[0]) + ' in the ' + X_('x') + '-direction and ' + (Z[1] - Pm[1] >= 0 ? '+' : '') + N_(Z[1] - Pm[1]) + ' in the ' + X_('y') + '-direction.') + p('From Z to M is twice as far: M' + P2(Mv[0], Mv[1]) + '.'));
    },
    function whichLine(l) {
      const C = [['a line segment from a vertex to the midpoint of the opposite side', 'median'], ['a line segment from a vertex perpendicular to the opposite side', 'altitude'], ['a line through the midpoint of a side, perpendicular to that side', 'perpendicular bisector'], ['a line that divides an angle of the triangle into two equal angles', 'angle bisector']], c = pick(C);
      return ch(p('What is the name of ' + c[0] + '?'), c[1], ['median', 'altitude', 'perpendicular bisector', 'angle bisector'].filter(o => o !== c[1]), 'Median: to the midpoint. Altitude: perpendicular, from a vertex.', 'This is the ' + c[1] + '.');
    }
  ];
  const V5 = [
    function whichCentre(l) {
      const c = pick([['inscribed circle', 'the three angle bisectors'], ['circumscribed circle', 'the three perpendicular bisectors']]);
      return ch(p('The centre of the ' + c[0] + ' of a triangle is the point of intersection of …'), c[1], ['the three angle bisectors', 'the three perpendicular bisectors', 'the three medians', 'the three altitudes'].filter(o => o !== c[1]), 'Inscribed circle: same distance to the three sides. Circumscribed circle: same distance to the three vertices.', 'The ' + c[0] + ': ' + c[1] + '.');
    },
    function rightCircumcentre(l) {
      let x1, y1, x2, y2; do { x1 = ri(-6, 4); y1 = ri(-6, 4); x2 = x1 + 2 * ri(1, 5) * pick([1, -1]); y2 = y1 + 2 * ri(1, 5) * pick([1, -1]); } while (false);
      return ptQ(p('Triangle ABC has A' + P2(x1, y1) + ', B' + P2(x2, y1) + ' and C' + P2(x1, y2) + '. The angle at A is 90°. Calculate the centre of the circumscribed circle.'), (x2 + x1) / 2, (y1 + y2) / 2, 'In a right-angled triangle the centre of the circumscribed circle is the midpoint of the hypotenuse.', p('The hypotenuse is BC.') + p('Midpoint of BC: ((' + N_(x2) + ' + ' + Pa(x1) + ') / 2, (' + N_(y1) + ' + ' + Pa(y2) + ') / 2) = ' + P2((x1 + x2) / 2, (y1 + y2) / 2)));
    },
    function circumRadius(l) {
      const a = ri(2, 12), b = ri(2, 12), r = Math.hypot(a, b) / 2, rr = rd(r, 2);
      return nu(p('A right-angled triangle has legs of ' + a + ' cm and ' + b + ' cm. Calculate the radius of its circumscribed circle. <small>(Round to 2 decimals.)</small>'), rr, 'The hypotenuse is a diameter of the circumscribed circle. Use Pythagoras.', p('hypotenuse = √(' + a + '² + ' + b + '²) = √' + (a * a + b * b) + (Number.isInteger(2 * r) ? ' = ' : ' ≈ ') + rd(2 * r, 2)) + p('radius = hypotenuse : 2' + (rd(r, 2) === rd(r, 6) ? ' = ' : ' ≈ ') + rr + ' cm'), { tol: .006, needStep: true });
    }
  ];
  const G1 = G['7.1'].concat(V1), G2 = V2.concat(G['7.5']), X1 = XG['7.1'], X2 = XG['7.5'];
  G['7.1'] = G1; G['7.2'] = G2; G['7.3'] = V3; G['7.4'] = V4; G['7.5'] = V5;
  XG['7.1'] = X1; XG['7.2'] = X2; XG['7.3'] = []; XG['7.4'] = []; XG['7.5'] = [];
  SECTIONS.splice(0, SECTIONS.length,
    { id: '7.1', title: '7.1 Reasoning with angles', sub: 'Definitions, theorems, angles in triangles and parallel lines' },
    { id: '7.2', title: '7.2 Similar and congruent triangles', sub: 'aa, sss, sas, ssr, calculating sides' },
    { id: '7.3', title: '7.3 Bisectors', sub: 'Angle bisector, perpendicular bisector' },
    { id: '7.4', title: '7.4 Altitudes and medians', sub: 'Altitude, area, median, centroid' },
    { id: '7.5', title: '7.5 Inscribed and circumscribed circles', sub: 'Centres and radius' });
  GOALS.splice(0, GOALS.length,
    ['7.1', 'I can reason with angles and give the reason', ['triSum', 'isoTri', 'quadAngles', 'straightVert', 'parallel', 'angleName', 'exteriorAngle', 'defOrTheorem'], 'Write the reason after every step.'],
    ['7.2', 'I can show that triangles are similar or congruent', ['whichPostulate', 'congruentFactor', 'nested', 'hourglass', 'shadow', 'whySimilar', 'nestedPart'], 'aa, sss, sas, ssr. Congruent: scale factor 1.'],
    ['7.3', 'I can use angle bisectors and perpendicular bisectors', ['whichLocus', 'midpoint', 'bisectorsMeet'], 'Perpendicular bisector: same distance to two points.'],
    ['7.4', 'I can use altitudes and medians', ['altitudeFromArea', 'centroidSplit', 'vertexFromCentroid', 'whichLine'], 'The centroid divides a median 2 : 1.'],
    ['7.5', 'I can find the centre of an inscribed or circumscribed circle', ['whichCentre', 'rightCircumcentre', 'circumRadius'], 'Right-angled triangle: the centre is the midpoint of the hypotenuse.']);
}
return { key: 'nx-' + P.cls.toLowerCase() + '-ch7-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
