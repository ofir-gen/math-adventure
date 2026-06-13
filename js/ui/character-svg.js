// דמות מלווה — SVG פרמטרי: 3 חיות × 5 שלבי גדילה + אביזרים וצבעים מהחנות
// שלב 1 תינוק → שלב 5 עם כתר. הגודל גדל עם השלב, אביזרים מתווספים.
// אביזרים קנויים (opts.equipped) מסתירים את אביזרי-השלב באותו אזור.
import { COLOR_PALETTES } from '../engine/shopCatalog.js';

const PALETTE = {
  bunny: { body: '#f3e2d3', belly: '#fdf6ef', ear: '#f6b8c8', cheek: '#f6b8c8' },
  cat: { body: '#f6b267', belly: '#fde3c0', ear: '#e8924a', cheek: '#f08c8c' },
  dragon: { body: '#86d6a4', belly: '#d4f3df', ear: '#5cb583', cheek: '#f08c8c' },
  unicorn: { body: '#fbeef7', belly: '#ffffff', ear: '#f6b8d8', cheek: '#f6a8c8' },
  panda: { body: '#f7f7f5', belly: '#ffffff', ear: '#3d3a3a', cheek: '#f08c8c' },
  puppy: { body: '#dba87a', belly: '#f7e8d3', ear: '#b07c4f', cheek: '#f08c8c' },
};

export function characterSVG(type, stage, size = 120, opts = {}) {
  const eq = opts.equipped || {};
  let p = PALETTE[type] || PALETTE.bunny;
  if (eq.color && COLOR_PALETTES[eq.color]) p = { ...p, ...COLOR_PALETTES[eq.color] };
  const scale = 0.62 + stage * 0.095; // גדילה ויזואלית עם השלב
  const px = Math.round(size * scale);

  return `<svg viewBox="0 0 100 112" width="${px}" height="${Math.round(px * 1.12)}" xmlns="http://www.w3.org/2000/svg">
    ${eq.back ? backItem(eq.back) : ''}
    ${ears(type, p)}
    ${!eq.back && type === 'dragon' && stage >= 3 ? wings(p) : ''}
    <!-- גוף -->
    <circle cx="50" cy="66" r="31" fill="${p.body}"/>
    <ellipse cx="50" cy="76" rx="17" ry="13" fill="${p.belly}"/>
    <!-- רגליים -->
    <ellipse cx="38" cy="96" rx="8" ry="5.5" fill="${p.body}"/>
    <ellipse cx="62" cy="96" rx="8" ry="5.5" fill="${p.body}"/>
    <!-- ידיים -->
    <circle cx="22" cy="72" r="6.5" fill="${p.body}"/>
    <circle cx="78" cy="72" r="6.5" fill="${p.body}"/>
    ${faceExtras(type, p)}
    ${face(p, stage)}
    ${stage >= 2 && !eq.head ? bow() : ''}
    ${stage >= 3 && !eq.neck ? scarf(type) : ''}
    ${stage >= 4 ? badge() : ''}
    ${stage >= 5 && !eq.head ? crown() : ''}
    ${eq.eyes ? eyesItem(eq.eyes) : ''}
    ${eq.neck ? neckItem(eq.neck) : ''}
    ${eq.head ? headItem(eq.head) : ''}
  </svg>`;
}

// דמות של פרופיל, לבושה במה שקנתה
export function profileCharSVG(profile, stage, size) {
  return characterSVG(profile.character?.type || 'bunny', stage, size, { equipped: profile.equipped || {} });
}

function face(p, stage) {
  const eyeR = stage === 1 ? 4 : 3.3; // עיניים גדולות לתינוק
  return `
    <circle cx="41" cy="60" r="${eyeR}" fill="#33284f"/>
    <circle cx="59" cy="60" r="${eyeR}" fill="#33284f"/>
    <circle cx="42.3" cy="58.6" r="1.2" fill="#fff"/>
    <circle cx="60.3" cy="58.6" r="1.2" fill="#fff"/>
    <circle cx="33" cy="68" r="4" fill="${p.cheek}" opacity="0.55"/>
    <circle cx="67" cy="68" r="4" fill="${p.cheek}" opacity="0.55"/>
    <path d="M45 68 Q47.5 71 50 68 Q52.5 71 55 68" stroke="#33284f" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
}

function ears(type, p) {
  if (type === 'bunny') {
    return `
      <ellipse cx="38" cy="26" rx="7.5" ry="19" fill="${p.body}" transform="rotate(-9 38 26)"/>
      <ellipse cx="62" cy="26" rx="7.5" ry="19" fill="${p.body}" transform="rotate(9 62 26)"/>
      <ellipse cx="38" cy="28" rx="3.8" ry="13" fill="${p.ear}" transform="rotate(-9 38 28)"/>
      <ellipse cx="62" cy="28" rx="3.8" ry="13" fill="${p.ear}" transform="rotate(9 62 28)"/>`;
  }
  if (type === 'cat') {
    return `
      <path d="M28 50 L33 26 L48 42 Z" fill="${p.body}"/>
      <path d="M72 50 L67 26 L52 42 Z" fill="${p.body}"/>
      <path d="M33 45 L35.5 32 L44 41 Z" fill="${p.ear}"/>
      <path d="M67 45 L64.5 32 L56 41 Z" fill="${p.ear}"/>
      <line x1="14" y1="64" x2="27" y2="63" stroke="#33284f" stroke-width="1.1"/>
      <line x1="15" y1="70" x2="27" y2="68" stroke="#33284f" stroke-width="1.1"/>
      <line x1="86" y1="64" x2="73" y2="63" stroke="#33284f" stroke-width="1.1"/>
      <line x1="85" y1="70" x2="73" y2="68" stroke="#33284f" stroke-width="1.1"/>`;
  }
  if (type === 'unicorn') {
    // אוזני סוס + קרן זהב + רעמת קשת
    return `
      <ellipse cx="36" cy="34" rx="6" ry="11" fill="${p.body}" transform="rotate(-14 36 34)"/>
      <ellipse cx="64" cy="34" rx="6" ry="11" fill="${p.body}" transform="rotate(14 64 34)"/>
      <ellipse cx="36" cy="35" rx="3" ry="7" fill="${p.ear}" transform="rotate(-14 36 35)"/>
      <ellipse cx="64" cy="35" rx="3" ry="7" fill="${p.ear}" transform="rotate(14 64 35)"/>
      <path d="M46 32 L50 10 L54 32 Z" fill="#ffd54a" stroke="#e8a13d" stroke-width="1"/>
      <line x1="47.5" y1="24" x2="53" y2="21" stroke="#e8a13d" stroke-width="1.2"/>
      <line x1="48.5" y1="17" x2="52" y2="15" stroke="#e8a13d" stroke-width="1.2"/>
      <circle cx="29" cy="42" r="4.5" fill="#f78cc0"/>
      <circle cx="25" cy="50" r="4" fill="#a8c8f5"/>
      <circle cx="23" cy="58" r="3.5" fill="#8fe3a8"/>`;
  }
  if (type === 'panda') {
    return `
      <circle cx="33" cy="36" r="8.5" fill="${p.ear}"/>
      <circle cx="67" cy="36" r="8.5" fill="${p.ear}"/>`;
  }
  if (type === 'puppy') {
    // אוזניים שמוטות
    return `
      <ellipse cx="28" cy="44" rx="7.5" ry="15" fill="${p.ear}" transform="rotate(18 28 44)"/>
      <ellipse cx="72" cy="44" rx="7.5" ry="15" fill="${p.ear}" transform="rotate(-18 72 44)"/>`;
  }
  // דרקון: קרניים + קוצים
  return `
    <path d="M36 42 L32 26 L43 38 Z" fill="#fceea8"/>
    <path d="M64 42 L68 26 L57 38 Z" fill="#fceea8"/>
    <path d="M44 38 L50 28 L56 38 Z" fill="${p.ear}"/>`;
}

// תוספות פנים לפי חיה — מצוירות על הגוף, מתחת לעיניים
function faceExtras(type, p) {
  if (type === 'panda') {
    // כתמים שחורים + טבעת לבנה כדי שהעיניים יבלטו
    return `
      <ellipse cx="41" cy="60" rx="6.5" ry="8" fill="#3d3a3a" transform="rotate(-12 41 60)"/>
      <ellipse cx="59" cy="60" rx="6.5" ry="8" fill="#3d3a3a" transform="rotate(12 59 60)"/>
      <circle cx="41" cy="60" r="4.4" fill="#ffffff"/>
      <circle cx="59" cy="60" r="4.4" fill="#ffffff"/>`;
  }
  if (type === 'puppy') {
    // כתם חום סביב עין אחת + אף
    return `
      <ellipse cx="59" cy="59" rx="6.5" ry="7.5" fill="#c08c5a" opacity="0.7"/>
      <ellipse cx="50" cy="64.5" rx="3" ry="2.2" fill="#5a4030"/>`;
  }
  return '';
}

function wings(p) {
  return `
    <path d="M16 60 Q2 48 12 38 Q20 48 24 56 Z" fill="${p.ear}" opacity="0.9"/>
    <path d="M84 60 Q98 48 88 38 Q80 48 76 56 Z" fill="${p.ear}" opacity="0.9"/>`;
}

function bow() {
  return `
    <path d="M28 42 L38 47 L28 52 Z" fill="#e85d8a"/>
    <path d="M48 42 L38 47 L48 52 Z" fill="#e85d8a"/>
    <circle cx="38" cy="47" r="3" fill="#c43e6b"/>`;
}

function scarf(type) {
  const c = type === 'dragon' ? '#e8a13d' : '#6fa8e8';
  return `
    <path d="M30 84 Q50 93 70 84 Q50 99 30 84 Z" fill="${c}"/>
    <rect x="58" y="86" width="9" height="14" rx="4" fill="${c}"/>`;
}

function badge() {
  return `<text x="50" y="81" font-size="11" text-anchor="middle">⭐</text>`;
}

function crown() {
  return `
    <path d="M36 18 L40 8 L46 15 L50 5 L54 15 L60 8 L64 18 Q50 23 36 18 Z" fill="#ffc83d" stroke="#e8a13d" stroke-width="1.5"/>
    <circle cx="50" cy="12" r="1.8" fill="#e85d8a"/>`;
}

// ===== אביזרים מהחנות =====

function headItem(id) {
  switch (id) {
    case 'hd_bow': return `
      <path d="M36 32 L50 39 L36 46 Z" fill="#f06ba8"/>
      <path d="M64 32 L50 39 L64 46 Z" fill="#f06ba8"/>
      <circle cx="50" cy="39" r="4" fill="#d14a8a"/>`;
    case 'hd_flower': {
      const flower = (x, y, s) => `
        <circle cx="${x - s}" cy="${y}" r="${s * 0.8}" fill="#f78cc0"/>
        <circle cx="${x + s}" cy="${y}" r="${s * 0.8}" fill="#f78cc0"/>
        <circle cx="${x}" cy="${y - s}" r="${s * 0.8}" fill="#f78cc0"/>
        <circle cx="${x}" cy="${y + s}" r="${s * 0.8}" fill="#f78cc0"/>
        <circle cx="${x}" cy="${y}" r="${s * 0.7}" fill="#ffd54a"/>`;
      return flower(38, 38, 3) + flower(50, 33, 3.4) + flower(62, 38, 3);
    }
    case 'hd_party': return `
      <path d="M50 8 L40 38 L60 38 Z" fill="#7ec8f0"/>
      <path d="M46.7 18 L43.4 28 L56.6 28 L53.3 18 Z" fill="#f7d34a"/>
      <circle cx="50" cy="8" r="3.5" fill="#f06ba8"/>`;
    case 'hd_tiara': return `
      <path d="M38 38 Q50 32 62 38 L60 30 L55 35 L50 26 L45 35 L40 30 Z" fill="#ffd54a" stroke="#e8a13d" stroke-width="1"/>
      <circle cx="50" cy="31" r="2" fill="#f06ba8"/>`;
    case 'hd_diamond': return `
      <path d="M36 18 L40 8 L46 15 L50 5 L54 15 L60 8 L64 18 Q50 23 36 18 Z" fill="#dceefb" stroke="#9fc8e8" stroke-width="1.5"/>
      <circle cx="50" cy="12" r="2" fill="#7ec8f0"/>
      <circle cx="42" cy="14" r="1.2" fill="#fff"/>
      <circle cx="58" cy="14" r="1.2" fill="#fff"/>`;
    case 'hd_halo': return `
      <ellipse cx="50" cy="14" rx="14" ry="4.5" fill="none" stroke="#ffd54a" stroke-width="3"/>
      <ellipse cx="50" cy="14" rx="14" ry="4.5" fill="none" stroke="#fff" stroke-width="1" opacity="0.7"/>`;
    default: return '';
  }
}

function eyesItem(id) {
  if (id === 'ey_sun') return `
    <rect x="34" y="55" width="13" height="9" rx="4" fill="#33284f"/>
    <rect x="53" y="55" width="13" height="9" rx="4" fill="#33284f"/>
    <line x1="47" y1="59" x2="53" y2="59" stroke="#33284f" stroke-width="2"/>
    <circle cx="38" cy="58" r="1.3" fill="#fff" opacity="0.8"/>
    <circle cx="57" cy="58" r="1.3" fill="#fff" opacity="0.8"/>`;
  if (id === 'ey_heart') {
    const heart = x => `<path d="M${x} 64 L${x - 6} 58 Q${x - 6} 53 ${x - 3} 54.5 Q${x} 55.5 ${x} 58 Q${x} 55.5 ${x + 3} 54.5 Q${x + 6} 53 ${x + 6} 58 Z" fill="#f06ba8" opacity="0.92"/>`;
    return heart(41) + heart(59) + `<line x1="46" y1="58" x2="54" y2="58" stroke="#f06ba8" stroke-width="2"/>`;
  }
  return '';
}

function neckItem(id) {
  if (id === 'nk_scarf') return `
    <path d="M30 84 Q50 93 70 84 Q50 99 30 84 Z" fill="#f06ba8"/>
    <rect x="58" y="86" width="9" height="14" rx="4" fill="#f06ba8"/>`;
  if (id === 'nk_heart') return `
    <path d="M36 80 Q50 88 64 80" fill="none" stroke="#ffd54a" stroke-width="2"/>
    <path d="M50 92 L45 87 Q45 83 47.5 84 Q50 85 50 87 Q50 85 52.5 84 Q55 83 55 87 Z" fill="#e8453d"/>`;
  return '';
}

function backItem(id) {
  if (id === 'bk_fairy') return `
    <ellipse cx="22" cy="50" rx="13" ry="20" fill="#f7b8e0" opacity="0.75" transform="rotate(20 22 50)"/>
    <ellipse cx="78" cy="50" rx="13" ry="20" fill="#f7b8e0" opacity="0.75" transform="rotate(-20 78 50)"/>
    <ellipse cx="20" cy="72" rx="9" ry="13" fill="#cfe0fb" opacity="0.75" transform="rotate(-15 20 72)"/>
    <ellipse cx="80" cy="72" rx="9" ry="13" fill="#cfe0fb" opacity="0.75" transform="rotate(15 80 72)"/>`;
  if (id === 'bk_rainbow') return `
    <ellipse cx="22" cy="52" rx="14" ry="21" fill="#f78c8c" opacity="0.8" transform="rotate(20 22 52)"/>
    <ellipse cx="24" cy="54" rx="10" ry="16" fill="#ffd54a" opacity="0.8" transform="rotate(20 24 54)"/>
    <ellipse cx="26" cy="56" rx="6" ry="11" fill="#8fe3a8" opacity="0.8" transform="rotate(20 26 56)"/>
    <ellipse cx="78" cy="52" rx="14" ry="21" fill="#f78c8c" opacity="0.8" transform="rotate(-20 78 52)"/>
    <ellipse cx="76" cy="54" rx="10" ry="16" fill="#ffd54a" opacity="0.8" transform="rotate(-20 76 54)"/>
    <ellipse cx="74" cy="56" rx="6" ry="11" fill="#8fe3a8" opacity="0.8" transform="rotate(-20 74 56)"/>`;
  return '';
}
