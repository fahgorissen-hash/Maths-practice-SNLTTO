const { ri, pick, shuffle, nz } = NX;
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
    if (l >= 2) {   // spicy: two changes after each other
      const dc = pick([10, 15, 20, 25, 30]), m2 = rd(mult(-dc) * 1.21, 4), n2 = rd(orig * m2, 2);
      return nr(p('A shop first gives ' + dc + '% discount on a jacket. Then 21% VAT is added. Now the jacket costs €' + n2.toFixed(2) + '. What was the price before the discount and the VAT (in €)?'), orig, 2, 'Multiply the two multipliers. Then old = new : total multiplier.', p('total multiplier = ' + mult(-dc) + ' · 1.21 = ' + m2) + p(n2.toFixed(2) + ' : ' + m2 + ' = ' + orig), { needStep: true });
    }
    return nr(p('After ' + (up ? 'an increase' : 'a discount') + ' of ' + pc + '% a jacket costs €' + now.toFixed(2) + '. What was the price before (in €)?'), orig, 2, 'new = old · multiplier, so old = new : multiplier.', p('multiplier = ' + multTxt(v)) + p(now.toFixed(2) + ' : ' + mult(v) + ' = ' + orig), { needStep: true });
  },
  function percentChange(l) {
    let a, b; do { a = ri(4, 80) * 5; b = a + ri(-15, 20) * 5; } while (b <= 0 || b === a);
    const pc = (b - a) / a * 100;
    if (l >= 2) {   // spicy: back to the old value: the percentage is not the same
      const hi = Math.max(a, b), lo = Math.min(a, b), back = (hi - lo) / lo * 100;
      return nr(p('A price goes down from €' + hi + ' to €' + lo + '. By what percentage must the new price go up to be €' + hi + ' again? <small>(Round to 1 decimal.)</small>'), back, 1, 'Now the old value is ' + lo + '. multiplier = ' + hi + ' / ' + lo + '.', p('multiplier = ' + hi + ' / ' + lo + ap(hi / lo, 4)) + p(rd(hi / lo, 4) + ' · 100% − 100%' + ap(back, 1) + '%'), { needStep: true });
    }
    return nr(p('A quantity changes from ' + a + ' to ' + b + '. What is the percentage change? <small>(Give a decrease as a negative number. Round to 1 decimal.)</small>'), pc, 1, 'multiplier = new / old. Then multiplier · 100% − 100%.', p('multiplier = ' + b + ' / ' + a + ap(b / a, 4)) + p(rd(b / a, 4) + ' · 100% − 100%' + ap(pc, 1) + '%'), { needStep: true });
  },
  function repeated(l) {
    if (l >= 2) {   // spicy: the same change several years in a row
      const q = pick([3, 4, 5, 6, 8, -5, -8, -12]), n = ri(3, 8), M2 = Math.pow(mult(q), n), pc2 = rd(M2 * 100 - 100, 1);
      return nr(p('A price ' + (q > 0 ? 'goes up' : 'goes down') + ' by ' + Math.abs(q) + '% every year, for ' + n + ' years. What is the total percentage change? <small>(A decrease is negative. Round to 1 decimal.)</small>'), M2 * 100 - 100, 1, 'Multiply by the multiplier ' + n + ' times: use a power.', p(pw(mult(q), n) + ap(M2, 4)) + p(rd(M2, 4) + ' · 100% − 100%' + ap(M2 * 100 - 100, 1) + '%'), { needStep: true });
    }
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
    if (l >= 2) { const ts = [0, 2, 4, 6], y2 = ts.map(t => rd(b * Math.pow(g, t), 2));   // spicy: steps of 2 in the table
      return nu(p('This table shows exponential growth. What is the growth factor per unit of ' + X('t') + '? <small>(Look carefully at the values of ' + X('t') + '.)</small>') + tbl(X('t'), X('N'), ts, y2.map(sp)), g, 'Two steps of ' + X('t') + ' give the quotient of two neighbouring values. One step: take the square root.', y2[1] + ' / ' + y2[0] + ' = ' + rd(g * g, 4) + ' per 2 units, so per unit: √' + rd(g * g, 4) + ' = ' + g, { noStep: true }); }
    return nu(p('This table shows exponential growth. What is the growth factor?') + tbl(X('t'), X('N'), [0, 1, 2, 3], ys.map(sp)), g, 'Divide a value by the value before it.', ys[1] + ' / ' + ys[0] + ' = ' + g + ' (and ' + ys[2] + ' / ' + ys[1] + ' = ' + g + ')', { noStep: true });
  },
  function completeTable(l) {
    const g = pick([1.2, 1.5, 0.8, 0.9, 1.1, 0.6, 2, 3]), b = pick([50, 100, 200, 400, 800, 1000]), k = ri(3, 5), v = b * Math.pow(g, k);
    if (l >= 2) { const mins = pick([30, 90, 150, 45, 135]), th = mins / 60, v2 = b * Math.pow(g, th);   // spicy: the time is in minutes, the growth factor per hour
      return nr(p('A quantity grows exponentially with growth factor ' + g + ' per hour. At ' + X('t') + ' = 0 it is ' + b + '. Calculate the quantity after <b>' + mins + ' minutes</b>. Round to 1 decimal.'), v2, 1, 'Write the time in hours first: ' + mins + ' minutes = ' + mins + '/60 hour.', p(mins + ' min = ' + th + ' hour') + p(b + ' · ' + pw(g, th) + ap(v2, 1)), { needStep: true }); }
    return nr(p('A quantity grows exponentially with growth factor ' + g + ' per hour. At ' + X('t') + ' = 0 it is ' + b + '. Calculate the quantity at ' + X('t') + ' = ' + k + '. Round to 1 decimal.'), v, 1, 'Multiply ' + k + ' times by ' + g + ': ' + b + ' · ' + pw(g, k) + '.', b + ' · ' + pw(g, k) + ap(v, 1), { needStep: true });
  },
  function percentToFactor(l) {
    const up = Math.random() < .5, pc = pick([2, 3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 0.5]), v = up ? pc : -pc;
    return nu(p('A quantity ' + (up ? 'increases' : 'decreases') + ' by ' + pc + '% per year. What is the growth factor per year?'), mult(v), 'growth factor = (100 ± percentage) / 100.', 'g = ' + multTxt(v), { noStep: true });
  },
  function checkQuotients(l) {
    const g = pick([1.15, 0.97, 1.08, 0.85]), b = l >= 2 ? ri(2000, 6000) : ri(200, 600), exp = Math.random() < .5, dv = l >= 2 ? [0, 0, -.015, .02] : [0, 0, -.04, .08], ys = [0, 1, 2, 3].map(t => Math.round(b * Math.pow(g, t) * (exp ? 1 : 1 + dv[t])));   // spicy: a smaller difference
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
    const b = pick([15, 138, 500, 2000, 0.15, 1]), g = pick([0.78, 1.03, 1.158, 0.125, 3, 1.5]), sw = l >= 2;   // spicy: the factors are written the other way round
    return { type: 'multi', fields: ['b =', 'g ='], ans: [b, g], html: p('The formula ' + X('N') + ' = ' + (sw ? pw(g, X('t')) + ' · ' + b : b + ' · ' + pw(g, X('t'))) + ' has the form ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + '. Give the initial value ' + X('b') + ' and the growth factor ' + X('g') + '.'), hint: X('b') + ' is the value at ' + X('t') + ' = 0, ' + X('g') + ' is the number with the exponent.', steps: X('b') + ' = ' + b + ' and ' + X('g') + ' = ' + g + '. ' + (g > 1 ? 'g > 1: growth.' : 'g < 1: decay.'), noStep: true, ansText: X('b') + ' = ' + b + ', ' + X('g') + ' = ' + g };
  },
  function makeFormula(l) {
    const up = Math.random() < .5, pc = pick([2, 4, 5, 6.5, 8, 10, 15, 20, 25]), v = up ? pc : -pc, b = pick([150, 500, 1200, 2450, 25, 80]), t = ri(3, 15), N = b * Math.pow(mult(v), t);
    if (l >= 2) { const y0 = ri(2012, 2020);   // spicy: years instead of t, choose t yourself
      return nr(p('In ' + y0 + ' a population is ' + b + '. It ' + (up ? 'grows' : 'decreases') + ' by ' + pc + '% per year. Make a formula ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + ' (choose what ' + X('t') + ' means) and calculate the population in ' + (y0 + t) + '. Round to whole numbers.'), N, 0, 'Let ' + X('t') + ' = 0 be the year ' + y0 + '. Then ' + (y0 + t) + ' is ' + X('t') + ' = ' + t + '.', p(X('t') + ' = years since ' + y0 + ', so ' + (y0 + t) + ' is ' + X('t') + ' = ' + t) + p(X('g') + ' = ' + multTxt(v)) + p(X('N') + ' = ' + b + ' · ' + pw(mult(v), t) + ' ≈ ' + sp(rd(N, 0))), { needStep: true }); }
    return nr(p('A population is ' + b + ' at ' + X('t') + ' = 0 and ' + (up ? 'grows' : 'decreases') + ' by ' + pc + '% per year. Make the formula ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + ' and calculate ' + X('N') + ' for ' + X('t') + ' = ' + t + '. Round to whole numbers.'), N, 0, X('b') + ' = ' + b + ' and ' + X('g') + ' = (100 ' + (up ? '+' : '−') + ' ' + pc + ') / 100.', p(X('g') + ' = ' + multTxt(v)) + p(X('N') + ' = ' + b + ' · ' + pw(mult(v), X('t'))) + p(X('N') + ' = ' + b + ' · ' + pw(mult(v), t) + ' ≈ ' + sp(rd(N, 0))), { needStep: true });
  },
  function factorToPercent(l) {
    const g = pick([1.065, 1.2, 0.85, 0.97, 1.004, 0.6, 2.5, 1.35]), pc = rd(g * 100 - 100, 2);
    if (l >= 2) { const gm = pick([1.02, 1.015, 0.98, 1.05, 0.99]), Y = Math.pow(gm, 12), py = Y * 100 - 100;   // spicy: per month in the formula, per year asked
      return nr(p('The formula is ' + X('N') + ' = 300 · ' + pw(gm, X('t')) + ' with ' + X('t') + ' in <b>months</b>. By what percentage does ' + X('N') + ' change per <b>year</b>? <small>(A decrease is negative. Round to 1 decimal.)</small>'), py, 1, 'First the growth factor per year: a year has 12 months.', p('per year: ' + pw(gm, 12) + ap(Y, 4)) + p(rd(Y, 4) + ' · 100% − 100%' + ap(py, 1) + '%'), { needStep: true, ansText: neg(rd(py, 1)) + '%' }); }
    return nu(p('The formula is ' + X('N') + ' = 300 · ' + pw(g, X('t')) + ' with ' + X('t') + ' in years. By what percentage does ' + X('N') + ' change per year? <small>(A decrease is negative.)</small>'), pc, 'percentage = g · 100% − 100%.', g + ' · 100% − 100% = ' + neg(pc) + '%', { noStep: true, ansText: neg(pc) + '%' });
  },
  function biggerUnit(l) {
    const g = pick([1.1, 1.05, 0.98, 1.02, 0.9, 1.12]), k = pick([2, 4, 7, 10, 12, 24]), unit = { 2: ['day', '2 days'], 4: ['quarter', 'year'], 7: ['day', 'week'], 10: ['year', 'decade'], 12: ['month', 'year'], 24: ['hour', 'day'] }[k], G_ = Math.pow(g, k);
    if (l >= 2) { const q = rd(g * 100 - 100), P = G_ * 100 - 100;   // spicy: percentages in and out
      return nr(p('A quantity ' + (q > 0 ? 'grows' : 'shrinks') + ' by ' + Math.abs(q) + '% per ' + unit[0] + '. By what percentage does it change per ' + unit[1] + '? <small>(A decrease is negative. Round to 1 decimal.)</small>'), P, 1, 'First the growth factor per ' + unit[0] + ', then multiply ' + k + ' times. Then back to a percentage.', p('g per ' + unit[0] + ' = ' + g) + p(pw(g, k) + ap(G_, 4)) + p(rd(G_, 4) + ' · 100% − 100%' + ap(P, 1) + '%'), { needStep: true }); }
    return nr(p('The growth factor per ' + unit[0] + ' is ' + g + '. Calculate the growth factor per ' + unit[1] + '. Round to 3 decimals.'), G_, 3, 'One ' + unit[1] + ' is ' + k + ' times one ' + unit[0] + ': multiply ' + k + ' times.', pw(g, k) + ap(G_, 3), { needStep: true });
  },
  function smallerUnit(l) {
    const g = pick([1.5, 2, 0.5, 0.8, 1.3, 3]), k = pick([2, 4, 7, 12, 10, 24]), unit = { 2: ['2 years', 'year'], 4: ['year', 'quarter'], 7: ['week', 'day'], 10: ['decade', 'year'], 12: ['year', 'month'], 24: ['day', 'hour'] }[k], G_ = Math.pow(g, 1 / k);
    if (l >= 2) { const q = rd(g * 100 - 100), P = G_ * 100 - 100;   // spicy: percentages in and out
      return nr(p('A quantity ' + (q > 0 ? 'grows' : 'shrinks') + ' by ' + Math.abs(q) + '% per ' + unit[0] + '. By what percentage does it change per ' + unit[1] + '? <small>(A decrease is negative. Round to 2 decimals.)</small>'), P, 2, 'First the growth factor per ' + unit[0] + ' (' + g + '). Then take the ' + k + 'th root. Then back to a percentage.', p(pw(g, '1/' + k) + ap(G_, 5)) + p(rd(G_, 5) + ' · 100% − 100%' + ap(P, 2) + '%'), { needStep: true }); }
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
    const two = l >= 2;   // spicy: only t = 0 and t = 2 are marked
    return { type: 'multi', fields: ['b =', 'g ='], ans: [b, g], html: p('The graph shows an exponential relationship ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + '. The marked points are on the graph at ' + X('t') + (two ? ' = 0 and 2' : ' = 0, 1 and 2') + '. Give ' + X('b') + ' and ' + X('g') + '.') + plot(f, 5, ymax, ystep, two ? [[0, b], [2, f(2)]] : [[0, b], [1, f(1)], [2, f(2)]]), hint: X('b') + ' is the value at ' + X('t') + ' = 0. ' + X('g') + ' = value at ' + X('t') + ' = 1 divided by value at ' + X('t') + ' = 0.', steps: p('At ' + X('t') + ' = 0: ' + X('N') + ' = ' + b + ', so ' + X('b') + ' = ' + b + '.') + p('At ' + X('t') + ' = 1: ' + X('N') + ' = ' + f(1) + ', so ' + X('g') + ' = ' + f(1) + ' / ' + b + ' = ' + g + '.'), noStep: true, ansText: X('b') + ' = ' + b + ', ' + X('g') + ' = ' + g };
  },
  function whichGraph(l) {
    const g1 = pick([1.5, 2]), g2 = pick([1.2, 1.3]), b1 = pick([2, 3]), b2 = b1 + pick([2, 4]), colors = ['#1b5fa8', '#d1471f'];
    const ask = pick(['start', 'factor']), right = ask === 'start' ? 'II' : 'I';
    return ch(p('Formula I: ' + X('N') + ' = ' + b1 + ' · ' + pw(g1, X('t')) + ' &nbsp; Formula II: ' + X('N') + ' = ' + b2 + ' · ' + pw(g2, X('t')) + '. Which formula has the ' + (ask === 'start' ? 'larger initial value' : 'larger growth factor') + '?'), right, [right === 'I' ? 'II' : 'I', 'they are equal'], ask === 'start' ? 'The initial value is ' + X('b') + '.' : 'The growth factor is ' + X('g') + '.', ask === 'start' ? b2 + ' > ' + b1 + ': formula II.' : g1 + ' > ' + g2 + ': formula I. In the long run graph I will be higher.');
  },
  function tableFromFormula(l) {
    const b = pick([150, 200, 1000, 64]), g = pick([1.5, 0.75, 0.5, 1.2]), t = ri(2, 5), v = b * Math.pow(g, t);
    if (l >= 2) { const n1 = b * g, n2 = b * g * g;   // spicy: the start value is missing, find g first
      return nr(p('The table belongs to ' + X('N') + ' = ' + X('b') + ' · ' + pw(X('g'), X('t')) + '. Calculate the missing number. Round to 1 decimal.') + tbl(X('t'), X('N'), [0, 1, 2], ['?', sp(rd(n1, 2)), sp(rd(n2, 2))]), b, 1, 'First find the growth factor ' + X('g') + ' from ' + X('t') + ' = 1 to ' + X('t') + ' = 2. Then go one step back.', p(X('g') + ' = ' + rd(n2, 2) + ' / ' + rd(n1, 2) + ' = ' + g) + p(X('N') + '(0) = ' + rd(n1, 2) + ' / ' + g + ap(b, 1)), { needStep: true }); }
    return nr(p('Complete the table for ' + X('N') + ' = ' + b + ' · ' + pw(g, X('t')) + '. Round to 1 decimal.') + tbl(X('t'), X('N'), [0, 1, t], [b, rd(b * g, 1), '?']), v, 1, 'Substitute ' + X('t') + ' = ' + t + '.', b + ' · ' + pw(g, t) + ap(v, 1), { needStep: true });
  }
];
XG['7.4'] = [
  function coffeeDissolve(l) {
    const m = pick([8, 10, 12]), g = pick([0.75, 0.6, 0.8]), t = ri(3, 8), left = m * Math.pow(g, t);
    return nr(p('A spoon of ' + m + ' g instant coffee dissolves in water. Every second the amount that is not yet dissolved is multiplied by ' + g + '. How many grams have dissolved after ' + t + ' seconds? Round to 1 decimal.'), m - left, 1, 'First calculate what is NOT dissolved yet.', p('not dissolved: ' + m + ' · ' + pw(g, t) + ' ≈ ' + rd(left, 3) + ' g') + p('dissolved: ' + m + ' − ' + rd(left, 3) + ' ≈ ' + rd(m - left, 1) + ' g'), { needStep: true });
  }
];
XG['7.4'].push(function townsMeet(l) {
  let A, B, ga, gb, t; do { A = ri(8, 15) * 1000; B = A + ri(3, 10) * 1000; ga = pick([2, 3, 4, 5]); gb = pick([-1, -2, -3, 1]); t = 0; while (A * Math.pow(mult(ga), t) <= B * Math.pow(mult(gb), t) && t < 60) t++; } while (t < 3 || t > 40 || ga <= gb);
  const fA = x => A * Math.pow(mult(ga), x), fB = x => B * Math.pow(mult(gb), x);
  return nu(p('Town A has ' + sp(A) + ' inhabitants and grows by ' + ga + '% per year. Town B has ' + sp(B) + ' inhabitants and ' + (gb < 0 ? 'shrinks by ' + -gb : 'grows by ' + gb) + '% per year. After how many whole years does town A have <b>more</b> inhabitants than town B for the first time?'), t, 'Write a formula for each town. Use a table (or the graphs) on your calculator and compare year by year.', p('A = ' + sp(A) + ' · ' + pw(mult(ga), X('t')) + ' and B = ' + sp(B) + ' · ' + pw(mult(gb), X('t'))) + p(X('t') + ' = ' + (t - 1) + ': A ≈ ' + sp(Math.round(fA(t - 1))) + ', B ≈ ' + sp(Math.round(fB(t - 1)))) + p(X('t') + ' = ' + t + ': A ≈ ' + sp(Math.round(fA(t))) + ', B ≈ ' + sp(Math.round(fB(t)))) + p('So after ' + t + ' years.'));
});

/* ======================= 7.5 Exponential equations ======================= */
G['7.5'] = [
  function exactPower(l) {
    const g = pick([2, 3, 4, 5, 10]), x = ri(1, g === 2 ? 9 : g === 10 ? 6 : 5), r = Math.pow(g, x);
    if (l >= 2) { const k = nz(-3, 4), e = x - k; if (e < 1) return exactPower(l);   // spicy: an expression in the exponent
      const ex_ = X() + (k < 0 ? ' − ' + -k : ' + ' + k);
      return nu(p('Solve: ' + pw(g, ex_) + ' = ' + sp(r)), e, 'Which power of ' + g + ' gives ' + sp(r) + '? That number is ' + ex_ + '.', pw(g, x) + ' = ' + sp(r) + ', so ' + ex_ + ' = ' + x + ' and ' + X() + ' = ' + e + '.', { noStep: true }); }
    return nu(p('Solve: ' + pw(g, X()) + ' = ' + sp(r)), x, 'Which power of ' + g + ' gives ' + sp(r) + '?', pw(g, x) + ' = ' + sp(r) + ', so ' + X() + ' = ' + x + '.', { noStep: true });
  },
  function withFactor(l) {
    const a = pick([2, 3, 4, 5, 10]), g = pick([2, 3, 5]), x = ri(1, g === 2 ? 6 : 4), r = a * Math.pow(g, x);
    if (l >= 2) { const c = nz(-20, 40), lhs = a + ' · ' + pw(g, X()) + (c < 0 ? ' − ' + -c : ' + ' + c);   // spicy: a number added too
      return nu(p('Solve: ' + lhs + ' = ' + sp(r + c)), x, 'First get ' + a + ' · ' + pw(g, X()) + ' on its own, then divide by ' + a + '.', p(a + ' · ' + pw(g, X()) + ' = ' + sp(r + c) + (c > 0 ? ' − ' + c : ' + ' + -c) + ' = ' + sp(r)) + p(pw(g, X()) + ' = ' + sp(r) + ' : ' + a + ' = ' + sp(Math.pow(g, x))) + p(X() + ' = ' + x), { noStep: true }); }
    return nu(p('Solve: ' + a + ' · ' + pw(g, X()) + ' = ' + sp(r)), x, 'Divide by ' + a + ' first.', p(pw(g, X()) + ' = ' + sp(r) + ' : ' + a + ' = ' + sp(Math.pow(g, x))) + p(X() + ' = ' + x), { noStep: true });
  },
  function trialRound(l) {
    let g, target, x; do { g = pick([1.2, 1.5, 1.1, 1.3, 0.9, 0.8, 0.7]); target = g > 1 ? pick([5, 10, 15, 20, 38, 50]) : pick([0.5, 0.25, 0.1, 0.05]); x = Math.log(target) / Math.log(g); } while (x > 25 || Math.abs(x - Math.round(x)) > .45); const xr = Math.round(x), lo = Math.floor(x), hi = lo + 1;
    return nu(p('Solve ' + pw(g, X()) + ' = ' + target + ' by trying values. Round ' + X() + ' to a whole number.'), xr, 'Try whole numbers for ' + X() + ' until you pass ' + target + '. Which one is closest?', p(pw(g, lo) + ' ≈ ' + rd(Math.pow(g, lo), 3) + ' and ' + pw(g, hi) + ' ≈ ' + rd(Math.pow(g, hi), 3)) + p('More precisely ' + X() + ' ≈ ' + rd(x, 2) + ', so rounded ' + X() + ' ≈ ' + xr + '.'), { noStep: true });
  },
  function doublingTime(l) {
    const g = pick([1.3, 1.2, 1.1, 1.5, 1.08]), t = Math.log(2) / Math.log(g), d = 1;
    if (l >= 2) { const q = pick([4, 6, 7, 9, 12]), g2 = 1 + q / 100, t3 = Math.log(3) / Math.log(g2);   // spicy: a percentage, and three times as much
      return nr(p('A savings account grows by ' + q + '% per year. You start with €400. After how many years do you have three times as much? Round to 1 decimal.'), t3, 1, 'g = ' + g2 + '. Three times as much means ' + pw(g2, X('t')) + ' = 3. Try values with your calculator.', p('400 · ' + pw(g2, X('t')) + ' = 1200 gives ' + pw(g2, X('t')) + ' = 3') + p(pw(g2, rd(t3, 1)) + ' ≈ ' + rd(Math.pow(g2, rd(t3, 1)), 3) + ', so ' + X('t') + ' ≈ ' + rd(t3, 1) + ' years'), { noStep: true, tol: .06 }); }
    return nr(p('A quantity grows by ' + X('N') + ' = 25 · ' + pw(g, X('t')) + ' (' + X('t') + ' in years). After how many years has the quantity doubled? Round to 1 decimal.'), t, 1, 'Doubled means ' + X('N') + ' = 50, so ' + pw(g, X('t')) + ' = 2. Try values with your calculator (or use the table).', p('25 · ' + pw(g, X('t')) + ' = 50 gives ' + pw(g, X('t')) + ' = 2') + p(pw(g, rd(t, 1)) + ' ≈ ' + rd(Math.pow(g, rd(t, 1)), 3) + ', so ' + X('t') + ' ≈ ' + rd(t, 1) + ' years'), { noStep: true, tol: .06 });
  },
  function whenBelow(l) {
    const b = pick([180, 100, 500]), g = pick([0.9, 0.85, 0.8, 0.95]), half = b / 2; let t = 0; while (b * Math.pow(g, t) >= half) t++;
    if (l >= 2) { const q = pick([6, 8, 12, 15]), g2 = 1 - q / 100, lim = b / 10; let t2 = 0; while (b * Math.pow(g2, t2) >= lim) t2++;   // spicy: a percentage, and less than 10% left
      return nu(p('A barrel with ' + b + ' L leaks. Every hour ' + q + '% of the water that is still in it leaks out. After how many whole hours is less than 10% of the water left for the first time?'), t2, 'g = ' + rd(g2) + '. 10% of ' + b + ' is ' + lim + ' L. Try whole values of ' + X('t') + '.', p(X('W') + ' = ' + b + ' · ' + pw(rd(g2), X('t'))) + p(X('t') + ' = ' + (t2 - 1) + ': ' + rd(b * Math.pow(g2, t2 - 1), 1) + ' L') + p(X('t') + ' = ' + t2 + ': ' + rd(b * Math.pow(g2, t2), 1) + ' L &lt; ' + lim) + p('After ' + t2 + ' hours.'), { noStep: true }); }
    return nu(p('A barrel with ' + b + ' L leaks: ' + X('W') + ' = ' + b + ' · ' + pw(g, X('t')) + ' (' + X('t') + ' in hours). After how many whole hours is less than half of the water left for the first time?'), t, 'Half is ' + half + ' L. Try whole values of ' + X('t') + '.', p(X('t') + ' = ' + (t - 1) + ': ' + rd(b * Math.pow(g, t - 1), 1) + ' L') + p(X('t') + ' = ' + t + ': ' + rd(b * Math.pow(g, t), 1) + ' L &lt; ' + half) + p('After ' + t + ' hours.'), { noStep: true });
  }
];
XG['7.5'] = [
  function savingsGoal(l) {
    const A = pick([5000, 2000, 1000]), r = pick([1, 2, 3, 4]), goal = A * pick([1.2, 1.5]); let t = 0; while (A * Math.pow(mult(r), t) < goal) t++;
    return nu(p('You save €' + sp(A) + ' at ' + r + '% interest per year. After how many whole years do you have at least €' + sp(goal) + ' for the first time?'), t, 'B = ' + A + ' · ' + pw(mult(r), X('t')) + '. Try values.', p(X('t') + ' = ' + (t - 1) + ': €' + sp(rd(A * Math.pow(mult(r), t - 1), 2))) + p(X('t') + ' = ' + t + ': €' + sp(rd(A * Math.pow(mult(r), t), 2))) + p('After ' + t + ' years.'), { noStep: true });
  }
];
XG['7.5'].push(function percentFromTime(l) {
  const k = pick([2, 3, 0.5]), T = pick([5, 8, 10, 12, 15, 20]), g = Math.pow(k, 1 / T), pc = rd(Math.abs(g - 1) * 100, 1);
  return nu(p('A quantity ' + (k === 2 ? 'doubles' : k === 3 ? 'becomes three times as big' : 'halves') + ' every ' + T + ' years (exponential ' + (k < 1 ? 'decay' : 'growth') + '). By what percentage does it ' + (k < 1 ? 'decrease' : 'increase') + ' per year? <small>(Round to 1 decimal.)</small>'), pc, 'Find the growth factor per year: ' + pw(X('g'), T) + ' = ' + k + ', so ' + X('g') + ' = ' + pw(k, '1/' + T) + '.', p(X('g') + ' = ' + pw(k, '1/' + T) + ' ≈ ' + rd(g, 4)) + p((k < 1 ? '1 − ' + rd(g, 4) + ' = ' + rd(1 - g, 4) : rd(g, 4) + ' − 1 = ' + rd(g - 1, 4)) + ' → ' + pc + '% per year'), { tol: .051, needStep: true });
});

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
/* ======================= 3VT: this is chapter 6, plus fractional exponents and the geometric mean ======================= */
if (P.cls === '3VT') {
  G['7.2'].push(function geometricMean(l) {
    const pcs = Array.from({ length: l === 0 ? 2 : 3 }, () => pick([-12, -8, -5, -3, 2, 4, 6, 8, 10, 15, 20])), gs = pcs.map(mult), prod = gs.reduce((a, b) => a * b, 1), n = gs.length, g = Math.pow(prod, 1 / n), pc = rd(g * 100 - 100, 2);
    return nr(p('The profit of a company changes by ' + pcs.map(c => (c > 0 ? '+' : '−') + Math.abs(c) + '%').join(' and then ') + ' (one change per year). Calculate the average yearly percentage change. <small>(Round to 2 decimals.)</small>'), g * 100 - 100, 2, 'Use the geometric mean of the growth factors: the ' + (n === 2 ? 'square' : 'cube') + ' root of their product.', p('Growth factors: ' + gs.join(', ')) + p('Average growth factor = ' + (n === 2 ? '√' : '∛') + '(' + gs.join(' · ') + ')' + ap(g, 4)) + p('Percentage change ≈ ' + rd(g, 4) + ' · 100% − 100%' + ap(g * 100 - 100, 2) + '%'), { needStep: true });
  });
  G['7.3'].push(function fracExponent(l) {
    const T = l === 0 ? [[4, 2], [9, 2], [25, 2], [8, 3], [27, 3], [16, 4], [100, 2], [32, 5]] : [[64, 3], [81, 4], [125, 3], [0.01, 2], [1000, 3], [64, 6], [0.008, 3], [243, 5]];
    const [b, n] = pick(T), r = rd(Math.pow(b, 1 / n)), m = l === 2 ? pick([1, 2, 3]) : 1, v = rd(Math.pow(r, m));
    return nu(p('Calculate without a calculator: ' + pw(b, m === 1 ? '1/' + n : m + '/' + n) + '.'), v, pw('a', '1/' + X('n')) + ' is the ' + X('n') + '-th root of ' + X('a') + '.', p(pw(r, n) + ' = ' + b + ', so ' + pw(b, '1/' + n) + ' = ' + (n === 2 ? '√' : pw('', n) + '√') + b + ' = ' + r) + (m === 1 ? '' : p(pw(b, m + '/' + n) + ' = ' + pw('(' + pw(b, '1/' + n) + ')', m) + ' = ' + pw(r, m) + ' = ' + v)), { noStep: true });
  });
  const ren = id => id.replace(/^7\./, '6.');
  [G, XG].forEach(O => Object.keys(O).forEach(k => { O[ren(k)] = O[k]; }));
  SECTIONS.forEach(S => { S.id = ren(S.id); S.title = ren(S.title); });
  SECTIONS[1].sub += ', geometric mean'; SECTIONS[2].sub += ', fractional exponents';
  GOALS.forEach(g => { g[0] = ren(g[0]); });
  GOALS[1][2].push('geometricMean'); GOALS[2][2].push('fracExponent');
}
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "3HT": [
      {"id": "D1", "title": "Lesson · 7.1 A Percentages and multipliers", "sub": "Wed 31 Mar · ex 1, 2, 3, 6, 7, 8, 9", "date": "2027-03-31", "gens": [["7.1", "multiplier"], ["7.1", "newAmount"], ["7.1", "original"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"]]},
      {"id": "D2", "title": "Lesson · 7.1 B Percentages and multipliers", "sub": "Thu 1 Apr · ex 10, 11, 12, 13", "date": "2027-04-01", "gens": [["7.1", "multiplier"], ["7.1", "newAmount"], ["7.1", "original"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"]]},
      {"id": "D3", "title": "Lesson · 7.1 C Percentages and multipliers", "sub": "Fri 2 Apr · ex 14, 15, 16, 17, 18, 19", "date": "2027-04-02", "gens": [["7.1", "newAmount"], ["7.1", "original"], ["7.1", "percentChange"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"]]},
      {"id": "D4", "title": "Lesson · 7.1 D Percentages and multipliers", "sub": "Wed 7 Apr · ex 20, 21, 22", "date": "2027-04-07", "gens": [["7.1", "original"], ["7.1", "percentChange"], ["7.1", "repeated"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"]]},
      {"id": "D5", "title": "Lesson · 7.2 A Exponential growth", "sub": "Thu 8 Apr · ex 25, 26, 27, 28, 29, 30", "date": "2027-04-08", "gens": [["7.2", "linOrExp"], ["7.2", "growthFactor"], ["7.2", "completeTable"]], "xg": [["7.2", "backInTime"], ["7.2", "videoViews"]]},
      {"id": "D6", "title": "Lesson · 7.2 B Exponential growth", "sub": "Fri 9 Apr · ex 31, 32, 33, 34, 35", "date": "2027-04-09", "gens": [["7.2", "growthFactor"], ["7.2", "completeTable"], ["7.2", "percentToFactor"]], "xg": [["7.2", "backInTime"], ["7.2", "videoViews"]]},
      {"id": "D7", "title": "Lesson · 7.3 A Exponential formulas", "sub": "Wed 14 Apr · ex 39, 40, 41, 42, 43, 44, 45", "date": "2027-04-14", "gens": [["7.3", "readFormula"], ["7.3", "makeFormula"], ["7.3", "factorToPercent"]], "xg": [["7.3", "halfLife"], ["7.3", "deerYears"]]},
      {"id": "D8", "title": "Lesson · 7.3 B Exponential formulas", "sub": "Thu 15 Apr · ex 46, 47, 48, 49, 50", "date": "2027-04-15", "gens": [["7.3", "makeFormula"], ["7.3", "factorToPercent"], ["7.3", "biggerUnit"]], "xg": [["7.3", "halfLife"], ["7.3", "deerYears"]]},
      {"id": "D9", "title": "Lesson · 7.3 C Exponential formulas", "sub": "Fri 16 Apr · ex 51, 52, 53, 54", "date": "2027-04-16", "gens": [["7.3", "factorToPercent"], ["7.3", "biggerUnit"], ["7.3", "smallerUnit"]], "xg": [["7.3", "halfLife"], ["7.3", "deerYears"]]},
      {"id": "D10", "title": "Lesson · 7.4 A Exponential graphs", "sub": "Wed 12 May · ex 58, 59, 60, 61, 62", "date": "2027-05-12", "gens": [["7.4", "growthOrDecay"], ["7.4", "startValue"], ["7.4", "readGraph"]], "xg": [["7.4", "coffeeDissolve"]]},
      {"id": "D11", "title": "Lesson · 7.4 B Exponential graphs", "sub": "Thu 13 May · ex 63, 64, 65, 66, 67", "date": "2027-05-13", "gens": [["7.4", "startValue"], ["7.4", "readGraph"], ["7.4", "whichGraph"]], "xg": [["7.4", "coffeeDissolve"]]},
      {"id": "D12", "title": "Lesson · 7.4 Exponential graphs + 7.5 Exponential equations", "sub": "Fri 14 May · ex 68, 69, 71, 72", "date": "2027-05-14", "gens": [["7.4", "readGraph"], ["7.4", "whichGraph"], ["7.4", "tableFromFormula"], ["7.5", "exactPower"], ["7.5", "withFactor"], ["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.4", "coffeeDissolve"], ["7.5", "savingsGoal"]]},
      {"id": "D13", "title": "Lesson · 7.5 A Exponential equations", "sub": "Wed 19 May · ex 73, 74, 75, 76", "date": "2027-05-19", "gens": [["7.5", "withFactor"], ["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.5", "savingsGoal"]]},
      {"id": "D14", "title": "Lesson · 7.5 B Exponential equations", "sub": "Thu 20 May · ex 77, 78, 79, 80, 81", "date": "2027-05-20", "gens": [["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.5", "savingsGoal"]]},
      {"id": "D15", "title": "Lesson · 7.5 C Exponential equations", "sub": "Fri 21 May · ex 82, 83, 84", "date": "2027-05-21", "gens": [["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.5", "savingsGoal"]]},
      {"id": "D16", "title": "Test prep · chapter 7", "sub": "Wed 26 May · ex 85, 86", "date": "2027-05-26", "gens": [["7.1", "multiplier"], ["7.1", "newAmount"], ["7.1", "original"], ["7.1", "percentChange"], ["7.1", "repeated"], ["7.2", "linOrExp"], ["7.2", "growthFactor"], ["7.2", "completeTable"], ["7.2", "percentToFactor"], ["7.2", "checkQuotients"], ["7.3", "readFormula"], ["7.3", "makeFormula"], ["7.3", "factorToPercent"], ["7.3", "biggerUnit"], ["7.3", "smallerUnit"], ["7.4", "growthOrDecay"], ["7.4", "startValue"], ["7.4", "readGraph"], ["7.4", "whichGraph"], ["7.4", "tableFromFormula"], ["7.5", "exactPower"], ["7.5", "withFactor"], ["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"], ["7.2", "backInTime"], ["7.2", "videoViews"], ["7.3", "halfLife"], ["7.3", "deerYears"], ["7.4", "coffeeDissolve"], ["7.5", "savingsGoal"]], "rev": true},
      {"id": "D17", "title": "Test prep · chapter 7", "sub": "Thu 27 May", "date": "2027-05-27", "gens": [["7.1", "multiplier"], ["7.1", "newAmount"], ["7.1", "original"], ["7.1", "percentChange"], ["7.1", "repeated"], ["7.2", "linOrExp"], ["7.2", "growthFactor"], ["7.2", "completeTable"], ["7.2", "percentToFactor"], ["7.2", "checkQuotients"], ["7.3", "readFormula"], ["7.3", "makeFormula"], ["7.3", "factorToPercent"], ["7.3", "biggerUnit"], ["7.3", "smallerUnit"], ["7.4", "growthOrDecay"], ["7.4", "startValue"], ["7.4", "readGraph"], ["7.4", "whichGraph"], ["7.4", "tableFromFormula"], ["7.5", "exactPower"], ["7.5", "withFactor"], ["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"], ["7.2", "backInTime"], ["7.2", "videoViews"], ["7.3", "halfLife"], ["7.3", "deerYears"], ["7.4", "coffeeDissolve"], ["7.5", "savingsGoal"]], "rev": true},
      {"id": "D18", "title": "Test prep · chapters 7 & 8", "sub": "Wed 16 Jun", "date": "2027-06-16", "gens": [["7.1", "multiplier"], ["7.1", "newAmount"], ["7.1", "original"], ["7.1", "percentChange"], ["7.1", "repeated"], ["7.2", "linOrExp"], ["7.2", "growthFactor"], ["7.2", "completeTable"], ["7.2", "percentToFactor"], ["7.2", "checkQuotients"], ["7.3", "readFormula"], ["7.3", "makeFormula"], ["7.3", "factorToPercent"], ["7.3", "biggerUnit"], ["7.3", "smallerUnit"], ["7.4", "growthOrDecay"], ["7.4", "startValue"], ["7.4", "readGraph"], ["7.4", "whichGraph"], ["7.4", "tableFromFormula"], ["7.5", "exactPower"], ["7.5", "withFactor"], ["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"], ["7.2", "backInTime"], ["7.2", "videoViews"], ["7.3", "halfLife"], ["7.3", "deerYears"], ["7.4", "coffeeDissolve"], ["7.5", "savingsGoal"]], "rev": true},
      {"id": "D19", "title": "Test prep · chapters 7 & 8", "sub": "Thu 17 Jun", "date": "2027-06-17", "gens": [["7.1", "multiplier"], ["7.1", "newAmount"], ["7.1", "original"], ["7.1", "percentChange"], ["7.1", "repeated"], ["7.2", "linOrExp"], ["7.2", "growthFactor"], ["7.2", "completeTable"], ["7.2", "percentToFactor"], ["7.2", "checkQuotients"], ["7.3", "readFormula"], ["7.3", "makeFormula"], ["7.3", "factorToPercent"], ["7.3", "biggerUnit"], ["7.3", "smallerUnit"], ["7.4", "growthOrDecay"], ["7.4", "startValue"], ["7.4", "readGraph"], ["7.4", "whichGraph"], ["7.4", "tableFromFormula"], ["7.5", "exactPower"], ["7.5", "withFactor"], ["7.5", "trialRound"], ["7.5", "doublingTime"], ["7.5", "whenBelow"]], "xg": [["7.1", "vatBack"], ["7.1", "savings"], ["7.2", "backInTime"], ["7.2", "videoViews"], ["7.3", "halfLife"], ["7.3", "deerYears"], ["7.4", "coffeeDissolve"], ["7.5", "savingsGoal"]], "rev": true}
    ],
    "3VT": [
      {"id": "D1", "title": "Lesson · 6.1 A Percentages and multipliers", "sub": "Tue 30 Mar · ex 1, 2, 8, 9, 10, 11", "date": "2027-03-30", "gens": [["6.1", "multiplier"], ["6.1", "newAmount"], ["6.1", "original"]], "xg": [["6.1", "vatBack"], ["6.1", "savings"]]},
      {"id": "D2", "title": "Lesson · 6.1 B Percentages and multipliers", "sub": "Thu 1 Apr · ex 12, 13, 14, 15, 16, 17", "date": "2027-04-01", "gens": [["6.1", "multiplier"], ["6.1", "newAmount"], ["6.1", "original"]], "xg": [["6.1", "vatBack"], ["6.1", "savings"]]},
      {"id": "D3", "title": "Lesson · 6.1 C Percentages and multipliers", "sub": "Fri 2 Apr · ex 18, 19, 20, 21, 22", "date": "2027-04-02", "gens": [["6.1", "newAmount"], ["6.1", "original"], ["6.1", "percentChange"]], "xg": [["6.1", "vatBack"], ["6.1", "savings"]]},
      {"id": "D4", "title": "Lesson · 6.2 A Exponential growth", "sub": "Tue 6 Apr · ex 27, 28, 29, 30, 31", "date": "2027-04-06", "gens": [["6.2", "linOrExp"], ["6.2", "growthFactor"], ["6.2", "completeTable"]], "xg": [["6.2", "backInTime"], ["6.2", "videoViews"]]},
      {"id": "D5", "title": "Lesson · 6.2 B Exponential growth", "sub": "Thu 8 Apr · ex 32, 33, 34, 35, 36", "date": "2027-04-08", "gens": [["6.2", "completeTable"], ["6.2", "percentToFactor"], ["6.2", "checkQuotients"]], "xg": [["6.2", "backInTime"], ["6.2", "videoViews"]]},
      {"id": "D6", "title": "Lesson · 6.3 A Exponential formulas", "sub": "Fri 9 Apr · ex 41, 42, 43, 44, 45, 46", "date": "2027-04-09", "gens": [["6.3", "readFormula"], ["6.3", "makeFormula"], ["6.3", "factorToPercent"]], "xg": [["6.3", "halfLife"], ["6.3", "deerYears"]]},
      {"id": "D7", "title": "Lesson · 6.3 B Exponential formulas", "sub": "Tue 13 Apr · ex 47, 48, 49, 50, 51", "date": "2027-04-13", "gens": [["6.3", "makeFormula"], ["6.3", "factorToPercent"], ["6.3", "biggerUnit"]], "xg": [["6.3", "halfLife"], ["6.3", "deerYears"]]},
      {"id": "D8", "title": "Lesson · 6.3 C Exponential formulas", "sub": "Thu 15 Apr · ex 52, 53, 54, 55, 56", "date": "2027-04-15", "gens": [["6.3", "factorToPercent"], ["6.3", "biggerUnit"], ["6.3", "smallerUnit"]], "xg": [["6.3", "halfLife"], ["6.3", "deerYears"]]},
      {"id": "D9", "title": "Lesson · 6.4 A Exponential graphs", "sub": "Fri 16 Apr · ex 61, 62, 63, 64, 65, 66", "date": "2027-04-16", "gens": [["6.4", "growthOrDecay"], ["6.4", "startValue"], ["6.4", "readGraph"]], "xg": [["6.4", "coffeeDissolve"]]},
      {"id": "D10", "title": "Lesson · 6.4 B Exponential graphs", "sub": "Tue 11 May · ex 67, 68, 69, 70, 71, 72", "date": "2027-05-11", "gens": [["6.4", "startValue"], ["6.4", "readGraph"], ["6.4", "whichGraph"]], "xg": [["6.4", "coffeeDissolve"]]},
      {"id": "D11", "title": "Lesson · 6.5 A Exponential equations", "sub": "Thu 13 May · ex 78, 79, 80, 81, 82, 83", "date": "2027-05-13", "gens": [["6.5", "exactPower"], ["6.5", "withFactor"], ["6.5", "trialRound"], ["6.5", "doublingTime"], ["6.5", "whenBelow"]], "xg": [["6.5", "savingsGoal"]]},
      {"id": "D12", "title": "Lesson · 6.5 B Exponential equations", "sub": "Fri 14 May · ex 84, 85, 86, 87, 88, 89", "date": "2027-05-14", "gens": [["6.5", "trialRound"], ["6.5", "doublingTime"], ["6.5", "whenBelow"]], "xg": [["6.5", "savingsGoal"]]},
      {"id": "D13", "title": "Lesson · 6.5 C Exponential equations", "sub": "Tue 18 May · ex 90, 91, 92", "date": "2027-05-18", "gens": [["6.5", "trialRound"], ["6.5", "doublingTime"], ["6.5", "whenBelow"]], "xg": [["6.5", "savingsGoal"]]},
      {"id": "D14", "title": "Test prep · chapter 6", "sub": "Thu 20 May", "date": "2027-05-20", "gens": [["6.1", "multiplier"], ["6.1", "newAmount"], ["6.1", "original"], ["6.1", "percentChange"], ["6.1", "repeated"], ["6.2", "linOrExp"], ["6.2", "growthFactor"], ["6.2", "completeTable"], ["6.2", "percentToFactor"], ["6.2", "checkQuotients"], ["6.2", "geometricMean"], ["6.3", "readFormula"], ["6.3", "makeFormula"], ["6.3", "factorToPercent"], ["6.3", "biggerUnit"], ["6.3", "smallerUnit"], ["6.3", "fracExponent"], ["6.4", "growthOrDecay"], ["6.4", "startValue"], ["6.4", "readGraph"], ["6.4", "whichGraph"], ["6.4", "tableFromFormula"], ["6.5", "exactPower"], ["6.5", "withFactor"], ["6.5", "trialRound"], ["6.5", "doublingTime"], ["6.5", "whenBelow"]], "xg": [["6.1", "vatBack"], ["6.1", "savings"], ["6.2", "backInTime"], ["6.2", "videoViews"], ["6.3", "halfLife"], ["6.3", "deerYears"], ["6.4", "coffeeDissolve"], ["6.5", "savingsGoal"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: [...new Set(o.gens.map(g => g[0]))].reduce((a, s) => a.concat((XG[s] || []).map(f => [s, f.name])), []) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-' + P.cls.toLowerCase() + '-ch' + (P.cls === '3VT' ? 6 : 7) + '-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['multiplier', 'percentToFactor', 'growthOrDecay', 'startValue', 'whichGraph'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
