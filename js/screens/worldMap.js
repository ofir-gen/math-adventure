// מפת עולם: שביל מתפתל עם שלבים, כוכבים, נעילות — ותחנת מבחן בסוף כל עולם (נויה)
import { el, starsHTML, topbarEl } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { isLevelUnlocked, isWorldUnlocked, characterStage, examConfig, examId, examUnlocked, examRecord } from '../engine/rewards.js';
import { getCurriculum } from '../curriculum/index.js';
import { DAILY_GIFT_COINS } from '../engine/shopCatalog.js';
import { confetti } from '../ui/confetti.js';
import * as storage from '../storage.js';
import { sfx, speak } from '../audio.js';

// מיקומי התחנות על השביל (אחוזים), מלמטה למעלה — 6 שלבים, או 6 שלבים + מבחן
const NODE_POS_6 = [
  { x: 50, y: 88 }, { x: 23, y: 73 }, { x: 65, y: 58 },
  { x: 28, y: 43 }, { x: 70, y: 28 }, { x: 45, y: 11 },
];
const NODE_POS_7 = [
  { x: 50, y: 90 }, { x: 22, y: 77 }, { x: 66, y: 64 },
  { x: 28, y: 51 }, { x: 70, y: 38 }, { x: 33, y: 25 }, { x: 58, y: 9 },
];

export function worldMap(container, ctx, params = {}) {
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = profile.curriculum;
  const cur = getCurriculum(curId);
  const exam = examConfig(curId);

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
  starsBadge.addEventListener('click', () => ctx.navigate('shop', { fromWorld: worldN }));
  const title = cur.meta?.grade ? `${profile.name} · ${cur.meta.grade}` : profile.name;
  screen.appendChild(topbarEl(title, () => ctx.navigate('profileSelect'), starsBadge));

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
    else {
      sfx.wrong();
      const allDone = examUnlocked(profile, worldN, curId);
      speak(exam && allDone
        ? `כְּדֵי לִפְתֹּחַ אֶת ${next.name} צָרִיךְ לַעֲבֹר אֶת הַמִּבְחָן שֶׁל ${world.name}`
        : `כְּדֵי לִפְתֹּחַ אֶת ${next.name} צָרִיךְ לְסַיֵּם אֶת כָּל הַשְּׁלַבִּים כָּאן`);
    }
  });
  screen.appendChild(nav);

  // אזור המפה: שביל + תחנות
  const area = el('div', 'map-area');
  const worldLevels = cur.levels.filter(l => l.world === worldN);
  const positions = exam ? NODE_POS_7 : NODE_POS_6;
  area.appendChild(pathSVG(positions));
  worldLevels.forEach((level, i) => {
    const pos = positions[i] || positions[positions.length - 1];
    const unlocked = isLevelUnlocked(profile, level, curId);
    const stars = profile.levels[level.id]?.stars || 0;
    const node = el('button', `level-node ${unlocked ? '' : 'locked'}`);
    node.style.left = pos.x + '%';
    node.style.top = pos.y + '%';
    node.innerHTML = unlocked
      ? `<span>${i + 1}</span><span class="stars">${starsHTML(stars)}</span>`
      : '<span>🔒</span>';
    node.title = level.title;
    node.addEventListener('click', () => {
      if (!unlocked) { sfx.wrong(); return; }
      sfx.tap();
      speak(level.title);
      ctx.navigate('exercise', { levelId: level.id });
    });
    area.appendChild(node);
  });

  // תחנת המבחן — נפתחת אחרי שכל שלבי העולם הושלמו
  if (exam) {
    const pos = positions[worldLevels.length];
    const open = examUnlocked(profile, worldN, curId);
    const rec = examRecord(profile, examId(worldN));
    const passed = (rec?.best || 0) >= exam.pass;
    const node = el('button', `level-node exam ${open ? '' : 'locked'} ${passed ? 'passed' : ''}`);
    node.style.left = pos.x + '%';
    node.style.top = pos.y + '%';
    node.innerHTML = !open ? '<span>🔒</span><span class="exam-lbl">מבחן</span>'
      : passed ? `<span>🎓</span><span class="exam-lbl">${rec.best}</span>`
      : rec ? `<span>📝</span><span class="exam-lbl">${rec.best}</span>`
      : '<span>📝</span><span class="exam-lbl">מבחן</span>';
    node.addEventListener('click', () => {
      if (!open) {
        sfx.wrong();
        speak('קֹדֶם מְסַיְּמִים אֶת כָּל הַשְּׁלַבִּים בָּעוֹלָם, וְאָז הַמִּבְחָן נִפְתָּח');
        return;
      }
      sfx.tap();
      ctx.navigate('exercise', { exam: worldN });
    });
    area.appendChild(node);
  }

  // מתנה יומית — פעם ביום
  const today = new Date().toDateString();
  if (storage.dailyGiftAvailable(ctx.state.profileId, today)) {
    const gift = el('button', 'daily-gift map-gift pop-in', `🎁 מתנה יומית! +${DAILY_GIFT_COINS} 🪙`);
    gift.addEventListener('click', () => {
      storage.claimDailyGift(ctx.state.profileId, today, DAILY_GIFT_COINS);
      sfx.fanfare();
      confetti();
      speak(`מַתָּנָה יוֹמִית! קִבַּלְתְּ ${DAILY_GIFT_COINS} מַטְבְּעוֹת!`);
      ctx.navigate('worldMap', { world: worldN });
    });
    area.appendChild(gift);
  }
  screen.appendChild(area);

  // תחתית: אלבום + חנות + תעודה + דמות
  const footer = el('div', 'map-footer');
  const prizesBtn = el('button', 'btn', `🎁 פרסים`);
  prizesBtn.addEventListener('click', () => ctx.navigate('prizes', { fromWorld: worldN }));
  const shopBtn = el('button', 'btn', `🛍️ חנות`);
  shopBtn.addEventListener('click', () => ctx.navigate('shop', { fromWorld: worldN }));
  footer.append(prizesBtn, shopBtn);
  if (exam) {
    const reportBtn = el('button', 'btn', '📋 תעודה');
    reportBtn.addEventListener('click', () => ctx.navigate('report', { fromWorld: worldN }));
    footer.appendChild(reportBtn);
  }
  const charBtn = el('button', 'btn', '');
  charBtn.style.padding = '4px 16px';
  charBtn.innerHTML = profile.character
    ? profileCharSVG(profile, characterStage(profile.totals.stars), 52)
    : '🐾';
  charBtn.addEventListener('click', () => ctx.navigate('character', { fromWorld: worldN }));
  footer.appendChild(charBtn);
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
function pathSVG(positions) {
  const wrap = el('div', 'map-path');
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1], p = positions[i];
    const mx = (prev.x + p.x) / 2;
    d += ` Q ${mx} ${prev.y}, ${(prev.x + p.x) / 2} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
  }
  wrap.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
    <path d="${d}" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2"
      stroke-dasharray="3 3" stroke-linecap="round"/>
  </svg>`;
  return wrap;
}
