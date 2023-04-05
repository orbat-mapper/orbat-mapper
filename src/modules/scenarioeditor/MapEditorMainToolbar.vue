<template>
  <FloatingPanel
    class="pointer-events-auto flex w-full max-w-lg items-center -space-x-1 rounded-md bg-white p-1"
  >
    <MainToolbarButton>
      <SelectIcon class="h-6 w-6" />
    </MainToolbarButton>
    <PanelToggle v-model="store.showMeasurementsToolbar" title="Measurements">
      <MeasurementIcon class="h-6 w-6" />
    </PanelToggle>
    <!--    <PanelToggle v-model="store.showToolbar" title="Draw">-->
    <!--      <DrawIcon class="h-6 w-6" />-->
    <!--    </PanelToggle>-->
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconCursorDefaultOutline as SelectIcon,
  IconPencil as DrawIcon,
  IconRulerSquareCompass as MeasurementIcon,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import PanelToggle from "@/components/PanelToggle.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";

const store = useMainToolbarStore();
</script>
