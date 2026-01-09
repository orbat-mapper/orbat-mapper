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
  IconKeyboard,
  IconRedoVariant as IconRedo,
  IconSitemap,
  IconUndoVariant as IconUndo,
} from "@iconify-prerendered/vue-mdi";

import { createEventHook, useClipboard, useTitle, watchOnce } from "@vueuse/core";
import MainViewSlideOver from "@/components/MainViewSlideOver.vue";
import { type ScenarioActions, TAB_LAYERS, type UiAction } from "@/types/constants";
import AppNotifications from "@/components/AppNotifications.vue";
import { useNotifications } from "@/composables/notifications";
import type { FeatureId } from "@/types/scenarioGeoModels";
import NProgress from "nprogress";
import type { TScenario } from "@/scenariostore";
import type { EntityId } from "@/types/base";
import {
  activeFeatureStylesKey,
  activeLayerKey,
  activeParentKey,
  activeScenarioKey,
  currentScenarioTabKey,
  searchActionsKey,
  sidcModalKey,
  timeModalKey,
} from "@/components/injects";
import { useFeatureStyles } from "@/geo/featureStyles";
import type { EventSearchResult } from "@/components/types";
import { useDateModal, useSidcModal } from "@/composables/modals";
import { storeToRefs } from "pinia";
import {
  CHART_EDIT_MODE_ROUTE,
  GRID_EDIT_ROUTE,
  MAP_EDIT_MODE_ROUTE,
  NEW_SCENARIO_ROUTE,
} from "@/router/names";
import { useFileDropZone } from "@/composables/filedragdrop";
import { useTabStore } from "@/stores/tabStore";
import CommandPalette from "@/components/commandPalette/CommandPalette.vue";
import type { PhotonSearchResult } from "@/composables/geosearching";
import { useSelectedItems } from "@/stores/selectedStore";
import MainMenu from "@/modules/scenarioeditor/MainMenu.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useTimeFormatterProvider } from "@/stores/timeFormatStore";
import PlaybackMenu from "@/modules/scenarioeditor/PlaybackMenu.vue";
import DebugInfo from "@/components/DebugInfo.vue";
import { MoonStarIcon, SunIcon } from "lucide-vue-next";
import { UseDark } from "@vueuse/components";
import { Button } from "@/components/ui/button";

const props = defineProps<{ activeScenario: TScenario }>();

const LoadScenarioDialog = defineAsyncComponent(() => import("./LoadScenarioDialog.vue"));
const SymbolPickerModal = defineAsyncComponent(
  () => import("@/components/SymbolPickerModal.vue"),
);
const InputDateModal = defineAsyncComponent(
  () => import("@/components/InputDateModal.vue"),
);

const ExportScenarioModal = defineAsyncComponent(
  () => import("@/components/ExportScenarioModal.vue"),
);

const ImportModal = defineAsyncComponent(() => import("@/components/ImportModal.vue"));

const dropZoneRef = ref<HTMLDivElement>();
const activeParentId = ref<EntityId | undefined | null>(null);
const activeLayerId = ref<FeatureId | undefined | null>(null);
const scnFeatureStyles = useFeatureStyles(props.activeScenario.geo);

const uiTabs = useTabStore();
const { activeScenarioTab } = storeToRefs(uiTabs);
const selectedItems = useSelectedItems();
provide(activeParentKey, activeParentId);
provide(activeLayerKey, activeLayerId);
provide(activeScenarioKey, props.activeScenario);
provide(activeFeatureStylesKey, scnFeatureStyles);
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

const { state, undo, redo, canRedo, canUndo } = props.activeScenario.store;

const {
  unitActions,
  io,
  helpers: { getUnitById },
} = props.activeScenario;
const route = useRoute();
const router = useRouter();
const { copy: copyToClipboard, copied } = useClipboard();

const isOpen = ref(false);
const showLoadModal = ref(false);
const shortcutsModalVisible = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);

useTimeFormatterProvider({ activeScenario: props.activeScenario });

const uiStore = useUiStore();
const { showSearch } = storeToRefs(uiStore);

const mapStore = useMapSettingsStore();
mapStore.baseLayerName = state.mapSettings.baseMapId;

const originalTitle = useTitle().value;
const windowTitle = computed(() => state.info.name);
const { send } = useNotifications();

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
  hideSymbolColor,
  hideCustomSymbols,
  symbolOptions,
  inheritedSymbolOptions,
  initialTab: sidcModalInitialTab,
  initialReinforcedReduced,
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

import { useScenarioShare } from "@/composables/scenarioShare";

const { shareScenario } = useScenarioShare();

async function onScenarioAction(action: ScenarioActions) {
  if (action === "addSide") {
    unitActions.addSide();
  } else if (action === "save") {
    const preId = state.id;
    const newId = await io.saveToIndexedDb();
    send({ message: "Scenario saved to IndexedDb" });
    if (preId !== newId) {
      await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId: newId } });
    }
  } else if (action === "load") {
    io.loadFromLocalStorage();
    showInfo();
    send({ message: "Scenario loaded from local storage" });
  } else if (action === "exportJson") {
    await io.downloadAsJson();
  } else if (action === "loadNew") {
    showLoadModal.value = true;
  } else if (action === "exportToClipboard") {
    await copyToClipboard(io.stringifyScenario());
    if (copied.value) send({ message: "Scenario copied to clipboard" });
  } else if (action === "shareAsUrl") {
    const { url, warning } = await shareScenario(props.activeScenario);
    await copyToClipboard(url);
    if (copied.value) {
      if (warning) {
        send({ message: `URL copied. ${warning}`, type: "warning" });
      } else {
        send({ message: "Scenario URL copied to clipboard" });
      }
    }
  } else if (action === "export") {
    showExportModal.value = true;
  } else if (action === "import") {
    showImportModal.value = true;
  } else if (action === "showInfo") {
    showInfo();
  } else if (action === "duplicate") {
    const scenarioId = await io.duplicateScenario();
    await router.push({ name: MAP_EDIT_MODE_ROUTE, params: { scenarioId } });
  } else if (action === "createNew") {
    await router.push({ name: NEW_SCENARIO_ROUTE });
  } else if (action === "browseSymbols") {
    const activeUnitId = selectedItems.activeUnitId.value;
    let initialSidc = "10031000001211000000";
    if (activeUnitId) {
      initialSidc = getUnitById(activeUnitId).sidc;
    }
    await getModalSidc(initialSidc, { title: "Symbol browser", initialTab: 1 });
  }
  await onScenarioActionHook.trigger({ action });
}

function onUiAction(action: UiAction) {
  if (action === "showKeyboardShortcuts") {
    showKeyboardShortcuts();
  }
  if (action === "showSearch") {
    showSearch.value = true;
  }
}

function showKeyboardShortcuts() {
  shortcutsModalVisible.value = true;
}

watchOnce(
  () => activeScenarioTab.value === TAB_LAYERS,
  () => {
    NProgress.start();
  },
);

function onDrop(files: File[] | null) {
  if (!files || !files.length) return;
  const dragState = useDragStore();
  dragState.draggedFiles = files;
  showImportModal.value = true;
}

function showInfo() {
  selectedItems.clear();
  selectedItems.showScenarioInfo.value = true;
}

const { isOverDropZone } = useFileDropZone(dropZoneRef, onDrop);

if (state.layers.length > 0) {
  activeLayerId.value = state.layers[0];
}
</script>

<template>
  <div class="bg-background flex h-dvh flex-col overflow-hidden" ref="dropZoneRef">
    <nav class="flex shrink-0 items-center justify-between py-1 pr-4 pl-6 print:hidden">
      <div class="flex min-w-0 flex-auto items-center">
        <div class="flex min-w-0 flex-auto items-center">
          <MainMenu @action="onScenarioAction" @ui-action="onUiAction" />
          <Button
            variant="ghost"
            type="button"
            class="hidden truncate font-medium sm:inline-flex"
            @click="showInfo()"
          >
            {{ activeScenario.store.state.info.name }}
          </Button>
        </div>
      </div>
      <div class="flex shrink-0 items-center space-x-1 overflow-clip sm:space-x-2">
        <PlaybackMenu v-if="route.name === MAP_EDIT_MODE_ROUTE" />
        <Button variant="ghost" class="hidden sm:inline-flex" asChild
          ><a
            :href="
              route.meta.helpUrl ||
              'https://docs.orbat-mapper.app/guide/about-orbat-mapper'
            "
            target="_blank"
          >
            Help
          </a></Button
        >
        <Button
          variant="ghost"
          size="icon"
          @click="showSearch = true"
          class="text-foreground/70"
        >
          <SearchIcon class="size-6" />
        </Button>
        <div
          class="bg-muted-foreground/20 dark:bg-foreground/15 text-muted-foreground/80 flex items-center rounded-lg px-1"
        >
          <router-link
            :to="{ name: MAP_EDIT_MODE_ROUTE }"
            title="Map edit mode"
            exact-active-class="text-green-500"
            class="hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset"
          >
            <GlobeAltIcon class="size-6" />
          </router-link>
          <router-link
            :to="{ name: GRID_EDIT_ROUTE }"
            title="Grid edit mode"
            exact-active-class="text-green-500"
            class="hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset"
          >
            <TableIcon class="size-6" />
          </router-link>
          <router-link
            :to="{ name: CHART_EDIT_MODE_ROUTE }"
            title="Chart edit mode"
            exact-active-class="text-green-500"
            class="hover:bg-muted hover:text-foreground focus:ring-ring inline-flex items-center justify-center rounded-md p-1.5 focus:ring-2 focus:outline-hidden focus:ring-inset"
          >
            <IconSitemap class="size-6" />
          </router-link>
        </div>
        <div class="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            @click="undo()"
            class="text-foreground/70 hidden sm:inline-flex"
            title="Undo action (ctrl+z)"
            :disabled="!canUndo"
          >
            <IconUndo class="size-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            @click="redo()"
            class="text-foreground/70 hidden sm:inline-flex"
            title="Redo action"
            :disabled="!canRedo"
          >
            <IconRedo class="size-6" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          @click="showKeyboardShortcuts"
          class="text-foreground/70 hidden sm:inline-flex"
          title="Show keyboard shortcuts"
        >
          <IconKeyboard class="size-6" />
        </Button>
        <UseDark v-slot="{ isDark, toggleDark }">
          <Button
            variant="ghost"
            size="icon"
            @click="toggleDark()"
            title="Toggle dark mode"
            class="text-foreground/70 hidden sm:inline-flex"
          >
            <SunIcon v-if="isDark" class="size-5" /><MoonStarIcon v-else class="size-5" />
          </Button>
        </UseDark>

        <Button
          variant="ghost"
          size="icon"
          @click="isOpen = !isOpen"
          class="text-foreground/70"
        >
          <MenuIcon class="size-6" />
        </Button>
      </div>
    </nav>
    <router-view v-slot="{ Component }">
      <!--      <keep-alive include="ScenarioEditorGeo">-->
      <component
        :is="Component"
        @show-export="showExportModal = true"
        @show-load="showLoadModal = true"
        @show-settings="isOpen = true"
      />
      <!--      </keep-alive>-->
    </router-view>
    <GlobalEvents
      v-if="shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.?="showKeyboardShortcuts"
      @keydown.ctrl.k.prevent="showSearch = true"
      @keydown.meta.k.prevent="showSearch = true"
      @keyup.prevent.alt.k="showSearch = true"
    />
    <GlobalEvents
      :filter="inputEventFilter"
      @keydown.meta.z.exact="undo()"
      @keyup.ctrl.z.exact="undo()"
      @keydown.meta.shift.z="redo()"
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
    <LoadScenarioDialog v-if="showLoadModal" v-model="showLoadModal" />
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
    <ExportScenarioModal v-if="showExportModal" v-model="showExportModal" />
    <ImportModal v-if="showImportModal" v-model="showImportModal" />
    <div
      v-if="isOverDropZone"
      class="bg-background/80 fixed inset-0 z-50 flex items-center justify-center"
    >
      <p class="text-foreground bg-background/40 rounded border p-4">
        Drop file to import data
      </p>
    </div>
    <DebugInfo v-if="uiStore.debugMode" />
  </div>
</template>
