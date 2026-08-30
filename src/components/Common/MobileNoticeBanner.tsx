import React, { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

export const STORAGE_KEY_MOBILE_NOTICE_DISMISSED = 'agy_avifauna_mobile_notice_dismissed';

export interface MobileNoticeBannerProps {
  className?: string;
}

export const MobileNoticeBanner: React.FC<MobileNoticeBannerProps> = ({
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const dismissed = window.sessionStorage.getItem(STORAGE_KEY_MOBILE_NOTICE_DISMISSED);
        if (!dismissed) {
          setIsDismissed(false);
        }
      } else {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(STORAGE_KEY_MOBILE_NOTICE_DISMISSED, 'true');
      }
    } catch {
      // Safe fallback
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Thông báo tối ưu hiển thị"
      className={`lg:hidden bg-gradient-to-r from-[#1B4317] via-[#245A20] to-[#1E4D1B] text-paper-50 px-3.5 py-2 text-xs border-b border-emerald-500/30 shadow-md flex items-center justify-between gap-2.5 z-50 shrink-0 select-none animate-fadeIn ${className}`}
      data-testid="mobile-notice-banner"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 rounded-md bg-amber-400/20 text-amber-300 shrink-0 flex items-center justify-center">
          <Monitor className="w-4 h-4" />
        </div>
        <p className="text-[11.5px] leading-tight text-paper-100 font-sans">
          <span className="font-bold text-amber-300">Khuyến nghị trải nghiệm:</span> Ứng dụng bản đồ GIS &amp; Phả hệ D3.js hiển thị tối ưu nhất trên <strong className="text-paper-50 underline decoration-amber-400 underline-offset-2">Máy tính (Desktop / Laptop)</strong>. Bản tối ưu di động sẽ sớm được cập nhật trong tương lai!
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        title="Đóng thông báo"
        aria-label="Đóng thông báo"
        className="p-1 rounded-md text-paper-200 hover:text-paper-50 hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};

export default MobileNoticeBanner;
