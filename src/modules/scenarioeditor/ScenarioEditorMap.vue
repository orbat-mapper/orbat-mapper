<template>
  <div class="relative flex min-h-0 flex-auto flex-col">
    <div class="relative flex flex-auto flex-col">
      <NewScenarioMap class="flex-auto" @mapReady="onMapReady" />
      <main
        v-if="mapRef"
        class="pointer-events-none absolute inset-0 flex flex-col justify-between"
      >
        <header class="flex flex-none justify-end p-2">
          <MapTimeController
            class="pointer-events-auto"
            :show-controls="ui.mobilePanelOpen"
          />
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
            <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId" />
            <ScenarioFeatureDetails
              v-else
              :selected-ids="selectedFeatureIds"
              class="p-2"
            />
          </MapEditorDetailsPanel>
          <div v-else></div>
        </section>
      </main>
      <footer
        v-if="mapRef"
        class="pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2"
      >
        <MapEditorMainToolbar />
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
      <MapEditorMobilePanel />
    </template>
    <KeyboardScenarioActions v-if="mapRef" />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onActivated,
  onUnmounted,
  provide,
  ref,
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
} from "@/components/injects";
import { IconChevronRightBoxOutline as ShowPanelIcon } from "@iconify-prerendered/vue-mdi";
import { injectStrict } from "@/utils";
import { useSearchActions } from "@/composables/search";
import UnitPanel from "@/modules/scenarioeditor/UnitPanel.vue";
import MapTimeController from "@/components/MapTimeController.vue";
import { useGeoEditorViewStore } from "@/stores/geoEditorViewStore";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
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
import IconButton from "@/components/IconButton.vue";
import { useUiStore } from "@/stores/uiStore";

const emit = defineEmits(["showExport", "showLoad"]);
const activeScenario = injectStrict(activeScenarioKey);
const activeUnitId = injectStrict(activeUnitKey);
const { state, update } = activeScenario.store;
const { unitActions, io } = activeScenario;

const toolbarStore = useMainToolbarStore();
const layout = useGeoEditorViewStore();
const activeUnitStore = useActiveUnitStore();
const ui = useUiStore();
const mapRef = shallowRef<OLMap>();

const featureSelectInteractionRef = shallowRef<Select>();
provide(activeMapKey, mapRef);

provide(activeFeatureSelectInteractionKey, featureSelectInteractionRef);
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

const { onUnitSelect, onFeatureSelect, onLayerSelect } = useSearchActions();
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

const activeTabIndex = ref(0);

function changeTab(index: number) {
  activeTabIndex.value = index;
}

onUnmounted(() => {
  activeUnitStore.clearActiveUnit();
});

onActivated(() => {
  mapRef.value?.updateSize();
});

onUnitSelect(({ unitId }) => {
  activeUnitId.value = unitId;
  selectedUnitIds.value.clear();
  selectedUnitIds.value.add(unitId);
  const { parents } = unitActions.getUnitHierarchy(unitId);
  parents.forEach((p) => (p._isOpen = true));
  nextTick(() => {
    const el = document.getElementById(`o-${unitId}`);
    if (el) {
      el.scrollIntoView();
    }
  });
});

onLayerSelect(({ layerId }) => {
  console.warn("Not implemented");
});

onFeatureSelect(({ featureId }) => {
  console.warn("Not implemented");
});

function onCloseDetailsPanel() {
  selectedUnitIds.value.clear();
  selectedFeatureIds.value.clear();
}
</script>
