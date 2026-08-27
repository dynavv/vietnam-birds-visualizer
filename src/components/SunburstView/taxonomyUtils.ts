import type { TaxonomyNode } from '../../types/bird';

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
