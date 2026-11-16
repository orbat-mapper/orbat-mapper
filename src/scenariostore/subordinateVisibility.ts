import { echelonSizeKey, NO_ECHELON } from "@/symbology/echelonSize";
import type { EntityId } from "@/types/base";
import type { NUnit } from "@/types/internalModels";

/** Which subordinates of a unit stay visible on the map. Leaving both unset keeps
 *  the whole branch. */
export interface SubordinateCutoff {
  /** Levels below the unit to keep: 1 keeps its direct subordinates only. */
  maxDepth?: number;
  /** Smallest echelon code to keep, such as "21" for Division. */
  minEchelon?: string;
}

/**
 * Splits the branches under `rootIds` into units to show and units to hide.
 * A subordinate is hidden when it is deeper than `maxDepth` or smaller than
 * `minEchelon`, and its own subordinates are hidden with it. The roots and
 * everything kept are shown. A unit kept under one root but cut under another
 * (nested roots) is hidden.
 */
export function partitionBranchVisibility(
  unitMap: Record<EntityId, NUnit>,
  rootIds: Iterable<EntityId>,
  cutoff: SubordinateCutoff,
): { show: Set<EntityId>; hide: Set<EntityId> } {
  const { maxDepth = Infinity } = cutoff;
  const minEchelon = cutoff.minEchelon === undefined ? 0 : Number(cutoff.minEchelon);
  const show = new Set<EntityId>();
  const hide = new Set<EntityId>();

  function isCut(unit: NUnit, depth: number) {
    if (depth > maxDepth) return true;
    if (!minEchelon) return false;
    const echelon = echelonSizeKey(unit._state?.sidc ?? unit.sidc);
    // Units without an echelon go with their superior.
    return echelon !== NO_ECHELON && Number(echelon) < minEchelon;
  }

  function walk(unitId: EntityId, depth: number, hidden: boolean) {
    const unit = unitMap[unitId];
    if (!unit) return;
    const isHidden = hidden || (depth > 0 && isCut(unit, depth));
    if (isHidden) {
      hide.add(unitId);
      show.delete(unitId);
    } else if (!hide.has(unitId)) show.add(unitId);
    unit.subUnits.forEach((id) => walk(id, depth + 1, isHidden));
  }

  for (const rootId of rootIds) walk(rootId, 0, false);
  return { show, hide };
}
