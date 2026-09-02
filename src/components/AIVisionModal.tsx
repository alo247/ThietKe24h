// src/components/AIVisionModal.tsx
// Modal Nhập Hình Ảnh 2D/3D & Phân Tích Kiến Trúc Tự Động Bằng AI Vision

import React, { useState, useRef } from 'react';
import { Board, AIAuthConfig } from '../types';
import { analyzeImageToBoard, VisionAnalysisResult } from '../services/aiVisionService';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Scan, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Eye, 
  RefreshCw,
  FileSearch,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIVisionModalProps {
  aiConfig: AIAuthConfig;
  onClose: () => void;
  onApplyAnalyzedBoard: (board: Board) => void;
}

export default function AIVisionModal({
  aiConfig,
  onClose,
  onApplyAnalyzedBoard
}: AIVisionModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn file ảnh
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      setAnalysisResult(null);
      // Tự động kích hoạt phân tích AI Vision
      runVisionAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Kích hoạt phân tích AI Vision
  const runVisionAnalysis = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageToBoard(imageDataUrl, aiConfig);
      setAnalysisResult(result);
    } catch (e) {
      alert('Có lỗi khi phân tích ảnh. Vui lòng thử lại!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Kéo thả file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Dán ảnh từ Clipboard (Ctrl + V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleFileChange(blob);
        break;
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans"
      onPaste={handlePaste}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-base shadow-md">
              📸
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <span>AI Vision: Tải Ảnh Bản Vẽ & Trích Xuất 3D Tự Động</span>
                <span className="bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full text-[10px] font-mono border border-indigo-400/30">
                  AUTO-PARSE
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Nhập ảnh 2D mặt bằng, bản vẽ tay hoặc ảnh phối cảnh 3D để AI dựng lại mô hình
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Khu vực Upload / Kéo thả ảnh */}
          {!selectedImage ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Kéo thả hình ảnh hoặc bấm để tải lên
              </h4>
              <p className="text-xs text-slate-500 max-w-md">
                Hỗ trợ ảnh mặt bằng 2D, ảnh phác thảo tay, ảnh chụp bản vẽ kiến trúc hoặc ảnh 3D cắt lớp (Hỗ trợ dán trực tiếp <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono">Ctrl + V</kbd>)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview ảnh kèm hiệu ứng quét Laser AI */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-64 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Uploaded blueprint"
                  className="max-h-64 object-contain"
                />

                {/* Hiệu ứng quét Laser khi AI đang phân tích */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-2xs flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse absolute top-1/2 -translate-y-1/2" />
                    <div className="bg-slate-900/90 border border-cyan-400/40 px-4 py-2 rounded-full text-cyan-300 font-bold text-xs flex items-center gap-2 shadow-2xl z-10">
                      <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>AI Vision đang quét & trích xuất kết cấu phòng ốc...</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setSelectedImage(null); setAnalysisResult(null); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition cursor-pointer text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Chọn ảnh khác</span>
                </button>
              </div>

              {/* Kết quả Phân tích sau khi hoàn thành */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Phân Tích Hoàn Tất: {analysisResult.projectName}</span>
                    </div>
                    <span className="bg-emerald-200 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {analysisResult.detectedRoomCount} Không Gian
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-100">
                    {analysisResult.explanation}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span>Số lượng phần tử trích xuất: <strong>{analysisResult.board.items.length} đối tượng</strong></span>
                    <button
                      onClick={() => {
                        onApplyAnalyzedBoard(analysisResult.board);
                        onClose();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-md shadow-emerald-500/25 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Triển Khai Vào Bản Vẽ Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
