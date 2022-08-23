<template>
  <SimpleModal v-model="open" dialog-title="Export scenario" @cancel="emit('cancel')">
    <form @submit.prevent="onExport" class="mt-4 space-y-6">
      <SimpleSelect
        label="Select export format"
        :items="formatItems"
        v-model="form.format"
      />
      <div class="text-sm text-gray-700">
        <p v-if="isKml">
          KML is a file format used to display data in an Earth browser such as Google
          Earth. Use KMZ if you want to include unit icons.
        </p>
        <p v-else-if="isKmz">
          KMZ is a compressed version of KML. Use this format if you want to include unit
          icons.
        </p>
      </div>
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
          v-if="isKmz"
          label="Include unit icons"
          v-model="form.embedIcons"
          description="Embed icons as images"
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
import { computed, ref } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { ExportFormat, ExportSettings } from "@/types/convert";
import { useScenarioExport } from "@/composables/scenarioExport";
import { useNotifications } from "@/composables/notifications";
import NProgress from "nprogress";

const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue", "cancel"]);

const { downloadAsGeoJSON, downloadAsKML, downloadAsKMZ } = useScenarioExport();

const formatItems: SelectItem<ExportFormat>[] = [
  { label: "GeoJSON", value: "geojson" },
  { label: "KML", value: "kml" },
  { label: "KMZ", value: "kmz" },
];

interface Form extends ExportSettings {
  format: ExportFormat;
}

const form = ref<Form>({
  format: "kmz",
  includeFeatures: false,
  includeUnits: true,
  fileName: "scenario.geojson",
  embedIcons: true,
});

const { focusId } = useFocusOnMount(undefined, 150);
const { send } = useNotifications();
const open = useVModel(props, "modelValue");
const onCancel = () => (open.value = false);
const isGeojson = computed(() => form.value.format === "geojson");
const isKml = computed(() => form.value.format === "kml");
const isKmz = computed(() => form.value.format === "kmz");

async function onExport(e: Event) {
  const { format } = form.value;
  NProgress.start();
  if (format === "geojson") {
    await downloadAsGeoJSON(form.value);
  } else if (format === "kml") {
    await downloadAsKML(form.value);
  } else if (format === "kmz") {
    await downloadAsKMZ(form.value);
  }
  NProgress.done();
  open.value = false;
  send({ message: `Exported scenario as ${format}` });
}
</script>