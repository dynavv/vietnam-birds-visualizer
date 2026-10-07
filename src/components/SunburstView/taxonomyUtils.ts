import * as d3 from 'd3';
import type { TaxonomyNode } from '../../types/bird';

/**
 * Heritage Naturalist Chromatics Palette for 17 Orders of Vietnam Avifauna
 */
export const ORDER_COLOR_MAP: Record<string, string> = {
  Passeriformes: '#1E4D2B',    // British Racing / Forest Moss
  Galliformes: '#C26700',      // Warm Amber Gold
  Bucerotiformes: '#C2410C',   // Burnt Terracotta
  Coraciiformes: '#0284C7',    // Sky Azure / Aegean
  Piciformes: '#78350F',       // Antique Bark
  Accipitriformes: '#991B1B',  // Crimson Clay
  Falconiformes: '#881337',   // Claret Garnet
  Strigiformes: '#3730A3',     // Midnight Indigo
  Pelecaniformes: '#0F766E',   // Deep Ocean Teal
  Gruiformes: '#047857',       // Jade Emerald
  Columbiformes: '#475569',    // Heather Slate
  Ciconiiformes: '#475569',    // Heather Slate / Stork
  Anseriformes: '#166534',     // Pine Laurel
  Cuculiformes: '#B45309',     // Spiced Ochre
  Trogoniformes: '#0D9488',    // Persian Green
  Caprimulgiformes: '#713F12', // Tawny Chestnut
  Charadriiformes: '#0369A1'   // Cerulean Blue
};

/**
 * Calculates the precise hierarchical hex color matching the Sunburst wheel:
 * Class -> Order -> Family (sibling hue variance) -> Genus (brighter) -> Species (luminous / #D97706 for endemics)
 */
export function getTaxonColor(
  node: TaxonomyNode,
  lineage?: TaxonomyNode[],
  _isEndemic?: boolean
): string {
  if (!node) return '#2D5A27';

  // 1. Class level
  if (node.rank === 'class') {
    return node.color || '#1C1917';
  }

  // 2. Order level
  if (node.rank === 'order') {
    return ORDER_COLOR_MAP[node.name] || node.color || '#2D5A27';
  }

  const orderNode = lineage?.find(n => n.rank === 'order');
  const orderName = orderNode ? orderNode.name : '';
  const baseColor = ORDER_COLOR_MAP[orderName] || orderNode?.color || node.color || '#2D5A27';

  // 3. Family level: Introduce sibling hue variance to prevent monotonic blocks
  if (node.rank === 'family') {
    let hueShift = 0;
    if (orderNode?.children && orderNode.children.length > 1) {
      const siblingIndex = orderNode.children.findIndex(c => c.name === node.name);
      const totalSiblings = orderNode.children.length;
      const idx = siblingIndex >= 0 ? siblingIndex : 0;
      hueShift = (idx / (totalSiblings - 1) - 0.5) * 28;
    }
    const hsl = d3.hsl(baseColor);
    hsl.h = (hsl.h + hueShift + 360) % 360;
    hsl.l = Math.min(0.72, Math.max(0.28, hsl.l + 0.08));
    return hsl.formatHex();
  }

  // 4. Genus level: Lighter tone than family
  if (node.rank === 'genus') {
    const familyNode = lineage?.find(n => n.rank === 'family');
    const familyColor = familyNode ? getTaxonColor(familyNode, lineage) : baseColor;
    return d3.color(familyColor)?.brighter(0.35)?.formatHex() || baseColor;
  }

  // 5. Species level: Continuous genus-derived tint
  if (node.rank === 'species') {
    const genusNode = lineage?.find(n => n.rank === 'genus');
    const genusColor = genusNode ? getTaxonColor(genusNode, lineage) : baseColor;
    return d3.color(genusColor)?.brighter(0.55)?.formatHex() || baseColor;
  }

  return baseColor;
}

/**
 * Searches the taxonomy tree and returns the array of nodes forming the path
 * from root (Class Aves) to the target node or target speciesId.
 */
export function getTaxonomyLineage(
  root: TaxonomyNode,
  target: TaxonomyNode | string | null | undefined
): TaxonomyNode[] {
  if (!target || !root) return [root];

  const targetIdentifier = typeof target === 'string' ? target : target.speciesId || target.name;

  const path: TaxonomyNode[] = [];

  function findPath(currentNode: TaxonomyNode): boolean {
    path.push(currentNode);

    // Direct match check
    if (
      (typeof target === 'object' && currentNode === target) ||
      currentNode.name === targetIdentifier ||
      (currentNode.speciesId && currentNode.speciesId === targetIdentifier)
    ) {
      return true;
    }

    if (currentNode.children && currentNode.children.length > 0) {
      for (const child of currentNode.children) {
        if (findPath(child)) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  }

  findPath(root);
  return path.length > 0 ? path : [root];
}
