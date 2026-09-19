// בדיקות הגנרטור — משותפות לדפדפן (tests.html) ול-Node (tests/run.mjs)
// לכל שלב: N דגימות, ובכל שאלה בודקים שהתשובה נכונה מתמטית ושהאילוצים של השלב מתקיימים.
import { makeQuestion, generateExam, answerText, carries, borrows } from '../js/engine/generator.js';

// ===== מחשבון ביטויים עצמאי (סדר פעולות + סוגריים) — לא משתמש בקוד הגנרטור =====
export function evalParts(parts) {
  const tokens = parts.map(p => (typeof p === 'object' ? p : p));
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '−') {
      const op = next(), r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  function term() {
    let v = factor();
    while (peek() === '×' || peek() === ':') {
      const op = next(), r = factor();
      v = op === '×' ? v * r : v / r;
    }
    return v;
  }
  function factor() {
    const t = next();
    if (t === '(') { const v = expr(); if (next() !== ')') throw 'סוגריים לא סגורים'; return v; }
    if (typeof t !== 'number') throw `טוקן לא צפוי: ${JSON.stringify(t)}`;
    return t;
  }
  const v = expr();
  if (i !== tokens.length) throw `שארית טוקנים: ${tokens.slice(i).join(' ')}`;
  return v;
}

const isNum = v => typeof v === 'number' && Number.isFinite(v);
const fail = msg => { throw String(msg); };

// ===== בדיקת שאלה יחידה מול השלב שיצר אותה =====
export function checkQuestion(level, q) {
  if (!q || typeof q !== 'object') fail('אין שאלה');
  if (!q.tts) fail('אין טקסט הקראה');
  if (!q.key) fail('אין key');
  const text = JSON.stringify(q);
  if (text.includes('undefined') || text.includes('NaN') || text.includes('null,')) fail(`שאלה פגומה: ${text.slice(0, 120)}`);
  if (answerText(q) === '' || answerText(q).includes('undefined')) fail(`אין טקסט תשובה: ${answerText(q)}`);

  if (level.op) checkGrade3(level, q);
  else checkVisual(level, q);
}

function checkKeypadAnswer(q) {
  if (q.mode !== 'keypad') fail(`mode=${q.mode}`);
  const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
  for (const a of answers) {
    if (!isNum(a)) fail(`תשובה לא מספרית: ${a}`);
    if (a < 0) fail(`תשובה שלילית: ${a}`);
    if (!Number.isInteger(a)) fail(`תשובה לא שלמה: ${a}`);
    if (a > 9999) fail(`תשובה ארוכה מדי ללוח המספרים: ${a}`);
  }
  return answers;
}

function checkCards(q, kind) {
  if (q.mode !== 'cards') fail(`mode=${q.mode}`);
  const c = q.cards;
  if (kind && c.kind !== kind) fail(`kind=${c.kind}`);
  const list = c.kind === 'emoji' ? c.emojis : c.kind === 'digit' ? c.digits : c.kind === 'emojiSize' ? c.sizes
    : c.kind === 'word' ? c.words : c.kind === 'sign' ? c.signs : c.kind === 'time' ? c.times
    : c.kind === 'frac' ? c.fracs.map(f => `${f.n}/${f.d}`) : c.counts;
  if (!Array.isArray(list) || list.length < 2 || list.length > 4) fail(`מספר כרטיסים: ${list && list.length}`);
  if (c.kind !== 'emoji' && new Set(list).size !== list.length) fail(`כרטיסים כפולים: ${list}`);
  if (c.correctIndex < 0 || c.correctIndex >= list.length) fail(`אינדקס נכון שגוי: ${c.correctIndex}`);
  if (list.some(x => x === undefined || x === null || x === '')) fail(`כרטיס ריק: ${list}`);
  return list;
}

function checkGrade3(level, q) {
  const r = level.result || {};
  switch (level.op) {
    case 'add': case 'sub': case 'mixed': case 'missing': case 'boss': case 'add3': {
      const [answer] = checkKeypadAnswer(q);
      const full = q.parts.map(p => (p === '?' ? answer : p));
      const eqIdx = full.indexOf('=');
      const left = full.slice(0, eqIdx), right = full[eqIdx + 1];
      if (evalParts(left) !== right) fail(`משוואה לא נכונה: ${full.join(' ')}`);
      const result = right;
      if (r.max !== undefined && result > r.max) fail(`תוצאה ${result} > ${r.max}`);
      if (r.min !== undefined && q.parts[q.parts.length - 1] === '?' && result < r.min) fail(`תוצאה ${result} < ${r.min}`);
      if (level.a && !inRange(full[0], level.a) && level.op !== 'missing' && level.op !== 'boss') fail(`a מחוץ לטווח: ${full.join(' ')}`);
      if ((level.op === 'add' || level.op === 'sub') && level.regroup && level.regroup !== 'any') {
        const [x, op, y] = full;
        const has = op === '+' ? carries(x, y) : borrows(x, y);
        if (level.regroup === 'required' && !has) fail(`חסרה המרה/פריטה: ${full.join(' ')}`);
        if (level.regroup === 'forbidden' && has) fail(`המרה/פריטה אסורה: ${full.join(' ')}`);
      }
      break;
    }
    case 'mul': case 'mulMissing': {
      const [answer] = checkKeypadAnswer(q);
      const full = q.parts.map(p => (p === '?' ? answer : p));
      if (full[0] * full[2] !== full[4]) fail(`כפל שגוי: ${full.join(' ')}`);
      if (!full.slice(0, 3).some(f => level.tables.includes(f))) fail(`לוח לא ברשימה: ${full.join(' ')}`);
      if (r.max !== undefined && full[4] > r.max) fail(`מכפלה ${full[4]} > ${r.max}`);
      break;
    }
    case 'div': case 'divMissing': {
      const [answer] = checkKeypadAnswer(q);
      const full = q.parts.map(p => (p === '?' ? answer : p));
      if (full[0] % full[2] !== 0 || full[0] / full[2] !== full[4]) fail(`חילוק שגוי: ${full.join(' ')}`);
      if (!level.divisors.includes(full[2])) fail(`מחלק לא ברשימה: ${full.join(' ')}`);
      if (!inRange(full[4], level.q)) fail(`מנה מחוץ לטווח: ${full.join(' ')}`);
      break;
    }
    case 'divRem': {
      const [quot, rem] = checkKeypadAnswer(q);
      if (rem === undefined) fail('חסרה שארית');
      const { dividend, d } = q.meta;
      if (!level.divisors.includes(d)) fail(`מחלק לא ברשימה: ${d}`);
      if (rem >= d) fail(`שארית ${rem} >= מחלק ${d}`);
      if (d * quot + rem !== dividend) fail(`חילוק עם שארית שגוי: ${dividend} : ${d} = ${quot} ש ${rem}`);
      if (level.remZero === 0 && rem === 0) fail('שארית 0 אסורה בשלב הזה');
      if (q.parts.filter(p => p === '?').length !== 2) fail('צריך שני חלונות תשובה');
      break;
    }
    case 'placeValue': {
      const [answer] = checkKeypadAnswer(q);
      const { n, pos, digit } = q.meta;
      if (!inRange(n, level.range)) fail(`מספר מחוץ לטווח: ${n}`);
      const d = Math.floor(n / 10 ** pos) % 10;
      if (digit !== undefined) { if (answer !== d * 10 ** pos || digit !== d) fail(`ערך ספרה שגוי: ${n} ${digit} → ${answer}`); }
      else if (answer !== d) fail(`ספרה שגויה: ${n} מקום ${pos} → ${answer}`);
      if (q.display?.bigDigit !== n) fail('התצוגה לא מראה את המספר');
      break;
    }
    case 'compose': {
      const [answer] = checkKeypadAnswer(q);
      const full = q.parts.map(p => (p === '?' ? answer : p));
      const eqIdx = full.indexOf('=');
      const left = full.slice(0, eqIdx), right = full[eqIdx + 1];
      if (evalParts(left) !== right) fail(`פירוק שגוי: ${full.join(' ')}`);
      if (!inRange(right, level.range)) fail(`מספר מחוץ לטווח: ${right}`);
      const terms = left.filter(isNum);
      if (terms.length < 2) fail(`פחות משני מחוברים: ${full.join(' ')}`);
      if (terms.some(t => t !== 0 && String(t).replace(/0+$/, '').length !== 1)) fail(`מחובר לא עשרוני: ${full.join(' ')}`);
      break;
    }
    case 'compare': {
      const signs = checkCards(q, 'sign');
      const [a, b] = q.meta.a !== undefined ? [q.meta.a, q.meta.b] : q.display.compare;
      const want = a < b ? '<' : a > b ? '>' : '=';
      if (signs[q.cards.correctIndex] !== want) fail(`סימן שגוי: ${a} ${signs[q.cards.correctIndex]} ${b}`);
      if (!inRange(a, level.range) || !inRange(b, level.range)) fail(`מחוץ לטווח: ${a}, ${b}`);
      break;
    }
    case 'evenOdd': {
      const words = checkCards(q, 'word');
      const want = q.meta.n % 2 === 0 ? 'זוגי' : 'אי-זוגי';
      if (words[q.cards.correctIndex] !== want) fail(`זוגיות שגויה: ${q.meta.n}`);
      break;
    }
    case 'round': {
      const [answer] = checkKeypadAnswer(q);
      const { n, to } = q.meta;
      if (!level.to.includes(to)) fail(`עיגול ל-${to} לא ברשימה`);
      if (!inRange(n, level.range)) fail(`מחוץ לטווח: ${n}`);
      if (answer % to !== 0) fail(`תשובה לא עגולה: ${answer}`);
      if (Math.abs(answer - n) > to / 2 || (Math.abs(answer - n) === to / 2 && answer < n)) fail(`עיגול שגוי: ${n} → ${answer}`);
      break;
    }
    case 'sequence': {
      const [answer] = checkKeypadAnswer(q);
      const { seq, step } = q.meta;
      if (!level.steps.includes(Math.abs(step))) fail(`דילוג ${step} לא ברשימה`);
      if (seq.length !== (level.shown || 4)) fail(`אורך סדרה: ${seq.length}`);
      for (let i = 1; i < seq.length; i++) if (seq[i] - seq[i - 1] !== step) fail(`סדרה לא קבועה: ${seq}`);
      if (answer !== seq[seq.length - 1] + step) fail(`המשך שגוי: ${seq} → ${answer}`);
      if (seq.some(v => v < 0)) fail(`מספר שלילי בסדרה: ${seq}`);
      if (level.dir === 'up' && step < 0) fail('ירידה בשלב עלייה');
      break;
    }
    case 'orderOps': {
      const [answer] = checkKeypadAnswer(q);
      const eqIdx = q.parts.indexOf('=');
      const left = q.parts.slice(0, eqIdx);
      if (q.parts[eqIdx + 1] !== '?') fail('התשובה חייבת להיות בצד ימין');
      if (evalParts(left) !== answer) fail(`סדר פעולות שגוי: ${left.join(' ')} = ${answer}`);
      if (answer > 100) fail(`תוצאה ${answer} > 100`);
      if (!level.forms.includes(q.meta.form)) fail(`צורה ${q.meta.form} לא ברשימה`);
      // כל תוצאת ביניים שלמה: אם יש חילוק, המחולק מתחלק במחלק
      for (let i = 0; i < left.length; i++) {
        if (left[i] === ':' && isNum(left[i - 1]) && left[i - 1] % left[i + 1] !== 0) fail(`חילוק ביניים לא שלם: ${left.join(' ')}`);
      }
      break;
    }
    case 'fracShape': {
      checkCards(q, 'frac');
      const { n, d } = q.meta;
      const correct = q.cards.fracs[q.cards.correctIndex];
      if (correct.n !== n || correct.d !== d) fail(`שבר שגוי: ${n}/${d}`);
      if (!level.denominators.includes(d)) fail(`מכנה ${d} לא ברשימה`);
      if (level.unitOnly && n !== 1) fail(`לא שבר יחידה: ${n}/${d}`);
      if (n < 1 || n >= d) fail(`שבר לא תקין: ${n}/${d}`);
      if (q.display?.fraction?.n !== n || q.display?.fraction?.d !== d) fail('התצוגה לא תואמת לשבר');
      for (const f of q.cards.fracs) if (f.n < 1 || f.d < 2 || f.n > f.d) fail(`מסיח לא תקין: ${f.n}/${f.d}`);
      break;
    }
    case 'fracOf': {
      const [answer] = checkKeypadAnswer(q);
      const { n, d, of } = q.meta;
      if (!level.denominators.includes(d)) fail(`מכנה ${d} לא ברשימה`);
      if (level.unitOnly && n !== 1) fail(`לא שבר יחידה: ${n}/${d}`);
      if (of % d !== 0) fail(`${of} לא מתחלק ב-${d}`);
      if (of > level.of.max) fail(`כמות ${of} > ${level.of.max}`);
      if (answer !== (of / d) * n) fail(`חלק מכמות שגוי: ${n}/${d} של ${of} = ${answer}`);
      break;
    }
    case 'fracCompare': {
      const list = checkCards(q, 'frac');
      if (list.length !== 2) fail('צריך שני שברים');
      const [f1, f2] = q.cards.fracs;
      const bigger = f1.n / f1.d > f2.n / f2.d ? 0 : 1;
      if (f1.n / f1.d === f2.n / f2.d) fail(`שברים שווים: ${list}`);
      if (q.cards.correctIndex !== bigger) fail(`השוואה שגויה: ${list}`);
      for (const f of q.cards.fracs) if (!level.denominators.includes(f.d)) fail(`מכנה ${f.d} לא ברשימה`);
      break;
    }
    case 'clockRead': {
      const times = checkCards(q, 'time');
      const { h, m } = q.meta;
      if (!level.minutes.includes(m)) fail(`דקות ${m} לא ברשימה`);
      if (h < 1 || h > 12) fail(`שעה לא תקינה: ${h}`);
      if (times[q.cards.correctIndex] !== `${h}:${String(m).padStart(2, '0')}`) fail(`שעה שגויה: ${times[q.cards.correctIndex]} ≠ ${h}:${m}`);
      if (q.display?.clock?.h !== h || q.display?.clock?.m !== m) fail('השעון לא תואם');
      for (const t of times) if (!/^([1-9]|1[0-2]):[0-5]\d$/.test(t)) fail(`פורמט שעה: ${t}`);
      break;
    }
    case 'timeAdd': {
      const times = checkCards(q, 'time');
      const { h, m, add, result } = q.meta;
      if (!level.addMinutes.includes(add)) fail(`תוספת ${add} לא ברשימה`);
      const total = h * 60 + m + add;
      const wantH = ((Math.floor(total / 60) - 1) % 12 + 12) % 12 + 1, wantM = total % 60;
      if (result.h !== wantH || result.m !== wantM) fail(`חישוב זמן שגוי: ${h}:${m} + ${add}`);
      if (times[q.cards.correctIndex] !== `${wantH}:${String(wantM).padStart(2, '0')}`) fail(`תשובה שגויה: ${times[q.cards.correctIndex]}`);
      break;
    }
    case 'duration': {
      const [answer] = checkKeypadAnswer(q);
      const { from, to, dur } = q.meta;
      if (answer !== dur) fail('משך לא תואם');
      if (dur <= 0 || dur > (level.maxMinutes || 60)) fail(`משך ${dur} מחוץ לטווח`);
      const start = from.h * 60 + from.m;
      const endTotal = start + dur;
      const wantH = ((Math.floor(endTotal / 60) - 1) % 12 + 12) % 12 + 1;
      if (to.h !== wantH || to.m !== endTotal % 60) fail(`שעת סיום שגויה: ${from.h}:${from.m} + ${dur} ≠ ${to.h}:${to.m}`);
      if (!q.display?.clocks || q.display.clocks.length !== 2) fail('צריך שני שעונים');
      break;
    }
    case 'units': {
      const [answer] = checkKeypadAnswer(q);
      const { kind, factor, n, reverse } = q.meta;
      if (!level.kinds.includes(kind)) fail(`סוג ${kind} לא ברשימה`);
      if (!q.story) fail('אין סיפור');
      if (answer !== (reverse ? n : n * factor)) fail(`המרה שגויה: ${kind} ${n} → ${answer}`);
      if (!q.story.includes(String(reverse ? n * factor : n))) fail(`המספר לא מופיע בסיפור: ${q.story}`);
      break;
    }
    case 'sides': {
      const [answer] = checkKeypadAnswer(q);
      if (answer !== q.meta.n || q.display?.polygon !== q.meta.n) fail(`מצולע: ${q.meta.n} → ${answer}`);
      if (!inRange(q.meta.n, level.ngon)) fail(`מצולע מחוץ לטווח: ${q.meta.n}`);
      break;
    }
    case 'shapeName': {
      const words = checkCards(q, 'word');
      if (words[q.cards.correctIndex] !== q.meta.name) fail(`שם צורה: ${q.meta.name}`);
      if (q.display?.polygon !== q.meta.n) fail('התצוגה לא תואמת');
      if (!inRange(q.meta.n, level.ngon)) fail(`מצולע מחוץ לטווח: ${q.meta.n}`);
      break;
    }
    case 'perimeter': {
      const [answer] = checkKeypadAnswer(q);
      const { kind, sides } = q.meta;
      if (!level.shapes.includes(kind)) fail(`צורה ${kind} לא ברשימה`);
      if (answer !== sides.reduce((a, b) => a + b, 0)) fail(`היקף שגוי: ${sides} → ${answer}`);
      if (sides.some(s => !inRange(s, level.side))) fail(`צלע מחוץ לטווח: ${sides}`);
      if (kind === 'square' && new Set(sides).size !== 1) fail(`ריבוע לא שווה צלעות: ${sides}`);
      if (kind === 'rect' && (sides[0] !== sides[2] || sides[1] !== sides[3] || sides[0] === sides[1])) fail(`מלבן לא תקין: ${sides}`);
      if (kind === 'triangle') {
        const [a, b, c] = sides;
        if (sides.length !== 3 || a + b <= c || a + c <= b || b + c <= a) fail(`משולש לא תקין: ${sides}`);
      }
      break;
    }
    case 'area': {
      const [answer] = checkKeypadAnswer(q);
      const { w, h } = q.meta;
      if (answer !== w * h) fail(`שטח שגוי: ${w}x${h} → ${answer}`);
      if (!inRange(w, level.side) || !inRange(h, level.side)) fail(`צלע מחוץ לטווח: ${w}x${h}`);
      break;
    }
    case 'word': {
      const [answer] = checkKeypadAnswer(q);
      if (!q.story || q.story.length < 15) fail(`סיפור חסר: ${q.story}`);
      if (r.max !== undefined && answer > r.max) fail(`תשובה ${answer} > ${r.max}`);
      if (!level.stories.includes(q.meta.type)) fail(`סוג סיפור ${q.meta.type} לא ברשימה`);
      if (/\s{2,}|\s[,.?]/.test(q.story)) fail(`רווחים שגויים בסיפור: ${q.story}`);
      checkStoryAnswer(q);
      break;
    }
    default:
      fail(`op לא מוכר: ${level.op}`);
  }
}

// בסיפורים המספרים בטקסט חייבים להסביר את התשובה — בדיקה לפי סוג הסיפור
function checkStoryAnswer(q) {
  const nums = (q.story.match(/\d+(?::\d+)?/g) || []);
  const ints = nums.filter(x => !x.includes(':')).map(Number);
  const [a, b, c] = ints;
  const A = q.answer;
  const ok = {
    add: () => a + b === A,
    sub: () => a - b === A,
    compare: () => a - b === A,
    combine: () => a + b === A,
    mulStory: () => a * b === A,
    divStory: () => a / b === A,
    twoStep: () => a + b - c === A,
    mulTwoStep: () => a * b - c === A,
    divTwoStep: () => (a + b) / c === A,
    price: () => a * b === A,
    change: () => b - a === A,
    bigAdd: () => a + b === A,
    bigSub: () => a - b === A,
    remStory: () => (a % b === A) || Math.floor(a / b) === A,
    weekStory: () => a * 7 === A || a * b === A,
    timeStory: () => {
      if (nums.some(x => x.includes(':'))) {
        const [t1, t2] = nums.filter(x => x.includes(':')).map(t => t.split(':').map(Number));
        let mins = (t2[0] * 60 + t2[1]) - (t1[0] * 60 + t1[1]);
        if (mins < 0) mins += 12 * 60;
        return mins === A;
      }
      return (q.story.includes('שְׁעָתַיִם') ? 120 : 60) + a === A;
    },
  }[q.meta.type];
  if (!ok) fail(`סוג סיפור לא מוכר: ${q.meta.type}`);
  if (!ok()) fail(`התשובה לא מתאימה לסיפור: ${q.story} → ${A}`);
}

function inRange(v, range) {
  if (!range) return true;
  if (range.choices) return range.choices.includes(v);
  if (v < range.min || v > range.max) return false;
  if (range.step && (v - range.min) % range.step !== 0) return false;
  return true;
}

// ===== שלבי אלין: תקינות מבנה ותשובות =====
function checkVisual(level, q) {
  if (q.mode === 'cards') {
    const list = checkCards(q);
    const kind = q.cards.kind || 'count';
    const minCards = kind === 'emojiSize' ? 2 : 3;
    if (list.length < minCards) fail(`מעט כרטיסים: ${list.length}`);
    if (kind === 'count' || kind === 'digit') { if (list.some(c => c < 0 || c > 12)) fail(`מספר לא תקין: ${list}`); }
    if (kind === 'emojiSize' && !q.cards.emoji) fail('אין אימוג׳י לגודל');
  } else if (q.mode === 'tap') {
    if (q.target >= q.total) fail(`יעד ${q.target} >= סהכ ${q.total}`);
    if (q.total > 9) fail(`יותר מדי עצמים: ${q.total}`);
  } else if (q.mode === 'pickGroup') {
    if (q.groups.length < 2) fail(`מעט קבוצות: ${q.groups}`);
    if (new Set(q.groups).size !== q.groups.length) fail(`קבוצות כפולות: ${q.groups}`);
    if (q.correctIndex < 0 || q.correctIndex >= q.groups.length) fail(`אינדקס שגוי: ${q.correctIndex}`);
  } else if (q.mode === 'yesNo') {
    const [g1, g2] = q.groupsDisplay;
    if ((g1.count === g2.count) !== q.answer) fail(`תשובה לא תואמת: ${g1.count},${g2.count} → ${q.answer}`);
  } else {
    fail(`mode לא צפוי: ${q.mode}`);
  }
}

// ===== הרצה: N דגימות לשלב, מחזיר רשימת שגיאות (עד 5) =====
export function checkLevel(level, N = 1000) {
  const errors = [];
  for (let i = 0; i < N; i++) {
    let q;
    try {
      q = makeQuestion(level);
      checkQuestion(level, q);
    } catch (err) {
      errors.push(String(err && err.message ? err.message : err));
      if (errors.length >= 5) break;
    }
  }
  return errors;
}

// מבחן: מספר שאלות נכון, כל שאלה תקינה מול השלב שממנו הגיעה, בלי חזרות
export function checkExam(levels, count, rounds = 50) {
  const errors = [];
  const byId = Object.fromEntries(levels.map(l => [l.id, l]));
  for (let i = 0; i < rounds && errors.length < 5; i++) {
    try {
      const qs = generateExam(levels, count);
      if (qs.length !== count) fail(`מספר שאלות: ${qs.length}`);
      const keys = new Set(qs.map(q => q.key));
      if (keys.size !== qs.length) fail('שאלות חוזרות במבחן');
      for (const q of qs) {
        const level = byId[q.levelId];
        if (!level) fail(`שלב לא מוכר: ${q.levelId}`);
        checkQuestion(level, q);
      }
    } catch (err) {
      errors.push(String(err && err.message ? err.message : err));
    }
  }
  return errors;
}
