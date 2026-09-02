// src/core/catalog/FurnitureCatalog.ts
// Hệ thống Catalog Nội Thất & Thiết Bị 11 Phân Khu Chức Năng (Hỗ trợ mở rộng 50.000+ sản phẩm)

export type FurnitureCategory = 
  | 'living_room'   // Phòng Khách
  | 'bedroom'       // Phòng Ngủ
  | 'kitchen'       // Phòng Bếp
  | 'dining'        // Phòng Ăn
  | 'bathroom'      // Phòng Tắm & WC
  | 'altar_room'    // Phòng Thờ Gia Tiên
  | 'balcony'       // Ban Công & Logia
  | 'garden'        // Sân Vườn & Cảnh Quan
  | 'garage'        // Gara & Nhà Xe
  | 'office'        // Văn Phòng & Góc Làm Việc
  | 'storage';      // Phòng Kho & Kỹ Thuật

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  category: FurnitureCategory;
  width: number;    // Chiều Dài (m)
  depth: number;    // Chiều Rộng / Sâu (m)
  height: number;   // Chiều Cao (m)
  elevation: number;// Cao độ so với mặt sàn (m)
  defaultColor: string;
  defaultMaterial: string;
  icon: string;
  price?: number;   // Giá tham khảo (VNĐ)
  brand?: string;
  description: string;
  tags: string[];
}

export const FURNITURE_CATEGORIES: { id: FurnitureCategory; name: string; icon: string }[] = [
  { id: 'living_room', name: 'Phòng Khách', icon: '🛋️' },
  { id: 'bedroom', name: 'Phòng Ngủ', icon: '🛏️' },
  { id: 'kitchen', name: 'Phòng Bếp', icon: '🍳' },
  { id: 'dining', name: 'Phòng Ăn', icon: '🍽️' },
  { id: 'bathroom', name: 'Phòng Tắm & WC', icon: '🛁' },
  { id: 'altar_room', name: 'Phòng Thờ', icon: '🕯️' },
  { id: 'balcony', name: 'Ban Công', icon: '⛱️' },
  { id: 'garden', name: 'Sân Vườn', icon: '🌳' },
  { id: 'garage', name: 'Gara Ô Tô', icon: '🚗' },
  { id: 'office', name: 'Văn Phòng', icon: '💻' },
  { id: 'storage', name: 'Phòng Kho', icon: '📦' }
];

// Danh mục sản phẩm mẫu chuẩn mực ban đầu (Có thể mở rộng vô hạn qua API/JSON)
export const CATALOG_PRODUCTS: CatalogProduct[] = [
  // 1. PHÒNG KHÁCH
  {
    id: 'sofa_l_luxury',
    sku: 'SOFA-L-01',
    name: 'Sofa Góc L Bọc Nỉ Luxury',
    category: 'living_room',
    width: 2.8,
    depth: 1.8,
    height: 0.85,
    elevation: 0,
    defaultColor: '#94a3b8',
    defaultMaterial: 'fabric_linen',
    icon: '🛋️',
    price: 18500000,
    brand: 'An Cường / Nhà Xinh',
    description: 'Sofa chữ L đệm mút D40 êm ái, bọc vải nỉ Bỉ chống bám bụi',
    tags: ['sofa', 'phòng khách', 'chữ L', 'nỉ']
  },
  {
    id: 'tv_cabinet_modern',
    sku: 'TV-CAB-01',
    name: 'Kệ Tivi Gỗ Sồi Treo Tường',
    category: 'living_room',
    width: 2.2,
    depth: 0.35,
    height: 1.8,
    elevation: 0,
    defaultColor: '#d4a373',
    defaultMaterial: 'wood_oak',
    icon: '📺',
    price: 8500000,
    brand: 'An Cường',
    description: 'Kệ TV gỗ sồi tự nhiên kết hợp vách nan trang trí',
    tags: ['kệ tv', 'tivi', 'gỗ sồi']
  },
  {
    id: 'coffee_table_wood',
    sku: 'CFT-01',
    name: 'Bàn Trà Gỗ Nguyên Tấm',
    category: 'living_room',
    width: 1.2,
    depth: 0.7,
    height: 0.42,
    elevation: 0,
    defaultColor: '#b08968',
    defaultMaterial: 'wood_walnut',
    icon: '☕',
    price: 5200000,
    brand: 'Phố Xinh',
    description: 'Bàn trà mặt gỗ óc chó chân kim loại sơn tĩnh điện đen',
    tags: ['bàn trà', 'bàn cafe']
  },

  // 2. PHÒNG NGỦ
  {
    id: 'bed_king_master',
    sku: 'BED-KING-01',
    name: 'Giường Ngủ Master King Size (2m x 2.2m)',
    category: 'bedroom',
    width: 2.2,
    depth: 2.0,
    height: 0.95,
    elevation: 0,
    defaultColor: '#1e3a8a',
    defaultMaterial: 'wood_oak',
    icon: '🛏️',
    price: 15500000,
    brand: 'Hoàng Anh Gia Lai',
    description: 'Giường ngủ đôi gỗ sồi tự nhiên, đầu giường bọc da microfiber',
    tags: ['giường', 'phòng ngủ', 'king size']
  },
  {
    id: 'wardrobe_walkin',
    sku: 'WARD-01',
    name: 'Tủ Quần Áo Âm Tường Cánh Kính (Walk-in Closet)',
    category: 'bedroom',
    width: 2.4,
    depth: 0.6,
    height: 2.4,
    elevation: 0,
    defaultColor: '#1e293b',
    defaultMaterial: 'glass_tinted',
    icon: '👔',
    price: 22000000,
    brand: 'EuroGold',
    description: 'Hệ tủ áo kịch trần đèn led cảm ứng, giá treo vest & đầm',
    tags: ['tủ quần áo', 'tủ âm tường', 'walk-in closet']
  },
  {
    id: 'nightstand_lamp',
    sku: 'NT-01',
    name: 'Tab Đầu Giường Kèm Đèn Ngủ Cầu Tròn',
    category: 'bedroom',
    width: 0.5,
    depth: 0.45,
    height: 0.65,
    elevation: 0,
    defaultColor: '#ffffff',
    defaultMaterial: 'wood_oak',
    icon: '💡',
    price: 2100000,
    brand: 'IKEA',
    description: 'Tab đầu giường 2 ngăn kéo màu trắng kèm đèn ngủ ánh vàng',
    tags: ['tab đầu giường', 'đèn ngủ']
  },

  // 3. PHÒNG BẾP
  {
    id: 'kitchen_island_marble',
    sku: 'KIT-ISL-01',
    name: 'Tủ Bếp Chữ L Kèm Đảo Bếp Đá Marble',
    category: 'kitchen',
    width: 3.2,
    depth: 2.4,
    height: 2.2,
    elevation: 0,
    defaultColor: '#f8fafc',
    defaultMaterial: 'marble_carrara',
    icon: '🍳',
    price: 45000000,
    brand: 'Hafele / Bosch',
    description: 'Hệ tủ bếp Acrylic chống ẩm mặt đá Vicostone trắng vân mây',
    tags: ['tủ bếp', 'bếp', 'đảo bếp', 'marble']
  },
  {
    id: 'refrigerator_sidebyside',
    sku: 'REF-01',
    name: 'Tủ Lạnh Side-by-Side 4 Cánh',
    category: 'kitchen',
    width: 0.95,
    depth: 0.75,
    height: 1.85,
    elevation: 0,
    defaultColor: '#0f172a',
    defaultMaterial: 'metal_steel',
    icon: '🧊',
    price: 28000000,
    brand: 'Samsung / LG',
    description: 'Tủ lạnh Inverter mặt kính đen gương sang trọng',
    tags: ['tủ lạnh', 'thiết bị bếp']
  },

  // 4. PHÒNG ĂN
  {
    id: 'dining_set_8chairs',
    sku: 'DIN-8-01',
    name: 'Bàn Ăn Mặt Đá Ceramic & 8 Ghế Tựa',
    category: 'dining',
    width: 2.0,
    depth: 0.9,
    height: 0.76,
    elevation: 0,
    defaultColor: '#d4a373',
    defaultMaterial: 'marble_carrara',
    icon: '🍽️',
    price: 16500000,
    brand: 'Nhà Xinh',
    description: 'Bàn ăn chống trầy xước, 8 ghế tựa bọc da êm ái',
    tags: ['bàn ăn', 'ghế ăn', 'phòng ăn']
  },

  // 5. PHÒNG TẮM & WC
  {
    id: 'bathtub_freestanding',
    sku: 'BATH-01',
    name: 'Bồn Tắm Nằm Sứ Trắng Độc Lập (Freestanding)',
    category: 'bathroom',
    width: 1.7,
    depth: 0.8,
    height: 0.65,
    elevation: 0,
    defaultColor: '#ffffff',
    defaultMaterial: 'ceramic_white',
    icon: '🛁',
    price: 19000000,
    brand: 'TOTO / Inax',
    description: 'Bồn tắm chất liệu acrylic ngọc trai chống ố vàng',
    tags: ['bồn tắm', 'phòng tắm', 'toto']
  },
  {
    id: 'vanity_double_sink',
    sku: 'VAN-02',
    name: 'Bàn Lavabo Đôi Mặt Đá Marble & Gương LED',
    category: 'bathroom',
    width: 1.6,
    depth: 0.55,
    height: 0.85,
    elevation: 0,
    defaultColor: '#78350f',
    defaultMaterial: 'marble_carrara',
    icon: '🪞',
    price: 12500000,
    brand: 'TOTO',
    description: 'Tủ lavabo gỗ sồi chống nước, 2 chậu sứ âm bàn',
    tags: ['lavabo', 'gương led', 'phòng tắm']
  },

  // 6. PHÒNG THỜ GIA TIÊN
  {
    id: 'altar_table_ancestral',
    sku: 'ALTAR-01',
    name: 'Bàn Thờ Gia Tiên Gỗ Mít / Gõ Đỏ Chạm Sen',
    category: 'altar_room',
    width: 1.97,
    depth: 0.97,
    height: 1.27,
    elevation: 0,
    defaultColor: '#451a03',
    defaultMaterial: 'wood_walnut',
    icon: '🕯️',
    price: 25000000,
    brand: 'Mỹ Nghệ Đồng Kỵ',
    description: 'Kích thước chuẩn thước Lỗ Ban (Tài Vượng - Quý Tử), vách CNC hoa sen',
    tags: ['bàn thờ', 'phòng thờ', 'gia tiên', 'lỗ ban']
  },

  // 7. BAN CÔNG & SÂN THƯỢNG
  {
    id: 'lounge_sunbed_balcony',
    sku: 'SUNBED-01',
    name: 'Giường Nằm Tắm Nắng Ban Công',
    category: 'balcony',
    width: 2.0,
    depth: 0.75,
    height: 0.45,
    elevation: 0,
    defaultColor: '#f8fafc',
    defaultMaterial: 'wood_teak',
    icon: '⛱️',
    price: 6800000,
    brand: 'Duy Tân Outdoor',
    description: 'Khung gỗ tếch chịu nắng mưa kèm đệm trắng chống thấm nước',
    tags: ['tắm nắng', 'ban công', 'ghế ngoài trời']
  },

  // 8. SÂN VƯỜN
  {
    id: 'koi_pond_garden',
    sku: 'KOI-01',
    name: 'Hồ Cá Koi Sinh Thái & Thác Nước Phong Thủy',
    category: 'garden',
    width: 4.0,
    depth: 2.5,
    height: 1.2,
    elevation: 0,
    defaultColor: '#0284c7',
    defaultMaterial: 'stone_slate',
    icon: '🐟',
    price: 35000000,
    brand: 'Sân Vườn Á Đông',
    description: 'Hồ lọc vi sinh chuẩn Nhật Bản, bờ kè đá cuội tự nhiên',
    tags: ['hồ cá koi', 'sân vườn', 'phong thủy']
  },

  // 9. GARA & NHÀ XE
  {
    id: 'garage_suv_car',
    sku: 'CAR-01',
    name: 'Xe Ô Tô SUV 7 Chỗ (Mô Phỏng Gara)',
    category: 'garage',
    width: 4.8,
    depth: 1.9,
    height: 1.75,
    elevation: 0,
    defaultColor: '#0f172a',
    defaultMaterial: 'metal_steel',
    icon: '🚗',
    price: 0,
    brand: 'Mô phỏng kích thước',
    description: 'Mô hình SUV để căn chỉnh chuẩn xác diện tích gara và lối quay đầu',
    tags: ['gara', 'ô tô', 'nhà xe']
  },

  // 10. VĂN PHÒNG & LÀM VIỆC
  {
    id: 'desk_executive_wood',
    sku: 'DSK-01',
    name: 'Bàn Làm Việc Giám Đốc Gỗ Tự Nhiên & Ghế Công Thái Học',
    category: 'office',
    width: 1.8,
    depth: 0.8,
    height: 0.75,
    elevation: 0,
    defaultColor: '#78350f',
    defaultMaterial: 'wood_oak',
    icon: '💻',
    price: 9800000,
    brand: 'Hòa Phát / Herman Miller',
    description: 'Bàn làm việc thông minh có hộc tủ bảo mật và sạc không dây',
    tags: ['bàn làm việc', 'ghế xoay', 'văn phòng']
  },

  // 11. PHÒNG KHO
  {
    id: 'storage_rack_metal',
    sku: 'STG-01',
    name: 'Kệ Sắt Để Đồ Phòng Kho 4 Tầng',
    category: 'storage',
    width: 1.5,
    depth: 0.5,
    height: 2.0,
    elevation: 0,
    defaultColor: '#334155',
    defaultMaterial: 'metal_steel',
    icon: '📦',
    price: 1800000,
    brand: 'Vinarack',
    description: 'Kệ thép sơn tĩnh điện chịu tải 200kg/tầng',
    tags: ['kệ kho', 'phòng kho', 'chứa đồ']
  }
];

// Hàm tìm kiếm catalog nhanh theo từ khóa & danh mục
export function searchCatalogProducts(query = '', category?: FurnitureCategory): CatalogProduct[] {
  const q = query.toLowerCase().trim();
  return CATALOG_PRODUCTS.filter(item => {
    const matchCat = !category || item.category === category;
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });
}
