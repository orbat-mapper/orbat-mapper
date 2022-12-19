import { OrbatItemData, Unit } from "@/types/scenarioModels";
import { UnitAction, UnitActions } from "@/types/constants";
import { useGeoStore } from "@/stores/geoStore";
import { computed, Ref } from "vue";
import { NOrbatItemData, NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import { MenuItemData } from "@/components/types";
import { multiPoint } from "@turf/helpers";
import turfEnvelope from "@turf/envelope";
import { GeoJSON } from "ol/format";
import Feature from "ol/Feature";
import { useSelectedUnits } from "@/stores/dragStore";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import { FeatureId } from "@/types/scenarioGeoModels";
import OLMap from "ol/Map";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";

export function useUnitActions(
  options: Partial<{
    activeScenario: TScenario;
    activeUnitId: Ref<EntityId | undefined | null>;
  }> = {}
) {
  const {
    unitActions,
    store: { groupUpdate },
  } = options.activeScenario || injectStrict(activeScenarioKey);
  const activeUnitId = options.activeUnitId || injectStrict(activeUnitKey);
  const { selectedUnitIds } = useSelectedUnits();
  const geoStore = useGeoStore();

  const _onUnitAction = (unit: NUnit | undefined | null, action: UnitAction) => {
    if (!unit) return;
    if (action === UnitActions.AddSubordinate) {
      unit._isOpen = true;
      unitActions.createSubordinateUnit(unit.id);
    }

    if (action === UnitActions.Zoom) {
      if (unit._state?.location) {
        geoStore.zoomToUnit(unit, 500);
      } else {
        const subUnits: NUnit[] = [];
        unitActions.walkSubUnits(
          unit.id,
          (unit1) => {
            subUnits.push(unit1);
          },
          {}
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
    if (action === UnitActions.Edit) {
      selectedUnitIds.value.clear();
      selectedUnitIds.value.add(unit.id);
    }

    action === UnitActions.Clone && unitActions.cloneUnit(unit.id);
    action === UnitActions.CloneWithSubordinates &&
      unitActions.cloneUnit(unit.id, { includeSubordinates: true });
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
      selectedUnitIds.value.delete(unit.id);
    }
  };

  function onUnitAction(unitOrUnits: NUnit | NUnit[] | null, action: UnitAction) {
    if (!unitOrUnits) return;
    if (Array.isArray(unitOrUnits)) {
      groupUpdate(() => {
        if (action === UnitActions.Zoom || action === UnitActions.Pan) {
          geoStore.zoomToUnits(unitOrUnits, 500);
        } else unitOrUnits.forEach((unit) => _onUnitAction(unit, action));
      });
    } else _onUnitAction(unitOrUnits, action);
  }
  return { onUnitAction };
}

export function useUnitMenu(item: OrbatItemData | NOrbatItemData | Unit) {
  const unit = "unit" in item ? item.unit : item;
  // todo: item.children is not reactive
  const children = "unit" in item ? item.children : item.subUnits;

  const hasChildren = computed(() => {
    return Boolean(unit.subUnits && unit.subUnits.length);
  });

  const unitMenuItems = computed((): MenuItemData<UnitAction>[] => {
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
      {
        label: "Duplicate hierarchy",
        action: UnitActions.CloneWithSubordinates,
      },
      { label: "Move up", action: UnitActions.MoveUp },
      { label: "Move down", action: UnitActions.MoveDown },
    ];
  });

  return { unitMenuItems };
}

export function useScenarioFeatureActions() {
  const mapRef = useGeoStore().olMap! as OLMap;

  const { zoomToFeature, panToFeature, zoomToFeatures } = useScenarioLayers(mapRef);

  function onFeatureAction(
    featureOrFeaturesId: FeatureId | FeatureId[],
    action: "zoom" | "pan"
  ) {
    const isArray = Array.isArray(featureOrFeaturesId);
    if (isArray && (action === "zoom" || action === "pan")) {
      zoomToFeatures(featureOrFeaturesId);
      return;
    }
    (isArray ? featureOrFeaturesId : [featureOrFeaturesId]).forEach((featureId) => {
      if (action === "zoom") zoomToFeature(featureId);
      if (action === "pan") panToFeature(featureId);
    });
  }

  return { onFeatureAction };
}
