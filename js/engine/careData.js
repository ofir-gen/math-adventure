// נתוני מערכת הטיפול בדמות: מדים, מאכלים, ומצב-רוח.
// ירידה איטית ועדינה (יום-יומיים), בלי "חולה/נעלם" — מתאים לגיל.

export const CARE_KEYS = [
  { key: 'fed', label: 'שובע', icon: '🍎' },
  { key: 'clean', label: 'ניקיון', icon: '🛁' },
  { key: 'energy', label: 'אנרגיה', icon: '⚡' },
  { key: 'happy', label: 'שמחה', icon: '😊' },
];

// ירידה לשעה (מתון: שובע ~יום, השאר ~יומיים)
export const DECAY_PER_HOUR = { fed: 4, clean: 2, energy: 2.5, happy: 2.5 };

// מאכלים חינמיים להאכלה
export const FOODS = [
  { e: '🍎', tn: 'תַּפּוּחַ' }, { e: '🥕', tn: 'גֶּזֶר' }, { e: '🍓', tn: 'תּוּת' },
  { e: '🍪', tn: 'עוּגִיָּה' }, { e: '🧀', tn: 'גְּבִינָה' }, { e: '🍌', tn: 'בָּנָנָה' },
];

export const CARE_BONUS_COINS = 10; // בונוס יומי כשמטפלים בהכול

// מצב הרוח של הדמות לפי המדים
export function careMood(care) {
  const avg = (care.fed + care.clean + care.energy + care.happy) / 4;
  if (avg >= 70) return { face: '😊', bubble: null };
  const low = CARE_KEYS.reduce((a, b) => (care[b.key] < care[a.key] ? b : a));
  const bubbleByKey = { fed: '🍎', clean: '🧼', energy: '💤', happy: '🎾' };
  return { face: avg >= 40 ? '🙂' : '🥺', bubble: bubbleByKey[low.key] };
}

export const allCaredFor = care =>
  care.fed >= 80 && care.clean >= 80 && care.energy >= 80 && care.happy >= 80;
