// דוח להורים: חוזקות וחולשות לפי מיומנות, דיוק וזמן לכל שלב, ציוני מבחנים וסבבים אחרונים
import { el, topbarEl } from '../ui/components.js';
import { mastery, skillStatus, strengthsAndWeaknesses, worldSummary, recommendLevel, examConfig, examId, examRecord, FINAL_EXAM, MIN_ASKED } from '../engine/rewards.js';
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { sfx } from '../audio.js';

const pct = acc => (acc === null ? '—' : `${Math.round(acc * 100)}%`);
const secs = ms => (ms === null ? '—' : `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} שנ׳`);
const dateStr = ts => new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
function durationStr(ms) {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} דק׳`;
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')} שע׳`;
}

export function parentReport(container, ctx, params = {}) {
  document.body.dataset.theme = 'home';
  const pid = params.profileId || storage.profileIds()[0];
  const profile = storage.getProfile(pid);
  const curId = profile.curriculum;
  const cur = getCurriculum(curId);
  const exam = examConfig(curId);

  const screen = el('div', 'screen');
  screen.appendChild(topbarEl('📊 דוח התקדמות', () => ctx.navigate('parent')));

  // בחירת ילדה
  const tabs = el('div', 'tabs');
  for (const id of storage.profileIds()) {
    const p = storage.getProfile(id);
    const t = el('button', `tab ${id === pid ? 'active' : ''}`, `${p.name} · ${getCurriculum(p.curriculum).meta?.grade || ''}`);
    t.addEventListener('click', () => { sfx.tap(); ctx.navigate('parentReport', { profileId: id }); });
    tabs.appendChild(t);
  }
  screen.appendChild(tabs);

  const scroll = el('div', 'report-scroll wide');

  // ===== מספרים ראשיים =====
  let asked = 0, right = 0;
  for (const l of cur.levels) { const m = mastery(profile, l.id); asked += m.asked; right += m.right; }
  const days = new Set([
    ...profile.rounds.map(r => new Date(r.date).toDateString()),
    ...Object.values(profile.exams).flatMap(e => e.history.map(h => new Date(h.date).toDateString())),
  ]).size;
  const kpis = el('div', 'kpi-row');
  kpis.innerHTML = [
    ['שאלות שנענו', asked],
    ['דיוק כולל', asked ? pct(right / asked) : '—'],
    ['זמן תרגול', durationStr(profile.totals.ms)],
    ['ימים פעילים', days],
  ].map(([l, v]) => `<div class="kpi"><span class="kpi-val">${v}</span><span class="kpi-lbl">${l}</span></div>`).join('');
  scroll.appendChild(kpis);

  if (!asked) {
    scroll.appendChild(el('div', 'report-empty', `${profile.name} עוד לא התחילה לתרגל. אחרי כמה סבבים הדוח יתמלא.`));
  }

  // ===== חוזקות וחולשות =====
  const sw = strengthsAndWeaknesses(profile, curId, 4);
  const worldOf = l => cur.worlds.find(w => w.n === l.world);
  const listHtml = (items, empty) => items.length
    ? `<ul>${items.map(x => `<li><b>${x.level.title}</b> <span class="muted">(${worldOf(x.level).icon} ${worldOf(x.level).name})</span><span class="li-pct">${pct(x.m.acc)}</span><span class="muted"> · ${x.m.asked} שאלות</span></li>`).join('')}</ul>`
    : `<div class="muted">${empty}</div>`;
  const swWrap = el('div', 'sw-row');
  swWrap.innerHTML = `
    <div class="sw-card strong"><div class="sw-title">💪 חוזקות</div>${listHtml(sw.strengths, sw.rated ? 'עדיין אין שלבים עם דיוק של 85% ומעלה' : `צריך לפחות ${MIN_ASKED} שאלות בשלב כדי להכריע`)}</div>
    <div class="sw-card weak"><div class="sw-title">⚠️ לתרגול</div>${listHtml(sw.weaknesses, sw.rated ? 'אין חולשות בולטות 🎉' : `צריך לפחות ${MIN_ASKED} שאלות בשלב כדי להכריע`)}</div>`;
  scroll.appendChild(swWrap);

  const rec = recommendLevel(profile, curId);
  if (rec && asked) {
    scroll.appendChild(el('div', 'rec-line', `🎯 <b>ההמלצה הבאה במשחק:</b> ${rec.level.title} — ${rec.text}`));
  }

  // ===== לפי עולם ושלב =====
  for (const w of cur.worlds) {
    const ws = worldSummary(profile, curId, w.n);
    const section = el('section', 'rep-world');
    const examRec = exam ? examRecord(profile, examId(w.n)) : null;
    const head = el('div', 'rep-world-head');
    head.innerHTML = `<span class="ws-icon">${w.icon}</span><span class="ws-name">${w.name}</span>
      <span class="ws-meta">${ws.asked ? `${pct(ws.acc)} דיוק · ` : ''}⭐ ${ws.stars}/${ws.maxStars}${exam ? ` · 📝 ${examRec ? `${examRec.best}${examRec.best >= exam.pass ? ' 🎓' : ''}` : '—'}` : ''}</span>`;
    section.appendChild(head);

    if (!ws.asked) {
      section.appendChild(el('div', 'muted rep-note', 'עוד לא תורגל'));
      scroll.appendChild(section);
      continue;
    }
    ws.levels.forEach((l, i) => {
      const m = mastery(profile, l.id);
      const st = skillStatus(m);
      const stars = profile.levels[l.id]?.stars || 0;
      const row = el('div', `skill-row ${st.cls}`);
      row.innerHTML = `
        <div class="sk-head"><span class="sk-title">${i + 1}. ${l.title}</span><span class="sk-status ${st.cls}">${st.emoji} ${st.label}</span></div>
        <div class="sk-bar" role="img" aria-label="דיוק ${pct(m.acc)}"><div class="sk-fill" style="width:${m.acc === null ? 0 : Math.round(m.acc * 100)}%"></div></div>
        <div class="sk-meta">${m.asked
          ? `${pct(m.acc)} דיוק · ${m.asked} שאלות (${m.practice} תרגול${m.exam ? `, ${m.exam} במבחן` : ''}) · ⏱ ${secs(m.avgMs)} לשאלה`
          : 'עוד לא תורגל'} · ⭐ ${stars}</div>`;
      section.appendChild(row);
    });
    scroll.appendChild(section);
  }

  // ===== מבחן מסכם =====
  const finalRec = exam ? examRecord(profile, FINAL_EXAM) : null;
  if (finalRec) {
    scroll.appendChild(el('div', 'rec-line', `🏆 <b>המבחן הגדול:</b> הציון הטוב ביותר ${finalRec.best} · ${finalRec.attempts} ניסיונות`));
  }

  // ===== סבבים אחרונים =====
  const recent = [...profile.rounds].slice(-8).reverse();
  if (recent.length) {
    const section = el('section', 'rep-world');
    section.appendChild(el('div', 'rep-world-head', '<span class="ws-icon">🕒</span><span class="ws-name">סבבים אחרונים</span>'));
    for (const r of recent) {
      const l = cur.levels.find(x => x.id === r.levelId);
      const firstTry = r.total ? `${r.total - r.missed}/${r.total} בניסיון ראשון` : '';
      section.appendChild(el('div', 'recent-row',
        `<span class="rr-date">${dateStr(r.date)}</span><span class="rr-title">${l ? l.title : r.levelId}</span><span class="rr-meta">${firstTry}</span><span class="rr-stars">${'⭐'.repeat(r.stars) || '—'}</span>`));
    }
    scroll.appendChild(section);
  }

  scroll.appendChild(el('div', 'report-hint',
    `הדיוק נמדד לפי הניסיון הראשון בכל שאלה, בתרגול ובמבחנים. "חוזק" = 90% ומעלה עם 12+ שאלות, "לתרגול" = מתחת ל-75%. הזמן הוא ממוצע עד התשובה הראשונה.`));

  screen.appendChild(scroll);
  container.appendChild(screen);
}
