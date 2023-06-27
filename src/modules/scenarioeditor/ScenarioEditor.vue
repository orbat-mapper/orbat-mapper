<template>
  <div
    class="flex h-full min-h-full flex-col overflow-hidden bg-gray-300"
    ref="dropZoneRef"
  >
    <nav
      class="flex flex-shrink-0 items-center justify-between bg-gray-900 py-2 pl-6 pr-4 text-gray-200"
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
          <div class="flex items-center">
            <span
              class="pr hidden text-sm font-medium tracking-tight text-gray-300 lg:block"
              >ORBAT-Mapper</span
            >
            <span
              class="ml-1.5 mr-2 inline-flex hidden items-center rounded-full bg-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-900 lg:block"
              >dev</span
            >
          </div>

          <span class="hidden truncate pl-3 text-gray-400 sm:block">
            {{ activeScenario.store.state.info.name }}
          </span>
        </div>
      </div>
      <div class="flex shrink-0 items-center space-x-1 sm:space-x-2">
        <a
          :href="
            route.meta.helpUrl || 'https://docs.orbat-mapper.app/guide/about-orbat-mapper'
          "
          target="_blank"
          class="hidden items-center justify-center rounded-md p-2 font-medium text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white sm:inline-flex"
        >
          Help
        </a>
        <DropdownMenu :items="fileMenuItems" @action="onScenarioAction"
          >File
        </DropdownMenu>
        <button
          @click="showSearch = true"
          class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <SearchIcon class="block h-6 w-6" />
        </button>
        <div class="flex items-center rounded-lg bg-gray-800 px-1">
          <router-link
            :to="{ name: MAP_EDIT_MODE_ROUTE }"
            title="Map edit mode"
            exact-active-class="text-green-500"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <GlobeAltIcon class="h-6 w-6" />
          </router-link>
          <router-link
            :to="{ name: GRID_EDIT_ROUTE }"
            title="Grid edit mode"
            exact-active-class="text-green-500"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <TableIcon class="h-6 w-6" />
          </router-link>
          <router-link
            :to="{ name: CHART_EDIT_MODE_ROUTE }"
            title="Chart edit mode"
            exact-active-class="text-green-500"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <IconSitemap class="h-6 w-6" />
          </router-link>
          <router-link
            :to="{ name: OLD_MAP_ROUTE }"
            title="Legacy map mode"
            exact-active-class="text-green-500"
            class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <IconEarthRemove class="h-6 w-6" />
          </router-link>
        </div>
        <div class="flex items-center">
          <button
            @click="undo()"
            class="inline-flex hidden items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white disabled:opacity-50 sm:block"
            title="Undo action (ctrl+z)"
            :disabled="!canUndo"
          >
            <IconUndo class="block h-6 w-6" />
          </button>
          <button
            @click="redo()"
            class="inline-flex hidden items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white disabled:opacity-50 sm:block"
            title="Redo action"
            :disabled="!canRedo"
          >
            <IconRedo class="block h-6 w-6" />
          </button>
        </div>
        <button
          @click="showKeyboardShortcuts"
          class="inline-flex hidden items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white sm:block"
          title="Show keyboard shortcuts"
        >
          <IconKeyboard class="block h-6 w-6" />
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
      <!--      <keep-alive include="ScenarioEditorGeo">-->
      <component
        :is="Component"
        @show-export="showExportModal = true"
        @show-load="showLoadModal = true"
      />
      <!--      </keep-alive>-->
    </router-view>
    <GlobalEvents
      v-if="shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.?="showKeyboardShortcuts"
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
    <CommandPalette
      v-model="showSearch"
      @select-unit="onUnitSelect"
      @select-feature="onFeatureSelect"
      @select-layer="onLayerSelect"
      @select-image-layer="onImageLayerSelect"
      @select-event="onEventSelect"
      @select-place="onPlaceSelectHook.trigger($event)"
      @select-action="onScenarioAction"
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
      :dialog-title="sidcModalTitle"
      :hide-modifiers="hideModifiers"
      :inherited-symbol-options="inheritedSymbolOptions"
      :symbol-options="symbolOptions"
    />
    <ExportScenarioModal v-if="showExportModal" v-model="showExportModal" />
    <ImportModal v-if="showImportModal" v-model="showImportModal" />
    <div
      v-if="isOverDropZone"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80"
    >
      <p class="rounded border bg-white/40 p-4 text-gray-900">Drop file to import data</p>
    </div>
    <div
      v-if="uiStore.debugMode"
      class="fixed bottom-2 left-2 z-50 rounded bg-gray-50 bg-opacity-70 text-gray-900"
    >
      <p class="p-2 text-xs font-bold">
        <span class="sm:hidden">mo</span>
        <span class="hidden sm:inline md:hidden">sm</span>
        <span class="hidden md:inline lg:hidden">md</span>
        <span class="hidden lg:inline xl:hidden">lg</span>
        <span class="hidden xl:inline 2xl:hidden">xl</span>
        <span class="3xl:hidden hidden 2xl:inline">2xl</span>
        <span class="3xl:inline 4xl:hidden hidden">3xl</span>
        <span class="4xl:inline hidden">4xl+</span>
      </p>

      <p></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onUnmounted, provide, ref } from "vue";
import { GlobalEvents } from "vue-global-events";
import { useDragStore } from "@/stores/dragStore";
import ShortcutsModal from "@/components/ShortcutsModal.vue";

import {
  Bars3Icon as MenuIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon as SearchIcon,
  TableCellsIcon as TableIcon,
} from "@heroicons/vue/24/outline";
import { inputEventFilter } from "@/components/helpers";
import { useRoute, useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import {
  IconEarthRemove,
  IconKeyboard,
  IconRedoVariant as IconRedo,
  IconSitemap,
  IconUndoVariant as IconUndo,
} from "@iconify-prerendered/vue-mdi";
import { createEventHook, useClipboard, useTitle, watchOnce } from "@vueuse/core";
import MainViewSlideOver from "@/components/MainViewSlideOver.vue";
import { ScenarioActions, TAB_LAYERS } from "@/types/constants";
import AppNotifications from "@/components/AppNotifications.vue";
import { useNotifications } from "@/composables/notifications";
import { useGeoStore } from "@/stores/geoStore";
import { FeatureId } from "@/types/scenarioGeoModels";
import NProgress from "nprogress";
import { TScenario } from "@/scenariostore";
import { EntityId } from "@/types/base";
import {
  activeFeaturesKey,
  activeLayerKey,
  activeParentKey,
  activeScenarioKey,
  currentScenarioTabKey,
  searchActionsKey,
  sidcModalKey,
  timeModalKey,
} from "@/components/injects";

import type { Scenario } from "@/types/scenarioModels";
import { useFeatureStyles } from "@/geo/featureStyles";
import { EventSearchResult, MenuItemData } from "@/components/types";
import { useDateModal, useSidcModal } from "@/composables/modals";
import { storeToRefs } from "pinia";
import DropdownMenu from "@/components/DropdownMenu.vue";
import {
  CHART_EDIT_MODE_ROUTE,
  GRID_EDIT_ROUTE,
  LANDING_PAGE_ROUTE,
  MAP_EDIT_MODE_ROUTE,
  OLD_MAP_ROUTE,
} from "@/router/names";
import { useFileDropZone } from "@/composables/filedragdrop";
import { useTabStore } from "@/stores/tabStore";
import CommandPalette from "@/components/CommandPalette.vue";
import { PhotonSearchResult } from "@/composables/geosearching";

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

const ImportModal = defineAsyncComponent(() => import("@/components/ImportModal.vue"));

const props = defineProps<{ activeScenario: TScenario }>();

const dropZoneRef = ref<HTMLDivElement>();
const activeParentId = ref<EntityId | undefined | null>(null);
const activeLayerId = ref<FeatureId | undefined | null>(null);
const activeScenarioEventId = ref<EntityId | undefined | null>(null);
const scnFeatures = useFeatureStyles(props.activeScenario.geo);

const uiTabs = useTabStore();
const { activeScenarioTab } = storeToRefs(uiTabs);

provide(activeParentKey, activeParentId);
provide(activeLayerKey, activeLayerId);
provide(activeScenarioKey, props.activeScenario);
provide(activeFeaturesKey, scnFeatures);
provide(currentScenarioTabKey, activeScenarioTab);

const onUnitSelectHook = createEventHook<{ unitId: EntityId }>();
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

const { state, update, undo, redo, canRedo, canUndo } = props.activeScenario.store;

const { loadFromObject } = props.activeScenario.io;
const { unitActions, io } = props.activeScenario;
const route = useRoute();
const router = useRouter();
const { copy: copyToClipboard, copied } = useClipboard();

const isOpen = ref(false);
const showLoadModal = ref(false);
const shortcutsModalVisible = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);

const uiStore = useUiStore();
const { showSearch } = storeToRefs(uiStore);

const originalTitle = useTitle().value;
const windowTitle = computed(() => state.info.name);
const { send } = useNotifications();
const geoStore = useGeoStore();

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
  sidcModalTitle,
  hideModifiers,
  symbolOptions,
  inheritedSymbolOptions,
} = useSidcModal();
provide(sidcModalKey, { getModalSidc });

onUnmounted(() => {
  useTitle(originalTitle);
});

const shortcutsEnabled = computed(() => !uiStore.modalOpen);

const onUnitSelect = (unitId: EntityId) => {
  onUnitSelectHook.trigger({ unitId });
};

const onLayerSelect = (layerId: FeatureId) => {
  onLayerSelectHook.trigger({ layerId });
};

const onImageLayerSelect = (layerId: FeatureId) => {
  onImageLayerSelectHook.trigger({ layerId });
};

const onEventSelect = (e: EventSearchResult) => {
  onEventSelectHook.trigger(e);
};

const onFeatureSelect = (featureId: FeatureId, layerId: FeatureId) => {
  onFeatureSelectHook.trigger({ featureId, layerId });
};

const fileMenuItems: MenuItemData<ScenarioActions>[] = [
  { label: "Save to local storage", action: "save" },
  { label: "Load from local storage", action: "load" },
  { label: "Load scenario", action: "loadNew" },
  { label: "Download as JSON", action: "exportJson" },
  { label: "Copy to clipboard", action: "exportToClipboard" },
  { label: "Export scenario", action: "export" },
  { label: "Import", action: "import" },
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
  } else if (action === "import") {
    showImportModal.value = true;
  } else if (action === "addTileJSONLayer") {
  } else {
    send({ message: "Not implemented yet" });
  }
  await onScenarioActionHook.trigger({ action });
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

function onDrop(files: File[] | null) {
  if (!files || !files.length) return;
  const dragState = useDragStore();
  dragState.draggedFiles = files;
  showImportModal.value = true;
}

const { isOverDropZone } = useFileDropZone(dropZoneRef, onDrop);

if (state.layers.length > 0) {
  activeLayerId.value = state.layers[0];
}
</script>
