<script setup lang="ts">
import { computed } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { ExportFormat, ExportSettings, KmlKmzExportSettings } from "@/types/convert";
import { Slider } from "@/components/ui/slider";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import AccordionPanel from "@/components/AccordionPanel.vue";

const props = defineProps<{
  format: ExportFormat;
  modelValue: ExportSettings;
}>();
const form = defineModel<KmlKmzExportSettings>({ required: true });

const isKml = computed(() => props.format === "kml");
const isKmz = computed(() => props.format === "kmz");

const iconScale = computed({
  get: () => [form.value.iconScale ?? 1],
  set: ([value]: number[]) => {
    form.value.iconScale = value;
  },
});

const labelScale = computed({
  get: () => [form.value.labelScale ?? 1],
  set: ([value]: number[]) => {
    form.value.labelScale = value;
  },
});
</script>

<template>
  <fieldset class="space-y-4">
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <InputCheckbox
        label="Include units"
        description="Units with a location at current scenario time"
        v-model="form.includeUnits"
      />
      <InputCheckbox
        label="Include scenario features"
        v-model="form.includeFeatures"
        description=""
      />
      <InputCheckbox
        label="Use short unit names"
        v-if="isKml || isKmz"
        v-model="form.useShortName"
      />
      <InputCheckbox :label="'Use one folder per side'" v-model="form.oneFolderPerSide" />
      <InputCheckbox
        v-if="isKmz"
        label="Include unit icons"
        v-model="form.embedIcons"
        description="Embed icons as images"
      />
    </div>
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <InputGroupTemplate label="Label scale">
        <Slider v-model="labelScale" :min="0" :max="2" :step="0.1" class="mt-4" />
        <template #description>{{ form.labelScale }}</template>
        <template #hint
          ><span class="text-sm font-medium">{{ form.labelScale }}x</span></template
        >
      </InputGroupTemplate>
      <InputGroupTemplate label="Icon scale">
        <Slider v-model="iconScale" :min="0.5" :max="2" :step="0.1" class="mt-4" />
        <template #description>{{ form.iconScale }}</template>
        <template #hint
          ><span class="text-sm font-medium">{{ form.iconScale }}x</span></template
        >
      </InputGroupTemplate>
    </div>
    <AccordionPanel label="Advanced settings" v-if="isKmz">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <InputCheckbox label="Draw symbol outline" v-model="form.drawSymbolOutline" />
      </div>
    </AccordionPanel>
  </fieldset>
</template>
