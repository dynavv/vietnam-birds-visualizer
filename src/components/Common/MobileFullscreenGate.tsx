import React, { useState, useEffect } from 'react';
import { Feather, Monitor, Copy, Check } from 'lucide-react';

export interface MobileFullscreenGateProps {
  className?: string;
  forceShowForTesting?: boolean;
}

/**
 * Hàm nhận diện thiết bị di động & máy tính bảng chính xác 100%
 * (Dựa trên User-Agent, Client Hints và Touch Pointer)
 */
export function isMobileOrTabletDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  // 1. Kiểm tra Client Hints API (Chrome / Edge / Android)
  if ((navigator as unknown as { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile === true) {
    return true;
  }

  // 2. Kiểm tra chuỗi User-Agent hệ điều hành di động
  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Silk/i;
  if (mobileRegex.test(ua)) {
    return true;
  }

  // 3. Kiểm tra cảm ứng touch ngón tay kết hợp màn hình thực tế
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isCoarsePointer = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (hasTouch && isCoarsePointer && window.innerWidth <= 820) {
    return true;
  }

  return false;
}

export const MobileFullscreenGate: React.FC<MobileFullscreenGateProps> = ({
  className = '',
  forceShowForTesting
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (forceShowForTesting !== undefined) return forceShowForTesting;
    return false;
  });
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (forceShowForTesting !== undefined) {
      setIsMobile(forceShowForTesting);
      return;
    }
    setIsMobile(isMobileOrTabletDevice());
  }, [forceShowForTesting]);

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

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#FAF8F5] flex flex-col justify-between p-6 overflow-y-auto text-ink-900 font-sans ${className}`}
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

          <p className="text-xs leading-relaxed text-ink-700 font-sans text-center">
            Hệ thống trực quan hóa bảo tàng yêu cầu không gian màn hình lớn để hiển thị trọn vẹn độ phân giải và trải nghiệm tương tác trực quan.
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
