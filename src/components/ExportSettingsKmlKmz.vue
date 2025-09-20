<script setup lang="ts">
import { computed } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { ExportFormat, ExportSettings, KmlKmzExportSettings } from "@/types/convert";

const props = defineProps<{
  format: ExportFormat;
  modelValue: ExportSettings;
}>();
const form = defineModel<KmlKmzExportSettings>({ required: true });

const isKml = computed(() => props.format === "kml");
const isKmz = computed(() => props.format === "kmz");
</script>

<template>
  <fieldset class="space-y-4">
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
  </fieldset>
</template>
