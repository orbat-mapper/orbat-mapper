<script setup lang="ts">
import SimpleSelect from "@/components/SimpleSelect.vue";
import { type SelectItem } from "@/components/types";
import { computed } from "vue";
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { ExportFormat, ExportSettings } from "@/types/importExport.ts";
import { useScenarioExport } from "@/importexport/export/scenarioExport.ts";
import { useNotifications } from "@/composables/notifications";
import NProgress from "nprogress";
import { useLocalStorage } from "@vueuse/core";
import ExportSettingsXlsx from "@/components/ExportSettingsXlsx.vue";
import ExportSettingsCsv from "@/components/ExportSettingsCsv.vue";
import ExportSettingsSpatialIllusions from "@/components/ExportSettingsSpatialIllusions.vue";
import ExportSettingsGeoJson from "@/components/ExportSettingsGeoJson.vue";
import ExportSettingsOrbatMapper from "@/components/ExportSettingsOrbatMapper.vue";
import ExportSettingsKmlKmz from "@/components/ExportSettingsKmlKmz.vue";
import ToggleField from "@/components/ToggleField.vue";
import { useExportStore } from "@/stores/importExportStore";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NewSimpleModal from "@/components/NewSimpleModal.vue";
import { ClipboardCopyIcon, CheckIcon } from "@lucide/vue";
import { useClipboard } from "@vueuse/core";
import { ref } from "vue";
import ImportStepLayout from "@/components/ImportStepLayout.vue";

const open = defineModel<boolean>({ default: false });
const emit = defineEmits(["cancel"]);
const {
  downloadAsGeoJSON,
  downloadAsKML,
  downloadAsKMZ,
  downloadAsXlsx,
  downloadAsCsv,
  downloadAsMilx,
  downloadAsSpatialIllusions,
  downloadAsOrbatMapper,
  generateGeoJSON,
  generateKml,
  generateCsv,
  generateMilx,
  generateSpatialIllusions,
  generateOrbatMapper,
} = useScenarioExport();
const store = useExportStore();
const formatItems: (SelectItem<ExportFormat> & { description: string })[] = [
  {
    label: "ORBAT Mapper",
    value: "orbatmapper",
    description: "Native scenario data",
  },
  { label: "GeoJSON", value: "geojson", description: "Geographic JSON data" },
  { label: "KML", value: "kml", description: "Data for Google Earth" },
  { label: "KMZ", value: "kmz", description: "Compressed KML with unit icons" },
  { label: "XLSX", value: "xlsx", description: "Spreadsheet workbook" },
  { label: "CSV/TSV", value: "csv", description: "Delimited tabular data" },
  { label: "MilX", value: "milx", description: "MilX layers" },
  {
    label: "Spatial Illusions ORBAT builder",
    value: "unitgenerator",
    description: "Unit hierarchy data",
  },
];

interface Form extends ExportSettings {
  format: ExportFormat;
}

const form = useLocalStorage(
  "exportSettings",
  {
    format: store.currentFormat ?? "orbatmapper",
    includeFeatures: false,
    includeUnits: true,
    includeSelectedUnitsOnly: false,
    sideGroups: [],
    fileName: "scenario.json",
    embedIcons: true,
    useShortName: true,
    oneSheetPerSide: true,
    columns: [],
    locationFormat: "json",
    separator: ",",
    oneFolderPerSide: true,
    folderMode: "side",
    customColors: true,
    rootUnit: "",
    maxLevels: 3,
    includeIdInProperties: false,
    includeId: true,
    iconScale: 1.5,
    labelScale: 1,
    drawSymbolOutline: true,
    outlineColor: "rgba(255,255,255,0.8)",
    outlineWidth: 8,
    renderAmplifiers: false,
    renderCustomIconLabels: false,
    controlMeasureLabelMode: "native",
    timeMode: "current",
    exportEventId: "",
    exportEventIds: [],
    useRadioFolder: true,
  } as Form,
  { writeDefaults: true },
);

const { send } = useNotifications();
const { copy } = useClipboard();
const justCopied = ref(false);

const format = computed(() => form.value.format);
const canCopyToClipboard = computed(() => !["xlsx", "kmz"].includes(form.value.format));
const isKml = computed(() => form.value.format === "kml");
const isKmz = computed(() => form.value.format === "kmz");
const isMilx = computed(() => form.value.format === "milx");

async function onExport() {
  const { format } = form.value;
  let kmzWarnings: string[] = [];
  NProgress.start();
  if (format === "geojson") {
    await downloadAsGeoJSON(form.value);
  } else if (format === "kml") {
    await downloadAsKML(form.value);
  } else if (format === "kmz") {
    const result = await downloadAsKMZ(form.value);
    kmzWarnings = result?.warnings ?? [];
  } else if (format === "xlsx") {
    await downloadAsXlsx(form.value);
  } else if (format === "csv") {
    await downloadAsCsv(form.value);
  } else if (format === "milx") {
    await downloadAsMilx(form.value);
  } else if (format === "unitgenerator") {
    await downloadAsSpatialIllusions(form.value);
  } else if (format === "orbatmapper") {
    await downloadAsOrbatMapper(form.value);
  }
  NProgress.done();
  if (!store.keepOpen) open.value = false;
  store.currentFormat = format;
  send({ message: `Exported scenario as ${format}` });
  if (kmzWarnings.length) {
    const warningExamples = kmzWarnings.slice(0, 2).join(" ");
    const andMore = kmzWarnings.length > 2 ? ` (+${kmzWarnings.length - 2} more)` : "";
    send({
      type: "warning",
      title: "Export used compatibility fallbacks",
      message: `${warningExamples}${andMore}`,
      duration: 10000,
    });
  }
}

async function onCopyToClipboard() {
  const { format } = form.value;
  let data: string | undefined;
  NProgress.start();
  if (format === "geojson") {
    data = generateGeoJSON(form.value);
  } else if (format === "kml") {
    data = await generateKml(form.value);
  } else if (format === "csv") {
    data = await generateCsv(form.value);
  } else if (format === "milx") {
    data = await generateMilx(form.value);
  } else if (format === "unitgenerator") {
    data = generateSpatialIllusions(form.value);
  } else if (format === "orbatmapper") {
    data = generateOrbatMapper(form.value);
  }
  NProgress.done();
  if (data) {
    await copy(data);
    justCopied.value = true;
    setTimeout(() => (justCopied.value = false), 2000);
    send({ message: "Copied to clipboard" });
  }
}

function onCancel() {
  open.value = false;
  store.currentFormat = format.value;
  emit("cancel");
}
</script>

<template>
  <NewSimpleModal
    v-model="open"
    fixed-height
    @cancel="onCancel"
    class="grid h-[90vh] grid-rows-[auto_1fr] sm:max-w-xl md:max-w-4xl lg:max-w-[95vw]"
  >
    <div class="-mx-6 flex h-full flex-col overflow-hidden px-0">
      <DialogTitle class="sr-only">Export scenario</DialogTitle>
      <DialogDescription class="sr-only">
        Export scenario data for use with other software applications and tools
      </DialogDescription>
      <form class="min-h-0 flex-1 overflow-hidden" @submit.prevent="onExport">
        <ImportStepLayout
          title="Export scenario"
          subtitle="Export scenario data for use with other software applications and tools"
          help-url="https://docs.orbat-mapper.app/guide/export-data"
          has-sidebar
        >
          <template #actions>
            <Button variant="outline" type="button" size="sm" @click="onCancel">
              Cancel
            </Button>
            <Button
              v-if="canCopyToClipboard"
              variant="outline"
              type="button"
              size="sm"
              @click="onCopyToClipboard"
            >
              <component
                :is="justCopied ? CheckIcon : ClipboardCopyIcon"
                class="mr-1 h-4 w-4"
              />
              {{ justCopied ? "Copied!" : "Copy" }}
            </Button>
            <Button type="submit" size="sm">Export</Button>
          </template>

          <template #sidebar>
            <SimpleSelect
              class="lg:hidden"
              label="Export format"
              :items="formatItems"
              v-model="form.format"
            />

            <FieldSet class="hidden lg:block">
              <FieldLabel>Export Format</FieldLabel>
              <FieldDescription
                >Select the format for your exported data</FieldDescription
              >
              <RadioGroup v-model="form.format" class="mt-3 flex flex-col gap-2">
                <FieldLabel
                  v-for="item in formatItems"
                  :key="item.value"
                  :for="`export-format-${item.value}`"
                >
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{{ item.label }}</FieldTitle>
                      <FieldDescription>{{ item.description }}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      :id="`export-format-${item.value}`"
                      :value="item.value"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </FieldSet>

            <div class="text-muted-foreground text-sm lg:hidden">
              <p v-if="isKml">
                KML displays geographic data in applications such as Google Earth. Use KMZ
                if you want to include unit icons.
              </p>
              <p v-else-if="isKmz">
                KMZ is a compressed version of KML that can include unit icons.
              </p>
            </div>

            <ToggleField v-model="store.keepOpen">
              Keep dialog open on export
            </ToggleField>
          </template>

          <div class="min-h-0 flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <ExportSettingsXlsx
                v-if="format === 'xlsx'"
                :format="format"
                v-model="form"
              />
              <ExportSettingsCsv
                v-else-if="format === 'csv'"
                :format="format"
                v-model="form"
              />
              <ExportSettingsSpatialIllusions
                v-else-if="format === 'unitgenerator'"
                :format="format"
                v-model="form"
              />
              <ExportSettingsOrbatMapper
                v-else-if="format === 'orbatmapper'"
                v-model="form"
              />
              <ExportSettingsGeoJson
                v-else-if="format === 'geojson'"
                :format="format"
                v-model="form"
              />
              <ExportSettingsKmlKmz
                v-else-if="format === 'kml' || format === 'kmz'"
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
                    v-if="isMilx"
                    label="Use one layer per side"
                    v-model="form.oneFolderPerSide"
                  />
                </fieldset>
              </template>

              <p v-if="isKmz || isKml" class="text-sm">
                Please note that the export functionality is experimental. Scenario
                feature export is currently limited to geometries (no styles).
              </p>

              <p v-if="isMilx" class="text-sm">
                Please note that the MilX export is experimental. It is currently limited
                and has several bugs.
              </p>
            </div>
          </div>
        </ImportStepLayout>
      </form>
    </div>
  </NewSimpleModal>
</template>
