// main.js — Bộ điều khiển ứng dụng: kết nối Scene, Selection, History, Input, UI.
import { Scene } from './scene.js';
import { Selection } from './selection.js';
import { History } from './history.js';
import { InputController } from './input.js';
import { buildShapeMenu, buildBrushBar, refreshContextBar, closeAllPopovers } from './ui.js';
import { NoteEl, TextEl, ImageEl, elementFromData, FONT_STACK } from './elements.js';
import { Store } from './store.js';
import { unionBounds } from './geometry.js';

class App {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.scene = new Scene(this.canvas);
    this.selection = new Selection(this.scene);
    this.history = new History(120);

    this.tool = 'select';
    this.currentShape = 'rectangle';
    this.brush = { color: '#1C1C1E', width: 6, type: 'pen' };
    this.style = {
      note: { fill: '#FEF3C7', textColor: '#1C1C1E', fontSize: 18 },
      shape: { fill: '#0A84FF', stroke: '#0A84FF', strokeWidth: 2, filled: true },
      text: { color: '#1C1C1E', fontSize: 28 },
      connector: { color: '#1C1C1E', strokeWidth: 3 },
    };
    this.snapGuides = [];
    this.clipboard = null;
    this._pendingImageWorld = null;
    this._camSaveTimer = null;

    this.scene.drawOverlay = (ctx) => this.drawOverlay(ctx);
    this.input = new InputController(this);

    buildShapeMenu(this);
    buildBrushBar(this);
    this._wireUI();
    this._initResize();
    this._load();
    this.setTool('select');
    this.refreshZoom();
    this._updateUndoRedo();
  }

  // =========================== Khởi tạo ===========================
  _initResize() {
    const doResize = () => this.scene.resize();
    window.addEventListener('resize', doResize);
    window.addEventListener('orientationchange', doResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', doResize);
    doResize();
  }

  _load() {
    const cam = Store.loadCamera();
    if (cam) { this.scene.camera.x = cam.x; this.scene.camera.y = cam.y; this.scene.camera.zoom = cam.zoom; }
    else this.scene.camera.reset(this.scene.width, this.scene.height);
    const doc = Store.loadDoc();
    if (doc) this.scene.loadJSON(doc, () => this.scene.requestRender());
    this.history.reset(this.scene.toJSON());
    this.scene.requestRender();
  }

  // =========================== Công cụ ===========================
  setTool(name) {
    this.tool = name;
    document.querySelectorAll('.tool').forEach((b) => b.classList.toggle('active', b.dataset.tool === name));
    document.getElementById('brush-bar').classList.toggle('hidden', name !== 'draw');
    if (name !== 'draw') closeAllPopovers();
    if (name === 'draw') buildBrushBar(this);
    const cursors = { select: 'default', hand: 'grab', draw: 'crosshair', erase: 'crosshair',
      note: 'crosshair', shape: 'crosshair', text: 'text', connector: 'crosshair', image: 'crosshair' };
    this.canvas.style.cursor = cursors[name] || 'default';
    this.refreshContextBar();
  }

  // =========================== Lịch sử ===========================
  beforeChange() { this._revert = this.scene.toJSON(); }
  revertChange() { if (this._revert) { this._restore(this._revert); } }
  commit() {
    const snap = this.scene.toJSON();
    this.history.push(snap);
    Store.saveDoc(snap);
    this._updateUndoRedo();
  }
  _restore(json) {
    const keepIds = new Set(this.selection.list().map((e) => e.id));
    this.scene.loadJSON(json, () => this.scene.requestRender());
    // Khôi phục lựa chọn theo id
    this.selection.clear();
    for (const el of this.scene.elements) if (keepIds.has(el.id)) this.selection.add(el);
    this.refreshUI();
  }
  undo() {
    const snap = this.history.undo();
    if (snap != null) { this._restore(snap); Store.saveDoc(snap); }
    this._updateUndoRedo();
  }
  redo() {
    const snap = this.history.redo();
    if (snap != null) { this._restore(snap); Store.saveDoc(snap); }
    this._updateUndoRedo();
  }
  _updateUndoRedo() {
    document.getElementById('btn-undo').disabled = !this.history.canUndo();
    document.getElementById('btn-redo').disabled = !this.history.canRedo();
  }

  // =========================== Chọn / Thao tác ===========================
  selectAll() {
    this.selection.clear();
    for (const el of this.scene.elements) if (!el.locked) this.selection.add(el);
    this.refreshUI();
    this.scene.requestRender();
  }
  deleteSelection() {
    if (this.selection.isEmpty()) return;
    this.beforeChange();
    this.scene.removeMany(this.selection.items);
    this.selection.clear();
    this.commit();
    this.refreshUI();
    this.scene.requestRender();
  }
  nudgeSelection(dx, dy) {
    this.beforeChange();
    for (const el of this.selection.list()) {
      el.x += dx; el.y += dy;
      if (el.type === 'draw') el.points.forEach((p) => { p.x += dx; p.y += dy; });
      if (el.type === 'connector') { el.x1 += dx; el.y1 += dy; el.x2 += dx; el.y2 += dy; el._recalc(); }
    }
    this.commit();
    this.scene.requestRender();
  }
  copySelection() {
    if (this.selection.isEmpty()) return;
    this.clipboard = this.selection.list().map((e) => e.serialize());
  }
  duplicateSelection() {
    if (this.selection.isEmpty()) return;
    this._pasteData(this.selection.list().map((e) => e.serialize()), 24);
  }
  pasteClipboard() {
    if (this.clipboard) this._pasteData(this.clipboard, 28);
  }
  _pasteData(dataArr, off) {
    this.beforeChange();
    this.selection.clear();
    for (const raw of dataArr) {
      const d = JSON.parse(JSON.stringify(raw));
      d.id = undefined;
      if (d.type === 'draw') d.points = (d.points || []).map((p) => [p[0] + off, p[1] + off]);
      else if (d.type === 'connector') { d.x1 += off; d.y1 += off; d.x2 += off; d.y2 += off; }
      else { d.x += off; d.y += off; }
      const el = elementFromData(d, () => this.scene.requestRender());
      if (el) { this.scene.add(el); this.selection.add(el); }
    }
    this.commit();
    this.refreshUI();
    this.scene.requestRender();
  }

  // =========================== Chỉnh sửa chữ ===========================
  startTextEdit(el, isNote) {
    const ta = document.getElementById('text-editor');
    const cam = this.scene.camera;
    const z = cam.zoom;
    this._editing = el;
    ta.value = el.text || '';
    ta.classList.remove('hidden');

    const place = () => {
      const s = cam.toScreen(el.x, el.y);
      ta.style.left = s.x + 'px';
      ta.style.top = s.y + 'px';
      ta.style.width = Math.max(60, el.w * z) + 'px';
      ta.style.height = Math.max(30, el.h * z) + 'px';
      ta.style.fontSize = (el.fontSize * z) + 'px';
      ta.style.fontFamily = FONT_STACK;
      ta.style.color = el.type === 'text' ? el.color : (el.textColor || '#1C1C1E');
      ta.style.textAlign = el.type === 'text' ? el.align : 'center';
      ta.style.background = el.type === 'note' ? el.fill : 'rgba(255,255,255,0.9)';
    };
    place();
    setTimeout(() => { ta.focus(); ta.select(); }, 0);

    const onInput = () => {
      el.text = ta.value;
      if (el.type === 'text') {
        const ctx = this.scene.ctx;
        ctx.font = `${el.fontSize}px ${FONT_STACK}`;
        el.w = Math.max(80, ctx.measureText(ta.value.split('\n').sort((a, b) => b.length - a.length)[0] || ' ').width + 20);
        place();
      }
      this.scene.requestRender();
    };
    const finish = () => {
      ta.removeEventListener('input', onInput);
      ta.removeEventListener('blur', finish);
      ta.removeEventListener('keydown', onKey);
      ta.classList.add('hidden');
      el.text = ta.value;
      this._editing = null;
      // Nếu là text mới mà rỗng -> xóa
      if (el.type === 'text' && !el.text.trim()) {
        this.scene.remove(el);
        this.selection.clear();
      }
      this.commit();
      this.refreshUI();
      this.scene.requestRender();
    };
    const onKey = (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { ta.blur(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { ta.blur(); }
    };
    ta.addEventListener('input', onInput);
    ta.addEventListener('blur', finish);
    ta.addEventListener('keydown', onKey);
  }

  // =========================== Ảnh ===========================
  pickImage(world) {
    this._pendingImageWorld = world;
    document.getElementById('file-image').click();
  }
  addImageFile(file, world) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.beforeChange();
        const maxW = 360;
        const scale = Math.min(1, maxW / img.width);
        const w = img.width * scale, h = img.height * scale;
        const el = new ImageEl(reader.result, w, h);
        el.x = (world?.x ?? this.scene.camera.toWorld(this.scene.width / 2, this.scene.height / 2).x) - w / 2;
        el.y = (world?.y ?? this.scene.camera.toWorld(this.scene.width / 2, this.scene.height / 2).y) - h / 2;
        el._load(() => this.scene.requestRender());
        this.scene.add(el);
        this.selection.set(el);
        this.commit();
        this.refreshUI();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // =========================== Thu phóng ===========================
  zoomTo(z) { this.scene.camera.setZoom(z, this.scene.width / 2, this.scene.height / 2); this.refreshZoom(); this.scene.requestRender(); this.saveCamera(); }
  zoomStep(f) { this.scene.camera.zoomAt(this.scene.width / 2, this.scene.height / 2, f); this.refreshZoom(); this.scene.requestRender(); this.saveCamera(); }
  fit() {
    const b = unionBounds(this.scene.elements.map((e) => e.worldAABB()));
    if (!b) { this.scene.camera.reset(this.scene.width, this.scene.height); }
    else this.scene.camera.fitBounds(b, this.scene.width, this.scene.height);
    this.refreshZoom(); this.scene.requestRender(); this.saveCamera();
  }
  refreshZoom() {
    document.getElementById('zoom-level').textContent = Math.round(this.scene.camera.zoom * 100) + '%';
  }
  saveCamera() { Store.saveCamera(this.scene.camera); }
  saveCameraDebounced() {
    clearTimeout(this._camSaveTimer);
    this._camSaveTimer = setTimeout(() => this.saveCamera(), 400);
  }

  // =========================== Giao diện ===========================
  refreshUI() { this.refreshContextBar(); this._updateUndoRedo(); this.scene.requestRender(); }
  refreshContextBar() { refreshContextBar(this); }
  refreshContextPos() { /* Vị trí do CSS xử lý (căn giữa trên / dưới) */ }

  drawOverlay(ctx) {
    // Đường gióng (snap guides)
    if (this.snapGuides && this.snapGuides.length) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,45,85,0.9)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (const g of this.snapGuides) {
        ctx.beginPath();
        if (g.axis === 'x') {
          const s = this.scene.camera.toScreen(g.v, 0);
          ctx.moveTo(s.x, 0); ctx.lineTo(s.x, this.scene.height);
        } else {
          const s = this.scene.camera.toScreen(0, g.v);
          ctx.moveTo(0, s.y); ctx.lineTo(this.scene.width, s.y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
    // Ẩn khung chọn khi đang soạn chữ
    if (!this._editing) this.selection.draw(ctx, this.scene.camera);
  }

  // =========================== Menu & Nút tĩnh ===========================
  _wireUI() {
    // Nút công cụ
    document.querySelectorAll('.tool').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const t = btn.dataset.tool;
        if (t === 'shape') {
          const menu = document.getElementById('shape-menu');
          const open = menu.classList.contains('open');
          closeAllPopovers();
          if (!open) menu.classList.add('open');
          this.setTool('shape');
          return;
        }
        this.setTool(t);
      });
    });

    // Menu dự án
    const projBtn = document.getElementById('btn-project');
    const projMenu = document.getElementById('project-menu');
    projBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = projMenu.classList.contains('open');
      closeAllPopovers();
      if (!open) projMenu.classList.add('open');
    });
    projMenu.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', () => { this._projectAction(item.dataset.act); closeAllPopovers(); });
    });

    // Undo/Redo/Fit/Fullscreen
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.redo());
    document.getElementById('btn-fit').addEventListener('click', () => this.fit());
    document.getElementById('btn-fullscreen').addEventListener('click', () => this._toggleFullscreen());

    // Zoom
    document.getElementById('zoom-in').addEventListener('click', () => this.zoomStep(1.2));
    document.getElementById('zoom-out').addEventListener('click', () => this.zoomStep(1 / 1.2));
    document.getElementById('zoom-level').addEventListener('click', () => this.zoomTo(1));

    // File inputs
    document.getElementById('file-image').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) this.addImageFile(f, this._pendingImageWorld);
      e.target.value = '';
    });
    document.getElementById('file-open').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) { const r = new FileReader(); r.onload = () => this._openJSON(r.result); r.readAsText(f); }
      e.target.value = '';
    });

    // Nhấp ra ngoài -> đóng popover
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.dropdown') && !e.target.closest('.menu-trigger')
        && !e.target.closest('#btn-shape') && !e.target.closest('.cx-pop') && !e.target.closest('.cx-btn')) {
        closeAllPopovers();
      }
    });

    // Đổi tên bảng vẽ
    const title = document.getElementById('doc-title');
    title.addEventListener('dblclick', () => {
      const name = prompt('Tên bảng vẽ:', title.textContent);
      if (name) title.textContent = name;
    });
  }

  _projectAction(act) {
    switch (act) {
      case 'new':
        if (confirm('Tạo bảng vẽ mới? Nội dung hiện tại sẽ bị xóa.')) {
          this.beforeChange(); this.scene.clear(); this.selection.clear(); this.commit(); this.refreshUI();
        }
        break;
      case 'open': document.getElementById('file-open').click(); break;
      case 'save': Store.download('ban-ve.json', this.scene.toJSON()); break;
      case 'png': this._exportPNG(); break;
      case 'clear':
        if (confirm('Xóa toàn bộ đối tượng?')) {
          this.beforeChange(); this.scene.clear(); this.selection.clear(); this.commit(); this.refreshUI();
        }
        break;
    }
  }

  _openJSON(text) {
    this.beforeChange();
    if (this.scene.loadJSON(text, () => this.scene.requestRender())) {
      this.selection.clear();
      this.commit();
      this.fit();
      this.refreshUI();
    } else {
      alert('Tệp không hợp lệ.');
    }
  }

  _exportPNG() {
    const b = unionBounds(this.scene.elements.map((e) => e.worldAABB()));
    if (!b) { alert('Chưa có nội dung để xuất.'); return; }
    const pad = 40;
    const scale = 2;
    const cv = document.createElement('canvas');
    cv.width = (b.w + pad * 2) * scale;
    cv.height = (b.h + pad * 2) * scale;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, (-b.x + pad) * scale, (-b.y + pad) * scale);
    for (const el of this.scene.elements) el.draw(ctx);
    Store.downloadDataURL('ban-ve.png', cv.toDataURL('image/png'));
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
}

// Khởi động
window.addEventListener('DOMContentLoaded', () => { window.app = new App(); });
