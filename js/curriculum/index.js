// אינדקס הקוריקולומים — חשבון בלבד: נויה (כיתה ג') ואלין (גיל הגן)
import * as noya from './noya.js';
import * as alin from './alin.js';

export const curricula = { noya, alin };

export function getCurriculum(id) {
  return curricula[id];
}

export function levelById(curriculumId, levelId) {
  return curricula[curriculumId].levels.find(l => l.id === levelId);
}

export function worldLevels(curriculumId, worldN) {
  return curricula[curriculumId].levels.filter(l => l.world === worldN);
}
