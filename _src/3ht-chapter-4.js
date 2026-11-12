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
    if (l >= 2) {   // spicy: a percentage of a column, not of a row
      const F = fA + fB, inA = Math.random() < .5, x = inA ? fA : fB;
      return nu(p('Two classes did the same test.') + vtbl(['', 'passed', 'failed', 'total'], [['class A', gA - fA, fA, gA], ['class B', gB - fB, fB, gB]]) + p('What percentage of all students who <b>failed</b> is in class ' + (inA ? 'A' : 'B') + '? Round to 1 decimal.'), rd(x / F * 100, 1), 'Now the whole is the number of students who failed, in both classes together.', p('failed in total: ' + fA + ' + ' + fB + ' = ' + F) + p(x + ' / ' + F + ' · 100%' + ap(x / F * 100, 1) + '%'), { tol: .051 });
    }
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
    if (l >= 2) return nu(p('In a pie chart, a sector of ' + ang + '° stands for ' + ang / 360 * tot + ' people. How many people are in the whole pie chart?'), tot, 'Find how many people 1° stands for, or how many times ' + ang + '° fits in 360°.', ang / 360 * tot + ' / ' + ang + ' · 360 = ' + tot + ' people');   // spicy: from one sector back to the total
    return nu(p('A pie chart shows the answers of ' + tot + ' people. One sector has an angle of ' + ang + '°. How many people does this sector stand for?'), ang / 360 * tot, 'The sector is ' + ang + '/360 part of the circle.', ang + ' / 360 · ' + tot + ' = ' + ang / 360 * tot + ' people');
  },
  function readBars(l) {
    const cats = ['A', 'B', 'C', 'D'], i = ri(0, 3); let v, j; do { v = cats.map(() => ri(1, 9) * 2); } while (new Set(v).size < 2); do { j = ri(0, 3); } while (j === i || v[j] === v[i]);
    const ask = l === 0 ? 'diff' : l === 1 ? pick(['diff', 'pct']) : pick(['pct', 'more']);
    if (ask === 'more') { const hi = Math.max(v[i], v[j]), lo = Math.min(v[i], v[j]), H = cats[v[i] > v[j] ? i : j], L = cats[v[i] > v[j] ? j : i];   // spicy: percentage more than
      return nu(p('The bar chart shows how many students chose each answer. How many <b>percent more</b> students chose ' + H + ' than ' + L + '? Round to 1 decimal.') + bars(cats, v, { step: 2 }), rd((hi - lo) / lo * 100, 1), 'Compare the difference with ' + L + ' (the old number).', p(H + ': ' + hi + ', ' + L + ': ' + lo + ', difference ' + (hi - lo)) + p((hi - lo) + ' / ' + lo + ' · 100%' + ap((hi - lo) / lo * 100, 1) + '%'), { tol: .051 }); }
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
    if (!Number.isInteger(now)) return percentBack(l);
    if (l >= 2) {   // spicy: a percentage decrease or increase is given, not 'x% of'
      const ch_ = pick([-15, -12, -5, 8, 15, 35]), o2 = ri(10, 60) * 20, n2 = o2 * (100 + ch_) / 100; if (!Number.isInteger(n2)) return percentBack(l);
      return nu(p('A line graph shows the number of members of a club. In 2024 the club had ' + n2 + ' members. That is ' + Math.abs(ch_) + '% ' + (ch_ < 0 ? 'fewer' : 'more') + ' than in 2020. How many members did the club have in 2020?'), o2, Math.abs(ch_) + '% ' + (ch_ < 0 ? 'fewer' : 'more') + ' means 2024 is ' + (100 + ch_) + '% of 2020.', n2 + ' is ' + (100 + ch_) + '% of 2020.<br>' + n2 + ' / ' + (100 + ch_) + ' · 100 = ' + o2 + ' members');
    }
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
    const w = pick([10, 5]), a0 = ri(2, 5) * w, f = Array.from({ length: 4 }, () => ri(2, 12)), n = sum(f);
    const bd = l >= 2 ? [a0, a0 + w, a0 + w + w / 2, a0 + 2 * w, a0 + 4 * w] : [0, 1, 2, 3, 4].map(i => a0 + i * w);   // spicy: classes of different widths
    const mids = f.map((_, i) => (bd[i] + bd[i + 1]) / 2), s = sum(mids.map((m, i) => m * f[i]));
    return nu(p('Estimate the mean speed (km/h) with the class midpoints. Round to 1 decimal.' + (l >= 2 ? ' <small>(Careful: the classes are not all equally wide.)</small>' : '')) + vtbl(['speed (km/h)', 'frequency'], f.map((v, i) => [bd[i] + ' –< ' + bd[i + 1], v])), rd(s / n, 1), 'Use the class midpoint for every value in a class.', p('midpoints: ' + mids.join(', ')) + p('(' + mids.map((m, i) => f[i] + ' · ' + m).join(' + ') + ') / ' + n + ' = ' + s + ' / ' + n + ap(s / n, 1)), { tol: .051 });
  }
];
XG['4.4'] = [
  function neededMark(l) {
    const m = [rd(ri(45, 85) / 10, 1), rd(ri(45, 85) / 10, 1), rd(ri(45, 85) / 10, 1)], w = [1, 2, 1].map(() => ri(1, 2)), wl = ri(2, 3), goal = pick([5.5, 6, 6.5, 7]), W = sum(w) + wl, have = rd(sum(m.map((v, i) => v * w[i]))), need = rd((goal * W - have) / wl, 1);
    if (need > 10 || need < 1) return neededMark(l);
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
    // spicy: more data, temperatures below zero
    const n = l >= 2 ? pick([14, 15, 16, 17]) : pick([9, 10, 11, 12]), vals = Array.from({ length: n }, () => l >= 2 ? ri(-8, 15) : ri(10, 50)), a = sorted(vals), [q1, m, q3] = quart(a), h = Math.floor(n / 2);
    return mu(p('Give the five numbers you need for a boxplot of these data.') + list(vals), ['min =', 'Q1 =', 'median =', 'Q3 =', 'max ='], [a[0], q1, m, q3, a[n - 1]], 'Order the data. The median splits the data in two halves; Q<sub>1</sub> and Q<sub>3</sub> are the medians of the halves.', p('In order: ' + a.join(', ')) + p('median: ' + medTxt(a)) + p('Q<sub>1</sub> = median of ' + a.slice(0, h).join(', ') + ' = ' + neg(q1)) + p('Q<sub>3</sub> = median of ' + a.slice(n - h).join(', ') + ' = ' + neg(q3)), { ansText: a[0] + ', ' + neg(q1) + ', ' + neg(m) + ', ' + neg(q3) + ', ' + a[n - 1] });
  },
  function readBoxplot(l) {
    const st = pick([1, 2, 5]), f = sorted(Array.from({ length: 5 }, () => ri(0, 12) * st)); if (new Set(f).size < 4) return readBoxplot(l);
    const lo = Math.max(0, f[0] - st), hi = f[4] + st, kind = pick(['IQR', 'range', 'median']);
    const ans = kind === 'IQR' ? f[3] - f[1] : kind === 'range' ? f[4] - f[0] : f[2];
    return nu(p('Read from the boxplot: what is the ' + (kind === 'IQR' ? 'interquartile range' : kind) + '?') + boxplot(f, lo, hi, st), ans, 'The box runs from Q<sub>1</sub> to Q<sub>3</sub>, the line in the box is the median, the whiskers end at the smallest and largest value.', kind === 'IQR' ? 'Q<sub>3</sub> − Q<sub>1</sub> = ' + f[3] + ' − ' + f[1] + ' = ' + ans : kind === 'range' ? 'max − min = ' + f[4] + ' − ' + f[0] + ' = ' + ans : 'The line in the box is at ' + ans + '.', { noStep: true });
  },
  function boxPercent(l) {
    const st = 5, f = sorted(Array.from({ length: 5 }, () => ri(1, 20) * st)); if (new Set(f).size < 5) return boxPercent(l);
    const N = pick([40, 80, 120, 200, 60]);
    if (l >= 2) { const i = ri(0, 2), j = ri(i + 2, 4), pc2 = 25 * (j - i);   // spicy: between two values of the boxplot
      return nu(p('The boxplot shows the scores of ' + N + ' students. About how many students scored between ' + f[i] + ' and ' + f[j] + '?') + boxplot(f, f[0] - st, f[4] + st, st), N * pc2 / 100, 'Each of the four parts of a boxplot (whisker, half box, half box, whisker) holds about 25% of the data.', p('From ' + f[i] + ' to ' + f[j] + ' are ' + (j - i) + ' parts of 25%: ' + pc2 + '%.') + p(pc2 + ' / 100 · ' + N + ' = ' + N * pc2 / 100 + ' students'), { noStep: true }); }
    const dir = pick(['more', 'less']), k = dir === 'more' ? ri(1, 3) : ri(0, 2), cut = f[k + (dir === 'more' ? 0 : 1)], pc = dir === 'more' ? 100 - 25 * (k) : 25 * (k + 1);
    return nu(p('The boxplot shows the scores of ' + N + ' students. About how many students scored ' + (dir === 'more' ? 'more than ' : 'less than ') + cut + '?') + boxplot(f, f[0] - st, f[4] + st, st), N * pc / 100, 'Each of the four parts of a boxplot (whisker, half box, half box, whisker) holds about 25% of the data.', p((dir === 'more' ? 'Above ' : 'Below ') + cut + ' are ' + pc / 25 + ' parts of 25%: ' + pc + '%.') + p(pc + ' / 100 · ' + N + ' = ' + N * pc / 100 + ' students'), { noStep: true });
  },
  function shiftScale(l) {
    const R = ri(4, 20), I = ri(2, R - 1), c = ri(2, 9), k = pick([2, 1.5, 3, 0.5]), add = Math.random() < .5, ask = pick(['range', 'IQR']), v = ask === 'range' ? R : I;
    return nu(p('A dataset has range ' + R + ' and interquartile range ' + I + '. ' + (add ? 'You add ' + c + ' to every value.' : 'You multiply every value by ' + k + '.') + ' What is the new ' + (ask === 'range' ? 'range' : 'interquartile range') + '?'), add ? v : rd(v * k), 'Adding the same number moves all values, but the distances stay the same. Multiplying multiplies the distances too.', add ? 'All values move up ' + c + '; the distances do not change: ' + v + '.' : 'All distances are multiplied by ' + k + ': ' + v + ' · ' + k + ' = ' + rd(v * k) + '.', { noStep: true });
  }
];
XG['4.5'] = [
  function compareBoxplots(l) {
    const st = 5, A = sorted(Array.from({ length: 5 }, () => ri(2, 18) * st)), B = sorted(Array.from({ length: 5 }, () => ri(4, 22) * st)); if (A[3] <= A[1] || B[3] <= B[1] || A[2] === B[2]) return compareBoxplots(l);
    const lo = Math.floor((Math.min(A[0], B[0]) - st) / 10) * 10, hi = Math.max(A[4], B[4]) + st, kind = pick(['median', 'IQR']), vA = kind === 'median' ? A[2] : A[3] - A[1], vB = kind === 'median' ? B[2] : B[3] - B[1];
    if (vA === vB) return compareBoxplots(l);
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
/* ======================= 3VT (V3-TTO ch4, poster assignment 2026-27): extra items from the V3 book, lessons = types of data analysis ======================= */
let __LESSONS = [];
if (P.cls === '3VT') {
  const pctParts = (k, T) => { for (let t = 0; t < 400; t++) { const c = Array.from({ length: k - 1 }, () => ri(1, 9) * 5); const last = 100 - sum(c); if (last >= 5 && c.concat(last).every(x => Number.isInteger(T * x / 100))) return c.concat(last); } return null; };
  /* scatter plot on a grid, optional trend line [[x1,y1],[x2,y2]] */
  function scatter(pts, X, Y, o) {
    o = o || {}; const W = 360, H = 260, L = 40, B = 34, T = 12, R = 12, sx = x => L + (W - L - R) * (x - X[0]) / (X[1] - X[0]), sy = y => H - B - (H - B - T) * (y - Y[0]) / (Y[1] - Y[0]); let s = '';
    for (let x = X[0]; x <= X[1] + 1e-9; x += X[2]) s += '<line x1="' + sx(x) + '" x2="' + sx(x) + '" y1="' + T + '" y2="' + sy(Y[0]) + '" stroke="#e3e8ee"/><text x="' + sx(x) + '" y="' + (H - B + 15) + '" font-size="11" text-anchor="middle">' + rd(x) + '</text>';
    for (let y = Y[0]; y <= Y[1] + 1e-9; y += Y[2]) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + sy(y) + '" y2="' + sy(y) + '" stroke="#e3e8ee"/><text x="' + (L - 5) + '" y="' + (sy(y) + 4) + '" font-size="11" text-anchor="end">' + rd(y) + '</text>';
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + sy(Y[0]) + '" y2="' + sy(Y[0]) + '" stroke="#333"/><line x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + sy(Y[0]) + '" stroke="#333"/>';
    if (o.line) { const [[a, b], [c, d]] = o.line, m = (d - b) / (c - a), f = x => b + m * (x - a); let x0 = X[0], x1 = X[1]; const clip = x => Math.max(Y[0], Math.min(Y[1], f(x))); if (m) { const xa = a + (Y[0] - b) / m, xb = a + (Y[1] - b) / m; x0 = Math.max(X[0], Math.min(xa, xb)); x1 = Math.min(X[1], Math.max(xa, xb)); } s += '<line x1="' + sx(x0) + '" y1="' + sy(clip(x0)) + '" x2="' + sx(x1) + '" y2="' + sy(clip(x1)) + '" stroke="#d1495b" stroke-width="2"/>'; }
    pts.forEach(([x, y]) => { s += '<circle cx="' + sx(x) + '" cy="' + sy(y) + '" r="3.6" fill="#1b5fa8"/>'; });
    if (o.xl) s += '<text x="' + (W - R) + '" y="' + (H - 3) + '" font-size="11" text-anchor="end" fill="#333">' + o.xl + '</text>';
    if (o.yl) s += '<text x="' + (L + 4) + '" y="' + (T + 10) + '" font-size="11" fill="#333">' + o.yl + '</text>';
    return svgWrap('<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="background:#fff">' + s + '</svg>', 400);
  }
  const byName = (arr, n) => arr.find(f => f.name === n);
  const moveTo = (from, to, n) => { const i = from.findIndex(f => f.name === n); if (i >= 0) to.push(from.splice(i, 1)[0]); };

  /* ---------- 4.1 Tables ---------- */
  G['4.1'].push(function freqTotal(l) {
    const C = shuffle(pick([['football', 'hockey', 'tennis', 'swimming'], ['bike', 'bus', 'car', 'on foot'], ['cat', 'dog', 'fish', 'no pet'], ['pop', 'rock', 'hip-hop', 'classical']]));
    let T, pc; do { T = pick([20, 40, 50, 60, 80, 100, 120, 160, 200, 240, 300, 400]); pc = pctParts(l === 0 ? 3 : 4, T); } while (!pc);
    const n = pc.map(x => T * x / 100);
    if (l === 0) return nu(p('In a survey, ' + pc[0] + '% chose <b>' + C[0] + '</b>. That is ' + n[0] + ' people. How many people took part in the survey?'), T, n[0] + ' people are ' + pc[0] + '%. Find 1% first, then 100%.', p(pc[0] + '% → ' + n[0] + ' people') + p('total = ' + n[0] + ' / ' + pc[0] + ' · 100 = ' + T + ' people'));
    if (l === 1) return nu(p('The table shows the relative frequencies of a survey. ' + n[1] + ' people chose <b>' + C[1] + '</b>. How many people chose <b>' + C[2] + '</b>?') + vtbl(['answer', 'relative frequency'], C.map((c, k) => [c, pc[k] + '%'])), n[2], 'First find the total from the ' + n[1] + ' people who chose ' + C[1] + '.', p('total = ' + n[1] + ' / ' + pc[1] + ' · 100 = ' + T) + p(C[2] + ': ' + pc[2] + ' / 100 · ' + T + ' = ' + n[2] + ' people'));
    // spicy: the last percentage is missing, only its absolute frequency is given
    return nu(p('In a survey, ' + pc[0] + '% chose ' + C[0] + ', ' + pc[1] + '% chose ' + C[1] + ' and ' + pc[2] + '% chose ' + C[2] + '. The other ' + n[3] + ' people chose ' + C[3] + '. How many people chose <b>' + C[0] + '</b>?'), n[0], 'First find the percentage for ' + C[3] + ', then the total.', p(C[3] + ': 100% − ' + pc[0] + '% − ' + pc[1] + '% − ' + pc[2] + '% = ' + pc[3] + '%') + p('total = ' + n[3] + ' / ' + pc[3] + ' · 100 = ' + T) + p(C[0] + ': ' + pc[0] + ' / 100 · ' + T + ' = ' + n[0] + ' people'));
  });
  G['4.1'].push(function fillTwoWay(l) {
    const R = pick([['boys', 'girls'], ['year 3', 'year 4'], ['class A', 'class B']]), K = pick([['yes', 'no'], ['passed', 'failed'], ['cycles', 'does not cycle']]);
    const a = ri(4, 25), b = ri(4, 25), c = ri(4, 25), d = ri(4, 25), N = a + b + c + d;
    const full = [[a, b, a + b], [c, d, c + d], [a + c, b + d, N]];
    const show = l === 0 ? [[1, 0, 1], [0, 1, 1], [1, 1, 1]] : l === 1 ? [[1, 0, 1], [1, 0, 0], [1, 1, 1]] : [[1, 0, 0], [0, 0, 1], [0, 1, 1]];
    const askA = [0, 1], askB = l === 0 ? [1, 0] : l === 1 ? [1, 1] : [1, 0];
    const cell = (i, j) => (i === askA[0] && j === askA[1]) ? '<b>A</b>' : (i === askB[0] && j === askB[1]) ? '<b>B</b>' : show[i][j] ? full[i][j] : '';
    const tb = vtbl(['', K[0], K[1], 'total'], [0, 1, 2].map(i => [i < 2 ? R[i] : 'total'].concat([0, 1, 2].map(j => cell(i, j)))));
    const ansB = full[askB[0]][askB[1]];
    let st;
    if (l === 0) st = p('A = ' + (a + b) + ' − ' + a + ' = ' + b) + p('B = ' + (c + d) + ' − ' + d + ' = ' + c);
    else if (l === 1) st = p('A = ' + (a + b) + ' − ' + a + ' = ' + b) + p('B = ' + (b + d) + ' − ' + b + ' = ' + d);
    else st = p('total ' + K[0] + ': ' + N + ' − ' + (b + d) + ' = ' + (a + c)) + p('B = ' + (a + c) + ' − ' + a + ' = ' + c) + p(R[1] + ', ' + K[1] + ': ' + (c + d) + ' − ' + c + ' = ' + d) + p('A = ' + (b + d) + ' − ' + d + ' = ' + b);
    return mu(p('Complete the contingency table. Give the numbers in the cells A and B.') + tb, ['A =', 'B ='], [b, ansB], 'Every row and every column adds up to its total.' + (l >= 2 ? ' Start with the total of the column ' + K[0] + '.' : ''), st);
  });
  G['4.1'].push(function combinedRows(l) {
    const [grp, what] = pick([[['first class', 'second class', 'third class'], 'survived'], [['year 1', 'year 2', 'year 3'], 'passed the exam'], [['Groningen', 'Friesland', 'Drenthe'], 'take the bus'], [['year 1', 'year 2', 'year 3'], 'take the bus']]);
    const tot = grp.map(() => ri(40, 250)), yes = tot.map(t => ri(Math.round(t * .15), Math.round(t * .85)));
    const tb = vtbl(['group', what, 'total'], grp.map((g, i) => [g, yes[i], tot[i]]));
    if (l === 0) { const i = ri(0, 2); return nu(p('What percentage of ' + grp[i] + ' ' + what + '? Round to 1 decimal.') + tb, rd(yes[i] / tot[i] * 100, 1), 'Use the total of ' + grp[i] + ' only.', yes[i] + ' / ' + tot[i] + ' · 100%' + ap(yes[i] / tot[i] * 100, 1) + '%', { tol: .051 }); }
    const [i, j] = shuffle([0, 1, 2]).slice(0, 2).sort();
    if (l === 1) { const Y = yes[i] + yes[j], Tt = tot[i] + tot[j]; return nu(p('What percentage of ' + grp[i] + ' and ' + grp[j] + ' <b>together</b> ' + what + '? Round to 1 decimal.') + tb, rd(Y / Tt * 100, 1), 'Add the numbers of both groups first, then divide.', p(what + ': ' + yes[i] + ' + ' + yes[j] + ' = ' + Y) + p('total: ' + tot[i] + ' + ' + tot[j] + ' = ' + Tt) + p(Y + ' / ' + Tt + ' · 100%' + ap(Y / Tt * 100, 1) + '%'), { tol: .051 }); }
    // spicy: the 'not' column is not in the table
    const no = tot[i] - yes[i] + tot[j] - yes[j], Tt = tot[i] + tot[j];
    return nu(p('What percentage of ' + grp[i] + ' and ' + grp[j] + ' together did <b>not</b> ' + what.replace(/^(survived|passed)/, m => m === 'survived' ? 'survive' : 'pass') + '? Round to 1 decimal.') + tb, rd(no / Tt * 100, 1), 'First work out how many did not, in each group.', p('not: (' + tot[i] + ' − ' + yes[i] + ') + (' + tot[j] + ' − ' + yes[j] + ') = ' + (tot[i] - yes[i]) + ' + ' + (tot[j] - yes[j]) + ' = ' + no) + p('total: ' + tot[i] + ' + ' + tot[j] + ' = ' + Tt) + p(no + ' / ' + Tt + ' · 100%' + ap(no / Tt * 100, 1) + '%'), { tol: .051 });
  });
  XG['4.1'].push(function trendCount(l) {
    let n1, p1, n2, p2; do { n1 = ri(12, 40) * 10; n2 = ri(12, 40) * 10; p1 = ri(4, 16) * 5; p2 = ri(4, 16) * 5; } while (!Number.isInteger(n1 * p1 / 100) || !Number.isInteger(n2 * p2 / 100) || p1 === p2 || n1 * p1 === n2 * p2 || (p1 > p2) === (n1 * p1 > n2 * p2));
    const a = n1 * p1 / 100, b = n2 * p2 / 100, what = pick(['cycled to school', 'had a part-time job', 'played a sport at a club']);
    return nu(p('In 2025, ' + p1 + '% of the ' + n1 + ' students of a school ' + what + '. In 2026, ' + p2 + '% of the ' + n2 + ' students ' + what + '. How many <b>more</b> students ' + what + ' in 2026 than in 2025? <small>(A negative answer means fewer.)</small>'), b - a, 'The percentage went ' + (p2 > p1 ? 'up' : 'down') + ', but the number of students changed too. Work out both absolute frequencies.', p('2025: ' + p1 + ' / 100 · ' + n1 + ' = ' + a) + p('2026: ' + p2 + ' / 100 · ' + n2 + ' = ' + b) + p(b + ' − ' + a + ' = ' + (b - a) + ' students'));
  });
  XG['4.1'].push(function addResponses(l) {
    let N, pc; do { N = pick([20, 25, 30, 40, 50, 60]); pc = ri(2, 12) * 5; } while (!Number.isInteger(N * pc / 100));
    const k = ri(4, 15), a = N * pc / 100, what = pick(['chose pizza', 'voted yes', 'chose the cinema']);
    return nu(p('In a survey of ' + N + ' people, ' + pc + '% ' + what + '. Then ' + k + ' more people are asked, and they all ' + what + ' too. What is the new relative frequency of the people who ' + what + '? Round to 1 decimal.'), rd((a + k) / (N + k) * 100, 1), 'First the absolute frequency before the extra people, then the new total.', p('before: ' + pc + ' / 100 · ' + N + ' = ' + a) + p('after: ' + a + ' + ' + k + ' = ' + (a + k) + ' out of ' + N + ' + ' + k + ' = ' + (N + k)) + p((a + k) + ' / ' + (N + k) + ' · 100%' + ap((a + k) / (N + k) * 100, 1) + '%'), { tol: .051 });
  });
  XG['4.1'].push(function passBoth(l) {
    const N = ri(25, 40), f1 = ri(5, 14), f2 = ri(5, 14), both = ri(2, Math.min(f1, f2) - 1), pb = N - f1 - f2 + both;
    if (Math.random() < .5) return nu(p('In a class of ' + N + ' students, ' + f1 + ' students failed test 1 and ' + f2 + ' students failed test 2. ' + both + ' students failed both tests. How many students passed <b>both</b> tests? <small>(Tip: make a contingency table.)</small>'), pb, 'Make a table with test 1 (failed/passed) and test 2 (failed/passed).', p('failed only test 1: ' + f1 + ' − ' + both + ' = ' + (f1 - both)) + p('failed only test 2: ' + f2 + ' − ' + both + ' = ' + (f2 - both)) + p('passed both: ' + N + ' − ' + both + ' − ' + (f1 - both) + ' − ' + (f2 - both) + ' = ' + pb));
    return nu(p('In a class of ' + N + ' students, ' + f1 + ' students failed test 1 and ' + f2 + ' students failed test 2. ' + both + ' students failed both tests. What percentage of the students who failed test 1 <b>passed</b> test 2? Round to 1 decimal.'), rd((f1 - both) / f1 * 100, 1), 'The whole is now the ' + f1 + ' students who failed test 1.', p('failed test 1 but passed test 2: ' + f1 + ' − ' + both + ' = ' + (f1 - both)) + p((f1 - both) + ' / ' + f1 + ' · 100%' + ap((f1 - both) / f1 * 100, 1) + '%'), { tol: .051 });
  });

  /* ---------- 4.2 Charts ---------- */
  moveTo(XG['4.2'], G['4.2'], 'misleadingAxis');
  G['4.2'].push(function chooseChart(l) {
    const D = [['how the temperature changed during one day', 'line graph'], ['how the votes in an election are divided over the parties (in %)', 'pie chart'], ['the number of students for each favourite sport', 'bar chart'], ['the heights in cm of 300 students', 'histogram'], ['the monthly sales of a shop over two years', 'line graph'], ['how a family spends its budget, as parts of the whole', 'pie chart'], ['the number of cars of each brand in a car park', 'bar chart'], ['the travel times in minutes of 200 students', 'histogram'], ['the number of members of a club from 2000 to 2025', 'line graph'], ['the ages of all 500 visitors of a festival', 'histogram']], d = pick(D);
    const why = { 'line graph': 'A line graph shows how something changes over time.', 'pie chart': 'A pie chart shows how a whole is divided into parts.', 'bar chart': 'A bar chart compares the frequencies of separate categories.', 'histogram': 'Many different numbers: group them in classes and draw a histogram.' };
    return ch(p('Which chart fits best to show ' + d[0] + '?'), d[1], ['line graph', 'pie chart', 'bar chart', 'histogram'].filter(x => x !== d[1]), 'Ask yourself: time? parts of a whole? categories? many different numbers?', why[d[1]]);
  });
  XG['4.2'].push(function pictoPie(l) {
    const k = pick([2, 4, 5, 10]), S = pick([['police', 'ambulance', 'fire brigade'], ['bus', 'train', 'tram'], ['apples', 'pears', 'plums']]);
    let s, T; do { s = S.map(() => ri(2, 14) / 2); T = sum(s) * k; } while (!Number.isInteger(T) || s.some(v => !Number.isInteger(v * k)));
    const dot = h => '<svg width="16" height="16" viewBox="0 0 16 16" style="vertical-align:middle;margin-right:3px">' + (h ? '<path d="M8 2 A6 6 0 0 0 8 14 Z" fill="#1b5fa8"/>' : '<circle cx="8" cy="8" r="6" fill="#1b5fa8"/>') + '</svg>', icon = v => dot(0).repeat(Math.floor(v)) + (v % 1 ? dot(1) : ''), i = ri(0, 2), c = s.map(v => v * k);
    return nu(p('In the pictogram, one ' + dot(0) + ' stands for ' + k + (S[0] === 'apples' ? ' kg' : ' trips') + ' (' + dot(1) + ' is half of that).') + vtbl(['', 'pictogram'], S.map((x, j) => [x, icon(s[j])])) + p('You draw a pie chart of these data. What is the angle of the sector for <b>' + S[i] + '</b>? Round to whole degrees.'), rd(c[i] / T * 360, 0), 'First turn the pictogram into numbers, then angle = part / total · 360°.', p(S.map((x, j) => x + ': ' + s[j] + ' · ' + k + ' = ' + c[j]).join(', ')) + p('total = ' + c.join(' + ') + ' = ' + T) + p(c[i] + ' / ' + T + ' · 360°' + ap(c[i] / T * 360, 0) + '°'), { tol: .51 });
  });
  XG['4.2'].push(function axisPercent(l) {
    const a = rd(ri(50000, 70000) / 100, 2), b = rd(a + ri(20, 150) / 100, 2), lo = Math.floor(a) - 1;
    return nu(p('A bar chart compares two prices: €' + a.toFixed(2) + ' and €' + b.toFixed(2) + '. The vertical axis starts at €' + lo + ', so the bar of €' + b.toFixed(2) + ' looks about ' + rd((b - lo) / (a - lo), 1) + ' times as high. By how many percent is €' + a.toFixed(2) + ' really <b>lower</b> than €' + b.toFixed(2) + '? Round to 2 decimals.'), rd((b - a) / b * 100, 2), 'Lower than €' + b.toFixed(2) + ': divide the difference by ' + b.toFixed(2) + '.', p('difference: ' + b.toFixed(2) + ' − ' + a.toFixed(2) + ' = ' + rd(b - a, 2).toFixed(2)) + p(rd(b - a, 2).toFixed(2) + ' / ' + b.toFixed(2) + ' · 100%' + ap((b - a) / b * 100, 2) + '%') + p('That is tiny: the chart is misleading because the axis does not start at 0.'), { tol: .0051 });
  });

  /* ---------- 4.3 Grouping into classes ---------- */
  G['4.3'].push(function roundedClass(l) {
    const w = 5, a0 = pick([80, 90, 150, 40]), unit = a0 >= 150 ? 'cm' : a0 >= 80 ? 'g' : 'kg', cls = [0, 1, 2, 3, 4].map(i => (a0 + i * w) + ' – ' + (a0 + i * w + w - 1));
    if (l >= 2) {   // spicy: the real class boundaries of rounded data
      const i = ri(1, 3), lo = a0 + i * w;
      return mu(p('Measurements were rounded to whole ' + unit + ' and grouped in the classes ' + cls.join(', ') + '. What are the <b>real</b> lower and upper boundaries of the class ' + cls[i] + '?'), ['lower boundary =', 'upper boundary ='], [lo - .5, lo + w - .5], 'A value is rounded to ' + lo + ' from ' + (lo - .5) + ' on.', p('The smallest value that rounds to ' + lo + ' is ' + (lo - .5) + '.') + p('Values up to (not including) ' + (lo + w - .5) + ' round to ' + (lo + w - 1) + ' or less.') + p('So the class is really ' + (lo - .5) + ' –< ' + (lo + w - .5) + '.'));
    }
    const i = ri(1, 4), lo = a0 + i * w, v = rd(lo - 1 + ri(51, 99) / 100, 2), r = Math.round(v);
    const right = cls[i], wr = [cls[i - 1]].concat(i < 4 ? [cls[i + 1]] : [cls[i - 2]]);
    return ch(p('Measurements were rounded to whole ' + unit + ' and grouped in the classes ' + cls.join(', ') + '. One measurement is ' + v + ' ' + unit + '. In which class does it belong?'), right, wr, 'Round first, then look for the class.', p(v + ' rounds to ' + r + '.') + p(r + ' belongs to the class ' + right + '.'));
  });
  XG['4.3'].push(function regroup(l) {
    const a0 = ri(2, 5) * 10, f = Array.from({ length: 6 }, () => ri(1, 12)), N = sum(f), k = ri(0, 2), F = f[2 * k] + f[2 * k + 1], lo = a0 + 10 * k;
    return mu(p('The table shows the travel times (minutes) of a group of students.') + vtbl(['time (min)', 'frequency'], f.map((v, i) => [(a0 + 5 * i) + ' –< ' + (a0 + 5 * i + 5), v])) + p('You regroup the data in classes with class width 10: ' + a0 + ' –< ' + (a0 + 10) + ', ' + (a0 + 10) + ' –< ' + (a0 + 20) + ', … Give the frequency and the relative frequency (%) of the new class <b>' + lo + ' –< ' + (lo + 10) + '</b>. Round to 1 decimal.'), ['frequency =', 'relative frequency (%) ='], [F, rd(F / N * 100, 1)], 'The new class consists of two old classes. The relative frequency uses the total of all students.', p('frequency: ' + f[2 * k] + ' + ' + f[2 * k + 1] + ' = ' + F) + p('total: ' + f.join(' + ') + ' = ' + N) + p(F + ' / ' + N + ' · 100%' + ap(F / N * 100, 1) + '%'), { tol: .051 });
  });

  /* ---------- 4.4 Measures of centre ---------- */
  G['4.4'].push(function medianClass(l) {
    const w = 10, a0 = ri(2, 5) * 10, cl = [0, 1, 2, 3, 4].map(i => (a0 + i * w) + ' –< ' + (a0 + i * w + w));
    let f; do { f = Array.from({ length: 5 }, () => ri(1, 14)); } while (new Set(f).size < 5);
    const N = sum(f), tb = vtbl(['speed (km/h)', 'frequency'], f.map((v, i) => [cl[i], v]));
    if (l === 0) { const m = f.indexOf(Math.max(...f)); return ch(p('What is the <b>modal class</b> of these data?') + tb, cl[m], cl.filter((_, i) => i !== m), 'The modal class is the class with the highest frequency.', 'The highest frequency is ' + f[m] + ', in the class ' + cl[m] + '.'); }
    const cum = []; f.reduce((s, v, i) => (cum[i] = s + v), 0);
    const pos = N % 2 ? [(N + 1) / 2] : [N / 2, N / 2 + 1], ci = x => cum.findIndex(c => c >= x), c1 = ci(pos[0]), c2 = ci(pos[pos.length - 1]);
    if (c1 !== c2) return medianClass(l);
    return ch(p('In which class is the <b>median</b>?') + tb, cl[c1], cl.filter((_, i) => i !== c1).slice(0, 3), 'Find the position of the middle value, then count down the table.', p(N + ' values, so the median is ' + (pos.length === 1 ? 'the ' + ord(pos[0]) + ' value' : 'the mean of the ' + ord(pos[0]) + ' and ' + ord(pos[1]) + ' values') + '.') + p('Running totals: ' + cum.join(', ') + '.') + p('So the median is in the class ' + cl[c1] + '.'));
  });
  G['4.4'].push(function whichMeasure(l) {
    if (Math.random() < .4) { const it = pick(['favourite colour', 'phone brand', 'favourite sport']); return ch(p('You asked 30 students about their <b>' + it + '</b>. Which measure of centre can you use?'), 'the mode', ['the mean', 'the median'], 'Can you calculate with these data or put them in order?', 'These are qualitative data: you cannot add them or put them in order. Only the mode (the answer that occurs most often) works.'); }
    const base = Array.from({ length: 7 }, () => ri(20, 30)), big = ri(150, 400), a = sorted(base.concat(big));
    return ch(p('The monthly pocket money (€) of 8 students is:') + list(shuffle(a.slice())) + p('Which measure of centre describes these data best?'), 'the median', ['the mean', 'the range'], 'One value is very different from the rest (an outlier).', p('The mean is ' + rd(sum(a) / 8, 2) + ', much higher than what almost everybody gets, because of the outlier ' + big + '.') + p('The median (' + neg(med(a)) + ') is hardly affected by the outlier. The range is not a measure of centre.'));
  });
  XG['4.4'].push(function harmonicMean(l) {
    const n = ri(3, 4), A = pick([40, 50, 60]), pr = Array.from({ length: n }, () => rd(ri(165, 215) / 100, 2)); if (new Set(pr).size < n) return harmonicMean(l);
    const L = pr.map(x => A / x), hm = n * A / sum(L);
    return nu(p('Every month you buy fuel for exactly €' + A + '. The prices per litre in ' + n + ' months were ' + pr.map(x => '€' + x.toFixed(2)).join(', ') + '. What was the average price per litre that you paid? Round to 2 decimals.'), rd(hm, 2), 'Average price = total amount paid / total number of litres. It is not the ordinary mean of the prices (that would be ' + rd(sum(pr) / n, 3) + ').', p('litres: ' + pr.map(x => A + ' / ' + x.toFixed(2) + ap(A / x, 3)).join(', ')) + p('total: €' + n * A + ' for ' + rd(sum(L), 3) + ' L') + p(n * A + ' / ' + rd(sum(L), 3) + ap(hm, 2) + ' euros per litre (this is the harmonic mean of the prices)'), { tol: .0051 });
  });
  XG['4.4'].push(function meanChange(l) {
    if (Math.random() < .5) {
      const n = ri(5, 9), m1 = rd(ri(55, 75) / 10, 1); let x, m2; do { x = rd(ri(30, 100) / 10, 1); m2 = rd((n * m1 + x) / (n + 1), 4); } while (Math.abs(m2 * 10 - Math.round(m2 * 10)) > 1e-9 || m2 === m1);
      return nu(p('After ' + n + ' tests (all with the same weight) your mean mark is ' + m1 + '. After the next test your mean mark is ' + m2 + '. What mark did you get on that test?'), x, 'Mean · number of tests = total of the marks.', p('total before: ' + n + ' · ' + m1 + ' = ' + rd(n * m1)) + p('total after: ' + (n + 1) + ' · ' + m2 + ' = ' + rd((n + 1) * m2)) + p('mark: ' + rd((n + 1) * m2) + ' − ' + rd(n * m1) + ' = ' + x));
    }
    const n = ri(10, 16), m = rd(ri(140, 170) / 10, 1), c = ri(32, 58), nm = (n * m + c) / (n + 1);
    return nu(p('The mean age of the ' + n + ' players of a team is ' + m + ' years. Their coach, aged ' + c + ', joins the group. What is the mean age of the whole group now? Round to 1 decimal.'), rd(nm, 1), 'First the total of all ages, then divide by the new number of people.', p('total of the players: ' + n + ' · ' + m + ' = ' + rd(n * m)) + p('with the coach: ' + rd(n * m) + ' + ' + c + ' = ' + rd(n * m + c)) + p(rd(n * m + c) + ' / ' + (n + 1) + ap(nm, 1) + ' years'), { tol: .051 });
  });

  /* ---------- 4.5 Measures of spread (and scatter plots) ---------- */
  moveTo(XG['4.5'], G['4.5'], 'outlierEffect'); moveTo(XG['4.5'], G['4.5'], 'compareBoxplots');
  G['4.5'].push(function boxFromTable(l) {
    const xs = [3, 4, 5, 6, 7, 8, 9]; let f, n; do { f = xs.map(() => ri(0, 6)); n = sum(f); } while (f[0] === 0 || f[6] === 0 || n < (l === 0 ? 9 : 14) || n > (l === 0 ? 15 : 26) || (l >= 2 && n % 4 === 0));
    const a = []; xs.forEach((x, i) => { for (let k = 0; k < f[i]; k++) a.push(x); }); const [q1, m, q3] = quart(a), h = Math.floor(n / 2);
    if (l === 0) return nu(p('The table shows the marks of ' + n + ' students. What is the <b>median</b> mark?') + vtbl(['mark', 'frequency'], xs.map((x, i) => [x, f[i]])), m, 'There are ' + n + ' marks. Find the middle position, then count down the table.', p('In order: ' + a.join(' ')) + p('median: ' + medTxt(a)), { noStep: true });
    return mu(p('The table shows the marks of ' + n + ' students. Give Q<sub>1</sub>, the median and Q<sub>3</sub>.') + vtbl(['mark', 'frequency'], xs.map((x, i) => [x, f[i]])), ['Q1 =', 'median =', 'Q3 ='], [q1, m, q3], 'Write the marks in order (or count down the table). The median splits them in two halves; Q<sub>1</sub> and Q<sub>3</sub> are the medians of the halves.', p('In order: ' + a.join(' ')) + p('median: ' + medTxt(a)) + p('lower half (' + h + ' values): Q<sub>1</sub> = ' + neg(q1)) + p('upper half (' + h + ' values): Q<sub>3</sub> = ' + neg(q3)));
  });
  G['4.5'].push(function scatterRelation(l) {
    const kind = pick(['pos', 'neg', 'none']), pts = []; const sl = kind === 'pos' ? ri(5, 9) / 10 : kind === 'neg' ? -ri(5, 9) / 10 : 0;
    for (let i = 0; i < 16; i++) { const x = rd(ri(5, 95) / 10, 1); let y = kind === 'none' ? ri(5, 95) / 10 : 5 + sl * (x - 5) + (Math.random() - .5) * 2.6; y = Math.max(.3, Math.min(9.7, y)); pts.push([x, rd(y, 1)]); }
    if (kind === 'none') { const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), mx = sum(xs) / 16, my = sum(ys) / 16, r = sum(pts.map(q => (q[0] - mx) * (q[1] - my))) / Math.sqrt(sum(xs.map(x => (x - mx) ** 2)) * sum(ys.map(y => (y - my) ** 2))); if (Math.abs(r) > .25) return scatterRelation(l); }
    if (l >= 2) {   // spicy: interpret in context
      const C = pick([['average spring temperature (°C)', 'day in March of the first egg', 'The warmer the spring, the earlier the first egg is found.', 'The warmer the spring, the later the first egg is found.'], ['hours of practice per week', 'test score', 'The more practice, the higher the score.', 'The more practice, the lower the score.']]);
      const pos = C[0].startsWith('average') ? C[3] : C[2], ng = C[0].startsWith('average') ? C[2] : C[3];
      const r2 = kind === 'pos' ? pos : kind === 'neg' ? ng : 'There is no clear relationship.';
      return ch(p('The scatter plot shows the ' + C[0] + ' (horizontal) and the ' + C[1] + ' (vertical). Which conclusion fits the scatter plot?') + scatter(pts, [0, 10, 1], [0, 10, 1], {}), r2, [pos, ng, 'There is no clear relationship.'].filter(x => x !== r2), 'Do the points lie on a strip going up, a strip going down, or all over the place?', kind === 'pos' ? 'The points lie on a strip from bottom left to top right: when the first variable is larger, the second one is larger too.' : kind === 'neg' ? 'The points lie on a strip from top left to bottom right: when the first variable is larger, the second one is smaller.' : 'The points are spread all over the plot: there is no clear relationship.');
    }
    const r = { pos: 'positive: the larger x, the larger y', neg: 'negative: the larger x, the smaller y', none: 'no clear relationship' };
    return ch(p('What kind of relationship does this scatter plot show?') + scatter(pts, [0, 10, 1], [0, 10, 1], { xl: 'x', yl: 'y' }), r[kind], Object.values(r).filter(x => x !== r[kind]), 'Look at the direction of the cloud of points.', kind === 'none' ? 'The points are spread all over the plot.' : 'The points lie on a strip going ' + (kind === 'pos' ? 'up' : 'down') + ' from left to right.');
  });
  G['4.5'].push(function trendPredict(l) {
    const x1 = ri(1, 3), x2 = ri(7, 9), y1 = ri(2, 8) * 5, y2 = ri(2, 8) * 5; if (y1 === y2) return trendPredict(l);
    const m = (y2 - y1) / (x2 - x1), f = x => y1 + m * (x - x1), pts = [];
    for (let i = 0; i < 14; i++) { const x = rd(ri(5, 100) / 10, 1); pts.push([x, rd(Math.max(1, Math.min(49, f(x) + (Math.random() - .5) * 8)), 1)]); }
    const C = pick([['hours of sunshine', 'ice creams sold (×10)', x => 'a day with ' + x + ' hours of sunshine'], ['age of a car (years)', 'price (× €1000)', x => 'a car that is ' + x + ' years old'], ['training hours', 'points scored', x => 'a player who trains ' + x + ' hours']]);
    if (l >= 2) {   // spicy: reverse, give x for a y beyond the plot
      const xq = pick([11, 12, 13]), yq = f(xq); if (yq <= 0) return trendPredict(l);
      return nu(p('The red trend line goes through (' + x1 + ', ' + y1 + ') and (' + x2 + ', ' + y2 + '). Use the trend line to predict the ' + C[1] + ' for ' + C[2](xq) + '. Round to 1 decimal.') + scatter(pts, [0, 10, 1], [0, 50, 5], { line: [[x1, y1], [x2, y2]], xl: C[0], yl: C[1] }), rd(yq, 1), 'The trend line does not reach ' + xq + ' in the picture: find its formula (gradient first).', p('gradient: (' + y2 + ' − ' + y1 + ') / (' + x2 + ' − ' + x1 + ')' + ap(m, 4)) + p('From x = ' + x1 + ' to x = ' + xq + ' is ' + (xq - x1) + ' steps to the right, so y changes by ' + (xq - x1) + ' · ' + (m < 0 ? '(' + neg(rd(m, 4)) + ')' : neg(rd(m, 4))) + ap((xq - x1) * m, 2) + '.') + p('y ≈ ' + y1 + (m < 0 ? ' − ' : ' + ') + rd(Math.abs((xq - x1) * m), 2) + ap(yq, 1)), { tol: .051 });
    }
    const xq = pick([4, 5, 6]), yq = f(xq);
    return nu(p('The red trend line goes through (' + x1 + ', ' + y1 + ') and (' + x2 + ', ' + y2 + '). Use the trend line to predict the ' + C[1] + ' for ' + C[2](xq) + '. Round to 1 decimal.') + scatter(pts, [0, 10, 1], [0, 50, 5], { line: [[x1, y1], [x2, y2]], xl: C[0], yl: C[1] }), rd(yq, 1), l === 0 ? 'Go up from ' + xq + ' to the red line and read off, or use the gradient.' : 'Gradient = Δy / Δx; then go from (' + x1 + ', ' + y1 + ') to x = ' + xq + '.', p('gradient: (' + y2 + ' − ' + y1 + ') / (' + x2 + ' − ' + x1 + ')' + ap(m, 4)) + p('From x = ' + x1 + ' to x = ' + xq + ' is ' + (xq - x1) + ' steps to the right, so y changes by ' + (xq - x1) + ' · ' + (m < 0 ? '(' + neg(rd(m, 4)) + ')' : neg(rd(m, 4))) + ap((xq - x1) * m, 2) + '.') + p('y ≈ ' + y1 + (m < 0 ? ' − ' : ' + ') + rd(Math.abs((xq - x1) * m), 2) + ap(yq, 1)), { tol: l === 0 ? 1.01 : .051 });
  });
  G['4.5'].push(function compareMeans(l) {
    const nA = ri(6, 9), nB = ri(6, 9), A = Array.from({ length: nA }, () => ri(10, 30)), B = Array.from({ length: nB }, () => ri(10, 30)), mA = sum(A) / nA, mB = sum(B) / nB;
    if (Math.abs(mA - mB) < .2) return compareMeans(l);
    const tA = 'group A: ' + A.join(', '), tB = 'group B: ' + B.join(', ');
    if (l >= 2) {   // spicy: compare mean and median, they can point different ways
      const a = sorted(A), b = sorted(B);
      return mu(p('Two groups did a quiz (scores).') + list([tA]) + list([tB]) + p('Give the mean of A minus the mean of B, and the median of A minus the median of B. Round to 1 decimal. <small>(Negative if B is larger.)</small>'), ['mean A − mean B =', 'median A − median B ='], [rd(mA - mB, 1), rd(med(a) - med(b), 1)], 'Calculate all four measures first.', p('mean A = ' + sum(A) + ' / ' + nA + ap(mA, 2) + ', mean B = ' + sum(B) + ' / ' + nB + ap(mB, 2)) + p('difference' + ap(mA - mB, 1)) + p('median A: ' + medTxt(a) + '; median B: ' + medTxt(b)) + p('difference = ' + neg(rd(med(a) - med(b), 1))), { tol: .11 });
    }
    return nu(p('Two groups did a quiz (scores).') + list([tA]) + list([tB]) + p('How much higher is the mean of group A than the mean of group B? Round to 1 decimal. <small>(A negative answer means lower.)</small>'), rd(mA - mB, 1), 'Calculate both means, then subtract.', p('mean A = ' + sum(A) + ' / ' + nA + ap(mA, 2)) + p('mean B = ' + sum(B) + ' / ' + nB + ap(mB, 2)) + p('difference' + ap(mA - mB, 1)), { tol: .11 });
  });
  XG['4.5'].push(function scaledSummary(l) {
    const f = sorted(Array.from({ length: 5 }, () => ri(15, 60) * 100)); if (new Set(f).size < 5) return scaledSummary(l);
    const pc = pick([2, 3, 4, 5]), extra = pick([0, 50, 100]), g = 1 + pc / 100, R = f[4] - f[0], I = f[3] - f[1];
    return mu(p('The monthly salaries (€) of the employees of a company have: lowest ' + f[0] + ', Q<sub>1</sub> = ' + f[1] + ', median ' + f[2] + ', Q<sub>3</sub> = ' + f[3] + ', highest ' + f[4] + '. Every salary goes up by ' + pc + '%' + (extra ? ' and then by another €' + extra : '') + '. Give the new range and the new interquartile range.'), ['new range =', 'new IQR ='], [rd(R * g, 2), rd(I * g, 2)], 'Multiplying multiplies all distances' + (extra ? '; adding the same amount to everyone changes no distance.' : '.'), p('old range = ' + f[4] + ' − ' + f[0] + ' = ' + R + ', old IQR = ' + f[3] + ' − ' + f[1] + ' = ' + I) + p('×' + g + ': range ' + R + ' · ' + g + ' = ' + rd(R * g, 2) + ', IQR ' + I + ' · ' + g + ' = ' + rd(I * g, 2)) + (extra ? p('+ €' + extra + ' for everyone does not change the range or the IQR.') : ''), { tol: .011 });
  });
  XG['4.5'].push(function boxTwoGroups(l) {
    const st = 100, B = sorted(Array.from({ length: 5 }, () => ri(15, 30) * st)); if (new Set(B).size < 5) return boxTwoGroups(l);
    const k = ri(1, 3), Nb = pick([40, 80, 120, 200]), gmax = B[k]; let Gp; do { Gp = sorted(Array.from({ length: 4 }, () => ri(10, gmax / st - 1) * st)); } while (new Set(Gp).size < 4);
    const Gr = Gp.concat(gmax), pc = 100 - 25 * k, lo = Math.floor((Math.min(Gr[0], B[0]) - st) / 200) * 200, hi = Math.ceil((B[4] + st) / 200) * 200;
    return nu(p('The box plots show the distances (m) that ' + Nb + ' boys and a group of girls ran in 12 minutes. About how many <b>boys</b> ran further than the girl who ran the furthest?') + boxplot(B, lo, hi, 200, [[Gr, 'girls'], [B, 'boys']]), Nb * pc / 100, 'Find the largest distance of the girls and look where it is in the box plot of the boys.', p('The furthest girl ran ' + gmax + ' m. In the boys\' box plot that is ' + ['', 'Q<sub>1</sub>', 'the median', 'Q<sub>3</sub>'][k] + '.') + p('About ' + pc + '% of the boys ran further.') + p(pc + ' / 100 · ' + Nb + ' = ' + Nb * pc / 100 + ' boys'));
  });
  XG['4.5'].push(function combinedPass(l) {
    const nA = ri(10, 15), nB = ri(10, 15), A = Array.from({ length: nA }, () => ri(3, 29)), B = Array.from({ length: nB }, () => ri(5, 32)), t = pick([15, 16, 18, 20]), pa = A.filter(x => x >= t).length, pb = B.filter(x => x >= t).length;
    return nu(p('Two groups did a test. You pass with a score of ' + t + ' or more.') + p('<b>group A</b>') + stemLeaf(A) + p('<b>group B</b>') + stemLeaf(B) + p('What percentage of <b>all</b> students passed? Round to 1 decimal.'), rd((pa + pb) / (nA + nB) * 100, 1), 'Count the passes in each group (stem = tens, leaf = units), and the total number of students.', p('passed A: ' + pa + ' of ' + nA + ', passed B: ' + pb + ' of ' + nB) + p('(' + pa + ' + ' + pb + ') / (' + nA + ' + ' + nB + ') · 100% = ' + (pa + pb) + ' / ' + (nA + nB) + ' · 100%' + ap((pa + pb) / (nA + nB) * 100, 1) + '%'), { tol: .051 });
  });
  XG['4.5'].push(function scatterCount(l) {
    const N = pick([20, 25]), pts = []; while (pts.length < N) { const x = ri(1, 19), y = ri(1, 19); if (!pts.some(q => q[0] === x && q[1] === y)) pts.push([x, y]); }
    const a = ri(6, 13) + .5, b = ri(6, 13) + .5, c = pts.filter(q => q[0] > a && q[1] > b).length; if (c < 2) return scatterCount(l);
    return nu(p('The scatter plot shows ' + N + ' students. What percentage of the students has an x-value greater than ' + a + ' <b>and</b> a y-value greater than ' + b + '?') + scatter(pts, [0, 20, 2], [0, 20, 2], { xl: 'x', yl: 'y' }), rd(c / N * 100, 1), 'Count the points to the right of x = ' + a + ' and above y = ' + b + '.', p('These points: ' + pts.filter(q => q[0] > a && q[1] > b).map(q => '(' + q[0] + ', ' + q[1] + ')').join(', ') + ': ' + c + ' points.') + p(c + ' / ' + N + ' · 100% = ' + rd(c / N * 100, 1) + '%'), { tol: .051 });
  });
  XG['4.5'].push(function investigation(l) {
    const nA = pick([11, 12, 13]), nB = pick([11, 12, 13]), A = Array.from({ length: nA }, () => ri(5, 40)), B = Array.from({ length: nB }, () => ri(10, 45)), a = sorted(A), b = sorted(B), qa = quart(a), qb = quart(b);
    const what = pick(['minutes of travel to school', 'minutes of sleep after midnight', 'minutes spent on homework']);
    return mu(p('A group investigates the ' + what + ' of students who come by bike (A) and by bus (B).') + list(['A: ' + A.join(', ')]) + list(['B: ' + B.join(', ')]) + p('Give the median and the interquartile range of both groups.'), ['median A =', 'IQR A =', 'median B =', 'IQR B ='], [qa[1], rd(qa[2] - qa[0]), qb[1], rd(qb[2] - qb[0])], 'Order each group first. Q<sub>1</sub> and Q<sub>3</sub> are the medians of the lower and upper halves.', p('A in order: ' + a.join(', ')) + p('median A: ' + medTxt(a) + '; Q<sub>1</sub> = ' + neg(qa[0]) + ', Q<sub>3</sub> = ' + neg(qa[2]) + ', IQR = ' + neg(rd(qa[2] - qa[0]))) + p('B in order: ' + b.join(', ')) + p('median B: ' + medTxt(b) + '; Q<sub>1</sub> = ' + neg(qb[0]) + ', Q<sub>3</sub> = ' + neg(qb[2]) + ', IQR = ' + neg(rd(qb[2] - qb[0]))) + p('Conclusion: group ' + (qa[1] > qb[1] ? 'A' : qa[1] < qb[1] ? 'B' : 'A and B (equal)') + ' has the larger median; group ' + (qa[2] - qa[0] > qb[2] - qb[0] ? 'A' : 'B') + ' has the larger spread (IQR).'));
  });

  /* ---------- book titles, goals ---------- */
  const T = { '4.1': ['4.1 Tables', 'Qualitative and quantitative data, frequency tables, contingency tables'], '4.2': ['4.2 Charts', 'Pie charts, bar charts, line graphs, stem-and-leaf plots, choosing a chart'], '4.3': ['4.3 Grouping into classes', 'Class limits, class midpoints, histograms'], '4.4': ['4.4 Measures of centre', 'Mean, weighted mean, median, mode, modal class'], '4.5': ['4.5 Measures of spread', 'Range, quartiles, IQR, box plots, scatter plots'] };
  SECTIONS.forEach(S => { S.title = T[S.id][0]; S.sub = T[S.id][1]; });
  GOALS.splice(0, GOALS.length,
    ['4.1', 'I can make and use frequency tables', ['qualQuant', 'relativeFreq', 'fromRelative', 'freqTotal'], 'relative frequency = frequency / total · 100%'],
    ['4.1', 'I can use contingency tables to compare groups', ['twoWayPercent', 'relativelyMost', 'fillTwoWay', 'combinedRows'], 'Compare groups with percentages, not with numbers.'],
    ['4.2', 'I can read, make and choose charts', ['pieAngle', 'pieBack', 'readBars', 'stemLeafRead', 'percentBack', 'chooseChart', 'misleadingAxis'], 'angle = part / total · 360°'],
    ['4.3', 'I can group data into classes and use histograms', ['whichClass', 'midpoint', 'histCount', 'barOrHist', 'groupTable', 'roundedClass'], 'In a –< b the upper limit b is not in the class.'],
    ['4.4', 'I can calculate and choose a measure of centre', ['measureList', 'modeList', 'tableMean', 'tableMedian', 'weightedMean', 'groupedMean', 'medianClass', 'whichMeasure'], 'Order the data before you find the median.'],
    ['4.5', 'I can find the spread and use box plots', ['rangeIQR', 'fiveNumbers', 'readBoxplot', 'boxPercent', 'shiftScale', 'boxFromTable', 'outlierEffect'], 'IQR = Q3 − Q1'],
    ['4.5', 'I can compare groups and read scatter plots', ['compareBoxplots', 'compareMeans', 'scatterRelation', 'trendPredict'], 'A strip of points going up: positive relationship.']
  );

  /* ---------- 'by lesson' = by type of data analysis (the poster steps) ---------- */
  const L = (id, title, sub, gens, xg) => ({ id, title, sub, gens, xg });
  const s = (sec, names) => names.map(n => [sec, n]);
  __LESSONS = [
    L('A1', 'Collecting data: frequency tables', 'Poster part B · qualitative or quantitative, absolute and relative frequency', s('4.1', ['qualQuant', 'relativeFreq', 'fromRelative', 'freqTotal']), s('4.1', ['trendCount', 'addResponses'])),
    L('A2', 'Comparing groups: contingency tables', 'Extension · two-way tables, percentages per group', s('4.1', ['twoWayPercent', 'relativelyMost', 'fillTwoWay', 'combinedRows']), s('4.1', ['holidaySurvey', 'passBoth'])),
    L('A3', 'Showing data: charts', 'Poster part C · pie chart, bar chart, line graph, stem-and-leaf, which chart?', s('4.2', ['chooseChart', 'pieAngle', 'pieBack', 'readBars', 'stemLeafRead', 'percentBack', 'misleadingAxis']), s('4.2', ['pictoPie', 'axisPercent'])),
    L('A4', 'Grouping data: classes and histograms', 'Poster part D · class limits, midpoints, histogram', s('4.3', ['whichClass', 'midpoint', 'groupTable', 'roundedClass', 'histCount', 'barOrHist']), s('4.3', ['incomeBounds', 'regroup'])),
    L('A5', 'Summarising: measures of centre', 'Poster part E · mean, median, mode, modal class, which measure fits?', s('4.4', ['measureList', 'modeList', 'tableMean', 'tableMedian', 'weightedMean', 'groupedMean', 'medianClass', 'whichMeasure']), s('4.4', ['neededMark', 'averageSpeed', 'harmonicMean', 'meanChange'])),
    L('A6', 'Summarising: spread and box plots', 'Poster part F · range, quartiles, IQR, box plot', s('4.5', ['rangeIQR', 'fiveNumbers', 'boxFromTable', 'readBoxplot', 'boxPercent', 'shiftScale', 'outlierEffect']), s('4.5', ['scaledSummary', 'boxTwoGroups'])),
    L('A7', 'Concluding: comparing groups and relationships', 'Poster part G + extensions · two box plots, means, scatter plots, trend lines', s('4.5', ['compareBoxplots', 'compareMeans', 'scatterRelation', 'trendPredict']).concat(s('4.1', ['relativelyMost'])), s('4.5', ['combinedPass', 'scatterCount', 'investigation']))
  ];
}
return { key: 'nx-' + P.cls.toLowerCase() + '-ch4-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['qualQuant', 'barOrHist', 'midpoint', 'whichClass', 'modeList', 'rangeIQR', 'chooseChart', 'misleadingAxis', 'whichMeasure', 'outlierEffect'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
