// החדר של הדמות: סצנה עם רהיטים שמציבים, ומדף גביעים עם המדבקות שנאספו
import { el, topbarEl } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { characterStage, charByType, earnedTrophyEmojis } from '../engine/rewards.js';
import { decorItems } from '../engine/shopCatalog.js';
import * as storage from '../storage.js';
import { sfx, speak } from '../audio.js';

const SPOTS = [
  { spot: 'wall', label: 'קיר' },
  { spot: 'bed', label: 'מיטה' },
  { spot: 'plant', label: 'צמח' },
  { spot: 'toy', label: 'צעצוע' },
];

export function room(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  delete document.body.dataset.bg;
  render();

  function render() {
    container.innerHTML = '';
    const profile = storage.getProfile(ctx.state.profileId);
    const stage = characterStage(profile.totals.stars);
    const c = charByType(profile.character?.type || 'bunny');
    const name = profile.character?.name || c.name;

    const screen = el('div', 'screen room-screen');
    screen.appendChild(topbarEl(`החדר של ${name}`, () => ctx.navigate('character', { fromWorld: params.fromWorld })));

    const scroll = el('div', 'room-scroll');

    // מדף גביעים
    const trophies = earnedTrophyEmojis(profile);
    const shelf = el('div', 'trophy-shelf');
    if (trophies.length) {
      shelf.innerHTML = `<div class="shelf-items">${trophies.map(e => `<span>${e}</span>`).join('')}</div><div class="shelf-board"></div>`;
    } else {
      shelf.innerHTML = `<div class="shelf-empty">עוד אין גביעים — שחקי ואספי! 🏆</div><div class="shelf-board"></div>`;
    }
    scroll.appendChild(shelf);

    // הסצנה: רהיטים מוצבים + הדמות במרכז
    const scene = el('div', 'room-scene');
    const decorMap = Object.fromEntries(decorItems().map(i => [i.id, i]));
    for (const { spot } of SPOTS) {
      const id = profile.room?.[spot];
      if (id && decorMap[id]) {
        scene.appendChild(el('span', `room-decor decor-${spot}`, decorMap[id].icon));
      }
    }
    const charEl = el('div', 'room-char');
    charEl.innerHTML = profileCharSVG(profile, stage, 150);
    scene.appendChild(charEl);
    scroll.appendChild(scene);

    // עיצוב: לכל חריץ — הרהיטים שבבעלות
    scroll.appendChild(el('div', 'dress-title', '🛋️ עצבי את החדר!'));
    let anyOwned = false;
    for (const { spot, label } of SPOTS) {
      const owned = decorItems().filter(i => i.spot === spot && profile.owned.includes(i.id));
      if (!owned.length) continue;
      anyOwned = true;
      const row = el('div', 'dress-row');
      row.appendChild(el('span', 'dress-label', label));
      const chips = el('div', 'dress-chips');
      const none = el('button', `dress-chip ${profile.room?.[spot] ? '' : 'active'}`, '🚫');
      none.addEventListener('click', () => { storage.setRoomItem(ctx.state.profileId, spot, null); sfx.tap(); render(); });
      chips.appendChild(none);
      for (const item of owned) {
        const on = profile.room?.[spot] === item.id;
        const chip = el('button', `dress-chip ${on ? 'active' : ''}`, `<span>${item.icon}</span>`);
        chip.addEventListener('click', () => {
          storage.setRoomItem(ctx.state.profileId, spot, on ? null : item.id);
          sfx.tap();
          if (!on) speak(item.tn);
          render();
        });
        chips.appendChild(chip);
      }
      row.appendChild(chips);
      scroll.appendChild(row);
    }
    if (!anyOwned) {
      scroll.appendChild(el('div', 'growth-hint', 'קני רהיטים בחנות ועצבי כאן את החדר! 🛍️'));
    }

    screen.appendChild(scroll);
    container.appendChild(screen);
  }
}
