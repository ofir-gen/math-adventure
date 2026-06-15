// קוריקולום זיכרון לנויה (7) — גרידים גדולים יותר
export const meta = { id: 'memNoya' };

const POOLS = {
  animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵'],
  food: ['🍎', '🍌', '🍓', '🍇', '🍊', '🍉', '🍕', '🍔', '🍩', '🍪', '🧁', '🍦'],
  things: ['⚽', '🚗', '🚀', '🎸', '🎈', '🎁', '⭐', '🌈', '🌸', '🦋', '👑', '💎'],
};

export const worlds = [
  { n: 1, name: 'זוגות חיות', icon: '🐾', theme: 'mountain', pool: 'animals' },
  { n: 2, name: 'זוגות טעימים', icon: '🍕', theme: 'beach', pool: 'food' },
  { n: 3, name: 'אתגר הזיכרון', icon: '👑', theme: 'space', pool: 'things' },
];

// [זוגות, עמודות] לכל שלב — קושי עולה
const DEFS = {
  1: [[3, 3], [4, 4], [4, 4], [5, 5], [6, 4], [6, 4]],
  2: [[5, 5], [6, 4], [6, 4], [8, 4], [8, 4], [8, 4]],
  3: [[6, 4], [8, 4], [8, 4], [10, 5], [10, 5], [10, 5]],
};

export const levels = [];
for (const w of worlds) {
  DEFS[w.n].forEach(([pairs, cols], i) => {
    levels.push({
      id: `mn${w.n}${i + 1}`, world: w.n, title: `${pairs} זוגות`,
      pairs, cols, pool: POOLS[w.pool],
    });
  });
}
