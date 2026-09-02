// src/data/houseTemplates.ts
// Bộ sưu tập 50 Mẫu Thiết Kế Nhà & Sân Vườn Cao Cấp (50 Architectural House Masterpieces)
// Tích hợp Mẫu Penthouse Cắt Lớp 3D khớp 100% Ảnh Thực Tế và Bộ Tạo Khung Đất Thông Minh

import { Board, BoardItem, WallItem, DoorWindowItem, GardenFurnitureItem, DimensionItem } from '../types';

export interface HouseTemplate {
  id: string;
  name: string;
  category: 'penthouse' | 'villa' | 'townhouse' | 'apartment' | 'resort';
  description: string;
  landSize: string; // Ví dụ: "22m x 12m (264m²)"
  tags: string[];
  createBoard: () => Board;
}

// =========================================================================
// 1. MẪU KIỆT TÁC: PENTHOUSE PANORAMA CẮT LỚP 3D (CHUẨN 100% THEO ẢNH MẪU)
// =========================================================================
export const createLuxuryPenthouseBoard = (): Board => {
  const boardId = 'template-penthouse-panorama-master';
  let z = 1;

  const items: BoardItem[] = [
    // 1. SÀN NỀN TỔNG THỂ GỖ SỒI PARQUET (Kích thước 22m x 14m = 1100px x 700px, Tọa độ X: 150, Y: 100)
    {
      id: 'pt-floor-oak',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: 150,
      y: 100,
      width: 1050,
      height: 650,
      label: 'Sàn Gỗ Sồi Penthouse Panorama Cao Cấp',
      color: '#e5cbb0',
      zIndex: z++
    },

    // 2. HỆ THỐNG TƯỜNG NGOẠI THẤT CẮT LỚP 3D (Đỉnh tường nẹp đen bóng sang trọng)
    // Tường Tây (Bên trái)
    {
      id: 'pt-wall-w',
      type: 'wall',
      x: 150,
      y: 100,
      width: 15,
      height: 650,
      x1: 150,
      y1: 100,
      x2: 150,
      y2: 750,
      thickness: 15,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },
    // Tường Bắc (Phía trên)
    {
      id: 'pt-wall-n',
      type: 'wall',
      x: 150,
      y: 100,
      width: 1050,
      height: 15,
      x1: 150,
      y1: 100,
      x2: 1200,
      y2: 100,
      thickness: 15,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },
    // Tường Đông (Bên phải)
    {
      id: 'pt-wall-e',
      type: 'wall',
      x: 1185,
      y: 100,
      width: 15,
      height: 650,
      x1: 1200,
      y1: 100,
      x2: 1200,
      y2: 750,
      thickness: 15,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },

    // 3. VÁCH NGĂN KHÔNG GIAN NỘI THẤT
    // Vách ngăn ngang chia đôi phòng ngủ trên & phòng khách dưới
    {
      id: 'pt-wall-div-w',
      type: 'wall',
      x: 150,
      y: 380,
      width: 420,
      height: 12,
      x1: 150,
      y1: 380,
      x2: 570,
      y2: 380,
      thickness: 12,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },
    // Vách ngăn sảnh hành lang & cầu thang giữa nhà
    {
      id: 'pt-wall-stair-w',
      type: 'wall',
      x: 570,
      y: 100,
      width: 12,
      height: 650,
      x1: 570,
      y1: 100,
      x2: 570,
      y2: 750,
      thickness: 12,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },
    // Vách ngăn giữa Góc Làm Việc & Phòng Tắm Master (Phía trên bên phải)
    {
      id: 'pt-wall-bath-div',
      type: 'wall',
      x: 820,
      y: 100,
      width: 12,
      height: 260,
      x1: 820,
      y1: 100,
      x2: 820,
      y2: 360,
      thickness: 12,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },
    // Vách ngăn giữa Khu Tắm/Làm việc & Phòng Ngủ Master 2 (Phía dưới bên phải)
    {
      id: 'pt-wall-bed2-top',
      type: 'wall',
      x: 570,
      y: 360,
      width: 615,
      height: 12,
      x1: 570,
      y1: 360,
      x2: 1185,
      y2: 360,
      thickness: 12,
      wallHeight: 2.8,
      wallColor: '#0f172a',
      zIndex: z++
    },

    // 4. PHÒNG NGỦ MASTER 1 (Góc trên bên trái - Chuẩn ảnh mẫu ga xanh)
    // Thảm trang trí dưới chân giường
    {
      id: 'pt-bed1-rug',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_rug',
      x: 200,
      y: 140,
      width: 220,
      height: 200,
      color: '#cbd5e1',
      zIndex: z++
    },
    // Giường ngủ đôi Master King (Nệm trắng, chăn ga xanh navy)
    {
      id: 'pt-bed1',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 230,
      y: 160,
      width: 160,
      height: 170,
      label: 'Phòng Ngủ Master 1 (Ga Xanh)',
      height3D: 0.65,
      zIndex: z++
    },
    // Tủ quần áo góc phòng ngủ 1
    {
      id: 'pt-bed1-wardrobe',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'walk_in_closet',
      x: 170,
      y: 120,
      width: 45,
      height: 180,
      label: 'Tủ Quần Áo Âm Tường',
      height3D: 2.2,
      zIndex: z++
    },

    // 5. PHÒNG KHÁCH SANG TRỌNG (Góc dưới bên trái - Chuẩn ảnh mẫu sofa L)
    // Thảm dệt phòng khách họa tiết lớn
    {
      id: 'pt-liv-rug',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_rug',
      x: 180,
      y: 420,
      width: 320,
      height: 280,
      color: '#94a3b8',
      zIndex: z++
    },
    // Bộ Sofa góc chữ L bọc nỉ xám cao cấp
    {
      id: 'pt-liv-sofa',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 220,
      y: 450,
      width: 220,
      height: 160,
      label: 'Sofa Phòng Khách Chữ L',
      height3D: 0.85,
      zIndex: z++
    },
    // Kệ TV & Tủ sách ốp vách
    {
      id: 'pt-liv-tv',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'tv_unit',
      x: 170,
      y: 400,
      width: 200,
      height: 25,
      label: 'Kệ TV & Tủ Sách Trang Trí',
      height3D: 1.8,
      zIndex: z++
    },
    // Chậu cây cọ nội thất góc phòng khách
    {
      id: 'pt-liv-palm',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'indoor_potted_palm',
      x: 180,
      y: 440,
      width: 35,
      height: 35,
      label: 'Chậu Cây Bàng Singapore',
      height3D: 1.4,
      zIndex: z++
    },
    // Vách kính mặt tiền phòng khách (Kèm rèm cửa trắng)
    {
      id: 'pt-liv-window',
      type: 'door_window',
      subType: 'sliding_door',
      x: 170,
      y: 740,
      width: 380,
      height: 15,
      doorWidth: 380,
      doorHeight3D: 2.6,
      zIndex: z++
    },

    // 6. TRỤC GIỮA: CẦU THANG GỖ NỘI THẤT & HÀNH LANG (Chuẩn ảnh mẫu)
    {
      id: 'pt-stairs',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'interior_stairs',
      x: 460,
      y: 440,
      width: 90,
      height: 200,
      label: 'Cầu Thang Bậc Gỗ Tay Vịn Kính',
      height3D: 2.8,
      zIndex: z++
    },

    // 7. GÓC LÀM VIỆC / ĐỌC SÁCH (Góc trên giữa-phải - Chuẩn ảnh mẫu)
    {
      id: 'pt-study-desk',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'work_desk',
      x: 620,
      y: 130,
      width: 140,
      height: 70,
      label: 'Bàn Làm Việc & Ghế Tựa',
      height3D: 0.75,
      zIndex: z++
    },
    {
      id: 'pt-study-plant',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'indoor_potted_palm',
      x: 585,
      y: 125,
      width: 30,
      height: 30,
      label: 'Cây Xanh Tiểu Cảnh',
      height3D: 1.2,
      zIndex: z++
    },
    {
      id: 'pt-study-win',
      type: 'door_window',
      subType: 'window',
      x: 630,
      y: 95,
      width: 140,
      height: 12,
      doorWidth: 140,
      doorHeight3D: 1.6,
      zIndex: z++
    },

    // 8. PHÒNG TẮM MASTER ĐÁ MARBLE (Góc trên phải - Chuẩn ảnh mẫu)
    {
      id: 'pt-bath-suite',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'double_vanity',
      x: 845,
      y: 120,
      width: 320,
      height: 220,
      label: 'Phòng Tắm Master Đá Marble Carrara (Bồn Tắm Nằm + Lavabo Đôi)',
      height3D: 0.85,
      zIndex: z++
    },

    // 9. PHÒNG NGỦ MASTER 2 SUITE (Góc dưới phải - Chuẩn ảnh mẫu ga đen & walk-in closet)
    // Tủ quần áo âm tường mở (Walk-in Closet treo vest & sơ mi)
    {
      id: 'pt-bed2-closet',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'walk_in_closet',
      x: 620,
      y: 380,
      width: 200,
      height: 70,
      label: 'Tủ Quần Áo Walk-in Closet (Treo Vest & Đầm)',
      height3D: 2.2,
      zIndex: z++
    },
    // Thảm dệt sọc đen/xám dưới giường Master 2
    {
      id: 'pt-bed2-rug',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_rug',
      x: 720,
      y: 480,
      width: 250,
      height: 220,
      color: '#1e293b',
      zIndex: z++
    },
    // Giường ngủ King Suite đệm nỉ ga đen kẻ sọc
    {
      id: 'pt-bed2',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 780,
      y: 500,
      width: 180,
      height: 180,
      label: 'Giường Ngủ King Suite (Ga Đen Sang Trọng)',
      height3D: 0.65,
      zIndex: z++
    },
    // Kệ tủ trang trí phòng ngủ 2
    {
      id: 'pt-bed2-sideboard',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'tv_unit',
      x: 580,
      y: 460,
      width: 30,
      height: 150,
      label: 'Kệ Tủ Ngăn Gỗ Mun',
      height3D: 1.4,
      zIndex: z++
    },
    // Lan can kính ban công lớn phòng ngủ 2
    {
      id: 'pt-bed2-balcony',
      type: 'door_window',
      subType: 'sliding_door',
      x: 650,
      y: 740,
      width: 530,
      height: 15,
      doorWidth: 530,
      doorHeight3D: 2.6,
      zIndex: z++
    },

    // 10. THƯỚC ĐO KÍCH THƯỚC CHUẨN THI CÔNG
    {
      id: 'pt-dim-width',
      type: 'dimension',
      x: 150,
      y: 70,
      width: 1050,
      height: 25,
      x1: 150,
      y1: 75,
      x2: 1200,
      y2: 75,
      unit: 'm',
      zIndex: z++
    },
    {
      id: 'pt-dim-height',
      type: 'dimension',
      x: 100,
      y: 100,
      width: 30,
      height: 650,
      x1: 110,
      y1: 100,
      x2: 110,
      y2: 750,
      unit: 'm',
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Penthouse Panorama Cắt Lớp 3D (Chuẩn 100% Ảnh Mẫu) 🏢',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: true,
    items,
    showGrid: true,
    gridStyle: 'dots',
    snapToGrid: true,
    zoom: 0.85,
    panX: 20,
    panY: 10,
    backgroundColor: '#ffffff'
  };
};

// =========================================================================
// 2. CÁC MẪU BIỆT THỰ, NHÀ PHỐ & NGHỈ DƯỠNG CƠ BẢN
// =========================================================================

// Biệt Thự Vườn Nhiệt Đới
export const createTropicalVillaBoard = (): Board => {
  const boardId = 'template-tropical-villa';
  let z = 1;
  const items: BoardItem[] = [
    {
      id: 'tv-lawn',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      label: 'Sân Vườn Biệt Thự',
      zIndex: z++
    },
    {
      id: 'tv-pool',
      type: 'garden_item',
      category: 'water',
      symbolId: 'swimming_pool',
      x: 150,
      y: 150,
      width: 250,
      height: 150,
      label: 'Hồ Bơi Vô Cực Ngoài Trời',
      height3D: 1.5,
      zIndex: z++
    },
    {
      id: 'tv-koi',
      type: 'garden_item',
      category: 'water',
      symbolId: 'koi_pond',
      x: 150,
      y: 350,
      width: 200,
      height: 180,
      label: 'Hồ Cá Koi Nhật Bản',
      height3D: 1.2,
      zIndex: z++
    },
    {
      id: 'tv-tree-1',
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_large',
      x: 400,
      y: 150,
      width: 80,
      height: 80,
      label: 'Cây Bàng Đài Loan Bóng Mát',
      height3D: 4.5,
      zIndex: z++
    },
    {
      id: 'tv-house-sofa',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 520,
      y: 180,
      width: 220,
      height: 150,
      label: 'Phòng Khách Biệt Thự',
      height3D: 0.85,
      zIndex: z++
    },
    {
      id: 'tv-house-bed',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 520,
      y: 380,
      width: 200,
      height: 180,
      label: 'Phòng Ngủ Master',
      height3D: 0.65,
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Biệt Thự Vườn Nhiệt Đới & Hồ Bơi Vô Cực 🌴',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'dots',
    snapToGrid: true,
    zoom: 0.85,
    panX: 40,
    panY: 30,
    backgroundColor: '#ffffff'
  };
};

// Nhà Phố Hiện Đại & Giếng Trời
export const createModernTownhouseBoard = (): Board => {
  const boardId = 'template-modern-townhouse';
  let z = 1;
  const items: BoardItem[] = [
    {
      id: 'th-floor',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: 200,
      y: 100,
      width: 350,
      height: 700,
      label: 'Mặt Bằng Nhà Phố 5m x 20m',
      color: '#f1f5f9',
      zIndex: z++
    },
    {
      id: 'th-sofa',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 240,
      y: 500,
      width: 180,
      height: 120,
      label: 'Phòng Khách Tầng 1',
      height3D: 0.85,
      zIndex: z++
    },
    {
      id: 'th-stairs',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'interior_stairs',
      x: 430,
      y: 360,
      width: 80,
      height: 160,
      label: 'Cầu Thang Giếng Trời',
      height3D: 2.8,
      zIndex: z++
    },
    {
      id: 'th-dining',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'dining_table',
      x: 250,
      y: 350,
      width: 140,
      height: 80,
      label: 'Phòng Bếp & Bàn Ăn',
      height3D: 0.8,
      zIndex: z++
    },
    {
      id: 'th-bed',
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 250,
      y: 150,
      width: 180,
      height: 160,
      label: 'Phòng Ngủ Master',
      height3D: 0.65,
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Nhà Phố Hiện Đại Giếng Trời (5m x 20m) 🏡',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'dots',
    snapToGrid: true,
    zoom: 0.85,
    panX: 40,
    panY: 30,
    backgroundColor: '#ffffff'
  };
};

// Khu Nghỉ Dưỡng Sinh Thái
export const createEcoRetreatBoard = (): Board => {
  const boardId = 'template-eco-retreat';
  let z = 1;
  const items: BoardItem[] = [
    {
      id: 'eco-lawn',
      type: 'garden_item',
      category: 'paving',
      symbolId: 'grass_patch',
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      label: 'Thảm Cỏ Resort',
      zIndex: z++
    },
    {
      id: 'eco-pool',
      type: 'garden_item',
      category: 'water',
      symbolId: 'swimming_pool',
      x: 200,
      y: 200,
      width: 300,
      height: 180,
      label: 'Hồ Bơi Trung Tâm Resort',
      height3D: 1.5,
      zIndex: z++
    },
    {
      id: 'eco-gazebo',
      type: 'garden_item',
      category: 'outdoor_furniture',
      symbolId: 'gazebo',
      x: 550,
      y: 220,
      width: 140,
      height: 140,
      label: 'Chòi Gỗ Vọng Cảnh Mái Lá',
      height3D: 2.8,
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: 'Khu Nghỉ Dưỡng Sinh Thái Sân Vườn 🏕️',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'dots',
    snapToGrid: true,
    zoom: 0.85,
    panX: 40,
    panY: 30,
    backgroundColor: '#ffffff'
  };
};

// =========================================================================
// 3. HÀM SINH BỘ 50 MẪU THIẾT KẾ NHÀ ĐA DẠNG CHUYÊN NGHIỆP
// =========================================================================

interface TemplateDef {
  id: string;
  name: string;
  category: 'penthouse' | 'villa' | 'townhouse' | 'apartment' | 'resort';
  description: string;
  landSize: string;
  tags: string[];
}

const TEMPLATE_DEFINITIONS: TemplateDef[] = [
  // --- 1-10: NHÓM PENTHOUSE & DUPLEX ---
  {
    id: 'pt_01',
    name: '1. Penthouse Panorama Cắt Lớp 3D (Chuẩn Ảnh Mẫu)',
    category: 'penthouse',
    description: 'Penthouse 2 phòng ngủ Master, sofa góc L, góc làm việc, phòng tắm Marble, cầu thang gỗ và ban công kính toàn cảnh.',
    landSize: '22m x 14m (308m²)',
    tags: ['Penthouse', 'Luxury', '2PN Master', 'Ban công kính', 'Ảnh Mẫu']
  },
  {
    id: 'pt_02',
    name: '2. Sky Villa Penthouse Có Hồ Bơi Chân Mây',
    category: 'penthouse',
    description: 'Penthouse đỉnh cao với hồ bơi chân mây ngoài ban công, 3 phòng ngủ suite và phòng khách thông tầng.',
    landSize: '25m x 16m (400m²)',
    tags: ['Sky Villa', 'Hồ bơi chân mây', 'Thông tầng', '3 Phòng ngủ']
  },
  {
    id: 'pt_03',
    name: '3. Penthouse Duplex Thông Tầng Hiện Đại',
    category: 'penthouse',
    description: 'Căn hộ Duplex 2 tầng cầu thang kính, phòng khách cao 6m, bếp mở bàn đảo marble sang trọng.',
    landSize: '18m x 12m (216m²)',
    tags: ['Duplex', 'Thông tầng', 'Cầu thang kính', 'Bếp đảo']
  },
  {
    id: 'pt_04',
    name: '4. Penthouse Phong Cách Bắc Âu (Scandinavian)',
    category: 'penthouse',
    description: 'Tone màu gỗ sồi sáng và trắng kem tinh tế, đón ánh sáng tự nhiên ngập tràn mọi ngóc ngách.',
    landSize: '20m x 12m (240m²)',
    tags: ['Scandinavian', 'Gỗ sồi', 'Ánh sáng tự nhiên']
  },
  {
    id: 'pt_05',
    name: '5. Penthouse Phong Cách Đông Dương (Indochine Luxury)',
    category: 'penthouse',
    description: 'Nội thất gỗ óc chó kết hợp mây tre đan cao cấp, sàn gạch bông nghệ thuật và quạt trần cổ điển.',
    landSize: '20m x 14m (280m²)',
    tags: ['Indochine', 'Gỗ óc chó', 'Gạch bông']
  },
  {
    id: 'pt_06',
    name: '6. Penthouse Tối Giản Nhật Bản (Japandi Zen)',
    category: 'penthouse',
    description: 'Sự giao thoa giữa Wabi-Sabi và Scandinavian, đường nét tối giản, cửa lùa Shoji và khu vườn Zen thu nhỏ.',
    landSize: '18m x 12m (216m²)',
    tags: ['Japandi', 'Zen', 'Tối giản', 'Vườn khô']
  },
  {
    id: 'pt_07',
    name: '7. Penthouse Tân Cổ Điển Quý Phái (Neo Classic)',
    category: 'penthouse',
    description: 'Phào chỉ tường tinh xảo, đèn chùm pha lê, sofa bọc da bò Ý và bồn tắm dát viền vàng.',
    landSize: '24m x 15m (360m²)',
    tags: ['Tân cổ điển', 'Phào chỉ', 'Da bò Ý', 'Luxury']
  },
  {
    id: 'pt_08',
    name: '8. Penthouse Loft Phong Cách Công Nghiệp (Industrial)',
    category: 'penthouse',
    description: 'Tường gạch trần, khung thép đen, sàn bê tông mài và không gian mở hoàn toàn cho giới sáng tạo.',
    landSize: '16m x 12m (192m²)',
    tags: ['Loft', 'Industrial', 'Gạch trần', 'Bê tông mài']
  },
  {
    id: 'pt_09',
    name: '9. Penthouse Vườn Trên Cao (Sky Garden Penthouse)',
    category: 'penthouse',
    description: 'Sân thượng rợp bóng cây xanh, giàn Pergola hoa leo, khu BBQ ngoài trời ngắm pháo hoa.',
    landSize: '22m x 15m (330m²)',
    tags: ['Sky Garden', 'Vườn trên cao', 'BBQ ngoài trời', 'Pergola']
  },
  {
    id: 'pt_10',
    name: '10. Penthouse Master Suite Độc Bản (Presidential)',
    category: 'penthouse',
    description: 'Thiết kế tổng thống với phòng ngủ Master chiếm 50% diện tích, phòng xông hơi Sauna và quầy Bar rượu.',
    landSize: '26m x 16m (416m²)',
    tags: ['Presidential', 'Sauna', 'Quầy Bar', 'Độc bản']
  },

  // --- 11-20: NHÓM BIỆT THỰ VƯỜN & VILLA SANG TRỌNG ---
  {
    id: 'vl_11',
    name: '11. Biệt Thự Vườn Nhiệt Đới & Hồ Cá Koi',
    category: 'villa',
    description: 'Khuôn viên vườn xanh mát, hồ cá Koi uốn lượn quanh phòng khách, chòi nghỉ uống trà.',
    landSize: '20m x 25m (500m²)',
    tags: ['Biệt thự vườn', 'Hồ cá Koi', 'Chòi nghỉ', 'Cây xanh']
  },
  {
    id: 'vl_12',
    name: '12. Villa Biển Hiện Đại Vách Kính Toàn Cảnh',
    category: 'villa',
    description: '100% vách kính view biển, hiên tắm nắng, hồ bơi tràn bờ và sân cát trang trí cảnh quan.',
    landSize: '22m x 20m (440m²)',
    tags: ['Villa biển', 'View biển', 'Hồ bơi tràn bờ', 'Vách kính']
  },
  {
    id: 'vl_13',
    name: '13. Biệt Thự Đồi Thông Nghỉ Dưỡng Đà Lạt',
    category: 'villa',
    description: 'Mái dốc ngói xám, ốp gỗ thông tự nhiên, lò sưởi ấm cúng và ban công ngắm sương mù.',
    landSize: '18m x 22m (396m²)',
    tags: ['Đà Lạt', 'Mái dốc', 'Gỗ thông', 'Lò sưởi']
  },
  {
    id: 'vl_14',
    name: '14. Biệt Thự Địa Trung Hải (Mediterranean Villa)',
    category: 'villa',
    description: 'Tường trắng mái vòm vòm cong, giàn hoa giấy rực rỡ, sân lát đá tự nhiên và hồ bơi xanh ngọc.',
    landSize: '25m x 20m (500m²)',
    tags: ['Địa Trung Hải', 'Mái vòm', 'Hoa giấy', 'Hồ bơi']
  },
  {
    id: 'vl_15',
    name: '15. Biệt Thự 1 Tầng Kiểu Mỹ (American Ranch)',
    category: 'villa',
    description: 'Nhà trệt trải dài bề thế, gara 2 ô tô, bãi cỏ xanh mướt phía trước và hiên ngồi thư giãn.',
    landSize: '30m x 20m (600m²)',
    tags: ['Nhà trệt', 'Kiểu Mỹ', 'Gara ô tô', 'Sân cỏ']
  },
  {
    id: 'vl_16',
    name: '16. Biệt Thự Vườn Mái Thái Hiện Đại',
    category: 'villa',
    description: 'Kiến trúc mái Thái thanh thoát, chống nóng tối ưu, sân trước đậu xe và vườn sau trồng rau sạch.',
    landSize: '15m x 20m (300m²)',
    tags: ['Mái Thái', 'Nhà vườn', 'Rau sạch', 'Mát mẻ']
  },
  {
    id: 'vl_17',
    name: '17. Biệt Thự Mái Nhật Đẳng Cấp',
    category: 'villa',
    description: 'Mái Nhật độ dốc nhẹ cân đối, tiểu cảnh đá cuội, hồ sen và hàng rào cây xanh tự nhiên.',
    landSize: '16m x 22m (352m²)',
    tags: ['Mái Nhật', 'Đá cuội', 'Hồ sen', 'Cân đối']
  },
  {
    id: 'vl_18',
    name: '18. Villa Sinh Thái Tiết Kiệm Năng Lượng (Eco Villa)',
    category: 'villa',
    description: 'Tận dụng thông gió đối lưu tự nhiên, giếng trời đón gió và hồ nước điều hòa nhiệt độ.',
    landSize: '20m x 18m (360m²)',
    tags: ['Eco Villa', 'Tiết kiệm điện', 'Thông gió tự nhiên']
  },
  {
    id: 'vl_19',
    name: '19. Biệt Thự Nghỉ Dưỡng Gia Đình 3 Thế Hệ',
    category: 'villa',
    description: 'Bố trí 4 phòng ngủ riêng tư, phòng sinh hoạt chung rộng rãi và sân chơi an toàn cho trẻ nhỏ.',
    landSize: '22m x 24m (528m²)',
    tags: ['3 Thế hệ', '4 Phòng ngủ', 'Sân chơi', 'Gia đình']
  },
  {
    id: 'vl_20',
    name: '20. Biệt Thự Cổ Điển Pháp Sang Trọng (French Chateau)',
    category: 'villa',
    description: 'Hệ cột La Mã vững chãi, cổng nhôm đúc mạ vàng, đài phun nước trung tâm uy nghiêm.',
    landSize: '28m x 25m (700m²)',
    tags: ['Cổ điển Pháp', 'Cột La Mã', 'Đài phun nước', 'Đẳng cấp']
  },

  // --- 21-30: NHÓM NHÀ PHỐ HIỆN ĐẠI & NHÀ ỐNG ---
  {
    id: 'th_21',
    name: '21. Nhà Phố 3 Tầng Giếng Trời Mặt Tiền 5m',
    category: 'townhouse',
    description: 'Tối ưu công năng nhà phố 5x20m, giếng trời giữa nhà đón trọn nắng gió và mảng xanh tiểu cảnh.',
    landSize: '5m x 20m (100m²)',
    tags: ['Nhà phố 5m', 'Giếng trời', '3 Tầng', 'Hiện đại']
  },
  {
    id: 'th_22',
    name: '22. Nhà Phố Mặt Tiền 6m Có Gara Ô Tô',
    category: 'townhouse',
    description: 'Tầng 1 bố trí gara để xe ô tô 7 chỗ, phòng khách đẩy lên tầng lửng sang trọng view đường phố.',
    landSize: '6m x 18m (108m²)',
    tags: ['Mặt tiền 6m', 'Gara ô tô', 'Tầng lửng']
  },
  {
    id: 'th_23',
    name: '23. Nhà Phố 2 Mặt Tiền Góc Phố Thoáng Đãng',
    category: 'townhouse',
    description: 'Khai thác tối đa 2 mặt tiền mở ban công rộng, kết hợp kinh doanh tầng 1 và ở tầng trên.',
    landSize: '8m x 15m (120m²)',
    tags: ['2 Mặt tiền', 'Góc phố', 'Kinh doanh', 'Thương mại']
  },
  {
    id: 'th_24',
    name: '24. Nhà Phố Lệch Tầng Tối Ưu Không Gian',
    category: 'townhouse',
    description: 'Kiến trúc lệch tầng tạo cảm giác rộng rãi gấp đôi, các phòng ngủ đều có ban công riêng biệt.',
    landSize: '4.5m x 18m (81m²)',
    tags: ['Lệch tầng', 'Tối ưu', 'Ban công riêng']
  },
  {
    id: 'th_25',
    name: '25. Nhà Ống Tân Cổ Điển Mặt Tiền 4m',
    category: 'townhouse',
    description: 'Mặt tiền đắp phào chỉ nhẹ nhàng, ban công sắt nghệ thuật và cửa kính vòm tinh tế.',
    landSize: '4m x 16m (64m²)',
    tags: ['Mặt tiền 4m', 'Tân cổ điển', 'Nhà ống']
  },
  {
    id: 'th_26',
    name: '26. Nhà Phố Xanh (Green House Mặt Tiền Cây)',
    category: 'townhouse',
    description: 'Mặt tiền phủ kín giàn cây leo lọc bụi, giảm nhiệt độ trong nhà từ 3-5 độ C.',
    landSize: '5m x 16m (80m²)',
    tags: ['Green House', 'Cây xanh', 'Lọc bụi', 'Mát mẻ']
  },
  {
    id: 'th_27',
    name: '27. Nhà Phố Phong Cách Tối Giản (Minimalism)',
    category: 'townhouse',
    description: 'Màu sắc đơn sắc đen trắng, tủ âm tường giấu đồ tinh tế, giải phóng 100% diện tích sinh hoạt.',
    landSize: '5m x 15m (75m²)',
    tags: ['Minimalism', 'Tối giản', 'Gọn gàng']
  },
  {
    id: 'th_28',
    name: '28. Nhà Phố Có Sân Trong Khép Kín (Courtyard House)',
    category: 'townhouse',
    description: 'Sân trong giữa nhà tạo không gian riêng tư tuyệt đối, cách ly hoàn toàn khói bụi và tiếng ồn đô thị.',
    landSize: '6m x 20m (120m²)',
    tags: ['Courtyard', 'Sân trong', 'Yên tĩnh', 'Riêng tư']
  },
  {
    id: 'th_29',
    name: '29. Nhà Phố 4 Tầng Có Thang Máy Gia Đình',
    category: 'townhouse',
    description: 'Tích hợp hố thang máy kính cao cấp, thuận tiện cho người lớn tuổi di chuyển giữa các tầng.',
    landSize: '5m x 18m (90m²)',
    tags: ['4 Tầng', 'Thang máy kính', 'Tiện nghi']
  },
  {
    id: 'th_30',
    name: '30. Shophouse Vừa Ở Vừa Cho Thuê',
    category: 'townhouse',
    description: 'Lối đi riêng tách biệt giữa tầng kinh doanh thương mại và không gian sinh hoạt của gia đình.',
    landSize: '6m x 22m (132m²)',
    tags: ['Shophouse', 'Cho thuê', 'Lối đi riêng', 'Đầu tư']
  },

  // --- 31-40: NHÓM CĂN HỘ CAO CẤP & STUDIO ---
  {
    id: 'ap_31',
    name: '31. Căn Hộ 2 Phòng Ngủ Master Sang Trọng',
    category: 'apartment',
    description: 'Layout 2PN 2WC chuẩn mực, phòng khách liền bếp mở, ban công phòng khách lớn ngắm hoàng hôn.',
    landSize: '12m x 8m (96m²)',
    tags: ['Căn hộ 2PN', 'Phòng khách lớn', 'Ban công']
  },
  {
    id: 'ap_32',
    name: '32. Căn Hộ 3 Phòng Ngủ Panorama Căn Góc',
    category: 'apartment',
    description: 'Căn góc 2 mặt thoáng view trọn vẹn thành phố, phòng ăn rộng 8 người và khu giặt phơi riêng.',
    landSize: '15m x 10m (150m²)',
    tags: ['Căn hộ 3PN', 'Căn góc', '2 Mặt thoáng']
  },
  {
    id: 'ap_33',
    name: '33. Căn Hộ Studio Tiện Nghi Thông Minh',
    category: 'apartment',
    description: 'Giải pháp nội thất thông minh đa năng: giường gấp kết hợp sofa, bàn ăn mở rộng linh hoạt.',
    landSize: '6m x 7m (42m²)',
    tags: ['Studio', 'Nội thất thông minh', 'Tiện nghi']
  },
  {
    id: 'ap_34',
    name: '34. Căn Hộ 1 Phòng Ngủ Plus (1PN + 1)',
    category: 'apartment',
    description: 'Không gian cộng 1 linh hoạt làm phòng làm việc, phòng đọc sách hoặc giường phụ cho khách.',
    landSize: '9m x 7m (63m²)',
    tags: ['1PN + 1', 'Phòng làm việc', 'Linh hoạt']
  },
  {
    id: 'ap_35',
    name: '35. Căn Hộ Phong Cách Hàn Quốc Tươi Sáng',
    category: 'apartment',
    description: 'Tông màu pastel ấm áp, đèn thả nghệ thuật, hệ tủ kịch trần gọn gàng cho gia đình trẻ.',
    landSize: '11m x 8m (88m²)',
    tags: ['Hàn Quốc', 'Pastel', 'Ấm áp', 'Gia đình trẻ']
  },
  {
    id: 'ap_36',
    name: '36. Căn Hộ Pentstudio Trần Cao 5m',
    category: 'apartment',
    description: 'Gác lửng phòng ngủ phía trên, tầng dưới là phòng khách sang trọng với cửa kính kịch trần.',
    landSize: '8m x 8m (64m²)',
    tags: ['Pentstudio', 'Trần cao 5m', 'Gác lửng']
  },
  {
    id: 'ap_37',
    name: '37. Căn Hộ Dual-Key 2 Chìa Khóa Riêng Biệt',
    category: 'apartment',
    description: '1 cửa chính chia làm 2 căn hộ độc lập: 1 căn 2PN để ở và 1 căn Studio cho thuê tạo dòng tiền.',
    landSize: '14m x 9m (126m²)',
    tags: ['Dual-Key', 'Đầu tư', 'Cho thuê', '2 Căn hộ']
  },
  {
    id: 'ap_38',
    name: '38. Căn Hộ Master Suite Cho Cặp Đôi',
    category: 'apartment',
    description: 'Bỏ bớt vách ngăn để tạo không gian mở liên hoàn giữa phòng ngủ, phòng tắm kính và phòng khách.',
    landSize: '10m x 8m (80m²)',
    tags: ['Cặp đôi', 'Không gian mở', 'Phòng tắm kính']
  },
  {
    id: 'ap_39',
    name: '39. Căn Hộ Chung Cư Mini Tối Ưu Cho Thuê',
    category: 'apartment',
    description: 'Thiết kế chuẩn studio khép kín đầy đủ bếp, WC, giường ngủ và bàn làm việc mini.',
    landSize: '5m x 6m (30m²)',
    tags: ['Mini', 'Cho thuê', 'Đầu tư dòng tiền']
  },
  {
    id: 'ap_40',
    name: '40. Căn Hộ View Sông Thoáng Mát',
    category: 'apartment',
    description: 'Phòng ngủ và phòng khách mở rộng cửa lùa hướng thẳng ra mặt sông đón gió mát quanh năm.',
    landSize: '13m x 9m (117m²)',
    tags: ['View sông', 'Đón gió', 'Thoáng mát']
  },

  // --- 41-50: NHÓM NHÀ VƯỜN SINH THÁI & NGHỈ DƯỠNG HOMESTAY ---
  {
    id: 'rs_41',
    name: '41. Bungalow Gỗ Nghỉ Dưỡng Phong Cách Mộc',
    category: 'resort',
    description: 'Bungalow 100% gỗ tự nhiên ven suối, hiên ngồi ngắm cảnh rừng và bồn tắm gỗ ngoài trời.',
    landSize: '12m x 15m (180m²)',
    tags: ['Bungalow', 'Gỗ mộc', 'Bồn tắm gỗ', 'Ven suối']
  },
  {
    id: 'rs_42',
    name: '42. Nhà Vườn Cấp 4 Nông Thôn Hiện Đại',
    category: 'resort',
    description: '3 phòng ngủ bao quanh sân hiên trước nhà, vườn cây ăn quả và lối đi rải sỏi trắng.',
    landSize: '16m x 20m (320m²)',
    tags: ['Cấp 4', 'Nhà vườn', 'Cây ăn quả', 'Nông thôn']
  },
  {
    id: 'rs_43',
    name: '43. Homestay Glamping Lều Vòm Cao Cấp',
    category: 'resort',
    description: 'Lều vòm Dome view 360 độ, sàn gỗ decking ngoài trời, bếp lửa trại nướng BBQ ban đêm.',
    landSize: '15m x 15m (225m²)',
    tags: ['Glamping', 'Lều vòm', 'Lửa trại', 'Homestay']
  },
  {
    id: 'rs_44',
    name: '44. Nhà Vườn Zen Nhật Bản Trầm Tĩnh',
    category: 'resort',
    description: 'Vườn cát cào sóng nước, đèn đá Nhật, cầu gỗ uốn cong và chòi trà đạo thiền tịnh.',
    landSize: '18m x 18m (324m²)',
    tags: ['Zen Nhật', 'Trà đạo', 'Đèn đá', 'Thiền định']
  },
  {
    id: 'rs_45',
    name: '45. Villa Hồ Bơi Tràn Trên Sườn Đồi',
    category: 'resort',
    description: 'Kiến trúc xếp tầng nương theo địa hình đồi dốc, hồ bơi vô cực nhìn xuống thung lũng.',
    landSize: '20m x 20m (400m²)',
    tags: ['Sườn đồi', 'Hồ bơi vô cực', 'Thung lũng']
  },
  {
    id: 'rs_46',
    name: '46. Farmstay Nhà Vườn Trồng Rau Nuôi Cá',
    category: 'resort',
    description: 'Mô hình VAC khép kín sinh thái kết hợp nhà ở nghỉ dưỡng cuối tuần cho gia đình thành phố.',
    landSize: '25m x 25m (625m²)',
    tags: ['Farmstay', 'Vườn rau', 'Ao cá', 'Cuối tuần']
  },
  {
    id: 'rs_47',
    name: '47. Nhà Gỗ Tam Giác (A-Frame Cabin)',
    category: 'resort',
    description: 'Thiết kế mái chữ A độc đáo, cửa kính tam giác kịch trần nhìn ra rừng thông đại ngàn.',
    landSize: '10m x 14m (140m²)',
    tags: ['A-Frame', 'Nhà tam giác', 'Rừng thông', 'Độc lạ']
  },
  {
    id: 'rs_48',
    name: '48. Khu Nghỉ Dưỡng Hồ Sen Đồng Quê',
    category: 'resort',
    description: 'Cầu tre bắc qua đầm sen thơm ngát, chòi lá nghỉ ngơi câu cá thư giãn ngày hè.',
    landSize: '22m x 20m (440m²)',
    tags: ['Hồ sen', 'Câu cá', 'Đồng quê', 'Thư giãn']
  },
  {
    id: 'rs_49',
    name: '49. Villa Nghỉ Dưỡng Bên Suối Tự Nhiên',
    category: 'resort',
    description: 'Hiên gỗ vươn ra mặt suối đá chảy róc rách, xông hơi đá muối thảo dược trị liệu.',
    landSize: '18m x 20m (360m²)',
    tags: ['Bên suối', 'Trị liệu', 'Thảo dược', 'Mát mẻ']
  },
  {
    id: 'rs_50',
    name: '50. Khu Cắm Trại & Tiệc Nướng Ngoài Trời',
    category: 'resort',
    description: 'Sân cỏ rộng 500m², giàn đèn led lung linh, bàn tiệc dài 20 người và quầy bar cocktail ngoài trời.',
    landSize: '25m x 20m (500m²)',
    tags: ['Cắm trại', 'Tiệc ngoài trời', 'Quầy bar', 'Tổ chức sự kiện']
  }
];

// Hàm tạo bảng thiết kế cho từng mẫu trong 50 mẫu
export function generateTemplateBoard(def: TemplateDef): Board {
  if (def.id === 'pt_01') {
    return createLuxuryPenthouseBoard();
  }
  if (def.id === 'vl_11') {
    return createTropicalVillaBoard();
  }
  if (def.id === 'th_21') {
    return createModernTownhouseBoard();
  }
  if (def.id === 'rs_43' || def.id === 'rs_41') {
    return createEcoRetreatBoard();
  }

  // Tạo bố cục sinh động theo thể loại
  const boardId = `template-${def.id}-${Date.now()}`;
  let z = 1;
  const items: BoardItem[] = [];

  // Sàn nền
  items.push({
    id: `${def.id}-ground`,
    type: 'garden_item',
    category: 'paving',
    symbolId: 'grass_patch',
    x: 150,
    y: 120,
    width: 800,
    height: 550,
    label: def.name,
    color: def.category === 'penthouse' ? '#e5cbb0' : def.category === 'villa' ? '#dcfce7' : '#f8fafc',
    zIndex: z++
  });

  // Tường bao quanh
  items.push({
    id: `${def.id}-wall-n`,
    type: 'wall',
    x: 150,
    y: 120,
    width: 800,
    height: 15,
    x1: 150,
    y1: 120,
    x2: 950,
    y2: 120,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });
  items.push({
    id: `${def.id}-wall-w`,
    type: 'wall',
    x: 150,
    y: 120,
    width: 15,
    height: 550,
    x1: 150,
    y1: 120,
    x2: 150,
    y2: 670,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });
  items.push({
    id: `${def.id}-wall-e`,
    type: 'wall',
    x: 935,
    y: 120,
    width: 15,
    height: 550,
    x1: 950,
    y1: 120,
    x2: 950,
    y2: 670,
    thickness: 15,
    wallHeight: 2.8,
    wallColor: '#0f172a',
    zIndex: z++
  });

  // Nội thất tùy thể loại
  if (def.category === 'penthouse' || def.category === 'apartment') {
    // Sofa + Giường + Bồn tắm + Cửa kính
    items.push({
      id: `${def.id}-sofa`,
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 200,
      y: 400,
      width: 200,
      height: 140,
      label: 'Sofa Phòng Khách',
      height3D: 0.85,
      zIndex: z++
    });
    items.push({
      id: `${def.id}-bed`,
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 600,
      y: 400,
      width: 180,
      height: 160,
      label: 'Giường Ngủ Master',
      height3D: 0.65,
      zIndex: z++
    });
    items.push({
      id: `${def.id}-bath`,
      type: 'garden_item',
      category: 'interior',
      symbolId: 'double_vanity',
      x: 620,
      y: 160,
      width: 260,
      height: 180,
      label: 'Phòng Tắm Master',
      height3D: 0.85,
      zIndex: z++
    });
    items.push({
      id: `${def.id}-glass`,
      type: 'door_window',
      subType: 'sliding_door',
      x: 200,
      y: 660,
      width: 700,
      height: 15,
      doorWidth: 700,
      doorHeight3D: 2.6,
      zIndex: z++
    });
  } else {
    // Biệt thự vườn / Resort: Hồ bơi / Hồ cá / Chòi / Cây
    items.push({
      id: `${def.id}-pool`,
      type: 'garden_item',
      category: 'water',
      symbolId: def.category === 'villa' ? 'swimming_pool' : 'koi_pond',
      x: 200,
      y: 200,
      width: 240,
      height: 160,
      label: def.category === 'villa' ? 'Hồ Bơi Nghỉ Dưỡng' : 'Hồ Cá Koi Cảnh Quan',
      height3D: 1.5,
      zIndex: z++
    });
    items.push({
      id: `${def.id}-sofa`,
      type: 'garden_item',
      category: 'interior',
      symbolId: 'living_sofa',
      x: 520,
      y: 220,
      width: 200,
      height: 140,
      label: 'Phòng Khách View Sân Vườn',
      height3D: 0.85,
      zIndex: z++
    });
    items.push({
      id: `${def.id}-tree`,
      type: 'garden_item',
      category: 'plants',
      symbolId: 'tree_large',
      x: 760,
      y: 180,
      width: 80,
      height: 80,
      label: 'Cây Bóng Mát',
      height3D: 4.5,
      zIndex: z++
    });
    items.push({
      id: `${def.id}-bed`,
      type: 'garden_item',
      category: 'interior',
      symbolId: 'bed_double',
      x: 520,
      y: 420,
      width: 180,
      height: 160,
      label: 'Phòng Ngủ Master',
      height3D: 0.65,
      zIndex: z++
    });
  }

  // Thước đo
  items.push({
    id: `${def.id}-dim`,
    type: 'dimension',
    x: 150,
    y: 80,
    width: 800,
    height: 25,
    x1: 150,
    y1: 85,
    x2: 950,
    y2: 85,
    unit: 'm',
    zIndex: z++
  });

  return {
    id: boardId,
    name: `${def.name} 🏢`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'dots',
    snapToGrid: true,
    zoom: 0.85,
    panX: 30,
    panY: 20,
    backgroundColor: '#ffffff'
  };
}

// Danh sách đầy đủ 50 Template cho ứng dụng
export const HOUSE_TEMPLATES: HouseTemplate[] = TEMPLATE_DEFINITIONS.map(def => ({
  id: def.id,
  name: def.name,
  category: def.category,
  description: def.description,
  landSize: def.landSize,
  tags: def.tags,
  createBoard: () => generateTemplateBoard(def)
}));

// =========================================================================
// 4. HÀM TẠO NHANH KHUNG ĐẤT THEO KÍCH THƯỚC (LAND PLOT GENERATOR)
// =========================================================================
export function createLandPlotBoard(widthMeters: number, lengthMeters: number, plotName?: string): Board {
  const boardId = 'plot-' + Date.now();
  const widthPx = Math.max(100, Math.min(2000, widthMeters * 50));
  const lengthPx = Math.max(100, Math.min(2000, lengthMeters * 50));
  const startX = 150;
  const startY = 150;

  let z = 1;
  const items: BoardItem[] = [
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
      wallColor: '#cbd5e1',
      isFence: true,
      zIndex: z++
    },
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
      wallColor: '#cbd5e1',
      isFence: true,
      zIndex: z++
    },
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
      wallColor: '#cbd5e1',
      isFence: true,
      zIndex: z++
    },
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
      wallColor: '#cbd5e1',
      isFence: true,
      zIndex: z++
    },
    {
      id: 'plot-dim-w',
      type: 'dimension',
      x: startX,
      y: startY - 40,
      width: widthPx,
      height: 30,
      x1: startX,
      y1: startY - 20,
      x2: startX + widthPx,
      y2: startY - 20,
      unit: 'm',
      zIndex: z++
    },
    {
      id: 'plot-dim-l',
      type: 'dimension',
      x: startX - 50,
      y: startY,
      width: 30,
      height: lengthPx,
      x1: startX - 30,
      y1: startY,
      x2: startX - 30,
      y2: startY + lengthPx,
      unit: 'm',
      zIndex: z++
    }
  ];

  return {
    id: boardId,
    name: plotName || `Lô Đất ${widthMeters}m x ${lengthMeters}m (${widthMeters * lengthMeters}m²) 📐`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    items,
    showGrid: true,
    gridStyle: 'lines',
    snapToGrid: true,
    zoom: 0.9,
    panX: 50,
    panY: 50,
    backgroundColor: '#ffffff'
  };
}
