<script setup lang="ts">
import { computed, ref, watch, h } from "vue";
import UnitSymbol from "@/components/UnitSymbol.vue";
import type { WorkBook } from "xlsx";
import { xlsxUtils } from "@/extlib/xlsx-lazy";
import fuzzysort from "fuzzysort";
import DataGrid from "@/modules/grid/DataGrid.vue";
import BaseButton from "@/components/BaseButton.vue";
import type { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useNotifications } from "@/composables/notifications";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import type { Unit } from "@/types/scenarioModels";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { useRootUnits } from "@/composables/scenarioUtils";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./ui/field";
import { Field } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NewAccordionPanel from "@/components/NewAccordionPanel.vue";
import { InfoIcon } from "lucide-vue-next";
import {
  buildSidc,
  getEchelonCodeFromName,
  getIconCodeFromName,
} from "@/views/texttoorbat/textToOrbat";

interface FieldDefinition {
  label: string;
  value: string;
  aliases: string[];
  helpText: string;
  essential?: boolean;
}

interface Props {
  workbook: WorkBook;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { send } = useNotifications();
const scenario = injectStrict(activeScenarioKey);

const sheetNames = props.workbook.SheetNames;
const activeSheet = ref(sheetNames[0]);
const importMode = ref<"add-units" | "update-units">("add-units");
const idMode = ref<"mapped" | "autogenerate">("autogenerate");
const idField = ref<string | null>(null);
const showPreview = ref(true);
const showSourceData = ref(true);
const guessSidc = ref(false);
const parentMatchField = ref<string | null>(null);

const { rootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0]?.code as string);

const commonFields: FieldDefinition[] = [
  {
    label: "Name",
    value: "name",
    aliases: ["unit name", "label", "title"],
    helpText: "The display name for the unit (required)",
    essential: true,
  },
  {
    label: "Short name",
    value: "shortName",
    aliases: ["abbr", "abbreviation", "short"],
    helpText: "Abbreviated unit name for compact displays",
    essential: false,
  },
  {
    label: "Icon",
    value: "icon",
    aliases: ["icon", "symbol code", "function", "role", "name"],
    helpText: "Unit icon/function",
    essential: true,
  },
  {
    label: "Echelon",
    value: "echelon",
    aliases: ["echelon", "level", "size", "rank", "name"],
    helpText: "Command level",
    essential: true,
  },
  {
    label: "Parent ID",
    value: "parentId",
    aliases: ["parent", "parent unit", "superior", "reports to", "p_id"],
    helpText: "ID of the parent unit in the hierarchy",
    essential: false,
  },
  {
    label: "Description",
    value: "description",
    aliases: ["remarks", "notes", "comments"],
    helpText: "Additional information about the unit",
    essential: false,
  },
  {
    label: "External URL",
    value: "externalUrl",
    aliases: ["url", "link", "external link"],
    helpText: "Link to external documentation or resources",
    essential: false,
  },
];
const idAliases = ["id", "unit id", "identifier", "uid", "entityid"];

const symbolFieldValues = new Set(["icon", "echelon"]);
const hierarchyFieldValues = new Set(["parentId"]);
const symbolFields = commonFields.filter((field) => symbolFieldValues.has(field.value));
const hierarchyFields = commonFields.filter((field) =>
  hierarchyFieldValues.has(field.value),
);
const otherFields = commonFields.filter(
  (field) =>
    !symbolFieldValues.has(field.value) && !hierarchyFieldValues.has(field.value),
);

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
    parentMatchField.value = idField.value;

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

      const mappedValue = bestScore > -1000 ? bestMatch : null;
      fieldMappings.value[field.value] = mappedValue;
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
  const hasHierarchy = !!fieldMappings.value.parentId && hierarchyData.value.length > 0;

  // Name column - with expand/collapse when hierarchy is available
  if (fieldMappings.value.name) {
    if (hasHierarchy) {
      cols.push({
        accessorKey: "name",
        id: "name",
        cell: ({ getValue, row }) => {
          return h(OrbatCellRenderer, {
            value: (getValue() as string) ?? "",
            sidc: row.original.sidc as string | undefined,
            expanded: row.getIsExpanded(),
            level: row.depth,
            canExpand: row.getCanExpand(),
            onToggle: row.getToggleExpandedHandler(),
            symbolOptions: {},
          });
        },
        header: ({ table }) => {
          return h(
            "button",
            {
              type: "button",
              title: "Expand/collapse all",
              onClick: table.getToggleAllRowsExpandedHandler(),
              class: "flex items-center gap-2",
            },
            [
              h(ChevronRightIcon, {
                class: [
                  "size-6 transform transition-transform text-muted-foreground",
                  table.getIsAllRowsExpanded() ? "rotate-90" : "",
                ],
              }),
              "Name",
            ],
          );
        },
        enableGlobalFilter: true,
        size: 350,
        enableSorting: false,
      });
    } else {
      cols.push({ accessorKey: "name", header: "Name" });
    }
  }

  if (idMode.value === "autogenerate" || (idMode.value === "mapped" && idField.value)) {
    cols.push({ accessorKey: "id", header: "ID", size: 120 });
  }

  if (guessSidc.value || fieldMappings.value["icon"] || fieldMappings.value["echelon"]) {
    cols.push({
      accessorKey: "sidc",
      header: "SIDC",
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
  }

  // Add other mapped fields (excluding name which is already added, and icon/echelon which are in SIDC)
  commonFields.forEach((field) => {
    const isMapped = !!fieldMappings.value[field.value];
    if (
      isMapped &&
      field.value !== "name" &&
      field.value !== "icon" &&
      field.value !== "echelon" &&
      field.value !== "parentId"
    ) {
      cols.push({ accessorKey: field.value, header: field.label });
    }
  });
  return cols;
});

function isNumericSidc(value: string) {
  return /^\d{10}(\d{5})?(\d{5})?$/.test(value);
}

function isCharacterSidc(value: string) {
  return /^[A-Z\-]{15}$/.test(value);
}

const mappedData = computed(() => {
  if (!data.value.length) return [];

  return data.value.map((row) => {
    const r = row as Record<string, unknown>;
    const unit: Record<string, unknown> = {};

    // Map ID
    if (idMode.value === "mapped" && idField.value && r[idField.value] !== undefined) {
      unit.id = r[idField.value];
    } else if (idMode.value === "autogenerate") {
      unit.id = nanoid();
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
        if (iconValue && (isNumericSidc(iconValue) || isCharacterSidc(iconValue))) {
          if (iconValue.length >= 15) {
            unit.sidc = iconValue;
          } else {
            // Partial SIDC (10 digits)
            const derivedEchelon = echelonValue
              ? getEchelonCodeFromName(echelonValue) || "00"
              : "00";
            unit.sidc = "10031000" + derivedEchelon + iconValue;
          }
        } else {
          const derivedIcon = iconValue
            ? getIconCodeFromName(iconValue) || "0000000000"
            : "0000000000";

          const derivedEchelon = echelonValue
            ? getEchelonCodeFromName(echelonValue) || "00"
            : "00";

          // Standard Identity 3 (Friendly), SymbolSet 10 (Land Unit), Status 0, HQTFD 0
          unit.sidc = "10031000" + derivedEchelon + derivedIcon;
        }
      } else if (guessSidc.value && unit.name) {
        unit.sidc = buildSidc(0, unit.name as string);
      }
    }

    return unit;
  });
});

// Validation and quality metrics
const validRowCount = computed(() => {
  return mappedData.value.filter((u) => u.name && u.sidc).length;
});

// Unit type for hierarchy
interface HierarchyUnit extends Record<string, unknown> {
  id: string;
  name: string;
  sidc?: string;
  subUnits?: HierarchyUnit[];
}

// Build hierarchy from flat data when parentId is mapped
const hierarchyData = computed<HierarchyUnit[]>(() => {
  if (!fieldMappings.value.parentId || !parentMatchField.value) {
    return [];
  }

  const sourceData = data.value as Record<string, unknown>[];
  const flatData = mappedData.value as HierarchyUnit[];
  if (!flatData.length || !sourceData.length) return [];

  const parentIdHeader = fieldMappings.value.parentId;
  const matchFieldHeader = parentMatchField.value;

  // Create a map from the parentMatchField column value to the hierarchy unit
  // parentMatchField is a column header in the SOURCE data
  const unitMap = new Map<string, HierarchyUnit>();
  sourceData.forEach((sourceRow, index) => {
    const matchValue = String(sourceRow[matchFieldHeader] ?? "");
    if (matchValue && flatData[index]) {
      unitMap.set(matchValue, { ...flatData[index], subUnits: [] });
    }
  });

  // Build the hierarchy
  const rootUnits: HierarchyUnit[] = [];

  sourceData.forEach((sourceRow) => {
    const matchValue = String(sourceRow[matchFieldHeader] ?? "");
    const hierarchyUnit = unitMap.get(matchValue);
    if (!hierarchyUnit) return;

    // Get the parent reference from the source data's parentId column
    const parentIdValue = String(sourceRow[parentIdHeader!] ?? "");
    const parentUnit = parentIdValue ? unitMap.get(parentIdValue) : null;

    if (parentUnit && parentUnit !== hierarchyUnit) {
      if (!parentUnit.subUnits) parentUnit.subUnits = [];
      parentUnit.subUnits.push(hierarchyUnit);
    } else {
      rootUnits.push(hierarchyUnit);
    }
  });

  return rootUnits;
});

const hierarchyTableState: InitialTableState = {
  expanded: true,
};

const canImport = computed(() => {
  // Must have at least name field mapped
  if (!fieldMappings.value.name) return false;

  // Must have icon/echelon for symbol generation
  const hasIconOrEchelon = !!fieldMappings.value.icon || !!fieldMappings.value.echelon;
  if (!hasIconOrEchelon) return false;

  // ID must be either autogenerated or mapped
  if (
    !idField.value &&
    (importMode.value === "update-units" || idMode.value === "mapped")
  )
    return false;

  // Must have at least one valid row
  if (validRowCount.value === 0) return false;

  return true;
});

function onImport() {
  const hasHierarchy = !!fieldMappings.value.parentId && hierarchyData.value.length > 0;

  // Convert mapped data or hierarchy data to Unit objects
  function convertToUnit(item: HierarchyUnit): Unit {
    const unit: Unit = {
      id: String(item.id),
      name: String(item.name || ""),
      sidc: String(item.sidc || ""),
      subUnits: [],
    };

    // Add optional fields if present
    if (item.shortName) unit.shortName = String(item.shortName);
    if (item.description) unit.description = String(item.description);
    if (item.externalUrl) unit.externalUrl = String(item.externalUrl);

    // Recursively process subUnits if hierarchy exists
    if (item.subUnits && item.subUnits.length > 0) {
      unit.subUnits = item.subUnits.map(convertToUnit);
    }

    return unit;
  }

  let unitsToImport: Unit[];

  if (hasHierarchy) {
    // Use hierarchical data
    unitsToImport = hierarchyData.value.map(convertToUnit);
  } else {
    // Flat data - each mapped item becomes a root unit
    unitsToImport = (mappedData.value as HierarchyUnit[]).map(convertToUnit);
  }

  // Validate we have valid units
  const validUnits = unitsToImport.filter((u) => u.name && u.sidc);
  if (validUnits.length === 0) {
    send({
      message: "No valid units to import. Ensure name and symbol fields are mapped.",
      type: "error",
    });
    return;
  }

  // Import each root unit
  validUnits.forEach((unit) => {
    addUnitHierarchy(unit, parentUnitId.value, scenario);
  });

  send({
    message: `Successfully imported ${validRowCount.value} units.`,
    type: "success",
  });

  emit("loaded");
}
</script>

<template>
  <FieldGroup class="flex h-full flex-col gap-4">
    <!-- Header -->
    <div>
      <h3 class="text-lg font-semibold">
        Import units from tabular data (work in progress)
      </h3>
      <p class="text-muted-foreground text-sm">Map your columns to unit properties</p>
    </div>

    <!-- Import Mode Selection -->
    <FieldSet>
      <FieldLabel>Import mode</FieldLabel>
      <p class="text-muted-foreground mb-2 text-sm">
        Choose whether to add new units or update existing ones by ID
      </p>
      <RadioGroup class="grid grid-cols-2" v-model="importMode">
        <Field orientation="horizontal">
          <RadioGroupItem id="add" value="add-units" />
          <FieldLabel for="add">Add units</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem disabled id="update" value="update-units" />
          <FieldLabel for="update">Update existing units</FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>

    <!-- Update Mode Configuration -->
    <div
      v-if="importMode === 'update-units'"
      class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950"
    >
      <div class="flex gap-2">
        <InfoIcon class="h-5 w-5 shrink-0 text-blue-500" />
        <div class="text-sm">
          <p class="font-medium text-blue-900 dark:text-blue-100">
            Update Mode Configuration
          </p>
          <p class="mt-1 text-blue-700 dark:text-blue-300">
            Update mode requires an ID field to match existing units. Mapped fields will
            overwrite existing values.
          </p>
        </div>
      </div>
      <div class="mt-3">
        <Field class="items-start">
          <FieldLabel>ID field (required)</FieldLabel>
          <Select v-model="idField">
            <SelectTrigger class="!w-sm">
              <SelectValue placeholder="Select ID field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="h in headers" :key="h" :value="h">
                {{ h }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>

    <!-- Field Mapping -->
    <NewAccordionPanel v-if="importMode === 'add-units'" label="Column mappings">
      <div class="flex flex-col gap-4">
        <FieldSet class="gap-3 rounded-md border p-3">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-3">
              <RadioGroup v-model="idMode" class="flex w-sm gap-4">
                <Field orientation="horizontal">
                  <RadioGroupItem id="id-auto" value="autogenerate" />
                  <FieldLabel for="id-auto">Autogenerate IDs</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem id="id-mapped" value="mapped" />
                  <FieldLabel for="id-mapped">Map ID from column</FieldLabel>
                </Field>
              </RadioGroup>

              <div v-if="idMode === 'mapped'" class="mt-2">
                <Field class="items-start">
                  <FieldLabel>ID field</FieldLabel>
                  <Select v-model="idField">
                    <SelectTrigger class="!w-sm">
                      <SelectValue placeholder="Select ID field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select a column that uniquely identifies each unit.
                  </FieldDescription>
                </Field>
              </div>
            </div>

            <div
              class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <Field v-for="field in otherFields" :key="field.value">
                <FieldLabel>{{ field.label }}</FieldLabel>
                <Select v-model="fieldMappings[field.value]">
                  <SelectTrigger>
                    <SelectValue :placeholder="field.label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="null">None</SelectItem>
                    <SelectItem v-for="h in headers" :key="h" :value="h">
                      {{ h }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>{{ field.helpText }}</FieldDescription>
              </Field>
            </div>
          </div>
        </FieldSet>

        <FieldSet class="gap-3 rounded-md border p-3">
          <FieldLegend variant="label">Symbol fields</FieldLegend>
          <FieldDescription class="">
            Map icon and echelon to construct the unit symbol (SIDC). If SIDC is missing,
            it will be auto generated based on these fields.
          </FieldDescription>
          <div
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <Field v-for="field in symbolFields" :key="field.value">
              <FieldLabel>{{ field.label }}</FieldLabel>
              <Select v-model="fieldMappings[field.value]">
                <SelectTrigger>
                  <SelectValue :placeholder="field.label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="null">None</SelectItem>
                  <SelectItem v-for="h in headers" :key="h" :value="h">
                    {{ h }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>{{ field.helpText }}</FieldDescription>
            </Field>
          </div>
        </FieldSet>
        <FieldSet class="gap-3 rounded-md border p-3">
          <FieldLegend variant="label">Hierarchy</FieldLegend>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              v-for="field in hierarchyFields"
              :key="field.value"
              class="items-start"
            >
              <FieldLabel>{{ field.label }}</FieldLabel>
              <Select v-model="fieldMappings[field.value]">
                <SelectTrigger class="!w-sm">
                  <SelectValue :placeholder="`Select ${field.label.toLowerCase()}`" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="null">None</SelectItem>
                  <SelectItem v-for="h in headers" :key="h" :value="h">
                    {{ h }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>{{ field.helpText }}</FieldDescription>
            </Field>

            <Field v-if="fieldMappings.parentId" class="items-start">
              <FieldLabel>Identify parents by</FieldLabel>
              <Select v-model="parentMatchField">
                <SelectTrigger class="!w-sm">
                  <SelectValue placeholder="Match parent by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="h in headers" :key="h" :value="h">
                    {{ h }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Select the column used to match the parent references.
              </FieldDescription>
            </Field>
          </div>
        </FieldSet>
      </div>
    </NewAccordionPanel>

    <!-- Preview Section -->
    <div class="flex-auto overflow-auto">
      <div v-if="data.length > 0" class="flex flex-col gap-4">
        <!-- Source Data -->
        <NewAccordionPanel
          :label="`Source data (${activeSheet})`"
          v-model="showSourceData"
        >
          <div class="space-y-2 py-2">
            <Field v-if="sheetNames.length > 1" class="items-start">
              <FieldLabel>Select sheet</FieldLabel>
              <Select v-model="activeSheet">
                <SelectTrigger class="!w-sm">
                  <SelectValue placeholder="Select sheet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="sheet in sheetNames" :key="sheet" :value="sheet">
                    {{ sheet }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <DataGrid
              :data="data"
              :columns="columns"
              :row-count="data.length"
              class="max-h-[30vh]"
            />
          </div>
        </NewAccordionPanel>

        <section class="px-1" v-if="importMode === 'add-units'">
          <SymbolCodeSelect
            label="Select parent unit"
            :items="rootUnitItems"
            v-model="parentUnitId"
          />
        </section>

        <NewAccordionPanel
          v-if="importMode === 'add-units'"
          label="Preview"
          v-model="showPreview"
        >
          <DataGrid
            :data="
              fieldMappings.parentId && hierarchyData.length > 0
                ? hierarchyData
                : mappedData
            "
            :columns="previewColumns"
            :row-count="mappedData.length"
            :row-height="40"
            class="max-h-[40vh]"
            :initial-state="hierarchyTableState"
            :get-sub-rows="fieldMappings.parentId ? (row) => row.subUnits : undefined"
          />
        </NewAccordionPanel>
      </div>
      <div v-else class="text-muted-foreground p-8 text-center">
        No data found in this sheet.
      </div>
    </div>

    <!-- Footer -->
    <footer class="flex shrink-0 items-center justify-between space-x-2 border-t pt-4">
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton type="submit" primary small :disabled="!canImport" @click="onImport">
        Import {{ validRowCount }} {{ validRowCount === 1 ? "unit" : "units" }}
      </BaseButton>
    </footer>
  </FieldGroup>
</template>
