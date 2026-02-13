<template>
  <div class="pointer-events-none flex flex-col sm:justify-center sm:items-center">
    <!-- Desktop Toolbar -->
    <FloatingPanel
      v-if="!isMobile"
      class="pointer-events-auto flex items-center space-x-1 rounded-md p-1 flex-wrap gap-1"
    >
      <!-- Selection Tools -->
      <MainToolbarButton
        title="Select"
        @click="emit('action', 'select')"
      >
        <IconCursorDefaultOutline class="size-6" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Move unit"
        :active="moveUnitEnabled"
        @click="toggleMoveUnit()"
      >
        <IconCursorMove class="size-6" />
      </MainToolbarButton>

      <div class="border-border h-7 border-l-2 sm:mx-1" />

      <!-- Toolbar Toggles -->
      <MainToolbarButton
        title="Measurements"
        :active="currentToolbar === 'measurements'"
        @click="toggleToolbar('measurements')"
      >
        <IconRulerSquareCompass class="size-6" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Draw"
        :active="currentToolbar === 'draw'"
        @click="toggleToolbar('draw')"
      >
        <IconPencil class="size-6" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Track"
        :active="currentToolbar === 'track'"
        @click="toggleToolbar('track')"
      >
        <IconMapMarkerPath class="size-6" />
      </MainToolbarButton>

      <div class="border-border h-7 border-l-2 sm:mx-1" />

      <!-- Symbol Selection -->
      <EchelonPickerPopover
        :symbol-options="symbolOptions"
        :select-echelon="selectEchelon"
      />
      <PanelSymbolButton
        :size="22"
        :sidc="computedSidc"
        class="group relative ml-2 sm:ml-5"
        :symbol-options="symbolOptions"
        @click="addUnit(computedSidc)"
        title="Add unit"
        :disabled="!activeParentId || unitActions.isUnitLocked(activeParentId)"
      >
        <IconPlus class="size-6" />
      </PanelSymbolButton>
      <SymbolPickerPopover :symbol-options="symbolOptions" :add-unit="addUnit" />

      <div class="border-border -mx-1 h-7 border-l-2 sm:mx-1" />

      <!-- Undo/Redo -->
      <MainToolbarButton title="Undo" @click="undo()" :disabled="!canUndo">
        <IconUndoVariant class="size-6" />
      </MainToolbarButton>
      <MainToolbarButton title="Redo" @click="redo()" :disabled="!canRedo">
        <IconRedoVariant class="size-6" />
      </MainToolbarButton>

      <div class="border-border mx-1 hidden h-7 border-l-2 sm:block" />

      <!-- Time Controls -->
      <MainToolbarButton
        title="Previous event"
        @click="emit('prev-event')"
        class="hidden md:flex"
      >
        <IconSkipPrevious class="size-6" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Select Time and Date"
        class="hidden sm:flex"
        @click="emit('open-time-modal')"
      >
        <CalendarIcon class="size-5" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Next event"
        @click="emit('next-event')"
        class="hidden md:flex"
      >
        <IconSkipNext class="size-6" />
      </MainToolbarButton>

      <div class="border-border mx-1 hidden h-7 border-l-2 sm:block" />

      <!-- Settings -->
      <MainToolbarButton
        title="Show settings"
        @click="emit('show-settings')"
        class="hidden md:flex"
      >
        <IconCogOutline class="size-6" />
      </MainToolbarButton>
    </FloatingPanel>

    <!-- Mobile Bottom Sheet Menu -->
    <template v-else>
      <div class="pointer-events-auto fixed bottom-4 left-4 right-4 flex gap-2 justify-center flex-wrap">
        <!-- Quick Action Buttons -->
        <button
          @click="emit('action', 'select')"
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

        <!-- Menu Button -->
        <button
          @click="mobileMenuOpen = true"
          class="bg-popover border-border hover:bg-accent text-foreground px-4 py-3 rounded-lg border shadow-md transition-colors font-medium flex items-center gap-2"
          title="More options"
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

      <!-- Bottom Sheet Menu -->
      <BottomSheetMenu
        :is-open="mobileMenuOpen"
        title="Editor Tools"
        @close="mobileMenuOpen = false"
      >
        <div class="space-y-3">
          <!-- Tools Section -->
          <div>
            <h3 class="text-sm font-semibold mb-2">Tools</h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="toggleToolbar('measurements'); mobileMenuOpen = false"
                :class="{
                  'bg-accent': currentToolbar === 'measurements',
                  'bg-muted': currentToolbar !== 'measurements',
                }"
                class="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors text-foreground"
              >
                <IconRulerSquareCompass class="size-6" />
                <span class="text-xs">Measure</span>
              </button>
              <button
                @click="toggleToolbar('draw'); mobileMenuOpen = false"
                :class="{
                  'bg-accent': currentToolbar === 'draw',
                  'bg-muted': currentToolbar !== 'draw',
                }"
                class="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors text-foreground"
              >
                <IconPencil class="size-6" />
                <span class="text-xs">Draw</span>
              </button>
              <button
                @click="toggleToolbar('track'); mobileMenuOpen = false"
                :class="{
                  'bg-accent': currentToolbar === 'track',
                  'bg-muted': currentToolbar !== 'track',
                }"
                class="p-3 rounded-lg flex flex-col items-center gap-1 transition-colors text-foreground"
              >
                <IconMapMarkerPath class="size-6" />
                <span class="text-xs">Track</span>
              </button>
            </div>
          </div>

          <!-- Undo/Redo Section -->
          <div>
            <h3 class="text-sm font-semibold mb-2">Edit</h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="undo()"
                :disabled="!canUndo"
                class="bg-muted disabled:opacity-50 p-3 rounded-lg flex items-center gap-2 transition-colors text-foreground"
              >
                <IconUndoVariant class="size-5" />
                <span class="text-sm">Undo</span>
              </button>
              <button
                @click="redo()"
                :disabled="!canRedo"
                class="bg-muted disabled:opacity-50 p-3 rounded-lg flex items-center gap-2 transition-colors text-foreground"
              >
                <IconRedoVariant class="size-5" />
                <span class="text-sm">Redo</span>
              </button>
            </div>
          </div>

          <!-- Time Section -->
          <div>
            <h3 class="text-sm font-semibold mb-2">Timeline</h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="emit('prev-event'); mobileMenuOpen = false"
                class="bg-muted p-3 rounded-lg flex items-center justify-center transition-colors text-foreground"
              >
                <IconSkipPrevious class="size-5" />
              </button>
              <button
                @click="emit('open-time-modal'); mobileMenuOpen = false"
                class="bg-muted p-3 rounded-lg flex items-center justify-center transition-colors text-foreground"
              >
                <CalendarIcon class="size-5" />
              </button>
              <button
                @click="emit('next-event'); mobileMenuOpen = false"
                class="bg-muted p-3 rounded-lg flex items-center justify-center transition-colors text-foreground"
              >
                <IconSkipNext class="size-5" />
              </button>
            </div>
          </div>

          <!-- Settings -->
          <button
            @click="emit('show-settings'); mobileMenuOpen = false"
            class="w-full bg-muted p-3 rounded-lg flex items-center gap-2 transition-colors text-foreground"
          >
            <IconCogOutline class="size-5" />
            <span class="text-sm">Settings</span>
          </button>
        </div>
      </BottomSheetMenu>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import BottomSheetMenu from "@/components/BottomSheetMenu.vue";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import SymbolPickerPopover from "@/modules/scenarioeditor/SymbolPickerPopover.vue";
import EchelonPickerPopover from "@/modules/scenarioeditor/EchelonPickerPopover.vue";
import {
  IconCursorDefaultOutline,
  IconCursorMove,
  IconRulerSquareCompass,
  IconPencil,
  IconMapMarkerPath,
  IconPlus,
  IconUndoVariant,
  IconRedoVariant,
  IconSkipPrevious,
  IconSkipNext,
  IconCogOutline,
} from "@iconify-prerendered/vue-mdi";
import { CalendarIcon } from "@heroicons/vue/24/solid";

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  moveUnitEnabled: boolean;
  currentToolbar: string | null;
  symbolOptions?: Record<string, any>;
  computedSidc?: string;
  activeParentId?: string;
  unitActions?: any;
}

interface Emits {
  (e: "action", action: string): void;
  (e: "open-time-modal"): void;
  (e: "inc-day"): void;
  (e: "dec-day"): void;
  (e: "next-event"): void;
  (e: "prev-event"): void;
  (e: "show-settings"): void;
  (e: "toggle-toolbar", toolbar: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  canUndo: false,
  canRedo: false,
  moveUnitEnabled: false,
  currentToolbar: null,
  symbolOptions: () => ({}),
  computedSidc: "10031000141211000000",
  activeParentId: "",
});

const emit = defineEmits<Emits>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("sm");
const mobileMenuOpen = ref(false);

function toggleMoveUnit() {
  emit("action", "toggleMove");
}

function toggleToolbar(toolbar: string) {
  emit("toggle-toolbar", toolbar);
}

function undo() {
  emit("action", "undo");
}

function redo() {
  emit("action", "redo");
}

function addUnit(sidc: string) {
  emit("action", "addUnit");
}

function selectEchelon(echelon: string) {
  emit("action", "selectEchelon");
}
</script>
