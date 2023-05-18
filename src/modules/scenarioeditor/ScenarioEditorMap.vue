<template>
  <div class="relative flex min-h-0 flex-auto flex-col">
    <div class="relative flex flex-auto flex-col">
      <NewScenarioMap class="flex-auto" @mapReady="onMapReady" />
      <main
        v-if="mapRef"
        class="pointer-events-none absolute inset-0 flex flex-col justify-between"
      >
        <header class="flex flex-none items-center justify-end p-2">
          <MapTimeController
            class="pointer-events-auto"
            :show-controls="isMobile ? ui.mobilePanelOpen : false"
            @open-time-modal="openTimeDialog()"
            @inc-day="onIncDay()"
            @dec-day="onDecDay()"
          />
          <IconButton
            @click.stop="onShowPlaceSearch"
            class="pointer-events-auto ml-2"
            title="Search"
            ><MagnifyingGlassIcon class="h-5 w-5 text-gray-500"
          /></IconButton>
        </header>
        <section v-if="!isMobile" class="flex flex-auto justify-between p-2">
          <MapEditorDesktopPanel v-if="showLeftPanel" @close="toggleLeftPanel()" />
          <div v-else>
            <button
              type="button"
              @click="toggleLeftPanel()"
              title="Show panel"
              class="pointer-events-auto absolute -my-12 rounded bg-white bg-opacity-70 p-1 text-gray-600 hover:text-gray-900"
            >
              <ShowPanelIcon class="h-7 w-7" />
            </button>
          </div>
          <MapEditorDetailsPanel v-if="showDetailsPanel" @close="onCloseDetailsPanel()">
            <ScenarioFeatureDetails
              v-if="selectedFeatureIds.size"
              :selected-ids="selectedFeatureIds"
              class="p-2"
            />
            <UnitPanel v-else-if="activeUnitId" :unit-id="activeUnitId" />
          </MapEditorDetailsPanel>
          <div v-else></div>
        </section>
      </main>
      <footer
        v-if="mapRef"
        class="pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2"
      >
        <MapEditorMainToolbar
          @open-time-modal="openTimeDialog()"
          @inc-day="onIncDay()"
          @dec-day="onDecDay()"
        />
        <MapEditorMeasurementToolbar
          class="absolute bottom-14 sm:bottom-16"
          v-if="toolbarStore.currentToolbar === 'measurements'"
        />
        <MapEditorDrawToolbar
          class="absolute bottom-14 sm:bottom-16"
          v-if="toolbarStore.currentToolbar === 'draw'"
        />
      </footer>
    </div>
    <template v-if="isMobile">
      <MapEditorMobilePanel
        @open-time-modal="openTimeDialog()"
        @inc-day="onIncDay()"
        @dec-day="onDecDay()"
      />
    </template>
    <KeyboardScenarioActions v-if="mapRef" />
    <SearchScenarioActions v-if="mapRef" />
    <GlobalEvents
      v-if="ui.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.t="openTimeDialog"
      @keyup.s="ui.showSearch = true"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onActivated,
  onUnmounted,
  provide,
  ShallowRef,
  shallowRef,
  watch,
} from "vue";
import {
  useActiveUnitStore,
  useSelectedFeatures,
  useSelectedUnits,
} from "@/stores/dragStore";
import { useNotifications } from "@/composables/notifications";
import {
  activeFeatureSelectInteractionKey,
  activeMapKey,
  activeScenarioKey,
  activeUnitKey,
  timeModalKey,
} from "@/components/injects";
import { IconChevronRightBoxOutline as ShowPanelIcon } from "@iconify-prerendered/vue-mdi";
import { injectStrict } from "@/utils";
import UnitPanel from "@/modules/scenarioeditor/UnitPanel.vue";
import MapTimeController from "@/components/MapTimeController.vue";
import { useGeoEditorViewStore } from "@/stores/geoEditorViewStore";
import MapEditorMainToolbar from "@/modules/scenarioeditor/MapEditorMainToolbar.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import MapEditorMeasurementToolbar from "@/modules/scenarioeditor/MapEditorMeasurementToolbar.vue";
import OLMap from "ol/Map";
import NewScenarioMap from "@/components/NewScenarioMap.vue";
import MapEditorDrawToolbar from "@/modules/scenarioeditor/MapEditorDrawToolbar.vue";
import Select from "ol/interaction/Select";
import { breakpointsTailwind, useBreakpoints, useToggle } from "@vueuse/core";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";
import MapEditorMobilePanel from "@/modules/scenarioeditor/MapEditorMobilePanel.vue";
import MapEditorDesktopPanel from "@/modules/scenarioeditor/MapEditorDesktopPanel.vue";
import MapEditorDetailsPanel from "@/modules/scenarioeditor/MapEditorDetailsPanel.vue";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "@/components/helpers";
import { GlobalEvents } from "vue-global-events";
import SearchScenarioActions from "@/modules/scenarioeditor/SearchScenarioActions.vue";
import IconButton from "@/components/IconButton.vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";

const emit = defineEmits(["showExport", "showLoad"]);
const activeScenario = injectStrict(activeScenarioKey);
const activeUnitId = injectStrict(activeUnitKey);
const { getModalTimestamp } = injectStrict(timeModalKey);

const { state, update } = activeScenario.store;

const {
  unitActions,
  io,
  time: { setCurrentTime, add, subtract, jumpToNextEvent, jumpToPrevEvent },
} = activeScenario;
const toolbarStore = useMainToolbarStore();
const layout = useGeoEditorViewStore();
const activeUnitStore = useActiveUnitStore();
const ui = useUiStore();

const mapRef = shallowRef<OLMap>();
const featureSelectInteractionRef = shallowRef<Select>();
provide(activeMapKey, mapRef as ShallowRef<OLMap>);
provide(
  activeFeatureSelectInteractionKey,
  featureSelectInteractionRef as ShallowRef<Select>
);

const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smallerOrEqual("md");
function onMapReady({
  olMap,
  featureSelectInteraction,
}: {
  olMap: OLMap;
  featureSelectInteraction: Select;
}) {
  mapRef.value = olMap;
  featureSelectInteractionRef.value = featureSelectInteraction;
}
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();

const [showLeftPanel, toggleLeftPanel] = useToggle(true);

const showDetailsPanel = computed(() => {
  return Boolean(selectedFeatureIds.value.size || selectedUnitIds.value.size);
});

watch(
  activeUnitId,
  (unitId) => {
    layout.showDetailsPanel = Boolean(activeUnitId.value);
  },
  { immediate: true }
);

const { send } = useNotifications();

onUnmounted(() => {
  activeUnitStore.clearActiveUnit();
});

onActivated(() => {
  mapRef.value?.updateSize();
});

function onCloseDetailsPanel() {
  selectedUnitIds.value.clear();
  selectedFeatureIds.value.clear();
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
</script>
