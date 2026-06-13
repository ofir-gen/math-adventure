// רכיבי UI משותפים

export function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// כוכבים קטנים (במפה): מלאים + עמומים
export function starsHTML(n, total = 3) {
  let out = '';
  for (let i = 0; i < total; i++) {
    out += `<span class="${i < n ? 'on' : 'off'}">⭐</span>`;
  }
  return out;
}

// קבוצת עצמים (אימוג'י) — layout: row | rows5 | scatter, removed: כמה "נעלמו"
export function groupEl(emoji, count, { layout = 'row', removed = 0, tapClass = '' } = {}) {
  const g = el('div', `obj-group ${layout === 'rows5' ? 'rows5' : ''} ${layout === 'scatter' ? 'scatter' : ''} ${tapClass}`);
  const cells = layout === 'scatter' ? scatterCells(count) : null;
  for (let i = 0; i < count; i++) {
    const o = el('span', 'obj', emoji);
    if (removed && i >= count - removed) o.classList.add('removed');
    if (cells) {
      o.style.left = cells[i].x + '%';
      o.style.top = cells[i].y + '%';
    }
    g.appendChild(o);
  }
  return g;
}

// פיזור אקראי בלי חפיפות: בחירת תאים מרשת 4x3 + רעידה קטנה
function scatterCells(count) {
  const all = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      all.push({
        x: 4 + c * 24 + Math.random() * 8,
        y: 4 + r * 30 + Math.random() * 10,
      });
    }
  }
  // ערבוב
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

// כרטיס תשובה.
// style 'digits': ספרה גדולה + נקודות לספירה (לימוד זיהוי ספרות בלי התאמת תמונה-לתמונה).
// אחרת: רשת קטנה של אימוג'י + ספרה אופציונלית (למשל בהתאמת כמויות).
export function answerCardEl(count, emoji, { style, showDigits } = {}) {
  const card = el('button', 'answer-card');
  if (style === 'digits' || style === 'digitsOnly') {
    let dots = '';
    if (style === 'digits') {
      for (let i = 0; i < count; i++) dots += '<span></span>';
    }
    card.innerHTML = `<div class="big-digit">${count}</div>${dots ? `<div class="dots">${dots}</div>` : ''}`;
    return card;
  }
  let mini = '';
  for (let i = 0; i < count; i++) mini += `<span>${emoji}</span>`;
  card.innerHTML = `<div class="mini">${mini}</div>${showDigits ? `<div class="digit">${count}</div>` : ''}`;
  return card;
}

// לוח מספרים 1-9, מחיקה, 0, אישור
export function numpadEl({ onDigit, onDelete, onConfirm }) {
  const pad = el('div', 'numpad');
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
  for (const k of keys) {
    const b = el('button', '', k === 'del' ? '⌫' : k === 'ok' ? '✓' : k);
    if (k === 'del') b.classList.add('del');
    if (k === 'ok') b.classList.add('ok');
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (k === 'del') onDelete();
      else if (k === 'ok') onConfirm();
      else onDigit(k);
    });
    pad.appendChild(b);
  }
  return pad;
}

// כותרת מסך עם כפתור חזרה
export function topbarEl(title, onBack, rightEl) {
  const bar = el('div', 'topbar');
  if (onBack) {
    const back = el('button', 'btn round', '←');
    back.style.transform = 'scaleX(-1)'; // חץ לכיוון RTL
    back.addEventListener('click', onBack);
    bar.appendChild(back);
  }
  bar.appendChild(el('div', 'title', title));
  if (rightEl) bar.appendChild(rightEl);
  else if (onBack) bar.appendChild(el('div', '', '')).style.width = '52px';
  return bar;
}
