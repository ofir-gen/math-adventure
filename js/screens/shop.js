// החנות: אביזרים וצבעים לדמות + ביצת הפתעה. קונים במטבעות — הכוכבים לא נפגעים.
import { el, topbarEl } from '../ui/components.js';
import { profileCharSVG, characterSVG } from '../ui/character-svg.js';
import { flagSVG } from '../ui/flags.js';
import { characterStage, charByType } from '../engine/rewards.js';
import { shopItems, itemById, hatchEgg, eggPool, EGG_PRICE } from '../engine/shopCatalog.js';
import { confetti } from '../ui/confetti.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

export function shop(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  render();

  function render() {
    container.innerHTML = '';
    const profile = storage.getProfile(ctx.state.profileId);
    // רקע קנוי מוחל מיד — רואים את הקנייה בלייב
    if (profile.equipped?.bg) document.body.dataset.bg = profile.equipped.bg;
    else delete document.body.dataset.bg;
    const screen = el('div', 'screen shop-screen');

    // כותרת + ארנק
    const wallet = el('div', 'coin-badge', `🪙 ${profile.coins}`);
    screen.appendChild(topbarEl('🛍️ החנות', () => ctx.navigate('worldMap', { world: params.fromWorld }), wallet));

    const scroll = el('div', 'shop-scroll');

    // הדמות במרכז — רואים מיד כל פריט שנלבש
    const preview = el('div', 'shop-preview');
    preview.innerHTML = profileCharSVG(profile, characterStage(profile.totals.stars), 130);
    scroll.appendChild(preview);

    // ביצת הפתעה
    scroll.appendChild(el('div', 'section-title', 'ביצת הפתעה'));
    const pool = eggPool(profile);
    const eggCard = el('button', 'shop-item egg-card');
    if (pool.length === 0) {
      eggCard.innerHTML = `<span class="sicon">🥚</span><span class="sname">הכל כבר שלך! 🎉</span>`;
      eggCard.disabled = true;
      eggCard.classList.add('owned');
    } else {
      eggCard.innerHTML = `<span class="sicon">🥚</span><span class="sname">מה יש בפנים?</span><span class="sprice">🪙 ${EGG_PRICE}</span>`;
      eggCard.addEventListener('click', () => buyEgg(eggCard));
    }
    scroll.appendChild(el('div', 'shop-grid egg-row')).appendChild(eggCard);

    // דמויות חדשות
    scroll.appendChild(el('div', 'section-title', 'חברים חדשים'));
    const charGrid = el('div', 'shop-grid');
    for (const item of shopItems().filter(i => i.slot === 'char')) charGrid.appendChild(charCard(item, profile));
    scroll.appendChild(charGrid);

    // אביזרים
    scroll.appendChild(el('div', 'section-title', 'תחפושות לדמות'));
    const accGrid = el('div', 'shop-grid');
    for (const item of shopItems().filter(i => !['color', 'bg', 'char', 'flag'].includes(i.slot))) accGrid.appendChild(itemCard(item, profile));
    scroll.appendChild(accGrid);

    // צבעים
    scroll.appendChild(el('div', 'section-title', 'צבעים לדמות'));
    const colGrid = el('div', 'shop-grid');
    for (const item of shopItems().filter(i => i.slot === 'color')) colGrid.appendChild(itemCard(item, profile));
    scroll.appendChild(colGrid);

    // רקעים
    scroll.appendChild(el('div', 'section-title', 'רקעים קסומים'));
    const bgGrid = el('div', 'shop-grid');
    for (const item of shopItems().filter(i => i.slot === 'bg')) bgGrid.appendChild(itemCard(item, profile));
    scroll.appendChild(bgGrid);

    // דגלי מדינות — הדמות מחזיקה ביד
    scroll.appendChild(el('div', 'section-title', 'דגלי מדינות 🚩'));
    const flagGrid = el('div', 'shop-grid');
    for (const item of shopItems().filter(i => i.slot === 'flag')) flagGrid.appendChild(itemCard(item, profile));
    scroll.appendChild(flagGrid);

    // נדירים שכבר יצאו מביצים — שיהיה להם בית במדף
    const rares = profile.owned.map(itemById).filter(i => i?.rare);
    if (rares.length) {
      scroll.appendChild(el('div', 'section-title', 'אוצרות מהביצים ✨'));
      const rareGrid = el('div', 'shop-grid');
      for (const item of rares) rareGrid.appendChild(itemCard(item, profile));
      scroll.appendChild(rareGrid);
    }

    screen.appendChild(scroll);
    container.appendChild(screen);
  }

  function itemCard(item, profile) {
    const owned = profile.owned.includes(item.id);
    const worn = profile.equipped[item.slot] === item.id;
    const isFlag = item.slot === 'flag';
    const card = el('button', `shop-item ${owned ? 'owned' : ''} ${worn ? 'worn' : ''}`);
    const state = isFlag
      ? (worn ? '✓ מחזיקה' : owned ? 'להחזיק' : `🪙 ${item.price}`)
      : (worn ? '✓ לובשת' : owned ? 'ללבוש' : `🪙 ${item.price}`);
    const iconHtml = isFlag ? flagSVG(item.id, 50, 33) : `<span class="sicon">${item.icon}</span>`;
    card.innerHTML = `${iconHtml}<span class="sname">${item.name}</span><span class="sprice">${state}</span>`;
    card.addEventListener('click', () => {
      if (owned) {
        // הלבשה / הסרה
        storage.equipItem(ctx.state.profileId, item.slot, worn ? null : item.id);
        sfx.tap();
        if (!worn) speak(item.tn);
        render();
      } else if (storage.buyItem(ctx.state.profileId, item.id, item.price, item.slot)) {
        sfx.fanfare();
        confetti();
        speak(`קָנִית ${item.tn}!`);
        render();
      } else {
        sfx.wrong();
        speak('עוֹד אֵין מַסְפִּיק מַטְבְּעוֹת. בּוֹאִי נְשַׂחֵק וְנַרְוִיחַ!');
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 450);
      }
    });
    return card;
  }

  // כרטיס דמות: תצוגת SVG, קנייה ב-100, מעבר חופשי בין דמויות שבבעלות
  function charCard(item, profile) {
    const owned = profile.owned.includes(item.id);
    const active = profile.character?.type === item.charType;
    const card = el('button', `shop-item char-item ${owned ? 'owned' : ''} ${active ? 'worn' : ''}`);
    const state = active ? '✓ איתי עכשיו' : owned ? 'בואי אליי!' : `🪙 ${item.price}`;
    card.innerHTML = `${characterSVG(item.charType, 2, 64)}<span class="sname">${item.name}</span><span class="sprice">${state}</span>`;
    card.addEventListener('click', () => {
      const c = charByType(item.charType);
      if (active) return;
      if (owned) {
        storage.setCharacter(ctx.state.profileId, item.charType);
        sfx.fanfare();
        speak(`${c.tn} ${c.g === 'f' ? 'חוֹזֶרֶת' : 'חוֹזֵר'} אֵלַיִךְ!`);
        render();
      } else if (storage.buyCharacter(ctx.state.profileId, item.id, item.price, item.charType)) {
        sfx.fanfare();
        confetti();
        speak(`${c.tn} ${c.g === 'f' ? 'מִצְטָרֶפֶת' : 'מִצְטָרֵף'} אֵלַיִךְ לְהַרְפַּתְקָה!`);
        render();
      } else {
        sfx.wrong();
        speak('עוֹד אֵין מַסְפִּיק מַטְבְּעוֹת. בּוֹאִי נְשַׂחֵק וְנַרְוִיחַ!');
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 450);
      }
    });
    return card;
  }

  function buyEgg(eggCard) {
    if (!storage.spendCoins(ctx.state.profileId, EGG_PRICE)) {
      sfx.wrong();
      speak('עוֹד אֵין מַסְפִּיק מַטְבְּעוֹת. בּוֹאִי נְשַׂחֵק וְנַרְוִיחַ!');
      eggCard.classList.add('shake');
      setTimeout(() => eggCard.classList.remove('shake'), 450);
      return;
    }
    const profile = storage.getProfile(ctx.state.profileId);
    const item = hatchEgg(profile);
    storage.grantItem(ctx.state.profileId, item.id, item.slot);

    // אנימציית בקיעה
    const overlay = el('div', 'egg-overlay');
    overlay.innerHTML = `<div class="egg-anim">🥚</div>`;
    document.body.appendChild(overlay);
    sfx.pop();
    setTimeout(() => {
      overlay.innerHTML = `
        <div class="egg-reveal pop-in">
          <span class="sicon">${item.icon}</span>
          <span class="sname">${item.name}${item.rare ? ' ✨ נדיר!' : ''}</span>
        </div>`;
      sfx.fanfare();
      confetti();
      speak(`יָצָא ${item.tn}!${item.rare ? ' אֵיזֶה מַזָּל, זֶה פְּרִיט נָדִיר!' : ''}`);
      setTimeout(() => { overlay.remove(); render(); }, 2200);
    }, 1400);
  }
}
