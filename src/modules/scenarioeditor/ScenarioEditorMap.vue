<template>
  <div class="relative flex min-h-0 flex-auto flex-col">
    <div class="relative flex flex-auto">
      <NewScenarioMap class="flex-auto" @mapReady="onMapReady" />
      <main
        v-if="mapRef"
        class="pointer-events-none absolute inset-0 flex flex-col justify-between"
      >
        <header class="flex flex-none justify-end p-2">
          <MapTimeController class="pointer-events-auto" />
        </header>
        <section v-if="!isMobile" class="flex flex-auto justify-between p-2">
          <aside
            class="pointer-events-auto mt-4 hidden max-h-[70vh] w-96 overflow-auto rounded-md bg-white p-2 md:block"
          >
            <OrbatPanel />
          </aside>
          <aside
            v-if="showDetailsPanel"
            class="pointer-events-auto mt-4 h-96 max-h-full w-96 overflow-auto rounded-md bg-white p-2"
          >
            <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId"></UnitPanel>
            <ScenarioFeatureDetails
              :selected-ids="selectedFeatureIds"
              v-else
              class="p-2"
            />
          </aside>
          <div v-else></div>
        </section>
        <footer class="flex justify-center sm:p-2">
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
      </main>
    </div>
    <template v-if="isMobile">
      <main class="overflow-auto bg-white" :class="[showBottomPanel ? 'h-1/2' : 'h-12']">
        <div
          v-show="!showBottomPanel"
          class="flex h-full items-center justify-center"
          ref="swipeUpEl"
          @click="toggleBottomPanel()"
        >
          <IconButton class="inset-0" @click.stop>
            <IconChevronDoubleUp class="h-6 w-6" @click="toggleBottomPanel()" />
          </IconButton>
        </div>
        <TabGroup
          as="div"
          class="flex h-full flex-col"
          :class="{ hidden: !showBottomPanel }"
          :selected-index="activeTabIndex"
          @change="changeTab"
        >
          <TabList class="flex-0 flex justify-between border-b border-gray-500">
            <div class="flex flex-auto items-center justify-evenly">
              <Tab
                as="template"
                v-for="tab in ['ORBAT', 'Details', 'Events', 'Layers']"
                :key="tab"
                v-slot="{ selected }"
              >
                <button
                  :class="[
                    selected
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium',
                  ]"
                >
                  {{ tab }}
                </button>
              </Tab>
            </div>
            <CloseButton @click="toggleBottomPanel()" class="px-4" />
          </TabList>
          <TabPanels class="flex-auto overflow-y-auto">
            <TabPanel :unmount="false"><OrbatPanel /></TabPanel>
            <TabPanel class="">
              <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId" class="p-4" />
              <ScenarioFeatureDetails
                :selected-ids="selectedFeatureIds"
                v-else-if="selectedFeatureIds.size > 0"
                class="p-4"
              />
              <ScenarioInfoPanel v-else />
              <!--              <p v-else>-->
              <!--                No unit selected. Select a unit on the map or in the ORBAT panel.-->
              <!--              </p>-->
            </TabPanel>
            <TabPanel class="p-4"><ScenarioEventsPanel /></TabPanel>
            <TabPanel class="p-4"><p>Not implemented yet</p></TabPanel>
          </TabPanels>
        </TabGroup>
      </main>
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
import { IconChevronDoubleUp } from "@iconify-prerendered/vue-mdi";
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
import { breakpointsTailwind, useBreakpoints, useSwipe, useToggle } from "@vueuse/core";
import CloseButton from "@/components/CloseButton.vue";
import IconButton from "@/components/IconButton.vue";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import ScenarioInfoPanel from "@/modules/scenarioeditor/ScenarioInfoPanel.vue";
import ScenarioFeatureDetails from "@/modules/scenarioeditor/ScenarioFeatureDetails.vue";

const emit = defineEmits(["showExport", "showLoad"]);
const activeScenario = injectStrict(activeScenarioKey);
const activeUnitId = injectStrict(activeUnitKey);
const { state, update } = activeScenario.store;
const { unitActions, io } = activeScenario;

const toolbarStore = useMainToolbarStore();
const layout = useGeoEditorViewStore();
const activeUnitStore = useActiveUnitStore({
  activeScenario,
  activeUnitId,
});

const mapRef = shallowRef<OLMap>();
const swipeUpEl = ref<HTMLElement | null>(null);

const featureSelectInteractionRef = shallowRef<Select>();
provide(activeMapKey, mapRef);

provide(activeFeatureSelectInteractionKey, featureSelectInteractionRef);
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smallerOrEqual("sm");
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

const showDetailsPanel = computed(() => {
  return Boolean(selectedFeatureIds.value.size || selectedUnitIds.value.size);
});

watch(
  activeUnitId,
  (unitId) => {
    console.log("activeUnitId", unitId);
    layout.showDetailsPanel = Boolean(activeUnitId.value);
  },
  { immediate: true }
);

const { send } = useNotifications();

const [showBottomPanel, toggleBottomPanel] = useToggle(true);

const activeTabIndex = ref(1);
function changeTab(index: number) {
  activeTabIndex.value = index;
}

const { isSwiping, direction } = useSwipe(swipeUpEl);

watch(isSwiping, (swiping) => {
  if (swiping && direction.value === "UP") {
    showBottomPanel.value = true;
  }
});

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
</script>
