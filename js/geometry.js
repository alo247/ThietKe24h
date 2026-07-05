// geometry.js — Các tiện ích hình học thuần: điểm, hình chữ nhật, xoay, va chạm.
// Không phụ thuộc DOM để dễ kiểm thử và tái sử dụng.

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

// Xoay điểm (px,py) quanh tâm (cx,cy) một góc rad
export function rotatePoint(px, py, cx, cy, rad) {
  if (!rad) return { x: px, y: py };
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * c - dy * s,
    y: cy + dx * s + dy * c,
  };
}

// Chuẩn hóa hình chữ nhật (đảm bảo width/height dương)
export function normalizeRect(x, y, w, h) {
  return {
    x: w < 0 ? x + w : x,
    y: h < 0 ? y + h : y,
    w: Math.abs(w),
    h: Math.abs(h),
  };
}

// Điểm có nằm trong hình chữ nhật (có xét góc xoay) không?
export function pointInRotatedRect(px, py, rect, rotation) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  // Quay ngược điểm về hệ tọa độ chưa xoay của vật thể
  const local = rotatePoint(px, py, cx, cy, -rotation);
  return (
    local.x >= rect.x &&
    local.x <= rect.x + rect.w &&
    local.y >= rect.y &&
    local.y <= rect.y + rect.h
  );
}

// Hai hình chữ nhật (không xoay) có giao nhau không?
export function rectsIntersect(a, b) {
  return !(
    b.x > a.x + a.w ||
    b.x + b.w < a.x ||
    b.y > a.y + a.h ||
    b.y + b.h < a.y
  );
}

// Hình chữ nhật a có chứa trọn b không?
export function rectContains(a, b) {
  return (
    b.x >= a.x &&
    b.y >= a.y &&
    b.x + b.w <= a.x + a.w &&
    b.y + b.h <= a.y + a.h
  );
}

// Bao hình (bounding box) của một tập điểm
export function boundsOfPoints(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Bao hình tổng của nhiều rect
export function unionBounds(rects) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rects) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.w > maxX) maxX = r.x + r.w;
    if (r.y + r.h > maxY) maxY = r.y + r.h;
  }
  if (!isFinite(minX)) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Khoảng cách từ điểm P tới đoạn thẳng AB (dùng cho hit-test nét vẽ / đường nối)
export function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, ax, ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = clamp(t, 0, 1);
  return dist(px, py, ax + t * dx, ay + t * dy);
}

// Tạo id ngẫu nhiên gọn (không dùng Date.now để tương thích mọi môi trường)
let _seq = 0;
export function uid() {
  _seq += 1;
  return 'e' + _seq.toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}
