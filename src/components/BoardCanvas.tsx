import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Board, 
  BoardItem, 
  Point, 
  PenSettings, 
  StickyColor, 
  AttachmentType,
  TableCell
} from '../types';
import { 
  X, 
  Trash2, 
  Lock, 
  Unlock, 
  Download, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus
} from 'lucide-react';
import ContextMenu from './ContextMenu';
import { motion, AnimatePresence } from 'motion/react';

interface BoardCanvasProps {
  board: Board;
  isDrawingMode: boolean;
  penSettings: PenSettings;
  shapesMenuOpen: boolean;
  onUpdateBoard: (board: Board) => void;
  onAddSticky: (color: StickyColor) => void;
  onAddTextBox: () => void;
  onAddTable: () => void;
  onAddAttachment: (type: AttachmentType, file?: File) => void;
  onAddShape: (shapeType: any) => void;
  onDeleteSelected: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onGoBack: () => void;
  onChangePenSettings: (settings: PenSettings) => void;
}

export default function BoardCanvas({
  board,
  isDrawingMode,
  penSettings,
  shapesMenuOpen,
  onUpdateBoard,
  onAddSticky,
  onAddTextBox,
  onAddTable,
  onAddAttachment,
  onAddShape,
  onDeleteSelected,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onGoBack,
  onChangePenSettings
}: BoardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for panning/zooming
  const [pan, setPan] = useState({ x: board.panX, y: board.panY });
  const [zoom, setZoom] = useState(board.zoom);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // State for selected / editing / resizing items
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [resizingDir, setResizingDir] = useState<string | null>(null);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, itemX: 0, itemY: 0 });

  // Context menu state
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Point[]>([]);
  const currentDrawId = useRef<string | null>(null);

  // Active / moving elements
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef<{ time: number; itemId: string } | null>(null);

  // Options menu popover state
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  // Interactive dimensions states
  const [unit, setUnit] = useState<'px' | 'mm' | 'cm' | 'm' | 'km'>('cm');
  const [inputW, setInputW] = useState('');
  const [inputH, setInputH] = useState('');
  const [editingDimensionsId, setEditingDimensionsId] = useState<string | null>(null);
  const canvasFileInputRef = useRef<HTMLInputElement>(null);

  const PX_TO_UNIT: Record<string, number> = {
    px: 1,
    mm: 0.26458333,
    cm: 0.02645833,
    m: 0.00026458,
    km: 0.00000026458,
  };

  const pxToUnit = (px: number, u: string) => {
    const factor = PX_TO_UNIT[u] || 1;
    const raw = px * factor;
    if (u === 'px') return Math.round(raw).toString();
    if (u === 'mm') return raw.toFixed(1);
    if (u === 'cm') return raw.toFixed(2);
    if (u === 'm') return raw.toFixed(3);
    return raw.toFixed(6);
  };

  const unitToPx = (valStr: string, u: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || val <= 0) return null;
    const factor = PX_TO_UNIT[u] || 1;
    return val / factor;
  };

  // Synchronize inputs when selectedId or items change
  useEffect(() => {
    if (selectedId && editingDimensionsId !== selectedId) {
      const selectedItem = board.items.find(i => i.id === selectedId);
      if (selectedItem) {
        setInputW(pxToUnit(selectedItem.width, unit));
        setInputH(pxToUnit(selectedItem.height, unit));
      }
    }
  }, [selectedId, unit, board.items]);

  const handleWChange = (val: string, item: BoardItem) => {
    setInputW(val);
    const px = unitToPx(val, unit);
    if (px !== null && px > 0) {
      let newW = px;
      let newH = item.height;
      if (item.type === 'shape' && (item as any).keepRatio) {
        const ratio = item.width / item.height;
        newH = newW / ratio;
        setInputH(pxToUnit(newH, unit));
      }
      updateBoardItems(
        board.items.map(i => i.id === item.id ? { ...i, width: newW, height: newH } : i)
      );
    }
  };

  const handleHChange = (val: string, item: BoardItem) => {
    setInputH(val);
    const px = unitToPx(val, unit);
    if (px !== null && px > 0) {
      let newH = px;
      let newW = item.width;
      if (item.type === 'shape' && (item as any).keepRatio) {
        const ratio = item.width / item.height;
        newW = newH * ratio;
        setInputW(pxToUnit(newW, unit));
      }
      updateBoardItems(
        board.items.map(i => i.id === item.id ? { ...i, width: newW, height: newH } : i)
      );
    }
  };

  const handleFocusDimensions = (item: BoardItem) => {
    setEditingDimensionsId(item.id);
    setInputW(pxToUnit(item.width, unit));
    setInputH(pxToUnit(item.height, unit));
  };

  const handleBlurDimensions = () => {
    setEditingDimensionsId(null);
  };

  // Toast and paint helper states
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToastMessage = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const handleCanvasImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.items)) {
            const importedBoard: Board = {
              ...board,
              name: parsed.name || board.name,
              items: parsed.items,
              zoom: typeof parsed.zoom === 'number' ? parsed.zoom : board.zoom,
              panX: typeof parsed.panX === 'number' ? parsed.panX : board.panX,
              panY: typeof parsed.panY === 'number' ? parsed.panY : board.panY,
              showGrid: typeof parsed.showGrid === 'boolean' ? parsed.showGrid : board.showGrid,
              snapToGrid: typeof parsed.snapToGrid === 'boolean' ? parsed.snapToGrid : board.snapToGrid,
              backgroundColor: parsed.backgroundColor || board.backgroundColor,
              updatedAt: new Date().toISOString()
            };
            onUpdateBoard(importedBoard);
            setZoom(importedBoard.zoom);
            setPan({ x: importedBoard.panX, y: importedBoard.panY });
            showToastMessage("Nhập bảng vẽ thành công!");
          } else {
            alert('Tệp Freeform không đúng định dạng (thiếu danh sách các đối tượng items)!');
          }
        } else {
          alert('Tệp tin không hợp lệ!');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp JSON!');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const applyBucketFill = (item: BoardItem) => {
    const color = penSettings.bucket.color;
    updateBoardItems(
      board.items.map(i => {
        if (i.id === item.id) {
          if (i.type === 'shape') {
            const isLine = i.shapeType === 'line' || i.shapeType === 'arrow';
            return {
              ...i,
              fillColor: isLine ? 'none' : color,
              strokeColor: color
            };
          } else if (i.type === 'sticky') {
            return { ...i, color: color as any };
          } else if (i.type === 'text') {
            return { ...i, color: color };
          }
        }
        return i;
      })
    );
    showToastMessage(`Đã đổ màu nét/nền đối tượng: ${color}`);
  };

  const applyBucketCanvasFill = () => {
    onUpdateBoard({
      ...board,
      backgroundColor: penSettings.bucket.color
    });
    showToastMessage(`Đã đổ màu nền bảng: ${penSettings.bucket.color}`);
  };

  const applyColorPicker = (item: BoardItem) => {
    let pickedColor = '#000000';
    if (item.type === 'shape') {
      pickedColor = item.fillColor !== 'none' ? item.fillColor : item.strokeColor;
    } else if (item.type === 'sticky') {
      const presetColors: Record<string, string> = {
        yellow: '#fef08a',
        green: '#bbf7d0',
        blue: '#bfdbfe',
        pink: '#fbcfe8',
        orange: '#fed7aa',
        purple: '#e9d5ff',
        gray: '#e2e8f0'
      };
      pickedColor = presetColors[item.color] || item.color;
    } else if (item.type === 'text') {
      pickedColor = item.color;
    } else if (item.type === 'drawing') {
      pickedColor = item.color;
    }

    const activeTool = penSettings.tool === 'eraser' ? 'pencil' : penSettings.tool;
    if (activeTool === 'bucket') {
      onChangePenSettings({
        ...penSettings,
        bucket: { color: pickedColor }
      });
    } else if (activeTool === 'picker') {
      onChangePenSettings({
        ...penSettings,
        pencil: { ...penSettings.pencil, color: pickedColor }
      });
    } else {
      onChangePenSettings({
        ...penSettings,
        [activeTool]: {
          ...(penSettings as any)[activeTool],
          color: pickedColor
        }
      });
    }

    showToastMessage(`Đã chọn màu: ${pickedColor}`);
  };

  const applyColorPickerCanvas = () => {
    const pickedColor = board.backgroundColor || '#f8fafc';
    const activeTool = penSettings.tool === 'eraser' ? 'pencil' : penSettings.tool;
    if (activeTool === 'bucket') {
      onChangePenSettings({
        ...penSettings,
        bucket: { color: pickedColor }
      });
    } else {
      onChangePenSettings({
        ...penSettings,
        [activeTool]: {
          ...(penSettings as any)[activeTool],
          color: pickedColor
        }
      });
    }
    showToastMessage(`Đã chọn màu nền: ${pickedColor}`);
  };

  const applyMagnifier = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;

    const isZoomOut = e.shiftKey || e.button === 2;
    const zoomIntensity = 0.3;
    const newZoom = isZoomOut 
      ? Math.max(0.1, zoom - zoomIntensity) 
      : Math.min(4, zoom + zoomIntensity);

    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });

    onUpdateBoard({
      ...board,
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY
    });

    showToastMessage(isZoomOut ? `Thu nhỏ: ${Math.round(newZoom * 100)}%` : `Phóng to: ${Math.round(newZoom * 100)}%`);
  };

  // Sync pan & zoom with board state
  useEffect(() => {
    setPan({ x: board.panX, y: board.panY });
    setZoom(board.zoom);
  }, [board.panX, board.panY, board.zoom]);

  const updateBoardItems = (updatedItems: BoardItem[]) => {
    onUpdateBoard({
      ...board,
      items: updatedItems,
      panX: pan.x,
      panY: pan.y,
      zoom: zoom,
      updatedAt: new Date().toISOString()
    });
  };

  const getSelectedItem = useMemo(() => {
    return board.items.find(i => i.id === selectedId);
  }, [board.items, selectedId]);

  // Convert Screen/Viewport coordinates to Canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number): Point => {
    if (!containerRef.current) return { x: screenX, y: screenY };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom
    };
  };

  // Canvas zoom actions
  const handleZoomIn = () => setZoom(z => Math.min(4, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.1, z - 0.15));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 100, y: 100 });
  };

  // Background Grid Canvas Handlers: Mouse Zoom, Drag-Pan, Item Placement
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomIntensity = 0.05;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Canvas coordinates before zoom
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;

    // New zoom level
    const delta = -e.deltaY;
    const newZoom = Math.min(4, Math.max(0.1, zoom + (delta > 0 ? zoomIntensity : -zoomIntensity) * zoom));

    // Calculate new panning to zoom into mouse cursor position
    const newPanX = mouseX - canvasX * newZoom;
    const newPanY = mouseY - canvasY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });

    // Sync back
    onUpdateBoard({
      ...board,
      zoom: newZoom,
      panX: newPanX,
      panY: newPanY
    });
  };

  // Mouse Down handler - manages panning, drawing, element dragging, closing editors
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingId) {
      // Save editing item
      saveEditingItem();
    }

    const isBackground = (e.target as HTMLElement).classList.contains('dots-grid') || 
                         (e.target as HTMLElement).classList.contains('canvas-container') ||
                         (e.target as HTMLElement).tagName === 'svg';

    if (isBackground) {
      setSelectedId(null);
      setContextMenuPos(null);
    }

    if (isDrawingMode) {
      const activeTool = penSettings.tool;
      if (activeTool === 'bucket') {
        applyBucketCanvasFill();
        return;
      } else if (activeTool === 'picker') {
        applyColorPickerCanvas();
        return;
      } else if (activeTool === 'magnifier') {
        applyMagnifier(e);
        return;
      }

      // Start Drawing scribble
      setIsDrawing(true);
      const pt = screenToCanvas(e.clientX, e.clientY);
      setDrawPoints([pt]);
      return;
    }

    if (isBackground || e.button === 1 || e.shiftKey) {
      // Panning mode
      setIsPanning(true);
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newPanX = e.clientX - panStart.current.x;
      const newPanY = e.clientY - panStart.current.y;
      setPan({ x: newPanX, y: newPanY });
      return;
    }

    if (isDrawingMode && isDrawing) {
      const pt = screenToCanvas(e.clientX, e.clientY);
      
      if (penSettings.tool === 'eraser' && penSettings.eraser.mode === 'object') {
        // Eraser Object mode: Erase any drawing item that the mouse hovers over
        const hitItem = board.items.find(item => {
          if (item.type !== 'drawing') return false;
          // Check if distance between eraser point and any path point is small
          return item.points.some(p => {
            const dist = Math.hypot(p.x - pt.x, p.y - pt.y);
            return dist < penSettings.eraser.size;
          });
        });

        if (hitItem) {
          updateBoardItems(board.items.filter(item => item.id !== hitItem.id));
        }
        return;
      }

      setDrawPoints(pts => [...pts, pt]);
      return;
    }

    // Handle Item Dragging
    if (draggingId && !resizingDir) {
      const item = board.items.find(i => i.id === draggingId);
      if (item && !item.isLocked) {
        const pt = screenToCanvas(e.clientX, e.clientY);
        let targetX = pt.x - dragOffset.current.x;
        let targetY = pt.y - dragOffset.current.y;

        const bypassSnap = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey;
        if (board.snapToGrid && !bypassSnap) {
          targetX = Math.round(targetX / 24) * 24;
          targetY = Math.round(targetY / 24) * 24;
        }

        updateBoardItems(
          board.items.map(i => i.id === draggingId ? { ...i, x: targetX, y: targetY } : i)
        );
      }
      return;
    }

    // Handle Resize dragging
    if (resizingDir && selectedId) {
      const item = board.items.find(i => i.id === selectedId);
      if (item && !item.isLocked) {
        const pt = screenToCanvas(e.clientX, e.clientY);
        const deltaX = pt.x - resizeStart.current.x;
        const deltaY = pt.y - resizeStart.current.y;

        let newW = resizeStart.current.w;
        let newH = resizeStart.current.h;
        let newX = resizeStart.current.itemX;
        let newY = resizeStart.current.itemY;

        if (resizingDir.includes('e')) {
          newW = Math.max(40, resizeStart.current.w + deltaX);
        }
        if (resizingDir.includes('s')) {
          newH = Math.max(40, resizeStart.current.h + deltaY);
        }
        if (resizingDir.includes('w')) {
          const possibleW = resizeStart.current.w - deltaX;
          if (possibleW > 40) {
            newW = possibleW;
            newX = resizeStart.current.itemX + deltaX;
          }
        }
        if (resizingDir.includes('n')) {
          const possibleH = resizeStart.current.h - deltaY;
          if (possibleH > 40) {
            newH = possibleH;
            newY = resizeStart.current.itemY + deltaY;
          }
        }

        // Maintain original aspect ratio for shapes if requested
        if (item.type === 'shape' && (item as any).keepRatio) {
          const ratio = resizeStart.current.w / resizeStart.current.h;
          if (resizingDir === 'se' || resizingDir === 'nw' || resizingDir === 'ne' || resizingDir === 'sw') {
            newH = newW / ratio;
          }
        }

        updateBoardItems(
          board.items.map(i => i.id === selectedId ? { ...i, x: newX, y: newY, width: newW, height: newH } : i)
        );
      }
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      onUpdateBoard({
        ...board,
        panX: pan.x,
        panY: pan.y
      });
      return;
    }

    if (isDrawingMode && isDrawing) {
      setIsDrawing(false);
      const drawableTools = ['pencil', 'pen', 'highlighter', 'brush', 'spray'];
      if (drawPoints.length > 1 && drawableTools.includes(penSettings.tool)) {
        // Finish Drawing - save to board items
        const activeTool = penSettings.tool as 'pencil' | 'pen' | 'highlighter' | 'brush' | 'spray';
        const settings = (penSettings as any)[activeTool];

        // Find bounding box
        const xs = drawPoints.map(p => p.x);
        const ys = drawPoints.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const newDrawing: BoardItem = {
          id: 'drawing-' + Date.now() + Math.random().toString(36).substring(2, 6),
          type: 'drawing',
          tool: activeTool,
          x: minX,
          y: minY,
          width: Math.max(10, maxX - minX),
          height: Math.max(10, maxY - minY),
          points: drawPoints,
          color: settings.color,
          strokeWidth: activeTool === 'spray' ? settings.radius : settings.width,
          opacity: activeTool === 'spray' ? 1.0 : settings.opacity,
          zIndex: Math.max(0, ...board.items.map(i => i.zIndex)) + 1,
          brushStyle: activeTool === 'brush' ? settings.style : undefined
        } as any;

        updateBoardItems([...board.items, newDrawing]);
      }
      setDrawPoints([]);
      return;
    }

    if (draggingId) {
      setDraggingId(null);
    }

    if (resizingDir) {
      setResizingDir(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (editingId) {
      saveEditingItem();
    }

    const touch = e.touches[0];
    if (!touch) return;

    // Prevent default scrolling on mobile ONLY when actively drawing or dragging items
    if (isDrawingMode || draggingId || resizingDir || selectedId) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }

    const targetEl = e.target as HTMLElement;
    const isBackground = targetEl.classList.contains('dots-grid') || 
                         targetEl.classList.contains('canvas-container') ||
                         targetEl.tagName === 'svg';

    if (isBackground) {
      setSelectedId(null);
      setContextMenuPos(null);
    }

    if (isDrawingMode) {
      const activeTool = penSettings.tool;
      if (activeTool === 'bucket') {
        applyBucketCanvasFill();
        return;
      } else if (activeTool === 'picker') {
        applyColorPickerCanvas();
        return;
      } else if (activeTool === 'magnifier') {
        applyMagnifier({ clientX: touch.clientX, clientY: touch.clientY } as any);
        return;
      }

      setIsDrawing(true);
      const pt = screenToCanvas(touch.clientX, touch.clientY);
      setDrawPoints([pt]);
      return;
    }

    if (isBackground) {
      setIsPanning(true);
      panStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
      return;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    if (isPanning || isDrawingMode || draggingId || resizingDir) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }

    if (isPanning) {
      const newPanX = touch.clientX - panStart.current.x;
      const newPanY = touch.clientY - panStart.current.y;
      setPan({ x: newPanX, y: newPanY });
      return;
    }

    if (isDrawingMode && isDrawing) {
      const pt = screenToCanvas(touch.clientX, touch.clientY);
      
      if (penSettings.tool === 'eraser' && penSettings.eraser.mode === 'object') {
        const hitItem = board.items.find(item => {
          if (item.type !== 'drawing') return false;
          return item.points.some(p => {
            const dist = Math.hypot(p.x - pt.x, p.y - pt.y);
            return dist < penSettings.eraser.size;
          });
        });

        if (hitItem) {
          updateBoardItems(board.items.filter(item => item.id !== hitItem.id));
        }
        return;
      }

      setDrawPoints(pts => [...pts, pt]);
      return;
    }

    if (draggingId && !resizingDir) {
      const item = board.items.find(i => i.id === draggingId);
      if (item && !item.isLocked) {
        const pt = screenToCanvas(touch.clientX, touch.clientY);
        let targetX = pt.x - dragOffset.current.x;
        let targetY = pt.y - dragOffset.current.y;

        if (board.snapToGrid) {
          targetX = Math.round(targetX / 24) * 24;
          targetY = Math.round(targetY / 24) * 24;
        }

        updateBoardItems(
          board.items.map(i => i.id === draggingId ? { ...i, x: targetX, y: targetY } : i)
        );
      }
      return;
    }

    if (resizingDir && selectedId) {
      const item = board.items.find(i => i.id === selectedId);
      if (item && !item.isLocked) {
        const pt = screenToCanvas(touch.clientX, touch.clientY);
        const deltaX = pt.x - resizeStart.current.x;
        const deltaY = pt.y - resizeStart.current.y;

        let newW = resizeStart.current.w;
        let newH = resizeStart.current.h;
        let newX = resizeStart.current.itemX;
        let newY = resizeStart.current.itemY;

        if (resizingDir.includes('e')) {
          newW = Math.max(40, resizeStart.current.w + deltaX);
        }
        if (resizingDir.includes('s')) {
          newH = Math.max(40, resizeStart.current.h + deltaY);
        }
        if (resizingDir.includes('w')) {
          const possibleW = resizeStart.current.w - deltaX;
          if (possibleW > 40) {
            newW = possibleW;
            newX = resizeStart.current.itemX + deltaX;
          }
        }
        if (resizingDir.includes('n')) {
          const possibleH = resizeStart.current.h - deltaY;
          if (possibleH > 40) {
            newH = possibleH;
            newY = resizeStart.current.itemY + deltaY;
          }
        }

        if (item.type === 'shape' && (item as any).keepRatio) {
          const ratio = resizeStart.current.w / resizeStart.current.h;
          if (resizingDir === 'se' || resizingDir === 'nw' || resizingDir === 'ne' || resizingDir === 'sw') {
            newH = newW / ratio;
          }
        }

        updateBoardItems(
          board.items.map(i => i.id === selectedId ? { ...i, x: newX, y: newY, width: newW, height: newH } : i)
        );
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Keyboard Shortcuts (Delete, Escape, Ctrl+C, Ctrl+D, Ctrl+Z, Arrow keys for micro-movement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingId) return; // Ignore if writing in text box

      // Arrow keys for fine-grained alignment micro-movements
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && selectedId) {
        // Only trigger if no input/textarea/editable element is active to prevent typing issues
        const activeEl = document.activeElement;
        if (activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.getAttribute('contenteditable') === 'true'
        )) {
          return;
        }

        const selected = board.items.find(i => i.id === selectedId);
        if (selected && !selected.isLocked) {
          e.preventDefault();

          // 1px is micro-movement (sub-mm)
          // Shift key: move by 1mm (exactly 3.7795 px)
          // Alt key: move by 1cm (exactly 37.795 px)
          const MM_IN_PX = 3.7795;
          const CM_IN_PX = 37.795;
          
          let step = 1;
          if (e.shiftKey) {
            step = MM_IN_PX;
          } else if (e.altKey) {
            step = CM_IN_PX;
          }

          let deltaX = 0;
          let deltaY = 0;

          if (e.key === 'ArrowLeft') deltaX = -step;
          if (e.key === 'ArrowRight') deltaX = step;
          if (e.key === 'ArrowUp') deltaY = -step;
          if (e.key === 'ArrowDown') deltaY = step;

          updateBoardItems(
            board.items.map(i => i.id === selectedId ? { ...i, x: i.x + deltaX, y: i.y + deltaY } : i)
          );
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          onDeleteSelected(selectedId);
          setSelectedId(null);
          setContextMenuPos(null);
        }
      }

      if (e.key === 'Escape') {
        setSelectedId(null);
        setContextMenuPos(null);
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          onUndo();
        }
        if (e.key === 'y') {
          e.preventDefault();
          onRedo();
        }
        if (e.key === 'd' && selectedId) {
          e.preventDefault();
          // Duplicate item
          const selected = board.items.find(i => i.id === selectedId);
          if (selected) {
            const newItem = {
              ...selected,
              id: selected.type + '-' + Date.now(),
              x: selected.x + 30,
              y: selected.y + 30,
              zIndex: Math.max(0, ...board.items.map(i => i.zIndex)) + 1
            };
            updateBoardItems([...board.items, newItem]);
            setSelectedId(newItem.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, board.items, editingId]);

  // Double-Click to edit text elements
  const handleItemDoubleClick = (item: BoardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isLocked) return;

    if (item.type === 'sticky') {
      setEditingId(item.id);
      setEditText(item.text);
    } else if (item.type === 'text') {
      setEditingId(item.id);
      setEditText(item.text);
    } else if (item.type === 'shape') {
      setEditingId(item.id);
      setEditText((item as any).text || '');
    }
  };

  const saveEditingItem = () => {
    if (!editingId) return;
    updateBoardItems(
      board.items.map(i => {
        if (i.id === editingId) {
          if (i.type === 'sticky') {
            return { ...i, text: editText };
          } else if (i.type === 'text') {
            return { ...i, text: editText };
          } else if (i.type === 'shape') {
            return { ...i, text: editText };
          }
        }
        return i;
      })
    );
    setEditingId(null);
    setEditText('');
  };

  // Launch context menu at tap/right-click position
  const handleItemContextMenu = (item: BoardItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  // Resize handler start
  const handleResizeStart = (dir: string, item: BoardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingDir(dir);
    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    resizeStart.current = {
      x: canvasPt.x,
      y: canvasPt.y,
      w: item.width,
      h: item.height,
      itemX: item.x,
      itemY: item.y
    };
  };

  // Drag item start
  const handleItemDragStart = (item: BoardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawingMode) {
      const activeTool = penSettings.tool;
      if (activeTool === 'bucket') {
        applyBucketFill(item);
      } else if (activeTool === 'picker') {
        applyColorPicker(item);
      } else if (activeTool === 'magnifier') {
        applyMagnifier(e);
      }
      return;
    }
    setSelectedId(item.id);
    setContextMenuPos(null);

    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    dragOffset.current = {
      x: canvasPt.x - item.x,
      y: canvasPt.y - item.y
    };
    setDraggingId(item.id);
  };

  // Drag item start via Touch
  const handleTouchItemDragStart = (item: BoardItem, e: React.TouchEvent) => {
    // Check for double tap to edit
    const now = Date.now();
    if (lastTapRef.current && lastTapRef.current.itemId === item.id && (now - lastTapRef.current.time) < 300) {
      // Double tap detected!
      e.preventDefault();
      e.stopPropagation();
      handleItemDoubleClick(item, { stopPropagation: () => {} } as any);
      lastTapRef.current = null;
      return;
    }
    lastTapRef.current = { time: now, itemId: item.id };

    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;

    if (isDrawingMode) {
      const activeTool = penSettings.tool;
      if (activeTool === 'bucket') {
        applyBucketFill(item);
      } else if (activeTool === 'picker') {
        applyColorPicker(item);
      } else if (activeTool === 'magnifier') {
        applyMagnifier({ clientX: touch.clientX, clientY: touch.clientY } as any);
      }
      return;
    }
    
    setSelectedId(item.id);
    setContextMenuPos(null);

    const canvasPt = screenToCanvas(touch.clientX, touch.clientY);
    dragOffset.current = {
      x: canvasPt.x - item.x,
      y: canvasPt.y - item.y
    };
    setDraggingId(item.id);
  };

  // Resize handler start via Touch
  const handleTouchResizeStart = (dir: string, item: BoardItem, e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    
    setResizingDir(dir);
    const canvasPt = screenToCanvas(touch.clientX, touch.clientY);
    resizeStart.current = {
      x: canvasPt.x,
      y: canvasPt.y,
      w: item.width,
      h: item.height,
      itemX: item.x,
      itemY: item.y
    };
  };

  // Table Cell Editing
  const handleTableCellChange = (itemId: string, r: number, c: number, value: string) => {
    updateBoardItems(
      board.items.map(i => {
        if (i.id === itemId && i.type === 'table') {
          const newData = [...i.data];
          newData[r] = [...newData[r]];
          newData[r][c] = { ...newData[r][c], text: value };
          return { ...i, data: newData };
        }
        return i;
      })
    );
  };

  // Add Row to Table - Screenshot 3 table modifier
  const handleAddTableRow = (tableItem: any) => {
    const newRowCells: TableCell[] = Array(tableItem.cols).fill(null).map(() => ({ text: '' }));
    updateBoardItems(
      board.items.map(i => {
        if (i.id === tableItem.id && i.type === 'table') {
          return {
            ...i,
            rows: i.rows + 1,
            data: [...i.data, newRowCells],
            height: i.height + 40
          };
        }
        return i;
      })
    );
  };

  // Add Column to Table
  const handleAddTableCol = (tableItem: any) => {
    updateBoardItems(
      board.items.map(i => {
        if (i.id === tableItem.id && i.type === 'table') {
          const newData = i.data.map(row => [...row, { text: '' }]);
          return {
            ...i,
            cols: i.cols + 1,
            data: newData,
            width: i.width + 100
          };
        }
        return i;
      })
    );
  };

  // Attachment preview render
  const renderAttachmentContent = (item: any) => {
    const isImage = item.attachmentType === 'image';
    if (isImage && item.blobUrl) {
      return (
        <img 
          src={item.blobUrl} 
          alt={item.title} 
          className="w-full h-full object-cover pointer-events-none rounded-2xl" 
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div className="w-full h-full bg-slate-100 border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-3 text-center">
        <span className="text-3xl mb-1">
          {item.attachmentType === 'image' && '🖼️'}
          {item.attachmentType === 'file' && '📁'}
          {item.attachmentType === 'link' && '🔗'}
        </span>
        <span className="font-bold text-xs truncate w-full text-slate-800">{item.title}</span>
        {item.fileSize && <span className="text-[9px] text-slate-400 mt-0.5">{item.fileSize}</span>}
        {item.url && (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-2 text-[10px] text-blue-500 font-semibold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Mở liên kết
          </a>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden select-none canvas-container"
      style={{ backgroundColor: board.backgroundColor || '#f8fafc' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Hidden file input for single board import inside Canvas */}
      <input 
        type="file" 
        ref={canvasFileInputRef} 
        onChange={handleCanvasImport} 
        accept=".json" 
        className="hidden" 
      />
      {/* Toast Overlay notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg z-[10005] flex items-center gap-2 pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full border border-white/40" style={{ backgroundColor: toast.includes('#') ? toast.split(': ')[1] : '#3b82f6' }} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 1. Canvas Dotted Grid - Styled in Viewport Coordinates for high performance */}
      {board.showGrid && (
        <div 
          className="absolute inset-0 dots-grid pointer-events-none" 
          style={{
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          }}
        />
      )}

      {/* Canvas Top Bar - Header controls, matching Screenshots */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Left Side: Back Arrow */}
        <button
          onClick={onGoBack}
          className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow hover:bg-slate-50 transition active:scale-95 pointer-events-auto flex items-center justify-center text-slate-700 cursor-pointer"
          title="Về kho tệp"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Center: Title Bar popover & Undo/Redo & Share */}
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-200/80 shadow p-1.5 rounded-full pointer-events-auto select-none relative">
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-full transition cursor-pointer ${
              canUndo ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 pointer-events-none'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Share / Export */}
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(board, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `${board.name}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="p-2 rounded-full text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Xuất chia sẻ"
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>

          {/* Options button (...) - Screenshot 4 */}
          <button
            onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
            className="p-2 rounded-full text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Tùy chọn bảng"
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>

          {/* Options Menu Popover content - Screenshot 4 */}
          <AnimatePresence>
            {optionsMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOptionsMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-14 w-60 bg-white border border-slate-150 rounded-2xl p-2.5 shadow-2xl z-20 text-xs text-slate-800 space-y-1 apple-shadow-heavy"
                >
                  {/* Card Header with Board Title */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 mb-1.5">
                    <div className="w-4 h-4 bg-slate-100 border rounded" />
                    <span className="font-bold text-slate-900 truncate">{board.name}</span>
                  </div>

                  <button
                    onClick={() => {
                      const newName = prompt('Nhập tên bảng mới:', board.name);
                      if (newName && newName.trim()) {
                        onUpdateBoard({ ...board, name: newName.trim() });
                      }
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium cursor-pointer text-slate-700"
                  >
                    <span>Đổi tên bảng</span>
                    <span className="text-slate-400">✎</span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateBoard({ ...board, isFavorite: !board.isFavorite });
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium cursor-pointer text-slate-700"
                  >
                    <span>Ưa thích</span>
                    <span className="text-red-400">{board.isFavorite ? '❤️' : '🤍'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateBoard({ ...board, showGrid: !board.showGrid });
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium cursor-pointer text-slate-700"
                  >
                    <span>Tùy chọn xem: Lưới</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                      {board.showGrid ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateBoard({ ...board, snapToGrid: !board.snapToGrid });
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium cursor-pointer text-slate-700"
                  >
                    <span>Bám dính lưới</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                      {board.snapToGrid ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  {/* Import Board */}
                  <button
                    onClick={() => {
                      canvasFileInputRef.current?.click();
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium cursor-pointer text-slate-700"
                    title="Nhập bảng vẽ (.json) từ máy tính"
                  >
                    <span>Nhập bảng (.json)</span>
                    <span className="text-slate-400">📥</span>
                  </button>

                  {/* Export Board */}
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(board, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `${board.name || 'Untitled'}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center justify-between font-medium cursor-pointer text-slate-700"
                    title="Xuất bảng vẽ hiện tại thành tệp tin .json"
                  >
                    <span>Xuất bảng (.json)</span>
                    <span className="text-slate-400">📤</span>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={() => {
                      if (confirm('Xóa tất cả đối tượng trên bảng?')) {
                        updateBoardItems([]);
                      }
                      setOptionsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-red-600 font-semibold cursor-pointer"
                  >
                    Xóa sạch bảng
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Blue confirmation checkmark for editing drawings */}
        {isDrawingMode ? (
          <button
            onClick={onGoBack} // Exit drawing mode / save board
            className="w-10 h-10 rounded-full bg-blue-500 text-white shadow shadow-blue-500/30 hover:bg-blue-600 transition active:scale-95 pointer-events-auto flex items-center justify-center cursor-pointer font-bold"
            title="Xác nhận lưu"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>

      {/* Zoom / Info widget at bottom-left */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-200/80 shadow p-1 rounded-full text-xs text-slate-600">
        <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-100 rounded-full transition cursor-pointer">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="px-2 py-0.5 hover:bg-slate-100 rounded-full font-bold transition cursor-pointer">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-100 rounded-full transition cursor-pointer">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Interactive Zooming & Panning Canvas Content Wrapper */}
      <div 
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Render Vector Board Items */}
        <div className="relative w-full h-full">
          {board.items.map((item) => {
            const isSelected = selectedId === item.id;
            const isEditing = editingId === item.id;
            const isLineShape = item.type === 'shape' && (item.shapeType === 'line' || item.shapeType === 'arrow' || item.shapeType === 'bezier');
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={item.id}
                className={`absolute ${
                  isLineShape 
                    ? '' 
                    : (isSelected 
                        ? 'ring-2 ring-blue-500 shadow-xl rounded-xl' 
                        : 'hover:ring-1 hover:ring-slate-300 rounded-xl')
                } transition-all duration-100 ${
                  item.isLocked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                }`}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  zIndex: isSelected ? 9999 : item.zIndex,
                  transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined
                }}
                onMouseDown={(e) => handleItemDragStart(item, e)}
                onDoubleClick={(e) => handleItemDoubleClick(item, e)}
                onContextMenu={(e) => handleItemContextMenu(item, e)}
                onTouchStart={(e) => handleTouchItemDragStart(item, e)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Visual lock status badge */}
                {item.isLocked && (
                  <div className="absolute top-2 right-2 z-10 bg-black/45 backdrop-blur p-1 rounded-full text-white">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Real-time Dynamic Freeform Size Tooltip (only shown when dragging or resizing) */}
                {(draggingId === item.id || (resizingDir && selectedId === item.id)) && item.type !== 'drawing' && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full shadow-lg border border-white/10 z-50 font-sans font-medium flex items-center gap-1.5 whitespace-nowrap pointer-events-none transition-all">
                    <span>{pxToUnit(item.width, unit)}</span>
                    <span className="text-white/40">×</span>
                    <span>{pxToUnit(item.height, unit)}</span>
                    <span className="text-[9px] text-white/50 bg-white/10 px-1.5 py-0.2 rounded-full uppercase font-bold">{unit}</span>
                  </div>
                )}

                {/* Live Dimensions Indicator Badge */}
                {isSelected && item.type !== 'drawing' && !draggingId && !resizingDir && (
                  <div 
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-slate-100 text-[11px] px-3.5 py-1.5 rounded-full shadow-2xl border border-white/10 z-50 font-sans flex items-center gap-3 whitespace-nowrap pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Rộng:</span>
                      <input
                        type="text"
                        value={editingDimensionsId === item.id ? inputW : pxToUnit(item.width, unit)}
                        onChange={(e) => handleWChange(e.target.value, item)}
                        onFocus={() => handleFocusDimensions(item)}
                        onBlur={handleBlurDimensions}
                        className="w-12 bg-white/10 border-none rounded-md text-center py-0.5 px-1.5 outline-none text-white focus:bg-white/20 font-mono text-[10px]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">Cao:</span>
                      <input
                        type="text"
                        value={editingDimensionsId === item.id ? inputH : pxToUnit(item.height, unit)}
                        onChange={(e) => handleHChange(e.target.value, item)}
                        onFocus={() => handleFocusDimensions(item)}
                        onBlur={handleBlurDimensions}
                        className="w-12 bg-white/10 border-none rounded-md text-center py-0.5 px-1.5 outline-none text-white focus:bg-white/20 font-mono text-[10px]"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updatedItems = board.items.map(i => i.id === item.id ? { ...i, keepRatio: !(i as any).keepRatio } : i);
                        updateBoardItems(updatedItems);
                      }}
                      className={`p-1 rounded-full transition ${
                        (item as any).keepRatio ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Khóa tỷ lệ"
                    >
                      {(item as any).keepRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                    <div className="flex bg-white/5 p-0.5 rounded-full border border-white/10 shrink-0">
                      {(['px', 'cm', 'mm'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setUnit(u)}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase transition-all duration-150 ${
                            unit === u ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                    {item.rotation ? (
                      <div className="flex items-center gap-1 text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full font-mono">
                        <span>{item.rotation}°</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Resizing anchors (Only shown if selected and unlocked) */}
                {isSelected && !item.isLocked && item.type !== 'drawing' && (
                  isLineShape ? (
                    <>
                      {/* Left Start Handle */}
                      <div 
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow cursor-ew-resize z-20 hover:scale-110 transition-transform"
                        onMouseDown={(e) => handleResizeStart('w', item, e)}
                        onTouchStart={(e) => handleTouchResizeStart('w', item, e)}
                      />
                      {/* Right End Handle */}
                      <div 
                        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow cursor-ew-resize z-20 hover:scale-110 transition-transform"
                        onMouseDown={(e) => handleResizeStart('e', item, e)}
                        onTouchStart={(e) => handleTouchResizeStart('e', item, e)}
                      />
                    </>
                  ) : (
                    <>
                      <div 
                        className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-20"
                        onMouseDown={(e) => handleResizeStart('nw', item, e)}
                        onTouchStart={(e) => handleTouchResizeStart('nw', item, e)}
                      />
                      <div 
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-20"
                        onMouseDown={(e) => handleResizeStart('ne', item, e)}
                        onTouchStart={(e) => handleTouchResizeStart('ne', item, e)}
                      />
                      <div 
                        className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-20"
                        onMouseDown={(e) => handleResizeStart('sw', item, e)}
                        onTouchStart={(e) => handleTouchResizeStart('sw', item, e)}
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-20"
                        onMouseDown={(e) => handleResizeStart('se', item, e)}
                        onTouchStart={(e) => handleTouchResizeStart('se', item, e)}
                      />
                    </>
                  )
                )}

                {/* Specific Node Component Renders */}
                {/* 1. STICKY NOTES */}
                {item.type === 'sticky' && (
                  <div 
                    className={`w-full h-full p-4 rounded-2xl flex flex-col font-sans text-sm font-semibold border text-slate-800 ${
                      ['yellow', 'green', 'blue', 'pink', 'orange', 'purple'].includes(item.color) ? '' : 'border-slate-300/50'
                    }`}
                    style={
                      ['yellow', 'green', 'blue', 'pink', 'orange', 'purple'].includes(item.color)
                        ? {
                            backgroundColor:
                              item.color === 'yellow' ? '#fef08a' :
                              item.color === 'green' ? '#bbf7d0' :
                              item.color === 'blue' ? '#bfdbfe' :
                              item.color === 'pink' ? '#fbcfe8' :
                              item.color === 'orange' ? '#fed7aa' :
                              item.color === 'purple' ? '#e9d5ff' : '#e2e8f0',
                            borderColor:
                              item.color === 'yellow' ? '#fde047' :
                              item.color === 'green' ? '#86efac' :
                              item.color === 'blue' ? '#93c5fd' :
                              item.color === 'pink' ? '#f9a8d4' :
                              item.color === 'orange' ? '#fdba74' :
                              item.color === 'purple' ? '#d8b4fe' : '#cbd5e1'
                          }
                        : { backgroundColor: item.color, borderColor: `${item.color}cc` }
                    }
                  >
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={saveEditingItem}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            saveEditingItem();
                          }
                        }}
                        className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-800 font-semibold focus:ring-0"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="w-full h-full overflow-hidden break-words whitespace-pre-wrap select-text">
                        {item.text || 'Nhấp đúp để nhập chữ...'}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TEXT BOX */}
                {item.type === 'text' && (
                  <div 
                    className="w-full h-full p-2 flex items-center select-text justify-center"
                    style={{
                      fontFamily: item.fontFamily || 'Inter',
                      fontSize: `${item.fontSize || 14}px`,
                      color: item.color || '#1e293b',
                      fontWeight: item.fontWeight || 'normal',
                      textAlign: item.align || 'center'
                    }}
                  >
                    {isEditing ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={saveEditingItem}
                        className="w-full h-full bg-transparent border-none outline-none resize-none focus:ring-0 text-center"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="w-full h-full break-words overflow-hidden whitespace-pre-wrap">
                        {item.text || 'Nhấp đúp để nhập chữ...'}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SHAPE ITEM */}
                {item.type === 'shape' && (
                  <div className="w-full h-full relative">
                    {/* SVG shape representation */}
                    <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Glow Highlight for Lines/Arrows */}
                      {(item.shapeType === 'line' || item.shapeType === 'arrow') && (isSelected || isHovered) && (
                        <path
                          d={
                            item.shapeType === 'line' ? 'M 0 50 L 100 50' :
                            'M 0 50 L 100 50 M 80 30 L 100 50 L 80 70'
                          }
                          fill="none"
                          stroke={isSelected ? '#3b82f6' : '#94a3b8'}
                          strokeWidth={(item.strokeWidth !== undefined ? item.strokeWidth : 3) + 12}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`${isSelected ? 'opacity-25' : 'opacity-15'} transition-all duration-100`}
                        />
                      )}
                      <path
                        d={
                          item.shapeType === 'square' ? 'M 0 0 H 100 V 100 H 0 Z' :
                          item.shapeType === 'rectangle' ? 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 90 A 10 10 0 0 1 90 100 H 10 A 10 10 0 0 1 0 90 V 10 A 10 10 0 0 1 10 0 Z' :
                          item.shapeType === 'circle' ? 'M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0' :
                          item.shapeType === 'triangle' ? 'M 50 0 L 100 100 H 0 Z' :
                          item.shapeType === 'right_triangle' ? 'M 0 0 V 100 H 100 Z' :
                          item.shapeType === 'pentagon' ? 'M 50 0 L 100 38 L 80 100 H 20 L 0 38 Z' :
                          item.shapeType === 'diamond' ? 'M 50 0 L 100 50 L 50 100 L 0 50 Z' :
                          item.shapeType === 'capsule' ? 'M 30 0 H 70 A 30 50 0 0 1 100 50 A 30 50 0 0 1 70 100 H 30 A 30 50 0 0 1 0 50 A 30 50 0 0 1 30 0 Z' :
                          item.shapeType === 'parallelogram' ? 'M 25 0 H 100 L 75 100 H 0 Z' :
                          item.shapeType === 'star' ? 'M 50 0 L 65 36 L 100 36 L 71 60 L 82 100 L 50 76 L 18 100 L 29 60 L 0 36 L 35 36 Z' :
                          item.shapeType === 'right_arrow' ? 'M 0 30 H 65 V 0 L 100 50 L 65 100 V 70 H 0 Z' :
                          item.shapeType === 'double_arrow' ? 'M 25 100 L 0 50 L 25 0 V 30 H 75 V 0 L 100 50 L 75 100 V 70 H 25 Z' :
                          item.shapeType === 'speech_bubble' ? 'M 10 0 H 90 A 10 10 0 0 1 100 10 V 70 A 10 10 0 0 1 90 80 H 35 L 20 100 L 15 80 H 10 A 10 10 0 0 1 0 70 V 10 A 10 10 0 0 1 10 0 Z' :
                          item.shapeType === 'line' ? 'M 0 50 L 100 50' :
                          'M 0 50 L 100 50 M 80 30 L 100 50 L 80 70' // Default arrow
                        }
                        fill={item.shapeType === 'line' || item.shapeType === 'arrow' ? 'none' : item.fillColor || '#3b82f6'}
                        stroke={item.strokeColor || '#2563eb'}
                        strokeWidth={item.strokeWidth !== undefined ? item.strokeWidth : 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-90"
                      />
                    </svg>

                    {/* Inline Text descriptor inside shape */}
                    {item.shapeType !== 'line' && item.shapeType !== 'arrow' && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center p-3 text-center pointer-events-none"
                        style={{
                          fontSize: `${item.textFontSize || 14}px`,
                          color: item.textColor || '#1e293b'
                        }}
                      >
                        {isEditing ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={saveEditingItem}
                            className="w-full h-full bg-transparent border-none outline-none resize-none focus:ring-0 text-center text-slate-800 pointer-events-auto"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate max-w-full break-words whitespace-pre-wrap pointer-events-auto">
                            {item.text || ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ATTACHMENT NODE */}
                {item.type === 'attachment' && (
                  <div className="w-full h-full relative p-1 bg-white rounded-2xl shadow-sm border border-slate-200">
                    {renderAttachmentContent(item)}
                  </div>
                )}

                {/* 5. EDITABLE GRID TABLE - Screenshot 3 table modifier */}
                {item.type === 'table' && (
                  <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col p-1.5 font-sans relative">
                    <div className="flex-1 overflow-auto no-scrollbar">
                      <table className="w-full min-w-full border-collapse">
                        <tbody>
                          {Array(item.rows).fill(null).map((_, r) => (
                            <tr key={r}>
                              {Array(item.cols).fill(null).map((_, c) => {
                                const cellVal = item.data[r]?.[c]?.text || '';
                                return (
                                  <td 
                                    key={c}
                                    className="border border-slate-200 px-2 py-1.5 min-w-[100px] text-xs"
                                  >
                                    <input
                                      type="text"
                                      value={cellVal}
                                      onChange={(e) => handleTableCellChange(item.id, r, c, e.target.value)}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-slate-800"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      placeholder="..."
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Quick column/row addition buttons - only visible when selected */}
                    {isSelected && !item.isLocked && (
                      <>
                        {/* Append Column button */}
                        <button
                          onClick={() => handleAddTableCol(item)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2.5 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md border border-white z-20 cursor-pointer pointer-events-auto"
                          title="Thêm cột"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Append Row button */}
                        <button
                          onClick={() => handleAddTableRow(item)}
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2.5 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-md border border-white z-20 cursor-pointer pointer-events-auto"
                          title="Thêm dòng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Render Drawn Vector Scribble Strokes */}
          {board.items
            .filter((item) => item.type === 'drawing')
            .map((item: any) => {
              if (item.tool === 'spray') {
                const radius = item.strokeWidth || 20;
                const dots: { x: number; y: number }[] = [];
                item.points.forEach((p: Point, pIdx: number) => {
                  for (let i = 0; i < 8; i++) {
                    const angle = (pIdx * 13 + i * 47) % (2 * Math.PI);
                    const dist = ((pIdx * 31 + i * 79) % 100) / 100 * radius;
                    dots.push({
                      x: p.x - item.x + Math.cos(angle) * dist,
                      y: p.y - item.y + Math.sin(angle) * dist
                    });
                  }
                });

                return (
                  <svg
                    key={item.id}
                    className="absolute overflow-visible pointer-events-none"
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      zIndex: item.zIndex,
                    }}
                  >
                    <g opacity={item.opacity}>
                      {dots.map((d, dIdx) => (
                        <circle 
                          key={dIdx}
                          cx={d.x}
                          cy={d.y}
                          r={1.2}
                          fill={item.color}
                        />
                      ))}
                    </g>
                  </svg>
                );
              }

              let strokeDash: string | undefined = undefined;
              let linecap: "round" | "square" | "butt" = "round";
              let filterStyle: string | undefined = undefined;

              if (item.tool === 'brush') {
                if (item.brushStyle === 'crayon') {
                  strokeDash = "2,3";
                } else if (item.brushStyle === 'marker') {
                  linecap = "square";
                } else if (item.brushStyle === 'watercolor') {
                  filterStyle = "blur(2px)";
                }
              }

              return (
                <svg
                  key={item.id}
                  className="absolute overflow-visible pointer-events-none"
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    zIndex: item.zIndex,
                    filter: filterStyle
                  }}
                >
                  <polyline
                    fill="none"
                    stroke={item.color}
                    strokeWidth={item.strokeWidth}
                    strokeDasharray={strokeDash}
                    opacity={item.opacity}
                    strokeLinecap={linecap}
                    strokeLinejoin="round"
                    points={item.points.map((p: Point) => `${p.x - item.x},${p.y - item.y}`).join(' ')}
                  />
                </svg>
              );
            })}

          {/* Live Drawing overlay layer (active sketching path) */}
          {isDrawingMode && isDrawing && drawPoints.length > 0 && (
            (() => {
              const activeTool = penSettings.tool;
              if (activeTool === 'eraser' || activeTool === 'bucket' || activeTool === 'picker' || activeTool === 'magnifier') return null;

              const settings = (penSettings as any)[activeTool];
              if (!settings) return null;

              if (activeTool === 'spray') {
                const radius = settings.radius;
                const dots: { x: number; y: number }[] = [];
                drawPoints.forEach((p, pIdx) => {
                  for (let i = 0; i < 8; i++) {
                    const angle = (pIdx * 13 + i * 47) % (2 * Math.PI);
                    const dist = ((pIdx * 31 + i * 79) % 100) / 100 * radius;
                    dots.push({
                      x: p.x + Math.cos(angle) * dist,
                      y: p.y + Math.sin(angle) * dist
                    });
                  }
                });
                return (
                  <svg className="absolute inset-0 w-[5000px] h-[5000px] -translate-x-[2500px] -translate-y-[2500px] pointer-events-none overflow-visible">
                    <g>
                      {dots.map((d, dIdx) => (
                        <circle 
                          key={dIdx}
                          cx={d.x}
                          cy={d.y}
                          r={1.2}
                          fill={settings.color}
                        />
                      ))}
                    </g>
                  </svg>
                );
              }

              let strokeDash: string | undefined = undefined;
              let linecap: "round" | "square" | "butt" = "round";
              let filterStyle: string | undefined = undefined;

              if (activeTool === 'brush') {
                if (settings.style === 'crayon') {
                  strokeDash = "2,3";
                } else if (settings.style === 'marker') {
                  linecap = "square";
                } else if (settings.style === 'watercolor') {
                  filterStyle = "blur(2px)";
                }
              }

              return (
                <svg 
                  className="absolute inset-0 w-[5000px] h-[5000px] -translate-x-[2500px] -translate-y-[2500px] pointer-events-none overflow-visible"
                  style={{ filter: filterStyle }}
                >
                  <polyline
                    fill="none"
                    stroke={settings.color}
                    strokeWidth={settings.width}
                    strokeDasharray={strokeDash}
                    opacity={settings.opacity}
                    strokeLinecap={linecap}
                    strokeLinejoin="round"
                    points={drawPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  />
                </svg>
              );
            })()
          )}
        </div>
      </div>

      {/* Floating Active Element Context Menu (iOS-style, Screenshot 9) */}
      {contextMenuPos && getSelectedItem && (
        <ContextMenu
          item={getSelectedItem}
          position={contextMenuPos}
          onSendToBack={() => {
            const minZ = Math.min(...board.items.map(i => i.zIndex), 0);
            updateBoardItems(
              board.items.map(i => i.id === selectedId ? { ...i, zIndex: minZ - 1 } : i)
            );
          }}
          onBringToFront={() => {
            const maxZ = Math.max(...board.items.map(i => i.zIndex), 0);
            updateBoardItems(
              board.items.map(i => i.id === selectedId ? { ...i, zIndex: maxZ + 1 } : i)
            );
          }}
          onCut={() => {
            const selected = board.items.find(i => i.id === selectedId);
            if (selected) {
              localStorage.setItem('freeform_clipboard', JSON.stringify(selected));
              updateBoardItems(board.items.filter(i => i.id !== selectedId));
              setSelectedId(null);
            }
          }}
          onCopy={() => {
            const selected = board.items.find(i => i.id === selectedId);
            if (selected) {
              localStorage.setItem('freeform_clipboard', JSON.stringify(selected));
            }
          }}
          onDuplicate={() => {
            const selected = board.items.find(i => i.id === selectedId);
            if (selected) {
              const newItem = {
                ...selected,
                id: selected.type + '-' + Date.now(),
                x: selected.x + 30,
                y: selected.y + 30,
                zIndex: Math.max(0, ...board.items.map(i => i.zIndex)) + 1
              };
              updateBoardItems([...board.items, newItem]);
              setSelectedId(newItem.id);
            }
          }}
          onToggleLock={() => {
            updateBoardItems(
              board.items.map(i => i.id === selectedId ? { ...i, isLocked: !i.isLocked } : i)
            );
          }}
          onDelete={() => {
            if (selectedId) {
              onDeleteSelected(selectedId);
              setSelectedId(null);
            }
          }}
          onUpdateStyle={(updates) => {
            updateBoardItems(
              board.items.map(i => i.id === selectedId ? { ...i, ...updates } : i)
            );
          }}
          onClose={() => setContextMenuPos(null)}
        />
      )}
    </div>
  );
}
