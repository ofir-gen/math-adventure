// יצירת תרגילים פרוצדורלית מתוך אילוצי השלב
import { pools } from '../curriculum/alin.js';

const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function riRange(r) {
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

const carries = (a, b) => (a % 10) + (b % 10) >= 10;
const borrows = (a, b) => (a % 10) < (b % 10);

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

export function makeQuestion(level) {
  return level.op ? makeEquation(level) : makeVisual(level);
}

// ===== תרגילי משוואה (נויה) =====

function makeEquation(level) {
  // כפל וחילוק — בלי לולאת דחייה, נבנים ישירות בלי שארית
  if (level.op === 'mul' || level.op === 'mulMissing') return makeMul(level);
  if (level.op === 'div' || level.op === 'divMissing') return makeDiv(level);
  if (level.op === 'word') return makeWord(level);

  for (let t = 0; t < 600; t++) {
    let op = level.op;
    if (op === 'mixed') op = pick(['add', 'sub']);
    if (op === 'boss') op = pick(['add', 'sub', 'missing']);

    if (op === 'add3') {
      const a = riRange(level.a), b = riRange(level.b), c = riRange(level.c);
      const sum = a + b + c;
      if (sum > level.result.max) continue;
      return eq([a, '+', b, '+', c, '=', '?'], sum, `${a} ועוד ${b} ועוד ${c}`);
    }

    if (op === 'missing') {
      const base = pick(level.base || ['add']);
      if (base === 'add') {
        let a = riRange(level.a), b = riRange(level.b);
        let sum = a + b;
        if (level.sumExact && Math.random() < (level.sumExactChance || 0.5)) {
          sum = level.sumExact;
          b = sum - a;
          if (b < 1) continue;
        }
        if (sum > level.result.max || !checkResult(level, sum)) continue;
        if (!regroupOk(level, 'add', a, b)) continue;
        return eq([a, '+', '?', '=', sum], b, `${a} ועוד כמה שווה ${sum}?`);
      } else {
        let a = riRange(level.a), b = riRange(level.b);
        if (a < b) [a, b] = [b, a];
        const diff = a - b;
        if (!checkResult(level, diff) || diff === 0) continue;
        if (!regroupOk(level, 'sub', a, b)) continue;
        return eq([a, '−', '?', '=', diff], b, `${a} פחות כמה שווה ${diff}?`);
      }
    }

    if (op === 'add') {
      const a = riRange(level.a), b = riRange(level.b);
      const sum = a + b;
      if (sum > level.result.max || !checkResult(level, sum)) continue;
      if (!regroupOk(level, 'add', a, b)) continue;
      return eq([a, '+', b, '=', '?'], sum, `${a} ועוד ${b}`);
    }

    if (op === 'sub') {
      let a = riRange(level.a), b = riRange(level.b);
      if (a < b) [a, b] = [b, a];
      if (a === b && (level.result.min ?? 0) > 0) continue;
      const diff = a - b;
      if (!checkResult(level, diff)) continue;
      if (!regroupOk(level, 'sub', a, b)) continue;
      return eq([a, '−', b, '=', '?'], diff, `${a} פחות ${b}`);
    }
  }
  // לא אמור לקרות (האילוצים בקוריקולום ניתנים לסיפוק) — תרגיל בטוח כגיבוי
  return eq([2, '+', 3, '=', '?'], 5, '2 ועוד 3');
}

function makeMul(level) {
  const table = pick(level.tables);
  const b = riRange(level.b);
  const prod = table * b;
  // מערבבים את סדר האופרנדים — 3×7 וגם 7×3
  const [x, y] = Math.random() < 0.5 ? [table, b] : [b, table];
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

// ===== בעיות מילוליות — סיפורים מנוקדים (כיתה ב' קוראת עם ניקוד) =====

const STORY_NAMES = ['דָּנָה', 'יָעֵל', 'נֹעָה', 'תָּמָר', 'רוֹנִי', 'מָאיָה'];
const STORY_OBJECTS = ['בַּלּוֹנִים', 'מַדְבֵּקוֹת', 'עוּגִיּוֹת', 'גּוּלוֹת', 'סֻכָּרִיּוֹת', 'תַּפּוּחִים', 'פְּרָחִים', 'סְפָרִים'];

function makeWord(level) {
  const type = pick(level.stories);
  const max = level.result?.max || 20;
  const name = pick(STORY_NAMES);
  const name2 = pick(STORY_NAMES.filter(n => n !== name));
  const obj = pick(STORY_OBJECTS);
  const obj2 = pick(STORY_OBJECTS.filter(o => o !== obj));
  let story, answer;

  switch (type) {
    case 'add': {
      const a = ri(3, Math.min(15, max - 2)), b = ri(2, max - a);
      story = `לְ${name} הָיוּ ${a} ${obj}. הִיא קִבְּלָה עוֹד ${b}. כַּמָּה ${obj} יֵשׁ לָהּ עַכְשָׁו?`;
      answer = a + b;
      break;
    }
    case 'sub': {
      const a = ri(5, max), b = ri(1, Math.min(9, a - 1));
      story = `לְ${name} הָיוּ ${a} ${obj}. הִיא נָתְנָה ${b} לַחֲבֵרָה. כַּמָּה נִשְׁאֲרוּ לָהּ?`;
      answer = a - b;
      break;
    }
    case 'compare': {
      const b = ri(2, max - 2), a = b + ri(1, Math.min(9, max - b));
      story = `לְ${name} יֵשׁ ${a} ${obj} וּלְ${name2} יֵשׁ ${b}. בְּכַמָּה יוֹתֵר יֵשׁ לְ${name}?`;
      answer = a - b;
      break;
    }
    case 'combine': {
      const a = ri(2, Math.min(12, max - 2)), b = ri(2, max - a);
      story = `בַּקֻּפְסָה יֵשׁ ${a} ${obj} וְעוֹד ${b} ${obj2}. כַּמָּה דְּבָרִים יֵשׁ בַּקֻּפְסָה בְּסַךְ הַכֹּל?`;
      answer = a + b;
      break;
    }
    case 'mulStory': {
      const bags = ri(2, 5), per = ri(2, Math.min(10, Math.floor(max / bags)));
      story = `בְּכָל שַׂקִּית יֵשׁ ${per} ${obj}. כַּמָּה ${obj} יֵשׁ בְּ-${bags} שַׂקִּיּוֹת?`;
      answer = bags * per;
      break;
    }
    case 'divStory': {
      const kids = ri(2, 5), each = ri(2, 10);
      const total = kids * each;
      story = `${name} מְחַלֶּקֶת ${total} ${obj} שָׁוֶה בְּשָׁוֶה בֵּין ${kids} חֲבֵרוֹת. כַּמָּה תְּקַבֵּל כָּל חֲבֵרָה?`;
      answer = each;
      break;
    }
    case 'twoStep': {
      const a = ri(4, 10), b = ri(2, 8), c = ri(2, Math.min(9, a + b - 1));
      story = `לְ${name} הָיוּ ${a} ${obj}. הִיא קִבְּלָה עוֹד ${b}, וְאָז נָתְנָה ${c} לַחֲבֵרָה. כַּמָּה יֵשׁ לָהּ עַכְשָׁו?`;
      answer = a + b - c;
      break;
    }
  }

  return { mode: 'keypad', story, answer, tts: story, key: `w:${story.slice(0, 30)}${answer}` };
}

function checkResult(level, value) {
  const r = level.result || {};
  if (r.max !== undefined && value > r.max) return false;
  if (r.min !== undefined && value < r.min) return false;
  return true;
}

function eq(parts, answer, tts) {
  return { mode: 'keypad', parts, answer, tts, key: parts.join('') };
}

// ===== תרגילים ציוריים (אלין) =====

function makeVisual(level) {
  const type = level.types ? pick(level.types) : level.type;
  const pool = pools[level.pool];
  const item = pick(pool);
  const other = pick(pool.filter(p => p.e !== item.e));
  // ברירת מחדל: ספרה + נקודות עזר לספירה; שלבים מתקדמים: ספרה בלבד
  const digitStyle = level.digitsOnly ? 'digitsOnly' : 'digits';
  // שמות מנוקדים להקראה (התצוגה נשארת בלי ניקוד)
  const itemN = item.tn || item.name;
  const otherN = other.tn || other.name;

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
      const same = Math.random() < 0.5;
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
