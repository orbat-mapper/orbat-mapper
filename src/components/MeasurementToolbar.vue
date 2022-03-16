<template>
  <div>
    <BaseToolbar>
      <ToolbarButton
        start
        :end="!enableMeasurements"
        title="Toggle measurements"
        @click="toggleMeasurements"
      >
        <RulerIcon class="h-5 w-5" :class="enableMeasurements && 'text-gray-900'" />
      </ToolbarButton>
      <template v-if="enableMeasurements">
        <ToolbarButton>
          <VectorPolyline
            @click="measurementType = 'LineString'"
            class="h-5 w-5"
            :class="measurementType === 'LineString' && 'text-gray-900'"
          />
        </ToolbarButton>
        <ToolbarButton>
          <VectorPolygon
            @click="measurementType = 'Polygon'"
            class="h-5 w-5"
            :class="measurementType === 'Polygon' && 'text-gray-900'"
          />
        </ToolbarButton>
        <ToolbarButton title="Clear previous measurements">
          <SelectionMultiple
            @click="clearPrevious = !clearPrevious"
            class="h-5 w-5"
            :class="!clearPrevious && 'text-gray-900'"
          />
        </ToolbarButton>
        <ToolbarButton title="Show segment lengths">
          <MapMarkerPath
            @click="showSegments = !showSegments"
            class="h-5 w-5"
            :class="showSegments && 'text-gray-900'"
          />
        </ToolbarButton>
        <ToolbarButton end @click="clear()">
          <TrashIcon class="h-5 w-5" />
        </ToolbarButton>
      </template>
    </BaseToolbar>
  </div>
</template>

<script setup lang="ts">
import { TrashIcon } from "@heroicons/vue/solid";

import {
  MapMarkerPath,
  Ruler as RulerIcon,
  SelectionMultiple,
  VectorPolygon,
  VectorPolyline,
} from "mdue";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import OLMap from "ol/Map";
import { useMeasurementInteraction } from "../composables/geoMeasurement";
import { watch } from "vue";
import { useToggle } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { useMeasurementsStore } from "../stores/geoStore";

const props = defineProps<{ olMap: OLMap }>();
const { showSegments, clearPrevious, measurementType } = storeToRefs(
  useMeasurementsStore()
);

const [enableMeasurements, toggleMeasurements] = useToggle(false);

const { clear } = useMeasurementInteraction(props.olMap, measurementType, {
  showSegments,
  clearPrevious,
  enable: enableMeasurements,
});

watch(enableMeasurements, (v) => !v && clear());
</script>
