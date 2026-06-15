// קוריקולום זיכרון לאלין (4) — גרידים קטנים, סלחני
export const meta = { id: 'memAlin', lenient: true };

const POOLS = {
  animals: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵'],
  fruits: ['🍎', '🍌', '🍓', '🍇', '🍊', '🍉', '🍑', '🍒', '🥝', '🍍', '🥥', '🍐'],
  fun: ['😀', '😎', '🥳', '🤩', '🌟', '🌈', '🎈', '🎁', '🚗', '⚽', '🌸', '🦋'],
};

export const worlds = [
  { n: 1, name: 'זוגות חיות', icon: '🐾', theme: 'zoo', pool: 'animals' },
  { n: 2, name: 'זוגות פירות', icon: '🍓', theme: 'garden', pool: 'fruits' },
  { n: 3, name: 'זוגות כיף', icon: '🎈', theme: 'rainbow', pool: 'fun' },
];

// [זוגות, עמודות] לכל שלב
const DEFS = {
  1: [[2, 2], [2, 2], [3, 3], [3, 3], [4, 4], [4, 4]],
  2: [[3, 3], [3, 3], [4, 4], [4, 4], [5, 5], [5, 5]],
  3: [[4, 4], [4, 4], [5, 5], [6, 4], [6, 4], [6, 4]],
};

export const levels = [];
for (const w of worlds) {
  DEFS[w.n].forEach(([pairs, cols], i) => {
    levels.push({
      id: `ma${w.n}${i + 1}`, world: w.n, title: `${pairs} זוגות`,
      pairs, cols, pool: POOLS[w.pool],
    });
  });
}
