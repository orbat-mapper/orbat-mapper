import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { EntityId } from "@/types/base";
import type { NRangeRingGroup } from "@/types/internalModels";
import type { RangeRing } from "@/types/scenarioGeoModels";

export interface RangeRingEntry {
  /** Unit id and ring index, unique across the scenario. */
  key: string;
  unitId: EntityId;
  unitName: string;
  index: number;
  ring: RangeRing;
}

export interface RangeRingGroupEntry {
  group: NRangeRingGroup;
  rings: RangeRingEntry[];
  unitCount: number;
}

export interface RangeRingLayerEntries {
  groups: RangeRingGroupEntry[];
  ungrouped: RangeRingEntry[];
  ringCount: number;
}

const byUnitName = (a: RangeRingEntry, b: RangeRingEntry) =>
  a.unitName.localeCompare(b.unitName) || a.index - b.index;

/** Every range ring in the scenario, sorted by unit name under its group. */
export function getRangeRingLayerEntries(state: ScenarioState): RangeRingLayerEntries {
  const ringsByGroup = new Map<string, RangeRingEntry[]>();
  const ungrouped: RangeRingEntry[] = [];
  let ringCount = 0;
  for (const unit of Object.values(state.unitMap)) {
    unit.rangeRings?.forEach((ring, index) => {
      ringCount++;
      const entry = {
        key: `${unit.id}-${index}`,
        unitId: unit.id,
        unitName: unit.name,
        index,
        ring,
      };
      if (!ring.group) {
        ungrouped.push(entry);
        return;
      }
      const rings = ringsByGroup.get(ring.group) ?? [];
      rings.push(entry);
      ringsByGroup.set(ring.group, rings);
    });
  }
  const groups = Object.values(state.rangeRingGroupMap).map((group) => {
    const rings = (ringsByGroup.get(group.id) ?? []).sort(byUnitName);
    return { group, rings, unitCount: new Set(rings.map((r) => r.unitId)).size };
  });
  return { groups, ungrouped: ungrouped.sort(byUnitName), ringCount };
}
