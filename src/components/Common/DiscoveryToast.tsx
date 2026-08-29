import React, { useEffect, useState } from "react";
import { Compass, Sparkles, Trophy, X } from "lucide-react";
import type { BirdSpecies } from "../../types/bird";

export interface DiscoveryToastProps {
  species: BirdSpecies | null;
  discoveredCount: number;
  totalCount: number;
  isNewDiscovery: boolean;
  onClose: () => void;
}

export const DiscoveryToast: React.FC<DiscoveryToastProps> = ({
  species,
  discoveredCount,
  totalCount,
  isNewDiscovery,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [species?.id, onClose]);

  if (!species) return null;

  const isAllDiscovered = discoveredCount >= totalCount;

  return (
    <aside
      role="status"
      aria-label="Thông báo khám phá loài mới"
      className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 pointer-events-auto ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
      }`}
      data-testid="discovery-toast"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-paper-50/98 backdrop-blur-md border-2 border-natural-amber/70 shadow-2xl max-w-md w-[92vw] sm:w-auto text-ink-900">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-natural-amber/20 to-natural-moss/20 border border-natural-amber/40 flex items-center justify-center text-natural-amber shrink-0 shadow-xs">
          {isAllDiscovered ? (
            <Trophy className="w-5 h-5 text-natural-ochre animate-bounce" />
          ) : isNewDiscovery ? (
            <Sparkles className="w-5 h-5 text-natural-amber" />
          ) : (
            <Compass className="w-5 h-5 text-natural-moss" />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-natural-bark">
              {isAllDiscovered
                ? "🏆 Thành Tựu Xuất Sắc!"
                : isNewDiscovery
                ? "✨ Đã Khám Phá Loài Mới!"
                : "🧭 Hồ Sơ Điểu Học"}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-natural-moss/10 text-natural-forest border border-natural-moss/20">
              {discoveredCount}/{totalCount}
            </span>
          </div>

          <p className="font-serif font-bold text-sm text-ink-900 truncate mt-0.5">
            {species.vietnameseName} <span className="font-sans font-normal text-xs text-ink-500 italic">({species.scientificName})</span>
          </p>

          <p className="text-[11px] text-ink-600 font-sans mt-0.5">
            {isAllDiscovered
              ? "Chúc mừng bạn đã mở khóa trọn vẹn 68/68 loài chim Việt Nam!"
              : "Tiếp tục khám phá để mở khóa toàn bộ các loài chim Việt Nam nhé! ✨"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          aria-label="Đóng thông báo"
          className="p-1 rounded-lg text-ink-400 hover:text-ink-800 hover:bg-paper-200/80 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
