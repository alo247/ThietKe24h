import React, { useState, useEffect, useRef } from 'react';
import { Board, BoardItem, StickyColor, AttachmentType, PenSettings, TableCell } from './types';
import BoardsList from './components/BoardsList';
import BoardCanvas from './components/BoardCanvas';
import Toolbar from './components/Toolbar';
import ShapesMenu from './components/ShapesMenu';
import { motion, AnimatePresence } from 'motion/react';

// Default initial onboarding board to show craftsmanship
const createWelcomeBoard = (): Board => {
  const welcomeBoardId = 'welcome-board-' + Date.now();
  const baseItems: BoardItem[] = [
    {
      id: 'sticky-welcome',
      type: 'sticky',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      color: 'yellow',
      text: 'Chào mừng bạn đến với Freeform Web! 🎨\n\n- Nhấp đúp vào giấy ghi chú để viết nội dung.\n- Kéo các góc để co giãn kích thước.\n- Nhấp chuột phải (hoặc nhấn giữ) để mở Menu thuộc tính.',
      zIndex: 1
    },
    {
      id: 'sticky-tips',
      type: 'sticky',
      x: 340,
      y: 100,
      width: 200,
      height: 200,
      color: 'blue',
      text: '💡 Mẹo thu phóng & di chuyển:\n\n- Lăn bánh xe chuột để thu phóng canvas.\n- Nhấn giữ Shift + Kéo chuột (hoặc dùng chuột giữa) để dịch chuyển không giới hạn.',
      zIndex: 2
    },
    {
      id: 'shape-intro',
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 340,
      width: 440,
      height: 80,
      fillColor: '#60a5fa',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      textColor: '#ffffff',
      textFontSize: 16,
      text: 'Hỗ trợ hơn 20 loại hình học vector chuyên nghiệp',
      zIndex: 3
    },
    {
      id: 'table-sample',
      type: 'table',
      x: 580,
      y: 100,
      width: 320,
      height: 180,
      rows: 4,
      cols: 3,
      data: [
        [{ text: 'Tính năng' }, { text: 'Trạng thái' }, { text: 'Ghi chú' }],
        [{ text: 'Bản vẽ bút' }, { text: 'Hoàn thành' }, { text: 'Skeuomorphic' }],
        [{ text: 'Lưới bám dính' }, { text: 'Hoạt động' }, { text: 'Snap-to-grid' }],
        [{ text: 'Xuất / Nhập' }, { text: 'Có sẵn' }, { text: 'File JSON' }]
      ],
      zIndex: 4
    },
    {
      id: 'drawing-arrow',
      type: 'drawing',
      tool: 'pen',
      x: 250,
      y: 280,
      width: 100,
      height: 50,
      points: [
        { x: 250, y: 310 },
        { x: 280, y: 315 },
        { x: 310, y: 300 },
        { x: 330, y: 290 },
        { x: 340, y: 285 }
      ],
      color: '#ff3b30',
      strokeWidth: 4,
      opacity: 0.9,
      zIndex: 5
    }
  ];

  return {
    id: welcomeBoardId,
    name: 'Bảng chào mừng Freeform 🚀',
    items: baseItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isFavorite: false,
    zoom: 1.0,
    panX: 100,
    panY: 100,
    showGrid: true,
    snapToGrid: true
  };
};

// Initial Pen settings matching Screenshots
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

    // Default startup welcome board
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
                {/* Master Interactive Dotted Board Canvas */}
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
                  />
                </div>

                {/* Sliding Shape Selector Window Popover - Screenshot 7 & 8 */}
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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
