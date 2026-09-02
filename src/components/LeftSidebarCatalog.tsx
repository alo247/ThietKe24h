// src/components/LeftSidebarCatalog.tsx
// Thanh công cụ & Catalog Nội Thất bên trái chuẩn HomeByMe/Planner 5D (Có thể thu gọn / mở rộng)

import React, { useState } from 'react';
import { 
  FURNITURE_CATEGORIES, 
  CATALOG_PRODUCTS, 
  FurnitureCategory, 
  CatalogProduct,
  searchCatalogProducts 
} from '../core/catalog/FurnitureCatalog';
import { 
  PBR_MATERIALS, 
  MATERIAL_TYPES, 
  MaterialType, 
  PBRMaterialDef 
} from '../core/catalog/MaterialCatalog';
import { 
  Square, 
  DoorClosed, 
  Maximize2, 
  Layers, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Palette, 
  Wrench,
  Home,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SidebarTab = 'architecture' | 'furniture' | 'materials';

interface LeftSidebarCatalogProps {
  onAddWall: (thickness: number, isFence?: boolean) => void;
  onAddDoorWindow: (subType: 'single_door' | 'double_door' | 'sliding_door' | 'window') => void;
  onAddFurniture: (product: CatalogProduct) => void;
  onSelectMaterial: (material: PBRMaterialDef) => void;
  activeMaterialId?: string;
}

export default function LeftSidebarCatalog({
  onAddWall,
  onAddDoorWindow,
  onAddFurniture,
  onSelectMaterial,
  activeMaterialId
}: LeftSidebarCatalogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('architecture');
  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory>('living_room');
  const [selectedMatType, setSelectedMatType] = useState<MaterialType>('wood');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = searchCatalogProducts(searchQuery, selectedCategory);
  const filteredMaterials = PBR_MATERIALS.filter(m => m.type === selectedMatType);

  return (
    <aside 
      className={`h-full bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col z-30 transition-all duration-300 select-none font-sans shrink-0 shadow-xs ${
        isCollapsed ? 'w-14' : 'w-72 sm:w-80'
      }`}
    >
      {/* 1. TOP TABS: KIẾN TRÚC | NỘI THẤT | VẬT LIỆU */}
      <div className="p-2 border-b border-slate-100 flex items-center justify-between shrink-0">
        {!isCollapsed && (
          <div className="grid grid-cols-3 gap-1 w-full mr-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'architecture' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🧱</span>
              <span>Kiến Trúc</span>
            </button>
            <button
              onClick={() => setActiveTab('furniture')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'furniture' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛋️</span>
              <span>Nội Thất</span>
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'materials' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎨</span>
              <span>Vật Liệu</span>
            </button>
          </div>
        )}

        {/* Nút Thu Gọn Sidebar */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
          title={isCollapsed ? 'Mở rộng thanh công cụ' : 'Thu gọn'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. NỘI DUNG CHÍNH (SCROLLABLE CONTENT) */}
      {!isCollapsed ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          {/* === TAB 1: KIẾN TRÚC & KẾT CẤU (TƯỜNG, CỬA, CẦU THANG) === */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              {/* Hệ Tường Xây */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tường & Vách Ngăn</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddWall(20, false)}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs mb-1.5 group-hover:scale-105 transition">
                      200
                    </div>
                    <div className="text-xs font-bold text-slate-800">Tường Chịu Lực</div>
                    <div className="text-[10px] text-slate-400">Dày 200mm (20cm)</div>
                  </button>

                  <button
                    onClick={() => onAddWall(10, false)}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-500 text-white flex items-center justify-center font-bold text-xs mb-1.5 group-hover:scale-105 transition">
                      100
                    </div>
                    <div className="text-xs font-bold text-slate-800">Tường Ngăn Phòng</div>
                    <div className="text-[10px] text-slate-400">Dày 100mm (10cm)</div>
                  </button>
                </div>
              </div>

              {/* Hệ Cửa Đi & Cửa Sổ */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cửa Đi & Cửa Sổ</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onAddDoorWindow('single_door')}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition cursor-pointer"
                  >
                    <div className="text-xl mb-1">🚪</div>
                    <div className="text-xs font-bold text-slate-800">Cửa Đi 1 Cánh</div>
                    <div className="text-[10px] text-slate-400">Rộng 0.9m x Cao 2.2m</div>
                  </button>

                  <button
                    onClick={() => onAddDoorWindow('double_door')}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition cursor-pointer"
                  >
                    <div className="text-xl mb-1">🚪🚪</div>
                    <div className="text-xs font-bold text-slate-800">Cửa Đi 2 Cánh</div>
                    <div className="text-[10px] text-slate-400">Rộng 1.8m x Cao 2.4m</div>
                  </button>

                  <button
                    onClick={() => onAddDoorWindow('sliding_door')}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition cursor-pointer"
                  >
                    <div className="text-xl mb-1">🪟</div>
                    <div className="text-xs font-bold text-slate-800">Cửa Lùa Vách Kính</div>
                    <div className="text-[10px] text-slate-400">Ban công & Sân sau</div>
                  </button>

                  <button
                    onClick={() => onAddDoorWindow('window')}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition cursor-pointer"
                  >
                    <div className="text-xl mb-1">🪟</div>
                    <div className="text-xs font-bold text-slate-800">Cửa Sổ Lấy Sáng</div>
                    <div className="text-[10px] text-slate-400">Rộng 1.4m x Cao 1.4m</div>
                  </button>
                </div>
              </div>

              {/* Lan Can & Tường Rào */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lan Can & Ban Công</div>
                <button
                  onClick={() => onAddWall(10, true)}
                  className="w-full p-2.5 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 text-left transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Lan Can Kính Trong Suốt</div>
                      <div className="text-[10px] text-slate-400">Cao 1.4m kèm tay vịn kim loại</div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          )}

          {/* === TAB 2: NỘI THẤT (11 PHÂN KHU CHỨC NĂNG) === */}
          {activeTab === 'furniture' && (
            <div className="space-y-3">
              {/* Input tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm sofa, giường, tủ, bồn tắm..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Danh mục 11 phòng (Horizontal Scroll) */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {FURNITURE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Lưới sản phẩm nội thất */}
              <div className="space-y-2">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => onAddFurniture(prod)}
                    className="p-3 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition bg-slate-50/50 hover:bg-white flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-lg shadow-2xs shrink-0 group-hover:scale-105 transition">
                        {prod.icon}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition">
                          {prod.name}
                        </h5>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {prod.width}m x {prod.depth}m x {prod.height}m
                        </div>
                      </div>
                    </div>

                    <button 
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shrink-0"
                      title="Thêm vào bản vẽ"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === TAB 3: VẬT LIỆU QUANG HỌC PBR === */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              {/* Danh mục vật liệu (Gỗ, Đá, Gạch, Sơn, Kính, Kim loại, Bê tông) */}
              <div className="grid grid-cols-3 gap-1">
                {MATERIAL_TYPES.map(mat => (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMatType(mat.id)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
                      selectedMatType === mat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{mat.icon}</span>
                    <span className="truncate">{mat.name}</span>
                  </button>
                ))}
              </div>

              {/* Lưới mẫu vật liệu PBR */}
              <div className="space-y-2">
                {filteredMaterials.map(mat => (
                  <div
                    key={mat.id}
                    onClick={() => onSelectMaterial(mat)}
                    className={`p-2.5 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                      activeMaterialId === mat.id
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl border border-black/10 shadow-2xs shrink-0"
                      style={{ backgroundColor: mat.color }}
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 truncate">{mat.name}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{mat.description}</p>
                      <span className="text-[9px] text-emerald-700 font-mono font-bold">
                        {mat.unitPrice.toLocaleString('vi-VN')} đ/m²
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Khi Sidebar Thu Gọn: Hiển thị các icon thu nhỏ */
        <div className="flex-1 py-4 flex flex-col items-center gap-3">
          <button 
            onClick={() => { setIsCollapsed(false); setActiveTab('architecture'); }}
            className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition cursor-pointer text-lg"
            title="Kiến Trúc & Tường"
          >
            🧱
          </button>
          <button 
            onClick={() => { setIsCollapsed(false); setActiveTab('furniture'); }}
            className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition cursor-pointer text-lg"
            title="Nội Thất 11 Phòng"
          >
            🛋️
          </button>
          <button 
            onClick={() => { setIsCollapsed(false); setActiveTab('materials'); }}
            className="p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition cursor-pointer text-lg"
            title="Vật Liệu PBR"
          >
            🎨
          </button>
        </div>
      )}
    </aside>
  );
}
