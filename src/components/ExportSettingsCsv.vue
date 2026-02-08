<script setup lang="ts">
import type {
  CsvSeparator,
  CsvSettings,
  ExportFormat,
  LocationExportFormat,
} from "@/types/importExport.ts";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
import SimpleSelect from "@/components/SimpleSelect.vue";

interface Props {
  format: ExportFormat;
}

defineProps<Props>();
const settings = defineModel<CsvSettings>({ required: true });

const attributes: (string | { field: string; label: string })[] = [
  "id",
  "name",
  "sidc",
  "shortName",
  "description",
  "url",
  "location",
  { label: "parent ID", field: "_pid" },
  { label: "side ID", field: "sideId" },
  { label: "side name", field: "sideName" },
];

const locationFormatOptions: { label: string; value: LocationExportFormat }[] = [
  { label: "JSON array [lon, lat]", value: "json" },
  { label: "Lat, Lon", value: "latlon" },
  { label: "Lon, Lat", value: "lonlat" },
  { label: "MGRS", value: "mgrs" },
  { label: "Degrees Minutes Seconds", value: "dms" },
  { label: "Decimal Degrees", value: "dd" },
];

const separatorOptions: { label: string; value: CsvSeparator }[] = [
  { label: "Comma (,)", value: "," },
  { label: "Tab (TSV)", value: "\t" },
  { label: "Semicolon (;)", value: ";" },
];

function mapFieldLabel(
  items: ({ field: string; label: string } | string)[],
): { label: string; field: string }[] {
  return items.map((i) =>
    typeof i === "string" ? { label: i, field: i } : { label: i.label, field: i.field },
  );
}

const mappedAttributes = mapFieldLabel(attributes);
settings.value.columns = [...mappedAttributes];
if (!settings.value.locationFormat) {
  settings.value.locationFormat = "json";
}
if (!settings.value.separator) {
  settings.value.separator = ",";
}
</script>

<template>
  <fieldset class="space-y-4">
    <SimpleSelect
      v-model="settings.separator"
      :items="separatorOptions"
      label="Separator"
    />
    <InputGroupTemplate label="Unit attributes to export">
      <div class="mt-4 grid grid-cols-4 gap-4">
        <InputCheckbox
          v-for="v in mappedAttributes"
          :key="v.field"
          :label="v.label"
          :value="v"
          v-model="settings.columns"
        />
      </div>
    </InputGroupTemplate>
    <SimpleSelect
      v-model="settings.locationFormat"
      :items="locationFormatOptions"
      label="Location format"
    />
  </fieldset>
</template>
