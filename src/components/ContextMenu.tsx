import React, { useState } from 'react';
import { BoardItem, StickyColor } from '../types';
import { 
  BringToFront, 
  SendToBack, 
  Scissors, 
  Copy, 
  Layers, 
  Lock, 
  Unlock, 
  Trash2, 
  Paintbrush, 
  Type, 
  Maximize, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface ContextMenuProps {
  item: BoardItem;
  position: { x: number; y: number }; // Screen-space coordinates
  onSendToBack: () => void;
  onBringToFront: () => void;
  onCut: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onUpdateStyle: (updates: Partial<any>) => void;
  onClose: () => void;
}

export default function ContextMenu({
  item,
  position,
  onSendToBack,
  onBringToFront,
  onCut,
  onCopy,
  onDuplicate,
  onToggleLock,
  onDelete,
  onUpdateStyle,
  onClose
}: ContextMenuProps) {
  const [panel, setPanel] = useState<'main' | 'colors' | 'fontSize' | 'borders'>('main');

  const premiumColors: { value: string; name: string }[] = [
    { value: '#ffffff', name: 'Trắng' },
    { value: '#facc15', name: 'Vàng' },
    { value: '#4ade80', name: 'Lục' },
    { value: '#60a5fa', name: 'Lam' },
    { value: '#f472b6', name: 'Hồng' },
    { value: '#fb923c', name: 'Cam' },
    { value: '#c084fc', name: 'Tím' },
    { value: '#94a3b8', name: 'Xám' },
    { value: '#1e293b', name: 'Đen' },
  ];

  const premiumTextSizes = [12, 14, 16, 20, 24, 32, 48];

  // Colors support helper
  const isSticky = item.type === 'sticky';
  const currentVal = isSticky ? (item as any).color : (item as any).fillColor || (item as any).color;
  
  const mapStickyColorToHex = (col: StickyColor) => {
    if (col === 'yellow') return '#facc15';
    if (col === 'green') return '#4ade80';
    if (col === 'blue') return '#60a5fa';
    if (col === 'pink') return '#f472b6';
    if (col === 'orange') return '#fb923c';
    if (col === 'purple') return '#c084fc';
    return '#94a3b8';
  };

  const hexToStickyColor = (hex: string): StickyColor => {
    if (hex === '#facc15') return 'yellow';
    if (hex === '#4ade80') return 'green';
    if (hex === '#60a5fa') return 'blue';
    if (hex === '#f472b6') return 'pink';
    if (hex === '#fb923c') return 'orange';
    if (hex === '#c084fc') return 'purple';
    return 'gray';
  };

  return (
    <div 
      className="fixed z-50 bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-1.5 flex flex-col items-stretch overflow-hidden apple-shadow-heavy select-none max-w-[95vw] min-w-[280px]"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translate(-50%, -105%)' // Anchor above target
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {panel === 'main' && (
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar max-w-full">
          {/* Quick Layer: Send to back */}
          <button
            onClick={() => { onSendToBack(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
            title="Gửi về phía sau"
          >
            <SendToBack className="w-4 h-4 text-slate-500" />
            <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Lớp sau</span>
          </button>

          {/* Quick Layer: Bring to front */}
          <button
            onClick={() => { onBringToFront(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
            title="Đưa lên phía trước"
          >
            <BringToFront className="w-4 h-4 text-slate-500" />
            <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Lớp trước</span>
          </button>

          <div className="w-px h-8 bg-slate-100 shrink-0 mx-0.5" />

          {/* Cut */}
          <button
            onClick={() => { onCut(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
            title="Cắt đối tượng"
          >
            <Scissors className="w-4 h-4 text-slate-500" />
            <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Cắt</span>
          </button>

          {/* Copy */}
          <button
            onClick={() => { onCopy(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
            title="Sao chép"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Sao chép</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => { onDuplicate(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
            title="Nhân bản"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Nhân bản</span>
          </button>

          {/* Toggle Lock */}
          <button
            onClick={() => { onToggleLock(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
            title={item.isLocked ? "Mở khóa đối tượng" : "Khóa đối tượng"}
          >
            {item.isLocked ? <Unlock className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4 text-slate-500" />}
            <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">
              {item.isLocked ? 'Mở khóa' : 'Khóa'}
            </span>
          </button>

          {/* Dynamic properties: Style/Color picker trigger */}
          {['sticky', 'shape', 'text'].includes(item.type) && (
            <button
              onClick={() => setPanel('colors')}
              className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
              title="Thay đổi màu sắc"
            >
              <Paintbrush className="w-4 h-4 text-blue-500" />
              <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Màu sắc</span>
            </button>
          )}

          {/* Dynamic properties: Text Font Size trigger */}
          {['text', 'shape'].includes(item.type) && (
            <button
              onClick={() => setPanel('fontSize')}
              className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
              title="Thay đổi cỡ chữ"
            >
              <Type className="w-4 h-4 text-purple-500" />
              <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Cỡ chữ</span>
            </button>
          )}

          {/* Dynamic properties: Border Width trigger (Only shapes) */}
          {item.type === 'shape' && (
            <button
              onClick={() => setPanel('borders')}
              className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
              title="Thay đổi độ dày viền"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Độ dày viền</span>
            </button>
          )}

          {/* Dynamic properties: Keep Ratio */}
          {item.type === 'shape' && (
            <button
              onClick={() => {
                onUpdateStyle({ keepRatio: !item.keepRatio });
                onClose();
              }}
              className="flex flex-col items-center justify-center w-11 h-12 hover:bg-slate-50 rounded-lg text-slate-600 transition active:scale-95 cursor-pointer"
              title="Khóa tỷ lệ khung hình"
            >
              <Maximize className={`w-4 h-4 ${item.keepRatio ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="text-[8px] text-slate-400 font-medium mt-1 truncate max-w-full px-0.5">Tỷ lệ</span>
            </button>
          )}

          <div className="w-px h-8 bg-slate-100 shrink-0 mx-0.5" />

          {/* Delete item */}
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="flex flex-col items-center justify-center w-11 h-12 hover:bg-red-50 rounded-lg text-red-600 transition active:scale-95 cursor-pointer"
            title="Xóa đối tượng"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-[8px] text-red-400 font-bold mt-1 truncate max-w-full px-0.5">Xóa</span>
          </button>
        </div>
      )}

      {/* Colors Sub-Toolbar */}
      {panel === 'colors' && (
        <div className="flex items-center gap-2 max-w-full">
          <button 
            onClick={() => setPanel('main')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer shrink-0 transition"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 shrink-0" />
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {premiumColors.map((color) => {
              const isSelected = isSticky 
                ? mapStickyColorToHex((item as any).color) === color.value 
                : currentVal === color.value;

              return (
                <button
                  key={color.value}
                  onClick={() => {
                    if (isSticky) {
                      onUpdateStyle({ color: hexToStickyColor(color.value) });
                    } else if (item.type === 'shape') {
                      onUpdateStyle({ fillColor: color.value });
                    } else {
                      onUpdateStyle({ color: color.value });
                    }
                    onClose();
                  }}
                  className="w-7 h-7 rounded-full border border-slate-200 shadow-sm relative transition active:scale-90 cursor-pointer flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-md ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FontSize Sub-Toolbar */}
      {panel === 'fontSize' && (
        <div className="flex items-center gap-2 max-w-full">
          <button 
            onClick={() => setPanel('main')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer shrink-0 transition"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 shrink-0" />
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {premiumTextSizes.map((size) => {
              const currentSize = item.type === 'text' ? (item as any).fontSize : (item as any).textFontSize || 14;
              const isSelected = currentSize === size;
              return (
                <button
                  key={size}
                  onClick={() => {
                    if (item.type === 'text') {
                      onUpdateStyle({ fontSize: size });
                    } else {
                      onUpdateStyle({ textFontSize: size });
                    }
                    onClose();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer shrink-0 transition ${
                    isSelected ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {size}px
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Borders Thickness Sub-Toolbar */}
      {panel === 'borders' && (
        <div className="flex items-center gap-2 max-w-full">
          <button 
            onClick={() => setPanel('main')}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer shrink-0 transition"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-slate-200 shrink-0" />
          <div className="flex items-center gap-1.5 py-1 max-w-full overflow-x-auto no-scrollbar">
            {[0, 1, 3, 5, 8].map((thickness) => {
              const isActive = (item as any).strokeWidth === thickness;
              return (
                <button
                  key={thickness}
                  onClick={() => {
                    onUpdateStyle({ strokeWidth: thickness });
                    onClose();
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold cursor-pointer shrink-0 transition ${
                    isActive ? 'bg-blue-500 text-white shadow-sm font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {thickness === 0 ? 'Không viền' : `${thickness}px`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
