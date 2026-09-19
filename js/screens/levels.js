// רשימת השלבים: קוביות לפי עולמות, תחנת מבחן בסוף כל עולם, ותרגול מומלץ לפי החולשות
import { el, starsHTML, topbarEl } from '../ui/components.js';
import { isLevelUnlocked, isWorldUnlocked, examConfig, examId, examUnlocked, examRecord, recommendLevel } from '../engine/rewards.js';
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { sfx, speak } from '../audio.js';

export function levels(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = profile.curriculum;
  const cur = getCurriculum(curId);
  const exam = examConfig(curId);

  const screen = el('div', 'screen levels-screen');
  const badge = el('div', 'total-badge', `⭐ ${profile.totals.stars}`);
  const title = cur.meta?.grade ? `${profile.name} · ${cur.meta.grade}` : profile.name;
  screen.appendChild(topbarEl(title, () => ctx.navigate('profileSelect'), badge));

  const scroll = el('div', 'levels-scroll');

  // תרגול מומלץ — לפי הנתונים: השלב הפתוח החלש ביותר, או השלב הבא בדרך
  const rec = recommendLevel(profile, curId);
  if (rec) {
    const w = cur.worlds.find(x => x.n === rec.level.world);
    const card = el('button', `rec-card ${rec.reason} pop-in`);
    card.innerHTML = `<span class="rec-icon">🎯</span>
      <span class="rec-main"><span class="rec-title">תרגול מומלץ: ${rec.level.title}</span>
      <span class="rec-sub">${w.icon} ${w.name} · ${rec.text}</span></span>
      <span class="rec-go">▶</span>`;
    card.addEventListener('click', () => { sfx.tap(); speak(rec.level.title); ctx.navigate('exercise', { levelId: rec.level.id }); });
    scroll.appendChild(card);
  }

  if (exam) {
    const row = el('div', 'levels-actions');
    const reportBtn = el('button', 'btn', '📋 התעודה שלי');
    reportBtn.addEventListener('click', () => ctx.navigate('report', { fromWorld: params.world }));
    row.appendChild(reportBtn);
    scroll.appendChild(row);
  }

  const currentWorld = params.world || defaultWorld(profile, cur, curId);

  for (const w of cur.worlds) {
    const wl = cur.levels.filter(l => l.world === w.n);
    const open = isWorldUnlocked(profile, w.n, curId);
    const section = el('section', `world-section ${open ? '' : 'locked'}`);
    section.dataset.world = w.n;
    const stars = wl.reduce((s, l) => s + (profile.levels[l.id]?.stars || 0), 0);
    const passed = exam && (examRecord(profile, examId(w.n))?.best || 0) >= exam.pass;

    const head = el('div', 'world-head');
    head.innerHTML = `<span class="ws-icon">${w.icon}</span><span class="ws-name">${w.name}</span>
      <span class="ws-meta">${open ? `⭐ ${stars}/${wl.length * 3}${passed ? ' · 🎓' : ''}` : '🔒'}</span>`;
    section.appendChild(head);

    if (!open) {
      const prev = cur.worlds.find(x => x.n === w.n - 1);
      section.appendChild(el('div', 'world-hint',
        exam ? `נפתח אחרי שעוברים את המבחן של ${prev.name}` : `נפתח אחרי שמסיימים את ${prev.name}`));
      scroll.appendChild(section);
      continue;
    }

    const grid = el('div', 'level-grid');
    wl.forEach((level, i) => {
      const unlocked = isLevelUnlocked(profile, level, curId);
      const lstars = profile.levels[level.id]?.stars || 0;
      const tile = el('button', `level-tile ${unlocked ? '' : 'locked'} ${lstars === 3 ? 'done' : ''}`);
      tile.innerHTML = `<span class="lt-num">${i + 1}</span>
        <span class="lt-title">${level.title}</span>
        <span class="lt-stars">${unlocked ? starsHTML(lstars) : '🔒'}</span>`;
      tile.addEventListener('click', () => {
        if (!unlocked) { sfx.wrong(); speak('קֹדֶם מְסַיְּמִים אֶת הַשָּׁלָב הַקּוֹדֵם'); return; }
        sfx.tap();
        speak(level.title);
        ctx.navigate('exercise', { levelId: level.id });
      });
      grid.appendChild(tile);
    });

    // תחנת המבחן — נפתחת אחרי שכל שלבי העולם הושלמו
    if (exam) {
      const openExam = examUnlocked(profile, w.n, curId);
      const rec = examRecord(profile, examId(w.n));
      const tile = el('button', `level-tile exam ${openExam ? '' : 'locked'} ${passed ? 'passed' : ''}`);
      const status = !openExam ? '🔒 סיימי את כל השלבים'
        : passed ? `🎓 הציון הטוב ביותר: ${rec.best}`
        : rec ? `הציון הטוב ביותר: ${rec.best} · צריך ${exam.pass}`
        : `${exam.questions} שאלות · ציון ${exam.pass} עובר`;
      tile.innerHTML = `<span class="lt-num">${passed ? '🎓' : '📝'}</span>
        <span class="lt-title">מבחן: ${w.name}</span>
        <span class="lt-stars">${status}</span>`;
      tile.addEventListener('click', () => {
        if (!openExam) { sfx.wrong(); speak('קֹדֶם מְסַיְּמִים אֶת כָּל הַשְּׁלַבִּים בָּעוֹלָם, וְאָז הַמִּבְחָן נִפְתָּח'); return; }
        sfx.tap();
        ctx.navigate('exercise', { exam: w.n });
      });
      grid.appendChild(tile);
    }
    section.appendChild(grid);
    scroll.appendChild(section);
  }

  screen.appendChild(scroll);
  container.appendChild(screen);

  // גלילה לעולם הנוכחי
  if (currentWorld > 1) {
    requestAnimationFrame(() => {
      const target = scroll.querySelector(`[data-world="${currentWorld}"]`);
      if (target) scroll.scrollTop = target.offsetTop - scroll.offsetTop - 8;
    });
  }
}

// העולם של השלב הפתוח האחרון
function defaultWorld(profile, cur, curId) {
  let world = 1;
  for (const level of cur.levels) {
    if (isLevelUnlocked(profile, level, curId)) world = level.world;
    else break;
  }
  return world;
}
