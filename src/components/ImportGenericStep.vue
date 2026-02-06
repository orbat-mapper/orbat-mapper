<script setup lang="ts">
import { computed, ref, h } from "vue";
import UnitSymbol from "@/components/UnitSymbol.vue";
import type { WorkBook } from "xlsx";
import DataGrid from "@/modules/grid/DataGrid.vue";
import BaseButton from "@/components/BaseButton.vue";
import type { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useNotifications } from "@/composables/notifications";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import type { Unit, State } from "@/types/scenarioModels";
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
import { formatPosition } from "@/geo/utils";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import SimpleSelect from "@/components/SimpleSelect.vue";
import type { Position } from "geojson";
import { commonFields, useColumnMapping } from "@/composables/import/useColumnMapping";
import { useSheetData } from "@/composables/import/useSheetData";
import { useMappedData, type HierarchyUnit } from "@/composables/import/useMappedData";
import type { PositionTimeMode } from "./import/types";

interface Props {
  workbook: WorkBook;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { send } = useNotifications();
const scenario = injectStrict(activeScenarioKey);

// Data loading
const { sheetNames, activeSheet, data, headers } = useSheetData(props.workbook);

const importMode = ref<"add-units" | "update-units">("add-units");
const idMode = ref<"mapped" | "autogenerate">("autogenerate");
const showPreview = ref(true);
const showSourceData = ref(true);
const guessSidc = ref(false);

const { rootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0]?.code as string);

// Column mapping logic
const {
  fieldMappings,
  idField,
  parentMatchField,
  coordinateMode,
  combinedCoordinateFormat,
  latitudeField,
  longitudeField,
  positionField,
} = useColumnMapping(headers, data);

const positionTimeMode = ref<PositionTimeMode>("current");
const positionEventId = ref<string | null>(null);

// Time formatting and events
const fmt = useTimeFormatStore();
const { store, time } = injectStrict(activeScenarioKey);

const formattedCurrentTime = computed(() =>
  fmt.scenarioFormatter.format(+time.scenarioTime.value),
);

const events = computed(() => {
  return store.state.events
    .map((e) => store.state.eventMap[e])
    .sort((a, b) => (a.startTime < b.startTime ? -1 : 1))
    .map((e) => ({
      label: `${fmt.scenarioFormatter.format(e.startTime)} - ${e.title}`,
      value: e.id,
    }));
});

// Initialize event ID if available
if (events.value.length > 0 && !positionEventId.value) {
  positionEventId.value = events.value[0]?.value ?? null;
}

// Helper for UI referencing
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

const columns = computed<ColumnDef<Record<string, unknown>>[]>(() => {
  return headers.value.map((header) => ({
    accessorKey: header,
    header: header,
  }));
});

// Mapped data transformation
const { mappedData, hierarchyData } = useMappedData({
  data,
  fieldMappings,
  idField,
  idMode,
  parentMatchField,
  coordinateMode,
  latitudeField,
  longitudeField,
  positionField,
  combinedCoordinateFormat,
  guessSidc,
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

  // Add position column if coordinates are being mapped
  if (coordinateMode.value !== "none") {
    cols.push({
      accessorKey: "_position",
      header: "Position",
      cell: ({ row }) => {
        const pos = row.original._position as Position | undefined;
        if (!pos || pos.length < 2) return "";
        return formatPosition(pos);
      },
      size: 200,
    });
  }

  return cols;
});

interface MappedUnit {
  name?: string;
  sidc?: string;
  [key: string]: unknown;
}

// Validation and quality metrics
const validRowCount = computed(() => {
  return mappedData.value.filter((u) => (u as MappedUnit).name && (u as MappedUnit).sidc)
    .length;
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

    // Handle position based on time mode
    if (item._position) {
      if (positionTimeMode.value === "current") {
        // Set position as state at current scenario time
        const state: State = {
          id: nanoid(),
          t: +time.scenarioTime.value,
          location: item._position,
        };
        unit.state = [state];
      } else if (positionTimeMode.value === "event" && positionEventId.value) {
        // Set position as state at the selected event's time
        const event = store.state.eventMap[positionEventId.value];
        if (event) {
          const state: State = {
            id: nanoid(),
            t: event.startTime,
            location: item._position,
          };
          unit.state = [state];
        } else {
          // Fallback to current time if event not found
          const state: State = {
            id: nanoid(),
            t: +time.scenarioTime.value,
            location: item._position,
          };
          unit.state = [state];
        }
      }
    }

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
  const hasPositions = coordinateMode.value !== "none";
  validUnits.forEach((unit) => {
    addUnitHierarchy(unit, parentUnitId.value, scenario, {
      includeState: hasPositions,
    });
  });

  // Refresh unit states so imported units with positions are visible on the map
  if (hasPositions) {
    time.setCurrentTime(+time.scenarioTime.value);
    scenario.store.state.unitStateCounter++;
  }

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
        <FieldSet class="gap-3 rounded-md border p-3">
          <FieldLegend variant="label">Position</FieldLegend>
          <FieldDescription>
            Map coordinate columns to set unit positions on the map.
          </FieldDescription>
          <RadioGroup v-model="coordinateMode" class="mb-4 flex flex-wrap gap-4">
            <Field orientation="horizontal">
              <RadioGroupItem id="coord-none" value="none" />
              <FieldLabel for="coord-none">No position</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="coord-separate" value="separate" />
              <FieldLabel for="coord-separate">Separate lat/lon columns</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="coord-combined" value="combined" />
              <FieldLabel for="coord-combined">Combined coordinate column</FieldLabel>
            </Field>
          </RadioGroup>

          <!-- Separate lat/lon fields -->
          <div
            v-if="coordinateMode === 'separate'"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <Field class="items-start">
              <FieldLabel>Latitude</FieldLabel>
              <Select v-model="latitudeField">
                <SelectTrigger class="!w-sm">
                  <SelectValue placeholder="Select latitude column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="null">None</SelectItem>
                  <SelectItem v-for="h in headers" :key="h" :value="h">
                    {{ h }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Column with latitude values</FieldDescription>
            </Field>
            <Field class="items-start">
              <FieldLabel>Longitude</FieldLabel>
              <Select v-model="longitudeField">
                <SelectTrigger class="!w-sm">
                  <SelectValue placeholder="Select longitude column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="null">None</SelectItem>
                  <SelectItem v-for="h in headers" :key="h" :value="h">
                    {{ h }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Column with longitude values</FieldDescription>
            </Field>
          </div>

          <!-- Combined coordinate field -->
          <div
            v-if="coordinateMode === 'combined'"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <Field class="items-start">
              <FieldLabel>Coordinate column</FieldLabel>
              <Select v-model="positionField">
                <SelectTrigger class="!w-sm">
                  <SelectValue placeholder="Select coordinate column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="null">None</SelectItem>
                  <SelectItem v-for="h in headers" :key="h" :value="h">
                    {{ h }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Column with coordinate values</FieldDescription>
            </Field>
            <Field class="items-start">
              <FieldLabel>Coordinate format</FieldLabel>
              <Select v-model="combinedCoordinateFormat">
                <SelectTrigger class="!w-sm">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LatLon">Lat, Lon (decimal)</SelectItem>
                  <SelectItem value="LonLat">Lon, Lat (decimal)</SelectItem>
                  <SelectItem value="MGRS">MGRS</SelectItem>
                  <SelectItem value="DMS">Degrees Minutes Seconds</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Format of coordinate values</FieldDescription>
            </Field>
          </div>

          <!-- Position time mode -->
          <div v-if="coordinateMode !== 'none'" class="mt-4 border-t pt-4">
            <FieldLabel class="mb-2">Apply position at</FieldLabel>
            <RadioGroup v-model="positionTimeMode" class="flex flex-wrap gap-4">
              <Field orientation="horizontal">
                <RadioGroupItem id="time-current" value="current" />
                <FieldLabel for="time-current"
                  >Current scenario time ({{ formattedCurrentTime }})</FieldLabel
                >
              </Field>
              <Field orientation="horizontal">
                <RadioGroupItem id="time-event" value="event" />
                <FieldLabel for="time-event">Scenario event</FieldLabel>
              </Field>
            </RadioGroup>
            <SimpleSelect
              v-if="positionTimeMode === 'event'"
              class="mt-2"
              label="Select event"
              :items="events"
              v-model="positionEventId"
            />
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
