<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onActivated,
  onUnmounted,
  provide,
  type ShallowRef,
  shallowRef,
  watch,
  ref,
} from "vue";
import { useActiveUnitStore } from "@/stores/dragStore";
import {
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  timeModalKey,
} from "@/components/injects";
import { OlMapAdapter } from "@/geo/engines/openlayers/olMapAdapter";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import { PanelLeftOpenIcon as ShowPanelIcon } from "lucide-vue-next";
import { injectStrict } from "@/utils";
import MapTimeController from "@/components/MapTimeController.vue";
import MapEditorMainToolbar from "@/modules/scenarioeditor/MapEditorMainToolbar.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import MapEditorMeasurementToolbar from "@/modules/scenarioeditor/MapEditorMeasurementToolbar.vue";
import OLMap from "ol/Map";
import NewScenarioMap from "@/components/ScenarioMap.vue";
import MapEditorDrawToolbar from "@/modules/scenarioeditor/MapEditorDrawToolbar.vue";
import Select from "ol/interaction/Select";
import {
  breakpointsTailwind,
  useBreakpoints,
  useEventListener,
  useRafFn,
  useToggle,
} from "@vueuse/core";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import MapEditorMobilePanel from "@/modules/scenarioeditor/MapEditorMobilePanel.vue";
import MapEditorDesktopPanel from "@/modules/scenarioeditor/MapEditorDesktopPanel.vue";
import MapEditorDetailsPanel from "@/modules/scenarioeditor/MapEditorDetailsPanel.vue";
import DetailsPanelContent from "@/modules/scenarioeditor/DetailsPanelContent.vue";
import { useUiStore, useWidthStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { GlobalEvents } from "vue-global-events";
import SearchScenarioActions from "@/modules/scenarioeditor/SearchScenarioActions.vue";
import IconButton from "@/components/IconButton.vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import { useSelectedItems } from "@/stores/selectedStore";
import ScenarioTimeline from "@/modules/scenarioeditor/ScenarioTimeline.vue";
import MapEditorUnitTrackToolbar from "@/modules/scenarioeditor/MapEditorUnitTrackToolbar.vue";
import { storeToRefs } from "pinia";
import { usePlaybackStore } from "@/stores/playbackStore";
import UnitBreadcrumbs from "@/modules/scenarioeditor/UnitBreadcrumbs.vue";
import { Button } from "@/components/ui/button";
import type { EncryptedScenario, Scenario } from "@/types/scenarioModels";
import type { LoadableScenario } from "@/scenariostore/upgrade";

const DecryptScenarioModal = defineAsyncComponent(
  () => import("@/components/DecryptScenarioModal.vue"),
);

const emit = defineEmits(["showExport", "showLoad", "show-settings"]);
const activeScenario = injectStrict(activeScenarioKey);

const { getModalTimestamp } = injectStrict(timeModalKey);
const { state } = activeScenario.store;
const {
  time: { setCurrentTime, add, subtract, goToNextScenarioEvent, goToPrevScenarioEvent },
} = activeScenario;
const toolbarStore = useMainToolbarStore();
const activeUnitStore = useActiveUnitStore();
const ui = useUiStore();
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

const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smallerOrEqual("md");

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
  };
  featureSelectInteractionRef.value = featureSelectInteraction;
}

const {
  selectedUnitIds,
  selectedFeatureIds,
  activeScenarioEventId,
  activeMapLayerId,
  showScenarioInfo,
  clear: clearSelected,
} = useSelectedItems();

const { showLeftPanel } = storeToRefs(ui);
const toggleLeftPanel = useToggle(showLeftPanel);

const widthStore = useWidthStore();
const { orbatPanelWidth, detailsWidth } = storeToRefs(widthStore);

const hasSelection = computed(() =>
  Boolean(
    selectedFeatureIds.value.size ||
    selectedUnitIds.value.size ||
    activeScenarioEventId.value ||
    activeMapLayerId.value ||
    showScenarioInfo.value,
  ),
);

const detailsPanelClosed = ref(false);

watch(hasSelection, (val) => {
  if (val) detailsPanelClosed.value = false;
});

const showDetailsPanel = computed(() => {
  if (detailsPanelClosed.value) return false;
  return hasSelection.value || ui.detailsPanelPinned;
});

const showDetailsSidebar = computed(
  () => showDetailsPanel.value && ui.detailsPanelMode === "sidebar",
);

watch(
  [
    showLeftPanel,
    orbatPanelWidth,
    showDetailsSidebar,
    detailsWidth,
    () => ui.detailsPanelMode,
  ],
  () => {
    nextTick(() => {
      scenarioMapEngineRef.value?.map.updateSize();
    });
  },
);

onUnmounted(() => {
  activeUnitStore.clearActiveUnit();
  playback.playbackRunning = false;
});

onActivated(() => {
  scenarioMapEngineRef.value?.map.updateSize();
  playback.playbackRunning = false;
});

function onCloseDetailsPanel() {
  detailsPanelClosed.value = true;
  clearSelected();
}

const openTimeDialog = async () => {
  const newTimestamp = await getModalTimestamp(state.currentTime, {
    timeZone: state.info.timeZone,
  });
  if (newTimestamp !== undefined) {
    setCurrentTime(newTimestamp);
  }
};

function onIncDay() {
  add(1, "day", true);
}

function onDecDay() {
  subtract(1, "day", true);
}

function onShowPlaceSearch() {
  ui.searchGeoMode = true;
  ui.showSearch = true;
}

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
    } else if (scenarioData?.type === "ORBAT-mapper-encrypted") {
      currentEncryptedScenario.value = scenarioData as EncryptedScenario;
      showDecryptModal.value = true;
      e.preventDefault();
    }
  } catch {
    // Not a valid JSON or not a scenario, ignore
  }
});
</script>

<template>
  <div class="relative flex min-h-0 flex-auto flex-col">
    <div class="relative flex min-h-0 flex-1">
      <template v-if="!isMobile">
        <MapEditorDesktopPanel v-if="showLeftPanel" @close="toggleLeftPanel()" />
      </template>
      <div class="relative flex min-w-0 flex-auto flex-col">
        <NewScenarioMap class="flex-auto" @mapReady="onMapReady" />
        <main
          v-if="nativeMapRef"
          class="pointer-events-none absolute inset-0 flex flex-col justify-between"
        >
          <header class="flex flex-none items-center justify-between sm:p-2">
            <div class="ml-10 flex items-center sm:ml-8">
              <MapTimeController
                class="pointer-events-auto ml-1"
                :show-controls="false"
                @open-time-modal="openTimeDialog()"
                @show-settings="emit('show-settings')"
                @inc-day="onIncDay()"
                @dec-day="onDecDay()"
                @next-event="goToNextScenarioEvent()"
                @prev-event="goToPrevScenarioEvent()"
              />
            </div>
            <IconButton
              @click.stop="onShowPlaceSearch"
              class="pointer-events-auto mr-2 sm:ml-2"
              :style="
                !isMobile && showDetailsPanel && ui.detailsPanelMode === 'overlay'
                  ? { marginRight: detailsWidth + 16 + 'px' }
                  : {}
              "
              title="Search"
            >
              <MagnifyingGlassIcon class="h-5 w-5" />
            </IconButton>
          </header>
          <Button
            v-if="!isMobile && !showLeftPanel"
            type="button"
            variant="secondary"
            class="pointer-events-auto absolute top-[45%] left-0 h-11 w-5 -translate-y-1/2 rounded-l-none rounded-r-md px-0"
            @click="toggleLeftPanel()"
            title="Show panel"
          >
            <ShowPanelIcon class="size-4" />
          </Button>
        </main>
        <footer
          v-if="nativeMapRef && ui.showToolbar"
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
        <MapEditorDetailsPanel
          v-if="!isMobile && showDetailsPanel && ui.detailsPanelMode === 'overlay'"
          :mode="ui.detailsPanelMode"
          @close="onCloseDetailsPanel()"
        >
          <DetailsPanelContent />
        </MapEditorDetailsPanel>
      </div>
      <MapEditorDetailsPanel
        v-if="!isMobile && showDetailsPanel && ui.detailsPanelMode === 'sidebar'"
        :mode="ui.detailsPanelMode"
        @close="onCloseDetailsPanel()"
      >
        <DetailsPanelContent />
      </MapEditorDetailsPanel>
    </div>
    <template v-if="isMobile">
      <UnitBreadcrumbs v-if="ui.showOrbatBreadcrumbs" />
      <MapEditorMobilePanel
        @open-time-modal="openTimeDialog()"
        @inc-day="onIncDay()"
        @dec-day="onDecDay()"
        @next-event="goToNextScenarioEvent()"
        @prev-event="goToPrevScenarioEvent()"
        @show-settings="emit('show-settings')"
      />
    </template>
    <KeyboardScenarioActions v-if="nativeMapRef" />
    <SearchScenarioActions v-if="nativeMapRef" />
    <GlobalEvents
      v-if="ui.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.t="openTimeDialog"
      @keyup.s="ui.showSearch = true"
    />
    <UnitBreadcrumbs v-if="ui.showOrbatBreadcrumbs && !isMobile" />
    <ScenarioTimeline v-if="ui.showTimeline" />
    <DecryptScenarioModal
      v-if="showDecryptModal && currentEncryptedScenario"
      v-model="showDecryptModal"
      :encrypted-scenario="currentEncryptedScenario"
      @decrypted="onDecrypted"
    />
  </div>
</template>
