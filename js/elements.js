// elements.js — Mô hình đối tượng trên canvas (note, shape, text, drawing, image, connector).
// Mọi đối tượng tự vẽ trong hệ tọa độ THẾ GIỚI (Scene đã áp phép biến đổi camera trước khi vẽ).
import {
  uid, pointInRotatedRect, boundsOfPoints, distToSegment, rotatePoint,
} from './geometry.js';

export const FONT_STACK = "'Inter','Outfit',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

// Bảng màu pastel giống Apple Freeform
export const PALETTE = [
  '#FFD60A', '#FF9F0A', '#FF453A', '#FF375F', '#BF5AF2',
  '#0A84FF', '#64D2FF', '#30D158', '#FFFFFF', '#8E8E93', '#1C1C1E',
];
export const NOTE_COLORS = [
  '#FEF3C7', '#FDE68A', '#FBCFE8', '#DDD6FE', '#BFDBFE',
  '#BBF7D0', '#FED7AA', '#E5E7EB', '#374151',
];

// ---- Vẽ chữ nhiều dòng, tự xuống hàng ----
function wrapLines(ctx, text, maxWidth) {
  const paragraphs = String(text).split('\n');
  const lines = [];
  for (const para of paragraphs) {
    if (para === '') { lines.push(''); continue; }
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawWrappedText(ctx, text, box, opts) {
  const { color, fontSize, align = 'center', valign = 'middle', padding = 14, bold = false } = opts;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.font = `${bold ? '600 ' : ''}${fontSize}px ${FONT_STACK}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  const maxWidth = box.w - padding * 2;
  const lineHeight = fontSize * 1.3;
  const lines = wrapLines(ctx, text, maxWidth);
  const totalH = lines.length * lineHeight;
  let startY = box.y + padding;
  if (valign === 'middle') startY = box.y + (box.h - totalH) / 2;
  else if (valign === 'bottom') startY = box.y + box.h - padding - totalH;
  ctx.textAlign = align;
  let tx = box.x + padding;
  if (align === 'center') tx = box.x + box.w / 2;
  else if (align === 'right') tx = box.x + box.w - padding;
  lines.forEach((ln, i) => ctx.fillText(ln, tx, startY + i * lineHeight));
  ctx.restore();
}

// =====================================================================
//  Lớp cơ sở
// =====================================================================
export class El {
  constructor(type) {
    this.id = uid();
    this.type = type;
    this.x = 0; this.y = 0; this.w = 120; this.h = 120;
    this.rotation = 0;
    this.locked = false;
    this.opacity = 1;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }

  bounds() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  // Bao hình sau khi xoay (dùng cho fit & marquee)
  worldAABB() {
    if (!this.rotation) return this.bounds();
    const c = { x: this.cx, y: this.cy };
    const corners = [
      { x: this.x, y: this.y },
      { x: this.x + this.w, y: this.y },
      { x: this.x + this.w, y: this.y + this.h },
      { x: this.x, y: this.y + this.h },
    ].map((p) => rotatePoint(p.x, p.y, c.x, c.y, this.rotation));
    return boundsOfPoints(corners);
  }

  hitTest(wx, wy) {
    return pointInRotatedRect(wx, wy, this.bounds(), this.rotation);
  }

  _applyTransform(ctx) {
    ctx.globalAlpha = this.opacity;
    if (this.rotation) {
      ctx.translate(this.cx, this.cy);
      ctx.rotate(this.rotation);
      ctx.translate(-this.cx, -this.cy);
    }
  }

  draw(ctx) { /* override */ }

  serialize() {
    return {
      id: this.id, type: this.type, x: this.x, y: this.y, w: this.w, h: this.h,
      rotation: this.rotation, locked: this.locked, opacity: this.opacity,
    };
  }
  _readBase(d) {
    this.id = d.id ?? this.id;
    this.x = d.x; this.y = d.y; this.w = d.w; this.h = d.h;
    this.rotation = d.rotation || 0;
    this.locked = !!d.locked;
    this.opacity = d.opacity ?? 1;
  }
}

// =====================================================================
//  Ghi chú dán (Sticky Note)
// =====================================================================
export class NoteEl extends El {
  constructor() {
    super('note');
    this.w = 180; this.h = 180;
    this.fill = '#FEF3C7';
    this.text = '';
    this.textColor = '#1C1C1E';
    this.fontSize = 18;
  }
  draw(ctx) {
    ctx.save();
    this._applyTransform(ctx);
    // Bóng đổ nhẹ
    ctx.shadowColor = 'rgba(0,0,0,0.16)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = this.fill;
    roundRectPath(ctx, this.x, this.y, this.w, this.h, 10);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // Chữ
    const dark = isDark(this.fill);
    drawWrappedText(ctx, this.text || '', this.bounds(), {
      color: this.textColor || (dark ? '#fff' : '#1C1C1E'),
      fontSize: this.fontSize, align: 'center', valign: 'middle', padding: 16,
    });
    ctx.restore();
  }
  serialize() {
    return Object.assign(super.serialize(), {
      fill: this.fill, text: this.text, textColor: this.textColor, fontSize: this.fontSize,
    });
  }
  static from(d) {
    const e = new NoteEl(); e._readBase(d);
    e.fill = d.fill; e.text = d.text || ''; e.textColor = d.textColor; e.fontSize = d.fontSize || 18;
    return e;
  }
}

// =====================================================================
//  Hình dạng (Shape)
// =====================================================================
export const SHAPE_TYPES = [
  'rectangle', 'rounded', 'ellipse', 'triangle', 'diamond',
  'pentagon', 'hexagon', 'star', 'arrow', 'line',
];

export class ShapeEl extends El {
  constructor(shape = 'rectangle') {
    super('shape');
    this.shape = shape;
    this.fill = '#0A84FF';
    this.stroke = '#0A84FF';
    this.strokeWidth = 2;
    this.filled = true;
    this.text = '';
    this.textColor = '#FFFFFF';
    this.fontSize = 18;
    if (shape === 'line') { this.h = 2; this.filled = false; this.strokeWidth = 4; }
  }

  _path(ctx) {
    const { x, y, w, h } = this;
    switch (this.shape) {
      case 'rounded': roundRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.18); break;
      case 'ellipse':
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
        break;
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h / 2);
        ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath();
        break;
      case 'pentagon': polygonPath(ctx, x, y, w, h, 5, -Math.PI / 2); break;
      case 'hexagon': polygonPath(ctx, x, y, w, h, 6, 0); break;
      case 'star': starPath(ctx, x, y, w, h, 5); break;
      case 'arrow': arrowPath(ctx, x, y, w, h); break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
        break;
      default: // rectangle
        ctx.beginPath(); ctx.rect(x, y, w, h);
    }
  }

  draw(ctx) {
    ctx.save();
    this._applyTransform(ctx);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    this._path(ctx);
    if (this.shape !== 'line' && this.filled) {
      ctx.fillStyle = this.fill;
      ctx.fill();
    }
    if (this.strokeWidth > 0 && (this.shape === 'line' || !this.filled || this.stroke !== this.fill)) {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke();
    }
    if (this.text && this.shape !== 'line') {
      drawWrappedText(ctx, this.text, this.bounds(), {
        color: this.textColor, fontSize: this.fontSize, align: 'center', valign: 'middle', padding: 12,
      });
    }
    ctx.restore();
  }

  hitTest(wx, wy) {
    if (this.shape === 'line') {
      // Với line: hit theo khoảng cách tới đoạn thẳng
      const c = { x: this.cx, y: this.cy };
      const p = rotatePoint(wx, wy, c.x, c.y, -this.rotation);
      const tol = Math.max(8, this.strokeWidth);
      return distToSegment(p.x, p.y, this.x, this.y + this.h / 2, this.x + this.w, this.y + this.h / 2) <= tol;
    }
    return super.hitTest(wx, wy);
  }

  serialize() {
    return Object.assign(super.serialize(), {
      shape: this.shape, fill: this.fill, stroke: this.stroke, strokeWidth: this.strokeWidth,
      filled: this.filled, text: this.text, textColor: this.textColor, fontSize: this.fontSize,
    });
  }
  static from(d) {
    const e = new ShapeEl(d.shape); e._readBase(d);
    e.fill = d.fill; e.stroke = d.stroke; e.strokeWidth = d.strokeWidth;
    e.filled = d.filled !== false; e.text = d.text || '';
    e.textColor = d.textColor; e.fontSize = d.fontSize || 18;
    return e;
  }
}

// =====================================================================
//  Văn bản (Text)
// =====================================================================
export class TextEl extends El {
  constructor() {
    super('text');
    this.w = 200; this.h = 40;
    this.text = 'Văn bản';
    this.color = '#1C1C1E';
    this.fontSize = 28;
    this.align = 'left';
    this.autoHeight = true;
  }
  measure(ctx) {
    ctx.font = `${this.fontSize}px ${FONT_STACK}`;
    const lines = wrapLines(ctx, this.text || ' ', this.w - 4);
    this.h = Math.max(this.fontSize * 1.3, lines.length * this.fontSize * 1.3) + 8;
    return lines;
  }
  draw(ctx) {
    ctx.save();
    this._applyTransform(ctx);
    this.measure(ctx);
    drawWrappedText(ctx, this.text || '', this.bounds(), {
      color: this.color, fontSize: this.fontSize, align: this.align, valign: 'top', padding: 2,
    });
    ctx.restore();
  }
  serialize() {
    return Object.assign(super.serialize(), {
      text: this.text, color: this.color, fontSize: this.fontSize, align: this.align,
    });
  }
  static from(d) {
    const e = new TextEl(); e._readBase(d);
    e.text = d.text || ''; e.color = d.color; e.fontSize = d.fontSize || 28; e.align = d.align || 'left';
    return e;
  }
}

// =====================================================================
//  Nét vẽ tay (Freehand drawing)
// =====================================================================
export class DrawEl extends El {
  constructor(points = [], color = '#1C1C1E', strokeWidth = 4, brush = 'pen') {
    super('draw');
    this.points = points; // [{x,y}] trong tọa độ thế giới
    this.color = color;
    this.strokeWidth = strokeWidth;
    this.brush = brush; // 'pen' | 'marker' | 'highlighter'
    this._recalc();
  }
  _recalc() {
    const b = boundsOfPoints(this.points);
    const pad = this.strokeWidth;
    this.x = b.x - pad; this.y = b.y - pad;
    this.w = b.w + pad * 2; this.h = b.h + pad * 2;
  }
  addPoint(p) { this.points.push(p); this._recalc(); }

  draw(ctx) {
    if (this.points.length < 1) return;
    ctx.save();
    this._applyTransform(ctx);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (this.brush === 'highlighter') { ctx.globalAlpha = this.opacity * 0.4; ctx.lineCap = 'butt'; }
    ctx.beginPath();
    const pts = this.points;
    if (pts.length === 1) {
      ctx.arc(pts[0].x, pts[0].y, this.strokeWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color; ctx.fill();
    } else {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  hitTest(wx, wy) {
    const c = { x: this.cx, y: this.cy };
    const p = rotatePoint(wx, wy, c.x, c.y, -this.rotation);
    const tol = Math.max(10, this.strokeWidth);
    for (let i = 0; i < this.points.length - 1; i++) {
      if (distToSegment(p.x, p.y, this.points[i].x, this.points[i].y,
        this.points[i + 1].x, this.points[i + 1].y) <= tol) return true;
    }
    if (this.points.length === 1) {
      return Math.hypot(p.x - this.points[0].x, p.y - this.points[0].y) <= tol;
    }
    return false;
  }

  serialize() {
    // Lưu điểm theo tọa độ tương đối để nhỏ gọn và bền vững
    return Object.assign(super.serialize(), {
      color: this.color, strokeWidth: this.strokeWidth, brush: this.brush,
      points: this.points.map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
    });
  }
  static from(d) {
    const pts = (d.points || []).map((p) => Array.isArray(p) ? { x: p[0], y: p[1] } : p);
    const e = new DrawEl(pts, d.color, d.strokeWidth, d.brush);
    e.id = d.id ?? e.id;
    e.rotation = d.rotation || 0; e.locked = !!d.locked; e.opacity = d.opacity ?? 1;
    e._recalc();
    return e;
  }
}

// =====================================================================
//  Hình ảnh (Image)
// =====================================================================
export class ImageEl extends El {
  constructor(src, w = 240, h = 180) {
    super('image');
    this.src = src;
    this.w = w; this.h = h;
    this.img = null;
    this.loaded = false;
    if (src) this._load();
  }
  _load(onload) {
    const img = new Image();
    img.onload = () => {
      this.img = img; this.loaded = true;
      if (onload) onload();
    };
    img.src = this.src;
  }
  draw(ctx) {
    ctx.save();
    this._applyTransform(ctx);
    roundRectPath(ctx, this.x, this.y, this.w, this.h, 6);
    ctx.clip();
    if (this.loaded && this.img) {
      ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = '#E5E7EB';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    ctx.restore();
  }
  serialize() {
    return Object.assign(super.serialize(), { src: this.src });
  }
  static from(d, onload) {
    const e = new ImageEl(null, d.w, d.h);
    e._readBase(d);
    e.src = d.src;
    if (d.src) e._load(onload);
    return e;
  }
}

// =====================================================================
//  Đường nối / Thước đo (Connector) — đoạn thẳng có mũi tên tùy chọn
// =====================================================================
export class ConnectorEl extends El {
  constructor(x1, y1, x2, y2) {
    super('connector');
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
    this.color = '#1C1C1E';
    this.strokeWidth = 3;
    this.arrowEnd = true;
    this.arrowStart = false;
    this._recalc();
  }
  _recalc() {
    this.x = Math.min(this.x1, this.x2);
    this.y = Math.min(this.y1, this.y2);
    this.w = Math.abs(this.x2 - this.x1);
    this.h = Math.abs(this.y2 - this.y1);
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.strokeWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
    const ang = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    if (this.arrowEnd) drawArrowHead(ctx, this.x2, this.y2, ang, this.strokeWidth);
    if (this.arrowStart) drawArrowHead(ctx, this.x1, this.y1, ang + Math.PI, this.strokeWidth);
    ctx.restore();
  }
  hitTest(wx, wy) {
    const tol = Math.max(10, this.strokeWidth);
    return distToSegment(wx, wy, this.x1, this.y1, this.x2, this.y2) <= tol;
  }
  serialize() {
    return Object.assign(super.serialize(), {
      x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2,
      color: this.color, strokeWidth: this.strokeWidth,
      arrowEnd: this.arrowEnd, arrowStart: this.arrowStart,
    });
  }
  static from(d) {
    const e = new ConnectorEl(d.x1, d.y1, d.x2, d.y2);
    e.id = d.id ?? e.id;
    e.color = d.color; e.strokeWidth = d.strokeWidth;
    e.arrowEnd = d.arrowEnd !== false; e.arrowStart = !!d.arrowStart;
    e.opacity = d.opacity ?? 1; e.locked = !!d.locked;
    e._recalc();
    return e;
  }
}

// =====================================================================
//  Tiện ích vẽ hình học
// =====================================================================
export function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function polygonPath(ctx, x, y, w, h, sides, startAngle) {
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = startAngle + (i / sides) * Math.PI * 2;
    const px = cx + Math.cos(a) * rx;
    const py = cy + Math.sin(a) * ry;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function starPath(ctx, x, y, w, h, points) {
  const cx = x + w / 2, cy = y + h / 2, outerX = w / 2, outerY = h / 2;
  const innerX = outerX * 0.42, innerY = outerY * 0.42;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
    const rx = i % 2 === 0 ? outerX : innerX;
    const ry = i % 2 === 0 ? outerY : innerY;
    const px = cx + Math.cos(a) * rx;
    const py = cy + Math.sin(a) * ry;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function arrowPath(ctx, x, y, w, h) {
  const midY = y + h / 2;
  const bodyTop = y + h * 0.3;
  const bodyBot = y + h * 0.7;
  const headX = x + w * 0.6;
  ctx.beginPath();
  ctx.moveTo(x, bodyTop);
  ctx.lineTo(headX, bodyTop);
  ctx.lineTo(headX, y + h * 0.1);
  ctx.lineTo(x + w, midY);
  ctx.lineTo(headX, y + h * 0.9);
  ctx.lineTo(headX, bodyBot);
  ctx.lineTo(x, bodyBot);
  ctx.closePath();
}

function drawArrowHead(ctx, x, y, angle, sw) {
  const size = 8 + sw * 1.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.5);
  ctx.lineTo(-size, size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function isDark(hex) {
  if (!hex || hex[0] !== '#') return false;
  const c = hex.length === 4
    ? hex.slice(1).split('').map((h) => parseInt(h + h, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  return lum < 0.5;
}

// Bộ giải mã chung từ dữ liệu JSON -> đối tượng
export function elementFromData(d, onImgLoad) {
  switch (d.type) {
    case 'note': return NoteEl.from(d);
    case 'shape': return ShapeEl.from(d);
    case 'text': return TextEl.from(d);
    case 'draw': return DrawEl.from(d);
    case 'image': return ImageEl.from(d, onImgLoad);
    case 'connector': return ConnectorEl.from(d);
    default: return null;
  }
}

export { drawWrappedText, isDark };
