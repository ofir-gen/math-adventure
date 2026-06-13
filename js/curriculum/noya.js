// הקוריקולום של נויה — 60 שלבים, 10 עולמות: חיבור/חיסור עד 100, כפל, חילוק ובעיות מילוליות
// סכמת שלב: op: add | sub | mixed | missing | add3 | boss | mul | mulMissing | div | divMissing | word
// regroup: 'required' (חייב המרה/פריטה) | 'forbidden' (אסור) | 'any'
// טווח עם step (למשל עשרות עגולות): { min, max, step }
// כפל: tables=[לוחות הכפל], b=טווח המוכפל. חילוק: divisors=[מחלקים], q=טווח התוצאה (תמיד בלי שארית)
// word: stories=[סוגי סיפורים: add|sub|compare|combine|mulStory|divStory|twoStep]

export const meta = { id: 'noya', questionsPerRound: 10 };

export const worlds = [
  { n: 1, name: 'יער הקסמים', icon: '🌳', theme: 'forest' },
  { n: 2, name: 'חוף הים', icon: '🏖️', theme: 'beach' },
  { n: 3, name: 'ההרים', icon: '⛰️', theme: 'mountain' },
  { n: 4, name: 'החלל', icon: '🚀', theme: 'space' },
  { n: 5, name: 'אי הכפל', icon: '🏝️', theme: 'island' },
  { n: 6, name: 'הר הגעש', icon: '🌋', theme: 'volcano' },
  { n: 7, name: 'ממלכת הקרח', icon: '❄️', theme: 'ice' },
  { n: 8, name: 'מערת הקריסטל', icon: '💎', theme: 'crystal' },
  { n: 9, name: 'עיר הסיפורים', icon: '📚', theme: 'story' },
  { n: 10, name: 'ארמון הקסם', icon: '🏰', theme: 'palace' },
];

const Q = 10;

export const levels = [
  // ===== עולם 1: יער הקסמים — עד 10 ועד 20 בעדינות =====
  { id: 'n01', world: 1, title: 'חיבור עד 10', op: 'add',
    a: { min: 1, max: 9 }, b: { min: 1, max: 9 }, result: { max: 10 }, regroup: 'any', questions: Q },
  { id: 'n02', world: 1, title: 'חיסור עד 10', op: 'sub',
    a: { min: 2, max: 10 }, b: { min: 1, max: 9 }, result: { min: 0, max: 10 }, regroup: 'any', questions: Q },
  { id: 'n03', world: 1, title: 'מעורב עד 10', op: 'mixed',
    a: { min: 1, max: 10 }, b: { min: 1, max: 9 }, result: { min: 0, max: 10 }, regroup: 'any', questions: Q },
  { id: 'n04', world: 1, title: 'השלמה לעשר', op: 'missing', base: ['add'], sumExact: 10, sumExactChance: 0.6,
    a: { min: 1, max: 9 }, b: { min: 1, max: 9 }, result: { max: 10 }, regroup: 'any', questions: Q },
  { id: 'n05', world: 1, title: 'חיבור עד 20', op: 'add',
    a: { min: 11, max: 18 }, b: { min: 1, max: 8 }, result: { max: 20 }, regroup: 'forbidden', questions: Q },
  { id: 'n06', world: 1, title: 'חיסור עד 20', op: 'sub',
    a: { min: 11, max: 19 }, b: { min: 1, max: 8 }, result: { min: 10, max: 19 }, regroup: 'forbidden', questions: Q },

  // ===== עולם 2: חוף הים — עד 20 עם המרה ופריטה =====
  { id: 'n07', world: 2, title: 'חיבור עם המרה', op: 'add',
    a: { min: 3, max: 9 }, b: { min: 3, max: 9 }, result: { max: 18 }, regroup: 'required', questions: Q },
  { id: 'n08', world: 2, title: 'חיסור עם פריטה', op: 'sub',
    a: { min: 11, max: 18 }, b: { min: 3, max: 9 }, result: { min: 2, max: 9 }, regroup: 'required', questions: Q },
  { id: 'n09', world: 2, title: 'מעורב עד 20', op: 'mixed',
    a: { min: 2, max: 19 }, b: { min: 2, max: 17 }, result: { min: 0, max: 20 }, regroup: 'any', questions: Q },
  { id: 'n10', world: 2, title: 'שלושה מספרים', op: 'add3',
    a: { min: 1, max: 9 }, b: { min: 1, max: 9 }, c: { min: 1, max: 9 }, result: { max: 20 }, questions: Q },
  { id: 'n11', world: 2, title: 'המספר החסר', op: 'missing', base: ['add', 'sub'],
    a: { min: 2, max: 19 }, b: { min: 2, max: 17 }, result: { min: 1, max: 20 }, regroup: 'any', questions: Q },
  { id: 'n12', world: 2, title: 'עשרות שלמות', op: 'add',
    a: { min: 10, max: 80, step: 10 }, b: { min: 10, max: 80, step: 10 }, result: { max: 100 }, regroup: 'any', questions: Q },

  // ===== עולם 3: ההרים — דו-ספרתי עם חד-ספרתי =====
  { id: 'n13', world: 3, title: 'חיסור עשרות', op: 'sub',
    a: { min: 20, max: 90, step: 10 }, b: { min: 10, max: 80, step: 10 }, result: { min: 10, max: 80 }, regroup: 'any', questions: Q },
  { id: 'n14', world: 3, title: 'גדול ועוד קטן', op: 'add',
    a: { min: 21, max: 88 }, b: { min: 1, max: 8 }, result: { max: 99 }, regroup: 'forbidden', questions: Q },
  { id: 'n15', world: 3, title: 'גדול פחות קטן', op: 'sub',
    a: { min: 21, max: 99 }, b: { min: 1, max: 8 }, result: { min: 11 }, regroup: 'forbidden', questions: Q },
  { id: 'n16', world: 3, title: 'גדול ועוד קטן — עם המרה', op: 'add',
    a: { min: 21, max: 89 }, b: { min: 2, max: 9 }, result: { max: 100 }, regroup: 'required', questions: Q },
  { id: 'n17', world: 3, title: 'גדול פחות קטן — עם פריטה', op: 'sub',
    a: { min: 21, max: 96 }, b: { min: 2, max: 9 }, result: { min: 12 }, regroup: 'required', questions: Q },
  { id: 'n18', world: 3, title: 'מספר ועוד עשרות', op: 'add',
    a: { min: 11, max: 79 }, b: { min: 10, max: 80, step: 10 }, result: { max: 100 }, regroup: 'any', questions: Q },

  // ===== עולם 4: החלל — עד 100 =====
  { id: 'n19', world: 4, title: 'חיבור גדולים', op: 'add',
    a: { min: 12, max: 87 }, b: { min: 11, max: 86 }, result: { max: 99 }, regroup: 'forbidden', questions: Q },
  { id: 'n20', world: 4, title: 'חיסור גדולים', op: 'sub',
    a: { min: 25, max: 99 }, b: { min: 11, max: 87 }, result: { min: 11 }, regroup: 'forbidden', questions: Q },
  { id: 'n21', world: 4, title: 'חיבור גדולים עם המרה', op: 'add',
    a: { min: 13, max: 88 }, b: { min: 12, max: 87 }, result: { max: 100 }, regroup: 'required', questions: Q },
  { id: 'n22', world: 4, title: 'חיסור גדולים עם פריטה', op: 'sub',
    a: { min: 22, max: 95 }, b: { min: 13, max: 88 }, result: { min: 1 }, regroup: 'required', questions: Q },
  { id: 'n23', world: 4, title: 'הכל ביחד עד 100', op: 'mixed',
    a: { min: 11, max: 89 }, b: { min: 11, max: 88 }, result: { min: 0, max: 100 }, regroup: 'any', questions: Q },
  { id: 'n24', world: 4, title: 'שלב הבוס! 👑', op: 'boss', base: ['add', 'sub'],
    a: { min: 11, max: 89 }, b: { min: 11, max: 88 }, result: { min: 1, max: 100 }, regroup: 'any', questions: Q },

  // ===== עולם 5: אי הכפל — לוחות קלים =====
  { id: 'n25', world: 5, title: 'כפל ב-2', op: 'mul', tables: [2], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n26', world: 5, title: 'כפל ב-10', op: 'mul', tables: [10], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n27', world: 5, title: 'כפל ב-5', op: 'mul', tables: [5], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n28', world: 5, title: 'כפל ב-3', op: 'mul', tables: [3], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n29', world: 5, title: 'כפל ב-4', op: 'mul', tables: [4], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n30', world: 5, title: 'שלב הבוס! 👑', op: 'mul', tables: [2, 3, 4, 5, 10], b: { min: 1, max: 10 }, questions: Q },

  // ===== עולם 6: הר הגעש — לוחות מתקדמים =====
  { id: 'n31', world: 6, title: 'כפל ב-6', op: 'mul', tables: [6], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n32', world: 6, title: 'כפל ב-7', op: 'mul', tables: [7], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n33', world: 6, title: 'כפל ב-8', op: 'mul', tables: [8], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n34', world: 6, title: 'כפל ב-9', op: 'mul', tables: [9], b: { min: 1, max: 10 }, questions: Q },
  { id: 'n35', world: 6, title: 'המספר החסר', op: 'mulMissing', tables: [2, 3, 4, 5, 6], b: { min: 2, max: 10 }, questions: Q },
  { id: 'n36', world: 6, title: 'שלב הבוס! 👑', op: 'mul', tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], b: { min: 1, max: 10 }, questions: Q },

  // ===== עולם 7: ממלכת הקרח — חילוק קל (תמיד בלי שארית) =====
  { id: 'n37', world: 7, title: 'חילוק ב-2', op: 'div', divisors: [2], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n38', world: 7, title: 'חילוק ב-10', op: 'div', divisors: [10], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n39', world: 7, title: 'חילוק ב-5', op: 'div', divisors: [5], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n40', world: 7, title: 'חילוק ב-3', op: 'div', divisors: [3], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n41', world: 7, title: 'חילוק ב-4', op: 'div', divisors: [4], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n42', world: 7, title: 'שלב הבוס! 👑', op: 'div', divisors: [2, 3, 4, 5, 10], q: { min: 1, max: 10 }, questions: Q },

  // ===== עולם 8: מערת הקריסטל — חילוק מתקדם =====
  { id: 'n43', world: 8, title: 'חילוק ב-6', op: 'div', divisors: [6], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n44', world: 8, title: 'חילוק ב-7', op: 'div', divisors: [7], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n45', world: 8, title: 'חילוק ב-8', op: 'div', divisors: [8], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n46', world: 8, title: 'חילוק ב-9', op: 'div', divisors: [9], q: { min: 1, max: 10 }, questions: Q },
  { id: 'n47', world: 8, title: 'המספר החסר', op: 'divMissing', divisors: [2, 3, 4, 5, 6], q: { min: 2, max: 10 }, questions: Q },
  { id: 'n48', world: 8, title: 'שלב הבוס! 👑', op: 'div', divisors: [2, 3, 4, 5, 6, 7, 8, 9, 10], q: { min: 1, max: 10 }, questions: Q },

  // ===== עולם 9: עיר הסיפורים — בעיות מילוליות בחיבור וחיסור =====
  { id: 'n49', world: 9, title: 'סיפורי חיבור', op: 'word', stories: ['add'], result: { max: 20 }, questions: Q },
  { id: 'n50', world: 9, title: 'סיפורי חיסור', op: 'word', stories: ['sub'], result: { max: 20 }, questions: Q },
  { id: 'n51', world: 9, title: 'בכמה יותר?', op: 'word', stories: ['compare'], result: { max: 20 }, questions: Q },
  { id: 'n52', world: 9, title: 'כמה ביחד?', op: 'word', stories: ['combine'], result: { max: 20 }, questions: Q },
  { id: 'n53', world: 9, title: 'סיפורים עד 50', op: 'word', stories: ['add', 'sub'], result: { max: 50 }, questions: Q },
  { id: 'n54', world: 9, title: 'שלב הבוס! 👑', op: 'word', stories: ['add', 'sub', 'compare', 'combine'], result: { max: 50 }, questions: Q },

  // ===== עולם 10: ארמון הקסם — סיפורי כפל, חילוק ושני צעדים =====
  { id: 'n55', world: 10, title: 'סיפורי כפל', op: 'word', stories: ['mulStory'], result: { max: 50 }, questions: Q },
  { id: 'n56', world: 10, title: 'סיפורי חילוק', op: 'word', stories: ['divStory'], result: { max: 50 }, questions: Q },
  { id: 'n57', world: 10, title: 'כפל או חילוק?', op: 'word', stories: ['mulStory', 'divStory'], result: { max: 50 }, questions: Q },
  { id: 'n58', world: 10, title: 'סיפורים גדולים', op: 'word', stories: ['add', 'sub', 'compare'], result: { max: 100 }, questions: Q },
  { id: 'n59', world: 10, title: 'שני צעדים', op: 'word', stories: ['twoStep'], result: { max: 20 }, questions: Q },
  { id: 'n60', world: 10, title: 'הבוס הגדול! 👑', op: 'word',
    stories: ['add', 'sub', 'compare', 'combine', 'mulStory', 'divStory', 'twoStep'], result: { max: 100 }, questions: Q },
];
