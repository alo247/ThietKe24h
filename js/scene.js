// scene.js — Bộ máy dựng hình canvas: quản lý danh sách đối tượng, lưới nền, phép chiếu, hit-test.
import { Camera } from './camera.js';
import { rectsIntersect } from './geometry.js';
import { elementFromData } from './elements.js';

export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = new Camera();
    this.elements = [];
    this.dpr = 1;
    this.width = 0; this.height = 0;
    this.drawOverlay = null;   // Hook vẽ lớp phủ (khung chọn, tay cầm...) do app cung cấp
    this.previewElement = null; // Đối tượng đang được vẽ/tạo (chưa chốt)
    this._rafPending = false;
    this._renderFn = this.render.bind(this);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    // Giới hạn DPR để giữ hiệu năng ổn định trên điện thoại đời cũ
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * this.dpr);
    this.canvas.height = Math.round(rect.height * this.dpr);
    this.requestRender();
  }

  requestRender() {
    if (this._rafPending) return;
    this._rafPending = true;
    requestAnimationFrame(() => {
      this._rafPending = false;
      this.render();
    });
  }

  render() {
    const { ctx, camera, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#FBFBFD';
    ctx.fillRect(0, 0, this.width, this.height);

    this._drawGrid();

    // Áp phép biến đổi camera: thế giới -> màn hình
    ctx.setTransform(
      camera.zoom * dpr, 0, 0, camera.zoom * dpr,
      -camera.x * camera.zoom * dpr, -camera.y * camera.zoom * dpr,
    );

    // Chỉ vẽ các đối tượng nằm trong khung nhìn (culling)
    const view = this._viewWorldRect();
    for (const el of this.elements) {
      if (rectsIntersect(el.worldAABB(), view)) el.draw(ctx);
    }
    if (this.previewElement) this.previewElement.draw(ctx);

    // Lớp phủ vẽ trong tọa độ MÀN HÌNH
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.drawOverlay) this.drawOverlay(ctx);
  }

  _viewWorldRect() {
    const tl = this.camera.toWorld(0, 0);
    const br = this.camera.toWorld(this.width, this.height);
    return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y };
  }

  _drawGrid() {
    const { ctx, camera } = this;
    const spacing = 28;                       // Khoảng cách chấm ở zoom = 1
    const step = spacing * camera.zoom;
    if (step < 10) return;                    // Quá dày thì ẩn cho gọn
    const tl = camera.toWorld(0, 0);
    const startX = Math.floor(tl.x / spacing) * spacing;
    const startY = Math.floor(tl.y / spacing) * spacing;
    ctx.fillStyle = 'rgba(0,0,0,0.10)';
    const r = camera.zoom < 0.6 ? 1 : 1.4;
    for (let wx = startX; ; wx += spacing) {
      const sx = (wx - camera.x) * camera.zoom;
      if (sx > this.width) break;
      if (sx < -2) continue;
      for (let wy = startY; ; wy += spacing) {
        const sy = (wy - camera.y) * camera.zoom;
        if (sy > this.height) break;
        if (sy < -2) continue;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ---- Quản lý đối tượng ----
  add(el) { this.elements.push(el); this.requestRender(); }
  remove(el) {
    const i = this.elements.indexOf(el);
    if (i >= 0) this.elements.splice(i, 1);
    this.requestRender();
  }
  removeMany(set) {
    this.elements = this.elements.filter((e) => !set.has(e));
    this.requestRender();
  }
  clear() { this.elements = []; this.requestRender(); }

  // Trả về đối tượng trên cùng tại điểm thế giới (bỏ qua đối tượng đã khóa nếu ignoreLocked)
  hitTest(wx, wy, ignoreLocked = false) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (ignoreLocked && el.locked) continue;
      if (el.hitTest(wx, wy)) return el;
    }
    return null;
  }

  // Các đối tượng giao với khung marquee (tọa độ thế giới)
  elementsInRect(rect) {
    return this.elements.filter((el) => !el.locked && rectsIntersect(el.worldAABB(), rect));
  }

  // ---- Thứ tự lớp (z-order) ----
  bringToFront(el) { this._move(el, this.elements.length); }
  sendToBack(el) { this._move(el, 0); }
  bringForward(el) { const i = this.elements.indexOf(el); this._move(el, i + 2); }
  sendBackward(el) { const i = this.elements.indexOf(el); this._move(el, i - 1); }
  _move(el, to) {
    const i = this.elements.indexOf(el);
    if (i < 0) return;
    this.elements.splice(i, 1);
    this.elements.splice(Math.max(0, Math.min(this.elements.length, to)), 0, el);
    this.requestRender();
  }

  // ---- Tuần tự hóa tài liệu ----
  toJSON() {
    return JSON.stringify({
      version: 1,
      elements: this.elements.map((e) => e.serialize()),
    });
  }
  loadJSON(json, onImgLoad) {
    let data;
    try { data = JSON.parse(json); } catch (e) { return false; }
    if (!data || !Array.isArray(data.elements)) return false;
    this.elements = data.elements
      .map((d) => elementFromData(d, onImgLoad))
      .filter(Boolean);
    this.requestRender();
    return true;
  }
}
