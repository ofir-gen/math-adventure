// דגלי מדינות מצוירים ב-SVG (מרחב 100×66), נראים זהה בכל מכשיר.
// משמשים גם ככרטיס בחנות וגם כדגל שהדמות מחזיקה ביד. tn = שם מנוקד להקראה.

export const FLAGS = [
  { id: 'fl_il', name: 'ישראל', tn: 'יִשְׂרָאֵל' },
  { id: 'fl_us', name: 'ארצות הברית', tn: 'אַרְצוֹת הַבְּרִית' },
  { id: 'fl_gb', name: 'בריטניה', tn: 'בְּרִיטַנְיָה' },
  { id: 'fl_fr', name: 'צרפת', tn: 'צָרְפַת' },
  { id: 'fl_it', name: 'איטליה', tn: 'אִיטַלְיָה' },
  { id: 'fl_de', name: 'גרמניה', tn: 'גֶּרְמַנְיָה' },
  { id: 'fl_es', name: 'ספרד', tn: 'סְפָרַד' },
  { id: 'fl_nl', name: 'הולנד', tn: 'הוֹלַנְד' },
  { id: 'fl_be', name: 'בלגיה', tn: 'בֶּלְגְיָה' },
  { id: 'fl_ie', name: 'אירלנד', tn: 'אִירְלַנְד' },
  { id: 'fl_ru', name: 'רוסיה', tn: 'רוּסְיָה' },
  { id: 'fl_at', name: 'אוסטריה', tn: 'אוֹסְטְרְיָה' },
  { id: 'fl_se', name: 'שוודיה', tn: 'שְׁוֵדְיָה' },
  { id: 'fl_fi', name: 'פינלנד', tn: 'פִינְלַנְד' },
  { id: 'fl_dk', name: 'דנמרק', tn: 'דֶּנְמַרְק' },
  { id: 'fl_ch', name: 'שווייץ', tn: 'שְׁוַויְץ' },
  { id: 'fl_jp', name: 'יפן', tn: 'יָפָן' },
  { id: 'fl_ca', name: 'קנדה', tn: 'קָנָדָה' },
  { id: 'fl_br', name: 'ברזיל', tn: 'בְּרָזִיל' },
  { id: 'fl_gr', name: 'יוון', tn: 'יָוָן' },
];

export const flagById = id => FLAGS.find(f => f.id === id);

const r = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const v3 = (a, b, c) => r(0, 0, 34, 66, a) + r(33, 0, 34, 66, b) + r(66, 0, 34, 66, c);
const h3 = (a, b, c) => r(0, 0, 100, 22.5, a) + r(0, 22, 100, 22.5, b) + r(0, 44, 100, 22.5, c);

function usStripes() {
  let s = '';
  for (let i = 0; i < 13; i++) s += r(0, i * 66 / 13, 100, 66 / 13 + 0.3, i % 2 === 0 ? '#B22234' : '#fff');
  s += r(0, 0, 40, 35.5, '#3C3B6E');
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      s += `<circle cx="${6 + col * 9}" cy="${7 + row * 11}" r="1.6" fill="#fff"/>`;
    }
  }
  return s;
}

function design(id) {
  switch (id) {
    case 'fl_il': return r(0, 0, 100, 66, '#fff') + r(0, 9, 100, 8, '#0038b8') + r(0, 49, 100, 8, '#0038b8') +
      `<g fill="none" stroke="#0038b8" stroke-width="2.6"><polygon points="50,20 39.5,38 60.5,38"/><polygon points="50,46 39.5,28 60.5,28"/></g>`;
    case 'fl_us': return usStripes();
    case 'fl_gb': return r(0, 0, 100, 66, '#012169') +
      `<path d="M0 0 L100 66 M100 0 L0 66" stroke="#fff" stroke-width="13"/>` +
      `<path d="M0 0 L100 66 M100 0 L0 66" stroke="#C8102E" stroke-width="5"/>` +
      r(0, 23, 100, 20, '#fff') + r(40, 0, 20, 66, '#fff') +
      r(0, 27, 100, 12, '#C8102E') + r(45, 0, 10, 66, '#C8102E');
    case 'fl_fr': return v3('#0055A4', '#fff', '#EF4135');
    case 'fl_it': return v3('#009246', '#fff', '#CE2B37');
    case 'fl_ie': return v3('#169B62', '#fff', '#FF883E');
    case 'fl_be': return v3('#000000', '#FAE042', '#ED2939');
    case 'fl_de': return h3('#000000', '#DD0000', '#FFCE00');
    case 'fl_nl': return h3('#AE1C28', '#fff', '#21468B');
    case 'fl_ru': return h3('#fff', '#0039A6', '#D52B1E');
    case 'fl_at': return h3('#ED2939', '#fff', '#ED2939');
    case 'fl_es': return r(0, 0, 100, 16.5, '#AA151B') + r(0, 16.5, 100, 33, '#F1BF00') + r(0, 49.5, 100, 16.5, '#AA151B');
    case 'fl_jp': return r(0, 0, 100, 66, '#fff') + `<circle cx="50" cy="33" r="17" fill="#BC002D"/>`;
    case 'fl_se': return r(0, 0, 100, 66, '#006AA7') + r(28, 0, 12, 66, '#FECC00') + r(0, 27, 100, 12, '#FECC00');
    case 'fl_fi': return r(0, 0, 100, 66, '#fff') + r(28, 0, 12, 66, '#003580') + r(0, 27, 100, 12, '#003580');
    case 'fl_dk': return r(0, 0, 100, 66, '#C60C30') + r(28, 0, 12, 66, '#fff') + r(0, 27, 100, 12, '#fff');
    case 'fl_ch': return r(0, 0, 100, 66, '#D52B1E') + r(43, 16, 14, 34, '#fff') + r(24, 26, 52, 14, '#fff');
    case 'fl_ca': return r(0, 0, 25, 66, '#FF0000') + r(75, 0, 25, 66, '#FF0000') + r(25, 0, 50, 66, '#fff') +
      `<polygon points="50,13 53,24 62,21 58,31 69,31 60,38 64,48 53,43 50,53 47,43 36,48 40,38 31,31 42,31 38,21 47,24" fill="#FF0000"/>`;
    case 'fl_br': return r(0, 0, 100, 66, '#009C3B') +
      `<polygon points="50,6 94,33 50,60 6,33" fill="#FFDF00"/><circle cx="50" cy="33" r="15" fill="#002776"/>`;
    case 'fl_gr': {
      let s = '';
      const cols = ['#0D5EAF', '#fff', '#0D5EAF', '#fff', '#0D5EAF'];
      cols.forEach((c, i) => { s += r(0, i * 66 / 5, 100, 66 / 5 + 0.3, c); });
      s += r(0, 0, 26.4, 26.4, '#0D5EAF') + r(10.7, 0, 5, 26.4, '#fff') + r(0, 10.7, 26.4, 5, '#fff');
      return s;
    }
    default: return r(0, 0, 100, 66, '#ccc');
  }
}

let _uid = 0;
// צורות הדגל עטופות ב-clip כדי שקווים אלכסוניים (למשל בריטניה) לא יחרגו מהמלבן
export function flagInner(id) {
  const cid = 'fclip' + (_uid++);
  return `<defs><clipPath id="${cid}"><rect x="0" y="0" width="100" height="66"/></clipPath></defs>` +
    `<g clip-path="url(#${cid})">${design(id)}</g>` +
    `<rect x="0.5" y="0.5" width="99" height="65" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>`;
}

// דגל שלם ככרטיס/אייקון
export function flagSVG(id, w = 46, h = 31) {
  return `<svg viewBox="0 0 100 66" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" style="border-radius:4px">${flagInner(id)}</svg>`;
}
