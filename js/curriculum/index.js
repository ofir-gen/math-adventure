import * as noya from './noya.js';
import * as alin from './alin.js';
import * as memNoya from './memNoya.js';
import * as memAlin from './memAlin.js';
import * as hebNoya from './hebNoya.js';
import * as hebAlin from './hebAlin.js';

export const curricula = { noya, alin, memNoya, memAlin, hebNoya, hebAlin };

export function getCurriculum(id) {
  return curricula[id];
}

export function levelById(curriculumId, levelId) {
  return curricula[curriculumId].levels.find(l => l.id === levelId);
}

// ===== נושאי לימוד (מסך הבחירה אחרי הפרופיל) =====
export const SUBJECTS = [
  { id: 'math', name: 'חשבון', tn: 'חֶשְׁבּוֹן', icon: '🔢' },
  { id: 'memory', name: 'זיכרון', tn: 'זִכָּרוֹן', icon: '🧠' },
  { id: 'hebrew', name: 'עברית', tn: 'עִבְרִית', icon: '📖' },
];

// מיפוי (פרופיל × נושא) → קוריקולום. נושא ללא ערך = "בקרוב".
const CUR_MAP = {
  math: { noya: 'noya', alin: 'alin' },
  memory: { noya: 'memNoya', alin: 'memAlin' },
  hebrew: { noya: 'hebNoya', alin: 'hebAlin' },
};

export function curriculumFor(profileId, subjectId) {
  return CUR_MAP[subjectId]?.[profileId] || null;
}

export function subjectAvailable(profileId, subjectId) {
  return !!curriculumFor(profileId, subjectId);
}

// סך כוכבים שנצברו בנושא מסוים (לתצוגה בכרטיס הנושא)
export function subjectStars(profile, curriculumId) {
  if (!curriculumId || !curricula[curriculumId]) return 0;
  return curricula[curriculumId].levels.reduce((s, l) => s + (profile.levels[l.id]?.stars || 0), 0);
}
