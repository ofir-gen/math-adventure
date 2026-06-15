// קוריקולום עברית לנויה (סוף כיתה ב' / לקראת ג') — משפטים, הבנת הנקרא ושפה
export const meta = { id: 'hebNoya' };

export const worlds = [
  { n: 1, name: 'הבנת הנקרא', icon: '📖', theme: 'beach' },
  { n: 2, name: 'מילים ומשפטים', icon: '✍️', theme: 'mountain' },
  { n: 3, name: 'חשיבה ושפה', icon: '🧠', theme: 'space' },
];

const Q = 8;

export const levels = [
  // עולם 1: הבנת הנקרא — קריאת משפט ומענה על שאלה
  { id: 'hb11', world: 1, title: 'קוראים ועונים', type: 'comprehension', questions: Q },
  { id: 'hb12', world: 1, title: 'מה קרה בסיפור?', type: 'comprehension', questions: Q },
  { id: 'hb13', world: 1, title: 'קריאה והבנה', type: 'comprehension', questions: Q },
  { id: 'hb14', world: 1, title: 'עונים נכון', type: 'comprehension', questions: Q },
  { id: 'hb15', world: 1, title: 'קוראים טוב', type: 'comprehension', questions: Q },
  { id: 'hb16', world: 1, title: 'שלב הבוס! 👑', type: 'comprehension', questions: Q },

  // עולם 2: השלמת משפטים והפכים
  { id: 'hb21', world: 2, title: 'משלימים משפט', type: 'completion', questions: Q },
  { id: 'hb22', world: 2, title: 'איזו מילה חסרה?', type: 'completion', questions: Q },
  { id: 'hb23', world: 2, title: 'הפכים', type: 'opposite', questions: Q },
  { id: 'hb24', world: 2, title: 'מה ההפך?', type: 'opposite', questions: Q },
  { id: 'hb25', world: 2, title: 'משפטים והפכים', types: ['completion', 'opposite'], questions: Q },
  { id: 'hb26', world: 2, title: 'שלב הבוס! 👑', types: ['completion', 'opposite'], questions: Q },

  // עולם 3: חשיבה ושפה — יוצא דופן + הבנה מעורבת
  { id: 'hb31', world: 3, title: 'מי לא שייך?', type: 'oddWord', questions: Q },
  { id: 'hb32', world: 3, title: 'מילה יוצאת דופן', type: 'oddWord', questions: Q },
  { id: 'hb33', world: 3, title: 'קריאה וחשיבה', types: ['comprehension', 'oddWord'], questions: Q },
  { id: 'hb34', world: 3, title: 'הכל ביחד', types: ['comprehension', 'completion', 'opposite'], questions: Q },
  { id: 'hb35', world: 3, title: 'אלופת העברית', types: ['comprehension', 'completion', 'opposite', 'oddWord'], questions: Q },
  { id: 'hb36', world: 3, title: 'שלב הבוס! 👑', types: ['comprehension', 'completion', 'opposite', 'oddWord'], questions: Q },
];
