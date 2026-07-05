// selection.js — Lựa chọn, khung điều khiển, và các phép biến đổi (di chuyển/thay đổi kích thước/xoay).
import { rotatePoint, unionBounds, clamp } from './geometry.js';

const HANDLE = 9;      // Bán kính vùng chạm tay cầm (px màn hình)
const HANDLE_VIS = 5;  // Bán kính vẽ tay cầm
const ROTATE_OFFSET = 26;
const MIN_SIZE = 12;

const CORNERS = ['nw', 'ne', 'se', 'sw'];
const EDGES = ['n', 'e', 's', 'w'];
const DIRS = {
  nw: [-1, -1], n: [0, -1], ne: [1, -1], e: [1, 0],
  se: [1, 1], s: [0, 1], sw: [-1, 1], w: [-1, 0],
};

export class Selection {
  constructor(scene) {
    this.scene = scene;
    this.items = new Set();
  }

  clear() { this.items.clear(); }
  set(el) { this.items.clear(); if (el) this.items.add(el); }
  add(el) { if (el) this.items.add(el); }
  toggle(el) { if (this.items.has(el)) this.items.delete(el); else this.items.add(el); }
  has(el) { return this.items.has(el); }
  get size() { return this.items.size; }
  isEmpty() { return this.items.size === 0; }
  list() { return Array.from(this.items); }
  single() { return this.items.size === 1 ? this.list()[0] : null; }

  // Bao hình thế giới (AABB) của toàn bộ lựa chọn
  worldBounds() {
    if (this.isEmpty()) return null;
    return unionBounds(this.list().map((e) => e.worldAABB()));
  }

  // ---- Vẽ khung điều khiển (tọa độ màn hình) ----
  draw(ctx, camera) {
    if (this.isEmpty()) return;
    const single = this.single();
    ctx.save();
    ctx.strokeStyle = '#0A84FF';
    ctx.lineWidth = 1.5;

    if (single) {
      // Khung xoay theo vật thể
      const corners = this._elCornersScreen(single, camera);
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();
      ctx.stroke();

      if (!single.locked && single.type !== 'connector') {
        const handles = this._handlePointsScreen(single, camera);
        // Tay cầm xoay
        const rot = this._rotateHandleScreen(single, camera);
        ctx.beginPath();
        ctx.moveTo((handles.n).x, (handles.n).y);
        ctx.lineTo(rot.x, rot.y);
        ctx.stroke();
        this._dot(ctx, rot.x, rot.y);
        for (const k of [...CORNERS, ...EDGES]) this._dot(ctx, handles[k].x, handles[k].y);
      }
    } else {
      // Nhóm: khung AABB + 4 tay cầm góc
      const b = this.worldBounds();
      const tl = camera.toScreen(b.x, b.y);
      const br = camera.toScreen(b.x + b.w, b.y + b.h);
      ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
      const pts = {
        nw: tl, ne: { x: br.x, y: tl.y }, se: br, sw: { x: tl.x, y: br.y },
      };
      for (const k of CORNERS) this._dot(ctx, pts[k].x, pts[k].y);
    }
    ctx.restore();
  }

  _dot(ctx, x, y) {
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y, HANDLE_VIS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0A84FF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  _elCornersScreen(el, camera) {
    const c = { x: el.cx, y: el.cy };
    return [
      { x: el.x, y: el.y },
      { x: el.x + el.w, y: el.y },
      { x: el.x + el.w, y: el.y + el.h },
      { x: el.x, y: el.y + el.h },
    ].map((p) => {
      const r = rotatePoint(p.x, p.y, c.x, c.y, el.rotation);
      return camera.toScreen(r.x, r.y);
    });
  }

  _handleWorld(el, key) {
    const [hx, hy] = DIRS[key];
    const px = el.x + (hx + 1) / 2 * el.w;
    const py = el.y + (hy + 1) / 2 * el.h;
    return rotatePoint(px, py, el.cx, el.cy, el.rotation);
  }
  _handlePointsScreen(el, camera) {
    const out = {};
    for (const k of [...CORNERS, ...EDGES]) {
      const w = this._handleWorld(el, k);
      out[k] = camera.toScreen(w.x, w.y);
    }
    return out;
  }
  _rotateHandleScreen(el, camera) {
    // Điểm phía trên cạnh N, cách một khoảng cố định theo px màn hình
    const nWorld = this._handleWorld(el, 'n');
    const nScreen = camera.toScreen(nWorld.x, nWorld.y);
    const cScreen = camera.toScreen(el.cx, el.cy);
    const dx = nScreen.x - cScreen.x, dy = nScreen.y - cScreen.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: nScreen.x + (dx / len) * ROTATE_OFFSET, y: nScreen.y + (dy / len) * ROTATE_OFFSET };
  }

  // ---- Dò tay cầm dưới con trỏ (màn hình) ----
  hitHandle(sx, sy, camera) {
    if (this.isEmpty()) return null;
    const single = this.single();
    if (single) {
      if (single.locked || single.type === 'connector') return null;
      const rot = this._rotateHandleScreen(single, camera);
      if (Math.hypot(sx - rot.x, sy - rot.y) <= HANDLE + 2) return { kind: 'rotate' };
      const hs = this._handlePointsScreen(single, camera);
      for (const k of [...CORNERS, ...EDGES]) {
        if (Math.hypot(sx - hs[k].x, sy - hs[k].y) <= HANDLE) return { kind: 'resize', handle: k };
      }
    } else {
      const b = this.worldBounds();
      const tl = camera.toScreen(b.x, b.y);
      const br = camera.toScreen(b.x + b.w, b.y + b.h);
      const pts = { nw: tl, ne: { x: br.x, y: tl.y }, se: br, sw: { x: tl.x, y: br.y } };
      for (const k of CORNERS) {
        if (Math.hypot(sx - pts[k].x, sy - pts[k].y) <= HANDLE) return { kind: 'groupResize', handle: k };
      }
    }
    return null;
  }

  // =============================================================
  //  Bắt đầu & cập nhật phép biến đổi
  // =============================================================
  beginTransform(mode, handle) {
    this._start = this.list().map((el) => this._snapshotEl(el));
    this._mode = mode;
    this._handle = handle;
    if (mode === 'groupResize' || mode === 'resize') {
      this._groupStartBounds = this.worldBounds();
    }
    if (mode === 'rotate') {
      const el = this.single();
      this._rotStart = { rotation: el.rotation };
    }
  }

  _snapshotEl(el) {
    const s = { el, x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation };
    if (el.type === 'draw') s.points = el.points.map((p) => ({ x: p.x, y: p.y }));
    if (el.type === 'connector') { s.x1 = el.x1; s.y1 = el.y1; s.x2 = el.x2; s.y2 = el.y2; }
    return s;
  }

  moveBy(dx, dy) {
    for (const s of this._start) {
      const el = s.el;
      el.x = s.x + dx; el.y = s.y + dy;
      if (el.type === 'draw') {
        el.points = s.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      }
      if (el.type === 'connector') {
        el.x1 = s.x1 + dx; el.y1 = s.y1 + dy; el.x2 = s.x2 + dx; el.y2 = s.y2 + dy; el._recalc();
      }
    }
  }

  // Thay đổi kích thước một vật thể (có xét xoay)
  resizeSingle(pWorld, keepAspect) {
    const s = this._start[0];
    const el = s.el;
    const [hx, hy] = DIRS[this._handle];
    const r = s.rotation;
    const u = { x: Math.cos(r), y: Math.sin(r) };
    const v = { x: -Math.sin(r), y: Math.cos(r) };
    const c0 = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
    // Neo = tay cầm đối diện (giữ cố định trong thế giới)
    const anchor = {
      x: c0.x - u.x * (hx * s.w / 2) - v.x * (hy * s.h / 2),
      y: c0.y - u.y * (hx * s.w / 2) - v.y * (hy * s.h / 2),
    };
    const d = { x: pWorld.x - anchor.x, y: pWorld.y - anchor.y };
    let newW = hx !== 0 ? Math.max(MIN_SIZE, (d.x * u.x + d.y * u.y) * hx) : s.w;
    let newH = hy !== 0 ? Math.max(MIN_SIZE, (d.x * v.x + d.y * v.y) * hy) : s.h;

    const aspect = s.w / s.h;
    const lockAspect = keepAspect || el.type === 'image';
    if (lockAspect && hx !== 0 && hy !== 0) {
      // Ép theo tỉ lệ dựa trên trục thay đổi nhiều hơn
      if (newW / s.w > newH / s.h) newH = newW / aspect; else newW = newH * aspect;
    }

    const cNew = {
      x: anchor.x + u.x * (hx * newW / 2) + v.x * (hy * newH / 2),
      y: anchor.y + u.y * (hx * newW / 2) + v.y * (hy * newH / 2),
    };
    el.w = newW; el.h = newH;
    el.x = cNew.x - newW / 2; el.y = cNew.y - newH / 2;
    if (el.type === 'text') el.autoHeight = false;
  }

  // Thay đổi kích thước nhóm (co giãn đồng nhất từ góc đối diện)
  resizeGroup(pWorld, keepAspect) {
    const b = this._groupStartBounds;
    const [hx, hy] = DIRS[this._handle];
    const anchor = { x: hx < 0 ? b.x + b.w : b.x, y: hy < 0 ? b.y + b.h : b.y };
    let sx = Math.abs(pWorld.x - anchor.x) / b.w;
    let sy = Math.abs(pWorld.y - anchor.y) / b.h;
    let s = Math.max(0.05, Math.min(sx, sy)); // Đồng nhất để không méo
    for (const snap of this._start) {
      const el = snap.el;
      el.w = Math.max(MIN_SIZE, snap.w * s);
      el.h = Math.max(MIN_SIZE, snap.h * s);
      el.x = anchor.x + (snap.x - anchor.x) * s;
      el.y = anchor.y + (snap.y - anchor.y) * s;
      if (el.type === 'draw') {
        el.points = snap.points.map((p) => ({
          x: anchor.x + (p.x - anchor.x) * s,
          y: anchor.y + (p.y - anchor.y) * s,
        }));
        el.strokeWidth = Math.max(1, el.strokeWidth);
      }
      if (el.type === 'connector') {
        el.x1 = anchor.x + (snap.x1 - anchor.x) * s;
        el.y1 = anchor.y + (snap.y1 - anchor.y) * s;
        el.x2 = anchor.x + (snap.x2 - anchor.x) * s;
        el.y2 = anchor.y + (snap.y2 - anchor.y) * s;
        el._recalc();
      }
    }
  }

  rotate(pWorld, snap) {
    const el = this.single();
    const c = { x: el.cx, y: el.cy };
    let ang = Math.atan2(pWorld.y - c.y, pWorld.x - c.x) + Math.PI / 2;
    if (snap) ang = Math.round(ang / (Math.PI / 12)) * (Math.PI / 12);
    el.rotation = ang;
  }
}
