// מסך פתיחה: בחירת פרופיל
import { el } from '../ui/components.js';
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { sfx } from '../audio.js';

const AVATARS = { noya: '📐', alin: '🧮' };

export function profileSelect(container, ctx) {
  document.body.dataset.theme = 'home';
  const screen = el('div', 'screen profile-screen');

  screen.appendChild(el('div', 'app-logo', 'הרפתקת המתמטיקה 🔢<span class="sub">מי מתרגלת עכשיו?</span>'));

  const cards = el('div', 'profile-cards');
  for (const id of storage.profileIds()) {
    const p = storage.getProfile(id);
    const cur = getCurriculum(p.curriculum);
    const card = el('button', 'profile-card pop-in');
    card.innerHTML = `
      <div class="avatar"><span class="placeholder">${AVATARS[id] || '✏️'}</span></div>
      <div class="pname">${p.name}</div>
      <div class="pgrade">${cur.meta?.grade || ''}</div>
      <div class="pstars">⭐ ${p.totals.stars} · ${p.totals.questions} שאלות</div>`;
    card.addEventListener('click', () => {
      sfx.tap();
      ctx.state.profileId = id;
      ctx.navigate('levels');
    });
    cards.appendChild(card);
  }
  screen.appendChild(cards);

  // כניסת הורים: דוח התקדמות, גיבוי והעברה
  const parentLink = el('button', 'parent-link', '👨‍👩‍👧 הורים — דוח, גיבוי והעברה');
  parentLink.addEventListener('click', () => { sfx.tap(); ctx.navigate('parent'); });
  screen.appendChild(parentLink);

  container.appendChild(screen);
}
