<template>
  <div class="space-y-4 p-1">
    <ToggleField v-model="uiSettings.showToolbar">Show toolbar</ToggleField>
    <ToggleField v-model="settings.showScaleLine">Show scale line</ToggleField>
    <ToggleField v-model="settings.showLocation"
      >Show location of mouse cursor
    </ToggleField>
    <section>
      <p class="text-base font-medium leading-loose text-gray-900">Coordinate format</p>
      <RadioGroupList v-model="settings.coordinateFormat" :settings="items" />
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

const settings = useMapSettingsStore();
const uiSettings = useUiStore();
const items: RadioGroupItem<CoordinateFormatType>[] = [
  { name: "DG", description: "Decimal degrees", value: "DecimalDegrees" },
  { name: "DMS", description: "Degree Minutes Seconds", value: "DegreeMinuteSeconds" },
  { name: "MGRS", description: "Military grid reference system", value: "MGRS" },
];
</script>
