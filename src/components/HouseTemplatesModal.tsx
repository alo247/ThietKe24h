// src/components/HouseTemplatesModal.tsx
// Trung tâm Thư Viện 50 Mẫu Thiết Kế Nhà & Sân Vườn Cao Cấp

import React, { useState, useMemo } from 'react';
import { HOUSE_TEMPLATES, HouseTemplate } from '../data/houseTemplates';
import { Board } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Sparkles, Building, Home, Trees, Layers, Filter } from 'lucide-react';

interface HouseTemplatesModalProps {
  onClose: () => void;
  onApplyTemplate: (createBoard: () => Board) => void;
}

export default function HouseTemplatesModal({ onClose, onApplyTemplate }: HouseTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'penthouse' | 'villa' | 'townhouse' | 'apartment' | 'resort'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc danh sách theo danh mục và tìm kiếm
  const filteredTemplates = useMemo(() => {
    return HOUSE_TEMPLATES.filter(tmpl => {
      const matchCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        tmpl.name.toLowerCase().includes(q) || 
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: 'Tất cả (50 Mẫu)', icon: '✨' },
    { id: 'penthouse', label: 'Penthouse & Duplex (10)', icon: '🏢' },
    { id: 'villa', label: 'Biệt Thự & Villa (10)', icon: '🌴' },
    { id: 'townhouse', label: 'Nhà Phố & Nhà Ống (10)', icon: '🏡' },
    { id: 'apartment', label: 'Căn Hộ & Studio (10)', icon: '🛋️' },
    { id: 'resort', label: 'Nghỉ Dưỡng & Homestay (10)', icon: '🏕️' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl max-w-5xl w-full border border-slate-100 max-h-[92vh] flex flex-col space-y-4"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
              🏡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Thư Viện 50 Mẫu Thiết Kế Nhà Cao Cấp</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  50 Mẫu Bản Quyền
                </span>
              </div>
              <p className="text-xs text-slate-500">Mặt bằng 2D & Phối cảnh 3D cắt lớp hoàn chỉnh chuẩn thi công</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tìm kiếm & Tabs lọc */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Tabs Danh Mục */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Input Tìm Kiếm */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, phong cách, số phòng..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Lưới 50 Mẫu Nhà */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar min-h-0">
          {filteredTemplates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="text-4xl">🔍</div>
              <p className="text-sm font-semibold">Không tìm thấy mẫu nhà phù hợp với từ khóa "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTemplates.map((tmpl) => (
                <div 
                  key={tmpl.id}
                  className="border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-500 hover:shadow-lg transition group bg-slate-50/50 hover:bg-white space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        {tmpl.category === 'penthouse' ? '🏢' : tmpl.category === 'villa' ? '🌴' : tmpl.category === 'townhouse' ? '🏡' : tmpl.category === 'apartment' ? '🛋️' : '🏕️'}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full font-mono">
                        {tmpl.landSize}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition leading-snug">
                      {tmpl.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tmpl.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyTemplate(tmpl.createBoard)}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>Triển Khai Mẫu Này</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
