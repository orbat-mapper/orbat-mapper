<script setup lang="ts">
import MaplibreMap from "@/modules/globeview/MaplibreMap.vue";
import { useScenario } from "@/scenariostore";
import type { Map as MlMap } from "maplibre-gl";
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  watch,
} from "vue";
import type { ShallowRef } from "vue";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import { MapLibreMapAdapter } from "@/geo/mapLibreMapAdapter";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";
import { useGeoStore } from "@/stores/geoStore";
import {
  activeFeatureSelectInteractionKey,
  activeParentKey,
  activeScenarioMapEngineKey,
  searchActionsKey,
  sidcModalKey,
} from "@/components/injects";
import GlobeOrbatPanel from "@/modules/globeview/GlobeOrbatPanel.vue";
import MlMapLogic from "@/modules/globeview/MlMapLogic.vue";
import GlobeDetailsPanel from "@/modules/globeview/GlobeDetailsPanel.vue";
import type { EntityId } from "@/types/base";
import { useIndexedDb } from "@/scenariostore/localdb.ts";
import { Button } from "@/components/ui/button";
import { GLOBE_ROUTE } from "@/router/names.ts";
import { ArrowLeftIcon, ListTreeIcon, MoonStarIcon, SunIcon } from "lucide-vue-next";
import { UseDark } from "@vueuse/components";
import { createEventHook, useTitle } from "@vueuse/core";
import ToggleField from "@/components/ToggleField.vue";
import FpsDisplay from "@/components/FpsDisplay.vue";
import GlobeContextMenu from "@/modules/globeview/GlobeContextMenu.vue";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import {
  GLOBE_VECTOR_BASEMAP_ID,
  resolveGlobeBasemap,
} from "@/modules/globeview/globeBasemaps";
import { useSelectedItems } from "@/stores/selectedStore";
import { useUiStore } from "@/stores/uiStore";
import { useSidcModal } from "@/composables/modals";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { EventSearchResult } from "@/components/types";
import type { PhotonSearchResult } from "@/composables/geosearching";
import type { ScenarioActions } from "@/types/constants";
import type Select from "ol/interaction/Select";

const LoadScenarioDialog = defineAsyncComponent(
  () => import("../scenarioeditor/LoadScenarioDialog.vue"),
);

const SymbolPickerModal = defineAsyncComponent(
  () => import("@/components/SymbolPickerModal.vue"),
);

const props = defineProps<{ scenarioId: string }>();
const { scenario, isReady } = useScenario();
const originalTitle = useTitle().value;
useTitle("Globe View");
const showDebug = ref(false);
const showLoadScenarioDialog = ref(false);
const localReady = ref(false);
const mlMap = shallowRef<MlMap>();
const geoStore = useGeoStore();
const scenarioMapEngineRef = shallowRef<ScenarioMapEngine>();
const activeParentId = ref<EntityId | undefined | null>(null);
const showOrbatPanel = ref(true);
provide(
  activeScenarioMapEngineKey,
  scenarioMapEngineRef as ShallowRef<ScenarioMapEngine | undefined>,
);
provide(activeParentKey, activeParentId);
// Stub for activeFeatureSelectInteractionKey — not used in globe view
const featureSelectStub = shallowRef(null) as unknown as ShallowRef<Select>;
provide(activeFeatureSelectInteractionKey, featureSelectStub);

// Search actions hooks (communication bus for details panel navigation)
const ui = useUiStore();
const {
  selectedUnitIds,
  selectedFeatureIds,
  activeUnitId,
  activeScenarioEventId,
  activeMapLayerId,
  showScenarioInfo,
  orbatRevealUnitId,
  clear: clearSelected,
} = useSelectedItems();

const onUnitSelectHook = createEventHook<{
  unitId: EntityId;
  options?: { noZoom?: boolean };
}>();
const onLayerSelectHook = createEventHook<{ layerId: FeatureId }>();
const onImageLayerSelectHook = createEventHook<{ layerId: FeatureId }>();
const onFeatureSelectHook = createEventHook<{
  featureId: FeatureId;
  layerId: FeatureId;
}>();
const onEventSelectHook = createEventHook<EventSearchResult>();
const onPlaceSelectHook = createEventHook<PhotonSearchResult>();
const onScenarioActionHook = createEventHook<{ action: ScenarioActions }>();
provide(searchActionsKey, {
  onUnitSelectHook,
  onLayerSelectHook,
  onFeatureSelectHook,
  onEventSelectHook,
  onPlaceSelectHook,
  onImageLayerSelectHook,
  onScenarioActionHook,
});

onUnitSelectHook.on(({ unitId, options }) => {
  showOrbatPanel.value = true;
  activeUnitId.value = unitId;
  selectedUnitIds.value.clear();
  selectedUnitIds.value.add(unitId);
  const { side, sideGroup, parents } =
    scenario.value.unitActions.getUnitHierarchy(unitId);
  if (side) side._isOpen = true;
  if (sideGroup) sideGroup._isOpen = true;
  parents.forEach((p) => (p._isOpen = true));
  orbatRevealUnitId.value = unitId;

  if (!(options?.noZoom === true)) {
    geoStore.zoomToUnit(
      scenario.value.unitActions.getUnitById(unitId),
    );
  }
});

// SIDC modal for symbol editing in details panel
const {
  showSidcModal,
  confirmSidcModal,
  cancelSidcModal,
  initialSidcModalValue,
  sidcModalTitle,
  hideModifiers,
  hideSymbolColor,
  hideCustomSymbols,
  symbolOptions,
  inheritedSymbolOptions,
  initialTab: sidcModalInitialTab,
  initialReinforcedReduced,
  getModalSidc,
} = useSidcModal();
provide(sidcModalKey, { getModalSidc });

// Details panel state
const detailsPanelClosed = ref(false);
const hasSelection = computed(() =>
  Boolean(
    selectedFeatureIds.value.size ||
    selectedUnitIds.value.size ||
    activeScenarioEventId.value ||
    activeMapLayerId.value ||
    showScenarioInfo.value,
  ),
);

watch(hasSelection, (val) => {
  if (val) detailsPanelClosed.value = false;
});

const showDetailsPanel = computed(() => {
  if (detailsPanelClosed.value) return false;
  return hasSelection.value || ui.detailsPanelPinned;
});

function onCloseDetailsPanel() {
  detailsPanelClosed.value = true;
  clearSelected();
}

// Resize map when sidebar details panel toggles
watch(
  () => showDetailsPanel.value && ui.detailsPanelMode === "sidebar",
  () => nextTick(() => mlMap.value?.resize()),
);

const baseLayersStore = useBaseLayersStore();
const globeBaseMapId = ref(GLOBE_VECTOR_BASEMAP_ID);

const activeGlobeBasemap = computed(() =>
  resolveGlobeBasemap(globeBaseMapId.value, baseLayersStore.layers),
);

function onMapReady(mapInstance: MlMap) {
  mlMap.value = mapInstance;
  const adapter = new MapLibreMapAdapter(mapInstance);
  const layers = createMapLibreScenarioLayerController(adapter);
  scenarioMapEngineRef.value = {
    map: adapter,
    layers,
  };
  layers.bindScenario(scenario.value);
  geoStore.setMapAdapter(adapter);
}

onMounted(() => {
  void baseLayersStore.initialize();
});

watch(
  () => props.scenarioId,
  async (newScenarioId) => {
    localReady.value = false;
    showLoadScenarioDialog.value = false;
    if (isDemoScenario(newScenarioId)) {
      const demoId = newScenarioId.replace("demo-", "");
      await scenario.value.io.loadDemoScenario(demoId);
      localReady.value = true;
    } else {
      const { loadScenario } = await useIndexedDb();
      const idbscenario = await loadScenario(newScenarioId);
      if (idbscenario) {
        scenario.value.io.loadFromObject(idbscenario);
      } else {
        console.error("Scenario not found in indexeddb");
      }
      localReady.value = true;
    }
  },
  { immediate: true },
);

function isDemoScenario(scenarioId: string) {
  return scenarioId.startsWith("demo-");
}

watch(isReady, (newVal) => {
  if (newVal) {
    console.log("Scenario is ready");
  } else {
    console.log("Scenario is not ready yet");
  }
});

onUnmounted(() => {
  geoStore.setMapAdapter(null);
  useTitle(originalTitle);
});
</script>
<template>
  <div class="bg-background flex h-full w-full flex-col">
    <header class="bg-muted flex items-center justify-between border-b px-4 py-2">
      <div class="flex items-center gap-4">
        <router-link to="/" class="text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon class="size-5" />
        </router-link>
        <h1 class="text-lg font-semibold">Globe View</h1>
        <span
          class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
          >Experimental</span
        >
        <Button @click="showLoadScenarioDialog = true" variant="outline"
          >Load Scenario</Button
        >
        <Button
          variant="outline"
          size="icon"
          @click="showOrbatPanel = !showOrbatPanel"
          title="Toggle ORBAT panel"
        >
          <ListTreeIcon class="size-4" />
        </Button>
      </div>
      <div class="flex items-center gap-4">
        <FpsDisplay v-if="showDebug" />
        <div id="globetoolbar"></div>
        <ToggleField v-model="showDebug">Debug</ToggleField>

        <UseDark v-slot="{ isDark, toggleDark }">
          <Button
            variant="ghost"
            size="icon"
            @click="toggleDark()"
            title="Toggle dark mode"
          >
            <SunIcon v-if="isDark" /><MoonStarIcon v-else />
          </Button>
        </UseDark>
      </div>
    </header>
    <div class="relative flex flex-auto overflow-hidden">
      <GlobeOrbatPanel
        v-if="isReady && localReady"
        v-show="showOrbatPanel"
        :active-scenario="scenario"
        @close="showOrbatPanel = false"
      />
      <div class="relative flex-auto">
        <GlobeContextMenu v-model:base-map-id="globeBaseMapId">
          <MaplibreMap
            @ready="onMapReady"
            :basemap-id="activeGlobeBasemap.id"
            :style-spec="activeGlobeBasemap.style"
            class="bg-radial from-gray-800 to-gray-950"
          />
        </GlobeContextMenu>
        <MlMapLogic
          v-if="isReady && mlMap && localReady"
          :mlMap
          :activeScenario="scenario"
          :key="scenarioId"
        />
        <GlobeDetailsPanel
          v-if="
            isReady && localReady && showDetailsPanel && ui.detailsPanelMode === 'overlay'
          "
          :active-scenario="scenario"
          :mode="ui.detailsPanelMode"
          @close="onCloseDetailsPanel()"
        />
      </div>
      <GlobeDetailsPanel
        v-if="
          isReady && localReady && showDetailsPanel && ui.detailsPanelMode === 'sidebar'
        "
        :active-scenario="scenario"
        :mode="ui.detailsPanelMode"
        @close="onCloseDetailsPanel()"
      />
    </div>
    <LoadScenarioDialog
      v-if="showLoadScenarioDialog"
      v-model="showLoadScenarioDialog"
      :routeName="GLOBE_ROUTE"
    />
    <SymbolPickerModal
      v-if="showSidcModal"
      :initialSidc="initialSidcModalValue"
      @update:sidc="confirmSidcModal($event)"
      @cancel="cancelSidcModal"
      :dialogTitle="sidcModalTitle"
      :hideModifiers
      :hideSymbolColor
      :hideCustomSymbols
      :inheritedSymbolOptions
      :symbolOptions
      :initialTab="sidcModalInitialTab"
      :reinforcedStatus="initialReinforcedReduced"
    />
  </div>
</template>
