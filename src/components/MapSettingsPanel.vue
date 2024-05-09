<template>
  <div class="space-y-4 p-1">
    <ToggleField v-model="uiSettings.showToolbar">Show toolbar</ToggleField>
    <ToggleField v-model="uiSettings.showTimeline">Show timeline</ToggleField>
    <ToggleField v-model="settings.showScaleLine">Show scale line</ToggleField>
    <ToggleField v-model="settings.showLocation"
      >Show location of mouse cursor
    </ToggleField>
    <section>
      <p class="text-base font-medium leading-loose text-gray-900">Coordinate format</p>
      <RadioGroupList
        v-model="settings.coordinateFormat"
        :items="coordinateFormatItems"
      />
    </section>

    <section>
      <p class="text-base font-medium leading-loose text-gray-900">Measurement unit</p>
      <RadioGroupList
        v-model="measurementStore.measurementUnit"
        :items="measurementItems"
      />
    </section>
    <section>
      <PanelHeading>Cluster settings</PanelHeading>
      <section class="mt-4 grid w-full grid-cols-[max-content_1fr] gap-4 text-sm">
        <label>Enabled</label>
        <ToggleField v-model="clusterSettings.enabled" />
        <label for="cluster-distance" class="">Distance</label>
        <div class="grid grid-cols-[1fr_8ch] gap-4">
          <input
            id="stroke-width"
            v-model.number="clusterSettings.distance"
            type="range"
            min="5"
            max="100"
            step="1"
            class="min-w-20"
          />
          <span class="">{{ clusterSettings.distance }} px</span>
        </div>

        <label for="animation-duration" class="">Animation</label>
        <div class="grid grid-cols-[1fr_8ch] gap-4">
          <input
            id="animation-duration"
            v-model.number="clusterSettings.animationDuration"
            type="range"
            min="0"
            max="1000"
            step="1"
            class="min-w-20"
          />
          <span class="">{{ clusterSettings.animationDuration }} ms</span>
        </div>
      </section>
    </section>
  </div>
</template>
<script setup lang="ts">
import ToggleField from "@/components/ToggleField.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { RadioGroupItem } from "@/components/types";
import { CoordinateFormatType } from "@/composables/geoShowLocation";
import RadioGroupList from "@/components/RadioGroupList.vue";
import { useUiStore } from "@/stores/uiStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import { MeasurementUnit } from "@/composables/geoMeasurement";
import { useClusterSettingsStore } from "@/stores/clusterStore";
import PanelHeading from "@/components/PanelHeading.vue";

const settings = useMapSettingsStore();
const measurementStore = useMeasurementsStore();
const uiSettings = useUiStore();
const clusterSettings = useClusterSettingsStore();

const coordinateFormatItems: RadioGroupItem<CoordinateFormatType>[] = [
  { name: "DG", description: "Decimal degrees", value: "DecimalDegrees" },
  { name: "DMS", description: "Degree Minutes Seconds", value: "DegreeMinuteSeconds" },
  { name: "MGRS", description: "Military grid reference system", value: "MGRS" },
];

const measurementItems: RadioGroupItem<MeasurementUnit>[] = [
  { name: "Metric", value: "metric" },
  { name: "Imperial", value: "imperial" },
  { name: "Nautical", value: "nautical" },
];
</script>
