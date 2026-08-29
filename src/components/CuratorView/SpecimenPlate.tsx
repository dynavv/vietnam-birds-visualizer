import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Feather,
  Sparkles,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import type { BirdSpecies } from '../../types/bird';
import { AudioVoiceButton } from '../Common/AudioVoiceButton';
import { EndemicBadge } from '../Common/EndemicBadge';
import { BirdPlateImage } from '../Common/BirdPlateImage';

export interface SpecimenPlateProps {
  species?: BirdSpecies | null;
  className?: string;
  plateNumber?: string;
  onInspect?: () => void;
}

export const SpecimenPlate: React.FC<SpecimenPlateProps> = ({
  species,
  className = '',
  plateNumber,
  onInspect
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0
  });

  // Reset image error when species changes
  useEffect(() => {
    setImageError(false);
  }, [species?.id, species?.illustration?.imageUrl]);

  // Handle ESC key to close Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
      }
    };

    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  const handleOpenLightbox = useCallback(() => {
    setIsLightboxOpen(true);
    setZoomScale(1.25);
    setPanOffset({ x: 0, y: 0 });
    if (onInspect) onInspect();
  }, [onInspect]);

  const handleCloseLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale((prev) => Math.max(prev - 0.5, 1));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Lightbox Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setPanOffset({
      x: dragStartRef.current.initialPanX + deltaX,
      y: dragStartRef.current.initialPanY + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!species) {
    return (
      <div
        className={`bg-paper-100/90 border-2 border-paper-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[380px] shadow-paper-card ${className}`}
        data-testid="specimen-plate-empty"
      >
        <div className="w-16 h-16 rounded-full bg-paper-200/80 border border-paper-border flex items-center justify-center text-ink-500">
          <ImageIcon className="w-8 h-8 text-natural-moss/60" />
        </div>
        <p className="font-serif text-lg font-bold text-ink-900">
          Chưa chọn bản tranh mẫu vật
        </p>
        <p className="text-xs text-ink-600 max-w-sm">
          Vui lòng chọn một loài chim từ danh sách hoặc cây phân loại để chiêm ngưỡng bản vẽ khắc họa điểu học lưu trữ.
        </p>
      </div>
    );
  }

  const derivedPlateNumber =
    plateNumber ||
    `TAB. ${species.id.substring(0, 3).toUpperCase()}-${Math.abs(
      species.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 99 + 1
    )
      .toString()
      .padStart(2, '0')}`;

  const artist = species.illustration?.artist || 'iNaturalist & Wildlife Photographers';
  const sourceBook =
    species.illustration?.sourceBook || "iNaturalist Open Biodiversity Repository";

  return (
    <>
      <article
        className={`bg-paper-100/95 border-[3px] border-paper-300 rounded-2xl p-3.5 sm:p-5 shadow-natural relative overflow-hidden transition-all duration-300 ${className}`}
        data-testid="specimen-plate"
        aria-label={`Bản tranh mẫu vật giám tuyển loài ${species.vietnameseName}`}
      >
        {/* Double-Lined Archival Mat & Frame */}
        <div className="border-2 border-paper-400/70 p-3 sm:p-4 rounded-xl bg-paper-200/30 relative">
          {/* Corner Flourish Accents */}
          <span className="absolute -top-1.5 -left-1.5 text-natural-moss text-xs font-serif select-none" aria-hidden="true">✦</span>
          <span className="absolute -top-1.5 -right-1.5 text-natural-moss text-xs font-serif select-none" aria-hidden="true">✦</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-natural-moss text-xs font-serif select-none" aria-hidden="true">✦</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-natural-moss text-xs font-serif select-none" aria-hidden="true">✦</span>

          {/* Top Plate Header & Controls */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-paper-300/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold tracking-widest text-natural-bark uppercase bg-paper-100 px-2 py-0.5 rounded border border-paper-border">
                {derivedPlateNumber}
              </span>
              <span className="hidden sm:inline text-[11px] font-serif italic text-ink-600">
                Naturalist Archive of Vietnam
              </span>
              {species.isEndemic && <EndemicBadge size="sm" />}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenLightbox}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-paper-100 hover:bg-natural-moss/10 text-ink-700 hover:text-natural-moss border border-paper-border text-xs font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-natural-moss/30"
                title="Soi chi tiết từng nét vẽ & sợi lông (Zoom Inspection Lightbox)"
                aria-label="Soi chi tiết tranh vẽ"
              >
                <ZoomIn className="w-3.5 h-3.5 text-natural-terracotta" />
                <span className="hidden sm:inline">Soi chi tiết</span>
              </button>

              <AudioVoiceButton
                audioInfo={species.audioCall}
                birdName={species.vietnameseName}
                variant="pill"
                size="sm"
              />
            </div>
          </div>

          {/* Main Artwork Display Window */}
          <div
            onClick={handleOpenLightbox}
            className="group relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden bg-paper-300/50 border border-paper-300 cursor-zoom-in flex items-center justify-center shadow-inner"
            title="Nhấp để mở kính lúp soi chi tiết nét cọ và bộ lông"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenLightbox();
              }
            }}
          >
            <BirdPlateImage
              species={species}
              aspectRatio="cover"
              className="w-full h-full"
              imageClassName="w-full h-full object-contain sm:object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Hover Floating Inspection Badge */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-paper-100/95 backdrop-blur-sm border border-paper-border text-ink-800 px-2.5 py-1 rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5 pointer-events-none z-20">
              <Maximize2 className="w-3.5 h-3.5 text-natural-moss" />
              <span>Phóng to quan sát</span>
            </div>

            {/* Archival Museum Seal Stamp in Corner */}
            <div className="absolute top-3 left-3 bg-paper-100/85 backdrop-blur-xs border border-paper-border px-2 py-0.5 rounded text-[9px] font-mono tracking-wider text-ink-600 uppercase select-none pointer-events-none z-20">
              ★ INDOCHINA SPECIMEN
            </div>
          </div>

          {/* Archival Inscription Plate Footer */}
          <div className="mt-3.5 pt-3 border-t border-paper-300/80 text-center space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 tracking-tight">
              {species.vietnameseName}
            </h2>

            <p className="font-serif text-xs sm:text-sm italic text-natural-forest">
              {species.scientificName}
              <span className="font-sans not-italic text-ink-600 font-medium ml-2">
                • {species.englishName}
              </span>
            </p>

            <div className="pt-1 text-[11px] text-ink-600 flex items-center justify-center gap-2 flex-wrap">
              {(!species.illustration?.license && !species.illustration?.observationUrl && !artist.includes('(c)')) ? (
                <span className="italic font-serif">{artist} ad nat. del.</span>
              ) : (
                <span className="font-sans text-[11px] font-medium text-ink-700 inline-flex items-center gap-1.5 flex-wrap justify-center">
                  <span>{artist}</span>
                  {species.illustration?.license && (
                    <span className="px-1.5 py-0.2 rounded bg-paper-200 border border-paper-border text-[9px] font-mono text-ink-600">
                      {species.illustration.license}
                    </span>
                  )}
                  {species.illustration?.observationUrl && (
                    <a
                      href={species.illustration.observationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-natural-moss hover:text-stone-900 inline-flex items-center gap-0.5 text-[10px] underline ml-1"
                      title="Xem quan sát gốc trên iNaturalist"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>iNaturalist ↗</span>
                    </a>
                  )}
                </span>
              )}
              {species.illustration?.photoLocation && (
                <>
                  <span className="text-ink-400">•</span>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-sans font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 whitespace-nowrap shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>📍 Chụp tại: {species.illustration.photoLocation}</span>
                  </span>
                </>
              )}
              {sourceBook && !sourceBook.toLowerCase().includes('inaturalist') && (
                <>
                  <span className="text-ink-400">•</span>
                  <span className="font-sans text-[10px] text-ink-500 font-medium tracking-tight">
                    {sourceBook}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* High-Resolution Zoom Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Soi chi tiết bản vẽ mẫu vật"
          data-testid="specimen-lightbox"
          onClick={handleCloseLightbox}
        >
          {/* Lightbox Header Bar */}
          <div
            className="flex items-center justify-between gap-4 bg-paper-100/95 border border-paper-border px-4 py-2.5 rounded-xl shadow-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 bg-natural-moss/10 rounded-lg text-natural-moss flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-sm sm:text-base text-ink-900 truncate">
                  {species.vietnameseName} — <span className="italic text-natural-forest">{species.scientificName}</span>
                </h3>
                <p className="text-[11px] font-sans text-ink-600 truncate">
                  {artist} • {sourceBook}
                </p>
              </div>
            </div>

            {/* Lightbox Zoom Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 disabled:opacity-40 transition-all"
                title="Thu nhỏ (-)"
                aria-label="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs font-semibold text-ink-700 px-2 min-w-[48px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                className="p-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 disabled:opacity-40 transition-all"
                title="Phóng to (+)"
                aria-label="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 transition-all"
                title="Khôi phục kích thước chuẩn"
                aria-label="Khôi phục kích thước"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-paper-300 mx-1" />

              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-1.5 rounded-lg bg-paper-200 hover:bg-red-100 hover:text-red-700 text-ink-800 transition-all"
                title="Đóng (ESC)"
                aria-label="Đóng kính lúp"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Zoom / Pan Viewport */}
          <div
            className={`flex-1 flex items-center justify-center overflow-hidden my-4 relative ${
              zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div
              className="transition-transform duration-100 ease-out max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`
              }}
            >
              {!imageError && species.illustration?.imageUrl ? (
                <img
                  src={species.illustration.imageUrl}
                  alt={`Bản phóng to ${species.vietnameseName}`}
                  className="max-w-[85vw] max-h-[70vh] object-contain rounded-lg shadow-2xl border-4 border-paper-200"
                  draggable={false}
                />
              ) : (
                <div className="p-12 bg-paper-100 rounded-2xl text-center text-ink-600 space-y-2">
                  <Feather className="w-16 h-16 mx-auto text-natural-moss/60" />
                  <p className="font-serif text-lg">Bản vẽ lưu trữ độ phân giải cao</p>
                </div>
              )}
            </div>
          </div>

          {/* Lightbox Footer Instruction Bar */}
          <div
            className="flex items-center justify-between text-xs text-paper-200 px-4 py-1.5 bg-black/40 rounded-lg mx-auto max-w-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <span>💡 Cuộn hoặc kéo chuột để di chuyển khi phóng to</span>
            <span className="font-mono text-paper-300">Nhấn ESC để đóng</span>
          </div>
        </div>
      )}
    </>
  );
};

export default SpecimenPlate;
