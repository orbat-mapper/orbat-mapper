import { OrbatItemData, Unit } from "../types/scenarioModels";
import { UnitActions } from "../types/constants";
import { useScenarioStore } from "../stores/scenarioStore";
import { useGeoStore } from "../stores/geoStore";
import { useActiveUnitStore } from "../stores/dragStore";
import { computed } from "vue";
import { MenuItemData } from "../components/DotsMenu.vue";
import { useUnitManipulationStore } from "../stores/scenarioManipulation";

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

export function useUnitMenu(item: OrbatItemData | Unit) {
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
