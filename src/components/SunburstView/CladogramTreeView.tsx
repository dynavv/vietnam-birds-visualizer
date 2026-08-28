import React, { useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Sparkles,
  Folder,
  FolderOpen,
  Feather,
  Plus,
  Minus
} from 'lucide-react';
import type { TaxonomyNode, BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';

export interface CladogramTreeViewProps {
  className?: string;
}

export const CladogramTreeViewComponent: React.FC<CladogramTreeViewProps> = ({ className = '' }) => {
  const {
    taxonomyTree,
    selectedSpeciesId,
    selectSpecies,
    allSpecies,
    expandedNodes,
    toggleExpandedNode,
    expandAllNodes,
    collapseAllNodes
  } = useTaxonomy();

  // Map of species id -> BirdSpecies for quick metadata lookup
  const speciesMap = useMemo(() => {
    const map = new Map<string, BirdSpecies>();
    if (allSpecies) {
      allSpecies.forEach(sp => map.set(sp.id, sp));
    }
    return map;
  }, [allSpecies]);

  // Orders list
  const orders = useMemo(() => {
    return (taxonomyTree.children || []).filter(c => c.rank === 'order');
  }, [taxonomyTree]);


  return (
    <div
      className={`w-full h-full flex flex-col bg-paper-100/90 border border-paper-border rounded-2xl p-4 sm:p-5 shadow-paper-card select-none ${className}`}
      data-testid="cladogram-tree-view"
    >
      {/* Top Tree Controls Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-border/80 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-natural-moss animate-pulse" />
          <span className="font-mono text-xs uppercase font-bold text-ink-700 tracking-wider">
            16 Bộ • 40+ Họ Điểu Học Việt Nam
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAllNodes}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-[11px] font-semibold border border-paper-border transition-all shadow-sm"
            title="Mở rộng toàn bộ cây phân loại"
          >
            <Plus className="w-3 h-3 text-natural-moss" />
            <span>Mở rộng tất cả</span>
          </button>

          <button
            type="button"
            onClick={collapseAllNodes}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-paper-200 hover:bg-paper-300 text-ink-800 text-[11px] font-semibold border border-paper-border transition-all shadow-sm"
            title="Thu gọn về danh sách 16 Bộ"
          >
            <Minus className="w-3 h-3 text-natural-terracotta" />
            <span>Thu gọn</span>
          </button>
        </div>
      </div>

      {/* Scrollable Tree Node Hierarchy */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 text-xs">
        {orders.map(order => {
          const isOrderExpanded = expandedNodes.has(order.name);
          const orderColor = order.color || '#2D5A27';
          const families = (order.children || []).filter(c => c.rank === 'family');
          
          // Count total species in this order
          let totalOrderSpecies = 0;
          order.children?.forEach(fam => {
            fam.children?.forEach(gen => {
              totalOrderSpecies += gen.children?.length || 0;
            });
          });

          return (
            <div
              key={order.name}
              className="border-l-3 pl-3 py-1 space-y-2 rounded-r-xl transition-colors hover:bg-paper-200/30"
              style={{ borderLeftColor: orderColor }}
            >
              {/* Order Header Row */}
              <div
                onClick={() => toggleExpandedNode(order.name)}
                className="flex items-center gap-2.5 cursor-pointer select-none group py-0.5"
                role="button"
                tabIndex={0}
                aria-expanded={isOrderExpanded}
              >
                <button
                  type="button"
                  className="w-5 h-5 rounded-md bg-paper-200 group-hover:bg-paper-300 border border-paper-border flex items-center justify-center font-mono text-xs font-bold text-ink-800 transition-colors"
                >
                  {isOrderExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: orderColor }}
                />

                <span className="font-serif font-bold text-sm text-ink-900 group-hover:text-natural-forest transition-colors">
                  {order.vietnameseName || order.name}
                </span>

                <span className="font-serif italic text-xs text-ink-500 font-normal">
                  ({order.name})
                </span>

                <span className="ml-auto text-[10px] font-mono bg-paper-200 px-2 py-0.5 rounded-full text-ink-600 border border-paper-border font-medium">
                  {totalOrderSpecies > 0 ? `${totalOrderSpecies} loài` : `${families.length} họ`}
                </span>
              </div>

              {/* Families Sub-Tree */}
              {isOrderExpanded && (
                <div className="pl-6 space-y-2 border-l border-dashed border-paper-border/80 ml-2 animate-fadeIn">
                  {families.map(fam => {
                    const isFamExpanded = expandedNodes.has(fam.name);
                    const genera = fam.children || [];

                    // Collect all species in this family
                    const familySpeciesList: TaxonomyNode[] = [];
                    genera.forEach(gen => {
                      (gen.children || []).forEach(sp => familySpeciesList.push(sp));
                    });

                    return (
                      <div key={fam.name} className="space-y-1.5 py-0.5">
                        {/* Family Header Row */}
                        <div
                          onClick={() => toggleExpandedNode(fam.name)}
                          className="flex items-center gap-2 cursor-pointer select-none group"
                          role="button"
                          tabIndex={0}
                          aria-expanded={isFamExpanded}
                        >
                          <button
                            type="button"
                            className="w-4 h-4 rounded bg-paper-200/80 group-hover:bg-paper-300 border border-paper-border flex items-center justify-center text-ink-700"
                          >
                            {isFamExpanded ? (
                              <FolderOpen className="w-2.5 h-2.5 text-natural-moss" />
                            ) : (
                              <Folder className="w-2.5 h-2.5 text-ink-400" />
                            )}
                          </button>

                          <span className="font-sans font-semibold text-xs text-ink-800 group-hover:text-natural-moss transition-colors">
                            {fam.vietnameseName || fam.name}
                          </span>

                          <span className="font-serif italic text-[11px] text-ink-400">
                            {fam.name}
                          </span>

                          <span className="text-[9.5px] font-mono text-ink-500">
                            ({familySpeciesList.length} loài)
                          </span>
                        </div>

                        {/* Species Nodes List */}
                        {isFamExpanded && (
                          <div className="pl-6 space-y-1 border-l border-paper-border/60 ml-2 animate-fadeIn">
                            {familySpeciesList.map(spNode => {
                              const spId = spNode.speciesId || '';
                              const isSelected = selectedSpeciesId === spId;
                              const bird = speciesMap.get(spId);

                              return (
                                <div
                                  key={spNode.name}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (spId) selectSpecies(spId);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                                    isSelected
                                      ? 'bg-natural-moss/10 border-natural-moss/40 text-natural-forest font-bold shadow-sm ring-1 ring-natural-moss/30'
                                      : 'hover:bg-paper-200/70 border-transparent text-ink-800'
                                  }`}
                                  role="button"
                                  tabIndex={0}
                                  data-testid={`tree-species-${spId}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Feather
                                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                                        isSelected ? 'text-natural-moss scale-110' : 'text-ink-400'
                                      }`}
                                    />
                                    <span className="font-sans text-xs truncate">
                                      {spNode.vietnameseName || spNode.name}
                                    </span>
                                    <span className="font-serif italic text-[11px] text-ink-500 truncate hidden sm:inline">
                                      {spNode.name}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                    {bird?.isEndemic && (
                                      <span
                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-natural-ochre/20 text-natural-amber text-[10px] font-bold"
                                        title="Loài đặc hữu Việt Nam"
                                      >
                                        <Sparkles className="w-2.5 h-2.5" />
                                        <span>Đặc hữu</span>
                                      </span>
                                    )}
                                    {bird?.conservation?.vietnamRedList && (
                                      <span className="px-1.5 py-0.2 rounded bg-paper-300/80 text-ink-700 text-[10px] font-mono font-semibold">
                                        VN:{bird.conservation.vietnamRedList}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CladogramTreeView = React.memo(CladogramTreeViewComponent);
export default CladogramTreeView;

