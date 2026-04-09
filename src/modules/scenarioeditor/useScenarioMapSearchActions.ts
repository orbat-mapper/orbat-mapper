import { nextTick } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import type { Position } from "geojson";
import { TAB_EVENTS, TAB_LAYERS, TAB_ORBAT } from "@/types/constants";
import type { PhotonSearchResult } from "@/composables/geosearching";
import type { NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import {
  activeLayerKey,
  activeParentKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import { useSearchActions } from "@/composables/searchActions";
import { useToeActions } from "@/composables/scenarioActions";
import { useScenarioFeatureSelection } from "@/modules/scenarioeditor/useScenarioFeatureSelection";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedItems } from "@/stores/selectedStore";
import { fixExtent } from "@/utils/geoConvert";
import { addMapLayer } from "@/modules/scenarioeditor/scenarioMapLayers";
import { usePlaybackStore } from "@/stores/playbackStore";

interface UseScenarioMapSearchActionsOptions {
  zoomToUnit?: (unit: NUnit) => void;
  focusPlace?: (
    item: PhotonSearchResult,
    extent: [number, number, number, number] | undefined,
  ) => void;
  showLeftPanelOnLayerSelect?: boolean;
  showLeftPanelOnImageLayerSelect?: boolean;
  showLeftPanelOnAddLayer?: boolean;
}

export function useScenarioMapSearchActions({
  zoomToUnit,
  focusPlace,
  showLeftPanelOnLayerSelect = false,
  showLeftPanelOnImageLayerSelect = false,
  showLeftPanelOnAddLayer = false,
}: UseScenarioMapSearchActionsOptions = {}) {
  const engineRef = injectStrict(activeScenarioMapEngineKey);
  const activeScenario = injectStrict(activeScenarioKey);
  const activeLayerId = injectStrict(activeLayerKey);
  const activeParentId = injectStrict(activeParentKey);
  const playback = usePlaybackStore();
  const ui = useUiStore();
  const toeActions = useToeActions();
  const { applyScenarioFeatureSelection } = useScenarioFeatureSelection();
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smallerOrEqual("md");
  const {
    selectedUnitIds,
    selectedFeatureIds,
    activeUnitId,
    activeScenarioEventId,
    activeMapLayerId,
    orbatRevealUnitId,
  } = useSelectedItems();

  const {
    onUnitSelect,
    onFeatureSelect,
    onLayerSelect,
    onEventSelect,
    onPlaceSelect,
    onImageLayerSelect,
    onScenarioAction,
  } = useSearchActions();

  onUnitSelect(({ unitId, options }) => {
    if (!isMobile.value) {
      ui.showLeftPanel = true;
    }
    ui.activeTabIndex = TAB_ORBAT;
    activeUnitId.value = unitId;
    activeParentId.value = unitId;
    selectedUnitIds.value.clear();
    selectedUnitIds.value.add(unitId);
    const unit = activeScenario.unitActions.getUnitById(unitId);
    const { side, sideGroup, parents } =
      activeScenario.unitActions.getUnitHierarchy(unitId);
    if (side) side._isOpen = true;
    if (sideGroup) sideGroup._isOpen = true;
    parents.forEach((parent) => (parent._isOpen = true));
    orbatRevealUnitId.value = unitId;

    if (!(options?.noZoom === true) && zoomToUnit) {
      nextTick(() => {
        zoomToUnit(unit);
      });
    }
  });

  onLayerSelect(({ layerId }) => {
    if (showLeftPanelOnLayerSelect) ui.showLeftPanel = true;
    ui.activeTabIndex = TAB_LAYERS;
    nextTick(() => {
      const layer = activeScenario.geo.getLayerById(layerId);
      if (layer) {
        layer._isOpen = true;
        nextTick(() => engineRef.value?.layers.zoomToScenarioLayer(layerId));
      }
      activeLayerId.value = layerId;
    });
  });

  onImageLayerSelect(({ layerId }) => {
    if (showLeftPanelOnImageLayerSelect) ui.showLeftPanel = true;
    ui.activeTabIndex = TAB_LAYERS;
    nextTick(() => {
      engineRef.value?.layers.zoomToMapLayer(layerId);
      activeMapLayerId.value = layerId;
    });
  });

  onFeatureSelect(({ featureId, layerId, options }) => {
    nextTick(() =>
      applyScenarioFeatureSelection({
        featureIds: [featureId],
        primaryFeatureId: featureId,
        layerId,
        noZoom: options?.noZoom === true,
      }),
    );
  });

  onEventSelect((event) => {
    activeScenario.time.goToScenarioEvent(event.id);
    activeScenarioEventId.value = event.id;
    ui.activeTabIndex = TAB_EVENTS;
  });

  onPlaceSelect((item) => {
    const extent = fixExtent(item.properties.extent) as
      | [number, number, number, number]
      | undefined;

    if (extent) {
      engineRef.value?.map.fitExtent(extent, { maxZoom: 15 });
    } else {
      engineRef.value?.map.animateView({
        center: item.geometry.coordinates as Position,
        zoom: 15,
        duration: 900,
      });
    }

    focusPlace?.(item, extent);
  });

  onScenarioAction(({ action }) => {
    if (
      action === "addTileJSONLayer" ||
      action === "addXYZLayer" ||
      action === "addImageLayer"
    ) {
      if (showLeftPanelOnAddLayer) ui.showLeftPanel = true;
      ui.activeTabIndex = TAB_LAYERS;
      const layerType =
        action === "addXYZLayer"
          ? "XYZLayer"
          : action === "addImageLayer"
            ? "ImageLayer"
            : "TileJSONLayer";
      const newLayer = addMapLayer(layerType, activeScenario.geo);
      ui.mapLayersPanelOpen = true;
      nextTick(() => {
        activeMapLayerId.value = newLayer.id;
      });
      return;
    }

    if (action === "addEquipment") {
      toeActions.goToAddEquipment();
    } else if (action === "addPersonnel") {
      toeActions.goToAddPersonnel();
    } else if (action === "startPlayback") {
      playback.playbackRunning = true;
    } else if (action === "stopPlayback") {
      playback.playbackRunning = false;
    } else if (action === "increaseSpeed") {
      playback.increaseSpeed();
    } else if (action === "decreaseSpeed") {
      playback.decreaseSpeed();
    }
  });
}
