<template>
  <div class="space-y-4 p-1">
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

const settings = useMapSettingsStore();
const items: RadioGroupItem<CoordinateFormatType>[] = [
  { name: "DG", description: "Decimal degrees", value: "DecimalDegrees" },
  { name: "DMS", description: "Degree Minutes Seconds", value: "DegreeMinuteSeconds" },
  { name: "MGRS", description: "Military grid reference system", value: "MGRS" },
];
</script>
