// src/components/AICommandBar.tsx
// Thanh nhập lệnh thiết kế tự nhiên AI trực quan dưới đáy màn hình (Hỗ trợ giọng nói & gõ lệnh tự động)

import React, { useState, useRef } from 'react';
import { Sparkles, Mic, MicOff, Send, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AICommandBarProps {
  onExecuteCommand: (prompt: string) => Promise<void>;
  isLoading?: boolean;
}

export default function AICommandBar({ onExecuteCommand, isLoading = false }: AICommandBarProps) {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    const currentPrompt = prompt.trim();
    setPrompt('');
    onExecuteCommand(currentPrompt);
  };

  // Nhận diện giọng nói Web Speech API (Tiếng Việt)
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API. Vui lòng gõ lệnh trực tiếp.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      setIsListening(false);
      onExecuteCommand(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const quickChips = [
    'Thiết kế nhà 8x13m, 4 phòng ngủ, 1 phòng khách, 1 phòng thờ, 2 WC riêng',
    'Penthouse Panorama chuẩn ảnh mẫu',
    'Thêm hồ bơi vô cực ngoài trời',
    'Xem phối cảnh 3D lúc 15h'
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2 pointer-events-auto">
      {/* Gợi ý câu lệnh nhanh (Quick Suggestion Chips) */}
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => { setPrompt(chip); onExecuteCommand(chip); }}
            className="px-3 py-1 bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200/80 rounded-full text-[11px] font-bold text-slate-700 hover:text-blue-600 transition shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="truncate max-w-[280px]">{chip}</span>
          </button>
        ))}
      </div>

      {/* Khung nhập lệnh chính phong cách Apple Pill */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-2xl p-1.5 pl-4 flex items-center gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ra lệnh bằng tiếng Việt: 'Thiết kế nhà 8x13m, 4 phòng ngủ, 1 khách, 1 thờ, 2 WC'..."
          className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
        />

        {/* Nút Micro Thu Âm */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2 rounded-full transition cursor-pointer shrink-0 ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
          }`}
          title={isListening ? 'Đang lắng nghe...' : 'Nói câu lệnh bằng giọng nói'}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Nút Gửi Lệnh */}
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer ${
            prompt.trim() && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Triển Khai</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
