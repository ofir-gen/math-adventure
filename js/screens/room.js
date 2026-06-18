// החדר של הדמות: טיפול (האכלה/אמבטיה/שינה/משחק) + עיצוב החדר + מדף גביעים
import { el, topbarEl } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { characterStage, charByType, earnedTrophyEmojis } from '../engine/rewards.js';
import { decorItems } from '../engine/shopCatalog.js';
import { CARE_KEYS, FOODS, careMood, allCaredFor, CARE_BONUS_COINS } from '../engine/careData.js';
import { confetti } from '../ui/confetti.js';
import * as storage from '../storage.js';
import { sfx, speak } from '../audio.js';

const SPOTS = [
  { spot: 'wall', label: 'קיר' },
  { spot: 'bed', label: 'מיטה' },
  { spot: 'plant', label: 'צמח' },
  { spot: 'toy', label: 'צעצוע' },
];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function room(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  delete document.body.dataset.bg;
  let foodOpen = false;
  render();

  function render() {
    container.innerHTML = '';
    const profile = storage.getProfile(ctx.state.profileId);
    const care = storage.tickCare(ctx.state.profileId, Date.now());
    const stage = characterStage(profile.totals.stars);
    const c = charByType(profile.character?.type || 'bunny');
    const name = profile.character?.name || c.name;
    const mood = careMood(care);

    const screen = el('div', 'screen room-screen');
    screen.appendChild(topbarEl(`החדר של ${name}`, () => ctx.navigate('character', { fromWorld: params.fromWorld })));

    const scroll = el('div', 'room-scroll');

    // מדף גביעים
    const trophies = earnedTrophyEmojis(profile);
    const shelf = el('div', 'trophy-shelf');
    shelf.innerHTML = trophies.length
      ? `<div class="shelf-items">${trophies.map(e => `<span>${e}</span>`).join('')}</div><div class="shelf-board"></div>`
      : `<div class="shelf-empty">עוד אין גביעים — שחקי ואספי! 🏆</div><div class="shelf-board"></div>`;
    scroll.appendChild(shelf);

    // הסצנה: רהיטים + הדמות + מצב רוח
    const scene = el('div', 'room-scene');
    const decorMap = Object.fromEntries(decorItems().map(i => [i.id, i]));
    for (const { spot } of SPOTS) {
      const id = profile.room?.[spot];
      if (id && decorMap[id]) scene.appendChild(el('span', `room-decor decor-${spot}`, decorMap[id].icon));
    }
    const charEl = el('button', 'room-char petable');
    charEl.innerHTML = profileCharSVG(profile, stage, 150);
    charEl.addEventListener('click', () => { petReact(charEl); doCare('happy', 12); });
    scene.appendChild(charEl);
    if (mood.bubble) scene.appendChild(el('span', 'mood-bubble', mood.bubble));
    scene.appendChild(el('span', 'mood-face', mood.face));
    scroll.appendChild(scene);

    // מדי הטיפול
    const bars = el('div', 'care-bars');
    for (const ck of CARE_KEYS) {
      const v = Math.round(care[ck.key]);
      const bar = el('div', 'care-bar');
      bar.innerHTML = `<span class="care-ic">${ck.icon}</span><div class="care-track"><div class="care-fill ${v < 35 ? 'low' : ''}" style="width:${v}%"></div></div>`;
      bars.appendChild(bar);
    }
    scroll.appendChild(bars);

    // כפתורי טיפול
    const actions = el('div', 'care-actions');
    const feedBtn = el('button', 'care-btn', '🍎<span>האכל</span>');
    feedBtn.addEventListener('click', () => { foodOpen = !foodOpen; sfx.tap(); render(); });
    const bathBtn = el('button', 'care-btn', '🛁<span>אמבטיה</span>');
    bathBtn.addEventListener('click', () => { bubbleAnim(charEl); speak('אֵיזֶה כֵּיף לְהִתְרַחֵץ!'); doCare('clean', 'full'); });
    const sleepBtn = el('button', 'care-btn', '😴<span>שינה</span>');
    sleepBtn.addEventListener('click', () => { sleepAnim(scene); speak('לַיְלָה טוֹב... נָנוּחַ קְצָת'); doCare('energy', 'full'); });
    const playBtn = el('button', 'care-btn', '🎾<span>שחק</span>');
    playBtn.addEventListener('click', () => { playAnim(charEl); speak('יָאי! עוֹד כַּדּוּר!'); doCare('happy', 30); });
    actions.append(feedBtn, bathBtn, sleepBtn, playBtn);
    scroll.appendChild(actions);

    // בורר מאכלים (נפתח מ"האכל")
    if (foodOpen) {
      const foods = el('div', 'food-picker pop-in');
      for (const f of FOODS) {
        const b = el('button', 'food-chip', f.e);
        b.addEventListener('click', () => {
          foodOpen = false;
          flyFood(charEl, f.e);
          speak(`מַמְמ, ${f.tn} טָעִים! תּוֹדָה!`);
          doCare('fed', 35, 5);
        });
        foods.appendChild(b);
      }
      scroll.appendChild(foods);
    }

    // עיצוב החדר
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
    if (!anyOwned) scroll.appendChild(el('div', 'growth-hint', 'קני רהיטים בחנות ועצבי כאן את החדר! 🛍️'));

    screen.appendChild(scroll);
    container.appendChild(screen);
  }

  // מעלה מד + בודק בונוס יומי, ואז מרענן
  function doCare(key, amount, alsoHappy) {
    storage.raiseCare(ctx.state.profileId, key, amount);
    if (alsoHappy) storage.raiseCare(ctx.state.profileId, 'happy', alsoHappy);
    sfx.correct();
    const p = storage.getProfile(ctx.state.profileId);
    const today = new Date().toDateString();
    if (allCaredFor(p.care) && storage.careBonusAvailable(ctx.state.profileId, today)) {
      storage.claimCareBonus(ctx.state.profileId, today, CARE_BONUS_COINS);
      setTimeout(() => { sfx.fanfare(); confetti(); speak(`טִפַּלְתְּ יָפֶה! קִבַּלְתְּ ${CARE_BONUS_COINS} מַטְבְּעוֹת!`); }, 350);
    }
    setTimeout(render, 260);
  }

  // ===== אנימציות =====
  function petReact(charEl) {
    charEl.classList.remove('bounce'); void charEl.offsetWidth; charEl.classList.add('bounce');
    sfx.pop();
    floatEmoji(charEl, pick(['💛', '💖', '⭐']));
  }
  function flyFood(charEl, emoji) {
    const f = el('span', 'fly-food', emoji);
    charEl.appendChild(f);
    setTimeout(() => f.remove(), 800);
    charEl.classList.remove('bounce'); void charEl.offsetWidth; charEl.classList.add('bounce');
  }
  function playAnim(charEl) {
    const b = el('span', 'fly-ball', '⚽');
    charEl.appendChild(b);
    setTimeout(() => b.remove(), 900);
    charEl.classList.remove('bounce'); void charEl.offsetWidth; charEl.classList.add('bounce');
  }
  function bubbleAnim(charEl) {
    for (let i = 0; i < 5; i++) {
      const b = el('span', 'bath-bubble', '🫧');
      b.style.left = (30 + Math.random() * 40) + '%';
      b.style.animationDelay = (i * 0.1) + 's';
      charEl.appendChild(b);
      setTimeout(() => b.remove(), 1100);
    }
  }
  function sleepAnim(scene) {
    scene.classList.add('sleeping');
    const z = el('span', 'sleep-z', '💤');
    scene.appendChild(z);
    setTimeout(() => { scene.classList.remove('sleeping'); z.remove(); }, 1300);
  }
  function floatEmoji(host, emoji) {
    const h = el('span', 'float-heart', emoji);
    h.style.left = (35 + Math.random() * 30) + '%';
    host.appendChild(h);
    setTimeout(() => h.remove(), 1100);
  }
}
