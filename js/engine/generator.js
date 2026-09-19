// יצירת תרגילים פרוצדורלית מתוך אילוצי השלב — חשבון בלבד (כיתה ג' לנויה, גיל הגן לאלין)
import { pools } from '../curriculum/alin.js';

const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const chance = p => Math.random() < p;

// טווח: { min, max } | { min, max, step } | { choices: [...] }
function riRange(r) {
  if (r.choices) return pick(r.choices);
  if (r.step) {
    const steps = Math.floor((r.max - r.min) / r.step);
    return r.min + r.step * ri(0, steps);
  }
  return ri(r.min, r.max);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// המרה/פריטה בכל עמודה (לא רק באחדות) — נכון גם למספרים תלת-ספרתיים
export function carries(a, b) {
  for (; a > 0 || b > 0; a = Math.floor(a / 10), b = Math.floor(b / 10)) {
    if ((a % 10) + (b % 10) >= 10) return true;
  }
  return false;
}
export function borrows(a, b) {
  for (; b > 0; a = Math.floor(a / 10), b = Math.floor(b / 10)) {
    if ((a % 10) < (b % 10)) return true;
  }
  return false;
}

// מספרים כמילים מנוקדות, מותאמות למין השם הנספר — כך ה-TTS מבטא אותם נכון
const NUM_WORDS_F = ['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר'];
const NUM_WORDS_M = ['אֶפֶס', 'אֶחָד', 'שְׁנַיִם', 'שְׁלוֹשָׁה', 'אַרְבָּעָה', 'חֲמִשָּׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה'];
const numWord = (n, g = 'f') => (g === 'm' ? NUM_WORDS_M : NUM_WORDS_F)[n] || String(n);

// "בְּ" + מילת מספר עם שינוי הניקוד הנדרש: בִּשְׁתַּיִם, בַּחֲמִשָּׁה, בְּאַרְבַּע
function beNumWord(n, g) {
  const w = numWord(n, g);
  if (w.startsWith('שְׁ')) return 'בִּ' + w;
  if (w.startsWith('חֲ')) return 'בַּ' + w;
  return 'בְּ' + w;
}

function regroupOk(level, op, a, b) {
  const rg = level.regroup || 'any';
  if (rg === 'any') return true;
  const has = op === 'add' ? carries(a, b) : borrows(a, b);
  return rg === 'required' ? has : !has;
}

export function generateRound(level) {
  const questions = [];
  const recent = [];
  for (let i = 0; i < level.questions; i++) {
    let q = makeQuestion(level);
    for (let t = 0; t < 40 && recent.includes(q.key); t++) q = makeQuestion(level);
    recent.push(q.key);
    if (recent.length > 3) recent.shift();
    questions.push(q);
  }
  return questions;
}

// מבחן: שאלות מכל שלבי העולם (או מכל העולמות במבחן המסכם), מעורבבות, בלי חזרות
export function generateExam(levels, count) {
  const order = [];
  while (order.length < count) order.push(...shuffle(levels));
  const questions = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const level = order[i];
    let q = makeQuestion(level);
    for (let t = 0; t < 40 && seen.has(q.key); t++) q = makeQuestion(level);
    seen.add(q.key);
    q.levelId = level.id;
    questions.push(q);
  }
  return shuffle(questions);
}

export function makeQuestion(level) {
  return level.op ? makeEquation(level) : makeVisual(level);
}

// ===== תרגילי כיתה ג' (נויה) =====

const MAKERS = {
  mul: makeMul, mulMissing: makeMul,
  div: makeDiv, divMissing: makeDiv,
  divRem: makeDivRem,
  word: makeWord,
  placeValue: makePlaceValue,
  compose: makeCompose,
  compare: makeCompare,
  evenOdd: makeEvenOdd,
  round: makeRound,
  sequence: makeSequence,
  orderOps: makeOrderOps,
  fracShape: makeFracShape,
  fracOf: makeFracOf,
  fracCompare: makeFracCompare,
  clockRead: makeClockRead,
  timeAdd: makeTimeAdd,
  duration: makeDuration,
  units: makeUnits,
  sides: makeSides,
  shapeName: makeShapeName,
  perimeter: makePerimeter,
  area: makeArea,
};

function makeEquation(level) {
  const maker = MAKERS[level.op];
  if (maker) return maker(level);

  for (let t = 0; t < 600; t++) {
    let op = level.op;
    if (op === 'mixed') op = pick(['add', 'sub']);
    if (op === 'boss') op = pick(level.base || ['add', 'sub', 'missing']);

    if (op === 'add3') {
      const a = riRange(level.a), b = riRange(level.b), c = riRange(level.c);
      const sum = a + b + c;
      if (sum > level.result.max) continue;
      return eq([a, '+', b, '+', c, '=', '?'], sum, `${a} וְעוֹד ${b} וְעוֹד ${c}`);
    }

    if (op === 'missing') {
      const base = pick(level.base?.filter(b => b === 'add' || b === 'sub') || ['add']);
      if (base === 'add') {
        let a = riRange(level.a), b = riRange(level.b);
        let sum = a + b;
        if (level.sumExact && chance(level.sumExactChance || 0.5)) {
          sum = level.sumExact;
          b = sum - a;
          if (b < 1) continue;
        }
        if (sum > level.result.max || !checkResult(level, sum)) continue;
        if (!regroupOk(level, 'add', a, b)) continue;
        return eq([a, '+', '?', '=', sum], b, `${a} וְעוֹד כַּמָּה שָׁוֶה ${sum}?`);
      } else {
        let a = riRange(level.a), b = riRange(level.b);
        if (a < b) [a, b] = [b, a];
        const diff = a - b;
        if (!checkResult(level, diff) || diff === 0) continue;
        if (!regroupOk(level, 'sub', a, b)) continue;
        return eq([a, '−', '?', '=', diff], b, `${a} פָּחוֹת כַּמָּה שָׁוֶה ${diff}?`);
      }
    }

    if (op === 'add') {
      const a = riRange(level.a), b = riRange(level.b);
      const sum = a + b;
      if (sum > level.result.max || !checkResult(level, sum)) continue;
      if (!regroupOk(level, 'add', a, b)) continue;
      return eq([a, '+', b, '=', '?'], sum, `${a} וְעוֹד ${b}`);
    }

    if (op === 'sub') {
      let a = riRange(level.a), b = riRange(level.b);
      if (a < b) [a, b] = [b, a];
      if (a === b && (level.result.min ?? 0) > 0) continue;
      const diff = a - b;
      if (!checkResult(level, diff)) continue;
      if (!regroupOk(level, 'sub', a, b)) continue;
      return eq([a, '−', b, '=', '?'], diff, `${a} פָּחוֹת ${b}`);
    }
  }
  // לא אמור לקרות (האילוצים בקוריקולום ניתנים לסיפוק) — תרגיל בטוח כגיבוי
  return eq([2, '+', 3, '=', '?'], 5, '2 וְעוֹד 3');
}

function makeMul(level) {
  let table, b, prod;
  for (let t = 0; t < 200; t++) {
    table = pick(level.tables);
    b = riRange(level.b);
    prod = table * b;
    if (!level.result?.max || prod <= level.result.max) break;
  }
  // מערבבים את סדר האופרנדים — 3×7 וגם 7×3
  const [x, y] = chance(0.5) ? [table, b] : [b, table];
  if (level.op === 'mulMissing') {
    return eq([x, '×', '?', '=', prod], y, `${x} כָּפוּל כַּמָּה שָׁוֶה ${prod}?`);
  }
  return eq([x, '×', y, '=', '?'], prod, `${x} כָּפוּל ${y}`);
}

function makeDiv(level) {
  const d = pick(level.divisors);
  const q = riRange(level.q);
  const dividend = d * q; // תמיד מתחלק בלי שארית
  if (level.op === 'divMissing') {
    return eq([dividend, ':', '?', '=', q], d, `${dividend} לְחַלֵּק לְכַמָּה שָׁוֶה ${q}?`);
  }
  return eq([dividend, ':', d, '=', '?'], q, `${dividend} לְחַלֵּק לְ${d}`);
}

// חילוק עם שארית: שני חלונות תשובה — מנה ושארית
function makeDivRem(level) {
  const d = pick(level.divisors);
  const q = riRange(level.q);
  const r = chance(level.remZero ?? 0) ? 0 : ri(1, d - 1);
  const dividend = d * q + r;
  return {
    ...eq([dividend, ':', d, '=', '?', { text: 'שארית' }, '?'], [q, r],
      `${dividend} לְחַלֵּק לְ${d}. כַּמָּה הַמָּנָה, וְכַמָּה הַשְּׁאֵרִית?`),
    key: `rem:${dividend}:${d}`,
    meta: { dividend, d },
  };
}

// ===== המבנה העשרוני =====

const PLACE_NAMES = ['האחדות', 'העשרות', 'המאות'];
const PLACE_TTS = ['הָאֲחָדוֹת', 'הָעֲשָׂרוֹת', 'הַמֵּאוֹת'];
const digitAt = (n, pos) => Math.floor(n / 10 ** pos) % 10;

function makePlaceValue(level) {
  const variant = pick(level.variants || ['digit']);
  for (let t = 0; t < 200; t++) {
    const n = riRange(level.range);
    const pos = ri(0, String(n).length - 1);
    const digit = digitAt(n, pos);
    if (variant === 'digit') {
      return slotQ({
        prompt: `איזו ספרה נמצאת במקום ${PLACE_NAMES[pos]}?`,
        tts: `בַּמִּסְפָּר ${n}, אֵיזוֹ סִפְרָה נִמְצֵאת בִּמְקוֹם ${PLACE_TTS[pos]}?`,
        display: { bigDigit: n },
        answer: digit,
        key: `pv:${n}:${pos}`,
        meta: { n, pos },
      });
    }
    // ערך הספרה — רק אם הספרה מופיעה פעם אחת במספר (שלא תהיה דו-משמעות)
    if (digit === 0 || String(n).split(String(digit)).length !== 2) continue;
    return slotQ({
      prompt: `מה הערך של הספרה ${digit} במספר?`,
      tts: `מָה הָעֵרֶךְ שֶׁל הַסִּפְרָה ${digit} בַּמִּסְפָּר ${n}?`,
      display: { bigDigit: n },
      answer: digit * 10 ** pos,
      key: `pvv:${n}:${digit}`,
      meta: { n, digit, pos },
    });
  }
  return slotQ({ prompt: 'איזו ספרה נמצאת במקום המאות?', tts: 'בַּמִּסְפָּר 345, אֵיזוֹ סִפְרָה בִּמְקוֹם הַמֵּאוֹת?', display: { bigDigit: 345 }, answer: 3, key: 'pv:345:2', meta: { n: 345, pos: 2 } });
}

function makeCompose(level) {
  for (let t = 0; t < 200; t++) {
    const n = riRange(level.range);
    const h = digitAt(n, 2), te = digitAt(n, 1), u = digitAt(n, 0);
    const terms = [h * 100, te * 10, u].filter(v => v > 0);
    if (terms.length < 2) continue;
    if (chance(0.5) || terms.length < 3) {
      // 300 + 40 + 7 = ?
      const parts = [];
      terms.forEach((v, i) => { if (i) parts.push('+'); parts.push(v); });
      parts.push('=', '?');
      return eq(parts, n, `${terms.join(' וְעוֹד ')} שָׁוֶה כַּמָּה?`);
    }
    // 300 + ? + 7 = 347  (כל הספרות שונות מאפס)
    const hide = ri(0, 2);
    const parts = [];
    terms.forEach((v, i) => { if (i) parts.push('+'); parts.push(i === hide ? '?' : v); });
    parts.push('=', n);
    return eq(parts, terms[hide], `${terms.map((v, i) => (i === hide ? 'כַּמָּה' : v)).join(' וְעוֹד ')} שָׁוֶה ${n}?`);
  }
  return eq([300, '+', 40, '+', 7, '=', '?'], 347, '300 וְעוֹד 40 וְעוֹד 7');
}

function makeCompare(level) {
  const a = riRange(level.range);
  let b;
  const mode = Math.random();
  if (mode < 0.15) b = a;
  else if (mode < 0.55) {
    // מספרים "קרובים" — החלפת ספרות או שינוי קטן
    const s = String(a).split('');
    const swapped = s.length >= 2 ? Number(s.slice().reverse().join('')) : a;
    const candidates = [a + 1, a - 1, a + 10, a - 10, a + 100, a - 100, swapped]
      .filter(v => v !== a && v >= level.range.min && v <= level.range.max);
    b = pick(candidates);
  } else {
    b = riRange(level.range);
  }
  const sign = a < b ? '<' : a > b ? '>' : '=';
  const signs = ['<', '>', '='];
  return {
    mode: 'cards',
    prompt: 'איזה סימן מתאים?',
    tts: `אֵיזֶה סִימָן מַתְאִים בֵּין ${a} לְ-${b}: גָּדוֹל, קָטָן אוֹ שָׁוֶה?`,
    display: { compare: [a, b] },
    cards: { kind: 'sign', signs, correctIndex: signs.indexOf(sign) },
    key: `cmp:${a},${b}`,
    meta: { a, b },
  };
}

function makeEvenOdd(level) {
  const n = riRange(level.range || { min: 1, max: 999 });
  const words = ['זוגי', 'אי-זוגי'];
  return {
    mode: 'cards',
    prompt: 'זוגי או אי-זוגי?',
    tts: `הַמִּסְפָּר ${n} — זוּגִי אוֹ אִי-זוּגִי?`,
    display: { bigDigit: n },
    cards: { kind: 'word', words, correctIndex: n % 2 === 0 ? 0 : 1 },
    key: `eo:${n}`,
    meta: { n },
  };
}

function makeRound(level) {
  const to = pick(level.to);
  let n = riRange(level.range);
  for (let t = 0; t < 50 && n % to === 0; t++) n = riRange(level.range);
  const answer = Math.round(n / to) * to;
  const word = to === 10 ? 'לעשרת' : 'למאה';
  const wordTts = to === 10 ? 'לָעֲשֶׂרֶת' : 'לַמֵּאָה';
  return slotQ({
    prompt: `עגלי את המספר ${word} הקרובה`,
    tts: `עַגְּלִי אֶת הַמִּסְפָּר ${n} ${wordTts} הַקְּרוֹבָה`,
    display: { bigDigit: n },
    answer,
    key: `rnd:${n}:${to}`,
    meta: { n, to },
  });
}

function makeSequence(level) {
  const step = pick(level.steps);
  const shown = level.shown || 4;
  const dir = level.dir === 'both' ? pick(['up', 'down']) : (level.dir || 'up');
  // 60%: כפולות של הדילוג (3, 6, 9...), 40%: התחלה חופשית (7, 9, 11...)
  const start = chance(0.6)
    ? step * ri(1, Math.max(1, Math.floor(level.start.max / step)))
    : ri(level.start.min, level.start.max);
  let seq = [];
  for (let i = 0; i <= shown; i++) seq.push(start + step * i);
  if (dir === 'down') seq.reverse();
  const answer = seq[shown];
  seq = seq.slice(0, shown);
  return slotQ({
    prompt: 'איזה מספר בא אחר כך?',
    tts: `${seq.join(', ')}. אֵיזֶה מִסְפָּר בָּא אַחַר כָּךְ?`,
    display: { sequence: seq.map(String), next: true, ltr: true },
    answer,
    key: `seq:${seq.join(',')}`,
    meta: { seq, step: dir === 'down' ? -step : step },
  });
}

// ===== סדר פעולות =====
// כל התוצאות והביניים שלמים, אי-שליליים ועד 100
function makeOrderOps(level) {
  const form = pick(level.forms);
  let a, b, c, parts, answer;
  switch (form) {
    case 'a+b×c': b = ri(2, 9); c = ri(2, 9); a = ri(1, 100 - b * c); parts = [a, '+', b, '×', c]; answer = a + b * c; break;
    case 'a×b+c': a = ri(2, 9); b = ri(2, 9); c = ri(1, 100 - a * b); parts = [a, '×', b, '+', c]; answer = a * b + c; break;
    case 'a−b×c': b = ri(2, 9); c = ri(2, 9); a = ri(b * c + 1, 100); parts = [a, '−', b, '×', c]; answer = a - b * c; break;
    case 'a×b−c': a = ri(2, 9); b = ri(2, 9); c = ri(1, a * b - 1); parts = [a, '×', b, '−', c]; answer = a * b - c; break;
    case 'a+b:c': c = ri(2, 9); b = c * ri(1, 9); a = ri(1, 50); parts = [a, '+', b, ':', c]; answer = a + b / c; break;
    case 'a−b:c': c = ri(2, 9); b = c * ri(1, 9); a = ri(b / c + 1, 60); parts = [a, '−', b, ':', c]; answer = a - b / c; break;
    case 'a:b+c': b = ri(2, 9); a = b * ri(1, 9); c = ri(1, 40); parts = [a, ':', b, '+', c]; answer = a / b + c; break;
    case '(a+b)×c': a = ri(1, 9); b = ri(1, 9); c = ri(2, 5); parts = ['(', a, '+', b, ')', '×', c]; answer = (a + b) * c; break;
    case '(a−b)×c': c = ri(2, 5); a = ri(3, 20); b = ri(1, a - 1); while ((a - b) * c > 100) b++; parts = ['(', a, '−', b, ')', '×', c]; answer = (a - b) * c; break;
    case '(a+b):c': { c = ri(2, 9); const s = c * ri(1, 9); a = ri(1, s - 1); b = s - a; parts = ['(', a, '+', b, ')', ':', c]; answer = s / c; break; }
    case '(a−b):c': { c = ri(2, 9); const d = c * ri(1, 9); b = ri(1, 20); a = d + b; parts = ['(', a, '−', b, ')', ':', c]; answer = d / c; break; }
    default: a = 2; b = 3; c = 4; parts = [a, '+', b, '×', c]; answer = 14;
  }
  const text = parts.join(' ');
  return {
    ...eq([...parts, '=', '?'], answer, `כַּמָּה זֶה ${ttsExpr(parts)}?`),
    key: `oo:${text}`,
    meta: { form },
  };
}

function ttsExpr(parts) {
  const map = { '+': 'וְעוֹד', '−': 'פָּחוֹת', '×': 'כָּפוּל', ':': 'לְחַלֵּק לְ', '(': 'פְּתַח סוֹגְרַיִם,', ')': ', סְגֹר סוֹגְרַיִם' };
  return parts.map(p => map[p] ?? p).join(' ');
}

// ===== שברים =====

const FRAC_TTS = { 2: 'חֵצִי', 3: 'שְׁלִישׁ', 4: 'רֶבַע', 5: 'חֲמִישִׁית', 6: 'שִׁשִּׁית', 8: 'שְׁמִינִית', 10: 'עֲשִׂירִית' };
const fracTts = (n, d) => (n === 1 && FRAC_TTS[d]) ? FRAC_TTS[d] : `${n} חֶלְקֵי ${d}`;
const fracKey = f => `${f.n}/${f.d}`;

function distinctFracs(correct, candidates, count) {
  const out = [correct];
  for (const c of shuffle(candidates)) {
    if (out.length >= count) break;
    if (c.n >= 1 && c.d >= 2 && c.n <= c.d && !out.some(o => fracKey(o) === fracKey(c))) out.push(c);
  }
  return shuffle(out);
}

function makeFracShape(level) {
  const d = pick(level.denominators);
  const n = level.unitOnly ? 1 : ri(1, d - 1);
  const shape = pick(['circle', 'bar']);
  const correct = { n, d };
  const opts = distinctFracs(correct, [
    { n: d - n, d }, { n, d: d + 1 }, { n, d: d - 1 }, { n: n + 1, d }, { n: 1, d: n }, { n: d, d: n + d },
  ], 3);
  return {
    mode: 'cards',
    prompt: 'איזה חלק מהצורה צבוע?',
    tts: 'אֵיזֶה חֵלֶק מֵהַצּוּרָה צָבוּעַ?',
    display: { fraction: { n, d, shape } },
    cards: { kind: 'frac', fracs: opts, correctIndex: opts.findIndex(o => o.n === n && o.d === d) },
    key: `fs:${n}/${d}:${shape}`,
    meta: { n, d },
  };
}

function makeFracOf(level) {
  const d = pick(level.denominators);
  const n = level.unitOnly || d === 2 ? 1 : ri(1, d - 1);
  const of = d * ri(1, Math.max(1, Math.floor(level.of.max / d)));
  const answer = (of / d) * n;
  return slotQ({
    prompt: `כמה זה ${n === 1 && FRAC_TTS[d] ? FRAC_TTS[d].replace(/[֑-ׇ]/g, '') : `${n}/${d}`} של ${of}?`,
    tts: `כַּמָּה זֶה ${fracTts(n, d)} שֶׁל ${of}?`,
    display: { fracOf: { n, d, of } },
    answer,
    key: `fo:${n}/${d}:${of}`,
    meta: { n, d, of },
  });
}

function makeFracCompare(level) {
  const dens = level.denominators;
  let f1, f2;
  if (chance(0.5)) {
    // שברי יחידה: מכנה קטן = שבר גדול
    const [d1, d2] = shuffle(dens).slice(0, 2);
    f1 = { n: 1, d: d1 }; f2 = { n: 1, d: d2 };
  } else {
    // אותו מכנה: מונה גדול = שבר גדול
    const d = pick(dens.filter(x => x >= 3));
    const n1 = ri(1, d - 1);
    let n2 = ri(1, d - 1);
    while (n2 === n1) n2 = ri(1, d - 1);
    f1 = { n: n1, d }; f2 = { n: n2, d };
  }
  const opts = [f1, f2];
  const correctIndex = f1.n / f1.d > f2.n / f2.d ? 0 : 1;
  return {
    mode: 'cards',
    prompt: 'איזה שבר גדול יותר?',
    tts: `מָה גָּדוֹל יוֹתֵר: ${fracTts(f1.n, f1.d)} אוֹ ${fracTts(f2.n, f2.d)}?`,
    cards: { kind: 'frac', fracs: opts, correctIndex },
    key: `fc:${fracKey(f1)}v${fracKey(f2)}`,
    meta: { fracs: opts },
  };
}

// ===== זמן =====

const fmtTime = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const wrapHour = h => ((h - 1) % 12 + 12) % 12 + 1;
// מוסיף דקות לשעה (שעון 12 שעות)
function addMinutes(h, m, add) {
  const total = h * 60 + m + add;
  return { h: wrapHour(Math.floor(total / 60)), m: total % 60 };
}
function timeOptions(h, m, distractors) {
  const seen = new Set([fmtTime(h, m)]);
  const opts = [fmtTime(h, m)];
  for (const d of distractors) {
    const s = fmtTime(d.h, d.m);
    if (!seen.has(s) && d.m >= 0 && d.m < 60) { seen.add(s); opts.push(s); }
    if (opts.length === 3) break;
  }
  return shuffle(opts);
}

function makeClockRead(level) {
  const h = ri(1, 12);
  const m = pick(level.minutes);
  const distractors = shuffle([
    { h: wrapHour(h + 1), m }, { h: wrapHour(h - 1), m },
    { h, m: (m + 30) % 60 }, { h, m: (m + 15) % 60 }, { h, m: (m + 5) % 60 },
    ...(m % 5 === 0 && m / 5 >= 1 && m / 5 <= 12 ? [{ h: m / 5, m: (h * 5) % 60 }] : []),
  ]);
  const opts = timeOptions(h, m, distractors);
  return {
    mode: 'cards',
    prompt: 'מה השעה?',
    tts: 'מָה הַשָּׁעָה שֶׁהַשָּׁעוֹן מַרְאֶה?',
    display: { clock: { h, m } },
    cards: { kind: 'time', times: opts, correctIndex: opts.indexOf(fmtTime(h, m)) },
    key: `clk:${h}:${m}`,
    meta: { h, m },
  };
}

function makeTimeAdd(level) {
  const h = ri(1, 12), m = 5 * ri(0, 11);
  const add = pick(level.addMinutes);
  const res = addMinutes(h, m, add);
  const distractors = shuffle([
    addMinutes(res.h, res.m, 5), addMinutes(res.h, res.m, -5), addMinutes(res.h, res.m, 10), addMinutes(res.h, res.m, -10),
    { h: wrapHour(res.h + 1), m: res.m }, { h: wrapHour(res.h - 1), m: res.m }, addMinutes(res.h, res.m, 15),
  ]);
  const opts = timeOptions(res.h, res.m, distractors);
  return {
    mode: 'cards',
    prompt: `השעה ${fmtTime(h, m)}. מה תהיה השעה בעוד ${add} דקות?`,
    tts: `הַשָּׁעָה ${h} וְ-${m} דַּקּוֹת. מָה תִּהְיֶה הַשָּׁעָה בְּעוֹד ${add} דַּקּוֹת?`,
    display: { clock: { h, m }, digital: fmtTime(h, m) },
    cards: { kind: 'time', times: opts, correctIndex: opts.indexOf(fmtTime(res.h, res.m)) },
    key: `tadd:${h}:${m}+${add}`,
    meta: { h, m, add, result: res },
  };
}

function makeDuration(level) {
  const maxMin = level.maxMinutes || 60;
  const h = ri(1, 11), m = 5 * ri(0, 11);
  const dur = 5 * ri(1, Math.floor(maxMin / 5));
  const end = addMinutes(h, m, dur);
  return slotQ({
    prompt: `מ-${fmtTime(h, m)} עד ${fmtTime(end.h, end.m)} — כמה דקות עברו?`,
    tts: `מֵהַשָּׁעָה ${h} וְ-${m} דַּקּוֹת עַד הַשָּׁעָה ${end.h} וְ-${end.m} דַּקּוֹת. כַּמָּה דַּקּוֹת עָבְרוּ?`,
    display: { clocks: [{ h, m }, end] },
    answer: dur,
    key: `dur:${h}:${m}+${dur}`,
    meta: { from: { h, m }, to: end, dur },
  });
}

// ===== מידות =====
// factor: כמה יחידות קטנות ביחידה גדולה אחת
const UNITS = {
  m_cm: { factor: 100, n: { min: 2, max: 9 },
    fwd: n => `כַּמָּה סֶנְטִימֶטְרִים יֵשׁ בְּ-${n} מֶטְרִים?`, rev: v => `כַּמָּה מֶטְרִים הֵם ${v} סֶנְטִימֶטְרִים?` },
  km_m: { factor: 1000, n: { min: 2, max: 5 },
    fwd: n => `כַּמָּה מֶטְרִים יֵשׁ בְּ-${n} קִילוֹמֶטְרִים?`, rev: v => `כַּמָּה קִילוֹמֶטְרִים הֵם ${v} מֶטְרִים?` },
  kg_g: { factor: 1000, n: { min: 2, max: 5 },
    fwd: n => `כַּמָּה גְּרָמִים יֵשׁ בְּ-${n} קִילוֹגְרָמִים?`, rev: v => `כַּמָּה קִילוֹגְרָמִים הֵם ${v} גְּרָמִים?` },
  h_min: { factor: 60, n: { min: 2, max: 5 },
    fwd: n => `כַּמָּה דַּקּוֹת יֵשׁ בְּ-${n} שָׁעוֹת?`, rev: v => `כַּמָּה שָׁעוֹת הֵן ${v} דַּקּוֹת?` },
  min_s: { factor: 60, n: { min: 2, max: 5 },
    fwd: n => `כַּמָּה שְׁנִיּוֹת יֵשׁ בְּ-${n} דַּקּוֹת?`, rev: v => `כַּמָּה דַּקּוֹת הֵן ${v} שְׁנִיּוֹת?` },
  ils_ag: { factor: 100, n: { min: 2, max: 9 },
    fwd: n => `כַּמָּה אֲגוֹרוֹת יֵשׁ בְּ-${n} שְׁקָלִים?`, rev: v => `כַּמָּה שְׁקָלִים הֵם ${v} אֲגוֹרוֹת?` },
  day_h: { factor: 24, n: { min: 2, max: 3 },
    fwd: n => `כַּמָּה שָׁעוֹת יֵשׁ בְּ-${n} יָמִים?`, rev: v => `כַּמָּה יָמִים הֵם ${v} שָׁעוֹת?` },
  week_d: { factor: 7, n: { min: 2, max: 5 },
    fwd: n => `כַּמָּה יָמִים יֵשׁ בְּ-${n} שָׁבוּעוֹת?`, rev: v => `כַּמָּה שָׁבוּעוֹת הֵם ${v} יָמִים?` },
};

function makeUnits(level) {
  const kind = pick(level.kinds);
  const u = UNITS[kind];
  const n = ri(u.n.min, u.n.max);
  const reverse = chance(0.4);
  const story = reverse ? u.rev(n * u.factor) : u.fwd(n);
  return {
    mode: 'keypad', story, tts: story,
    answer: reverse ? n : n * u.factor,
    key: `u:${kind}:${n}:${reverse}`,
    meta: { kind, factor: u.factor, n, reverse },
  };
}

// ===== גיאומטריה =====

const POLYGON_NAMES = { 3: 'משולש', 4: 'מרובע', 5: 'מחומש', 6: 'משושה', 7: 'משובע', 8: 'מתומן' };
const POLYGON_TTS = { 3: 'מְשֻׁלָּשׁ', 4: 'מְרֻבָּע', 5: 'מְחֻמָּשׁ', 6: 'מְשֻׁשֶּׁה', 7: 'מְשֻׁבָּע', 8: 'מְתֻמָּן' };

function makeSides(level) {
  const n = ri(level.ngon.min, level.ngon.max);
  const vertices = chance(0.5);
  return slotQ({
    prompt: vertices ? 'כמה קודקודים יש לצורה?' : 'כמה צלעות יש לצורה?',
    tts: vertices ? 'כַּמָּה קֻדְקֻדִּים יֵשׁ לַצּוּרָה?' : 'כַּמָּה צְלָעוֹת יֵשׁ לַצּוּרָה?',
    display: { polygon: n },
    answer: n,
    key: `sides:${n}:${vertices}`,
    meta: { n },
  });
}

function makeShapeName(level) {
  const n = ri(level.ngon.min, level.ngon.max);
  const all = Object.keys(POLYGON_NAMES).map(Number).filter(k => k >= level.ngon.min && k <= level.ngon.max);
  const opts = shuffle([n, ...shuffle(all.filter(k => k !== n)).slice(0, 2)]);
  return {
    mode: 'cards',
    prompt: 'איך קוראים לצורה?',
    tts: 'אֵיךְ קוֹרְאִים לַצּוּרָה?',
    display: { polygon: n },
    cards: { kind: 'word', words: opts.map(k => POLYGON_NAMES[k]), correctIndex: opts.indexOf(n) },
    key: `sn:${n}`,
    meta: { n, name: POLYGON_NAMES[n], tts: POLYGON_TTS[n] },
  };
}

function makePerimeter(level) {
  const kind = pick(level.shapes);
  const s = level.side;
  let sides;
  if (kind === 'square') { const a = ri(s.min, s.max); sides = [a, a, a, a]; }
  else if (kind === 'rect') {
    const w = ri(s.min, s.max);
    let h = ri(s.min, s.max);
    while (h === w) h = ri(s.min, s.max);
    sides = [w, h, w, h];
  } else {
    // משולש תקין: כל צלע קטנה מסכום שתי האחרות
    let a, b, c;
    do { a = ri(s.min, s.max); b = ri(s.min, s.max); c = ri(s.min, s.max); } while (a + b <= c || a + c <= b || b + c <= a);
    sides = [a, b, c];
  }
  const answer = sides.reduce((x, y) => x + y, 0);
  const shapeTts = kind === 'square' ? 'הָרִבּוּעַ' : kind === 'rect' ? 'הַמַּלְבֵּן' : 'הַמְּשֻׁלָּשׁ';
  return slotQ({
    prompt: 'מה ההיקף? (בסנטימטרים)',
    tts: `מָה הַהֶקֵּף שֶׁל ${shapeTts}? הַצְּלָעוֹת: ${sides.join(', ')} סֶנְטִימֶטְרִים`,
    display: { shape: { kind, sides } },
    answer,
    key: `per:${kind}:${sides.join(',')}`,
    meta: { kind, sides },
  });
}

function makeArea(level) {
  const w = ri(level.side.min, level.side.max);
  const h = ri(level.side.min, level.side.max);
  return slotQ({
    prompt: 'כמה ריבועים יש במלבן? (השטח)',
    tts: `כַּמָּה רִבּוּעִים יֵשׁ בַּמַּלְבֵּן? זֶה הַשֶּׁטַח שֶׁלּוֹ`,
    display: { grid: { w, h } },
    answer: w * h,
    key: `area:${w}x${h}`,
    meta: { w, h },
  });
}

// ===== בעיות מילוליות — סיפורים מנוקדים עם התאמת מין =====

const PEOPLE = [
  { n: 'דָּנָה', g: 'f' }, { n: 'יָעֵל', g: 'f' }, { n: 'נֹעָה', g: 'f' }, { n: 'תָּמָר', g: 'f' }, { n: 'רוֹנִי', g: 'f' }, { n: 'מָאיָה', g: 'f' },
  { n: 'יוֹנָתָן', g: 'm' }, { n: 'אִיתַי', g: 'm' }, { n: 'דָּנִיאֵל', g: 'm' }, { n: 'עוֹמֶר', g: 'm' },
];
const V = {
  had: { f: 'הָיוּ לָהּ', m: 'הָיוּ לוֹ' }, got: { f: 'קִבְּלָה', m: 'קִבֵּל' }, gave: { f: 'נָתְנָה', m: 'נָתַן' },
  she: { f: 'הִיא', m: 'הוּא' }, her: { f: 'לָהּ', m: 'לוֹ' }, bought: { f: 'קָנְתָה', m: 'קָנָה' },
  paid: { f: 'שִׁלְּמָה', m: 'שִׁלֵּם' }, divides: { f: 'מְחַלֶּקֶת', m: 'מְחַלֵּק' }, reads: { f: 'קוֹרֵאת', m: 'קוֹרֵא' },
  ate: { f: 'אָכְלָה', m: 'אָכַל' }, saves: { f: 'חוֹסֶכֶת', m: 'חוֹסֵךְ' }, willSave: { f: 'תַּחְסֹךְ', m: 'יַחְסֹךְ' },
  left: { f: 'יָצְאָה', m: 'יָצָא' }, arrived: { f: 'הִגִּיעָה', m: 'הִגִּיעַ' }, arranges: { f: 'מְסַדֶּרֶת', m: 'מְסַדֵּר' },
  dividedAll: { f: 'וְחִלְּקָה', m: 'וְחִלֵּק' },
};
const STORY_OBJECTS = ['בַּלּוֹנִים', 'מַדְבֵּקוֹת', 'עוּגִיּוֹת', 'גּוּלוֹת', 'סֻכָּרִיּוֹת', 'תַּפּוּחִים', 'פְּרָחִים', 'סְפָרִים', 'קְלָפִים', 'עֶפְרוֹנוֹת'];
const PRICE_ITEMS = [
  { s: 'מַחְבֶּרֶת', p: 'מַחְבָּרוֹת', g: 'f' }, { s: 'עִפָּרוֹן', p: 'עֶפְרוֹנוֹת', g: 'm' }, { s: 'סֵפֶר', p: 'סְפָרִים', g: 'm' },
  { s: 'גְּלִידָה', p: 'גְּלִידוֹת', g: 'f' }, { s: 'כַּדּוּר', p: 'כַּדּוּרִים', g: 'm' }, { s: 'לַחְמָנִיָּה', p: 'לַחְמָנִיּוֹת', g: 'f' },
];

function makeWord(level) {
  const max = level.result?.max || 20;
  for (let t = 0; t < 60; t++) {
    const type = pick(level.stories);
    const res = buildStory(type, max);
    if (!res || res.answer > max || res.answer < 0 || !Number.isInteger(res.answer)) continue;
    return { mode: 'keypad', story: res.story, answer: res.answer, tts: res.story, key: `w:${res.story.slice(0, 30)}${res.answer}`, meta: { type } };
  }
  const story = 'לְדָנָה הָיוּ 5 בַּלּוֹנִים. הִיא קִבְּלָה עוֹד 3. כַּמָּה בַּלּוֹנִים יֵשׁ לָהּ עַכְשָׁו?';
  return { mode: 'keypad', story, answer: 8, tts: story, key: 'w:fallback', meta: { type: 'add' } };
}

function buildStory(type, max) {
  const p = pick(PEOPLE), g = p.g, name = p.n;
  const p2 = pick(PEOPLE.filter(x => x.n !== name));
  const obj = pick(STORY_OBJECTS);
  const obj2 = pick(STORY_OBJECTS.filter(o => o !== obj));
  const v = key => V[key][g];

  switch (type) {
    case 'add': {
      const a = ri(3, Math.min(60, max - 2)), b = ri(2, Math.min(40, max - a));
      return { story: `לְ${name} ${v('had')} ${a} ${obj}. ${v('she')} ${v('got')} עוֹד ${b}. כַּמָּה ${obj} יֵשׁ ${v('her')} עַכְשָׁו?`, answer: a + b };
    }
    case 'sub': {
      const a = ri(5, Math.min(90, max)), b = ri(1, Math.min(40, a - 1));
      return { story: `לְ${name} ${v('had')} ${a} ${obj}. ${v('she')} ${v('gave')} ${b} לְ${p2.n}. כַּמָּה נִשְׁאֲרוּ ${v('her')}?`, answer: a - b };
    }
    case 'compare': {
      const b = ri(2, max - 2), a = b + ri(1, Math.min(max >= 200 ? 300 : 9, max - b));
      return { story: `לְ${name} יֵשׁ ${a} ${obj} וּלְ${p2.n} יֵשׁ ${b}. בְּכַמָּה יוֹתֵר יֵשׁ לְ${name}?`, answer: a - b };
    }
    case 'combine': {
      const a = ri(2, Math.min(12, max - 2)), b = ri(2, max - a);
      return { story: `בַּקֻּפְסָה יֵשׁ ${a} ${obj} וְעוֹד ${b} ${obj2}. כַּמָּה דְּבָרִים יֵשׁ בַּקֻּפְסָה בְּסַךְ הַכֹּל?`, answer: a + b };
    }
    case 'mulStory': {
      const bags = ri(2, 9), per = ri(2, Math.min(10, Math.floor(max / bags)));
      return { story: `בְּכָל שַׂקִּית יֵשׁ ${per} ${obj}. כַּמָּה ${obj} יֵשׁ בְּ-${bags} שַׂקִּיּוֹת?`, answer: bags * per };
    }
    case 'divStory': {
      const kids = ri(2, 9), each = ri(2, 10);
      return { story: `${name} ${v('divides')} ${kids * each} ${obj} שָׁוֶה בְּשָׁוֶה בֵּין ${kids} חֲבֵרִים. כַּמָּה יְקַבֵּל כָּל חָבֵר?`, answer: each };
    }
    case 'twoStep': {
      const a = ri(10, 60), b = ri(5, 30), c = ri(2, Math.min(40, a + b - 1));
      return { story: `לְ${name} ${v('had')} ${a} ${obj}. ${v('she')} ${v('got')} עוֹד ${b}, וְאָז ${v('gave')} ${c} לְ${p2.n}. כַּמָּה יֵשׁ ${v('her')} עַכְשָׁו?`, answer: a + b - c };
    }
    case 'mulTwoStep': {
      const k = ri(2, 6), per = ri(3, 10), c = ri(1, k * per - 1);
      return { story: `${name} ${v('bought')} ${k} חֲבִילוֹת שֶׁל ${per} ${obj}. ${v('she')} ${v('gave')} ${c} לַחֲבֵרִים. כַּמָּה ${obj} נִשְׁאֲרוּ ${v('her')}?`, answer: k * per - c };
    }
    case 'divTwoStep': {
      const k = ri(2, 6), each = ri(2, 9), total = k * each;
      const a = ri(1, total - 1), b = total - a;
      return { story: `לְ${name} ${v('had')} ${a} ${obj}. ${v('she')} ${v('got')} עוֹד ${b}, ${v('dividedAll')} אֶת כֻּלָּם שָׁוֶה בְּשָׁוֶה בֵּין ${k} חֲבֵרִים. כַּמָּה קִבֵּל כָּל חָבֵר?`, answer: each };
    }
    case 'price': {
      const item = pick(PRICE_ITEMS);
      const k = ri(2, 9), price = ri(2, Math.max(2, Math.min(12, Math.floor(max / k))));
      const costs = item.g === 'f' ? 'עוֹלָה' : 'עוֹלֶה';
      const costPl = item.g === 'f' ? 'עוֹלוֹת' : 'עוֹלִים';
      return { story: `${item.s} ${costs} ${price} שְׁקָלִים. כַּמָּה ${costPl} ${k} ${item.p}?`, answer: k * price };
    }
    case 'change': {
      const item = pick(PRICE_ITEMS);
      const pay = pick([10, 20, 50, 100].filter(x => x <= Math.max(10, max)));
      const price = ri(2, pay - 1);
      return { story: `${name} ${v('bought')} ${item.s} בְּ-${price} שְׁקָלִים וְ${v('paid')} בְּ-${pay} שְׁקָלִים. כַּמָּה עֹדֶף ${v('she')} ${v('got')}?`, answer: pay - price };
    }
    case 'bigAdd': {
      const a = ri(100, Math.min(600, max - 100)), b = ri(100, max - a);
      return chance(0.5)
        ? { story: `בְּבֵית הַסֵּפֶר לוֹמְדִים ${a} בָּנוֹת וְ-${b} בָּנִים. כַּמָּה תַּלְמִידִים לוֹמְדִים בְּבֵית הַסֵּפֶר?`, answer: a + b }
        : { story: `בַּסִּפְרִיָּה יֵשׁ ${a} סְפָרִים בְּעִבְרִית וְ-${b} סְפָרִים בְּאַנְגְּלִית. כַּמָּה סְפָרִים יֵשׁ בַּסִּפְרִיָּה?`, answer: a + b };
    }
    case 'bigSub': {
      const a = ri(200, Math.min(999, max)), b = ri(100, a - 10);
      return chance(0.5)
        ? { story: `בָּאוּלָם יֵשׁ ${a} כִּסְאוֹת. ${b} כִּסְאוֹת תְּפוּסִים. כַּמָּה כִּסְאוֹת פְּנוּיִים?`, answer: a - b }
        : { story: `בַּחֲנוּת הָיוּ ${a} ${obj}. נִמְכְּרוּ ${b}. כַּמָּה ${obj} נִשְׁאֲרוּ בַּחֲנוּת?`, answer: a - b };
    }
    case 'remStory': {
      const k = ri(2, 6), q = ri(2, 9), r = ri(1, k - 1), total = k * q + r;
      return chance(0.5)
        ? { story: `יֵשׁ ${total} ${obj}. מְחַלְּקִים אוֹתָם שָׁוֶה בְּשָׁוֶה בֵּין ${k} יְלָדִים, כָּל אֶחָד מְקַבֵּל כַּמָּה שֶׁאֶפְשָׁר. כַּמָּה ${obj} יִשָּׁאֲרוּ?`, answer: r }
        : { story: `${name} ${v('arranges')} ${total} ${obj} בְּשׁוּרוֹת שֶׁל ${k}. כַּמָּה שׁוּרוֹת מְלֵאוֹת יֵשׁ?`, answer: q };
    }
    case 'weekStory': {
      if (chance(0.5)) {
        const n = ri(2, Math.min(20, Math.floor(max / 7)));
        return { story: `בְּכָל יוֹם ${name} ${v('reads')} ${n} עַמּוּדִים. כַּמָּה עַמּוּדִים ${v('she')} ${v('reads')} בְּשָׁבוּעַ?`, answer: n * 7 };
      }
      const w = ri(2, 6), n = ri(2, Math.min(25, Math.floor(max / w)));
      return { story: `בְּכָל שָׁבוּעַ ${name} ${v('saves')} ${n} שְׁקָלִים. כַּמָּה ${v('willSave')} בְּ-${w} שָׁבוּעוֹת?`, answer: n * w };
    }
    case 'timeStory': {
      if (chance(0.5)) {
        const h = ri(6, 9), m = 5 * ri(0, 6), dur = 5 * ri(2, 10);
        const end = addMinutes(h, m, dur);
        return { story: `${name} ${v('left')} מֵהַבַּיִת בְּ-${fmtTime(h, m)} ${v('arrived')} לְבֵית הַסֵּפֶר בְּ-${fmtTime(end.h, end.m)}. כַּמָּה דַּקּוֹת נִמְשְׁכָה הַדֶּרֶךְ?`, answer: dur };
      }
      const h = ri(1, Math.min(2, Math.floor((max - 5) / 60))), m = 5 * ri(1, 11);
      const hWord = h === 1 ? 'שָׁעָה אַחַת' : 'שְׁעָתַיִם';
      return { story: `הַסֶּרֶט נִמְשָׁךְ ${hWord} וְ-${m} דַּקּוֹת. כַּמָּה דַּקּוֹת נִמְשָׁךְ הַסֶּרֶט בְּסַךְ הַכֹּל?`, answer: h * 60 + m };
    }
  }
  return null;
}

function checkResult(level, value) {
  const r = level.result || {};
  if (r.max !== undefined && value > r.max) return false;
  if (r.min !== undefined && value < r.min) return false;
  return true;
}

// משוואה עם חלון(ות) תשובה. answer מספר יחיד או מערך (חלון לכל '?')
function eq(parts, answer, tts) {
  return { mode: 'keypad', parts, answer, tts, key: parts.map(p => (typeof p === 'object' ? p.text : p)).join('') };
}

// שאלה עם תצוגה (מספר גדול / צורה / שעון) וחלון תשובה יחיד
function slotQ({ prompt, tts, display, answer, key, meta }) {
  return { mode: 'keypad', prompt, tts, display, answer, key, meta };
}

// ===== תרגילים ציוריים (אלין) =====

const pickN = (arr, n) => shuffle(arr).slice(0, n);
// אימוג'ים בולטים לרצפים
const PATTERN_EMOJIS = ['🍎', '🍌', '🍓', '🍇', '🔴', '🔵', '🟡', '⭐', '🌙', '🌸', '🐶', '🐱', '🦋', '🐠'];
// צורות עם שם ל"געי ב..." מנוקד
const SHAPES = [
  { e: '🔵', name: 'עיגול', bTn: 'בָּעִגּוּל' },
  { e: '🟦', name: 'ריבוע', bTn: 'בָּרִבּוּעַ' },
  { e: '🔺', name: 'משולש', bTn: 'בַּמְּשֻׁלָּשׁ' },
  { e: '⭐', name: 'כוכב', bTn: 'בַּכּוֹכָב' },
  { e: '❤️', name: 'לב', bTn: 'בַּלֵּב' },
];
// אובייקטים עגולים שנראים טוב בהגדלה/הקטנה (עולם גדול וקטן)
const SIZE_EMOJIS = ['🎈', '⚽', '⭐', '🍎', '🌸', '🔵', '🦋', '🐢'];
const SIZE_SCALES = [0.85, 1.35, 2.0, 2.7];

function makeVisual(level) {
  const type = level.types ? pick(level.types) : level.type;
  // עולמות ללא pool (רצפים/צורות/מספרים-זיהוי) — לא טוענים מאגר חיות
  const pool = level.pool ? pools[level.pool] : null;
  const item = pool ? pick(pool) : null;
  const other = pool ? pick(pool.filter(p => p.e !== item.e)) : null;
  // ברירת מחדל: ספרה + נקודות עזר לספירה; שלבים מתקדמים: ספרה בלבד
  const digitStyle = level.digitsOnly ? 'digitsOnly' : 'digits';
  // שמות מנוקדים להקראה (התצוגה נשארת בלי ניקוד)
  const itemN = item ? (item.tn || item.name) : '';
  const otherN = other ? (other.tn || other.name) : '';

  switch (type) {
    case 'count': {
      const n = ri(level.range.min, level.range.max);
      return {
        mode: 'cards',
        prompt: `כמה ${item.name} יש?`,
        tts: `כמה ${itemN} יש? סִפְרִי וּגְעִי בַּמִּסְפָּר הַנָּכוֹן`,
        display: { groups: [{ emoji: item.e, count: n }], layout: level.layout || 'row' },
        cards: makeCards(n, { min: 1, max: level.cardMax || 10 }, item.e, { style: digitStyle }),
        key: `count:${item.e}${n}`,
      };
    }

    case 'tapN': {
      // הקשה מדויקת קשה מספירה — מגבילים ל-5 מטרה ו-9 עצמים על המסך
      const target = ri(level.range.min, Math.min(level.range.max, 5));
      const total = Math.min(target + ri(level.extra?.min ?? 1, level.extra?.max ?? 3), 9);
      return {
        mode: 'tap',
        prompt: `געי בדיוק ב-${target} ${item.name}`,
        tts: `גְּעִי בְּדִיּוּק ${beNumWord(target, item.g)} ${itemN}, וְאָז לַחֲצִי עַל הַסִּימָן הַיָּרֹק`,
        emoji: item.e, total, target,
        key: `tap:${item.e}${target}/${total}`,
      };
    }

    case 'compareMore':
    case 'compareLess': {
      const more = type === 'compareMore';
      const gap = ri(level.gap?.min ?? 1, level.gap?.max ?? 3);
      const small = ri(level.range.min, Math.max(level.range.min, level.range.max - gap));
      const big = small + gap;
      const groups = shuffle([small, big]);
      const correctIndex = groups.indexOf(more ? big : small);
      const word = more ? 'יותר' : 'פחות';
      return {
        mode: 'pickGroup',
        prompt: `איפה יש ${word} ${item.name}?`,
        tts: `גְּעִי בַּקְּבוּצָה שֶׁיֵּשׁ בָּהּ ${word} ${itemN}`,
        emoji: item.e, groups, correctIndex,
        key: `cmp${word}:${groups.join(',')}`,
      };
    }

    case 'matchSame': {
      const n = ri(level.range.min, level.range.max);
      return {
        mode: 'cards',
        prompt: 'מצאי את הקבוצה עם אותו מספר',
        tts: `יֵשׁ כָּאן ${numWord(n, item.g)} ${itemN}. מִצְאִי אֶת הַקְּבוּצָה שֶׁיֵּשׁ בָּהּ אוֹתוֹ מִסְפָּר שֶׁל ${otherN}`,
        display: { groups: [{ emoji: item.e, count: n }], layout: 'row' },
        cards: makeCards(n, { min: 1, max: level.range.max + 2 }, other.e, { showDigits: true }),
        key: `match:${n}${item.e}`,
      };
    }

    case 'sameOrNot': {
      const n1 = ri(level.range.min, level.range.max);
      const same = chance(0.5);
      let n2 = n1;
      if (!same) {
        n2 = n1 + pick([-1, 1, 2].filter(d => n1 + d >= level.range.min && n1 + d <= level.range.max + 1));
      }
      return {
        mode: 'yesNo',
        prompt: 'אותו מספר?',
        tts: `הַאִם יֵשׁ אוֹתוֹ מִסְפָּר שֶׁל ${itemN} וְשֶׁל ${otherN}?`,
        groupsDisplay: [{ emoji: item.e, count: n1 }, { emoji: other.e, count: n2 }],
        answer: same,
        key: `same:${n1},${n2}`,
      };
    }

    case 'visualAdd': {
      const max = level.total.max;
      const a = ri(1, max - 1);
      const b = ri(1, max - a);
      return {
        mode: 'cards',
        prompt: `כמה ${item.name} יש ביחד?`,
        tts: `${numWord(a, item.g)} וְעוֹד ${numWord(b, item.g)}. כַּמָּה ${itemN} יֵשׁ בְּיַחַד?`,
        display: { groups: [{ emoji: item.e, count: a }, { emoji: item.e, count: b }], plus: true },
        cards: makeCards(a + b, { min: 1, max: Math.min(max + 2, 9) }, item.e, { style: digitStyle }),
        key: `vadd:${a}+${b}`,
      };
    }

    case 'visualSub': {
      const start = ri(level.start.min, level.start.max);
      const remove = Math.min(ri(level.remove.min, level.remove.max), start - 1);
      const left = start - remove;
      const goneWord = remove === 1
        ? (item.g === 'f' ? 'אַחַת נֶעֶלְמָה' : 'אֶחָד נֶעֱלַם')
        : `${numWord(remove, item.g)} נֶעֶלְמוּ`;
      return {
        mode: 'cards',
        prompt: `כמה ${item.name} נשארו?`,
        tts: `הָיוּ ${numWord(start, item.g)} ${itemN}, ${goneWord}. כַּמָּה נִשְׁאֲרוּ?`,
        display: { groups: [{ emoji: item.e, count: start, removed: remove }], layout: 'row' },
        cards: makeCards(left, { min: 0, max: level.start.max }, item.e, { style: digitStyle }),
        key: `vsub:${start}-${remove}`,
      };
    }

    case 'oneMore': {
      const n = ri(level.range.min, level.range.max);
      const counts = shuffle([n + 1, n, n + 2]);
      return {
        mode: 'cards',
        prompt: 'איפה יש עוד אחד?',
        tts: `יֵשׁ כָּאן ${numWord(n, item.g)} ${itemN}. גְּעִי בַּמִּסְפָּר שֶׁהוּא עוֹד ${item.g === 'f' ? 'אַחַת' : 'אֶחָד'}`,
        display: { groups: [{ emoji: item.e, count: n }], layout: 'row' },
        cards: { counts, correctIndex: counts.indexOf(n + 1), emoji: other.e, style: digitStyle },
        key: `one:${n}`,
      };
    }

    // ===== עולם הרצפים =====
    case 'pattern': {
      const unitType = pick(level.patterns); // 'AB' | 'ABC' | 'AAB' | 'ABB' | 'AABB'
      const distinct = [...new Set(unitType.split(''))].length;
      const syms = pickN(PATTERN_EMOJIS, distinct);
      const map = {}; let si = 0;
      const unit = unitType.split('').map(ch => (ch in map ? map[ch] : (map[ch] = syms[si++])));
      const unitLen = unit.length;
      const shownLen = unitLen * 2 + ri(0, unitLen - 1); // לפחות שתי חזרות מלאות
      const seq = [];
      for (let i = 0; i < shownLen; i++) seq.push(unit[i % unitLen]);
      const answer = unit[shownLen % unitLen];
      // מסיחים: שאר סמלי הרצף + מילוי מהמאגר
      const distract = [...new Set(unit.filter(e => e !== answer))];
      const fill = PATTERN_EMOJIS.filter(e => e !== answer && !distract.includes(e));
      while (distract.length < 2) distract.push(fill.shift());
      const opts = shuffle([answer, ...distract.slice(0, 2)]);
      return {
        mode: 'cards',
        prompt: 'מה בא אחר כך?',
        tts: 'מָה בָּא אַחַר כָּךְ? גְּעִי בַּתְּשׁוּבָה הַנְּכוֹנָה',
        display: { sequence: seq, next: true },
        cards: { kind: 'emoji', emojis: opts, correctIndex: opts.indexOf(answer) },
        key: `pat:${seq.join('')}`,
      };
    }

    // ===== ארץ הצורות =====
    case 'shapeFind': {
      const opts = pickN(SHAPES, level.shapeCount || 3);
      const target = pick(opts);
      return {
        mode: 'cards',
        prompt: `געי ב${target.name}`,
        tts: `גְּעִי ${target.bTn}`,
        cards: { kind: 'emoji', emojis: opts.map(s => s.e), correctIndex: opts.indexOf(target) },
        key: `sf:${target.e}${opts.length}`,
      };
    }

    case 'shapeMatch': {
      const opts = pickN(SHAPES, 3);
      const target = pick(opts);
      const emojis = shuffle(opts.map(s => s.e));
      return {
        mode: 'cards',
        prompt: 'מצאי את אותה צורה',
        tts: 'מִצְאִי אֶת אוֹתָהּ צוּרָה',
        display: { bigEmoji: target.e },
        cards: { kind: 'emoji', emojis, correctIndex: emojis.indexOf(target.e) },
        key: `sm:${target.e}`,
      };
    }

    case 'oddOneOut': {
      let same, diff;
      if (level.useShapes || !pool) {
        const s = pickN(SHAPES, 2); same = s[0].e; diff = s[1].e;
      } else {
        const it = pickN(pool, 2); same = it[0].e; diff = it[1].e;
      }
      const arr = shuffle([same, same, same, diff]);
      return {
        mode: 'cards',
        prompt: 'מה לא שייך?',
        tts: 'מָה לֹא שַׁיָּךְ? גְּעִי בַּשּׁוֹנֶה',
        cards: { kind: 'emoji', emojis: arr, correctIndex: arr.indexOf(diff) },
        key: `odd:${same}${diff}`,
      };
    }

    // ===== עיר המספרים =====
    case 'digitFind': {
      const n = ri(level.range.min, level.range.max);
      const cap = level.cardMax || 10;
      const set = new Set([n]);
      let guard = 0;
      while (set.size < 3 && guard++ < 100) {
        const d = ri(1, cap);
        if (d !== n) set.add(d);
      }
      let w = n + 1;
      while (set.size < 3) set.add(w++);
      const opts = shuffle([...set]);
      return {
        mode: 'cards',
        prompt: 'איזה מספר שמעת?',
        tts: `גְּעִי בַּמִּסְפָּר ${numWord(n)}`,
        cards: { kind: 'digit', digits: opts, correctIndex: opts.indexOf(n) },
        key: `df:${n}/${opts.join(',')}`,
      };
    }

    case 'digitToQty': {
      const n = ri(level.range.min, level.range.max);
      const set = new Set([n]);
      let guard = 0;
      while (set.size < 3 && guard++ < 100) {
        const d = ri(1, level.range.max + 1);
        if (d !== n && d >= 1) set.add(d);
      }
      let w = n + 1;
      while (set.size < 3) set.add(w++);
      const groups = shuffle([...set]);
      return {
        mode: 'pickGroup',
        prompt: `מצאי ${n}`,
        tts: `מִצְאִי קְבוּצָה שֶׁל ${numWord(n, item.g)} ${itemN}`,
        emoji: item.e, groups, correctIndex: groups.indexOf(n),
        display: { bigDigit: n },
        key: `dq:${n}/${groups.join(',')}`,
      };
    }

    // ===== ארץ הגדלים — גדול וקטן =====
    case 'sizeBig':
    case 'sizeSmall': {
      const big = type === 'sizeBig';
      const emoji = pick(SIZE_EMOJIS);
      const count = level.count || 3;
      const sizes = pickN(SIZE_SCALES, count);
      const target = big ? Math.max(...sizes) : Math.min(...sizes);
      return {
        mode: 'cards',
        prompt: big ? 'געי בגדול ביותר' : 'געי בקטן ביותר',
        tts: big ? 'גְּעִי בַּגָּדוֹל בְּיוֹתֵר' : 'גְּעִי בַּקָּטָן בְּיוֹתֵר',
        cards: { kind: 'emojiSize', emoji, sizes, correctIndex: sizes.indexOf(target) },
        key: `sz:${big}:${sizes.join(',')}`,
      };
    }
  }
  throw new Error(`סוג תרגיל לא מוכר: ${type}`);
}

// 3 כרטיסי תשובה: הנכון + שני מסיחים קרובים (±1/±2), בלי כפילויות
// opts.style 'digits' = ספרה גדולה + נקודות (במקום ציורים — שלא יהיה ניתן להתאים תמונה לתמונה)
function makeCards(correct, clamp, emoji, opts = {}) {
  const set = new Set([correct]);
  let guard = 0;
  while (set.size < 3 && guard++ < 100) {
    const d = correct + pick([-2, -1, 1, 2]);
    if (d >= clamp.min && d <= clamp.max && d !== correct) set.add(d);
  }
  // טווח צר מדי (נדיר) — הרחבה מעבר לתקרה
  let widen = correct + 3;
  while (set.size < 3) set.add(widen++);
  const counts = shuffle([...set]);
  return { counts, correctIndex: counts.indexOf(correct), emoji, style: opts.style, showDigits: !!opts.showDigits };
}

// טקסט התשובה הנכונה — למשוב במבחן ("התשובה הנכונה: ...")
export function answerText(q) {
  if (q.mode === 'keypad') {
    return Array.isArray(q.answer) ? `${q.answer[0]} שארית ${q.answer[1]}` : String(q.answer);
  }
  if (q.mode === 'cards') {
    const c = q.cards, i = c.correctIndex;
    switch (c.kind) {
      case 'digit': return String(c.digits[i]);
      case 'word': return c.words[i];
      case 'sign': return c.signs[i];
      case 'time': return c.times[i];
      case 'frac': return `${c.fracs[i].n}/${c.fracs[i].d}`;
      case 'emoji': return c.emojis[i];
      case 'emojiSize': return c.emoji;
      default: return c.counts ? String(c.counts[i]) : '';
    }
  }
  if (q.mode === 'pickGroup') return String(q.groups[q.correctIndex]);
  if (q.mode === 'yesNo') return q.answer ? '👍' : '👎';
  if (q.mode === 'tap') return String(q.target);
  return '';
}
