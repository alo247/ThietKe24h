import React, { useState } from 'react';
import { DrawingTool, PenSettings, StickyColor, AttachmentType } from '../types';
import { 
  Square, 
  Type, 
  Paperclip, 
  FileText, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  FolderPlus, 
  Compass, 
  Smile, 
  Palette, 
  Eraser, 
  Sparkles, 
  PenTool, 
  Paintbrush, 
  PaintBucket, 
  Pipette, 
  Search, 
  X,
  Home,
  Trees,
  Ruler,
  DoorClosed,
  Box,
  Layers,
  Fish,
  Waves,
  Footprints,
  Tent,
  Sun,
  Flame,
  Armchair,
  Utensils,
  Bed,
  ChefHat,
  Bath,
  Flower2,
  TreePine,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ARCHITECTURAL_SYMBOLS } from '../data/architecturalSymbols';

interface ToolbarProps {
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  onAddSticky: (color: StickyColor) => void;
  onAddTextBox: () => void;
  onAddTable: () => void;
  onAddAttachment: (type: AttachmentType, file?: File) => void;
  onToggleShapesMenu: () => void;
  penSettings: PenSettings;
  onChangePenSettings: (settings: PenSettings) => void;
  // Các hàm mở rộng cho Thiết Kế Nhà & Sân Vườn
  onAddWall?: (thickness: number, isFence?: boolean) => void;
  onAddDoorWindow?: (subType: 'single_door' | 'double_door' | 'sliding_door' | 'window') => void;
  onAddGardenFurniture?: (symbolId: string) => void;
  onAddDimension?: () => void;
  onOpenTemplates?: () => void;
  onOpenLandWizard?: () => void;
  onOpenCostEstimator?: () => void;
  onToggleView3D?: () => void;
  is3DView?: boolean;
}

export default function Toolbar({
  isDrawingMode,
  onToggleDrawingMode,
  onAddSticky,
  onAddTextBox,
  onAddTable,
  onAddAttachment,
  onToggleShapesMenu,
  penSettings,
  onChangePenSettings,
  onAddWall,
  onAddDoorWindow,
  onAddGardenFurniture,
  onAddDimension,
  onOpenTemplates,
  onOpenLandWizard,
  onOpenCostEstimator,
  onToggleView3D,
  is3DView
}: ToolbarProps) {
  const [activePopover, setActivePopover] = useState<'sticky' | 'attachment' | 'architecture' | 'pen_custom' | 'eraser_custom' | 'color_custom' | null>(null);
  const [archCategory, setArchCategory] = useState<'walls' | 'garden' | 'interior'>('walls');

  // iOS-style colors for Sticky Notes
  const stickyColors: { color: StickyColor; bg: string; border: string }[] = [
    { color: 'yellow', bg: 'bg-yellow-200 hover:bg-yellow-300', border: 'border-yellow-400' },
    { color: 'green', bg: 'bg-green-200 hover:bg-green-300', border: 'border-green-400' },
    { color: 'blue', bg: 'bg-blue-200 hover:bg-blue-300', border: 'border-blue-400' },
    { color: 'pink', bg: 'bg-pink-200 hover:bg-pink-300', border: 'border-pink-400' },
    { color: 'orange', bg: 'bg-orange-200 hover:bg-orange-300', border: 'border-orange-400' },
    { color: 'purple', bg: 'bg-purple-200 hover:bg-purple-300', border: 'border-purple-400' },
    { color: 'gray', bg: 'bg-slate-200 hover:bg-slate-300', border: 'border-slate-400' },
  ];

  // Palette colors for drawing
  const paletteColors = [
    '#000000', // Black
    '#ff3b30', // Red
    '#ff9500', // Orange
    '#ffcc00', // Yellow
    '#34c759', // Green
    '#007aff', // Blue
    '#5856d6', // Purple
    '#af52de', // Violet
    '#ff2d55', // Pink
  ];

  const handleToolSelect = (tool: DrawingTool) => {
    if (penSettings.tool === tool) {
      // Toggle customizer popover
      if (tool === 'eraser') {
        setActivePopover(activePopover === 'eraser_custom' ? null : 'eraser_custom');
      } else {
        setActivePopover(activePopover === 'pen_custom' ? null : 'pen_custom');
      }
    } else {
      onChangePenSettings({
        ...penSettings,
        tool
      });
      // Auto open settings popover on single tap for customizable tools
      if (tool === 'eraser') {
        setActivePopover('eraser_custom');
      } else if (['picker', 'magnifier'].includes(tool)) {
        setActivePopover(null);
      } else {
        setActivePopover('pen_custom');
      }
    }
  };

  const handleWidthSelect = (width: number) => {
    const activeTool = penSettings.tool === 'eraser' ? 'pencil' : penSettings.tool;
    onChangePenSettings({
      ...penSettings,
      [activeTool]: {
        ...penSettings[activeTool],
        width
      }
    });
  };

  const handleOpacityChange = (opacity: number) => {
    const activeTool = penSettings.tool === 'eraser' ? 'pencil' : penSettings.tool;
    onChangePenSettings({
      ...penSettings,
      [activeTool]: {
        ...penSettings[activeTool],
        opacity
      }
    });
  };

  const handleColorSelect = (color: string) => {
    const activeTool = penSettings.tool === 'eraser' ? 'pencil' : penSettings.tool;
    onChangePenSettings({
      ...penSettings,
      [activeTool]: {
        ...penSettings[activeTool],
        color
      }
    });
    // Keep popover open so the user can see the live preview line update in real-time
  };

  const handleEraserModeSelect = (mode: 'pixel' | 'object') => {
    onChangePenSettings({
      ...penSettings,
      eraser: {
        ...penSettings.eraser,
        mode
      }
    });
  };

  const handleEraserSizeSelect = (size: number) => {
    onChangePenSettings({
      ...penSettings,
      eraser: {
        ...penSettings.eraser,
        size
      }
    });
  };

  const handleBrushStyleSelect = (style: 'watercolor' | 'marker' | 'calligraphy' | 'crayon' | 'normal') => {
    onChangePenSettings({
      ...penSettings,
      brush: {
        ...penSettings.brush,
        style
      }
    });
  };

  const handleSprayRadiusChange = (radius: number) => {
    onChangePenSettings({
      ...penSettings,
      spray: {
        ...penSettings.spray,
        radius
      }
    });
  };

  const handleSprayDensityChange = (density: number) => {
    onChangePenSettings({
      ...penSettings,
      spray: {
        ...penSettings.spray,
        density
      }
    });
  };

  // Trigger Local file picker for Photos / Attachments
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
    setActivePopover(null);
  };

  const handleDocUploadClick = () => {
    docInputRef.current?.click();
    setActivePopover(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: AttachmentType) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddAttachment(type, file);
    }
    e.target.value = ''; // Reset
  };

  // Active settings for current drawing tool (non-eraser)
  const currentToolSettings = (['pencil', 'pen', 'highlighter', 'brush', 'spray', 'bucket'].includes(penSettings.tool))
    ? (penSettings as any)[penSettings.tool]
    : penSettings.pencil;

  return (
    <div className="relative font-sans select-none">
      {/* Background Dim Backdrop when popover active */}
      {activePopover && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setActivePopover(null)} 
        />
      )}

      {/* Popovers Layer */}
      <AnimatePresence>
        {/* Sticky Note Popover */}
        {activePopover === 'sticky' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 flex gap-2 apple-shadow"
          >
            {stickyColors.map((item) => (
              <button
                key={item.color}
                onClick={() => {
                  onAddSticky(item.color);
                  setActivePopover(null);
                }}
                className={`w-8 h-8 rounded-lg ${item.bg} border ${item.border} shadow-sm transition active:scale-90 cursor-pointer`}
                title={`Màu ${item.color}`}
              />
            ))}
          </motion.div>
        )}

        {/* Attachments Picker Popover - Screenshot 3 */}
        {activePopover === 'attachment' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-xs apple-shadow text-slate-800"
          >
            <button
              onClick={() => { onAddTable(); setActivePopover(null); }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 font-medium cursor-pointer"
            >
              <TableIcon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              Thêm bảng
            </button>
            <button
              onClick={handleImageUploadClick}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 font-medium cursor-pointer"
            >
              <ImageIcon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              Chọn ảnh hoặc video
            </button>
            <button
              onClick={handleDocUploadClick}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              Chọn tệp tài liệu
            </button>
            <button
              onClick={() => {
                const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://');
                if (url && url !== 'https://') {
                  onAddAttachment('link');
                }
                setActivePopover(null);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 font-medium cursor-pointer"
            >
              <LinkIcon className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              Thêm liên kết
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <button
              onClick={() => { alert('Duyệt nội dung mẫu...'); setActivePopover(null); }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 font-medium cursor-pointer text-slate-400"
            >
              <FolderPlus className="w-4.5 h-4.5 shrink-0" />
              Duyệt Trung tâm nội dung
            </button>
          </motion.div>
        )}

        {/* 3. Architecture & Garden Popover - Thiết Kế Nhà & Sân Vườn */}
        {activePopover === 'architecture' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-84 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 p-3 z-50 text-xs apple-shadow text-slate-800 space-y-3"
          >
            {/* Header with Title & Category Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Home className="w-4.5 h-4.5 text-blue-600" />
                  <span>Thiết Kế Nhà & Sân Vườn</span>
                </div>
                <button
                  onClick={() => setActivePopover(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Category Segmented Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setArchCategory('walls')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    archCategory === 'walls' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tường & Cửa
                </button>
                <button
                  onClick={() => setArchCategory('garden')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    archCategory === 'garden' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sân Vườn
                </button>
                <button
                  onClick={() => setArchCategory('interior')}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    archCategory === 'interior' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Nội Thất
                </button>
              </div>
            </div>

            {/* Tab 1: Tường & Cửa & Thước Đo */}
            {archCategory === 'walls' && (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                <button
                  onClick={() => { onAddWall?.(20, false); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <div className="w-full h-4 bg-slate-700 rounded-xs group-hover:bg-blue-600 transition" />
                  <span className="font-bold text-[11px] text-slate-800">Tường chính 200mm</span>
                  <span className="text-[9px] text-slate-400">Tường chịu lực bao quanh</span>
                </button>

                <button
                  onClick={() => { onAddWall?.(10, false); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <div className="w-full h-2 bg-slate-500 rounded-xs group-hover:bg-blue-500 transition" />
                  <span className="font-bold text-[11px] text-slate-800">Tường ngăn 100mm</span>
                  <span className="text-[9px] text-slate-400">Vách ngăn phòng ngủ, bếp</span>
                </button>

                <button
                  onClick={() => { onAddWall?.(10, true); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <div className="w-full h-3 border-2 border-dashed border-emerald-600 rounded-xs bg-emerald-50" />
                  <span className="font-bold text-[11px] text-slate-800">Tường rào sân vườn</span>
                  <span className="text-[9px] text-slate-400">Hàng rào hoa văn thoáng</span>
                </button>

                <button
                  onClick={() => { onAddDoorWindow?.('single_door'); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <DoorClosed className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-[11px] text-slate-800">Cửa đi đơn 1 cánh</span>
                  <span className="text-[9px] text-slate-400">Mở xoay 90° (0.9m)</span>
                </button>

                <button
                  onClick={() => { onAddDoorWindow?.('double_door'); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <DoorClosed className="w-5 h-5 text-amber-700" />
                  <span className="font-bold text-[11px] text-slate-800">Cửa chính 2 cánh</span>
                  <span className="text-[9px] text-slate-400">Mặt tiền phòng khách</span>
                </button>

                <button
                  onClick={() => { onAddDoorWindow?.('sliding_door'); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <Layers className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-[11px] text-slate-800">Cửa trượt lùa</span>
                  <span className="text-[9px] text-slate-400">Cửa kính mở ra sân vườn</span>
                </button>

                <button
                  onClick={() => { onAddDoorWindow?.('window'); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <div className="w-6 h-4 border-2 border-sky-500 bg-sky-100 rounded-xs flex items-center justify-center">
                    <div className="w-1/2 h-full bg-sky-400" />
                  </div>
                  <span className="font-bold text-[11px] text-slate-800">Cửa sổ kính</span>
                  <span className="text-[9px] text-slate-400">Cửa sổ lấy sáng tự nhiên</span>
                </button>

                <button
                  onClick={() => { onAddDimension?.(); setActivePopover(null); }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/50 flex flex-col items-center gap-1.5 transition text-left cursor-pointer group"
                >
                  <Ruler className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-[11px] text-slate-800">Thước đo khoảng cách</span>
                  <span className="text-[9px] text-slate-400">Hiển thị mét tự động</span>
                </button>
              </div>
            )}

            {/* Tab 2: Cảnh Quan Sân Vườn */}
            {archCategory === 'garden' && (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {ARCHITECTURAL_SYMBOLS.filter(s => s.category !== 'interior').map(sym => (
                  <button
                    key={sym.id}
                    onClick={() => { onAddGardenFurniture?.(sym.id); setActivePopover(null); }}
                    className="p-2 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: `${sym.color}20`, color: sym.color }}>
                      {sym.id === 'tree_large' && <Trees className="w-5 h-5" />}
                      {sym.id === 'tree_pine' && <TreePine className="w-5 h-5" />}
                      {sym.id === 'flower_bed' && <Flower2 className="w-5 h-5" />}
                      {sym.id === 'bush_hedge' && <Sparkles className="w-5 h-5" />}
                      {sym.id === 'koi_pond' && <Fish className="w-5 h-5" />}
                      {sym.id === 'swimming_pool' && <Waves className="w-5 h-5" />}
                      {sym.id === 'fountain' && <Waves className="w-5 h-5" />}
                      {sym.id === 'stone_path' && <Footprints className="w-5 h-5" />}
                      {sym.id === 'wooden_deck' && <Layers className="w-5 h-5" />}
                      {sym.id === 'grass_patch' && <Sparkles className="w-5 h-5" />}
                      {sym.id === 'gazebo' && <Tent className="w-5 h-5" />}
                      {sym.id === 'patio_table' && <Sun className="w-5 h-5" />}
                      {sym.id === 'bbq_station' && <Flame className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-slate-800 truncate">{sym.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">{sym.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Tab 3: Nội Thất Trong Nhà */}
            {archCategory === 'interior' && (
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {ARCHITECTURAL_SYMBOLS.filter(s => s.category === 'interior').map(sym => (
                  <button
                    key={sym.id}
                    onClick={() => { onAddGardenFurniture?.(sym.id); setActivePopover(null); }}
                    className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: `${sym.color}20`, color: sym.color }}>
                      {sym.id === 'living_sofa' && <Armchair className="w-5 h-5" />}
                      {sym.id === 'dining_table' && <Utensils className="w-5 h-5" />}
                      {sym.id === 'bed_double' && <Bed className="w-5 h-5" />}
                      {sym.id === 'kitchen_counter' && <ChefHat className="w-5 h-5" />}
                      {sym.id === 'bathroom_set' && <Bath className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[11px] text-slate-800 truncate">{sym.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">{sym.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Quick Action Buttons */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5">
              <button
                onClick={() => { onOpenTemplates?.(); setActivePopover(null); }}
                className="py-2 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer border border-blue-200/60"
              >
                <span>🏡</span>
                <span className="truncate">Mẫu Nhà</span>
              </button>

              <button
                onClick={() => { onOpenLandWizard?.(); setActivePopover(null); }}
                className="py-2 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer border border-emerald-200/60"
              >
                <span>📐</span>
                <span className="truncate">Khung Đất</span>
              </button>

              <button
                onClick={() => { onOpenCostEstimator?.(); setActivePopover(null); }}
                className="py-2 px-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer border border-amber-200/60"
              >
                <span>💰</span>
                <span className="truncate">Dự Toán</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Unified Art Box Customizer - Beautifully Integrated */}
        {((activePopover === 'pen_custom' && !['picker', 'magnifier'].includes(penSettings.tool)) || 
          (activePopover === 'eraser_custom' && penSettings.tool === 'eraser') ||
          (activePopover === 'color_custom')) && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-76 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/40 p-4 z-50 space-y-3.5 apple-shadow"
          >
            {/* Header: Tool title & Quick description */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px]">
                  {penSettings.tool === 'pencil' && "Pencil"}
                  {penSettings.tool === 'pen' && "Pen"}
                  {penSettings.tool === 'highlighter' && "Marker"}
                  {penSettings.tool === 'brush' && "Brush"}
                  {penSettings.tool === 'spray' && "Spray"}
                  {penSettings.tool === 'bucket' && "Bucket"}
                  {penSettings.tool === 'eraser' && "Eraser"}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {penSettings.tool === 'pencil' && "Bút chì phác thảo"}
                  {penSettings.tool === 'pen' && "Bút viết lông kim"}
                  {penSettings.tool === 'highlighter' && "Bút dạ quang"}
                  {penSettings.tool === 'brush' && "Cọ vẽ mỹ thuật"}
                  {penSettings.tool === 'spray' && "Bình phun xịt màu"}
                  {penSettings.tool === 'bucket' && "Thùng đổ màu nền"}
                  {penSettings.tool === 'eraser' && "Cục tẩy cao su"}
                </span>
              </div>
              <button 
                onClick={() => setActivePopover(null)} 
                className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* A. Live Stroke Preview (Only for stroke-based drawing tools) */}
            {!['eraser', 'picker', 'magnifier', 'bucket'].includes(penSettings.tool) && (
              <div className="bg-slate-50/80 border border-slate-100/50 p-2 rounded-xl flex items-center justify-center h-10 overflow-hidden relative">
                <div className="absolute top-1 left-2 text-[8px] text-slate-400 font-bold uppercase tracking-wider">Xem trước nét vẽ</div>
                <svg className="w-full h-8" viewBox="0 0 200 40">
                  <path 
                    d="M 10 20 C 50 10, 150 30, 190 20" 
                    fill="none" 
                    stroke={currentToolSettings.color || '#000000'} 
                    strokeWidth={currentToolSettings.width || 2} 
                    opacity={currentToolSettings.opacity !== undefined ? currentToolSettings.opacity : 1}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}

            {/* B. Color Palette Selector (All tools except eraser/picker/magnifier) */}
            {!['eraser', 'picker', 'magnifier'].includes(penSettings.tool) && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bảng màu sắc</span>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                  {paletteColors.map((color) => {
                    const isSelected = penSettings.tool === 'bucket' 
                      ? penSettings.bucket.color === color 
                      : currentToolSettings.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          if (penSettings.tool === 'bucket') {
                            onChangePenSettings({
                              ...penSettings,
                              bucket: { color }
                            });
                          } else {
                            handleColorSelect(color);
                          }
                        }}
                        className="w-7 h-7 rounded-full transition relative flex items-center justify-center active:scale-95 hover:scale-105 cursor-pointer shadow-sm border border-black/5"
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md border border-slate-300" />
                        )}
                      </button>
                    );
                  })}
                  {/* Custom color picker */}
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition cursor-pointer flex items-center justify-center bg-white" title="Chọn màu tùy chỉnh">
                    <input
                      type="color"
                      value={penSettings.tool === 'bucket' ? penSettings.bucket.color : (currentToolSettings.color || '#000000')}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (penSettings.tool === 'bucket') {
                          onChangePenSettings({
                            ...penSettings,
                            bucket: { color: newColor }
                          });
                        } else {
                          handleColorSelect(newColor);
                        }
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <Palette className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* C. Brush Styles (Only for brush tool) */}
            {penSettings.tool === 'brush' && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hiệu ứng đầu cọ</span>
                <div className="grid grid-cols-2 gap-1">
                  {(['normal', 'crayon', 'marker', 'watercolor'] as const).map((style) => {
                    const isActive = penSettings.brush.style === style;
                    const labels: Record<string, string> = {
                      normal: 'Nét mịn trơn',
                      crayon: 'Chất sáp crayon',
                      marker: 'Dạ màu marker',
                      watercolor: 'Sơn nước loang'
                    };
                    return (
                      <button
                        key={style}
                        onClick={() => handleBrushStyleSelect(style)}
                        className={`py-1 px-1.5 rounded-lg text-[9px] font-bold transition border cursor-pointer text-center truncate ${
                          isActive 
                            ? 'bg-blue-500 border-blue-600 text-white shadow-sm' 
                            : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                        }`}
                        title={labels[style]}
                      >
                        {labels[style]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* D. Spray sliders (Only for spray tool) */}
            {penSettings.tool === 'spray' && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Bán kính xịt</span>
                    <span className="font-mono font-bold text-slate-600">{penSettings.spray.radius}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={penSettings.spray.radius}
                    onChange={(e) => handleSprayRadiusChange(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Mật độ hạt tia</span>
                    <span className="font-mono font-bold text-slate-600">{penSettings.spray.density} tia</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={penSettings.spray.density}
                    onChange={(e) => handleSprayDensityChange(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>
              </div>
            )}

            {/* E. Eraser Customizer Section (Only for eraser tool) */}
            {penSettings.tool === 'eraser' && (
              <div className="space-y-3.5">
                {/* Mode Selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => handleEraserModeSelect('pixel')}
                    className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                      penSettings.eraser.mode === 'pixel' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tẩy điểm ảnh
                  </button>
                  <button
                    onClick={() => handleEraserModeSelect('object')}
                    className={`flex-1 py-1 text-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                      penSettings.eraser.mode === 'object' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tẩy đối tượng
                  </button>
                </div>

                {/* Eraser Size Slider and Presets */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kích thước đầu tẩy</span>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{penSettings.eraser.size}px</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={penSettings.eraser.size}
                      onChange={(e) => handleEraserSizeSelect(parseInt(e.target.value))}
                      className="flex-1 accent-blue-500 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
                    />
                    <div className="flex gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
                      {[10, 20, 35, 55, 80].map((size) => {
                        const isActive = penSettings.eraser.size === size;
                        return (
                          <button
                            key={size}
                            onClick={() => handleEraserSizeSelect(size)}
                            className={`w-5.5 h-5.5 rounded flex items-center justify-center transition cursor-pointer text-[9px] font-bold ${
                              isActive ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* F. Thickness Width Selection (pencil, pen, highlighter, brush) */}
            {!['spray', 'bucket', 'eraser', 'picker', 'magnifier'].includes(penSettings.tool) && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Độ rộng nét vẽ</span>
                  <span className="text-[10px] font-mono font-bold text-slate-600">{currentToolSettings.width}px</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={penSettings.tool === 'highlighter' ? "4" : "1"}
                    max="45"
                    value={currentToolSettings.width || 5}
                    onChange={(e) => handleWidthSelect(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
                  />
                  <div className="flex gap-0.5 bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
                    {[2, 5, 10, 18, 30].map((w) => {
                      const isActive = currentToolSettings.width === w;
                      return (
                        <button
                          key={w}
                          onClick={() => handleWidthSelect(w)}
                          className={`w-5.5 h-5.5 rounded flex items-center justify-center transition cursor-pointer text-[9px] font-bold ${
                            isActive ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* G. Translucent Opacity Slider (pencil, pen, highlighter, brush) */}
            {!['spray', 'bucket', 'eraser', 'picker', 'magnifier'].includes(penSettings.tool) && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Độ trong suốt</span>
                  <span className="font-mono font-bold text-slate-600">{Math.round((currentToolSettings.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={currentToolSettings.opacity ?? 1}
                  onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 rounded-lg appearance-none"
                  style={{
                    background: `linear-gradient(to right, transparent, ${currentToolSettings.color || '#3b82f6'})`
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file selectors */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileChange(e, 'image')} 
        accept="image/*,video/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={docInputRef} 
        onChange={(e) => handleFileChange(e, 'file')} 
        className="hidden" 
      />

      {/* Primary Toolbar Dock */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-2.5 flex items-center gap-2 apple-shadow-heavy min-w-[280px]">
        {/* State 1: Normal mode Toolbar - Screenshot 1 */}
        {!isDrawingMode ? (
          <>
            {/* Leftmost: Sticky note icon button */}
            <button
              onClick={() => setActivePopover(activePopover === 'sticky' ? null : 'sticky')}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                activePopover === 'sticky' 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title="Thêm giấy ghi chú"
            >
              <FileText className="w-5.5 h-5.5 fill-yellow-200 text-yellow-500 stroke-1.5" />
            </button>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-200 mx-1" />

            {/* Center group of 3 */}
            <div className="flex items-center gap-1">
              {/* Center 1: Pen Drawing tool launcher */}
              <button
                onClick={onToggleDrawingMode}
                className="p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="Bút vẽ"
              >
                <PenTool className="w-5.5 h-5.5 text-slate-600 stroke-1.5" />
              </button>

              {/* Center 2: Text Box [A] */}
              <button
                onClick={onAddTextBox}
                className="p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="Văn bản"
              >
                <div className="relative w-5.5 h-5.5 flex items-center justify-center font-semibold text-xs border border-dashed border-slate-400 rounded">
                  A
                </div>
              </button>

              {/* Center 3: Attachment picker (paperclip) */}
              <button
                onClick={() => setActivePopover(activePopover === 'attachment' ? null : 'attachment')}
                className={`p-3 rounded-2xl transition cursor-pointer ${
                  activePopover === 'attachment' 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                title="Đính kèm"
              >
                <Paperclip className="w-5.5 h-5.5 text-slate-600 stroke-1.5" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-200 mx-1" />

            {/* Shapes selector */}
            <button
              onClick={onToggleShapesMenu}
              className="p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Thêm hình học"
            >
              <Square className="w-5.5 h-5.5 text-blue-500 fill-blue-500/20 stroke-1.5" />
            </button>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-200 mx-1" />

            {/* Architecture & Garden Button (Thiết Kế Nhà & Sân Vườn) */}
            <button
              onClick={() => setActivePopover(activePopover === 'architecture' ? null : 'architecture')}
              className={`p-3 rounded-2xl transition cursor-pointer relative flex items-center gap-1.5 ${
                activePopover === 'architecture' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Thiết Kế Nhà & Sân Vườn"
            >
              <div className="flex items-center">
                <Home className="w-5 h-5 text-emerald-500 stroke-2" />
              </div>
              <span className="text-[11px] font-bold hidden sm:inline">Nhà & Vườn</span>
            </button>

            {/* 3D Isometric View Switcher Button */}
            {onToggleView3D && (
              <button
                onClick={onToggleView3D}
                className="px-3 py-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-slate-900/20 font-bold text-xs ml-1"
                title="Xem phối cảnh 3D"
              >
                <Box className="w-4 h-4 text-emerald-400" />
                <span>3D</span>
              </button>
            )}
          </>
        ) : (
          /* State 2: Upgraded Paint Suite Skeuomorphic Drawing Dock */
          <div className="flex items-end gap-3.5 px-3.5 h-20 pb-1.5 overflow-x-auto no-scrollbar max-w-[92vw] md:max-w-none bg-slate-50/55 backdrop-blur-md rounded-2xl border border-slate-200/40 relative">
            {/* Skeuomorphic Wooden Base Board Tray shadow */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-t from-slate-200/60 to-white/5 border-t border-slate-300/30 rounded-b-2xl pointer-events-none z-0" />

            {/* Pencil */}
            <button
              onClick={() => handleToolSelect('pencil')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'pencil' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Bút chì HB phác thảo"
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-20 bg-amber-100 border-x border-amber-200 rounded-t-sm relative shadow-sm flex flex-col items-center">
                  {/* Lead tip matching selected color */}
                  <div className="w-3 h-3 bg-stone-200 clip-triangle absolute -top-3" style={{ borderBottom: `10px solid ${penSettings.pencil.color}` }} />
                  {/* Wood shaving ring */}
                  <div className="w-full h-0.5 bg-amber-200/60 absolute top-0" />
                  {/* Hex stripes */}
                  <div className="absolute inset-y-4 left-0.5 w-0.5 bg-amber-300/40" />
                  <div className="absolute inset-y-4 right-0.5 w-0.5 bg-amber-300/40" />
                  {/* Silver ferrule + Pink eraser at bottom */}
                  <div className="w-full h-1 bg-stone-300 absolute bottom-3" />
                  <div className="w-full h-3 bg-rose-200 absolute bottom-0 rounded-b-sm" />
                  <span className="text-[5px] text-slate-500 absolute bottom-4.5 rotate-90 font-mono font-bold">HB</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Chì</span>
              </div>
            </button>
 
            {/* Fine Tip Pen */}
            <button
              onClick={() => handleToolSelect('pen')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'pen' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Bút mực nét thanh"
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-22 bg-zinc-900 border border-black rounded-t-sm relative shadow-sm flex flex-col items-center">
                  {/* Steel nib base + Ink color tip */}
                  <div className="w-3.5 h-3.5 bg-zinc-400 clip-triangle absolute -top-3.5" style={{ borderBottom: `10px solid ${penSettings.pen.color}` }} />
                  {/* Shiny body highlight line */}
                  <div className="absolute inset-y-3 left-1 w-0.5 bg-white/20" />
                  {/* Color band marker */}
                  <div className="w-full h-2.5 absolute top-3" style={{ backgroundColor: penSettings.pen.color }} />
                  {/* Silver pen band */}
                  <div className="w-full h-1 bg-slate-300 absolute bottom-6" />
                  <div className="w-full h-5 bg-zinc-800 absolute bottom-0" />
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Bút</span>
              </div>
            </button>
 
            {/* Highlighter */}
            <button
              onClick={() => handleToolSelect('highlighter')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'highlighter' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Bút dạ quang tô khối"
            >
              <div className="flex flex-col items-center">
                <div className="w-5 h-17 bg-amber-50/90 border border-slate-200 rounded-t-md relative shadow-sm flex flex-col items-center overflow-hidden">
                  {/* Angled highlight felt tip */}
                  <div className="w-4 h-3 bg-slate-100 clip-wedge absolute -top-3" style={{ borderBottom: `10px solid ${penSettings.highlighter.color}` }} />
                  {/* Inner fiber ink reservoir */}
                  <div className="w-2.5 h-10 absolute top-2 rounded-sm opacity-60" style={{ backgroundColor: penSettings.highlighter.color }} />
                  {/* Translucent plastic highlight reflection */}
                  <div className="absolute inset-y-0 left-0.5 w-1 bg-white/40" />
                  <span className="text-[6px] text-slate-400 absolute bottom-1 font-mono font-bold">TEXT</span>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Dạ</span>
              </div>
            </button>
 
            {/* Brush */}
            <button
              onClick={() => handleToolSelect('brush')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'brush' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Cọ vẽ nghệ thuật"
            >
              <div className="flex flex-col items-center">
                <div className="w-4.5 h-21 bg-gradient-to-b from-amber-800 to-amber-950 border border-amber-950 rounded-t-sm relative shadow-sm flex flex-col items-center">
                  {/* Chrome Ferrule */}
                  <div className="w-full h-4 bg-slate-300 border-x border-slate-400 absolute top-0" />
                  <div className="w-full h-1 bg-slate-400 absolute top-3" />
                  {/* Bristles soaked in active paint color */}
                  <div className="w-3.5 h-4 bg-zinc-800 absolute -top-4 rounded-t-full border-b border-zinc-700" style={{ backgroundColor: penSettings.brush.color }} />
                  {/* Dynamic paint indicator strip */}
                  <div className="w-full h-3 absolute top-5" style={{ backgroundColor: penSettings.brush.color }} />
                  <div className="absolute inset-0 flex items-center justify-center pt-8">
                    <Paintbrush className="w-2.5 h-2.5 text-amber-100/40" />
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Cọ vẽ</span>
              </div>
            </button>
 
            {/* Spray */}
            <button
              onClick={() => handleToolSelect('spray')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'spray' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Bình xịt hạt màu"
            >
              <div className="flex flex-col items-center">
                <div className="w-5 h-19 bg-slate-100 border border-slate-300 rounded-t-md relative shadow-sm flex flex-col items-center overflow-hidden">
                  {/* Custom metal nozzle assembly */}
                  <div className="w-3.5 h-2 bg-stone-200 absolute -top-2 rounded-t-sm border border-stone-300 flex items-center justify-center">
                    <div className="w-1.5 h-1 bg-zinc-800 rounded-full" />
                  </div>
                  {/* Can body wrap with active color */}
                  <div className="w-full h-3 absolute top-0" style={{ backgroundColor: penSettings.spray.color }} />
                  {/* Can label with dynamic icon */}
                  <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
                    <Sparkles className="w-3 h-3 text-sky-500" />
                  </div>
                  {/* Metallic can bottom ring */}
                  <div className="w-full h-1 bg-slate-300 absolute bottom-0" />
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Xịt</span>
              </div>
            </button>
 
            {/* Bucket fill */}
            <button
              onClick={() => handleToolSelect('bucket')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'bucket' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Thùng đổ màu"
            >
              <div className="flex flex-col items-center">
                <div className="w-5 h-17 bg-zinc-100 border border-zinc-200 rounded-b-md rounded-t-sm relative shadow-sm flex flex-col items-center overflow-hidden">
                  {/* Wet paint inside bucket */}
                  <div className="w-full h-4" style={{ backgroundColor: penSettings.bucket.color }} />
                  {/* Bucket metal wire handle wrapper */}
                  <div className="w-full h-0.5 bg-zinc-400 absolute top-4" />
                  <div className="absolute inset-0 flex items-center justify-center pt-3">
                    <PaintBucket className="w-3 h-3 text-zinc-500" />
                  </div>
                  {/* Shiny reflection */}
                  <div className="absolute inset-y-0 left-0.5 w-0.5 bg-white/30" />
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Đổ màu</span>
              </div>
            </button>
 
            {/* Picker (Eyedropper) */}
            <button
              onClick={() => handleToolSelect('picker')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'picker' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Hút màu màn hình"
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-21 bg-transparent border-x border-slate-200 relative flex flex-col items-center">
                  {/* Black rubber squeeze bulb */}
                  <div className="w-full h-5 bg-zinc-800 rounded-t-full absolute -top-4.5 border-t border-zinc-700" />
                  {/* Sucked liquid level with active color */}
                  <div className="w-full h-5 absolute top-0" style={{ backgroundColor: currentToolSettings.color }} />
                  {/* Pipette scale lines */}
                  <div className="absolute top-6 inset-x-0 h-4 flex flex-col justify-between opacity-40 px-0.5">
                    <div className="h-px bg-slate-500 w-full" />
                    <div className="h-px bg-slate-500 w-1/2" />
                    <div className="h-px bg-slate-500 w-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pt-4">
                    <Pipette className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Hút màu</span>
              </div>
            </button>
 
            {/* Magnifier */}
            <button
              onClick={() => handleToolSelect('magnifier')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'magnifier' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Kính lúp phóng đại"
            >
              <div className="flex flex-col items-center">
                {/* Visual Representation */}
                <div className="w-5 h-12 bg-slate-100 border border-slate-300 rounded-full relative shadow-sm flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/20 to-white/60 flex items-center justify-center">
                    <Search className="w-2.5 h-2.5 text-slate-600" />
                  </div>
                  {/* Shiny glass edge flare */}
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full opacity-80" />
                </div>
                {/* Wood handle extending downwards */}
                <div className="w-1.5 h-5 bg-amber-900 absolute bottom-1.5 rounded-b-sm border-r border-amber-950 shadow-sm" />
                <span className="text-[9px] text-slate-500 font-bold mt-4.5">Kính lúp</span>
              </div>
            </button>
 
            {/* Pink Eraser */}
            <button
              onClick={() => handleToolSelect('eraser')}
              className="relative transition-all duration-300 origin-bottom cursor-pointer shrink-0 z-10"
              style={{
                transform: penSettings.tool === 'eraser' ? 'translateY(-16px) scale(1.1)' : 'translateY(0) scale(1)'
              }}
              title="Cục tẩy cao su"
            >
              <div className="flex flex-col items-center">
                <div className="w-5 h-20 bg-white border border-slate-200 rounded-t-sm relative shadow-sm flex flex-col items-center overflow-hidden">
                  {/* Diagonal slanted pink eraser tip */}
                  <div className="w-full h-6 bg-gradient-to-b from-rose-300 to-rose-400 border-b border-rose-300" />
                  {/* Paper protective band sleeve with custom logo label */}
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center py-1">
                    <div className="text-[5px] font-bold text-slate-400 rotate-90 leading-none">BOARD</div>
                    <Eraser className="w-2.5 h-2.5 text-slate-300 rotate-45 mt-1" />
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5">Tẩy</span>
              </div>
            </button>

            {/* Separator */}
            <div className="w-px h-10 bg-slate-200 self-center mx-1 shrink-0 z-10" />

            {/* Rainbow trigger */}
            <button
              onClick={() => {
                if (['picker', 'magnifier', 'eraser'].includes(penSettings.tool)) {
                  handleToolSelect('pencil');
                } else {
                  setActivePopover(activePopover === 'pen_custom' ? null : 'pen_custom');
                }
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-blue-500 p-0.5 shadow-md active:scale-90 hover:scale-105 transition cursor-pointer self-center relative flex items-center justify-center shrink-0 z-10"
              title="Cài đặt nét vẽ & màu sắc"
            >
              <div 
                className="w-7.5 h-7.5 rounded-full border border-white/60 shadow-inner" 
                style={{ backgroundColor: currentToolSettings.color || '#000000' }} 
              />
            </button>

            {/* Close Drawing Mode explicitly */}
            <button
              onClick={onToggleDrawingMode}
              className="p-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100/80 transition active:scale-90 cursor-pointer self-center flex items-center justify-center shrink-0 border border-red-200/40 z-10"
              title="Thoát chế độ vẽ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
