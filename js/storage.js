// אחסון התקדמות — blob יחיד ב-localStorage, כתיבה מיידית בכל שינוי
// נשמר: כוכבים לשלב, ציוני מבחנים, ומעקב מיומנויות (כל תשובה נרשמת) לדוח החוזקות והחולשות
const KEY = 'mathAdventure.v1';

function defaults() {
  return {
    version: 1,
    profiles: {
      noya: emptyProfile('נויה', 'נוֹיָה', 'noya'),
      alin: emptyProfile('אלין', 'אַלִין', 'alin'),
    },
    settings: { sound: true, tts: true },
  };
}

function emptyProfile(name, ttsName, curriculum) {
  return {
    name,
    ttsName, // השם מנוקד — להקראה נכונה
    curriculum,
    levels: {},   // levelId -> { stars, attempts }
    exams: {},    // examId -> { best, last, attempts, history: [{ score, correct, total, ms, date }] }
    // levelId -> { asked, right, wrong, ms, examAsked, examRight, examMs, last }
    // asked/right = שאלות תרגול (נכון בניסיון ראשון), exam* = שאלות במבחנים. ms = זמן מצטבר עד התשובה הראשונה
    skills: {},
    rounds: [],   // סבבים אחרונים: { levelId, stars, missed, total, ms, date } (עד 300)
    totals: { stars: 0, correct: 0, bestStreak: 0, questions: 0, ms: 0 },
    lastPlayed: 0,
  };
}

const EMPTY_TOTALS = { stars: 0, correct: 0, bestStreak: 0, questions: 0, ms: 0 };
// שדות מגרסאות קודמות (חנות, דמות, מדבקות) — מנוקים בטעינה
const LEGACY_FIELDS = ['character', 'stickers', 'coins', 'owned', 'equipped', 'room', 'care', 'lastGift', 'lastCareBonus'];

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    // מיזוג עם ברירות מחדל — שדות חדשים לא ישברו שמירות ישנות
    const base = defaults();
    for (const id of Object.keys(base.profiles)) {
      const p = { ...base.profiles[id], ...(parsed.profiles?.[id] || {}) };
      p.totals = { ...EMPTY_TOTALS, ...(parsed.profiles?.[id]?.totals || {}) };
      p.ttsName = p.ttsName || p.name;
      for (const k of ['levels', 'exams', 'skills']) if (typeof p[k] !== 'object' || !p[k]) p[k] = {};
      if (!Array.isArray(p.rounds)) p.rounds = [];
      for (const k of LEGACY_FIELDS) delete p[k];
      base.profiles[id] = p;
    }
    base.settings = { ...base.settings, ...(parsed.settings || {}) };
    return base;
  } catch {
    return defaults();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* אחסון מלא/חסום — המשחק ממשיך בזיכרון */ }
}

export function getSettings() {
  return data.settings;
}

export function getProfile(id) {
  return data.profiles[id];
}

export function profileIds() {
  return Object.keys(data.profiles);
}

// רישום תשובה יחידה (הניסיון הראשון בשאלה) — הבסיס לדוח החוזקות והחולשות
export function recordAnswer(profileId, levelId, { correct, ms, exam = false }) {
  const p = data.profiles[profileId];
  const s = p.skills[levelId] || { asked: 0, right: 0, wrong: 0, ms: 0, examAsked: 0, examRight: 0, examMs: 0, last: 0 };
  const t = Math.max(0, Math.min(ms || 0, 120000)); // חסימת זמנים חריגים (הטאבלט נשאר פתוח)
  if (exam) {
    s.examAsked += 1;
    if (correct) s.examRight += 1;
    s.examMs += t;
  } else {
    s.asked += 1;
    if (correct) s.right += 1; else s.wrong += 1;
    s.ms += t;
  }
  s.last = Date.now();
  p.skills[levelId] = s;
  p.totals.questions += 1;
  p.totals.ms += t;
  p.lastPlayed = s.last;
  save();
  return s;
}

// רישום סבב תרגול שהושלם; מחזיר את מצב הרמה המעודכן
export function recordRound(profileId, levelId, stars, correctCount, bestStreakInRound, extra = {}) {
  const p = data.profiles[profileId];
  const lvl = p.levels[levelId] || { stars: 0, attempts: 0 };
  lvl.attempts += 1;
  lvl.stars = Math.max(lvl.stars, stars);
  lvl.lastStars = stars;
  p.levels[levelId] = lvl;
  p.totals.correct += correctCount;
  p.totals.bestStreak = Math.max(p.totals.bestStreak, bestStreakInRound);
  p.totals.stars = Object.values(p.levels).reduce((s, l) => s + l.stars, 0);
  p.rounds.push({ levelId, stars, missed: extra.missed ?? 0, total: extra.total ?? 0, ms: extra.ms ?? 0, date: Date.now() });
  if (p.rounds.length > 300) p.rounds.splice(0, p.rounds.length - 300);
  p.lastPlayed = Date.now();
  save();
  return lvl;
}

// רישום מבחן שהושלם; שומר את הציון הטוב ביותר וההיסטוריה האחרונה
export function recordExam(profileId, examId, { score, correct, total, ms }) {
  const p = data.profiles[profileId];
  const rec = p.exams[examId] || { best: 0, attempts: 0, history: [] };
  rec.attempts += 1;
  rec.best = Math.max(rec.best, score);
  rec.last = score;
  rec.history.push({ score, correct, total, ms, date: Date.now() });
  if (rec.history.length > 10) rec.history.shift();
  p.exams[examId] = rec;
  p.lastPlayed = Date.now();
  save();
  return rec;
}

export function exportData() {
  return JSON.stringify(data);
}

export function importData(json) {
  const parsed = JSON.parse(json); // נכשל = זורק, המתקשר מטפל
  if (!parsed || parsed.version !== 1 || !parsed.profiles) throw new Error('פורמט לא מוכר');
  data = parsed;
  save();
  data = load(); // נרמול דרך מיזוג ברירות המחדל
}
