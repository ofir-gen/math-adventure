// הבית של הדמות: דמות גדולה שמגיבה ללטיפה, מתן שם, גדילה, החלפת דמות, והתלבשות חיה
import { el, topbarEl } from '../ui/components.js';
import { profileCharSVG, characterSVG } from '../ui/character-svg.js';
import { characterStage, nextStageInfo, stageName, charByType } from '../engine/rewards.js';
import { ITEMS } from '../engine/shopCatalog.js';
import { flagSVG } from '../ui/flags.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

// חריצי לבוש שמופיעים בהתלבשות (לפי הסדר), עם שם להצגה
const DRESS_SLOTS = [
  { slot: 'head', label: 'ראש' },
  { slot: 'eyes', label: 'עיניים' },
  { slot: 'neck', label: 'צוואר' },
  { slot: 'back', label: 'גב' },
  { slot: 'color', label: 'צבע' },
  { slot: 'flag', label: 'דגל' },
  { slot: 'bg', label: 'רקע' },
];
const HAPPY = ['איזה כיף!', 'אני אוהבת אותך!', 'עוד ליטוף!', 'יששש!'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function character(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  delete document.body.dataset.bg;
  render();

  function render() {
    container.innerHTML = '';
    const profile = storage.getProfile(ctx.state.profileId);
    const type = profile.character?.type || 'bunny';
    const stage = characterStage(profile.totals.stars);
    const c = charByType(type) || { name: '', tn: '', g: 'm' };
    const f = c.g === 'f';
    const name = profile.character?.name || c.name;

    const screen = el('div', 'screen char-home');
    screen.appendChild(topbarEl(`הבית של ${name}`, () => ctx.navigate('worldMap', { world: params.fromWorld })));

    const scroll = el('div', 'char-home-scroll');

    // ===== הדמות הגדולה — לוחצים והיא מגיבה =====
    const stageEl = el('div', 'char-stage-name', `${stageName(stage, c.g)} ${'⭐'.repeat(stage)}`);
    scroll.appendChild(stageEl);

    const disp = el('button', 'char-display petable');
    disp.innerHTML = profileCharSVG(profile, stage, 190);
    disp.addEventListener('click', () => petReact(disp, name, f));
    scroll.appendChild(disp);
    scroll.appendChild(el('div', 'pet-hint', '👆 לחצי על ' + name + ' כדי ללטף!'));

    // ===== שם הדמות =====
    const nameRow = el('div', 'name-row');
    const roomBtn = el('button', 'btn', '🏠 החדר שלי');
    roomBtn.addEventListener('click', () => { sfx.tap(); ctx.navigate('room', { fromWorld: params.fromWorld }); });
    nameRow.appendChild(roomBtn);
    const renameBtn = el('button', 'btn', `✏️ קראי לי בשם`);
    renameBtn.addEventListener('click', () => {
      const cur = profile.character?.name || '';
      const val = prompt(`איך לקרוא ל${c.name}?`, cur);
      if (val && val.trim()) {
        storage.setCharacterName(ctx.state.profileId, val);
        sfx.fanfare();
        speak(`קוֹרְאִים לִי עַכְשָׁו ${val.trim()}! תּוֹדָה!`);
        render();
      }
    });
    nameRow.appendChild(renameBtn);
    scroll.appendChild(nameRow);

    // ===== גדילה =====
    const info = nextStageInfo(profile.totals.stars);
    if (info) {
      const barEl = el('div', 'growth-bar');
      const fill = el('div', 'fill');
      fill.style.width = '0%';
      barEl.appendChild(fill);
      scroll.appendChild(barEl);
      requestAnimationFrame(() => { fill.style.width = Math.round(info.progress * 100) + '%'; });
      const missing = info.next - profile.totals.stars;
      scroll.appendChild(el('div', 'growth-hint', `עוד ${missing} כוכבים ו${name} ${f ? 'תגדל' : 'יגדל'}! 🌱`));
    } else {
      scroll.appendChild(el('div', 'growth-hint', `${name} ${f ? 'גדלה' : 'גדל'} עד הסוף — איזו אלופה את! 👑`));
    }

    // ===== החלפת דמות (אם יש כמה בבעלות) =====
    const ownedTypes = profile.owned.filter(id => id.startsWith('ch_')).map(id => id.slice(3)).filter(t => charByType(t));
    if (ownedTypes.length > 1) {
      scroll.appendChild(el('div', 'dress-title', 'בחרי חברה'));
      const row = el('div', 'char-switch');
      for (const t of ownedTypes) {
        const cc = charByType(t);
        const btn = el('button', `char-switch-btn ${t === type ? 'active' : ''}`);
        btn.innerHTML = characterSVG(t, Math.min(stage, 2), 46);
        btn.addEventListener('click', () => {
          if (t === type) return;
          storage.setCharacter(ctx.state.profileId, t);
          sfx.tap();
          speak(`${cc.tn} ${cc.g === 'f' ? 'חוֹזֶרֶת' : 'חוֹזֵר'} אֵלַיִךְ!`);
          render();
        });
        row.appendChild(btn);
      }
      scroll.appendChild(row);
    }

    // ===== התלבשות חיה =====
    scroll.appendChild(el('div', 'dress-title', '👗 בואי נתלבש!'));
    let anyOwned = false;
    for (const { slot, label } of DRESS_SLOTS) {
      const owned = ITEMS.filter(i => i.slot === slot && profile.owned.includes(i.id));
      if (!owned.length) continue;
      anyOwned = true;
      const row = el('div', 'dress-row');
      row.appendChild(el('span', 'dress-label', label));
      const chips = el('div', 'dress-chips');
      // צ'יפ "הסרה"
      const none = el('button', `dress-chip ${profile.equipped[slot] ? '' : 'active'}`, '🚫');
      none.addEventListener('click', () => { storage.equipItem(ctx.state.profileId, slot, null); sfx.tap(); render(); });
      chips.appendChild(none);
      for (const item of owned) {
        const on = profile.equipped[slot] === item.id;
        const chip = el('button', `dress-chip ${on ? 'active' : ''}`);
        chip.innerHTML = slot === 'flag' ? flagSVG(item.id, 38, 26) : `<span>${item.icon}</span>`;
        chip.addEventListener('click', () => {
          storage.equipItem(ctx.state.profileId, slot, on ? null : item.id);
          sfx.tap();
          if (!on) speak(item.tn || item.name);
          render();
        });
        chips.appendChild(chip);
      }
      row.appendChild(chips);
      scroll.appendChild(row);
    }
    if (!anyOwned) {
      scroll.appendChild(el('div', 'growth-hint', 'קני אביזרים בחנות ותלבישי אותי כאן! 🛍️'));
    }

    screen.appendChild(scroll);
    container.appendChild(screen);
  }

  // ליטוף: קפיצה + לבבות מרחפים + קול
  function petReact(disp, name, f) {
    disp.classList.remove('bounce');
    void disp.offsetWidth;
    disp.classList.add('bounce');
    sfx.pop();
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const heart = el('span', 'float-heart', pick(['💛', '💖', '⭐', '✨']));
      heart.style.left = (35 + Math.random() * 30) + '%';
      heart.style.animationDelay = (i * 0.12) + 's';
      disp.appendChild(heart);
      setTimeout(() => heart.remove(), 1100);
    }
    if (Math.random() < 0.5) speak(pick(HAPPY));
  }
}
