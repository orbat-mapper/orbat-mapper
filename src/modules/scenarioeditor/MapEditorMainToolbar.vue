<template>
  <FloatingPanel
    class="pointer-events-auto flex w-full max-w-lg items-center justify-between rounded-md bg-white p-1"
  >
    <div class="flex items-center justify-between -space-x-1">
      <MainToolbarButton>
        <SelectIcon class="h-6 w-6" />
      </MainToolbarButton>
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
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

const {
  store: { undo, redo, canRedo, canUndo },
} = injectStrict(activeScenarioKey);
const store = useMainToolbarStore();
</script>
