// src/core/geometry/RoomDetector.ts
// Thuật toán tự động tìm chu trình khép kín để nhận diện từng phòng và tính diện tích m²

import { Point2D, calculatePolygonArea, calculatePolygonCentroid } from './DimensionMath';

export interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DetectedRoom {
  id: string;
  name: string;
  area: number; // Tính bằng m²
  perimeter: number; // Chu vi tính bằng m
  corners: Point2D[];
  center: Point2D;
  roomType: string;
  floorMaterial: string;
}

// Nhận diện các phòng khép kín từ danh sách các đoạn tường
export function detectRooms(walls: WallSegment[]): DetectedRoom[] {
  if (walls.length < 3) return [];

  // 1. Tạo đồ thị các đỉnh (Graph of Vertices and Edges)
  const vertices: Point2D[] = [];
  const SNAP_DIST = 10;

  function getOrCreateVertex(p: Point2D): number {
    for (let i = 0; i < vertices.length; i++) {
      const dx = vertices[i].x - p.x;
      const dy = vertices[i].y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) <= SNAP_DIST) {
        return i;
      }
    }
    vertices.push({ ...p });
    return vertices.length - 1;
  }

  const adjList: Map<number, number[]> = new Map();

  for (const w of walls) {
    const v1 = getOrCreateVertex({ x: w.x1, y: w.y1 });
    const v2 = getOrCreateVertex({ x: w.x2, y: w.y2 });
    if (v1 === v2) continue;

    if (!adjList.has(v1)) adjList.set(v1, []);
    if (!adjList.has(v2)) adjList.set(v2, []);

    if (!adjList.get(v1)!.includes(v2)) adjList.get(v1)!.push(v2);
    if (!adjList.get(v2)!.includes(v1)) adjList.get(v2)!.push(v1);
  }

  // 2. Tìm các chu trình đơn giản (Simple Cycle Detection / Minimal Planar Faces)
  // Thuật toán tìm mặt phẳng tối tiểu theo góc xoay ngược chiều kim đồng hồ (Left-Hand Rule)
  const rooms: DetectedRoom[] = [];
  const visitedHalfEdges = new Set<string>();

  function edgeKey(u: number, v: number): string {
    return `${u}->${v}`;
  }

  // Sắp xếp các đỉnh kề theo góc
  const sortedAdj: Map<number, number[]> = new Map();
  adjList.forEach((neighbors, u) => {
    const pU = vertices[u];
    const sorted = [...neighbors].sort((a, b) => {
      const pA = vertices[a];
      const pB = vertices[b];
      const angleA = Math.atan2(pA.y - pU.y, pA.x - pU.x);
      const angleB = Math.atan2(pB.y - pU.y, pB.x - pU.x);
      return angleA - angleB;
    });
    sortedAdj.set(u, sorted);
  });

  // Duyệt qua từng nửa cạnh có hướng
  sortedAdj.forEach((neighbors, startNode) => {
    for (const nextNode of neighbors) {
      if (visitedHalfEdges.has(edgeKey(startNode, nextNode))) continue;

      const cycle: number[] = [startNode];
      let curr = nextNode;
      let prev = startNode;
      let foundCycle = false;

      for (let step = 0; step < 20; step++) {
        visitedHalfEdges.add(edgeKey(prev, curr));
        cycle.push(curr);

        if (curr === startNode) {
          foundCycle = true;
          break;
        }

        const currNeighbors = sortedAdj.get(curr);
        if (!currNeighbors || currNeighbors.length === 0) break;

        // Tìm cạnh tiếp theo quay sang trái nhiều nhất
        const prevIdx = currNeighbors.indexOf(prev);
        if (prevIdx === -1) break;

        const nextIdx = (prevIdx - 1 + currNeighbors.length) % currNeighbors.length;
        const next = currNeighbors[nextIdx];
        prev = curr;
        curr = next;
      }

      if (foundCycle && cycle.length >= 4) {
        // Lấy danh sách điểm
        const polygonPoints = cycle.slice(0, cycle.length - 1).map(idx => vertices[idx]);
        const area = calculatePolygonArea(polygonPoints);

        // Lọc bỏ mặt ngoài vô hạn và các chu trình quá nhỏ (< 2m²)
        if (area >= 2.0 && area <= 500.0) {
          const center = calculatePolygonCentroid(polygonPoints);
          
          // Kiểm tra xem phòng này đã có chưa (tránh trùng lặp)
          const isDuplicate = rooms.some(r => Math.abs(r.center.x - center.x) < 20 && Math.abs(r.center.y - center.y) < 20);
          if (!isDuplicate) {
            const roomId = `room-${rooms.length + 1}`;
            rooms.push({
              id: roomId,
              name: `Phòng ${rooms.length + 1}`,
              area,
              perimeter: 0,
              corners: polygonPoints,
              center,
              roomType: area > 25 ? 'Phòng Khách' : area > 12 ? 'Phòng Ngủ' : area > 6 ? 'Phòng Bếp' : 'Phòng Vệ Sinh',
              floorMaterial: 'wood_oak'
            });
          }
        }
      }
    }
  });

  return rooms;
}
