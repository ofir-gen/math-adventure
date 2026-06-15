// נקודת הכניסה: ניתוב מסכים, שחרור קול במחווה ראשונה, רישום service worker
import { profileSelect } from './screens/profileSelect.js';
import { subjectSelect } from './screens/subjectSelect.js';
import { worldMap } from './screens/worldMap.js';
import { exercise } from './screens/exercise.js';
import { prizes } from './screens/prizes.js';
import { character } from './screens/character.js';
import { shop } from './screens/shop.js';
import { parent } from './screens/parent.js';
import { memory } from './screens/memory.js';
import { unlock } from './audio.js';
import { getProfile } from './storage.js';

const screens = { profileSelect, subjectSelect, worldMap, exercise, prizes, character, shop, parent, memory };
const app = document.getElementById('app');
const ctx = {
  state: { profileId: null },
  navigate,
};

function navigate(name, params = {}) {
  app.innerHTML = '';
  screens[name](app, ctx, params);
  applyBg(name);
}

// רקע קנוי מהחנות גובר על ערכת העולם
function applyBg(screenName) {
  const pid = ctx.state.profileId;
  const noBg = screenName === 'profileSelect' || screenName === 'subjectSelect';
  const bg = !noBg && pid ? getProfile(pid).equipped?.bg : null;
  if (bg) document.body.dataset.bg = bg;
  else delete document.body.dataset.bg;
}

// אנדרואיד דורש מחווה לפני קול — הנגיעה הראשונה משחררת TTS ו-WebAudio
window.addEventListener('pointerdown', unlock, { once: true });

// חסימת תפריט לחיצה-ארוכה בתוך המשחק
window.addEventListener('contextmenu', e => e.preventDefault());

// בקשת אחסון עמיד — מגן על ההתקדמות מפני פינוי אוטומטי
if (navigator.storage?.persist) navigator.storage.persist();

// service worker למשחק אופליין — לא בפיתוח מקומי (המטמון מסתיר שינויי קוד)
const isLocalDev = ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  if (isLocalDev) {
    // ניקוי פעיל: SW ישן שנרשם פעם ב-localhost ימשיך להגיש קבצים ישנים — מסירים אותו ואת המטמון
    navigator.serviceWorker.getRegistrations()
      .then(regs => Promise.all(regs.map(r => r.unregister())))
      .then(had => { if (had.some(Boolean)) location.reload(); });
    if (window.caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
  } else {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* בלי אופליין — המשחק עדיין עובד */ });
  }
}

navigate('profileSelect');
