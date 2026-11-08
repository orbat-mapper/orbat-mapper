<script setup lang="ts">
import { Field, FieldLabel } from "@/components/ui/field";
import { toggleChoiceClass } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ATLAS_LABEL_CATEGORIES,
  ATLAS_LAYER_GROUPS,
  ELEVATION_BAND_PRESETS,
  canDrawLabelCategory,
  isElevationBandPreset,
} from "@/geo/atlasStyle";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";

const GROUP_PROPS = {
  variant: "outline",
  size: "sm",
  spacing: 1,
  class: "flex-wrap",
} as const;

const mapSettings = useMapSettingsStore();

function formatMeters(value: number) {
  return `${value.toLocaleString("en-US")} m`;
}

function onElevationBands(value: unknown) {
  // A single toggle group emits nothing selected when the pressed item is clicked again.
  if (isElevationBandPreset(value)) mapSettings.atlasElevationBands = value;
}

function onLayerGroups(value: unknown) {
  if (Array.isArray(value)) mapSettings.setAtlasLayerGroups(value);
}
</script>

<template>
  <div class="flex flex-col gap-3" data-test="atlas-options">
    <Field>
      <FieldLabel id="atlas-elevation-bands-label">Elevation bands</FieldLabel>
      <ToggleGroup
        type="single"
        v-bind="GROUP_PROPS"
        aria-labelledby="atlas-elevation-bands-label"
        data-test="atlas-elevation-bands"
        :model-value="mapSettings.atlasElevationBands"
        @update:model-value="onElevationBands"
      >
        <ToggleGroupItem
          v-for="preset in ELEVATION_BAND_PRESETS"
          :class="toggleChoiceClass"
          :key="preset.value"
          :value="preset.value"
          :title="`Tints above ${preset.thresholds.map(formatMeters).join(', ')}`"
        >
          {{ preset.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
    <Field>
      <FieldLabel id="atlas-layer-groups-label">Show</FieldLabel>
      <ToggleGroup
        type="multiple"
        v-bind="GROUP_PROPS"
        aria-labelledby="atlas-layer-groups-label"
        data-test="atlas-layer-groups"
        :model-value="mapSettings.atlasLayerGroups"
        @update:model-value="onLayerGroups"
      >
        <ToggleGroupItem
          v-for="group in ATLAS_LAYER_GROUPS"
          :class="toggleChoiceClass"
          :key="group.value"
          :value="group.value"
        >
          {{ group.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
    <Field :data-disabled="!mapSettings.atlasLayerGroups.includes('labels')">
      <FieldLabel id="atlas-label-categories-label">Label types</FieldLabel>
      <ToggleGroup
        type="multiple"
        v-bind="GROUP_PROPS"
        aria-labelledby="atlas-label-categories-label"
        data-test="atlas-label-categories"
        :model-value="mapSettings.atlasLayerGroups"
        @update:model-value="onLayerGroups"
      >
        <ToggleGroupItem
          v-for="category in ATLAS_LABEL_CATEGORIES"
          :class="toggleChoiceClass"
          :key="category.value"
          :value="category.value"
          :disabled="!canDrawLabelCategory(category.value, mapSettings.atlasLayerGroups)"
        >
          {{ category.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  </div>
</template>
