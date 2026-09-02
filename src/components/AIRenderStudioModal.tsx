// src/components/AIRenderStudioModal.tsx
// Trình Render Phối Cảnh 3D AI Quang Học Siêu Thực (AI Photorealistic 3D Render Studio)

import React, { useState } from 'react';
import { Board } from '../types';
import { generatePhotorealisticRender, RenderStyle, LightingMood } from '../services/aiVisionService';
import { 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  Sunset, 
  Download, 
  Share2, 
  Layers, 
  Palette, 
  RefreshCw,
  CheckCircle2,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIRenderStudioModalProps {
  board: Board;
  onClose: () => void;
}

export default function AIRenderStudioModal({
  board,
  onClose
}: AIRenderStudioModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<RenderStyle>('luxury_modern');
  const [selectedLighting, setSelectedLighting] = useState<LightingMood>('daylight');
  const [isRendering, setIsRendering] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);

  const styleOptions: { id: RenderStyle; name: string; desc: string; icon: string }[] = [
    { id: 'luxury_modern', name: 'Luxury Hiện Đại', desc: 'Sàn gỗ sồi, mặt đá Marble trắng Carrara, vách kính đen sang trọng', icon: '✨' },
    { id: 'scandinavian', name: 'Bắc Âu (Scandinavian)', desc: 'Gỗ thông sáng màu, tông trắng kem tinh tế, tràn ngập ánh sáng', icon: '❄️' },
    { id: 'indochine', name: 'Đông Dương (Indochine)', desc: 'Gỗ óc chó trầm ấm, gạch bông cổ điển, nét giao thoa văn hóa', icon: '🏮' },
    { id: 'minimalist', name: 'Tối Giản (Japandi)', desc: 'Không gian mở thanh tịnh, vật liệu tự nhiên thuần khiết', icon: '🎋' },
    { id: 'neoclassical', name: 'Tân Cổ Điển', desc: 'Phào chỉ tường sang trọng, đèn chùm pha lê, nội thất quý phái', icon: '👑' }
  ];

  const lightingOptions: { id: LightingMood; name: string; icon: any }[] = [
    { id: 'daylight', name: 'Nắng Tự Nhiên Studio', icon: Sun },
    { id: 'golden_hour', name: 'Hoàng Hôn Vàng', icon: Sunset },
    { id: 'warm_night', name: 'Đèn Đêm Ấm Cúng', icon: Moon }
  ];

  const handleStartRender = async () => {
    setIsRendering(true);
    try {
      const url = await generatePhotorealisticRender(board, selectedStyle, selectedLighting);
      setRenderedImageUrl(url);
    } catch (e) {
      alert('Có lỗi khi tạo ảnh render. Vui lòng thử lại!');
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadHD = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.download = `Render3D_${board.name.replace(/\s+/g, '_')}_${selectedStyle}.png`;
    link.href = renderedImageUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center font-bold text-base shadow-md">
              🎨
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <span>AI 3D Render Studio: Xuất Phối Cảnh Siêu Thực 4K</span>
                <span className="bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full text-[10px] font-mono border border-amber-300/30">
                  RAY-TRACING
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Tạo ảnh phối cảnh 3D cắt lớp bóng đổ chân thực như tạp chí kiến trúc
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 no-scrollbar text-xs">
          {/* 1. Chọn Phong Cách Kiến Trúc */}
          <div>
            <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Phong Cách Thiết Kế Nội Thất</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {styleOptions.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedStyle === st.id
                      ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                    <span>{st.icon}</span>
                    <span>{st.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chọn Ánh Sáng & Thời Điểm */}
          <div>
            <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Ánh Sáng & Hiệu Ứng Bầu Trời</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {lightingOptions.map((lt) => {
                const IconComponent = lt.icon;
                return (
                  <button
                    key={lt.id}
                    onClick={() => setSelectedLighting(lt.id)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-center gap-2 font-bold ${
                      selectedLighting === lt.id
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{lt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khu vực Hiển Thị Kết Quả Render */}
          {renderedImageUrl ? (
            <div className="space-y-3 pt-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-950">
                <img
                  src={renderedImageUrl}
                  alt="Rendered 3D Cutaway"
                  className="w-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-medium">Độ phân giải: <strong>1920 x 1080 (HD Studio)</strong></span>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartRender}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Render lại</span>
                  </button>
                  <button
                    onClick={handleDownloadHD}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-md shadow-purple-500/25 cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Ảnh Phối Cảnh 3D</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={handleStartRender}
                disabled={isRendering}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-bold rounded-2xl text-xs transition active:scale-95 shadow-lg shadow-purple-500/30 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRendering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang tính toán phản xạ ánh sáng & đổ bóng Ray-tracing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Bắt Đầu Render Phối Cảnh 3D Siêu Thực</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
