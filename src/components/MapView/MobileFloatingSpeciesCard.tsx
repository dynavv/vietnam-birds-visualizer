import React, { useEffect } from 'react';
import { Bird, X, MapPin, Compass, Trees, ChevronRight } from 'lucide-react';
import type { BirdSpecies } from '../../types/bird';
import { BirdPlateImage } from '../Common/BirdPlateImage';
import { AudioVoiceButton } from '../Common/AudioVoiceButton';
import { audioManager } from '../../utils/audioManager';

export interface MobileFloatingSpeciesCardProps {
  species: BirdSpecies;
  onClose: () => void;
  onViewCurator?: () => void;
  className?: string;
}

export const MobileFloatingSpeciesCard: React.FC<MobileFloatingSpeciesCardProps> = ({
  species,
  onClose,
  onViewCurator,
  className = '',
}) => {
  useEffect(() => {
    return () => {
      audioManager.stop();
    };
  }, []);

  const handleClose = () => {
    audioManager.stop();
    onClose();
  };

  const handleOpenCurator = () => {
    audioManager.stop();
    onViewCurator?.();
  };

  return (
    <div
      className={`absolute top-3 left-3 right-3 z-30 pointer-events-auto md:hidden rounded-2xl border border-paper-border/80 shadow-2xl bg-paper-100/95 backdrop-blur-xl flex flex-col max-h-[min(52dvh,calc(100dvh-180px))] overflow-hidden ${className}`}
      data-testid="mobile-floating-species-card"
    >
      {/* 1. Header co dinh */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-paper-border/60 bg-paper-200/50 shrink-0">
        <div
          className={`flex items-center gap-1.5 min-w-0 flex-1 ${onViewCurator ? 'cursor-pointer' : ''}`}
          {...(onViewCurator
            ? {
                role: 'button',
                tabIndex: 0,
                onClick: handleOpenCurator,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenCurator();
                  }
                },
                'aria-label': `Xem chi tiết ${species.vietnameseName} trong cẩm nang`
              }
            : {})}
        >
          <Bird className="w-4 h-4 text-natural-moss shrink-0" />
          <h3 className="font-serif font-bold text-sm text-ink-900 truncate">
            {species.vietnameseName}
          </h3>
          {species.isEndemic && (
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-natural-ochre/20 text-natural-amber shrink-0">
              {species.endemicScope === 'indochina' ? 'Đông Dương' : 'Đặc hữu VN'}
            </span>
          )}
          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-paper-200 text-ink-700 shrink-0">
            {species.conservation.iucn}
          </span>
        </div>

        <button
          type="button"
          data-testid="close-species-floating-card"
          onClick={handleClose}
          aria-label="Đóng hồ sơ loài"
          title="Đóng hồ sơ loài"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-paper-200/90 hover:bg-paper-300 text-ink-700 transition-colors shadow-2xs cursor-pointer ml-2 shrink-0 border border-paper-border/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Body cuon thoai mai */}
      <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3 space-y-2.5 text-xs">
        {species.illustration?.imageUrl && (
          <div
            className={`relative rounded-xl overflow-hidden border border-paper-border shadow-xs bg-paper-200/40 ${
              onViewCurator ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''
            }`}
            {...(onViewCurator
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: handleOpenCurator,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenCurator();
                    }
                  },
                  'data-testid': 'mobile-card-artwork-plate',
                  'aria-label': 'Xem chi tiết loài trong cẩm nang'
                }
              : {})}
          >
            <BirdPlateImage
              species={species}
              preferThumbnail={true}
              aspectRatio="video"
              className="w-full h-36 object-cover"
            />
            {onViewCurator && (
              <div className="absolute top-2 right-2 bg-paper-100/90 text-ink-800 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-paper-border/60">
                <span>Cẩm nang</span>
                <ChevronRight className="w-3 h-3 text-natural-moss" />
              </div>
            )}
            {species.illustration.artist && (
              <div className="px-2 py-0.5 bg-paper-100/90 border-t border-paper-border text-[10px] text-ink-500 font-serif italic truncate">
                {species.illustration.artist}
              </div>
            )}
          </div>
        )}

        <div
          {...(onViewCurator
            ? {
                role: 'button',
                tabIndex: 0,
                onClick: handleOpenCurator,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenCurator();
                  }
                },
                'data-testid': 'mobile-card-species-name',
                'aria-label': `Xem chi tiết ${species.vietnameseName} trong cẩm nang`,
                className: 'group cursor-pointer flex items-center justify-between p-1 -mx-1 rounded-lg hover:bg-paper-200/50 transition-colors'
              }
            : { className: 'group' })}
        >
          <div className="min-w-0">
            <p className="font-serif italic text-xs font-semibold text-natural-forest group-hover:text-natural-forest flex items-center gap-1">
              <span>{species.scientificName}</span>
            </p>
            <p className="font-sans text-[11px] text-ink-500 truncate">
              {species.englishName}
            </p>
          </div>
          {onViewCurator && (
            <div className="flex items-center gap-0.5 text-[11px] font-medium text-ink-500 group-hover:text-natural-forest transition-colors shrink-0 ml-2">
              <span className="text-[10px]">Cẩm nang</span>
              <ChevronRight className="w-3.5 h-3.5 text-natural-moss group-hover:text-natural-forest group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>

        {species.audioCall?.audioUrl && (
          <div className="pt-0.5" data-testid="mobile-card-audio-player">
            <AudioVoiceButton
              audioInfo={species.audioCall}
              speciesId={species.id}
              birdName={species.vietnameseName}
              variant="pill"
              size="sm"
              className="w-full justify-center shadow-2xs"
            />
          </div>
        )}

        <div className="bg-paper-200/50 p-2.5 rounded-xl border border-paper-border text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-ink-700">
            <MapPin className="w-3.5 h-3.5 text-natural-terracotta shrink-0" />
            <span className="font-semibold">Vùng EBA:</span>
            <span className="text-ink-900 font-medium">{species.distribution.ebaRegion}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-700">
            <Compass className="w-3.5 h-3.5 text-natural-bark shrink-0" />
            <span className="font-semibold">Độ cao:</span>
            <span className="font-mono text-ink-900">
              {species.distribution.elevation || 'Chưa ghi nhận'}
            </span>
          </div>
          {species.distribution.locations && species.distribution.locations.length > 0 && (
            <div className="flex items-start gap-1.5 text-ink-700">
              <Trees className="w-3.5 h-3.5 text-natural-moss mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Địa bàn: </span>
                <span className="text-ink-800">{species.distribution.locations.join(', ')}</span>
              </div>
            </div>
          )}
          {species.distribution.habitats && species.distribution.habitats.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {species.distribution.habitats.map((habitat, idx) => (
                <span
                  key={idx}
                  className="inline-block px-1.5 py-0.5 bg-paper-100/90 text-[10px] text-ink-700 rounded-md border border-paper-border/80"
                >
                  {habitat}
                </span>
              ))}
            </div>
          )}
        </div>

        {species.morphologicalAnalysis?.overview && (
          <div className="bg-paper-50/90 border-l-2 border-natural-ochre p-2 rounded-r-xl border-y border-r border-paper-border/60 text-[11px] italic text-ink-700">
            "{species.morphologicalAnalysis.overview}"
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MobileFloatingSpeciesCard);
