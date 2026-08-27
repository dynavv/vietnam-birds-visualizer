import React, { useState, useMemo, useCallback } from 'react';
import {
  Layers,
  TreePine,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import type { TaxonomyNode } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';
import { BreadcrumbTrail } from './BreadcrumbTrail';
import { SunburstWheel } from './SunburstWheel';
import { QuickSpecimenPanel } from './QuickSpecimenPanel';
import { getTaxonomyLineage } from './taxonomyUtils';

export interface SunburstViewProps {
  className?: string;
  onViewCurator?: () => void;
}

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
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 ${className}`}
      data-testid="sunburst-view"
    >
      {/* Top Section: Header & Interactive Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-natural-moss/10 text-natural-moss">
                <TreePine className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 tracking-tight">
                Bánh Xe Phân Loại Học Chim Việt Nam
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-ink-600 font-sans mt-0.5">
              Phylogenetic Radial Sunburst Wheel — Khám phá quan hệ tiến hóa từ Lớp Chim (Aves) đến 16 Bộ, Họ, Chi và từng Loài
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-paper-100 border border-paper-border px-3 py-1.5 rounded-xl text-xs font-mono text-ink-700 shadow-sm">
            <span className="flex items-center gap-1 font-semibold text-natural-forest">
              <Layers className="w-3.5 h-3.5" />
              16 Bộ
            </span>
            <span className="text-ink-300">•</span>
            <span>40+ Họ</span>
            <span className="text-ink-300">•</span>
            <span className="flex items-center gap-1 text-natural-terracotta font-semibold">
              <Sparkles className="w-3 h-3 text-natural-ochre" />
              110+ Loài
            </span>
          </div>
        </div>

        {/* Dynamic Breadcrumb Trail */}
        <BreadcrumbTrail
          lineage={currentLineage}
          onNodeClick={handleBreadcrumbClick}
          className="w-full"
        />
      </div>

      {/* Main Two-Column Layout: Left Wheel, Right Specimen Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7-8 Columns: Sunburst Wheel Visualization Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 bg-paper-100/90 backdrop-blur-sm border border-paper-border rounded-2xl p-4 sm:p-6 shadow-paper-card flex flex-col items-center justify-center relative min-h-[500px]">
          
          {/* Wheel Graphic */}
          <SunburstWheel
            data={taxonomyTree}
            activeFocusNode={activeFocusNode}
            onZoomNode={handleWheelZoom}
            onSelectSpecies={selectSpecies}
            className="w-full max-w-[620px]"
          />

          {/* Bottom Interactive Order Chips Legend */}
          <div className="w-full pt-4 mt-2 border-t border-paper-border/60">
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

        {/* Right 4-5 Columns: Quick Specimen Curatorial Card */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
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
