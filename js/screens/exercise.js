// מסך התרגיל: סבב שאלות, משוב, ומסך סיום עם כוכבים ותגמולים
import { el, groupEl, answerCardEl, numpadEl, starsHTML } from '../ui/components.js';
import { characterSVG, profileCharSVG } from '../ui/character-svg.js';
import { confetti } from '../ui/confetti.js';
import { generateRound } from '../engine/generator.js';
import { calcStars, applyRound, characterStage, stageName, CHARACTERS } from '../engine/rewards.js';
import { evolveOverlay } from '../ui/celebrate.js';
import { getCurriculum, levelById } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

// מנוקד — גם מוצג וגם מוקרא, והניקוד גורם ל-TTS לבטא נכון
const PRAISE = ['כָּל הַכָּבוֹד!', 'מְעוּלֶה!', 'יוֹפִי!', 'נָכוֹן מְאוֹד!', 'אֵיזוֹ אַלּוּפָה!'];
const RETRY = ['נַסִּי שׁוּב!', 'כִּמְעַט!', 'עוֹד נִסָּיוֹן קָטָן!'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function exercise(container, ctx, { levelId }) {
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = ctx.state.curriculumId || profile.curriculum;
  const cur = getCurriculum(curId);
  const level = levelById(curId, levelId);
  const world = cur.worlds.find(w => w.n === level.world);
  document.body.dataset.theme = world.theme;
  const isAlin = !!cur.meta?.lenient; // הקראה אוטומטית בנושאים של גיל הגן

  const round = generateRound(level);
  const state = {
    qIndex: 0,
    missed: 0,        // שאלות שטעו בהן בניסיון ראשון
    correct: 0,
    streak: 0,
    bestStreak: 0,
    attemptedThis: false,
    locked: false,    // נעילת קלט בזמן משוב
  };

  const screen = el('div', 'screen ex-screen');

  // כותרת: יציאה + נקודות התקדמות
  const bar = el('div', 'topbar');
  const quitBtn = el('button', 'btn round', '✕');
  quitBtn.addEventListener('click', () => ctx.navigate('worldMap', { world: level.world }));
  const dots = el('div', 'progress-dots');
  for (let i = 0; i < round.length; i++) dots.appendChild(el('span', 'dot'));
  const spacer = el('div', '', '');
  spacer.style.width = '52px';
  bar.append(quitBtn, dots, spacer);
  screen.appendChild(bar);

  // אזור השאלה
  const qArea = el('div', 'ex-question');
  screen.appendChild(qArea);

  // דמות מלווה בפינה
  const companion = el('div', 'companion');
  if (profile.character) {
    companion.innerHTML = profileCharSVG(profile, characterStage(profile.totals.stars), 84);
  }
  screen.appendChild(companion);

  container.appendChild(screen);
  renderQuestion();

  function updateDots() {
    [...dots.children].forEach((d, i) => {
      d.className = 'dot' + (i < state.qIndex ? ' done' : i === state.qIndex ? ' now' : '');
    });
  }

  function renderQuestion() {
    state.attemptedThis = false;
    state.locked = false;
    updateDots();
    qArea.innerHTML = '';
    const q = round[state.qIndex];

    // שורת הנחיה + כפתור הקראה
    if (q.prompt || q.tts) {
      const prompt = el('div', 'ex-prompt');
      const ttsBtn = el('button', 'tts-btn', '🔊');
      ttsBtn.addEventListener('click', () => speak(q.tts));
      prompt.appendChild(ttsBtn);
      if (q.prompt) prompt.appendChild(el('span', '', q.prompt));
      qArea.appendChild(prompt);
    }
    if (isAlin) setTimeout(() => speak(q.tts), 350);

    if (q.mode === 'keypad') renderKeypad(q);
    else if (q.mode === 'cards') renderCards(q);
    else if (q.mode === 'pickGroup') renderPickGroup(q);
    else if (q.mode === 'tap') renderTap(q);
    else if (q.mode === 'yesNo') renderYesNo(q);
  }

  // ===== מצב משוואה / סיפור + לוח מספרים (נויה) =====
  function renderKeypad(q) {
    let input = '';
    let shakeEl, slotEl;
    if (q.story) {
      // בעיה מילולית: סיפור מנוקד + תיבת תשובה
      const storyEl = el('div', 'story-box pop-in', q.story);
      slotEl = el('div', 'answer-slot', '?');
      qArea.appendChild(storyEl);
      qArea.appendChild(slotEl);
      shakeEl = storyEl;
    } else {
      const eqEl = el('div', 'equation pop-in');
      for (const part of q.parts) {
        if (part === '?') {
          slotEl = el('span', 'slot', '?');
          eqEl.appendChild(slotEl);
        } else if (part === '+' || part === '−' || part === '=' || part === '×' || part === ':') {
          eqEl.appendChild(el('span', 'op', part));
        } else {
          eqEl.appendChild(el('span', '', String(part)));
        }
      }
      qArea.appendChild(eqEl);
      shakeEl = eqEl;
    }

    const pad = numpadEl({
      onDigit: d => {
        if (state.locked || input.length >= 3) return;
        sfx.tap();
        input += d;
        slotEl.textContent = input;
      },
      onDelete: () => {
        if (state.locked) return;
        input = input.slice(0, -1);
        slotEl.textContent = input || '?';
      },
      onConfirm: () => {
        if (state.locked || input === '') return;
        if (parseInt(input, 10) === q.answer) onCorrect();
        else {
          onWrong();
          shakeEl.classList.add('shake');
          setTimeout(() => {
            shakeEl.classList.remove('shake');
            input = '';
            slotEl.textContent = '?';
          }, 450);
        }
      },
    });
    qArea.appendChild(pad);
  }

  // ===== כרטיסי תשובה (אלין) =====
  function renderCards(q) {
    if (q.display) qArea.appendChild(displayEl(q.display));
    const row = el('div', 'answer-cards');
    const kind = q.cards.kind || 'count';
    const list = kind === 'emoji' ? q.cards.emojis
      : kind === 'digit' ? q.cards.digits
      : kind === 'emojiSize' ? q.cards.sizes
      : kind === 'word' ? q.cards.words
      : q.cards.counts;
    list.forEach((val, i) => {
      let card;
      if (kind === 'emoji') {
        card = el('button', 'answer-card');
        card.innerHTML = `<span class="big-emoji">${val}</span>`;
      } else if (kind === 'word') {
        card = el('button', 'answer-card word-card');
        card.innerHTML = `<span class="word-text">${val}</span>`;
      } else if (kind === 'emojiSize') {
        card = el('button', 'answer-card size-card');
        card.innerHTML = `<span class="big-emoji" style="font-size:${(val * 1.8).toFixed(2)}rem">${q.cards.emoji}</span>`;
      } else if (kind === 'digit') {
        card = el('button', 'answer-card');
        card.innerHTML = `<div class="big-digit">${val}</div>`;
      } else {
        card = answerCardEl(val, q.cards.emoji, { style: q.cards.style, showDigits: q.cards.showDigits });
      }
      card.classList.add('pop-in');
      card.addEventListener('click', () => {
        if (state.locked) return;
        if (i === q.cards.correctIndex) onCorrect();
        else { onWrong(); card.classList.add('dim'); }
      });
      row.appendChild(card);
    });
    qArea.appendChild(row);
  }

  // ===== בחירת קבוצה (איפה יש יותר/פחות, ומצאי כמות לפי ספרה) =====
  function renderPickGroup(q) {
    if (q.display) qArea.appendChild(displayEl(q.display));
    const wrap = el('div', 'pick-groups');
    q.groups.forEach((count, i) => {
      const g = groupEl(q.emoji, count);
      g.classList.add('pop-in');
      g.addEventListener('click', () => {
        if (state.locked) return;
        if (i === q.correctIndex) onCorrect();
        else { onWrong(); g.classList.add('dim'); }
      });
      wrap.appendChild(g);
    });
    qArea.appendChild(wrap);
  }

  // ===== "געי בדיוק ב-N" =====
  function renderTap(q) {
    const g = groupEl(q.emoji, q.total, { tapClass: 'tap-group' });
    g.classList.add('pop-in');
    [...g.children].forEach(obj => {
      obj.addEventListener('click', () => {
        if (state.locked) return;
        obj.classList.toggle('popped');
        sfx.pop();
      });
    });
    qArea.appendChild(g);

    const confirm = el('button', 'btn primary', '✓ סיימתי!');
    confirm.style.fontSize = '1.5rem';
    confirm.addEventListener('click', () => {
      if (state.locked) return;
      const popped = g.querySelectorAll('.popped').length;
      if (popped === q.target) onCorrect();
      else onWrong();
    });
    qArea.appendChild(confirm);
  }

  // ===== כן / לא =====
  function renderYesNo(q) {
    const wrap = el('div', 'pick-groups');
    for (const grp of q.groupsDisplay) {
      wrap.appendChild(groupEl(grp.emoji, grp.count));
    }
    qArea.appendChild(wrap);

    const row = el('div', 'answer-cards');
    const yes = el('button', 'answer-card yesno pop-in', '👍');
    const no = el('button', 'answer-card yesno pop-in', '👎');
    yes.addEventListener('click', () => {
      if (state.locked) return;
      q.answer ? onCorrect() : (onWrong(), yes.classList.add('dim'));
    });
    no.addEventListener('click', () => {
      if (state.locked) return;
      !q.answer ? onCorrect() : (onWrong(), no.classList.add('dim'));
    });
    row.append(yes, no);
    qArea.appendChild(row);
  }

  // תצוגת השאלה: רצף / צורת דוגמה / ספרה גדולה / קבוצה אחת / שתיים עם פלוס
  function displayEl(display) {
    if (display.sequence) {
      const wrap = el('div', 'seq-row');
      for (const e of display.sequence) wrap.appendChild(el('span', 'seq-item', e));
      if (display.next) wrap.appendChild(el('span', 'seq-item seq-q', '❓'));
      return wrap;
    }
    if (display.bigEmoji) {
      const w = el('div', 'sample-box');
      w.innerHTML = `<span class="big-emoji big">${display.bigEmoji}</span>`;
      return w;
    }
    if (display.bigWord) {
      const w = el('div', 'sample-box');
      w.innerHTML = `<span class="big-word">${display.bigWord}</span>`;
      return w;
    }
    if (display.passage) {
      // קטע קריאה / משפט להשלמה — הדגשת המקום החסר
      return el('div', 'story-box reading-box', display.passage.replace('___', '<span class="blank">_____</span>'));
    }
    if (display.bigDigit !== undefined) {
      const w = el('div', 'sample-box');
      w.innerHTML = `<div class="big-digit huge">${display.bigDigit}</div>`;
      return w;
    }
    if (display.plus) {
      const wrap = el('div', 'visual-add');
      display.groups.forEach((grp, i) => {
        if (i > 0) wrap.appendChild(el('span', 'plus', '+'));
        wrap.appendChild(groupEl(grp.emoji, grp.count));
      });
      return wrap;
    }
    const grp = display.groups[0];
    return groupEl(grp.emoji, grp.count, { layout: display.layout, removed: grp.removed || 0 });
  }

  // ===== משוב =====
  function onCorrect() {
    state.locked = true;
    if (!state.attemptedThis) {
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    }
    state.correct += 1;
    sfx.correct();
    toast(pick(PRAISE));
    bounce('bounce');
    setTimeout(() => {
      state.qIndex += 1;
      if (state.qIndex >= round.length) showResults();
      else renderQuestion();
    }, 950);
  }

  function onWrong() {
    if (!state.attemptedThis) {
      state.missed += 1;
      state.streak = 0;
    }
    state.attemptedThis = true;
    sfx.wrong();
    const msg = pick(RETRY);
    toast(msg);
    if (isAlin) speak(msg);
    bounce('wiggle');
  }

  function toast(text) {
    const t = el('div', 'feedback-toast', text);
    screen.appendChild(t);
    setTimeout(() => t.remove(), 900);
  }

  function bounce(cls) {
    companion.classList.remove('bounce', 'wiggle');
    void companion.offsetWidth; // אתחול האנימציה
    companion.classList.add(cls);
  }

  // ===== מסך סיום =====
  function showResults() {
    const stars = calcStars(state.missed, curId);
    const result = applyRound(ctx.state.profileId, levelId, stars, state.correct, state.bestStreak, curId);
    const updated = storage.getProfile(ctx.state.profileId);

    screen.innerHTML = '';
    const res = el('div', 'screen results');

    const spokenName = profile.ttsName || profile.name;
    if (stars === 0) {
      res.appendChild(el('div', 'big-msg', 'כמעט הצלחת! 💪'));
      res.appendChild(el('div', 'big-stars', starsHTML(0)
        .replaceAll('<span class="off">', '<span class="star off">')));
      speak(`כִּמְעַט ${spokenName}! בּוֹאִי נְנַסֶּה עוֹד פַּעַם`);
    } else {
      sfx.fanfare();
      confetti();
      res.appendChild(el('div', 'big-msg', `כל הכבוד ${profile.name}! 🎉`));
      const starRow = el('div', 'big-stars');
      for (let i = 0; i < 3; i++) {
        starRow.appendChild(el('span', 'star' + (i < stars ? '' : ' off'), '⭐'));
      }
      res.appendChild(starRow);
      const starWord = stars === 1 ? 'כּוֹכָב אֶחָד' : stars === 2 ? 'שְׁנֵי כוֹכָבִים' : 'שְׁלוֹשָׁה כוֹכָבִים';
      speak(`כָּל הַכָּבוֹד ${spokenName}! קִבַּלְתְּ ${starWord}!`);
    }

    // מטבעות שהורווחו
    if (result.coinsEarned > 0 && stars > 0) {
      const coinPop = el('div', 'reward-pop', `<span class="remoji">🪙</span> הרווחת ${result.coinsEarned} מטבעות לחנות!`);
      res.appendChild(coinPop);
    }

    // מדבקות חדשות
    for (const s of result.newStickers) {
      const popEl = el('div', 'reward-pop', `<span class="remoji">${s.emoji}</span> מדבקה חדשה: ${s.name}`);
      res.appendChild(popEl);
    }

    // הדמות גדלה!
    if (result.stageUp && updated.character) {
      // חגיגת התפתחות מלאת-מסך (אחרי שהתוצאות מוצגות)
      setTimeout(() => evolveOverlay(updated, result.stageUp), 1100);
    }

    const actions = el('div', 'actions');
    const again = el('button', 'btn primary', '🔄 עוד פעם');
    again.addEventListener('click', () => ctx.navigate('exercise', { levelId }));
    const toMap = el('button', 'btn', '🗺️ למפה');
    toMap.addEventListener('click', () => ctx.navigate('worldMap', { world: level.world }));
    actions.append(again, toMap);
    res.appendChild(actions);

    container.innerHTML = '';
    container.appendChild(res);
  }
}
