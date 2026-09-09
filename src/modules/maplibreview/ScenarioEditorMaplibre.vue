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
import { injectStrict } from "@/utils";
import { MapLibreMapAdapter } from "@/geo/mapLibreMapAdapter";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";
import { createTacticalDrawSurface } from "@/geo/engines/maplibre/tacticalDrawSurface";
import {
  isTacticalDrawProbeEnabled,
  startTacticalDrawProbe,
} from "@/geo/engines/maplibre/tacticalDrawProbe";
import { useTacticalGraphicRenderFeed } from "@/modules/maplibreview/useTacticalGraphicRenderFeed";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useBasemapArchives } from "@/composables/basemapArchives";
import { useGeoStore } from "@/stores/geoStore";
import { type MapProjection, useMapSettingsStore } from "@/stores/mapSettingsStore";
import {
  routeDetailsPanelKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioDrawKey,
  tacticalGraphicRenderFeedKey,
} from "@/components/injects";
import { useScenarioDraw } from "@/modules/scenarioeditor/useScenarioDraw";
import ScenarioMapModeShell from "@/modules/scenarioeditor/ScenarioMapModeShell.vue";
import { useScenarioMapModeController } from "@/modules/scenarioeditor/useScenarioMapModeController";
import MaplibreContextMenu from "@/modules/maplibreview/MaplibreContextMenu.vue";
import MlMapLogic from "@/modules/maplibreview/MlMapLogic.vue";
import MaplibreMap from "@/modules/maplibreview/MaplibreMap.vue";
import MaplibreSearchScenarioActions from "@/modules/maplibreview/MaplibreSearchScenarioActions.vue";
import MapEditorMainToolbar from "@/modules/scenarioeditor/MapEditorMainToolbar.vue";
import MapEditorUnitTrackToolbar from "@/modules/scenarioeditor/MapEditorUnitTrackToolbar.vue";
import MapEditorDrawToolbar from "@/modules/scenarioeditor/MapEditorDrawToolbar.vue";
import DrawSessionActionBar from "@/modules/scenarioeditor/DrawSessionActionBar.vue";
import MapEditorMeasurementToolbar from "@/modules/scenarioeditor/MapEditorMeasurementToolbar.vue";
import MaplibreLabsPopover from "@/modules/maplibreview/MaplibreLabsPopover.vue";
import ReferenceGridControl from "@/modules/maplibreview/ReferenceGridControl.vue";
import { useReferenceGridLayers } from "@/modules/maplibreview/useReferenceGridLayers";
import { useReferenceGridStore } from "@/stores/referenceGridStore";
import {
  REFERENCE_GRID_LABEL_METRICS,
  REFERENCE_GRID_LABEL_TEXT_SHADOW,
} from "@/modules/maplibreview/referenceGridPresentation";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { resolveMaplibreBasemap } from "@/modules/maplibreview/maplibreBasemaps";
import {
  getScenarioMapViewSnapshot,
  type ScenarioMapViewSnapshot,
} from "@/modules/scenarioeditor/scenarioMapViewSnapshot";
import { useScenarioRouting } from "@/modules/scenarioeditor/useScenarioRouting";
import { useMapLibreRoutingPreview } from "@/geo/routing/mapLibreRoutingPreview";
import { useScenarioEvents } from "@/modules/scenarioeditor/scenarioEvents";

const props = defineProps<{
  initialMapView?: ScenarioMapViewSnapshot;
}>();
const emit = defineEmits<{
  "show-settings": [];
  "map-view-change": [snapshot: ScenarioMapViewSnapshot];
}>();

const activeScenario = injectStrict(activeScenarioKey);
const toolbarStore = useMainToolbarStore();
useScenarioEvents();

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
const referenceGrid = useReferenceGridStore();
const { labels: referenceGridLabels, dispose: disposeReferenceGridLayers } =
  useReferenceGridLayers(
    () => mlMap.value,
    () => scenarioMapEngineRef.value?.draw?.adapter,
  );
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
let tacticalDrawSurface: ReturnType<typeof createTacticalDrawSurface> | null = null;
let cleanupTacticalDrawProbe: (() => void) | null = null;
provide(
  activeScenarioMapEngineKey,
  scenarioMapEngineRef as ShallowRef<ScenarioMapEngine | undefined>,
);
// Owned here rather than in `MlMapLogic` because this is where the tactical-draw
// surface is constructed and destroyed, and because M2 hoists `useScenarioDraw` to
// this same view — `arm()` settles through the provided feed.
const tacticalGraphicRenderFeed = useTacticalGraphicRenderFeed(activeScenario, {
  surface: () => scenarioMapEngineRef.value?.draw,
});
provide(tacticalGraphicRenderFeedKey, tacticalGraphicRenderFeed);
// The armed-tool owner lives here, not in `MapEditorDrawToolbar`, which is `v-if`'d.
// The engine ref is passed rather than injected: Vue never resolves a component's own
// `provide`. Arming settles through the feed provided just above.
const scenarioDraw = useScenarioDraw({
  engine: scenarioMapEngineRef,
  renderFeed: tacticalGraphicRenderFeed,
});
const { isDrawing } = scenarioDraw;
provide(scenarioDrawKey, scenarioDraw);
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
const { restoreRememberedBasemapArchive } = useBasemapArchives();
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
  cleanupTacticalDrawProbe?.();
  cleanupTacticalDrawProbe = null;
  tacticalDrawSurface?.destroy();
  tacticalDrawSurface = null;
  const rawMap = markRaw(mapInstance);
  referenceGrid.visible = false;
  mlMap.value = rawMap;
  const adapter = markRaw(new MapLibreMapAdapter(rawMap));
  // Never reactive: the tactical-draw engine caches rendered output on `Graphic`
  // object identity, which a Vue proxy would silently defeat.
  const draw = markRaw(createTacticalDrawSurface(rawMap));
  const layers = markRaw(
    createMapLibreScenarioLayerController(adapter, {
      getControlMeasureAnchorLayerId: () => draw.getGraphicsAnchorLayerId(),
    }),
  );
  tacticalDrawSurface = draw;
  scenarioMapEngineRef.value = markRaw({
    map: adapter,
    layers,
    draw,
    suspendFeatureSelection() {},
    resumeFeatureSelection() {},
  });
  cleanupScenarioBinding = layers.bindScenario(activeScenario);
  geoStore.setMapAdapter(adapter);
  if (isTacticalDrawProbeEnabled()) {
    cleanupTacticalDrawProbe = startTacticalDrawProbe(rawMap, draw);
  }
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

onMounted(async () => {
  await maplibreLayersStore.initialize();
  // The layer list must be resolved first, so a remembered key that a config-declared archive
  // already provides is not treated as pending.
  await restoreRememberedBasemapArchive();
});

function disposeMaplibreBinding() {
  // Settle before the surface goes: an open session must not outlive the façade it is
  // running on. The feed's own scope-dispose settle fires too late for this path.
  scenarioDraw.arm({ kind: "none" });
  tacticalGraphicRenderFeed.settle("teardown");
  cleanupTacticalDrawProbe?.();
  cleanupTacticalDrawProbe = null;
  cleanupScenarioBinding?.();
  cleanupScenarioBinding = null;
  tacticalDrawSurface?.destroy();
  tacticalDrawSurface = null;
  scenarioMapEngineRef.value = undefined;
  geoStore.setMapAdapter(null);
}

onBeforeUnmount(() => {
  const snapshot = getScenarioMapViewSnapshot(scenarioMapEngineRef.value?.map);
  if (snapshot) {
    emit("map-view-change", snapshot);
  }
  disposeReferenceGridLayers();
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
      <div class="@container relative flex flex-auto">
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
      </div>
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
      <div
        v-if="referenceGrid.visible"
        data-reference-grid-labels
        class="pointer-events-none absolute inset-0 z-10 overflow-hidden font-mono text-xs font-semibold tabular-nums"
        aria-hidden="true"
      >
        <span
          v-for="label in referenceGridLabels"
          :key="label.id"
          class="absolute whitespace-nowrap"
          :style="{
            left: `${label.pixel[0]}px`,
            top: `${label.pixel[1]}px`,
            color: referenceGrid.color,
            opacity: referenceGrid.opacity,
            transform:
              label.anchor === 'bottom'
                ? 'translate(-50%, -100%)'
                : label.anchor === 'left'
                  ? `translate(${REFERENCE_GRID_LABEL_METRICS.edgeOffsetPx}px, -50%)`
                  : label.anchor === 'zone'
                    ? `translate(${REFERENCE_GRID_LABEL_METRICS.zoneInsetPx}px, calc(-100% - ${REFERENCE_GRID_LABEL_METRICS.zoneInsetPx}px))`
                    : 'translate(0, -50%)',
            textShadow: REFERENCE_GRID_LABEL_TEXT_SHADOW,
          }"
        >
          {{ label.text }}
        </span>
      </div>
      <footer
        v-if="mlMap && !isMobile && (ui.showToolbar || isDrawing)"
        class="pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2"
      >
        <MapEditorMainToolbar
          v-if="ui.showToolbar"
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
            <ReferenceGridControl />
            <MaplibreLabsPopover :ml-map="mlMap" />
          </template>
        </MapEditorMainToolbar>
        <MapEditorUnitTrackToolbar
          v-if="ui.showToolbar && !isDrawing && toolbarStore.currentToolbar === 'track'"
          class="absolute bottom-14 sm:bottom-16"
        />
        <MapEditorMeasurementToolbar
          v-if="
            ui.showToolbar && !isDrawing && toolbarStore.currentToolbar === 'measurements'
          "
          class="absolute bottom-14 sm:bottom-16"
        />
        <DrawSessionActionBar v-if="isDrawing" class="absolute bottom-14 sm:bottom-16" />
        <MapEditorDrawToolbar
          v-if="ui.showToolbar && !isDrawing && toolbarStore.currentToolbar === 'draw'"
          class="absolute bottom-14 sm:bottom-16"
        />
      </footer>
    </template>
    <template #mobile-toolbar>
      <div
        v-if="mlMap && isMobile && (ui.showToolbar || isDrawing)"
        class="border-border bg-background pointer-events-auto border-t px-1 py-2"
      >
        <DrawSessionActionBar v-if="isDrawing" class="mb-2" />
        <MapEditorUnitTrackToolbar
          v-if="ui.showToolbar && !isDrawing && toolbarStore.currentToolbar === 'track'"
          class="mb-2"
        />
        <MapEditorMeasurementToolbar
          v-if="
            ui.showToolbar && !isDrawing && toolbarStore.currentToolbar === 'measurements'
          "
          class="mb-2"
        />
        <MapEditorDrawToolbar
          v-if="ui.showToolbar && !isDrawing && toolbarStore.currentToolbar === 'draw'"
          class="mb-2"
        />
        <MapEditorMainToolbar
          v-if="ui.showToolbar"
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
            <ReferenceGridControl />
            <MaplibreLabsPopover :ml-map="mlMap" />
          </template>
        </MapEditorMainToolbar>
      </div>
    </template>
  </ScenarioMapModeShell>
</template>
