import type { Unit, UnitStatus } from "@/types/scenarioModels";
import type { TScenario } from "@/scenariostore";
import type { EntityId } from "@/types/base";
import type {
  NState,
  NUnitAdd,
  NUnitEquipment,
  NUnitPersonnel,
  NUnitSupply,
} from "@/types/internalModels";
import { createNameToIdMapObject, nanoid } from "@/utils";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import {
  convertStateToInternalFormat,
  type ScenarioState,
} from "@/scenariostore/newScenarioStore";
import type { RangeRing } from "@/types/scenarioGeoModels";

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
  sourceState?: ScenarioState;
};

export function addUnitHierarchy(
  rootUnit: Unit,
  parentId: EntityId,
  targetScenario: TScenario,
  options: AddUnitHierarchyOptions = {},
) {
  const newIds = options.newIds ?? true;
  const includeState = options.includeState ?? false;
  const noUndo = true;
  const { store, unitActions } = targetScenario;
  const { sourceState } = options;
  const { side } = unitActions.getUnitHierarchy(parentId);
  const tempUnitStatusIdMap = createNameToIdMapObject(store.state.unitStatusMap);
  const supplyNameToIdMap = createNameToIdMapObject(store.state.supplyCategoryMap);
  const equipmentNameToIdMap = createNameToIdMapObject(store.state.equipmentMap);
  const personnelNameToIdMap = createNameToIdMapObject(store.state.personnelMap);
  const sourceSupplyNameToIdMap = createNameToIdMapObject(
    sourceState?.supplyCategoryMap ?? {},
  );
  const targetSupplyUomNameToIdMap = createNameToIdMapObject(store.state.supplyUomMap);
  const targetSupplyClassMap = createNameToIdMapObject(store.state.supplyClassMap);

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
      const supplies: NUnitSupply[] = [];
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

      unit.supplies?.forEach((unitSupply) => {
        // use existing one if it exists. For new supplies we use the name as id
        let supplyId =
          supplyNameToIdMap[unitSupply.name] ??
          s.supplyCategoryMap[unitSupply.name ?? ""]?.id;
        if (!supplyId) {
          // the supply category does not exist, create it. Use the source state if available
          const newSupplyCategory = sourceState?.supplyCategoryMap[
            sourceSupplyNameToIdMap[unitSupply.name]
          ] ?? {
            id: unitSupply.name,
            name: unitSupply.name,
          };

          let uomId: string | undefined = undefined;
          if (newSupplyCategory.uom) {
            const sourceUom = sourceState?.supplyUomMap[newSupplyCategory.uom];
            // does the uom name exist in the target scenario?
            uomId = targetSupplyUomNameToIdMap[sourceUom?.name ?? ""];
            if (sourceUom && !uomId) {
              uomId = unitActions.addSupplyUom({ ...sourceUom, id: sourceUom.name });
            }
          }

          let supplyClassId: string | undefined = undefined;
          if (newSupplyCategory.supplyClass) {
            const sourceSupplyClass =
              sourceState?.supplyClassMap[newSupplyCategory.supplyClass];
            supplyClassId = targetSupplyClassMap[sourceSupplyClass?.name ?? ""];
            if (sourceSupplyClass && !supplyClassId) {
              supplyClassId = unitActions.addSupplyClass({
                ...sourceSupplyClass,
                id: sourceSupplyClass.name,
              });
            }

            const sc = unitActions.addSupplyCategory(
              {
                ...newSupplyCategory,
                id: newSupplyCategory.name,
                uom: uomId,
                supplyClass: supplyClassId,
              },
              { noUndo, s },
            );
            supplyId = sc.id;
          }
        }

        supplies.push({ ...unitSupply, id: supplyId });
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
                return { id: equipmentNameToIdMap[name] ?? name, ...rest };
              }),
              personnel: update.personnel?.map((p) => {
                const { name, ...rest } = p;
                return { id: personnelNameToIdMap[name] ?? name, ...rest };
              }),
              supplies: update.supplies?.map((s) => {
                const { name, ...rest } = s;
                return { id: supplyNameToIdMap[name] ?? name, ...rest };
              }),
            }
          : undefined;
        const newDiff = diff
          ? {
              equipment: diff.equipment?.map((e) => {
                const { name, ...rest } = e;
                return { id: equipmentNameToIdMap[name] ?? name, ...rest };
              }),
              personnel: diff.personnel?.map((p) => {
                const { name, ...rest } = p;
                return { id: personnelNameToIdMap[name] ?? name, ...rest };
              }),
              supplies: diff.supplies?.map((s) => {
                const { name, ...rest } = s;
                return { id: supplyNameToIdMap[name] ?? name, ...rest };
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
        supplies,
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
