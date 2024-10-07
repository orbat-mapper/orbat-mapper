<script setup lang="ts">
import { computed, h, reactive, ref, toRaw, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import {
  mapReinforcedStatus2Field,
  Scenario,
  Unit,
  UnitSymbolOptions,
} from "@/types/scenarioModels";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InlineRadioGroup from "@/components/InlineRadioGroup.vue";
import { RadioGroupItem, SelectItem } from "@/components/types";
import { prepareScenario, ScenarioState } from "@/scenariostore/newScenarioStore";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { CellContext, ColumnDef } from "@tanstack/vue-table";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import ToggleField from "@/components/ToggleField.vue";
import { useImportStore } from "@/stores/importExportStore";
import { NSideGroup, NUnit } from "@/types/internalModels";
import PanelSubHeading from "@/components/PanelSubHeading.vue";
import InputRadio from "@/components/InputRadio.vue";
import MRadioGroup from "@/components/MRadioGroup.vue";
import { useNotifications } from "@/composables/notifications";
import AlertWarning from "@/components/AlertWarning.vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

interface Props {
  data: Scenario;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const { loadScenario } = useBrowserScenarios();
const { send } = useNotifications();
const store = useImportStore();

const { state } = scnStore;

const importMode = ref<"units" | "layers">("units");
const unitImportMode = ref<"units-only" | "units-and-state" | "state-only">("state-only");
const selectUnits = ref(false);
const selectedUnits = ref<Unit[]>([]);

const importedState = computed(() => {
  return prepareScenario(props.data);
});

function getCombinedSymbolOptions(
  unitOrSideGroup: NUnit | NSideGroup,
  ignoreUnit = false,
): UnitSymbolOptions {
  if (!unitOrSideGroup) return {};
  const state = importedState.value;
  let _sid, _gid, reinforcedReduced;
  if ("sidc" in unitOrSideGroup) {
    _sid = unitOrSideGroup._sid;
    _gid = unitOrSideGroup._gid;
    reinforcedReduced = mapReinforcedStatus2Field(unitOrSideGroup.reinforcedStatus);
  } else {
    _sid = unitOrSideGroup._pid;
    _gid = unitOrSideGroup.id;
    ignoreUnit = true;
  }
  return {
    ...(state.sideMap[_sid!]?.symbolOptions || {}),
    ...(state.sideGroupMap[_gid!]?.symbolOptions || {}),
    ...(ignoreUnit ? {} : unitOrSideGroup.symbolOptions || {}),
    ...(ignoreUnit ? {} : { reinforcedReduced: reinforcedReduced ?? "" }),
  };
}

const stats = computed(() => {
  return {
    units: Object.keys(importedState.value.unitMap).length,
  };
});

const importSides = computed((): SelectItem[] => {
  return importedState.value.sides
    .map((id) => importedState.value.sideMap[id])
    .map((side) => {
      return {
        label: side.name,
        value: side.id,
      };
    });
});

const importSideGroups = computed(() => {
  return importedState.value.sideMap[currentSide.value].groups
    .map((id) => importedState.value.sideGroupMap[id])
    .map((sideGroup) => {
      return {
        label: sideGroup.name,
        value: sideGroup.id,
      };
    });
});

const currentSide = ref(importSides.value[0].value as string);
const currentSideGroup = ref(importSideGroups.value[0].value as string);
const currentData = computed(() => {
  const s = props.data.sides.find((s) => s.id === currentSide.value);
  const sg = s?.groups.find((g) => g.id === currentSideGroup.value);
  return sg?.subUnits ?? [];
});

watch(currentSide, (newSide) => {
  const side = importedState.value.sideMap[newSide];
  currentSideGroup.value = side.groups[0];
});

function renderExpandCell({ getValue, row }: CellContext<Unit, string>) {
  let symbolOptions: Record<string, any> = getCombinedSymbolOptions(
    importedState.value.unitMap[row.original.id],
  );

  return h(OrbatCellRenderer, {
    value: getValue(),
    sidc: row.original.sidc,
    expanded: row.getIsExpanded(),
    level: row.depth,
    canExpand: row.getCanExpand(),
    onToggle: row.getToggleExpandedHandler(),
    symbolOptions,
  });
}

const computedColumns = computed((): (ColumnDef<Unit> | false)[] => {
  return [
    {
      accessorFn: (f) => f.name,
      id: "name",
      cell: renderExpandCell,
      header: ({ table, column }) => {
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
                "size-6 transform transition-transform text-gray-500",
                table.getIsAllRowsExpanded() ? "rotate-90" : "",
              ],
            }),
            "Unit",
          ],
        );
      },
      enableGlobalFilter: false,
      size: 350,
      enableSorting: false,
    },
    {
      accessorFn: (f) => (f.id in state.unitMap ? "Yes" : "No"),
      id: "exists",
      header: "Exists?",
      enableSorting: false,
    },
    {
      accessorFn: (f) => (f.state?.length ? "Yes" : "No"),
      id: "state",
      header: "State?",
      enableSorting: false,
    },
  ];
});

const form = reactive({
  importUnits: true,
  importEvents: true,
  eventMerging: "add_new",
});

const sides = computed(() => {
  return state.sides.map((id) => state.sideMap[id]);
});

const mergeSettings: RadioGroupItem[] = [
  { value: "replace", name: "Replace" },
  { value: "add_new", name: "Add only new events" },
];

async function onMerge(e: Event) {
  const selectedUnitIds = new Set(selectedUnits.value.map((u) => u.id));

  if (unitImportMode.value === "state-only") {
    scnStore.groupUpdate(() => {
      for (const importedUnitId of selectedUnitIds) {
        const importedUnit = importedState.value.unitMap[importedUnitId];
        if (!importedUnit || !importedUnit.state?.length) {
          continue;
        }
        const existingUnit = state.unitMap[importedUnit.id];
        if (!existingUnit) {
          continue;
        }
        unitActions.setUnitState(existingUnit.id, importedUnit.state);
      }
    });
  }

  send({
    message: "Imported data from scenario",
    type: "success",
  });

  if (!store.keepOpen) emit("loaded");

  /*if (form.importUnits && form.importEvents && form.eventMerging === "add_new") {
    const data = prepareScenario(props.data);
    mergeScenarios(state, data);
  }*/
}

function mergeScenarios(originalScenario: ScenarioState, newScenario: ScenarioState) {
  scnStore.groupUpdate(() => {
    for (const [unitId, unit] of Object.entries(newScenario.unitMap)) {
      const originalUnit = originalScenario.unitMap[unitId];
      if (originalUnit.state?.length && unit.state?.length) {
        const lastTimestamp = originalUnit.state[originalUnit.state.length - 1].t;
        const newStates = unit.state.filter((s) => s.t > lastTimestamp);
        if (newStates.length) {
          unitActions.setUnitState(unitId, [...originalUnit.state, ...newStates]);
        }
      } else {
      }
    }
  });
}
</script>
<template>
  <div class="">
    <form @submit.prevent="onMerge" class="mt-4 flex max-h-[80vh] flex-col">
      <div class="flex items-center justify-between">
        <p class="text-sm font-normal">You have loaded the following scenario:</p>
        <BaseButton secondary small @click="loadScenario(data)"
          >Load as new scenario
        </BaseButton>
      </div>
      <section class="mt-2 rounded border p-3">
        <h2 class="text-sm font-medium">{{ data.name }}</h2>
        <p class="truncate text-xs">{{ data.description }}</p>
        <p>Units: {{ stats.units }}</p>
      </section>
      <AlertWarning title="Work in progress" class="rounded border"
        >The scenario import functionality is currently limited.</AlertWarning
      >

      <PanelSubHeading class="mt-4"
        >Which parts of the scenario do you want to import?</PanelSubHeading
      >
      <div class="mt-2 flex items-center justify-between">
        <MRadioGroup class="flex w-full gap-5">
          <InputRadio v-model="importMode" value="units">Units</InputRadio>
          <InputRadio v-model="importMode" value="features" disabled>Layers</InputRadio>
        </MRadioGroup>
        <ToggleField
          v-if="importMode === 'units'"
          v-model="selectUnits"
          class="flex-0 flex-shrink-0"
          disabled
          >Select individual units</ToggleField
        >
      </div>

      <fieldset class="mt-4 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <SimpleSelect
          label="Side"
          :items="importSides"
          v-model="currentSide"
          class="flex-auto"
        />
        <SimpleSelect
          label="Side group"
          :items="importSideGroups"
          v-model="currentSideGroup"
          class="flex-auto"
        />
      </fieldset>

      <DataGrid
        :key="currentSideGroup"
        :data="currentData"
        :columns="computedColumns"
        :row-height="40"
        class="mt-4 max-h-[40vh]"
        :initial-state="{ expanded: true }"
        :get-sub-rows="(row) => row.subUnits"
        :select="selectUnits"
        select-all
        v-model:selected="selectedUnits"
        no-indeterminate
      />

      <fieldset>
        <PanelSubHeading class="mt-4">What do you want to import?</PanelSubHeading>
        <MRadioGroup class="mt-2 flex w-full gap-5">
          <InputRadio v-model="unitImportMode" :value="'units-only'" disabled
            >Only units</InputRadio
          >
          <InputRadio v-model="unitImportMode" value="units-and-state" disabled
            >Units and state</InputRadio
          >
          <InputRadio v-model="unitImportMode" value="state-only">State only</InputRadio>
        </MRadioGroup>
      </fieldset>

      <!--      <fieldset>-->
      <!--        <PanelSubHeading class="mt-4">Destination</PanelSubHeading>-->
      <!--      </fieldset>-->

      <!--
      <fieldset :disabled="!form.importEvents" class="mt-2">
        <legend class="text-sm font-semibold leading-6 text-gray-900">
          State merging
        </legend>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          If a unit already exists, what should be done?
        </p>
        <InlineRadioGroup class="" :items="mergeSettings" v-model="form.eventMerging" />
      </fieldset>
-->
      <footer
        class="flex flex-shrink-0 flex-col justify-between gap-3 pt-4 sm:flex-row sm:items-center"
      >
        <ToggleField v-model="store.keepOpen">Keep dialog open</ToggleField>
        <div class="flex items-center gap-2">
          <BaseButton type="submit" primary small>Import</BaseButton>
          <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
        </div>
      </footer>
    </form>
  </div>
</template>
