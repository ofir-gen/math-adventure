// ספר האוסף: כל הפריטים לפי קטגוריה — מה נאסף ומה עוד חסר
import { el, topbarEl } from '../ui/components.js';
import { characterSVG } from '../ui/character-svg.js';
import { flagSVG } from '../ui/flags.js';
import { ITEMS } from '../engine/shopCatalog.js';
import * as storage from '../storage.js';

const CATS = [
  { key: 'char', label: '🐾 חברים', test: i => i.slot === 'char' },
  { key: 'head', label: '👑 ראש', test: i => i.slot === 'head' },
  { key: 'eyes', label: '😎 עיניים', test: i => i.slot === 'eyes' },
  { key: 'neck', label: '🧣 צוואר', test: i => i.slot === 'neck' },
  { key: 'back', label: '🦋 גב', test: i => i.slot === 'back' },
  { key: 'color', label: '🎨 צבעים', test: i => i.slot === 'color' },
  { key: 'bg', label: '🌅 רקעים', test: i => i.slot === 'bg' },
  { key: 'flag', label: '🚩 דגלים', test: i => i.slot === 'flag' },
];

export function collection(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  delete document.body.dataset.bg;
  const profile = storage.getProfile(ctx.state.profileId);
  const owned = new Set(profile.owned);

  const screen = el('div', 'screen');
  screen.appendChild(topbarEl('📚 ספר האוסף', () => ctx.navigate('shop', { fromWorld: params.fromWorld })));

  const total = ITEMS.length;
  const have = ITEMS.filter(i => owned.has(i.id)).length;
  const counter = el('div', 'growth-hint');
  counter.style.textAlign = 'center';
  counter.style.paddingBottom = '6px';
  counter.textContent = `אספת ${have} מתוך ${total} פריטים!`;
  screen.appendChild(counter);

  const scroll = el('div', 'collection-scroll');
  for (const cat of CATS) {
    const items = ITEMS.filter(cat.test);
    if (!items.length) continue;
    const haveCat = items.filter(i => owned.has(i.id)).length;
    scroll.appendChild(el('div', 'section-title', `${cat.label} (${haveCat}/${items.length})`));
    const grid = el('div', 'collection-grid');
    for (const item of items) {
      const has = owned.has(item.id);
      const cell = el('div', `coll-cell ${has ? '' : 'locked'}`);
      let icon;
      if (cat.key === 'char') icon = characterSVG(item.charType, 2, 50);
      else if (cat.key === 'flag') icon = flagSVG(item.id, 46, 31);
      else icon = `<span class="coll-emoji">${item.icon}</span>`;
      cell.innerHTML = has ? `${icon}<span class="coll-name">${item.name}</span>` : `<span class="coll-q">❓</span>`;
      grid.appendChild(cell);
    }
    scroll.appendChild(grid);
  }
  screen.appendChild(scroll);
  container.appendChild(screen);
}
