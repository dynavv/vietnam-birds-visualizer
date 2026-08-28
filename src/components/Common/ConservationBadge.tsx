import React from 'react';
import type { IUCNStatus, VietnamRedListStatus } from '../../types/bird';

export interface ConservationBadgeProps {
  status: IUCNStatus;
  vietnamRedList?: VietnamRedListStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface StatusMeta {
  code: string;
  nameVi: string;
  nameEn: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}

const STATUS_CONFIG: Record<string, StatusMeta> = {
  CR: {
    code: 'CR',
    nameVi: 'Cực kỳ nguy cấp',
    nameEn: 'Critically Endangered',
    bgColor: 'bg-red-950/10 text-red-900 border-red-800/40',
    textColor: 'text-red-900',
    borderColor: 'border-red-800/40',
    dotColor: 'bg-[#991B1B]'
  },
  EN: {
    code: 'EN',
    nameVi: 'Nguy cấp',
    nameEn: 'Endangered',
    bgColor: 'bg-orange-950/10 text-orange-900 border-orange-800/40',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-800/40',
    dotColor: 'bg-[#C2410C]'
  },
  VU: {
    code: 'VU',
    nameVi: 'Sắp nguy cấp',
    nameEn: 'Vulnerable',
    bgColor: 'bg-amber-950/10 text-amber-900 border-amber-700/40',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-700/40',
    dotColor: 'bg-[#D97706]'
  },
  NT: {
    code: 'NT',
    nameVi: 'Gần bị đe dọa',
    nameEn: 'Near Threatened',
    bgColor: 'bg-yellow-950/10 text-yellow-900 border-yellow-700/40',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-700/40',
    dotColor: 'bg-[#854D0E]'
  },
  LC: {
    code: 'LC',
    nameVi: 'Nguy cơ thấp',
    nameEn: 'Least Concern',
    bgColor: 'bg-emerald-950/10 text-emerald-900 border-emerald-700/40',
    textColor: 'text-emerald-900',
    borderColor: 'border-emerald-700/40',
    dotColor: 'bg-[#166534]'
  }
};

const SIZE_STYLES = {
  sm: {
    container: 'text-[11px] px-1.5 py-0.5 gap-1',
    code: 'font-bold tracking-wider',
    dot: 'w-1.5 h-1.5'
  },
  md: {
    container: 'text-xs px-2.5 py-1 gap-1.5',
    code: 'font-bold tracking-wider',
    dot: 'w-2 h-2'
  },
  lg: {
    container: 'text-sm px-3 py-1.5 gap-2',
    code: 'font-bold tracking-wider',
    dot: 'w-2.5 h-2.5'
  }
};

export const ConservationBadgeComponent: React.FC<ConservationBadgeProps> = ({
  status,
  vietnamRedList,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  // Ưu tiên Sách Đỏ Việt Nam làm bậc phân hạng chính nếu có
  const primaryCode = vietnamRedList || status;
  const meta = STATUS_CONFIG[primaryCode] || STATUS_CONFIG.LC;
  const sizeStyle = SIZE_STYLES[size];

  const tooltipText = `Sách Đỏ VN: ${vietnamRedList || meta.code} (${meta.nameVi}) • IUCN Toàn cầu: ${status}`;

  return (
    <div
      className={`inline-flex items-center rounded-md border font-sans font-medium transition-colors ${meta.bgColor} ${sizeStyle.container} ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <span
        className={`rounded-full flex-shrink-0 ${meta.dotColor} ${sizeStyle.dot}`}
        aria-hidden="true"
      />
      {/* Primary: Vietnam Red List Code & Label */}
      <span className={sizeStyle.code}>
        {vietnamRedList ? `VN:${vietnamRedList}` : meta.code}
      </span>
      {showLabel && (
        <>
          <span className="text-ink-muted/50 font-normal select-none" aria-hidden="true">|</span>
          <span className="truncate max-w-[140px] sm:max-w-[180px] font-semibold">{meta.nameVi}</span>
        </>
      )}
      {/* Secondary: Global IUCN tag */}
      <span className="ml-0.5 px-1 py-0.2 rounded bg-black/5 text-[10px] uppercase font-mono tracking-tighter text-ink-600">
        IUCN:{status}
      </span>
    </div>
  );
};

export const ConservationBadge = React.memo(ConservationBadgeComponent);
export default ConservationBadge;

