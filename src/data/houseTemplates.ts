// src/data/houseTemplates.ts
// Bộ mẫu thiết kế nhà & sân vườn hoàn chỉnh và trình tạo khung đất thông minh

import { Board, BoardItem, WallItem, DoorWindowItem, GardenFurnitureItem, DimensionItem } from '../types';

export interface HouseTemplate {
  id: string;
  name: string;
  category: 'villa' | 'townhouse' | 'resort';
  description: string;
  landSize: string; // Ví dụ: "10m x 20m (200m²)"
  previewThumbnail?: string;
  createBoard: () => Board;
}

// 1. MẪU BIỆT THỰ VƯỜN NHIỆT ĐỚI (TROPICAL GARDEN VILLA)
export const createTropicalVillaBoard = (): Board => {
  const boardId = 'template-tropical-villa-' + Date.now();
  let z = 1;

  const items: BoardItem[] = [
    // --- KHUNG ĐẤT & RÀO VƯỜN (Kích thước 14m x 20m = 700px x 1000px, gốc 100, 100) ---
    // Ranh giới đất màu xanh thảm cỏ
    {
      id: 'item-garden-lawn',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: 100,
      y: 100,
      width: 700,
      height: 900,
      label: 'Khuôn viên Sân Vườn Biệt Thự',
      zIndex: z++
    },
    // Tường rào trước
    {
      id: 'fence-front',
      type: 'wall',
      x: 100,
      y: 1000,
      width: 700,
      height: 10,
      x1: 100,
      y1: 1000,
      x2: 800,
      y2: 1000,
      thickness: 10,
      wallHeight: 1.8,
      wallColor: '#cbd5e1',
      isFence: true,
      zIndex: z++
    },

    // --- KHỐI NHÀ CHÍNH (Rộng 8m = 400px, Sâu 10m = 500px, Tọa độ X: 350, Y: 150) ---
    // Tường ngoài phía Bắc
    {
      id: 'wall-n',
      type: 'wall',
      x: 350,
      y: 150,
      width: 400,
      height: 20,
      x1: 350,
      y1: 150,
      x2: 750,
      y2: 150,
      thickness: 20,
      wallHeight: 3.2,
      wallColor: '#334155',
      zIndex: z++
    },
    // Tường ngoài phía Đông
    {
      id: 'wall-e',
      type: 'wall',
      x: 750,
      y: 150,
      width: 20,
      height: 500,
      x1: 750,
      y1: 150,
      x2: 750,
      y2: 650,
      thickness: 20,
      wallHeight: 3.2,
      wallColor: '#334155',
      zIndex: z++
    },
    // Tường ngoài phía Nam (Mặt tiền nhà)
    {
      id: 'wall-s',
      type: 'wall',
      x: 350,
      y: 650,
      width: 400,
      height: 20,
      x1: 350,
      y1: 650,
      x2: 750,
      y2: 650,
      thickness: 20,
      wallHeight: 3.2,
      wallColor: '#334155',
      zIndex: z++
    },
    // Tường ngoài phía Tây
    {
      id: 'wall-w',
      type: 'wall',
      x: 350,
      y: 150,
      width: 20,
      height: 500,
      x1: 350,
      y1: 150,
      x2: 350,
      y2: 650,
      thickness: 20,
      wallHeight: 3.2,
      wallColor: '#334155',
      zIndex: z++
    },

    // Tường ngăn phòng khách và phòng ngủ (X: 350 -> 750, Y: 400)
    {
      id: 'wall-divide-1',
      type: 'wall',
      x: 350,
      y: 400,
      width: 400,
      height: 10,
      x1: 350,
      y1: 400,
      x2: 750,
      y2: 400,
      thickness: 10,
      wallHeight: 3.0,
      wallColor: '#64748b',
      zIndex: z++
    },
    // Tường ngăn 2 phòng ngủ (X: 550, Y: 150 -> 400)
    {
      id: 'wall-divide-2',
      type: 'wall',
      x: 550,
      y: 150,
      width: 10,
      height: 250,
      x1: 550,
      y1: 150,
      x2: 550,
      y2: 400,
      thickness: 10,
      wallHeight: 3.0,
      wallColor: '#64748b',
      zIndex: z++
    },

    // --- CỬA CHÍNH VÀ CỬA SỔ ---
    // Cửa chính 4 cánh mặt tiền
    {
      id: 'door-main',
      type: 'door_window',
      subType: 'double_door',
      x: 500,
      y: 640,
      width: 100,
      height: 40,
      doorWidth: 100,
      wallAngle: 0,
      openDirection: 'inward',
      zIndex: z++
    },
    // Cửa sổ phòng khách nhìn ra vườn
    {
      id: 'window-living',
      type: 'door_window',
      subType: 'sliding_door',
      x: 340,
      y: 480,
      width: 40,
      height: 90,
      doorWidth: 90,
      wallAngle: 90,
      zIndex: z++
    },
    // Cửa sổ phòng ngủ 1
    {
      id: 'window-bed1',
      type: 'door_window',
      subType: 'window',
      x: 420,
      y: 140,
      width: 70,
      height: 30,
      doorWidth: 70,
      wallAngle: 0,
      zIndex: z++
    },

    // --- NỘI THẤT TRONG NHÀ ---
    // Sofa phòng khách
    {
      id: 'interior-sofa',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 390,
      y: 460,
      width: 140,
      height: 90,
      label: 'Phòng Khách Sang Trọng',
      height3D: 0.85,
      zIndex: z++
    },
    // Bếp & Bàn ăn liền kề
    {
      id: 'interior-kitchen',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'kitchen_counter',
      x: 600,
      y: 450,
      width: 130,
      height: 80,
      label: 'Khu Vực Bếp Nấu',
      height3D: 0.85,
      zIndex: z++
    },
    // Giường ngủ Master (Phòng 1)
    {
      id: 'interior-bed-1',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 400,
      y: 200,
      width: 100,
      height: 110,
      label: 'Phòng Ngủ Master',
      height3D: 0.6,
      zIndex: z++
    },
    // Giường ngủ 2
    {
      id: 'interior-bed-2',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 600,
      y: 200,
      width: 100,
      height: 110,
      label: 'Phòng Ngủ 2',
      height3D: 0.6,
      zIndex: z++
    },

    // --- CẢNH QUAN SÂN VƯỜN & MẶT NƯỚC NGOÀI TRỜI ---
    // Hồ cá Koi phong thủy góc Tây Nam sân vườn
    {
      id: 'landscape-koi-pond',
      type: 'garden_item',
      category: 'water',
      symbolId: 'koi_pond',
      x: 140,
      y: 680,
      width: 180,
      height: 140,
      label: 'Hồ Cá Koi Sinh Thái',
      height3D: 0.2,
      zIndex: z++
    },
    // Chòi nghỉ sân vườn uống trà ngắm cá
    {
      id: 'landscape-gazebo',
      type: 'garden_item',
      category: 'outdoor_furniture',
      symbolId: 'gazebo',
      x: 150,
      y: 450,
      width: 130,
      height: 130,
      label: 'Chòi Nghỉ Vọng Cảnh',
      height3D: 2.8,
      zIndex: z++
    },
    // Cây cổ thụ bóng mát góc sân
    {
      id: 'tree-large-1',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_large',
      x: 130,
      y: 180,
      width: 120,
      height: 120,
      label: 'Cây Lộc Vừng Cổ Thụ',
      height3D: 5.0,
      zIndex: z++
    },
    {
      id: 'tree-large-2',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_large',
      x: 640,
      y: 760,
      width: 110,
      height: 110,
      label: 'Cây Bàng Đài Loan',
      height3D: 4.2,
      zIndex: z++
    },
    // Cây tùng trang trí
    {
      id: 'tree-pine-1',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_pine',
      x: 270,
      y: 200,
      width: 70,
      height: 70,
      height3D: 3.5,
      zIndex: z++
    },
    // Lối đi dạo lát đá sỏi
    {
      id: 'stone-path-main',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'stone_path',
      x: 440,
      y: 750,
      width: 120,
      height: 180,
      label: 'Lối Đi Lát Đá Cuội',
      height3D: 0.05,
      zIndex: z++
    },

    // --- THƯỚC ĐO KÍCH THƯỚC ---
    // Đo chiều ngang nhà (8.0m = 400px)
    {
      id: 'dim-house-width',
      type: 'dimension',
      x: 350,
      y: 110,
      width: 400,
      height: 30,
      x1: 350,
      y1: 120,
      x2: 750,
      y2: 120,
      unit: 'm',
      zIndex: z++
    },
    // Đo chiều sâu nhà (10.0m = 500px)
    {
      id: 'dim-house-length',
      type: 'dimension',
      x: 770,
      y: 150,
      width: 40,
      height: 500,
      x1: 780,
      y1: 150,
      x2: 780,
      y2: 650,
      unit: 'm',
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Biệt Thự Vườn Nhiệt Đới (Tropical Villa) 🌴',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: true,
    items,
    showGrid: true,
    gridStyle: 'lines',
    snapToGrid: true,
    zoom: 0.85,
    panX: 40,
    panY: 20,
    backgroundColor: '#f8fafc'
  };
};

// 2. MẪU NHÀ PHỐ HIỆN ĐẠI & GIẾNG TRỜI (MODERN TOWNHOUSE)
export const createModernTownhouseBoard = (): Board => {
  const boardId = 'template-townhouse-' + Date.now();
  let z = 1;

  const items: BoardItem[] = [
    // Sân trước đậu xe (5m x 4m = 250px x 200px)
    {
      id: 'th-front-yard',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'stone_path',
      x: 250,
      y: 650,
      width: 250,
      height: 180,
      label: 'Sân Trước Đậu Xe & Trồng Hoa',
      zIndex: z++
    },
    // Cây cảnh trước nhà
    {
      id: 'th-tree-front',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_pine',
      x: 430,
      y: 680,
      width: 60,
      height: 60,
      height3D: 3.0,
      zIndex: z++
    },

    // Tường bao nhà ống 5m x 14m (250px x 700px, từ Y: 150 đến 650)
    {
      id: 'th-wall-n',
      type: 'wall',
      x: 250,
      y: 150,
      width: 250,
      height: 20,
      x1: 250,
      y1: 150,
      x2: 500,
      y2: 150,
      thickness: 20,
      wallHeight: 3.5,
      wallColor: '#1e293b',
      zIndex: z++
    },
    {
      id: 'th-wall-e',
      type: 'wall',
      x: 500,
      y: 150,
      width: 20,
      height: 500,
      x1: 500,
      y1: 150,
      x2: 500,
      y2: 650,
      thickness: 20,
      wallHeight: 3.5,
      wallColor: '#1e293b',
      zIndex: z++
    },
    {
      id: 'th-wall-s',
      type: 'wall',
      x: 250,
      y: 650,
      width: 250,
      height: 20,
      x1: 250,
      y1: 650,
      x2: 500,
      y2: 650,
      thickness: 20,
      wallHeight: 3.5,
      wallColor: '#1e293b',
      zIndex: z++
    },
    {
      id: 'th-wall-w',
      type: 'wall',
      x: 250,
      y: 150,
      width: 20,
      height: 500,
      x1: 250,
      y1: 150,
      x2: 250,
      y2: 650,
      thickness: 20,
      wallHeight: 3.5,
      wallColor: '#1e293b',
      zIndex: z++
    },

    // Giếng trời tiểu cảnh giữa nhà
    {
      id: 'th-skylight-garden',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'flower_bed',
      x: 320,
      y: 370,
      width: 120,
      height: 60,
      label: 'Giếng Trời Tiểu Cảnh Xanh',
      height3D: 0.5,
      zIndex: z++
    },
    // Bàn ăn cạnh giếng trời
    {
      id: 'th-dining',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'dining_table',
      x: 320,
      y: 280,
      width: 110,
      height: 60,
      label: 'Phòng Ăn Thoáng Đãng',
      height3D: 0.75,
      zIndex: z++
    },
    // Sofa phòng khách trước
    {
      id: 'th-sofa',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 290,
      y: 500,
      width: 140,
      height: 90,
      label: 'Phòng Khách Hiện Đại',
      height3D: 0.85,
      zIndex: z++
    },
    // Cửa chính
    {
      id: 'th-door-main',
      type: 'door_window',
      subType: 'sliding_door',
      x: 320,
      y: 640,
      width: 120,
      height: 30,
      doorWidth: 120,
      wallAngle: 0,
      zIndex: z++
    },
    // Thước đo
    {
      id: 'th-dim',
      type: 'dimension',
      x: 250,
      y: 110,
      width: 250,
      height: 30,
      x1: 250,
      y1: 120,
      x2: 500,
      y2: 120,
      unit: 'm',
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Nhà Phố Hiện Đại Giếng Trời (Townhouse) 🏡',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'lines',
    snapToGrid: true,
    zoom: 0.9,
    panX: 80,
    panY: 30,
    backgroundColor: '#f8fafc'
  };
};

// 3. MẪU KHU NGHỈ DƯỠNG SINH THÁI (ECO GARDEN RETREAT)
export const createEcoRetreatBoard = (): Board => {
  const boardId = 'template-eco-retreat-' + Date.now();
  let z = 1;

  const items: BoardItem[] = [
    // Bãi cỏ tổng thể
    {
      id: 'eco-lawn',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: 100,
      y: 100,
      width: 750,
      height: 650,
      label: 'Thảm Cỏ Khu Nghỉ Dưỡng',
      zIndex: z++
    },
    // Hồ bơi ngoài trời
    {
      id: 'eco-pool',
      type: 'garden_item',
      category: 'water',
      symbolId: 'swimming_pool',
      x: 420,
      y: 200,
      width: 260,
      height: 160,
      label: 'Hồ Bơi Vô Cực Sân Vườn',
      height3D: 0.1,
      zIndex: z++
    },
    // Chòi nghỉ bên hồ bơi
    {
      id: 'eco-gazebo',
      type: 'garden_item',
      category: 'outdoor_furniture',
      symbolId: 'gazebo',
      x: 180,
      y: 220,
      width: 150,
      height: 150,
      label: 'Chòi Gỗ Thư Giãn',
      height3D: 3.0,
      zIndex: z++
    },
    // Bàn ghế tiệc nướng BBQ ngoài trời
    {
      id: 'eco-patio',
      type: 'garden_item',
      category: 'outdoor_furniture',
      symbolId: 'patio_table',
      x: 200,
      y: 440,
      width: 100,
      height: 100,
      label: 'Khu Ẩm Thực Sân Vườn',
      height3D: 2.2,
      zIndex: z++
    },
    {
      id: 'eco-bbq',
      type: 'garden_item',
      category: 'outdoor_furniture',
      symbolId: 'bbq_station',
      x: 340,
      y: 460,
      width: 90,
      height: 50,
      height3D: 1.1,
      zIndex: z++
    },
    // Hàng cây bóng mát bao quanh
    {
      id: 'eco-tree-1',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_large',
      x: 130,
      y: 130,
      width: 120,
      height: 120,
      height3D: 5.0,
      zIndex: z++
    },
    {
      id: 'eco-tree-2',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_large',
      x: 700,
      y: 140,
      width: 110,
      height: 110,
      height3D: 4.8,
      zIndex: z++
    },
    {
      id: 'eco-tree-3',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_pine',
      x: 710,
      y: 420,
      width: 80,
      height: 80,
      height3D: 3.8,
      zIndex: z++
    },
    // Lối đi sỏi dạo quanh hồ bơi
    {
      id: 'eco-stone-path',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'stone_path',
      x: 430,
      y: 400,
      width: 240,
      height: 50,
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Khu Nghỉ Dưỡng Sinh Thái (Eco Retreat) 🌊',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'dots',
    snapToGrid: true,
    zoom: 0.9,
    panX: 50,
    panY: 30,
    backgroundColor: '#f1f5f9'
  };
};

// 4. DANH SÁCH TẤT CẢ TEMPLATE
export const HOUSE_TEMPLATES: HouseTemplate[] = [
  {
    id: 'tropical_villa',
    name: 'Biệt Thự Vườn Nhiệt Đới',
    category: 'villa',
    description: 'Nhà cấp 4 hiện đại kết hợp hồ cá Koi, chòi nghỉ và vườn cây bóng mát sinh thái.',
    landSize: '14m x 20m (280m²)',
    createBoard: createTropicalVillaBoard
  },
  {
    id: 'modern_townhouse',
    name: 'Nhà Phố Hiện Đại & Giếng Trời',
    category: 'townhouse',
    description: 'Tối ưu không gian nhà ống, lấy sáng tự nhiên qua giếng trời tiểu cảnh xanh.',
    landSize: '5m x 14m (70m²)',
    createBoard: createModernTownhouseBoard
  },
  {
    id: 'eco_retreat',
    name: 'Khu Nghỉ Dưỡng Sinh Thái Sân Vườn',
    category: 'resort',
    description: 'Không gian nghỉ dưỡng cao cấp với hồ bơi vô cực, chòi gỗ và tiệc nướng BBQ ngoài trời.',
    landSize: '15m x 15m (225m²)',
    createBoard: createEcoRetreatBoard
  }
];

// 5. HÀM TẠO NHANH KHUNG ĐẤT THEO KÍCH THƯỚC (LAND PLOT GENERATOR)
export function createLandPlotBoard(widthMeters: number, lengthMeters: number, plotName?: string): Board {
  const boardId = 'plot-' + Date.now();
  // Quy ước 50px = 1 mét
  const widthPx = Math.max(100, Math.min(2000, widthMeters * 50));
  const lengthPx = Math.max(100, Math.min(2000, lengthMeters * 50));
  const startX = 150;
  const startY = 150;

  let z = 1;
  const items: BoardItem[] = [
    // Thảm cỏ mặt bằng khu đất
    {
      id: 'plot-lawn',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: startX,
      y: startY,
      width: widthPx,
      height: lengthPx,
      label: `Khuôn viên đất: ${widthMeters}m x ${lengthMeters}m (${widthMeters * lengthMeters}m²)`,
      zIndex: z++
    },
    // Ranh giới đất phía Bắc
    {
      id: 'plot-wall-n',
      type: 'wall',
      x: startX,
      y: startY,
      width: widthPx,
      height: 10,
      x1: startX,
      y1: startY,
      x2: startX + widthPx,
      y2: startY,
      thickness: 10,
      wallHeight: 1.8,
      wallColor: '#ef4444', // Màu đỏ đánh dấu ranh mốc
      isFence: true,
      zIndex: z++
    },
    // Ranh giới phía Đông
    {
      id: 'plot-wall-e',
      type: 'wall',
      x: startX + widthPx,
      y: startY,
      width: 10,
      height: lengthPx,
      x1: startX + widthPx,
      y1: startY,
      x2: startX + widthPx,
      y2: startY + lengthPx,
      thickness: 10,
      wallHeight: 1.8,
      wallColor: '#ef4444',
      isFence: true,
      zIndex: z++
    },
    // Ranh giới phía Nam
    {
      id: 'plot-wall-s',
      type: 'wall',
      x: startX,
      y: startY + lengthPx,
      width: widthPx,
      height: 10,
      x1: startX,
      y1: startY + lengthPx,
      x2: startX + widthPx,
      y2: startY + lengthPx,
      thickness: 10,
      wallHeight: 1.8,
      wallColor: '#ef4444',
      isFence: true,
      zIndex: z++
    },
    // Ranh giới phía Tây
    {
      id: 'plot-wall-w',
      type: 'wall',
      x: startX,
      y: startY,
      width: 10,
      height: lengthPx,
      x1: startX,
      y1: startY,
      x2: startX,
      y2: startY + lengthPx,
      thickness: 10,
      wallHeight: 1.8,
      wallColor: '#ef4444',
      isFence: true,
      zIndex: z++
    },
    // Thước đo chiều rộng
    {
      id: 'plot-dim-w',
      type: 'dimension',
      x: startX,
      y: startY - 40,
      width: widthPx,
      height: 30,
      x1: startX,
      y1: startY - 30,
      x2: startX + widthPx,
      y2: startY - 30,
      unit: 'm',
      zIndex: z++
    },
    // Thước đo chiều dài
    {
      id: 'plot-dim-l',
      type: 'dimension',
      x: startX + widthPx + 30,
      y: startY,
      width: 40,
      height: lengthPx,
      x1: startX + widthPx + 40,
      y1: startY,
      x2: startX + widthPx + 40,
      y2: startY + lengthPx,
      unit: 'm',
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: plotName || `Lô Đất ${widthMeters}m x ${lengthMeters}m`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'lines',
    snapToGrid: true,
    zoom: Math.min(1.0, 700 / Math.max(widthPx, lengthPx)),
    panX: 50,
    panY: 50,
    backgroundColor: '#ffffff'
  };
}
