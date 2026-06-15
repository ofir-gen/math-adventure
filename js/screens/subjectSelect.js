// מסך בחירת נושא — אחרי שבוחרים את נויה/אלין: חשבון, זיכרון, עברית
import { el, topbarEl } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { characterStage } from '../engine/rewards.js';
import { SUBJECTS, curriculumFor, subjectStars } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

export function subjectSelect(container, ctx) {
  document.body.dataset.theme = 'home';
  delete document.body.dataset.bg;
  const profile = storage.getProfile(ctx.state.profileId);
  const screen = el('div', 'screen subject-screen');

  // כותרת: חזרה לבחירת דמות + ארנק
  const wallet = el('div', 'coin-badge', `⭐ ${profile.totals.stars} &nbsp;🪙 ${profile.coins}`);
  screen.appendChild(topbarEl(`היי ${profile.name}!`, () => ctx.navigate('profileSelect'), wallet));

  // הדמות באמצע
  const avatar = el('div', 'subject-avatar');
  avatar.innerHTML = profileCharSVG(profile, characterStage(profile.totals.stars), 110);
  screen.appendChild(avatar);
  screen.appendChild(el('div', 'subject-q', 'במה נשחק היום?'));

  const cards = el('div', 'subject-cards');
  for (const subj of SUBJECTS) {
    const curId = curriculumFor(ctx.state.profileId, subj.id);
    const available = !!curId;
    const card = el('button', `subject-card pop-in ${available ? '' : 'soon'}`);
    const stars = available ? subjectStars(profile, curId) : 0;
    card.innerHTML = `
      <span class="subj-icon">${subj.icon}</span>
      <span class="subj-name">${subj.name}</span>
      <span class="subj-meta">${available ? `⭐ ${stars}` : 'בקרוב!'}</span>`;
    card.addEventListener('click', () => {
      if (!available) { sfx.tap(); speak('בְּקָרוֹב! עוֹד מְעַט נוֹסִיף אֶת זֶה'); return; }
      sfx.tap();
      speak(subj.tn);
      ctx.state.subjectId = subj.id;
      ctx.state.curriculumId = curId;
      ctx.navigate('worldMap');
    });
    cards.appendChild(card);
  }
  screen.appendChild(cards);
  container.appendChild(screen);
}
