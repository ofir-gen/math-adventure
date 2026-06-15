// מפת עולם: שביל מתפתל עם שלבים, כוכבים ונעילות
import { el, starsHTML, topbarEl } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { isLevelUnlocked, isWorldUnlocked, characterStage } from '../engine/rewards.js';
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { sfx, speak } from '../audio.js';

// מיקומי 6 התחנות על השביל (אחוזים), מלמטה למעלה
const NODE_POS = [
  { x: 50, y: 88 }, { x: 23, y: 73 }, { x: 65, y: 58 },
  { x: 28, y: 43 }, { x: 70, y: 28 }, { x: 45, y: 11 },
];

export function worldMap(container, ctx, params = {}) {
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = ctx.state.curriculumId || profile.curriculum;
  const cur = getCurriculum(curId);
  const subjectId = ctx.state.subjectId || 'math';

  let worldN = params.world || defaultWorld(profile, cur, curId);
  const world = cur.worlds.find(w => w.n === worldN);
  document.body.dataset.theme = world.theme;

  const screen = el('div', 'screen map-screen');

  // כותרת: הביתה + שם + כוכבים ומטבעות
  const starsBadge = el('button', 'btn round', '');
  starsBadge.style.width = 'auto';
  starsBadge.style.padding = '0 14px';
  starsBadge.style.borderRadius = '26px';
  starsBadge.innerHTML = `⭐ ${profile.totals.stars} &nbsp;🪙 ${profile.coins}`;
  screen.appendChild(topbarEl(profile.name, () => ctx.navigate('subjectSelect'), starsBadge));

  // ניווט בין עולמות
  const nav = el('div', 'world-nav');
  const prevBtn = el('button', 'btn round', '◀');
  const nextBtn = el('button', 'btn round', '▶');
  nav.append(nextBtn, el('div', 'wname', `${world.icon} ${world.name}`), prevBtn);
  const hasPrev = worldN > 1;
  const next = cur.worlds.find(w => w.n === worldN + 1);
  const nextOpen = next && isWorldUnlocked(profile, next.n, curId);
  if (!hasPrev) prevBtn.style.visibility = 'hidden';
  if (!next) nextBtn.style.visibility = 'hidden';
  else if (!nextOpen) { nextBtn.textContent = '🔒'; nextBtn.style.opacity = '0.6'; }
  prevBtn.addEventListener('click', () => ctx.navigate('worldMap', { world: worldN - 1 }));
  nextBtn.addEventListener('click', () => {
    if (nextOpen) ctx.navigate('worldMap', { world: worldN + 1 });
    else { sfx.wrong(); speak(`כדי לפתוח את ${next.name} צריך לסיים את כל השלבים כאן`); }
  });
  screen.appendChild(nav);

  // אזור המפה: שביל + תחנות
  const area = el('div', 'map-area');
  area.appendChild(pathSVG());
  const worldLevels = cur.levels.filter(l => l.world === worldN);
  worldLevels.forEach((level, i) => {
    const pos = NODE_POS[i] || NODE_POS[NODE_POS.length - 1];
    const unlocked = isLevelUnlocked(profile, level, curId);
    const stars = profile.levels[level.id]?.stars || 0;
    const node = el('button', `level-node ${unlocked ? '' : 'locked'}`);
    node.style.left = pos.x + '%';
    node.style.top = pos.y + '%';
    node.innerHTML = unlocked
      ? `<span>${i + 1}</span><span class="stars">${starsHTML(stars)}</span>`
      : '<span>🔒</span>';
    node.addEventListener('click', () => {
      if (!unlocked) { sfx.wrong(); return; }
      sfx.tap();
      speak(level.title);
      // משחק הזיכרון רץ במסך משלו; שאר הנושאים במסך התרגיל
      ctx.navigate(subjectId === 'memory' ? 'memory' : 'exercise', { levelId: level.id });
    });
    area.appendChild(node);
  });
  screen.appendChild(area);

  // תחתית: אלבום + חנות + דמות
  const footer = el('div', 'map-footer');
  const prizesBtn = el('button', 'btn', `🎁 פרסים`);
  prizesBtn.addEventListener('click', () => ctx.navigate('prizes', { fromWorld: worldN }));
  const shopBtn = el('button', 'btn', `🛍️ חנות`);
  shopBtn.addEventListener('click', () => ctx.navigate('shop', { fromWorld: worldN }));
  const charBtn = el('button', 'btn', '');
  charBtn.style.padding = '4px 16px';
  charBtn.innerHTML = profile.character
    ? profileCharSVG(profile, characterStage(profile.totals.stars), 52)
    : '🐾';
  charBtn.addEventListener('click', () => ctx.navigate('character', { fromWorld: worldN }));
  footer.append(prizesBtn, shopBtn, charBtn);
  screen.appendChild(footer);

  container.appendChild(screen);
}

// העולם שמוצג כברירת מחדל: העולם של השלב הפתוח האחרון
function defaultWorld(profile, cur, curId) {
  let world = 1;
  for (const level of cur.levels) {
    if (isLevelUnlocked(profile, level, curId)) world = level.world;
    else break;
  }
  return world;
}

// שביל מקווקו דרך התחנות
function pathSVG() {
  const wrap = el('div', 'map-path');
  let d = `M ${NODE_POS[0].x} ${NODE_POS[0].y}`;
  for (let i = 1; i < NODE_POS.length; i++) {
    const prev = NODE_POS[i - 1], p = NODE_POS[i];
    const mx = (prev.x + p.x) / 2;
    d += ` Q ${mx} ${prev.y}, ${(prev.x + p.x) / 2} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
  }
  wrap.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
    <path d="${d}" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2"
      stroke-dasharray="3 3" stroke-linecap="round"/>
  </svg>`;
  return wrap;
}
