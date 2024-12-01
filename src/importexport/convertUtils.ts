import { Unit, type UnitStatus } from "@/types/scenarioModels";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import { NState, NUnitAdd, NUnitEquipment, NUnitPersonnel } from "@/types/internalModels";
import { nanoid } from "@/utils";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import { convertStateToInternalFormat } from "@/scenariostore/newScenarioStore";
import { RangeRing } from "@/types/scenarioGeoModels";

export type OrbatToTextOptions = {
  indent?: string;
};
export function orbatToText(root: Unit, options: OrbatToTextOptions = {}): string[] {
  const indent = options.indent ?? "\t";
  const result: string[] = [];

  function helper(node: Unit, depth: number = 0) {
    result.push(indent.repeat(depth) + node.name + "\n");
    node.subUnits?.forEach((child: any) => helper(child, depth + 1));
  }

  helper(root);
  return result;
}

export function parseApplicationOrbat(text: string): Unit[] | null {
  const obj = JSON.parse(text);
  if (Array.isArray(obj)) {
    return obj;
  }
  return null;
}

type AddUnitHierarchyOptions = {
  newIds?: boolean;
  includeState?: boolean;
};

export function addUnitHierarchy(
  rootUnit: Unit,
  parentId: EntityId,
  scenario: TScenario,
  options: AddUnitHierarchyOptions = {},
) {
  const newIds = options.newIds ?? true;
  const includeState = options.includeState ?? false;
  const noUndo = true;
  const { store, unitActions } = scenario;
  const { side } = unitActions.getUnitHierarchy(parentId);
  const tempUnitStatusIdMap: Record<string, string> = {};
  for (const us of Object.values(store.state.unitStatusMap)) {
    tempUnitStatusIdMap[us.name] = us.id;
  }

  store.update((s) => {
    function addUnitStatus(unitStatus: UnitStatus) {
      const id = nanoid();
      tempUnitStatusIdMap[unitStatus.name] = id;
      s.unitStatusMap[id] = { ...unitStatus, id };
      return id;
    }

    function helper(unit: Unit, parentId: EntityId, depth: number = 0) {
      const equipment: NUnitEquipment[] = [];
      const personnel: NUnitPersonnel[] = [];
      const rangeRings: RangeRing[] = [];
      unit.equipment?.forEach(({ name, count, onHand }) => {
        const { id } =
          s.equipmentMap[name] ||
          unitActions.addEquipment({ id: name, name }, { noUndo, s });
        equipment.push({ id, count, onHand });
      });
      unit.personnel?.forEach(({ name, count, onHand }) => {
        const { id } =
          s.personnelMap[name] ||
          unitActions.addPersonnel({ id: name, name }, { noUndo, s });
        personnel.push({ id, count, onHand });
      });

      unit.rangeRings?.forEach((rr) => {
        const { group, ...rest } = rr;
        if (group) {
          let groupId = group
            ? Object.values(s.rangeRingGroupMap).find((g) => g.name === group)?.id
            : "";
          if (!groupId) {
            groupId = nanoid();
            s.rangeRingGroupMap[groupId] = { id: groupId, name: group };
          }
          rangeRings.push({ ...rest, group: groupId });
        } else {
          rangeRings.push(rr);
        }
      });
      const unitState =
        includeState && unit.state
          ? [...unit.state].map((s) =>
              newIds
                ? convertStateToInternalFormat({ ...s, id: "" })
                : convertStateToInternalFormat(s),
            )
          : [];

      unitState
        .filter((s) => s.status)
        .forEach((s) => {
          s.status = tempUnitStatusIdMap[s.status!] || addUnitStatus({ name: s.status! });
        });

      const internalUnitState: NState[] = unitState.map((s) => {
        const { update, diff, ...rest } = s;
        const newUpdate = update
          ? {
              equipment: update.equipment?.map((e) => {
                const { name, ...rest } = e;
                return { id: name, ...rest };
              }),
              personnel: update.personnel?.map((p) => {
                const { name, ...rest } = p;
                return { id: name, ...rest };
              }),
            }
          : undefined;
        const newDiff = diff
          ? {
              equipment: diff.equipment?.map((e) => {
                const { name, ...rest } = e;
                return { id: name, ...rest };
              }),
              personnel: diff.personnel?.map((p) => {
                const { name, ...rest } = p;
                return { id: name, ...rest };
              }),
            }
          : undefined;
        return {
          ...rest,
          update: newUpdate,
          diff: newDiff,
        };
      });

      let status = undefined;
      if (unit.status) {
        status = tempUnitStatusIdMap[unit.status] || addUnitStatus({ name: unit.status });
      }

      let id = newIds ? nanoid() : (unit.id ?? nanoid());
      if (id in store.state.unitMap) {
        console.warn(
          `Unit  ${unit.name} with id ${id} already exists in the scenario. Creating new id.`,
        );
        id = nanoid();
      }
      const newUnit: NUnitAdd = {
        ...unit,
        id,
        sidc: setCharAt(unit.sidc, SID_INDEX, side.standardIdentity),
        subUnits: [],
        equipment,
        personnel,
        state: internalUnitState,
        rangeRings: rangeRings,
        status,
      };
      unitActions.addUnit(newUnit, parentId, undefined, { noUndo, s });
      unit.subUnits?.forEach((child) => helper(child, newUnit.id!));
    }

    helper(rootUnit, parentId);
  });
}
