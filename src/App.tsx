// src/App.tsx
// Ứng dụng Thiết Kế Nhà 2D & 3D Chuyên Nghiệp (HomeByMe / Planner 5D Architecture)

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
  DimensionItem,
  AIAuthConfig
} from './types';
import BoardsList from './components/BoardsList';
import BoardCanvas from './components/BoardCanvas';
import Toolbar from './components/Toolbar';
import ShapesMenu from './components/ShapesMenu';
import ThreeViewport3D from './core/3d/ThreeViewport3D';
import IsometricView3D from './components/IsometricView3D';
import TopNavHeader from './components/TopNavHeader';
import LeftSidebarCatalog from './components/LeftSidebarCatalog';
import RightPropertiesPanel from './components/RightPropertiesPanel';
import AICommandBar from './components/AICommandBar';
import CostEstimateModal from './components/CostEstimateModal';
import AICopilotDrawer from './components/AICopilotDrawer';
import AIAccountModal, { DEFAULT_AI_CONFIG } from './components/AIAccountModal';
import AIVisionModal from './components/AIVisionModal';
import AIRenderStudioModal from './components/AIRenderStudioModal';
import HouseTemplatesModal from './components/HouseTemplatesModal';
import { createLandPlotBoard, createLuxuryPenthouseBoard } from './data/houseTemplates';
import { CatalogProduct } from './core/catalog/FurnitureCatalog';
import { PBRMaterialDef } from './core/catalog/MaterialCatalog';
import { processUserPrompt } from './services/aiArchitectEngine';
import { downloadAutoCADDXF } from './services/dxfExporter';
import { metersToPx } from './core/geometry/DimensionMath';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const createWelcomeBoard = (): Board => {
  return createLuxuryPenthouseBoard();
};

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
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'canvas'>('canvas');
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Chế độ xem: 2D Mặt Bằng hoặc 3D WebGL Three.js
  const [viewMode, setViewMode] = useState<ViewMode>('2d');

  // Quản lý chọn đối tượng và bảng thuộc tính bên phải
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | undefined>('wood_oak');

  // Cấu hình AI & Trạng thái Modal
  const [aiConfig, setAiConfig] = useState<AIAuthConfig>(() => {
    try {
      const stored = localStorage.getItem('ai_auth_config');
      return stored ? JSON.parse(stored) : DEFAULT_AI_CONFIG;
    } catch (e) {
      return DEFAULT_AI_CONFIG;
    }
  });

  const [showAIAccountModal, setShowAIAccountModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showLandPlotModal, setShowLandPlotModal] = useState(false);
  const [showCostEstimatorModal, setShowCostEstimatorModal] = useState(false);
  const [showAIVisionModal, setShowAIVisionModal] = useState(false);
  const [showAIRenderStudioModal, setShowAIRenderStudioModal] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // Khung đất
  const [plotWidth, setPlotWidth] = useState(10);
  const [plotLength, setPlotLength] = useState(20);
  const [plotName, setPlotName] = useState('');

  // Canvas & Pen Controls
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [penSettings, setPenSettings] = useState<PenSettings>(defaultPenSettings);
  const [shapesMenuOpen, setShapesMenuOpen] = useState(false);

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<BoardItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Nạp danh sách dự án từ LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('freeform_boards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBoards(parsed);
          setActiveBoardId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error('Lỗi khi tải bảng:', e);
      }
    }

    const welcome = createWelcomeBoard();
    setBoards([welcome]);
    setActiveBoardId(welcome.id);
    localStorage.setItem('freeform_boards', JSON.stringify([welcome]));
  }, []);

  const saveBoards = (newBoards: Board[]) => {
    setBoards(newBoards);
    localStorage.setItem('freeform_boards', JSON.stringify(newBoards));
  };

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  const pushToHistory = (newItems: BoardItem[]) => {
    const updatedStack = historyStack.slice(0, historyIndex + 1);
    updatedStack.push(newItems);
    if (updatedStack.length > 50) updatedStack.shift();
    setHistoryStack(updatedStack);
    setHistoryIndex(updatedStack.length - 1);
  };

  useEffect(() => {
    if (activeBoard) {
      setHistoryStack([activeBoard.items]);
      setHistoryIndex(0);
      setSelectedItemId(null);
    }
  }, [activeBoardId]);

  const handleUpdateBoard = (updatedBoard: Board) => {
    const updated = boards.map(b => b.id === updatedBoard.id ? updatedBoard : b);
    saveBoards(updated);
    pushToHistory(updatedBoard.items);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && activeBoard) {
      const prevItems = historyStack[historyIndex - 1];
      const updated = boards.map(b => b.id === activeBoard.id ? { ...b, items: prevItems } : b);
      saveBoards(updated);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1 && activeBoard) {
      const nextItems = historyStack[historyIndex + 1];
      const updated = boards.map(b => b.id === activeBoard.id ? { ...b, items: nextItems } : b);
      saveBoards(updated);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Thêm tường
  const handleAddWall = (thickness: number, isFence = false) => {
    if (!activeBoard) return;
    const newWall: WallItem = {
      id: 'wall-' + Date.now(),
      type: 'wall',
      x: 300,
      y: 300,
      width: 250,
      height: thickness,
      x1: 300,
      y1: 300,
      x2: 550,
      y2: 300,
      thickness,
      wallHeight: isFence ? 1.4 : 2.8,
      wallColor: isFence ? '#bae6fd' : '#0f172a',
      isFence,
      zIndex: activeBoard.items.length + 1
    };
    handleUpdateBoard({ ...activeBoard, items: [...activeBoard.items, newWall] });
    setSelectedItemId(newWall.id);
  };

  // Thêm cửa
  const handleAddDoorWindow = (subType: 'single_door' | 'double_door' | 'sliding_door' | 'window') => {
    if (!activeBoard) return;
    const isWindow = subType === 'window';
    const isSliding = subType === 'sliding_door';
    const doorWidth = isWindow ? 70 : isSliding ? 140 : 45;
    const newDoor: DoorWindowItem = {
      id: 'door-' + Date.now(),
      type: 'door_window',
      subType,
      x: 350,
      y: 300,
      width: doorWidth,
      height: 15,
      doorWidth,
      doorHeight3D: isWindow ? 1.4 : 2.4,
      openDirection: 'inward',
      zIndex: activeBoard.items.length + 1
    };
    handleUpdateBoard({ ...activeBoard, items: [...activeBoard.items, newDoor] });
    setSelectedItemId(newDoor.id);
  };

  // Thêm nội thất từ Catalog
  const handleAddFurnitureFromCatalog = (product: CatalogProduct) => {
    if (!activeBoard) return;
    const newItem: GardenFurnitureItem = {
      id: 'furn-' + Date.now(),
      type: 'garden_item',
      category: 'interior',
      symbolId: product.id.includes('sofa') ? 'living_sofa' : product.id.includes('bed') ? 'bed_double' : product.id.includes('wardrobe') ? 'walk_in_closet' : product.id.includes('bath') ? 'double_vanity' : product.id.includes('dining') ? 'dining_table' : 'indoor_potted_palm',
      label: product.name,
      x: 300,
      y: 300,
      width: metersToPx(product.width),
      height: metersToPx(product.depth),
      height3D: product.height,
      color: product.defaultColor,
      zIndex: activeBoard.items.length + 1
    };
    handleUpdateBoard({ ...activeBoard, items: [...activeBoard.items, newItem] });
    setSelectedItemId(newItem.id);
  };

  // Áp dụng vật liệu PBR
  const handleSelectMaterial = (material: PBRMaterialDef) => {
    setActiveMaterialId(material.id);
    if (selectedItemId && activeBoard) {
      const updatedItems = activeBoard.items.map(item => {
        if (item.id === selectedItemId) {
          return { ...item, color: material.color };
        }
        return item;
      });
      handleUpdateBoard({ ...activeBoard, items: updatedItems });
    }
  };

  // Cập nhật hoặc Xóa item từ Properties Panel
  const handleUpdateItem = (updatedItem: BoardItem) => {
    if (!activeBoard) return;
    const updated = activeBoard.items.map(i => i.id === updatedItem.id ? updatedItem : i);
    handleUpdateBoard({ ...activeBoard, items: updated });
  };

  const handleDeleteItem = (id: string) => {
    if (!activeBoard) return;
    const updated = activeBoard.items.filter(i => i.id !== id);
    handleUpdateBoard({ ...activeBoard, items: updated });
    setSelectedItemId(null);
  };

  // Thực thi câu lệnh tự nhiên AI Command Bar
  const handleExecuteAICommand = async (prompt: string) => {
    if (!activeBoard) return;
    setIsAIProcessing(true);
    try {
      const result = await processUserPrompt(prompt, activeBoard, aiConfig);
      if (result.type === 'create_house_garden' || result.type === 'create_land_plot') {
        const newBoard = result.payload.board;
        const updated = [newBoard, ...boards.filter(b => b.id !== newBoard.id)];
        saveBoards(updated);
        setActiveBoardId(newBoard.id);
      } else if (result.type === 'switch_view_3d') {
        setViewMode('3d');
      } else if (result.type === 'switch_view_2d') {
        setViewMode('2d');
      } else if (result.type === 'open_cost_estimator') {
        setShowCostEstimatorModal(true);
      } else if (result.type === 'add_item') {
        const sym = result.payload.symbolId;
        const newItem: GardenFurnitureItem = {
          id: 'ai-item-' + Date.now(),
          type: 'garden_item',
          category: 'interior',
          symbolId: sym,
          label: result.payload.label,
          x: 350,
          y: 350,
          width: 140,
          height: 100,
          height3D: 0.85,
          zIndex: activeBoard.items.length + 1
        };
        handleUpdateBoard({ ...activeBoard, items: [...activeBoard.items, newItem] });
      }
    } catch (e) {
      console.error('Lỗi khi thực thi lệnh AI:', e);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Áp dụng mẫu nhà từ Modal
  const handleApplyTemplate = (createBoardFn: () => Board) => {
    const newBoard = createBoardFn();
    const updated = [newBoard, ...boards];
    saveBoards(updated);
    setActiveBoardId(newBoard.id);
    setShowTemplatesModal(false);
  };

  // Xuất file
  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${activeBoard?.name || 'ThietKeNha'}_BanVe.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleExportJSON = () => {
    if (!activeBoard) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeBoard, null, 2));
    const link = document.createElement('a');
    link.download = `${activeBoard.name}.json`;
    link.href = dataStr;
    link.click();
  };

  const selectedItem = activeBoard?.items.find(i => i.id === selectedItemId) || null;

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden select-none bg-slate-900 font-sans text-slate-800">
      {/* 1. THANH TOP NAVIGATION HEADER CHUẨN CÔNG NGHIỆP */}
      <TopNavHeader
        projectName={activeBoard?.name || 'Dự Án Thiết Kế'}
        onRenameProject={(newName) => activeBoard && handleUpdateBoard({ ...activeBoard, name: newName })}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNewProject={() => {
          const fresh = createLandPlotBoard(10, 20, 'Dự Án Mới 10m x 20m');
          saveBoards([fresh, ...boards]);
          setActiveBoardId(fresh.id);
        }}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onSaveProject={handleExportJSON}
        onOpenAICopilot={() => {}}
        onOpenAIRenderStudio={() => setShowAIRenderStudioModal(true)}
        onOpenCostEstimator={() => setShowCostEstimatorModal(true)}
        onExportDXF={() => activeBoard && downloadAutoCADDXF(activeBoard)}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
      />

      {/* 2. KHÔNG GIAN LÀM VIỆC CHÍNH 3 CỘT (LEFT SIDEBAR - CENTER VIEWPORT - RIGHT PROPERTIES) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Cột Trái: Catalog Nội Thất & Kiến Trúc */}
        <LeftSidebarCatalog
          onAddWall={handleAddWall}
          onAddDoorWindow={handleAddDoorWindow}
          onAddFurniture={handleAddFurnitureFromCatalog}
          onSelectMaterial={handleSelectMaterial}
          activeMaterialId={activeMaterialId}
        />

        {/* Cột Giữa: Canvas Viewport (2D Mặt Bằng hoặc 3D WebGL Three.js) */}
        <main className="flex-1 h-full relative overflow-hidden bg-slate-900">
          {viewMode === '3d' ? (
            <ThreeViewport3D
              board={activeBoard}
              onExit3D={() => setViewMode('2d')}
              onOpenAIRenderStudio={() => setShowAIRenderStudioModal(true)}
            />
          ) : (
            <BoardCanvas
              board={activeBoard}
              isDrawingMode={isDrawingMode}
              penSettings={penSettings}
              shapesMenuOpen={shapesMenuOpen}
              onUpdateBoard={handleUpdateBoard}
              onAddSticky={() => {}}
              onAddTextBox={() => {}}
              onAddTable={() => {}}
              onAddAttachment={() => {}}
              onAddShape={() => {}}
              onDeleteSelected={() => selectedItemId && handleDeleteItem(selectedItemId)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < historyStack.length - 1}
              onGoBack={() => {}}
              onChangePenSettings={setPenSettings}
            />
          )}

          {/* Thanh nhập lệnh AI Command Bar đáy màn hình */}
          <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
            <AICommandBar
              onExecuteCommand={handleExecuteAICommand}
              isLoading={isAIProcessing}
            />
          </div>
        </main>

        {/* Cột Phải: Bảng Thuộc Tính Đối Tượng (Khi chọn 1 item) */}
        {selectedItem && (
          <RightPropertiesPanel
            selectedItem={selectedItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onClose={() => setSelectedItemId(null)}
          />
        )}
      </div>

      {/* 3. MODALS HỆ THỐNG */}
      {/* Modal 1: 50 Mẫu Nhà Bản Quyền */}
      <AnimatePresence>
        {showTemplatesModal && (
          <HouseTemplatesModal
            onClose={() => setShowTemplatesModal(false)}
            onApplyTemplate={handleApplyTemplate}
          />
        )}
      </AnimatePresence>

      {/* Modal 2: Bảng Thống Kê Khối Lượng & Dự Toán BOQ */}
      <AnimatePresence>
        {showCostEstimatorModal && activeBoard && (
          <CostEstimateModal
            board={activeBoard}
            onClose={() => setShowCostEstimatorModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal 3: AI 3D Render Studio 4K */}
      <AnimatePresence>
        {showAIRenderStudioModal && activeBoard && (
          <AIRenderStudioModal
            board={activeBoard}
            onClose={() => setShowAIRenderStudioModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Modal 4: AI Vision Quét Ảnh */}
      <AnimatePresence>
        {showAIVisionModal && (
          <AIVisionModal
            aiConfig={aiConfig}
            onClose={() => setShowAIVisionModal(false)}
            onApplyAnalyzedBoard={(newBoard) => {
              const updated = [newBoard, ...boards];
              saveBoards(updated);
              setActiveBoardId(newBoard.id);
              setShowAIVisionModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal 5: Trung Tâm Đa Tài Khoản AI */}
      <AnimatePresence>
        {showAIAccountModal && (
          <AIAccountModal
            currentConfig={aiConfig}
            onClose={() => setShowAIAccountModal(false)}
            onSaveConfig={(cfg) => {
              setAiConfig(cfg);
              localStorage.setItem('ai_auth_config', JSON.stringify(cfg));
              setShowAIAccountModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Trợ Lý AI Copilot Giọng Nói & Chat Đồng Bộ */}
      <AICopilotDrawer
        currentBoard={activeBoard}
        aiConfig={aiConfig}
        onOpenAccountModal={() => setShowAIAccountModal(true)}
        onApplyNewBoard={(newBoard) => {
          const updated = [newBoard, ...boards];
          saveBoards(updated);
          setActiveBoardId(newBoard.id);
        }}
        onAddGardenItem={(sym) => {
          const newItem: GardenFurnitureItem = {
            id: 'copilot-item-' + Date.now(),
            type: 'garden_item',
            category: 'interior',
            symbolId: sym,
            x: 350,
            y: 350,
            width: 140,
            height: 100,
            height3D: 0.85,
            zIndex: activeBoard.items.length + 1
          };
          handleUpdateBoard({ ...activeBoard, items: [...activeBoard.items, newItem] });
        }}
        onSwitchViewMode={setViewMode}
        onOpenCostEstimator={() => setShowCostEstimatorModal(true)}
      />
    </div>
  );
}
