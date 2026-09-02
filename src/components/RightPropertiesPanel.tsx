// src/components/RightPropertiesPanel.tsx
// Bảng điều khiển thuộc tính chi tiết đối tượng (Dài, Rộng, Cao, Diện tích, Góc, Vị trí X/Y, Vật liệu, Màu sắc)

import React from 'react';
import { BoardItem, WallItem, DoorWindowItem, GardenFurnitureItem } from '../types';
import { pxToMeters, metersToPx } from '../core/geometry/DimensionMath';
import { PBR_MATERIALS } from '../core/catalog/MaterialCatalog';
import { X, Trash2, Copy, RotateCw, Layers, Sparkles, Sliders } from 'lucide-react';

interface RightPropertiesPanelProps {
  selectedItem: BoardItem | null;
  onUpdateItem: (updated: BoardItem) => void;
  onDeleteItem: (id: string) => void;
  onClose: () => void;
}

export default function RightPropertiesPanel({
  selectedItem,
  onUpdateItem,
  onDeleteItem,
  onClose
}: RightPropertiesPanelProps) {
  if (!selectedItem) return null;

  // Trích xuất kích thước thực tế bằng Mét
  const widthMeters = pxToMeters(selectedItem.width || 50);
  const depthMeters = pxToMeters(selectedItem.height || 50);
  const heightMeters = (selectedItem as any).wallHeight || (selectedItem as any).height3D || 0.85;
  const areaM2 = Number((widthMeters * depthMeters).toFixed(2));
  const rotationDeg = selectedItem.rotation || 0;

  // Xử lý thay đổi kích thước
  const handleWidthChange = (m: number) => {
    onUpdateItem({ ...selectedItem, width: Math.max(10, metersToPx(m)) });
  };

  const handleDepthChange = (m: number) => {
    onUpdateItem({ ...selectedItem, height: Math.max(10, metersToPx(m)) });
  };

  const handleHeightChange = (m: number) => {
    if (selectedItem.type === 'wall') {
      onUpdateItem({ ...selectedItem, wallHeight: m } as WallItem);
    } else {
      onUpdateItem({ ...selectedItem, height3D: m } as GardenFurnitureItem);
    }
  };

  const handleRotationChange = (deg: number) => {
    onUpdateItem({ ...selectedItem, rotation: deg % 360 });
  };

  const handleColorChange = (color: string) => {
    onUpdateItem({ ...selectedItem, color } as any);
  };

  return (
    <aside className="w-72 sm:w-80 bg-white/95 backdrop-blur-md border-l border-slate-200/80 h-full flex flex-col z-30 select-none font-sans shrink-0 shadow-xs">
      {/* Header Panel */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs truncate max-w-[160px]">
              {(selectedItem as any).label || (selectedItem as any).name || 'Thuộc Tính Đối Tượng'}
            </h4>
            <div className="text-[10px] text-slate-400 capitalize">
              Loại: {selectedItem.type === 'wall' ? 'Tường Xây' : selectedItem.type === 'door_window' ? 'Cửa' : 'Nội Thất'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nội dung thuộc tính */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
        {/* 1. KÍCH THƯỚC 3 TRỤC (DÀI X, RỘNG Y, CAO Z) */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Kích Thước 3 Chiều (Dài x Rộng x Cao)
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Dài (m)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={widthMeters}
                onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0.1)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Rộng (m)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={depthMeters}
                onChange={(e) => handleDepthChange(parseFloat(e.target.value) || 0.1)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Cao (m)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={heightMeters}
                onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0.1)}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between font-mono">
            <span className="text-slate-600 font-medium text-[11px]">Diện tích chiếm chỗ:</span>
            <span className="font-bold text-blue-700 text-xs">{areaM2} m²</span>
          </div>
        </div>

        {/* 2. GÓC XOAY & VỊ TRÍ */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Góc Xoay & Tọa Độ
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Góc Xoay (°)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={rotationDeg}
                  onChange={(e) => handleRotationChange(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => handleRotationChange(rotationDeg + 90)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Xoay 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1">Tọa độ (X, Y)</label>
              <div className="px-2 py-1.5 rounded-xl bg-slate-100 font-mono text-[11px] text-slate-700 font-bold">
                {pxToMeters(selectedItem.x)}m, {pxToMeters(selectedItem.y)}m
              </div>
            </div>
          </div>
        </div>

        {/* 3. MÀU SẮC & VẬT LIỆU */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Vật Liệu & Màu Sắc
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {['#e5cbb0', '#451a03', '#f8fafc', '#0f172a', '#94a3b8', '#1e3a8a', '#22c55e', '#ea580c', '#eab308', '#ec4899', '#78350f', '#334155'].map(c => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                className={`w-8 h-8 rounded-xl border transition cursor-pointer ${
                  (selectedItem as any).color === c ? 'scale-110 border-blue-600 shadow-sm' : 'border-black/10'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* 4. HÀNH ĐỘNG XOÁ ĐỐI TƯỢNG */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => onDeleteItem(selectedItem.id)}
            className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-red-200/80"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Đối Tượng Này</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
