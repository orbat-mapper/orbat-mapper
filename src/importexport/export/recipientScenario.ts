import type { Scenario, Side, SideGroup, Unit } from "@/types/scenarioModels";
import type { OrbatMapperExportSettings } from "@/types/importExport";
import type { EntityId } from "@/types/base";
import type { ScenarioState } from "@/scenariostore/newScenarioStore";
import type { NUnit } from "@/types/internalModels";
import { isUnitHiddenInState } from "@/scenariostore/unitManipulations";

/** A unit as it is drawn at the current scenario time. */
export type SnapshotUnit = Pick<
  Unit,
  "id" | "name" | "shortName" | "sidc" | "symbolOptions" | "status"
> & {
  location?: Unit["location"] | null;
};

/** The units of the selected snapshot groups, read at the snapshot time. */
export interface SnapshotSource {
  timestamp: number;
  /** Every unit under each snapshot group, subordinates included, in ORBAT order. */
  unitsByGroup: Record<EntityId, SnapshotUnit[]>;
}

type SnapshotSettings = Pick<
  OrbatMapperExportSettings,
  "sideGroups" | "snapshotGroupIds" | "snapshotTime"
>;

function toSnapshotUnit(unit: NUnit, state: ScenarioState): SnapshotUnit {
  const current = unit._state;
  const symbolOptions = { ...unit.symbolOptions, ...current?.symbolOptions };
  // A state entry with `status: null` clears the base status, so only an unset
  // current status falls back to it.
  const statusId = current?.status === undefined ? unit.status : current.status;
  const status = statusId ? state.unitStatusMap[statusId]?.name : undefined;
  return {
    id: unit.id,
    name: unit.name,
    ...(unit.shortName ? { shortName: unit.shortName } : {}),
    sidc: current?.sidc || unit.sidc,
    ...(Object.keys(symbolOptions).length ? { symbolOptions } : {}),
    ...(status ? { status } : {}),
    location: current?.location ?? null,
  };
}

/**
 * Reads the units of the selected snapshot groups at the snapshot time, the current
 * time by default. The scenario time is moved there and back, as the KML export does
 * for event times, and only when there is a snapshot group to read.
 */
export function snapshotSourceAt(
  scenario: {
    store: { state: ScenarioState };
    time: { setCurrentTime(timestamp: number): void };
    unitActions: { walkItem(itemId: EntityId, callback: (unit: NUnit) => void): void };
  },
  settings: SnapshotSettings,
): SnapshotSource {
  const { state } = scenario.store;
  const currentTime = state.currentTime;
  const timestamp = settings.snapshotTime ?? currentTime;
  const groupIds = (settings.snapshotGroupIds ?? []).filter((id) =>
    settings.sideGroups.includes(id),
  );
  const moved = groupIds.length > 0 && timestamp !== currentTime;
  if (moved) scenario.time.setCurrentTime(timestamp);
  try {
    const unitsByGroup: SnapshotSource["unitsByGroup"] = {};
    for (const groupId of groupIds) {
      const units: SnapshotUnit[] = (unitsByGroup[groupId] = []);
      scenario.unitActions.walkItem(groupId, (unit) => {
        // Units hidden on the map are not drawn, so a snapshot must not show them.
        if (!isUnitHiddenInState(state, unit)) units.push(toSnapshotUnit(unit, state));
      });
    }
    return { timestamp, unitsByGroup };
  } finally {
    if (moved) scenario.time.setCurrentTime(currentTime);
  }
}

// A snapshot group shows where its units are now and, unless left out, their status.
// Nothing else: no history or plans, descriptions, resources, range rings or chain of
// command.
function snapshotGroup(
  group: SideGroup,
  source: SnapshotSource,
  includeStatus: boolean,
): SideGroup {
  return {
    id: group.id,
    name: group.name,
    ...(group.symbolOptions ? { symbolOptions: group.symbolOptions } : {}),
    snapshotTime: new Date(source.timestamp).toISOString(),
    subUnits: (source.unitsByGroup[group.id] ?? [])
      .filter((unit) => unit.location)
      .map(({ location, status, ...unit }) => ({
        ...unit,
        ...(includeStatus && status ? { status } : {}),
        location: location!,
      })),
  };
}

// A side seen only through snapshot groups keeps its identity, not its description or
// the units attached directly to it.
function snapshotSide({ id, name, standardIdentity, symbolOptions }: Side) {
  return { id, name, standardIdentity, ...(symbolOptions ? { symbolOptions } : {}) };
}

function recipientEvents(
  scenario: Scenario,
  settings: Pick<OrbatMapperExportSettings, "includeEvents" | "excludeFutureEvents">,
  snapshotSource: SnapshotSource,
) {
  if (settings.includeEvents === false) return [];
  if (!settings.excludeFutureEvents) return scenario.events;
  const until = snapshotSource.timestamp;
  return scenario.events.filter((event) => +new Date(event.startTime) <= until);
}

/** Shared by the preview and download so both include exactly the same content. */
export function buildRecipientScenario(
  scenario: Scenario,
  settings: Pick<
    OrbatMapperExportSettings,
    | "sideGroups"
    | "emptySideIds"
    | "layerIds"
    | "scenarioName"
    | "snapshotGroupIds"
    | "includeSnapshotStatus"
    | "includeEvents"
    | "excludeFutureEvents"
  >,
  snapshotSource: SnapshotSource,
): Scenario {
  const snapshotIds = settings.snapshotGroupIds ?? [];
  const isSnapshot = (group: SideGroup) => snapshotIds.includes(group.id);
  return {
    ...scenario,
    name: settings.scenarioName || scenario.name,
    events: recipientEvents(scenario, settings, snapshotSource),
    sides: scenario.sides
      .filter((side) =>
        side.groups.length
          ? side.groups.some((group) => settings.sideGroups.includes(group.id))
          : settings.emptySideIds?.includes(side.id),
      )
      .map((side) => {
        const groups = side.groups
          .filter((group) => settings.sideGroups.includes(group.id))
          .map((group) =>
            isSnapshot(group)
              ? snapshotGroup(
                  group,
                  snapshotSource,
                  settings.includeSnapshotStatus !== false,
                )
              : group,
          );
        const onlySnapshots = groups.length > 0 && groups.every(isSnapshot);
        return { ...(onlySnapshots ? snapshotSide(side) : side), groups };
      }),
    layerStack:
      settings.layerIds === undefined
        ? scenario.layerStack
        : scenario.layerStack.filter(
            (layer) =>
              layer.kind === "rangeRings" || settings.layerIds!.includes(layer.id),
          ),
  };
}
