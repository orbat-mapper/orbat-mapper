<script setup lang="ts">
import { computed, useId } from "vue";
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from "reka-ui";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTerrainStore } from "@/stores/terrainStore";
import {
  TERRAIN_EXAGGERATION_MIN,
  TERRAIN_EXAGGERATION_MAX,
  TERRAIN_EXAGGERATION_STEP,
} from "./mapTerrain";

const settings = useTerrainStore();
const id = useId();
const sliders = computed(
  () =>
    [
      {
        key: "exaggeration",
        label: "Terrain exaggeration",
        value: settings.exaggeration,
        min: TERRAIN_EXAGGERATION_MIN,
        max: TERRAIN_EXAGGERATION_MAX,
        step: TERRAIN_EXAGGERATION_STEP,
        display: `${settings.exaggeration}×`,
        visible: settings.terrainEnabled,
        description: "1× is natural elevation. Tilt the map to see the relief.",
      },
      {
        key: "strength",
        label: "Hillshade strength",
        value: settings.hillshadeSettings.strength,
        min: 0,
        max: 1,
        step: 0.05,
        display: `${Math.round(settings.hillshadeSettings.strength * 100)}%`,
        visible: settings.hillshadeEnabled,
        description: "",
      },
      {
        key: "direction",
        label: "Light direction",
        value: settings.hillshadeSettings.direction,
        min: 0,
        max: 359,
        step: 1,
        display: `${settings.hillshadeSettings.direction}°`,
        visible: settings.hillshadeEnabled,
        description: "0° north · 90° east · 180° south · 270° west",
      },
    ] as const,
);
const colors = [
  { key: "shadowColor", label: "Shadow color" },
  { key: "highlightColor", label: "Highlight color" },
  { key: "accentColor", label: "Accent color" },
] as const;
function updateSlider(key: "exaggeration" | "strength" | "direction", values?: number[]) {
  const value = values?.[0];
  if (value === undefined) return;
  if (key === "exaggeration") settings.setExaggeration(value);
  else settings.hillshadeSettings[key] = value;
}
</script>

<template>
  <section aria-label="Terrain and hillshading" class="rounded-md border p-3">
    <FieldGroup class="gap-4">
      <Field orientation="horizontal">
        <FieldLabel :for="`${id}-terrain`">3D terrain</FieldLabel>
        <Switch :id="`${id}-terrain`" v-model="settings.terrainEnabled" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel :for="`${id}-hillshade`">Hillshading</FieldLabel>
        <Switch :id="`${id}-hillshade`" v-model="settings.hillshadeEnabled" />
      </Field>
      <FieldDescription
        >Elevation data from Mapterhorn requires a network connection.</FieldDescription
      >
      <FieldDescription
        v-if="
          (settings.terrainEnabled && settings.terrainError) ||
          (settings.hillshadeEnabled && settings.hillshadeError)
        "
        role="status"
        >Elevation data is unavailable. Check your connection or try toggling the feature
        off and on.</FieldDescription
      >
      <template v-for="slider in sliders" :key="slider.key">
        <Field v-if="slider.visible">
          <FieldLabel :id="`${id}-${slider.key}`"
            >{{ slider.label }}: {{ slider.display }}</FieldLabel
          >
          <!-- The installed Slider wrapper cannot label its thumb; compose Reka here. -->
          <SliderRoot
            class="relative flex w-full touch-none items-center select-none"
            :model-value="[slider.value]"
            :min="slider.min"
            :max="slider.max"
            :step="slider.step"
            @update:model-value="updateSlider(slider.key, $event)"
          >
            <SliderTrack
              class="bg-muted relative h-1.5 grow overflow-hidden rounded-full"
            >
              <SliderRange class="bg-primary absolute h-full" />
            </SliderTrack>
            <SliderThumb
              :aria-labelledby="`${id}-${slider.key}`"
              class="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm focus-visible:ring-4 focus-visible:outline-hidden"
            />
          </SliderRoot>
          <FieldDescription v-if="slider.description">{{
            slider.description
          }}</FieldDescription>
        </Field>
      </template>
      <template v-if="settings.hillshadeEnabled">
        <Field>
          <FieldLabel :id="`${id}-anchor`">Light anchored to</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            :aria-labelledby="`${id}-anchor`"
            :model-value="settings.hillshadeSettings.anchor"
            @update:model-value="
              (value) => {
                if (value === 'map' || value === 'viewport')
                  settings.hillshadeSettings.anchor = value;
              }
            "
          >
            <ToggleGroupItem value="map">Map</ToggleGroupItem>
            <ToggleGroupItem value="viewport">Viewport</ToggleGroupItem>
          </ToggleGroup>
        </Field>
        <Field v-for="color in colors" :key="color.key" orientation="horizontal">
          <FieldLabel :for="`${id}-${color.key}`">{{ color.label }}</FieldLabel>
          <Input
            :id="`${id}-${color.key}`"
            v-model="settings.hillshadeSettings[color.key]"
            type="color"
            class="w-16"
          />
        </Field>
        <Button variant="outline" size="sm" @click="settings.resetHillshade"
          >Reset hillshade</Button
        >
      </template>
    </FieldGroup>
  </section>
</template>
