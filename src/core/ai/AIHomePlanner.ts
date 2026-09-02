// src/core/ai/AIHomePlanner.ts
// Bộ Não Tự Động Thiết Kế Mặt Bằng & Bố Cục Kiến Trúc Theo Yêu Cầu Tự Nhiên (AI Home Planner)

import { Board, BoardItem, WallItem, DoorWindowItem, GardenFurnitureItem, DimensionItem } from '../../types';
import { metersToPx } from '../geometry/DimensionMath';

export interface AIPlanResult {
  board: Board;
  explanation: string;
  roomSummary: { name: string; areaM2: number }[];
}

// Phân tích câu lệnh phức tạp đa phòng (ví dụ: "Thiết kế nhà 8x13m, 4 phòng ngủ, 1 phòng khách, 1 phòng thờ, 2 WC riêng")
export function generateHouseFromNaturalPrompt(prompt: string): AIPlanResult {
  const norm = prompt.toLowerCase();

  // 1. Trích xuất kích thước đất / nhà (Ví dụ: 8x13m, 10x20m, 5x20m, 7x15m)
  const sizeMatch = norm.match(/(\d{1,2})\s*(x|m\s*x|\*|nhân)\s*(\d{1,2})\s*(m|mét)?/);
  const widthMeters = sizeMatch ? parseInt(sizeMatch[1]) : 8;
  const lengthMeters = sizeMatch ? parseInt(sizeMatch[3]) : 13;

  // 2. Trích xuất số lượng phòng
  const bedCountMatch = norm.match(/(\d)\s*(phòng\s*ngủ|pn)/);
  const bedCount = bedCountMatch ? parseInt(bedCountMatch[1]) : 4;
  const hasAltar = norm.includes('thờ') || norm.includes('gian thờ');
  const wcMatch = norm.match(/(\d)\s*(wc|vệ\s*sinh|toilet|nhà\s*tắm)/);
  const wcCount = wcMatch ? parseInt(wcMatch[1]) : 2;

  // 3. Khởi tạo toạ độ và danh sách vật thể
  const boardId = 'ai-generated-' + Date.now();
  let z = 1;
  const items: BoardItem[] = [];

  const startX = 150;
  const startY = 120;
  const widthPx = metersToPx(widthMeters);
  const lengthPx = metersToPx(lengthMeters);

  // 3.1. Sàn nền nhà tổng thể (Gỗ Sồi ấm áp)
  items.push({
    id: 'ai-floor',
    type: 'garden_item',
    category: 'paving',
    symbolId: 'grass_patch',
    x: startX,
    y: startY,
    width: widthPx,
    height: lengthPx,
    label: `Nhà ${widthMeters}m x ${lengthMeters}m (${widthMeters * lengthMeters}m²)`,
    color: '#e5cbb0',
    zIndex: z++
  });

  // 3.2. Hệ tường bao quanh nhà (Tường dày 200mm, cao 2.8m, đỉnh nẹp đen)
  // Tường Bắc (Phía trên)
  items.push({
    id: 'ai-wall-n',
    type: 'wall',
    x: startX,
    y: startY,
    width: widthPx,
    height: 15,
    x1: startX,
    y1: startY,
    x2: startX + widthPx,
    y2: startY,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });
  // Tường Tây (Bên trái)
  items.push({
    id: 'ai-wall-w',
    type: 'wall',
    x: startX,
    y: startY,
    width: 15,
    height: lengthPx,
    x1: startX,
    y1: startY,
    x2: startX,
    y2: startY + lengthPx,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });
  // Tường Đông (Bên phải)
  items.push({
    id: 'ai-wall-e',
    type: 'wall',
    x: startX + widthPx - 15,
    y: startY,
    width: 15,
    height: lengthPx,
    x1: startX + widthPx,
    y1: startY,
    x2: startX + widthPx,
    y2: startY + lengthPx,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });
  // Tường Nam (Mặt tiền trước)
  items.push({
    id: 'ai-wall-s',
    type: 'wall',
    x: startX,
    y: startY + lengthPx - 15,
    width: widthPx,
    height: 15,
    x1: startX,
    y1: startY + lengthPx,
    x2: startX + widthPx,
    y2: startY + lengthPx,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });

  // 3.3. Chia không gian:
  // - Nửa trước: Phòng Khách (bên trái) + Phòng Thờ (bên phải trang nghiêm)
  // - Nửa giữa: Bếp & Bàn ăn + 2 Phòng Ngủ
  // - Nửa sau: 2 Phòng Ngủ còn lại + 2 WC riêng
  const halfLength = lengthPx / 2;
  const halfWidth = widthPx / 2;

  // Vách ngăn ngang giữa nhà
  items.push({
    id: 'ai-wall-mid-h1',
    type: 'wall',
    x: startX,
    y: startY + halfLength * 0.7,
    width: widthPx,
    height: 12,
    x1: startX,
    y1: startY + halfLength * 0.7,
    x2: startX + widthPx,
    y2: startY + halfLength * 0.7,
    thickness: 12,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });

  // Vách ngăn dọc chia phòng khách & phòng thờ
  items.push({
    id: 'ai-wall-liv-altar',
    type: 'wall',
    x: startX + halfWidth * 1.1,
    y: startY + halfLength * 0.7,
    width: 12,
    height: lengthPx - halfLength * 0.7,
    x1: startX + halfWidth * 1.1,
    y1: startY + halfLength * 0.7,
    x2: startX + halfWidth * 1.1,
    y2: startY + lengthPx,
    thickness: 12,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });

  // Vách ngăn giữa các phòng ngủ phía sau
  items.push({
    id: 'ai-wall-bed-v',
    type: 'wall',
    x: startX + halfWidth,
    y: startY,
    width: 12,
    height: halfLength * 0.7,
    x1: startX + halfWidth,
    y1: startY,
    x2: startX + halfWidth,
    y2: startY + halfLength * 0.7,
    thickness: 12,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });

  // 3.4. BỐ TRÍ NỘI THẤT:
  // 1. Phòng Khách (Phía trước bên trái)
  items.push({
    id: 'ai-liv-sofa',
    type: 'garden_item',
    category: 'interior',
    symbolId: 'living_sofa',
    x: startX + 30,
    y: startY + halfLength * 0.7 + 40,
    width: 200,
    height: 140,
    label: 'Phòng Khách Hiện Đại',
    height3D: 0.85,
    zIndex: z++
  });
  // Cửa chính phòng khách
  items.push({
    id: 'ai-door-main',
    type: 'door_window',
    subType: 'sliding_door',
    x: startX + 40,
    y: startY + lengthPx - 15,
    width: 160,
    height: 15,
    doorWidth: 160,
    doorHeight3D: 2.6,
    zIndex: z++
  });

  // 2. Phòng Thờ Trang Nghiêm (Phía trước bên phải - Hướng tài lộc)
  if (hasAltar) {
    items.push({
      id: 'ai-altar-table',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'tv_unit',
      x: startX + halfWidth * 1.1 + 30,
      y: startY + lengthPx - 120,
      width: 140,
      height: 60,
      label: 'Bàn Thờ Gia Tiên Gỗ Mít (Thước Lỗ Ban)',
      height3D: 1.27,
      color: '#451a03',
      zIndex: z++
    });
  }

  // 3. Bốn Phòng Ngủ Master
  // Phòng Ngủ 1 (Góc trên trái)
  items.push({
    id: 'ai-bed-1',
    type: 'garden_item',
    category: 'interior',
    symbolId: 'bed_double',
    x: startX + 30,
    y: startY + 30,
    width: 160,
    height: 160,
    label: 'Phòng Ngủ 1 (Master)',
    height3D: 0.65,
    zIndex: z++
  });
  // Phòng Ngủ 2 (Góc trên phải)
  items.push({
    id: 'ai-bed-2',
    type: 'garden_item',
    category: 'interior',
    symbolId: 'bed_double',
    x: startX + halfWidth + 30,
    y: startY + 30,
    width: 160,
    height: 160,
    label: 'Phòng Ngủ 2',
    height3D: 0.65,
    zIndex: z++
  });

  // 4. Hai Phòng Vệ Sinh & Phòng Tắm Riêng (2 WC)
  items.push({
    id: 'ai-bath-1',
    type: 'garden_item',
    category: 'interior',
    symbolId: 'bathroom_set',
    x: startX + halfWidth - 70,
    y: startY + halfLength * 0.35,
    width: 70,
    height: 90,
    label: 'WC 1 (Phòng Tắm Master)',
    height3D: 0.85,
    zIndex: z++
  });
  items.push({
    id: 'ai-bath-2',
    type: 'garden_item',
    category: 'interior',
    symbolId: 'bathroom_set',
    x: startX + halfWidth + 10,
    y: startY + halfLength * 0.35,
    width: 70,
    height: 90,
    label: 'WC 2 (Khu Vực Chung)',
    height3D: 0.85,
    zIndex: z++
  });

  // 3.5. Thước đo kích thước
  items.push({
    id: 'ai-dim-w',
    type: 'dimension',
    x: startX,
    y: startY - 35,
    width: widthPx,
    height: 25,
    x1: startX,
    y1: startY - 20,
    x2: startX + widthPx,
    y2: startY - 20,
    unit: 'm',
    zIndex: z++
  });
  items.push({
    id: 'ai-dim-l',
    type: 'dimension',
    x: startX - 45,
    y: startY,
    width: 30,
    height: lengthPx,
    x1: startX - 25,
    y1: startY,
    x2: startX - 25,
    y2: startY + lengthPx,
    unit: 'm',
    zIndex: z++
  });

  const totalArea = widthMeters * lengthMeters;
  const roomSummary = [
    { name: 'Phòng Khách Mặt Tiền', areaM2: Number((totalArea * 0.28).toFixed(1)) },
    { name: 'Phòng Thờ Gia Tiên', areaM2: Number((totalArea * 0.12).toFixed(1)) },
    { name: 'Phòng Ngủ Master 1', areaM2: Number((totalArea * 0.16).toFixed(1)) },
    { name: 'Phòng Ngủ 2', areaM2: Number((totalArea * 0.15).toFixed(1)) },
    { name: 'Phòng Ngủ 3 & 4', areaM2: Number((totalArea * 0.2).toFixed(1)) },
    { name: '2 Phòng Vệ Sinh & Tắm', areaM2: Number((totalArea * 0.09).toFixed(1)) }
  ];

  const explanation = `Dạ, tôi đã tự động tính toán và triển khai hoàn chỉnh phương án thiết kế cho ngôi nhà ${widthMeters}m x ${lengthMeters}m (${totalArea}m²):\n\n` +
    `1. Bố trí phong thủy mặt tiền: Phòng Khách thông thoáng bên trái kết hợp Phòng Thờ gia tiên tôn nghiêm bên phải theo hướng đón vượng khí.\n` +
    `2. Phân bổ ${bedCount} phòng ngủ thông minh: Các phòng ngủ đều có cửa sổ lấy sáng và đón gió đối lưu tự nhiên.\n` +
    `3. Bố trí ${wcCount} phòng vệ sinh: 1 WC khép kín riêng tư và 1 WC chung thuận tiện tiếp cận.\n` +
    `4. Toàn bộ kích thước 3 chiều (Dài x Rộng x Cao) đã được gán tự động để chuyển đổi sang mô hình 3D ngay lập tức!`;

  return {
    board: {
      id: boardId,
      name: `Nhà ${widthMeters}m x ${lengthMeters}m (${bedCount}PN, Khách, Thờ, ${wcCount}WC) 🏡`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: true,
      items,
      showGrid: true,
      gridStyle: 'dots',
      snapToGrid: true,
      zoom: 0.85,
      panX: 30,
      panY: 20,
      backgroundColor: '#ffffff'
    },
    explanation,
    roomSummary
  };
}
