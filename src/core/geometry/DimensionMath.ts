// src/core/geometry/DimensionMath.ts
// Thư viện tính toán hình học chính xác và chuẩn xác 100% bằng thuật toán cục bộ (Deterministic Math)

export interface Point2D {
  x: number;
  y: number;
}

// Quy ước tỉ lệ: 50 pixel = 1.0 Mét (1 pixel = 2cm = 0.02m)
export const PIXELS_PER_METER = 50;

// Chuyển đổi Pixel sang Mét
export function pxToMeters(px: number): number {
  return Number((px / PIXELS_PER_METER).toFixed(2));
}

// Chuyển đổi Mét sang Pixel
export function metersToPx(meters: number): number {
  return meters * PIXELS_PER_METER;
}

// Tính khoảng cách Euclid giữa 2 điểm (tính bằng pixel)
export function distanceBetween(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Tính chiều dài đoạn thẳng bằng mét
export function segmentLengthInMeters(p1: Point2D, p2: Point2D): number {
  return pxToMeters(distanceBetween(p1, p2));
}

// Tính góc giữa 2 điểm (theo độ từ 0° đến 360°)
export function angleBetween(p1: Point2D, p2: Point2D): number {
  const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

// Tính diện tích đa giác khép kín bằng công thức Shoelace (Gauss Area Formula) tính theo m²
export function calculatePolygonArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let areaPx = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaPx += points[i].x * points[j].y;
    areaPx -= points[j].x * points[i].y;
  }

  areaPx = Math.abs(areaPx) / 2;
  // Quy đổi từ pixel² sang m²: 1 m² = 50 * 50 = 2500 px²
  const areaM2 = areaPx / (PIXELS_PER_METER * PIXELS_PER_METER);
  return Number(areaM2.toFixed(2));
}

// Tính chu vi đa giác (tính bằng mét)
export function calculatePolygonPerimeter(points: Point2D[]): number {
  if (points.length < 2) return 0;
  let perimeterPx = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    perimeterPx += distanceBetween(points[i], points[j]);
  }

  return pxToMeters(perimeterPx);
}

// Tính tâm hình học (Centroid) của một đa giác
export function calculatePolygonCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 0, y: 0 };
  let cx = 0;
  let cy = 0;
  let signedArea = 0;

  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const a = points[i].x * points[j].y - points[j].x * points[i].y;
    signedArea += a;
    cx += (points[i].x + points[j].x) * a;
    cy += (points[i].y + points[j].y) * a;
  }

  signedArea *= 0.5;
  if (Math.abs(signedArea) < 1e-5) {
    // Trường hợp suy biến: Lấy trung bình cộng tọa độ
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    return { x: sumX / points.length, y: sumY / points.length };
  }

  cx /= 6 * signedArea;
  cy /= 6 * signedArea;
  return { x: cx, y: cy };
}

// Hàm bắt dính điểm thông minh (Snap to Grid & Snap to Nearest Points/Angles)
export function snapToGridAndGuides(
  target: Point2D,
  gridSize = 25, // 0.5m grid
  referencePoints: Point2D[] = [],
  snapThreshold = 15
): { point: Point2D; snappedToPoint: boolean; snappedToAngle: boolean } {
  // 1. Kiểm tra bắt dính vào điểm có sẵn (Endpoint/Corner snap)
  for (const ref of referencePoints) {
    if (distanceBetween(target, ref) <= snapThreshold) {
      return { point: { ...ref }, snappedToPoint: true, snappedToAngle: false };
    }
  }

  // 2. Bắt dính góc thẳng hàng (Ortho Snap 0°, 90°, 180°, 270° hoặc 45°)
  for (const ref of referencePoints) {
    const dx = Math.abs(target.x - ref.x);
    const dy = Math.abs(target.y - ref.y);

    if (dx <= snapThreshold) {
      return { point: { x: ref.x, y: Math.round(target.y / gridSize) * gridSize }, snappedToPoint: false, snappedToAngle: true };
    }
    if (dy <= snapThreshold) {
      return { point: { x: Math.round(target.x / gridSize) * gridSize, y: ref.y }, snappedToPoint: false, snappedToAngle: true };
    }
  }

  // 3. Bắt dính lưới Grid
  const snappedX = Math.round(target.x / gridSize) * gridSize;
  const snappedY = Math.round(target.y / gridSize) * gridSize;
  return { point: { x: snappedX, y: snappedY }, snappedToPoint: false, snappedToAngle: false };
}
