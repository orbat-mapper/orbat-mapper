<template>
  <FloatingPanel
    class="pointer-events-auto flex items-center -space-x-1 rounded-md bg-white p-1"
  >
    <MainToolbarButton title="Measurements">
      <SelectIcon class="h-6 w-6" />
    </MainToolbarButton>
    <MainToolbarButton title="Measurements">
      <MeasurementIcon class="h-6 w-6" />
    </MainToolbarButton>
    <MainToolbarButton title="Draw">
      <DrawIcon class="h-6 w-6" />
    </MainToolbarButton>
    <MainToolbarButton title="Toggle toolbar" @click="store.showToolbar = false">
      <CloseIcon class="h-6 w-6" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconRulerSquareCompass as MeasurementIcon,
  IconPencil as DrawIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconClose as CloseIcon,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const store = useMainToolbarStore();
</script>
