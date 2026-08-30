import React, { useState } from 'react';
import { Feather, Monitor, Copy, Check, Sparkles } from 'lucide-react';

export interface MobileFullscreenGateProps {
  className?: string;
}

export const MobileFullscreenGate: React.FC<MobileFullscreenGateProps> = ({
  className = ''
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://avifaunavn.ai.studio';
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`lg:hidden fixed inset-0 z-[9999] bg-[#FAF8F5] flex flex-col justify-between p-6 overflow-y-auto text-ink-900 font-sans ${className}`}
      data-testid="mobile-fullscreen-gate"
    >
      {/* Top Header: Museum Brand */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="p-3 bg-natural-moss/10 rounded-2xl text-natural-moss border border-natural-moss/20 shadow-sm mb-3">
          <Feather className="w-8 h-8 transform -rotate-12" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-ink-900 tracking-wide">
          Avifauna of Vietnam
        </h1>
        <p className="text-xs text-ink-600 font-sans uppercase tracking-wider font-semibold mt-1">
          Bảo tàng &amp; Phân loại học Chim Việt Nam
        </p>
      </div>

      {/* Center Hero Card: Desktop Notice */}
      <div className="my-auto py-6 max-w-sm mx-auto w-full">
        <div className="bg-paper-100/90 border-2 border-paper-border rounded-3xl p-6 shadow-xl text-center space-y-4 relative overflow-hidden">
          {/* Subtle gold accent decoration */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-natural-forest to-natural-moss text-paper-50 shadow-md flex items-center justify-center">
            <Monitor className="w-8 h-8 text-amber-300" />
          </div>

          <div>
            <h2 className="text-lg font-serif font-bold text-ink-900 leading-snug">
              Vui lòng truy cập trên Máy tính (Desktop / Laptop)
            </h2>
          </div>

          <p className="text-xs leading-relaxed text-ink-700 font-sans text-justify">
            Hệ thống trực quan hóa bảo tàng đa tầng (Bản đồ GIS 6 Vùng EBA, Cây Phả Hệ D3.js &amp; Cẩm Nang Giám Tuyển) yêu cầu không gian màn hình lớn để hiển thị trọn vẹn độ phân giải và tương tác phả hệ học.
          </p>

          <div className="p-3 bg-natural-moss/5 rounded-xl border border-natural-moss/15 text-[11.5px] text-natural-forest font-medium">
            📱 Phiên bản tối ưu chuyên sâu cho thiết bị di động sẽ sớm được cập nhật trong tương lai!
          </div>

          {/* Copy Link Button to open on Computer */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-natural-forest hover:bg-natural-moss text-paper-50 font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Đã sao chép liên kết!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-300" />
                <span>Sao chép liên kết để mở trên máy tính</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="text-center text-[11px] text-ink-500 pb-2">
        <p>Avifauna of Vietnam © 2026 — Dự án Giáo dục &amp; Lưu trữ Số Đa dạng Sinh học</p>
        <p className="text-[10px] text-ink-400 mt-0.5">Google AI Studio • Build with Google AI</p>
      </footer>
    </div>
  );
};

export default MobileFullscreenGate;
