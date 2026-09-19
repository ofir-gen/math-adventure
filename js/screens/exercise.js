// מסך התרגיל והמבחן: סבב שאלות, משוב, ומסך סיום עם כוכבים/ציון ותגמולים
// params: { levelId } לתרגול, או { exam: <מספר עולם> | 'final' } למבחן
import { el, groupEl, answerCardEl, numpadEl, starsHTML } from '../ui/components.js';
import { profileCharSVG } from '../ui/character-svg.js';
import { clockSVG, fractionSVG, fractionHTML, polygonSVG, shapeSVG, gridSVG } from '../ui/math-svg.js';
import { confetti } from '../ui/confetti.js';
import { generateRound, generateExam, answerText } from '../engine/generator.js';
import { calcStars, applyRound, applyExam, characterStage, examConfig, examId, FINAL_EXAM, scoreBand } from '../engine/rewards.js';
import { evolveOverlay } from '../ui/celebrate.js';
import { getCurriculum, levelById, worldLevels } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { speak, sfx } from '../audio.js';

// מנוקד — גם מוצג וגם מוקרא, והניקוד גורם ל-TTS לבטא נכון
const PRAISE = ['כָּל הַכָּבוֹד!', 'מְעוּלֶה!', 'יוֹפִי!', 'נָכוֹן מְאוֹד!', 'אֵיזוֹ אַלּוּפָה!'];
const RETRY = ['נַסִּי שׁוּב!', 'כִּמְעַט!', 'עוֹד נִסָּיוֹן קָטָן!'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmtMs = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

export function exercise(container, ctx, params) {
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = profile.curriculum;
  const cur = getCurriculum(curId);
  const isAlin = !!cur.meta?.lenient; // הקראה אוטומטית בגיל הגן

  // ===== הגדרת הסבב: תרגול או מבחן =====
  const isExam = params.exam !== undefined;
  const examCfg = isExam ? examConfig(curId) : null;
  const isFinal = params.exam === 'final';
  let level = null, world, round, examTitle = '', mapWorld, currentExamId;
  if (isExam) {
    const levels = isFinal ? cur.levels : worldLevels(curId, params.exam);
    const count = isFinal ? examCfg.finalQuestions : examCfg.questions;
    round = generateExam(levels, count);
    world = isFinal ? cur.worlds[cur.worlds.length - 1] : cur.worlds.find(w => w.n === params.exam);
    examTitle = isFinal ? 'המבחן הגדול 🏆' : `מבחן: ${world.name}`;
    mapWorld = isFinal ? cur.worlds.length : params.exam;
    currentExamId = isFinal ? FINAL_EXAM : examId(params.exam);
  } else {
    level = levelById(curId, params.levelId);
    world = cur.worlds.find(w => w.n === level.world);
    round = generateRound(level);
    mapWorld = level.world;
  }
  document.body.dataset.theme = world.theme;

  const state = {
    qIndex: 0,
    missed: 0,        // שאלות שטעו בהן בניסיון ראשון
    correct: 0,
    streak: 0,
    bestStreak: 0,
    attemptedThis: false,
    locked: false,    // נעילת קלט בזמן משוב
    startTime: 0,
    timer: null,
  };

  const screen = el('div', 'screen ex-screen');
  let qArea, dots, companion, timerEl;
  container.appendChild(screen);
  if (isExam) renderExamIntro();
  else startRound();

  // ===== פתיח המבחן =====
  function renderExamIntro() {
    const intro = el('div', 'exam-intro pop-in');
    intro.innerHTML = `
      <div class="exam-title">📝 ${examTitle}</div>
      <ul class="exam-rules">
        <li>✏️ ${round.length} שאלות מכל מה שלמדת ${isFinal ? 'בכל העולמות' : 'בעולם הזה'}</li>
        <li>☝️ תשובה אחת לכל שאלה — בלי ניסיון נוסף</li>
        <li>🎓 ציון ${examCfg.pass} ומעלה = עוברים${isFinal ? '!' : ' ופותחים את העולם הבא!'}</li>
        <li>⏱️ אין הגבלת זמן — חשבי בנחת</li>
      </ul>`;
    const actions = el('div', 'actions');
    const start = el('button', 'btn primary', 'מתחילים! ✏️');
    start.style.fontSize = '1.5rem';
    start.addEventListener('click', () => { sfx.tap(); startRound(); });
    const back = el('button', 'btn', '🗺️ למפה');
    back.addEventListener('click', () => ctx.navigate('worldMap', { world: mapWorld }));
    actions.append(start, back);
    intro.appendChild(actions);
    screen.appendChild(intro);
    speak(`${isFinal ? 'הַמִּבְחָן הַגָּדוֹל' : 'מִבְחָן'}! ${round.length} שְׁאֵלוֹת, תְּשׁוּבָה אַחַת לְכָל שְׁאֵלָה. בְּהַצְלָחָה!`);
  }

  // ===== בניית מסך השאלות =====
  function startRound() {
    screen.innerHTML = '';
    // כותרת: יציאה + נקודות התקדמות (+ שעון עצר במבחן)
    const bar = el('div', 'topbar');
    const quitBtn = el('button', 'btn round', '✕');
    quitBtn.addEventListener('click', () => {
      if (isExam && state.qIndex < round.length && !confirm('לצאת מהמבחן? הציון לא יישמר.')) return;
      stopTimer();
      ctx.navigate('worldMap', { world: mapWorld });
    });
    dots = el('div', 'progress-dots');
    for (let i = 0; i < round.length; i++) dots.appendChild(el('span', 'dot'));
    const right = isExam ? el('div', 'exam-timer', '0:00') : el('div', '', '');
    right.style.minWidth = '52px';
    if (isExam) timerEl = right;
    bar.append(quitBtn, dots, right);
    screen.appendChild(bar);

    qArea = el('div', 'ex-question');
    screen.appendChild(qArea);

    // דמות מלווה בפינה
    companion = el('div', 'companion');
    if (profile.character) {
      companion.innerHTML = profileCharSVG(profile, characterStage(profile.totals.stars), 84);
    }
    screen.appendChild(companion);

    state.startTime = Date.now();
    if (isExam) {
      state.timer = setInterval(() => {
        if (!document.body.contains(timerEl)) return stopTimer();
        timerEl.textContent = fmtMs(Date.now() - state.startTime);
      }, 1000);
    }
    renderQuestion();
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

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

  // ===== מצב משוואה / סיפור / תצוגה + לוח מספרים (נויה) =====
  // תומך בכמה חלונות תשובה (חילוק עם שארית): מקישים על חלון כדי לעבור אליו, ✓ עובר לחלון הריק הבא
  function renderKeypad(q) {
    const slots = [];
    let shakeEl;
    if (q.parts) {
      const eqEl = el('div', 'equation pop-in');
      if (q.parts.length > 7) eqEl.classList.add('long');
      for (const part of q.parts) {
        if (part === '?') {
          const s = el('span', 'slot', '?');
          eqEl.appendChild(s);
          slots.push(s);
        } else if (part === '+' || part === '−' || part === '=' || part === '×' || part === ':') {
          eqEl.appendChild(el('span', 'op', part));
        } else if (part === '(' || part === ')') {
          eqEl.appendChild(el('span', 'paren', part));
        } else if (typeof part === 'object' && part.text) {
          eqEl.appendChild(el('span', 'label', part.text));
        } else if (typeof part === 'object' && part.frac) {
          eqEl.appendChild(el('span', '', fractionHTML(part.frac.n, part.frac.d)));
        } else {
          eqEl.appendChild(el('span', '', String(part)));
        }
      }
      qArea.appendChild(eqEl);
      shakeEl = eqEl;
    } else {
      // בעיה מילולית / תצוגה (מספר גדול, צורה, שעון) + תיבת תשובה
      if (q.story) {
        const storyEl = el('div', 'story-box pop-in', q.story);
        qArea.appendChild(storyEl);
        shakeEl = storyEl;
      }
      if (q.display) {
        const d = displayEl(q.display);
        d.classList.add('pop-in');
        qArea.appendChild(d);
        shakeEl = shakeEl || d;
      }
      const slotEl = el('div', 'answer-slot', '?');
      qArea.appendChild(slotEl);
      slots.push(slotEl);
      shakeEl = shakeEl || slotEl;
    }

    const inputs = slots.map(() => '');
    let active = 0;
    const setActive = i => {
      active = i;
      slots.forEach((s, j) => s.classList.toggle('active', slots.length > 1 && j === i));
    };
    const render = () => slots.forEach((s, i) => { s.textContent = inputs[i] || '?'; });
    slots.forEach((s, i) => s.addEventListener('click', () => { if (!state.locked) { setActive(i); sfx.tap(); } }));
    setActive(0);

    const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    const pad = numpadEl({
      onDigit: d => {
        if (state.locked || inputs[active].length >= 4) return;
        sfx.tap();
        inputs[active] += d;
        render();
      },
      onDelete: () => {
        if (state.locked) return;
        inputs[active] = inputs[active].slice(0, -1);
        render();
      },
      onConfirm: () => {
        if (state.locked || inputs[active] === '') return;
        const empty = inputs.findIndex(x => x === '');
        if (empty >= 0) { setActive(empty); sfx.tap(); return; } // יש עוד חלון למלא
        const ok = answers.every((a, i) => parseInt(inputs[i], 10) === a);
        if (ok) { onCorrect(); return; }
        onWrong();
        if (isExam) {
          // במבחן: חושפים את התשובה הנכונה
          slots.forEach((s, i) => { s.textContent = String(answers[i]); s.classList.add('reveal'); });
          return;
        }
        shakeEl.classList.add('shake');
        setTimeout(() => {
          shakeEl.classList.remove('shake');
          inputs.fill('');
          render();
          setActive(0);
        }, 450);
      },
    });
    qArea.appendChild(pad);
  }

  // ===== כרטיסי תשובה =====
  function renderCards(q) {
    if (q.display) qArea.appendChild(displayEl(q.display));
    const row = el('div', 'answer-cards');
    const kind = q.cards.kind || 'count';
    const list = kind === 'emoji' ? q.cards.emojis
      : kind === 'digit' ? q.cards.digits
      : kind === 'emojiSize' ? q.cards.sizes
      : kind === 'word' ? q.cards.words
      : kind === 'sign' ? q.cards.signs
      : kind === 'time' ? q.cards.times
      : kind === 'frac' ? q.cards.fracs
      : q.cards.counts;
    const cardEls = [];
    list.forEach((val, i) => {
      let card;
      if (kind === 'emoji') {
        card = el('button', 'answer-card');
        card.innerHTML = `<span class="big-emoji">${val}</span>`;
      } else if (kind === 'word') {
        card = el('button', 'answer-card word-card');
        card.innerHTML = `<span class="word-text">${val}</span>`;
      } else if (kind === 'sign') {
        card = el('button', 'answer-card sign-card');
        card.innerHTML = `<span class="sign-text">${val}</span>`;
      } else if (kind === 'time') {
        card = el('button', 'answer-card time-card');
        card.innerHTML = `<span class="time-text">${val}</span>`;
      } else if (kind === 'frac') {
        card = el('button', 'answer-card frac-card');
        card.innerHTML = fractionHTML(val.n, val.d);
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
        else {
          onWrong();
          card.classList.add('dim');
          if (isExam) cardEls[q.cards.correctIndex].classList.add('reveal');
        }
      });
      cardEls.push(card);
      row.appendChild(card);
    });
    qArea.appendChild(row);
  }

  // ===== בחירת קבוצה (איפה יש יותר/פחות, ומצאי כמות לפי ספרה) =====
  function renderPickGroup(q) {
    if (q.display) qArea.appendChild(displayEl(q.display));
    const wrap = el('div', 'pick-groups');
    const groupEls = [];
    q.groups.forEach((count, i) => {
      const g = groupEl(q.emoji, count);
      g.classList.add('pop-in');
      g.addEventListener('click', () => {
        if (state.locked) return;
        if (i === q.correctIndex) onCorrect();
        else {
          onWrong();
          g.classList.add('dim');
          if (isExam) groupEls[q.correctIndex].classList.add('reveal');
        }
      });
      groupEls.push(g);
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

  // תצוגת השאלה: מספר גדול / השוואה / רצף / שעון / שבר / צורה / רשת / קבוצות
  function displayEl(display) {
    if (display.compare) {
      const [a, b] = display.compare;
      return el('div', 'compare-box', `<span>${a}</span><span class="cmp-slot">?</span><span>${b}</span>`);
    }
    if (display.sequence) {
      const wrap = el('div', 'seq-row' + (display.ltr ? ' ltr' : ''));
      for (const e of display.sequence) wrap.appendChild(el('span', 'seq-item', e));
      if (display.next) wrap.appendChild(el('span', 'seq-item seq-q', '❓'));
      return wrap;
    }
    if (display.clocks) {
      const wrap = el('div', 'clocks-row');
      display.clocks.forEach((c, i) => {
        if (i) wrap.appendChild(el('span', 'clocks-sep', 'עד'));
        const box = el('div', 'sample-box clock-box');
        box.innerHTML = clockSVG(c.h, c.m, 150) + `<div class="digital">${c.h}:${String(c.m).padStart(2, '0')}</div>`;
        wrap.appendChild(box);
      });
      return wrap;
    }
    if (display.clock) {
      const box = el('div', 'sample-box clock-box');
      box.innerHTML = clockSVG(display.clock.h, display.clock.m, 200) + (display.digital ? `<div class="digital">${display.digital}</div>` : '');
      return box;
    }
    if (display.fraction) {
      const f = display.fraction;
      return el('div', 'sample-box', fractionSVG(f.n, f.d, f.shape, 170));
    }
    if (display.fracOf) {
      const f = display.fracOf;
      return el('div', 'sample-box frac-of', `${fractionHTML(f.n, f.d)}<span class="of-word">של</span><span class="big-digit huge">${f.of}</span>`);
    }
    if (display.polygon) return el('div', 'sample-box', polygonSVG(display.polygon, 170));
    if (display.shape) return el('div', 'sample-box', shapeSVG(display.shape.kind, display.shape.sides, 240));
    if (display.grid) return el('div', 'sample-box', gridSVG(display.grid.w, display.grid.h, 250));
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
    toast(isExam ? '✓' : pick(PRAISE));
    bounce('bounce');
    setTimeout(advance, isExam ? 650 : 950);
  }

  function onWrong() {
    if (!state.attemptedThis) {
      state.missed += 1;
      state.streak = 0;
    }
    state.attemptedThis = true;
    sfx.wrong();
    if (isExam) {
      // במבחן אין ניסיון נוסף — מראים את התשובה הנכונה וממשיכים
      state.locked = true;
      toast(`✗ התשובה: ${answerText(round[state.qIndex])}`, 'exam-wrong');
      bounce('wiggle');
      setTimeout(advance, 1700);
      return;
    }
    const msg = pick(RETRY);
    toast(msg);
    if (isAlin) speak(msg);
    bounce('wiggle');
  }

  function advance() {
    state.qIndex += 1;
    if (state.qIndex >= round.length) (isExam ? showExamResults : showResults)();
    else renderQuestion();
  }

  function toast(text, cls = '') {
    const t = el('div', `feedback-toast ${cls}`, text);
    screen.appendChild(t);
    setTimeout(() => t.remove(), cls ? 1650 : 900);
  }

  function bounce(cls) {
    companion.classList.remove('bounce', 'wiggle');
    void companion.offsetWidth; // אתחול האנימציה
    companion.classList.add(cls);
  }

  // ===== מסך סיום — תרגול =====
  function showResults() {
    const stars = calcStars(state.missed, curId);
    const result = applyRound(ctx.state.profileId, level.id, stars, state.correct, state.bestStreak, curId);
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
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">🪙</span> הרווחת ${result.coinsEarned} מטבעות לחנות!`));
    }

    // מדבקות חדשות
    for (const s of result.newStickers) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">${s.emoji}</span> מדבקה חדשה: ${s.name}`));
    }

    // כל שלבי העולם הושלמו — המבחן מחכה
    if (examConfig(curId) && worldLevels(curId, level.world).every(l => (updated.levels[l.id]?.stars || 0) > 0)
      && !(updated.exams?.[examId(level.world)]?.best >= examConfig(curId).pass)) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">📝</span> סיימת את כל השלבים — המבחן של העולם מחכה לך!`));
    }

    // הדמות גדלה!
    if (result.stageUp && updated.character) {
      setTimeout(() => evolveOverlay(updated, result.stageUp), 1100);
    }

    const actions = el('div', 'actions');
    const again = el('button', 'btn primary', '🔄 עוד פעם');
    again.addEventListener('click', () => ctx.navigate('exercise', { levelId: level.id }));
    const toMap = el('button', 'btn', '🗺️ למפה');
    toMap.addEventListener('click', () => ctx.navigate('worldMap', { world: level.world }));
    actions.append(again, toMap);
    res.appendChild(actions);

    container.innerHTML = '';
    container.appendChild(res);
  }

  // ===== מסך סיום — מבחן =====
  function showExamResults() {
    stopTimer();
    const ms = Date.now() - state.startTime;
    const result = applyExam(ctx.state.profileId, currentExamId, { correct: state.correct, total: round.length, ms }, curId);
    const band = scoreBand(result.score);
    const spokenName = profile.ttsName || profile.name;

    screen.innerHTML = '';
    const res = el('div', 'screen results exam-results');
    res.appendChild(el('div', 'big-msg', `${band.emoji} ${band.label}`));

    const ring = el('div', `score-ring ${band.cls} pop-in`);
    ring.innerHTML = `<span class="score-num">${result.score}</span><span class="score-lbl">ציון</span>`;
    res.appendChild(ring);

    res.appendChild(el('div', 'exam-summary',
      `ענית נכון על <b>${state.correct}</b> מתוך <b>${round.length}</b> שאלות &nbsp;·&nbsp; ⏱️ ${fmtMs(ms)}`));

    if (result.passed) {
      sfx.fanfare();
      confetti();
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">🎓</span> ${isFinal ? 'עברת את המבחן הגדול! את אלופת החשבון!' : 'עברת את המבחן! העולם הבא נפתח'}`));
      speak(`כָּל הַכָּבוֹד ${spokenName}! קִבַּלְתְּ ${result.score} וְעָבַרְתְּ אֶת הַמִּבְחָן!`);
    } else {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">💪</span> צריך ${examConfig(curId).pass} כדי לעבור. תרגלי עוד קצת ונסי שוב!`));
      speak(`קִבַּלְתְּ ${result.score}. עוֹד קְצָת תִּרְגּוּל וְתַעַבְרִי בְּקַלּוּת!`);
    }
    if (result.isBest && result.attempts > 1 && result.score > 0) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">🥇</span> שיא חדש!`));
    }
    if (result.coinsEarned > 0) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">🪙</span> הרווחת ${result.coinsEarned} מטבעות!`));
    }
    for (const s of result.newStickers) {
      res.appendChild(el('div', 'reward-pop', `<span class="remoji">${s.emoji}</span> מדבקה חדשה: ${s.name}`));
    }

    const actions = el('div', 'actions');
    const again = el('button', 'btn primary', '🔄 שוב');
    again.addEventListener('click', () => ctx.navigate('exercise', { exam: params.exam }));
    const toReport = el('button', 'btn', '📋 תעודה');
    toReport.addEventListener('click', () => ctx.navigate('report', { fromWorld: mapWorld }));
    const toMap = el('button', 'btn', '🗺️ למפה');
    toMap.addEventListener('click', () => ctx.navigate('worldMap', { world: mapWorld }));
    actions.append(again, toReport, toMap);
    res.appendChild(actions);

    container.innerHTML = '';
    container.appendChild(res);
  }
}
