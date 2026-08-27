import React, { useState } from 'react';
import { BirdSpecies } from '../../types/bird';

interface BirdPlateImageProps {
  species: BirdSpecies;
  className?: string;
  imageClassName?: string;
  aspectRatio?: 'square' | 'plate' | 'cover';
  onClick?: () => void;
}

// Bảng màu lông đặc trưng theo từng Bộ chim để vẽ bản khắc tự nhiên học
const ORDER_COLOR_PALETTES: Record<string, { primary: string; secondary: string; accent: string; bg: string }> = {
  Passeriformes: { primary: '#92400E', secondary: '#D97706', accent: '#F59E0B', bg: '#FEF3C7' }, // Bộ Sẻ: Nâu, vàng kim, hổ phách
  Galliformes: { primary: '#1E3A8A', secondary: '#1D4ED8', accent: '#DC2626', bg: '#DBEAFE' },   // Bộ Gà: Xanh lam óng, đỏ tươi
  Bucerotiformes: { primary: '#1C1917', secondary: '#D97706', accent: '#EA580C', bg: '#FFEDD5' },// Bộ Hồng hoàng: Đen, vàng cam
  Coraciiformes: { primary: '#0369A1', secondary: '#0284C7', accent: '#F97316', bg: '#E0F2FE' }, // Bộ Bói cá: Xanh ngọc, cam
  Piciformes: { primary: '#15803D', secondary: '#16A34A', accent: '#DC2626', bg: '#DCFCE7' },    // Bộ Gõ kiến: Xanh lá, mào đỏ
  Accipitriformes: { primary: '#44403C', secondary: '#78716C', accent: '#D97706', bg: '#F5F5F4' }, // Bộ Ưng: Nâu xám, mỏ vàng
  Strigiformes: { primary: '#78350F', secondary: '#92400E', accent: '#F59E0B', bg: '#FEF3C7' },   // Bộ Cú: Nâu đốm, mắt vàng
  Pelecaniformes: { primary: '#334155', secondary: '#64748B', accent: '#0284C7', bg: '#F1F5F9' }, // Bộ Bồ nông: Xám xanh
  Gruiformes: { primary: '#475569', secondary: '#DC2626', accent: '#E2E8F0', bg: '#F8FAFC' },    // Bộ Sếu: Xám tro, đầu đỏ
  Columbiformes: { primary: '#4B5563', secondary: '#059669', accent: '#BE185D', bg: '#F3F4F6' }, // Bộ Bồ câu: Xám ánh kim
  Anseriformes: { primary: '#1E293B', secondary: '#047857', accent: '#B45309', bg: '#ECFDF5' },  // Bộ Vịt: Nâu rêu
  Cuculiformes: { primary: '#57534E', secondary: '#A8A29E', accent: '#CA8A04', bg: '#FAFAF9' },  // Bộ Cu cu: Xám tro
  Trogoniformes: { primary: '#047857', secondary: '#DC2626', accent: '#F59E0B', bg: '#FEF2F2' }  // Bộ Nuốc: Xanh lục, bụng đỏ
};

export const BirdPlateImage: React.FC<BirdPlateImageProps> = ({
  species,
  className = '',
  imageClassName = '',
  aspectRatio = 'square',
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const orderName = species.taxonomy?.order || 'Passeriformes';
  const palette = ORDER_COLOR_PALETTES[orderName] || {
    primary: '#78350F',
    secondary: '#D97706',
    accent: '#2563EB',
    bg: '#FDFBF7'
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'plate':
        return 'aspect-[3/4]';
      case 'cover':
        return 'aspect-[16/10]';
      case 'square':
      default:
        return 'aspect-square';
    }
  };

  const rawImageUrl = species.illustration?.imageUrl;

  return (
    <div
      onClick={onClick}
      className={`relative w-full overflow-hidden bg-paper-100 border border-paper-border rounded-lg ${getAspectRatioClass()} ${className}`}
      data-testid={`bird-plate-${species.id}`}
    >
      {/* 1. Main Image (nếu có URL hợp lệ và tải thành công) */}
      {rawImageUrl && !hasError && (
        <img
          src={rawImageUrl}
          alt={`Minh họa loài ${species.vietnameseName} (${species.scientificName})`}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${imageClassName}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* 2. Naturalist Botanical Vector Plate Artwork (Hiển thị khi ảnh đang tải hoặc ảnh lỗi/chưa có ảnh) */}
      {(!rawImageUrl || hasError || !isLoaded) && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-between p-3 select-none transition-opacity duration-300 ${
            isLoaded && !hasError ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          style={{ backgroundColor: '#FAF7F0' }}
        >
          {/* Double Victorian Plate Inset Border */}
          <div className="absolute inset-1.5 border border-stone-300/80 rounded pointer-events-none" />
          <div className="absolute inset-2 border border-dashed border-stone-200/90 rounded pointer-events-none" />

          {/* Top Label: Archival Plate & Taxonomy */}
          <div className="w-full flex items-center justify-between z-10 text-[9px] font-mono uppercase text-stone-500 px-1">
            <span className="truncate max-w-[60%]">{species.taxonomy?.order || 'Aves'}</span>
            <span className="font-bold text-natural-moss">
              {species.isEndemic ? '★ ĐẶC HỮU' : 'VIETNAM'}
            </span>
          </div>

          {/* Center: Stylized Naturalist Bird Emblem */}
          <div className="relative flex-1 w-full flex items-center justify-center my-1 z-10">
            {/* Soft Ambient Radiance Halo */}
            <div
              className="absolute w-20 h-20 rounded-full blur-xl opacity-40"
              style={{ backgroundColor: palette.accent }}
            />

            {/* Antique Botanical Branch & Bird Silhouette SVG */}
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full max-w-[100px] max-h-[100px] drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Botanical Perching Branch */}
              <path
                d="M10 95 C 40 92, 70 88, 110 85"
                stroke="#854D0E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M45 92 C 50 82, 60 78, 65 72"
                stroke="#15803D"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Botanical Leaves */}
              <ellipse cx="60" cy="74" rx="4" ry="7" transform="rotate(-30 60 74)" fill="#166534" opacity="0.8" />
              <ellipse cx="38" cy="90" rx="3.5" ry="6" transform="rotate(45 38 90)" fill="#15803D" opacity="0.85" />
              <ellipse cx="85" cy="85" rx="3" ry="5" transform="rotate(-15 85 85)" fill="#166534" opacity="0.8" />

              {/* Bird Tail Feathers */}
              <path
                d="M38 72 C 25 82, 15 98, 12 106 C 22 100, 32 90, 42 78 Z"
                fill={palette.primary}
                opacity="0.9"
              />
              <path
                d="M40 73 C 28 85, 20 102, 18 108 C 26 102, 35 91, 44 80 Z"
                fill={palette.secondary}
                opacity="0.85"
              />

              {/* Bird Body & Underparts */}
              <ellipse
                cx="58"
                cy="64"
                rx="16"
                ry="19"
                transform="rotate(-25 58 64)"
                fill={palette.primary}
              />
              {/* Breast & Plumage Gradient Highlight */}
              <path
                d="M50 56 C 54 50, 68 52, 72 62 C 70 72, 56 75, 48 68 Z"
                fill={palette.secondary}
                opacity="0.9"
              />

              {/* Wing Primary Feathers */}
              <path
                d="M48 60 C 45 68, 42 82, 38 88 C 48 84, 58 74, 62 66 Z"
                fill={palette.accent}
                opacity="0.95"
              />
              {/* Wing Bar Detail */}
              <path
                d="M52 62 C 50 68, 48 76, 45 80"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Bird Head & Crown */}
              <circle cx="72" cy="46" r="11" fill={palette.primary} />
              {/* Crest / Mào nếu có */}
              <path
                d="M66 38 C 68 32, 73 28, 77 32 C 75 36, 73 40, 71 42 Z"
                fill={palette.accent}
              />

              {/* Eye & Eye-ring */}
              <circle cx="75" cy="44" r="3" fill="#FFFFFF" />
              <circle cx="75.5" cy="44" r="1.8" fill="#1C1917" />
              <circle cx="76.2" cy="43.3" r="0.6" fill="#FFFFFF" />

              {/* Beak / Mỏ */}
              <path
                d="M81 44 L 95 47 L 81 50 Z"
                fill="#D97706"
                stroke="#78350F"
                strokeWidth="0.8"
              />

              {/* Feet / Vuốt chân bám cành */}
              <path d="M54 82 L 54 92 M 52 90 L 56 93 M 58 83 L 59 91" stroke="#44403C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Bottom Label: Scientific & Vietnamese Name */}
          <div className="w-full text-center z-10 pb-0.5">
            <div className="font-serif font-bold text-[11px] text-ink-900 truncate leading-tight">
              {species.vietnameseName}
            </div>
            <div className="font-serif italic text-[9px] text-natural-forest truncate leading-tight">
              {species.scientificName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirdPlateImage;
