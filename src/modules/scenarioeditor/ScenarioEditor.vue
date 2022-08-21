<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-300">
    <!-- navbar -->
    <nav
      class="flex flex-shrink-0 items-center justify-between bg-gray-800 py-2 pr-4 pl-6 text-gray-200"
    >
      <div class="flex min-w-0 flex-auto items-center">
        <router-link to="/" class="flex-shrink-0">
          <svg
            class="block h-7 w-auto fill-gray-700 stroke-gray-300"
            stroke="currentColor"
            viewBox="41 41 118 118"
          >
            <path d="m100 45 55 25v60l-55 25-55-25V70z" stroke-width="6" />
            <path d="m45 70 110 60m-110 0 110-60" stroke-width="6" />
            <circle cx="100" cy="70" r="10" class="fill-gray-300" />
          </svg>
        </router-link>
        <div class="ml-3 flex min-w-0 flex-auto items-center divide-gray-400 sm:divide-x">
          <span
            class="hidden pr-3 text-sm font-medium tracking-tight text-gray-300 sm:block"
            >ORBAT-Mapper</span
          >
          <span class="truncate pl-3 text-gray-400">
            {{ activeScenario.store.state.info.name }}
          </span>
        </div>
      </div>
      <div class="flex shrink-0 items-center space-x-2">
        <button
          @click="showSearch = true"
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <SearchIcon class="block h-6 w-6" />
        </button>
        <div class="flex items-center">
          <button
            @click="undo()"
            class="inline-flex hidden items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white disabled:opacity-50 sm:block"
            title="Undo action (ctrl+z)"
            :disabled="!canUndo"
          >
            <UndoIcon class="block h-6 w-6" />
          </button>
          <button
            @click="redo()"
            class="inline-flex hidden items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white disabled:opacity-50 sm:block"
            title="Redo action"
            :disabled="!canRedo"
          >
            <RedoIcon class="block h-6 w-6" />
          </button>
        </div>
        <button
          @click="showKeyboardShortcuts"
          class="inline-flex hidden items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white sm:block"
          title="Show keyboard shortcuts"
        >
          <KeyboardIcon class="block h-6 w-6" />
        </button>

        <button
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          @click="isOpen = !isOpen"
        >
          <MenuIcon class="block h-6 w-6" />
        </button>
      </div>
    </nav>
    <div class="flex min-h-0 flex-auto">
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

      <GlobalEvents
        v-if="shortcutsEnabled"
        :filter="inputEventFilter"
        @keyup.?="showKeyboardShortcuts"
        @keyup.s="showSearch = true"
        @keydown.ctrl.k.prevent="showSearch = true"
        @keyup.prevent.alt.k="showSearch = true"
      />
      <GlobalEvents
        :filter="inputEventFilter"
        @keyup.ctrl.z.exact="undo()"
        @keyup.ctrl.shift.z="redo()"
        @keyup.ctrl.y="redo()"
      />
      <ShortcutsModal v-model="shortcutsModalVisible" />
      <MainViewSlideOver v-model="isOpen" />
      <SearchModal
        v-model="showSearch"
        @select-unit="onUnitSelect"
        @select-layer="onLayerSelect"
        @select-feature="onFeatureSelect"
      />
      <AppNotifications />
      <LoadScenarioDialog
        v-if="showLoadModal"
        v-model="showLoadModal"
        @loaded="loadScenario"
      />
      <ExportScenarioModal v-if="showExportModal" v-model="showExportModal" />
      <InputDateModal
        v-if="showDateModal"
        v-model="showDateModal"
        :dialog-title="dateModalTitle"
        :timestamp="initialDateModalValue"
        @update:timestamp="confirmDateModal($event)"
        :time-zone="dateModalTimeZone"
        @cancel="cancelDateModal"
      />
      <SymbolPickerModal
        v-if="showSidcModal"
        :sidc="initialSidcModalValue"
        @update:sidc="confirmSidcModal($event)"
        @cancel="cancelSidcModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onUnmounted,
  provide,
  ref,
  watch,
} from "vue";
import { GlobalEvents } from "vue-global-events";
import OrbatPanel from "@/modules/scenarioeditor/OrbatPanel.vue";
import UnitPanel from "./UnitPanel.vue";
import { SelectedScenarioFeatures, useActiveUnitStore } from "@/stores/dragStore";
import TabView from "@/components/TabView.vue";
import TabItem from "@/components/TabItem.vue";
import ShortcutsModal from "@/components/ShortcutsModal.vue";
import TimeController from "@/components/TimeController.vue";

import { MenuIcon, SearchIcon } from "@heroicons/vue/outline";
import { inputEventFilter } from "@/components/helpers";
import SearchModal from "@/components/SearchModal.vue";
import { useRoute, useRouter } from "vue-router";
import { useTabStore, useUiStore } from "@/stores/uiStore";
import {
  Keyboard as KeyboardIcon,
  RedoVariant as RedoIcon,
  UndoVariant as UndoIcon,
} from "mdue";
import { useClipboard, useTitle, useToggle, watchOnce } from "@vueuse/core";
import MainViewSlideOver from "@/components/MainViewSlideOver.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { ScenarioActions, TAB_LAYERS, TAB_ORBAT } from "@/types/constants";
import AppNotifications from "@/components/AppNotifications.vue";
import { useNotifications } from "@/composables/notifications";
import { useGeoStore } from "@/stores/geoStore";
import CloseButton from "@/components/CloseButton.vue";
import { FeatureId } from "@/types/scenarioGeoModels";
import NProgress from "nprogress";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import {
  activeFeaturesKey,
  activeScenarioKey,
  activeUnitKey,
  currentScenarioTabKey,
  selectedFeatureIdsKey,
  selectedUnitIdsKey,
  sidcModalKey,
  timeModalKey,
} from "@/components/injects";
import ScenarioInfoPanel from "./ScenarioInfoPanel.vue";
import type { Scenario } from "@/types/scenarioModels";
import ScenarioMap from "@/components/ScenarioMap.vue";
import { useFeatureStyles } from "@/geo/featureStyles";
import { MenuItemData } from "@/components/types";
import { useDateModal, useSidcModal } from "@/composables/modals";
import ScenarioEventsPanel from "@/modules/scenarioeditor/ScenarioEventsPanel.vue";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import { storeToRefs } from "pinia";

const LoadScenarioDialog = defineAsyncComponent(() => import("./LoadScenarioDialog.vue"));
const ScenarioLayersTab = defineAsyncComponent(() => import("./ScenarioLayersTab.vue"));
const SymbolPickerModal = defineAsyncComponent(
  () => import("@/components/SymbolPickerModal.vue")
);
const InputDateModal = defineAsyncComponent(
  () => import("@/components/InputDateModal.vue")
);
const ExportScenarioModal = defineAsyncComponent(
  () => import("@/components/ExportScenarioModal.vue")
);

const props = defineProps<{ activeScenario: TScenario }>();
const activeUnitId = ref<EntityId | undefined | null>(null);
const selectedUnitIdsRef = ref<Set<EntityId>>(new Set());
const selectedFeatureIdsRef = ref<SelectedScenarioFeatures>(new Set());
const scnFeatures = useFeatureStyles(props.activeScenario.geo);

const uiTabs = useTabStore();
const { activeScenarioTab } = storeToRefs(uiTabs);

provide(activeUnitKey, activeUnitId);
provide(selectedUnitIdsKey, selectedUnitIdsRef);
provide(selectedFeatureIdsKey, selectedFeatureIdsRef);
provide(activeScenarioKey, props.activeScenario);
provide(activeFeaturesKey, scnFeatures);
provide(currentScenarioTabKey, activeScenarioTab);

const { state, update, undo, redo, canRedo, canUndo } = props.activeScenario.store;

const { loadFromObject } = props.activeScenario.io;
const { unitActions, io } = props.activeScenario;
const route = useRoute();
const router = useRouter();
const { copy: copyToClipboard, copied } = useClipboard();
const currentTab = ref(0);
const isOpen = ref(false);
const showSearch = ref(false);
const showLoadModal = ref(false);
const shortcutsModalVisible = ref(false);
const showExportModal = ref(false);

const activeUnitStore = useActiveUnitStore({
  activeScenario: props.activeScenario,
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

const {
  showDateModal,
  confirmDateModal,
  cancelDateModal,
  initialDateModalValue,
  dateModalTimeZone,
  dateModalTitle,
  getModalTimestamp,
} = useDateModal();

provide(timeModalKey, { getModalTimestamp });

const {
  getModalSidc,
  confirmSidcModal,
  showSidcModal,
  cancelSidcModal,
  initialSidcModalValue,
} = useSidcModal();
provide(sidcModalKey, { getModalSidc });

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

const shortcutsEnabled = computed(() => !uiStore.modalOpen);

const onUnitSelect = (unitId: EntityId) => {
  activeScenarioTab.value = TAB_ORBAT;
  activeUnitId.value = unitId;
  const { parents } = unitActions.getUnitHierarchy(unitId);
  parents.forEach((p) => (p._isOpen = true));
  nextTick(() => {
    const el = document.getElementById(`o-${unitId}`);
    if (el) {
      el.scrollIntoView();
    }
  });
};

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
    showLoadModal.value = true;
  } else if (action === "exportToClipboard") {
    await copyToClipboard(io.stringifyScenario());
    if (copied.value) send({ message: "Scenario copied to clipboard" });
  } else if (action === "export") {
    showExportModal.value = true;
  } else {
    send({ message: "Not implemented yet" });
  }
}

function showKeyboardShortcuts() {
  shortcutsModalVisible.value = true;
}

watchOnce(
  () => activeScenarioTab.value === TAB_LAYERS,
  () => {
    NProgress.start();
  }
);

function loadScenario(v: Scenario) {
  loadFromObject(v);
}
</script>
