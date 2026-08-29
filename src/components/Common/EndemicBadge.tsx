import React from 'react';
import { Bird } from 'lucide-react';

export interface EndemicBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  useStarIcon?: boolean;
  className?: string;
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
  className = ''
}) => {
  const sizeStyle = SIZE_STYLES[size];
  const labelText = compact ? 'Đặc hữu' : 'Đặc hữu Việt Nam';
  const tooltipText = 'Loài chim phân bố giới hạn và đặc hữu tại lãnh thổ Việt Nam';

  return (
    <div
      className={`inline-flex items-center rounded-md border font-sans font-medium bg-amber-100/90 text-amber-950 border-amber-300/80 shadow-sm transition-all hover:bg-amber-100 ${sizeStyle.container} ${className}`}
      title={tooltipText}
      aria-label="Loài chim đặc hữu Việt Nam"
    >
      <Bird
        className={`text-amber-600 fill-amber-500/40 flex-shrink-0 ${sizeStyle.icon}`}
        aria-hidden="true"
      />
      <span className="font-semibold tracking-tight">{labelText}</span>
    </div>
  );
};

export const EndemicBadge = React.memo(EndemicBadgeComponent);
export default EndemicBadge;

