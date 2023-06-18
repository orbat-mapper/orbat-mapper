<script setup lang="ts">
import { nextTick } from "vue";
import { useSearchActions } from "@/composables/searchActions";
import { TAB_EVENTS, TAB_LAYERS, TAB_ORBAT, UnitActions } from "@/types/constants";
import { useScenarioLayers } from "@/modules/scenarioeditor/scenarioLayers2";
import { injectStrict } from "@/utils";
import { activeLayerKey, activeMapKey, activeScenarioKey } from "@/components/injects";
import { useUiStore } from "@/stores/uiStore";
import { useUnitActions } from "@/composables/scenarioActions";
import { getTransform } from "ol/proj";
import { applyTransform } from "ol/extent";
import { fromExtent as polygonFromExtent } from "ol/geom/Polygon";
import OlPoint from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OlFeature from "ol/Feature";
import { useSelectedItems } from "@/stores/selectedStore";
import { useEventBus } from "@vueuse/core";
import { imageLayerAction } from "@/components/eventKeys";
import { fixExtent } from "@/utils/geoConvert";

const mapRef = injectStrict(activeMapKey);
const activeScenario = injectStrict(activeScenarioKey);
const activeLayerId = injectStrict(activeLayerKey);
const imageLayerBus = useEventBus(imageLayerAction);
const l = useScenarioLayers(mapRef.value);

const {
  onUnitSelect,
  onFeatureSelect,
  onLayerSelect,
  onEventSelect,
  onPlaceSelect,
  onImageLayerSelect,
} = useSearchActions();
const ui = useUiStore();
const {
  selectedUnitIds,
  selectedFeatureIds,
  activeUnitId,
  activeScenarioEventId,
  activeMapLayerId,
  clear: clearSelected,
} = useSelectedItems();
const { onUnitAction } = useUnitActions();

onUnitSelect(({ unitId }) => {
  ui.activeTabIndex = TAB_ORBAT;
  activeUnitId.value = unitId;
  selectedUnitIds.value.clear();
  selectedUnitIds.value.add(unitId);
  const unit = activeScenario.unitActions.getUnitById(unitId);
  const { parents } = activeScenario.unitActions.getUnitHierarchy(unitId);
  parents.forEach((p) => (p._isOpen = true));
  nextTick(() => {
    const el = document.getElementById(`o-${unitId}`);
    if (el) {
      el.scrollIntoView();
    }
    onUnitAction(unit, UnitActions.Zoom);
  });
});

onLayerSelect(({ layerId }) => {
  if (!mapRef.value) return;
  ui.activeTabIndex = TAB_LAYERS;
  nextTick(() => {
    const layer = l.getLayerById(layerId);
    if (layer) {
      layer._isOpen = true;
      nextTick(() => l.zoomToLayer(layerId));
    }
    activeLayerId.value = layerId;
  });
});

onImageLayerSelect(({ layerId }) => {
  if (!mapRef.value) return;
  ui.activeTabIndex = TAB_LAYERS;
  nextTick(() => {
    imageLayerBus.emit({ action: "zoom", id: layerId });
    activeMapLayerId.value = layerId;
  });
});

onFeatureSelect(({ featureId }) => {
  ui.activeTabIndex = TAB_LAYERS;
  const { feature, layer } = activeScenario.geo.getFeatureById(featureId);
  nextTick(() => {
    if (layer) {
      layer._isOpen = true;
    }
    if (feature) {
      selectedUnitIds.value.clear();
      selectedFeatureIds.value.clear();
      selectedFeatureIds.value.add(featureId);

      nextTick(() => l.zoomToFeature(featureId));
    }
  });
});

onEventSelect((e) => {
  activeScenario.time.setCurrentTime(e.startTime);
  activeScenarioEventId.value = e.id as string;
  ui.activeTabIndex = TAB_EVENTS;
});

onPlaceSelect((item) => {
  const map = mapRef.value;
  const transform = getTransform("EPSG:4326", map.getView().getProjection());
  const extent = fixExtent(item.properties.extent);
  const polygon = extent && polygonFromExtent(applyTransform(extent, transform));
  const p = new OlPoint(item.geometry.coordinates).transform(
    "EPSG:4326",
    map.getView().getProjection()
  ) as any;

  // add temporary layer
  const layer = new VectorLayer({
    source: new VectorSource({
      features: [new OlFeature({ geometry: polygon || p })],
    }),
    style: {
      "stroke-color": "#f00",
      "stroke-width": 2,
      "circle-radius": 12,
      "circle-stroke-color": "#f00",
      "circle-stroke-width": 4,
    },
  });
  layer.setMap(map);
  setTimeout(() => layer.setMap(null), 2000);

  map.getView().fit(polygon || p, { maxZoom: 15 });
});
</script>
<template></template>
