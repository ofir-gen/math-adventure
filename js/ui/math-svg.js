// ציורים מתמטיים ב-SVG: שעון, שברים, מצולעים, מלבן עם צלעות, רשת ריבועים

const P = '#7c4dcc', PD = '#5a35a0', GOLD = '#ffc83d', FILL = '#b99cf2', LINE = '#3a2a5d';

// שעון אנלוגי (שעות 1-12)
export function clockSVG(h, m, size = 190) {
  const c = 100, r = 92;
  let out = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="clock-svg" aria-label="שעון">
    <circle cx="${c}" cy="${c}" r="${r}" fill="#fff" stroke="${P}" stroke-width="6"/>`;
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    const big = i % 5 === 0;
    const r1 = big ? 78 : 83, r2 = 87;
    out += `<line x1="${c + r1 * Math.cos(a)}" y1="${c + r1 * Math.sin(a)}" x2="${c + r2 * Math.cos(a)}" y2="${c + r2 * Math.sin(a)}"
      stroke="${big ? PD : '#b8a8d8'}" stroke-width="${big ? 3 : 1.5}" stroke-linecap="round"/>`;
  }
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    out += `<text x="${c + 64 * Math.cos(a)}" y="${c + 64 * Math.sin(a) + 7}" text-anchor="middle" font-size="19" font-weight="800" fill="${LINE}">${i}</text>`;
  }
  const ha = ((h % 12) * 30 + m * 0.5 - 90) * Math.PI / 180;
  const ma = (m * 6 - 90) * Math.PI / 180;
  out += `<line x1="${c}" y1="${c}" x2="${c + 42 * Math.cos(ha)}" y2="${c + 42 * Math.sin(ha)}" stroke="${LINE}" stroke-width="8" stroke-linecap="round"/>
    <line x1="${c}" y1="${c}" x2="${c + 68 * Math.cos(ma)}" y2="${c + 68 * Math.sin(ma)}" stroke="${P}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${c}" cy="${c}" r="6" fill="${GOLD}" stroke="${LINE}" stroke-width="2"/></svg>`;
  return out;
}

// שבר כצורה: עיגול מחולק לפלחים או פס מחולק לחלקים, k חלקים צבועים
export function fractionSVG(n, d, shape = 'circle', size = 170) {
  if (shape === 'bar') {
    const w = 260, hgt = 70, cell = w / d;
    let out = `<svg viewBox="0 0 ${w + 8} ${hgt + 8}" width="${Math.round(size * 1.5)}" height="${Math.round(size * 1.5 * (hgt + 8) / (w + 8))}" class="frac-svg">`;
    for (let i = 0; i < d; i++) {
      out += `<rect x="${4 + i * cell}" y="4" width="${cell}" height="${hgt}" fill="${i < n ? FILL : '#fff'}" stroke="${PD}" stroke-width="3"/>`;
    }
    return out + '</svg>';
  }
  const c = 100, r = 90;
  let out = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="frac-svg">`;
  if (d === 1) return out + `<circle cx="${c}" cy="${c}" r="${r}" fill="${FILL}" stroke="${PD}" stroke-width="3"/></svg>`;
  for (let i = 0; i < d; i++) {
    const a1 = (i / d) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const large = 1 / d > 0.5 ? 1 : 0;
    out += `<path d="M ${c} ${c} L ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)} A ${r} ${r} 0 ${large} 1 ${c + r * Math.cos(a2)} ${c + r * Math.sin(a2)} Z"
      fill="${i < n ? FILL : '#fff'}" stroke="${PD}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return out + '</svg>';
}

// שבר כטקסט: מונה מעל מכנה
export function fractionHTML(n, d) {
  return `<span class="frac"><span class="frac-n">${n}</span><span class="frac-d">${d}</span></span>`;
}

// מצולע משוכלל עם n צלעות
export function polygonSVG(n, size = 170) {
  const c = 100, r = 84;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    pts.push(`${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`);
  }
  let out = `<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="shape-svg">
    <polygon points="${pts.join(' ')}" fill="${FILL}" stroke="${PD}" stroke-width="4" stroke-linejoin="round"/>`;
  for (const p of pts) {
    const [x, y] = p.split(',');
    out += `<circle cx="${x}" cy="${y}" r="5" fill="${GOLD}" stroke="${LINE}" stroke-width="2"/>`;
  }
  return out + '</svg>';
}

// ריבוע / מלבן / משולש עם אורכי צלעות בס"מ
export function shapeSVG(kind, sides, size = 220) {
  const W = 260, H = 190;
  let out = `<svg viewBox="0 0 ${W} ${H}" width="${size}" height="${Math.round(size * H / W)}" class="shape-svg">`;
  const label = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="16" font-weight="800" fill="${LINE}">${t}</text>`;
  if (kind === 'triangle') {
    // משולש סכמטי (הפרופורציות לא מדויקות — האורכים כתובים על הצלעות)
    const [a, b, c] = sides;
    const pts = [[30, 160], [230, 160], [110, 30]];
    out += `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${FILL}" stroke="${PD}" stroke-width="4" stroke-linejoin="round"/>`;
    out += label(130, 182, `${a} ס״מ`) + label(180, 92, `${b} ס״מ`) + label(58, 92, `${c} ס״מ`);
    return out + '</svg>';
  }
  const [w, h] = sides;
  // שומרים על היחס בין הצלעות, בתוך גבולות התיבה, ומשאירים מקום לתוויות מכל צד
  const maxW = 150, maxH = 100;
  const scale = Math.min(maxW / w, maxH / h);
  const rw = Math.max(80, w * scale), rh = Math.max(60, h * scale);
  const x = (W - rw) / 2, y = (H - rh) / 2 + 4;
  out += `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" fill="${FILL}" stroke="${PD}" stroke-width="4" rx="3"/>`;
  out += label(W / 2, y - 8, `${w} ס״מ`);
  out += label(W / 2, y + rh + 20, `${w} ס״מ`);
  out += label(x - 38, y + rh / 2 + 6, `${h} ס״מ`);
  out += label(x + rw + 38, y + rh / 2 + 6, `${h} ס״מ`);
  return out + '</svg>';
}

// רשת ריבועים w×h (שטח = ספירת ריבועים)
export function gridSVG(w, h, size = 240) {
  const cell = 26, W = w * cell + 4, H = h * cell + 4;
  const scale = Math.min(size / W, (size * 0.75) / H, 1.2);
  let out = `<svg viewBox="0 0 ${W} ${H}" width="${Math.round(W * scale)}" height="${Math.round(H * scale)}" class="grid-svg">`;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      out += `<rect x="${2 + c * cell}" y="${2 + r * cell}" width="${cell}" height="${cell}" fill="${(r + c) % 2 ? FILL : '#d9c9f8'}" stroke="${PD}" stroke-width="2"/>`;
    }
  }
  return out + '</svg>';
}
