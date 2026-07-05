// ui.js — Dựng và cập nhật các thành phần giao diện động (menu hình, thanh thuộc tính, khay bút).
import { SHAPE_TYPES, PALETTE, NOTE_COLORS } from './elements.js';

const SHAPE_ICONS = {
  rectangle: '<rect x="3" y="5" width="18" height="14" rx="1.5"/>',
  rounded: '<rect x="3" y="5" width="18" height="14" rx="5"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="9" ry="7"/>',
  triangle: '<path d="M12 4l9 16H3z"/>',
  diamond: '<path d="M12 3l9 9-9 9-9-9z"/>',
  pentagon: '<path d="M12 3l9 6.5-3.5 10.5h-11L3 9.5z"/>',
  hexagon: '<path d="M7 4h10l5 8-5 8H7L2 12z"/>',
  star: '<path d="M12 2l3 6.5 7 .8-5.2 4.7 1.5 6.9L12 17.6 5.7 21l1.5-6.9L2 9.3l7-.8z"/>',
  arrow: '<path d="M3 9h10V5l8 7-8 7v-4H3z"/>',
  line: '<path d="M4 20L20 4" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
};

export function buildShapeMenu(app) {
  const menu = document.getElementById('shape-menu');
  menu.innerHTML = '';
  for (const s of SHAPE_TYPES) {
    const b = document.createElement('button');
    b.className = 'shape-opt';
    b.title = s;
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">${SHAPE_ICONS[s]}</svg>`;
    b.addEventListener('click', () => {
      app.currentShape = s;
      app.setTool('shape');
      menu.classList.remove('open');
    });
    menu.appendChild(b);
  }
}

export function buildBrushBar(app) {
  const bar = document.getElementById('brush-bar');
  bar.innerHTML = '';
  const brushes = [
    { type: 'pen', label: 'Bút', icon: '<path d="M4 20l7-7 3 3-7 7H4z"/><path d="M14 6l4 4 2-2a2.8 2.8 0 0 0-4-4z"/>' },
    { type: 'marker', label: 'Bút lông', icon: '<path d="M5 19l3-8 8 3-3 8z"/><path d="M16 14l3-3-5-5-3 3z"/>' },
    { type: 'highlighter', label: 'Dạ quang', icon: '<rect x="4" y="14" width="10" height="6" rx="1"/><path d="M9 14l5-9 5 3-4 6z"/>' },
  ];
  for (const br of brushes) {
    const b = document.createElement('button');
    b.className = 'brush-opt' + (app.brush.type === br.type ? ' active' : '');
    b.title = br.label;
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">${br.icon}</svg>`;
    b.addEventListener('click', () => { app.brush.type = br.type; buildBrushBar(app); });
    bar.appendChild(b);
  }
  const sep = document.createElement('span'); sep.className = 'tool-sep'; bar.appendChild(sep);
  // Màu bút
  const cw = document.createElement('label');
  cw.className = 'brush-color';
  cw.style.background = app.brush.color;
  cw.innerHTML = `<input type="color" value="${app.brush.color}">`;
  cw.querySelector('input').addEventListener('input', (e) => { app.brush.color = e.target.value; cw.style.background = e.target.value; });
  bar.appendChild(cw);
  // Độ dày
  const widths = [3, 6, 12];
  for (const w of widths) {
    const b = document.createElement('button');
    b.className = 'brush-opt' + (app.brush.width === w ? ' active' : '');
    b.innerHTML = `<span style="width:${w + 4}px;height:${w + 4}px;border-radius:50%;background:currentColor;display:block"></span>`;
    b.addEventListener('click', () => { app.brush.width = w; buildBrushBar(app); });
    bar.appendChild(b);
  }
}

// ---- Thanh thuộc tính ngữ cảnh ----
export function refreshContextBar(app) {
  const bar = document.getElementById('context-bar');
  const sel = app.selection;
  if (sel.isEmpty() || app.tool === 'draw') { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  bar.innerHTML = '';

  const items = sel.list();
  const types = new Set(items.map((e) => e.type));
  const first = items[0];

  const addSep = () => { const s = document.createElement('span'); s.className = 'cx-sep'; bar.appendChild(s); };

  // Màu nền (note / shape có tô)
  if (types.has('note') || types.has('shape')) {
    const colors = types.has('note') ? NOTE_COLORS : PALETTE;
    const cur = first.fill || '#0A84FF';
    addSwatchControl(bar, app, 'Màu nền', cur, colors, (c) => {
      items.forEach((e) => { if (e.type === 'note' || e.type === 'shape') { e.fill = c; e.filled = true; } });
    });
  }

  // Màu viền + độ dày (shape / connector / line)
  if (types.has('shape') || types.has('connector')) {
    const cur = first.stroke || first.color || '#1C1C1E';
    addSwatchControl(bar, app, 'Màu viền', cur, PALETTE, (c) => {
      items.forEach((e) => { if (e.type === 'shape') e.stroke = c; if (e.type === 'connector') e.color = c; });
    }, (pop) => addSlider(pop, 'Độ dày', 1, 20, first.strokeWidth || 2, (v) => {
      items.forEach((e) => { e.strokeWidth = v; });
      app.scene.requestRender();
    }));
  }

  // Màu chữ + cỡ chữ (note / text / shape)
  if (types.has('text') || types.has('note') || types.has('shape')) {
    const cur = first.type === 'text' ? first.color : first.textColor || '#1C1C1E';
    addSwatchControl(bar, app, 'Màu chữ', cur, PALETTE, (c) => {
      items.forEach((e) => { if (e.type === 'text') e.color = c; else e.textColor = c; });
    }, (pop) => addSlider(pop, 'Cỡ chữ', 10, 96, first.fontSize || 18, (v) => {
      items.forEach((e) => { e.fontSize = v; });
      app.scene.requestRender();
    }), 'A');
  }

  addSep();

  // Nhân bản
  bar.appendChild(iconBtn('Nhân bản', '<rect x="9" y="9" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    () => app.duplicateSelection()));

  // Khóa
  const locked = items.every((e) => e.locked);
  bar.appendChild(iconBtn(locked ? 'Mở khóa' : 'Khóa',
    locked ? '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V8a4 4 0 0 1 7-2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
      : '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    () => { app.beforeChange(); items.forEach((e) => e.locked = !locked); app.commit(); refreshContextBar(app); app.scene.requestRender(); }));

  // Thứ tự lớp
  bar.appendChild(iconBtn('Đưa lên trước', '<rect x="7" y="3" width="14" height="14" rx="2" fill="currentColor" opacity="0.35"/><rect x="3" y="7" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    () => { app.beforeChange(); items.forEach((e) => app.scene.bringToFront(e)); app.commit(); }));
  bar.appendChild(iconBtn('Đưa xuống sau', '<rect x="3" y="7" width="14" height="14" rx="2" fill="currentColor" opacity="0.35"/><rect x="7" y="3" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    () => { app.beforeChange(); items.forEach((e) => app.scene.sendToBack(e)); app.commit(); }));

  addSep();

  // Xóa
  const del = iconBtn('Xóa', '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    () => app.deleteSelection());
  del.classList.add('danger');
  bar.appendChild(del);

  app.refreshContextPos();
}

function iconBtn(title, svg, onClick) {
  const b = document.createElement('button');
  b.className = 'cx-btn';
  b.title = title;
  b.innerHTML = `<svg viewBox="0 0 24 24">${svg}</svg>`;
  b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return b;
}

function addSwatchControl(bar, app, title, current, colors, onPick, extra, glyph) {
  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  const btn = document.createElement('button');
  btn.className = 'cx-btn';
  btn.title = title;
  if (glyph) {
    btn.innerHTML = `<span style="font-weight:700;font-size:16px;color:${current}">${glyph}</span>`;
  } else {
    btn.innerHTML = `<span class="cx-swatch" style="background:${current}"></span>`;
  }
  const pop = document.createElement('div');
  pop.className = 'cx-pop glass';
  const grid = document.createElement('div');
  grid.className = 'swatch-grid';
  for (const c of colors) {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (c.toLowerCase() === (current || '').toLowerCase() ? ' sel' : '');
    sw.style.background = c;
    sw.addEventListener('click', () => {
      app.beforeChange();
      onPick(c);
      app.commit();
      refreshContextBar(app);
      app.scene.requestRender();
    });
    grid.appendChild(sw);
  }
  pop.appendChild(grid);
  if (extra) extra(pop);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = pop.classList.contains('open');
    closeAllPopovers();
    if (!wasOpen) { pop.classList.add('open'); app.beforeChange(); }
  });
  wrap.appendChild(btn);
  wrap.appendChild(pop);
  bar.appendChild(wrap);
}

function addSlider(pop, label, min, max, value, onInput) {
  const row = document.createElement('div');
  row.className = 'pop-row';
  row.innerHTML = `<span>${label}</span>`;
  const input = document.createElement('input');
  input.type = 'range'; input.min = min; input.max = max; input.value = value;
  const val = document.createElement('span'); val.textContent = value; val.style.minWidth = '26px'; val.style.textAlign = 'right';
  input.addEventListener('input', () => { val.textContent = input.value; onInput(parseInt(input.value, 10)); });
  row.appendChild(input); row.appendChild(val);
  pop.appendChild(row);
}

export function closeAllPopovers() {
  document.querySelectorAll('.cx-pop.open').forEach((p) => p.classList.remove('open'));
  document.querySelectorAll('.dropdown.open').forEach((p) => p.classList.remove('open'));
}
