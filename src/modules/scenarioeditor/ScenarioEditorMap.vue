<script setup lang="ts">
import {
  defineAsyncComponent,
  onActivated,
  onUnmounted,
  provide,
  type ShallowRef,
  shallowRef,
  watch,
  ref,
  computed,
} from "vue";
import { useActiveUnitStore } from "@/stores/dragStore";
import {
  activeLayerKey,
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import { OlMapAdapter } from "@/geo/engines/openlayers/olMapAdapter";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { injectStrict } from "@/utils";
import MapEditorMainToolbar from "@/modules/scenarioeditor/MapEditorMainToolbar.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import MapEditorMeasurementToolbar from "@/modules/scenarioeditor/MapEditorMeasurementToolbar.vue";
import OLMap from "ol/Map";
import NewScenarioMap from "@/components/ScenarioMap.vue";
import MapEditorDrawToolbar from "@/modules/scenarioeditor/MapEditorDrawToolbar.vue";
import Select from "ol/interaction/Select";
import { useEventListener, useRafFn } from "@vueuse/core";
import { inputEventFilter } from "@/components/helpers";
import SearchScenarioActions from "@/modules/scenarioeditor/SearchScenarioActions.vue";
import MapEditorUnitTrackToolbar from "@/modules/scenarioeditor/MapEditorUnitTrackToolbar.vue";
import { usePlaybackStore } from "@/stores/playbackStore";
import type { EncryptedScenario, Scenario } from "@/types/scenarioModels";
import type { LoadableScenario } from "@/scenariostore/upgrade";
import ScenarioMapModeShell from "@/modules/scenarioeditor/ScenarioMapModeShell.vue";
import { useScenarioMapModeController } from "@/modules/scenarioeditor/useScenarioMapModeController";
import { useNotifications } from "@/composables/notifications";
import { useSelectedItems } from "@/stores/selectedStore";
import {
  convertGeoJSONFeatureToScenarioFeature,
  findLikelyNameColumn,
  getGeoJSONPropertyNames,
  getGeoJSONFeatures,
} from "@/importexport/geojsonScenarioFeatures";

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
);

const emit = defineEmits(["showExport", "showLoad", "show-settings"]);
const activeScenario = injectStrict(activeScenarioKey);
const activeLayerId = injectStrict(activeLayerKey);
const { send } = useNotifications();
const { clear: clearSelection, selectedFeatureIds, activeFeatureId } = useSelectedItems();

const {
  store: { state, groupUpdate },
  geo,
} = activeScenario;
const {
  time: { setCurrentTime },
} = activeScenario;
const toolbarStore = useMainToolbarStore();
const activeUnitStore = useActiveUnitStore();
const {
  ui,
  isMobile,
  showLeftPanel,
  detailsWidth,
  showDetailsPanel,
  openTimeDialog,
  onIncDay,
  onDecDay,
  onShowPlaceSearch,
  onCloseDetailsPanel,
  goToNextScenarioEvent,
  goToPrevScenarioEvent,
} = useScenarioMapModeController(() => {
  scenarioMapEngineRef.value?.map.updateSize();
});
const playback = usePlaybackStore();

const scenarioMapEngineRef = shallowRef<ScenarioMapEngine>();
const nativeMapRef = shallowRef<OLMap>();
const featureSelectInteractionRef = shallowRef<Select>();
provide(
  activeScenarioMapEngineKey,
  scenarioMapEngineRef as ShallowRef<ScenarioMapEngine | undefined>,
);
provide(activeNativeMapKey, nativeMapRef as ShallowRef<OLMap>);
provide(
  activeFeatureSelectInteractionKey,
  featureSelectInteractionRef as ShallowRef<Select>,
);

function onMapReady({
  olMap,
  featureSelectInteraction,
  scenarioLayerController,
}: {
  olMap: OLMap;
  featureSelectInteraction: Select;
  scenarioLayerController: ScenarioMapEngine["layers"];
}) {
  nativeMapRef.value = olMap;
  scenarioMapEngineRef.value = {
    map: new OlMapAdapter(olMap),
    layers: scenarioLayerController,
    suspendFeatureSelection() {
      featureSelectInteraction.setMap(null);
    },
    resumeFeatureSelection() {
      featureSelectInteraction.setMap(olMap);
    },
  };
  featureSelectInteractionRef.value = featureSelectInteraction;
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

onUnmounted(() => {
  activeUnitStore.clearActiveUnit();
  playback.playbackRunning = false;
});

onActivated(() => {
  scenarioMapEngineRef.value?.map.updateSize();
  playback.playbackRunning = false;
});

const { pause, resume } = useRafFn(
  () => {
    if (
      playback.playbackLooping &&
      playback.endMarker !== undefined &&
      playback.startMarker !== undefined
    ) {
      if (state.currentTime >= playback.endMarker) {
        setCurrentTime(playback.startMarker);
        return;
      }
    }

    const newTime = state.currentTime + playback.playbackSpeed;
    setCurrentTime(newTime);
  },
  { immediate: false, fpsLimit: 60 },
);

watch(
  () => playback.playbackRunning,
  (running) => {
    if (running) {
      resume();
    } else {
      pause();
    }
  },
  { immediate: true },
);

const showDecryptModal = ref(false);
const currentEncryptedScenario = ref<EncryptedScenario | null>(null);

const { loadScenario: browserLoadScenario } = useBrowserScenarios();

function onDecrypted(scenario: Scenario) {
  browserLoadScenario(scenario);
  showDecryptModal.value = false;
  currentEncryptedScenario.value = null;
}

const mapReady = computed(() => Boolean(nativeMapRef.value));
const headerControlsStyle = computed(() =>
  !isMobile.value && showDetailsPanel.value && ui.detailsPanelMode === "overlay"
    ? { marginRight: `${detailsWidth.value + 16}px` }
    : undefined,
);

function getTargetLayerId() {
  if (activeLayerId.value && state.layerStackMap[activeLayerId.value]?.kind === "overlay") {
    return activeLayerId.value;
  }

  return state.layerStack.find((layerId) => state.layerStackMap[layerId]?.kind === "overlay");
}

function pasteGeoJSON(data: unknown) {
  const clipboardFeatures = getGeoJSONFeatures(data);
  if (!clipboardFeatures) return false;

  const targetLayerId = getTargetLayerId();
  if (!targetLayerId) {
    send({
      message: "No scenario feature layer available for pasted GeoJSON",
      type: "error",
    });
    return false;
  }

  const nameColumn = findLikelyNameColumn(
    getGeoJSONPropertyNames({
      type: "FeatureCollection",
      features: clipboardFeatures,
    }),
  );
  const importedFeatures = clipboardFeatures
    .map((feature) =>
      convertGeoJSONFeatureToScenarioFeature(feature, targetLayerId, { nameColumn }),
    )
    .filter((feature) => !!feature);
  if (!importedFeatures.length) {
    send({
      message: "Clipboard GeoJSON has no importable features",
      type: "error",
    });
    return false;
  }

  const addedFeatureIds: string[] = [];
  groupUpdate(() => {
    importedFeatures.forEach((feature) => {
      addedFeatureIds.push(geo.addFeature(feature, targetLayerId));
    });
  });

  clearSelection();
  activeFeatureId.value = addedFeatureIds[0];
  addedFeatureIds.slice(1).forEach((featureId) => selectedFeatureIds.value.add(featureId));
  send({
    message: `Pasted ${addedFeatureIds.length} GeoJSON feature${
      addedFeatureIds.length === 1 ? "" : "s"
    }`,
    type: "success",
  });
  return true;
}

useEventListener(document, "paste", (e: ClipboardEvent) => {
  if (!inputEventFilter(e)) return;
  if (e.clipboardData?.types.includes("application/orbat")) return;

  const text = e.clipboardData?.getData("text/plain");
  if (!text) return;

  try {
    const scenarioData = JSON.parse(text) as LoadableScenario | EncryptedScenario;
    if (scenarioData?.type === "ORBAT-mapper") {
      browserLoadScenario(scenarioData);
      e.preventDefault();
      return;
    }
    if (scenarioData?.type === "ORBAT-mapper-encrypted") {
      currentEncryptedScenario.value = scenarioData as EncryptedScenario;
      showDecryptModal.value = true;
      e.preventDefault();
      return;
    }
    if (pasteGeoJSON(scenarioData)) {
      e.preventDefault();
    }
  } catch {
    // Not a valid JSON or not a scenario, ignore
  }
});
</script>

<template>
  <ScenarioMapModeShell
    :map-ready="mapReady"
    :is-mobile="isMobile"
    :show-left-panel="showLeftPanel"
    :show-details-panel="showDetailsPanel"
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
    @close-details-panel="onCloseDetailsPanel()"
  >
    <template #map>
      <NewScenarioMap class="flex-auto" @mapReady="onMapReady" />
    </template>
    <template #footer-overlays>
      <footer
        v-if="nativeMapRef && ui.showToolbar && !isMobile"
        class="pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2"
      >
        <MapEditorMainToolbar
          @open-time-modal="openTimeDialog()"
          @inc-day="onIncDay()"
          @dec-day="onDecDay()"
          @next-event="goToNextScenarioEvent()"
          @prev-event="goToPrevScenarioEvent()"
          @show-settings="emit('show-settings')"
        />
        <MapEditorMeasurementToolbar
          class="absolute bottom-14 sm:bottom-16"
          v-if="toolbarStore.currentToolbar === 'measurements'"
        />
        <MapEditorDrawToolbar
          class="absolute bottom-14 sm:bottom-16"
          v-if="toolbarStore.currentToolbar === 'draw'"
        />
        <MapEditorUnitTrackToolbar
          class="absolute bottom-14 sm:bottom-16"
          v-if="toolbarStore.currentToolbar === 'track'"
        />
      </footer>
    </template>
    <template #mobile-toolbar>
      <div
        v-if="nativeMapRef && ui.showToolbar && isMobile"
        class="border-border bg-background pointer-events-auto border-t px-2 py-2"
      >
        <MapEditorMainToolbar
          @open-time-modal="openTimeDialog()"
          @inc-day="onIncDay()"
          @dec-day="onDecDay()"
          @next-event="goToNextScenarioEvent()"
          @prev-event="goToPrevScenarioEvent()"
          @show-settings="emit('show-settings')"
        />
        <MapEditorMeasurementToolbar
          class="mt-2"
          v-if="toolbarStore.currentToolbar === 'measurements'"
        />
        <MapEditorDrawToolbar
          class="mt-2"
          v-if="toolbarStore.currentToolbar === 'draw'"
        />
        <MapEditorUnitTrackToolbar
          class="mt-2"
          v-if="toolbarStore.currentToolbar === 'track'"
        />
      </div>
    </template>
    <template #after-keyboard>
      <SearchScenarioActions v-if="nativeMapRef" />
    </template>
    <template #modals>
      <DecryptScenarioModal
        v-if="showDecryptModal && currentEncryptedScenario"
        v-model="showDecryptModal"
        :encrypted-scenario="currentEncryptedScenario"
        @decrypted="onDecrypted"
      />
    </template>
  </ScenarioMapModeShell>
</template>
