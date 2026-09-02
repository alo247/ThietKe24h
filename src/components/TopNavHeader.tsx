// src/components/TopNavHeader.tsx
// Thanh điều hướng trên cùng chuẩn công nghiệp (New | Open | Save | Undo | Redo | 2D | 3D | AI | Render | Export)

import React, { useState } from 'react';
import { 
  Plus, 
  FolderOpen, 
  Save, 
  Undo2, 
  Redo2, 
  Layers, 
  Box, 
  Sparkles, 
  Camera, 
  Download, 
  FileCode, 
  FileSpreadsheet, 
  Sun, 
  Moon, 
  HelpCircle,
  Settings,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopNavHeaderProps {
  projectName: string;
  onRenameProject: (newName: string) => void;
  viewMode: '2d' | '3d';
  onToggleViewMode: (mode: '2d' | '3d') => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNewProject: () => void;
  onOpenTemplates: () => void;
  onSaveProject: () => void;
  onOpenAICopilot: () => void;
  onOpenAIRenderStudio: () => void;
  onOpenCostEstimator: () => void;
  onExportDXF: () => void;
  onExportPNG: () => void;
  onExportJSON: () => void;
}

export default function TopNavHeader({
  projectName,
  onRenameProject,
  viewMode,
  onToggleViewMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNewProject,
  onOpenTemplates,
  onSaveProject,
  onOpenAICopilot,
  onOpenAIRenderStudio,
  onOpenCostEstimator,
  onExportDXF,
  onExportPNG,
  onExportJSON
}: TopNavHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleFinishRename = () => {
    setIsEditingName(false);
    if (tempName.trim()) {
      onRenameProject(tempName.trim());
    }
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 flex items-center justify-between z-40 select-none font-sans shrink-0 shadow-xs">
      {/* 1. BRANDING & PROJECT NAME */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
          📐
        </div>
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleFinishRename}
              onKeyDown={(e) => e.key === 'Enter' && handleFinishRename()}
              autoFocus
              className="px-2 py-0.5 text-xs font-bold border border-blue-500 rounded-lg outline-none bg-blue-50/50"
            />
          ) : (
            <button
              onClick={() => { setTempName(projectName); setIsEditingName(true); }}
              className="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition truncate max-w-[140px] sm:max-w-[220px] text-left cursor-pointer"
              title="Bấm để đổi tên dự án"
            >
              {projectName}
            </button>
          )}
          <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Auto-saved
          </span>
        </div>
      </div>

      {/* 2. CENTER: 2D / 3D SWITCHER & TOOL ACTIONS */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Toggle 2D / 3D Segmented Control */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60">
          <button
            onClick={() => onToggleViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mặt Bằng 2D</span>
          </button>

          <button
            onClick={() => onToggleViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Phối Cảnh 3D</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="hidden md:flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition cursor-pointer ${canUndo ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 cursor-not-allowed'}`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition cursor-pointer ${canRedo ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 cursor-not-allowed'}`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. RIGHT: ACTIONS (TEMPLATES | AI COPILOT | RENDER | EXPORT) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Nút Thư Viện 50 Mẫu Nhà */}
        <button
          onClick={onOpenTemplates}
          className="px-2.5 sm:px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-blue-200/60"
        >
          <span>🏡</span>
          <span className="hidden md:inline">50 Mẫu Nhà</span>
        </button>

        {/* Nút Dự Toán Chi Phí */}
        <button
          onClick={onOpenCostEstimator}
          className="hidden lg:flex px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs items-center gap-1.5 transition cursor-pointer border border-amber-200/60"
        >
          <span>💰</span>
          <span>Dự Toán BOQ</span>
        </button>

        {/* Nút AI Copilot */}
        <button
          onClick={onOpenAICopilot}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Nút Render 3D Studio */}
        <button
          onClick={onOpenAIRenderStudio}
          className="hidden sm:flex px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-purple-400" />
          <span>Render 4K</span>
        </button>

        {/* Nút Xuất File Dropdown (AutoCAD DXF, PNG, JSON) */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer border border-slate-200/80"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Xuất File</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <AnimatePresence>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50 space-y-1 font-sans"
                >
                  <button
                    onClick={() => { onExportDXF(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-red-50 text-slate-800 hover:text-red-700 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-red-600" />
                    <div>
                      <div>Bản Vẽ AutoCAD (.DXF)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Xuất chuẩn thi công 6 layer</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { onExportPNG(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Lưu Ảnh Bản Vẽ (.PNG)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Độ phân giải cao siêu nét</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { onExportJSON(); setShowExportMenu(false); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>Lưu Dự Án (.JSON)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Sao lưu & mở lại mọi lúc</div>
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
