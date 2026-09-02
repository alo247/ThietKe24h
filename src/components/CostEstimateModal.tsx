// src/components/CostEstimateModal.tsx
// Bảng Báo Cáo Thống Kê Khối Lượng Vật Tư (BOQ) & Dự Toán Kinh Phí Xây Dựng Tự Động

import React from 'react';
import { Board } from '../types';
import { calculateProjectBOQ } from '../core/calculations/QuantityTakeoff';
import { X, Download, Printer, Calculator, Layers, DollarSign, Building, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';

interface CostEstimateModalProps {
  board: Board;
  onClose: () => void;
}

export default function CostEstimateModal({ board, onClose }: CostEstimateModalProps) {
  const summary = calculateProjectBOQ(board);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'Hạng mục,Nội dung công việc,Đơn vị,Khối lượng,Đơn giá (VNĐ),Thành tiền (VNĐ)\n';
    summary.boqList.forEach(item => {
      csv += `"${item.category}","${item.name}","${item.unit}",${item.quantity},${item.unitPrice},${item.totalPrice}\n`;
    });
    csv += `\n"","TỔNG DỰ TOÁN KINH PHÍ DỰ KIẾN","","","",${summary.totalEstimatedCost}\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${board.name}_DuToan_BOQ.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl max-w-4xl w-full border border-slate-100 max-h-[92vh] flex flex-col space-y-4"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shadow-xs">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Bảng Thống Kê Khối Lượng & Dự Toán BOQ</h3>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Tính Toán Tự Động 100%
                </span>
              </div>
              <p className="text-xs text-slate-500">Dự án: <strong>{board.name}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-emerald-200/60"
              title="Xuất file Excel CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="In báo cáo"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Thẻ thống kê tổng quan (Summary Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Diện Tích Sàn</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-blue-950 mt-0.5">
              {summary.totalFloorAreaM2} <span className="text-xs">m²</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Diện Tích Tường</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-indigo-950 mt-0.5">
              {summary.totalWallSurfaceAreaM2} <span className="text-xs">m²</span>
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Cửa Đi & Cửa Sổ</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-purple-950 mt-0.5">
              {summary.totalDoorsCount + summary.totalWindowsCount} <span className="text-xs">bộ</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Tổng Dự Toán</div>
            <div className="text-sm sm:text-base font-mono font-bold text-emerald-950 mt-0.5 truncate">
              {summary.totalEstimatedCost.toLocaleString('vi-VN')} <span className="text-xs">đ</span>
            </div>
          </div>
        </div>

        {/* Bảng chi tiết từng hạng mục công việc (BOQ Table) */}
        <div className="flex-1 overflow-y-auto border border-slate-200/80 rounded-2xl min-h-0 no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 sticky top-0 z-10 text-slate-700 font-bold">
              <tr>
                <th className="py-2.5 px-3 border-b border-slate-200">Hạng Mục & Mô Tả Công Việc</th>
                <th className="py-2.5 px-3 border-b border-slate-200 text-center w-16">ĐVT</th>
                <th className="py-2.5 px-3 border-b border-slate-200 text-right w-20">Khối Lượng</th>
                <th className="py-2.5 px-3 border-b border-slate-200 text-right w-28">Đơn Giá</th>
                <th className="py-2.5 px-3 border-b border-slate-200 text-right w-32">Thành Tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.boqList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.category}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{item.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {item.quantity.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.unitPrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                    {item.totalPrice.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <tr>
                <td colSpan={4} className="py-3 px-3 text-right text-slate-800 text-xs uppercase">
                  Tổng Dự Toán Kinh Phí Hoàn Thiện:
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">
                  {summary.totalEstimatedCost.toLocaleString('vi-VN')} đ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
