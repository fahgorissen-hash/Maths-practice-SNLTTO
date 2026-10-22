const { ri, pick, shuffle } = NX;
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => { d = d === undefined ? 6 : d; return Math.round(x * Math.pow(10, d) + 1e-9) / Math.pow(10, d); };
const neg = n => (n < 0 ? '−' : '') + String(rd(Math.abs(n)));
const X = v => '<i>' + (v || 'x') + '</i>';
const ap = (x, d) => (rd(x, d) === rd(x) ? ' = ' : ' ≈ ') + neg(rd(x, d));
const sp = n => { const s = String(n), m = s.split('.'); m[0] = m[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); return m.join('.'); };
const pw = (b, e) => b + '<sup>' + e + '</sup>';
const mult = pc => rd((100 + pc) / 100);
const multTxt = pc => '(100 ' + (pc < 0 ? '− ' + Math.abs(pc) : '+ ' + pc) + ') / 100 = ' + rd(100 + pc) + ' / 100 = ' + mult(pc);
/* a number answer, rounded to d decimals, tolerance half a unit; typed working is checked by value */
const nr = (html, exact, d, hint, steps, extra) => nu(html, rd(exact, d), hint, steps, Object.assign({ tol: .51 * Math.pow(10, -d) }, extra || {}));
const tbl = (h1, h2, xs, ys) => '<table class="tbl"><tr><th>' + h1 + '</th>' + xs.map(x => '<td>' + x + '</td>').join('') + '</tr><tr><th>' + h2 + '</th>' + ys.map(y => '<td>' + y + '</td>').join('') + '</tr></table>';
const svgWrap = (h, px) => '<div style="max-width:' + (px || 320) + 'px">' + h + '</div>';
/* plot of y = f(t) for 0 <= t <= tmax, with axis ticks and marked points */
function plot(f, tmax, ymax, ystep, pts) {
  const W = 320, H = 240, L = 40, B = 28, T = 10, sx = t => L + (W - L - 10) * t / tmax, sy = y => H - B - (H - B - T) * y / ymax; let s = '';
  for (let y = 0; y <= ymax + 1e-9; y += ystep) s += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + sy(y) + '" y2="' + sy(y) + '" stroke="#dde3ea"/><text x="' + (L - 5) + '" y="' + (sy(y) + 4) + '" font-size="11" text-anchor="end" fill="#555">' + rd(y) + '</text>';
  for (let t = 0; t <= tmax; t++) s += '<line x1="' + sx(t) + '" x2="' + sx(t) + '" y1="' + T + '" y2="' + sy(0) + '" stroke="#dde3ea"/><text x="' + sx(t) + '" y="' + (H - B + 15) + '" font-size="11" text-anchor="middle" fill="#555">' + t + '</text>';
  s += '<line x1="' + L + '" x2="' + (W - 10) + '" y1="' + sy(0) + '" y2="' + sy(0) + '" stroke="#333"/><line x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + sy(0) + '" stroke="#333"/>';
  let d = ''; for (let t = 0; t <= tmax + 1e-9; t += tmax / 120) { const y = f(t); if (y > ymax * 1.05) break; d += (d ? 'L' : 'M') + rd(sx(t), 1) + ',' + rd(sy(y), 1); }
  s += '<path d="' + d + '" fill="none" stroke="#d1471f" stroke-width="2.5"/>' + (pts || []).map(q => '<circle cx="' + sx(q[0]) + '" cy="' + sy(q[1]) + '" r="4.5" fill="#1b5fa8"/>').join('');
  s += '<text x="' + (W - 12) + '" y="' + (sy(0) - 5) + '" font-size="12" text-anchor="end" font-style="italic">t</text><text x="' + (L + 6) + '" y="' + (T + 10) + '" font-size="12" font-style="italic">N</text>';
  return svgWrap('<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="background:#fff">' + s + '</svg>', 340);
}
function curves(fs, xmax, ymax, colors, labels) {
  const segs = [], st = xmax / 80; fs.forEach((f, k) => { let prev = null; for (let x = 0; x <= xmax + 1e-9; x += st) { const y = f(x); if (prev && y <= ymax && prev[1] <= ymax) segs.push({ a: prev, b: [x, y], color: colors[k] }); prev = [x, y]; } });
  const g = NX.gridSVG({ xmin: 0, xmax, ymin: 0, ymax, u: Math.min(22, 300 / xmax), segs, cells: false });
  return svgWrap(g, 320) + (labels ? p(labels.map((t, k) => '<span style="color:' + colors[k] + '"><b>' + t + '</b></span>').join(' &nbsp; ')) : '');
}

/* ======================= 7.1 Percentages and multipliers ======================= */
G['7.1'] = [
  function multiplier(l) {
    const up = Math.random() < .5, pc = l === 0 ? pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]) : pick([2, 3.5, 4, 6, 8, 12, 18, 21, 33, 58, 0.5, 0.2, 120, 150]), v = up ? pc : -pc;
    if (!up && pc >= 100) return G['7.1'][0](l);
    return nu(p('What is the multiplier for ' + (up ? 'an increase' : 'a decrease') + ' of ' + pc + '%?'), mult(v), 'multiplier = (100 ± percentage) / 100.', 'multiplier = ' + multTxt(v), { noStep: true });
  },
  function newAmount(l) {
    const up = Math.random() < .5, pc = pick([5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 11, 18]), v = up ? pc : -pc, a = l === 0 ? pick([40, 50, 80, 120, 200, 250, 400]) : ri(20, 900);
    return nr(p('A price of €' + a + ' ' + (up ? 'goes up' : 'goes down') + ' by ' + pc + '%. What is the new price (in €)? Round to 2 decimals if needed.'), a * mult(v), 2, 'Multiply by the multiplier ' + mult(v) + '.', p('multiplier = ' + multTxt(v)) + p(a + ' · ' + mult(v) + ap(a * mult(v), 2)), { needStep: true });
  },
  function original(l) {
    const up = Math.random() < .4, pc = pick([10, 15, 20, 25, 30, 40, 45, 21]), v = up ? pc : -pc, orig = ri(4, 60) * 5, now = rd(orig * mult(v), 2);
    return nr(p('After ' + (up ? 'an increase' : 'a discount') + ' of ' + pc + '% a jacket costs €' + now.toFixed(2) + '. What was the price before (in €)?'), orig, 2, 'new = old · multiplier, so old = new : multiplier.', p('multiplier = ' + multTxt(v)) + p(now.toFixed(2) + ' : ' + mult(v) + ' = ' + orig), { needStep: true });
  },
  function percentChange(l) {
    let a, b; do { a = ri(4, 80) * 5; b = a + ri(-15, 20) * 5; } while (b <= 0 || b === a);
    const pc = (b - a) / a * 100;
    return nr(p('A quantity changes from ' + a + ' to ' + b + '. What is the percentage change? <small>(Give a decrease as a negative number. Round to 1 decimal.)</small>'), pc, 1, 'multiplier = new / old. Then multiplier · 100% − 100%.', p('multiplier = ' + b + ' / ' + a + ap(b / a, 4)) + p(rd(b / a, 4) + ' · 100% − 100%' + ap(pc, 1) + '%'), { needStep: true });
  },
  function repeated(l) {
    const p1 = pick([10, 20, 30, 40, 15, 25]) * (Math.random() < .5 ? -1 : 1), p2 = pick([10, 20, 5, 8, 50, 15]) * (Math.random() < .6 ? 1 : -1), m = mult(p1) * mult(p2), pc = rd(m * 100 - 100, 2);
    return nr(p('A price first ' + (p1 > 0 ? 'goes up' : 'goes down') + ' by ' + Math.abs(p1) + '% and then ' + (p2 > 0 ? 'goes up' : 'goes down') + ' by ' + Math.abs(p2) + '%. What is the total percentage change? <small>(A decrease is negative.)</small>'), pc, 2, 'Multiply the two multipliers. You cannot just add the percentages.', p(mult(p1) + ' · ' + mult(p2) + ' = ' + rd(m, 4)) + p(rd(m, 4) + ' · 100% − 100% = ' + neg(pc) + '%'), { needStep: true });
  }
];
XG['7.1'] = [
  function vatBack(l) {
    const vat = pick([20, 21, 9]), ex = ri(20, 400), inc = rd(ex * (1 + vat / 100), 2);
    return nr(p('A drill costs €' + inc.toFixed(2) + ' including ' + vat + '% VAT. What is the price without VAT (in €)?'), ex, 2, 'Including VAT = without VAT · ' + mult(vat) + '.', inc.toFixed(2) + ' : ' + mult(vat) + ' = ' + ex, { needStep: true });
  },
  function savings(l) {
    const r = pick([0.5, 1, 1.5, 2, 2.5, 3]), A = pick([1000, 2500, 5000, 8000]), n = ri(2, 10), v = A * Math.pow(mult(r), n);
    return nr(p('You put €' + sp(A) + ' in a savings account with ' + r + '% interest per year. How much is in the account after ' + n + ' years (in €)?'), v, 2, 'Each year you multiply by ' + mult(r) + '. For ' + n + ' years: · ' + pw(mult(r), n) + '.', sp(A) + ' · ' + pw(mult(r), n) + ' ≈ ' + rd(v, 2), { needStep: true });
  }
];

/* ======================= 7.2 Exponential growth ======================= */
G['7.2'] = [
  function linOrExp(l) {
    const kind = pick(['lin', 'exp', 'exp', 'none']), b = ri(2, 9) * 10;
    let ys; if (kind === 'lin') { const d = ri(-6, 12) || 5; ys = [0, 1, 2, 3, 4].map(t => b + d * t); }
    else if (kind === 'exp') { const g = pick([2, 3, 0.5, 1.5]); ys = [0, 1, 2, 3, 4].map(t => rd(b * Math.pow(g, t), 2)); }
    else ys = [b, b + 5, b + 12, b + 15, b + 25];
    const right = kind === 'lin' ? 'linear' : kind === 'exp' ? 'exponential' : 'neither';
    const steps = kind === 'lin' ? 'You add the same number each time (' + neg(ys[1] - ys[0]) + '): linear.' : kind === 'exp' ? 'You multiply by the same number each time (' + rd(ys[1] / ys[0], 4) + '): exponential.' : 'The differences (' + ys.slice(1).map((y, i) => y - ys[i]).join(', ') + ') and the quotients are not constant: neither.';
    return ch(p('Is the growth in this table linear, exponential or neither?') + tbl(X('t'), X('N'), [0, 1, 2, 3, 4], ys.map(sp)), right, ['linear', 'exponential', 'neither'].filter(o => o !== right), 'Linear: you add the same number. Exponential: you multiply by the same number.', steps);
  },
  function growthFactor(l) {
    const g = pick([1.2, 1.5, 0.8, 0.9, 1.1, 0.75, 2, 1.25]), b = pick([100, 200, 400, 640, 1000, 250]), ys = [0, 1, 2, 3].map(t => rd(b * Math.pow(g, t), 2));
    return nu(p('This table shows exponential growth. What is the growth factor?') + tbl(X('t'), X('N'), [0, 1, 2, 3], ys.map(sp)), g, 'Divide a value by the value before it.', ys[1] + ' / ' + ys[0] + ' = ' + g + ' (and ' + ys[2] + ' / ' + ys[1] + ' = ' + g + ')', { noStep: true });
  },
  function completeTable(l) {
    const g = pick([1.2, 1.5, 0.8, 0.9, 1.1, 0.6, 2, 3]), b = pick([50, 100, 200, 400, 800, 1000]), k = ri(3, 5), v = b * Math.pow(g, k);
    return nr(p('A quantity grows exponentially with growth factor ' + g + ' per hour. At ' + X('t') + ' = 0 it is ' + b + '. Calculate the quantity at ' + X('t') + ' = ' + k + '. Round to 1 decimal.'), v, 1, 'Multiply ' + k + ' times by ' + g + ': ' + b + ' · ' + pw(g, k) + '.', b + ' · ' + pw(g, k) + ap(v, 1), { needStep: true });
  },
  function percentToFactor(l) {
    const up = Math.random() < .5, pc = pick([2, 3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 0.5]), v = up ? pc : -pc;
    return nu(p('A quantity ' + (up ? 'increases' : 'decreases') + ' by ' + pc + '% per year. What is the growth factor per year?'), mult(v), 'growth factor = (100 ± percentage) / 100.', 'g = ' + multTxt(v), { noStep: true });
  },
  function checkQuotients(l) {
    const g = pick([1.15, 0.97, 1.08, 0.85]), b = ri(200, 600), exp = Math.random() < .5, ys = [0, 1, 2, 3].map(t => Math.round(b * Math.pow(g, t) * (exp ? 1 : 1 + (t === 3 ? .08 : t === 2 ? -.04 : 0))));
    const qs = ys.slice(1).map((y, i) => rd(y / ys[i], 3)), ok = Math.max(...qs) - Math.min(...qs) < .006;
    return ch(p('Is the growth approximately exponential? Calculate the quotients of successive values.') + tbl('year', 'number', [2021, 2022, 2023, 2024], ys), ok ? 'yes, the quotients are about equal' : 'no, the quotients differ too much', [ok ? 'no, the quotients differ too much' : 'yes, the quotients are about equal'], 'Divide each value by the value before it.', 'Quotients: ' + qs.join(', ') + '. ' + (ok ? 'These are about the same: approximately exponential with g ≈ ' + rd(qs[0], 2) + '.' : 'These differ too much: not exponential.'));
  }
];
XG['7.2'] = [
  function backInTime(l) {
    const g = pick([0.85, 0.9, 1.2, 1.25]), now = pick([255, 300, 480, 600]), k = ri(1, 2), v = now / Math.pow(g, k);
    return nr(p('A number of subscribers changes exponentially with growth factor ' + g + ' per 5 years. In 2015 there were ' + now + ' (× 100) subscribers. How many (× 100) were there ' + 5 * k + ' years earlier? Round to whole numbers.'), v, 0, 'Back in time: divide by the growth factor.', now + ' : ' + (k === 1 ? g : pw(g, k)) + ' ≈ ' + rd(v, 0), { needStep: true });
  },
  function videoViews(l) {
    const g = pick([1.5, 1.8, 2, 2.5]), v0 = pick([500, 1000, 2000]), d = ri(3, 5), ys = Array.from({ length: d }, (_, i) => v0 * Math.pow(g, i)), tot = ys.reduce((a, b) => a + b, 0);
    return nr(p('A video is watched ' + v0 + ' times on day 1. Every next day it is watched ' + g + ' times as often as the day before. How many views are there in total after ' + d + ' days? Round to whole numbers.'), tot, 0, 'Calculate each day and add.', ys.map((y, i) => 'day ' + (i + 1) + ': ' + sp(rd(y, 1))).join(', ') + '<br>total = ' + ys.map(y => sp(rd(y, 1))).join(' + ') + ' ≈ ' + sp(rd(tot, 0)), { needStep: true });
  }
];

/* ======================= 7.3 Exponential formulas ======================= */
G['7.3'] = [
  function readFormula(l) {
    const b = pick([15, 138, 500, 2000, 0.15, 1]), g = pick([0.78, 1.03, 1.158, 0.125, 3, 1.5]);
    return { type: 'multi', fields: ['b =', 'g ='], ans: [b, g], html: p('The formula ' + X('N') + ' = ' + b + ' · ' + pw(g, X('t')) + ' has the form ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + '. Give the initial value ' + X('b') + ' and the growth factor ' + X('g') + '.'), hint: X('b') + ' is the value at ' + X('t') + ' = 0, ' + X('g') + ' is the number with the exponent.', steps: X('b') + ' = ' + b + ' and ' + X('g') + ' = ' + g + '. ' + (g > 1 ? 'g > 1: growth.' : 'g < 1: decay.'), noStep: true, ansText: X('b') + ' = ' + b + ', ' + X('g') + ' = ' + g };
  },
  function makeFormula(l) {
    const up = Math.random() < .5, pc = pick([2, 4, 5, 6.5, 8, 10, 15, 20, 25]), v = up ? pc : -pc, b = pick([150, 500, 1200, 2450, 25, 80]), t = ri(3, 15), N = b * Math.pow(mult(v), t);
    return nr(p('A population is ' + b + ' at ' + X('t') + ' = 0 and ' + (up ? 'grows' : 'decreases') + ' by ' + pc + '% per year. Make the formula ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + ' and calculate ' + X('N') + ' for ' + X('t') + ' = ' + t + '. Round to whole numbers.'), N, 0, X('b') + ' = ' + b + ' and ' + X('g') + ' = (100 ' + (up ? '+' : '−') + ' ' + pc + ') / 100.', p(X('g') + ' = ' + multTxt(v)) + p(X('N') + ' = ' + b + ' · ' + pw(mult(v), X('t'))) + p(X('N') + ' = ' + b + ' · ' + pw(mult(v), t) + ' ≈ ' + sp(rd(N, 0))), { needStep: true });
  },
  function factorToPercent(l) {
    const g = pick([1.065, 1.2, 0.85, 0.97, 1.004, 0.6, 2.5, 1.35]), pc = rd(g * 100 - 100, 2);
    return nu(p('The formula is ' + X('N') + ' = 300 · ' + pw(g, X('t')) + ' with ' + X('t') + ' in years. By what percentage does ' + X('N') + ' change per year? <small>(A decrease is negative.)</small>'), pc, 'percentage = g · 100% − 100%.', g + ' · 100% − 100% = ' + neg(pc) + '%', { noStep: true, ansText: neg(pc) + '%' });
  },
  function biggerUnit(l) {
    const g = pick([1.1, 1.05, 0.98, 1.02, 0.9, 1.12]), k = pick([2, 4, 7, 10, 12, 24]), unit = { 2: ['day', '2 days'], 4: ['quarter', 'year'], 7: ['day', 'week'], 10: ['year', 'decade'], 12: ['month', 'year'], 24: ['hour', 'day'] }[k], G_ = Math.pow(g, k);
    return nr(p('The growth factor per ' + unit[0] + ' is ' + g + '. Calculate the growth factor per ' + unit[1] + '. Round to 3 decimals.'), G_, 3, 'One ' + unit[1] + ' is ' + k + ' times one ' + unit[0] + ': multiply ' + k + ' times.', pw(g, k) + ap(G_, 3), { needStep: true });
  },
  function smallerUnit(l) {
    const g = pick([1.5, 2, 0.5, 0.8, 1.3, 3]), k = pick([2, 4, 7, 12, 10, 24]), unit = { 2: ['2 years', 'year'], 4: ['year', 'quarter'], 7: ['week', 'day'], 10: ['decade', 'year'], 12: ['year', 'month'], 24: ['day', 'hour'] }[k], G_ = Math.pow(g, 1 / k);
    return nr(p('The growth factor per ' + unit[0] + ' is ' + g + '. Calculate the growth factor per ' + unit[1] + '. Round to 3 decimals.'), G_, 3, 'One ' + unit[0] + ' is ' + k + ' ' + unit[1] + 's: take the ' + k + 'th root, or ' + pw(g, '1/' + k) + '.', pw(g, '1/' + k) + ap(G_, 3), { needStep: true });
  }
];
XG['7.3'] = [
  function halfLife(l) {
    const T = pick([5, 8, 10, 24000, 12]), unit = T > 100 ? 'years' : pick(['hours', 'days', 'years']), g = Math.pow(0.5, 1 / T);
    return nr(p('A substance halves every ' + sp(T) + ' ' + unit + '. Calculate the growth factor per ' + unit.slice(0, -1) + '. Round to 4 decimals.'), g, 4, 'Halving means g = 0.5 per ' + sp(T) + ' ' + unit + '.', pw('0.5', '1/' + sp(T)) + ap(g, 4), { needStep: true });
  },
  function deerYears(l) {
    const b = pick([2450, 1800, 3000]), g = pick([1.061, 1.08, 1.05]), target = pick([4000, 5000, 6000]); let t = 0; while (b * Math.pow(g, t) <= target) t++;
    return nu(p('A herd of deer grows by the formula ' + X('N') + ' = ' + b + ' · ' + pw(g, X('t')) + ', with ' + X('t') + ' in years. After how many whole years is the herd larger than ' + target + ' for the first time?'), t, 'Try values of ' + X('t') + ' with your calculator.', p(X('t') + ' = ' + (t - 1) + ': ' + b + ' · ' + pw(g, t - 1) + ' ≈ ' + rd(b * Math.pow(g, t - 1), 0) + ' (not yet)') + p(X('t') + ' = ' + t + ': ' + b + ' · ' + pw(g, t) + ' ≈ ' + rd(b * Math.pow(g, t), 0) + ' (larger than ' + target + ')') + p('So after ' + t + ' years.'), { noStep: true });
  }
];

/* ======================= 7.4 Exponential graphs ======================= */
G['7.4'] = [
  function growthOrDecay(l) {
    const g = pick([1.5, 0.75, 1.03, 0.2, 2, 0.98, 1.6, 0.4]), b = ri(2, 200), right = g > 1 ? 'a growth curve (rising)' : 'a decay curve (falling)';
    return ch(p('What does the graph of ' + X('N') + ' = ' + b + ' · ' + pw(g, X('t')) + ' look like?'), right, [g > 1 ? 'a decay curve (falling)' : 'a growth curve (rising)', 'a straight line'], 'Look at the growth factor: bigger or smaller than 1?', X('g') + ' = ' + g + (g > 1 ? ' > 1: the graph rises. It is ' : ' < 1: the graph falls. It is ') + right + '.');
  },
  function startValue(l) {
    const b = pick([4, 8, 15, 25, 150, 0.5]), g = pick([1.5, 0.75, 2, 0.6, 1.2]), t = ri(0, 1) ? 0 : 0;
    return nu(p('Where does the graph of ' + X('N') + ' = ' + b + ' · ' + pw(g, X('t')) + ' intersect the vertical axis? Give ' + X('N') + '.'), b, 'At the vertical axis ' + X('t') + ' = 0, and ' + pw(X('g'), 0) + ' = 1.', X('N') + ' = ' + b + ' · ' + pw(g, 0) + ' = ' + b + ' · 1 = ' + b, { noStep: true });
  },
  function readGraph(l) {
    const b = pick([2, 4, 5, 8, 10]), g = pick([2, 1.5, 0.5, 3]), f = t => b * Math.pow(g, t), top = Math.max(b, f(2)), ystep = top <= 6 ? 0.5 : top <= 12 ? 1 : top <= 24 ? 2 : top <= 60 ? 5 : 10, ymax = Math.ceil(top * 1.15 / ystep) * ystep;
    if (!Number.isInteger(f(1) * 2) || !Number.isInteger(f(2) * 2) || ymax / ystep > 16) return G['7.4'][2](l);
    return { type: 'multi', fields: ['b =', 'g ='], ans: [b, g], html: p('The graph shows an exponential relationship ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + '. The marked points are on the graph at ' + X('t') + ' = 0, 1 and 2. Give ' + X('b') + ' and ' + X('g') + '.') + plot(f, 5, ymax, ystep, [[0, b], [1, f(1)], [2, f(2)]]), hint: X('b') + ' is the value at ' + X('t') + ' = 0. ' + X('g') + ' = value at ' + X('t') + ' = 1 divided by value at ' + X('t') + ' = 0.', steps: p('At ' + X('t') + ' = 0: ' + X('N') + ' = ' + b + ', so ' + X('b') + ' = ' + b + '.') + p('At ' + X('t') + ' = 1: ' + X('N') + ' = ' + f(1) + ', so ' + X('g') + ' = ' + f(1) + ' / ' + b + ' = ' + g + '.'), noStep: true, ansText: X('b') + ' = ' + b + ', ' + X('g') + ' = ' + g };
  },
  function whichGraph(l) {
    const g1 = pick([1.5, 2]), g2 = pick([1.2, 1.3]), b1 = pick([2, 3]), b2 = b1 + pick([2, 4]), colors = ['#1b5fa8', '#d1471f'];
    const ask = pick(['start', 'factor']), right = ask === 'start' ? 'II' : 'I';
    return ch(p('Formula I: ' + X('N') + ' = ' + b1 + ' · ' + pw(g1, X('t')) + ' &nbsp; Formula II: ' + X('N') + ' = ' + b2 + ' · ' + pw(g2, X('t')) + '. Which formula has the ' + (ask === 'start' ? 'larger initial value' : 'larger growth factor') + '?'), right, [right === 'I' ? 'II' : 'I', 'they are equal'], ask === 'start' ? 'The initial value is ' + X('b') + '.' : 'The growth factor is ' + X('g') + '.', ask === 'start' ? b2 + ' > ' + b1 + ': formula II.' : g1 + ' > ' + g2 + ': formula I. In the long run graph I will be higher.');
  },
  function tableFromFormula(l) {
    const b = pick([150, 200, 1000, 64]), g = pick([1.5, 0.75, 0.5, 1.2]), t = ri(2, 5), v = b * Math.pow(g, t);
    return nr(p('Complete the table for ' + X('N') + ' = ' + b + ' · ' + pw(g, X('t')) + '. Round to 1 decimal.') + tbl(X('t'), X('N'), [0, 1, t], [b, rd(b * g, 1), '?']), v, 1, 'Substitute ' + X('t') + ' = ' + t + '.', b + ' · ' + pw(g, t) + ap(v, 1), { needStep: true });
  }
];
XG['7.4'] = [
  function coffeeDissolve(l) {
    const m = pick([8, 10, 12]), g = pick([0.75, 0.6, 0.8]), t = ri(3, 8), left = m * Math.pow(g, t);
    return nr(p('A spoon of ' + m + ' g instant coffee dissolves in water. Every second the amount that is not yet dissolved is multiplied by ' + g + '. How many grams have dissolved after ' + t + ' seconds? Round to 1 decimal.'), m - left, 1, 'First calculate what is NOT dissolved yet.', p('not dissolved: ' + m + ' · ' + pw(g, t) + ' ≈ ' + rd(left, 3) + ' g') + p('dissolved: ' + m + ' − ' + rd(left, 3) + ' ≈ ' + rd(m - left, 1) + ' g'), { needStep: true });
  }
];

/* ======================= 7.5 Exponential equations ======================= */
G['7.5'] = [
  function exactPower(l) {
    const g = pick([2, 3, 4, 5, 10]), x = ri(1, g === 2 ? 9 : g === 10 ? 6 : 5), r = Math.pow(g, x);
    return nu(p('Solve: ' + pw(g, X()) + ' = ' + sp(r)), x, 'Which power of ' + g + ' gives ' + sp(r) + '?', pw(g, x) + ' = ' + sp(r) + ', so ' + X() + ' = ' + x + '.', { noStep: true });
  },
  function withFactor(l) {
    const a = pick([2, 3, 4, 5, 10]), g = pick([2, 3, 5]), x = ri(1, g === 2 ? 6 : 4), r = a * Math.pow(g, x);
    return nu(p('Solve: ' + a + ' · ' + pw(g, X()) + ' = ' + sp(r)), x, 'Divide by ' + a + ' first.', p(pw(g, X()) + ' = ' + sp(r) + ' : ' + a + ' = ' + sp(Math.pow(g, x))) + p(X() + ' = ' + x), { noStep: true });
  },
  function trialRound(l) {
    let g, target, x; do { g = pick([1.2, 1.5, 1.1, 1.3, 0.9, 0.8, 0.7]); target = g > 1 ? pick([5, 10, 15, 20, 38, 50]) : pick([0.5, 0.25, 0.1, 0.05]); x = Math.log(target) / Math.log(g); } while (x > 25 || Math.abs(x - Math.round(x)) > .45); const xr = Math.round(x), lo = Math.floor(x), hi = lo + 1;
    return nu(p('Solve ' + pw(g, X()) + ' = ' + target + ' by trying values. Round ' + X() + ' to a whole number.'), xr, 'Try whole numbers for ' + X() + ' until you pass ' + target + '. Which one is closest?', p(pw(g, lo) + ' ≈ ' + rd(Math.pow(g, lo), 3) + ' and ' + pw(g, hi) + ' ≈ ' + rd(Math.pow(g, hi), 3)) + p('More precisely ' + X() + ' ≈ ' + rd(x, 2) + ', so rounded ' + X() + ' ≈ ' + xr + '.'), { noStep: true });
  },
  function doublingTime(l) {
    const g = pick([1.3, 1.2, 1.1, 1.5, 1.08]), t = Math.log(2) / Math.log(g), d = 1;
    return nr(p('A quantity grows by ' + X('N') + ' = 25 · ' + pw(g, X('t')) + ' (' + X('t') + ' in years). After how many years has the quantity doubled? Round to 1 decimal.'), t, 1, 'Doubled means ' + X('N') + ' = 50, so ' + pw(g, X('t')) + ' = 2. Try values with your calculator (or use the table).', p('25 · ' + pw(g, X('t')) + ' = 50 gives ' + pw(g, X('t')) + ' = 2') + p(pw(g, rd(t, 1)) + ' ≈ ' + rd(Math.pow(g, rd(t, 1)), 3) + ', so ' + X('t') + ' ≈ ' + rd(t, 1) + ' years'), { noStep: true, tol: .06 });
  },
  function whenBelow(l) {
    const b = pick([180, 100, 500]), g = pick([0.9, 0.85, 0.8, 0.95]), half = b / 2; let t = 0; while (b * Math.pow(g, t) >= half) t++;
    return nu(p('A barrel with ' + b + ' L leaks: ' + X('W') + ' = ' + b + ' · ' + pw(g, X('t')) + ' (' + X('t') + ' in hours). After how many whole hours is less than half of the water left for the first time?'), t, 'Half is ' + half + ' L. Try whole values of ' + X('t') + '.', p(X('t') + ' = ' + (t - 1) + ': ' + rd(b * Math.pow(g, t - 1), 1) + ' L') + p(X('t') + ' = ' + t + ': ' + rd(b * Math.pow(g, t), 1) + ' L &lt; ' + half) + p('After ' + t + ' hours.'), { noStep: true });
  }
];
XG['7.5'] = [
  function savingsGoal(l) {
    const A = pick([5000, 2000, 1000]), r = pick([1, 2, 3, 4]), goal = A * pick([1.2, 1.5]); let t = 0; while (A * Math.pow(mult(r), t) < goal) t++;
    return nu(p('You save €' + sp(A) + ' at ' + r + '% interest per year. After how many whole years do you have at least €' + sp(goal) + ' for the first time?'), t, 'B = ' + A + ' · ' + pw(mult(r), X('t')) + '. Try values.', p(X('t') + ' = ' + (t - 1) + ': €' + sp(rd(A * Math.pow(mult(r), t - 1), 2))) + p(X('t') + ' = ' + t + ': €' + sp(rd(A * Math.pow(mult(r), t), 2))) + p('After ' + t + ' years.'), { noStep: true });
  }
];

const SECTIONS = [
  { id: '7.1', title: '7.1 Percentages and multipliers', sub: 'Multipliers, percentage change, repeated change' },
  { id: '7.2', title: '7.2 Exponential growth', sub: 'Growth factor, tables, linear or exponential' },
  { id: '7.3', title: '7.3 Exponential formulas', sub: 'N = b · g^t, other time units' },
  { id: '7.4', title: '7.4 Exponential graphs', sub: 'Growth and decay curves' },
  { id: '7.5', title: '7.5 Exponential equations', sub: 'Exact, by trying, doubling time' }
];
const GOALS = [
  ['7.1', 'I can calculate with percentages and multipliers', ['multiplier', 'newAmount', 'original', 'percentChange', 'repeated'], 'multiplier = (100 ± percentage) / 100'],
  ['7.2', 'I can recognise exponential growth and find the growth factor', ['linOrExp', 'growthFactor', 'completeTable', 'percentToFactor', 'checkQuotients'], 'Exponential: multiply by the same number each step.'],
  ['7.3', 'I can make and use exponential formulas', ['readFormula', 'makeFormula', 'factorToPercent', 'biggerUnit', 'smallerUnit'], 'N = b · g^t'],
  ['7.4', 'I can read and compare exponential graphs', ['growthOrDecay', 'startValue', 'readGraph', 'whichGraph', 'tableFromFormula'], 'g > 1: growth, 0 < g < 1: decay.'],
  ['7.5', 'I can solve exponential equations', ['exactPower', 'withFactor', 'trialRound', 'doublingTime', 'whenBelow'], 'Divide first, then find the exponent.']
];
return { key: 'nx-3ht-ch7-v1', SECTIONS, LESSONS: [], G, XG, defaultMode: 'para', GOALS };
