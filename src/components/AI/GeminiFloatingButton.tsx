import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GeminiNaturalistModal, AITab } from './GeminiNaturalistModal';
import { hasGeminiApiKey } from '../../services/geminiService';

export interface GeminiFloatingButtonProps {
  className?: string;
}

export const GeminiFloatingButton: React.FC<GeminiFloatingButtonProps> = ({ className = '' }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [initialTab, setInitialTab] = useState<AITab>('chat');

  const openModal = (tab: AITab = 'chat') => {
    setInitialTab(tab);
    setModalOpen(true);
  };

  const isConfigured = hasGeminiApiKey();

  return (
    <>
      <div
        className={`fixed bottom-12 md:bottom-11 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-auto ${className}`}
        data-testid="gemini-floating-container"
      >
        <button
          type="button"
          onClick={() => openModal('chat')}
          aria-label="Mở Trợ lý Điểu học Avian AI"
          title="Trò chuyện & Nhận diện hình ảnh cùng Avian AI (Gemini 3.7 Flash)"
          className="group relative inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#163813] via-[#1F4E1B] to-[#2B6825] hover:from-[#122E10] hover:to-[#22551D] text-paper-50 shadow-lg hover:shadow-2xl hover:shadow-natural-moss/50 border border-emerald-400/50 hover:border-emerald-300 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
          data-testid="gemini-fab-button"
        >
          {/* Shimmer Ambient Sweep */}
          <span
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer-sweep pointer-events-none"
          />

          {/* Ambient Radiant Glow Ring (GPU Hardware Accelerated on Hover) */}
          <span className="absolute -inset-0.5 rounded-full bg-emerald-400/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 pointer-events-none" />

          {/* Sparkles Icon */}
          <Sparkles className="w-4 h-4 text-amber-300 drop-shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shrink-0" />

          {/* Button Text */}
          <span className="font-serif font-bold text-xs sm:text-sm tracking-wide text-paper-50 select-none">
            Avian AI
          </span>

          {/* Unconfigured Dot Badge */}
          {!isConfigured && (
            <span
              title="Chưa cấu hình API Key"
              className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-950 shrink-0 ml-0.5"
            />
          )}
        </button>
      </div>

      <GeminiNaturalistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={initialTab}
      />
    </>
  );
};

export default GeminiFloatingButton;
