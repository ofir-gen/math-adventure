// קוריקולום עברית לנויה (7, כיתה ב') — קריאת מילים + אות פותחת/סוגרת
export const meta = { id: 'hebNoya' };

export const worlds = [
  { n: 1, name: 'קריאת מילים', icon: '📖', theme: 'beach' },
  { n: 2, name: 'אותיות במילה', icon: '🔡', theme: 'mountain' },
];

const Q = 10;

export const levels = [
  // עולם 1: קריאת מילים — מילה→תמונה ותמונה→מילה
  { id: 'hn11', world: 1, title: 'קראי ובחרי תמונה', type: 'wordToPic', questions: Q },
  { id: 'hn12', world: 1, title: 'עוד קריאה', type: 'wordToPic', questions: Q },
  { id: 'hn13', world: 1, title: 'איזו מילה?', type: 'picToWord', questions: Q },
  { id: 'hn14', world: 1, title: 'עוד מילים', type: 'picToWord', questions: Q },
  { id: 'hn15', world: 1, title: 'קריאה מעורבת', types: ['wordToPic', 'picToWord'], questions: Q },
  { id: 'hn16', world: 1, title: 'שלב הבוס! 👑', types: ['wordToPic', 'picToWord'], questions: Q },

  // עולם 2: אות פותחת/סוגרת
  { id: 'hn21', world: 2, title: 'אות פותחת', type: 'firstLetter', questions: Q },
  { id: 'hn22', world: 2, title: 'עוד אות פותחת', type: 'firstLetter', questions: Q },
  { id: 'hn23', world: 2, title: 'אות סוגרת', type: 'lastLetter', questions: Q },
  { id: 'hn24', world: 2, title: 'עוד אות סוגרת', type: 'lastLetter', questions: Q },
  { id: 'hn25', world: 2, title: 'פותחת וסוגרת', types: ['firstLetter', 'lastLetter'], questions: Q },
  { id: 'hn26', world: 2, title: 'שלב הבוס! 👑', types: ['firstLetter', 'lastLetter'], questions: Q },
];
