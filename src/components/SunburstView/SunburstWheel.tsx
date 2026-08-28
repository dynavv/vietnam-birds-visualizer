import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import {
  RotateCcw,
  Layers,
  ChevronLeft
} from 'lucide-react';
import type { TaxonomyNode, BirdSpecies } from '../../types/bird';
import { useTaxonomy } from '../../context/TaxonomyContext';

export interface SunburstWheelProps {
  data?: TaxonomyNode;
  width?: number;
  height?: number;
  onSelectSpecies?: (speciesId: string) => void;
  onHoverNode?: (node: TaxonomyNode | null) => void;
  onZoomNode?: (node: TaxonomyNode) => void;
  activeFocusNode?: TaxonomyNode | null;
  className?: string;
}

interface SunburstHierarchyNode extends d3.HierarchyRectangularNode<TaxonomyNode> {
  current: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
  target: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  };
}

// Visual color palette for orders
const ORDER_COLOR_MAP: Record<string, string> = {
  Passeriformes: '#2D5A27', // Forest Moss
  Piciformes: '#8B4513',    // Bark Brown
  Bucerotiformes: '#B45309', // Ochre Amber
  Coraciiformes: '#0284C7', // Sky Azure
  Strigiformes: '#4338CA',  // Indigo Night
  Accipitriformes: '#991B1B', // Cinnabar Red
  Falconiformes: '#7F1D1D',  // Crimson
  Galliformes: '#A16207',   // Golden Olive
  Columbiformes: '#64748B', // Slate Grey
  Gruiformes: '#0D9488',    // Deep Teal
  Charadriiformes: '#0369A1', // Ocean Blue
  Pelecaniformes: '#0F766E', // Emerald Cyan
  Ciconiiformes: '#475569', // Iron Grey
  Anseriformes: '#15803D',  // Meadow Green
  Cuculiformes: '#D97706',  // Amber Terracotta
  Caprimulgiformes: '#78350F' // Chestnut
};

export const SunburstWheelComponent: React.FC<SunburstWheelProps> = ({
  data: propData,
  width = 750,
  height = 750,
  onSelectSpecies,
  onHoverNode,
  onZoomNode,
  activeFocusNode,
  className = ''
}) => {
  const {
    taxonomyTree,
    selectSpecies,
    setHoveredTaxonNode,
    allSpecies
  } = useTaxonomy();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const rawTreeData = propData || taxonomyTree;

  // Track the current zoom focus node
  const [currentZoomNode, setCurrentZoomNode] = useState<TaxonomyNode>(rawTreeData);
  const [hoveredNode, setInternalHoveredNode] = useState<TaxonomyNode | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Map of species id -> BirdSpecies for quick metadata lookup
  const speciesMap = useMemo(() => {
    const map = new Map<string, BirdSpecies>();
    if (allSpecies) {
      allSpecies.forEach(sp => map.set(sp.id, sp));
    }
    return map;
  }, [allSpecies]);

  // Radius configuration
  const radius = width / 2;
  const centerRadius = radius * 0.22;
  const ringWidth = (radius - centerRadius) / 4;

  // Zoom to a specific node function
  const zoomToNode = useCallback(
    (node: TaxonomyNode) => {
      setCurrentZoomNode(node);
      setIsZoomed(node !== rawTreeData && node.name !== rawTreeData.name);
      if (onZoomNode) {
        onZoomNode(node);
      }
    },
    [rawTreeData, onZoomNode]
  );

  // Reset zoom back to root
  const resetZoom = useCallback(() => {
    zoomToNode(rawTreeData);
  }, [rawTreeData, zoomToNode]);

  // Handle external focus node prop change
  useEffect(() => {
    if (activeFocusNode) {
      setCurrentZoomNode(activeFocusNode);
      setIsZoomed(activeFocusNode !== rawTreeData && activeFocusNode.name !== rawTreeData.name);
    }
  }, [activeFocusNode, rawTreeData]);

  // Main D3 Rendering & Interactive Zoom Logic
  useEffect(() => {
    if (!svgRef.current || !rawTreeData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Build hierarchy and partition
    const root = d3
      .hierarchy<TaxonomyNode>(rawTreeData)
      .sum(d => (d.children && d.children.length > 0 ? 0 : 1))
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const partition = d3
      .partition<TaxonomyNode>()
      .size([2 * Math.PI, root.height + 1]);

    const partitionRoot = partition(root) as unknown as SunburstHierarchyNode;

    // Initialize current and target states for each node
    partitionRoot.each(d => {
      d.current = {
        x0: d.x0,
        x1: d.x1,
        y0: d.y0,
        y1: d.y1
      };
      d.target = {
        x0: d.x0,
        x1: d.x1,
        y0: d.y0,
        y1: d.y1
      };
    });

    // Helper: Compute radial distance from depth
    const getInnerRadius = (depth: number) => {
      if (depth === 0) return 0;
      return centerRadius + (depth - 1) * ringWidth;
    };

    const getOuterRadius = (depth: number) => {
      if (depth === 0) return centerRadius;
      return centerRadius + depth * ringWidth - 1.5;
    };

    // Arc Generator
    const arc = d3
      .arc<SunburstHierarchyNode['current']>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => Math.max(0, getInnerRadius(d.y0)))
      .outerRadius(d => Math.max(0, getOuterRadius(d.y0)))
      .padAngle(d => (d.y0 > 1 ? 0.003 : 0.005))
      .padRadius(radius / 2)
      .cornerRadius(2);

    // Filter descendants (exclude root depth 0 from outer rings)
    const descendants = partitionRoot.descendants().slice(1) as SunburstHierarchyNode[];

    // Main Group Container centered at (0, 0)
    const g = svg
      .attr('viewBox', `-${radius} -${radius} ${width} ${height}`)
      .style('font-family', 'ui-serif, Georgia, Cambria, serif')
      .append('g');

    // Node Color Resolver
    const getNodeColor = (d: SunburstHierarchyNode) => {
      // Find ancestor order
      const ancestors = d.ancestors();
      const orderNode = ancestors.find(a => a.data.rank === 'order');
      const orderName = orderNode ? orderNode.data.name : d.data.name;
      const baseColor =
        ORDER_COLOR_MAP[orderName] ||
        d.data.color ||
        (orderNode ? orderNode.data.color : '#2D5A27') ||
        '#2D5A27';

      // Vary tone slightly per rank depth
      if (d.data.rank === 'order') return baseColor;
      if (d.data.rank === 'family') return d3.color(baseColor)?.brighter(0.2)?.formatHex() || baseColor;
      if (d.data.rank === 'genus') return d3.color(baseColor)?.brighter(0.45)?.formatHex() || baseColor;
      if (d.data.rank === 'species') {
        // Highlight endemic species with golden warmth
        const sp = d.data.speciesId ? speciesMap.get(d.data.speciesId) : null;
        if (sp?.isEndemic) {
          return d3.interpolateRgb(baseColor, '#D97706')(0.4);
        }
        return d3.color(baseColor)?.brighter(0.65)?.formatHex() || baseColor;
      }
      return baseColor;
    };

    // Render Arcs Group
    const pathGroup = g.append('g').attr('class', 'sunburst-arcs');

    const path = pathGroup
      .selectAll<SVGPathElement, SunburstHierarchyNode>('path')
      .data(descendants)
      .join('path')
      .attr('class', 'sunburst-arc cursor-pointer transition-opacity duration-200')
      .attr('data-testid', 'sunburst-arc')
      .attr('data-rank', d => d.data.rank)
      .attr('data-name', d => d.data.name)
      .attr('data-species-id', d => d.data.speciesId || '')
      .attr('fill', d => getNodeColor(d))
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#FAF8F5')
      .attr('stroke-width', d => (d.data.rank === 'order' ? '1.5px' : '0.8px'))
      .attr('d', d => arc(d.current));

    // Render Labels Group
    const labelGroup = g.append('g').attr('class', 'sunburst-labels').attr('pointer-events', 'none');

    const labelVisible = (d: SunburstHierarchyNode['current']) => {
      // Must be at visible depth and angle width threshold per depth
      const isVisibleDepth = d.y0 >= 1 && d.y0 <= 4;
      const angleWidth = d.x1 - d.x0;
      const minAngle = d.y0 === 1 ? 0.08 : d.y0 === 2 ? 0.06 : 0.045;
      return isVisibleDepth && angleWidth > minAngle;
    };

    const labelTransform = (d: SunburstHierarchyNode['current']) => {
      const angle = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const midDepth = d.y0;
      const r = (getInnerRadius(midDepth) + getOuterRadius(midDepth)) / 2;
      const rotate = angle - 90;
      const flip = angle > 90 && angle < 270;
      return `rotate(${rotate}) translate(${r},0) rotate(${flip ? 180 : 0})`;
    };

    const labels = labelGroup
      .selectAll<SVGTextElement, SunburstHierarchyNode>('text')
      .data(descendants)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', d => {
        if (d.data.rank === 'order') return '10.5px';
        if (d.data.rank === 'family') return '9.5px';
        if (d.data.rank === 'genus') return '8.5px';
        return '8px';
      })
      .attr('font-weight', d => (d.data.rank === 'order' || d.data.rank === 'species' ? '600' : '400'))
      .attr('fill', '#FFFFFF')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)')
      .style('user-select', 'none')
      .attr('transform', d => labelTransform(d.current))
      .attr('opacity', d => (labelVisible(d.current) ? 1 : 0))
      .text(d => {
        // Tight length bounds to prevent text bleeding across concentric rings
        const vi = d.data.vietnameseName;
        const name = vi || d.data.name;
        const maxLen = d.data.rank === 'order' ? 12 : d.data.rank === 'family' ? 10 : 9;
        return name.length > maxLen ? `${name.slice(0, maxLen - 1)}…` : name;
      });

    // Zoom Handler Function
    function clicked(_event: MouseEvent, p: SunburstHierarchyNode) {
      if (p.data.rank === 'species' || p.data.speciesId) {
        // If species, trigger selection
        const spId = p.data.speciesId || '';
        if (onSelectSpecies) {
          onSelectSpecies(spId);
        } else if (spId) {
          selectSpecies(spId);
        }
        return;
      }

      // If clicked on current center zoom node, zoom out to parent
      const isCurrentFocus = p.data.name === currentZoomNode.name;
      const targetFocus = isCurrentFocus ? p.parent || partitionRoot : p;

      // Update state
      setCurrentZoomNode(targetFocus.data);
      setIsZoomed(targetFocus !== partitionRoot);

      if (onZoomNode) {
        onZoomNode(targetFocus.data);
      }

      // Calculate target coordinates relative to targetFocus
      partitionRoot.each(d => {
        const x0 = Math.max(0, Math.min(1, (d.x0 - targetFocus.x0) / (targetFocus.x1 - targetFocus.x0))) * 2 * Math.PI;
        const x1 = Math.max(0, Math.min(1, (d.x1 - targetFocus.x0) / (targetFocus.x1 - targetFocus.x0))) * 2 * Math.PI;
        const y0 = Math.max(0, d.y0 - targetFocus.depth);
        const y1 = Math.max(0, d.y1 - targetFocus.depth);

        d.target = { x0, x1, y0, y1 };
      });

      const transition = svg.transition().duration(750).ease(d3.easeCubicOut);

      // Transition paths
      path
        .transition(transition as unknown as d3.Transition<d3.BaseType, unknown, null, undefined>)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target);
          return t => {
            d.current = i(t);
          };
        })
        .filter(function (this: SVGPathElement, d) {
          const currentOpacity = +(this.getAttribute('fill-opacity') ?? '0');
          return currentOpacity > 0 || d.target.y0 >= 1;
        })
        .attr('fill-opacity', d => (d.target.y0 >= 1 && d.target.y0 <= 4 ? 0.9 : 0))
        .attr('pointer-events', d => (d.target.y0 >= 1 && d.target.y0 <= 4 ? 'auto' : 'none'))
        .attrTween('d', d => () => arc(d.current) || '');

      // Transition labels
      labels
        .transition(transition as unknown as d3.Transition<d3.BaseType, unknown, null, undefined>)
        .attr('opacity', d => (labelVisible(d.target) ? 1 : 0))
        .attrTween('transform', d => () => labelTransform(d.current));
    }

    // Attach click events
    path.on('click', clicked);

    // Hover Highlight Interactivity (Filtered to visible arcs only to prevent ghost arcs)
    path
      .on('mouseenter', (_event, d) => {
        const ancestors = d.ancestors();
        const ancestorNames = ancestors.map(a => a.data.name);

        setInternalHoveredNode(d.data);

        if (onHoverNode) {
          onHoverNode(d.data);
        } else {
          setHoveredTaxonNode(d.data);
        }

        // Highlight lineage on visible arcs only
        path
          .filter(node => node.target.y0 >= 1 && node.target.y0 <= 4)
          .attr('fill-opacity', node => (ancestorNames.includes(node.data.name) ? 1.0 : 0.25))
          .attr('stroke', node => (ancestorNames.includes(node.data.name) ? '#FFFFFF' : '#FAF8F5'))
          .attr('stroke-width', node => (ancestorNames.includes(node.data.name) ? '2px' : '0.8px'));
      })
      .on('mouseleave', () => {
        setInternalHoveredNode(null);

        if (onHoverNode) {
          onHoverNode(null);
        } else {
          setHoveredTaxonNode(null);
        }

        // Restore normal opacity on visible arcs only
        path
          .filter(node => node.target.y0 >= 1 && node.target.y0 <= 4)
          .attr('fill-opacity', 0.9)
          .attr('stroke', '#FAF8F5')
          .attr('stroke-width', d => (d.data.rank === 'order' ? '1.5px' : '0.8px'));
      });

    // If external activeFocusNode changed, zoom to it
    if (currentZoomNode && currentZoomNode.name !== rawTreeData.name) {
      const matchNode = partitionRoot.descendants().find(d => d.data.name === currentZoomNode.name);
      if (matchNode) {
        clicked(new MouseEvent('click'), matchNode);
      }
    }

    // Cleanup: Interrupt running transitions on unmount
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').interrupt();
      }
    };
  }, [rawTreeData, width, height, radius, centerRadius, ringWidth, speciesMap, onSelectSpecies, onHoverNode, onZoomNode, selectSpecies, setHoveredTaxonNode]);

  // Center Circle Content Resolver
  const centerDisplay = useMemo(() => {
    const isRoot = !isZoomed || currentZoomNode.name === rawTreeData.name;
    if (isRoot) {
      return {
        title: rawTreeData.vietnameseName || 'Lớp Chim',
        subtitle: rawTreeData.name || 'Aves',
        badge: '16 Bộ Chim',
        hint: 'Nhấp nan quạt để phóng to'
      };
    }

    const rankLabel =
      currentZoomNode.rank === 'order'
        ? 'Bộ'
        : currentZoomNode.rank === 'family'
        ? 'Họ'
        : currentZoomNode.rank === 'genus'
        ? 'Chi'
        : 'Loài';

    return {
      title: currentZoomNode.vietnameseName || currentZoomNode.name,
      subtitle: currentZoomNode.name,
      badge: `${rankLabel} ${currentZoomNode.vietnameseName || ''}`,
      hint: '‹ Nhấp tâm để thu nhỏ'
    };
  }, [isZoomed, currentZoomNode, rawTreeData]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center w-full aspect-square max-w-[760px] mx-auto select-none ${className}`}
      data-testid="sunburst-wheel-container"
    >
      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full drop-shadow-md overflow-visible"
        data-testid="sunburst-svg"
      />

      {/* Center Interactive Hub & Reset Trigger */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all duration-300 group z-10"
        style={{
          width: `${(centerRadius * 2 / (radius * 2)) * 100}%`,
          height: `${(centerRadius * 2 / (radius * 2)) * 100}%`,
          maxWidth: `${centerRadius * 1.9}px`,
          maxHeight: `${centerRadius * 1.9}px`
        }}
        onClick={isZoomed ? resetZoom : undefined}
        title={isZoomed ? 'Thu nhỏ về Lớp Aves (Reset Zoom)' : 'Lớp Chim Việt Nam (Aves)'}
        data-testid="sunburst-center"
      >
        <div className="w-full h-full rounded-full bg-paper-100/95 backdrop-blur-md border-2 border-natural-moss/40 shadow-inner flex flex-col items-center justify-center p-2 group-hover:border-natural-moss transition-all group-hover:scale-105">
          {isZoomed ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-natural-moss/10 text-natural-moss border border-natural-moss/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                <ChevronLeft className="w-3 h-3" />
                <span>Thu nhỏ</span>
              </div>
              <p className="font-serif font-bold text-ink-900 text-xs sm:text-sm line-clamp-1">
                {centerDisplay.title}
              </p>
              <p className="font-sans text-[10px] text-ink-500 italic line-clamp-1">
                {centerDisplay.subtitle}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-6 h-6 mx-auto rounded-full bg-natural-moss/10 flex items-center justify-center text-natural-moss">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-serif font-bold text-ink-900 text-xs sm:text-sm leading-tight">
                {centerDisplay.title}
              </h3>
              <p className="font-serif italic text-[11px] text-natural-forest font-semibold">
                {centerDisplay.subtitle}
              </p>
              <span className="inline-block text-[9.5px] font-mono text-ink-500 bg-paper-200/80 px-1.5 py-0.2 rounded border border-paper-border">
                {centerDisplay.badge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Controls Overlay (Zoom Reset, Info) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
        {isZoomed && (
          <button
            type="button"
            onClick={resetZoom}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-100/95 backdrop-blur-md border border-paper-border rounded-xl text-xs font-semibold text-ink-800 hover:bg-natural-moss hover:text-paper-50 transition-all shadow-md"
            title="Thu nhỏ về toàn cảnh (Zoom out to Root)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Toàn cảnh</span>
          </button>
        )}
      </div>

      {/* Floating Hover Indicator Badge */}
      {hoveredNode && (
        <div className="absolute top-3 left-3 bg-paper-100/95 backdrop-blur-md border border-paper-border rounded-xl px-3 py-1.5 shadow-md pointer-events-none z-20 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-natural-moss animate-pulse" />
          <span className="font-mono text-[10px] uppercase font-bold text-ink-500">
            {hoveredNode.rank}:
          </span>
          <span className="font-serif font-semibold text-ink-900">
            {hoveredNode.vietnameseName || hoveredNode.name}
          </span>
        </div>
      )}
    </div>
  );
};

export const SunburstWheel = React.memo(SunburstWheelComponent);
export default SunburstWheel;

