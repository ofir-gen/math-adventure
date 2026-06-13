// אזור הורים: גיבוי והעברת התקדמות בין מכשירים (ייצוא/ייבוא קוד)
import { el, topbarEl } from '../ui/components.js';
import { getCurriculum } from '../curriculum/index.js';
import * as storage from '../storage.js';
import { sfx, testVoice } from '../audio.js';

// קידוד/פענוח תומך-עברית (UTF-8) לקוד נקי להעתקה
const encode = str => btoa(unescape(encodeURIComponent(str)));
const decode = code => decodeURIComponent(escape(atob(code.trim())));

export function parent(container, ctx) {
  document.body.dataset.theme = 'home';
  delete document.body.dataset.bg;
  const screen = el('div', 'screen');
  screen.appendChild(topbarEl('👨‍👩‍👧 הורים — גיבוי והעברה', () => ctx.navigate('profileSelect')));

  const scroll = el('div', 'parent-scroll');

  // סיכום התקדמות נוכחית
  scroll.appendChild(el('div', 'section-title', 'ההתקדמות במכשיר הזה'));
  const summary = el('div', 'parent-summary');
  for (const id of ['noya', 'alin']) {
    const p = storage.getProfile(id);
    const total = getCurriculum(p.curriculum).levels.length;
    const done = Object.values(p.levels).filter(l => l.stars > 0).length;
    summary.appendChild(el('div', 'psum-row',
      `<b>${p.name}</b> — ⭐ ${p.totals.stars} כוכבים · ${done}/${total} שלבים · 🪙 ${p.coins}`));
  }
  scroll.appendChild(summary);

  // ===== בדיקת קול עברי =====
  scroll.appendChild(el('div', 'section-title', '🔊 בדיקת קול'));
  scroll.appendChild(el('div', 'parent-hint',
    'חשוב במיוחד לאלין — היא שומעת את ההוראות. לחצו לבדיקה: אם לא שומעים עברית, צריך להתקין קול עברי במכשיר.'));
  const voiceBtn = el('button', 'btn primary', '🔊 בדוק קול עברי');
  const voiceMsg = el('div', 'parent-msg');
  voiceBtn.addEventListener('click', () => {
    const res = testVoice();
    if (!res.supported) {
      voiceMsg.textContent = '✗ הדפדפן הזה לא תומך בהקראה.';
      voiceMsg.className = 'parent-msg err';
    } else if (res.hebrew) {
      voiceMsg.textContent = '✓ נמצא קול עברי — אמורים לשמוע משפט עכשיו.';
      voiceMsg.className = 'parent-msg ok';
    } else {
      voiceMsg.innerHTML = '⚠️ לא נמצא קול עברי במכשיר. כך מתקינים בסמסונג:<br>'
        + 'הגדרות ← ניהול כללי ← טקסט לדיבור ← שירות הדיבור של Google ← '
        + 'התקנת נתוני קול ← עברית (להוריד). ואז לבחור עברית כשפה ולנסות שוב.';
      voiceMsg.className = 'parent-msg err';
    }
  });
  scroll.append(voiceBtn, voiceMsg);

  // ===== ייצוא =====
  scroll.appendChild(el('div', 'section-title', '📤 ייצוא — לגיבוי או להעברה'));
  scroll.appendChild(el('div', 'parent-hint',
    'לוחצים "צור קוד", מעתיקים אותו, ושולחים לעצמך במייל/הערה — כדי להדביק במכשיר אחר.'));
  const exportBtn = el('button', 'btn primary', 'צור קוד גיבוי');
  const codeBox = el('textarea', 'code-box');
  codeBox.readOnly = true;
  codeBox.style.display = 'none';
  codeBox.placeholder = 'הקוד יופיע כאן...';
  const copyBtn = el('button', 'btn', '📋 העתק קוד');
  copyBtn.style.display = 'none';
  exportBtn.addEventListener('click', () => {
    codeBox.value = encode(storage.exportData());
    codeBox.style.display = 'block';
    copyBtn.style.display = 'inline-block';
    sfx.tap();
  });
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeBox.value);
      copyBtn.textContent = '✓ הועתק!';
    } catch {
      // דפדפנים מסוימים חוסמים clipboard — בחירה ידנית
      codeBox.select();
      copyBtn.textContent = 'בחר והעתק ידנית';
    }
    setTimeout(() => { copyBtn.textContent = '📋 העתק קוד'; }, 2500);
  });
  scroll.append(exportBtn, codeBox, copyBtn);

  // ===== ייבוא =====
  scroll.appendChild(el('div', 'section-title', '📥 ייבוא — שחזור או קבלת התקדמות'));
  scroll.appendChild(el('div', 'parent-hint',
    '⚠️ מדביקים כאן קוד שיצרת במכשיר אחר. שימו לב: זה ידרוס את ההתקדמות הקיימת במכשיר הזה.'));
  const importBox = el('textarea', 'code-box');
  importBox.placeholder = 'הדביקו כאן את קוד הגיבוי...';
  const importBtn = el('button', 'btn primary', 'שחזר התקדמות');
  const msg = el('div', 'parent-msg');
  importBtn.addEventListener('click', () => {
    const raw = importBox.value.trim();
    if (!raw) { msg.textContent = 'אין קוד להדביק.'; msg.className = 'parent-msg err'; return; }
    if (!confirm('זה ידרוס את ההתקדמות הקיימת במכשיר הזה. להמשיך?')) return;
    try {
      storage.importData(decode(raw));
      sfx.fanfare();
      msg.textContent = '✓ ההתקדמות שוחזרה בהצלחה!';
      msg.className = 'parent-msg ok';
      setTimeout(() => ctx.navigate('profileSelect'), 1200);
    } catch {
      sfx.wrong();
      msg.textContent = '✗ הקוד לא תקין. ודאו שהעתקתם אותו במלואו.';
      msg.className = 'parent-msg err';
    }
  });
  scroll.append(importBox, importBtn, msg);

  screen.appendChild(scroll);
  container.appendChild(screen);
}
