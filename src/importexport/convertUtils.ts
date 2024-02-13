import { Unit, UnitEquipment } from "@/types/scenarioModels";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import { EUnitEquipment, NUnitAdd, NUnitEquipment } from "@/types/internalModels";
import { nanoid } from "@/utils";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";

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
};

export function addUnitHierarchy(
  rootUnit: Unit,
  parentId: EntityId,
  scenario: TScenario,
  options: AddUnitHierarchyOptions = {},
) {
  const newIds = options.newIds ?? true;
  const { store, unitActions } = scenario;
  const { side } = unitActions.getUnitHierarchy(parentId);

  store.groupUpdate(() => {
    function helper(unit: Unit, parentId: EntityId, depth: number = 0) {
      const equipment: NUnitEquipment[] = [];
      unit.equipment?.forEach(({ name, count }) => {
        const { id } =
          store.state.equipmentMap[name] || unitActions.addEquipment({ id: name, name });
        equipment.push({ id, count });
      });

      const newUnit: NUnitAdd = {
        ...unit,
        id: newIds ? nanoid() : unit.id ?? nanoid(),
        sidc: setCharAt(unit.sidc, SID_INDEX, side.standardIdentity),
        subUnits: [],
        equipment,
        personnel: [],
        state: [],
        rangeRings: [],
      };
      unitActions.addUnit(newUnit, parentId);
      unit.subUnits?.forEach((child) => helper(child, newUnit.id!));
    }

    helper(rootUnit, parentId);
  });
}
