<script setup lang="ts">
import { useId } from "vue";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { menuControlKeys } from "@/components/menuControlKeys";
import { useTerrainStore } from "@/stores/terrainStore";
import {
  TERRAIN_EXAGGERATION_MIN,
  TERRAIN_EXAGGERATION_MAX,
  TERRAIN_EXAGGERATION_STEP,
} from "./mapTerrain";
import LabelledSlider from "./LabelledSlider.vue";

const settings = useTerrainStore();
const id = useId();
// One control, so Tab moves on to the rest of the menu.
const keepSliderKeys = menuControlKeys("Tab");
</script>

<template>
  <FieldGroup v-if="settings.terrainEnabled" class="w-56 px-2 py-3">
    <Field>
      <FieldLabel :id="id">Terrain exaggeration: {{ settings.exaggeration }}×</FieldLabel>
      <LabelledSlider
        :model-value="settings.exaggeration"
        :labelledby="id"
        :min="TERRAIN_EXAGGERATION_MIN"
        :max="TERRAIN_EXAGGERATION_MAX"
        :step="TERRAIN_EXAGGERATION_STEP"
        @update:model-value="settings.setExaggeration"
        @keydown="keepSliderKeys"
      />
      <FieldDescription
        >1× is natural elevation. Tilt the map to see the relief.</FieldDescription
      >
    </Field>
  </FieldGroup>
</template>
