// src/components/CostEstimatorModal.tsx
// Bảng Dự Toán Chi Phí Xây Dựng & Bóc Tách Khối Lượng Vật Tư (BOM & Cost Estimation)

import React, { useState, useMemo } from 'react';
import { Board, WallItem, DoorWindowItem, GardenFurnitureItem } from '../types';
import { 
  X, 
  Download, 
  Printer, 
  DollarSign, 
  Home, 
  Trees, 
  Calculator, 
  Layers, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

interface CostEstimatorModalProps {
  board: Board;
  onClose: () => void;
}

export default function CostEstimatorModal({ board, onClose }: CostEstimatorModalProps) {
  // Đơn giá tùy chỉnh (người dùng có thể điều chỉnh trực tiếp)
  const [unitCostConstruction, setUnitCostConstruction] = useState(3800000); // 3.8 triệu/m2 xây thô
  const [unitCostFinishing, setUnitCostFinishing] = useState(2500000);       // 2.5 triệu/m2 hoàn thiện
  const [unitCostLandscape, setUnitCostLandscape] = useState(650000);        // 650k/m2 sân vườn

  // Thuật toán phân tích khối lượng từ các đối tượng trên Board
  const estimation = useMemo(() => {
    let totalWallLengthM = 0;
    let singleDoorsCount = 0;
    let doubleDoorsCount = 0;
    let slidingDoorsCount = 0;
    let windowsCount = 0;
    let treesCount = 0;
    let pondCount = 0;
    let poolCount = 0;
    let gazeboCount = 0;
    let gardenPavingAreaM2 = 0;
    let interiorItemsCount = 0;
    let totalLawnAreaM2 = 0;

    board.items.forEach(item => {
      // 1. TÍNH KHỐI LƯỢNG TƯỜNG
      if (item.type === 'wall') {
        const wall = item as WallItem;
        const lengthM = Math.hypot(wall.width, wall.height) / 50; // 50px = 1m
        totalWallLengthM += lengthM;
      }

      // 2. TÍNH SỐ LƯỢNG CỬA
      else if (item.type === 'door_window') {
        const dw = item as DoorWindowItem;
        if (dw.subType === 'single_door') singleDoorsCount++;
        else if (dw.subType === 'double_door') doubleDoorsCount++;
        else if (dw.subType === 'sliding_door') slidingDoorsCount++;
        else if (dw.subType === 'window') windowsCount++;
      }

      // 3. TÍNH CẢNH QUAN SÂN VƯỜN & NỘI THẤT
      else if (item.type === 'garden_item') {
        const g = item as GardenFurnitureItem;
        const areaM2 = (g.width * g.height) / 2500; // (50px)^2 = 1m2

        if (['tree_large', 'tree_pine'].includes(g.symbolId)) treesCount++;
        else if (g.symbolId === 'koi_pond') pondCount++;
        else if (g.symbolId === 'swimming_pool') poolCount++;
        else if (g.symbolId === 'gazebo') gazeboCount++;
        else if (g.symbolId === 'grass_patch') totalLawnAreaM2 += areaM2;
        else if (['stone_path', 'wooden_deck'].includes(g.symbolId)) gardenPavingAreaM2 += areaM2;
        else if (g.category === 'interior') interiorItemsCount++;
      }
    });

    // Ước tính diện tích sàn xây dựng từ chiều dài tường hoặc mặc định
    const estimatedFloorAreaM2 = totalWallLengthM > 0 
      ? Math.max(30, Math.round((totalWallLengthM * totalWallLengthM) / 16)) 
      : 80;

    // Ước tính diện tích sân vườn
    const estimatedGardenAreaM2 = Math.max(totalLawnAreaM2, 50);

    // Tính toán thành tiền từng hạng mục
    const costRoughConstruction = estimatedFloorAreaM2 * unitCostConstruction;
    const costFinishing = estimatedFloorAreaM2 * unitCostFinishing;
    const costDoors = (singleDoorsCount * 3200000) + (doubleDoorsCount * 8500000) + (slidingDoorsCount * 6500000) + (windowsCount * 2200000);
    const costLandscape = (estimatedGardenAreaM2 * unitCostLandscape) + (treesCount * 1500000) + (pondCount * 25000000) + (poolCount * 65000000) + (gazeboCount * 18000000);
    const costInterior = interiorItemsCount * 7500000;

    const grandTotal = costRoughConstruction + costFinishing + costDoors + costLandscape + costInterior;

    return {
      estimatedFloorAreaM2,
      estimatedGardenAreaM2,
      totalWallLengthM: Math.round(totalWallLengthM * 10) / 10,
      singleDoorsCount,
      doubleDoorsCount,
      slidingDoorsCount,
      windowsCount,
      treesCount,
      pondCount,
      poolCount,
      gazeboCount,
      interiorItemsCount,
      costRoughConstruction,
      costFinishing,
      costDoors,
      costLandscape,
      costInterior,
      grandTotal
    };
  }, [board.items, unitCostConstruction, unitCostFinishing, unitCostLandscape]);

  // Định dạng số tiền VND đẹp mắt
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Xuất bảng dự toán thành file CSV / Excel
  const handleExportCSV = () => {
    const rows = [
      ['DỰ TOÁN CHI PHÍ XÂY DỰNG & CẢNH QUAN SÂN VƯỜN'],
      ['Dự án:', board.name],
      ['Thời gian lập:', new Date().toLocaleDateString('vi-VN')],
      [''],
      ['STT', 'Hạng Mục Công Việc', 'Khối Lượng', 'Đơn Vị', 'Đơn Giá (VND)', 'Thành Tiền (VND)'],
      ['1', 'Xây dựng phần thô & kết cấu', estimation.estimatedFloorAreaM2, 'm²', unitCostConstruction, estimation.costRoughConstruction],
      ['2', 'Hoàn thiện kiến trúc & sơn bả', estimation.estimatedFloorAreaM2, 'm²', unitCostFinishing, estimation.costFinishing],
      ['3', 'Hệ thống Cửa đi & Cửa sổ', estimation.singleDoorsCount + estimation.doubleDoorsCount + estimation.slidingDoorsCount + estimation.windowsCount, 'Bộ', '-', estimation.costDoors],
      ['4', 'Cảnh quan sân vườn, cây xanh, hồ nước', estimation.estimatedGardenAreaM2, 'm²', unitCostLandscape, estimation.costLandscape],
      ['5', 'Nội thất & Thiết bị cơ bản', estimation.interiorItemsCount, 'Món', '7,500,000', estimation.costInterior],
      [''],
      ['', 'TỔNG CỘNG DỰ TOÁN:', '', '', '', estimation.grandTotal]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DuToan_${board.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-6 shadow-2xl max-w-3xl w-full border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar space-y-6 font-sans"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 font-bold">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span>Dự Toán Chi Phí & Thống Kê Vật Tư</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-bold">Tự động</span>
              </h3>
              <p className="text-xs text-slate-500">Dự án: <strong className="text-slate-800">{board.name}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-700 block mb-1">Tổng Mức Đầu Tư</span>
            <span className="text-base font-bold text-emerald-900 block truncate">{formatVND(estimation.grandTotal)}</span>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-blue-700 block mb-1">Diện Tích Xây Dựng</span>
            <span className="text-base font-bold text-blue-900 block font-mono">{estimation.estimatedFloorAreaM2} m²</span>
          </div>

          <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-teal-700 block mb-1">Diện Tích Sân Vườn</span>
            <span className="text-base font-bold text-teal-900 block font-mono">{estimation.estimatedGardenAreaM2} m²</span>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <span className="text-[11px] font-bold text-amber-700 block mb-1">Thời Gian Thi Công</span>
            <span className="text-base font-bold text-amber-900 block font-mono">~3.5 - 5 Tháng</span>
          </div>
        </div>

        {/* Chi tiết từng hạng mục bóc tách */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Bảng Khối Lượng & Chi Phí Chi Tiết</span>
          </h4>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Hạng Mục</th>
                  <th className="py-2.5 px-3">Khối Lượng</th>
                  <th className="py-2.5 px-3">Đơn Giá Tùy Chỉnh</th>
                  <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* 1. Xây thô */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">
                    <div>1. Xây dựng phần thô & kết cấu móng/mái</div>
                    <div className="text-[10px] text-slate-400">Bê tông cốt thép, tường gạch ({estimation.totalWallLengthM}m tường)</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{estimation.estimatedFloorAreaM2} m²</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={unitCostConstruction}
                      onChange={(e) => setUnitCostConstruction(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatVND(estimation.costRoughConstruction)}</td>
                </tr>

                {/* 2. Hoàn thiện */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">
                    <div>2. Hoàn thiện kiến trúc</div>
                    <div className="text-[10px] text-slate-400">Sơn bả, lát nền, ốp gạch, trần thạch cao, điện nước</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{estimation.estimatedFloorAreaM2} m²</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={unitCostFinishing}
                      onChange={(e) => setUnitCostFinishing(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatVND(estimation.costFinishing)}</td>
                </tr>

                {/* 3. Cửa đi & Cửa sổ */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">
                    <div>3. Cửa nhôm kính & cửa gỗ</div>
                    <div className="text-[10px] text-slate-400">
                      {estimation.singleDoorsCount} cửa đơn, {estimation.doubleDoorsCount} cửa đôi, {estimation.slidingDoorsCount} cửa lùa, {estimation.windowsCount} cửa sổ
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{estimation.singleDoorsCount + estimation.doubleDoorsCount + estimation.slidingDoorsCount + estimation.windowsCount} Bộ</td>
                  <td className="py-2.5 px-3 text-slate-400">Theo quy cách</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatVND(estimation.costDoors)}</td>
                </tr>

                {/* 4. Cảnh quan sân vườn */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">
                    <div>4. Cảnh quan sân vườn & Cây xanh, Hồ nước</div>
                    <div className="text-[10px] text-slate-400">
                      {estimation.treesCount} cây bóng mát, {estimation.pondCount} hồ cá Koi, {estimation.poolCount} hồ bơi, {estimation.gazeboCount} chòi nghỉ
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{estimation.estimatedGardenAreaM2} m²</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={unitCostLandscape}
                      onChange={(e) => setUnitCostLandscape(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-mono"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatVND(estimation.costLandscape)}</td>
                </tr>

                {/* 5. Nội thất */}
                <tr className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold">
                    <div>5. Nội thất & Thiết bị phòng</div>
                    <div className="text-[10px] text-slate-400">Sofa, giường, tủ bếp, bàn ăn, thiết bị vệ sinh</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{estimation.interiorItemsCount} Món</td>
                  <td className="py-2.5 px-3 text-slate-400">Ước tính trung bình</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatVND(estimation.costInterior)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-50/50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-emerald-900 text-sm">TỔNG MỨC ĐẦU TƯ DỰ KIẾN</td>
                  <td className="py-3 px-3 text-right text-emerald-700 text-base font-mono">{formatVND(estimation.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition active:scale-95 shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất File Excel (CSV)</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
