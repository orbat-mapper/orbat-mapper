import { Unit, UnitEquipment } from "@/types/scenarioModels";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import {
  EUnitEquipment,
  NUnitAdd,
  NUnitEquipment,
  NUnitPersonnel,
} from "@/types/internalModels";
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

  store.update((s) => {
    function helper(unit: Unit, parentId: EntityId, depth: number = 0) {
      const equipment: NUnitEquipment[] = [];
      const personnel: NUnitPersonnel[] = [];
      const rangeRings: RangeRing[] = [];
      unit.equipment?.forEach(({ name, count }) => {
        const { id } =
          s.equipmentMap[name] ||
          unitActions.addEquipment({ id: name, name }, { noUndo, s });
        equipment.push({ id, count });
      });
      unit.personnel?.forEach(({ name, count }) => {
        const { id } =
          s.personnelMap[name] ||
          unitActions.addPersonnel({ id: name, name }, { noUndo, s });
        personnel.push({ id: name, count });
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

      const newUnit: NUnitAdd = {
        ...unit,
        id: newIds ? nanoid() : (unit.id ?? nanoid()),
        sidc: setCharAt(unit.sidc, SID_INDEX, side.standardIdentity),
        subUnits: [],
        equipment,
        personnel,
        state:
          includeState && unit.state
            ? [...unit.state].map((s) =>
                newIds
                  ? convertStateToInternalFormat({ ...s, id: "" })
                  : convertStateToInternalFormat(s),
              )
            : [],
        rangeRings: rangeRings,
      };
      unitActions.addUnit(newUnit, parentId, undefined, { noUndo, s });
      unit.subUnits?.forEach((child) => helper(child, newUnit.id!));
    }

    helper(rootUnit, parentId);
  });
}
