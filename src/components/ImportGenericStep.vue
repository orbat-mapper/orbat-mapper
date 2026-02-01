<script setup lang="ts">
import { computed, ref, watch, h } from "vue";
import UnitSymbol from "@/components/UnitSymbol.vue";
import type { WorkBook } from "xlsx";
import { xlsxUtils } from "@/extlib/xlsx-lazy";
import fuzzysort from "fuzzysort";
import DataGrid from "@/modules/grid/DataGrid.vue";
import BaseButton from "@/components/BaseButton.vue";
import NewSelect from "@/components/NewSelect.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { useNotifications } from "@/composables/notifications";
import { FieldGroup, FieldLabel, FieldLegend, FieldSet } from "./ui/field";
import { Field } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { ChevronRightIcon } from "lucide-vue-next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import {
  buildSidc,
  getEchelonCodeFromName,
  getIconCodeFromName,
} from "@/views/texttoorbat/textToOrbat";

interface Props {
  workbook: WorkBook;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { send } = useNotifications();

const sheetNames = props.workbook.SheetNames;
const activeSheet = ref(sheetNames[0]);
const importMode = ref<"add-units" | "update-units">("add-units");
const idField = ref<string | null>(null);
const showPreview = ref(true);
const guessSidc = ref(false);

const commonFields = [
  { label: "Name", value: "name", aliases: ["unit name", "label", "title"] },
  {
    label: "Short name",
    value: "shortName",
    aliases: ["abbr", "abbreviation", "short"],
  },
  {
    label: "SIDC",
    value: "sidc",
    aliases: ["symbol", "unit symbol", "mil-std-2525", "2525"],
  },
  {
    label: "Description",
    value: "description",
    aliases: ["remarks", "notes", "comments"],
  },
  {
    label: "External URL",
    value: "externalUrl",
    aliases: ["url", "link", "external link"],
  },
  {
    label: "Parent ID",
    value: "parentId",
    aliases: ["parent", "parent unit", "superior", "reports to", "p_id"],
  },
  {
    label: "Icon",
    value: "icon",
    aliases: ["icon", "symbol code", "function", "role"],
  },
  {
    label: "Echelon",
    value: "echelon",
    aliases: ["echelon", "level", "size", "rank"],
  },
];
const idAliases = ["id", "unit id", "identifier", "uid", "entityid"];

const fieldMappings = ref<Record<string, string | null>>({});

const data = computed(() => {
  const sheet = props.workbook.Sheets[activeSheet.value];
  if (!sheet || !sheet["!ref"]) return [];

  // // Limit to 100 rows for preview performance
  // const range = xlsxUtils.decode_range(sheet["!ref"]);
  // range.e.r = Math.min(range.e.r, range.s.r + 99);
  //
  // return xlsxUtils.sheet_to_json(sheet, { range });
  return xlsxUtils.sheet_to_json(sheet);
});

const headers = computed(() => {
  if (data.value.length === 0) return [];
  return Object.keys(data.value[0] as object);
});

watch(
  headers,
  (newHeaders) => {
    // Guess ID field
    let idBestScore = -Infinity;
    let idBestMatch = "";

    idAliases.forEach((alias) => {
      const results = fuzzysort.go(alias, newHeaders);
      if (results.length > 0 && results[0].score > idBestScore) {
        idBestScore = results[0].score;
        idBestMatch = results[0].target;
      }
    });

    idField.value = idBestScore > -1000 ? idBestMatch : null;

    // Guess other fields
    commonFields.forEach((field) => {
      const searchTerms = [field.value, field.label, ...field.aliases];
      let bestScore = -Infinity;
      let bestMatch = "";

      searchTerms.forEach((term) => {
        const results = fuzzysort.go(term, newHeaders);
        if (results.length > 0 && results[0].score > bestScore) {
          bestScore = results[0].score;
          bestMatch = results[0].target;
        }
      });

      fieldMappings.value[field.value] = bestScore > -1000 ? bestMatch : null;
    });
  },
  { immediate: true },
);

// console.log("Generic import data preview:", data.value);

const columns = computed<ColumnDef<Record<string, unknown>>[]>(() => {
  return headers.value.map((header) => ({
    accessorKey: header,
    header: header,
  }));
});

const previewColumns = computed<ColumnDef<Record<string, unknown>>[]>(() => {
  const cols: ColumnDef<Record<string, unknown>>[] = [];

  if (idField.value) {
    cols.push({ accessorKey: "id", header: "ID" });
  }

  commonFields.forEach((field) => {
    const isMapped = !!fieldMappings.value[field.value];
    const isSidc = field.value === "sidc";
    const isConstructedSidc =
      isSidc &&
      (guessSidc.value || fieldMappings.value["icon"] || fieldMappings.value["echelon"]);

    if (isSidc && (isMapped || isConstructedSidc)) {
      cols.push({
        accessorKey: field.value,
        header: field.label,
        cell: ({ row }) => {
          const sidc = row.original.sidc as string | undefined;
          if (!sidc) return "";
          return h("div", { class: "flex items-center gap-2" }, [
            h(UnitSymbol, {
              sidc,
              size: 24,
              class: "shrink-0",
              options: { outlineWidth: 6, outlineColor: "white" },
            }),
            h("span", sidc),
          ]);
        },
      });
    } else if (isMapped && field.value !== "icon" && field.value !== "echelon") {
      cols.push({ accessorKey: field.value, header: field.label });
    }
  });
  return cols;
});

const mappedData = computed(() => {
  if (!data.value.length) return [];

  return data.value.map((row) => {
    const r = row as Record<string, unknown>;
    const unit: Record<string, unknown> = {};

    // Map ID
    if (idField.value && r[idField.value] !== undefined) {
      unit.id = r[idField.value];
    }

    // Map other fields
    commonFields.forEach((field) => {
      const mappedHeader = fieldMappings.value[field.value];
      if (mappedHeader && r[mappedHeader] !== undefined) {
        unit[field.value] = r[mappedHeader];
      }
    });

    // Try to construct SIDC from specific icon/echelon fields if SIDC is missing
    if (!unit.sidc) {
      const iconHeader = fieldMappings.value["icon"];
      const echelonHeader = fieldMappings.value["echelon"];
      const iconValue = iconHeader ? (r[iconHeader] as string) : undefined;
      const echelonValue = echelonHeader ? (r[echelonHeader] as string) : undefined;

      if (iconValue || echelonValue) {
        const derivedIcon = iconValue
          ? getIconCodeFromName(iconValue) || "0000000000"
          : "0000000000";
        // If getInputCodeFromName returns "0000000000" (ICON_UNSPECIFIED) it might mean it didn't match,
        // but maybe the user provided a raw code? getIconCodeFromName returns UNSPECIFIED if no match.
        // Let's assume for now we use the helper. If the helper returns UNSPECIFIED, maybe check if the value itself looks like a code?
        // For simplicity sticking to the helper as per plan.

        const derivedEchelon = echelonValue
          ? getEchelonCodeFromName(echelonValue) || "00"
          : "00";

        // Standard Identity 3 (Friendly), SymbolSet 10 (Land Unit), Status 0, HQTFD 0
        unit.sidc = "10031000" + derivedEchelon + derivedIcon;
      } else if (guessSidc.value && unit.name) {
        unit.sidc = buildSidc(0, unit.name as string);
      }
    }

    return unit;
  });
});

function onImport() {
  send({
    message: "Generic import is not yet fully implemented. Mapping required.",
    type: "warning",
  });
  // In the future, we would map columns to Unit properties here
  // and emit 'loaded'
}
</script>

<template>
  <FieldGroup class="flex h-full flex-col gap-2">
    <h3 class="text-md font-semibold">Tabular data import</h3>

    <FieldSet>
      <FieldLabel>Import mode</FieldLabel>
      <RadioGroup class="grid grid-cols-3" v-model="importMode">
        <Field orientation="horizontal">
          <RadioGroupItem id="add" value="add-units" />
          <FieldLabel for="add">Add units</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="update" value="update-units" />
          <FieldLabel for="update">Update existing units</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>

    <FieldSet v-if="importMode === 'add-units'">
      <FieldLegend>Field mapping</FieldLegend>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NewSelect v-model="idField" :values="headers" label="ID field" add-none />
        <NewSelect
          v-for="field in commonFields"
          :key="field.value"
          v-model="fieldMappings[field.value]"
          :values="headers"
          :label="field.label"
          add-none
        />
      </div>
    </FieldSet>

    <div v-if="importMode === 'add-units'" class="flex items-center justify-end">
      <InputCheckbox v-model="showPreview" label="Show mapped preview" />
    </div>

    <div class="flex-auto overflow-auto">
      <div v-if="data.length > 0" class="flex flex-col gap-4">
        <Collapsible default-open class="rounded-md border">
          <CollapsibleTrigger as-child>
            <div
              class="bg-muted/20 hover:bg-muted/30 group flex cursor-pointer items-center justify-between p-2"
            >
              <span class="text-sm font-semibold">Source data ({{ activeSheet }})</span>
              <ChevronRightIcon
                class="h-4 w-4 transition-transform group-data-[state=open]:rotate-90"
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div class="space-y-2 border-t p-2">
              <NewSelect
                v-if="sheetNames.length > 1"
                v-model="activeSheet"
                :values="sheetNames"
                label="Select sheet"
              />
              <DataGrid
                :data="data"
                :columns="columns"
                :row-count="data.length"
                class="max-h-[30vh]"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div v-if="showPreview" class="rounded-md border">
          <div class="bg-muted/20 border-b p-2">
            <h4 class="text-xs font-semibold tracking-wider uppercase">Mapped Preview</h4>
          </div>
          <DataGrid
            :data="mappedData"
            :columns="previewColumns"
            :row-count="mappedData.length"
            class="max-h-[30vh]"
          />
        </div>
      </div>
      <div v-else class="p-8 text-center text-gray-500">No data found in this sheet.</div>
    </div>

    <footer class="flex shrink-0 items-center justify-end space-x-2 pt-4">
      <BaseButton type="submit" primary small @click="onImport">Import</BaseButton>
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </FieldGroup>
</template>
