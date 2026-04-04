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
import type { UnitClusterGroupingMode, UnitClusteringMode } from "@/types/mapSettings";

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

const unitClusteringItems: RadioGroupItemData<UnitClusteringMode>[] = [
  { name: "Off", description: "Always show every unit", value: "off" },
  { name: "Naive", description: "Cluster by distance only", value: "naive" },
  {
    name: "Hierarchy aware",
    description: "Cluster nearby siblings within the current hierarchy",
    value: "hierarchy",
  },
];

const unitClusterGroupingItems: RadioGroupItemData<UnitClusterGroupingMode>[] = [
  {
    name: "Strict",
    description: "Only cluster within the same side and domain",
    value: "strict",
  },
  {
    name: "Summary",
    description: "Allow broader clusters and show side/domain composition",
    value: "summary",
  },
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
    <ToggleField v-model="settings.showFeatureTooltip"
      >Show scenario feature tooltip
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
    <section>
      <p class="text-base leading-loose font-medium">Unit clustering</p>
      <RadioGroupList
        v-model="settings.unitClusteringMode"
        :items="unitClusteringItems"
      />
      <template v-if="settings.unitClusteringMode !== 'off'">
        <div class="mt-3 space-y-3">
          <NumberInputGroup
            label="Cluster distance (px)"
            v-model="settings.unitClusteringDistancePx"
            :min="8"
            :max="200"
          />
          <NumberInputGroup
            label="Minimum cluster size"
            v-model="settings.unitClusteringMinSize"
            :min="2"
            :max="99"
          />
          <NumberInputGroup
            label="Disable clustering above zoom"
            v-model="settings.unitClusteringMaxZoom"
            :min="0"
            :max="24"
          />
          <div>
            <p class="mb-1 text-sm leading-loose font-medium">Cluster grouping</p>
            <RadioGroupList
              v-model="settings.unitClusterGroupingMode"
              :items="unitClusterGroupingItems"
            />
          </div>
          <NumberInputGroup
            v-if="settings.unitClusteringMode === 'hierarchy'"
            label="Hierarchy minimum depth"
            v-model="settings.unitClusteringHierarchyMinDepth"
            :min="0"
            :max="12"
          />
        </div>
      </template>
    </section>

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
