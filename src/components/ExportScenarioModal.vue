<template>
  <SimpleModal v-model="open" dialog-title="Export scenario" @cancel="onCancel">
    <p class="mt-1 text-sm text-gray-500">
      Export scenario data for use with other software applications and tools
    </p>
    <form @submit.prevent="onExport" class="mt-4 space-y-6">
      <SimpleSelect
        label="Select export format"
        :items="formatItems"
        v-model="form.format"
      >
        <template #hint>
          <DocLink href="https://docs.orbat-mapper.app/guide/export-data" />
        </template>
      </SimpleSelect>
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
      <ExportSettingsXlsx v-if="format === 'xlsx'" :format="format" v-model="form" />
      <ExportSettingsSpatialIllusions
        v-else-if="format === 'unitgenerator'"
        :format="format"
        v-model="form"
      />
      <ExportSettingsOrbatMapper v-else-if="format === 'orbatmapper'" v-model="form" />
      <ExportSettingsGeoJson
        v-else-if="format === 'geojson'"
        :format="format"
        v-model="form"
      />
      <template v-else>
        <fieldset class="space-y-4">
          <InputCheckbox
            label="Include units"
            description="Units with a location at current scenario time"
            v-model="form.includeUnits"
          />
          <InputCheckbox
            v-if="!isMilx"
            label="Include scenario features"
            v-model="form.includeFeatures"
            description=""
          />
          <InputCheckbox
            v-if="isKml || isKmz"
            label="Use short unit names"
            v-model="form.useShortName"
          />
          <InputCheckbox
            v-if="isKml || isKmz || isMilx"
            :label="isMilx ? 'Use one layer per side' : 'Use one folder per side'"
            v-model="form.oneFolderPerSide"
          />
          <InputCheckbox
            v-if="isKmz"
            label="Include unit icons"
            v-model="form.embedIcons"
            description="Embed icons as images"
          />
        </fieldset>
      </template>

      <p v-if="isKmz || isKml" class="text-sm text-gray-700">
        Please note that the export functionality is experimental. Scenario feature export
        is currently limited to geometries (no styles).
      </p>

      <p v-if="isMilx" class="text-sm text-gray-700">
        Please note that the MilX export is experimental. It is currently limited and has
        several bugs.
      </p>

      <footer class="flex items-center justify-between space-x-2">
        <ToggleField v-model="store.keepOpen">Keep dialog open on export</ToggleField>
        <div class="flex items-center space-x-2">
          <BaseButton type="submit" primary small>Export</BaseButton>
          <BaseButton small @click="onCancel">Cancel</BaseButton>
        </div>
      </footer>
    </form>
  </SimpleModal>
</template>

<script setup lang="ts">
import { useFocusOnMount } from "@/components/helpers";

import BaseButton from "@/components/BaseButton.vue";
import SimpleModal from "./SimpleModal.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { SelectItem } from "@/components/types";
import { computed, ref } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { ExportFormat, ExportSettings } from "@/types/convert";
import { useScenarioExport } from "@/composables/scenarioExport";
import { useNotifications } from "@/composables/notifications";
import NProgress from "nprogress";
import { useVModel } from "@vueuse/core";
import ExportSettingsXlsx from "@/components/ExportSettingsXlsx.vue";
import ExportSettingsSpatialIllusions from "@/components/ExportSettingsSpatialIllusions.vue";
import ExportSettingsGeoJson from "@/components/ExportSettingsGeoJson.vue";
import DocLink from "@/components/DocLink.vue";
import ExportSettingsOrbatMapper from "@/components/ExportSettingsOrbatMapper.vue";

import ToggleField from "@/components/ToggleField.vue";
import { useExportStore } from "@/stores/importExportStore";

const props = withDefaults(defineProps<{ modelValue: boolean }>(), { modelValue: false });
const emit = defineEmits(["update:modelValue", "cancel"]);
const {
  downloadAsGeoJSON,
  downloadAsKML,
  downloadAsKMZ,
  downloadAsXlsx,
  downloadAsMilx,
  downloadAsSpatialIllusions,
  downloadAsOrbatMapper,
} = useScenarioExport();
const open = useVModel(props, "modelValue", emit);
const store = useExportStore();
const formatItems: SelectItem<ExportFormat>[] = [
  { label: "ORBAT Mapper", value: "orbatmapper" },
  { label: "GeoJSON", value: "geojson" },
  { label: "KML", value: "kml" },
  { label: "KMZ", value: "kmz" },
  { label: "XLSX", value: "xlsx" },
  { label: "MilX", value: "milx" },
  { label: "Spatial Illusions ORBAT builder", value: "unitgenerator" },
];

interface Form extends ExportSettings {
  format: ExportFormat;
}

const form = ref<Form>({
  format: store.currentFormat ?? "orbatmapper",
  includeFeatures: false,
  includeUnits: true,
  sides: [],
  fileName: "scenario.geojson",
  embedIcons: true,
  useShortName: true,
  oneSheetPerSide: true,
  columns: [],
  oneFolderPerSide: true,
  customColors: true,
  rootUnit: "",
  maxLevels: 3,
  includeIdInProperties: false,
  includeId: true,
});

const { focusId } = useFocusOnMount(undefined, 150);
const { send } = useNotifications();

const format = computed(() => form.value.format);
const isGeojson = computed(() => form.value.format === "geojson");
const isKml = computed(() => form.value.format === "kml");
const isKmz = computed(() => form.value.format === "kmz");
const isMilx = computed(() => form.value.format === "milx");

async function onExport(e: Event) {
  const { format } = form.value;
  NProgress.start();
  if (format === "geojson") {
    await downloadAsGeoJSON(form.value);
  } else if (format === "kml") {
    await downloadAsKML(form.value);
  } else if (format === "kmz") {
    await downloadAsKMZ(form.value);
  } else if (format === "xlsx") {
    await downloadAsXlsx(form.value);
  } else if (format === "milx") {
    await downloadAsMilx(form.value);
  } else if (format === "unitgenerator") {
    await downloadAsSpatialIllusions(form.value);
  } else if (format === "orbatmapper") {
    downloadAsOrbatMapper(form.value);
  }
  NProgress.done();
  if (!store.keepOpen) open.value = false;
  store.currentFormat = format;
  send({ message: `Exported scenario as ${format}` });
}

function onCancel() {
  open.value = false;
  store.currentFormat = format.value;
  emit("cancel");
}
</script>
