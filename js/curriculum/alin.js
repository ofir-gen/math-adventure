// הקוריקולום של אלין — 18 שלבים, 3 עולמות, הכל ציורי: בלי קריאת ספרות
// type: count | tapN | compareMore | compareLess | matchSame | sameOrNot |
//       visualAdd | visualSub | oneMore   (או types: [...] לשלבי בוס)
// layout: row | scatter | rows5
// כרטיסי תשובה: ספרה גדולה + נקודות לספירה; digitsOnly: ספרה בלבד (שלבים אחרונים)

export const meta = { id: 'alin', questionsPerRound: 8 };

export const worlds = [
  { n: 1, name: 'גן החיות', icon: '🦁', theme: 'zoo' },
  { n: 2, name: 'החווה', icon: '🐮', theme: 'farm' },
  { n: 3, name: 'הגינה הקסומה', icon: '🌷', theme: 'garden' },
  { n: 4, name: 'עולם הרצפים', icon: '🌈', theme: 'rainbow' },
  { n: 5, name: 'ארץ הצורות', icon: '🔷', theme: 'shapes' },
  { n: 6, name: 'עיר המספרים', icon: '🔢', theme: 'numbers' },
];

// name = שם רבים לתצוגה; tn = אותו שם מנוקד להקראה (TTS מבטא מנוקד הרבה יותר נכון);
// g = מין דקדוקי (m/f) להתאמת מילות המספר
export const pools = {
  zoo: [
    { e: '🦁', name: 'אריות', tn: 'אֲרָיוֹת', g: 'm' },
    { e: '🐵', name: 'קופים', tn: 'קוֹפִים', g: 'm' },
    { e: '🐘', name: 'פילים', tn: 'פִּילִים', g: 'm' },
    { e: '🦒', name: "ג'ירפות", tn: "גִ'ירָפוֹת", g: 'f' },
    { e: '🐧', name: 'פינגווינים', tn: 'פִּינְגְּוִינִים', g: 'm' },
    { e: '🦓', name: 'זברות', tn: 'זֶבְּרוֹת', g: 'f' },
  ],
  farm: [
    { e: '🐮', name: 'פרות', tn: 'פָּרוֹת', g: 'f' },
    { e: '🐷', name: 'חזירים', tn: 'חֲזִירִים', g: 'm' },
    { e: '🐔', name: 'תרנגולות', tn: 'תַּרְנְגוֹלוֹת', g: 'f' },
    { e: '🐑', name: 'כבשים', tn: 'כְּבָשִׂים', g: 'f' },
    { e: '🦆', name: 'ברווזים', tn: 'בַּרְוָזִים', g: 'm' },
    { e: '🐰', name: 'ארנבים', tn: 'אַרְנָבִים', g: 'm' },
  ],
  garden: [
    { e: '🌷', name: 'פרחים', tn: 'פְּרָחִים', g: 'm' },
    { e: '🍓', name: 'תותים', tn: 'תּוּתִים', g: 'm' },
    { e: '🦋', name: 'פרפרים', tn: 'פַּרְפָּרִים', g: 'm' },
    { e: '🍎', name: 'תפוחים', tn: 'תַּפּוּחִים', g: 'm' },
    { e: '🐞', name: 'חיפושיות', tn: 'חִפּוּשִׁיּוֹת', g: 'f' },
    { e: '🍪', name: 'עוגיות', tn: 'עוּגִיּוֹת', g: 'f' },
  ],
};

const Q = 8;

export const levels = [
  // ===== עולם 1: גן החיות — ספירה =====
  { id: 'a01', world: 1, title: 'ספירה עד 3', type: 'count', pool: 'zoo',
    range: { min: 1, max: 3 }, layout: 'row', cardMax: 5, questions: Q },
  { id: 'a02', world: 1, title: 'ספירה עד 5', type: 'count', pool: 'zoo',
    range: { min: 2, max: 5 }, layout: 'row', cardMax: 6, questions: Q },
  { id: 'a03', world: 1, title: 'ספירה מפוזרת', type: 'count', pool: 'zoo',
    range: { min: 2, max: 6 }, layout: 'scatter', cardMax: 7, questions: Q },
  { id: 'a04', world: 1, title: 'ספירה עד 10', type: 'count', pool: 'zoo',
    range: { min: 4, max: 10 }, layout: 'rows5', cardMax: 10, questions: Q },
  { id: 'a05', world: 1, title: 'געי בדיוק!', type: 'tapN', pool: 'zoo',
    range: { min: 2, max: 5 }, extra: { min: 1, max: 3 }, questions: Q },
  { id: 'a06', world: 1, title: 'שלב הבוס! 👑', types: ['count', 'tapN'], pool: 'zoo',
    range: { min: 2, max: 8 }, extra: { min: 1, max: 3 }, layout: 'rows5', cardMax: 9, questions: Q },

  // ===== עולם 2: החווה — השוואה והתאמה =====
  { id: 'a07', world: 2, title: 'איפה יש יותר?', type: 'compareMore', pool: 'farm',
    range: { min: 2, max: 7 }, gap: { min: 3, max: 4 }, questions: Q },
  { id: 'a08', world: 2, title: 'יותר — קרוב קרוב', type: 'compareMore', pool: 'farm',
    range: { min: 3, max: 8 }, gap: { min: 1, max: 2 }, questions: Q },
  { id: 'a09', world: 2, title: 'איפה יש פחות?', type: 'compareLess', pool: 'farm',
    range: { min: 2, max: 8 }, gap: { min: 1, max: 3 }, questions: Q },
  { id: 'a10', world: 2, title: 'אותו מספר', type: 'matchSame', pool: 'farm',
    range: { min: 2, max: 6 }, questions: Q },
  { id: 'a11', world: 2, title: 'כן או לא?', type: 'sameOrNot', pool: 'farm',
    range: { min: 2, max: 6 }, questions: Q },
  { id: 'a12', world: 2, title: 'שלב הבוס! 👑', types: ['compareMore', 'compareLess', 'matchSame'], pool: 'farm',
    range: { min: 2, max: 8 }, gap: { min: 1, max: 3 }, questions: Q },

  // ===== עולם 3: הגינה הקסומה — חשבון חזותי =====
  { id: 'a13', world: 3, title: 'ביחד עד 3', type: 'visualAdd', pool: 'garden',
    total: { max: 3 }, questions: Q },
  { id: 'a14', world: 3, title: 'ביחד עד 5', type: 'visualAdd', pool: 'garden',
    total: { max: 5 }, questions: Q },
  { id: 'a15', world: 3, title: 'כמה נשארו?', type: 'visualSub', pool: 'garden',
    start: { min: 2, max: 5 }, remove: { min: 1, max: 2 }, questions: Q },
  { id: 'a16', world: 3, title: 'עוד אחד!', type: 'oneMore', pool: 'garden',
    range: { min: 1, max: 5 }, questions: Q },
  { id: 'a17', world: 3, title: 'מספרים בלי עזרה', type: 'visualAdd', pool: 'garden',
    total: { max: 5 }, digitsOnly: true, questions: Q },
  { id: 'a18', world: 3, title: 'שלב הבוס! 👑', types: ['visualAdd', 'visualSub', 'oneMore'], pool: 'garden',
    total: { max: 5 }, start: { min: 2, max: 5 }, remove: { min: 1, max: 2 }, range: { min: 1, max: 5 },
    digitsOnly: true, questions: Q },

  // ===== עולם 4: עולם הרצפים — "מה בא אחר כך?" =====
  { id: 'a19', world: 4, title: 'רצף פשוט', type: 'pattern', patterns: ['AB'], questions: Q },
  { id: 'a20', world: 4, title: 'רצף שלישייה', type: 'pattern', patterns: ['ABC'], questions: Q },
  { id: 'a21', world: 4, title: 'רצף כפול', type: 'pattern', patterns: ['AAB', 'ABB'], questions: Q },
  { id: 'a22', world: 4, title: 'רצף ארוך', type: 'pattern', patterns: ['AABB'], questions: Q },
  { id: 'a23', world: 4, title: 'רצפים מעורבים', type: 'pattern', patterns: ['AB', 'ABC'], questions: Q },
  { id: 'a24', world: 4, title: 'שלב הבוס! 👑', type: 'pattern', patterns: ['AB', 'ABC', 'AAB', 'ABB', 'AABB'], questions: Q },

  // ===== עולם 5: ארץ הצורות =====
  { id: 'a25', world: 5, title: 'מצאי את הצורה', type: 'shapeFind', shapeCount: 3, questions: Q },
  { id: 'a26', world: 5, title: 'הרבה צורות', type: 'shapeFind', shapeCount: 4, questions: Q },
  { id: 'a27', world: 5, title: 'אותה צורה', type: 'shapeMatch', questions: Q },
  { id: 'a28', world: 5, title: 'מה לא שייך?', type: 'oddOneOut', useShapes: true, questions: Q },
  { id: 'a29', world: 5, title: 'מי שונה?', type: 'oddOneOut', pool: 'zoo', questions: Q },
  { id: 'a30', world: 5, title: 'שלב הבוס! 👑', types: ['shapeFind', 'shapeMatch', 'oddOneOut'], shapeCount: 3, pool: 'farm', questions: Q },

  // ===== עולם 6: עיר המספרים — גשר לזיהוי ספרות =====
  { id: 'a31', world: 6, title: 'איזה מספר?', type: 'digitFind', range: { min: 1, max: 3 }, cardMax: 5, questions: Q },
  { id: 'a32', world: 6, title: 'מספרים עד 5', type: 'digitFind', range: { min: 2, max: 5 }, cardMax: 6, questions: Q },
  { id: 'a33', world: 6, title: 'מספרים עד 9', type: 'digitFind', range: { min: 3, max: 9 }, cardMax: 10, questions: Q },
  { id: 'a34', world: 6, title: 'כמה זה? בחרי מספר', type: 'count', pool: 'garden', range: { min: 2, max: 5 }, layout: 'row', cardMax: 6, digitsOnly: true, questions: Q },
  { id: 'a35', world: 6, title: 'מצאי כמה שצריך', type: 'digitToQty', pool: 'farm', range: { min: 2, max: 5 }, questions: Q },
  { id: 'a36', world: 6, title: 'שלב הבוס! 👑', types: ['digitFind', 'digitToQty', 'count'], pool: 'zoo', range: { min: 2, max: 5 }, cardMax: 6, layout: 'row', digitsOnly: true, questions: Q },
];
