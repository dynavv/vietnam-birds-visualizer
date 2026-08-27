import React from 'react';
import type { IUCNStatus, VietnamRedListStatus } from '../../types/bird';

export interface ConservationBadgeProps {
  status: IUCNStatus;
  vietnamRedList?: VietnamRedListStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface IUCNMeta {
  code: IUCNStatus;
  nameVi: string;
  nameEn: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}

const IUCN_CONFIG: Record<IUCNStatus, IUCNMeta> = {
  CR: {
    code: 'CR',
    nameVi: 'Cực kỳ nguy cấp',
    nameEn: 'Critically Endangered',
    bgColor: 'bg-red-950/10',
    textColor: 'text-red-900',
    borderColor: 'border-red-800/40',
    dotColor: 'bg-[#991B1B]'
  },
  EN: {
    code: 'EN',
    nameVi: 'Nguy cấp',
    nameEn: 'Endangered',
    bgColor: 'bg-orange-950/10',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-800/40',
    dotColor: 'bg-[#C2410C]'
  },
  VU: {
    code: 'VU',
    nameVi: 'Sắp nguy cấp',
    nameEn: 'Vulnerable',
    bgColor: 'bg-amber-950/10',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-700/40',
    dotColor: 'bg-[#D97706]'
  },
  NT: {
    code: 'NT',
    nameVi: 'Gần bị đe dọa',
    nameEn: 'Near Threatened',
    bgColor: 'bg-yellow-950/10',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-700/40',
    dotColor: 'bg-[#854D0E]'
  },
  LC: {
    code: 'LC',
    nameVi: 'Ít quan tâm',
    nameEn: 'Least Concern',
    bgColor: 'bg-emerald-950/10',
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

export const ConservationBadge: React.FC<ConservationBadgeProps> = ({
  status,
  vietnamRedList,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const meta = IUCN_CONFIG[status] || IUCN_CONFIG.LC;
  const sizeStyle = SIZE_STYLES[size];

  const tooltipText = `IUCN: ${meta.nameVi} (${meta.nameEn})${
    vietnamRedList ? ` • Sách Đỏ VN: ${vietnamRedList}` : ''
  }`;

  return (
    <div
      className={`inline-flex items-center rounded-md border font-sans font-medium transition-colors ${meta.bgColor} ${meta.textColor} ${meta.borderColor} ${sizeStyle.container} ${className}`}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <span
        className={`rounded-full flex-shrink-0 ${meta.dotColor} ${sizeStyle.dot}`}
        aria-hidden="true"
      />
      <span className={sizeStyle.code}>{meta.code}</span>
      {showLabel && (
        <>
          <span className="text-ink-muted/50 font-normal select-none" aria-hidden="true">|</span>
          <span className="truncate max-w-[140px] sm:max-w-[180px]">{meta.nameVi}</span>
        </>
      )}
      {vietnamRedList && (
        <span className="ml-0.5 px-1 py-0.2 rounded bg-black/5 text-[10px] uppercase font-mono tracking-tighter">
          VN:{vietnamRedList}
        </span>
      )}
    </div>
  );
};

export default ConservationBadge;
