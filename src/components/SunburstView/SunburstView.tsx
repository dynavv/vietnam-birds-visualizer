import React, { useState, useMemo, useCallback } from 'react';
import {
  Layers,
  TreePine,
  RotateCcw,
  GitBranch,
  CircleDot
} from 'lucide-react';
import type { TaxonomyNode } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { BreadcrumbTrail } from './BreadcrumbTrail';
import { SunburstWheel } from './SunburstWheel';
import { CladogramTreeView } from './CladogramTreeView';
import { QuickSpecimenPanel } from './QuickSpecimenPanel';
import { getTaxonomyLineage } from './taxonomyUtils';

export interface SunburstViewProps {
  className?: string;
  onViewCurator?: () => void;
}

export type TaxonomyChartMode = 'tree' | 'radial';

export const SunburstView: React.FC<SunburstViewProps> = ({
  className = '',
  onViewCurator
}) => {
  const {
    taxonomyTree,
    hoveredTaxonNode,
    selectedSpecies,
    selectSpecies
  } = useTaxonomy();

  const [chartMode, setChartMode] = useState<TaxonomyChartMode>('radial');
  const [activeFocusNode, setActiveFocusNode] = useState<TaxonomyNode | null>(null);

  // Compute active phylogenetic lineage for the breadcrumb trail
  const currentLineage = useMemo(() => {
    if (hoveredTaxonNode) {
      return getTaxonomyLineage(taxonomyTree, hoveredTaxonNode);
    }
    if (activeFocusNode) {
      return getTaxonomyLineage(taxonomyTree, activeFocusNode);
    }
    if (selectedSpecies) {
      return getTaxonomyLineage(taxonomyTree, selectedSpecies.id);
    }
    return [taxonomyTree];
  }, [taxonomyTree, hoveredTaxonNode, activeFocusNode, selectedSpecies]);

  // Handle clicking a node in the breadcrumb trail to zoom into that level
  const handleBreadcrumbClick = useCallback((node: TaxonomyNode) => {
    setActiveFocusNode(node);
  }, []);

  // Handle zoom event from the wheel
  const handleWheelZoom = useCallback((node: TaxonomyNode) => {
    setActiveFocusNode(node);
  }, []);

  // Extract order list for quick-filter order chips
  const orderList = useMemo(() => {
    return (taxonomyTree.children || []).filter(c => c.rank === 'order');
  }, [taxonomyTree]);

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col h-full min-h-0 space-y-2.5 ${className}`}
      data-testid="sunburst-view"
    >
      {/* Top Section: Header, Dual-Mode Switcher & Interactive Breadcrumbs */}
      <div className="space-y-2 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-natural-moss/10 text-natural-moss">
                <TreePine className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-ink-900 tracking-tight">
                Hệ Thống Phân Loại Học Chim Việt Nam
              </h1>
            </div>
            <p className="text-xs text-ink-600 font-sans mt-0.5 hidden sm:block">
              Khám phá quan hệ phả hệ từ Lớp Chim (Aves) đến 16 Bộ, Họ, Chi và từng Loài
            </p>
          </div>

          {/* Mode Switcher: Radial Fan vs Cladogram Tree (Radial as Default) */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap shrink-0">
            <div
              className="inline-flex p-1 rounded-xl bg-paper-200 border border-paper-border text-xs font-semibold shadow-inner"
              role="radiogroup"
              aria-label="Kiểu biểu đồ phân loại"
            >
              <button
                type="button"
                role="radio"
                aria-checked={chartMode === 'radial'}
                onClick={() => setChartMode('radial')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'radial'
                    ? 'bg-paper-50 text-natural-forest font-bold shadow-sm border border-paper-border/80'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                title="Xem dạng Bánh Xe Rẻ Quạt (Radial Fan / Sunburst)"
              >
                <CircleDot className="w-3.5 h-3.5" />
                <span>Bánh Xe Rẻ Quạt</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={chartMode === 'tree'}
                onClick={() => setChartMode('tree')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'tree'
                    ? 'bg-paper-50 text-natural-forest font-bold shadow-sm border border-paper-border/80'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                title="Xem dạng Cây Phân Nhánh Ngang (Collapsible Tree)"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Cây Phân Nhánh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Breadcrumb Trail */}
        <BreadcrumbTrail
          lineage={currentLineage}
          onNodeClick={handleBreadcrumbClick}
          className="w-full"
        />
      </div>

      {/* Main Two-Column Layout: Left Visualization Canvas, Right Specimen Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left 7-8 Columns: Visualization Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 h-full">
          {chartMode === 'tree' ? (
            <div className="flex-1 min-h-0 h-[480px] sm:h-[560px] lg:h-full">
              <CladogramTreeView />
            </div>
          ) : (
            <div className="bg-paper-100/90 backdrop-blur-sm border border-paper-border rounded-2xl p-2.5 sm:p-3.5 shadow-paper-card flex flex-col justify-between items-center relative flex-1 min-h-0 h-full overflow-hidden">
              {/* Wheel Graphic Container */}
              <div className="flex-1 min-h-0 w-full flex items-center justify-center relative p-1 overflow-hidden">
                <SunburstWheel
                  data={taxonomyTree}
                  activeFocusNode={activeFocusNode}
                  onZoomNode={handleWheelZoom}
                  onSelectSpecies={selectSpecies}
                  className="w-full max-h-full aspect-square"
                />
              </div>

              {/* Bottom Interactive Order Chips Legend */}
              <div className="w-full pt-2 mt-1 border-t border-paper-border/60 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider font-bold text-ink-500 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-natural-moss" />
                    16 Bộ Chim Đặc Trưng (Bảng Màu Sinh Thái)
                  </span>
                  {activeFocusNode && activeFocusNode.name !== taxonomyTree.name && (
                    <button
                      type="button"
                      onClick={() => setActiveFocusNode(taxonomyTree)}
                      className="inline-flex items-center gap-1 text-[11px] text-natural-moss font-semibold hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xem toàn cảnh</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-1 scrollbar-thin">
                  {orderList.map(order => {
                    const isCurrentActive = activeFocusNode?.name === order.name;
                    return (
                      <button
                        key={order.name}
                        type="button"
                        onClick={() => setActiveFocusNode(order)}
                        title={`Bộ ${order.vietnameseName || order.name} (${order.name})`}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10.5px] font-sans transition-all border shrink-0 ${
                          isCurrentActive
                            ? 'bg-paper-50 text-ink-900 font-bold border-natural-moss shadow-sm ring-1 ring-natural-moss/30'
                            : 'bg-paper-200/70 text-ink-700 hover:bg-paper-300 hover:text-ink-900 border-paper-border'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: order.color || '#2D5A27' }}
                        />
                        <span className="whitespace-nowrap">
                          {order.vietnameseName || order.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 4-5 Columns: Quick Specimen Curatorial Card */}
        <div className="lg:col-span-5 xl:col-span-4 h-[440px] sm:h-[520px] lg:h-full min-h-0 flex flex-col">
          <QuickSpecimenPanel
            species={selectedSpecies}
            onViewCurator={onViewCurator}
            isHoverPreview={Boolean(hoveredTaxonNode && hoveredTaxonNode.speciesId)}
            className="h-full"
          />
        </div>

      </div>
    </div>
  );
};

export default SunburstView;
