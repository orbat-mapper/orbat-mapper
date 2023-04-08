<template>
  <div class="relative flex min-h-0 flex-auto">
    <NewScenarioMap class="flex-1" @mapReady="onMapReady" />
    <main v-if="mapRef" class="pointer-events-none absolute inset-0 flex flex-col">
      <header class="flex flex-none justify-end p-2">
        <MapTimeController class="pointer-events-auto" />
      </header>
      <section class="flex flex-auto justify-between p-2">
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
    <div class="prose prose-sm fixed bottom-10 right-2 hidden lg:block">
      <pre>Features: {{ selectedFeatureIds }}</pre>
      <pre>Units: {{ selectedUnitIds }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onUnmounted, provide, shallowRef, watch } from "vue";
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
