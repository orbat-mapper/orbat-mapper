import type { EntityId } from "@/types/base";
import type { NOrbatItemData } from "@/types/internalModels";

function normalizeExpandedKeys(
  expandedKeys: ReadonlySet<EntityId> | EntityId[],
): Set<EntityId> {
  return expandedKeys instanceof Set ? expandedKeys : new Set(expandedKeys);
}

export function flattenVisibleTreeIds(
  items: NOrbatItemData[],
  expandedKeys: ReadonlySet<EntityId> | EntityId[],
): EntityId[] {
  const expandedSet = normalizeExpandedKeys(expandedKeys);
  const ids: EntityId[] = [];

  const walk = (nodes: NOrbatItemData[]) => {
    for (const node of nodes) {
      ids.push(node.unit.id);
      if (node.children.length && expandedSet.has(node.unit.id)) {
        walk(node.children);
      }
    }
  };

  walk(items);
  return ids;
}

export function getVisibleTreeIndexByUnitId(
  visibleUnitIds: readonly EntityId[],
  unitId: EntityId,
): number {
  return visibleUnitIds.indexOf(unitId);
}

export function shouldVirtualizeTree(
  visibleItemCount: number,
  threshold: number,
): boolean {
  return visibleItemCount >= threshold;
}
