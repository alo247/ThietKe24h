// input.js — Xử lý mọi tương tác: Pointer Events (chuột/cảm ứng/bút), công cụ, cử chỉ, phím tắt.
import {
  NoteEl, ShapeEl, TextEl, DrawEl, ConnectorEl, ImageEl,
} from './elements.js';
import { normalizeRect, dist } from './geometry.js';

const TAP_SLOP = 6;          // Ngưỡng coi là "chạm" (không kéo)
const DOUBLE_MS = 320;

export class InputController {
  constructor(app) {
    this.app = app;
    this.scene = app.scene;
    this.camera = app.scene.camera;
    this.canvas = app.scene.canvas;
    this.pointers = new Map();
    this.action = null;
    this.spaceDown = false;
    this._lastTapTime = 0;
    this._lastTapPos = null;
    this._bind();
  }

  _bind() {
    const c = this.canvas;
    c.style.touchAction = 'none';
    c.addEventListener('pointerdown', this.onDown.bind(this));
    c.addEventListener('pointermove', this.onMove.bind(this));
    c.addEventListener('pointerup', this.onUp.bind(this));
    c.addEventListener('pointercancel', this.onUp.bind(this));
    c.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    c.addEventListener('dblclick', this.onDblClick.bind(this));
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    // Kéo-thả ảnh vào canvas
    c.addEventListener('dragover', (e) => e.preventDefault());
    c.addEventListener('drop', this.onDrop.bind(this));
    window.addEventListener('paste', this.onPaste.bind(this));
  }

  // ---- Tiện ích tọa độ ----
  _screen(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  _world(e) {
    const s = this._screen(e);
    return this.camera.toWorld(s.x, s.y);
  }

  get tool() { return this.app.tool; }

  // =====================================================================
  //  Pointer Down
  // =====================================================================
  onDown(e) {
    this.canvas.setPointerCapture?.(e.pointerId);
    const s = this._screen(e);
    this.pointers.set(e.pointerId, s);

    // Hai ngón -> cử chỉ pinch (zoom + pan)
    if (this.pointers.size === 2) {
      this._abortAction();
      this._startPinch();
      return;
    }
    if (this.pointers.size > 2) return;

    const world = this.camera.toWorld(s.x, s.y);
    const panMode = this.tool === 'hand' || this.spaceDown || e.button === 1;

    if (panMode) {
      this.action = { type: 'pan', last: s };
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    switch (this.tool) {
      case 'select': this._downSelect(s, world, e); break;
      case 'note': this._downCreate(world, 'note'); break;
      case 'text': this._downCreate(world, 'text'); break;
      case 'image': this.app.pickImage(world); this.app.setTool('select'); break;
      case 'shape': this._downShape(world); break;
      case 'connector': this._downConnector(world); break;
      case 'draw': this._downDraw(world); break;
      case 'erase': this._downErase(world); break;
      default: this._downSelect(s, world, e);
    }
  }

  _downSelect(s, world, e) {
    const sel = this.app.selection;
    // 1) Trúng tay cầm biến đổi?
    const h = sel.hitHandle(s.x, s.y, this.camera);
    if (h) {
      this.app.beforeChange();
      sel.beginTransform(h.kind === 'rotate' ? 'rotate'
        : h.kind === 'groupResize' ? 'groupResize' : 'resize', h.handle);
      this.action = { type: h.kind === 'rotate' ? 'rotate' : (h.kind === 'groupResize' ? 'groupResize' : 'resize') };
      return;
    }
    // 2) Trúng vật thể?
    const hit = this.scene.hitTest(world.x, world.y);
    if (hit) {
      if (e.shiftKey) {
        sel.toggle(hit);
      } else if (!sel.has(hit)) {
        sel.set(hit);
      }
      this.app.refreshUI();
      if (!hit.locked) {
        this.app.beforeChange();
        sel.beginTransform('move');
        this.action = { type: 'move', start: world, moved: false };
      } else {
        this.action = { type: 'noop' };
      }
      this.scene.requestRender();
      return;
    }
    // 3) Vùng trống -> khung chọn (marquee)
    if (!e.shiftKey) { sel.clear(); this.app.refreshUI(); }
    this.action = { type: 'marquee', start: world, cur: world };
    this.scene.requestRender();
  }

  _downCreate(world, kind) {
    this.app.beforeChange();
    let el;
    if (kind === 'note') {
      el = new NoteEl();
      Object.assign(el, this.app.style.note);
      el.x = world.x - el.w / 2; el.y = world.y - el.h / 2;
    } else if (kind === 'text') {
      el = new TextEl();
      el.color = this.app.style.text.color;
      el.fontSize = this.app.style.text.fontSize;
      el.text = '';
      el.x = world.x; el.y = world.y - el.h / 2;
    }
    this.scene.add(el);
    this.app.selection.set(el);
    this.app.setTool('select');
    this.app.commit();
    this.app.refreshUI();
    // Vào chỉnh sửa chữ ngay
    this.app.startTextEdit(el, kind === 'note');
  }

  _downShape(world) {
    this.app.beforeChange();
    const el = new ShapeEl(this.app.currentShape);
    Object.assign(el, this.app.style.shape);
    el.shape = this.app.currentShape;
    el.x = world.x; el.y = world.y; el.w = 1; el.h = 1;
    this.scene.previewElement = el;
    this.action = { type: 'createShape', start: world, el };
  }

  _downConnector(world) {
    this.app.beforeChange();
    const el = new ConnectorEl(world.x, world.y, world.x, world.y);
    el.color = this.app.style.connector.color;
    el.strokeWidth = this.app.style.connector.strokeWidth;
    this.scene.previewElement = el;
    this.action = { type: 'createConnector', start: world, el };
  }

  _downDraw(world) {
    this.app.beforeChange();
    const b = this.app.brush;
    const el = new DrawEl([{ x: world.x, y: world.y }], b.color, b.width, b.type);
    this.scene.previewElement = el;
    this.action = { type: 'draw', el };
  }

  _downErase(world) {
    const hit = this.scene.hitTest(world.x, world.y);
    if (hit) {
      this.app.beforeChange();
      this.scene.remove(hit);
      this.app.selection.clear();
      this.app.commit();
      this.app.refreshUI();
    }
    this.action = { type: 'erasing' };
  }

  // =====================================================================
  //  Pointer Move
  // =====================================================================
  onMove(e) {
    const s = this._screen(e);
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, s);

    if (this.action && this.action.type === 'pinch') { this._updatePinch(); return; }
    if (!this.action) { this._updateCursor(s); return; }

    const world = this.camera.toWorld(s.x, s.y);
    const sel = this.app.selection;

    switch (this.action.type) {
      case 'pan': {
        this.camera.panBy(s.x - this.action.last.x, s.y - this.action.last.y);
        this.action.last = s;
        this.scene.requestRender();
        break;
      }
      case 'marquee': {
        this.action.cur = world;
        this.scene.requestRender();
        break;
      }
      case 'move': {
        const dx = world.x - this.action.start.x;
        const dy = world.y - this.action.start.y;
        if (!this.action.moved && Math.hypot(dx, dy) < 1) break;
        this.action.moved = true;
        const snap = this._snapMove(dx, dy);
        sel.moveBy(snap.dx, snap.dy);
        this.scene.requestRender();
        break;
      }
      case 'resize': sel.resizeSingle(world, e.shiftKey); this.scene.requestRender(); this.app.refreshContextPos(); break;
      case 'groupResize': sel.resizeGroup(world, e.shiftKey); this.scene.requestRender(); break;
      case 'rotate': sel.rotate(world, e.shiftKey); this.scene.requestRender(); break;
      case 'createShape': {
        const r = normalizeRect(this.action.start.x, this.action.start.y,
          world.x - this.action.start.x, world.y - this.action.start.y);
        const el = this.action.el;
        el.x = r.x; el.y = r.y; el.w = Math.max(1, r.w); el.h = Math.max(1, r.h);
        if (el.shape === 'line') { el.y = this.action.start.y; el.h = 2; }
        this.scene.requestRender();
        break;
      }
      case 'createConnector': {
        this.action.el.x2 = world.x; this.action.el.y2 = world.y; this.action.el._recalc();
        this.scene.requestRender();
        break;
      }
      case 'draw': {
        this.action.el.addPoint({ x: world.x, y: world.y });
        this.scene.requestRender();
        break;
      }
      case 'erasing': {
        const hit = this.scene.hitTest(world.x, world.y);
        if (hit) { this.scene.remove(hit); this.scene.requestRender(); }
        break;
      }
    }
  }

  // Bắt dính (snap) khi di chuyển: căn cạnh/tâm với các vật thể khác
  _snapMove(dx, dy) {
    const sel = this.app.selection;
    const b = sel.worldBounds();
    if (!b) return { dx, dy };
    const moved = { x: b.x + dx, y: b.y + dy, w: b.w, h: b.h };
    const TH = 6 / this.camera.zoom;
    const selfCenters = [moved.x, moved.x + moved.w / 2, moved.x + moved.w];
    const selfMids = [moved.y, moved.y + moved.h / 2, moved.y + moved.h];
    let bestX = null, bestY = null;
    this.app.snapGuides = [];
    for (const el of this.scene.elements) {
      if (sel.has(el)) continue;
      const o = el.worldAABB();
      const ox = [o.x, o.x + o.w / 2, o.x + o.w];
      const oy = [o.y, o.y + o.h / 2, o.y + o.h];
      for (const sc of selfCenters) for (const oc of ox) {
        if (Math.abs(sc - oc) < TH && (bestX === null || Math.abs(sc - oc) < Math.abs(bestX.d))) {
          bestX = { d: oc - sc, line: oc };
        }
      }
      for (const sm of selfMids) for (const om of oy) {
        if (Math.abs(sm - om) < TH && (bestY === null || Math.abs(sm - om) < Math.abs(bestY.d))) {
          bestY = { d: om - sm, line: om };
        }
      }
    }
    if (bestX) { dx += bestX.d; this.app.snapGuides.push({ axis: 'x', v: bestX.line }); }
    if (bestY) { dy += bestY.d; this.app.snapGuides.push({ axis: 'y', v: bestY.line }); }
    return { dx, dy };
  }

  _updateCursor(s) {
    if (this.tool !== 'select') return;
    const h = this.app.selection.hitHandle(s.x, s.y, this.camera);
    let cur = 'default';
    if (h) {
      if (h.kind === 'rotate') cur = 'grab';
      else if (h.handle) {
        const map = { n: 'ns', s: 'ns', e: 'ew', w: 'ew', ne: 'nesw', sw: 'nesw', nw: 'nwse', se: 'nwse' };
        cur = (map[h.handle] || 'nwse') + '-resize';
      }
    } else {
      const world = this.camera.toWorld(s.x, s.y);
      if (this.scene.hitTest(world.x, world.y)) cur = 'move';
    }
    this.canvas.style.cursor = cur;
  }

  // =====================================================================
  //  Pointer Up
  // =====================================================================
  onUp(e) {
    this.canvas.releasePointerCapture?.(e.pointerId);
    this.pointers.delete(e.pointerId);

    if (this.action && this.action.type === 'pinch') {
      if (this.pointers.size < 2) { this.action = null; this.app.saveCamera(); }
      return;
    }
    if (!this.action) return;

    const a = this.action;
    this.action = null;
    this.app.snapGuides = [];

    switch (a.type) {
      case 'pan':
        this._updateCursor(this._screen(e));
        this.app.saveCamera();
        break;
      case 'marquee': {
        const r = normalizeRect(a.start.x, a.start.y, a.cur.x - a.start.x, a.cur.y - a.start.y);
        if (r.w > 3 || r.h > 3) {
          const found = this.scene.elementsInRect(r);
          const sel = this.app.selection;
          for (const el of found) sel.add(el);
          this.app.refreshUI();
        }
        this.scene.requestRender();
        break;
      }
      case 'move':
        if (a.moved) this.app.commit();
        this.app.refreshUI();
        break;
      case 'resize':
      case 'groupResize':
      case 'rotate':
        this.app.commit();
        this.app.refreshUI();
        break;
      case 'createShape': {
        const el = a.el;
        this.scene.previewElement = null;
        if (el.w < 6 && el.h < 6) { // Chạm nhẹ -> tạo kích thước mặc định
          el.w = 120; el.h = el.shape === 'line' ? 2 : 120;
          el.x = a.start.x - el.w / 2; el.y = a.start.y - el.h / 2;
        }
        this.scene.add(el);
        this.app.selection.set(el);
        this.app.setTool('select');
        this.app.commit();
        this.app.refreshUI();
        break;
      }
      case 'createConnector': {
        const el = a.el;
        this.scene.previewElement = null;
        if (dist(el.x1, el.y1, el.x2, el.y2) < 6) { el.x2 = el.x1 + 120; el.y2 = el.y1; el._recalc(); }
        this.scene.add(el);
        this.app.selection.set(el);
        this.app.setTool('select');
        this.app.commit();
        this.app.refreshUI();
        break;
      }
      case 'draw': {
        const el = a.el;
        this.scene.previewElement = null;
        this.scene.add(el);
        this.app.commit();
        break;
      }
      case 'erasing':
        this.app.commit();
        break;
    }
  }

  _abortAction() {
    // Hủy hành động một-ngón đang dở khi chuyển sang pinch
    if (this.action && this.scene.previewElement) this.scene.previewElement = null;
    if (this.action && ['move', 'resize', 'groupResize', 'rotate'].includes(this.action.type)) {
      // Khôi phục về trạng thái đầu để tránh biến dạng ngoài ý muốn
      this.app.revertChange();
    }
    this.action = null;
  }

  // =====================================================================
  //  Pinch (2 ngón): zoom + pan
  // =====================================================================
  _startPinch() {
    const pts = Array.from(this.pointers.values());
    this.action = {
      type: 'pinch',
      startDist: dist(pts[0].x, pts[0].y, pts[1].x, pts[1].y),
      startZoom: this.camera.zoom,
      lastMid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
    };
  }
  _updatePinch() {
    const pts = Array.from(this.pointers.values());
    if (pts.length < 2) return;
    const d = dist(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
    const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    const a = this.action;
    const targetZoom = a.startZoom * (d / a.startDist);
    this.camera.setZoom(targetZoom, mid.x, mid.y);
    this.camera.panBy(mid.x - a.lastMid.x, mid.y - a.lastMid.y);
    a.lastMid = mid;
    this.app.refreshZoom();
    this.scene.requestRender();
  }

  // =====================================================================
  //  Bánh xe chuột / Trackpad
  // =====================================================================
  onWheel(e) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Pinch trên trackpad / Ctrl+scroll -> zoom
      const s = this._screen(e);
      const factor = Math.exp(-e.deltaY * 0.01);
      this.camera.zoomAt(s.x, s.y, factor);
    } else {
      // Cuộn -> pan (giữ Shift để cuộn ngang)
      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      const dy = e.shiftKey ? 0 : e.deltaY;
      this.camera.panBy(-dx, -dy);
    }
    this.app.refreshZoom();
    this.scene.requestRender();
    this.app.saveCameraDebounced();
  }

  // =====================================================================
  //  Nhấp đúp -> chỉnh sửa chữ
  // =====================================================================
  onDblClick(e) {
    const world = this._world(e);
    const hit = this.scene.hitTest(world.x, world.y);
    if (hit && (hit.type === 'note' || hit.type === 'text' || hit.type === 'shape')) {
      this.app.selection.set(hit);
      this.app.refreshUI();
      this.app.startTextEdit(hit, hit.type === 'note');
    }
  }

  // =====================================================================
  //  Kéo-thả & Dán ảnh
  // =====================================================================
  onDrop(e) {
    e.preventDefault();
    const world = this._world(e);
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    files.forEach((f, i) => this.app.addImageFile(f, { x: world.x + i * 20, y: world.y + i * 20 }));
  }
  onPaste(e) {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find((it) => it.type.startsWith('image/'));
    if (imgItem) {
      const file = imgItem.getAsFile();
      const c = this.camera.toWorld(this.scene.width / 2, this.scene.height / 2);
      this.app.addImageFile(file, c);
    } else {
      this.app.pasteClipboard();
    }
  }

  // =====================================================================
  //  Bàn phím
  // =====================================================================
  onKeyDown(e) {
    if (this._isEditing()) return;
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;

    if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? this.app.redo() : this.app.undo(); return; }
    if (mod && k === 'y') { e.preventDefault(); this.app.redo(); return; }
    if (mod && k === 'c') { this.app.copySelection(); return; }
    if (mod && k === 'x') { this.app.copySelection(); this.app.deleteSelection(); return; }
    if (mod && k === 'v') { return; } // paste xử lý ở onPaste
    if (mod && k === 'd') { e.preventDefault(); this.app.duplicateSelection(); return; }
    if (mod && k === 'a') { e.preventDefault(); this.app.selectAll(); return; }
    if (mod && k === '0') { e.preventDefault(); this.app.zoomTo(1); return; }
    if (mod && (k === '=' || k === '+')) { e.preventDefault(); this.app.zoomStep(1.2); return; }
    if (mod && k === '-') { e.preventDefault(); this.app.zoomStep(1 / 1.2); return; }

    if (k === 'delete' || k === 'backspace') { e.preventDefault(); this.app.deleteSelection(); return; }
    if (k === 'escape') { this.app.selection.clear(); this.app.refreshUI(); this.scene.requestRender(); return; }
    if (e.key === ' ') { this.spaceDown = true; this.canvas.style.cursor = 'grab'; return; }

    // Phím tắt công cụ
    const tools = { v: 'select', h: 'hand', n: 'note', s: 'shape', t: 'text', p: 'draw', c: 'connector', e: 'erase', i: 'image' };
    if (tools[k] && !mod) { this.app.setTool(tools[k]); }
    // Mũi tên: nhích vật thể
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k) && !this.app.selection.isEmpty()) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      const d = { arrowup: [0, -step], arrowdown: [0, step], arrowleft: [-step, 0], arrowright: [step, 0] }[k];
      this.app.nudgeSelection(d[0], d[1]);
    }
  }
  onKeyUp(e) {
    if (e.key === ' ') { this.spaceDown = false; this.canvas.style.cursor = 'default'; }
  }

  _isEditing() {
    const a = document.activeElement;
    return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
  }
}
