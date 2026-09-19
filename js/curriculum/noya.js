// הקוריקולום של נויה — כיתה ג': 60 שלבים ב-10 עולמות + מבחן בסוף כל עולם
// נושאים: מספרים עד 1000, חיבור וחיסור עד 1000, לוח הכפל, חילוק (גם עם שארית),
// כפל וחילוק גדולים, סדר פעולות, שברים, זמן ומידות, גיאומטריה ובעיות מילוליות.
//
// סכמת שלב (op):
//   add | sub | mixed | missing | boss     — חיבור/חיסור (regroup: required | forbidden | any; טווח עם step או choices)
//   mul | mulMissing                       — tables=[גורמים], b=טווח הגורם השני, result.max אופציונלי
//   div | divMissing                       — divisors=[מחלקים], q=טווח המנה (בלי שארית)
//   divRem                                 — חילוק עם שארית: divisors, q, remZero=סיכוי לשארית 0
//   placeValue                             — variants: digit (הספרה במקום...) | value (ערך הספרה)
//   compose                                — פירוק לפי מבנה עשרוני (300+40+7) / חלק חסר
//   compare                                — <, >, = בין שני מספרים
//   evenOdd                                — זוגי / אי-זוגי
//   round                                  — עיגול, to=[10,100]
//   sequence                               — סדרה עם דילוג קבוע: steps, dir
//   orderOps                               — סדר פעולות: forms=[...]
//   fracShape | fracOf | fracCompare       — שברים
//   clockRead | timeAdd | duration         — שעון ומשך זמן
//   units                                  — המרת מידות (מטר/ס"מ, ק"ג/גרם, שעה/דקות, שקל/אגורות...)
//   sides | shapeName | perimeter | area   — גיאומטריה
//   word                                   — בעיות מילוליות: stories=[...]

export const meta = {
  id: 'noya',
  tag: 'g3',              // קידומת למדבקות — כדי לא להתנגש עם ההתקדמות מהקוריקולום הישן
  questionsPerRound: 10,
  grade: 'כיתה ג׳',
  // מבחן בסוף כל עולם: 15 שאלות, ניסיון אחד לכל שאלה, ציון 70 ומעלה פותח את העולם הבא
  exam: { questions: 15, pass: 70, finalQuestions: 20 },
};

export const worlds = [
  { n: 1, name: 'עיר המספרים הגדולים', icon: '🔢', theme: 'numbers' },
  { n: 2, name: 'גשר החיבור והחיסור', icon: '🌉', theme: 'beach' },
  { n: 3, name: 'אי לוח הכפל', icon: '🏝️', theme: 'island' },
  { n: 4, name: 'ממלכת החילוק', icon: '❄️', theme: 'ice' },
  { n: 5, name: 'הר הכפל הגדול', icon: '🌋', theme: 'volcano' },
  { n: 6, name: 'מערת סדר הפעולות', icon: '💎', theme: 'crystal' },
  { n: 7, name: 'גן השברים', icon: '🍕', theme: 'garden' },
  { n: 8, name: 'עיר הזמן והמידות', icon: '⏰', theme: 'story' },
  { n: 9, name: 'ארץ הצורות', icon: '📐', theme: 'shapes' },
  { n: 10, name: 'ארמון הסיפורים', icon: '📚', theme: 'palace' },
];

const Q = 10;
const ALL_TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// ===== עולם 1: עיר המספרים הגדולים — המבנה העשרוני עד 1000 =====
const g01 = { id: 'g01', world: 1, title: 'מאות, עשרות ואחדות', op: 'placeValue', variants: ['digit'],
  range: { min: 100, max: 999 }, questions: Q };
const g02 = { id: 'g02', world: 1, title: 'פירוק מספר', op: 'compose',
  range: { min: 100, max: 999 }, questions: Q };
const g03 = { id: 'g03', world: 1, title: 'ערך הספרה', op: 'placeValue', variants: ['value', 'digit'],
  range: { min: 100, max: 999 }, questions: Q };
const g04 = { id: 'g04', world: 1, title: 'גדול, קטן או שווה?', op: 'compare',
  range: { min: 100, max: 999 }, questions: Q };
const g05 = { id: 'g05', world: 1, title: 'עשר יותר, מאה פחות', op: 'mixed',
  a: { min: 101, max: 899 }, b: { choices: [10, 100] }, result: { min: 0, max: 1000 }, regroup: 'any', questions: Q };
const g06 = { id: 'g06', world: 1, title: 'עיגול לעשרות ולמאות', op: 'round', to: [10, 100],
  range: { min: 101, max: 989 }, questions: Q };

// ===== עולם 2: גשר החיבור והחיסור — עד 1000 =====
const g07 = { id: 'g07', world: 2, title: 'מאות שלמות', op: 'mixed',
  a: { min: 100, max: 900, step: 100 }, b: { min: 100, max: 900, step: 100 }, result: { min: 0, max: 1000 }, regroup: 'any', questions: Q };
const g08 = { id: 'g08', world: 2, title: 'חיבור עד 1000 בלי המרה', op: 'add',
  a: { min: 101, max: 899 }, b: { min: 11, max: 899 }, result: { max: 999 }, regroup: 'forbidden', questions: Q };
const g09 = { id: 'g09', world: 2, title: 'חיבור עד 1000 עם המרה', op: 'add',
  a: { min: 101, max: 899 }, b: { min: 11, max: 899 }, result: { max: 1000 }, regroup: 'required', questions: Q };
const g10 = { id: 'g10', world: 2, title: 'חיסור עד 1000 בלי פריטה', op: 'sub',
  a: { min: 201, max: 999 }, b: { min: 11, max: 899 }, result: { min: 10 }, regroup: 'forbidden', questions: Q };
const g11 = { id: 'g11', world: 2, title: 'חיסור עד 1000 עם פריטה', op: 'sub',
  a: { min: 201, max: 999 }, b: { min: 11, max: 899 }, result: { min: 10 }, regroup: 'required', questions: Q };
const g12 = { id: 'g12', world: 2, title: 'שלב הבוס! 👑', op: 'boss', base: ['add', 'sub', 'missing'],
  a: { min: 101, max: 899 }, b: { min: 11, max: 500 }, result: { min: 1, max: 1000 }, regroup: 'any', questions: Q };

// ===== עולם 3: אי לוח הכפל — שליטה מלאה בלוח =====
const g13 = { id: 'g13', world: 3, title: 'כפל ב-2, 5 ו-10', op: 'mul', tables: [2, 5, 10], b: { min: 1, max: 10 }, questions: Q };
const g14 = { id: 'g14', world: 3, title: 'כפל ב-3, 4 ו-6', op: 'mul', tables: [3, 4, 6], b: { min: 1, max: 10 }, questions: Q };
const g15 = { id: 'g15', world: 3, title: 'כפל ב-7, 8 ו-9', op: 'mul', tables: [7, 8, 9], b: { min: 1, max: 10 }, questions: Q };
const g16 = { id: 'g16', world: 3, title: 'כל לוח הכפל', op: 'mul', tables: ALL_TABLES, b: { min: 1, max: 10 }, questions: Q };
const g17 = { id: 'g17', world: 3, title: 'הגורם החסר', op: 'mulMissing', tables: ALL_TABLES, b: { min: 2, max: 10 }, questions: Q };
const g18 = { id: 'g18', world: 3, title: 'סדרות ודילוגים', op: 'sequence',
  steps: [2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 100], dir: 'both', start: { min: 0, max: 60 }, shown: 4, questions: Q };

// ===== עולם 4: ממלכת החילוק — גם עם שארית =====
const g19 = { id: 'g19', world: 4, title: 'חילוק ב-2, 5 ו-10', op: 'div', divisors: [2, 5, 10], q: { min: 1, max: 10 }, questions: Q };
const g20 = { id: 'g20', world: 4, title: 'חילוק ב-3, 4 ו-6', op: 'div', divisors: [3, 4, 6], q: { min: 1, max: 10 }, questions: Q };
const g21 = { id: 'g21', world: 4, title: 'חילוק ב-7, 8 ו-9', op: 'div', divisors: [7, 8, 9], q: { min: 1, max: 10 }, questions: Q };
const g22 = { id: 'g22', world: 4, title: 'כל החילוקים', op: 'div', divisors: ALL_TABLES, q: { min: 1, max: 10 }, questions: Q };
const g23 = { id: 'g23', world: 4, title: 'חילוק עם שארית', op: 'divRem', divisors: [2, 3, 4, 5], q: { min: 1, max: 9 }, remZero: 0, questions: Q };
const g24 = { id: 'g24', world: 4, title: 'שארית — כל המחלקים', op: 'divRem', divisors: [2, 3, 4, 5, 6, 7, 8, 9], q: { min: 1, max: 9 }, remZero: 0.25, questions: Q };

// ===== עולם 5: הר הכפל הגדול — כפל וחילוק מעבר ללוח =====
const g25 = { id: 'g25', world: 5, title: 'כפל ב-10 וב-100', op: 'mul', tables: [10, 100], b: { min: 1, max: 9 }, questions: Q };
const g26 = { id: 'g26', world: 5, title: 'כפל עשרות שלמות', op: 'mul', tables: [2, 3, 4, 5, 6, 7, 8, 9],
  b: { min: 10, max: 90, step: 10 }, result: { max: 900 }, questions: Q };
const g27 = { id: 'g27', world: 5, title: 'דו-ספרתי כפול חד-ספרתי', op: 'mul', tables: [2, 3, 4, 5],
  b: { min: 11, max: 49 }, result: { max: 200 }, questions: Q };
const g28 = { id: 'g28', world: 5, title: 'כפל גדול', op: 'mul', tables: [2, 3, 4, 5, 6, 7, 8, 9],
  b: { min: 12, max: 99 }, result: { max: 900 }, questions: Q };
const g29 = { id: 'g29', world: 5, title: 'חילוק ב-10 וב-100', op: 'div', divisors: [10, 100], q: { min: 2, max: 9 }, questions: Q };
const g30 = { id: 'g30', world: 5, title: 'חילוק דו-ספרתי', op: 'div', divisors: [2, 3, 4, 5, 6, 7, 8, 9], q: { min: 11, max: 25 }, questions: Q };

// ===== עולם 6: מערת סדר הפעולות =====
const g31 = { id: 'g31', world: 6, title: 'כפל לפני חיבור', op: 'orderOps', forms: ['a+b×c', 'a×b+c'], questions: Q };
const g32 = { id: 'g32', world: 6, title: 'כפל לפני חיסור', op: 'orderOps', forms: ['a−b×c', 'a×b−c'], questions: Q };
const g33 = { id: 'g33', world: 6, title: 'חילוק לפני חיבור וחיסור', op: 'orderOps', forms: ['a+b:c', 'a−b:c', 'a:b+c'], questions: Q };
const g34 = { id: 'g34', world: 6, title: 'סוגריים קודמים לכל', op: 'orderOps', forms: ['(a+b)×c', '(a−b)×c'], questions: Q };
const g35 = { id: 'g35', world: 6, title: 'סוגריים וחילוק', op: 'orderOps', forms: ['(a+b):c', '(a−b):c'], questions: Q };
const g36 = { id: 'g36', world: 6, title: 'שלב הבוס! 👑', op: 'orderOps',
  forms: ['a+b×c', 'a×b+c', 'a−b×c', 'a×b−c', 'a+b:c', 'a−b:c', '(a+b)×c', '(a−b)×c', '(a+b):c', '(a−b):c'], questions: Q };

// ===== עולם 7: גן השברים =====
const g37 = { id: 'g37', world: 7, title: 'חצי, שליש ורבע', op: 'fracShape', denominators: [2, 3, 4], unitOnly: true, questions: Q };
const g38 = { id: 'g38', world: 7, title: 'איזה חלק צבוע?', op: 'fracShape', denominators: [2, 3, 4, 5, 6, 8], unitOnly: false, questions: Q };
const g39 = { id: 'g39', world: 7, title: 'חצי של, רבע של', op: 'fracOf', denominators: [2, 4], unitOnly: true, of: { max: 40 }, questions: Q };
const g40 = { id: 'g40', world: 7, title: 'חלק מכמות', op: 'fracOf', denominators: [2, 3, 4, 5, 6, 8, 10], unitOnly: true, of: { max: 60 }, questions: Q };
const g41 = { id: 'g41', world: 7, title: 'שלושה רבעים של...', op: 'fracOf', denominators: [3, 4, 5, 6, 8, 10], unitOnly: false, of: { max: 60 }, questions: Q };
const g42 = { id: 'g42', world: 7, title: 'איזה שבר גדול יותר?', op: 'fracCompare', denominators: [2, 3, 4, 5, 6, 8, 10], questions: Q };

// ===== עולם 8: עיר הזמן והמידות =====
const g43 = { id: 'g43', world: 8, title: 'מה השעה? שעות וחצאים', op: 'clockRead', minutes: [0, 30], questions: Q };
const g44 = { id: 'g44', world: 8, title: 'מה השעה? רבעים', op: 'clockRead', minutes: [0, 15, 30, 45], questions: Q };
const g45 = { id: 'g45', world: 8, title: 'מה השעה? חמש דקות', op: 'clockRead', minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], questions: Q };
const g46 = { id: 'g46', world: 8, title: 'כמה דקות עברו?', op: 'duration', maxMinutes: 90, questions: Q };
const g47 = { id: 'g47', world: 8, title: 'מה תהיה השעה?', op: 'timeAdd', addMinutes: [5, 10, 15, 20, 25, 30, 40, 45, 60], questions: Q };
const g48 = { id: 'g48', world: 8, title: 'מטרים, גרמים, שקלים ודקות', op: 'units',
  kinds: ['m_cm', 'km_m', 'kg_g', 'h_min', 'min_s', 'ils_ag', 'day_h', 'week_d'], questions: Q };

// ===== עולם 9: ארץ הצורות =====
const g49 = { id: 'g49', world: 9, title: 'כמה צלעות? כמה קודקודים?', op: 'sides', ngon: { min: 3, max: 8 }, questions: Q };
const g50 = { id: 'g50', world: 9, title: 'שם הצורה', op: 'shapeName', ngon: { min: 3, max: 6 }, questions: Q };
const g51 = { id: 'g51', world: 9, title: 'היקף ריבוע', op: 'perimeter', shapes: ['square'], side: { min: 2, max: 25 }, questions: Q };
const g52 = { id: 'g52', world: 9, title: 'היקף מלבן', op: 'perimeter', shapes: ['rect'], side: { min: 2, max: 20 }, questions: Q };
const g53 = { id: 'g53', world: 9, title: 'שטח — ספירת ריבועים', op: 'area', side: { min: 2, max: 8 }, questions: Q };
const g54 = { id: 'g54', world: 9, title: 'היקף משולש ומלבן', op: 'perimeter', shapes: ['triangle', 'rect', 'square'], side: { min: 3, max: 20 }, questions: Q };

// ===== עולם 10: ארמון הסיפורים — בעיות מילוליות =====
const g55 = { id: 'g55', world: 10, title: 'סיפורי כפל וחילוק', op: 'word', stories: ['mulStory', 'divStory'], result: { max: 100 }, questions: Q };
const g56 = { id: 'g56', world: 10, title: 'בחנות — שקלים ועודף', op: 'word', stories: ['price', 'change'], result: { max: 100 }, questions: Q };
const g57 = { id: 'g57', world: 10, title: 'מספרים גדולים', op: 'word', stories: ['bigAdd', 'bigSub', 'compare'], result: { max: 1000 }, questions: Q };
const g58 = { id: 'g58', world: 10, title: 'שני צעדים', op: 'word', stories: ['mulTwoStep', 'twoStep', 'divTwoStep'], result: { max: 100 }, questions: Q };
const g59 = { id: 'g59', world: 10, title: 'שארית, שבוע ושעות', op: 'word', stories: ['remStory', 'weekStory', 'timeStory'], result: { max: 200 }, questions: Q };
const g60 = { id: 'g60', world: 10, title: 'הבוס הגדול! 👑', op: 'word',
  stories: ['mulStory', 'divStory', 'price', 'change', 'bigAdd', 'bigSub', 'compare', 'mulTwoStep', 'twoStep', 'divTwoStep', 'remStory', 'weekStory', 'timeStory'],
  result: { max: 1000 }, questions: Q };

export const levels = [
  g01, g02, g03, g04, g05, g06,
  g07, g08, g09, g10, g11, g12,
  g13, g14, g15, g16, g17, g18,
  g19, g20, g21, g22, g23, g24,
  g25, g26, g27, g28, g29, g30,
  g31, g32, g33, g34, g35, g36,
  g37, g38, g39, g40, g41, g42,
  g43, g44, g45, g46, g47, g48,
  g49, g50, g51, g52, g53, g54,
  g55, g56, g57, g58, g59, g60,
];
