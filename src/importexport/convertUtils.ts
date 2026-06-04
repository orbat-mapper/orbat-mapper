import type { Unit, UnitStatus } from "@/types/scenarioModels";
import type { TScenario } from "@/scenariostore";
import type { EntityId } from "@/types/base";
import type { NState, NUnitAdd } from "@/types/internalModels";
import { createNameToIdMapObject, nanoid } from "@/utils";
import {
  convertStateToInternalFormat,
  type ScenarioState,
} from "@/scenariostore/newScenarioStore";
import {
  unitResourcesToInternal,
  unitStateToInternal,
} from "@/scenariostore/scenarioCodec";
import type { RangeRing } from "@/types/scenarioGeoModels";
import { getCustomSymbolId, setSid } from "@/symbology/helpers.ts";
import { klona } from "klona";

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
  if (!text.trim()) {
    return null;
  }

  try {
    const obj = JSON.parse(text);
    if (Array.isArray(obj)) {
      return obj;
    }
  } catch {
    return null;
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
): EntityId | undefined {
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
  const sourceCustomSymbolIds = new Set<string>();
  let insertedRootId: EntityId | undefined;

  store.update((s) => {
    function addUnitStatus(unitStatus: UnitStatus) {
      const id = nanoid();
      tempUnitStatusIdMap[unitStatus.name] = id;
      s.unitStatusMap[id] = { ...unitStatus, id };
      return id;
    }

    function helper(
      unit: Unit,
      parentId: EntityId,
      depth: number = 0,
    ): EntityId | undefined {
      const rangeRings: RangeRing[] = [];
      const customSymbolId = getCustomSymbolId(unit.sidc);
      if (customSymbolId) {
        sourceCustomSymbolIds.add(customSymbolId);
      }
      unit.state
        ?.filter((s) => s.sidc)
        ?.forEach((s) => {
          const csidc = getCustomSymbolId(s.sidc!);
          if (csidc) {
            sourceCustomSymbolIds.add(csidc);
          }
        });

      // Resolve a supply name to a catalog id, minting it (and any uom / supply class it
      // brings from the source scenario) into the target catalog when absent. Keyed purely
      // off the name the codec resolver passes; the per-entry count/onHand are preserved by
      // unitResourcesToInternal.
      const resolveSupplyId = (name: string): string => {
        // use existing one if it exists. For new supplies we use the name as id
        let supplyId = supplyNameToIdMap[name] ?? s.supplyCategoryMap[name]?.id;
        if (!supplyId) {
          // the supply category does not exist, create it. Use the source state if available
          const newSupplyCategory = sourceState?.supplyCategoryMap[
            sourceSupplyNameToIdMap[name]
          ] ?? {
            id: name,
            name: name,
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

        return supplyId as string;
      };

      const { equipment, personnel, supplies } = unitResourcesToInternal(unit, {
        equipment: (name) =>
          (s.equipmentMap[name] || unitActions.addEquipment({ id: name, name }, { noUndo, s }))
            .id,
        personnel: (name) =>
          (
            s.personnelMap[name] ||
            unitActions.addPersonnel({ id: name, name }, { noUndo, s })
          ).id,
        supplies: resolveSupplyId,
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

      const internalUnitState: NState[] = unitState.map((s) =>
        unitStateToInternal(s, {
          equipment: equipmentNameToIdMap,
          personnel: personnelNameToIdMap,
          supplies: supplyNameToIdMap,
        }),
      );

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
        sidc: setSid(unit.sidc, side.standardIdentity),
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
      return newUnit.id;
    }

    insertedRootId = helper(rootUnit, parentId);
    // copy over custom symbols used by the source scenario
    sourceCustomSymbolIds.forEach((csid) => {
      if (!s.customSymbolMap[csid]) {
        const sourceSymbol = sourceState?.customSymbolMap[csid];
        if (sourceSymbol) {
          s.customSymbolMap[csid] = klona(sourceSymbol);
        }
      }
    });
  });

  return insertedRootId;
}
