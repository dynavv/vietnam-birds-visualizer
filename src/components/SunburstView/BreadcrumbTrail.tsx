import React from 'react';
import { ChevronRight, Home, Sparkles, Layers } from 'lucide-react';
import type { TaxonomyNode, TaxonomyRank } from '../../types/bird';

export interface BreadcrumbTrailProps {
  lineage: TaxonomyNode[];
  onNodeClick?: (node: TaxonomyNode, index: number) => void;
  activeRank?: TaxonomyRank;
  className?: string;
}

const RANK_LABELS: Record<TaxonomyRank, { labelVi: string; shortVi: string; badgeColor: string }> = {
  class: {
    labelVi: 'Lớp',
    shortVi: 'Lớp',
    badgeColor: 'bg-stone-800 text-stone-100 border-stone-700'
  },
  order: {
    labelVi: 'Bộ',
    shortVi: 'Bộ',
    badgeColor: 'bg-emerald-900/90 text-emerald-100 border-emerald-700/80'
  },
  family: {
    labelVi: 'Họ',
    shortVi: 'Họ',
    badgeColor: 'bg-amber-900/90 text-amber-100 border-amber-700/80'
  },
  genus: {
    labelVi: 'Chi',
    shortVi: 'Chi',
    badgeColor: 'bg-blue-900/90 text-blue-100 border-blue-700/80'
  },
  species: {
    labelVi: 'Loài',
    shortVi: 'Loài',
    badgeColor: 'bg-natural-terracotta text-paper-50 border-natural-terracotta/80'
  }
};

export const BreadcrumbTrailComponent: React.FC<BreadcrumbTrailProps> = ({
  lineage,
  onNodeClick,
  className = ''
}) => {
  if (!lineage || lineage.length === 0) {
    return (
      <nav
        aria-label="Phylogenetic Breadcrumb Trail"
        className={`flex items-center gap-1.5 px-3.5 py-2 bg-paper-100/90 border border-paper-border rounded-xl shadow-sm text-xs ${className}`}
      >
        <span className="inline-flex items-center gap-1 text-ink-600 font-sans">
          <Layers className="w-3.5 h-3.5 text-natural-moss" />
          <span>Lớp Chim (Aves)</span>
        </span>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Phylogenetic Breadcrumb Trail"
      className={`flex items-center flex-wrap gap-1.5 p-1.5 sm:p-2 bg-paper-100/90 backdrop-blur-sm border border-paper-border rounded-xl shadow-sm overflow-x-auto ${className}`}
      data-testid="breadcrumb-trail"
    >
      {lineage.map((node, index) => {
        const isLast = index === lineage.length - 1;
        const rankInfo = RANK_LABELS[node.rank] || {
          labelVi: node.rank,
          shortVi: node.rank,
          badgeColor: 'bg-stone-700 text-stone-100 border-stone-600'
        };

        const isRoot = index === 0;

        return (
          <React.Fragment key={`${node.rank}-${node.name}-${index}`}>
            <button
              type="button"
              onClick={() => onNodeClick && onNodeClick(node, index)}
              disabled={!onNodeClick}
              title={`Phân cấp: ${rankInfo.labelVi} ${node.vietnameseName || node.name}${
                onNodeClick ? ' (Nhấp để phóng to nhánh này)' : ''
              }`}
              className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans transition-all duration-200 border ${
                isLast
                  ? 'bg-paper-50 text-ink-900 font-semibold border-natural-moss/40 shadow-sm ring-1 ring-natural-moss/20'
                  : 'bg-paper-200/70 text-ink-700 hover:bg-paper-300 hover:text-ink-900 border-paper-border cursor-pointer'
              }`}
              aria-current={isLast ? 'step' : undefined}
            >
              {/* Rank Badge */}
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold border ${rankInfo.badgeColor}`}
              >
                {isRoot ? (
                  <Home className="w-2.5 h-2.5 mr-0.5" />
                ) : null}
                {rankInfo.shortVi}
              </span>

              {/* Node Name */}
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {node.vietnameseName ? (
                  <>
                    <span className="font-medium">{node.vietnameseName}</span>
                    <span className="text-[11px] text-ink-500 italic ml-1 hidden md:inline">
                      ({node.name})
                    </span>
                  </>
                ) : (
                  <span className="italic font-serif">{node.name}</span>
                )}
              </span>

              {/* Endemic indicator icon if species */}
              {node.rank === 'species' && (
                <Sparkles className="w-3 h-3 text-natural-ochre flex-shrink-0 ml-0.5" />
              )}
            </button>

            {!isLast && (
              <ChevronRight
                className="w-3.5 h-3.5 text-ink-400 flex-shrink-0 select-none"
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export const BreadcrumbTrail = React.memo(BreadcrumbTrailComponent);
export default BreadcrumbTrail;

