import React, { useState } from 'react';
import { Board } from '../types';
import { 
  Folder, 
  Star, 
  Clock, 
  Grid as GridIcon, 
  List as ListIcon, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Copy, 
  Download, 
  Upload, 
  Heart,
  ChevronRight,
  Menu,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BoardsListProps {
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name?: string) => void;
  onRenameBoard: (boardId: string, newName: string) => void;
  onToggleFavorite: (boardId: string) => void;
  onDuplicateBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onImportBoards: (imported: Board[]) => void;
}

type TabType = 'all' | 'recents' | 'favorites';

export default function BoardsList({
  boards,
  onSelectBoard,
  onCreateBoard,
  onRenameBoard,
  onToggleFavorite,
  onDuplicateBoard,
  onDeleteBoard,
  onImportBoards
}: BoardsListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Automatically collapse sidebar on mobile screens on mount
  React.useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // File Upload trigger for Importing Boards
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportBoard = (board: Board) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(board, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${board.name || 'Untitled'}.freeform.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setActiveMenuId(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedBoards = Array.isArray(parsed) ? parsed : [parsed];
        
        // Basic schema check
        const validBoards = importedBoards.filter(b => b && typeof b === 'object' && b.id && b.name);
        if (validBoards.length > 0) {
          // Adjust IDs slightly to avoid collisions if necessary
          const prepared = validBoards.map(b => ({
            ...b,
            id: b.id + '-' + Date.now().toString().slice(-4),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          onImportBoards(prepared);
          alert(`Đã nhập thành công ${prepared.length} bảng!`);
        } else {
          alert('Tệp Freeform không đúng định dạng!');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp JSON!');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  // Filter and sort boards
  const filteredBoards = boards
    .filter(b => {
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === 'favorites') return b.isFavorite && matchSearch;
      return matchSearch;
    })
    .sort((a, b) => {
      if (activeTab === 'recents') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleStartRename = (board: Board) => {
    setRenamingId(board.id);
    setRenameText(board.name);
    setActiveMenuId(null);
  };

  const handleSaveRename = (boardId: string) => {
    if (renameText.trim()) {
      onRenameBoard(boardId, renameText.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Hidden file input for import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Backdrop overlay for mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Responsive: Sliding Drawer on Mobile, collapsible relative panel on Desktop */}
      <div 
        className={`${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
        } fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 transition-all duration-300 ease-in-out border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-100 shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                FF
              </div>
              <span className="font-semibold tracking-tight text-lg">Freeform Web</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-500 mx-auto flex items-center justify-center text-white font-bold text-sm shadow-md">
              FF
            </div>
          )}
        </div>

        {/* Categories Menu */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button
            onClick={() => handleTabClick('all')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'all' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Folder className={`w-5 h-5 ${activeTab === 'all' ? 'text-blue-500' : 'text-slate-400'}`} />
            {sidebarOpen && <span className="flex-1 text-left">Tất cả bảng</span>}
            {sidebarOpen && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{boards.length}</span>}
          </button>

          <button
            onClick={() => handleTabClick('recents')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'recents' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className={`w-5 h-5 ${activeTab === 'recents' ? 'text-blue-500' : 'text-slate-400'}`} />
            {sidebarOpen && <span className="flex-1 text-left">Gần đây</span>}
          </button>

          <button
            onClick={() => handleTabClick('favorites')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'favorites' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-5 h-5 ${activeTab === 'favorites' ? 'text-blue-500' : 'text-slate-400'}`} />
            {sidebarOpen && <span className="flex-1 text-left">Ưa thích</span>}
            {sidebarOpen && (
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                {boards.filter(b => b.isFavorite).length}
              </span>
            )}
          </button>
        </div>

        {/* Global actions at bottom of sidebar */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2 shrink-0">
            <button
              onClick={handleImportClick}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Nhập bảng (.json)
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 capitalize">
              {activeTab === 'all' && 'Tất cả bảng'}
              {activeTab === 'recents' && 'Bảng gần đây'}
              {activeTab === 'favorites' && 'Ưa thích'}
            </h1>
          </div>

          {/* Search bar & View switch & Create Board */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm bảng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 hover:bg-slate-200/70 focus:bg-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Layout switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid view"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Create Board button */}
            <button
              onClick={() => onCreateBoard()}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white pl-3 pr-4 py-1.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/10 transition hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Bảng mới</span>
            </button>
          </div>
        </header>

        {/* Small screen Search */}
        <div className="p-3 bg-white border-b border-slate-200 sm:hidden">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm bảng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Boards Grid or List container */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Không tìm thấy bảng nào</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Hãy tạo bảng mới hoặc điều chỉnh bộ lọc tìm kiếm của bạn.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              <AnimatePresence>
                {filteredBoards.map((board) => (
                  <motion.div
                    key={board.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col h-[240px]"
                  >
                    {/* Card Canvas Preview - displays dots and a mini preview of items */}
                    <div 
                      onClick={() => onSelectBoard(board.id)}
                      className="flex-1 bg-slate-50 border-b border-slate-100 relative cursor-pointer overflow-hidden p-4 group-hover:bg-slate-50/50 transition duration-300"
                    >
                      {/* Dotted background matching standard board */}
                      <div className="absolute inset-0 dots-grid opacity-20" style={{ backgroundSize: '12px 12px' }} />

                      {/* Mini Render of items for premium aesthetic */}
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="relative w-full h-full opacity-40 scale-75 overflow-hidden flex items-center justify-center pointer-events-none">
                          {board.items.length === 0 ? (
                            <div className="text-[10px] text-slate-300 font-mono">Bảng trống</div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1 w-full h-full items-center justify-center">
                              {board.items.slice(0, 4).map((item) => {
                                if (item.type === 'sticky') {
                                  const colorClass = 
                                    item.color === 'yellow' ? 'bg-yellow-200 border-yellow-300' :
                                    item.color === 'green' ? 'bg-green-200 border-green-300' :
                                    item.color === 'blue' ? 'bg-blue-200 border-blue-300' :
                                    item.color === 'pink' ? 'bg-pink-200 border-pink-300' :
                                    item.color === 'orange' ? 'bg-orange-200 border-orange-300' :
                                    item.color === 'purple' ? 'bg-purple-200 border-purple-300' : 'bg-slate-200';
                                  return (
                                    <div key={item.id} className={`w-8 h-8 rounded border p-1 text-[4px] leading-none overflow-hidden ${colorClass}`}>
                                      {item.text}
                                    </div>
                                  );
                                } else if (item.type === 'shape') {
                                  return (
                                    <div key={item.id} className="w-8 h-8 rounded border border-blue-300 bg-blue-100 flex items-center justify-center text-[5px] text-blue-500 capitalize">
                                      {item.shapeType.slice(0, 3)}
                                    </div>
                                  );
                                } else if (item.type === 'drawing') {
                                  return (
                                    <svg key={item.id} className="w-8 h-8 border border-slate-200 rounded bg-white" viewBox="0 0 100 100">
                                      <polyline
                                        fill="none"
                                        stroke={item.color || '#000'}
                                        strokeWidth="8"
                                        points={item.points.map(p => `${p.x % 100},${p.y % 100}`).join(' ')}
                                      />
                                    </svg>
                                  );
                                } else {
                                  return (
                                    <div key={item.id} className="w-8 h-8 bg-slate-100 border rounded flex items-center justify-center text-[5px]">
                                      📁 {item.type}
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Favorite Indicator Badge */}
                      {board.isFavorite && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur shadow-sm p-1.5 rounded-full text-yellow-500">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-4 bg-white flex flex-col shrink-0 relative">
                      {renamingId === board.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={renameText}
                            onChange={(e) => setRenameText(e.target.value)}
                            onBlur={() => handleSaveRename(board.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(board.id)}
                            autoFocus
                            className="flex-1 px-2 py-0.5 border border-blue-500 rounded text-sm font-semibold outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div 
                            onClick={() => onSelectBoard(board.id)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <h3 className="font-semibold text-sm truncate text-slate-900 group-hover:text-blue-600 transition">
                              {board.name || 'Không có tiêu đề'}
                            </h3>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              Cập nhật {new Date(board.updatedAt).toLocaleDateString('vi-VN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Quick Menu Button */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === board.id ? null : board.id);
                              }}
                              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === board.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <div className="absolute right-0 bottom-8 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-xs apple-shadow">
                                  <button
                                    onClick={() => handleStartRename(board)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                                    Đổi tên
                                  </button>
                                  <button
                                    onClick={() => {
                                      onToggleFavorite(board.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${board.isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
                                    {board.isFavorite ? 'Bỏ ưa thích' : 'Ưa thích'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      onDuplicateBoard(board.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    Nhân bản
                                  </button>
                                  <button
                                    onClick={() => handleExportBoard(board)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-400" />
                                    Xuất file (.json)
                                  </button>
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button
                                    onClick={() => {
                                      onDeleteBoard(board.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    Xóa bảng
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* List View */
            <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-3">Tên bảng</th>
                    <th className="px-6 py-3 hidden md:table-cell">Ngày chỉnh sửa</th>
                    <th className="px-6 py-3 hidden sm:table-cell">Số lượng đối tượng</th>
                    <th className="px-6 py-3 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredBoards.map((board) => (
                    <tr 
                      key={board.id}
                      className="hover:bg-slate-50/70 transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleFavorite(board.id)}
                            className="text-slate-300 hover:text-yellow-500 transition shrink-0"
                          >
                            <Star className={`w-4 h-4 ${board.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                          </button>
                          
                          {renamingId === board.id ? (
                            <input
                              type="text"
                              value={renameText}
                              onChange={(e) => setRenameText(e.target.value)}
                              onBlur={() => handleSaveRename(board.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(board.id)}
                              autoFocus
                              className="px-2 py-0.5 border border-blue-500 rounded text-sm font-semibold outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onClick={() => onSelectBoard(board.id)}
                              className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer truncate max-w-xs md:max-w-md block"
                            >
                              {board.name || 'Không có tiêu đề'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-slate-500">
                        {new Date(board.updatedAt).toLocaleDateString('vi-VN', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-slate-500">
                        {board.items.length} đối tượng
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === board.id ? null : board.id)}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {activeMenuId === board.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 top-6 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-xs apple-shadow">
                                <button
                                  onClick={() => handleStartRename(board)}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                                  Đổi tên
                                </button>
                                <button
                                  onClick={() => {
                                    onToggleFavorite(board.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${board.isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
                                  {board.isFavorite ? 'Bỏ ưa thích' : 'Ưa thích'}
                                </button>
                                <button
                                  onClick={() => {
                                    onDuplicateBoard(board.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  Nhân bản
                                </button>
                                <button
                                  onClick={() => handleExportBoard(board)}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                                >
                                  <Download className="w-3.5 h-3.5 text-slate-400" />
                                  Xuất file (.json)
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    onDeleteBoard(board.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  Xóa bảng
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
