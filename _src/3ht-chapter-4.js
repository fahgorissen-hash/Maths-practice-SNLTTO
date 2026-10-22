const { ri, pick, shuffle } = NX;
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const mu = (html, fields, ans, hint, steps, extra) => Object.assign({ type: 'multi', fields, ans, html, hint, steps, noStep: true }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => Math.round(x * Math.pow(10, d === undefined ? 6 : d)) / Math.pow(10, d === undefined ? 6 : d);
const neg = n => (n < 0 ? '−' : '') + String(rd(Math.abs(n)));
const ap = (x, d) => (rd(x, d) === rd(x) ? ' = ' : ' ≈ ') + neg(rd(x, d));   // "= 25" or "≈ 33.3"
const sum = a => a.reduce((s, v) => s + v, 0);
const sorted = a => a.slice().sort((u, v) => u - v);
/* a table with a header row; rows = [[cell, cell, ...], ...] */
const vtbl = (head, rows) => '<table class="tbl"><tr>' + head.map(h => '<th>' + h + '</th>').join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</table>';
const list = a => '<p style="font-size:19px;letter-spacing:.5px">' + a.join(', &nbsp;') + '</p>';
/* median of a sorted array, with the position text */
function med(a) { const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; }
function medTxt(a) { const n = a.length; return n % 2 ? 'the ' + ord((n + 1) / 2) + ' value: ' + neg(med(a)) : 'the mean of the ' + ord(n / 2) + ' and ' + ord(n / 2 + 1) + ' values: (' + neg(a[n / 2 - 1]) + ' + ' + neg(a[n / 2]) + ') / 2 = ' + neg(med(a)); }
const ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
/* quartiles: medians of the lower and upper half (the middle value is left out when n is odd) */
function quart(a) { const n = a.length, h = Math.floor(n / 2); return [med(a.slice(0, h)), med(a), med(a.slice(n - h))]; }
const svgWrap = (h, px) => '<div style="max-width:' + (px || 360) + 'px">' + h + '</div>';
/* bar chart (gap between bars) or histogram (no gaps); labels under bars or class limits on the axis */
function bars(labels, vals, o) {
  o = o || {}; const W = 360, H = 220, L = 40, B = 34, T = 10, n = vals.length, top = o.top || Math.ceil(Math.max(...vals) / (o.step || 2)) * (o.step || 2), st = o.step || 2;
  const bw = (W - L - 10) / n, sy = v => H - B - (H - B - T) * v / top; let s = '';
  for (let v = 0; v <= top; v += st) s += '<line x1="' + L + '" x2="' + (W - 6) + '" y1="' + sy(v) + '" y2="' + sy(v) + '" stroke="#dde3ea"/><text x="' + (L - 5) + '" y="' + (sy(v) + 4) + '" font-size="11" text-anchor="end" fill="#555">' + v + '</text>';
  vals.forEach((v, i) => { const gap = o.hist ? 0 : bw * .2, x = L + i * bw + gap / 2; s += '<rect x="' + x + '" y="' + sy(v) + '" width="' + (bw - gap) + '" height="' + (sy(0) - sy(v)) + '" fill="#7fb2e5" stroke="#1b5fa8"/>'; if (!o.hist || o.mid) s += '<text x="' + (L + (i + .5) * bw) + '" y="' + (H - B + 15) + '" font-size="11" text-anchor="middle">' + labels[i] + '</text>'; });
  if (o.hist && !o.mid) labels.forEach((t, i) => { s += '<text x="' + (L + i * bw) + '" y="' + (H - B + 15) + '" font-size="11" text-anchor="middle">' + t + '</text>'; });
  s += '<line x1="' + L + '" x2="' + (W - 6) + '" y1="' + sy(0) + '" y2="' + sy(0) + '" stroke="#333"/><line x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + sy(0) + '" stroke="#333"/>';
  if (o.xl) s += '<text x="' + (W - 8) + '" y="' + (H - 3) + '" font-size="11" text-anchor="end" fill="#333">' + o.xl + '</text>';
  s += '<text x="' + (L + 4) + '" y="' + (T + 2) + '" font-size="11" fill="#333">frequency</text>';
  return svgWrap('<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="background:#fff">' + s + '</svg>', 380);
}
/* a boxplot over a number line from lo to hi */
function boxplot(f, lo, hi, step, rows) {
  rows = rows || [[f, '']]; while ((hi - lo) / step > 12) step *= 2; const W = 380, L = 20, R = 20, h = 46, H = 30 + rows.length * h, sx = v => L + (W - L - R) * (v - lo) / (hi - lo); let s = '';
  for (let v = lo; v <= hi + 1e-9; v += step) s += '<line x1="' + sx(v) + '" x2="' + sx(v) + '" y1="' + (H - 26) + '" y2="' + (H - 20) + '" stroke="#333"/><text x="' + sx(v) + '" y="' + (H - 8) + '" font-size="11" text-anchor="middle">' + v + '</text>';
  s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - 23) + '" y2="' + (H - 23) + '" stroke="#333"/>';
  rows.forEach((r, i) => { const [a, q1, m, q3, b] = r[0], y = 14 + i * h, c = y + 14; s += '<line x1="' + sx(a) + '" x2="' + sx(q1) + '" y1="' + c + '" y2="' + c + '" stroke="#1b5fa8" stroke-width="2"/><line x1="' + sx(q3) + '" x2="' + sx(b) + '" y1="' + c + '" y2="' + c + '" stroke="#1b5fa8" stroke-width="2"/><rect x="' + sx(q1) + '" y="' + y + '" width="' + (sx(q3) - sx(q1)) + '" height="28" fill="#cfe2f6" stroke="#1b5fa8" stroke-width="2"/><line x1="' + sx(m) + '" x2="' + sx(m) + '" y1="' + y + '" y2="' + (y + 28) + '" stroke="#1b5fa8" stroke-width="2"/>' + [a, b].map(v => '<line x1="' + sx(v) + '" x2="' + sx(v) + '" y1="' + (c - 7) + '" y2="' + (c + 7) + '" stroke="#1b5fa8" stroke-width="2"/>').join('') + (r[1] ? '<text x="' + (W - R) + '" y="' + (y - 2) + '" font-size="11" text-anchor="end" fill="#333">' + r[1] + '</text>' : ''); });
  return svgWrap('<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="background:#fff">' + s + '</svg>', 400);
}
/* stem-and-leaf diagram from values */
function stemLeaf(vals) {
  const a = sorted(vals), stems = {}; a.forEach(v => { const s = Math.floor(v / 10); (stems[s] = stems[s] || []).push(v % 10); });
  const ks = Object.keys(stems).map(Number), lo = Math.min(...ks), hi = Math.max(...ks); let r = '';
  for (let s = lo; s <= hi; s++) r += '<tr><td style="text-align:right;border-right:2px solid #333;padding-right:8px">' + s + '</td><td style="text-align:left;padding-left:8px;letter-spacing:4px">' + (stems[s] || []).join(' ') + '</td></tr>';
  return '<table style="font-size:19px;margin:8px 0 12px;font-family:monospace">' + r + '</table>';
}

/* ======================= 4.1 Frequency tables ======================= */
const QUAL = ['eye colour', 'favourite sport', 'phone brand', 'hair colour', 'type of tree', 'country of birth', 'favourite subject', 'means of transport to school', 'colour of a car'];
const QUANT = ['shoe size', 'number of brothers and sisters', 'height in cm', 'weight in kg', 'time to run 100 m', 'number of pets', 'volume of a bottle in L', 'temperature in °C', 'monthly pocket money'];
G['4.1'] = [
  function qualQuant(l) {
    const q = Math.random() < .5, item = pick(q ? QUAL : QUANT), right = q ? 'qualitative' : 'quantitative';
    return ch(p('You collect data about the <b>' + item + '</b> of the students in your class. Are these data qualitative or quantitative?'), right, [q ? 'quantitative' : 'qualitative'], 'Quantitative data are numbers you can compare and calculate with. Qualitative data describe a characteristic.', q ? 'The ' + item + ' is a characteristic, not a number: qualitative.' : 'The ' + item + ' is a number you can compare: quantitative.');
  },
  function relativeFreq(l) {
    const cats = shuffle(pick([['blue', 'brown', 'green', 'grey'], ['football', 'hockey', 'tennis', 'swimming'], ['bike', 'bus', 'car', 'on foot']])).slice(0, l === 0 ? 3 : 4), f = cats.map(() => ri(2, l === 0 ? 10 : 25)), i = ri(0, cats.length - 1), tot = sum(f), r = rd(f[i] / tot * 100, 1);
    return nu(p('The table shows the results of a survey. Calculate the relative frequency of <b>' + cats[i] + '</b>. Round to 1 decimal.') + vtbl(['answer', 'frequency'], cats.map((c, k) => [c, f[k]])) + p('<small>Give the answer as a percentage, without the % sign.</small>'), r, 'Relative frequency = frequency / total · 100%.', p('total = ' + f.join(' + ') + ' = ' + tot) + p(f[i] + ' / ' + tot + ' · 100%' + ap(f[i] / tot * 100, 1) + '%'), { tol: .051 });
  },
  function fromRelative(l) {
    let tot, pc; do { tot = pick([25, 40, 50, 75, 80, 120, 150, 200, 240, 300, 360]); pc = pick([4, 5, 8, 10, 12, 15, 20, 24, 25, 28, 30, 35, 40, 45, 56, 60]); } while (!Number.isInteger(tot * pc / 100));
    const what = pick(['play football', 'walk to school', 'have a dog', 'play an instrument']);
    return nu(p('In a group of ' + tot + ' students, ' + pc + '% ' + what + '. How many students is that?'), tot * pc / 100, 'Absolute frequency = percentage / 100 · total.', pc + ' / 100 · ' + tot + ' = ' + tot * pc / 100 + ' students');
  },
  function twoWayPercent(l) {
    const gA = ri(14, 32), gB = ri(14, 32), fA = ri(2, gA - 4), fB = ri(2, gB - 4), which = pick(['A', 'B']), f = which === 'A' ? fA : fB, g = which === 'A' ? gA : gB;
    return nu(p('Two classes did the same test.') + vtbl(['', 'passed', 'failed', 'total'], [['class A', gA - fA, fA, gA], ['class B', gB - fB, fB, gB]]) + p('What percentage of class ' + which + ' failed? Round to 1 decimal.'), rd(f / g * 100, 1), 'Use the total of class ' + which + ', not the total of both classes.', f + ' / ' + g + ' · 100%' + ap(f / g * 100, 1) + '%', { tol: .051 });
  },
  function relativelyMost(l) {
    let a, b, A, B; do { A = ri(20, 60); B = ri(20, 60); a = ri(5, A - 5); b = ri(5, B - 5); } while (Math.abs(a / A - b / B) < .03 || (a > b) === (a / A > b / B));
    const right = a / A > b / B ? 'group 1' : 'group 2', what = pick(['cycle to school', 'have a part-time job', 'play a sport']);
    return ch(p('In group 1, ' + a + ' of the ' + A + ' students ' + what + '. In group 2, ' + b + ' of the ' + B + ' students ' + what + '. In which group do <b>relatively</b> the most students ' + what + '?'), right, [right === 'group 1' ? 'group 2' : 'group 1', 'both the same'], 'Relatively: compare percentages, not numbers.', p('group 1: ' + a + ' / ' + A + ' · 100%' + ap(a / A * 100, 1) + '%') + p('group 2: ' + b + ' / ' + B + ' · 100%' + ap(b / B * 100, 1) + '%') + p('So ' + right + ', even though ' + (a > b ? 'group 1' : 'group 2') + ' has more students who ' + what + '.'));
  }
];
XG['4.1'] = [
  function holidaySurvey(l) {
    const W = pick([40, 50, 60, 80]), M = pick([25, 35, 40, 50]), pw = pick([70, 75, 80, 85]), pm = pick([60, 72, 76, 80]);
    const home = rd((100 - pw) / 100 * W + (100 - pm) / 100 * M), r = rd(home / (W + M) * 100, 1);
    return nu(p('In a survey, ' + pw + '% of the ' + W + ' women and ' + pm + '% of the ' + M + ' men prefer a holiday abroad. The others prefer a holiday at home. What percentage of <b>all</b> respondents prefer a holiday at home? Round to 1 decimal.'), r, 'First the numbers of women and men who prefer a holiday at home. Then divide by the total.', p('women: ' + (100 - pw) + ' / 100 · ' + W + ' = ' + rd((100 - pw) / 100 * W)) + p('men: ' + (100 - pm) + ' / 100 · ' + M + ' = ' + rd((100 - pm) / 100 * M)) + p(home + ' / ' + (W + M) + ' · 100%' + ap(home / (W + M) * 100, 1) + '%'), { tol: .051 });
  }
];

/* ======================= 4.2 Diagrams ======================= */
G['4.2'] = [
  function pieAngle(l) {
    let tot, n; do { tot = pick([20, 24, 30, 36, 40, 45, 60, 72, 90, 120]); n = ri(1, tot - 1); } while (l < 2 && !Number.isInteger(n / tot * 360));
    const what = pick(['students chose C&S', 'people voted for party A', 'trips were made by the ambulance']);
    return nu(p('Out of ' + tot + ', ' + n + ' ' + what + '. Calculate the angle of this sector in a pie chart. Round to whole degrees.'), rd(n / tot * 360, 0), 'A full circle is 360°. Angle = part / total · 360°.', n + ' / ' + tot + ' · 360°' + ap(n / tot * 360, 0) + '°', { tol: .51 });
  },
  function pieBack(l) {
    let tot, ang; do { tot = pick([24, 30, 36, 48, 60, 72, 120, 180, 240]); ang = pick([30, 45, 60, 72, 90, 105, 120, 150, 195, 210]); } while (!Number.isInteger(ang / 360 * tot));
    return nu(p('A pie chart shows the answers of ' + tot + ' people. One sector has an angle of ' + ang + '°. How many people does this sector stand for?'), ang / 360 * tot, 'The sector is ' + ang + '/360 part of the circle.', ang + ' / 360 · ' + tot + ' = ' + ang / 360 * tot + ' people');
  },
  function readBars(l) {
    const cats = ['A', 'B', 'C', 'D'], i = ri(0, 3); let v, j; do { v = cats.map(() => ri(1, 9) * 2); } while (new Set(v).size < 2); do { j = ri(0, 3); } while (j === i || v[j] === v[i]);
    const ask = pick(['diff', 'pct']);
    if (ask === 'diff') return nu(p('The bar chart shows how many students chose each answer. How many more students chose ' + cats[i] + ' than ' + cats[j] + '? <small>(A negative answer means fewer.)</small>') + bars(cats, v, { step: 2 }), v[i] - v[j], 'Read the height of both bars.', cats[i] + ': ' + v[i] + ', ' + cats[j] + ': ' + v[j] + '. ' + v[i] + ' − ' + v[j] + ' = ' + (v[i] - v[j]), { noStep: true });
    const t = sum(v);
    return nu(p('The bar chart shows how many students chose each answer. What percentage chose ' + cats[i] + '? Round to 1 decimal.') + bars(cats, v, { step: 2 }), rd(v[i] / t * 100, 1), 'Add up all bars for the total.', p('total = ' + v.join(' + ') + ' = ' + t) + p(v[i] + ' / ' + t + ' · 100%' + ap(v[i] / t * 100, 1) + '%'), { tol: .051 });
  },
  function stemLeafRead(l) {
    const n = l === 0 ? 10 : 15, vals = Array.from({ length: n }, () => ri(12, 49)), a = sorted(vals), k = pick(['small', 'large', 'below']);
    if (k === 'below') { const lim = ri(2, 4) * 10; const c = a.filter(v => v < lim).length; return nu(p('The stem-and-leaf diagram shows the ages of ' + n + ' people at a party. How many people are younger than ' + lim + '?') + stemLeaf(vals), c, 'The stem is the tens digit, a leaf is the units digit. Count the leaves in the rows before stem ' + lim / 10 + '.', 'The values smaller than ' + lim + ' are ' + a.filter(v => v < lim).join(', ') + ': that is ' + c + ' people.', { noStep: true }); }
    return nu(p('The stem-and-leaf diagram shows the ages of ' + n + ' people at a party. What is the ' + (k === 'small' ? 'youngest' : 'oldest') + ' age?') + stemLeaf(vals), k === 'small' ? a[0] : a[n - 1], 'Stem = tens digit, leaf = units digit.', 'The ' + (k === 'small' ? 'first leaf in the top row' : 'last leaf in the bottom row') + ' gives ' + (k === 'small' ? a[0] : a[n - 1]) + '.', { noStep: true });
  },
  function percentBack(l) {
    const old = ri(8, 30) * 4, pc = pick([125, 120, 150, 80, 75, 110]), now = old * pc / 100;
    if (!Number.isInteger(now)) return G['4.2'][4](l);
    return nu(p('A line graph shows the number of members of a club. In 2024 the club had ' + now + ' members. That was ' + pc + '% of the number of members in 2020. How many members did the club have in 2020?'), old, pc + '% is ' + now + ' members. Find 1% first, then 100%.', now + ' / ' + pc + ' · 100 = ' + old + ' members');
  }
];
XG['4.2'] = [
  function routes(l) {
    const n = ri(3, 7); let f = 1, t = []; for (let k = n; k >= 1; k--) { f *= k; t.push(k); }
    return nu(p('You want to visit ' + n + ' towns, each one once, in any order. How many different routes are possible?'), f, 'For the first town you have ' + n + ' choices, for the next one ' + (n - 1) + ', and so on.', t.join(' · ') + ' = ' + f + ' routes', { noStep: true });
  },
  function misleadingAxis(l) {
    const a = ri(570, 590), b = a + ri(1, 4);
    return ch(p('A bar chart shows two prices: €' + a + ' and €' + b + '. The vertical axis starts at €' + (a - 5) + '. The bar for €' + b + ' looks much higher. Why is this chart misleading?'), 'The axis does not start at 0, so a small difference looks big', ['The bars should be wider', 'A pie chart must be used for prices', 'The bars should touch each other'], 'Look at where the vertical axis starts.', 'The difference is only €' + (b - a) + ' (' + rd((b - a) / a * 100, 2) + '%). Because the axis starts at €' + (a - 5) + ' and not at 0, the difference looks much bigger.');
  }
];

/* ======================= 4.3 Grouped data ======================= */
G['4.3'] = [
  function whichClass(l) {
    const w = pick([5, 10, 20]), start = ri(1, 6) * w, k = ri(1, 4), excl = Math.random() < .5, v = start + k * w;
    const cl = (a, e) => e ? a + ' –< ' + (a + w) : a + ' – ' + (a + w - 1);
    const right = excl ? cl(v, true) : cl(v - w, false), wr = excl ? [cl(v - w, true), cl(v + w, true)] : [cl(v, false), cl(v - 2 * w, false)];
    return ch(p('The classes are ' + [0, 1, 2, 3, 4, 5].map(i => cl(start + i * w, excl)).slice(0, 4).join(', ') + ', … In which class does the value <b>' + v + '</b> belong?'), right, wr, excl ? 'In a –< b the lower limit a is in the class, but b is not.' : 'In a – b both limits belong to the class.', excl ? v + ' is a lower limit: ' + v + ' belongs to ' + right + ', not to ' + cl(v - w, true) + '.' : 'Both limits are included, so ' + v + ' belongs to ' + right + '.');
  },
  function midpoint(l) {
    const w = pick([5, 10, 20, 2, 4]), a = ri(1, 15) * w, m = a + w / 2;
    return nu(p('What is the class midpoint of the class ' + a + ' –< ' + (a + w) + '?'), m, 'The midpoint is the mean of the two class limits.', '(' + a + ' + ' + (a + w) + ') / 2 = ' + m, { noStep: true });
  },
  function histCount(l) {
    const w = pick([5, 10]), a0 = ri(1, 6) * w, f = Array.from({ length: 5 }, () => ri(1, 9)), lims = f.map((_, i) => a0 + i * w).concat(a0 + 5 * w), k = ri(1, 4), lim = lims[k], tot = sum(f), below = sum(f.slice(0, k));
    const pct = l > 0 && Math.random() < .5;
    const fig = bars(lims, f, { hist: true, step: 1, xl: pick(['length (min)', 'distance (m)', 'age (years)']) });
    if (!pct) return nu(p('How many values in the histogram are smaller than ' + lim + '?') + fig, below, 'The axis shows class limits, so the upper limits are excluded. Add up the bars to the left of ' + lim + '.', f.slice(0, k).join(' + ') + ' = ' + below, { noStep: k < 2 });
    return nu(p('What percentage of the values in the histogram is ' + lim + ' or more? Round to 1 decimal.') + fig, rd((tot - below) / tot * 100, 1), 'Add up the bars from ' + lim + ' onwards, and all bars for the total.', p('total = ' + f.join(' + ') + ' = ' + tot) + p(lim + ' or more: ' + f.slice(k).join(' + ') + ' = ' + (tot - below)) + p((tot - below) + ' / ' + tot + ' · 100%' + ap((tot - below) / tot * 100, 1) + '%'), { tol: .051 });
  },
  function barOrHist(l) {
    const D = [['types of trees in a park', 'bar chart'], ['ages of all visitors of a museum', 'histogram'], ['lengths of 200 songs in seconds', 'histogram'], ['marks A, B, C, D of a test', 'bar chart'], ['car brands in a car park', 'bar chart'], ['heights of 500 students in cm', 'histogram'], ['favourite colour of the students', 'bar chart'], ['incomes of 1000 families', 'histogram']], d = pick(D);
    return ch(p('Which diagram fits best for the ' + d[0] + '?'), d[1], [d[1] === 'bar chart' ? 'histogram' : 'bar chart'], 'A histogram is for grouped quantitative data (bars touch). A bar chart is for qualitative data or a few separate numbers.', d[1] === 'histogram' ? 'There are many different values, so you group them in classes: a histogram.' : 'These are qualitative data (or only a few values): a bar chart.');
  },
  function groupTable(l) {
    const w = 10, vals = Array.from({ length: l === 0 ? 12 : 18 }, () => ri(10, 59)), c = ri(1, 4), a = c * 10, cnt = vals.filter(v => v >= a && v < a + w).length;
    return nu(p('These are the scores of a group of players:') + list(vals) + p('You group them in the classes 10 –< 20, 20 –< 30, 30 –< 40, 40 –< 50, 50 –< 60. What is the frequency of the class <b>' + a + ' –< ' + (a + w) + '</b>?'), cnt, 'Count the scores from ' + a + ' up to (not including) ' + (a + w) + '.', 'The scores ' + (sorted(vals.filter(v => v >= a && v < a + w)).join(', ') || 'none') + ' are in this class: frequency ' + cnt + '.', { noStep: true });
  }
];
XG['4.3'] = [
  function incomeBounds(l) {
    const lims = [0, 10, 20, 30, 40], f = lims.map(() => ri(2, 12)), lo = sum(f.map((v, i) => v * lims[i])), hi = sum(f.map((v, i) => v * (lims[i] + 10))), which = pick(['lowest', 'highest']);
    return nu(p('The table shows the weekly pocket money of a group of students. What is the <b>' + which + '</b> possible total amount (in €) for the whole group?') + vtbl(['pocket money (€)', 'frequency'], lims.map((a, i) => [a + ' –< ' + (a + 10), f[i]])) + p('<small>(For "highest", use the upper limits.)</small>'), which === 'lowest' ? lo : hi, 'For the lowest amount, everybody has the lower limit of their class. For the highest, the upper limit.', f.map((v, i) => v + ' · ' + (which === 'lowest' ? lims[i] : lims[i] + 10)).join(' + ') + ' = ' + (which === 'lowest' ? lo : hi) + ' euros');
  }
];

/* ======================= 4.4 Mean, median and mode ======================= */
G['4.4'] = [
  function measureList(l) {
    const n = l === 0 ? ri(5, 7) : ri(8, 12); let vals; do { vals = Array.from({ length: n }, () => ri(l === 0 ? 1 : 2, l === 0 ? 10 : 40)); } while (false);
    const a = sorted(vals), kind = pick(['mean', 'median', 'mean', 'median']), m = rd(sum(a) / n, 1);
    if (kind === 'mean') return nu(p('Calculate the <b>mean</b> of these numbers. Round to 1 decimal.') + list(vals), m, 'Add all numbers and divide by how many there are.', '(' + vals.join(' + ') + ') / ' + n + ' = ' + sum(a) + ' / ' + n + ap(sum(a) / n, 1), { tol: .051 });
    return nu(p('What is the <b>median</b> of these numbers?') + list(vals), med(a), 'Put the numbers in order from small to large first.', p('In order: ' + a.join(', ')) + p('There are ' + n + ' numbers, so the median is ' + medTxt(a) + '.'), { noStep: true });
  },
  function modeList(l) {
    const n = ri(8, 12), m = ri(2, 20); let vals = [m, m, m]; while (vals.length < n) { const v = ri(1, 25); if (vals.filter(x => x === v).length < 2 && v !== m) vals.push(v); }
    vals = shuffle(vals);
    return nu(p('What is the <b>mode</b> of these numbers?') + list(vals), m, 'The mode is the number that occurs most often.', m + ' occurs 3 times, every other number at most twice. The mode is ' + m + '.', { noStep: true });
  },
  function tableMean(l) {
    const xs = l === 0 ? [1, 2, 3, 4, 5] : pick([[4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5], [10, 20, 30, 40]]), f = xs.map(() => ri(1, 12)), n = sum(f), s = sum(xs.map((x, i) => x * f[i])), what = xs[0] >= 4 && xs.length === 6 ? 'mark' : 'number';
    return nu(p('The table shows the results of a class. Calculate the mean ' + what + '. Round to 1 decimal.') + vtbl([what, 'frequency'], xs.map((x, i) => [x, f[i]])), rd(s / n, 1), 'Multiply each value by its frequency, add, and divide by the total frequency.', p('(' + xs.map((x, i) => f[i] + ' · ' + x).join(' + ') + ') / (' + f.join(' + ') + ')') + p('= ' + s + ' / ' + n + ap(s / n, 1)), { tol: .051 });
  },
  function tableMedian(l) {
    const xs = [4, 5, 6, 7, 8, 9], f = xs.map(() => ri(1, 9)), n = sum(f), a = []; xs.forEach((x, i) => { for (let k = 0; k < f[i]; k++) a.push(x); });
    const cum = []; f.reduce((s, v, i) => (cum[i] = s + v), 0);
    return nu(p('The table shows the marks of ' + n + ' students. What is the median mark?') + vtbl(['mark', 'frequency'], xs.map((x, i) => [x, f[i]])), med(a), 'There are ' + n + ' values. Find the middle position, then count down the table.', p('Running totals: ' + cum.map((c, i) => 'up to ' + xs[i] + ': ' + c).join(', ') + '.') + p(n + ' values, so the median is ' + medTxt(a) + '.'), { noStep: true });
  },
  function weightedMean(l) {
    const k = l === 0 ? 2 : 3, w = Array.from({ length: k }, () => ri(1, 3)), m = w.map(() => rd(ri(40, 95) / 10, 1)), W = sum(w), s = rd(sum(m.map((v, i) => v * w[i]))), r = rd(s / W, 1);
    return nu(p('A student has these marks:') + vtbl(['mark', 'weight'], m.map((v, i) => [v, w[i]])) + p('Calculate the weighted mean. Round to 1 decimal.'), r, 'Multiply each mark by its weight, add, and divide by the sum of the weights.', p('(' + m.map((v, i) => w[i] + ' · ' + v).join(' + ') + ') / (' + w.join(' + ') + ')') + p('= ' + s + ' / ' + W + ap(s / W, 1)), { tol: .051 });
  },
  function groupedMean(l) {
    const w = pick([10, 5]), a0 = ri(2, 5) * w, f = Array.from({ length: 4 }, () => ri(2, 12)), mids = f.map((_, i) => a0 + i * w + w / 2), n = sum(f), s = sum(mids.map((m, i) => m * f[i]));
    return nu(p('Estimate the mean speed (km/h) with the class midpoints. Round to 1 decimal.') + vtbl(['speed (km/h)', 'frequency'], f.map((v, i) => [(a0 + i * w) + ' –< ' + (a0 + (i + 1) * w), v])), rd(s / n, 1), 'Use the class midpoint for every value in a class.', p('midpoints: ' + mids.join(', ')) + p('(' + mids.map((m, i) => f[i] + ' · ' + m).join(' + ') + ') / ' + n + ' = ' + s + ' / ' + n + ap(s / n, 1)), { tol: .051 });
  }
];
XG['4.4'] = [
  function neededMark(l) {
    const m = [rd(ri(45, 85) / 10, 1), rd(ri(45, 85) / 10, 1), rd(ri(45, 85) / 10, 1)], w = [1, 2, 1].map(() => ri(1, 2)), wl = ri(2, 3), goal = pick([5.5, 6, 6.5, 7]), W = sum(w) + wl, have = rd(sum(m.map((v, i) => v * w[i]))), need = rd((goal * W - have) / wl, 1);
    if (need > 10 || need < 1) return XG['4.4'][0](l);
    return nu(p('A student has these marks:') + vtbl(['mark', 'weight'], m.map((v, i) => [v, w[i]])) + p('The last test has weight ' + wl + '. Which mark does the student need on the last test to get a mean of exactly ' + goal + '? Round to 1 decimal.'), need, 'Total weight × goal = the points you need in total.', p('total weight = ' + w.join(' + ') + ' + ' + wl + ' = ' + W) + p('points needed: ' + W + ' · ' + goal + ' = ' + rd(W * goal)) + p('points so far: ' + m.map((v, i) => w[i] + ' · ' + v).join(' + ') + ' = ' + have) + p('mark = (' + rd(W * goal) + ' − ' + have + ') / ' + wl + ap((goal * W - have) / wl, 1)), { tol: .051 });
  },
  function averageSpeed(l) {
    const d = pick([6, 8, 10, 12, 15, 20]), v1 = pick([10, 12, 15, 20, 24, 30]), v2 = pick([4, 5, 6, 8]), t1 = d / v1, t2 = d / v2, v = rd(2 * d / (t1 + t2), 1);
    return nu(p('You cycle ' + d + ' km to a lake at ' + v1 + ' km/h and walk the same ' + d + ' km back at ' + v2 + ' km/h. What is your average speed for the whole trip (km/h)? Round to 1 decimal.'), v, 'Average speed = total distance / total time. It is not (' + v1 + ' + ' + v2 + ') / 2.', p('time there: ' + d + ' / ' + v1 + ap(t1, 3) + ' h, time back: ' + d + ' / ' + v2 + ap(t2, 3) + ' h') + p('average speed = ' + 2 * d + ' / ' + rd(t1 + t2, 3) + ap(2 * d / (t1 + t2), 1) + ' km/h'), { tol: .051 });
  }
];

/* ======================= 4.5 Spread and boxplots ======================= */
G['4.5'] = [
  function rangeIQR(l) {
    const n = l === 0 ? pick([7, 8, 9]) : pick([10, 11, 12, 13]), vals = Array.from({ length: n }, () => ri(1, l === 0 ? 20 : 60)), a = sorted(vals), [q1, m, q3] = quart(a), h = Math.floor(n / 2), kind = pick(['range', 'IQR', 'IQR']);
    if (kind === 'range') return nu(p('What is the <b>range</b> of these numbers?') + list(vals), a[n - 1] - a[0], 'Range = largest value − smallest value.', a[n - 1] + ' − ' + a[0] + ' = ' + (a[n - 1] - a[0]), { noStep: true });
    return nu(p('Calculate the <b>interquartile range</b> (IQR) of these numbers.') + list(vals), rd(q3 - q1), 'Order the numbers. Q<sub>1</sub> is the median of the lower half, Q<sub>3</sub> of the upper half.' + (n % 2 ? ' Leave the middle value out of both halves.' : ''), p('In order: ' + a.join(', ')) + p('lower half: ' + a.slice(0, h).join(', ') + ', so Q<sub>1</sub> = ' + neg(q1)) + p('upper half: ' + a.slice(n - h).join(', ') + ', so Q<sub>3</sub> = ' + neg(q3)) + p('IQR = ' + neg(q3) + ' − ' + neg(q1) + ' = ' + neg(rd(q3 - q1))));
  },
  function fiveNumbers(l) {
    const n = pick([9, 10, 11, 12]), vals = Array.from({ length: n }, () => ri(10, 50)), a = sorted(vals), [q1, m, q3] = quart(a), h = Math.floor(n / 2);
    return mu(p('Give the five numbers you need for a boxplot of these data.') + list(vals), ['min =', 'Q1 =', 'median =', 'Q3 =', 'max ='], [a[0], q1, m, q3, a[n - 1]], 'Order the data. The median splits the data in two halves; Q<sub>1</sub> and Q<sub>3</sub> are the medians of the halves.', p('In order: ' + a.join(', ')) + p('median: ' + medTxt(a)) + p('Q<sub>1</sub> = median of ' + a.slice(0, h).join(', ') + ' = ' + neg(q1)) + p('Q<sub>3</sub> = median of ' + a.slice(n - h).join(', ') + ' = ' + neg(q3)), { ansText: a[0] + ', ' + neg(q1) + ', ' + neg(m) + ', ' + neg(q3) + ', ' + a[n - 1] });
  },
  function readBoxplot(l) {
    const st = pick([1, 2, 5]), f = sorted(Array.from({ length: 5 }, () => ri(0, 12) * st)); if (new Set(f).size < 4) return G['4.5'][2](l);
    const lo = Math.max(0, f[0] - st), hi = f[4] + st, kind = pick(['IQR', 'range', 'median']);
    const ans = kind === 'IQR' ? f[3] - f[1] : kind === 'range' ? f[4] - f[0] : f[2];
    return nu(p('Read from the boxplot: what is the ' + (kind === 'IQR' ? 'interquartile range' : kind) + '?') + boxplot(f, lo, hi, st), ans, 'The box runs from Q<sub>1</sub> to Q<sub>3</sub>, the line in the box is the median, the whiskers end at the smallest and largest value.', kind === 'IQR' ? 'Q<sub>3</sub> − Q<sub>1</sub> = ' + f[3] + ' − ' + f[1] + ' = ' + ans : kind === 'range' ? 'max − min = ' + f[4] + ' − ' + f[0] + ' = ' + ans : 'The line in the box is at ' + ans + '.', { noStep: true });
  },
  function boxPercent(l) {
    const st = 5, f = sorted(Array.from({ length: 5 }, () => ri(1, 20) * st)); if (new Set(f).size < 5) return G['4.5'][3](l);
    const N = pick([40, 80, 120, 200, 60]), dir = pick(['more', 'less']), k = dir === 'more' ? ri(1, 3) : ri(0, 2), cut = f[k + (dir === 'more' ? 0 : 1)], pc = dir === 'more' ? 100 - 25 * (k) : 25 * (k + 1);
    return nu(p('The boxplot shows the scores of ' + N + ' students. About how many students scored ' + (dir === 'more' ? 'more than ' : 'less than ') + cut + '?') + boxplot(f, f[0] - st, f[4] + st, st), N * pc / 100, 'Each of the four parts of a boxplot (whisker, half box, half box, whisker) holds about 25% of the data.', p((dir === 'more' ? 'Above ' : 'Below ') + cut + ' are ' + pc / 25 + ' parts of 25%: ' + pc + '%.') + p(pc + ' / 100 · ' + N + ' = ' + N * pc / 100 + ' students'), { noStep: true });
  },
  function shiftScale(l) {
    const R = ri(4, 20), I = ri(2, R - 1), c = ri(2, 9), k = pick([2, 1.5, 3, 0.5]), add = Math.random() < .5, ask = pick(['range', 'IQR']), v = ask === 'range' ? R : I;
    return nu(p('A dataset has range ' + R + ' and interquartile range ' + I + '. ' + (add ? 'You add ' + c + ' to every value.' : 'You multiply every value by ' + k + '.') + ' What is the new ' + (ask === 'range' ? 'range' : 'interquartile range') + '?'), add ? v : rd(v * k), 'Adding the same number moves all values, but the distances stay the same. Multiplying multiplies the distances too.', add ? 'All values move up ' + c + '; the distances do not change: ' + v + '.' : 'All distances are multiplied by ' + k + ': ' + v + ' · ' + k + ' = ' + rd(v * k) + '.', { noStep: true });
  }
];
XG['4.5'] = [
  function compareBoxplots(l) {
    const st = 5, A = sorted(Array.from({ length: 5 }, () => ri(2, 18) * st)), B = sorted(Array.from({ length: 5 }, () => ri(4, 22) * st)); if (A[3] <= A[1] || B[3] <= B[1] || A[2] === B[2]) return XG['4.5'][0](l);
    const lo = Math.floor((Math.min(A[0], B[0]) - st) / 10) * 10, hi = Math.max(A[4], B[4]) + st, kind = pick(['median', 'IQR']), vA = kind === 'median' ? A[2] : A[3] - A[1], vB = kind === 'median' ? B[2] : B[3] - B[1];
    if (vA === vB) return XG['4.5'][0](l);
    const right = (vA > vB) ? 'group A' : 'group B';
    return ch(p('The boxplots show the test scores of two groups. Which group has the larger ' + (kind === 'median' ? 'median' : 'interquartile range') + '?') + boxplot(A, lo, hi, 10, [[A, 'group A'], [B, 'group B']]), right, [right === 'group A' ? 'group B' : 'group A', 'they are equal'], kind === 'median' ? 'Compare the lines inside the boxes.' : 'Compare the widths of the boxes.', kind === 'median' ? 'Median A = ' + A[2] + ', median B = ' + B[2] + ': ' + right + '.' : 'IQR A = ' + A[3] + ' − ' + A[1] + ' = ' + vA + ', IQR B = ' + B[3] + ' − ' + B[1] + ' = ' + vB + ': ' + right + '.');
  },
  function outlierEffect(l) {
    const right = pick(['the mean', 'the range']), pairs = { 'the mean': ['the median', 'the mode', 'the interquartile range'], 'the range': ['the median', 'the mode', 'the interquartile range'] };
    const big = ri(50, 90);
    return ch(p('A dataset is 1, 2, 2, 3, 3, 3, 4, 5. A ninth value, ' + big + ', is added (an outlier). Which of these changes a lot?'), right, pairs[right], 'An outlier is far away from the other values. Which measure uses that extreme value?', right === 'the mean' ? 'The mean goes from 2.875 to ' + rd((23 + big) / 9, 2) + '. The median, the mode and the IQR hardly change.' : 'The range goes from 4 to ' + (big - 1) + '. The median, the mode and the IQR hardly change.');
  }
];

const SECTIONS = [
  { id: '4.1', title: '4.1 Frequency tables', sub: 'Qualitative and quantitative data, relative frequency' },
  { id: '4.2', title: '4.2 Diagrams', sub: 'Pie charts, bar charts, stem-and-leaf diagrams' },
  { id: '4.3', title: '4.3 Grouped data', sub: 'Classes, class midpoints, histograms' },
  { id: '4.4', title: '4.4 Mean, median and mode', sub: 'Measures of centre, weighted mean' },
  { id: '4.5', title: '4.5 Measures of spread', sub: 'Range, quartiles, IQR, boxplots' }
];
const GOALS = [
  ['4.1', 'I can make and use frequency tables', ['qualQuant', 'relativeFreq', 'fromRelative', 'twoWayPercent', 'relativelyMost'], 'relative frequency = frequency / total · 100%'],
  ['4.2', 'I can read and make diagrams', ['pieAngle', 'pieBack', 'readBars', 'stemLeafRead', 'percentBack'], 'angle = part / total · 360°'],
  ['4.3', 'I can work with grouped data', ['whichClass', 'midpoint', 'histCount', 'barOrHist', 'groupTable'], 'In a –< b the upper limit b is not in the class.'],
  ['4.4', 'I can calculate the mean, median and mode', ['measureList', 'modeList', 'tableMean', 'tableMedian', 'weightedMean', 'groupedMean'], 'Order the data before you find the median.'],
  ['4.5', 'I can calculate the range and IQR and read boxplots', ['rangeIQR', 'fiveNumbers', 'readBoxplot', 'boxPercent', 'shiftScale'], 'IQR = Q3 − Q1']
];
return { key: 'nx-' + P.cls.toLowerCase() + '-ch4-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
