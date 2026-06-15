// אחסון התקדמות — blob יחיד ב-localStorage, כתיבה מיידית בכל שינוי
const KEY = 'mathAdventure.v1';

function defaults() {
  return {
    version: 1,
    profiles: {
      noya: emptyProfile('נויה', 'נוֹיָה', 'noya'),
      alin: emptyProfile('אלין', 'אַלִין', 'alin'),
    },
    settings: { sound: true, tts: true },
  };
}

function emptyProfile(name, ttsName, curriculum) {
  return {
    name,
    ttsName, // השם מנוקד — להקראה נכונה
    curriculum,
    character: null, // { type: 'bunny' | 'cat' | 'dragon' }
    levels: {},      // levelId -> { stars, attempts }
    stickers: [],
    coins: 0,        // מטבעות לחנות — הכוכבים לעולם לא יורדים
    owned: [],       // פריטי חנות שנקנו
    equipped: {},    // slot -> itemId (מה הדמות לובשת)
    room: {},        // spot -> itemId (רהיטים בחדר)
    totals: { stars: 0, correct: 0, bestStreak: 0 },
  };
}

const EMPTY_TOTALS = { stars: 0, correct: 0, bestStreak: 0 };

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    // מיזוג עם ברירות מחדל — שדות חדשים בגרסאות עתידיות לא ישברו שמירות ישנות
    const base = defaults();
    for (const id of Object.keys(base.profiles)) {
      base.profiles[id] = { ...base.profiles[id], ...(parsed.profiles?.[id] || {}) };
      base.profiles[id].totals = { ...EMPTY_TOTALS, ...(parsed.profiles?.[id]?.totals || {}) };
      base.profiles[id].ttsName = base.profiles[id].ttsName || base.profiles[id].name;
      // מענק רטרואקטיבי: שמירה מלפני עידן החנות מקבלת מטבעות לפי ההתקדמות שכבר נצברה
      const parsedP = parsed.profiles?.[id];
      if (parsedP && parsedP.coins === undefined) {
        const t = base.profiles[id].totals;
        base.profiles[id].coins = t.correct + t.stars * 5;
      }
      if (!Array.isArray(base.profiles[id].owned)) base.profiles[id].owned = [];
      if (typeof base.profiles[id].equipped !== 'object' || !base.profiles[id].equipped) base.profiles[id].equipped = {};
      if (typeof base.profiles[id].room !== 'object' || !base.profiles[id].room) base.profiles[id].room = {};
      // מיגרציה: מדבקות ספציפיות-לנושא קיבלו קידומת קוריקולום (כדי לא להתנגש בין נושאים)
      const mathCur = base.profiles[id].curriculum;
      base.profiles[id].stickers = base.profiles[id].stickers.map(s =>
        /^(first_level|first_perfect|world_done_\d+|world_perfect_\d+)$/.test(s) ? `${mathCur}:${s}` : s);
      // מיגרציה: דמות הפתיחה שנבחרה בעבר נחשבת בבעלות (כדי שאפשר יהיה לחזור אליה אחרי קניית דמות חדשה)
      const charType = base.profiles[id].character?.type;
      if (charType && !base.profiles[id].owned.includes('ch_' + charType)) {
        base.profiles[id].owned.push('ch_' + charType);
      }
    }
    base.settings = { ...base.settings, ...(parsed.settings || {}) };
    return base;
  } catch {
    return defaults();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* אחסון מלא/חסום — המשחק ממשיך בזיכרון */ }
}

export function getSettings() {
  return data.settings;
}

export function getProfile(id) {
  return data.profiles[id];
}

export function setCharacter(profileId, type, { grantOwnership = false } = {}) {
  const p = data.profiles[profileId];
  p.character = { type };
  // דמות הפתיחה החינמית נרשמת בבעלות; החלפה רגילה לא מעניקה בעלות
  if (grantOwnership && !p.owned.includes('ch_' + type)) p.owned.push('ch_' + type);
  save();
}

// קניית רהיט לחדר: מטבעות יורדים, נוסף לבעלות (ההצבה נעשית במסך החדר)
export function buyDecor(profileId, itemId, price) {
  const p = data.profiles[profileId];
  if (p.coins < price || p.owned.includes(itemId)) return false;
  p.coins -= price;
  p.owned.push(itemId);
  save();
  return true;
}

// הצבת/הסרת רהיט בחריץ בחדר
export function setRoomItem(profileId, spot, itemId) {
  const p = data.profiles[profileId];
  if (itemId === null) delete p.room[spot];
  else p.room[spot] = itemId;
  save();
}

// מתנה יומית: מחזיר true אם מגיעה היום (לפי תאריך אחרון)
export function dailyGiftAvailable(profileId, todayStr) {
  return data.profiles[profileId].lastGift !== todayStr;
}
export function claimDailyGift(profileId, todayStr, coins) {
  const p = data.profiles[profileId];
  p.lastGift = todayStr;
  p.coins += coins;
  save();
}

// שם אישי לדמות (ניתן ע"י הילדה). נשמר על הדמות הנוכחית.
export function setCharacterName(profileId, name) {
  const p = data.profiles[profileId];
  if (!p.character) return;
  p.character.name = (name || '').trim().slice(0, 14) || undefined;
  save();
}

// קניית דמות: מטבעות יורדים, הדמות נרשמת בבעלות ונכנסת לפעולה מיד
export function buyCharacter(profileId, itemId, price, type) {
  const p = data.profiles[profileId];
  if (p.coins < price || p.owned.includes(itemId)) return false;
  p.coins -= price;
  p.owned.push(itemId);
  p.character = { type };
  save();
  return true;
}

// רישום סבב שהושלם; מחזיר את מצב הרמה המעודכן
export function recordRound(profileId, levelId, stars, correctCount, bestStreakInRound) {
  const p = data.profiles[profileId];
  const lvl = p.levels[levelId] || { stars: 0, attempts: 0 };
  lvl.attempts += 1;
  lvl.stars = Math.max(lvl.stars, stars);
  p.levels[levelId] = lvl;
  p.totals.correct += correctCount;
  p.totals.bestStreak = Math.max(p.totals.bestStreak, bestStreakInRound);
  p.totals.stars = Object.values(p.levels).reduce((s, l) => s + l.stars, 0);
  save();
  return lvl;
}

export function addCoins(profileId, amount) {
  data.profiles[profileId].coins += amount;
  save();
}

// קנייה מהמדף: מוריד מטבעות, מוסיף לבעלות ולובש מיד
export function buyItem(profileId, itemId, price, slot) {
  const p = data.profiles[profileId];
  if (p.coins < price || p.owned.includes(itemId)) return false;
  p.coins -= price;
  p.owned.push(itemId);
  p.equipped[slot] = itemId;
  save();
  return true;
}

// קניית ערכת תלבושת: מעניק את כל החלקים ומלביש אותם יחד.
// מחזיר 'bought' | 'equipped' | false (אין מספיק מטבעות)
export function buySet(profileId, set) {
  const p = data.profiles[profileId];
  const allOwned = Object.values(set.equip).every(id => p.owned.includes(id));
  let result = 'equipped';
  if (!allOwned) {
    if (p.coins < set.price) return false;
    p.coins -= set.price;
    for (const id of Object.values(set.equip)) if (!p.owned.includes(id)) p.owned.push(id);
    result = 'bought';
  }
  for (const [slot, id] of Object.entries(set.equip)) p.equipped[slot] = id;
  save();
  return result;
}

// ביצת הפתעה: תשלום ופריט נפרדים
export function spendCoins(profileId, amount) {
  const p = data.profiles[profileId];
  if (p.coins < amount) return false;
  p.coins -= amount;
  save();
  return true;
}

export function grantItem(profileId, itemId, slot) {
  const p = data.profiles[profileId];
  if (!p.owned.includes(itemId)) p.owned.push(itemId);
  p.equipped[slot] = itemId;
  save();
}

export function equipItem(profileId, slot, itemId) {
  const p = data.profiles[profileId];
  if (itemId === null) delete p.equipped[slot];
  else p.equipped[slot] = itemId;
  save();
}

export function addStickers(profileId, stickerIds) {
  const p = data.profiles[profileId];
  for (const id of stickerIds) {
    if (!p.stickers.includes(id)) p.stickers.push(id);
  }
  save();
}

export function exportData() {
  return JSON.stringify(data);
}

export function importData(json) {
  const parsed = JSON.parse(json); // נכשל = זורק, המתקשר מטפל
  if (!parsed || parsed.version !== 1 || !parsed.profiles) throw new Error('פורמט לא מוכר');
  data = parsed;
  save();
  data = load(); // נרמול דרך מיזוג ברירות המחדל
}
