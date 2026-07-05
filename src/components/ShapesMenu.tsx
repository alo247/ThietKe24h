import React, { useState, useMemo } from 'react';
import { SHAPES_DATA, ShapeDefinition } from '../data/initialShapes';
import { ShapeCategory, ShapeType } from '../types';
import { Search, X, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface ShapesMenuProps {
  onSelectShape: (shapeType: ShapeType) => void;
  onClose: () => void;
}

export default function ShapesMenu({ onSelectShape, onClose }: ShapesMenuProps) {
  const [activeCategory, setActiveCategory] = useState<ShapeCategory>('suggested');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories list for tabs
  const categories: { key: ShapeCategory; label: string }[] = [
    { key: 'suggested', label: 'Gợi ý' },
    { key: 'basic', label: 'Cơ bản' },
    { key: 'geometry', label: 'Hình học' },
    { key: 'objects', label: 'Đồ vật' }
  ];

  // Combined searchable list of shapes
  const filteredShapes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return SHAPES_DATA[activeCategory];
    }
    
    // Search across all shapes if searching
    const allUniqueShapes = new Map<ShapeType, ShapeDefinition>();
    Object.values(SHAPES_DATA).forEach((categoryList) => {
      categoryList.forEach((shape) => {
        allUniqueShapes.set(shape.type, shape);
      });
    });

    return Array.from(allUniqueShapes.values()).filter(
      (shape) =>
        shape.name.toLowerCase().includes(q) ||
        shape.vietnameseName.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-[520px] max-h-[85vh] w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Hình</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow shadow-blue-500/10"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Menu - Screenshot 7 & 8 */}
      <div className="px-4 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              setSearchQuery(''); // Clear search on tab switch
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeCategory === cat.key && !searchQuery
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/10'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shapes Grid Container */}
      <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
        {filteredShapes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
            <span>Không tìm thấy hình phù hợp</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredShapes.map((shape, index) => {
              const isLineOrArrow = shape.type === 'line' || shape.type === 'arrow';
              return (
                <button
                  key={`${shape.type}-${index}`}
                  onClick={() => onSelectShape(shape.type)}
                  className="flex flex-col items-center justify-center aspect-square bg-white border border-slate-100 rounded-2xl p-3 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                >
                  {/* SVG Shape preview */}
                  <div className="flex-1 w-full flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-12 h-12 text-blue-500 group-hover:scale-105 transition-transform duration-200"
                    >
                      {isLineOrArrow ? (
                        <path
                          d={shape.path}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d={shape.path}
                          fill="currentColor"
                          fillRule="evenodd"
                          className="opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </svg>
                  </div>
                  {/* Title */}
                  <span className="text-[10px] text-slate-500 text-center truncate w-full mt-2 font-medium">
                    {shape.vietnameseName}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Input Bar at bottom - Screenshot 7 & 8 */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 hover:bg-slate-200/60 focus:bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
