// src/components/ArchitecturalCanvasItems.tsx
// Các hàm render đồ họa vector chuyên nghiệp cho Tường, Cửa, Cảnh Quan Sân Vườn, Nội Thất và Thước Đo

import React from 'react';
import { WallItem, DoorWindowItem, GardenFurnitureItem, DimensionItem } from '../types';

// ==========================================
// 1. RENDER TƯỜNG KIẾN TRÚC & TƯỜNG RÀO
// ==========================================
export const renderWall = (item: WallItem, isSelected: boolean) => {
  const isFence = item.isFence;
  const color = item.wallColor || (isFence ? '#94a3b8' : '#334155');
  const lengthM = (Math.hypot(item.width, item.height) / 50).toFixed(1);

  if (isFence) {
    // Tường rào sân vườn: Vẽ hoa văn thanh nan rào và cột trụ
    return (
      <div className="w-full h-full relative rounded flex items-center justify-center overflow-hidden">
        <div 
          className="w-full h-full border-2 border-dashed rounded"
          style={{ 
            borderColor: color,
            backgroundColor: `${color}15`,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px)'
          }}
        />
        <span className="absolute text-[9px] font-bold text-slate-600 bg-white/90 px-1 py-0.2 rounded shadow-xs select-none">
          Rào: {lengthM}m
        </span>
      </div>
    );
  }

  // Tường nhà chịu lực / tường ngăn
  return (
    <div 
      className="w-full h-full relative flex items-center justify-center rounded-sm transition-all"
      style={{
        backgroundColor: color,
        boxShadow: isSelected ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(0,0,0,0.25)' : '0 2px 6px rgba(0,0,0,0.15)'
      }}
    >
      {/* Vân gạch / bê tông mặt cắt kiến trúc */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 2px, transparent 2px, transparent 8px)'
        }}
      />
      {/* Nhãn chiều dài tường khi chọn */}
      {isSelected && (
        <span className="relative z-10 text-[10px] font-mono font-bold text-white bg-black/60 px-1.5 py-0.5 rounded pointer-events-none">
          {lengthM}m ({item.thickness >= 20 ? '200mm' : '100mm'})
        </span>
      )}
    </div>
  );
};

// ==========================================
// 2. RENDER CỬA ĐI & CỬA SỔ GẮN TƯỜNG
// ==========================================
export const renderDoorWindow = (item: DoorWindowItem, isSelected: boolean) => {
  const subType = item.subType || 'single_door';

  // 2.1. CỬA ĐI ĐƠN MỞ XOAY 90° (Chuẩn ký hiệu kiến trúc)
  if (subType === 'single_door') {
    return (
      <div className="w-full h-full relative overflow-visible">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Cung tròn quỹ đạo mở cửa */}
          <path
            d="M 10 90 A 80 80 0 0 1 90 10"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          {/* Khung bao cửa */}
          <rect x="0" y="80" width="10" height="20" fill="#475569" rx="2" />
          <rect x="90" y="80" width="10" height="20" fill="#475569" rx="2" />
          {/* Cánh cửa mở 90° */}
          <line x1="10" y1="90" x2="10" y2="10" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 2.2. CỬA ĐI 2 CÁNH / 4 CÁNH MỞ QUẠT
  if (subType === 'double_door') {
    return (
      <div className="w-full h-full relative overflow-visible">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* 2 Cung tròn mở 2 cánh */}
          <path d="M 10 90 A 40 40 0 0 1 50 50" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
          <path d="M 90 90 A 40 40 0 0 0 50 50" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
          {/* Cột khung 2 bên */}
          <rect x="0" y="80" width="10" height="20" fill="#334155" rx="2" />
          <rect x="90" y="80" width="10" height="20" fill="#334155" rx="2" />
          {/* 2 Cánh cửa */}
          <line x1="10" y1="90" x2="10" y2="50" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="90" x2="90" y2="50" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 2.3. CỬA TRƯỢT LÙA (SLIDING DOOR)
  if (subType === 'sliding_door') {
    return (
      <div className="w-full h-full relative flex items-center justify-between p-1 bg-white/80 border border-slate-300 rounded shadow-xs">
        <div className="w-[52%] h-2.5 bg-blue-500/80 rounded-sm border border-blue-600 shadow-xs" />
        <div className="w-[52%] h-2.5 bg-blue-400/80 rounded-sm border border-blue-500 -ml-2 shadow-xs" />
      </div>
    );
  }

  // 2.4. CỬA SỔ KÍNH KIẾN TRÚC (WINDOW)
  return (
    <div className="w-full h-full relative flex flex-col justify-between p-0.5 bg-sky-50 border-2 border-slate-700 rounded-xs shadow-xs">
      <div className="w-full h-0.5 bg-sky-400" />
      <div className="w-full h-1 bg-sky-300 rounded-xs flex items-center justify-center">
        <div className="w-1/2 h-full bg-sky-500" />
      </div>
      <div className="w-full h-0.5 bg-sky-400" />
    </div>
  );
};

// ==========================================
// 3. RENDER CẢNH QUAN SÂN VƯỜN & NỘI THẤT
// ==========================================
export const renderGardenFurniture = (item: GardenFurnitureItem, isSelected: boolean) => {
  const symbolId = item.symbolId;
  const label = item.label;

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center select-none">
      {/* 3.1. CÂY CỔ THỤ / CÂY BÓNG MÁT TÁN LỚN */}
      {symbolId === 'tree_large' && (
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Bóng đổ cây */}
          <div className="absolute inset-1 rounded-full bg-emerald-950/15 blur-xs translate-y-1" />
          {/* Tán cây ngoài */}
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-green-700 border-2 border-green-800/40 shadow-md flex items-center justify-center relative overflow-hidden">
            {/* Vân tán lá */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-green-400/30 border border-green-300/40" />
            <div className="absolute w-[50%] h-[50%] rounded-full bg-emerald-300/40" />
            {/* Nhánh cây & thân */}
            <div className="w-3 h-3 rounded-full bg-amber-900 border border-amber-950 z-10 shadow-xs" />
          </div>
        </div>
      )}

      {/* 3.2. CÂY LÁ KIM / CÂY TÙNG */}
      {symbolId === 'tree_pine' && (
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 to-teal-900 border-2 border-emerald-950/50 shadow-md flex items-center justify-center relative">
            {/* Các tầng lá nhọn */}
            <svg className="w-full h-full absolute inset-0 text-emerald-300/40" viewBox="0 0 100 100">
              <polygon points="50,10 90,50 50,40 10,50" fill="currentColor" />
              <polygon points="50,30 95,80 50,70 5,80" fill="currentColor" />
            </svg>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-950 z-10" />
          </div>
        </div>
      )}

      {/* 3.3. BỒN HOA TIỂU CẢNH */}
      {symbolId === 'flower_bed' && (
        <div className="w-full h-full rounded-2xl bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 border-2 border-rose-300 shadow-xs flex items-center justify-around px-2 overflow-hidden">
          <span className="text-sm">🌸</span>
          <span className="text-xs">🌺</span>
          <span className="text-sm">🌼</span>
          <span className="text-xs">🌷</span>
        </div>
      )}

      {/* 3.4. HÀNG RÀO CÂY XANH */}
      {symbolId === 'bush_hedge' && (
        <div className="w-full h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 border-2 border-green-800 shadow-xs flex items-center justify-center">
          <div className="w-[90%] h-1 bg-green-300/40 rounded-full" />
        </div>
      )}

      {/* 3.5. HỒ CÁ KOI NGHỆ THUẬT */}
      {symbolId === 'koi_pond' && (
        <div className="w-full h-full relative rounded-3xl bg-gradient-to-br from-sky-300 via-cyan-400 to-blue-600 border-4 border-stone-400/80 shadow-inner flex items-center justify-center overflow-hidden">
          {/* Mặt nước uốn lượn & hoa súng */}
          <div className="absolute top-2 left-4 text-xs">🪷</div>
          <div className="absolute bottom-3 right-5 text-xs">🌿</div>
          <div className="absolute text-[11px] font-bold text-white/90 drop-shadow flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
            <span>🐟</span>
            <span>Hồ Cá Koi</span>
          </div>
        </div>
      )}

      {/* 3.6. HỒ BƠI GIA ĐÌNH */}
      {symbolId === 'swimming_pool' && (
        <div className="w-full h-full rounded-2xl bg-sky-400 border-4 border-white shadow-md p-1 flex flex-col justify-between relative overflow-hidden">
          {/* Lưới gạch men hồ bơi */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />
          {/* Bậc thang xuống hồ */}
          <div className="w-10 h-6 bg-white/60 border border-white/80 rounded-b-md z-10 flex flex-col justify-evenly px-1">
            <div className="w-full h-0.5 bg-slate-400" />
            <div className="w-full h-0.5 bg-slate-400" />
          </div>
          <div className="text-center font-bold text-white drop-shadow text-xs z-10">
            HỒ BƠI
          </div>
        </div>
      )}

      {/* 3.7. LỐI ĐI ĐÁ CUỘI SÂN VƯỜN */}
      {symbolId === 'stone_path' && (
        <div className="w-full h-full flex items-center justify-around px-2 py-1 bg-amber-900/10 rounded-xl border border-dashed border-amber-900/30">
          <div className="w-7 h-5 rounded-full bg-stone-300 border border-stone-400 shadow-xs -rotate-12" />
          <div className="w-8 h-6 rounded-full bg-stone-400 border border-stone-500 shadow-xs rotate-6" />
          <div className="w-6 h-5 rounded-full bg-stone-300 border border-stone-400 shadow-xs -rotate-6" />
          <div className="w-8 h-5 rounded-full bg-stone-400 border border-stone-500 shadow-xs rotate-12" />
        </div>
      )}

      {/* 3.8. THẢM CỎ XANH TỰ NHIÊN */}
      {symbolId === 'grass_patch' && (
        <div className="w-full h-full rounded-2xl bg-emerald-100/70 border-2 border-emerald-300/80 flex items-center justify-center relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }}
          />
          <span className="text-[11px] font-bold text-emerald-800 bg-white/70 px-2 py-0.5 rounded-full shadow-xs">
            {label || 'Thảm Cỏ Sân Vườn'}
          </span>
        </div>
      )}

      {/* 3.9. CHÒI NGHỈ VỌNG CẢNH (GAZEBO) */}
      {symbolId === 'gazebo' && (
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Mái chòi lục giác */}
          <div className="w-full h-full rounded-full bg-amber-800 border-4 border-amber-950 shadow-lg flex items-center justify-center text-white relative">
            <svg className="w-full h-full absolute inset-0 text-amber-900" viewBox="0 0 100 100">
              <line x1="50" y1="50" x2="50" y2="0" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="50" x2="50" y2="100" stroke="currentColor" strokeWidth="2" />
              <line x1="50" y1="50" x2="0" y2="50" stroke="currentColor" strokeWidth="2" />
            </svg>
            {/* Bàn trà giữa chòi */}
            <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-amber-400 z-10 shadow-md flex items-center justify-center text-amber-900 text-[9px] font-bold">
              🍵
            </div>
          </div>
        </div>
      )}

      {/* 3.10. BÀN GHẾ CAFE NGOÀI TRỜI + DÙ CHE */}
      {symbolId === 'patio_table' && (
        <div className="w-full h-full rounded-full bg-blue-100 border-2 border-blue-300 shadow-md flex items-center justify-center relative">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-400 shadow-sm flex items-center justify-center text-xs">
            ⛱️
          </div>
          {/* 4 Ghế ngồi */}
          <div className="absolute top-1 w-3 h-3 rounded-full bg-slate-300 border" />
          <div className="absolute bottom-1 w-3 h-3 rounded-full bg-slate-300 border" />
          <div className="absolute left-1 w-3 h-3 rounded-full bg-slate-300 border" />
          <div className="absolute right-1 w-3 h-3 rounded-full bg-slate-300 border" />
        </div>
      )}

      {/* 3.11. BẾP NƯỚNG BBQ NGOÀI TRỜI */}
      {symbolId === 'bbq_station' && (
        <div className="w-full h-full rounded-xl bg-slate-800 border-2 border-slate-950 shadow-md flex items-center justify-between px-3 text-white">
          <span className="text-xs">🥩</span>
          <div className="flex-1 h-3 mx-2 bg-slate-900 rounded border border-slate-700 flex items-center justify-evenly">
            <div className="w-0.5 h-full bg-red-500" />
            <div className="w-0.5 h-full bg-orange-500" />
            <div className="w-0.5 h-full bg-amber-500" />
          </div>
          <span className="text-xs">🔥</span>
        </div>
      )}

      {/* 3.12. NỘI THẤT SOFA PHÒNG KHÁCH */}
      {symbolId === 'living_sofa' && (
        <div className="w-full h-full rounded-2xl bg-indigo-100 border-2 border-indigo-400 p-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex gap-1 h-2/3">
            <div className="flex-1 bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center text-[10px] shadow-xs">
              Sofa L
            </div>
            <div className="w-1/3 bg-indigo-400 rounded-lg" />
          </div>
          <div className="h-1/3 mt-1 bg-amber-100 border border-amber-300 rounded-md flex items-center justify-center text-[9px] font-semibold text-amber-900">
            Bàn Trà
          </div>
        </div>
      )}

      {/* 3.13. BÀN ĂN 6 GHẾ */}
      {symbolId === 'dining_table' && (
        <div className="w-full h-full rounded-xl bg-amber-50 border-2 border-amber-600 p-1 flex items-center justify-between shadow-xs">
          <div className="flex flex-col justify-between h-full py-0.5">
            <div className="w-2.5 h-3 bg-amber-400 rounded-xs border" />
            <div className="w-2.5 h-3 bg-amber-400 rounded-xs border" />
          </div>
          <div className="flex-1 h-full mx-1 bg-amber-200/80 border border-amber-400 rounded-md flex items-center justify-center text-[9px] font-bold text-amber-900">
            Bàn Ăn
          </div>
          <div className="flex flex-col justify-between h-full py-0.5">
            <div className="w-2.5 h-3 bg-amber-400 rounded-xs border" />
            <div className="w-2.5 h-3 bg-amber-400 rounded-xs border" />
          </div>
        </div>
      )}

      {/* 3.14. GIƯỜNG NGỦ MASTER */}
      {symbolId === 'bed_double' && (
        <div className="w-full h-full rounded-2xl bg-pink-50 border-2 border-pink-400 p-1.5 flex flex-col justify-between shadow-xs">
          {/* Tab đầu giường & 2 Gối */}
          <div className="flex justify-around items-center h-1/3">
            <div className="w-7 h-5 bg-white border border-pink-300 rounded shadow-xs" />
            <div className="w-7 h-5 bg-white border border-pink-300 rounded shadow-xs" />
          </div>
          {/* Thân nệm & Chăn ga */}
          <div className="h-2/3 bg-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-inner">
            King Bed
          </div>
        </div>
      )}

      {/* 3.15. TỦ BẾP & BỒN RỬA */}
      {symbolId === 'kitchen_counter' && (
        <div className="w-full h-full rounded-xl bg-amber-100 border-2 border-amber-500 p-1 flex items-center justify-around shadow-xs">
          <div className="w-1/2 h-full bg-slate-200 border border-slate-400 rounded flex items-center justify-center text-[9px]">
            Bếp từ ♨️
          </div>
          <div className="w-1/3 h-full bg-sky-100 border border-sky-400 rounded flex items-center justify-center text-[9px]">
            Chậu rửa 🚰
          </div>
        </div>
      )}

      {/* 3.16. THIẾT BỊ VỆ SINH & BỒN TẮM */}
      {symbolId === 'bathroom_set' && (
        <div className="w-full h-full rounded-xl bg-cyan-50 border-2 border-cyan-500 p-1 flex items-center justify-around shadow-xs">
          <div className="w-2/5 h-full bg-white border border-cyan-400 rounded-xl flex items-center justify-center text-[9px] shadow-xs">
            Bồn tắm 🛁
          </div>
          <div className="w-1/4 h-full bg-white border border-cyan-400 rounded-full flex items-center justify-center text-[9px]">
            Lavabo
          </div>
        </div>
      )}

      {/* 3.17. TỦ ÁO ÂM TƯỜNG & PHÒNG THAY ĐỒ (WALK-IN CLOSET) */}
      {symbolId === 'walk_in_closet' && (
        <div className="w-full h-full rounded-xl bg-slate-100 border-2 border-slate-700 p-1 flex items-center justify-between shadow-xs">
          <div className="w-1/3 h-full border-r border-dashed border-slate-400 flex flex-col justify-evenly items-center text-[8px] text-slate-500">
            <span>👔</span>
            <span>👗</span>
          </div>
          <div className="flex-1 text-center font-bold text-slate-800 text-[9px]">
            Tủ Quần Áo
          </div>
          <div className="w-1/4 h-full bg-slate-200 border border-slate-300 rounded-xs flex items-center justify-center text-[8px]">
            Kệ
          </div>
        </div>
      )}

      {/* 3.18. KỆ TIVI & TỦ SÁCH TRANG TRÍ (TV WALL UNIT) */}
      {symbolId === 'tv_unit' && (
        <div className="w-full h-full rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-between text-white shadow-xs">
          <div className="w-2 h-full bg-amber-700 rounded-xs" />
          <div className="flex-1 text-center font-bold text-[9px] flex items-center justify-center gap-1">
            <span>📺</span>
            <span>Kệ TV & Tủ Sách</span>
          </div>
          <div className="w-2 h-full bg-amber-700 rounded-xs" />
        </div>
      )}

      {/* 3.19. BÀN LÀM VIỆC & BÀN TRANG ĐIỂM (WORK DESK) */}
      {symbolId === 'work_desk' && (
        <div className="w-full h-full rounded-xl bg-amber-50 border-2 border-amber-700 p-1 flex items-center justify-between shadow-xs">
          <div className="w-3/5 h-full bg-white border border-amber-300 rounded flex items-center justify-center text-[9px]">
            💻 Bàn làm việc
          </div>
          <div className="w-1/3 h-full bg-amber-200 border border-amber-400 rounded-full flex items-center justify-center text-[8px]">
            Ghế
          </div>
        </div>
      )}

      {/* 3.20. CẦU THANG GỖ NỘI THẤT (STAIRS) */}
      {symbolId === 'interior_stairs' && (
        <div className="w-full h-full rounded-xl bg-amber-100 border-2 border-amber-900 p-1 flex flex-col justify-evenly overflow-hidden relative shadow-xs">
          <div className="w-full h-1 bg-amber-800/40" />
          <div className="w-full h-1 bg-amber-800/40" />
          <div className="w-full h-1 bg-amber-800/40" />
          <div className="w-full h-1 bg-amber-800/40" />
          <div className="w-full h-1 bg-amber-800/40" />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-amber-950 text-[10px] bg-white/60">
            ▲ LÊN LẦU (STAIRS)
          </div>
        </div>
      )}

      {/* 3.21. BÀN LAVABO ĐÔI MARBLE (DOUBLE VANITY) */}
      {symbolId === 'double_vanity' && (
        <div className="w-full h-full rounded-xl bg-slate-50 border-2 border-slate-300 p-1 flex items-center justify-around shadow-xs">
          <div className="w-2/5 h-4/5 bg-white border border-sky-300 rounded-full flex items-center justify-center text-[8px] text-sky-700 font-bold">
            Lavabo 1
          </div>
          <div className="w-2/5 h-4/5 bg-white border border-sky-300 rounded-full flex items-center justify-center text-[8px] text-sky-700 font-bold">
            Lavabo 2
          </div>
        </div>
      )}

      {/* 3.22. CABIN TẮM ĐỨNG VÁCH KÍNH (GLASS SHOWER) */}
      {symbolId === 'glass_shower' && (
        <div className="w-full h-full rounded-xl bg-sky-50 border-2 border-sky-400 p-1 flex items-center justify-center shadow-xs relative overflow-hidden">
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-sky-500 flex items-center justify-center text-[8px]">
            🚿
          </div>
        </div>
      )}

      {/* 3.23. GHẾ NẰM TẮM NẮNG BAN CÔNG (LOUNGE SUNBED) */}
      {symbolId === 'lounge_sunbed' && (
        <div className="w-full h-full rounded-xl bg-amber-100 border-2 border-amber-700 p-1 flex flex-col justify-between shadow-xs">
          <div className="w-full h-1/4 bg-white border border-amber-400 rounded-t flex items-center justify-center text-[7px]">
            Gối
          </div>
          <div className="w-full h-3/4 bg-amber-400 rounded-b flex items-center justify-center text-[8px] font-bold text-white">
            Sunbed
          </div>
        </div>
      )}

      {/* 3.24. GIÀN PERGOLA SÂN THƯỢNG (TERRACE PERGOLA) */}
      {symbolId === 'terrace_pergola' && (
        <div className="w-full h-full rounded-2xl bg-amber-900/10 border-2 border-amber-900 flex flex-col justify-evenly p-1">
          <div className="w-full h-1 bg-amber-900" />
          <div className="w-full h-1 bg-amber-900" />
          <div className="w-full h-1 bg-amber-900" />
          <div className="w-full h-1 bg-amber-900" />
          <div className="text-center font-bold text-amber-950 text-[9px]">
            GIÀN LAM PERGOLA
          </div>
        </div>
      )}

      {/* 3.25. CHẬU CÂY CỌ / CÂY BÀNG NỘI THẤT */}
      {symbolId === 'indoor_potted_palm' && (
        <div className="w-full h-full rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center relative shadow-xs">
          <div className="w-5 h-5 rounded-full bg-amber-800 flex items-center justify-center text-[9px]">
            🪴
          </div>
        </div>
      )}

      {/* 3.26. THẢM TRẢI SÀN (LIVING RUG) */}
      {symbolId === 'living_rug' && (
        <div className="w-full h-full rounded-xl bg-slate-200/80 border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] font-bold text-slate-600">
          Thảm Nỉ Dệt Sợi
        </div>
      )}

      {/* Nhãn văn bản nếu có */}
      {label && symbolId !== 'grass_patch' && symbolId !== 'koi_pond' && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded-full whitespace-nowrap pointer-events-none shadow-xs">
          {label}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. RENDER THƯỚC ĐO KÍCH THƯỚC (DIMENSION)
// ==========================================
export const renderDimension = (item: DimensionItem, isSelected: boolean) => {
  // Khoảng cách theo pixel quy đổi ra mét (50px = 1 mét)
  const distancePx = Math.hypot(item.width, item.height);
  const lengthMeters = (distancePx / 50).toFixed(2);

  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Đường gióng chính */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,2" />
        {/* 2 Vạch giới hạn đầu mút (Architectural Ticks 45 độ) */}
        <line x1="0" y1="20" x2="0" y2="80" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="100" y1="20" x2="100" y2="80" stroke="#ef4444" strokeWidth="2.5" />
      </svg>
      {/* Thẻ hiển thị số đo */}
      <div className="absolute bg-white border border-red-500 text-red-600 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm pointer-events-auto">
        📏 {lengthMeters} m
      </div>
    </div>
  );
};
