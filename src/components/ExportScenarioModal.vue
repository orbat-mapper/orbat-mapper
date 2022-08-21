<template>
  <SimpleModal v-model="open" dialog-title="Export scenario" @cancel="emit('cancel')">
    <form @submit.prevent="onExport" class="mt-4 space-y-6">
      <SimpleSelect
        label="Select export format"
        :items="formatItems"
        v-model="form.format"
      />
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
      </fieldset>

      <footer class="flex items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Export</BaseButton>
        <BaseButton small @click="onCancel">Cancel</BaseButton>
      </footer>
    </form>
  </SimpleModal>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useFocusOnMount } from "@/components/helpers";

import BaseButton from "@/components/BaseButton.vue";
import SimpleModal from "./SimpleModal.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { SelectItem } from "@/components/types";
import { ref } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { ExportFormat, ExportSettings } from "@/types/convert";
import { useScenarioExport } from "@/composables/scenarioExport";
import { useNotifications } from "@/composables/notifications";

const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue", "cancel"]);

const { downloadAsGeoJSON, downloadAsKML } = useScenarioExport();

const formatItems: SelectItem<ExportFormat>[] = [
  { label: "GeoJSON", value: "geojson" },
  { label: "KML", value: "kml" },
];

interface Form extends ExportSettings {
  format: ExportFormat;
}

const form = ref<Form>({
  format: "geojson",
  includeFeatures: true,
  includeUnits: true,
  fileName: "scenario.geojson",
});

const { focusId } = useFocusOnMount(undefined, 150);
const { send } = useNotifications();
const open = useVModel(props, "modelValue");
const onCancel = () => (open.value = false);

async function onExport(e: Event) {
  const { format } = form.value;
  if (format === "geojson") {
    await downloadAsGeoJSON(form.value);
  } else if (format === "kml") {
    await downloadAsKML(form.value);
  }
  open.value = false;
  send({ message: `Exported scenario as ${format}` });
}
</script>
