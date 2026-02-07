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
import { Field, FieldContent, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPosition } from "@/geo/utils";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import SimpleSelect from "@/components/SimpleSelect.vue";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
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
const guessSidc = ref(false); // Used in useMappedData

const { rootUnitItems, groupedRootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0]?.code as string);

const parentSidc = computed(() => {
  const unit = rootUnitItems.value.find((u) => u.code === parentUnitId.value);
  return unit?.sidc;
});

const parentSymbolOptions = computed(() => {
  const unit = rootUnitItems.value.find((u) => u.code === parentUnitId.value);
  return unit?.symbolOptions;
});

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
const otherFields = commonFields.filter(
  (field) =>
    !symbolFieldValues.has(field.value) &&
    !hierarchyFieldValues.has(field.value) &&
    field.value !== "name",
);

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
  parentSidc,
  parentSymbolOptions,
});

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
            symbolOptions: row.original.symbolOptions as any,
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
            options: {
              outlineWidth: 6,
              outlineColor: "white",
              ...(row.original.symbolOptions as any),
            },
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
  <ImportStepLayout
    title="Import units from tabular data"
    subtitle="Map your columns to unit properties"
    help-url="https://docs.orbat-mapper.app/guide/import-data"
    has-sidebar
  >
    <template #actions>
      <BaseButton small @click="emit('cancel')" class="flex-1 sm:flex-none"
        >Cancel</BaseButton
      >
      <BaseButton
        type="submit"
        primary
        small
        :disabled="!canImport"
        @click="onImport"
        class="flex-1 sm:flex-none"
      >
        Import {{ validRowCount }} {{ validRowCount === 1 ? "unit" : "units" }}
      </BaseButton>
    </template>

    <template #sidebar>
      <!-- Import Mode -->
      <section class="space-y-3">
        <FieldLabel>Import Mode</FieldLabel>
        <RadioGroup class="grid grid-cols-2 gap-4" v-model="importMode">
          <FieldLabel for="add">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Add units</FieldTitle>
              </FieldContent>
              <RadioGroupItem id="add" value="add-units" />
            </Field>
          </FieldLabel>
          <FieldLabel
            for="update"
            class="cursor-not-allowed opacity-50"
            title="Not implemented yet"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Update existing</FieldTitle>
              </FieldContent>
              <RadioGroupItem disabled id="update" value="update-units" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </section>

      <section v-if="importMode === 'add-units'" class="space-y-3">
        <SymbolCodeSelect
          label="Parent unit"
          :items="rootUnitItems"
          :groups="groupedRootUnitItems"
          v-model="parentUnitId"
        />
      </section>

      <!-- Column Mappings -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-medium">Column Mappings</h4>
        </div>

        <Tabs default-value="core" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="geo">Location</TabsTrigger>
          </TabsList>

          <!-- Core Tab -->
          <TabsContent value="core" class="space-y-4 py-4">
            <div class="space-y-4">
              <div class="space-y-3">
                <Label class="text-muted-foreground text-xs font-semibold uppercase"
                  >Unit Identification</Label
                >

                <Field class="gap-1.5">
                  <FieldLabel>Name Column</FieldLabel>
                  <Select v-model="fieldMappings.name">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">None</SelectItem>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p class="text-muted-foreground text-[0.8rem]">
                    Required. Display name of the unit.
                  </p>
                </Field>

                <Field class="gap-1.5">
                  <FieldLabel>Unit ID</FieldLabel>
                  <div class="flex flex-col gap-3">
                    <RadioGroup v-model="idMode" class="flex gap-4">
                      <div class="flex items-center space-x-2">
                        <RadioGroupItem id="id-auto" value="autogenerate" />
                        <Label for="id-auto" class="font-normal">Auto</Label>
                      </div>
                      <div class="flex items-center space-x-2">
                        <RadioGroupItem id="id-mapped" value="mapped" />
                        <Label for="id-mapped" class="font-normal">From column</Label>
                      </div>
                    </RadioGroup>

                    <Select v-if="idMode === 'mapped'" v-model="idField">
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Select ID column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="h in headers" :key="h" :value="h">
                          {{ h }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Field>
              </div>

              <div class="space-y-3">
                <Label class="text-muted-foreground text-xs font-semibold uppercase"
                  >Symbology</Label
                >
                <p class="text-muted-foreground text-sm">
                  Map columns to construct the SIDC (Symbol ID Code).
                </p>
                <Field v-for="field in symbolFields" :key="field.value" class="gap-1.5">
                  <FieldLabel>{{ field.label }}</FieldLabel>
                  <Select v-model="fieldMappings[field.value]">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">None</SelectItem>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p class="text-muted-foreground text-[0.8rem]">
                    {{ field.helpText }}
                  </p>
                </Field>
              </div>

              <div class="space-y-3">
                <Label class="text-muted-foreground text-xs font-semibold uppercase"
                  >Other Fields</Label
                >
                <Field v-for="field in otherFields" :key="field.value" class="gap-1.5">
                  <FieldLabel>{{ field.label }}</FieldLabel>
                  <Select v-model="fieldMappings[field.value]">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">None</SelectItem>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>
          </TabsContent>

          <!-- Hierarchy Tab -->
          <TabsContent value="hierarchy" class="space-y-4 py-4">
            <div class="space-y-4">
              <Field class="gap-1.5">
                <FieldLabel>Parent ID Column</FieldLabel>
                <Select v-model="fieldMappings.parentId">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="null">None</SelectItem>
                    <SelectItem v-for="h in headers" :key="h" :value="h">
                      {{ h }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field v-if="fieldMappings.parentId" class="gap-1.5">
                <FieldLabel>Match Parent By</FieldLabel>
                <Select v-model="parentMatchField">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select ID column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="h in headers" :key="h" :value="h">
                      {{ h }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-muted-foreground text-[0.8rem]">
                  Column in this sheet that matches the Parent ID
                </p>
              </Field>
            </div>
          </TabsContent>

          <!-- Location Tab -->
          <TabsContent value="geo" class="space-y-4 py-4">
            <div class="space-y-4">
              <div class="space-y-3">
                <Label class="text-muted-foreground text-xs font-semibold uppercase"
                  >Coordinate Format</Label
                >
                <RadioGroup v-model="coordinateMode" class="flex flex-col gap-2">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="coord-none" value="none" />
                    <Label for="coord-none">No position</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="coord-separate" value="separate" />
                    <Label for="coord-separate">Lat/Lon columns</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="coord-combined" value="combined" />
                    <Label for="coord-combined">Single column</Label>
                  </div>
                </RadioGroup>
              </div>

              <div v-if="coordinateMode === 'separate'" class="space-y-4">
                <Field class="gap-1.5">
                  <FieldLabel>Latitude</FieldLabel>
                  <Select v-model="latitudeField">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">None</SelectItem>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field class="gap-1.5">
                  <FieldLabel>Longitude</FieldLabel>
                  <Select v-model="longitudeField">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">None</SelectItem>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div v-if="coordinateMode === 'combined'" class="space-y-4">
                <Field class="gap-1.5">
                  <FieldLabel>Coordinate Column</FieldLabel>
                  <Select v-model="positionField">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">None</SelectItem>
                      <SelectItem v-for="h in headers" :key="h" :value="h">
                        {{ h }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field class="gap-1.5">
                  <FieldLabel>Format</FieldLabel>
                  <Select v-model="combinedCoordinateFormat">
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LatLon">Lat, Lon</SelectItem>
                      <SelectItem value="LonLat">Lon, Lat</SelectItem>
                      <SelectItem value="MGRS">MGRS</SelectItem>
                      <SelectItem value="DMS">DMS</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div v-if="coordinateMode !== 'none'" class="space-y-3 border-t pt-4">
                <Label class="text-muted-foreground text-xs font-semibold uppercase"
                  >Time</Label
                >
                <RadioGroup v-model="positionTimeMode" class="flex flex-col gap-2">
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="time-current" value="current" />
                    <Label for="time-current">Current time</Label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <RadioGroupItem id="time-event" value="event" />
                    <Label for="time-event">Use event</Label>
                  </div>
                </RadioGroup>

                <SimpleSelect
                  v-if="positionTimeMode === 'event'"
                  label="Select event"
                  :items="events"
                  v-model="positionEventId"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </template>

    <!-- Main content: Preview -->
    <Tabs default-value="preview" class="flex h-full min-h-0 flex-col">
      <div
        class="bg-background flex shrink-0 items-center justify-between border-b px-6 py-2"
      >
        <TabsList class="grid w-full grid-cols-2 lg:w-[25rem]">
          <TabsTrigger value="preview">Unit Preview</TabsTrigger>
          <TabsTrigger value="source">Source Data</TabsTrigger>
        </TabsList>
        <div class="flex items-center space-x-2">
          <div class="text-muted-foreground text-xs">{{ data.length }} rows found</div>
        </div>
      </div>

      <TabsContent value="preview" class="mt-0 min-h-0 flex-1 overflow-hidden p-6">
        <div
          class="bg-background flex h-full flex-col overflow-hidden rounded-md border shadow-sm"
        >
          <div class="flex items-center justify-between border-b px-4 py-2">
            <h4 class="text-sm font-medium">Mapped Units</h4>
            <div class="text-muted-foreground text-xs">
              Showing top {{ mappedData.length }} rows
            </div>
          </div>
          <DataGrid
            :data="
              fieldMappings.parentId && hierarchyData.length > 0
                ? hierarchyData
                : mappedData
            "
            :columns="previewColumns"
            :row-count="mappedData.length"
            :row-height="40"
            class="flex-1"
            :initial-state="hierarchyTableState"
            :get-sub-rows="fieldMappings.parentId ? (row) => row.subUnits : undefined"
          />
        </div>
      </TabsContent>

      <TabsContent value="source" class="mt-0 min-h-0 flex-1 overflow-hidden p-6">
        <div
          class="bg-background flex h-full flex-col overflow-hidden rounded-md border shadow-sm"
        >
          <div class="flex items-center justify-between border-b px-4 py-2">
            <h4 class="text-sm font-medium">Raw Source Data</h4>
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground text-xs">Sheet:</span>
              <Select v-model="activeSheet">
                <SelectTrigger class="h-8 w-[12.5rem]">
                  <SelectValue placeholder="Select sheet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="sheet in sheetNames" :key="sheet" :value="sheet">
                    {{ sheet }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DataGrid
            :data="data"
            :columns="columns"
            :row-count="data.length"
            class="flex-1"
          />
        </div>
      </TabsContent>
    </Tabs>
  </ImportStepLayout>
</template>
