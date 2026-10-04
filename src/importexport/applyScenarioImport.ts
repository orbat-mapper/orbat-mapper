import { klona } from "klona";
import { isEqual } from "es-toolkit";
import {
  prepareScenario,
  type NewScenarioStore,
  type ScenarioState,
} from "@/scenariostore/newScenarioStore";
import { refreshHierarchyTimelineMetadata } from "@/scenariostore/hierarchy";
import type { planScenarioImport } from "./scenarioImportPlan";

type Plan = ReturnType<typeof planScenarioImport>;
const catalogs = [
  "equipmentMap",
  "personnelMap",
  "supplyClassMap",
  "supplyUomMap",
  "supplyCategoryMap",
  "rangeRingGroupMap",
  "unitStatusMap",
] as const;
/** Reuse target catalog IDs; preparing a file normally creates fresh catalog IDs.
 * Only known reference fields are remapped, never arbitrary authored strings. */
function prepareImport(plan: Plan, current: ScenarioState) {
  const prepared = prepareScenario(klona(plan.scenario));
  const ids = new Map<string, string>();
  for (const key of catalogs) {
    const byName = new Map(Object.values(current[key]).map((e) => [e.name, e.id]));
    for (const entry of Object.values(prepared[key]))
      ids.set(entry.id, byName.get(entry.name) ?? entry.id);
  }
  function remap(value: unknown): void {
    if (!value || typeof value !== "object") return;
    for (const [key, v] of Object.entries(value)) {
      if (
        ["id", "status", "group", "supplyClass", "uom"].includes(key) &&
        typeof v === "string" &&
        ids.has(v)
      )
        (value as Record<string, unknown>)[key] = ids.get(v);
      else remap(v);
    }
  }
  remap(prepared.unitMap);
  for (const key of catalogs) {
    const entries = Object.values(prepared[key]);
    entries.forEach(remap);
    Object.assign(prepared, { [key]: Object.fromEntries(entries.map((e) => [e.id, e])) });
  }
  return prepared;
}

/** Commit the reviewed import atomically in one undo entry. */
export function applyScenarioImport(store: NewScenarioStore, plan: Plan) {
  if (plan.errors.length) throw new Error("Resolve import conflicts first.");
  if (!plan.hasChanges) return;
  const prepared = prepareImport(plan, store.state);
  const modified = new Set(
    plan.changes
      .filter((c) => c.effect === "added" || c.effect === "changed")
      .map((c) => c.id),
  );
  store.update((s) => {
    for (const [id, symbol] of Object.entries(prepared.customSymbolMap))
      if (!(id in s.customSymbolMap)) s.customSymbolMap[id] = symbol;
    for (const key of catalogs)
      for (const [id, entry] of Object.entries(prepared[key])) {
        if (!(id in s[key])) Object.assign(s[key], { [id]: entry });
      }
    for (const key of ["unitMap", "sideGroupMap", "sideMap"] as const) {
      for (const id of Object.keys(s[key])) if (!(id in prepared[key])) delete s[key][id];
      for (const [id, entry] of Object.entries(prepared[key])) {
        if (modified.has(id) || !s[key][id]) {
          const old = s[key][id];
          Object.assign(s[key], {
            [id]: { ...entry, _isOpen: old?._isOpen ?? entry._isOpen },
          });
        } else {
          const old = s[key][id];
          // A new group may extend an existing side outside the copied scope.
          if (!isEqual(old._baseSubUnits, entry._baseSubUnits))
            old._baseSubUnits = entry._baseSubUnits;
          if ("groups" in old && "groups" in entry && !isEqual(old.groups, entry.groups))
            old.groups = entry.groups;
        }
      }
    }
    if (!isEqual(s.sides, prepared.sides)) s.sides = prepared.sides;
    refreshHierarchyTimelineMetadata(s);
    s.hierarchyProjectionVersion = -1;
    s.unitStateCounter++;
  });
}
