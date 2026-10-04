<script setup lang="ts">
import { nextTick, onMounted, useId, useTemplateRef } from "vue";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { menuControlKeys } from "@/components/menuControlKeys";
import { useTerrainStore } from "@/stores/terrainStore";
import LabelledSlider from "./LabelledSlider.vue";

const SLIDERS = [
  {
    key: "strength",
    label: "Strength",
    max: 1,
    step: 0.05,
    display: (value: number) => `${Math.round(value * 100)}%`,
    description: "",
  },
  {
    key: "direction",
    label: "Light direction",
    max: 359,
    step: 1,
    display: (value: number) => `${value}°`,
    description: "0° north · 90° east · 180° south · 270° west",
  },
] as const;
const COLORS = [
  { key: "shadowColor", label: "Shadow color" },
  { key: "highlightColor", label: "Highlight color" },
  { key: "accentColor", label: "Accent color" },
] as const;

const settings = useTerrainStore();
const id = useId();
const panel = useTemplateRef<HTMLElement>("panel");
onMounted(async () => {
  await nextTick();
  // Keyboard-opened submenus focus their container; move into the first control.
  if (document.activeElement === panel.value?.closest("[role=menu]"))
    panel.value?.querySelector<HTMLElement>("[role=slider]")?.focus();
});

// Several controls in one panel, so Tab stays inside to move between them.
const keepControlKeys = menuControlKeys();
</script>

<template>
  <div ref="panel">
    <FieldGroup class="w-64 gap-4 p-3" @keydown="keepControlKeys">
      <Field v-for="slider in SLIDERS" :key="slider.key">
        <FieldLabel :id="`${id}-${slider.key}`"
          >{{ slider.label }}:
          {{ slider.display(settings.hillshadeSettings[slider.key]) }}</FieldLabel
        >
        <LabelledSlider
          v-model="settings.hillshadeSettings[slider.key]"
          :labelledby="`${id}-${slider.key}`"
          :min="0"
          :max="slider.max"
          :step="slider.step"
        />
        <FieldDescription v-if="slider.description">{{
          slider.description
        }}</FieldDescription>
      </Field>
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
      <Field v-for="color in COLORS" :key="color.key" orientation="horizontal">
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
    </FieldGroup>
  </div>
</template>
