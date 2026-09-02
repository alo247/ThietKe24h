// src/data/architecturalSymbols.ts
// Thư viện định nghĩa các biểu tượng kiến trúc và cảnh quan sân vườn 2D Vector chuyên nghiệp

import { LandscapeCategory } from '../types';

export interface ArchitecturalSymbolDef {
  id: string;
  name: string;
  category: LandscapeCategory;
  defaultWidth: number;  // Tính theo pixel (50px = 1m)
  defaultHeight: number;
  height3D: number;       // Chiều cao mô phỏng 3D (mét)
  color: string;
  iconName: string;
  description: string;
}

export const ARCHITECTURAL_SYMBOLS: ArchitecturalSymbolDef[] = [
  // --- CÂY CỐI & CẢNH QUAN XANH ---
  {
    id: 'tree_large',
    name: 'Cây bóng mát tán lớn',
    category: 'plants',
    defaultWidth: 100, // Đường kính 2m
    defaultHeight: 100,
    height3D: 4.5,
    color: '#22c55e',
    iconName: 'Trees',
    description: 'Cây bóng mát tán tròn xanh tươi cho sân vườn'
  },
  {
    id: 'tree_pine',
    name: 'Cây lá kim / Cây Tùng',
    category: 'plants',
    defaultWidth: 70, // 1.4m
    defaultHeight: 70,
    height3D: 3.5,
    color: '#15803d',
    iconName: 'TreePine',
    description: 'Cây dáng thẳng đứng, thích hợp góc vườn hoặc hàng rào'
  },
  {
    id: 'flower_bed',
    name: 'Bồn hoa tiểu cảnh',
    category: 'plants',
    defaultWidth: 120, // 2.4m x 1.0m
    defaultHeight: 50,
    height3D: 0.6,
    color: '#f43f5e',
    iconName: 'Flower2',
    description: 'Bồn hoa trang trí rực rỡ dọc lối đi'
  },
  {
    id: 'bush_hedge',
    name: 'Hàng rào dâm bụt / Chè tàu',
    category: 'plants',
    defaultWidth: 150, // 3m x 0.6m
    defaultHeight: 30,
    height3D: 1.2,
    color: '#16a34a',
    iconName: 'Shrub',
    description: 'Dải cây bụi xanh phân cách không gian sân vườn'
  },

  // --- MẶT NƯỚC & TIỂU CẢNH NƯỚC ---
  {
    id: 'koi_pond',
    name: 'Hồ cá Koi nghệ thuật',
    category: 'water',
    defaultWidth: 140, // 2.8m x 2.0m
    defaultHeight: 100,
    height3D: 0.2,
    color: '#0ea5e9',
    iconName: 'Fish',
    description: 'Hồ nước uốn lượn phong thủy có đá viền quanh'
  },
  {
    id: 'swimming_pool',
    name: 'Hồ bơi gia đình',
    category: 'water',
    defaultWidth: 200, // 4m x 2.4m
    defaultHeight: 120,
    height3D: 0.1,
    color: '#38bdf8',
    iconName: 'Waves',
    description: 'Hồ bơi nước xanh ngọc có bậc thang thư giãn'
  },
  {
    id: 'fountain',
    name: 'Đài phun nước tròn',
    category: 'water',
    defaultWidth: 80, // 1.6m
    defaultHeight: 80,
    height3D: 1.5,
    color: '#0284c7',
    iconName: 'Droplets',
    description: 'Điểm nhấn trung tâm sân trước hoặc hoa viên'
  },

  // --- LỐI ĐI & SÀN NGOÀI TRỜI ---
  {
    id: 'stone_path',
    name: 'Lối đi dạo lát đá sỏi',
    category: 'paving',
    defaultWidth: 160, // 3.2m x 0.8m
    defaultHeight: 40,
    height3D: 0.05,
    color: '#94a3b8',
    iconName: 'Footprints',
    description: 'Các phiến đá tự nhiên bước dạo qua thảm cỏ'
  },
  {
    id: 'wooden_deck',
    name: 'Sàn gỗ ban công / Decking',
    category: 'paving',
    defaultWidth: 150, // 3m x 2m
    defaultHeight: 100,
    height3D: 0.15,
    color: '#b45309',
    iconName: 'Layers',
    description: 'Sàn gỗ nhựa ngoài trời chịu mưa nắng'
  },
  {
    id: 'grass_patch',
    name: 'Thảm cỏ xanh tự nhiên',
    category: 'paving',
    defaultWidth: 180, // 3.6m x 2.4m
    defaultHeight: 120,
    height3D: 0.02,
    color: '#86efac',
    iconName: 'Sparkles',
    description: 'Khu vực bãi cỏ sân chơi thư giãn ngoài trời'
  },

  // --- NỘI THẤT NGOÀI TRỜI ---
  {
    id: 'gazebo',
    name: 'Chòi nghỉ sân vườn',
    category: 'outdoor_furniture',
    defaultWidth: 130, // 2.6m x 2.6m
    defaultHeight: 130,
    height3D: 2.8,
    color: '#78350f',
    iconName: 'Tent',
    description: 'Chòi vọng cảnh mái che uống trà ngắm cảnh'
  },
  {
    id: 'patio_table',
    name: 'Bàn ghế sân vườn kèm dù che',
    category: 'outdoor_furniture',
    defaultWidth: 90, // 1.8m x 1.8m
    defaultHeight: 90,
    height3D: 2.2,
    color: '#e0e7ff',
    iconName: 'Sun',
    description: 'Bộ bàn ghế ngoài trời có ô dù che nắng'
  },
  {
    id: 'bbq_station',
    name: 'Quầy nướng BBQ ngoài trời',
    category: 'outdoor_furniture',
    defaultWidth: 90, // 1.8m x 0.8m
    defaultHeight: 40,
    height3D: 1.1,
    color: '#475569',
    iconName: 'Flame',
    description: 'Bếp nướng tiệc sân vườn cuối tuần'
  },

  // --- NỘI THẤT TRONG NHÀ CHÍNH ---
  {
    id: 'living_sofa',
    name: 'Bộ sofa góc phòng khách',
    category: 'interior',
    defaultWidth: 140, // 2.8m x 1.8m
    defaultHeight: 90,
    height3D: 0.85,
    color: '#6366f1',
    iconName: 'Armchair',
    description: 'Sofa góc hiện đại chữ L kèm bàn trà'
  },
  {
    id: 'dining_table',
    name: 'Bàn ăn gia đình 6 ghế',
    category: 'interior',
    defaultWidth: 110, // 2.2m x 1.2m
    defaultHeight: 60,
    height3D: 0.75,
    color: '#a855f7',
    iconName: 'Utensils',
    description: 'Bàn ăn chữ nhật gỗ sồi cao cấp'
  },
  {
    id: 'bed_double',
    name: 'Giường ngủ đôi King size',
    category: 'interior',
    defaultWidth: 100, // 2m x 2.2m
    defaultHeight: 110,
    height3D: 0.6,
    color: '#ec4899',
    iconName: 'Bed',
    description: 'Giường ngủ đôi phòng ngủ Master kèm tab đầu giường'
  },
  {
    id: 'kitchen_counter',
    name: 'Bếp chữ L & Bồn rửa',
    category: 'interior',
    defaultWidth: 130, // 2.6m x 1.6m
    defaultHeight: 80,
    height3D: 0.85,
    color: '#f59e0b',
    iconName: 'ChefHat',
    description: 'Hệ thống tủ bếp hiện đại mặt đá granite'
  },
  {
    id: 'bathroom_set',
    name: 'Thiết bị vệ sinh & Bồn tắm',
    category: 'interior',
    defaultWidth: 80, // 1.6m x 1.2m
    defaultHeight: 60,
    height3D: 0.6,
    color: '#06b6d4',
    iconName: 'Bath',
    description: 'Combo Lavabo, bồn cầu và bồn tắm nằm'
  },

  // --- CÁC MÔ-ĐUN NỘI THẤT & BAN CÔNG CAO CẤP MỚI (THEO ẢNH MẪU 3D) ---
  {
    id: 'walk_in_closet',
    name: 'Tủ áo âm tường & Phòng thay đồ',
    category: 'interior',
    defaultWidth: 100, // 2.0m x 1.0m
    defaultHeight: 50,
    height3D: 2.2,
    color: '#334155',
    iconName: 'Shirt',
    description: 'Hệ tủ quần áo mở có giá treo, ngăn kéo và đèn led'
  },
  {
    id: 'tv_unit',
    name: 'Kệ TV & Tủ sách trang trí',
    category: 'interior',
    defaultWidth: 120, // 2.4m x 0.5m
    defaultHeight: 25,
    height3D: 1.8,
    color: '#1e293b',
    iconName: 'Tv',
    description: 'Kệ TV gỗ sồi treo tường, tivi siêu mỏng và tủ kệ sách'
  },
  {
    id: 'work_desk',
    name: 'Bàn làm việc & Bàn trang điểm',
    category: 'interior',
    defaultWidth: 70, // 1.4m x 0.8m
    defaultHeight: 40,
    height3D: 0.75,
    color: '#b45309',
    iconName: 'Laptop',
    description: 'Bàn làm việc phòng ngủ kèm ghế tựa và laptop'
  },
  {
    id: 'interior_stairs',
    name: 'Cầu thang gỗ tay vịn kính',
    category: 'interior',
    defaultWidth: 60, // 1.2m x 2.2m
    defaultHeight: 110,
    height3D: 2.8,
    color: '#78350f',
    iconName: 'Footprints',
    description: 'Cầu thang bậc gỗ sồi kèm lan can kính sang trọng'
  },
  {
    id: 'double_vanity',
    name: 'Bàn Lavabo đôi mặt đá Marble',
    category: 'interior',
    defaultWidth: 90, // 1.8m x 0.8m
    defaultHeight: 40,
    height3D: 0.85,
    color: '#f8fafc',
    iconName: 'Sparkles',
    description: 'Bàn lavabo đôi cao cấp, gương led cảm ứng phòng tắm Master'
  },
  {
    id: 'glass_shower',
    name: 'Cabin tắm đứng vách kính',
    category: 'interior',
    defaultWidth: 50, // 1.0m x 1.0m
    defaultHeight: 50,
    height3D: 2.2,
    color: '#38bdf8',
    iconName: 'ShowerHead',
    description: 'Vách kính cường lực tắm đứng kèm vòi sen cây chrome'
  },
  {
    id: 'lounge_sunbed',
    name: 'Ghế nằm tắm nắng ban công',
    category: 'outdoor_furniture',
    defaultWidth: 40, // 0.8m x 2.0m
    defaultHeight: 100,
    height3D: 0.5,
    color: '#d4a373',
    iconName: 'Armchair',
    description: 'Giường tắm nắng ngoài trời bọc nệm gỗ teak'
  },
  {
    id: 'terrace_pergola',
    name: 'Giàn Pergola che nắng sân thượng',
    category: 'outdoor_furniture',
    defaultWidth: 120, // 2.4m x 1.8m
    defaultHeight: 90,
    height3D: 2.6,
    color: '#451a03',
    iconName: 'Grid',
    description: 'Giàn lam gỗ che nắng sân thượng thoáng đãng'
  },
  {
    id: 'indoor_potted_palm',
    name: 'Chậu cây cọ / Cây bàng cảnh',
    category: 'plants',
    defaultWidth: 45, // 0.9m x 0.9m
    defaultHeight: 45,
    height3D: 1.8,
    color: '#16a34a',
    iconName: 'Trees',
    description: 'Chậu cây xanh nội thất đặt góc phòng và ban công'
  },
  {
    id: 'living_rug',
    name: 'Thảm nỉ dệt sợi cao cấp',
    category: 'interior',
    defaultWidth: 140, // 2.8m x 2.0m
    defaultHeight: 100,
    height3D: 0.05,
    color: '#cbd5e1',
    iconName: 'Layers',
    description: 'Thảm trải sàn họa tiết hình học phòng khách và phòng ngủ'
  }
];

// Hàm tìm định nghĩa biểu tượng theo ID
export function getSymbolDef(symbolId: string): ArchitecturalSymbolDef | undefined {
  return ARCHITECTURAL_SYMBOLS.find(s => s.id === symbolId);
}

