import { OrbatItemData, Unit } from "@/types/scenarioModels";
import { TAB_SCENARIO_SETTINGS, UnitAction, UnitActions } from "@/types/constants";
import { useGeoStore } from "@/stores/geoStore";
import { computed, ComputedRef } from "vue";
import { NOrbatItemData, NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { MenuItemData } from "@/components/types";
import { multiPoint } from "@turf/helpers";
import turfEnvelope from "@turf/envelope";
import { GeoJSON } from "ol/format";
import Feature from "ol/Feature";
import { TScenario } from "@/scenariostore";
import { FeatureId } from "@/types/scenarioGeoModels";
import OLMap from "ol/Map";
import { useFeatureLayerUtils } from "@/modules/scenarioeditor/featureLayerUtils";
import { useSelectedItems } from "@/stores/selectedStore";
import { useScenarioInfoPanelStore } from "@/stores/scenarioInfoPanelStore";
import { useUiStore } from "@/stores/uiStore";
import { EntityId } from "@/types/base";

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

    if (action === UnitActions.Zoom) {
      if (unit._state?.location) {
        geoStore.zoomToUnit(unit, 0);
      } else {
        const subUnits: NUnit[] = [];
        unitActions.walkSubUnits(
          unit.id,
          (unit1) => {
            subUnits.push(unit1);
          },
          {},
        );
        const locations = subUnits
          .filter((u) => u._state?.location)
          .map((u) => u._state?.location!);

        if (locations.length === 0) return;
        const bb = new GeoJSON().readFeature(turfEnvelope(multiPoint(locations)), {
          featureProjection: "EPSG:3857",
          dataProjection: "EPSG:4326",
        }) as Feature<any>;
        if (!bb) return;
        geoStore.olMap?.getView().fit(bb.getGeometry(), { maxZoom: 17 });
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

    action === UnitActions.Clone && unitActions.cloneUnit(unit.id);
    action === UnitActions.CloneWithState &&
      unitActions.cloneUnit(unit.id, { includeState: true });
    action === UnitActions.CloneWithSubordinates &&
      unitActions.cloneUnit(unit.id, { includeSubordinates: true });
    action === UnitActions.CloneWithSubordinatesAndState &&
      unitActions.cloneUnit(unit.id, { includeSubordinates: true, includeState: true });
    action === UnitActions.MoveUp && unitActions.reorderUnit(unit.id, "up");
    action === UnitActions.MoveDown && unitActions.reorderUnit(unit.id, "down");

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

  function onUnitAction(
    unitOrUnits: NUnit | NUnit[] | null,
    action: UnitAction,
    waypointIds?: EntityId[],
  ) {
    if (!unitOrUnits) return;
    if (Array.isArray(unitOrUnits)) {
      groupUpdate(() => {
        if (action === UnitActions.Zoom || action === UnitActions.Pan) {
          geoStore.zoomToUnits(unitOrUnits, { duration: 500 });
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
  const unit = "unit" in item ? item.unit : item;
  // todo: item.children is not reactive
  const children = "unit" in item ? item.children : item.subUnits;

  const hasChildren = computed(() => {
    return Boolean(unit.subUnits && unit.subUnits.length);
  });

  const unitMenuItems = computed((): MenuItemData<UnitAction>[] => {
    return [
      {
        label: "Add subordinate",
        action: UnitActions.AddSubordinate,
        disabled: isLocked.value,
      },
      { label: "Delete", action: UnitActions.Delete, disabled: isLocked.value },
      { label: "Clear state", action: UnitActions.ClearState, disabled: isLocked.value },
      { label: "Edit", action: UnitActions.Edit, disabled: isLocked.value },
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
      { label: "Duplicate", action: UnitActions.Clone, disabled: isLocked.value },
      {
        label: "Duplicate (with state)",
        action: UnitActions.CloneWithState,
        disabled: isLocked.value,
      },
      {
        label: "Duplicate hierarchy",
        action: UnitActions.CloneWithSubordinates,
        disabled: isLocked.value,
      },
      {
        label: "Duplicate hierarchy (with state)",
        action: UnitActions.CloneWithSubordinatesAndState,
        disabled: isLocked.value,
      },
      { label: "Move up", action: UnitActions.MoveUp, disabled: isLocked.value },
      { label: "Move down", action: UnitActions.MoveDown, disabled: isLocked.value },
      unit.locked
        ? {
            label: "Unlock",
            action: UnitActions.Unlock,
            disabled: isSideGroupLocked.value,
          }
        : {
            label: "Lock",
            action: UnitActions.Lock,
            disabled: isSideGroupLocked.value,
          },
    ];
  });

  return { unitMenuItems };
}

export function useScenarioFeatureActions() {
  const mapRef = useGeoStore().olMap! as OLMap;
  const {
    store: { groupUpdate },
    geo,
  } = injectStrict(activeScenarioKey);

  const { zoomToFeature, panToFeature, zoomToFeatures } = useFeatureLayerUtils(mapRef);

  function onFeatureAction(
    featureOrFeaturesId: FeatureId | FeatureId[],
    action: "zoom" | "pan" | "delete" | string,
  ) {
    const isArray = Array.isArray(featureOrFeaturesId);
    if (isArray && (action === "zoom" || action === "pan")) {
      zoomToFeatures(featureOrFeaturesId);
      return;
    }
    groupUpdate(
      () => {
        (isArray ? featureOrFeaturesId : [featureOrFeaturesId]).forEach((featureId) => {
          if (action === "zoom") zoomToFeature(featureId);
          if (action === "pan") panToFeature(featureId);
          if (action === "delete") geo.deleteFeature(featureId);
          if (action === "duplicate") {
            geo.duplicateFeature(featureId);
          }
        });
      },
      { label: "batchLayer", value: "dummy" },
    );
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

  function goToAddGroup() {
    uiStore.activeTabIndex = TAB_SCENARIO_SETTINGS;
    scenarioInfoPanelStore.tabIndex = 3;
    scenarioInfoPanelStore.showAddGroup = true;
  }

  return { goToAddEquipment, goToAddPersonnel, goToAddGroup };
}
