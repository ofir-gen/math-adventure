// כוכבים, פתיחת שלבים ועולמות, מבחנים, מדבקות ושלבי גדילה של הדמות
import { getCurriculum, curricula, worldLevels } from '../curriculum/index.js';
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

// ===== דמות מלווה =====
// g = מין דקדוקי של הדמות, לטקסטים נכונים (פנדה גדלה, חד-קרן גדל)
export const CHARACTERS = [
  { type: 'bunny', name: 'ארנבון', tn: 'אַרְנָבוֹן', g: 'm', starter: true },
  { type: 'cat', name: 'חתלתול', tn: 'חֲתַלְתּוּל', g: 'm', starter: true },
  { type: 'dragon', name: 'דרקונצ\'יק', tn: 'דְּרָקוֹנְצִ\'יק', g: 'm', starter: true },
  // דמויות פרימיום — נקנות בחנות בלבד
  { type: 'unicorn', name: 'חד-קרן', tn: 'חַד-קֶרֶן', g: 'm' },
  { type: 'panda', name: 'פנדה', tn: 'פַּנְדָּה', g: 'f' },
  { type: 'puppy', name: 'כלבלב', tn: 'כְּלַבְלַב', g: 'm' },
  { type: 'ladybug', name: 'חיפושית', tn: 'חִפּוּשִׁית', g: 'f' },
];

export const charByType = type => CHARACTERS.find(c => c.type === type);

export const STAGE_THRESHOLDS = [0, 8, 18, 32, 48];
export const STAGE_NAMES = ['תינוק', 'קטנטן', 'ילד', 'גדול', 'מלך!'];
export const STAGE_NAMES_F = ['תינוקת', 'קטנטנה', 'ילדה', 'גדולה', 'מלכה!'];

export function stageName(stage, g) {
  return (g === 'f' ? STAGE_NAMES_F : STAGE_NAMES)[stage - 1];
}

export function characterStage(totalStars) {
  let stage = 1;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (totalStars >= STAGE_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}

export function nextStageInfo(totalStars) {
  const stage = characterStage(totalStars);
  if (stage >= 5) return null;
  const prev = STAGE_THRESHOLDS[stage - 1];
  const next = STAGE_THRESHOLDS[stage];
  return { stage, next, progress: (totalStars - prev) / (next - prev) };
}

// ===== קטלוג מדבקות =====
export function stickerCatalog(curriculumId) {
  const cur = getCurriculum(curriculumId);
  const allLevels = cur.levels;
  // מדבקות ספציפיות-לקוריקולום — מזהה מתוייג (עם meta.tag כשהתוכן הוחלף, כדי לא לרשת הישגים ישנים)
  const px = id => `${curriculumId}:${cur.meta?.tag ? cur.meta.tag + ':' : ''}${id}`;
  const ids = allLevels.map(l => l.id);
  const list = [
    { id: px('first_level'), emoji: '🌟', name: 'הצעד הראשון',
      test: p => ids.some(id => (p.levels[id]?.stars || 0) > 0) },
    { id: px('first_perfect'), emoji: '💎', name: 'שלושה כוכבים!',
      test: p => ids.some(id => (p.levels[id]?.stars || 0) === 3) },
    // מדבקות גלובליות (לפי הסכומים הכלליים)
    { id: 'streak_10', emoji: '🔥', name: '10 ברצף!',
      test: p => p.totals.bestStreak >= 10 },
    { id: 'correct_100', emoji: '💯', name: '100 תשובות',
      test: p => p.totals.correct >= 100 },
    { id: 'correct_500', emoji: '🏆', name: '500 תשובות',
      test: p => p.totals.correct >= 500 },
  ];

  for (const w of cur.worlds) {
    const wl = allLevels.filter(l => l.world === w.n);
    list.push({
      id: px(`world_done_${w.n}`), emoji: w.icon, name: `סיימתי את ${w.name}`,
      test: p => wl.every(l => (p.levels[l.id]?.stars || 0) > 0),
    });
    list.push({
      id: px(`world_perfect_${w.n}`), emoji: '🏅', name: `${w.name} מושלם!`,
      test: p => wl.every(l => (p.levels[l.id]?.stars || 0) === 3),
    });
  }

  // מדבקות מבחנים
  const exam = cur.meta?.exam;
  if (exam) {
    const passedCount = p => cur.worlds.filter(w => (examRecord(p, examId(w.n))?.best || 0) >= exam.pass).length;
    list.push(
      { id: px('exam_first'), emoji: '📝', name: 'המבחן הראשון שלי',
        test: p => Object.keys(p.exams || {}).length > 0 },
      { id: px('exam_pass'), emoji: '🎓', name: 'עברתי מבחן!',
        test: p => passedCount(p) >= 1 },
      { id: px('exam_perfect'), emoji: '💯', name: '100 במבחן!',
        test: p => Object.values(p.exams || {}).some(r => r.best >= 100) },
      { id: px('exam_half'), emoji: '📚', name: 'חצי מהמבחנים',
        test: p => passedCount(p) >= Math.ceil(cur.worlds.length / 2) },
      { id: px('exam_all'), emoji: '👩‍🎓', name: 'עברתי את כל המבחנים!',
        test: p => passedCount(p) >= cur.worlds.length },
      { id: px('exam_final'), emoji: '🏆', name: 'המבחן הגדול!',
        test: p => (examRecord(p, FINAL_EXAM)?.best || 0) >= exam.pass },
    );
  }

  const maxStars = allLevels.length * 3;
  const milestones = cur.meta?.lenient
    ? [5, 10, 20, 30, 45]
    : [5, 10, 20, 30, 45, 60, 90, 120, 150, 180].filter(m => m <= maxStars);
  const mEmoji = ['⭐', '✨', '💫', '🌠', '🎇', '👑', '🌈', '🔮', '🏆', '💎', '🐞'];
  milestones.forEach((m, i) => {
    list.push({
      id: `stars_${m}`, emoji: mEmoji[i], name: `${m} כוכבים`,
      test: p => p.totals.stars >= m,
    });
  });

  return list;
}

// אימוג'י של כל המדבקות שהושגו — למדף הגביעים בחדר
export function earnedTrophyEmojis(profile) {
  const map = {};
  for (const curId of Object.keys(curricula)) {
    for (const s of stickerCatalog(curId)) map[s.id] = s.emoji;
  }
  return profile.stickers.map(id => map[id]).filter(Boolean);
}

function grantNewStickers(profileId, curriculumId) {
  const after = storage.getProfile(profileId);
  const catalog = stickerCatalog(curriculumId || after.curriculum);
  const newStickers = catalog.filter(s => !after.stickers.includes(s.id) && s.test(after));
  if (newStickers.length) storage.addStickers(profileId, newStickers.map(s => s.id));
  return newStickers;
}

// ===== החלת תוצאות סבב: עדכון אחסון + איסוף תגמולים חדשים =====
export function applyRound(profileId, levelId, stars, correctCount, bestStreakInRound, curriculumId) {
  const before = storage.getProfile(profileId);
  const stageBefore = characterStage(before.totals.stars);

  storage.recordRound(profileId, levelId, stars, correctCount, bestStreakInRound);

  // מטבעות לחנות: מטבע לכל תשובה נכונה + 5 לכל כוכב
  const coinsEarned = correctCount + stars * 5;
  storage.addCoins(profileId, coinsEarned);

  const after = storage.getProfile(profileId);
  const stageAfter = characterStage(after.totals.stars);
  const newStickers = grantNewStickers(profileId, curriculumId);

  return {
    newStickers,
    stageUp: stageAfter > stageBefore ? stageAfter : null,
    totalStars: after.totals.stars,
    coinsEarned,
  };
}

// ===== החלת תוצאות מבחן =====
// מטבעות: מטבע לכל תשובה נכונה, +15 על מעבר, +15 נוספים על 100
export function applyExam(profileId, id, { correct, total, ms }, curriculumId) {
  const cfg = examConfig(curriculumId);
  const score = Math.round((correct / total) * 100);
  const passed = score >= cfg.pass;
  const rec = storage.recordExam(profileId, id, { score, correct, total, ms });
  const coinsEarned = correct + (passed ? 15 : 0) + (score === 100 ? 15 : 0);
  storage.addCoins(profileId, coinsEarned);
  const newStickers = grantNewStickers(profileId, curriculumId);
  return { score, passed, coinsEarned, newStickers, best: rec.best, attempts: rec.attempts, isBest: score >= rec.best };
}
