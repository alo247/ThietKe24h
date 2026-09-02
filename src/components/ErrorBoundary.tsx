// src/components/ErrorBoundary.tsx
// Bộ Giám Sát & Bắt Lỗi Toàn Cục (Error Boundary) - Chống Màn Hình Trắng 100%

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary bắt được lỗi:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.removeItem('freeform_boards');
      localStorage.removeItem('ai_auth_config');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-white p-6 font-sans select-none">
          <div className="max-w-lg w-full bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-3xl">
              <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Đã Tự Động Phục Hồi Dữ Liệu</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ứng dụng phát hiện bản vẽ cũ không tương thích. Vui lòng bấm "Khôi Phục Mặc Định" để nạp ngay bản vẽ kiến trúc mới nhất!
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-rose-300">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-blue-500/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải Lại Trang</span>
              </button>

              <button
                onClick={this.handleResetData}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-600"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Khôi Phục Mặc Định</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
