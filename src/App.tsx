import React, { useState, useEffect, useRef } from 'react';
import { 
  Board, 
  BoardItem, 
  StickyColor, 
  AttachmentType, 
  PenSettings, 
  TableCell,
  ViewMode,
  WallItem,
  DoorWindowItem,
  GardenFurnitureItem,
  DimensionItem
} from './types';
import BoardsList from './components/BoardsList';
import BoardCanvas from './components/BoardCanvas';
import Toolbar from './components/Toolbar';
import ShapesMenu from './components/ShapesMenu';
import IsometricView3D from './components/IsometricView3D';
import CostEstimatorModal from './components/CostEstimatorModal';
import AICopilotDrawer from './components/AICopilotDrawer';
import AIAccountModal, { DEFAULT_AI_CONFIG } from './components/AIAccountModal';
import { AIAuthConfig } from './types';
import { HOUSE_TEMPLATES, createLandPlotBoard, createTropicalVillaBoard } from './data/houseTemplates';
import { getSymbolDef, ARCHITECTURAL_SYMBOLS } from './data/architecturalSymbols';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Trees, Box, Plus, X, Layers, Sparkles, MapPin, Maximize2, Ruler } from 'lucide-react';

// Bảng khởi tạo ban đầu: Mẫu Biệt Thự Vườn Nhiệt Đới hoàn chỉnh
const createWelcomeBoard = (): Board => {
  return createTropicalVillaBoard();
};

// Cài đặt công cụ vẽ mặc định
const defaultPenSettings: PenSettings = {
  tool: 'pencil',
  pencil: { color: '#000000', width: 2, opacity: 0.8 },
  pen: { color: '#007aff', width: 5, opacity: 1.0 },
  highlighter: { color: '#ffcc00', width: 18, opacity: 0.4 },
  brush: { color: '#34c759', width: 12, opacity: 0.8, style: 'normal' },
  spray: { color: '#ff2d55', radius: 22, density: 12 },
  eraser: { mode: 'pixel', size: 30 },
  bucket: { color: '#5856d6' }
};

export default function App() {
  // Screens state
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'canvas'>('dashboard');
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Chế độ xem: 2D Mặt bằng hoặc 3D Isometric
  const [viewMode, setViewMode] = useState<ViewMode>('2d');

  // Cấu hình Tài khoản AI & Trạng thái Modal Đăng nhập AI
  const [aiConfig, setAiConfig] = useState<AIAuthConfig>(() => {
    try {
      const stored = localStorage.getItem('ai_auth_config');
      return stored ? JSON.parse(stored) : DEFAULT_AI_CONFIG;
    } catch (e) {
      return DEFAULT_AI_CONFIG;
    }
  });
  const [showAIAccountModal, setShowAIAccountModal] = useState(false);

  // Trạng thái hiển thị Modal Mẫu Thiết Kế, Khung Đất & Dự Toán Chi Phí
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showLandPlotModal, setShowLandPlotModal] = useState(false);
  const [showCostEstimatorModal, setShowCostEstimatorModal] = useState(false);
  const [plotWidth, setPlotWidth] = useState(10);
  const [plotLength, setPlotLength] = useState(20);
  const [plotName, setPlotName] = useState('');

  // Canvas Options & Pen controls
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [penSettings, setPenSettings] = useState<PenSettings>(defaultPenSettings);
  const [shapesMenuOpen, setShapesMenuOpen] = useState(false);

  // Deep Undo/Redo stack for the current editing board
  const [historyStack, setHistoryStack] = useState<BoardItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Load boards from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('freeform_boards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBoards(parsed);
          return;
        }
      } catch (e) {
        console.error('Lỗi khi tải bảng từ LocalStorage:', e);
      }
    }

    // Mặc định nạp mẫu nhà vườn đẹp mắt
    const welcome = createWelcomeBoard();
    setBoards([welcome]);
    localStorage.setItem('freeform_boards', JSON.stringify([welcome]));
  }, []);

  // Save boards to local storage whenever state changes
  const saveBoards = (newBoards: Board[]) => {
    setBoards(newBoards);
    localStorage.setItem('freeform_boards', JSON.stringify(newBoards));
  };

  const activeBoard = boards.find(b => b.id === activeBoardId);

  // Set up or update undo history stack when entering a board or changing items
  const pushToHistory = (newItems: BoardItem[]) => {
    const updatedStack = historyStack.slice(0, historyIndex + 1);
    updatedStack.push(newItems);
    
    // Limit stack size to 50 for performance
    if (updatedStack.length > 50) {
      updatedStack.shift();
    }

    setHistoryStack(updatedStack);
    setHistoryIndex(updatedStack.length - 1);
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setCurrentScreen('canvas');

    const targetBoard = boards.find(b => b.id === boardId);
    if (targetBoard) {
      setHistoryStack([targetBoard.items]);
      setHistoryIndex(0);
    }
  };

  const handleCreateBoard = (name?: string) => {
    const newBoard: Board = {
      id: 'board-' + Date.now(),
      name: name || `Bảng mới #${boards.length + 1}`,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      zoom: 1.0,
      panX: 100,
      panY: 100,
      showGrid: true,
      snapToGrid: true
    };

    const updated = [newBoard, ...boards];
    saveBoards(updated);
    handleSelectBoard(newBoard.id);
  };

  const handleRenameBoard = (boardId: string, newName: string) => {
    const updated = boards.map(b => b.id === boardId ? { ...b, name: newName, updatedAt: new Date().toISOString() } : b);
    saveBoards(updated);
  };

  const handleToggleFavorite = (boardId: string) => {
    const updated = boards.map(b => b.id === boardId ? { ...b, isFavorite: !b.isFavorite, updatedAt: new Date().toISOString() } : b);
    saveBoards(updated);
  };

  const handleDuplicateBoard = (boardId: string) => {
    const source = boards.find(b => b.id === boardId);
    if (!source) return;

    const duplicated: Board = {
      ...source,
      id: 'board-dup-' + Date.now(),
      name: `${source.name} (Bản sao)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveBoards([duplicated, ...boards]);
  };

  const handleDeleteBoard = (boardId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bảng này không?')) {
      const updated = boards.filter(b => b.id !== boardId);
      saveBoards(updated);
      if (activeBoardId === boardId) {
        setCurrentScreen('dashboard');
        setActiveBoardId(null);
      }
    }
  };

  const handleImportBoards = (imported: Board[]) => {
    const updated = [...imported, ...boards];
    saveBoards(updated);
  };

  const handleUpdateBoard = (updatedBoard: Board) => {
    const updatedList = boards.map(b => b.id === updatedBoard.id ? updatedBoard : b);
    saveBoards(updatedList);

    // Track state change in history
    if (activeBoardId === updatedBoard.id) {
      // Check if items changed to avoid pushing history on simple pan/zooms
      const itemsChanged = JSON.stringify(activeBoard?.items) !== JSON.stringify(updatedBoard.items);
      if (itemsChanged) {
        pushToHistory(updatedBoard.items);
      }
    }
  };

  // Canvas element insertions
  const handleAddSticky = (color: StickyColor) => {
    if (!activeBoard) return;
    
    // Position sticky centered or slightly offset in view space
    const targetX = (300 - activeBoard.panX) / activeBoard.zoom;
    const targetY = (200 - activeBoard.panY) / activeBoard.zoom;

    const newSticky: BoardItem = {
      id: 'sticky-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'sticky',
      x: targetX,
      y: targetY,
      width: 180,
      height: 180,
      color,
      text: '',
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newSticky];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddTextBox = () => {
    if (!activeBoard) return;
    
    const targetX = (300 - activeBoard.panX) / activeBoard.zoom;
    const targetY = (250 - activeBoard.panY) / activeBoard.zoom;

    const newText: BoardItem = {
      id: 'text-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'text',
      x: targetX,
      y: targetY,
      width: 200,
      height: 60,
      fontSize: 14,
      color: '#1e293b',
      text: '',
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newText];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddTable = () => {
    if (!activeBoard) return;

    const targetX = (250 - activeBoard.panX) / activeBoard.zoom;
    const targetY = (200 - activeBoard.panY) / activeBoard.zoom;

    const initialData: TableCell[][] = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => ({ text: '' }))
    );

    const newTable: BoardItem = {
      id: 'table-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'table',
      x: targetX,
      y: targetY,
      width: 320,
      height: 140,
      rows: 3,
      cols: 3,
      data: initialData,
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newTable];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddAttachment = (type: AttachmentType, file?: File) => {
    if (!activeBoard) return;

    const targetX = (250 - activeBoard.panX) / activeBoard.zoom;
    const targetY = (200 - activeBoard.panY) / activeBoard.zoom;

    let title = 'Tài liệu mới';
    let blobUrl = '';
    let fileSize = '';

    if (file) {
      title = file.name;
      blobUrl = URL.createObjectURL(file);
      fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (type === 'link') {
      title = 'Liên kết thông tin';
    }

    const newAttachment: BoardItem = {
      id: 'attachment-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'attachment',
      attachmentType: type,
      x: targetX,
      y: targetY,
      width: 180,
      height: 140,
      title,
      url: type === 'link' ? 'https://google.com' : undefined,
      blobUrl: blobUrl || undefined,
      fileSize: fileSize || undefined,
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newAttachment];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddShape = (shapeType: any) => {
    if (!activeBoard) return;

    const targetX = (250 - activeBoard.panX) / activeBoard.zoom;
    const targetY = (200 - activeBoard.panY) / activeBoard.zoom;

    // Line shapes default narrower height
    const isLine = shapeType === 'line' || shapeType === 'arrow';
    // 151.18px is exactly 4.0cm, 188.98px is exactly 5.0cm, 37.8px is exactly 1.0cm
    const width = isLine ? 188.98 : 151.18;
    const height = isLine ? 37.8 : 151.18;

    const newShape: BoardItem = {
      id: 'shape-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'shape',
      shapeType,
      x: targetX,
      y: targetY,
      width,
      height,
      fillColor: isLine ? 'none' : '#3b82f6',
      strokeColor: '#2563eb',
      strokeWidth: isLine ? 3 : 0, // 0 means "không có viền" (no border) for standard geometric shapes
      textColor: '#1e293b',
      textFontSize: 14,
      text: '',
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    } as any;

    const updatedItems = [...activeBoard.items, newShape];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
    setShapesMenuOpen(false); // Close menu
  };

  const handleDeleteSelected = (itemId: string) => {
    if (!activeBoard) return;
    const updatedItems = activeBoard.items.filter(i => i.id !== itemId);
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  // === CÁC HÀM THÊM ĐỐI TƯỢNG KIẾN TRÚC & SÂN VƯỜN ===
  const handleAddWall = (thickness: number, isFence?: boolean) => {
    if (!activeBoard) return;
    const targetX = Math.round(((window.innerWidth / 2 - 100) - activeBoard.panX) / activeBoard.zoom);
    const targetY = Math.round(((window.innerHeight / 2 - 10) - activeBoard.panY) / activeBoard.zoom);
    const wallLength = 200; // Mặc định 4.0m

    const newWall: WallItem = {
      id: 'wall-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'wall',
      x: targetX,
      y: targetY,
      width: wallLength,
      height: thickness,
      x1: targetX,
      y1: targetY,
      x2: targetX + wallLength,
      y2: targetY,
      thickness,
      wallHeight: isFence ? 1.8 : 3.0,
      wallColor: isFence ? '#94a3b8' : '#334155',
      isFence,
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newWall];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddDoorWindow = (subType: 'single_door' | 'double_door' | 'sliding_door' | 'window') => {
    if (!activeBoard) return;
    const targetX = Math.round(((window.innerWidth / 2 - 45) - activeBoard.panX) / activeBoard.zoom);
    const targetY = Math.round(((window.innerHeight / 2 - 20) - activeBoard.panY) / activeBoard.zoom);
    const width = subType === 'double_door' ? 90 : subType === 'sliding_door' ? 100 : subType === 'window' ? 70 : 50;
    const height = 40;

    const newDoorWindow: DoorWindowItem = {
      id: 'door-window-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'door_window',
      subType,
      x: targetX,
      y: targetY,
      width,
      height,
      doorWidth: width,
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newDoorWindow];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddGardenFurniture = (symbolId: string) => {
    if (!activeBoard) return;
    const symDef = getSymbolDef(symbolId);
    const width = symDef?.defaultWidth || 100;
    const height = symDef?.defaultHeight || 100;
    const targetX = Math.round(((window.innerWidth / 2 - width / 2) - activeBoard.panX) / activeBoard.zoom);
    const targetY = Math.round(((window.innerHeight / 2 - height / 2) - activeBoard.panY) / activeBoard.zoom);

    const newGardenItem: GardenFurnitureItem = {
      id: 'garden-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'garden_item',
      category: symDef?.category || 'plants',
      symbolId,
      label: symDef?.name,
      x: targetX,
      y: targetY,
      width,
      height,
      height3D: symDef?.height3D,
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newGardenItem];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  const handleAddDimension = () => {
    if (!activeBoard) return;
    const width = 200; // 4.0m
    const targetX = Math.round(((window.innerWidth / 2 - width / 2) - activeBoard.panX) / activeBoard.zoom);
    const targetY = Math.round(((window.innerHeight / 2 - 15) - activeBoard.panY) / activeBoard.zoom);

    const newDim: DimensionItem = {
      id: 'dim-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'dimension',
      x: targetX,
      y: targetY,
      width,
      height: 30,
      x1: targetX,
      y1: targetY + 15,
      x2: targetX + width,
      y2: targetY + 15,
      unit: 'm',
      zIndex: Math.max(0, ...activeBoard.items.map(i => i.zIndex)) + 1
    };

    const updatedItems = [...activeBoard.items, newDim];
    handleUpdateBoard({ ...activeBoard, items: updatedItems });
  };

  // Nạp mẫu thiết kế dựng sẵn
  const handleApplyTemplate = (templateCreator: () => Board) => {
    const newBoard = templateCreator();
    const updated = [newBoard, ...boards];
    saveBoards(updated);
    handleSelectBoard(newBoard.id);
    setShowTemplatesModal(false);
  };

  // Tạo khung đất mới theo kích thước
  const handleCreateLandPlot = () => {
    const newBoard = createLandPlotBoard(plotWidth, plotLength, plotName || undefined);
    const updated = [newBoard, ...boards];
    saveBoards(updated);
    handleSelectBoard(newBoard.id);
    setShowLandPlotModal(false);
  };

  // Undo & Redo trigger
  const handleUndo = () => {
    if (historyIndex > 0 && activeBoard) {
      const prevItems = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      
      const updatedList = boards.map(b => b.id === activeBoard.id ? { ...b, items: prevItems, updatedAt: new Date().toISOString() } : b);
      setBoards(updatedList);
      localStorage.setItem('freeform_boards', JSON.stringify(updatedList));
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1 && activeBoard) {
      const nextItems = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);

      const updatedList = boards.map(b => b.id === activeBoard.id ? { ...b, items: nextItems, updatedAt: new Date().toISOString() } : b);
      setBoards(updatedList);
      localStorage.setItem('freeform_boards', JSON.stringify(updatedList));
    }
  };

  // Lưu cấu hình tài khoản AI
  const handleSaveAIConfig = (newConfig: AIAuthConfig) => {
    setAiConfig(newConfig);
    localStorage.setItem('ai_auth_config', JSON.stringify(newConfig));
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50 font-sans relative">
      <AnimatePresence mode="wait">
        {currentScreen === 'dashboard' ? (
          <motion.div
            key="dashboard-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <BoardsList
              boards={boards}
              onSelectBoard={handleSelectBoard}
              onCreateBoard={handleCreateBoard}
              onRenameBoard={handleRenameBoard}
              onToggleFavorite={handleToggleFavorite}
              onDuplicateBoard={handleDuplicateBoard}
              onDeleteBoard={handleDeleteBoard}
              onImportBoards={handleImportBoards}
            />
          </motion.div>
        ) : (
          <motion.div
            key="canvas-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative"
          >
            {activeBoard && (
              <>
                {/* Chế độ 3D Isometric View */}
                {viewMode === '3d' ? (
                  <IsometricView3D
                    board={activeBoard}
                    onExit3D={() => setViewMode('2d')}
                  />
                ) : (
                  <>
                    {/* Master Interactive Dotted Board Canvas (2D) */}
                    <BoardCanvas
                      board={activeBoard}
                      isDrawingMode={isDrawingMode}
                      penSettings={penSettings}
                      shapesMenuOpen={shapesMenuOpen}
                      onUpdateBoard={handleUpdateBoard}
                      onAddSticky={handleAddSticky}
                      onAddTextBox={handleAddTextBox}
                      onAddTable={handleAddTable}
                      onAddAttachment={handleAddAttachment}
                      onAddShape={handleAddShape}
                      onDeleteSelected={handleDeleteSelected}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={historyIndex > 0}
                      canRedo={historyIndex < historyStack.length - 1}
                      onGoBack={() => {
                        setIsDrawingMode(false);
                        setShapesMenuOpen(false);
                        setCurrentScreen('dashboard');
                        setActiveBoardId(null);
                      }}
                      onChangePenSettings={setPenSettings}
                    />

                    {/* Floating Bottom Toolbar Dock */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
                      <Toolbar
                        isDrawingMode={isDrawingMode}
                        onToggleDrawingMode={() => {
                          setIsDrawingMode(!isDrawingMode);
                          setShapesMenuOpen(false);
                        }}
                        onAddSticky={handleAddSticky}
                        onAddTextBox={handleAddTextBox}
                        onAddTable={handleAddTable}
                        onAddAttachment={handleAddAttachment}
                        onToggleShapesMenu={() => {
                          setShapesMenuOpen(!shapesMenuOpen);
                          setIsDrawingMode(false);
                        }}
                        penSettings={penSettings}
                        onChangePenSettings={setPenSettings}
                        onAddWall={handleAddWall}
                        onAddDoorWindow={handleAddDoorWindow}
                        onAddGardenFurniture={handleAddGardenFurniture}
                        onAddDimension={handleAddDimension}
                        onOpenTemplates={() => setShowTemplatesModal(true)}
                        onOpenLandWizard={() => setShowLandPlotModal(true)}
                        onOpenCostEstimator={() => setShowCostEstimatorModal(true)}
                        onToggleView3D={() => setViewMode('3d')}
                        is3DView={viewMode === '3d'}
                      />
                    </div>
                  </>
                )}

                {/* Sliding Shape Selector Window Popover */}
                <AnimatePresence>
                  {shapesMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setShapesMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        className="absolute top-16 right-6 z-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
                      >
                        <ShapesMenu
                          onSelectShape={handleAddShape}
                          onClose={() => setShapesMenuOpen(false)}
                        />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* MODAL 1: MẪU THIẾT KẾ NHÀ VƯỜN (HOUSE & GARDEN TEMPLATES) */}
                <AnimatePresence>
                  {showTemplatesModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl p-6 shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar space-y-5"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              🏡
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">Thư Viện Mẫu Thiết Kế Nhà Vườn</h3>
                              <p className="text-xs text-slate-500">Chọn mẫu mặt bằng có sẵn để tùy biến theo nhu cầu</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowTemplatesModal(false)}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {HOUSE_TEMPLATES.map((tmpl) => (
                            <div 
                              key={tmpl.id}
                              className="border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg transition group bg-slate-50/50 hover:bg-white"
                            >
                              <div className="space-y-2">
                                <div className="text-2xl">
                                  {tmpl.id === 'tropical_villa' ? '🌴' : tmpl.id === 'modern_townhouse' ? '🏡' : '🌊'}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                                  {tmpl.name}
                                </h4>
                                <span className="inline-block text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                                  {tmpl.landSize}
                                </span>
                                <p className="text-xs text-slate-500 line-clamp-3">
                                  {tmpl.description}
                                </p>
                              </div>

                              <button
                                onClick={() => handleApplyTemplate(tmpl.createBoard)}
                                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-md shadow-blue-500/25 cursor-pointer"
                              >
                                Sử dụng mẫu này
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* MODAL 2: TRÌNH TẠO KHUNG ĐẤT (LAND PLOT WIZARD) */}
                <AnimatePresence>
                  {showLandPlotModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-100 space-y-5"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                              📐
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">Tạo Khung Lô Đất Tự Động</h3>
                              <p className="text-xs text-slate-500">Nhập kích thước để vẽ ranh mốc và thước đo</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowLandPlotModal(false)}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tên lô đất / Dự án (Tùy chọn)
                            </label>
                            <input
                              type="text"
                              value={plotName}
                              onChange={(e) => setPlotName(e.target.value)}
                              placeholder={`Ví dụ: Lô đất biệt thự ${plotWidth}m x ${plotLength}m`}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Chiều rộng (Mét)
                              </label>
                              <input
                                type="number"
                                min="3"
                                max="100"
                                value={plotWidth}
                                onChange={(e) => setPlotWidth(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Chiều dài (Mét)
                              </label>
                              <input
                                type="number"
                                min="3"
                                max="100"
                                value={plotLength}
                                onChange={(e) => setPlotLength(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800 text-xs flex items-center justify-between font-semibold">
                            <span>Diện tích dự kiến:</span>
                            <span className="font-bold text-sm">{plotWidth * plotLength} m²</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => setShowLandPlotModal(false)}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            onClick={handleCreateLandPlot}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-md shadow-emerald-500/25 cursor-pointer"
                          >
                            Tạo Mặt Bằng Đất
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* MODAL 3: BẢNG DỰ TOÁN CHI PHÍ & BÓC TÁCH VẬT TƯ (BOM & COST ESTIMATOR) */}
                <AnimatePresence>
                  {showCostEstimatorModal && activeBoard && (
                    <CostEstimatorModal
                      board={activeBoard}
                      onClose={() => setShowCostEstimatorModal(false)}
                    />
                  )}
                </AnimatePresence>

                {/* TRỢ LÝ AI KIẾN TRÚC SƯ COPILOT TƯƠNG TÁC GIỌNG NÓI & CHAT ĐỒNG BỘ */}
                <AICopilotDrawer
                  currentBoard={activeBoard}
                  aiConfig={aiConfig}
                  onOpenAccountModal={() => setShowAIAccountModal(true)}
                  onApplyNewBoard={(newBoard) => {
                    const updated = [newBoard, ...boards];
                    saveBoards(updated);
                    handleSelectBoard(newBoard.id);
                  }}
                  onAddGardenItem={(symbolId) => {
                    handleAddGardenFurniture(symbolId);
                  }}
                  onSwitchViewMode={setViewMode}
                  onOpenCostEstimator={() => setShowCostEstimatorModal(true)}
                />

                {/* MODAL 4: TRUNG TÂM ĐĂNG NHẬP & KẾT NỐI ĐA TÀI KHOẢN AI */}
                <AnimatePresence>
                  {showAIAccountModal && (
                    <AIAccountModal
                      currentConfig={aiConfig}
                      onClose={() => setShowAIAccountModal(false)}
                      onSaveConfig={handleSaveAIConfig}
                    />
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
