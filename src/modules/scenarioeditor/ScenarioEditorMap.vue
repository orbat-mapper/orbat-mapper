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
            v-if="layout.showDetailsPanel"
            class="pointer-events-auto mt-4 h-96 max-h-full w-96 overflow-auto rounded-md bg-white p-2"
          >
            <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId"></UnitPanel>
          </aside>
          <div v-else></div>
        </section>
        <footer class="flex justify-center sm:p-2">
          <MapEditorMainToolbar />
          <MapEditorMeasurementToolbar
            class="absolute bottom-14 sm:bottom-16"
            v-if="store.currentToolbar === 'measurements'"
          />
          <MapEditorDrawToolbar
            class="absolute bottom-14 sm:bottom-16"
            v-if="store.currentToolbar === 'draw'"
          />
        </footer>
      </main>
    </div>
    <template v-if="isMobile">
      <main class="overflow-auto bg-white" :class="[showBottomPanel ? 'h-1/2' : 'h-12']">
        <div v-if="!showBottomPanel" class="flex h-full items-center justify-center">
          <IconButton>
            <IconChevronDoubleUp class="h-6 w-6" @click="toggleBottomPanel()" />
          </IconButton>
        </div>
        <TabView extra-class="px-4" :class="{ hidden: !showBottomPanel }">
          <template #extra>
            <CloseButton @click="toggleBottomPanel()" class="mt-4" />
          </template>
          <TabItem label="ORBAT">
            <OrbatPanel />
          </TabItem>
          <TabItem label="Details" class="px-4">
            <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId"></UnitPanel>
          </TabItem>
        </TabView>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onUnmounted, provide, shallowRef, watch } from "vue";
import { IconChevronDoubleUp } from "@iconify-prerendered/vue-mdi";
import {
  useActiveUnitStore,
  useSelectedFeatures,
  useSelectedUnits,
} from "@/stores/dragStore";
import { useNotifications } from "@/composables/notifications";
import { useGeoStore } from "@/stores/geoStore";
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
import { breakpointsTailwind, useBreakpoints, useToggle } from "@vueuse/core";
import TabView from "@/components/TabView.vue";
import TabItem from "@/components/TabItem.vue";
import CloseButton from "@/components/CloseButton.vue";
import IconButton from "@/components/IconButton.vue";

const emit = defineEmits(["showExport", "showLoad"]);
const activeScenario = injectStrict(activeScenarioKey);
const activeUnitId = injectStrict(activeUnitKey);
const { state, update } = activeScenario.store;
const { unitActions, io } = activeScenario;

const layout = useGeoEditorViewStore();
const mapRef = shallowRef<OLMap>();
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

watch(
  activeUnitId,
  (unitId) => {
    layout.showDetailsPanel = Boolean(activeUnitId.value);
  },
  { immediate: true }
);

const { onUnitSelect, onFeatureSelect, onLayerSelect } = useSearchActions();
const { selectedFeatureIds } = useSelectedFeatures();
const { selectedUnitIds } = useSelectedUnits();

const activeUnitStore = useActiveUnitStore({
  activeScenario,
  activeUnitId,
});

const { send } = useNotifications();
const geoStore = useGeoStore();

const [showBottomPanel, toggleBottomPanel] = useToggle(true);

onUnmounted(() => {
  activeUnitStore.clearActiveUnit();
});

onActivated(() => {
  geoStore.updateMapSize();
});

onUnitSelect(({ unitId }) => {
  console.warn("Not implemented");
});

onLayerSelect(({ layerId }) => {
  console.warn("Not implemented");
});

onFeatureSelect(({ featureId }) => {
  console.warn("Not implemented");
});

const store = useMainToolbarStore();
</script>
