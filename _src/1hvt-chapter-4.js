const { ri, pick, shuffle, gcd } = NX;
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps, keys: [] }, extra || {}); };
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const rd = (x, d) => { d = d === undefined ? 10 : d; return Math.round(x * Math.pow(10, d) + (x >= 0 ? 1e-9 : -1e-9)) / Math.pow(10, d); };
const sp = n => { n = rd(n); const m = String(Math.abs(n)).split('.'); m[0] = m[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return (n < 0 ? '−' : '') + m.join('.'); };
const sum = a => a.reduce((s, v) => s + v, 0);
const tbl = (h1, h2, xs, ys) => '<table class="tbl"><tr><th>' + h1 + '</th>' + xs.map(x => '<td>' + x + '</td>').join('') + '</tr><tr><th>' + h2 + '</th>' + ys.map(y => '<td>' + y + '</td>').join('') + '</tr></table>';
const svg = (w, h, body) => '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:' + w + 'px;max-width:100%" role="img" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
const T_ = (s, x, y, a, sz) => '<text x="' + x + '" y="' + y + '" font-size="' + (sz || 12) + '" text-anchor="' + (a || 'middle') + '" fill="#17222d">' + s + '</text>';
/* bar chart: labels, values, step for the gridlines */
function bars(labs, vals, step) {
  const W = 60 + labs.length * 52, H = 210, top = Math.ceil(Math.max(...vals) / step) * step, Y = v => 180 - v / top * 160;
  let b = '';
  for (let v = 0; v <= top; v += step) b += '<line x1="45" x2="' + (W - 10) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#dbe3ea"/>' + T_(v, 40, Y(v) + 4, 'end', 11);
  labs.forEach((l, i) => { const x = 58 + i * 52; b += '<rect x="' + x + '" y="' + Y(vals[i]) + '" width="34" height="' + (180 - Y(vals[i])) + '" fill="#1b5fa8" opacity=".8"/>' + T_(l, x + 17, 196, 'middle', 11); });
  return svg(W, H + 5, b + '<line x1="45" x2="' + (W - 10) + '" y1="180" y2="180" stroke="#334"/>');
}
/* line graph over months */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function lineGraph(vals, step, unit) {
  const W = 420, top = Math.ceil(Math.max(...vals) / step) * step, bot = Math.min(0, Math.floor(Math.min(...vals) / step) * step), Y = v => 180 - (v - bot) / (top - bot) * 160, X = i => 55 + i * 30;
  let b = '';
  for (let v = bot; v <= top; v += step) b += '<line x1="50" x2="' + (W - 10) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="' + (v === 0 ? '#334' : '#dbe3ea') + '"/>' + T_(v, 45, Y(v) + 4, 'end', 11);
  vals.forEach((v, i) => { b += T_(MON[i], X(i), 196, 'middle', 10) + '<line x1="' + X(i) + '" x2="' + X(i) + '" y1="20" y2="180" stroke="#eef2f5"/>'; });
  b += '<polyline points="' + vals.map((v, i) => X(i) + ',' + Y(v)).join(' ') + '" fill="none" stroke="#d1471f" stroke-width="2.4"/>' + vals.map((v, i) => '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="3" fill="#d1471f"/>').join('') + T_(unit, 50, 12, 'start', 11);
  return svg(W, 205, b);
}
const roundTo = (x, d) => d >= 0 ? rd(x, d) : Math.round(x / Math.pow(10, -d)) * Math.pow(10, -d);

/* ======================= 4.1 Frequency tables and the mean ======================= */
G['4.1'] = [
  function tableMean(l) {
    const xs = l === 0 ? [4, 5, 6, 7, 8, 9, 10] : (() => { const a = ri(18, 26); return [a, a + 1, a + 2, a + 3, a + 4, a + 5]; })();
    let fs, tot, N; do { fs = xs.map(() => ri(0, 6)); N = sum(fs); tot = sum(xs.map((x, i) => x * fs[i])); } while (N < 8 || (l === 0 && tot % N !== 0));
    const m = rd(tot / N, 1), exact = rd(tot / N) === m;
    return nu(p('The table shows the ' + (l === 0 ? 'marks of a test' : 'number of students per class') + '. Calculate the mean. <small>(Round to 1 decimal.)</small>') + tbl(l === 0 ? 'mark' : 'students', 'frequency', xs, fs), m, 'Multiply every value by its frequency and add. Then divide by the total frequency.', p('total = ' + xs.map((x, i) => fs[i] ? fs[i] + ' · ' + x : null).filter(Boolean).join(' + ') + ' = ' + tot) + p('total frequency = ' + fs.join(' + ') + ' = ' + N) + p('mean = ' + tot + ' : ' + N + (exact ? ' = ' : ' ≈ ') + m), { tol: .051, needStep: true });
  },
  function listMean(l) {
    const n = ri(4, 7), dec = l > 0, xs = Array.from({ length: n }, () => dec ? rd(ri(120, 140) / 10, 1) : ri(2, 30)), tot = rd(sum(xs)), m = rd(tot / n, 2);
    return nu(p('Calculate the mean of these numbers: ' + xs.join('; ') + '. <small>(Round to 2 decimals if needed.)</small>'), m, 'Add all numbers. Divide by how many numbers there are.', '(' + xs.join(' + ') + ') : ' + n + ' = ' + tot + ' : ' + n + (rd(tot / n) === m ? ' = ' : ' ≈ ') + m, { tol: .0051, needStep: true });
  },
  function totalFreq(l) {
    const xs = [1, 2, 3, 4, 5], fs = xs.map(() => ri(1, 9)), ask = l === 0 ? 'n' : l === 1 ? pick(['n', 'max', 'atleast']) : pick(['max', 'mean', 'mean']);
    const t = tbl('goals', 'matches', xs, fs);
    if (ask === 'n') return nu(p('A football team kept a frequency table of the number of goals in a match. How many matches did they play?') + t, sum(fs), 'Add all the frequencies.', fs.join(' + ') + ' = ' + sum(fs));
    if (ask === 'max') { const tot = sum(xs.map((x, i) => x * fs[i])); return nu(p('How many goals did the team score in total?') + t, tot, 'Multiply every number of goals by its frequency and add.', xs.map((x, i) => fs[i] + ' · ' + x).join(' + ') + ' = ' + tot, { needStep: true }); }
    if (ask === 'mean') { const tot = sum(xs.map((x, i) => x * fs[i])), N = sum(fs), m = rd(tot / N, 1); return nu(p('A football team kept a frequency table of the number of goals in a match. Calculate the <b>mean</b> number of goals per match. <small>(Round to 1 decimal.)</small>') + t, m, 'First calculate the total number of goals and the number of matches.', 'goals: ' + xs.map((x, i) => fs[i] + ' · ' + x).join(' + ') + ' = ' + tot + '<br>matches: ' + fs.join(' + ') + ' = ' + N + '<br>mean = ' + tot + ' : ' + N + (rd(tot / N) === m ? ' = ' : ' ≈ ') + m, { needStep: true, tol: .051 }); }
    const k = ri(3, 4), c = sum(fs.slice(k - 1)); return nu(p('In how many matches did the team score at least ' + k + ' goals?') + t, c, 'At least ' + k + ' means ' + k + ' or more.', fs.slice(k - 1).join(' + ') + ' = ' + c);
  },
  function missingValue(l) {
    const n = ri(4, 6), m = ri(5, 15), xs = Array.from({ length: n - 1 }, () => ri(m - 4, m + 4)), last = n * m - sum(xs);
    if (last < 0) return missingValue(l);
    if (l >= 2) {   // spicy: one number is added and the mean changes
      const m2 = m + pick([-2, -1, 1, 2, 3]), x = (n + 1) * m2 - n * m; if (x < 0) return missingValue(l);
      return nu(p('The mean of ' + n + ' test scores is ' + m + '. One more score is added. Now the mean of the ' + (n + 1) + ' scores is ' + m2 + '. Which score was added?'), x, 'Calculate the total of the ' + n + ' scores and the total of the ' + (n + 1) + ' scores.', 'total before = ' + n + ' · ' + m + ' = ' + n * m + '<br>total after = ' + (n + 1) + ' · ' + m2 + ' = ' + (n + 1) * m2 + '<br>added score = ' + (n + 1) * m2 + ' − ' + n * m + ' = ' + x, { needStep: true });
    }
    return nu(p('The mean of ' + n + ' numbers is ' + m + '. Four' .replace('Four', n - 1 === 4 ? 'Four' : String(n - 1)) + ' of the numbers are ' + xs.join(', ') + '. What is the last number?'), last, 'The total of all ' + n + ' numbers is ' + n + ' · ' + m + '.', 'total = ' + n + ' · ' + m + ' = ' + n * m + '<br>' + n * m + ' − (' + xs.join(' + ') + ') = ' + n * m + ' − ' + sum(xs) + ' = ' + last, { needStep: true });
  }
];
XG['4.1'] = [];

/* ======================= 4.2 Rounding ======================= */
G['4.2'] = [
  function roundNumber(l) {
    const k = l === 0 ? pick([1, 2, 0]) : pick([1, 2, 3, 0, -1, -2, -3]), x = k >= 0 ? rd(ri(100, 99999) / 100 + ri(1, 999) / 100000, 5) : ri(1000, 999999) + (Math.random() < .5 ? ri(1, 99) / 100 : 0), r = roundTo(x, k);
    const what = k > 0 ? k + ' decimal' + (k > 1 ? 's' : '') : k === 0 ? 'a whole number' : k === -1 ? 'tens' : k === -2 ? 'hundreds' : 'thousands';
    return nu(p('Round ' + sp(x) + ' to ' + what + '.'), r, 'Look at the next digit: 0, 1, 2, 3 or 4 means round down; 5, 6, 7, 8 or 9 means round up.', sp(x) + ' ≈ ' + sp(r), { tol: 1e-9 });
  },
  function roundContext(l) {
    const k = ri(0, 3);
    if (l >= 2 && k < 2) {   // spicy: first calculate the area, two layers of paint
      const a = ri(4, 9), b = pick([2.4, 2.5, 2.6, 3]), per = pick([6, 8, 10]), A = rd(a * b * 2, 2); if (Number.isInteger(A / per)) return roundContext(l); const c = Math.ceil(A / per);
      return nu(p('A wall is ' + a + ' m long and ' + b + ' m high. You paint it with <b>two layers</b>. One can of paint is enough for ' + per + ' m². How many cans do you need?'), c, 'Calculate the area of the wall first. Two layers means twice that area.', 'area = ' + a + ' · ' + b + ' = ' + rd(a * b, 2) + ' m²<br>two layers: 2 · ' + rd(a * b, 2) + ' = ' + A + ' m²<br>' + A + ' : ' + per + ' ≈ ' + rd(A / per, 2) + '. Round up: ' + c + ' cans.', { needStep: true });
    }
    if (k === 0) { const area = ri(25, 90), per = pick([6, 8, 10, 12]); if (area % per === 0) return roundContext(l); const c = Math.ceil(area / per); return nu(p('One can of paint is enough for ' + per + ' m². You want to paint ' + area + ' m². How many cans do you need?'), c, 'Divide. Can you round down here, or do you need to round up?', area + ' : ' + per + ' ≈ ' + rd(area / per, 2) + '. With ' + Math.floor(area / per) + ' cans you cannot paint everything, so round up: ' + c + ' cans.', { needStep: true }); }
    if (k === 1) { const money = ri(30, 90), pr = pick([4, 6, 7, 8, 9]); if (money % pr === 0) return roundContext(l); const c = Math.floor(money / pr); return nu(p('A poster costs £' + pr + '. You have £' + money + '. How many posters can you buy?'), c, 'Divide. Can you buy part of a poster?', money + ' : ' + pr + ' ≈ ' + rd(money / pr, 2) + '. You cannot buy part of a poster, so round down: ' + c + ' posters.', { needStep: true }); }
    if (k === 2) { const st = ri(200, 600), seat = pick([50, 60, 75]); if (st % seat === 0) return roundContext(l); const c = Math.ceil(st / seat); return nu(p(st + ' students and teachers go on a school trip. One bus has ' + seat + ' seats. How many buses are needed?'), c, 'Everybody needs a seat. Round up or down?', st + ' : ' + seat + ' ≈ ' + rd(st / seat, 2) + '. Round up: ' + c + ' buses.', { needStep: true }); }
    const len = ri(20, 60), car = pick([4.5, 5, 5.5, 6]); if (Number.isInteger(len / car)) return roundContext(l); const c = Math.floor(len / car); return nu(p('A parking strip is ' + len + ' m long. Every car needs ' + car + ' m. How many cars can park there at most?'), c, 'Divide. A car cannot park in half a space.', len + ' : ' + car + ' ≈ ' + rd(len / car, 2) + '. Round down: ' + c + ' cars.', { needStep: true });
  },
  function roundBounds(l) {
    const ask = Math.random() < .5;
    if (l >= 2) {   // spicy: rounded to thousands, or a length rounded to 1 decimal
      if (Math.random() < .5) { const r = ri(10, 99) * 1000, lo = r - 500, hi = r + 499; return nu(p('After rounding to <b>thousands</b>, a newspaper says ' + sp(r) + ' visitors came. What is the ' + (ask ? 'smallest' : 'largest') + ' possible real number of visitors?'), ask ? lo : hi, 'Which whole numbers round to ' + sp(r) + '?', 'All numbers from ' + sp(lo) + ' to ' + sp(hi) + ' round to ' + sp(r) + '. The ' + (ask ? 'smallest is ' + sp(lo) : 'largest is ' + sp(hi)) + '.'); }
      const r = rd(ri(12, 89) / 10, 1), lo = rd(r - .05, 2);
      return nu(p('A length is <b>' + r + ' m</b>, rounded to tenths of a metre. What is the smallest length (in m) that gives ' + r + ' m after rounding?'), lo, 'Which lengths round to ' + r + '? Look at the second decimal.', 'From ' + lo + ' m the length rounds up to ' + r + ' m. Lengths just below ' + lo + ' round to ' + rd(r - .1, 1) + '. The smallest is ' + lo + ' m.');
    }
    const r = ri(100, 999) * 100, lo = r - 50, hi = r + 49;
    return nu(p('After rounding to hundreds, a newspaper says ' + sp(r) + ' visitors came. What is the ' + (ask ? 'smallest' : 'largest') + ' possible real number of visitors?'), ask ? lo : hi, 'Which whole numbers round to ' + sp(r) + '?', 'All numbers from ' + sp(lo) + ' to ' + sp(hi) + ' round to ' + sp(r) + '. The ' + (ask ? 'smallest is ' + sp(lo) : 'largest is ' + sp(hi)) + '.');
  },
  function weightedMean(l) {
    if (l >= 2) {   // spicy: the mean of two groups together
      const n1 = ri(8, 20), n2 = ri(8, 20), m1 = rd(ri(40, 90) / 10, 1), m2 = rd(ri(40, 90) / 10, 1), t1 = rd(n1 * m1, 1), t2 = rd(n2 * m2, 1), m = rd((t1 + t2) / (n1 + n2), 1);
      if (m1 === m2) return weightedMean(l);
      return nu(p('Class A has ' + n1 + ' students. Their mean mark is ' + m1 + '. Class B has ' + n2 + ' students. Their mean mark is ' + m2 + '. Calculate the mean mark of all ' + (n1 + n2) + ' students together. <small>(Round to 1 decimal.)</small>'), m, 'You cannot just take the mean of ' + m1 + ' and ' + m2 + '. First calculate the total of all marks in each class.', p('class A: ' + n1 + ' · ' + m1 + ' = ' + t1) + p('class B: ' + n2 + ' · ' + m2 + ' = ' + t2) + p('mean = (' + t1 + ' + ' + t2 + ') : ' + (n1 + n2) + ' = ' + rd(t1 + t2, 1) + ' : ' + (n1 + n2) + (rd((t1 + t2) / (n1 + n2)) === m ? ' = ' : ' ≈ ') + m), { tol: .051, needStep: true });
    }
    const v = [ri(1, 4), ri(5, 9), ri(10, 14)], f = v.map(() => ri(2, 15)), tot = sum(v.map((x, i) => x * f[i])), N = sum(f), m = rd(tot / N, 1);
    return nu(p('In a bird count, ' + f[0] + ' people counted ' + v[0] + ' birds, ' + f[1] + ' people counted ' + v[1] + ' birds and ' + f[2] + ' people counted ' + v[2] + ' birds. Calculate the mean number of birds per person. <small>(Round to 1 decimal.)</small>'), m, 'Multiply each number by how many people counted it. Divide by the total number of people.', p(f.map((x, i) => x + ' · ' + v[i]).join(' + ') + ' = ' + tot) + p(f.join(' + ') + ' = ' + N) + p(tot + ' : ' + N + (rd(tot / N) === m ? ' = ' : ' ≈ ') + m), { tol: .051, needStep: true });
  }
];
XG['4.2'] = [
  function neededMark(l) {
    const n = 5, marks = Array.from({ length: n - 1 }, () => rd(ri(10, 18) / 2, 1)), target = 6.5, need = rd(n * target - sum(marks), 1);
    if (need < 1 || need > 10) return neededMark(l);
    return nu(p('A student has the marks ' + marks.join(', ') + '. There is one more test. The mean of the five marks must be at least 6.5 (so it rounds to a 7). What is the lowest mark needed on the last test?'), need, 'The five marks together must be at least 5 · 6.5.', '5 · 6.5 = 32.5<br>' + marks.join(' + ') + ' = ' + rd(sum(marks)) + '<br>32.5 − ' + rd(sum(marks)) + ' = ' + need, { needStep: true });
  }
];

/* ======================= 4.3 Ratios and scale ======================= */
G['4.3'] = [
  function simplifyRatio(l) {
    const a = ri(1, 9), b = ri(1, 12), k = ri(2, 12); if (gcd(a, b) !== 1 || a === b) return simplifyRatio(l);
    const right = a + ' : ' + b; return ch(p('Write the ratio ' + a * k + ' : ' + b * k + ' as simple as possible.'), right, [b + ' : ' + a, a * 2 + ' : ' + b * 2, (a + 1) + ' : ' + b, a + ' : ' + (b + 1)], 'Divide both numbers by the same number, as far as possible.', a * k + ' : ' + b * k + ' — divide both by ' + k + ' — = ' + right);
  },
  function partWhole(l) {
    let a, b; do { a = ri(1, 5); b = ri(1, 7); } while (gcd(a, b) !== 1); const tot = l === 0 ? (a + b) * ri(1, 4) : pick([1.5, 2, 3, 4.5]) * (a + b) / (l === 2 ? 1 : 1), part = rd(tot * a / (a + b), 3);
    return nu(p('Lemonade is made of syrup and water in the ratio ' + a + ' : ' + b + ' (syrup : water). How many litres of syrup are in ' + sp(tot) + ' litres of lemonade?'), part, 'The part-to-whole ratio of syrup is ' + a + ' : ' + (a + b) + '. So ' + a + '/' + (a + b) + ' of the lemonade is syrup.', 'part-to-whole ratio: ' + a + ' : ' + (a + b) + '<br>' + a + '/' + (a + b) + ' · ' + sp(tot) + ' = ' + sp(part) + ' litres', { needStep: true, tol: .001 });
  },
  function share(l) {
    const r = [ri(1, 3), ri(1, 4), ri(1, 5)], n = sum(r), tot = n * ri(25, 150), i = ri(0, 2), names = ['sugar', 'butter', 'flour'], amt = tot * r[i] / n;
    if (l >= 2) {   // spicy: you know one ingredient, find another one (or the total)
      let j = ri(0, 2); if (j === i || r[j] === r[i]) return share(l); const per = tot / n, toTot = Math.random() < .3, a2 = toTot ? tot : per * r[j];
      return nu(p('Cookie dough has sugar, butter and flour in the ratio ' + r.join(' : ') + '. You use <b>' + per * r[i] + ' grams of ' + names[i] + '</b>. How many grams of ' + (toTot ? 'dough do you make in total' : '<b>' + names[j] + '</b> do you need') + '?'), a2, names[i] + ' is ' + r[i] + ' part' + (r[i] > 1 ? 's' : '') + '. How many grams is 1 part?', '1 part = ' + per * r[i] + ' : ' + r[i] + ' = ' + per + ' g<br>' + (toTot ? 'total: ' + n + ' parts = ' + n + ' · ' + per + ' = ' + tot + ' g' : names[j] + ': ' + r[j] + ' · ' + per + ' = ' + a2 + ' g'), { needStep: true });
    }
    return nu(p('Cookie dough has sugar, butter and flour in the ratio ' + r.join(' : ') + '. You make ' + tot + ' grams of dough. How many grams of <b>' + names[i] + '</b> do you need?'), amt, 'Together there are ' + r.join(' + ') + ' = ' + n + ' parts.', r.join(' + ') + ' = ' + n + ' parts<br>1 part = ' + tot + ' : ' + n + ' = ' + tot / n + ' g<br>' + names[i] + ': ' + r[i] + ' · ' + tot / n + ' = ' + amt + ' g', { needStep: true });
  },
  function scaleMap(l) {
    const sc = pick([10000, 25000, 50000, 100000, 200000]), cm = l === 0 ? ri(2, 9) : rd(ri(15, 120) / 10, 1), km = rd(cm * sc / 100000), back = l === 2;
    if (back) return nu(p('On a map with scale 1 : ' + sp(sc) + ' two towns are ' + km + ' km apart in reality. How many cm is that on the map?'), cm, '1 cm on the map is ' + sp(sc) + ' cm = ' + sp(sc / 100000) + ' km in reality.', '1 cm ≙ ' + sp(sc) + ' cm = ' + sp(sc / 100000) + ' km<br>' + km + ' : ' + sp(sc / 100000) + ' = ' + cm + ' cm', { needStep: true });
    return nu(p('A map has scale 1 : ' + sp(sc) + '. Two towns are ' + cm + ' cm apart on the map. How many km is that in reality?'), km, '1 cm on the map is ' + sp(sc) + ' cm in reality. 1 km = 100 000 cm.', cm + ' · ' + sp(sc) + ' = ' + sp(rd(cm * sc)) + ' cm = ' + km + ' km', { needStep: true });
  },
  function findScale(l) {
    const real = pick([2, 3, 4, 5, 8]), k = pick([5, 10, 20, 25]), draw = real * k;
    if (l >= 2) { const km = pick([1.5, 2, 3, 4.5, 6, 7.5]), cm = pick([3, 4, 5, 6, 8, 10]), sc = km * 100000 / cm; if (!Number.isInteger(sc)) return findScale(l);   // spicy: a map, km and cm
      return nu(p('On a map, a road of ' + km + ' km is ' + cm + ' cm long. The scale of the map is 1 : … What number goes on the dots?'), sc, 'Use the same unit: write ' + km + ' km in cm (1 km = 100 000 cm).', km + ' km = ' + sp(km * 100000) + ' cm<br>' + sp(km * 100000) + ' : ' + cm + ' = ' + sp(sc) + '<br>The scale is 1 : ' + sp(sc) + '.', { needStep: true }); }
    return nu(p('A flea is ' + real + ' mm long. In a drawing it is ' + draw / 10 + ' cm long. The scale is … : 1. What number goes on the dots?'), k, 'Use the same unit: ' + draw / 10 + ' cm = ' + draw + ' mm. Then divide drawing by reality.', draw / 10 + ' cm = ' + draw + ' mm<br>' + draw + ' : ' + real + ' = ' + k + '<br>The scale is ' + k + ' : 1, so the answer is ' + k + '.');
  }
];
XG['4.3'] = [
  function whichSweeter(l) {
    let a1, b1, a2, b2; do { a1 = ri(1, 4); b1 = ri(3, 9); a2 = ri(1, 4); b2 = ri(3, 9); } while (a1 * (a2 + b2) === a2 * (a1 + b1) || a1 / b1 === a2 / b2);
    const s1 = a1 / (a1 + b1), s2 = a2 / (a2 + b2), right = s1 > s2 ? 'jug A' : 'jug B';
    return ch(p('Jug A has syrup and water in the ratio ' + a1 + ' : ' + b1 + '. Jug B has ' + a2 + ' : ' + b2 + '. Which lemonade is sweeter?'), right, [s1 > s2 ? 'jug B' : 'jug A', 'equally sweet'], 'Compare the part-to-whole ratios of syrup: ' + a1 + '/' + (a1 + b1) + ' and ' + a2 + '/' + (a2 + b2) + '.', 'A: ' + a1 + '/' + (a1 + b1) + ' ≈ ' + rd(s1, 3) + ', B: ' + a2 + '/' + (a2 + b2) + ' ≈ ' + rd(s2, 3) + '. ' + (s1 > s2 ? 'Jug A' : 'Jug B') + ' has more syrup per litre.');
  }
];

/* ======================= 4.4 Percentages ======================= */
G['4.4'] = [
  function fracToPercent(l) {
    const d = pick(l === 0 ? [2, 4, 5, 10, 20, 25, 50] : [8, 20, 25, 40, 50, 3]), n = ri(1, d - 1); const v = rd(n / d * 100, 2);
    if (d === 3) return ch(p('Write ' + n + '/3 as a percentage.'), n === 1 ? '33⅓%' : '66⅔%', n === 1 ? ['30%', '33%', '3%'] : ['60%', '66%', '23%'], 'n/3: divide by 3, then × 100%.', n + '/3 = ' + (n === 1 ? '33⅓' : '66⅔') + '/100 = ' + (n === 1 ? '33⅓%' : '66⅔%'));
    return nu(p('Write ' + n + '/' + d + ' as a percentage.'), v, 'Make the denominator 100, or divide and multiply by 100%.', n + '/' + d + ' = ' + n + ' : ' + d + ' = ' + rd(n / d, 4) + ' = ' + v + '%', { ansText: v + '%' });
  },
  function percentOf(l) {
    const pc = l === 0 ? pick([10, 20, 25, 50, 5]) : pick([15, 35, 12, 7.5, 40, 3]), a = l === 0 ? ri(2, 30) * 20 : ri(10, 200) * 4, r = rd(pc * a / 100);
    return nu(p('Calculate ' + pc + '% of ' + a + '.'), r, pc + '% = ' + pc + '/100 = ' + rd(pc / 100) + '. Multiply by ' + a + '.', rd(pc / 100) + ' × ' + a + ' = ' + sp(r), { needStep: true });
  },
  function discount(l) {
    const pr = ri(4, 90) * 10, pc = pick([10, 15, 20, 25, 30, 40]), d = rd(pr * pc / 100), pay = rd(pr - d), askPay = l > 0 || Math.random() < .5;
    return nu(p('A bike costs £' + pr + '. You get ' + pc + '% discount. ' + (askPay ? 'How much do you pay?' : 'How much is the discount?')), askPay ? pay : d, askPay ? 'Calculate the discount and subtract it. Or: you pay ' + (100 - pc) + '% of the price.' : pc + '% of ' + pr + '.', 'discount = ' + pc + '/100 × ' + pr + ' = ' + d + (askPay ? '<br>you pay ' + pr + ' − ' + d + ' = ' + pay : ''), { needStep: true });
  },
  function vat(l) {
    const pr = ri(5, 80) * 10, pc = pick([9, 21]), v = rd(pr * pc / 100), tot = rd(pr + v);
    if (l >= 2) {   // spicy: a discount first, then VAT
      const dc = pick([10, 15, 20, 25]), d = rd(pr * dc / 100, 2), net = rd(pr - d, 2), v2 = rd(net * pc / 100, 2), t2 = rd(net + v2, 2);
      return nu(p('A product costs £' + pr + ' without VAT. In the sale you get <b>' + dc + '% discount</b> on this price. Then ' + pc + '% VAT is added. What do you pay? <small>(Round to 2 decimals.)</small>'), t2, 'First calculate the price after the discount. Then add the VAT to that new price.', 'discount = ' + dc + '/100 × ' + pr + ' = ' + d + '<br>new price = ' + pr + ' − ' + d + ' = ' + net + '<br>VAT = ' + pc + '/100 × ' + net + ' = ' + v2 + '<br>you pay ' + net + ' + ' + v2 + ' = ' + t2, { needStep: true, tol: .0051 });
    }
    return nu(p('A product costs £' + pr + ' without VAT. The VAT is ' + pc + '%. What is the price including VAT?'), tot, 'Calculate the VAT and add it. Or: multiply by ' + rd(1 + pc / 100) + '.', 'VAT = ' + pc + '/100 × ' + pr + ' = ' + v + '<br>price = ' + pr + ' + ' + v + ' = ' + tot, { needStep: true });
  },
  function whatPercent(l) {
    if (l >= 2) {   // spicy: not a nice percentage, round
      const tot = ri(110, 380), part = ri(Math.round(tot * .1), Math.round(tot * .9)), pc = rd(part / tot * 100, 1); if (Number.isInteger(part / tot * 100)) return whatPercent(l);
      return nu(p(part + ' of the ' + tot + ' students passed their exams. What percentage is that? <small>(Round to 1 decimal.)</small>'), pc, 'part / whole × 100%.', part + '/' + tot + ' × 100% ≈ ' + pc + '%', { needStep: true, tol: .051, ansText: pc + '%' });
    }
    const tot = pick([20, 25, 40, 50, 80, 120, 180, 200]), pc = pick([10, 15, 20, 25, 30, 45, 60, 75, 90, 95].filter(q => Number.isInteger(tot * q / 100))), part = tot * pc / 100;
    return nu(p(part + ' of the ' + tot + ' students passed their exams. What percentage is that?'), pc, 'part / whole × 100%.', part + '/' + tot + ' × 100% = ' + rd(part / tot) + ' × 100% = ' + pc + '%', { needStep: true, ansText: pc + '%' });
  }
];
XG['4.4'] = [
  function backToWhole(l) {
    const pc = pick([75, 60, 80, 40, 25]), whole = pick([20, 40, 60, 80, 120]), part = whole * pc / 100, one = part / pc;
    return nu(p('You paid £' + part + ' after a discount. That is ' + pc + '% of the original price. What was the original price?'), whole, pc + '% is ' + part + '. First find 1%, then 100%.', '1% = ' + part + ' : ' + pc + ' = ' + rd(one) + '<br>100% = ' + rd(one) + ' × 100 = ' + whole, { needStep: true });
  }
];

/* ======================= 4.5 Diagrams ======================= */
G['4.5'] = [
  function pieAngle(l) {
    const tot = pick([20, 24, 36, 40, 60, 72, 90, 120]), part = ri(1, tot - 1), ang = rd(part / tot * 360, 1);
    if (l === 0 && !Number.isInteger(ang)) return pieAngle(l);
    if (l >= 2) {   // spicy: from the angle back to the number of students
      const t2 = pick([24, 30, 36, 40, 45, 60, 72, 90]), k = ri(1, t2 - 1), a2 = k * 360 / t2; if (!Number.isInteger(a2)) return pieAngle(l);
      return nu(p('In a survey, ' + t2 + ' students chose their favourite island. In the pie chart the Texel sector has an angle of <b>' + a2 + '°</b>. How many students chose Texel?'), k, 'The whole circle (360°) stands for all ' + t2 + ' students.', a2 + '/360 × ' + t2 + ' = ' + k + ' students', { needStep: true });
    }
    return nu(p('In a class survey, ' + part + ' of the ' + tot + ' students chose Texel. Calculate the angle of the Texel sector in a pie chart. <small>(Round to 1 decimal.)</small>'), ang, 'The whole circle is 360°. The part is ' + part + '/' + tot + ' of the circle.', part + '/' + tot + ' × 360°' + (Number.isInteger(ang) ? ' = ' : ' ≈ ') + ang + '°', { needStep: true, tol: .051, ansText: ang + '°' });
  },
  function percentAngle(l) {
    const pc = l === 0 ? pick([10, 25, 50, 20, 5]) : ri(3, 60), ang = rd(pc * 3.6, 1);
    return nu(p('A sector of a pie chart is ' + pc + '%. Calculate its angle.'), ang, '100% is 360°, so 1% is 3.6°.', pc + ' × 3.6° = ' + ang + '°', { ansText: ang + '°' });
  },
  function angleToCount(l) {
    const tot = pick([360, 720, 1800, 5000000, 1200]), ang = pick([30, 45, 60, 72, 90, 120, 40, 82]), n = rd(tot * ang / 360);
    if (l >= 2) { const t2 = pick([360, 720, 1800, 1200]), a1 = pick([72, 90, 120, 135]), a2 = pick([30, 45, 60]), dd = t2 * (a1 - a2) / 360; if (!Number.isInteger(dd)) return angleToCount(l);   // spicy: compare two sectors
      return nu(p('A pie chart shows ' + sp(t2) + ' members of sports clubs. The football sector has an angle of ' + a1 + '° and the hockey sector ' + a2 + '°. How many <b>more</b> members play football than hockey?'), dd, 'The difference of the two angles stands for the difference in members.', (a1 - a2) + '/360 × ' + sp(t2) + ' = ' + sp(dd), { needStep: true }); }
    if (!Number.isInteger(n) && tot < 10000) return angleToCount(l);
    return nu(p('A pie chart shows ' + sp(tot) + ' members of sports clubs. The football sector has an angle of ' + ang + '°. About how many members play football?' + (Number.isInteger(n) ? '' : ' <small>(Round to a whole number.)</small>')), Math.round(n), 'The part is ' + ang + '/360 of the whole.', ang + '/360 × ' + sp(tot) + (Number.isInteger(n) ? ' = ' : ' ≈ ') + sp(Math.round(n)), { needStep: true, tol: .5 });
  },
  function barRead(l) {
    const labs = ['Q1', 'Q2', 'Q3', 'Q4'], vals = labs.map(() => ri(2, 14)), k = l === 0 ? 0 : l === 1 ? ri(0, 1) : 2;
    const fig = bars(labs, vals, 2);
    if (k === 0) return nu(p('The bar chart shows the number of e-bikes a shop sold in each quarter. How many e-bikes were sold in total?') + fig, sum(vals), 'Read every bar and add.', vals.join(' + ') + ' = ' + sum(vals));
    if (k === 1) { let i, j; do { i = ri(0, 3); j = ri(0, 3); } while (i === j || vals[i] === vals[j]); return nu(p('How many more e-bikes were sold in ' + labs[Math.max(vals[i], vals[j]) === vals[i] ? i : j] + ' than in ' + labs[Math.max(vals[i], vals[j]) === vals[i] ? j : i] + '?') + fig, Math.abs(vals[i] - vals[j]), 'Read both bars and subtract.', Math.max(vals[i], vals[j]) + ' − ' + Math.min(vals[i], vals[j]) + ' = ' + Math.abs(vals[i] - vals[j])); }
    const pc = rd(Math.max(...vals) / sum(vals) * 100, 1); return nu(p('What percentage of all e-bikes was sold in the best quarter? <small>(Round to 1 decimal.)</small>') + fig, pc, 'part / total × 100%.', 'best quarter: ' + Math.max(...vals) + ', total: ' + sum(vals) + '<br>' + Math.max(...vals) + '/' + sum(vals) + ' × 100% ≈ ' + pc + '%', { tol: .051, needStep: true });
  },
  function whichDiagram(l) {
    const C = [['You want to show how the temperature changes during a year.', 'line graph'], ['You want to show which part of the whole each group is.', 'pie chart'], ['You want to compare the number of pets of different kinds.', 'bar chart'], ['You want to show how a plant grows week after week.', 'line graph'], ['You want to show the shares of the votes for each party.', 'pie chart']];
    const c = pick(C);
    return ch(p(c[0] + ' Which diagram fits best?'), c[1], ['line graph', 'pie chart', 'bar chart'].filter(x => x !== c[1]), 'A line graph shows change over time. A pie chart shows parts of a whole. A bar chart compares groups.', 'A ' + c[1] + ' fits best.');
  }
];
XG['4.5'] = [];

/* ======================= 4.6 Graphs ======================= */
function temps() { const base = ri(1, 4), amp = ri(12, 16); return MON.map((m, i) => Math.round(base + amp * Math.sin((i - 3) / 12 * 2 * Math.PI) / 2 + amp / 2)); }
G['4.6'] = [
  function readLine(l) {
    const v = temps(), i = ri(0, 11);
    return nu(p('The line graph shows the average temperature (°C) in a town. What was the temperature in ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i] + '?') + lineGraph(v, 2, '°C'), v[i], 'Find the month on the horizontal axis. Go up to the graph and read the value on the vertical axis.', 'In ' + MON[i] + ' the graph is at ' + v[i] + ' °C.');
  },
  function maxRise(l) {
    const v = temps(); let best = 0, bi = 0; for (let i = 0; i < 11; i++) { const d = v[i + 1] - v[i]; if (d > best) { best = d; bi = i; } }
    if (v.filter((x, i) => i < 11 && v[i + 1] - x === best).length > 1) return maxRise(l);
    const right = MON[bi] + ' to ' + MON[bi + 1], wr = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(i => i !== bi)).slice(0, 3).map(i => MON[i] + ' to ' + MON[i + 1]);
    return ch(p('Between which two months does the temperature rise the most?') + lineGraph(v, 2, '°C'), right, wr, 'Look for the steepest rising part of the graph. Or calculate the differences.', 'From ' + MON[bi] + ' to ' + MON[bi + 1] + ' the temperature rises ' + v[bi + 1] + ' − ' + v[bi] + ' = ' + best + ' °C. That is the largest rise.');
  },
  function riseFall(l) {
    const v = temps(); let i; do { i = ri(0, 10); } while (v[i + 1] === v[i]);
    const right = v[i + 1] > v[i] ? 'it rises' : 'it falls';
    return ch(p('What does the graph do from ' + MON[i] + ' to ' + MON[i + 1] + '?') + lineGraph(v, 2, '°C'), right, ['it rises', 'it falls', 'it is constant'].filter(x => x !== right), 'Rises: the values get bigger. Falls: they get smaller. Constant: they stay the same.', MON[i] + ': ' + v[i] + ' °C, ' + MON[i + 1] + ': ' + v[i + 1] + ' °C, so ' + right + '.');
  },
  function axisChoice(l) {
    const C = [['month', 'number of flip-flops sold'], ['time in hours', 'distance travelled'], ['year', 'number of inhabitants'], ['age of a child', 'height of the child']];
    const opts = pick(C), c = ['the ' + opts[0] + ' and the ' + opts[1]];
    return ch(p('You draw a graph of ' + c[0] + '. What goes on the <b>horizontal</b> axis?'), 'the ' + opts[0], ['the ' + opts[1]], 'Time (or the thing you choose) goes on the horizontal axis. What you measure goes on the vertical axis.', 'The ' + opts[0] + ' goes on the horizontal axis.');
  }
];
XG['4.6'] = [];

/* ---------- extra challenge items (Extra spicy) ---------- */
XG['4.9'] = [
  function meanFixError(l) {
    const n = ri(6, 12), m = rd(ri(55, 75) / 10, 1), tot = rd(n * m, 1), wrong = ri(2, 4), right = ri(7, 10), nt = rd(tot - wrong + right, 1), nm = rd(nt / n, 2);
    return nu(p('The mean of ' + n + ' test marks is ' + m + '. Later the teacher sees that one mark was typed in wrong: it is not a ' + wrong + ' but a ' + right + '. What is the correct mean? <small>(Round to 2 decimals.)</small>'), nm, 'First calculate the total of all marks. Then correct the total.', 'total = ' + n + ' · ' + m + ' = ' + tot + '<br>new total = ' + tot + ' − ' + wrong + ' + ' + right + ' = ' + nt + '<br>mean = ' + nt + ' : ' + n + ' ≈ ' + nm, { needStep: true, tol: .0051 });
  },
  function ratioAdd(l) {
    let a, b; do { a = ri(1, 4); b = ri(2, 7); } while (gcd(a, b) !== 1 || a >= b); const k = ri(3, 8), r = a * k, bl = b * k, c = pick([[1, 1], [2, 3], [3, 4], [1, 2]].filter(q => q[0] * b > q[1] * a && (q[0] * bl) % q[1] === 0 && q[0] * bl / q[1] > r));
    if (!c) return ratioAdd(l); const need = c[0] * bl / c[1] - r;
    return nu(p('A bag has red and blue marbles in the ratio ' + a + ' : ' + b + '. There are ' + (r + bl) + ' marbles in the bag. How many <b>red</b> marbles must you add to make the ratio red : blue = ' + c[0] + ' : ' + c[1] + '?'), need, 'First find how many red and blue marbles there are now. The number of blue marbles does not change.', (a + b) + ' parts = ' + (r + bl) + ', 1 part = ' + k + '<br>red ' + r + ', blue ' + bl + '<br>red : ' + bl + ' = ' + c[0] + ' : ' + c[1] + ' → red = ' + (c[0] * bl / c[1]) + '<br>add ' + (c[0] * bl / c[1]) + ' − ' + r + ' = ' + need, { needStep: true });
  },
  function doubleDiscount(l) {
    const pr = pick([40, 60, 80, 120, 150, 200, 250]), d1 = pick([20, 25, 30, 40]), d2 = pick([10, 20, 25]), pay = rd(pr * (1 - d1 / 100) * (1 - d2 / 100), 2), tot = rd(100 - pay / pr * 100, 2);
    return nu(p('A jacket costs £' + pr + '. In the sale you get ' + d1 + '% discount. On the last day you get another ' + d2 + '% off the <b>sale price</b>. How many percent discount is that in total, compared with the original price?'), tot, 'It is not ' + d1 + ' + ' + d2 + ' = ' + (d1 + d2) + '%. Calculate what you pay at the end.', 'sale price = ' + (100 - d1) + '% of ' + pr + ' = ' + rd(pr * (1 - d1 / 100), 2) + '<br>last day = ' + (100 - d2) + '% of that = ' + pay + '<br>discount = ' + pr + ' − ' + pay + ' = ' + rd(pr - pay, 2) + '<br>' + rd(pr - pay, 2) + '/' + pr + ' × 100% = ' + tot + '%', { needStep: true, tol: .051, ansText: tot + '%' });
  },
  function pieMissing(l) {
    const tot = pick([36, 40, 45, 60, 72, 90, 120]), a = [pick([90, 120, 72, 60]), pick([45, 30, 36, 54, 80])], cnt = a.map(x => x * tot / 360);
    if (cnt.some(x => !Number.isInteger(x))) return pieMissing(l); const c = ri(2, Math.floor(tot / 6)), rest = tot - cnt[0] - cnt[1] - c; if (rest < 1) return pieMissing(l); const ang = rd(rest / tot * 360, 1);
    return nu(p(tot + ' students chose a sport: football, hockey, tennis or swimming. In the pie chart the football sector is ' + a[0] + '° and the hockey sector is ' + a[1] + '°. ' + c + ' students chose tennis. The rest chose swimming. Calculate the angle of the swimming sector. <small>(Round to 1 decimal.)</small>'), ang, 'First calculate how many students chose football and hockey.', 'football: ' + a[0] + '/360 × ' + tot + ' = ' + cnt[0] + '<br>hockey: ' + a[1] + '/360 × ' + tot + ' = ' + cnt[1] + '<br>swimming: ' + tot + ' − ' + cnt[0] + ' − ' + cnt[1] + ' − ' + c + ' = ' + rest + '<br>' + rest + '/' + tot + ' × 360° ' + (Number.isInteger(ang) ? '= ' : '≈ ') + ang + '°', { needStep: true, tol: .051, ansText: ang + '°' });
  },
  function barGrowth(l) {
    const labs = ['2021', '2022', '2023', '2024'], vals = labs.map(() => ri(3, 14) * 2); if (vals[3] <= vals[0]) return barGrowth(l); const pc = rd((vals[3] - vals[0]) / vals[0] * 100, 1);
    return nu(p('The bar chart shows how many members (× 10) a chess club had. By how many percent did the number of members grow from 2021 to 2024? <small>(Round to 1 decimal.)</small>') + bars(labs, vals, 4), pc, 'growth / old value × 100%.', '2021: ' + vals[0] + ', 2024: ' + vals[3] + '<br>growth = ' + (vals[3] - vals[0]) + '<br>' + (vals[3] - vals[0]) + '/' + vals[0] + ' × 100% ≈ ' + pc + '%', { needStep: true, tol: .051, ansText: pc + '%' });
  },
  function meanFromGraph(l) {
    const v = temps(), s = ri(0, 8), m = rd((v[s] + v[s + 1] + v[s + 2] + v[s + 3]) / 4, 2);
    return nu(p('The line graph shows the average temperature (°C) in a town. Calculate the mean temperature of the four months ' + MON[s] + ' to ' + MON[s + 3] + '. <small>(Round to 2 decimals.)</small>') + lineGraph(v, 2, '°C'), m, 'Read the four values. Add them and divide by 4.', v.slice(s, s + 4).join(' + ') + ' = ' + (v[s] + v[s + 1] + v[s + 2] + v[s + 3]) + '<br>' + (v[s] + v[s + 1] + v[s + 2] + v[s + 3]) + ' : 4 = ' + m, { needStep: true, tol: .0051 });
  },
  function monthsAbove(l) {
    const v = temps(), t = ri(Math.min(...v) + 3, Math.max(...v) - 3), n = v.filter(x => x > t).length, d = Math.max(...v) - Math.min(...v);
    if (Math.random() < .5) return nu(p('The line graph shows the average temperature (°C) in a town. In how many months is it <b>warmer than ' + t + ' °C</b>?') + lineGraph(v, 2, '°C'), n, 'Imagine a horizontal line at ' + t + ' °C. Count the points above it (not on it).', 'Above ' + t + ' °C: ' + MON.filter((mm, i) => v[i] > t).join(', ') + ' → ' + n + ' months');
    return nu(p('The line graph shows the average temperature (°C) in a town. How many degrees is the difference between the warmest and the coldest month?') + lineGraph(v, 2, '°C'), d, 'Find the highest and the lowest point.', 'warmest ' + Math.max(...v) + ' °C, coldest ' + Math.min(...v) + ' °C<br>' + Math.max(...v) + ' − ' + Math.min(...v) + ' = ' + d);
  }
];

/* the book's paragraphs: 4.1 Data, 4.2 Ratios, 4.3 Percentages, 4.4 Graphs and charts, 4.5 Relationships and graphs */
const by = (L, names) => names.map(n => L.find(f => f.name === n));
const ALL = [].concat(...Object.values(G)), ALLX = [].concat(...Object.values(XG));
G['4.1'] = by(ALL, ['tableMean', 'listMean', 'totalFreq', 'missingValue', 'roundNumber', 'roundContext', 'roundBounds', 'weightedMean']);
G['4.2'] = by(ALL, ['simplifyRatio', 'partWhole', 'share', 'scaleMap', 'findScale']);
G['4.3'] = by(ALL, ['fracToPercent', 'percentOf', 'discount', 'vat', 'whatPercent']);
G['4.4'] = by(ALL, ['pieAngle', 'percentAngle', 'angleToCount', 'barRead', 'whichDiagram', 'readLine']);
G['4.5'] = by(ALL, ['maxRise', 'riseFall', 'axisChoice']); delete G['4.6'];
XG['4.1'] = by(ALLX, ['neededMark', 'meanFixError']); XG['4.2'] = by(ALLX, ['whichSweeter', 'ratioAdd']); XG['4.3'] = by(ALLX, ['backToWhole', 'doubleDiscount']); XG['4.4'] = by(ALLX, ['pieMissing', 'barGrowth']); XG['4.5'] = by(ALLX, ['meanFromGraph', 'monthsAbove']); delete XG['4.6']; delete XG['4.9'];
const SECTIONS = [
  { id: '4.1', title: '4.1 Data', sub: 'Frequency tables, the mean, rounding' },
  { id: '4.2', title: '4.2 Ratios', sub: 'Simplifying, part-to-whole ratio, sharing, scale' },
  { id: '4.3', title: '4.3 Percentages', sub: 'Fractions as percentages, discount, VAT' },
  { id: '4.4', title: '4.4 Graphs and charts', sub: 'Bar charts, pie charts, line graphs' },
  { id: '4.5', title: '4.5 Relationships and graphs', sub: 'Rising and falling, which axis' }
];
const GOALS = [
  ['4.1', 'I can use a frequency table and calculate the mean', ['tableMean', 'listMean', 'totalFreq', 'missingValue', 'weightedMean'], 'mean = total : number of values'],
  ['4.1', 'I can round numbers and decide to round up or down', ['roundNumber', 'roundContext', 'roundBounds'], '5 or more: round up.'],
  ['4.2', 'I can calculate with ratios and scale', ['simplifyRatio', 'partWhole', 'share', 'scaleMap', 'findScale'], 'Scale 1 : 100 000 means 1 cm is 1 km.'],
  ['4.3', 'I can calculate with percentages', ['fracToPercent', 'percentOf', 'discount', 'vat', 'whatPercent'], 'percentage = part / whole × 100%'],
  ['4.4', 'I can read and make bar charts, pie charts and line graphs', ['pieAngle', 'percentAngle', 'angleToCount', 'barRead', 'whichDiagram', 'readLine'], '1% of a pie chart is 3.6°.'],
  ['4.5', 'I can describe a relationship with a graph', ['maxRise', 'riseFall', 'axisChoice'], 'Time goes on the horizontal axis.']
];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "1HVT": [
      {"id": "D1", "title": "Lesson · 4.1 A Data", "sub": "Thu 10 Dec · ex 1, 2, 6, 7, 8, 9", "date": "2026-12-10", "gens": [["4.1", "tableMean"], ["4.1", "listMean"], ["4.1", "totalFreq"]], "xg": [["4.1", "neededMark"]]},
      {"id": "D2", "title": "Lesson · 4.1 B Data", "sub": "Fri 11 Dec · ex 10, 11, 12, 13, 14", "date": "2026-12-11", "gens": [["4.1", "listMean"], ["4.1", "totalFreq"], ["4.1", "missingValue"]], "xg": [["4.1", "neededMark"]]},
      {"id": "D3", "title": "Lesson · 4.1 C Data", "sub": "Tue 15 Dec · ex 15, 16, 17, 18, 19", "date": "2026-12-15", "gens": [["4.1", "missingValue"], ["4.1", "roundNumber"], ["4.1", "roundContext"]], "xg": [["4.1", "neededMark"]]},
      {"id": "D4", "title": "Lesson · 4.1 Data + 4.2 Ratios", "sub": "Wed 16 Dec · ex 20, 21, 25, 26, 27", "date": "2026-12-16", "gens": [["4.1", "roundNumber"], ["4.1", "roundContext"], ["4.1", "roundBounds"], ["4.2", "simplifyRatio"], ["4.2", "partWhole"], ["4.2", "share"]], "xg": [["4.1", "neededMark"], ["4.2", "whichSweeter"]]},
      {"id": "D5", "title": "Lesson · 4.2 A Ratios", "sub": "Thu 17 Dec · ex 28, 29, 30, 31, 32", "date": "2026-12-17", "gens": [["4.2", "simplifyRatio"], ["4.2", "partWhole"], ["4.2", "share"]], "xg": [["4.2", "whichSweeter"]]},
      {"id": "D6", "title": "Lesson · 4.2 B Ratios", "sub": "Tue 5 Jan · ex 33, 34, 35, 36, 37, 38", "date": "2027-01-05", "gens": [["4.2", "partWhole"], ["4.2", "share"], ["4.2", "scaleMap"]], "xg": [["4.2", "whichSweeter"]]},
      {"id": "D7", "title": "Lesson · 4.2 Ratios + 4.3 Percentages", "sub": "Wed 6 Jan · ex 39, 40, 43, 44, 45", "date": "2027-01-06", "gens": [["4.2", "share"], ["4.2", "scaleMap"], ["4.2", "findScale"], ["4.3", "fracToPercent"], ["4.3", "percentOf"], ["4.3", "discount"]], "xg": [["4.2", "whichSweeter"], ["4.3", "backToWhole"]]},
      {"id": "D8", "title": "Lesson · 4.3 A Percentages", "sub": "Thu 7 Jan · ex 46, 47, 48, 49, 50", "date": "2027-01-07", "gens": [["4.3", "fracToPercent"], ["4.3", "percentOf"], ["4.3", "discount"]], "xg": [["4.3", "backToWhole"]]},
      {"id": "D9", "title": "Lesson · 4.3 B Percentages", "sub": "Fri 8 Jan · ex 51, 52, 53, 54, 55", "date": "2027-01-08", "gens": [["4.3", "fracToPercent"], ["4.3", "percentOf"], ["4.3", "discount"]], "xg": [["4.3", "backToWhole"]]},
      {"id": "D10", "title": "Lesson · 4.3 C Percentages", "sub": "Tue 12 Jan · ex 56, 57, 58, 59, 60", "date": "2027-01-12", "gens": [["4.3", "percentOf"], ["4.3", "discount"], ["4.3", "vat"]], "xg": [["4.3", "backToWhole"]]},
      {"id": "D11", "title": "Lesson · 4.3 D Percentages", "sub": "Wed 13 Jan · ex 61, 62, 63, 68", "date": "2027-01-13", "gens": [["4.3", "discount"], ["4.3", "vat"], ["4.3", "whatPercent"]], "xg": [["4.3", "backToWhole"]]},
      {"id": "D12", "title": "Lesson · 4.4 A Graphs and charts", "sub": "Fri 15 Jan · ex 69, 70, 71, 72, 73", "date": "2027-01-15", "gens": [["4.4", "pieAngle"], ["4.4", "percentAngle"], ["4.4", "angleToCount"]], "xg": []},
      {"id": "D13", "title": "Lesson · 4.4 B Graphs and charts", "sub": "Tue 19 Jan · ex 74, 75, 76, 77", "date": "2027-01-19", "gens": [["4.4", "angleToCount"], ["4.4", "barRead"], ["4.4", "whichDiagram"]], "xg": []},
      {"id": "D14", "title": "Lesson · 4.5 A Relationships and graphs", "sub": "Wed 20 Jan · ex 82, 83, 84, 85, 86", "date": "2027-01-20", "gens": [["4.5", "maxRise"], ["4.5", "riseFall"], ["4.5", "axisChoice"]], "xg": []},
      {"id": "D15", "title": "Lesson · 4.5 B Relationships and graphs", "sub": "Thu 21 Jan · ex 87, 88, 89, 90, 91", "date": "2027-01-21", "gens": [["4.5", "maxRise"], ["4.5", "riseFall"], ["4.5", "axisChoice"]], "xg": []},
      {"id": "D16", "title": "Test prep · chapter 4", "sub": "Tue 26 Jan · ex 96, 98, 100, 102, 104, 106, 108", "date": "2027-01-26", "gens": [["4.1", "tableMean"], ["4.1", "listMean"], ["4.1", "totalFreq"], ["4.1", "missingValue"], ["4.1", "roundNumber"], ["4.1", "roundContext"], ["4.1", "roundBounds"], ["4.1", "weightedMean"], ["4.2", "simplifyRatio"], ["4.2", "partWhole"], ["4.2", "share"], ["4.2", "scaleMap"], ["4.2", "findScale"], ["4.3", "fracToPercent"], ["4.3", "percentOf"], ["4.3", "discount"], ["4.3", "vat"], ["4.3", "whatPercent"], ["4.4", "pieAngle"], ["4.4", "percentAngle"], ["4.4", "angleToCount"], ["4.4", "barRead"], ["4.4", "whichDiagram"], ["4.4", "readLine"], ["4.5", "maxRise"], ["4.5", "riseFall"], ["4.5", "axisChoice"]], "xg": [["4.1", "neededMark"], ["4.2", "whichSweeter"], ["4.3", "backToWhole"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: [...new Set(o.gens.map(g => g[0]))].reduce((a, s) => a.concat((XG[s] || []).map(f => [s, f.name])), []) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-1hvt-ch4-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['roundNumber', 'whichDiagram', 'axisChoice', 'percentAngle', 'fracToPercent', 'simplifyRatio', 'readLine'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
