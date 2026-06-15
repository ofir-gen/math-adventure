// חגיגת התפתחות הדמות — אוברליי מלא מסך כשהדמות עולה שלב
import { el } from './components.js';
import { profileCharSVG } from './character-svg.js';
import { confetti } from './confetti.js';
import { stageName, charByType } from '../engine/rewards.js';
import { sfx, speak } from '../audio.js';

export function evolveOverlay(profile, stage) {
  const c = charByType(profile.character?.type || 'bunny');
  const name = profile.character?.name || c.name;
  const f = c.g === 'f';
  const ov = el('div', 'evolve-overlay');
  ov.innerHTML = `
    <div class="evolve-char">${profileCharSVG(profile, stage, 180)}</div>
    <div class="evolve-title">${name} ${f ? 'גדלה' : 'גדל'}! 🎉</div>
    <div class="evolve-sub">עכשיו ${f ? 'היא' : 'הוא'} ${stageName(stage, c.g)}!</div>`;
  document.body.appendChild(ov);
  sfx.fanfare();
  confetti(2800);
  speak(`${c.tn} ${f ? 'גָּדְלָה' : 'גָּדַל'}! עַכְשָׁו ${f ? 'הִיא' : 'הוּא'} ${stageName(stage, c.g)}!`);
  const close = () => ov.remove();
  ov.addEventListener('click', close);
  setTimeout(close, 3400);
}
