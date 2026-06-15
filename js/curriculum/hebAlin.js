// קוריקולום עברית לאלין (4) — זיהוי אותיות + סדר הא״ב. ציורי, בהקראה, סלחני.
export const meta = { id: 'hebAlin', lenient: true };

export const worlds = [
  { n: 1, name: 'עולם האותיות', icon: '📛', theme: 'rainbow' },
  { n: 2, name: 'סדר הא״ב', icon: '🔤', theme: 'numbers' },
];

const Q = 8;

export const levels = [
  // עולם 1: זיהוי אותיות — מספר האותיות גדל בהדרגה
  { id: 'hla11', world: 1, title: 'האותיות הראשונות', type: 'letterFind', letterCount: 6, questions: Q },
  { id: 'hla12', world: 1, title: 'עוד אותיות', type: 'letterFind', letterCount: 10, questions: Q },
  { id: 'hla13', world: 1, title: 'ועוד אותיות', type: 'letterFind', letterCount: 14, questions: Q },
  { id: 'hla14', world: 1, title: 'כמעט כולן', type: 'letterFind', letterCount: 18, questions: Q },
  { id: 'hla15', world: 1, title: 'כל האותיות', type: 'letterFind', letterCount: 22, questions: Q },
  { id: 'hla16', world: 1, title: 'שלב הבוס! 👑', type: 'letterFind', letterCount: 22, questions: Q },

  // עולם 2: סדר הא״ב — "מה בא אחר כך?"
  { id: 'hla21', world: 2, title: 'מה בא אחר כך?', type: 'abcNext', questions: Q },
  { id: 'hla22', world: 2, title: 'ממשיכים בסדר', type: 'abcNext', questions: Q },
  { id: 'hla23', world: 2, title: 'יודעים את הא״ב', type: 'abcNext', questions: Q },
  { id: 'hla24', world: 2, title: 'עוד תרגול', type: 'abcNext', questions: Q },
  { id: 'hla25', world: 2, title: 'אלופת האותיות', type: 'abcNext', questions: Q },
  { id: 'hla26', world: 2, title: 'שלב הבוס! 👑', type: 'abcNext', questions: Q },
];
