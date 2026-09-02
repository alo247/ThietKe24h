// src/core/catalog/MaterialCatalog.ts
// Thư viện Vật Liệu Quang Học PBR (Gạch, Đá, Gỗ, Sơn, Kính, Kim Loại, Nhựa, Vải, Bê Tông)

export type MaterialType = 
  | 'brick'     // Gạch
  | 'stone'     // Đá Granite / Marble
  | 'wood'      // Gỗ tự nhiên / Gỗ công nghiệp
  | 'paint'     // Sơn nước nội ngoại thất
  | 'glass'     // Kính cường lực / Kính màu
  | 'metal'     // Kim loại / Thép / Nhôm Xingfa / Đồng
  | 'plastic'   // Nhựa Acrylic / Composite
  | 'fabric'    // Vải nỉ / Da / Rèm
  | 'concrete'; // Bê tông mài / Xi măng

export interface PBRMaterialDef {
  id: string;
  name: string;
  type: MaterialType;
  color: string;
  roughness: number;  // Độ nhám bề mặt (0.0 bóng bẩy -> 1.0 thô ráp)
  metalness: number;  // Tính kim loại (0.0 phi kim -> 1.0 kim loại)
  transmission?: number; // Độ trong suốt truyền sáng (cho kính)
  opacity?: number;
  unitPrice: number;  // Đơn giá tham khảo theo m² (VNĐ/m²)
  previewPattern: 'solid' | 'planks' | 'tiles' | 'marble' | 'brick_grid' | 'weave' | 'concrete';
  description: string;
}

export const MATERIAL_TYPES: { id: MaterialType; name: string; icon: string }[] = [
  { id: 'wood', name: 'Gỗ', icon: '🪵' },
  { id: 'stone', name: 'Đá Marble / Granite', icon: '🏛️' },
  { id: 'brick', name: 'Gạch Ốp Lát', icon: '🧱' },
  { id: 'paint', name: 'Sơn Tường', icon: '🎨' },
  { id: 'glass', name: 'Kính Cường Lực', icon: '🪟' },
  { id: 'metal', name: 'Kim Loại & Nhôm', icon: '🔩' },
  { id: 'fabric', name: 'Vải & Da', icon: '🧶' },
  { id: 'concrete', name: 'Bê Tông & Xi Măng', icon: '🏗️' },
  { id: 'plastic', name: 'Nhựa Acrylic', icon: '🪣' }
];

export const PBR_MATERIALS: PBRMaterialDef[] = [
  // 1. GỖ (WOOD)
  {
    id: 'wood_oak',
    name: 'Gỗ Sồi Tự Nhiên (Natural Oak)',
    type: 'wood',
    color: '#e5cbb0',
    roughness: 0.35,
    metalness: 0.05,
    unitPrice: 750000,
    previewPattern: 'planks',
    description: 'Vân gỗ sồi Nga màu vàng sáng ấm áp, phủ bóng mờ chống trầy'
  },
  {
    id: 'wood_walnut',
    name: 'Gỗ Óc Chó Bắc Mỹ (Walnut)',
    type: 'wood',
    color: '#451a03',
    roughness: 0.3,
    metalness: 0.05,
    unitPrice: 1650000,
    previewPattern: 'planks',
    description: 'Tone màu nâu chocolate sang trọng, vân cuộn xoáy đẳng cấp'
  },
  {
    id: 'wood_decking',
    name: 'Gỗ Nhựa Ngoài Trời (WPC Decking)',
    type: 'wood',
    color: '#78350f',
    roughness: 0.6,
    metalness: 0.0,
    unitPrice: 950000,
    previewPattern: 'planks',
    description: 'Sàn gỗ ban công & hồ bơi chống nước, chịu nắng mưa 100%'
  },

  // 2. ĐÁ (STONE / MARBLE)
  {
    id: 'marble_carrara',
    name: 'Đá Marble Trắng Carrara Ý',
    type: 'stone',
    color: '#f8fafc',
    roughness: 0.1,
    metalness: 0.1,
    unitPrice: 2200000,
    previewPattern: 'marble',
    description: 'Đá cẩm thạch trắng vân mây xám Ý bóng gương sang trọng'
  },
  {
    id: 'granite_black_galaxy',
    name: 'Đá Kim Sa Đen (Black Galaxy)',
    type: 'stone',
    color: '#0f172a',
    roughness: 0.15,
    metalness: 0.2,
    unitPrice: 1450000,
    previewPattern: 'marble',
    description: 'Đá hoa cương đen ánh đồng kim sa lấp lánh cho mặt bếp'
  },

  // 3. GẠCH (BRICK / TILES)
  {
    id: 'tiles_ceramic_60x60',
    name: 'Gạch Men Ceramic 60x60cm',
    type: 'brick',
    color: '#f1f5f9',
    roughness: 0.25,
    metalness: 0.0,
    unitPrice: 380000,
    previewPattern: 'tiles',
    description: 'Gạch lát nền chống trơn bề mặt men vi tinh'
  },
  {
    id: 'brick_terracotta',
    name: 'Gạch Đỏ Thẻ Gốm (Terracotta)',
    type: 'brick',
    color: '#c2410c',
    roughness: 0.8,
    metalness: 0.0,
    unitPrice: 280000,
    previewPattern: 'brick_grid',
    description: 'Gạch gốm đỏ mộc mạc cho sân vườn và tường cổ điển'
  },

  // 4. SƠN TƯỜNG (PAINT)
  {
    id: 'paint_white_cream',
    name: 'Sơn Trắng Kem Kháng Khuẩn (Dulux/Jotun)',
    type: 'paint',
    color: '#fdfbf7',
    roughness: 0.85,
    metalness: 0.0,
    unitPrice: 95000,
    previewPattern: 'solid',
    description: 'Sơn nước bóng mờ lau chùi hiệu quả'
  },
  {
    id: 'paint_slate_gray',
    name: 'Sơn Xám Ghi Hiện Đại',
    type: 'paint',
    color: '#475569',
    roughness: 0.8,
    metalness: 0.0,
    unitPrice: 110000,
    previewPattern: 'solid',
    description: 'Tone xám điểm nhấn cá tính cho phòng khách & phòng ngủ'
  },

  // 5. KÍNH (GLASS)
  {
    id: 'glass_clear',
    name: 'Kính Cường Lực Trong Suốt 12mm',
    type: 'glass',
    color: '#bae6fd',
    roughness: 0.02,
    metalness: 0.1,
    transmission: 0.92,
    opacity: 0.35,
    unitPrice: 850000,
    previewPattern: 'solid',
    description: 'Kính tôi nhiệt an toàn cho vách tắm, lan can ban công'
  },
  {
    id: 'glass_tinted_black',
    name: 'Kính Đen Cản Nhiệt Low-E',
    type: 'glass',
    color: '#1e293b',
    roughness: 0.05,
    metalness: 0.2,
    transmission: 0.45,
    opacity: 0.7,
    unitPrice: 1350000,
    previewPattern: 'solid',
    description: 'Kính hộp cách âm cách nhiệt cánh tủ áo & cửa sổ mặt tiền'
  },

  // 6. KIM LOẠI (METAL)
  {
    id: 'metal_aluminum_xingfa',
    name: 'Nhôm Xingfa Quảng Đông Nhập Khẩu',
    type: 'metal',
    color: '#1e293b',
    roughness: 0.3,
    metalness: 0.85,
    unitPrice: 2400000,
    previewPattern: 'solid',
    description: 'Hệ nhôm cao cấp sơn tĩnh điện sần đen ánh kim'
  },

  // 7. BÊ TÔNG (CONCRETE)
  {
    id: 'concrete_polished',
    name: 'Bê Tông Mài Đánh Bóng (Polished Concrete)',
    type: 'concrete',
    color: '#64748b',
    roughness: 0.4,
    metalness: 0.05,
    unitPrice: 450000,
    previewPattern: 'concrete',
    description: 'Sàn bê tông mài phong cách Industrial hiện đại'
  },

  // 8. VẢI & NỈ (FABRIC)
  {
    id: 'fabric_linen',
    name: 'Vải Nỉ Bỉ Cao Cấp',
    type: 'fabric',
    color: '#94a3b8',
    roughness: 0.9,
    metalness: 0.0,
    unitPrice: 650000,
    previewPattern: 'weave',
    description: 'Vải nỉ bọc đệm sofa, gối tựa mềm mại thoáng khí'
  }
];

// Hàm tìm vật liệu theo ID
export function getPBRMaterial(id: string): PBRMaterialDef {
  return PBR_MATERIALS.find(m => m.id === id) || PBR_MATERIALS[0];
}
