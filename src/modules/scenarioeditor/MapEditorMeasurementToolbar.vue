<script setup lang="ts">
import {
  IconMagnet as SnapIcon,
  IconMapMarkerDistance as ShowSegmentsIcon,
  IconSelectionEllipse as ShowCircleIcon,
  IconSelectMultipleMarker as ShowMultipleIcon,
  IconVectorRadius as GeodesicIcon,
  IconTrashCanOutline as TrashIcon,
  IconVectorLine as LengthIcon,
  IconVectorSquare as AreaIcon,
} from "@iconify-prerendered/vue-mdi";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import MapEditorSubToolbar from "@/modules/scenarioeditor/MapEditorSubToolbar.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { onKeyDown } from "@vueuse/core";
import { activeNativeMapKey, activeScenarioMapEngineKey } from "@/components/injects";
import { injectStrict } from "@/utils";
import { useMeasurementInteraction } from "@/composables/geoMeasurement";
import { useMapLibreMeasurementInteraction } from "@/composables/maplibreMeasurement";
import { storeToRefs } from "pinia";
import { useMeasurementsStore } from "@/stores/geoStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { computed } from "vue";
import { onUnmounted } from "vue";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import OLMap from "ol/Map";

const mapRef = injectStrict(activeNativeMapKey);
const mapEngineRef = injectStrict(activeScenarioMapEngineKey);

const store = useMainToolbarStore();
const selectStore = useMapSelectStore();
const {
  showSegments,
  clearPrevious,
  measurementType,
  measurementUnit,
  snap,
  showCircle,
  showGeodesicPaths,
} = storeToRefs(useMeasurementsStore());
const activeMapAdapter = mapEngineRef.value?.map;
const nativeMap = activeMapAdapter?.getNativeMap();
const isMapLibre = !!nativeMap && !(nativeMap instanceof OLMap);
const { mapProjection } = storeToRefs(useMapSettingsStore());
const showGeodesicToggle = computed(() => isMapLibre && mapProjection.value !== "globe");
const interactionOptions = {
  showSegments,
  clearPrevious,
  measurementUnit,
  snap,
  showCircle,
  showGeodesicPaths,
};
const { clear } = nativeMap
  ? nativeMap instanceof OLMap
    ? useMeasurementInteraction(mapRef.value, measurementType, interactionOptions)
    : useMapLibreMeasurementInteraction(
        activeMapAdapter!,
        measurementType,
        interactionOptions,
      )
  : { clear: () => {} };

selectStore.unitSelectEnabled = false;
selectStore.featureSelectEnabled = false;

onKeyDown("Escape", () => store.clearToolbar());
onUnmounted(() => {
  clear();
  selectStore.unitSelectEnabled = true;
  selectStore.featureSelectEnabled = true;
});
</script>

<template>
  <MapEditorSubToolbar label="Measure">
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
    <div class="border-border mx-1 h-5 border-l" />
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
    <MainToolbarButton
      v-if="showGeodesicToggle"
      title="Show great-circle paths"
      @click="showGeodesicPaths = !showGeodesicPaths"
      :active="showGeodesicPaths"
    >
      <GeodesicIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton title="Toggle snapping" @click="snap = !snap" :active="snap">
      <SnapIcon class="size-5" />
    </MainToolbarButton>
    <MainToolbarButton title="Clear measurements" @click="clear()">
      <TrashIcon class="size-5" />
    </MainToolbarButton>
  </MapEditorSubToolbar>
</template>
