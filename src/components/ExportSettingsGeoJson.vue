<script setup lang="ts">
import type { ExportFormat, GeoJsonSettings } from "@/types/importExport.ts";
import InputCheckbox from "@/components/InputCheckbox.vue";

interface Props {
  format: ExportFormat;
}

const props = defineProps<Props>();
const settings = defineModel<GeoJsonSettings>({ required: true });
</script>

<template>
  <fieldset class="space-y-4">
    <InputCheckbox
      label="Include units"
      description="Units with a location at current scenario time"
      v-model="settings.includeUnits"
    />
    <InputCheckbox
      label="Include scenario features"
      v-model="settings.includeFeatures"
      description=""
    />

    <InputCheckbox v-model="settings.includeId" label="Include ID" /><InputCheckbox
      v-model="settings.includeIdInProperties"
      label="Include ID in properties"
    />
  </fieldset>
</template>
