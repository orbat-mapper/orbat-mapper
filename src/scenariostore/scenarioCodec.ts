// ScenarioCodec — the single seam for the unit/state external ⇄ internal round-trip.
//
// The external Scenario format (scenarioModels.ts) refers to equipment, personnel and
// supplies by *name*; the internal ScenarioState (internalModels.ts) refers to them by
// *id*. That name↔id translation used to be re-implemented in three places that drifted
// independently:
//   - newScenarioStore.prepareScenario   (external → internal, fresh load)
//   - convertUtils.addUnitHierarchy       (external → internal, paste / import)
//   - io.ts serializeUnit / serializeState (internal → external, export)
// This module owns that invariant. The forward direction is shared by both import paths
// via `unitStateToInternal`; the reverse direction lives here as `unitToExternal` /
// `unitStateToExternal` (io.ts delegates to them).

import type { State, Unit } from "@/types/scenarioModels";
import type { NState } from "@/types/internalModels";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { EntityId } from "@/types/base";
import { nanoid } from "@/utils";
import { entriesToExternal, entriesToInternal } from "@/scenariostore/unitResources";
import { klona } from "klona";

/**
 * Name→id maps for the three resource kinds, used when translating an external unit's
 * `update`/`diff` toe groups into internal form. A name with no entry falls back to the
 * name itself (matching the historical `?? name` behaviour), which lets a later pass
 * resolve or mint the id.
 */
export interface ResourceNameToIdMaps {
  equipment: Record<string, string>;
  personnel: Record<string, string>;
  supplies: Record<string, string>;
}

type ExternalToeGroup = NonNullable<State["update"]>;
type InternalToeGroup = NonNullable<NState["update"]>;

// The per-entry name↔id mapping lives in unitResources (shared with time.ts apply logic);
// the codec composes it across the three resource kinds of a state's update/diff block.
function toeGroupToInternal(
  group: ExternalToeGroup,
  maps: ResourceNameToIdMaps,
): InternalToeGroup {
  return {
    equipment: entriesToInternal(group.equipment, (name) => maps.equipment[name] ?? name),
    personnel: entriesToInternal(group.personnel, (name) => maps.personnel[name] ?? name),
    supplies: entriesToInternal(group.supplies, (name) => maps.supplies[name] ?? name),
  };
}

// The reverse of toeGroupToInternal: fan the three kinds back through entriesToExternal
// against their catalogs. Shared by the state-block path (update/diff) and the base-unit
// path. `stripEmpty` drops empty arrays to undefined, which the base-unit serialization
// wants but the state-block round-trip does not. A dangling id falls back to itself.
function toeToExternal<
  Eq extends { id: string },
  Pe extends { id: string },
  Su extends { id: string },
>(
  toe: { equipment?: Eq[]; personnel?: Pe[]; supplies?: Su[] },
  scnState: ScenarioState,
  { stripEmpty = false }: { stripEmpty?: boolean } = {},
) {
  const convert = <E extends { id: string }>(
    entries: E[] | undefined,
    catalog: Record<string, { name: string }>,
  ) => {
    const out = entriesToExternal(entries, (id) => catalog[id]?.name ?? id);
    return stripEmpty && !out?.length ? undefined : out;
  };
  return {
    equipment: convert(toe.equipment, scnState.equipmentMap),
    personnel: convert(toe.personnel, scnState.personnelMap),
    supplies: convert(toe.supplies, scnState.supplyCategoryMap),
  };
}

/**
 * Forward: translate one external `State` into an internal `NState`, rewriting the
 * `update`/`diff` toe groups from names to ids. Every other field is passed through
 * untouched — callers are expected to have already internalized timestamps and status.
 *
 * Shared by `prepareScenario` and `addUnitHierarchy` so the two import paths cannot drift.
 */
export function unitStateToInternal(state: State, maps: ResourceNameToIdMaps): NState {
  const { update, diff, ...rest } = state;
  return {
    ...rest,
    update: update ? toeGroupToInternal(update, maps) : undefined,
    diff: diff ? toeGroupToInternal(diff, maps) : undefined,
  };
}

/**
 * Reverse: translate one internal `NState` back into an external `State`, rewriting the
 * `update`/`diff` toe groups and `status` from ids to names.
 */
export function unitStateToExternal(s: NState, scnState: ScenarioState): State {
  // Clone only the fields we keep verbatim; update/diff/status are rebuilt below, so
  // cloning their (toe-array-heavy) subtrees would be wasted work.
  const { update, diff, status, ...rest } = s;
  const c = klona(rest) as State;

  if (diff) c.diff = toeToExternal(diff, scnState);
  if (update) c.update = toeToExternal(update, scnState);
  if (status) c.status = scnState.unitStatusMap[status]?.name;

  return c;
}

export type SerializeUnitOptions = {
  newId?: boolean;
  includeSubUnits?: boolean;
};

/** Reverse: an internal unit (and, by default, its subtree) back to external form. */
export function unitToExternal(
  unitId: EntityId,
  scnState: ScenarioState,
  options: SerializeUnitOptions = {},
): Unit {
  const { newId = false, includeSubUnits = true } = options;
  const nUnit = scnState.unitMap[unitId];
  const { equipment, personnel, supplies } = toeToExternal(nUnit, scnState, {
    stripEmpty: true,
  });
  let rangeRings = nUnit.rangeRings?.map(({ group, ...rest }) => {
    return group ? { group: scnState.rangeRingGroupMap[group].name, ...rest } : rest;
  });

  if (rangeRings?.length === 0) rangeRings = undefined;
  const { id, state, _basePid, _baseSubUnits, ...rest } = nUnit;

  return {
    id: newId ? nanoid() : id,
    ...rest,
    status: nUnit.status ? scnState.unitStatusMap[nUnit.status]?.name : undefined,
    subUnits: includeSubUnits
      ? (_baseSubUnits ?? nUnit.subUnits).map((subUnitId) =>
          unitToExternal(subUnitId, scnState, options),
        )
      : [],
    equipment,
    personnel,
    supplies,
    rangeRings,
    state: state ? state.map((s) => unitStateToExternal(s, scnState)) : undefined,
  };
}
