import React, { useMemo, useCallback } from 'react';
import { Search, X, Star, RotateCcw, ShieldAlert, Layers } from 'lucide-react';
import { useTaxonomy } from '../../context/TaxonomyContext';

export interface SearchFilterBarProps {
  className?: string;
}

const IUCN_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả bậc bảo tồn' },
  { value: 'CR', label: 'CR • Cực kỳ nguy cấp' },
  { value: 'EN', label: 'EN • Nguy cấp' },
  { value: 'VU', label: 'VU • Sắp nguy cấp' },
  { value: 'NT', label: 'NT • Gần bị đe dọa' },
  { value: 'LC', label: 'LC • Nguy cơ thấp' }
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ className = '' }) => {
  const {
    searchQuery,
    setSearchQuery,
    onlyEndemic,
    setOnlyEndemic,
    selectedOrder,
    setSelectedOrder,
    selectedConservation,
    setSelectedConservation,
    filteredSpecies,
    allSpecies
  } = useTaxonomy();

  // Extract unique orders with their Vietnamese names
  const orderOptions = useMemo(() => {
    const orderMap = new Map<string, string>();
    for (const sp of allSpecies) {
      if (sp.taxonomy?.order && !orderMap.has(sp.taxonomy.order)) {
        orderMap.set(
          sp.taxonomy.order,
          sp.taxonomy.orderVietnamese
            ? `${sp.taxonomy.order} (${sp.taxonomy.orderVietnamese})`
            : sp.taxonomy.order
        );
      }
    }
    return Array.from(orderMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allSpecies]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      onlyEndemic ||
      selectedOrder !== 'all' ||
      selectedConservation !== 'all'
    );
  }, [searchQuery, onlyEndemic, selectedOrder, selectedConservation]);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setOnlyEndemic(false);
    setSelectedOrder('all');
    setSelectedConservation('all');
  }, [setSearchQuery, setOnlyEndemic, setSelectedOrder, setSelectedConservation]);

  return (
    <div
      className={`bg-paper-100/95 border-b border-paper-border py-3 px-4 sm:px-6 shadow-sm backdrop-blur-sm transition-all ${className}`}
      data-testid="search-filter-bar"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input with quick clear */}
        <div className="relative flex-1 min-w-[240px] max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên tiếng Việt, tên khoa học, tiếng Anh..."
            aria-label="Tìm kiếm loài chim"
            className="w-full pl-9 pr-8 py-2 text-sm bg-paper-50 border border-paper-border rounded-lg text-ink-900 placeholder:text-ink-muted/80 focus:outline-none focus:ring-2 focus:ring-natural-moss/40 focus:border-natural-moss/70 transition-all font-sans shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-ink-muted hover:text-ink-900 transition-colors"
            >
              <X className="w-4 h-4 p-0.5 rounded-full hover:bg-paper-200" />
            </button>
          )}
        </div>

        {/* Filter controls & count */}
        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          
          {/* Endemic toggle button */}
          <button
            type="button"
            onClick={() => setOnlyEndemic(!onlyEndemic)}
            aria-pressed={onlyEndemic}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              onlyEndemic
                ? 'bg-amber-100/90 text-amber-950 border-amber-400/80 shadow-sm ring-1 ring-amber-300'
                : 'bg-paper-50 text-ink-700 hover:text-ink-900 border-paper-border hover:bg-paper-200/60'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyEndemic ? 'text-amber-600 fill-amber-500' : 'text-ink-400'
              }`}
            />
            <span>⭐ Chim Đặc hữu</span>
          </button>

          {/* Order dropdown */}
          <div className="relative inline-flex items-center">
            <label htmlFor="order-filter-select" className="sr-only">
              Lọc theo Bộ chim
            </label>
            <div className="absolute left-2.5 pointer-events-none text-ink-500">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <select
              id="order-filter-select"
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              aria-label="Lọc theo Bộ chim"
              className="pl-8 pr-7 py-1.5 bg-paper-50 border border-paper-border rounded-lg text-xs font-medium text-ink-800 focus:outline-none focus:ring-2 focus:ring-natural-moss/40 cursor-pointer hover:bg-paper-200/60 transition-colors appearance-none shadow-sm"
            >
              <option value="all">Tất cả các bộ chim</option>
              {orderOptions.map(([orderKey, orderLabel]) => (
                <option key={orderKey} value={orderKey}>
                  {orderLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Conservation IUCN dropdown */}
          <div className="relative inline-flex items-center">
            <label htmlFor="iucn-filter-select" className="sr-only">
              Lọc theo Bậc bảo tồn IUCN
            </label>
            <div className="absolute left-2.5 pointer-events-none text-ink-500">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <select
              id="iucn-filter-select"
              value={selectedConservation}
              onChange={(e) => setSelectedConservation(e.target.value)}
              aria-label="Lọc theo Bậc bảo tồn IUCN"
              className="pl-8 pr-7 py-1.5 bg-paper-50 border border-paper-border rounded-lg text-xs font-medium text-ink-800 focus:outline-none focus:ring-2 focus:ring-natural-moss/40 cursor-pointer hover:bg-paper-200/60 transition-colors appearance-none shadow-sm"
            >
              {IUCN_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Đặt lại tất cả bộ lọc"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-natural-terracotta hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          )}

          {/* Species count summary */}
          <div className="ml-auto font-mono text-xs text-ink-600 bg-paper-200/60 border border-paper-border px-2.5 py-1 rounded-md">
            <span>Hiển thị </span>
            <strong className="text-ink-900 font-semibold">{filteredSpecies.length}</strong>
            <span className="text-ink-500"> / {allSpecies.length} loài</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SearchFilterBar;
