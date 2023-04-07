<template>
  <FloatingPanel
    class="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-md bg-white p-1"
  >
    <div class="flex items-center justify-between">
      <MainToolbarButton @click="toggleMoveUnit(false)" :active="!moveUnitEnabled">
        <SelectIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton
        :active="moveUnitEnabled"
        @click="toggleMoveUnit(true)"
        title="Move unit"
      >
        <MoveIcon class="h-6 w-6" />
      </MainToolbarButton>
      <div class="mx-1 h-7 border-l-2 border-gray-300" />
      <MainToolbarButton
        :active="store.currentToolbar === 'measurements'"
        @click="store.toggleToolbar('measurements')"
        title="Measurements"
      >
        <MeasurementIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton
        :active="store.currentToolbar === 'draw'"
        @click="store.toggleToolbar('draw')"
        title="Draw"
      >
        <DrawIcon class="h-6 w-6" />
      </MainToolbarButton>
    </div>
    <div class="flex items-center -space-x-1">
      <MainToolbarButton title="Undo" @click="undo()" :disabled="!canUndo">
        <UndoIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton title="Redo" @click="redo()" :disabled="!canRedo">
        <RedoIcon class="h-6 w-6" />
      </MainToolbarButton>
    </div>
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconCursorDefaultOutline as SelectIcon,
  IconPencil as DrawIcon,
  IconRulerSquareCompass as MeasurementIcon,
  IconRedoVariant as RedoIcon,
  IconUndoVariant as UndoIcon,
  IconCursorMove as MoveIcon,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { storeToRefs } from "pinia";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useToggle } from "@vueuse/core";

const {
  store: { undo, redo, canRedo, canUndo },
} = injectStrict(activeScenarioKey);
const store = useMainToolbarStore();
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());

const toggleMoveUnit = useToggle(moveUnitEnabled);
</script>
