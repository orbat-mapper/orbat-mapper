<script setup lang="ts">
import { computed, h, ref } from "vue";
import type { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import type { ControlMeasureId } from "@orbat-mapper/control-measures";
import { useImportStore } from "@/stores/importExportStore";
import { injectStrict, nanoid } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { NState, NUnit } from "@/types/internalModels";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import { useRootUnits } from "@/composables/scenarioUtils.ts";
import ImportStepLayout from "@/components/ImportStepLayout.vue";
import BaseButton from "@/components/BaseButton.vue";
import ToggleField from "@/components/ToggleField.vue";
import ControlMeasurePreview from "@/modules/scenarioeditor/ControlMeasurePreview.vue";
import {
  createControlMeasureLayer,
  getControlMeasureKindName,
} from "@/modules/scenarioeditor/controlMeasureLayers";
import { useNotifications } from "@/composables/notifications";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  summaryCaveats,
  type MilXImportEntry,
  type MilXImportPlan,
  type MilXUnitEntry,
} from "@/importexport/milx/convert";

interface Props {
  data: MilXImportPlan;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, geo, time } = injectStrict(activeScenarioKey);
const store = useImportStore();
const { send } = useNotifications();
const fmt = useTimeFormatStore();

/** When imported units take their positions: as their initial location, or as
 *  a position at a point in time. */
const positionTimeMode = ref<"initial" | "current" | "event">("initial");
const events = computed(() =>
  scnStore.state.events
    .map((id) => scnStore.state.eventMap[id])
    .sort((a, b) => a.startTime - b.startTime)
    .map((e) => ({
      label: `${fmt.scenarioFormatter.format(e.startTime)} - ${e.title}`,
      value: e.id,
    })),
);
const positionEventId = ref(events.value[0]?.value);

function positionTime(): number | undefined {
  if (positionTimeMode.value === "current") return +time.scenarioTime.value;
  if (positionTimeMode.value === "event" && positionEventId.value)
    return scnStore.state.eventMap[positionEventId.value]?.startTime;
}

const selectedEntries = ref<MilXImportEntry[]>([]);

const { rootUnitItems, groupedRootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0]?.code as string);

const hasUnits = computed(() => props.data.entries.some((e) => e.type === "unit"));
const caveats = computed(() => summaryCaveats(props.data.summary));

function kindName(entry: MilXImportEntry) {
  return entry.type === "unit"
    ? "Unit"
    : getControlMeasureKindName(entry.item.graphicKind);
}

const columns: ColumnDef<MilXImportEntry, string>[] = [
  {
    id: "symbol",
    header: "Symbol",
    size: 85,
    accessorFn: (e) => (e.type === "unit" ? e.sidc : e.item.graphicKind),
    cell: ({ row }) => {
      const entry = row.original;
      return entry.type === "unit"
        ? h(MilitarySymbol, { sidc: entry.sidc, size: 20, "data-sidc": entry.sidc })
        : h(ControlMeasurePreview, {
            kind: entry.item.graphicKind as ControlMeasureId,
            class: "size-7",
          });
    },
  },
  { accessorFn: (e) => e.name, id: "name", header: "Name", size: 200 },
  { accessorFn: kindName, id: "type", header: "Type", size: 180 },
  { accessorFn: (e) => e.layerName, id: "layer", header: "Layer", size: 200 },
  {
    accessorFn: (e) => e.originalSidc,
    id: "originalSidc",
    header: "MilX SIDC",
    size: 170,
  },
];

const initialTableState: InitialTableState = {
  grouping: ["layer"],
  expanded: true,
};

function toUnit(entry: MilXUnitEntry, standardIdentity: string, t?: number): NUnit {
  const state: NState[] | undefined =
    t === undefined ? undefined : [{ id: nanoid(), t, location: entry.location }];
  return {
    id: nanoid(),
    name: entry.name,
    sidc: setCharAt(entry.sidc, SID_INDEX, standardIdentity),
    subUnits: [],
    _pid: "",
    _gid: "",
    _sid: "",
    ...(state ? { state } : { location: entry.location }),
    symbolOptions: entry.fillColor ? { fillColor: entry.fillColor } : {},
    textAmplifiers: entry.textAmplifiers,
    reinforcedStatus: entry.reinforcedStatus,
    equipment: [],
    personnel: [],
  };
}

function onLoad() {
  const units = selectedEntries.value.filter((e) => e.type === "unit");
  const graphics = selectedEntries.value.filter((e) => e.type === "graphic");
  if (units.length && !parentUnitId.value) {
    send({ message: "Select a parent unit to import units into.", type: "warning" });
    return;
  }
  const t = positionTime();
  if (units.length && positionTimeMode.value === "event" && t === undefined) {
    send({ message: "Select an event for the unit positions.", type: "warning" });
    return;
  }

  scnStore.groupUpdate(
    () => {
      if (units.length) {
        const { side } = unitActions.getUnitHierarchy(parentUnitId.value);
        units.forEach((entry) =>
          unitActions.addUnit(
            toUnit(entry, side.standardIdentity, t),
            parentUnitId.value,
          ),
        );
      }
      // One control measure layer per MilX layer, in file order.
      const layerIds = new Map<number, string | undefined>();
      for (const entry of graphics) {
        if (!layerIds.has(entry.layerIndex)) {
          layerIds.set(
            entry.layerIndex,
            createControlMeasureLayer(geo, entry.layerName)?.id,
          );
        }
        const layerId = layerIds.get(entry.layerIndex);
        if (layerId) geo.addFeature({ ...entry.item, id: nanoid() }, layerId);
      }
    },
    { label: "batchLayer", value: "milx-import" },
  );
  // Timed positions only show once the unit states are recomputed.
  if (units.length && t !== undefined) time.setCurrentTime(+time.scenarioTime.value);

  send({
    message: `Imported ${units.length} units and ${graphics.length} control measures.`,
    type: "success",
  });
  if (!store.keepOpen) emit("loaded");
}
</script>
<template>
  <ImportStepLayout
    title="Import MilX"
    subtitle="Import units and control measures from MilX layers"
    help-url="https://docs.orbat-mapper.app/guide/import-data"
    has-sidebar
  >
    <template #actions>
      <ToggleField v-model="store.keepOpen" class="mr-4">Keep dialog open</ToggleField>
      <BaseButton small @click="emit('cancel')" class="flex-1 sm:flex-none"
        >Cancel</BaseButton
      >
      <BaseButton primary small @click="onLoad" class="flex-1 sm:flex-none"
        >Import</BaseButton
      >
    </template>

    <template #sidebar>
      <div class="prose prose-sm dark:prose-invert">
        <p>
          Import MilX layers from
          <a href="https://www.map.army/">map.army</a>. Point symbols are added as units
          and tactical graphics as control measures, with one control measure layer per
          MilX layer.
        </p>
        <ul v-if="caveats.length">
          <li v-for="caveat in caveats" :key="caveat">{{ caveat }}</li>
        </ul>
      </div>

      <SymbolCodeSelect
        v-if="hasUnits"
        label="Parent unit"
        :items="rootUnitItems"
        :groups="groupedRootUnitItems"
        v-model="parentUnitId"
      />

      <div v-if="hasUnits" class="space-y-3 border-t pt-4">
        <Label class="text-muted-foreground text-xs font-semibold uppercase"
          >Unit positions</Label
        >
        <RadioGroup v-model="positionTimeMode" class="flex flex-col gap-2">
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="milx-time-initial" value="initial" />
            <Label for="milx-time-initial">Initial position</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="milx-time-current" value="current" />
            <Label for="milx-time-current"
              >Current time ({{
                fmt.scenarioFormatter.format(+time.scenarioTime.value)
              }})</Label
            >
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem
              id="milx-time-event"
              value="event"
              :disabled="!events.length"
            />
            <Label for="milx-time-event">At event</Label>
          </div>
        </RadioGroup>
        <SimpleSelect
          v-if="positionTimeMode === 'event'"
          label="Event"
          :items="events"
          v-model="positionEventId"
        />
      </div>
    </template>

    <div class="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        :data="data.entries"
        :columns="columns"
        :initial-state="initialTableState"
        :row-height="40"
        select
        select-all
        show-global-filter
        class="flex-1"
        v-model:selected="selectedEntries"
      />
    </div>
  </ImportStepLayout>
</template>
