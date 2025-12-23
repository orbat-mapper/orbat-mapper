<script setup lang="ts">
import type { ExportFormat, GeoJsonSettings } from "@/types/importExport.ts";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { useVModel } from "@vueuse/core";
import { type Ref } from "vue";

interface Props {
  modelValue: GeoJsonSettings;
  format: ExportFormat;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
// Adding a typecast here because PyCharm does not infer the correct type automatically
const settings = useVModel(props, "modelValue", emit) as Ref<GeoJsonSettings>;
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
