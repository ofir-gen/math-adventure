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
  const choose = () => {
    const voices = speechSynthesis.getVoices();
    heVoice = voices.find(v => v.lang && (v.lang.startsWith('he') || v.lang.startsWith('iw'))) || null;
  };
  choose();
  if (!heVoice) speechSynthesis.addEventListener('voiceschanged', choose, { once: true });
}

export function speak(text) {
  if (!getSettings().tts || !text) return;
  if (!('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel(); // באנדרואיד התור נתקע בלי זה
    const u = new SpeechSynthesisUtterance(text);
    if (heVoice) u.voice = heVoice;
    u.lang = 'he-IL';
    u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch { /* TTS לא זמין */ }
}

export function hasHebrewVoice() {
  return !!heVoice;
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
