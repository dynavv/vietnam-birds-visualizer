import React from 'react';
import { Bird } from 'lucide-react';
import type { EndemicScope } from '../../types/bird';

export interface EndemicBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  useStarIcon?: boolean;
  className?: string;
  scope?: EndemicScope;
}

const SIZE_STYLES = {
  sm: {
    container: 'text-[11px] px-1.5 py-0.5 gap-1',
    icon: 'w-3 h-3'
  },
  md: {
    container: 'text-xs px-2.5 py-1 gap-1.5',
    icon: 'w-3.5 h-3.5'
  },
  lg: {
    container: 'text-sm px-3 py-1.5 gap-2',
    icon: 'w-4 h-4'
  }
};

export const EndemicBadgeComponent: React.FC<EndemicBadgeProps> = ({
  size = 'md',
  compact = false,
  scope = 'vietnam',
  className = ''
}) => {
  if (scope === 'none') return null;

  const sizeStyle = SIZE_STYLES[size];
  const isIndochina = scope === 'indochina';
  const labelText = isIndochina
    ? (compact ? 'Đông Dương' : 'Đặc hữu Đông Dương')
    : (compact ? 'Đặc hữu' : 'Đặc hữu Việt Nam');
  const tooltipText = isIndochina
    ? 'Loài chim phân bố giới hạn và đặc hữu tại khu hệ sinh thái Đông Dương (Việt Nam, Lào, Campuchia)'
    : 'Loài chim phân bố giới hạn và đặc hữu tại lãnh thổ Việt Nam';

  const colorClasses = isIndochina
    ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300/80 hover:bg-emerald-100'
    : 'bg-amber-100/90 text-amber-950 border-amber-300/80 hover:bg-amber-100';

  const iconClasses = isIndochina
    ? 'text-emerald-700 fill-emerald-600/30'
    : 'text-amber-600 fill-amber-500/40';

  return (
    <div
      className={`inline-flex items-center rounded-md border font-sans font-medium shadow-sm transition-all ${colorClasses} ${sizeStyle.container} ${className}`}
      title={tooltipText}
      aria-label={isIndochina ? 'Loài chim đặc hữu Đông Dương' : 'Loài chim đặc hữu Việt Nam'}
    >
      <Bird
        className={`${iconClasses} flex-shrink-0 ${sizeStyle.icon}`}
        aria-hidden="true"
      />
      <span className="font-semibold tracking-tight">{labelText}</span>
    </div>
  );
};

export const EndemicBadge = React.memo(EndemicBadgeComponent);
export default EndemicBadge;

