// כוכבים, פתיחת שלבים, מדבקות ושלבי גדילה של הדמות
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';

// ===== כוכבים =====
// נספרות טעויות בניסיון ראשון בלבד; בלי טיימר.
export function calcStars(firstTryMistakes, curriculumId) {
  if (curriculumId === 'alin') {
    // אלין אף פעם לא "נכשלת"
    if (firstTryMistakes <= 1) return 3;
    if (firstTryMistakes <= 3) return 2;
    return 1;
  }
  if (firstTryMistakes === 0) return 3;
  if (firstTryMistakes <= 2) return 2;
  if (firstTryMistakes <= 4) return 1;
  return 0; // "כמעט!" — אפשר מיד לנסות שוב
}

// ===== פתיחת שלבים =====
export function isLevelUnlocked(profile, level) {
  const levels = getCurriculum(profile.curriculum).levels;
  const idx = levels.findIndex(l => l.id === level.id);
  if (idx === 0) return true;
  const prev = levels[idx - 1];
  return (profile.levels[prev.id]?.stars || 0) > 0;
}

export function isWorldUnlocked(profile, worldN) {
  if (worldN === 1) return true;
  const levels = getCurriculum(profile.curriculum).levels.filter(l => l.world === worldN - 1);
  return levels.every(l => (profile.levels[l.id]?.stars || 0) > 0);
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
  const list = [
    { id: 'first_level', emoji: '🌟', name: 'הצעד הראשון',
      test: p => Object.values(p.levels).some(l => l.stars > 0) },
    { id: 'first_perfect', emoji: '💎', name: 'שלושה כוכבים!',
      test: p => Object.values(p.levels).some(l => l.stars === 3) },
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
      id: `world_done_${w.n}`, emoji: w.icon, name: `סיימתי את ${w.name}`,
      test: p => wl.every(l => (p.levels[l.id]?.stars || 0) > 0),
    });
    list.push({
      id: `world_perfect_${w.n}`, emoji: '🏅', name: `${w.name} מושלם!`,
      test: p => wl.every(l => (p.levels[l.id]?.stars || 0) === 3),
    });
  }

  const milestones = curriculumId === 'noya'
    ? [5, 10, 20, 30, 45, 60, 90, 120, 150, 180]
    : [5, 10, 20, 30, 45];
  const mEmoji = ['⭐', '✨', '💫', '🌠', '🎇', '👑', '🌈', '🔮', '🏆', '💎'];
  milestones.forEach((m, i) => {
    list.push({
      id: `stars_${m}`, emoji: mEmoji[i], name: `${m} כוכבים`,
      test: p => p.totals.stars >= m,
    });
  });

  return list;
}

// ===== החלת תוצאות סבב: עדכון אחסון + איסוף תגמולים חדשים =====
export function applyRound(profileId, levelId, stars, correctCount, bestStreakInRound) {
  const before = storage.getProfile(profileId);
  const stageBefore = characterStage(before.totals.stars);

  storage.recordRound(profileId, levelId, stars, correctCount, bestStreakInRound);

  // מטבעות לחנות: מטבע לכל תשובה נכונה + 5 לכל כוכב
  const coinsEarned = correctCount + stars * 5;
  storage.addCoins(profileId, coinsEarned);

  const after = storage.getProfile(profileId);
  const stageAfter = characterStage(after.totals.stars);

  const catalog = stickerCatalog(after.curriculum);
  const newStickers = catalog.filter(s => !after.stickers.includes(s.id) && s.test(after));
  if (newStickers.length) storage.addStickers(profileId, newStickers.map(s => s.id));

  return {
    newStickers,
    stageUp: stageAfter > stageBefore ? stageAfter : null,
    totalStars: after.totals.stars,
    coinsEarned,
  };
}
