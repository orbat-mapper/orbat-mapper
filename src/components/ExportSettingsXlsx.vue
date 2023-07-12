<script setup lang="ts">
import { ExportFormat, ExportSettings, XlsxSettings } from "@/types/convert";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { useVModel } from "@vueuse/core";
import { Ref } from "vue";
import InputGroupTemplate from "@/components/InputGroupTemplate.vue";
interface Props {
  modelValue: XlsxSettings;
  format: ExportFormat;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
// Adding a typecast here because PyCharm does not infer the correct type automatically
const settings = useVModel(props, "modelValue", emit) as Ref<XlsxSettings>;

const attributes: (string | { field: string; label: string })[] = [
  "id",
  "name",
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
