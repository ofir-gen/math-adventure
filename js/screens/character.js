// מסך הדמות: גודל נוכחי, פס התקדמות לשלב הבא, ומעבר בין דמויות שבבעלות
import { el, topbarEl } from '../ui/components.js';
import { profileCharSVG, characterSVG } from '../ui/character-svg.js';
import { characterStage, nextStageInfo, stageName, charByType } from '../engine/rewards.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

export function character(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  render();

  function render() {
    container.innerHTML = '';
    const profile = storage.getProfile(ctx.state.profileId);
    const type = profile.character?.type || 'bunny';
    const stage = characterStage(profile.totals.stars);
    const c = charByType(type) || { name: '', tn: '', g: 'm' };
    const f = c.g === 'f';

    const screen = el('div', 'screen char-screen');
    screen.appendChild(topbarEl(
      `${c.name} של ${profile.name}`,
      () => ctx.navigate('worldMap', { world: params.fromWorld }),
    ));

    const inner = el('div', 'screen char-screen');
    inner.style.padding = '0';
    inner.appendChild(el('div', 'char-stage-name', `${stageName(stage, c.g)} ${'⭐'.repeat(stage)}`));

    const disp = el('div', 'char-display');
    disp.innerHTML = profileCharSVG(profile, stage, 200);
    inner.appendChild(disp);

    const info = nextStageInfo(profile.totals.stars);
    if (info) {
      const barEl = el('div', 'growth-bar');
      const fill = el('div', 'fill');
      fill.style.width = '0%';
      barEl.appendChild(fill);
      inner.appendChild(barEl);
      requestAnimationFrame(() => { fill.style.width = Math.round(info.progress * 100) + '%'; });
      const missing = info.next - profile.totals.stars;
      inner.appendChild(el('div', 'growth-hint', `עוד ${missing} כוכבים ו${c.name} ${f ? 'תגדל' : 'יגדל'}! 🌱`));
      speak(`עוֹד ${missing} כּוֹכָבִים וְ${c.tn} ${f ? 'תִּגְדַּל' : 'יִגְדַּל'}`);
    } else {
      inner.appendChild(el('div', 'growth-hint', `${c.name} ${f ? 'גדלה' : 'גדל'} עד הסוף — איזו אלופה את! 👑`));
    }

    // מעבר בין דמויות שבבעלות (נקנות בחנות)
    const ownedTypes = profile.owned
      .filter(id => id.startsWith('ch_'))
      .map(id => id.slice(3))
      .filter(t => charByType(t));
    if (ownedTypes.length > 1) {
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
      inner.appendChild(row);
    }

    screen.appendChild(inner);
    container.appendChild(screen);
  }
}
