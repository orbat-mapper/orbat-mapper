<script setup lang="ts">
import ToggleField from "@/components/ToggleField.vue";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import type { RadioGroupItemData } from "@/components/types";
import type { CoordinateFormatType } from "@/composables/geoShowLocation";
import RadioGroupList from "@/components/RadioGroupList.vue";
import { useUiStore } from "@/stores/uiStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import { type MeasurementUnit } from "@/composables/geoMeasurement";
import NumberInputGroup from "@/components/NumberInputGroup.vue";
import SimpleDivider from "@/components/SimpleDivider.vue";
import PanelSubHeading from "@/components/PanelSubHeading.vue";

const settings = useMapSettingsStore();
const measurementStore = useMeasurementsStore();
const uiSettings = useUiStore();

const coordinateFormatItems: RadioGroupItemData<CoordinateFormatType>[] = [
  { name: "DG", description: "Decimal degrees", value: "DecimalDegrees" },
  { name: "DMS", description: "Degree Minutes Seconds", value: "DegreeMinuteSeconds" },
  { name: "MGRS", description: "Military grid reference system", value: "MGRS" },
];

const measurementItems: RadioGroupItemData<MeasurementUnit>[] = [
  { name: "Metric", value: "metric" },
  { name: "Imperial", value: "imperial" },
  { name: "Nautical", value: "nautical" },
];
</script>

<template>
  <div class="space-y-5 p-1">
    <ToggleField v-model="uiSettings.showToolbar">Show toolbar</ToggleField>
    <ToggleField v-model="uiSettings.showTimeline">Show timeline</ToggleField>
    <ToggleField v-model="uiSettings.showOrbatBreadcrumbs"
      >Show ORBAT breadcrumbs</ToggleField
    >
    <ToggleField v-model="settings.showScaleLine">Show scale line</ToggleField>
    <ToggleField v-model="settings.showLocation"
      >Show location of mouse cursor
    </ToggleField>
    <SimpleDivider class="mt-8" />
    <PanelSubHeading>Map unit symbol settings</PanelSubHeading>
    <NumberInputGroup label="Map symbol size" v-model="settings.mapIconSize" />
    <ToggleField v-model="settings.mapUnitLabelBelow"
      >Show map unit labels below icons
    </ToggleField>
    <template v-if="settings.mapUnitLabelBelow">
      <NumberInputGroup
        label="Unit label font size(px)"
        v-model="settings.mapLabelSize"
      />
      <ToggleField v-model="settings.mapWrapUnitLabels"
        >Wrap long unit labels
      </ToggleField>
      <NumberInputGroup label="Label wrap width" v-model="settings.mapWrapLabelWidth" />
    </template>

    <SimpleDivider class="mt-8" />
    <section>
      <p class="text-base leading-loose font-medium">Coordinate format</p>
      <RadioGroupList
        v-model="settings.coordinateFormat"
        :items="coordinateFormatItems"
      />
    </section>

    <section>
      <p class="text-base leading-loose font-medium">Measurement unit</p>
      <RadioGroupList
        v-model="measurementStore.measurementUnit"
        :items="measurementItems"
      />
    </section>
  </div>
</template>
