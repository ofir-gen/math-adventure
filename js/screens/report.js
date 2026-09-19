// התעודה: ציוני המבחנים של כל עולם, סטטוס מעבר, והמבחן הגדול המסכם
import { el, topbarEl } from '../ui/components.js';
import { examConfig, examId, examUnlocked, examRecord, FINAL_EXAM, finalExamUnlocked, scoreBand } from '../engine/rewards.js';
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { sfx, speak } from '../audio.js';

export function report(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  const profile = storage.getProfile(ctx.state.profileId);
  const curId = profile.curriculum;
  const cur = getCurriculum(curId);
  const cfg = examConfig(curId);

  const screen = el('div', 'screen');
  screen.appendChild(topbarEl(`📋 התעודה של ${profile.name}`, () => ctx.navigate('levels', { world: params.fromWorld })));

  const scroll = el('div', 'report-scroll');

  // סיכום: כמה מבחנים עברו + ממוצע הציונים הטובים ביותר
  const records = cur.worlds.map(w => examRecord(profile, examId(w.n))).filter(Boolean);
  const passed = cur.worlds.filter(w => (examRecord(profile, examId(w.n))?.best || 0) >= cfg.pass).length;
  const avg = records.length ? Math.round(records.reduce((s, r) => s + r.best, 0) / records.length) : null;
  const head = el('div', 'report-head');
  head.innerHTML = `
    <div class="report-stat"><span class="rs-num">${passed}<small>/${cur.worlds.length}</small></span><span class="rs-lbl">מבחנים שעברת</span></div>
    <div class="report-stat"><span class="rs-num">${avg === null ? '—' : avg}</span><span class="rs-lbl">ממוצע הציונים</span></div>
    <div class="report-stat"><span class="rs-num">${records.reduce((s, r) => s + r.attempts, 0)}</span><span class="rs-lbl">מבחנים שנעשו</span></div>`;
  scroll.appendChild(head);

  // שורה לכל עולם
  for (const w of cur.worlds) {
    const rec = examRecord(profile, examId(w.n));
    const open = examUnlocked(profile, w.n, curId);
    const isPassed = (rec?.best || 0) >= cfg.pass;
    const state = isPassed ? 'passed' : rec ? 'tried' : open ? 'ready' : 'locked';
    const row = el('button', `report-row ${state}`);
    let sub;
    if (isPassed) sub = `🎓 עברת · ${rec.attempts === 1 ? 'בניסיון הראשון' : `${rec.attempts} ניסיונות`}`;
    else if (rec) sub = `הציון הטוב ביותר ${rec.best} · צריך ${cfg.pass} כדי לעבור`;
    else if (open) sub = 'מוכנה למבחן! לחצי כדי להתחיל ✏️';
    else sub = 'סיימי את כל שלבי העולם כדי לפתוח';
    const scoreHtml = rec
      ? `<span class="r-score ${scoreBand(rec.best).cls}">${rec.best}</span>`
      : `<span class="r-score none">${open ? '📝' : '🔒'}</span>`;
    row.innerHTML = `<span class="r-icon">${w.icon}</span>
      <span class="r-main"><span class="r-name">${w.name}</span><span class="r-sub">${sub}</span></span>${scoreHtml}`;
    row.addEventListener('click', () => {
      if (!open) { sfx.wrong(); speak('קֹדֶם מְסַיְּמִים אֶת כָּל הַשְּׁלַבִּים בָּעוֹלָם'); return; }
      sfx.tap();
      ctx.navigate('exercise', { exam: w.n });
    });
    scroll.appendChild(row);
  }

  // המבחן הגדול — אחרי שכל מבחני העולמות עברו
  const finalOpen = finalExamUnlocked(profile, curId);
  const finalRec = examRecord(profile, FINAL_EXAM);
  const finalCard = el('button', `final-exam ${finalOpen ? '' : 'locked'} ${(finalRec?.best || 0) >= cfg.pass ? 'passed' : ''}`);
  finalCard.innerHTML = `<span class="fe-icon">🏆</span>
    <span class="fe-main"><span class="fe-name">המבחן הגדול</span>
    <span class="fe-sub">${finalOpen
      ? (finalRec ? `הציון הטוב ביותר: ${finalRec.best} · ${cfg.finalQuestions} שאלות מכל העולמות` : `${cfg.finalQuestions} שאלות מכל העולמות — מוכנה?`)
      : 'נפתח אחרי שעוברים את כל מבחני העולמות'}</span></span>
    <span class="fe-score">${finalRec ? finalRec.best : finalOpen ? '✏️' : '🔒'}</span>`;
  finalCard.addEventListener('click', () => {
    if (!finalOpen) { sfx.wrong(); speak('הַמִּבְחָן הַגָּדוֹל נִפְתָּח אַחֲרֵי שֶׁעוֹבְרִים אֶת כָּל מִבְחֲנֵי הָעוֹלָמוֹת'); return; }
    sfx.tap();
    ctx.navigate('exercise', { exam: 'final' });
  });
  scroll.appendChild(finalCard);

  scroll.appendChild(el('div', 'report-hint', `ציון ${cfg.pass} ומעלה עובר. אפשר לחזור על כל מבחן — נשמר הציון הטוב ביותר.`));

  screen.appendChild(scroll);
  container.appendChild(screen);
}
