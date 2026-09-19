// אלבום המדבקות: שהושגו — צבעוניות, שטרם — מסתוריות
import { el, topbarEl } from '../ui/components.js';
import { stickerCatalog } from '../engine/rewards.js';
import * as storage from '../storage.js';

export function prizes(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  const profile = storage.getProfile(ctx.state.profileId);
  const catalog = stickerCatalog(profile.curriculum);
  const earned = new Set(profile.stickers);

  const screen = el('div', 'screen');
  screen.appendChild(topbarEl(
    `🎁 הפרסים של ${profile.name}`,
    () => ctx.navigate('worldMap', { world: params.fromWorld }),
  ));

  const count = el('div', 'growth-hint');
  count.style.textAlign = 'center';
  count.style.paddingBottom = '8px';
  count.textContent = `נאספו ${earned.size} מתוך ${catalog.length} מדבקות`;
  screen.appendChild(count);

  const grid = el('div', 'sticker-grid');
  for (const s of catalog) {
    const has = earned.has(s.id);
    const card = el('div', `sticker ${has ? 'pop-in' : 'locked'}`);
    card.innerHTML = `<span class="semoji">${has ? s.emoji : '❓'}</span><span class="sname">${has ? s.name : '???'}</span>`;
    grid.appendChild(card);
  }
  screen.appendChild(grid);

  container.appendChild(screen);
}
