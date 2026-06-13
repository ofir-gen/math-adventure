// קול: הקראה בעברית (Web Speech API) + צלילים מסונתזים (WebAudio, בלי קבצים)
import { getSettings } from './storage.js';

let audioCtx = null;
let unlocked = false;
let heVoice = null;

// אנדרואיד חוסם קול לפני מחווה ראשונה של המשתמש — נקרא מהנגיעה הראשונה במסך
export function unlock() {
  if (unlocked) return;
  unlocked = true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
  } catch { /* אין WebAudio — ממשיכים בשקט */ }
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  } catch { /* אין TTS */ }
  pickVoice();
}

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  getHeVoice();
  // באנדרואיד רשימת הקולות נטענת באיחור — מאזינים, וגם מנסים שוב אחרי השהיה
  if (!heVoice) speechSynthesis.addEventListener('voiceschanged', getHeVoice, { once: true });
}

// בוחר קול עברי — נבדק מחדש בכל פעם עד שנמצא (הרשימה באנדרואיד מתמלאת באיחור)
function getHeVoice() {
  if (heVoice) return heVoice;
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices() || [];
  heVoice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('he') || v.lang.toLowerCase().startsWith('iw'))) || null;
  return heVoice;
}

export function speak(text) {
  if (!getSettings().tts || !text) return;
  if (!('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel(); // באנדרואיד התור נתקע בלי זה
    const u = new SpeechSynthesisUtterance(text);
    const v = getHeVoice();
    if (v) u.voice = v;
    u.lang = 'he-IL'; // גם בלי קול ברשימה — מנחה את המנוע לנסות עברית
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch { /* TTS לא זמין */ }
}

export function hasHebrewVoice() {
  return !!getHeVoice();
}

// בדיקת קול להורה: מחזיר {supported, hebrew, sample} ומשמיע משפט ניסיון
export function testVoice() {
  const supported = 'speechSynthesis' in window;
  speak('שָׁלוֹם! אֲנִי הַקּוֹל שֶׁל הַמִּשְׂחָק.');
  return { supported, hebrew: hasHebrewVoice() };
}

function tone(freq, startDelay, duration, type = 'sine', gain = 0.14) {
  if (!audioCtx || !getSettings().sound) return;
  const t0 = audioCtx.currentTime + startDelay;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  correct() { tone(523, 0, 0.12); tone(784, 0.1, 0.22); },
  wrong() { tone(196, 0, 0.28, 'square', 0.06); },
  pop() { tone(880, 0, 0.08, 'triangle', 0.1); },
  tap() { tone(660, 0, 0.06, 'triangle', 0.08); },
  fanfare() {
    tone(523, 0, 0.15); tone(659, 0.14, 0.15);
    tone(784, 0.28, 0.15); tone(1047, 0.42, 0.4);
  },
};
