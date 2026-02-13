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
            <EchelonPickerPopover
              :symbol-options="symbolOptions"
              :select-echelon="selectEchelon"
            />
            <SymbolPickerPopover
              :symbol-options="symbolOptions"
              :add-unit="addUnit"
            />

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
  IconCursorDefaultOutline,
  IconCursorMove,
  IconRulerSquareCompass,
  IconPencil,
  IconMapMarkerPath,
  IconUndoVariant,
  IconRedoVariant,
  IconCogOutline,
} from "@iconify-prerendered/vue-mdi";
import FloatingWindow from "@/components/FloatingWindow.vue";
import BottomSheetMenu from "@/components/BottomSheetMenu.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import SymbolPickerPopover from "@/modules/scenarioeditor/SymbolPickerPopover.vue";
import EchelonPickerPopover from "@/modules/scenarioeditor/EchelonPickerPopover.vue";

import { ref, computed, onMounted, inject } from "vue";
import { useBreakpoints, breakpointsTailwind, useToggle } from "@vueuse/core";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useFloatingWindows } from "@/composables/useFloatingWindows";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from "@/composables/useKeyboardShortcuts";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

const emit = defineEmits<{
  (e: "open-time-modal"): void;
  (e: "show-settings"): void;
}>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("sm");
const mobileMenuOpen = ref(false);

const store = useMainToolbarStore();
const unitSettings = useUnitSettingsStore();
const { moveUnitEnabled } = unitSettings;

const {
  store: { undo: undoAction, redo: redoAction, canRedo, canUndo },
} = injectStrict(activeScenarioKey);

const {
  windows,
  createWindow,
  updateWindow,
  removeWindow,
  bringToFront,
} = useFloatingWindows();

const { addShortcut } = useKeyboardShortcuts();
const [, toggleMoveUnit] = useToggle(moveUnitEnabled);

const symbolOptions = computed(() => ({}));

onMounted(() => {
  // Criar janela principal se for desktop
  if (!isMobile.value && windows.value.length === 0) {
    createWindow("main-toolbar", "Map Editor Toolbar", {
      x: 50,
      y: 50,
      width: 900,
      height: 100,
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

function selectEchelon(echelon: string) {
  // Handle echelon selection
}

function addUnit(sidc: string) {
  // Handle unit addition
}
</script>
