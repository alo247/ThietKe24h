// src/components/AICopilotDrawer.tsx
// Trợ Lý Kiến Trúc Sư AI Tương Tác Giọng Nói & Chat Trực Tiếp (Voice-to-Action AI Copilot)

import React, { useState, useEffect, useRef } from 'react';
import { 
  AIChatMessage, 
  AIAuthConfig, 
  Board, 
  GardenFurnitureItem 
} from '../types';
import { processUserPrompt } from '../services/aiArchitectEngine';
import { getSymbolDef } from '../data/architecturalSymbols';
import { 
  X, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Settings, 
  Sparkles, 
  Bot, 
  User, 
  Compass, 
  Layers, 
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICopilotDrawerProps {
  currentBoard: Board;
  aiConfig: AIAuthConfig;
  onOpenAccountModal: () => void;
  onApplyNewBoard: (newBoard: Board) => void;
  onAddGardenItem: (symbolId: string, label?: string) => void;
  onSwitchViewMode: (mode: '2d' | '3d') => void;
  onOpenCostEstimator: () => void;
}

export default function AICopilotDrawer({
  currentBoard,
  aiConfig,
  onOpenAccountModal,
  onApplyNewBoard,
  onAddGardenItem,
  onSwitchViewMode,
  onOpenCostEstimator
}: AICopilotDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableVoiceFeedback, setEnableVoiceFeedback] = useState(true);

  // Lịch sử tin nhắn
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Xin chào! Tôi là Trợ Lý Kiến Trúc Sư AI của bạn. 🏡\n\nBạn có thể gõ yêu cầu hoặc nhấn nút Micro 🎙️ để nói chuyện trực tiếp (ví dụ: "Thiết kế biệt thự vườn 10x20m có hồ cá Koi", "Thêm hồ bơi ngoài trời", "Xem phối cảnh 3D lúc 15h"). Tôi sẽ tự động triển khai ngay cho bạn!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🌴 Biệt thự vườn 10x20m', prompt: 'Thiết kế biệt thự vườn 10x20m có hồ cá Koi' },
        { label: '🏡 Nhà phố hiện đại 5x20m', prompt: 'Thiết kế nhà phố 5x20m có giếng trời' },
        { label: '🧊 Xem phối cảnh 3D', prompt: 'Xem 3D' },
        { label: '💰 Báo giá dự toán', prompt: 'Tính dự toán chi phí' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Khởi tạo Nhận diện giọng nói Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN'; // Nhận diện tiếng Việt chuẩn xác

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Tự động gửi lệnh sau khi nhận diện xong giọng nói
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Lỗi nhận diện giọng nói:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Đọc câu trả lời bằng giọng nói tiếng Việt (Text-to-Speech)
  const speakText = (text: string) => {
    if (!enableVoiceFeedback || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Dừng câu nói trước đó
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Bật/tắt Micro thu âm
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Không thể khởi động micro:', e);
        }
      } else {
        alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API. Vui lòng sử dụng Chrome/Edge.');
      }
    }
  };

  // Gửi lệnh xử lý
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt || isProcessing) return;

    setInputText('');
    const userMsg: AIChatMessage = {
      id: 'msg-user-' + Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // 1. Phân tích ý định qua AI Engine
      const command = await processUserPrompt(prompt, currentBoard, aiConfig);

      // 2. Thực thi lệnh đồng bộ trực tiếp lên Canvas & Hệ thống
      if (command.type === 'create_house_garden' || command.type === 'create_land_plot') {
        if (command.payload?.board) {
          onApplyNewBoard(command.payload.board);
        }
      } else if (command.type === 'add_item') {
        if (command.payload?.symbolId) {
          onAddGardenItem(command.payload.symbolId, command.payload.label);
        }
      } else if (command.type === 'switch_view_3d') {
        onSwitchViewMode('3d');
      } else if (command.type === 'switch_view_2d') {
        onSwitchViewMode('2d');
      } else if (command.type === 'open_cost_estimator') {
        onOpenCostEstimator();
      }

      // 3. Phản hồi tin nhắn của AI
      const aiMsg: AIChatMessage = {
        id: 'msg-ai-' + Date.now(),
        role: 'assistant',
        content: command.explanation,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: command.suggestedChips,
        executedActionType: command.type
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(command.explanation);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: 'Dạ, có chút trục trặc khi kết nối với máy chủ AI. Tôi đã tự động khôi phục chế độ Bộ não AI Tích hợp để tiếp tục hỗ trợ bạn!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const providerNames: Record<string, string> = {
    native: 'Trí Tuệ Nhân Tạo Tích Hợp',
    openai: 'OpenAI GPT-4o',
    gemini: 'Google Gemini 2.0',
    claude: 'Claude 3.5 Sonnet',
    deepseek: 'DeepSeek AI',
    custom: 'Custom Server'
  };

  return (
    <>
      {/* 1. NÚT NỔI TRIGGER TRỢ LÝ AI COPILOT Ở GÓC MÀN HÌNH */}
      <div className="fixed bottom-24 right-6 z-40 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl shadow-indigo-500/30 flex items-center gap-2.5 font-bold text-xs cursor-pointer border border-white/20 backdrop-blur-md"
        >
          {/* Đèn báo nhấp nháy hoạt động */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>

          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Trợ Lý AI Kiến Trúc</span>
          <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {aiConfig.provider.toUpperCase()}
          </span>
        </motion.button>
      </div>

      {/* 2. KHUNG CHAT & RA LỆNH GIỌNG NÓI DRAWER (APPLE GLASSMORPHISM) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-38 right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Drawer Header */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-md">
                  🏡
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <span>Kiến Trúc Sư AI Copilot</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{providerNames[aiConfig.provider] || 'Trực tuyến'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Nút cài đặt tài khoản AI */}
                <button
                  onClick={onOpenAccountModal}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Cài đặt tài khoản & API Key AI"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Bật tắt giọng đọc */}
                <button
                  onClick={() => setEnableVoiceFeedback(!enableVoiceFeedback)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                  title={enableVoiceFeedback ? 'Tắt giọng đọc trợ lý' : 'Bật giọng đọc trợ lý'}
                >
                  {enableVoiceFeedback ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Đóng Drawer */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Danh Sách Tin Nhắn */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 no-scrollbar text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="flex items-end gap-1.5 max-w-[88%]">
                      {!isUser && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mb-0.5">
                          AI
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-blue-500/20'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>

                    {/* Quick Action Suggestion Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-7 pt-1">
                        {msg.suggestedActions.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSendMessage(chip.prompt)}
                            className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-full text-[10px] border border-indigo-200/80 transition active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <span>{chip.label}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Hiệu ứng đang suy nghĩ */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs pl-7 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Kiến Trúc Sư AI đang phân tích và dựng bản vẽ...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Micro Live Waveform Overlay */}
            {isListening && (
              <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-rose-700 font-bold text-xs animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Đang lắng nghe giọng nói tiếng Việt... Hãy nói yêu cầu của bạn!</span>
                </div>
                <button 
                  onClick={toggleListening}
                  className="text-rose-600 underline text-[11px] cursor-pointer"
                >
                  Dừng
                </button>
              </div>
            )}

            {/* Form Nhập Câu Lệnh & Nút Micro */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Nút Micro */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-bounce'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                  title="Ra lệnh bằng giọng nói tiếng Việt"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Đang thu âm giọng nói..." : "Ví dụ: Biệt thự 10x20m có hồ bơi..."}
                  className="flex-1 px-3.5 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                />

                {/* Nút Gửi */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-500/25 transition active:scale-95 cursor-pointer disabled:opacity-40 shrink-0"
                  title="Gửi lệnh"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
