import { OrbatItemData, Unit } from "../types/scenarioModels";
import { UnitActions } from "../types/constants";
import { useScenarioStore } from "../stores/scenarioStore";
import { useGeoStore } from "../stores/geoStore";
import { useActiveUnitStore } from "../stores/dragStore";
import { computed, Ref } from "vue";
import { MenuItemData } from "../components/DotsMenu.vue";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";
import { NOrbatItemData, NUnit } from "../types/internalModels";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";

export function useUnitActions() {
  const scenarioStore = useScenarioStore();
  const unitManipulationStore = useUnitManipulationStore();
  const geoStore = useGeoStore();
  const activeUnitStore = useActiveUnitStore();
  const onUnitAction = (unit: Unit | undefined, action: UnitActions) => {
    if (!unit) return;
    if (action === UnitActions.AddSubordinate) {
      unit._isOpen = true;
      unitManipulationStore.createSubordinateUnit(unit);
    }

    if (action === UnitActions.Zoom) geoStore.zoomToUnit(unit, 500);
    if (action === UnitActions.Pan) geoStore.panToUnit(unit, 500);
    if (action === UnitActions.Edit) {
      activeUnitStore.setActiveUnit(unit);
    }

    action === UnitActions.Clone && unitManipulationStore.cloneUnit(unit);
    action === UnitActions.MoveUp && unitManipulationStore.reorderUnit(unit, "up");
    action === UnitActions.MoveDown && unitManipulationStore.reorderUnit(unit, "down");

    if (action === UnitActions.Delete) {
      if (activeUnitStore.activeUnit === unit) {
        activeUnitStore.clearActiveUnit();
      }
      scenarioStore.deleteUnit(unit);
    }
  };
  return { onUnitAction };
}

export function useUnitActionsN() {
  const { unitActions } = injectStrict(activeScenarioKey);
  const activeUnitId = injectStrict(activeUnitKey);
  const geoStore = useGeoStore();

  const onUnitAction = (unit: NUnit | undefined, action: UnitActions) => {
    if (!unit) return;
    if (action === UnitActions.AddSubordinate) {
      unit._isOpen = true;
      unitActions.createSubordinateUnit(unit.id);
    }

    // if (action === UnitActions.Zoom) geoStore.zoomToUnit(unit, 500);
    // if (action === UnitActions.Pan) geoStore.panToUnit(unit, 500);
    if (action === UnitActions.Edit) {
      activeUnitId.value = unit.id;
    }

    action === UnitActions.Clone && unitActions.cloneUnit(unit.id);
    action === UnitActions.MoveUp && unitActions.reorderUnit(unit.id, "up");
    action === UnitActions.MoveDown && unitActions.reorderUnit(unit.id, "down");
    if (action === UnitActions.Expand) {
      unitActions.walkSubUnits(
        unit.id,
        (unit1) => {
          unit1._isOpen = true;
        },
        { includeParent: true }
      );
    }

    if (action === UnitActions.Delete) {
      if (activeUnitId.value === unit.id) {
        activeUnitId.value = null;
      }
      unitActions.deleteUnit(unit.id);
    }
  };
  return { onUnitAction };
}

export function useUnitMenu(item: OrbatItemData | NOrbatItemData | Unit) {
  const unit = "unit" in item ? item.unit : item;
  // todo: item.children is not reactive
  const children = "unit" in item ? item.children : item.subUnits;

  const hasChildren = computed(() => {
    return Boolean(unit.subUnits && unit.subUnits.length);
  });

  const unitMenuItems = computed((): MenuItemData<UnitActions>[] => {
    return [
      { label: "Add subordinate", action: UnitActions.AddSubordinate },
      { label: "Delete", action: UnitActions.Delete },
      { label: "Edit", action: UnitActions.Edit },
      {
        label: "Expand",
        action: UnitActions.Expand,
        disabled: !hasChildren.value,
      },
      {
        label: "Zoom to",
        action: UnitActions.Zoom,
        disabled: !unit._state?.location,
      },
      // { label: "Copy", action: UnitActions.Copy },
      // { label: "Paste", action: UnitActions.Paste },
      { label: "Duplicate", action: UnitActions.Clone },
      { label: "Move up", action: UnitActions.MoveUp },
      { label: "Move down", action: UnitActions.MoveDown },
    ];
  });

  return { unitMenuItems };
}
