<script setup lang="ts">
import {
  type OdinUnitInfoRow,
  parseOdinDragon,
} from "@/importexport/spreadsheets/odinDragon";
import { h, ref, shallowRef } from "vue";
import type { Unit } from "@/types/scenarioModels";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import InputCheckbox from "@/components/InputCheckbox.vue";
import type { CellContext, ColumnDef, InitialTableState } from "@tanstack/vue-table";
import DataGrid from "@/modules/grid/DataGrid.vue";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { useRootUnits } from "@/composables/scenarioUtils";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { WorkBook } from "xlsx";
import BaseButton from "@/components/BaseButton.vue";

interface Props {
  workbook: WorkBook;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const scenario = injectStrict(activeScenarioKey);

const expandTemplates = ref(true);
const includeEquipment = ref(true);
const includePersonnel = ref(true);

const { rootUnitItems } = useRootUnits();
const parentUnitId = ref(rootUnitItems.value[0].code as string);

function renderExpandCell({ getValue, row }: CellContext<Unit, string | undefined>) {
  return h(OrbatCellRenderer, {
    value: getValue() ?? "",
    sidc: row.original.sidc,
    expanded: row.getIsExpanded(),
    level: row.depth,
    canExpand: row.getCanExpand(),
    onToggle: row.getToggleExpandedHandler(),
    symbolOptions: {},
  });
}

const columns: ColumnDef<Unit, string | undefined>[] = [
  {
    accessorFn: (f) => f.name,
    id: "name",
    cell: renderExpandCell,
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
          "Unit",
        ],
      );
    },
    enableGlobalFilter: true,
    size: 450,
    enableSorting: false,
  },
  {
    accessorKey: "TEMPLATE NAME",
    header: "Template",
    size: 300,
    accessorFn: (u) => rowMapTest.value?.get(+u.id)?.["TEMPLATE NAME"],
  },
];

const initialTableState: InitialTableState = {
  //grouping: ["PARENT NAME"],
  expanded: true,
};

const importedUnits = shallowRef<Unit[]>([]);
const rowMapTest = shallowRef<Map<number, OdinUnitInfoRow>>();

const { rootUnits, rowMap } = parseOdinDragon(props.workbook, {
  rowsOnly: false,
  expandTemplates: false,
});
importedUnits.value = rootUnits;
rowMapTest.value = rowMap;

async function onLoad() {
  const { rootUnits } = parseOdinDragon(props.workbook, {
    expandTemplates: expandTemplates.value,
    includeEquipment: includeEquipment.value,
    includePersonnel: includePersonnel.value,
  });
  rootUnits.forEach((unit) => {
    addUnitHierarchy(unit, parentUnitId.value, scenario);
  });
  emit("loaded");
}
</script>
<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
      <div class="shrink-0 overflow-auto">
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Import units exported from
            <a
              href="https://odin.tradoc.army.mil/DATEWORLD"
              target="_blank"
              rel="noopener noreferrer"
              >https://odin.tradoc.army.mil/DATEWORLD</a
            >. Only the DRAGON Excel export format is currently supported.
          </p>
        </div>

        <section class="mt-4 space-y-4 px-1">
          <div class="grid gap-4 sm:grid-cols-3">
            <InputCheckbox
              label="Expand unit templates"
              description="This will create a lot of units!"
              v-model="expandTemplates"
            />
            <template v-if="expandTemplates">
              <InputCheckbox
                label="Include equipment"
                v-model="includeEquipment"
                :disabled="!expandTemplates"
              />
              <InputCheckbox
                label="Include personnel"
                v-model="includePersonnel"
                :disabled="!expandTemplates"
              />
            </template>
          </div>
          <SymbolCodeSelect
            label="Select parent unit"
            :items="rootUnitItems"
            v-model="parentUnitId"
          />
        </section>
      </div>
      <section class="mt-2 flex-auto">
        <DataGrid
          :data="importedUnits"
          :columns="columns"
          :row-count="rowMapTest?.size"
          :row-height="40"
          class="max-h-[40vh]"
          show-global-filter
          :initial-state="initialTableState"
          :get-sub-rows="(row) => row.subUnits"
        />
      </section>

      <footer class="flex shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>
