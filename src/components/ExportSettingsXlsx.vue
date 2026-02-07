<script setup lang="ts">
import type { ExportFormat, XlsxSettings } from "@/types/importExport.ts";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";

interface Props {
  format: ExportFormat;
}

const props = defineProps<Props>();
const settings = defineModel<XlsxSettings>({ required: true });

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

function mapFieldLabel(
  items: ({ field: string; label: string } | string)[],
): { label: string; field: string }[] {
  return items.map((i) =>
    typeof i === "string" ? { label: i, field: i } : { label: i.label, field: i.field },
  );
}

const mappedAttributes = mapFieldLabel(attributes);
settings.value.columns = [...mappedAttributes];
</script>

<template>
  <fieldset class="space-y-4">
    <InputCheckbox v-model="settings.oneSheetPerSide" label="Use one sheet per side" />
    <InputGroupTemplate label="Unit attributes to export">
      <div class="mt-4 grid grid-cols-4 gap-4">
        <InputCheckbox
          v-for="v in mappedAttributes"
          :label="v.label"
          :value="v"
          v-model="settings.columns"
        />
      </div>
    </InputGroupTemplate>
  </fieldset>
</template>
