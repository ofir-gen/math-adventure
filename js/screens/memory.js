// משחק הזיכרון: התאמת זוגות קלפים. מסך עצמאי (לא דרך מנוע התרגילים).
import { el } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { confetti } from '../ui/confetti.js';
import { applyRound, characterStage, stageName, CHARACTERS } from '../engine/rewards.js';
import { evolveOverlay } from '../ui/celebrate.js';
import { getCurriculum, levelById } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const PRAISE = ['כל הכבוד!', 'מצאת!', 'יופי!', 'איזו אלופה!'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function memory(container, ctx, { levelId }) {
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = ctx.state.curriculumId;
  const cur = getCurriculum(curId);
  const level = levelById(curId, levelId);
  const world = cur.worlds.find(w => w.n === level.world);
  document.body.dataset.theme = world.theme;

  const faces = shuffle(level.pool).slice(0, level.pairs);
  const deck = shuffle([...faces, ...faces]).map((e, i) => ({ e, id: i }));
  const st = { flipped: [], matched: 0, mistakes: 0, locked: false };

  const screen = el('div', 'screen mem-screen');

  const bar = el('div', 'topbar');
  const quit = el('button', 'btn round', '✕');
  quit.addEventListener('click', () => ctx.navigate('worldMap', { world: level.world }));
  const spacer = el('div', '', ''); spacer.style.width = '52px';
  bar.append(quit, el('div', 'title', 'מצאי את הזוגות!'), spacer);
  screen.appendChild(bar);

  const grid = el('div', 'mem-grid');
  grid.style.gridTemplateColumns = `repeat(${level.cols}, 1fr)`;
  for (const card of deck) {
    const c = el('button', 'mem-card');
    c.innerHTML = `<span class="mem-face">${card.e}</span><span class="mem-back">⭐</span>`;
    c.addEventListener('click', () => onFlip(card, c));
    grid.appendChild(c);
  }
  screen.appendChild(grid);
  container.appendChild(screen);
  setTimeout(() => speak('מָצְאִי אֶת הַזּוּגוֹת!'), 350);

  function onFlip(card, c) {
    if (st.locked || c.classList.contains('flipped') || c.classList.contains('matched')) return;
    c.classList.add('flipped');
    sfx.tap();
    st.flipped.push({ card, c });
    if (st.flipped.length < 2) return;

    st.locked = true;
    const [a, b] = st.flipped;
    if (a.card.e === b.card.e) {
      setTimeout(() => {
        a.c.classList.add('matched');
        b.c.classList.add('matched');
        sfx.correct();
        st.flipped = [];
        st.locked = false;
        st.matched += 1;
        if (st.matched === level.pairs) win();
      }, 360);
    } else {
      st.mistakes += 1;
      sfx.wrong();
      setTimeout(() => {
        a.c.classList.remove('flipped');
        b.c.classList.remove('flipped');
        st.flipped = [];
        st.locked = false;
      }, 850);
    }
  }

  // כוכבים לפי טעויות יחסית למספר הזוגות — תמיד לפחות כוכב אחד
  function calcStars() {
    if (st.mistakes <= Math.floor(level.pairs * 0.5)) return 3;
    if (st.mistakes <= level.pairs) return 2;
    return 1;
  }

  function win() {
    const stars = calcStars();
    const result = applyRound(ctx.state.profileId, levelId, stars, level.pairs, level.pairs, curId);
    const updated = storage.getProfile(ctx.state.profileId);
    sfx.fanfare();
    confetti();

    const res = el('div', 'screen results');
    res.appendChild(el('div', 'big-msg', `${pick(PRAISE)} ${profile.name}! 🎉`));
    const starRow = el('div', 'big-stars');
    for (let i = 0; i < 3; i++) starRow.appendChild(el('span', 'star' + (i < stars ? '' : ' off'), '⭐'));
    res.appendChild(starRow);
    const starWord = stars === 1 ? 'כּוֹכָב אֶחָד' : stars === 2 ? 'שְׁנֵי כּוֹכָבִים' : 'שְׁלוֹשָׁה כּוֹכָבִים';
    speak(`כָּל הַכָּבוֹד ${profile.ttsName || profile.name}! מָצָאת אֶת כָּל הַזּוּגוֹת וְקִבַּלְתְּ ${starWord}!`);

    if (result.coinsEarned > 0) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">🪙</span> הרווחת ${result.coinsEarned} מטבעות!`));
    }
    for (const s of result.newStickers) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">${s.emoji}</span> מדבקה חדשה: ${s.name}`));
    }
    if (result.stageUp && updated.character) {
      setTimeout(() => evolveOverlay(updated, result.stageUp), 1100);
    }

    const actions = el('div', 'actions');
    const again = el('button', 'btn primary', '🔄 עוד פעם');
    again.addEventListener('click', () => ctx.navigate('memory', { levelId }));
    const toMap = el('button', 'btn', '🗺️ למפה');
    toMap.addEventListener('click', () => ctx.navigate('worldMap', { world: level.world }));
    actions.append(again, toMap);
    res.appendChild(actions);

    container.innerHTML = '';
    container.appendChild(res);
  }
}
