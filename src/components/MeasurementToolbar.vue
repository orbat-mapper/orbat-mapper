<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/24/solid";

import {
  IconMapMarkerPath,
  IconRuler,
  IconSelectionMultiple,
  IconVectorPolygon,
  IconVectorPolyline,
} from "@iconify-prerendered/vue-mdi";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import OLMap from "ol/Map";
import { useMeasurementInteraction } from "@/composables/geoMeasurement";
import { watch } from "vue";
import { type Fn, onKeyDown, useToggle } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useMeasurementsStore } from "@/stores/geoStore";
import { useUiStore } from "@/stores/uiStore";

const props = defineProps<{ olMap: OLMap }>();
const { showSegments, clearPrevious, measurementType, measurementUnit } =
  storeToRefs(useMeasurementsStore());

const uiStore = useUiStore();
uiStore.measurementActive = false;
const [enableMeasurements, toggleMeasurements] = useToggle(false);

const { clear } = useMeasurementInteraction(props.olMap, measurementType, {
  showSegments,
  clearPrevious,
  enable: enableMeasurements,
  measurementUnit,
});

let fn: Fn;
watch(enableMeasurements, (enabled) => {
  if (enabled) {
    uiStore.measurementActive = true;
    fn = onKeyDown("Escape", (event) => {
      enableMeasurements.value = false;
    });
  } else {
    uiStore.measurementActive = false;
    fn();
    clear();
  }
});
</script>

<template>
  <div>
    <BaseToolbar class="shadow-sm">
      <ToolbarButton
        start
        :end="!enableMeasurements"
        title="Toggle measurements"
        @click="toggleMeasurements()"
      >
        <IconRuler class="h-5 w-5" :class="enableMeasurements && 'text-gray-900'" />
      </ToolbarButton>
      <template v-if="enableMeasurements">
        <ToolbarButton
          @click="measurementType = 'LineString'"
          :active="measurementType === 'LineString'"
        >
          <IconVectorPolyline class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          @click="measurementType = 'Polygon'"
          :active="measurementType === 'Polygon'"
        >
          <IconVectorPolygon class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          title="Clear previous measurements"
          @click="clearPrevious = !clearPrevious"
          :active="!clearPrevious"
        >
          <IconSelectionMultiple class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton
          title="Show segment lengths"
          @click="showSegments = !showSegments"
          :active="showSegments"
        >
          <IconMapMarkerPath class="h-5 w-5" />
        </ToolbarButton>
        <ToolbarButton end @click="clear()">
          <TrashIcon class="h-5 w-5" />
        </ToolbarButton>
      </template>
    </BaseToolbar>
  </div>
</template>
