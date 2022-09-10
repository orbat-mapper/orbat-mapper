<template>
  <div class="relative flex min-h-0 flex-auto">
    <aside
      class="z-10 flex w-96 flex-col justify-between border-r-2 bg-gray-100 dark:bg-gray-900"
    >
      <TabView
        v-model:current-tab="activeScenarioTab"
        :key="state.id"
        extra-class="px-6"
        tab-class=""
        class="min-h-0"
      >
        <TabItem label="Units" class="relative">
          <button
            @click="showSearch = true"
            class="absolute -top-1 right-6 text-gray-500 hover:text-gray-900"
          >
            <span class="sr-only">Search units</span>
            <SearchIcon class="h-5 w-5" />
          </button>
          <OrbatPanel class="pb-12" />
        </TabItem>
        <TabItem label="Info">
          <ScenarioInfoPanel />
        </TabItem>
        <TabItem label="Layers" v-slot="{ isActive }">
          <keep-alive>
            <ScenarioLayersTab
              v-if="isActive"
              v-model="showLayerPanel"
              :active-layer-id="activeLayerId"
              :active-feature-id="activeFeatureId"
            />
          </keep-alive>
        </TabItem>
        <template #extra>
          <DotsMenu
            :items="scenarioMenuItems"
            class="relative -mr-2 pt-2"
            @action="onScenarioAction"
          />
        </template>
        <TabItem label="Events">
          <ScenarioEventsPanel></ScenarioEventsPanel>
        </TabItem>
      </TabView>
      <footer
        class="flex flex-shrink-0 items-center border-t border-gray-300 bg-gray-200 dark:bg-gray-700"
      >
        <TimeController class="" />
      </footer>
    </aside>
    <aside
      v-show="showLayerPanel"
      class="flex w-96 flex-shrink-0 flex-col border-r-2 bg-gray-50"
      data-teleport-layer
    ></aside>
    <aside
      class="flex w-96 flex-shrink-0 flex-col border-r-2 bg-gray-50 dark:bg-gray-800"
      v-if="showUnitPanel"
    >
      <TabView
        v-model:current-tab="currentTab"
        extra-class="px-6"
        tab-class="pl-6 pr-6"
        class="min-h-0"
      >
        <TabItem label="Unit details">
          <UnitPanel v-if="activeUnitId" :unit-id="activeUnitId" />
        </TabItem>
        <template #extra>
          <div class="flex pt-4">
            <CloseButton @click="toggleUnitPanel()" />
          </div>
        </template>
      </TabView>
    </aside>
    <ScenarioMap class="flex-1" data-teleport-map />
    <KeyboardScenarioActions v-if="geoStore.olMap" />

    <MainViewSlideOver v-model="isOpen" />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onActivated,
  onUnmounted,
  ref,
  watch,
} from "vue";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import UnitPanel from "./UnitPanel.vue";
import { useActiveUnitStore } from "@/stores/dragStore";
import TabView from "@/components/TabView.vue";
import TabItem from "@/components/TabItem.vue";
import TimeController from "@/components/TimeController.vue";

import { SearchIcon } from "@heroicons/vue/outline";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { useTabStore, useUiStore } from "@/stores/uiStore";
import { useClipboard, useTitle, useToggle, watchOnce } from "@vueuse/core";
import MainViewSlideOver from "@/components/MainViewSlideOver.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { ScenarioActions, TAB_LAYERS, TAB_ORBAT } from "@/types/constants";
import { useNotifications } from "@/composables/notifications";
import { useGeoStore } from "@/stores/geoStore";
import CloseButton from "@/components/CloseButton.vue";
import { FeatureId } from "@/types/scenarioGeoModels";
import NProgress from "nprogress";
import { EntityId } from "@/types/base";
import { activeScenarioKey, activeUnitKey } from "@/components/injects";
import ScenarioInfoPanel from "./ScenarioInfoPanel.vue";
import ScenarioMap from "@/components/ScenarioMap.vue";
import { MenuItemData } from "@/components/types";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import { storeToRefs } from "pinia";
import { EXPORT_SCENARIO_ROUTE } from "@/router/names";
import { injectStrict } from "@/utils";

const ScenarioLayersTab = defineAsyncComponent(() => import("./ScenarioLayersTab.vue"));

const emit = defineEmits(["showExport", "showLoad"]);
const activeUnitId = injectStrict(activeUnitKey);

const uiTabs = useTabStore();
const { activeScenarioTab } = storeToRefs(uiTabs);
const activeScenario = injectStrict(activeScenarioKey);

const { state, update, undo, redo, canRedo, canUndo } = activeScenario.store;

const { loadFromObject } = activeScenario.io;
const { unitActions, io } = activeScenario;
const route = useRoute();
const router = useRouter();
const { copy: copyToClipboard, copied } = useClipboard();
const currentTab = ref(0);
const isOpen = ref(false);
const showSearch = ref(false);

const activeUnitStore = useActiveUnitStore({
  activeScenario,
  activeUnitId,
});
const uiStore = useUiStore();

const originalTitle = useTitle().value;
const windowTitle = computed(() => state.info.name);
const { send } = useNotifications();
const geoStore = useGeoStore();
const [showUnitPanel, toggleUnitPanel] = useToggle();
const showLayerPanel = ref(false);

const activeLayerId = ref<FeatureId | null>(null);
const activeFeatureId = ref<FeatureId | null>(null);

// const isDark = useDark();
// const toggleDark = useToggle(isDark);
useTitle(windowTitle);

onUnmounted(() => {
  useTitle(originalTitle);
  activeUnitStore.clearActiveUnit();
});

watch([showUnitPanel, showLayerPanel], (v) => {
  nextTick(() => geoStore.updateMapSize());
});

watch(activeUnitId, (v) => {
  showUnitPanel.value = !!(v && activeScenarioTab.value === TAB_ORBAT);
});

watch(activeScenarioTab, (value, prevValue) => {
  if (value === 1 && prevValue === 0) {
    activeUnitStore.clearActiveUnit();
    showUnitPanel.value = false;
  }
});

onActivated(() => {
  geoStore.updateMapSize();
});

const onLayerSelect = (layerId: FeatureId) => {
  activeLayerId.value = layerId;
  activeScenarioTab.value = TAB_LAYERS;
};

const onFeatureSelect = (featureId: FeatureId, layerId: FeatureId) => {
  activeFeatureId.value = featureId;
  activeScenarioTab.value = TAB_LAYERS;
};

const scenarioMenuItems: MenuItemData<ScenarioActions>[] = [
  { label: "Add new side", action: "addSide" },
  { label: "Save to local storage", action: "save" },
  { label: "Load from local storage", action: "load" },
  { label: "Load scenario", action: "loadNew" },
  { label: "Download as JSON", action: "exportJson" },
  { label: "Copy to clipboard", action: "exportToClipboard" },
  { label: "Export scenario", action: "export" },
];

async function onScenarioAction(action: ScenarioActions) {
  if (action === "addSide") {
    unitActions.addSide();
  } else if (action === "save") {
    io.saveToLocalStorage();
    send({ message: "Scenario saved to local storage" });
  } else if (action === "load") {
    io.loadFromLocalStorage();
    send({ message: "Scenario loaded from local storage" });
  } else if (action === "exportJson") {
    await io.downloadAsJson();
  } else if (action === "loadNew") {
    emit("showLoad");
  } else if (action === "exportToClipboard") {
    await copyToClipboard(io.stringifyScenario());
    if (copied.value) send({ message: "Scenario copied to clipboard" });
  } else if (action === "export") {
    emit("showExport");
  } else {
    send({ message: "Not implemented yet" });
  }
}

watchOnce(
  () => activeScenarioTab.value === TAB_LAYERS,
  () => {
    NProgress.start();
  }
);
</script>
