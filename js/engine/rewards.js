// כוכבים, פתיחת שלבים ועולמות, מבחנים, ומדדי שליטה (חוזקות/חולשות + תרגול מומלץ)
import { getCurriculum, worldLevels } from '../curriculum/index.js';
import * as storage from '../storage.js';

// ===== כוכבים =====
// נספרות טעויות בניסיון ראשון בלבד; בלי טיימר.
// קוריקולומים "סלחניים" (גיל הגן) מסומנים ב-meta.lenient — אי אפשר "להיכשל".
export function calcStars(firstTryMistakes, curriculumId) {
  const lenient = getCurriculum(curriculumId)?.meta?.lenient;
  if (lenient) {
    if (firstTryMistakes <= 1) return 3;
    if (firstTryMistakes <= 3) return 2;
    return 1;
  }
  if (firstTryMistakes === 0) return 3;
  if (firstTryMistakes <= 2) return 2;
  if (firstTryMistakes <= 4) return 1;
  return 0; // "כמעט!" — אפשר מיד לנסות שוב
}

// ===== מבחנים =====
// examId: 'exam:<מספר עולם>' למבחן עולם, 'exam:final' למבחן המסכם
export const examConfig = curriculumId => getCurriculum(curriculumId)?.meta?.exam || null;
export const examId = worldN => `exam:${worldN}`;
export const FINAL_EXAM = 'exam:final';

export function examRecord(profile, id) {
  return profile.exams?.[id] || null;
}

// המבחן נפתח כשכל שלבי העולם הושלמו (כוכב אחד לפחות)
export function examUnlocked(profile, worldN, curriculumId) {
  return worldLevels(curriculumId, worldN).every(l => (profile.levels[l.id]?.stars || 0) > 0);
}

export function examPassed(profile, worldN, curriculumId) {
  const cfg = examConfig(curriculumId);
  if (!cfg) return true;
  return (examRecord(profile, examId(worldN))?.best || 0) >= cfg.pass;
}

// המבחן הגדול נפתח אחרי שעוברים את כל מבחני העולמות
export function finalExamUnlocked(profile, curriculumId) {
  const cur = getCurriculum(curriculumId);
  return !!examConfig(curriculumId) && cur.worlds.every(w => examPassed(profile, w.n, curriculumId));
}

// ציון → תיאור וסמל
export function scoreBand(score) {
  if (score >= 100) return { label: 'מושלם!', emoji: '🏆', cls: 'perfect' };
  if (score >= 90) return { label: 'מעולה!', emoji: '🌟', cls: 'great' };
  if (score >= 80) return { label: 'טוב מאוד!', emoji: '😃', cls: 'good' };
  if (score >= 70) return { label: 'טוב!', emoji: '🙂', cls: 'pass' };
  return { label: 'צריך עוד תרגול', emoji: '💪', cls: 'fail' };
}

// ===== פתיחת שלבים (לפי הקוריקולום של הפרופיל) =====
export function isLevelUnlocked(profile, level, curriculumId) {
  const levels = getCurriculum(curriculumId).levels;
  const idx = levels.findIndex(l => l.id === level.id);
  if (idx === 0) return true;
  const prev = levels[idx - 1];
  if ((profile.levels[prev.id]?.stars || 0) === 0) return false;
  // השלב הראשון בעולם חדש נפתח רק אחרי שעוברים את מבחן העולם הקודם
  if (prev.world !== level.world) return isWorldUnlocked(profile, level.world, curriculumId);
  return true;
}

export function isWorldUnlocked(profile, worldN, curriculumId) {
  if (worldN === 1) return true;
  const prevDone = worldLevels(curriculumId, worldN - 1).every(l => (profile.levels[l.id]?.stars || 0) > 0);
  return prevDone && examPassed(profile, worldN - 1, curriculumId);
}

// ===== מדדי שליטה — הבסיס לדוח ולתרגול המומלץ =====
// מאחד תרגול ומבחנים: asked/right/ms כוללים, ודיוק (acc) 0..1
export function mastery(profile, levelId) {
  const s = profile.skills?.[levelId];
  if (!s) return { asked: 0, right: 0, wrong: 0, acc: null, avgMs: null, last: 0, practice: 0, exam: 0 };
  const asked = s.asked + s.examAsked;
  const right = s.right + s.examRight;
  const ms = s.ms + s.examMs;
  return {
    asked, right, wrong: asked - right,
    acc: asked ? right / asked : null,
    avgMs: asked ? ms / asked : null,
    last: s.last, practice: s.asked, exam: s.examAsked,
  };
}

// סטטוס מיומנות לדוח: new | developing | weak | ok | strong
export const STATUS = {
  new: { key: 'new', label: 'עוד לא נלמד', emoji: '⬜', cls: 'new' },
  developing: { key: 'developing', label: 'בתהליך', emoji: '🌱', cls: 'developing' },
  weak: { key: 'weak', label: 'לתרגול', emoji: '⚠️', cls: 'weak' },
  ok: { key: 'ok', label: 'בסדר', emoji: '👍', cls: 'ok' },
  strong: { key: 'strong', label: 'חוזק', emoji: '💪', cls: 'strong' },
};
export const MIN_ASKED = 6; // מתחת לזה אין מספיק נתונים להכריע

export function skillStatus(m) {
  if (!m.asked) return STATUS.new;
  if (m.asked < MIN_ASKED) return STATUS.developing;
  if (m.acc >= 0.9 && m.asked >= 12) return STATUS.strong;
  if (m.acc >= 0.9) return STATUS.ok;
  if (m.acc >= 0.75) return STATUS.ok;
  return STATUS.weak;
}

// דיוק "מוחלק" — מוריד את משקל דגימות בודדות: (right+2)/(asked+4)
const smoothAcc = m => (m.right + 2) / (m.asked + 4);

// תרגול מומלץ: השלב הפתוח החלש ביותר; אם אין חולשה — השלב הפתוח הבא שעוד לא הושלם ב-3 כוכבים;
// אחרת — השלב שתורגל לפני הזמן הרב ביותר (שימור)
export function recommendLevel(profile, curriculumId) {
  const cur = getCurriculum(curriculumId);
  const open = cur.levels.filter(l => isLevelUnlocked(profile, l, curriculumId));
  if (!open.length) return null;

  const withData = open.map(l => ({ l, m: mastery(profile, l.id) })).filter(x => x.m.asked >= MIN_ASKED);
  const weakest = withData.filter(x => smoothAcc(x.m) < 0.82).sort((a, b) => smoothAcc(a.m) - smoothAcc(b.m))[0];
  if (weakest) {
    return { level: weakest.l, reason: 'weak', text: `דיוק ${Math.round(weakest.m.acc * 100)}% — כאן כדאי להתחזק`, m: weakest.m };
  }

  const unmastered = open.find(l => (profile.levels[l.id]?.stars || 0) < 3);
  if (unmastered) {
    const started = (profile.levels[unmastered.id]?.attempts || 0) > 0;
    return { level: unmastered, reason: 'next', text: started ? 'עוד לא 3 כוכבים — בואי נשלים' : 'השלב הבא בדרך', m: mastery(profile, unmastered.id) };
  }

  const stale = open.map(l => ({ l, m: mastery(profile, l.id) })).sort((a, b) => a.m.last - b.m.last)[0];
  return { level: stale.l, reason: 'review', text: 'חזרה קטנה כדי לא לשכוח', m: stale.m };
}

// ===== סיכומים לדוח =====
export function worldSummary(profile, curriculumId, worldN) {
  const levels = worldLevels(curriculumId, worldN);
  let asked = 0, right = 0, ms = 0, stars = 0;
  for (const l of levels) {
    const m = mastery(profile, l.id);
    asked += m.asked; right += m.right; ms += (m.avgMs || 0) * m.asked;
    stars += profile.levels[l.id]?.stars || 0;
  }
  return { asked, right, acc: asked ? right / asked : null, avgMs: asked ? ms / asked : null, stars, maxStars: levels.length * 3, levels };
}

// חוזקות וחולשות מסודרות: top/bottom לפי דיוק, רק שלבים עם מספיק נתונים
export function strengthsAndWeaknesses(profile, curriculumId, count = 3) {
  const cur = getCurriculum(curriculumId);
  const rated = cur.levels.map(l => ({ level: l, m: mastery(profile, l.id) })).filter(x => x.m.asked >= MIN_ASKED);
  const byAcc = [...rated].sort((a, b) => a.m.acc - b.m.acc || b.m.asked - a.m.asked);
  const weaknesses = byAcc.filter(x => x.m.acc < 0.8).slice(0, count);
  const strengths = [...rated].sort((a, b) => b.m.acc - a.m.acc || b.m.asked - a.m.asked).filter(x => x.m.acc >= 0.85).slice(0, count);
  return { strengths, weaknesses, rated: rated.length };
}

// ===== החלת תוצאות סבב =====
export function applyRound(profileId, levelId, stars, correctCount, bestStreakInRound, extra) {
  const lvl = storage.recordRound(profileId, levelId, stars, correctCount, bestStreakInRound, extra);
  return { stars: lvl.stars, attempts: lvl.attempts, totalStars: storage.getProfile(profileId).totals.stars };
}

// ===== החלת תוצאות מבחן =====
export function applyExam(profileId, id, { correct, total, ms }, curriculumId) {
  const cfg = examConfig(curriculumId);
  const score = Math.round((correct / total) * 100);
  const passed = score >= cfg.pass;
  const rec = storage.recordExam(profileId, id, { score, correct, total, ms });
  return { score, passed, best: rec.best, attempts: rec.attempts, isBest: score >= rec.best };
}
