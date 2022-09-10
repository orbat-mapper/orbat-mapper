<template>
  <div class="flex h-screen flex-col overflow-hidden bg-gray-300">
    <nav
      class="flex flex-shrink-0 items-center justify-between bg-gray-900 py-2 pr-4 pl-6 text-gray-200"
    >
      <div class="flex min-w-0 flex-auto items-center">
        <router-link :to="{ name: LANDING_PAGE_ROUTE }" class="flex-shrink-0">
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
        <div class="ml-3 flex min-w-0 flex-auto items-center divide-gray-400 lg:divide-x">
          <span
            class="hidden pr-3 text-sm font-medium tracking-tight text-gray-300 lg:block"
            >ORBAT-Mapper</span
          >
          <span class="truncate pl-3 text-gray-400">
            {{ activeScenario.store.state.info.name }}
          </span>
        </div>
      </div>
      <div class="flex shrink-0 items-center space-x-2">
        <DropdownMenu :items="fileMenuItems" @action="onScenarioAction"
          >File</DropdownMenu
        >
        <button
          @click="showSearch = true"
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <SearchIcon class="block h-6 w-6" />
        </button>
        <div class="flex items-center rounded-lg bg-gray-800 px-1">
          <router-link
            :to="{ name: SCENARIO_ROUTE }"
            title="Map edit mode"
            exact-active-class="text-green-500"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            ><GlobeAltIcon class="h-6 w-6"
          /></router-link>
          <router-link
            :to="{ name: GRID_EDIT_ROUTE }"
            title="Grid edit mode"
            exact-active-class="text-green-500"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            ><TableIcon class="h-6 w-6"
          /></router-link>
        </div>
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
    <router-view v-slot="{ Component }">
      <keep-alive include="ScenarioEditorGeo">
        <component
          :is="Component"
          @show-export="showExportModal = true"
          @show-load="showLoadModal = true"
        />
      </keep-alive>
    </router-view>

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
    <ExportScenarioModal v-if="showExportModal" v-model="showExportModal" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onUnmounted, provide, ref } from "vue";
import { GlobalEvents } from "vue-global-events";
import { SelectedScenarioFeatures } from "@/stores/dragStore";
import ShortcutsModal from "@/components/ShortcutsModal.vue";

import {
  Bars3Icon as MenuIcon,
  MagnifyingGlassIcon as SearchIcon,
} from "@heroicons/vue/24/outline";
import { GlobeAltIcon, TableCellsIcon as TableIcon } from "@heroicons/vue/24/outline";
import { inputEventFilter } from "@/components/helpers";
import SearchModal from "@/components/SearchModal.vue";
import { useRoute, useRouter } from "vue-router";
import { useTabStore, useUiStore } from "@/stores/uiStore";
import {
  Keyboard as KeyboardIcon,
  RedoVariant as RedoIcon,
  UndoVariant as UndoIcon,
} from "mdue";
import { useClipboard, useTitle, watchOnce } from "@vueuse/core";
import MainViewSlideOver from "@/components/MainViewSlideOver.vue";
import { ScenarioActions, TAB_LAYERS, TAB_ORBAT } from "@/types/constants";
import AppNotifications from "@/components/AppNotifications.vue";
import { useNotifications } from "@/composables/notifications";
import { useGeoStore } from "@/stores/geoStore";
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
import type { Scenario } from "@/types/scenarioModels";
import { useFeatureStyles } from "@/geo/featureStyles";
import { MenuItemData } from "@/components/types";
import { useDateModal, useSidcModal } from "@/composables/modals";
import KeyboardScenarioActions from "@/modules/scenarioeditor/KeyboardScenarioActions.vue";
import { storeToRefs } from "pinia";
import DropdownMenu from "@/components/DropdownMenu.vue";
import { GRID_EDIT_ROUTE, LANDING_PAGE_ROUTE, SCENARIO_ROUTE } from "@/router/names";

const LoadScenarioDialog = defineAsyncComponent(() => import("./LoadScenarioDialog.vue"));
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

const isOpen = ref(false);
const showSearch = ref(false);
const showLoadModal = ref(false);
const shortcutsModalVisible = ref(false);
const showExportModal = ref(false);

const uiStore = useUiStore();

const originalTitle = useTitle().value;
const windowTitle = computed(() => state.info.name);
const { send } = useNotifications();
const geoStore = useGeoStore();

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

const fileMenuItems: MenuItemData<ScenarioActions>[] = [
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
