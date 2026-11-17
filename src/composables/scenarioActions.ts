import type { OrbatItemData, Unit } from "@/types/scenarioModels";
import { TAB_SCENARIO_SETTINGS, type UnitAction, UnitActions } from "@/types/constants";
import { useGeoStore } from "@/stores/geoStore";
import { type ComputedRef, hasInjectionContext, inject } from "vue";
import type { NOrbatItemData, NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey, branchCutoffModalKey } from "@/components/injects";
import type { MenuEntry, MenuItemData } from "@/components/types";
import { multiPoint } from "@turf/helpers";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { layerItemToGeoJsonFeature } from "@/geo/layerItemExtent";
import { featureCollection } from "@turf/helpers";
import turfCenter from "@turf/center";
import { useSelectedItems } from "@/stores/selectedStore";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import { useUiStore } from "@/stores/uiStore";
import type { EntityId } from "@/types/base";

const HIDE_ACTIONS: Partial<
  Record<UnitAction, { hidden: boolean; withSubordinates: boolean }>
> = {
  [UnitActions.Hide]: { hidden: true, withSubordinates: false },
  [UnitActions.Show]: { hidden: false, withSubordinates: false },
  [UnitActions.HideWithSubordinates]: { hidden: true, withSubordinates: true },
  [UnitActions.ShowWithSubordinates]: { hidden: false, withSubordinates: true },
};

/** Map-visibility entries for a unit's whole branch; empty for units without subordinates. */
export function hideBranchMenuItems(unit: {
  subUnits?: unknown[];
}): MenuItemData<UnitAction>[] {
  if (!unit.subUnits?.length) return [];
  return [
    { label: "Hide on map", action: UnitActions.HideWithSubordinates },
    { label: "Show on map", action: UnitActions.ShowWithSubordinates },
    { label: "Hide subordinates below…", action: UnitActions.HideSubordinatesBelow },
  ];
}

export function useUnitActions(
  options: Partial<{
    activeScenario: TScenario;
  }> = {},
) {
  const {
    unitActions,
    store: { groupUpdate },
  } = options.activeScenario || injectStrict(activeScenarioKey);
  const { selectedUnitIds, activeUnitId } = useSelectedItems();
  const geoStore = useGeoStore();
  // Only the scenario editor provides the dialog; useHellfire also calls this outside setup.
  const branchCutoffModal = hasInjectionContext()
    ? inject(branchCutoffModalKey, undefined)
    : undefined;

  const _onUnitAction = (
    unit: NUnit | undefined | null,
    action: UnitAction,
    waypointIds?: EntityId[],
  ) => {
    if (!unit) return;

    if (action === UnitActions.Expand) {
      unitActions.walkSubUnits(
        unit.id,
        (unit1) => {
          unit1._isOpen = true;
        },
        { includeParent: true },
      );
    }
    if (action === UnitActions.Collapse) {
      unitActions.walkSubUnits(
        unit.id,
        (unit1) => {
          unit1._isOpen = false;
        },
        { includeParent: true },
      );
    }

    if (action === UnitActions.Zoom) {
      if (unit._state?.location) {
        geoStore.zoomToUnit(unit);
      } else {
        const subUnits: NUnit[] = [];
        unitActions.walkSubUnits(
          unit.id,
          (unit1) => {
            subUnits.push(unit1);
          },
          {},
        );
        const locations = subUnits.flatMap((u) =>
          u._state?.location ? [u._state.location] : [],
        );

        if (locations.length === 0) return;
        geoStore.mapAdapter?.fitGeometry(multiPoint(locations), { maxZoom: 17 });
      }
    }
    if (action === UnitActions.Pan) geoStore.panToUnit(unit, 500);
    if (action === UnitActions.Lock) {
      unitActions.updateUnitLocked(unit.id, true);
    }
    if (action === UnitActions.Unlock) {
      unitActions.updateUnitLocked(unit.id, false);
    }

    if (unitActions.isUnitLocked(unit.id)) return;

    if (action === UnitActions.AddSubordinate) {
      unit._isOpen = true;
      unitActions.createSubordinateUnit(unit.id);
    }

    if (action === UnitActions.Edit) {
      selectedUnitIds.value.clear();
      selectedUnitIds.value.add(unit.id);
    }

    if (action === UnitActions.Clone) {
      unitActions.cloneUnit(unit.id);
    }
    if (action === UnitActions.CloneWithState) {
      unitActions.cloneUnit(unit.id, { includeState: true });
    }
    if (action === UnitActions.CloneWithSubordinates) {
      unitActions.cloneUnit(unit.id, { includeSubordinates: true });
    }
    if (action === UnitActions.CloneWithSubordinatesAndState) {
      unitActions.cloneUnit(unit.id, {
        includeSubordinates: true,
        includeState: true,
      });
    }
    if (action === UnitActions.MoveUp) {
      unitActions.reorderUnit(unit.id, "up");
    }
    if (action === UnitActions.MoveDown) {
      unitActions.reorderUnit(unit.id, "down");
    }
    if (action === UnitActions.MoveUpInHierarchy) {
      const parentUnit = unitActions.getUnitById(unit._pid);
      if (parentUnit) {
        unitActions.changeUnitParent(unit.id, parentUnit.id, "below");
      }
    }

    if (
      action === UnitActions.Delete ||
      (action === UnitActions.ClearStateOrDelete && !unit.state?.length)
    ) {
      if (activeUnitId.value === unit.id) {
        activeUnitId.value = null;
      }
      unitActions.deleteUnit(unit.id);
      selectedUnitIds.value.delete(unit.id);
    }

    if (action === UnitActions.DeleteWaypoints && waypointIds && waypointIds.length) {
      waypointIds.forEach((wid) =>
        unitActions.deleteUnitStateEntryByStateId(unit.id, wid),
      );
    }

    if (action === UnitActions.ClearState || action === UnitActions.ClearStateOrDelete) {
      unitActions.clearUnitState(unit.id);
    }
  };

  function setUnitsHidden(
    units: NUnit[],
    { hidden, withSubordinates }: { hidden: boolean; withSubordinates: boolean },
  ) {
    const ids = new Set<EntityId>();
    units.forEach((unit) => {
      if (withSubordinates) {
        unitActions.walkSubUnits(unit.id, (u) => ids.add(u.id), { includeParent: true });
      } else {
        ids.add(unit.id);
      }
    });
    unitActions.setUnitsHidden(ids, hidden);
  }

  async function hideSubordinatesBelow(units: NUnit[]) {
    if (!branchCutoffModal) return;
    const label = units.length === 1 ? units[0]!.name : `${units.length} units`;
    const cutoff = await branchCutoffModal.getBranchCutoff(label);
    if (cutoff)
      unitActions.setBranchVisibility(
        units.map((u) => u.id),
        cutoff,
      );
  }

  function onUnitAction(
    unitOrUnits: NUnit | NUnit[] | null,
    action: UnitAction,
    waypointIds?: EntityId[],
  ) {
    if (!unitOrUnits) return;
    const units = Array.isArray(unitOrUnits) ? unitOrUnits : [unitOrUnits];
    if (action === UnitActions.HideSubordinatesBelow) {
      hideSubordinatesBelow(units);
      return;
    }
    const hideAction = HIDE_ACTIONS[action];
    if (hideAction) {
      setUnitsHidden(units, hideAction);
      return;
    }
    if (Array.isArray(unitOrUnits)) {
      groupUpdate(() => {
        if (action === UnitActions.Zoom) {
          geoStore.zoomToUnits(unitOrUnits, { duration: 500 });
        } else if (action === UnitActions.Pan) {
          geoStore.panToUnits(unitOrUnits, 500);
        } else unitOrUnits.forEach((unit) => _onUnitAction(unit, action, waypointIds));
      });
    } else _onUnitAction(unitOrUnits, action, waypointIds);
  }

  return { onUnitAction };
}

export function useUnitMenu(
  item: OrbatItemData | NOrbatItemData | Unit,
  isLocked: ComputedRef<boolean>,
  isSideGroupLocked: ComputedRef<boolean>,
) {
  const { store, unitActions } = injectStrict(activeScenarioKey);
  const unit = "unit" in item ? item.unit : item;

  /** Builds the unit menu. Pass it uncalled to DotsMenu so it only runs when the menu opens. */
  const getUnitMenuItems = (): MenuEntry<UnitAction>[] => {
    const locked = isLocked.value;
    const hasLocation = Boolean(unit._state?.location);
    const hasChildren = Boolean(unit.subUnits?.length);
    const pid = "_pid" in unit ? unit._pid : undefined;
    const parent = pid ? unitActions.getUnitOrSideGroup(pid) : undefined;
    const isParentUnit = Boolean(pid && pid in store.state.unitMap);

    const duplicateItems: MenuItemData<UnitAction>[] = [
      { label: "Unit", action: UnitActions.Clone },
      { label: "Unit with state", action: UnitActions.CloneWithState },
    ];
    if (hasChildren) {
      duplicateItems.push(
        { label: "Hierarchy", action: UnitActions.CloneWithSubordinates },
        {
          label: "Hierarchy with state",
          action: UnitActions.CloneWithSubordinatesAndState,
        },
      );
    }

    const branchEntries: MenuEntry<UnitAction>[] = hasChildren
      ? [
          {
            label: "Branch",
            children: [
              { label: "Expand all", action: UnitActions.Expand },
              { label: "Collapse all", action: UnitActions.Collapse },
              { separator: true },
              ...hideBranchMenuItems(unit),
            ],
          },
        ]
      : [];

    return [
      { label: "Edit", action: UnitActions.Edit, disabled: locked },
      { label: "Add subordinate", action: UnitActions.AddSubordinate, disabled: locked },
      { label: "Zoom to", action: UnitActions.Zoom, disabled: !hasLocation },
      { label: "Pan to", action: UnitActions.Pan, disabled: !hasLocation },
      { separator: true },
      { label: "Duplicate", disabled: locked, children: duplicateItems },
      {
        label: "Move",
        disabled: locked,
        children: [
          {
            label: "Up",
            action: UnitActions.MoveUp,
            disabled: parent?.subUnits[0] === unit.id,
          },
          {
            label: "Down",
            action: UnitActions.MoveDown,
            disabled: parent?.subUnits.at(-1) === unit.id,
          },
          {
            label: "Up in hierarchy",
            action: UnitActions.MoveUpInHierarchy,
            disabled: !isParentUnit,
          },
        ],
      },
      { separator: true },
      unit.isHidden
        ? { label: "Show on map", action: UnitActions.Show }
        : { label: "Hide on map", action: UnitActions.Hide },
      ...branchEntries,
      {
        label: unit.locked ? "Unlock" : "Lock",
        action: unit.locked ? UnitActions.Unlock : UnitActions.Lock,
        disabled: isSideGroupLocked.value,
      },
      { separator: true },
      { label: "Clear state", action: UnitActions.ClearState, disabled: locked },
      {
        label: "Delete",
        action: UnitActions.Delete,
        disabled: locked,
        variant: "destructive",
      },
    ];
  };

  return { getUnitMenuItems };
}

export function useScenarioFeatureActions(
  options: Partial<{
    activeScenario: TScenario;
  }> = {},
) {
  const geoStore = useGeoStore();
  const activeScenario = options.activeScenario || injectStrict(activeScenarioKey);
  const {
    store: { groupUpdate, state },
    geo,
  } = activeScenario;

  const toGeoJsonFeature = (featureId: FeatureId) =>
    layerItemToGeoJsonFeature(state, featureId);

  function zoomToFeatures(featureIds: FeatureId[], maxZoom: number) {
    const features = featureIds
      .map(toGeoJsonFeature)
      .filter((f): f is NonNullable<typeof f> => !!f);
    if (!features.length) return;
    geoStore.zoomToGeometry(featureCollection(features), { maxZoom });
  }

  function panToFeature(featureId: FeatureId) {
    const feature = toGeoJsonFeature(featureId);
    if (!feature) return;
    const center = turfCenter(feature);
    geoStore.panToLocation(center.geometry.coordinates);
  }

  function onFeatureAction(
    featureOrFeaturesId: FeatureId | FeatureId[],
    action: "zoom" | "pan" | "delete" | string,
  ) {
    const duplicatedIds: FeatureId[] = [];
    const isArray = Array.isArray(featureOrFeaturesId);
    if (isArray && (action === "zoom" || action === "pan")) {
      zoomToFeatures(featureOrFeaturesId, 17);
      return duplicatedIds;
    }
    groupUpdate(
      () => {
        (isArray ? featureOrFeaturesId : [featureOrFeaturesId]).forEach((featureId) => {
          if (action === "zoom") zoomToFeatures([featureId], 15);
          if (action === "pan") panToFeature(featureId);
          if (action === "delete") geo.deleteFeature(featureId);
          if (action === "duplicate") {
            const duplicatedId = geo.duplicateFeature(featureId, geoStore.mapAdapter);
            if (duplicatedId !== undefined) duplicatedIds.push(duplicatedId);
          }
        });
      },
      { label: "batchLayer", value: "dummy" },
    );
    return duplicatedIds;
  }

  return { onFeatureAction };
}

export function useToeActions() {
  const uiStore = useUiStore();
  const scenarioInfoPanelStore = useScenarioInfoPanelStore();

  function goToAddEquipment() {
    uiStore.activeTabIndex = TAB_SCENARIO_SETTINGS;
    scenarioInfoPanelStore.showAddEquipment = true;
    scenarioInfoPanelStore.tabIndex = 1;
  }

  function goToAddPersonnel() {
    uiStore.activeTabIndex = TAB_SCENARIO_SETTINGS;
    scenarioInfoPanelStore.showAddPersonnel = true;
    scenarioInfoPanelStore.tabIndex = 2;
  }

  function goToAddSupplies() {
    uiStore.activeTabIndex = TAB_SCENARIO_SETTINGS;
    scenarioInfoPanelStore.showAddSupplies = true;
    scenarioInfoPanelStore.tabIndex = 3;
  }

  function goToAddGroup() {
    uiStore.activeTabIndex = TAB_SCENARIO_SETTINGS;
    scenarioInfoPanelStore.tabIndex = 4;
    scenarioInfoPanelStore.showAddGroup = true;
  }

  return { goToAddEquipment, goToAddPersonnel, goToAddSupplies, goToAddGroup };
}
