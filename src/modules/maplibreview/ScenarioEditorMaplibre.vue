<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  markRaw,
  shallowRef,
  watch,
} from "vue";
import type { ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import type OLMap from "ol/Map";
import type Select from "ol/interaction/Select";
import { injectStrict } from "@/utils";
import { MapLibreMapAdapter } from "@/geo/mapLibreMapAdapter";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useGeoStore } from "@/stores/geoStore";
import { type MapProjection, useMapSettingsStore } from "@/stores/mapSettingsStore";
import {
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
  routeDetailsPanelKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import ScenarioMapModeShell from "@/modules/scenarioeditor/ScenarioMapModeShell.vue";
import { useScenarioMapModeController } from "@/modules/scenarioeditor/useScenarioMapModeController";
import MaplibreContextMenu from "@/modules/maplibreview/MaplibreContextMenu.vue";
import MlMapLogic from "@/modules/maplibreview/MlMapLogic.vue";
import MaplibreMap from "@/modules/maplibreview/MaplibreMap.vue";
import MaplibreSearchScenarioActions from "@/modules/maplibreview/MaplibreSearchScenarioActions.vue";
import MapEditorMainToolbar from "@/modules/scenarioeditor/MapEditorMainToolbar.vue";
import MapEditorUnitTrackToolbar from "@/modules/scenarioeditor/MapEditorUnitTrackToolbar.vue";
import MapEditorDrawToolbar from "@/modules/scenarioeditor/MapEditorDrawToolbar.vue";
import MapEditorMeasurementToolbar from "@/modules/scenarioeditor/MapEditorMeasurementToolbar.vue";
import MaplibreLabsPopover from "@/modules/maplibreview/MaplibreLabsPopover.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { resolveMaplibreBasemap } from "@/modules/maplibreview/maplibreBasemaps";
import {
  getScenarioMapViewSnapshot,
  type ScenarioMapViewSnapshot,
} from "@/modules/scenarioeditor/scenarioMapViewSnapshot";
import { useScenarioRouting } from "@/modules/scenarioeditor/useScenarioRouting";
import { useMapLibreRoutingPreview } from "@/geo/routing/mapLibreRoutingPreview";

const props = defineProps<{
  initialMapView?: ScenarioMapViewSnapshot;
}>();
const emit = defineEmits<{
  "show-settings": [];
  "map-view-change": [snapshot: ScenarioMapViewSnapshot];
}>();

const activeScenario = injectStrict(activeScenarioKey);
const toolbarStore = useMainToolbarStore();

const {
  store: { state },
} = activeScenario;
const {
  ui,
  isMobile,
  showLeftPanel,
  detailsWidth,
  showDetailsPanel,
  hasRouteDetails,
  openTimeDialog,
  onIncDay,
  onDecDay,
  onShowPlaceSearch,
  onCloseDetailsPanel,
  goToNextScenarioEvent,
  goToPrevScenarioEvent,
} = useScenarioMapModeController(() => {
  mlMap.value?.resize();
});

const mlMap = shallowRef<MlMap>();
const scenarioMapEngineRef = shallowRef<ScenarioMapEngine>();
const {
  activeRoutingUnitName,
  addRouteLeg,
  clearCurrentLeg,
  finishRoute,
  closeRouting,
  endRouting,
  handleEscape,
} = useScenarioRouting(() => scenarioMapEngineRef.value?.map);
let cleanupScenarioBinding: (() => void) | null = null;
const nativeMapStub = shallowRef(null) as unknown as ShallowRef<OLMap>;
const featureSelectStub = shallowRef(null) as unknown as ShallowRef<Select>;
provide(
  activeScenarioMapEngineKey,
  scenarioMapEngineRef as ShallowRef<ScenarioMapEngine | undefined>,
);
provide(activeNativeMapKey, nativeMapStub);
provide(activeFeatureSelectInteractionKey, featureSelectStub);
provide(routeDetailsPanelKey, {
  activeRoutingUnitName,
  addRouteLeg,
  clearCurrentLeg,
  finishRoute,
  closeRouting,
  endRouting,
  handleEscape,
});
useMapLibreRoutingPreview(() => mlMap.value);

const geoStore = useGeoStore();
const maplibreLayersStore = useMaplibreLayersStore();
const mapSettingsStore = useMapSettingsStore();
const maplibreBaseMapId = computed({
  get: () =>
    resolveMaplibreBasemap(
      mapSettingsStore.maplibreBaseLayerName,
      maplibreLayersStore.layers,
    ).id,
  set: (value: string) => {
    mapSettingsStore.maplibreBaseLayerName = value;
  },
});

const effectiveProjection = computed<MapProjection>(() =>
  state.mapSettings.maxExtent ? "mercator" : mapSettingsStore.mapProjection,
);

function onProjectionUpdate(projection: MapProjection) {
  if (!state.mapSettings.maxExtent) {
    mapSettingsStore.mapProjection = projection;
  }
}
const activeMaplibreBasemap = computed(() =>
  resolveMaplibreBasemap(maplibreBaseMapId.value, maplibreLayersStore.layers),
);

function onMapReady(mapInstance: MlMap) {
  cleanupScenarioBinding?.();
  const rawMap = markRaw(mapInstance);
  mlMap.value = rawMap;
  const adapter = markRaw(new MapLibreMapAdapter(rawMap));
  const layers = markRaw(createMapLibreScenarioLayerController(adapter));
  scenarioMapEngineRef.value = markRaw({
    map: adapter,
    layers,
    suspendFeatureSelection() {},
    resumeFeatureSelection() {},
  });
  cleanupScenarioBinding = layers.bindScenario(activeScenario);
  geoStore.setMapAdapter(adapter);
}

watch(
  () => ({
    engine: scenarioMapEngineRef.value,
    extent: state.mapSettings.maxExtent,
    minZoom: state.mapSettings.minZoom,
    maxZoom: state.mapSettings.maxZoom,
  }),
  ({ engine, ...settings }) => {
    engine?.map.setViewConstraints({
      extent: settings.extent ?? null,
      minZoom: settings.minZoom ?? null,
      maxZoom: settings.maxZoom ?? null,
    });
  },
  { immediate: true },
);

onMounted(() => {
  void maplibreLayersStore.initialize();
});

function disposeMaplibreBinding() {
  cleanupScenarioBinding?.();
  cleanupScenarioBinding = null;
  scenarioMapEngineRef.value = undefined;
  geoStore.setMapAdapter(null);
}

onBeforeUnmount(() => {
  const snapshot = getScenarioMapViewSnapshot(scenarioMapEngineRef.value?.map);
  if (snapshot) {
    emit("map-view-change", snapshot);
  }
  disposeMaplibreBinding();
});

const mapReady = computed(() => Boolean(mlMap.value));
const headerControlsStyle = computed(() =>
  !isMobile.value && showDetailsPanel.value && ui.detailsPanelMode === "overlay"
    ? { marginRight: `${detailsWidth.value + 16}px` }
    : undefined,
);

function onCloseActiveDetailsPanel() {
  if (hasRouteDetails.value) {
    closeRouting();
    return;
  }
  onCloseDetailsPanel();
}
</script>

<template>
  <ScenarioMapModeShell
    :map-ready="mapReady"
    :is-mobile="isMobile"
    :show-left-panel="showLeftPanel"
    :show-details-panel="showDetailsPanel"
    header-class="flex min-w-0 flex-none items-start justify-between sm:p-2"
    header-controls-class="bg-background/85 pointer-events-auto mr-1 flex min-w-0 max-w-[calc(100vw-0.5rem)] items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-md p-1 shadow-sm mt-1 backdrop-blur-sm"
    :header-controls-style="headerControlsStyle"
    @open-left-panel="ui.showLeftPanel = true"
    @close-left-panel="ui.showLeftPanel = false"
    @show-settings="emit('show-settings')"
    @open-time-modal="openTimeDialog()"
    @inc-day="onIncDay()"
    @dec-day="onDecDay()"
    @next-event="goToNextScenarioEvent()"
    @prev-event="goToPrevScenarioEvent()"
    @show-place-search="onShowPlaceSearch()"
    @close-details-panel="onCloseActiveDetailsPanel()"
  >
    <template #map>
      <MaplibreContextMenu v-model:base-map-id="maplibreBaseMapId" :map-ref="mlMap">
        <MaplibreMap
          @ready="onMapReady"
          :basemap-id="activeMaplibreBasemap.id"
          :initial-view="props.initialMapView"
          :style-spec="activeMaplibreBasemap.style"
          :projection="effectiveProjection"
          @update:projection="onProjectionUpdate"
          @map-view-change="emit('map-view-change', $event)"
          class="flex-auto bg-radial from-gray-800 to-gray-950"
        />
      </MaplibreContextMenu>
      <MlMapLogic
        v-if="mlMap"
        :mlMap="mlMap"
        :active-scenario="activeScenario"
        :initial-map-view="props.initialMapView"
        :key="state.id"
      />
    </template>
    <template #after-keyboard>
      <MaplibreSearchScenarioActions :ml-map="mlMap" />
    </template>
    <template #footer-overlays>
      <footer
        v-if="mlMap && ui.showToolbar && !isMobile"
        class="pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2"
      >
        <MapEditorMainToolbar
          :can-move-units="true"
          :can-rotate-units="true"
          :can-measure="true"
          :can-draw="true"
          :can-track="true"
          :can-add-units="true"
          location-picker-event-source="dom"
          @open-time-modal="openTimeDialog()"
          @inc-day="onIncDay()"
          @dec-day="onDecDay()"
          @next-event="goToNextScenarioEvent()"
          @prev-event="goToPrevScenarioEvent()"
          @show-settings="emit('show-settings')"
        >
          <template #extra-tools>
            <MaplibreLabsPopover :ml-map="mlMap" />
          </template>
        </MapEditorMainToolbar>
        <MapEditorUnitTrackToolbar
          v-if="toolbarStore.currentToolbar === 'track'"
          class="absolute bottom-14 sm:bottom-16"
        />
        <MapEditorMeasurementToolbar
          v-if="toolbarStore.currentToolbar === 'measurements'"
          class="absolute bottom-14 sm:bottom-16"
        />
        <MapEditorDrawToolbar
          v-if="toolbarStore.currentToolbar === 'draw'"
          class="absolute bottom-14 sm:bottom-16"
        />
      </footer>
    </template>
    <template #mobile-toolbar>
      <div
        v-if="mlMap && ui.showToolbar && isMobile"
        class="border-border bg-background pointer-events-auto border-t px-1 py-2"
      >
        <MapEditorUnitTrackToolbar
          v-if="toolbarStore.currentToolbar === 'track'"
          class="mb-2"
        />
        <MapEditorMeasurementToolbar
          v-if="toolbarStore.currentToolbar === 'measurements'"
          class="mb-2"
        />
        <MapEditorDrawToolbar
          v-if="toolbarStore.currentToolbar === 'draw'"
          class="mb-2"
        />
        <MapEditorMainToolbar
          :can-move-units="true"
          :can-rotate-units="true"
          :can-measure="true"
          :can-draw="true"
          :can-track="true"
          :can-add-units="true"
          location-picker-event-source="dom"
          @open-time-modal="openTimeDialog()"
          @inc-day="onIncDay()"
          @dec-day="onDecDay()"
          @next-event="goToNextScenarioEvent()"
          @prev-event="goToPrevScenarioEvent()"
          @show-settings="emit('show-settings')"
        >
          <template #extra-tools>
            <MaplibreLabsPopover :ml-map="mlMap" />
          </template>
        </MapEditorMainToolbar>
      </div>
    </template>
  </ScenarioMapModeShell>
</template>
