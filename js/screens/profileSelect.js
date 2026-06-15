// מסך פתיחה: בחירת פרופיל + בחירת דמות בפעם הראשונה
import { el } from '../ui/components.js';
import { characterSVG, profileCharSVG } from '../ui/character-svg.js';
import { CHARACTERS, characterStage } from '../engine/rewards.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

export function profileSelect(container, ctx) {
  document.body.dataset.theme = 'home';
  const screen = el('div', 'screen profile-screen');

  screen.appendChild(el('div', 'app-logo', 'העולם של נויה ואלין 🌈<span class="sub">מי משחקת עכשיו?</span>'));

  const cards = el('div', 'profile-cards');
  for (const id of ['noya', 'alin']) {
    const p = storage.getProfile(id);
    const card = el('button', 'profile-card pop-in');
    const stage = characterStage(p.totals.stars);
    const avatar = p.character
      ? profileCharSVG(p, stage, 110)
      : '<span class="placeholder">🎀</span>';
    card.innerHTML = `
      <div class="avatar">${avatar}</div>
      <div class="pname">${p.name}</div>
      <div class="pstars">⭐ ${p.totals.stars}</div>`;
    card.addEventListener('click', () => {
      sfx.tap();
      if (!p.character) showCharacterPick(container, ctx, id);
      else {
        ctx.state.profileId = id;
        ctx.navigate('subjectSelect');
      }
    });
    cards.appendChild(card);
  }
  screen.appendChild(cards);

  // כניסת הורים קטנה (גיבוי והעברת התקדמות)
  const parentLink = el('button', 'parent-link', '👨‍👩‍👧 הורים — גיבוי והעברה');
  parentLink.addEventListener('click', () => { sfx.tap(); ctx.navigate('parent'); });
  screen.appendChild(parentLink);

  container.appendChild(screen);
}

function showCharacterPick(container, ctx, profileId) {
  container.innerHTML = '';
  const p = storage.getProfile(profileId);
  const screen = el('div', 'screen profile-screen');
  screen.appendChild(el('div', 'app-logo', `היי ${p.name}! 💜<span class="sub">בחרי חברה לדרך — היא תגדל יחד איתך!</span>`));
  speak(`הַיי ${p.ttsName || p.name}! בַּחֲרִי חֲבֵרָה לַדֶּרֶךְ`);

  const picks = el('div', 'char-pick');
  for (const c of CHARACTERS.filter(c => c.starter)) {
    const opt = el('button', 'char-option pop-in');
    opt.innerHTML = `${characterSVG(c.type, 1, 100)}<span>${c.name}</span>`;
    opt.addEventListener('click', () => {
      storage.setCharacter(profileId, c.type, { grantOwnership: true });
      sfx.fanfare();
      speak(`${c.tn || c.name} ${c.g === 'f' ? 'מִצְטָרֶפֶת' : 'מִצְטָרֵף'} אֵלַיִךְ לְהַרְפַּתְקָה!`);
      ctx.state.profileId = profileId;
      ctx.navigate('subjectSelect');
    });
    picks.appendChild(opt);
  }
  screen.appendChild(picks);
  container.appendChild(screen);
}
