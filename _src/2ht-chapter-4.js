const { ri, pick, shuffle, nz, f, gcd, M, fr, fmtNum, ratText, tbl } = NX;
const LR = (l, lo, hi) => { const s = hi - lo; if (s < 1 || l === undefined || l === 'mix') return ri(lo, hi); l = Math.min(l, 2); const a = l === 0 ? lo : l === 1 ? lo + Math.floor(s * .25) : lo + Math.floor(s * .5); const b = l === 0 ? lo + Math.max(1, Math.ceil(s * .5)) : l === 1 ? hi - Math.floor(s * .15) : hi + Math.ceil(s * .4); return ri(a, b); };
const PL = (l, arr) => { const n = arr.length; if (l === undefined || l === 'mix') return pick(arr); l = Math.min(l, 2); const k = Math.max(2, Math.ceil(n * .6)); return pick(l === 0 ? arr.slice(0, k) : l === 1 ? arr.slice(Math.floor((n - k) / 2), Math.floor((n - k) / 2) + k + 1) : arr.slice(n - k)); };
const ch = (html, right, wrongs, hint, steps, extra) => { let o = [right]; wrongs.forEach(w => { if (!o.includes(w)) o.push(w); }); const opts = shuffle(o); return Object.assign({ type: 'choice', opts, ans: opts.indexOf(right), html, hint, steps }, extra || {}); };
const ex = (html, ans, form, hint, steps, extra) => Object.assign({ type: 'expr', html, ans, form, hint, steps }, extra || {});
const nu = (html, ans, hint, steps, extra) => Object.assign({ type: 'num', html, ans, hint, steps }, extra || {});
const p = x => '<p>' + x + '</p>';
const G = {}, XG = {};

/* ---------- helpers ---------- */
const KEYS = ['/', '·', '(', ')', '+', '−', '^'];
const must = (a, b) => { if (Math.abs(a - b) > 1e-9) throw new Error('consistency check failed: ' + a + ' vs ' + b); };
const frq = (html, n, d, hint, steps, extra) => ex(html, ratText(n, d), 'frac', hint, steps, Object.assign({ keys: KEYS }, extra || {}));
const fl = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : fr(n, d); };   // reduced stacked fraction
const dec = x => String(Math.round(x * 1e6) / 1e6);
const thou = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const Cn = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
const fact = n => n <= 1 ? 1 : n * fact(n - 1);
const times = a => a.join(' · ');
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const isPr = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const isSq = n => Number.isInteger(Math.sqrt(n));
const ordinal = n => ['', 'first', 'second', 'third', 'fourth'][n];

/* ---------- SVG helpers ---------- */
const svg = (w, h, body) => '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" role="img" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
const sfrac = (x, y, n, d, fs, anchor) => {   // stacked fraction centred at x (y = baseline of the fraction bar)
  fs = fs || 12; const w = Math.max(String(n).length, String(d).length) * fs * .62 + 4;
  return '<g font-size="' + fs + '" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:3px"><text x="' + x + '" y="' + (y - 3) + '">' + n + '</text><line x1="' + (x - w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + y + '" stroke="#223" stroke-width="1"/><text x="' + x + '" y="' + (y + fs) + '">' + d + '</text></g>';
};
const lab = (s, x, y, fs, anchor, bold) => '<text x="' + x + '" y="' + y + '" font-size="' + (fs || 13) + '" text-anchor="' + (anchor || 'start') + '"' + (bold ? ' font-weight="700"' : '') + ' fill="#17222d">' + s + '</text>';
/* Tree diagram. o.stages: [[outcome labels of stage 1], [stage 2], ...] (same branches at every node)
   o.edge(stage, path, b) -> 'a/b' | '0.7' | ''   label on that branch; o.leaf(path) -> text after the leaf; o.leafP(path) -> 'a/b' | '0.343' | '' */
function treeSVG(o) {
  const S = o.stages, dx = o.dx || 118, dy = o.dy || 52, x0 = 16, top = 16;
  const nL = S.reduce((a, s) => a * s.length, 1), H = nL * dy + 2 * top, W = x0 + S.length * dx + (o.leafW || 150);
  let body = '', li = 0;
  function node(stage, path, x) {
    if (stage === S.length) { const y = top + dy * (li++ + .5); const t = o.leaf ? o.leaf(path) : ''; const lp = o.leafP ? o.leafP(path) : '';
      let s = lab(t, x + 10, y + 4, 13, 'start', true);
      if (lp) { const tx = x + 14 + t.length * 8.5 + 6; s += lab('=', tx, y + 4, 12) + (/^\d+\/\d+$/.test(lp) ? sfrac(tx + 24, y + 1, lp.split('/')[0], lp.split('/')[1], 11) : lab(lp, tx + 12, y + 4, 12)); }
      body += s; return y; }
    const ys = []; S[stage].forEach((lb, b) => { ys.push(node(stage + 1, path.concat(lb), x + dx)); });
    const y = ys.reduce((a, c) => a + c, 0) / ys.length;
    S[stage].forEach((lb, b) => {
      const cy = ys[b]; body += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + dx) + '" y2="' + cy + '" stroke="#5b6b7a" stroke-width="1.8"/>';
      const el = o.edge ? o.edge(stage, path, b) : ''; const mx = x + dx * .52, my = y + (cy - y) * .52;
      const up = b < S[stage].length / 2, oy = up ? -16 : 22;
      body += lab(lb, mx - 22, my + oy + 4, 13, 'middle', true);
      if (el) body += /^\d+\/\d+$/.test(el) ? sfrac(mx + 6, my + oy, el.split('/')[0], el.split('/')[1], 11) : lab(el, mx + 6, my + oy + 4, 12, 'middle');
    });
    body += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#1b5fa8"/>'; return y;
  }
  const ry = node(0, [], x0); return svg(W, H, body);
}
function vennSVG(a, both, b, out, nA, nB, hide) {
  hide = hide || []; const v = (k, val) => hide.includes(k) ? '?' : val;
  return svg(320, 170, '<rect x="4" y="4" width="312" height="162" rx="6" fill="#fff" stroke="#5b6b7a" stroke-width="1.5"/>' +
    '<circle cx="125" cy="88" r="58" fill="rgba(27,95,168,.15)" stroke="#1b5fa8" stroke-width="2"/><circle cx="195" cy="88" r="58" fill="rgba(209,71,31,.15)" stroke="#d1471f" stroke-width="2"/>' +
    lab(nA, 100, 22, 13, 'middle', true) + lab(nB, 220, 22, 13, 'middle', true) +
    lab(v('a', a), 98, 94, 20, 'middle') + lab(v('ab', both), 160, 94, 20, 'middle') + lab(v('b', b), 222, 94, 20, 'middle') + lab(v('out', out), 288, 152, 18, 'middle'));
}
function targetSVG(kind, a, b, c) {   // 'sq': outer square side a, inner square side b | 'circ': radius a, inner radius b, optional third c
  if (kind === 'sq') { const s = 150, t = 150 * b / a, o = (170 - s) / 2; return svg(170, 170, '<rect x="' + o + '" y="' + o + '" width="' + s + '" height="' + s + '" fill="#fff" stroke="#223" stroke-width="2"/><rect x="' + (85 - t / 2) + '" y="' + (85 - t / 2) + '" width="' + t + '" height="' + t + '" fill="rgba(209,71,31,.35)" stroke="#d1471f" stroke-width="2"/>' + lab(a + ' cm', 85, 168, 12, 'middle') + lab(b + ' cm', 85, 90, 12, 'middle')); }
  const R = 78, r = R * b / a, r2 = c ? R * c / a : 0;
  return svg(190, 180, '<circle cx="95" cy="90" r="' + R + '" fill="#fff" stroke="#223" stroke-width="2"/>' + (c ? '<circle cx="95" cy="90" r="' + r + '" fill="rgba(27,95,168,.25)" stroke="#1b5fa8" stroke-width="2"/><circle cx="95" cy="90" r="' + r2 + '" fill="rgba(209,71,31,.4)" stroke="#d1471f" stroke-width="2"/>' : '<circle cx="95" cy="90" r="' + r + '" fill="rgba(209,71,31,.35)" stroke="#d1471f" stroke-width="2"/>') +
    '<line x1="95" y1="90" x2="' + (95 + R) + '" y2="90" stroke="#223"/>' + lab('R = ' + a, 95 + R / 2, 84, 11, 'middle') + (c ? lab('r = ' + c, 95 + r2 / 2, 106, 11, 'middle') : lab('r = ' + b, 95 + r / 2, 106, 11, 'middle')));
}

/* ======================= 4.1 Grids and tree diagrams ======================= */
const THINGS = [['a coin', 2], ['a die', 6], ['a spinner with 4 equal sections', 4], ['a spinner with 5 equal sections', 5], ['a spinner with 8 equal sections', 8], ['a die with 8 faces', 8], ['a die with 10 faces', 10]];
const GRIDEV = [
  (a, b) => { const S = ri(Math.max(4, Math.floor((a + b) / 2)), a + b - 1); return ['the sum is at least ' + S, (i, j) => i + j >= S]; },
  () => ['the two numbers are equal', (i, j) => i === j],
  () => ['both numbers are even', (i, j) => i % 2 === 0 && j % 2 === 0],
  (a, b) => { const d = ri(1, Math.min(a, b) - 2); return ['the difference between the numbers is exactly ' + d, (i, j) => Math.abs(i - j) === d]; },
  (a, b) => { const T = ri(Math.floor(a * b / 3), Math.floor(a * b / 2)); return ['the product is greater than ' + T, (i, j) => i * j > T]; },
  () => ['the sum is a prime number', (i, j) => isPr(i + j)],
  () => ['the product is a square number', (i, j) => isSq(i * j)],
  () => ['the sum is even and larger than 5', (i, j) => (i + j) % 2 === 0 && i + j > 5]
];
function gridEvent(a, b, l) { const k = l === 0 ? [0, 1, 2] : l === 1 ? [0, 3, 4, 2] : [4, 5, 6, 7, 3]; return GRIDEV[pick(k)](a, b); }
G['4.1'] = [
  function gridSize(l) {
    const k = l === 2 ? 3 : 2, sel = shuffle(THINGS.slice(0, l === 0 ? 4 : THINGS.length)).slice(0, k), tot = sel.reduce((a, t) => a * t[1], 1);
    return nu(p('You throw ' + sel.map(t => t[0]).join(k === 3 ? ', ' : ' and ').replace(/, ([^,]*)$/, ' and $1') + ' at the same time. How many different outcomes are possible?'), tot, 'Make a grid or a tree diagram, or multiply the number of outcomes of each object.', 'Multiply the numbers of outcomes: ' + times(sel.map(t => t[1])) + ' = ' + tot + '.');
  },
  function sumWays(l) {
    const a = l === 0 ? 6 : l === 1 ? pick([6, 8]) : pick([8, 10, 12]), b = l === 2 ? pick([4, 6]) : a, S = ri(3, a + b - 1), prs = []; for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) if (i + j === S) prs.push('(' + i + ', ' + j + ')');
    return nu(p(l === 0 ? 'You throw two dice and add the numbers. In how many ways can you get a sum of <b>' + S + '</b>?' : 'Two spinners, numbered 1 to ' + a + ' and 1 to ' + b + ', are spun and the two numbers are added. In how many ways can you get a sum of <b>' + S + '</b>?'), prs.length, 'Make a grid. Count the cells where the two numbers add up to ' + S + '.', 'The pairs are ' + prs.join(', ') + '. That is ' + prs.length + ' ways.');
  },
  function bestSum(l) {
    const n = l === 0 ? 6 : pick([4, 5, 6, 8]), kind = l === 0 ? 'sum' : pick(['sum', 'sum', 'difference']);
    if (kind === 'sum') { const right = n + 1; return ch(p('Two fair dice (or spinners), both numbered 1 to ' + n + ', are thrown and the numbers are added. Which sum is the <b>most likely</b>?'), String(right), [right - 1, right + 1, right - 2, 2, 2 * n].filter(x => x !== right && x >= 2 && x <= 2 * n).slice(0, 3).map(String), 'Make a grid and count how often every sum occurs.', 'The sum ' + right + ' occurs ' + n + ' times in the grid, more than any other sum.', { keys: [] }); }
    return ch(p('Two spinners, both numbered 1 to ' + n + ', are spun. You subtract the smaller number from the larger one. Which difference is the <b>least likely</b>?'), String(n - 1), [0, 1, 2, n - 2].filter(x => x !== n - 1).slice(0, 3).map(String), 'Make a grid and count how often every difference occurs.', 'The difference ' + (n - 1) + ' only occurs with (1, ' + n + ') and (' + n + ', 1): 2 times. Every other difference occurs more often.', { keys: [] });
  },
  function gridCount(l) {
    const a = l === 0 ? 6 : pick([6, 8]), b = a, e = gridEvent(a, b, l), rows = []; let t = 0;
    for (let i = 1; i <= a; i++) { let c = 0; for (let j = 1; j <= b; j++) if (e[1](i, j)) c++; rows.push(c); t += c; }
    if (t === 0 || t === a * b) return G['4.1'][3](l);
    return nu(p('Two ' + (a === 6 ? 'dice' : 'spinners numbered 1 to ' + a) + ' are thrown and you make a grid of all ' + a * b + ' outcomes. In how many cells of the grid is <b>' + e[0] + '</b>?'), t, 'Make the grid. Go through it row by row and count the cells that fit.', 'Count per row (first number 1, 2, 3, ...): ' + rows.join(' + ') + ' = ' + t + ' cells.');
  },
  function coinWays(l) {
    const n = l === 0 ? 3 : l === 1 ? 4 : 5, atl = l === 2 && Math.random() < .5, k = atl ? ri(2, 3) : ri(1, n - 1), seq = []; for (let m = 0; m < (1 << n); m++) { let s = ''; for (let i = 0; i < n; i++) s += (m >> i) & 1 ? 'H' : 'T'; seq.push(s); }
    const heads = s => (s.match(/H/g) || []).length, cnt = c => seq.filter(s => c(heads(s))).length;
    if (!atl) { const L = seq.filter(s => heads(s) === k); return nu(p('A coin is flipped <b>' + n + '</b> times. In how many different ways can you get exactly <b>' + k + '</b> head' + (k > 1 ? 's' : '') + '?'), L.length, 'Draw a tree diagram or list the possible orders, for example HHT, HTH, THH.', 'The ways are ' + L.join(', ') + '. That is ' + L.length + ' ways.'); }
    const parts = []; for (let h = k; h <= n; h++) parts.push(cnt(x => x === h)); const tot = parts.reduce((a, c) => a + c, 0);
    return nu(p('A coin is flipped <b>' + n + '</b> times. In how many different ways can you get <b>at least ' + k + '</b> heads?'), tot, 'Count the ways for exactly ' + k + ' heads, exactly ' + (k + 1) + ' heads, and so on. Then add them.', 'Exactly ' + k + ' to ' + n + ' heads: ' + parts.join(' + ') + ' = ' + tot + ' ways.');
  },
  function gridOrTree(l) {
    const n = l === 0 ? pick([2, 3]) : ri(2, 4), what = n === 2 ? 'two dice' : n === 3 ? 'three coins' : 'four coins', right = n === 2 ? 'A grid or a tree diagram' : 'Only a tree diagram';
    return ch(p('You throw ' + what + ' and want to show all outcomes. Which diagram can you use?'), right, ['A grid or a tree diagram', 'Only a tree diagram', 'Only a grid'].filter(x => x !== right), 'A grid has two directions (rows and columns). Count how many things you throw.', n === 2 ? 'With two things you can make a grid (rows and columns) or a tree diagram.' : 'With ' + n + ' things a grid is not possible (a grid only has rows and columns). Use a tree diagram.', { keys: [] });
  }
];
XG['4.1'] = [
  function threeDiceSum(l) {
    const S = pick([4, 5, 6, 7, 15, 16, 17]), g = {}; let t = 0;
    for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) for (let k = 1; k <= 6; k++) if (i + j + k === S) { const key = [i, j, k].sort().join(' + '); g[key] = (g[key] || 0) + 1; t++; }
    return nu(p('Three dice are thrown and the numbers are added. In how many ways can you get a sum of <b>' + S + '</b>?'), t, 'Find all combinations of three numbers with that sum, then count in how many orders each combination can be thrown.', Object.keys(g).map(k => k + ': ' + g[k] + ' way' + (g[k] > 1 ? 's' : '')).join('; ') + '. Total: ' + Object.values(g).join(' + ') + ' = ' + t + '.');
  },
  function atMostHeads(l) {
    const n = pick([6, 7]), k = 2, parts = range(0, k).map(h => Cn(n, h)), t = parts.reduce((a, c) => a + c, 0);
    return nu(p('A coin is flipped <b>' + n + '</b> times. In how many different ways do you get <b>at most ' + k + '</b> heads?'), t, 'At most 2 heads means 0, 1 or 2 heads. Count each case (for 1 head: the head can be at ' + n + ' different places).', '0 heads: 1 way. 1 head: ' + n + ' ways. 2 heads: ' + Cn(n, 2) + ' ways (' + n + ' · ' + (n - 1) + ' ÷ 2). Total: ' + parts.join(' + ') + ' = ' + t + '.');
  }
];

/* ======================= 4.2 Counting by multiplying ======================= */
const CTX = [
  ['A restaurant offers {0} starters, {1} main courses and {2} desserts. You choose one of each.', 'dinners', ['starters', 'main courses', 'desserts']],
  ['A shop sells {0} types of shirt, {1} types of trousers and {2} types of shoes. You choose one of each.', 'outfits', ['shirts', 'trousers', 'shoes']],
  ['An ice cream stand has {0} flavours, {1} types of cone and {2} toppings. You choose one of each.', 'ice creams', ['flavours', 'cones', 'toppings']],
  ['A new bike can be ordered in {0} colours, with {1} types of saddle and {2} types of bell.', 'different bikes', ['colours', 'saddles', 'bells']]
];
G['4.2'] = [
  function choiceCount(l) {
    const c = pick(CTX), k = l === 0 ? 2 : 3, v = range(0, k - 1).map(() => LR(l, 2, 7));
    let text = c[0]; if (k === 2) text = text.replace(/, and \{2\}.*$/, '').replace(/ and \{2\} [a-z ]+\./, '.').replace(/,? and \{2\}[^.]*\./, '.');
    if (k === 2) { text = text.replace(/\{2\}[^.]*\./, '.'); }
    text = text.replace('{0}', v[0]).replace('{1}', v[1]).replace('{2}', v[2]).replace(/ and \./, '.').replace(/, \./, '.');
    const tot = v.reduce((a, b) => a * b, 1);
    return nu(p(text + ' How many different ' + c[1] + ' can you make?'), tot, 'Multiply the number of choices for each part.', times(v) + ' = ' + tot + ' ' + c[1] + '.');
  },
  function codeCount(l) {
    const t = l === 0 ? pick(['digits3', 'digits4']) : l === 1 ? pick(['letters', 'first', 'digits4']) : pick(['diffDigits', 'diffLetters', 'first']);
    if (t === 'digits3' || t === 'digits4') { const d = t === 'digits3' ? 3 : 4; return nu(p('A lock has a code of <b>' + d + '</b> digits. Each digit can be 0, 1, 2, ..., 9. How many different codes are possible?'), Math.pow(10, d), 'For every digit there are 10 choices. Multiply.', times(Array(d).fill(10)) + ' = ' + thou(Math.pow(10, d)) + '.'); }
    if (t === 'letters') { const L = 2, D = ri(2, 3), tot = Math.pow(26, L) * Math.pow(10, D); return nu(p('A code consists of <b>' + L + ' letters</b> (A to Z) followed by <b>' + D + ' digits</b> (0 to 9). Letters and digits may be repeated. How many codes are possible?'), tot, 'Multiply the number of choices for every place: 26 for a letter, 10 for a digit.', times(Array(L).fill(26).concat(Array(D).fill(10))) + ' = ' + thou(tot) + '.'); }
    if (t === 'first') { const d = ri(4, 5), tot = 9 * Math.pow(10, d - 1); return nu(p('A pin code has <b>' + d + '</b> digits and the <b>first digit cannot be 0</b>. How many pin codes are possible?'), tot, 'The first digit has fewer choices than the other digits.', times([9].concat(Array(d - 1).fill(10))) + ' = ' + thou(tot) + '.'); }
    if (t === 'diffDigits') { const d = ri(3, 4), fs = []; for (let i = 0; i < d; i++) fs.push(10 - i); const tot = fs.reduce((a, b) => a * b, 1); return nu(p('A code has <b>' + d + '</b> digits and <b>all digits are different</b>. How many codes are possible?'), tot, 'After you use a digit, you cannot use it again. So every next place has one choice fewer.', times(fs) + ' = ' + thou(tot) + '.'); }
    const d = 3, fs = [26, 25, 24], tot = 26 * 25 * 24; return nu(p('A code has <b>3 different letters</b> from A to Z. How many codes are possible?'), tot, 'After you use a letter, you cannot use it again.', times(fs) + ' = ' + thou(tot) + '.');
  },
  function arrangeCount(l) {
    const t = l === 0 ? pick(['row3', 'row4']) : l === 1 ? pick(['podium5', 'row4', 'podium6']) : pick(['row5', 'podium7', 'trio12']);
    const V = { row3: [3, 3, 'In how many different orders can <b>3</b> people stand in a row?'], row4: [4, 4, 'In how many different orders can <b>4</b> people stand in a row?'], row5: [5, 5, 'In how many different orders can <b>5</b> friends sit on <b>5</b> chairs in a row?'],
      podium5: [5, 3, 'Five runners take part in a race. In how many ways can <b>gold, silver and bronze</b> be awarded?'], podium6: [6, 3, 'Six runners take part in a race. In how many ways can <b>gold, silver and bronze</b> be awarded?'], podium7: [7, 3, 'Seven swimmers are in a final. In how many ways can <b>gold, silver and bronze</b> be awarded?'], trio12: [12, 3, 'A club has 12 members. They choose a <b>chair, a secretary and a treasurer</b> (three different people). In how many ways can this be done?'] }[t];
    const fs = []; for (let i = 0; i < V[1]; i++) fs.push(V[0] - i); const tot = fs.reduce((a, b) => a * b, 1);
    return nu(p(V[2]), tot, 'The first place has ' + V[0] + ' choices. After that, every next place has one choice fewer.', times(fs) + ' = ' + tot + '.');
  },
  function numbersFromDigits(l) {
    const set = pick([[1, 2, 3, 4], [2, 3, 4, 5], [1, 3, 4, 6], [1, 2, 3, 4, 5], [2, 3, 5, 6, 7]]), n = set.length, kind = l === 0 ? pick(['rep', 'norep']) : l === 1 ? pick(['norep', 'even', 'big']) : pick(['evenNorep', 'oddNorep', 'bigNorep']);
    const ev = set.filter(x => x % 2 === 0).length, od = n - ev; let cnt = 0, text, st;
    const all = []; set.forEach(a => set.forEach(b => set.forEach(c => all.push([a, b, c]))));
    const dist = t => t[0] !== t[1] && t[0] !== t[2] && t[1] !== t[2];
    if (kind === 'rep') { cnt = all.length; text = 'How many <b>3-digit numbers</b> can you make with the digits ' + set.join(', ') + '? A digit may be used more than once.'; st = times([n, n, n]) + ' = ' + cnt + '.'; }
    else if (kind === 'norep') { cnt = all.filter(dist).length; text = 'How many <b>3-digit numbers</b> can you make with the digits ' + set.join(', ') + ', if every digit may be used <b>only once</b>?'; st = times([n, n - 1, n - 2]) + ' = ' + cnt + '.'; }
    else if (kind === 'even') { cnt = all.filter(t => t[2] % 2 === 0).length; text = 'How many <b>even 3-digit numbers</b> can you make with the digits ' + set.join(', ') + '? A digit may be used more than once.'; st = 'The last digit must be even (' + ev + ' choices): ' + times([n, n, ev]) + ' = ' + cnt + '.'; }
    else if (kind === 'big') { const lim = set[1]; const g = set.filter(x => x > lim).length; cnt = all.filter(t => t[0] > lim).length; text = 'How many <b>3-digit numbers bigger than ' + lim + '00</b> can you make with the digits ' + set.join(', ') + '? A digit may be used more than once.'; st = 'The first digit must be bigger than ' + lim + ' (' + g + ' choices): ' + times([g, n, n]) + ' = ' + cnt + '.'; }
    else if (kind === 'evenNorep') { cnt = all.filter(t => dist(t) && t[2] % 2 === 0).length; text = 'How many <b>even 3-digit numbers</b> can you make with the digits ' + set.join(', ') + ', if every digit may be used <b>only once</b>?'; st = 'Choose the last digit first (' + ev + ' even choices), then the others: ' + times([ev, n - 1, n - 2]) + ' = ' + cnt + '.'; }
    else if (kind === 'oddNorep') { cnt = all.filter(t => dist(t) && t[2] % 2 === 1).length; text = 'How many <b>odd 3-digit numbers</b> can you make with the digits ' + set.join(', ') + ', if every digit may be used <b>only once</b>?'; st = 'Choose the last digit first (' + od + ' odd choices), then the others: ' + times([od, n - 1, n - 2]) + ' = ' + cnt + '.'; }
    else { const lim = set[1], g = set.filter(x => x > lim).length; cnt = all.filter(t => dist(t) && t[0] > lim).length; text = 'How many <b>3-digit numbers bigger than ' + lim + '00</b> can you make with the digits ' + set.join(', ') + ', if every digit may be used <b>only once</b>?'; st = 'The first digit must be bigger than ' + lim + ' (' + g + ' choices): ' + times([g, n - 1, n - 2]) + ' = ' + cnt + '.'; }
    if (cnt === 0) return G['4.2'][3](l);
    return nu(p(text), cnt, 'Think about every place of the number. Count the choices for each place, then multiply. Start with the place that has a restriction.', st);
  },
  function vennRead(l) {
    const A = ri(3, 12), B = ri(3, 12), AB = ri(1, 6), O = ri(2, 9), names = pick([['Football', 'Hockey'], ['Dutch', 'French'], ['Tea', 'Coffee'], ['Cats', 'Dogs']]), k = pick(['inA', 'only', 'union', 'total']);
    const fig = vennSVG(A, AB, B, O, names[0], names[1]), who = 'This Venn diagram shows how many of the students in a class like ' + names[0].toLowerCase() + ' and ' + names[1].toLowerCase() + '. The number outside the circles is the number who like neither.';
    if (l >= 2) {   // spicy: a probability from the diagram
      const N = A + AB + B + O, kk = pick(['onlyB', 'notA', 'one']), Q = { onlyB: ['only ' + names[1].toLowerCase(), B, 'The part of the ' + names[1] + ' circle outside the overlap: ' + B + '.'], notA: ['<b>not</b> ' + names[0].toLowerCase(), B + O, 'Everything outside the ' + names[0] + ' circle: ' + B + ' + ' + O + ' = ' + (B + O) + '.'], one: ['<b>exactly one</b> of the two', A + B, 'Only ' + names[0].toLowerCase() + ' or only ' + names[1].toLowerCase() + ': ' + A + ' + ' + B + ' = ' + (A + B) + '.'] }[kk];
      return frq(p(who) + fig + p('A student from this class is picked at random. What is the probability that this student likes ' + Q[0] + '?'), Q[1], N, 'P = (number of students you want) / (number of students in the class). First add all four numbers.', Q[2] + ' Class: ' + A + ' + ' + AB + ' + ' + B + ' + ' + O + ' = ' + N + '. P = ' + fr(Q[1], N) + (gcd(Q[1], N) > 1 ? ' = ' + fl(Q[1], N) : '') + '.', { needStep: true });
    }
    const q = { inA: ['How many students like ' + names[0].toLowerCase() + ' (including those who like both)?', A + AB, 'Add the part that is only ' + names[0].toLowerCase() + ' and the overlap.', A + ' + ' + AB + ' = ' + (A + AB) + '.'],
      only: ['How many students like <b>only</b> ' + names[1].toLowerCase() + '?', B, 'Look at the part of the ' + names[1] + ' circle that is not in the overlap.', 'The number in that part is ' + B + '.'],
      union: ['How many students like <b>at least one</b> of the two?', A + AB + B, 'Add the three numbers inside the circles. Do not add the number outside.', A + ' + ' + AB + ' + ' + B + ' = ' + (A + AB + B) + '.'],
      total: ['How many students are there in the class?', A + AB + B + O, 'Add all four numbers in the diagram.', A + ' + ' + AB + ' + ' + B + ' + ' + O + ' = ' + (A + AB + B + O) + '.'] }[k];
    return nu(p(who) + fig + p(q[0]), q[1], q[2], q[3]);
  },
  function vennCalc(l) {
    const AB = ri(2, 6), A = ri(AB + 2, AB + 12), B = ri(AB + 2, AB + 12), U = A + B - AB, O = ri(2, 9), N = U + O, nm = pick([['football', 'hockey'], ['Dutch', 'French'], ['tea', 'coffee']]), kind = l >= 2 ? pick(['both', 'probOnly']) : pick(['neither', 'onlyA', 'both']);   // spicy: the overlap must be found first
    if (kind === 'probOnly') return frq(p('In a class of <b>' + N + '</b> students, ' + A + ' like ' + nm[0] + ' and ' + B + ' like ' + nm[1] + '. ' + O + ' students like neither. A student is picked at random. What is the probability that this student likes <b>only ' + nm[0] + '</b>?'), A - AB, N, 'First find how many like both (a Venn diagram helps). Then how many like only ' + nm[0] + '.', 'At least one: ' + N + ' − ' + O + ' = ' + U + '. Both: ' + A + ' + ' + B + ' − ' + U + ' = ' + AB + '. Only ' + nm[0] + ': ' + A + ' − ' + AB + ' = ' + (A - AB) + '. P = ' + fr(A - AB, N) + (gcd(A - AB, N) > 1 ? ' = ' + fl(A - AB, N) : '') + '.', { needStep: true });
    if (kind === 'neither') return nu(p('In a class of <b>' + N + '</b> students, ' + A + ' like ' + nm[0] + ', ' + B + ' like ' + nm[1] + ' and ' + AB + ' like both. How many students like <b>neither</b>?'), O, 'The students who like both are counted twice if you add ' + A + ' and ' + B + '. Take them away once.', 'At least one: ' + A + ' + ' + B + ' − ' + AB + ' = ' + U + '. Neither: ' + N + ' − ' + U + ' = ' + O + '.');
    if (kind === 'onlyA') return nu(p('In a class, ' + A + ' students like ' + nm[0] + ', ' + B + ' like ' + nm[1] + ' and ' + AB + ' like both. How many students like <b>only ' + nm[0] + '</b>?'), A - AB, 'Those who like both are inside the ' + nm[0] + ' group. Take them out.', A + ' − ' + AB + ' = ' + (A - AB) + '.');
    return nu(p('In a class of <b>' + N + '</b> students, ' + A + ' like ' + nm[0] + ' and ' + B + ' like ' + nm[1] + '. ' + O + ' students like neither. How many like <b>both</b>?'), AB, 'First find how many like at least one. Then compare ' + A + ' + ' + B + ' with that number.', 'At least one: ' + N + ' − ' + O + ' = ' + U + '. Both: ' + A + ' + ' + B + ' − ' + U + ' = ' + AB + '.');
  }
];
XG['4.2'] = [
  function atLeastOneTail(l) {
    const n = pick([5, 6, 7, 8]), t = Math.pow(2, n) - 1;
    return nu(p('A coin is flipped <b>' + n + '</b> times. In how many ways do you get <b>at least one tail</b>?'), t, 'It is easier to count the opposite: the ways with <b>no</b> tails.', 'All outcomes: 2<sup>' + n + '</sup> = ' + Math.pow(2, n) + '. Only one has no tails (all heads): ' + Math.pow(2, n) + ' − 1 = ' + t + '.');
  },
  function bigPassword(l) {
    const L = pick([5, 6]), v = pick([['letters and digits (not case-sensitive)', 36], ['capital letters and digits', 36], ['lowercase and capital letters', 52]]);
    return ex(p('A password has <b>' + L + '</b> characters. Each character is one of the ' + v[1] + ' possible symbols (' + v[0] + '). How many passwords are possible? Type a calculation or a number.'), v[1] + '^' + L, null, 'Every character has ' + v[1] + ' choices, and there are ' + L + ' characters.', v[1] + '<sup>' + L + '</sup> = ' + thou(Math.pow(v[1], L)) + '.', { ansText: v[1] + '^' + L + ' = ' + thou(Math.pow(v[1], L)), keys: ['^', '·', '(', ')'] });
  },
  function oddFirstDifferent(l) {
    const d = ri(4, 5); let t = 0; const lim = Math.pow(10, d);
    for (let x = 0; x < lim; x++) { const s = String(x).padStart(d, '0'); if (+s[0] % 2 === 1 && new Set(s).size === d) t++; }
    const fs = [5]; for (let i = 1; i < d; i++) fs.push(10 - i);
    return nu(p('A code has <b>' + d + '</b> digits. The <b>first digit is odd</b> and <b>all digits are different</b>. How many codes are possible?'), t, 'Start with the place that has a restriction: the first digit (5 odd digits). Then every next place has one digit fewer to choose from.', times(fs) + ' = ' + thou(t) + '.');
  },
  function committee(l) {
    const n = ri(18, 30); return nu(p('From a class of <b>' + n + '</b> students, the teacher chooses a <b>captain</b>, a <b>vice-captain</b> and a <b>treasurer</b> (all different students). In how many ways can this be done?'), n * (n - 1) * (n - 2), 'The captain has ' + n + ' choices. After that there are fewer students left.', times([n, n - 1, n - 2]) + ' = ' + thou(n * (n - 1) * (n - 2)) + '.');
  }
];

/* ======================= 4.3 Probability ======================= */
const PROBS = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [1, 8], [3, 8], [5, 8], [7, 8], [9, 20], [7, 20], [13, 20], [3, 25], [11, 25], [7, 40], [13, 50], [3, 16]];
G['4.3'] = [
  function convertProb(l) {
    const [n, d] = PL(l, PROBS), v = n / d, kind = pick(['f2p', 'p2f', 'd2f', 'f2d', 'in2p']);
    if (kind === 'f2p') return nu(p('Write ' + fr(n, d) + ' as a <b>percentage</b>. (Type only the number, without %.)'), v * 100, 'Divide the top by the bottom to get a decimal. Then multiply by 100.', n + ' ÷ ' + d + ' = ' + dec(v) + ', so ' + dec(v) + ' · 100 = ' + dec(v * 100) + '%.', { tol: 1e-9, ansText: dec(v * 100) + '%' });
    if (kind === 'p2f') return frq(p('Write <b>' + dec(v * 100) + '%</b> as a fraction in lowest terms.'), n, d, 'A percentage is a fraction out of 100. Then cancel.', dec(v * 100) + '% = ' + fr(dec(v * 100), 100) + ' = ' + fl(n, d) + '.');
    if (kind === 'd2f') return frq(p('Write <b>' + dec(v) + '</b> as a fraction in lowest terms.'), n, d, 'Write the decimal as a fraction with 10, 100 or 1000 at the bottom. Then cancel.', dec(v) + ' = ' + fr(Math.round(v * 1000), 1000) + ' = ' + fl(n, d) + '.');
    if (kind === 'f2d') return nu(p('Write ' + fr(n, d) + ' as a <b>decimal</b>.'), v, 'Divide the top by the bottom.', n + ' ÷ ' + d + ' = ' + dec(v) + '.', { ansText: dec(v) });
    const k = pick([2, 5, 10]); return nu(p('The chance of rain is <b>' + n + ' in ' + d + '</b>. What is this as a <b>percentage</b>? (Type only the number, without %.)'), v * 100, 'Write it as a fraction first.', n + ' in ' + d + ' = ' + fr(n, d) + ' = ' + dec(v) + ', so ' + dec(v) + ' · 100 = ' + dec(v * 100) + '%.', { tol: 1e-9, ansText: dec(v * 100) + '%' });
  },
  function probCheck(l) {
    const valid = shuffle(['0', '1', '0.5', '3/4', '25%', '100%', '0.02', '7/8', '0.9', '1/3']).slice(0, 3), bad = pick(['1.2', '3/2', '125%', '−0.1', '9/8', '150%', '−1/4', '2.5']);
    return ch(p('Which of these <b>cannot</b> be a probability?'), bad, valid, 'A probability is never smaller than 0 (impossible) and never bigger than 1 (certain). 100% = 1.', bad + ' is ' + (/^[−-]/.test(bad) ? 'smaller than 0' : 'bigger than 1 (100%)') + ', so it cannot be a probability.', { keys: [] });
  },
  function diceProb(l) {
    const n = l === 0 ? 6 : pick([8, 10, 12]), ev = {
      0: [['even', x => x % 2 === 0], ['greater than 4', x => x > 4], ['a 6', x => x === n], ['not a 6', x => x !== n], ['at most 2', x => x <= 2]],
      1: [['a prime number', x => isPr(x)], ['a multiple of 3', x => x % 3 === 0], ['less than ' + Math.floor(n / 2), x => x < Math.floor(n / 2)], ['odd and bigger than 3', x => x % 2 === 1 && x > 3]],
      2: [['a multiple of 3 or a multiple of 4', x => x % 3 === 0 || x % 4 === 0], ['a square number', x => isSq(x)], ['a prime number or a multiple of 5', x => isPr(x) || x % 5 === 0], ['neither a prime number nor even', x => !isPr(x) && x % 2 === 1]]
    }[Math.min(l, 2)];
    const N = l === 2 ? pick([12, 20]) : n; const e = pick(ev); const fav = range(1, N).filter(e[1]);
    if (fav.length === 0 || fav.length === N) return G['4.3'][2](l);
    return frq(p('A fair die with <b>' + N + '</b> faces (numbered 1 to ' + N + ') is thrown. What is the probability that the number is <b>' + e[0] + '</b>?'), fav.length, N, 'Probability = number of favourable outcomes ÷ number of possible outcomes. List the favourable numbers.', 'Favourable: ' + fav.join(', ') + ' (' + fav.length + ' outcomes). P = ' + fr(fav.length, N) + (fav.length / N === 1 ? '' : (gcd(fav.length, N) > 1 ? ' = ' + fl(fav.length, N) : '')) + '.');
  },
  function bagProb(l) {
    const cols = l === 0 ? [['red', ri(2, 6)], ['blue', ri(2, 6)]] : [['red', ri(2, 7)], ['blue', ri(2, 7)], ['green', ri(1, 6)]], N = cols.reduce((a, c) => a + c[1], 0), list = cols.map(c => c[1] + ' ' + c[0]).join(', ').replace(/, ([^,]*)$/, ' and $1');
    const ev = l === 0 ? pick([[0], [1]].map(x => ({ t: 'a ' + cols[x[0]][0] + ' marble', c: cols[x[0]][1] }))) : pick([{ t: 'a ' + cols[0][0] + ' marble', c: cols[0][1] }, { t: '<b>not</b> a ' + cols[0][0] + ' marble', c: N - cols[0][1] }, { t: 'a ' + cols[0][0] + ' or a ' + cols[1][0] + ' marble', c: cols[0][1] + cols[1][1] }, { t: 'a marble that is <b>neither</b> ' + cols[0][0] + ' <b>nor</b> ' + cols[1][0], c: N - cols[0][1] - cols[1][1] }]);
    return frq(p('A bag contains ' + list + ' marbles (' + N + ' in total). You take one marble without looking. What is the probability that it is ' + ev.t + '?'), ev.c, N, 'Probability = number of favourable marbles ÷ total number of marbles.', 'Favourable: ' + ev.c + ' of ' + N + '. P = ' + fr(ev.c, N) + (gcd(ev.c, N) > 1 ? ' = ' + fl(ev.c, N) : '') + '.');
  },
  function cardProb(l) {
    const all = [['an ace', 4], ['a heart', 13], ['a red card', 26], ['a queen', 4], ['the ace of spades', 1], ['a red king', 2], ['a picture card (jack, queen or king)', 12], ['a king or a queen', 8], ['<b>not</b> a heart', 39], ['a heart or an ace', 16], ['a black card that is a 10', 2], ['a card between 2 and 5 (including 2 and 5)', 16]], e = PL(l, all);
    return frq(p('A standard deck has 52 cards: four suits (hearts and diamonds are red; spades and clubs are black), and every suit has an ace, 2 to 10, a jack, a queen and a king. You draw one card at random. What is the probability of drawing <b>' + e[0] + '</b>?'), e[1], 52, 'Count how many cards fit, then divide by 52.', 'Favourable: ' + e[1] + ' cards. P = ' + fr(e[1], 52) + (gcd(e[1], 52) > 1 ? ' = ' + fl(e[1], 52) : '') + '.');
  },
  function gridProb(l) {
    const a = 6, e = gridEvent(a, a, l === 2 ? 2 : l); let c = 0; for (let i = 1; i <= a; i++) for (let j = 1; j <= a; j++) if (e[1](i, j)) c++;
    if (c === 0 || c === 36) return G['4.3'][5](l);
    return frq(p('Two dice are thrown. What is the probability that <b>' + e[0] + '</b>?'), c, 36, 'Make a grid with all 36 outcomes. Count the favourable cells, then divide by 36.', 'Favourable cells: ' + c + ' of 36. P = ' + fr(c, 36) + (gcd(c, 36) > 1 ? ' = ' + fl(c, 36) : '') + '.');
  },
  function relFreq(l) {
    const N = PL(l, [20, 25, 40, 50, 100, 200, 250, 500]), k = ri(Math.ceil(N * .1), Math.floor(N * .9)), what = pick([['A drawing pin is dropped', 'lands point up'], ['A basketball player takes free throws and scores', 'scores'], ['A bus is checked and arrives', 'on time']]), pc = l > 0 && Math.random() < .5;
    const t1 = { 'A drawing pin is dropped': 'A drawing pin is dropped ' + N + ' times. It lands point up ' + k + ' times.', 'A basketball player takes free throws and scores': 'A basketball player takes ' + N + ' free throws and scores ' + k + ' times.', 'A bus is checked and arrives': 'A bus is checked on ' + N + ' days. It arrives on time on ' + k + ' of those days.' }[what[0]];
    return nu(p(t1 + ' What is the <b>relative frequency</b> of the successful result, as a ' + (pc ? '<b>percentage</b>? (Type only the number, without %.)' : '<b>decimal</b>?')), pc ? k / N * 100 : k / N, 'Relative frequency = number of times it happened ÷ total number of tries.', k + ' ÷ ' + N + ' = ' + dec(k / N) + (pc ? ', so ' + dec(k / N) + ' · 100 = ' + dec(k / N * 100) + '%.' : '.'), { tol: 1e-9, ansText: pc ? dec(k / N * 100) + '%' : dec(k / N) });
  },
  function expectedCount(l) {
    const t = pick([[1, 6, 'a six when you throw a die', 'throws'], [1, 4, 'a heart when you draw a card from a deck of 4 suits (each with equal numbers)', 'draws'], [2, 5, 'the red area on a spinner', 'spins'], [3, 10, 'rain on a day in this area', 'days'], [1, 2, 'heads', 'flips'], [1, 5, 'a faulty product', 'products']]);
    const mult = PL(l, [6, 10, 12, 20, 25, 30, 50, 60]), N = t[1] * mult, ans = t[0] * mult, pcs = l > 0 && Math.random() < .5, pT = pcs ? dec(t[0] / t[1] * 100) + '%' : fr(t[0], t[1]);
    return nu(p('The probability of ' + t[2] + ' is ' + pT + '. About how many times do you expect this in <b>' + N + '</b> ' + t[3] + '?'), ans, 'Expected number = probability × number of tries.', pT.indexOf('%') >= 0 ? dec(t[0] / t[1]) + ' · ' + N + ' = ' + ans + '.' : t[0] + '/' + t[1] + ' · ' + N + ' = ' + ans + '.');
  },
  function lawLarge(l) {
    const right = pick(['The more often you repeat the experiment, the closer the relative frequency usually gets to the real probability.', 'In 1000 throws of a coin the relative frequency of heads is usually closer to 0.5 than in 10 throws.', 'After 5 tails in a row, the probability of heads on the next flip is still 0.5.']), wrong = shuffle(['After 5 tails in a row, heads becomes more likely on the next flip.', 'With 10 flips of a fair coin you always get exactly 5 heads.', 'A fair die that has not shown a six in 20 throws must be unfair.', 'The relative frequency of 10 tries is always equal to the real probability.', 'If a probability is 1/6, then in 60 throws you get exactly 10 sixes.']).slice(0, 2);
    return ch(p('Which statement is <b>true</b>?'), right, wrong, 'Think about what happens in a long series of experiments, and whether earlier results change the next one.', right + ' This is the law of large numbers: the more tries, the closer the relative frequency to the real probability. Earlier results do not change the next one.', { keys: [] });
  },
  function areaProb(l) {
    const k = l === 0 ? 'sq' : l === 1 ? 'circ' : pick(['ring', 'ring']);
    if (k === 'sq') { const a = pick([10, 20, 12, 15]), b = pick([2, 4, 5, 6, 3, 6, 8].filter(x => x < a)), n = b * b, d = a * a; return frq(p('A dart lands at random on a square board with side <b>' + a + ' cm</b>. In the middle is a shaded square with side <b>' + b + ' cm</b>. What is the probability that the dart lands in the shaded square?') + targetSVG('sq', a, b), n, d, 'Probability = area of the shaded part ÷ area of the whole board.', 'Shaded: ' + b + ' · ' + b + ' = ' + n + ' cm². Board: ' + a + ' · ' + a + ' = ' + d + ' cm². P = ' + fr(n, d) + (gcd(n, d) > 1 ? ' = ' + fl(n, d) : '') + '.'); }
    if (k === 'circ') { const R = pick([4, 6, 8, 10, 12]), r = pick([2, 3, 4, 5, 6].filter(x => x < R)), n = r * r, d = R * R; return frq(p('A dart lands at random on a circular board with radius <b>R = ' + R + '</b>. In the middle is a shaded circle with radius <b>r = ' + r + '</b>. What is the probability that the dart lands in the shaded circle? (The π cancels.)') + targetSVG('circ', R, r), n, d, 'Probability = area of the shaded circle ÷ area of the board. The area of a circle is π · radius².', 'Shaded: π · ' + r + '² = ' + n + 'π. Board: π · ' + R + '² = ' + d + 'π. P = ' + fr(n + 'π', d + 'π') + ' = ' + fr(n, d) + (gcd(n, d) > 1 ? ' = ' + fl(n, d) : '') + '.'); }
    const R = pick([6, 8, 10, 12]), r = pick([2, 3, 4, 5, 6].filter(x => x < R)), n = R * R - r * r, d = R * R; return frq(p('A dart lands at random on a circular board with radius <b>R = ' + R + '</b>. The middle circle (radius <b>r = ' + r + '</b>) is shaded. What is the probability that the dart lands <b>outside</b> the shaded circle?') + targetSVG('circ', R, r), n, d, 'Find the area of the whole board and the area outside the shaded circle. π cancels.', 'Outside: π · ' + R + '² − π · ' + r + '² = ' + d + 'π − ' + (r * r) + 'π = ' + n + 'π. P = ' + fr(n, d) + (gcd(n, d) > 1 ? ' = ' + fl(n, d) : '') + '.', { needStep: true });
  }
];
XG['4.3'] = [
  function pinAllDifferent(l) {
    const d = pick([3, 4]), tot = Math.pow(10, d); let fs = []; for (let i = 0; i < d; i++) fs.push(10 - i); const fav = fs.reduce((a, b) => a * b, 1);
    return frq(p('A pin code has <b>' + d + '</b> digits (each 0–9, chosen at random). What is the probability that <b>all digits are different</b>?'), fav, tot, 'Count the codes with different digits and divide by the number of all codes.', 'All codes: ' + thou(tot) + '. Different digits: ' + times(fs) + ' = ' + thou(fav) + '. P = ' + fr(thou(fav), thou(tot)) + ' = ' + fl(fav, tot) + '.', { needStep: true });
  },
  function spinnersPrime(l) {
    const a = pick([4, 5, 6, 8]), b = pick([6, 8, 10]); let c = 0; for (let i = 1; i <= a; i++) for (let j = 1; j <= b; j++) if (isPr(i + j)) c++;
    return frq(p('Two spinners, numbered 1 to ' + a + ' and 1 to ' + b + ', are spun and the numbers are added. What is the probability that the sum is a <b>prime number</b>?'), c, a * b, 'Make a grid of all ' + a * b + ' outcomes and count the sums 2, 3, 5, 7, 11, ... in it.', 'Favourable cells: ' + c + ' of ' + a * b + '. P = ' + fr(c, a * b) + (gcd(c, a * b) > 1 ? ' = ' + fl(c, a * b) : '') + '.');
  },
  function ringTarget(l) {
    const R = pick([10, 12, 15, 20]), r1 = pick([2, 4, 5]), r2 = pick([6, 8, 9].filter(x => x < R)), n = r2 * r2 - r1 * r1, d = R * R;
    return frq(p('A dart lands at random on a circular board with radius <b>' + R + '</b>. There are two circles inside, with radii <b>' + r1 + '</b> and <b>' + r2 + '</b>. What is the probability that the dart lands in the ring <b>between</b> the two inner circles?') + targetSVG('circ', R, r2, r1), n, d, 'Ring area = bigger circle − smaller circle. Probability = ring area ÷ board area.', 'Ring: π · ' + r2 + '² − π · ' + r1 + '² = ' + (r2 * r2) + 'π − ' + (r1 * r1) + 'π = ' + n + 'π. Board: ' + d + 'π. P = ' + fr(n, d) + (gcd(n, d) > 1 ? ' = ' + fl(n, d) : '') + '.', { needStep: true });
  }
];

/* ======================= 4.4 Tree diagrams (repeated events) ======================= */
const CONTEXTS = [['a basketball player makes a free throw', 'throws', 'scores', 'misses'], ['a football player scores a penalty', 'penalties', 'scores', 'misses'], ['an archer hits the target', 'shots', 'hits', 'misses'], ['a train is on time', 'days', 'on time', 'late']];
const PF = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6]];
const PD = [0.5, 0.6, 0.7, 0.8, 0.9, 0.3, 0.2, 0.4, 0.35, 0.65, 0.85];
function pw(a, b, k) { return [Math.pow(a, k), Math.pow(b, k)]; }
G['4.4'] = [
  function bothSuccess(l) {
    const c = pick(CONTEXTS), n = l === 2 ? 3 : 2, useF = l < 2 ? Math.random() < .5 : Math.random() < .4, word = n === 2 ? 'twice' : 'three times';
    if (useF) { const [a, b] = PL(l, PF.slice(0, 9)), num = Math.pow(a, n), den = Math.pow(b, n);
      let fig = ''; if (l === 0) fig = treeSVG({ stages: [['S', 'F'], ['S', 'F']], edge: (st, path, bi) => bi === 0 ? a + '/' + b : (b - a) + '/' + b, leaf: path => path.join(''), leafW: 90 });
      return frq(p('The probability that ' + c[0] + ' is <b>' + fr(a, b) + '</b>. This is tried <b>' + n + ' times</b>, independently. What is the probability that it ' + c[2] + ' every time?') + (fig ? p('(S = ' + c[2] + ', F = ' + c[3] + '.)') + fig : ''), num, den, 'The tries do not influence each other. Multiply the probabilities along the branch.', 'P = ' + times(Array(n).fill(a + '/' + b)) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true }); }
    const pr = pick(PD.slice(0, 7)), v = Math.pow(pr, n);
    return nu(p('The probability that ' + c[0] + ' is <b>' + dec(pr) + '</b>. This is tried <b>' + n + ' times</b>, independently. What is the probability that it ' + c[2] + ' every time? (Give a decimal.)'), Math.round(v * 1e6) / 1e6, 'The tries do not influence each other. Multiply the probabilities along the branch.', 'P = ' + times(Array(n).fill(dec(pr))) + ' = ' + dec(v) + '.', { needStep: true, tol: 1e-6, ansText: dec(v) });
  },
  function twoDifferent(l) {
    const c = pick([['A traffic light on the way to school is green with probability', 'and a second light is green with probability', 'green', 'not green'], ['Machine A makes a good product with probability', 'and machine B with probability', 'good', 'faulty']]), pa = pick([0.6, 0.7, 0.8, 0.9, 0.5]), pb = pick([0.4, 0.5, 0.6, 0.7, 0.8].filter(x => x !== pa)), kind = l === 0 ? 'both' : pick(['both', 'none', 'exactly one']);
    const fig = l === 0 ? treeSVG({ stages: [['1', '0'], ['1', '0']], edge: (st, path, bi) => dec(bi === 0 ? (st === 0 ? pa : pb) : 1 - (st === 0 ? pa : pb)), leaf: path => path.join(''), leafW: 90 }) + p('(1 = ' + c[2] + ', 0 = ' + c[3] + '.)') : '';
    const ans = kind === 'both' ? pa * pb : kind === 'none' ? (1 - pa) * (1 - pb) : pa * (1 - pb) + (1 - pa) * pb;
    const st = kind === 'both' ? 'P = ' + dec(pa) + ' · ' + dec(pb) + ' = ' + dec(ans) + '.' : kind === 'none' ? 'P = ' + dec(1 - pa) + ' · ' + dec(1 - pb) + ' = ' + dec(ans) + '.' : 'P = ' + dec(pa) + ' · ' + dec(1 - pb) + ' + ' + dec(1 - pa) + ' · ' + dec(pb) + ' = ' + dec(pa * (1 - pb)) + ' + ' + dec((1 - pa) * pb) + ' = ' + dec(ans) + '.';
    return nu(p(c[0] + ' ' + dec(pa) + ' ' + c[1] + ' ' + dec(pb) + '. They are independent. What is the probability that ' + (kind === 'both' ? '<b>both</b> are ' + c[2] : kind === 'none' ? '<b>neither</b> is ' + c[2] : '<b>exactly one</b> is ' + c[2]) + '?') + fig, Math.round(ans * 1e6) / 1e6, kind === 'exactly one' ? 'There are two branches: first yes then no, or first no then yes. Calculate both and add.' : 'Multiply the probabilities along the branch.', st, { needStep: true, tol: 1e-6, ansText: dec(ans) });
  },
  function diceTree(l) {
    const k = l === 0 ? pick(['two6', 'no6']) : l === 1 ? pick(['no6', 'one6', 'sameAgain']) : pick(['atLeast6', 'one6', 'low']);
    if (k === 'two6') return frq(p('A die is thrown twice. What is the probability of throwing a <b>six both times</b>?'), 1, 36, 'The throws are independent. Multiply the probabilities.', 'P = ' + fr(1, 6) + ' · ' + fr(1, 6) + ' = ' + fr(1, 36) + '.', { needStep: true });
    if (k === 'no6') return frq(p('A die is thrown twice. What is the probability that you throw <b>no six at all</b>?'), 25, 36, 'No six on the first throw (5 out of 6) and no six on the second throw.', 'P = ' + fr(5, 6) + ' · ' + fr(5, 6) + ' = ' + fr(25, 36) + '.', { needStep: true });
    if (k === 'one6') return frq(p('A die is thrown twice. What is the probability of throwing <b>exactly one six</b>?'), 10, 36, 'Two branches: six then no six, or no six then six. Calculate both and add.', 'P = ' + fr(1, 6) + ' · ' + fr(5, 6) + ' + ' + fr(5, 6) + ' · ' + fr(1, 6) + ' = ' + fr(5, 36) + ' + ' + fr(5, 36) + ' = ' + fr(10, 36) + ' = ' + fl(10, 36) + '.', { needStep: true });
    if (k === 'sameAgain') return frq(p('A die is thrown twice. What is the probability that <b>both numbers are less than 3</b>?'), 1, 9, 'The probability of a number less than 3 (1 or 2) is 2 out of 6 for every throw.', 'P = ' + fr(2, 6) + ' · ' + fr(2, 6) + ' = ' + fr(4, 36) + ' = ' + fl(4, 36) + '.', { needStep: true });
    if (k === 'atLeast6') { const n = ri(2, 3), num = Math.pow(6, n) - Math.pow(5, n), den = Math.pow(6, n); return frq(p('A die is thrown <b>' + n + '</b> times. What is the probability of throwing <b>at least one six</b>?'), num, den, 'It is easier to calculate the opposite: no six at all. Then do 1 minus that.', 'P(no six) = ' + times(Array(n).fill(fr(5, 6))) + ' = ' + fr(Math.pow(5, n), den) + '. P(at least one six) = 1 − ' + fr(Math.pow(5, n), den) + ' = ' + fl(num, den) + '.', { needStep: true }); }
    return frq(p('A die is thrown twice. What is the probability that the <b>sum</b> is <b>at least 11</b>?'), 3, 36, 'Which pairs give 11 or 12? You can multiply the probabilities of every pair (1/6 · 1/6).', 'Pairs: (5, 6), (6, 5), (6, 6): 3 · ' + fr(1, 36) + ' = ' + fr(3, 36) + ' = ' + fl(3, 36) + '.', { needStep: true });
  },
  function coinTree(l) {
    const n = l === 0 ? 3 : pick([3, 4, 5]), kind = l === 0 ? pick(['exact', 'same']) : pick(['exact', 'atLeast1', 'same']), tot = Math.pow(2, n);
    if (kind === 'exact') { const k = ri(1, n - 1), num = Cn(n, k); return frq(p('A coin is flipped <b>' + n + '</b> times. What is the probability of <b>exactly ' + k + ' head' + (k > 1 ? 's' : '') + '</b>?'), num, tot, 'Every sequence of ' + n + ' flips has probability ' + '(1/2)^' + n + '. Count how many sequences have exactly ' + k + ' head' + (k > 1 ? 's' : '') + '.', 'Sequences with exactly ' + k + ' head' + (k > 1 ? 's' : '') + ': ' + num + '. Each has probability ' + fr(1, tot) + '. P = ' + num + ' · ' + fr(1, tot) + ' = ' + fr(num, tot) + (gcd(num, tot) > 1 ? ' = ' + fl(num, tot) : '') + '.', { needStep: true }); }
    if (kind === 'same') return frq(p('A coin is flipped <b>' + n + '</b> times. What is the probability that <b>all results are the same</b> (all heads or all tails)?'), 2, tot, 'Both "all heads" and "all tails" have probability (1/2)^' + n + '. Add them.', 'P = 2 · ' + fr(1, tot) + ' = ' + fr(2, tot) + ' = ' + fl(2, tot) + '.', { needStep: true });
    return frq(p('A coin is flipped <b>' + n + '</b> times. What is the probability of <b>at least one head</b>?'), tot - 1, tot, 'Use the opposite: no heads at all (all tails). Then do 1 minus that.', 'P(no head) = ' + fr(1, tot) + '. P(at least one head) = 1 − ' + fr(1, tot) + ' = ' + fr(tot - 1, tot) + '.', { needStep: true });
  },
  function atLeastOne(l) {
    const c = pick(CONTEXTS), n = l === 0 ? 2 : l === 1 ? pick([2, 3]) : pick([3, 4]), [a, b] = pick(PF.slice(0, 7)), num = Math.pow(b, n) - Math.pow(b - a, n), den = Math.pow(b, n);
    return frq(p('The probability that ' + c[0] + ' is <b>' + fr(a, b) + '</b>. This is tried <b>' + n + ' times</b>, independently. What is the probability that it ' + c[2] + ' <b>at least once</b>?'), num, den, 'Use the opposite: it never happens. Then do 1 minus that probability.', 'P(never) = ' + times(Array(n).fill(fr(b - a, b))) + ' = ' + fr(Math.pow(b - a, n), den) + '. P(at least once) = 1 − ' + fr(Math.pow(b - a, n), den) + ' = ' + fl(num, den) + '.', { needStep: true });
  },
  function binomTree(l) {
    const n = l < 2 ? 3 : 4, k = l === 0 ? pick([0, n]) : l === 1 ? pick([1, 2]) : 2, useF = l === 2 ? Math.random() < .6 : Math.random() < .35;
    const lab = ['no hits', 'one hit', 'two hits', 'three hits', 'four hits'][k], coef = Cn(n, k);
    if (useF) { const [a, b] = pick([[1, 4], [1, 3], [2, 3], [3, 4], [1, 5]]), q = b - a, num = coef * Math.pow(a, k) * Math.pow(q, n - k), den = Math.pow(b, n);
      return frq(p('An archer hits the target with probability <b>' + fr(a, b) + '</b> per shot. He shoots <b>' + n + '</b> times (independent shots). What is the probability of <b>exactly ' + k + ' hit' + (k === 1 ? '' : 's') + '</b>?'), num, den, 'Count the branches with ' + k + ' hit' + (k === 1 ? '' : 's') + ' (' + coef + ' branch' + (coef > 1 ? 'es' : '') + '). Every branch has the same probability. Multiply and add.', coef + ' branch' + (coef > 1 ? 'es' : '') + ', each with probability ' + (k ? times(Array(k).fill(a + '/' + b)) : '') + (k && n - k ? ' · ' : '') + (n - k ? times(Array(n - k).fill(q + '/' + b)) : '') + '. P = ' + (coef > 1 ? coef + ' · ' : '') + fr(Math.pow(a, k) * Math.pow(q, n - k), den) + ' = ' + fl(num, den) + '.', { needStep: true }); }
    const pr = pick([0.5, 0.6, 0.7, 0.8, 0.9, 0.3, 0.4]), v = coef * Math.pow(pr, k) * Math.pow(1 - pr, n - k), vv = Math.round(v * 1e6) / 1e6;
    return nu(p('A basketball player scores a free throw with probability <b>' + dec(pr) + '</b>. She throws <b>' + n + '</b> times (independent throws). What is the probability of <b>exactly ' + k + ' hit' + (k === 1 ? '' : 's') + '</b>? (Give a decimal.)'), vv, 'Count the branches with ' + k + ' hit' + (k === 1 ? '' : 's') + ' (' + coef + ' branch' + (coef > 1 ? 'es' : '') + '). Every branch has the same probability. Multiply and add.', coef + ' branch' + (coef > 1 ? 'es' : '') + ': P = ' + coef + ' · ' + dec(pr) + '<sup>' + k + '</sup> · ' + dec(1 - pr) + '<sup>' + (n - k) + '</sup> = ' + dec(vv) + '.', { needStep: true, tol: 1e-6, ansText: dec(vv) });
  },
  function independence(l) {
    const t = pick([['A fair coin shows tails 6 times in a row. What is the probability of heads on the <b>next</b> flip?', '1/2', ['more than 1/2', 'less than 1/2'], 'Every flip is independent of the earlier flips. The coin has no memory.'], ['A fair die shows no six in 12 throws. What is the probability of a six on the <b>next</b> throw?', '1/6', ['more than 1/6', 'less than 1/6'], 'Every throw is independent of the earlier throws.'], ['A spinner is red with probability 1/4. It was red three times in a row. What is the probability of red on the <b>next</b> spin?', '1/4', ['more than 1/4', 'less than 1/4'], 'Every spin is independent of the earlier spins.']]);
    return ch(p(t[0]), t[1], t[2], 'Do earlier results influence the next one?', t[3] + ' So the probability stays ' + t[1] + '.', { keys: [] });
  },
  function readTree(l) {
    const pa = pick(l === 0 ? [[1, 2], [1, 3], [2, 3]] : [[1, 4], [3, 4], [2, 5], [3, 5], [1, 6], [5, 6]]), pb = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), k = pick(['AB', 'AA', 'BB', 'BA']);
    const stage = [['R', 'B']];
    const e1 = bi => bi === 0 ? pa[0] + '/' + pa[1] : (pa[1] - pa[0]) + '/' + pa[1], e2 = bi => bi === 0 ? pb[0] + '/' + pb[1] : (pb[1] - pb[0]) + '/' + pb[1];
    const fig = treeSVG({ stages: [['R', 'B'], ['R', 'B']], edge: (st, path, bi) => st === 0 ? e1(bi) : e2(bi), leaf: path => path.join(''), leafW: 100 });
    const i1 = k[0] === 'A' ? 0 : 1, i2 = k[1] === 'A' ? 0 : 1, n1 = i1 === 0 ? pa[0] : pa[1] - pa[0], n2 = i2 === 0 ? pb[0] : pb[1] - pb[0], num = n1 * n2, den = pa[1] * pb[1], w = ['R', 'B'];
    if (l >= 2) {   // spicy: two branches, one of each colour
      const r1 = pa[0], b1 = pa[1] - pa[0], r2 = pb[0], b2 = pb[1] - pb[0], nn = r1 * b2 + b1 * r2;
      return frq(p('The tree diagram shows two independent spins: first spinner 1, then spinner 2. Each spin lands on R (red) or B (blue). What is the probability of <b>one red and one blue</b> (in any order)?') + fig, nn, den, 'Two branches fit: RB and BR. Multiply along each branch, then add.', 'P(RB) = ' + fr(r1, pa[1]) + ' · ' + fr(b2, pb[1]) + ' = ' + fr(r1 * b2, den) + '. P(BR) = ' + fr(b1, pa[1]) + ' · ' + fr(r2, pb[1]) + ' = ' + fr(b1 * r2, den) + '. P = ' + fr(r1 * b2, den) + ' + ' + fr(b1 * r2, den) + ' = ' + fr(nn, den) + (gcd(nn, den) > 1 ? ' = ' + fl(nn, den) : '') + '.', { needStep: true });
    }
    return frq(p('The tree diagram shows two independent spins: first spinner 1, then spinner 2. Each spin lands on R (red) or B (blue). What is the probability of <b>' + w[i1] + ' on the first spin and ' + w[i2] + ' on the second spin</b>?') + fig, num, den, 'Follow the branch for ' + w[i1] + w[i2] + ' and multiply the two probabilities on it.', 'P = ' + fr(n1, pa[1]) + ' · ' + fr(n2, pb[1]) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  }
];
XG['4.4'] = [
  function sameColourTwice(l) {
    const set = pick([[[1, 2], [1, 3], [1, 6]], [[1, 2], [1, 4], [1, 4]], [[1, 3], [1, 3], [1, 3]], [[1, 2], [3, 10], [1, 5]], [[2, 5], [2, 5], [1, 5]]]), cols = ['red', 'blue', 'green'];
    const dn = set.reduce((a, s) => a * s[1] / gcd(a, s[1]), 1) ** 2, num = set.reduce((a, s) => a + Math.pow(s[0] * (Math.sqrt(dn) / s[1]), 2), 0);
    return frq(p('A spinner lands on red with probability ' + fr(set[0][0], set[0][1]) + ', on blue with probability ' + fr(set[1][0], set[1][1]) + ' and on green with probability ' + fr(set[2][0], set[2][1]) + '. It is spun twice. What is the probability that it lands on the <b>same colour twice</b>?'), Math.round(num), dn, 'A tree diagram has 9 branches. Three of them have the same colour twice. Calculate each and add.', 'P = ' + set.map(s => '(' + s[0] + '/' + s[1] + ')<sup>2</sup>').join(' + ') + ' = ' + fl(Math.round(num), dn) + '.', { needStep: true });
  },
  function atLeastTwoOfThree(l) {
    const pr = pick([0.8, 0.7, 0.9, 0.6]), v = 3 * pr * pr * (1 - pr) + Math.pow(pr, 3), vv = Math.round(v * 1e6) / 1e6;
    return nu(p('A student answers each of <b>3</b> quiz questions correctly with probability <b>' + dec(pr) + '</b> (independently). What is the probability that she answers <b>at least 2</b> correctly? (Give a decimal.)'), vv, 'At least 2 means exactly 2 or exactly 3. Calculate both and add.', 'Exactly 2: 3 · ' + dec(pr) + '² · ' + dec(1 - pr) + ' = ' + dec(Math.round(3 * pr * pr * (1 - pr) * 1e6) / 1e6) + '. Exactly 3: ' + dec(pr) + '³ = ' + dec(Math.round(pr * pr * pr * 1e6) / 1e6) + '. Total: ' + dec(vv) + '.', { needStep: true, tol: 1e-6, ansText: dec(vv) });
  },
  function firstSuccess(l) {
    const t = pick([[1, 6, 'a six', 'throw'], [1, 4, 'a heart', 'draw (with the card put back each time)'], [1, 2, 'heads', 'flip']]), k = ri(3, 4), q = t[1] - t[0], num = Math.pow(q, k - 1) * t[0], den = Math.pow(t[1], k);
    return frq(p('You keep going until you get ' + t[2] + '. Each ' + t[3] + ' has probability ' + fr(t[0], t[1]) + ' (independent). What is the probability that you get it <b>for the first time on try number ' + k + '</b>?'), num, den, 'The first ' + (k - 1) + ' tries must <b>not</b> succeed. Then try ' + k + ' succeeds.', 'P = ' + times(Array(k - 1).fill(fr(q, t[1])).concat([fr(t[0], t[1])])) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  }
];

/* ======================= 4.5 Without replacement ======================= */
const ITEMS = [['marbles', 'marble', 'a bag'], ['sweets', 'sweet', 'a tin'], ['socks', 'sock', 'a drawer'], ['balls', 'ball', 'a box']];
function bagText(it, cols) { const tot = cols.reduce((a, c) => a + c[1], 0); return it[2].charAt(0).toUpperCase() + it[2].slice(1) + ' contains ' + cols.map(c => c[1] + ' ' + c[0]).join(', ').replace(/, ([^,]*)$/, ' and $1') + ' ' + it[0] + ' (' + tot + ' in total).'; }
G['4.5'] = [
  function twoDrawsSame(l) {
    const it = pick(ITEMS), r = LR(l, 3, 9), b = LR(l, 2, 8), n = r + b, num = r * (r - 1), den = n * (n - 1);
    return frq(p(bagText(it, [['red', r], ['blue', b]]) + ' You take <b>two</b> ' + it[0] + ' without putting the first back. What is the probability that <b>both are red</b>?'), num, den, 'After the first ' + it[1] + ' is taken, there is one ' + it[1] + ' fewer, and one red fewer too.', 'P = ' + fr(r, n) + ' · ' + fr(r - 1, n - 1) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  },
  function twoDrawsDifferent(l) {
    const it = pick(ITEMS), r = LR(l, 3, 8), b = LR(l, 3, 8), n = r + b, num = 2 * r * b, den = n * (n - 1);
    return frq(p(bagText(it, [['red', r], ['blue', b]]) + ' You take <b>two</b> ' + it[0] + ' without putting the first back. What is the probability that you get <b>one red and one blue</b> (in any order)?'), num, den, 'Two branches: red then blue, or blue then red. Calculate both and add.', 'P = ' + fr(r, n) + ' · ' + fr(b, n - 1) + ' + ' + fr(b, n) + ' · ' + fr(r, n - 1) + ' = ' + fr(r * b, den) + ' + ' + fr(r * b, den) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  },
  function cardsTwo(l) {
    const t = pick([['two aces', 4, 3], ['two hearts', 13, 12], ['two kings', 4, 3], ['two red cards', 26, 25], ['two picture cards (jack, queen or king)', 12, 11], ['two spades', 13, 12]]);
    const num = t[1] * t[2], den = 52 * 51;
    if (l >= 2) {   // spicy: two different kinds, in any order
      const u = pick([['an ace and a king', 'ace', 'king', 4, 4], ['a heart and a spade', 'heart', 'spade', 13, 13], ['a king and a queen', 'king', 'queen', 4, 4], ['an ace and a heart that is not an ace', 'ace', 'heart (not an ace)', 4, 12]]), nn = 2 * u[3] * u[4];
      return frq(p('You draw <b>two cards</b> from a standard deck of 52 cards, without putting the first back. What is the probability of drawing <b>' + u[0] + '</b> (in any order)?'), nn, den, 'Two orders are possible: first the ' + u[1] + ', or first the ' + u[2] + '. Calculate both and add.', 'P(' + u[1] + ', then ' + u[2] + ') = ' + fr(u[3], 52) + ' · ' + fr(u[4], 51) + ' = ' + fr(u[3] * u[4], den) + '. The other order gives the same. P = 2 · ' + fr(u[3] * u[4], den) + ' = ' + fr(nn, den) + (gcd(nn, den) > 1 ? ' = ' + fl(nn, den) : '') + '.', { needStep: true });
    }
    return frq(p('You draw <b>two cards</b> from a standard deck of 52 cards, without putting the first back. What is the probability of drawing <b>' + t[0] + '</b>?'), num, den, 'After the first card, there are 51 cards left, and one fewer of the kind you want.', 'P = ' + fr(t[1], 52) + ' · ' + fr(t[2], 51) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  },
  function atLeastOneWithout(l) {
    const it = pick(ITEMS), r = LR(l, 3, 8), b = LR(l, 3, 8), n = r + b, num = n * (n - 1) - b * (b - 1), den = n * (n - 1);
    return frq(p(bagText(it, [['red', r], ['blue', b]]) + ' You take <b>two</b> ' + it[0] + ' without putting the first back. What is the probability that <b>at least one is red</b>?'), num, den, 'Use the opposite: both are blue. Then do 1 minus that probability.', 'P(both blue) = ' + fr(b, n) + ' · ' + fr(b - 1, n - 1) + ' = ' + fr(b * (b - 1), den) + '. P(at least one red) = 1 − ' + fr(b * (b - 1), den) + ' = ' + fl(num, den) + '.', { needStep: true });
  },
  function lotTickets(l) {
    const n = pick([20, 25, 30, 40, 50]), pz = ri(3, Math.floor(n / 4)), num = n * (n - 1) - (n - pz) * (n - pz - 1), den = n * (n - 1);
    if (l >= 2) {   // spicy: three tickets
      const q = n - pz, d3 = n * (n - 1) * (n - 2), no = q * (q - 1) * (q - 2);
      return frq(p('A lottery has <b>' + n + '</b> tickets, of which <b>' + pz + '</b> win a prize. You buy <b>3</b> tickets. What is the probability that you win <b>at least one prize</b>? (A ticket cannot be drawn twice.)'), d3 - no, d3, 'Use the opposite: no prize with all three tickets.', 'P(no prize) = ' + fr(q, n) + ' · ' + fr(q - 1, n - 1) + ' · ' + fr(q - 2, n - 2) + ' = ' + fr(no, d3) + '. P(at least one prize) = 1 − ' + fr(no, d3) + ' = ' + fl(d3 - no, d3) + '.', { needStep: true });
    }
    return frq(p('A lottery has <b>' + n + '</b> tickets, of which <b>' + pz + '</b> win a prize. You buy <b>2</b> tickets. What is the probability that you win <b>at least one prize</b>? (A ticket cannot be drawn twice.)'), num, den, 'Use the opposite: no prize with both tickets. After the first ticket, one non-winning ticket fewer is left.', 'P(no prize) = ' + fr(n - pz, n) + ' · ' + fr(n - pz - 1, n - 1) + ' = ' + fr((n - pz) * (n - pz - 1), den) + '. P(at least one prize) = 1 − ' + fr((n - pz) * (n - pz - 1), den) + ' = ' + fl(num, den) + '.', { needStep: true });
  },
  function secondDraw(l) {
    const r = ri(3, 6), b = ri(3, 6), n = r + b, first = pick(['red', 'blue']), repl = l === 0 ? Math.random() < .4 : Math.random() < .25, want = pick(['red', 'blue']);
    const right = repl ? 'The probability stays the same' : (first === want ? 'The probability gets smaller' : 'The probability gets bigger');
    return ch(p('A bag contains ' + r + ' red and ' + b + ' blue marbles. You take a marble: it is <b>' + first + '</b>. ' + (repl ? 'You put it <b>back</b>.' : 'You do <b>not</b> put it back.') + ' How does the probability of a <b>' + want + '</b> marble on the second draw compare to the first draw?'), right, ['The probability stays the same', 'The probability gets smaller', 'The probability gets bigger'].filter(x => x !== right), 'Count how many marbles of that colour and how many marbles in total are in the bag for the second draw.', repl ? 'The bag is the same as before, so the probability stays the same.' : 'There is one marble fewer in the bag' + (first === want ? ', and one ' + want + ' fewer, so the fraction gets smaller.' : ', but the number of ' + want + ' marbles stays the same, so the fraction gets bigger.'), { keys: [] });
  },
  function readTreeDep(l) {
    const r = ri(3, 7), b = ri(2, 6), n = r + b, k = pick(['RB', 'BR', 'RR', 'BB']), c = { R: r, B: b };
    const e = (st, path, bi) => { const col = bi === 0 ? 'R' : 'B'; const rem = st === 0 ? { R: r, B: b } : { R: r - (path[0] === 'R' ? 1 : 0), B: b - (path[0] === 'B' ? 1 : 0) }; return rem[col] + '/' + (st === 0 ? n : n - 1); };
    const fig = treeSVG({ stages: [['R', 'B'], ['R', 'B']], edge: e, leaf: path => path.join(''), leafW: 100 });
    const a1 = c[k[0]], a2 = c[k[1]] - (k[0] === k[1] ? 1 : 0), num = a1 * a2, den = n * (n - 1);
    if (l >= 2) {   // spicy: two branches (same colour twice)
      const rr = r * (r - 1), bb = b * (b - 1);
      return frq(p(bagText(['marbles', 'marble', 'a bag'], [['red (R)', r], ['blue (B)', b]]) + ' Two marbles are taken one after the other, <b>without</b> putting the first back. The tree diagram shows the probabilities. What is the probability that both marbles have <b>the same colour</b>?') + fig, rr + bb, den, 'Two branches fit: RR and BB. Multiply along each branch, then add.', 'P(RR) = ' + fr(r, n) + ' · ' + fr(r - 1, n - 1) + ' = ' + fr(rr, den) + '. P(BB) = ' + fr(b, n) + ' · ' + fr(b - 1, n - 1) + ' = ' + fr(bb, den) + '. P = ' + fr(rr + bb, den) + (gcd(rr + bb, den) > 1 ? ' = ' + fl(rr + bb, den) : '') + '.', { needStep: true });
    }
    return frq(p(bagText(['marbles', 'marble', 'a bag'], [['red (R)', r], ['blue (B)', b]]) + ' Two marbles are taken one after the other, <b>without</b> putting the first back. The tree diagram shows the probabilities. What is the probability of <b>' + (k[0] === 'R' ? 'red' : 'blue') + ' first and then ' + (k[1] === 'R' ? 'red' : 'blue') + '</b>?') + fig, num, den, 'Follow the branch ' + k + ' and multiply the two probabilities on it.', 'P = ' + fr(a1, n) + ' · ' + fr(a2, n - 1) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  }
];
XG['4.5'] = [
  function threeSame(l) {
    const it = pick(ITEMS), r = ri(4, 7), b = ri(3, 6), n = r + b, num = r * (r - 1) * (r - 2) + b * (b - 1) * (b - 2), den = n * (n - 1) * (n - 2);
    return frq(p(bagText(it, [['red', r], ['blue', b]]) + ' You take <b>three</b> ' + it[0] + ' without putting them back. What is the probability that <b>all three have the same colour</b>?'), num, den, 'Two branches: three red, or three blue. Calculate both and add.', 'P(RRR) = ' + fr(r, n) + ' · ' + fr(r - 1, n - 1) + ' · ' + fr(r - 2, n - 2) + ' = ' + fr(r * (r - 1) * (r - 2), den) + '. P(BBB) = ' + fr(b * (b - 1) * (b - 2), den) + '. Total: ' + fl(num, den) + '.', { needStep: true });
  },
  function exactlyOneOfThree(l) {
    const it = pick(ITEMS), r = ri(3, 6), b = ri(4, 7), n = r + b, num = 3 * r * b * (b - 1), den = n * (n - 1) * (n - 2);
    return frq(p(bagText(it, [['red', r], ['blue', b]]) + ' You take <b>three</b> ' + it[0] + ' without putting them back. What is the probability that <b>exactly one is red</b>?'), num, den, 'There are three branches (the red one is first, second or third). Every branch has the same probability.', 'P = 3 · ' + fr(r, n) + ' · ' + fr(b, n - 1) + ' · ' + fr(b - 1, n - 2) + ' = ' + fr(num, den) + (gcd(num, den) > 1 ? ' = ' + fl(num, den) : '') + '.', { needStep: true });
  },
  function groupAtLeastOne(l) {
    const m = ri(6, 10), g = ri(5, 9), n = m + g, num = n * (n - 1) * (n - 2) - m * (m - 1) * (m - 2), den = n * (n - 1) * (n - 2);
    return frq(p('A group has <b>' + m + ' boys</b> and <b>' + g + ' girls</b>. The teacher chooses <b>3</b> students at random. What is the probability that <b>at least one is a girl</b>?'), num, den, 'Use the opposite: all three are boys. Then do 1 minus that probability.', 'P(three boys) = ' + fr(m, n) + ' · ' + fr(m - 1, n - 1) + ' · ' + fr(m - 2, n - 2) + ' = ' + fr(m * (m - 1) * (m - 2), den) + '. P(at least one girl) = 1 − ' + fr(m * (m - 1) * (m - 2), den) + ' = ' + fl(num, den) + '.', { needStep: true });
  }
];

const SECTIONS = [
  { id: '4.1', title: '4.1 Grids and tree diagrams', sub: 'Counting outcomes with a grid or a tree' },
  { id: '4.2', title: '4.2 Counting by multiplying', sub: 'Choices, codes, orders, Venn diagrams' },
  { id: '4.3', title: '4.3 Probability', sub: 'Fractions, percentages, relative frequency, area' },
  { id: '4.4', title: '4.4 Tree diagrams', sub: 'Repeated events, "at least one"' },
  { id: '4.5', title: '4.5 Without replacement', sub: 'Dependent events and trees' }
];
const GOALS = [
  ['4.1', 'I can count all outcomes with a grid or a tree diagram', ['gridSize', 'sumWays', 'bestSum', 'gridCount', 'coinWays', 'gridOrTree'], 'A grid has two directions. For three or more steps, use a tree diagram.'],
  ['4.2', 'I can count the number of possibilities by multiplying', ['choiceCount', 'codeCount', 'arrangeCount', 'numbersFromDigits'], 'Multiply the number of choices for every step. Start with the step that has a restriction.'],
  ['4.2', 'I can use a Venn diagram', ['vennRead', 'vennCalc']],
  ['4.3', 'I can write a probability as a fraction, a decimal and a percentage', ['convertProb', 'probCheck'], 'A probability is between 0 and 1.'],
  ['4.3', 'I can calculate the probability of a simple event', ['diceProb', 'bagProb', 'cardProb', 'gridProb', 'areaProb'], 'Probability = favourable outcomes ÷ possible outcomes.'],
  ['4.3', 'I can use relative frequency and the law of large numbers', ['relFreq', 'expectedCount', 'lawLarge']],
  ['4.4', 'I can use a tree diagram for repeated events', ['bothSuccess', 'twoDifferent', 'diceTree', 'coinTree', 'readTree'], 'Multiply along a branch. Add the branches that fit.'],
  ['4.4', 'I can calculate "at least one" and "exactly k" probabilities', ['atLeastOne', 'binomTree', 'independence'], '"At least one" = 1 − P(none).'],
  ['4.5', 'I can calculate probabilities when you do not put things back', ['twoDrawsSame', 'twoDrawsDifferent', 'cardsTwo', 'readTreeDep', 'secondDraw'], 'Every next draw has one item fewer.'],
  ['4.5', 'I can use the opposite to find "at least one" without replacement', ['atLeastOneWithout', 'lotTickets']]
];
  /* ---------- lessons (generated from the 2026-27 study guides) ---------- */
  const __has = (L, g) => (L[g[0]] || []).some(f => f.name === g[1]);
  const __LESSONS = ({
    "2HT": [
      {"id": "D1", "title": "Lesson · 4.1 A Grids and tree diagrams", "sub": "Wed 16 Dec · ex 1, 2, 3, 5, 6, 7abc", "date": "2026-12-16", "gens": [["4.1", "gridSize"], ["4.1", "sumWays"], ["4.1", "bestSum"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"]]},
      {"id": "D2", "title": "Lesson · 4.1 B Grids and tree diagrams", "sub": "Thu 17 Dec · ex 8, 9, 11, 12, 15", "date": "2026-12-17", "gens": [["4.1", "sumWays"], ["4.1", "bestSum"], ["4.1", "gridCount"], ["4.1", "coinWays"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"]]},
      {"id": "D3", "title": "Lesson · 4.2 A Counting by multiplying", "sub": "Wed 6 Jan · ex 21, 22, 23, 24, 25", "date": "2027-01-06", "gens": [["4.2", "choiceCount"], ["4.2", "codeCount"], ["4.2", "arrangeCount"]], "xg": [["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"]]},
      {"id": "D4", "title": "Lesson · 4.2 B Counting by multiplying", "sub": "Thu 7 Jan · ex 27, 28, 29, 30", "date": "2027-01-07", "gens": [["4.2", "codeCount"], ["4.2", "arrangeCount"], ["4.2", "numbersFromDigits"]], "xg": [["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"]]},
      {"id": "D5", "title": "Lesson · 4.3 A Probability", "sub": "Fri 8 Jan · ex 37, 38, 39, 40, 41", "date": "2027-01-08", "gens": [["4.3", "convertProb"], ["4.3", "probCheck"], ["4.3", "diceProb"], ["4.3", "bagProb"]], "xg": [["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"]]},
      {"id": "D6", "title": "Lesson · 4.3 B Probability", "sub": "Wed 13 Jan · ex 42, 43, 44, 45, 46", "date": "2027-01-13", "gens": [["4.3", "bagProb"], ["4.3", "cardProb"], ["4.3", "gridProb"], ["4.3", "relFreq"]], "xg": [["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"]]},
      {"id": "D7", "title": "Lesson · 4.4 Tree diagrams", "sub": "Fri 15 Jan · ex 53, 54abcde, 55, 56, 57", "date": "2027-01-15", "gens": [["4.4", "bothSuccess"], ["4.4", "twoDifferent"], ["4.4", "diceTree"]], "xg": [["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"]]},
      {"id": "D8", "title": "Lesson · 4.4 Tree diagrams + 4.5 Without replacement", "sub": "Wed 20 Jan · ex 59, 60, 61, 68, 69", "date": "2027-01-20", "gens": [["4.4", "diceTree"], ["4.4", "coinTree"], ["4.4", "atLeastOne"], ["4.5", "twoDrawsSame"], ["4.5", "twoDrawsDifferent"], ["4.5", "cardsTwo"]], "xg": [["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"], ["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]]},
      {"id": "D9", "title": "Lesson · 4.5 Without replacement", "sub": "Thu 21 Jan · ex 70, 71, 72, 73, 74", "date": "2027-01-21", "gens": [["4.5", "twoDrawsSame"], ["4.5", "twoDrawsDifferent"], ["4.5", "cardsTwo"], ["4.5", "atLeastOneWithout"]], "xg": [["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]]},
      {"id": "D10", "title": "Test prep · chapter 4", "sub": "Wed 27 Jan · ex 75, 76", "date": "2027-01-27", "gens": [["4.1", "gridSize"], ["4.1", "sumWays"], ["4.1", "bestSum"], ["4.1", "gridCount"], ["4.1", "coinWays"], ["4.1", "gridOrTree"], ["4.2", "choiceCount"], ["4.2", "codeCount"], ["4.2", "arrangeCount"], ["4.2", "numbersFromDigits"], ["4.2", "vennRead"], ["4.2", "vennCalc"], ["4.3", "convertProb"], ["4.3", "probCheck"], ["4.3", "diceProb"], ["4.3", "bagProb"], ["4.3", "cardProb"], ["4.3", "gridProb"], ["4.3", "relFreq"], ["4.3", "expectedCount"], ["4.3", "lawLarge"], ["4.3", "areaProb"], ["4.4", "bothSuccess"], ["4.4", "twoDifferent"], ["4.4", "diceTree"], ["4.4", "coinTree"], ["4.4", "atLeastOne"], ["4.4", "binomTree"], ["4.4", "independence"], ["4.4", "readTree"], ["4.5", "twoDrawsSame"], ["4.5", "twoDrawsDifferent"], ["4.5", "cardsTwo"], ["4.5", "atLeastOneWithout"], ["4.5", "lotTickets"], ["4.5", "secondDraw"], ["4.5", "readTreeDep"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"], ["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"], ["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"], ["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"], ["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]], "rev": true},
      {"id": "D11", "title": "Test prep · chapter 4", "sub": "Thu 28 Jan · ex 83, 84, 86, 88, 90", "date": "2027-01-28", "gens": [["4.1", "gridSize"], ["4.1", "sumWays"], ["4.1", "bestSum"], ["4.1", "gridCount"], ["4.1", "coinWays"], ["4.1", "gridOrTree"], ["4.2", "choiceCount"], ["4.2", "codeCount"], ["4.2", "arrangeCount"], ["4.2", "numbersFromDigits"], ["4.2", "vennRead"], ["4.2", "vennCalc"], ["4.3", "convertProb"], ["4.3", "probCheck"], ["4.3", "diceProb"], ["4.3", "bagProb"], ["4.3", "cardProb"], ["4.3", "gridProb"], ["4.3", "relFreq"], ["4.3", "expectedCount"], ["4.3", "lawLarge"], ["4.3", "areaProb"], ["4.4", "bothSuccess"], ["4.4", "twoDifferent"], ["4.4", "diceTree"], ["4.4", "coinTree"], ["4.4", "atLeastOne"], ["4.4", "binomTree"], ["4.4", "independence"], ["4.4", "readTree"], ["4.5", "twoDrawsSame"], ["4.5", "twoDrawsDifferent"], ["4.5", "cardsTwo"], ["4.5", "atLeastOneWithout"], ["4.5", "lotTickets"], ["4.5", "secondDraw"], ["4.5", "readTreeDep"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"], ["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"], ["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"], ["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"], ["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]], "rev": true}
    ],
    "2VT": [
      {"id": "D1", "title": "Lesson · 4.1 A Grids and tree diagrams", "sub": "Fri 11 Dec · ex 1, 2, 3, 5, 6, 8", "date": "2026-12-11", "gens": [["4.1", "gridSize"], ["4.1", "sumWays"], ["4.1", "bestSum"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"]]},
      {"id": "D2", "title": "Lesson · 4.1 B Grids and tree diagrams", "sub": "Tue 15 Dec · ex 9, 11, 13, 15, 16a", "date": "2026-12-15", "gens": [["4.1", "sumWays"], ["4.1", "bestSum"], ["4.1", "gridCount"], ["4.1", "coinWays"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"]]},
      {"id": "D3", "title": "Lesson · 4.1 C Grids and tree diagrams", "sub": "Wed 16 Dec · ex 17, 18, 19, 20", "date": "2026-12-16", "gens": [["4.1", "gridCount"], ["4.1", "coinWays"], ["4.1", "gridOrTree"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"]]},
      {"id": "D4", "title": "Lesson · 4.2 A Counting by multiplying", "sub": "Tue 5 Jan · ex 23, 25, 27, 29, 30", "date": "2027-01-05", "gens": [["4.2", "choiceCount"], ["4.2", "codeCount"], ["4.2", "arrangeCount"], ["4.2", "numbersFromDigits"]], "xg": [["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"]]},
      {"id": "D5", "title": "Lesson · 4.2 B Counting by multiplying", "sub": "Wed 6 Jan · ex 31, 32, 33, 34, 36", "date": "2027-01-06", "gens": [["4.2", "numbersFromDigits"], ["4.2", "vennRead"], ["4.2", "vennCalc"]], "xg": [["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"]]},
      {"id": "D6", "title": "Lesson · 4.3 A Probability", "sub": "Fri 8 Jan · ex 38, 39, 42, 43, 44, 47", "date": "2027-01-08", "gens": [["4.3", "convertProb"], ["4.3", "probCheck"], ["4.3", "diceProb"], ["4.3", "bagProb"], ["4.3", "cardProb"], ["4.3", "gridProb"], ["4.3", "relFreq"]], "xg": [["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"]]},
      {"id": "D7", "title": "Lesson · 4.3 B Probability", "sub": "Tue 12 Jan · ex 49, 50, 51, 52", "date": "2027-01-12", "gens": [["4.3", "expectedCount"], ["4.3", "lawLarge"], ["4.3", "areaProb"]], "xg": [["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"]]},
      {"id": "D8", "title": "Lesson · 4.4 A Tree diagrams", "sub": "Wed 13 Jan · ex 54, 56, 59, 60, 61", "date": "2027-01-13", "gens": [["4.4", "bothSuccess"], ["4.4", "twoDifferent"], ["4.4", "diceTree"], ["4.4", "coinTree"], ["4.4", "atLeastOne"]], "xg": [["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"]]},
      {"id": "D9", "title": "Lesson · 4.4 B Tree diagrams", "sub": "Fri 15 Jan · ex 62, 63, 64, 65, 66", "date": "2027-01-15", "gens": [["4.4", "atLeastOne"], ["4.4", "binomTree"], ["4.4", "independence"], ["4.4", "readTree"]], "xg": [["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"]]},
      {"id": "D10", "title": "Lesson · 4.5 A Without replacement", "sub": "Tue 19 Jan · ex 68, 71, 72, 73, 75, 76", "date": "2027-01-19", "gens": [["4.5", "twoDrawsSame"], ["4.5", "twoDrawsDifferent"], ["4.5", "cardsTwo"], ["4.5", "atLeastOneWithout"], ["4.5", "lotTickets"]], "xg": [["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]]},
      {"id": "D11", "title": "Lesson · 4.5 B Without replacement", "sub": "Wed 20 Jan · ex 78, 79, 80, 81", "date": "2027-01-20", "gens": [["4.5", "lotTickets"], ["4.5", "secondDraw"], ["4.5", "readTreeDep"]], "xg": [["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]]},
      {"id": "D12", "title": "Test prep · chapter 4", "sub": "Tue 26 Jan · ex 83, 84, 86, 88, 90", "date": "2027-01-26", "gens": [["4.1", "gridSize"], ["4.1", "sumWays"], ["4.1", "bestSum"], ["4.1", "gridCount"], ["4.1", "coinWays"], ["4.1", "gridOrTree"], ["4.2", "choiceCount"], ["4.2", "codeCount"], ["4.2", "arrangeCount"], ["4.2", "numbersFromDigits"], ["4.2", "vennRead"], ["4.2", "vennCalc"], ["4.3", "convertProb"], ["4.3", "probCheck"], ["4.3", "diceProb"], ["4.3", "bagProb"], ["4.3", "cardProb"], ["4.3", "gridProb"], ["4.3", "relFreq"], ["4.3", "expectedCount"], ["4.3", "lawLarge"], ["4.3", "areaProb"], ["4.4", "bothSuccess"], ["4.4", "twoDifferent"], ["4.4", "diceTree"], ["4.4", "coinTree"], ["4.4", "atLeastOne"], ["4.4", "binomTree"], ["4.4", "independence"], ["4.4", "readTree"], ["4.5", "twoDrawsSame"], ["4.5", "twoDrawsDifferent"], ["4.5", "cardsTwo"], ["4.5", "atLeastOneWithout"], ["4.5", "lotTickets"], ["4.5", "secondDraw"], ["4.5", "readTreeDep"]], "xg": [["4.1", "threeDiceSum"], ["4.1", "atMostHeads"], ["4.2", "atLeastOneTail"], ["4.2", "bigPassword"], ["4.2", "oddFirstDifferent"], ["4.2", "committee"], ["4.3", "pinAllDifferent"], ["4.3", "spinnersPrime"], ["4.3", "ringTarget"], ["4.4", "sameColourTwice"], ["4.4", "atLeastTwoOfThree"], ["4.4", "firstSuccess"], ["4.5", "threeSame"], ["4.5", "exactlyOneOfThree"], ["4.5", "groupAtLeastOne"]], "rev": true}
    ]
  }[P.cls] || []).map(o => Object.assign({}, o, { gens: o.gens.filter(g => __has(G, g)), xg: o.xg.filter(g => __has(XG, g)) })).filter(o => o.gens.length);
  /* ---------- end lessons ---------- */
return { key: 'nx-' + P.cls.toLowerCase() + '-ch4-v1', SECTIONS, LESSONS: __LESSONS, G, XG, TEST: { skip: ['gridOrTree', 'convertProb', 'probCheck', 'lawLarge', 'independence', 'secondDraw', 'gridSize'] }, defaultMode: __LESSONS.length ? 'lesson' : 'para', GOALS };
