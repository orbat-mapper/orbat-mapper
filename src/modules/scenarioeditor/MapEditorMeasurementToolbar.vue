<template>
  <FloatingPanel class="pointer-events-auto flex items-center space-x-0.5 rounded-md p-1">
    <p class="text-muted-foreground px-2 text-sm font-medium">Measure</p>
    <MainToolbarButton
      title="Length"
      @click="measurementType = 'LineString'"
      :active="measurementType === 'LineString'"
    >
      <LengthIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Area"
      @click="measurementType = 'Polygon'"
      :active="measurementType === 'Polygon'"
    >
      <AreaIcon class="size-5" />
    </MainToolbarButton>
    <div class="h-5 border-l border-gray-300" />
    <MainToolbarButton
      title="Show segment lengths"
      @click="showSegments = !showSegments"
      :active="showSegments"
    >
      <ShowSegmentsIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Show multiple measurements"
      @click="clearPrevious = !clearPrevious"
      :active="!clearPrevious"
    >
      <ShowMultipleIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton
      title="Show range circle"
      @click="showCircle = !showCircle"
      :active="showCircle"
    >
      <ShowCircleIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton title="Toggle snapping" @click="snap = !snap" :active="snap">
      <SnapIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton title="Clear measurements" @click="clear()">
      <TrashIcon class="size-5" />
    </MainToolbarButton>

    <MainToolbarButton title="Toggle toolbar" @click="store.clearToolbar()">
      <CloseIcon class="size-5" />
    </MainToolbarButton>
  </FloatingPanel>
</template>
<script setup lang="ts">
import {
  IconClose as CloseIcon,
  IconMagnet as SnapIcon,
  IconMapMarkerDistance as ShowSegmentsIcon,
  IconSelectionEllipse as ShowCircleIcon,
  IconSelectMultipleMarker as ShowMultipleIcon,
  IconTrashCanOutline as TrashIcon,
  IconVectorLine as LengthIcon,
  IconVectorSquare as AreaIcon,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { onKeyDown } from "@vueuse/core";
import { activeMapKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { useMeasurementInteraction } from "@/composables/geoMeasurement";
import { storeToRefs } from "pinia";
import { useMeasurementsStore } from "@/stores/geoStore";
import { onUnmounted } from "vue";
import { useMapSelectStore } from "@/stores/mapSelectStore";

const mapRef = injectStrict(activeMapKey);

const store = useMainToolbarStore();
const selectStore = useMapSelectStore();
const {
  showSegments,
  clearPrevious,
  measurementType,
  measurementUnit,
  snap,
  showCircle,
} = storeToRefs(useMeasurementsStore());
const { clear } = useMeasurementInteraction(mapRef.value, measurementType, {
  showSegments,
  clearPrevious,
  measurementUnit,
  snap,
  showCircle,
});

selectStore.unitSelectEnabled = false;
selectStore.featureSelectEnabled = false;

onKeyDown("Escape", () => store.clearToolbar());
onUnmounted(() => {
  clear();
  selectStore.unitSelectEnabled = true;
  selectStore.featureSelectEnabled = true;
});
</script>
