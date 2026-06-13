// קטלוג החנות: אביזרים לדמות, צבעים, רקעים, דמויות, דגלים, וביצי הפתעה
// slot: head | eyes | neck | back | color | bg | char | flag — פריט אחד פעיל בכל חריץ
// rare: true = לא נמכר בחנות, יוצא רק מביצת הפתעה
// tn = שם מנוקד להקראה
import { FLAGS } from '../ui/flags.js';

export const EGG_PRICE = 25;
export const FLAG_PRICE = 20;

export const ITEMS = [
  // ראש
  { id: 'hd_bow', slot: 'head', name: 'פפיון ורוד', tn: 'פַּפְּיוֹן וָרֹד', icon: '🎀', price: 15 },
  { id: 'hd_flower', slot: 'head', name: 'זר פרחים', tn: 'זֵר פְּרָחִים', icon: '🌸', price: 20 },
  { id: 'hd_party', slot: 'head', name: 'כובע מסיבה', tn: 'כּוֹבַע מְסִבָּה', icon: '🥳', price: 20 },
  { id: 'hd_tiara', slot: 'head', name: 'נזר נסיכה', tn: 'נֵזֶר נְסִיכָה', icon: '👑', price: 30 },
  // עיניים
  { id: 'ey_sun', slot: 'eyes', name: 'משקפי שמש', tn: 'מִשְׁקְפֵי שֶׁמֶשׁ', icon: '🕶️', price: 15 },
  { id: 'ey_heart', slot: 'eyes', name: 'משקפי לב', tn: 'מִשְׁקְפֵי לֵב', icon: '😍', price: 20 },
  // צוואר
  { id: 'nk_scarf', slot: 'neck', name: 'צעיף ורוד', tn: 'צָעִיף וָרֹד', icon: '🧣', price: 15 },
  { id: 'nk_heart', slot: 'neck', name: 'שרשרת לב', tn: 'שַׁרְשֶׁרֶת לֵב', icon: '❤️', price: 20 },
  // גב
  { id: 'bk_fairy', slot: 'back', name: 'כנפי פיה', tn: 'כַּנְפֵי פֵיָה', icon: '🦋', price: 35 },
  // צבעים לדמות
  { id: 'cl_pink', slot: 'color', name: 'ורוד', tn: 'וָרֹד', icon: '🌷', price: 20 },
  { id: 'cl_purple', slot: 'color', name: 'סגול', tn: 'סָגֹל', icon: '🍇', price: 20 },
  { id: 'cl_mint', slot: 'color', name: 'מנטה', tn: 'מֶנְטָה', icon: '🍃', price: 20 },
  { id: 'cl_sky', slot: 'color', name: 'תכלת', tn: 'תְּכֵלֶת', icon: '☁️', price: 20 },
  { id: 'cl_gold', slot: 'color', name: 'זהב', tn: 'זָהָב', icon: '⭐', price: 20 },
  // רקעים — צובעים את כל המשחק
  { id: 'bg_sunset', slot: 'bg', name: 'שקיעה ורודה', tn: 'שְׁקִיעָה וְרֻדָּה', icon: '🌅', price: 25 },
  { id: 'bg_candy', slot: 'bg', name: 'ממלכת ממתקים', tn: 'מַמְלֶכֶת מַמְתַּקִּים', icon: '🍭', price: 25 },
  { id: 'bg_unicorn', slot: 'bg', name: 'קשת בענן', tn: 'קֶשֶׁת בֶּעָנָן', icon: '🦄', price: 25 },
  { id: 'bg_night', slot: 'bg', name: 'שמי לילה', tn: 'שְׁמֵי לַיְלָה', icon: '🌙', price: 25 },
  { id: 'bg_ocean', slot: 'bg', name: 'קסם הים', tn: 'קֶסֶם הַיָּם', icon: '🐠', price: 25 },
  // דמויות חדשות — יקרות, יעד חיסכון גדול. קנייה מחליפה לדמות החדשה; אפשר תמיד לחזור.
  { id: 'ch_unicorn', slot: 'char', charType: 'unicorn', name: 'חד-קרן', tn: 'חַד-קֶרֶן', icon: '🦄', price: 100 },
  { id: 'ch_panda', slot: 'char', charType: 'panda', name: 'פנדה', tn: 'פַּנְדָּה', icon: '🐼', price: 100 },
  { id: 'ch_puppy', slot: 'char', charType: 'puppy', name: 'כלבלב', tn: 'כְּלַבְלַב', icon: '🐶', price: 100 },
  // נדירים — רק מביצת הפתעה!
  { id: 'hd_diamond', slot: 'head', name: 'כתר יהלומים', tn: 'כֶּתֶר יַהֲלוֹמִים', icon: '💎', price: 0, rare: true },
  { id: 'hd_halo', slot: 'head', name: 'הילה קסומה', tn: 'הִילָה קְסוּמָה', icon: '✨', price: 0, rare: true },
  { id: 'bk_rainbow', slot: 'back', name: 'כנפי קשת', tn: 'כַּנְפֵי קֶשֶׁת', icon: '🌈', price: 0, rare: true },
];

// דגלי מדינות — נקנים בחנות, והדמות מחזיקה אותם ביד. 20 דגלים כולל ישראל.
for (const f of FLAGS) ITEMS.push({ id: f.id, slot: 'flag', name: f.name, tn: f.tn, price: FLAG_PRICE });

// צבעי גוף חלופיים (דורסים את צבעי החיה המקוריים)
export const COLOR_PALETTES = {
  cl_pink: { body: '#f7b8d0', belly: '#fde8f0', ear: '#e88ab0' },
  cl_purple: { body: '#c9a8f0', belly: '#ecdffc', ear: '#a87fd8' },
  cl_mint: { body: '#9fe3c0', belly: '#e0f8ec', ear: '#6fc99a' },
  cl_sky: { body: '#9fd0f0', belly: '#e3f3fd', ear: '#6fa8d8' },
  cl_gold: { body: '#f5d57a', belly: '#fdf3d5', ear: '#e0b04a' },
};

export const itemById = id => ITEMS.find(i => i.id === id);

// מה שמוצג על המדפים (בלי הנדירים)
export const shopItems = () => ITEMS.filter(i => !i.rare);

// מה יכול לצאת מביצה: כל מה שעוד אין לה — חוץ מדמויות (יקרות) ודגלים (אוסף נפרד בחנות)
export const eggPool = profile => ITEMS.filter(i =>
  !profile.owned.includes(i.id) && i.slot !== 'char' && i.slot !== 'flag');

export function hatchEgg(profile) {
  const pool = eggPool(profile);
  if (!pool.length) return null;
  // לנדירים סיכוי כפול — שהביצה תרגיש מיוחדת
  const weighted = pool.flatMap(i => (i.rare ? [i, i] : [i]));
  return weighted[Math.floor(Math.random() * weighted.length)];
}
