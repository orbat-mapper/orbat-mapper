<template>
  <!-- Desktop: Janelas Flutuantes -->
  <template v-if="!isMobile">
    <template v-for="window in windows" :key="window.id">
      <FloatingWindow
        :state="window"
        @update:position="(x, y) => updateWindow(window.id, { x, y })"
        @update:size="(w, h) => updateWindow(window.id, { width: w, height: h })"
        @update:minimized="(v) => updateWindow(window.id, { isMinimized: v })"
        @close="removeWindow(window.id)"
        @bring-to-front="bringToFront(window.id)"
      >
        <div class="p-2 space-y-1 bg-popover">
          <!-- Conteúdo principal da toolbar -->
          <div class="flex items-center space-x-1 flex-wrap gap-1">
            <!-- Selection Tools -->
            <MainToolbarButton title="Select" @click="handleSelectMode()">
              <IconCursorDefaultOutline class="size-5" />
            </MainToolbarButton>
            <MainToolbarButton
              title="Move unit"
              :active="moveUnitEnabled"
              @click="toggleMoveUnit()"
            >
              <IconCursorMove class="size-5" />
            </MainToolbarButton>

            <div class="border-border h-5 border-l" />

            <!-- Toolbar Toggles -->
            <MainToolbarButton
              title="Measurements"
              :active="store.currentToolbar === 'measurements'"
              @click="store.toggleToolbar('measurements')"
            >
              <IconRulerSquareCompass class="size-5" />
            </MainToolbarButton>
            <MainToolbarButton
              title="Draw"
              :active="store.currentToolbar === 'draw'"
              @click="store.toggleToolbar('draw')"
            >
              <IconPencil class="size-5" />
            </MainToolbarButton>
            <MainToolbarButton
              title="Track"
              :active="store.currentToolbar === 'track'"
              @click="store.toggleToolbar('track')"
            >
              <IconMapMarkerPath class="size-5" />
            </MainToolbarButton>

            <div class="border-border h-5 border-l" />

            <!-- Symbol Selection -->
            <div class="flex items-center gap-1">
              <EchelonPickerPopover
                :symbol-options="symbolOptions"
                :select-echelon="selectEchelon"
              />
              <PanelSymbolButton
                :size="22"
                :sidc="computedSidc"
                class="group relative"
                :symbol-options="symbolOptions"
                @click="addUnit(activeSidc)"
                title="Add unit"
                :disabled="!activeParentId || unitActions.isUnitLocked(activeParentId)"
              >
                <AddSymbolIcon class="size-5" />
              </PanelSymbolButton>
              <SymbolPickerPopover :symbol-options="symbolOptions" :add-unit="addUnit" />
            </div>

            <div class="border-border h-5 border-l" />

            <!-- Undo/Redo -->
            <MainToolbarButton
              title="Undo"
              @click="undo()"
              :disabled="!canUndo"
            >
              <IconUndoVariant class="size-5" />
            </MainToolbarButton>
            <MainToolbarButton
              title="Redo"
              @click="redo()"
              :disabled="!canRedo"
            >
              <IconRedoVariant class="size-5" />
            </MainToolbarButton>

            <div class="border-border h-5 border-l" />

            <!-- Time Controls -->
            <MainToolbarButton
              title="Calendar"
              @click="emit('open-time-modal')"
            >
              <svg class="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-1V1h-2v3H9V1H7v3H6zm0 6h12V4H6v4z" />
              </svg>
            </MainToolbarButton>

            <div class="border-border h-5 border-l" />

            <!-- Time Controls -->
            <MainToolbarButton
              title="Settings"
              @click="emit('show-settings')"
            >
              <IconCogOutline class="size-5" />
            </MainToolbarButton>
          </div>
        </div>
      </FloatingWindow>
    </template>
  </template>

  <!-- Mobile: Bottom Sheet Menu -->
  <template v-else>
    <div class="pointer-events-auto fixed bottom-4 left-4 right-4 flex gap-2 justify-center flex-wrap">
      <button
        @click="handleSelectMode()"
        class="bg-popover border-border hover:bg-accent text-foreground p-3 rounded-lg border shadow-md transition-colors"
        title="Select"
      >
        <IconCursorDefaultOutline class="size-6" />
      </button>
      <button
        @click="toggleMoveUnit()"
        :class="{
          'bg-accent': moveUnitEnabled,
          'bg-popover': !moveUnitEnabled,
        }"
        class="border-border text-foreground p-3 rounded-lg border shadow-md transition-colors"
        title="Move unit"
      >
        <IconCursorMove class="size-6" />
      </button>
      <button
        @click="mobileMenuOpen = true"
        class="bg-popover border-border hover:bg-accent text-foreground px-4 py-3 rounded-lg border shadow-md transition-colors font-medium flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        Menu
      </button>
    </div>

    <BottomSheetMenu
      :is-open="mobileMenuOpen"
      title="Editor Tools"
      @close="mobileMenuOpen = false"
    >
      <div class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold mb-2">Tools</h3>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="toggleTool('measurements')"
              :class="{
                'bg-accent': store.currentToolbar === 'measurements',
                'bg-muted': store.currentToolbar !== 'measurements',
              }"
              class="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors"
            >
              <IconRulerSquareCompass class="size-6" />
              <span class="text-xs">Measure</span>
            </button>
            <button
              @click="toggleTool('draw')"
              :class="{
                'bg-accent': store.currentToolbar === 'draw',
                'bg-muted': store.currentToolbar !== 'draw',
              }"
              class="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors"
            >
              <IconPencil class="size-6" />
              <span class="text-xs">Draw</span>
            </button>
            <button
              @click="toggleTool('track')"
              :class="{
                'bg-accent': store.currentToolbar === 'track',
                'bg-muted': store.currentToolbar !== 'track',
              }"
              class="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors"
            >
              <IconMapMarkerPath class="size-6" />
              <span class="text-xs">Track</span>
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">Edit</h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="undo()"
              :disabled="!canUndo"
              class="bg-muted disabled:opacity-50 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <IconUndoVariant class="size-5" />
              <span class="text-sm">Undo</span>
            </button>
            <button
              @click="redo()"
              :disabled="!canRedo"
              class="bg-muted disabled:opacity-50 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <IconRedoVariant class="size-5" />
              <span class="text-sm">Redo</span>
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">Timeline</h3>
          <div class="grid grid-cols-1 gap-2">
            <button
              @click="emit('open-time-modal'); mobileMenuOpen = false"
              class="bg-muted p-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg class="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-1V1h-2v3H9V1H7v3H6zm0 6h12V4H6v4z" />
              </svg>
              <span class="text-sm">Select Time</span>
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">Settings</h3>
          <button
            @click="emit('show-settings'); mobileMenuOpen = false"
            class="w-full bg-muted p-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <IconCogOutline class="size-5" />
            <span class="text-sm">Preferences</span>
          </button>
        </div>
      </div>
    </BottomSheetMenu>
  </template>
</template>

<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconCogOutline as SettingsIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMapMarkerPath,
  IconPencil as DrawIcon,
  IconPlus as AddSymbolIcon,
  IconRedoVariant as RedoIcon,
  IconRulerSquareCompass as MeasurementIcon,
  IconSkipNext,
  IconSkipPrevious,
  IconUndoVariant as UndoIcon,
  IconCursorDefaultOutline,
  IconCursorMove,
  IconRulerSquareCompass,
  IconPencil,
  IconCogOutline,
  IconUndoVariant,
  IconRedoVariant,
} from "@iconify-prerendered/vue-mdi";
import { CalendarIcon } from "@heroicons/vue/24/solid";

import FloatingWindow from "@/components/FloatingWindow.vue";
import BottomSheetMenu from "@/components/BottomSheetMenu.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import SymbolPickerPopover from "@/modules/scenarioeditor/SymbolPickerPopover.vue";
import EchelonPickerPopover from "@/modules/scenarioeditor/EchelonPickerPopover.vue";

import { ref, computed, onMounted, type Ref } from "vue";
import { useBreakpoints, breakpointsTailwind, useToggle, useEventBus } from "@vueuse/core";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useFloatingWindows } from "@/composables/useFloatingWindows";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from "@/composables/useKeyboardShortcuts";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeMapKey } from "@/components/injects";
import { storeToRefs } from "pinia";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { useActiveUnitStore } from "@/stores/dragStore";
import { orbatUnitClick } from "@/components/eventKeys";
import { Sidc, SID_INDEX } from "@/symbology/sidc";
import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants.ts";

const emit = defineEmits<{
  (e: "open-time-modal"): void;
  (e: "show-settings"): void;
}>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("sm");
const mobileMenuOpen = ref(false);

const store = useMainToolbarStore();
const unitSettings = useUnitSettingsStore();
const { moveUnitEnabled } = storeToRefs(unitSettings);

const {
  store: { undo: undoAction, redo: redoAction, canRedo, canUndo, groupUpdate, state },
  unitActions,
  geo: { addUnitPosition },
  helpers: { getSideById },
} = injectStrict(activeScenarioKey);

const mapRef = injectStrict(activeMapKey);
const selectStore = useMapSelectStore();
const bus = useEventBus(orbatUnitClick);
const { activeUnitId, resetActiveParent, activeParent, activeParentId } = useActiveUnitStore();
const { currentSid, currentEchelon, activeSidc } = useToolbarUnitSymbolData();

const { addMultiple } = storeToRefs(store);
const [, toggleMoveUnit] = useToggle(moveUnitEnabled.value);

const {
  windows,
  createWindow,
  updateWindow,
  removeWindow,
  bringToFront,
} = useFloatingWindows();

const { addShortcut } = useKeyboardShortcuts();

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  cancel: cancelGetLocation,
  onGetLocation,
  onCancel,
  onStart,
} = useGetMapLocation(mapRef.value, {
  cancelOnClickOutside: false,
  stopPropagationOnClickOutside: false,
});

const computedSidc = computed(() => {
  const computedActiveSidc = activeSidc.value.startsWith(CUSTOM_SYMBOL_PREFIX)
    ? "10031000141211000000"
    : activeSidc.value;
  const parsedSidc = new Sidc(computedActiveSidc);
  parsedSidc.standardIdentity = currentSid.value;
  parsedSidc.emt = "00";
  parsedSidc.hqtfd = "0";
  return parsedSidc.toString();
});

const symbolOptions = computed(() =>
  activeParent.value
    ? {
        ...unitActions.getCombinedSymbolOptions(activeParent.value, true),
        outlineWidth: 5,
      }
    : {},
);

onMounted(() => {
  if (!activeParentId.value) resetActiveParent();

  // Criar janela principal se for desktop
  if (!isMobile.value && windows.value.length === 0) {
    createWindow("main-toolbar", "Map Editor Toolbar", {
      x: 50,
      y: 50,
      width: 1000,
      height: 120,
    });
  }

  // Registrar atalhos de teclado
  addShortcut("undo", {
    ...DEFAULT_SHORTCUTS.UNDO,
    callback: () => undoAction(),
  });

  addShortcut("redo", {
    ...DEFAULT_SHORTCUTS.REDO,
    callback: () => redoAction(),
  });

  addShortcut("draw", {
    ...DEFAULT_SHORTCUTS.DRAW,
    callback: () => store.toggleToolbar("draw"),
  });

  addShortcut("measure", {
    ...DEFAULT_SHORTCUTS.MEASURE,
    callback: () => store.toggleToolbar("measurements"),
  });
});

onCancel(() => {
  selectStore.hoverEnabled = true;
});

onStart(() => {
  selectStore.hoverEnabled = false;
  store.clearToolbar();
});

onGetLocation((location) => {
  selectStore.hoverEnabled = true;
  groupUpdate(() => {
    if (!activeParentId.value || unitActions.isUnitLocked(activeParentId.value)) return;
    const name = `${(activeParent.value?.subUnits?.length ?? 0) + 1}`;
    const sidc = new Sidc(activeSidc.value!);
    sidc.emt = currentEchelon.value;
    sidc.standardIdentity = currentSid.value;
    const unitId = unitActions.createSubordinateUnit(activeParentId.value, {
      sidc: sidc.toString(),
      name,
    });
    unitId && addUnitPosition(unitId, location);
  });
  if (addMultiple.value && activeSidc.value) {
    addUnit(activeSidc.value);
  }
});

bus.on((unit) => {
  if (isGetLocationActive.value) {
    if (!(addMultiple.value && activeSidc.value)) {
      cancelGetLocation();
    }
    const name = `${(activeParent.value?.subUnits?.length ?? 0) + 1}`;
    const sidc = new Sidc(activeSidc.value!);
    sidc.emt = currentEchelon.value;
    sidc.standardIdentity = unit.sidc[SID_INDEX];
    const unitId = unitActions.createSubordinateUnit(unit.id, {
      sidc: sidc.toString(),
      name,
    });
    if (unitId && unit.location) addUnitPosition(unitId, unit.location);
  }
});

function addUnit(sidc: string, closePopover?: (ref?: Ref | HTMLElement) => void) {
  activeSidc.value = sidc;
  closePopover && closePopover();
  startGetLocation();
}

function selectEchelon(echelon: string) {
  currentEchelon.value = echelon;
}

function handleSelectMode() {
  store.clearToolbar();
}

function toggleTool(tool: string) {
  store.toggleToolbar(tool as any);
  mobileMenuOpen.value = false;
}

function undo() {
  undoAction();
}

function redo() {
  redoAction();
}
</script>
