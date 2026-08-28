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

  const [chartMode, setChartMode] = useState<TaxonomyChartMode>('tree');
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
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-5 ${className}`}
      data-testid="sunburst-view"
    >
      {/* Top Section: Header, Dual-Mode Switcher & Interactive Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-natural-moss/10 text-natural-moss">
                <TreePine className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink-900 tracking-tight">
                Hệ Thống Phân Loại Học Chim Việt Nam
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 font-sans mt-0.5">
              Khám phá quan hệ phả hệ từ Lớp Chim (Aves) đến 16 Bộ, Họ, Chi và từng Loài
            </p>
          </div>

          {/* Mode Switcher: Cladogram Tree vs Radial Fan */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div
              className="inline-flex p-1 rounded-xl bg-paper-200 border border-paper-border text-xs font-semibold shadow-inner"
              role="radiogroup"
              aria-label="Kiểu biểu đồ phân loại"
            >
              <button
                type="button"
                role="radio"
                aria-checked={chartMode === 'tree'}
                onClick={() => setChartMode('tree')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'tree'
                    ? 'bg-paper-50 text-natural-forest font-bold shadow-sm border border-paper-border/80'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                title="Xem dạng Cây Phân Nhánh Ngang (Collapsible Tree)"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Cây Phân Nhánh</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={chartMode === 'radial'}
                onClick={() => setChartMode('radial')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  chartMode === 'radial'
                    ? 'bg-paper-50 text-natural-forest font-bold shadow-sm border border-paper-border/80'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
                title="Xem dạng Biểu Đồ Rẻ Quạt (Radial Fan / Sunburst)"
              >
                <CircleDot className="w-3.5 h-3.5" />
                <span>Bánh Xe Rẻ Quạt</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left 7-8 Columns: Visualization Canvas */}
        <div className="lg:col-span-7 xl:col-span-8">
          {chartMode === 'tree' ? (
            <div className="h-[640px] max-h-[78vh]">
              <CladogramTreeView />
            </div>
          ) : (
            <div className="bg-paper-100/90 backdrop-blur-sm border border-paper-border rounded-2xl p-3 sm:p-5 shadow-paper-card flex flex-col items-center justify-center relative">
              {/* Wheel Graphic */}
              <SunburstWheel
                data={taxonomyTree}
                activeFocusNode={activeFocusNode}
                onZoomNode={handleWheelZoom}
                onSelectSpecies={selectSpecies}
                className="w-full max-w-[560px]"
              />

              {/* Bottom Interactive Order Chips Legend */}
              <div className="w-full pt-3 mt-1 border-t border-paper-border/60">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-ink-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-natural-moss" />
                    16 Bộ Chim Đặc Trưng (Bảng Màu Sinh Thái)
                  </span>
                  {activeFocusNode && activeFocusNode.name !== taxonomyTree.name && (
                    <button
                      type="button"
                      onClick={() => setActiveFocusNode(taxonomyTree)}
                      className="inline-flex items-center gap-1 text-xs text-natural-moss font-semibold hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xem toàn cảnh</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {orderList.map(order => {
                    const isCurrentActive = activeFocusNode?.name === order.name;
                    return (
                      <button
                        key={order.name}
                        type="button"
                        onClick={() => setActiveFocusNode(order)}
                        title={`Bộ ${order.vietnameseName || order.name} (${order.name})`}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-sans transition-all border ${
                          isCurrentActive
                            ? 'bg-paper-50 text-ink-900 font-bold border-natural-moss shadow-sm ring-1 ring-natural-moss/30'
                            : 'bg-paper-200/70 text-ink-700 hover:bg-paper-300 hover:text-ink-900 border-paper-border'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: order.color || '#2D5A27' }}
                        />
                        <span className="truncate max-w-[120px]">
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
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <QuickSpecimenPanel
            species={selectedSpecies}
            onViewCurator={onViewCurator}
            isHoverPreview={Boolean(hoveredTaxonNode && hoveredTaxonNode.speciesId)}
          />
        </div>

      </div>
    </div>
  );
};

export default SunburstView;
