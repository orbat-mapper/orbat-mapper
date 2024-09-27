<template>
  <div class="">
    <form @submit.prevent="onMerge" class="mt-4 flex max-h-[80vh] flex-col">
      <p class="text-sm font-normal">You have loaded the following scenario:</p>

      <section class="mt-2 rounded border p-3">
        <h2 class="text-sm font-medium">{{ data.name }}</h2>
        <p class="truncate text-xs">{{ data.description }}</p>
        <p>Units: {{ stats.units }}</p>
      </section>

      <!--      <fieldset class="mt-4">-->
      <!--        <legend class="text-sm font-semibold leading-6 text-gray-900">-->
      <!--          Which parts of the scenario would you like to import?-->
      <!--        </legend>-->
      <!--        <div class="mt-1 flex items-center gap-5">-->
      <!--          <InputCheckbox label="Units" v-model="form.importUnits" />-->
      <!--          <InputCheckbox label="Events" v-model="form.importEvents" />-->
      <!--        </div>-->
      <!--      </fieldset>-->

      <fieldset :disabled="!form.importEvents">
        <legend class="text-sm font-semibold leading-6 text-gray-900">
          Event/position merging
        </legend>
        <p class="mt-1 text-sm leading-6 text-gray-600">
          If a unit already exists, what should be done?
        </p>
        <InlineRadioGroup class="" :items="mergeSettings" v-model="form.eventMerging" />
      </fieldset>
      <fieldset class="grid grid-cols-2 gap-4">
        <SimpleSelect label="Side" :items="importSides" v-model="currentSide" />
        <SimpleSelect
          label="Side group"
          :items="importSideGroups"
          v-model="currentSideGroup"
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
        select
        select-all
        v-model:selected="selectedUnits"
      />

      <footer
        class="flex flex-shrink-0 flex-col justify-between gap-3 pt-4 sm:flex-row sm:items-center"
      >
        <ToggleField v-model="store.keepOpen">Keep dialog open</ToggleField>
        <div class="flex items-center gap-2">
          <BaseButton type="submit" primary small>Merge</BaseButton>
          <BaseButton secondary small @click="loadScenario(data)"
            >Load as new scenario
          </BaseButton>
          <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
        </div>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, watch } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { SymbolItem } from "@/types/constants";
import { Scenario, Unit } from "@/types/scenarioModels";
import { useBrowserScenarios } from "@/composables/browserScenarios";
import InputCheckbox from "@/components/InputCheckbox.vue";
import InlineRadioGroup from "@/components/InlineRadioGroup.vue";
import { RadioGroupItem, SelectItem } from "@/components/types";
import { prepareScenario, ScenarioState } from "@/scenariostore/newScenarioStore";
import SimpleSelect from "@/components/SimpleSelect.vue";
import { CellContext, ColumnDef } from "@tanstack/vue-table";
import { SpatialIllusionsOrbat } from "@/types/externalModels";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import DataGrid from "@/modules/grid/DataGrid.vue";
import ToggleField from "@/components/ToggleField.vue";
import { useImportStore } from "@/stores/importExportStore";

interface Props {
  data: Scenario;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const { loadScenario } = useBrowserScenarios();
const store = useImportStore();

const { state } = scnStore;

const importedState = computed(() => {
  return prepareScenario(props.data);
});

const selectedUnits = ref<string[]>([]);

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
  let symbolOptions: Record<string, any> = {};

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
      header: "Unit",
      cell: renderExpandCell,
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
  if (form.importUnits && form.importEvents && form.eventMerging === "add_new") {
    const data = prepareScenario(props.data);
    mergeScenarios(state, data);
  }
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
