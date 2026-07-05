// camera.js — Quản lý phép biến đổi khung nhìn (pan & zoom) của canvas vô cực.
import { clamp } from './geometry.js';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 8;

export class Camera {
  constructor() {
    this.x = 0; // Tọa độ thế giới ở góc trên-trái màn hình
    this.y = 0;
    this.zoom = 1;
  }

  // Màn hình -> Thế giới
  toWorld(sx, sy) {
    return { x: this.x + sx / this.zoom, y: this.y + sy / this.zoom };
  }

  // Thế giới -> Màn hình
  toScreen(wx, wy) {
    return { x: (wx - this.x) * this.zoom, y: (wy - this.y) * this.zoom };
  }

  // Zoom quanh một điểm màn hình (giữ nguyên điểm dưới con trỏ)
  zoomAt(sx, sy, factor) {
    const before = this.toWorld(sx, sy);
    this.zoom = clamp(this.zoom * factor, MIN_ZOOM, MAX_ZOOM);
    const after = this.toWorld(sx, sy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  setZoom(z, sx, sy) {
    const cx = sx ?? 0;
    const cy = sy ?? 0;
    const before = this.toWorld(cx, cy);
    this.zoom = clamp(z, MIN_ZOOM, MAX_ZOOM);
    const after = this.toWorld(cx, cy);
    this.x += before.x - after.x;
    this.y += before.y - after.y;
  }

  // Kéo màn hình theo delta pixel
  panBy(dxScreen, dyScreen) {
    this.x -= dxScreen / this.zoom;
    this.y -= dyScreen / this.zoom;
  }

  // Căn khung nhìn để bao trọn một vùng thế giới (fit)
  fitBounds(b, viewW, viewH, padding = 80) {
    if (!b || b.w === 0 || b.h === 0) return;
    const zx = (viewW - padding * 2) / b.w;
    const zy = (viewH - padding * 2) / b.h;
    this.zoom = clamp(Math.min(zx, zy), MIN_ZOOM, MAX_ZOOM);
    this.x = b.x + b.w / 2 - viewW / 2 / this.zoom;
    this.y = b.y + b.h / 2 - viewH / 2 / this.zoom;
  }

  reset(viewW, viewH) {
    this.zoom = 1;
    this.x = -viewW / 2;
    this.y = -viewH / 2;
  }

  static get MIN_ZOOM() { return MIN_ZOOM; }
  static get MAX_ZOOM() { return MAX_ZOOM; }
}
