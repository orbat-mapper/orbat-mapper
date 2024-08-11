<script setup lang="ts">
import { readSpreadsheet } from "@/extlib/xlsx-read-lazy";
import BaseButton from "@/components/BaseButton.vue";
import { useNotifications } from "@/composables/notifications";

import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { ImportedFileInfo } from "@/importexport/fileHandling";
import { detectSpreadsheetDialect } from "@/importexport/spreadsheets/utils";
import { parseOdinDragon, TestUnit } from "@/importexport/spreadsheets/odinDragon";
import { computed, h, ref } from "vue";
import { Unit } from "@/types/scenarioModels";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { SymbolItem } from "@/types/constants";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import InputCheckbox from "@/components/InputCheckbox.vue";
import { ColumnDef, InitialTableState } from "@tanstack/vue-table";
import DataGrid from "@/modules/grid/DataGrid.vue";

interface Props {
  fileInfo: ImportedFileInfo;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const scenario = injectStrict(activeScenarioKey);
const {
  store: { state },
} = scenario;

const expandTemplates = ref(true);
const includeEquipment = ref(true);
const includePersonnel = ref(true);

const rootUnitItems = computed((): SymbolItem[] => {
  return Object.values(state.sideGroupMap)
    .map((value) => value.subUnits)
    .flat()
    .map((e) => state.unitMap[e])
    .map((u) => ({ text: u.name, code: u.id, sidc: u.sidc }));
});

const parentUnitId = ref(rootUnitItems.value[0].code as string);

const newColumns: ColumnDef<Unit, any>[] = [
  {
    accessorFn: (u) => u.sidc,
    header: "Icon",
    id: "sidc",
    size: 70,
    cell: ({ row, getValue, cell }) => {
      return h(MilitarySymbol, {
        sidc: getValue(),
        size: 20,
        "data-sidc": getValue(),
      });
    },
  },
  { accessorKey: "name", header: "Name", size: 200 },
  { accessorKey: "PARENT NAME", header: "Parent name", size: 260 },
  { accessorKey: "TEMPLATE NAME", header: "Template", size: 300 },
];

const initialTableState: InitialTableState = {
  grouping: ["PARENT NAME"],
  expanded: true,
};

const { send } = useNotifications();

const workbook = readSpreadsheet(props.fileInfo.dataAsArrayBuffer);
const dialect = detectSpreadsheetDialect(workbook);
const units = ref<TestUnit[]>([]);

if (dialect === "ODIN_DRAGON") {
  const { unitRows, rootUnits } = parseOdinDragon(workbook, {
    rowsOnly: true,
  });
  units.value = unitRows;
}

async function onLoad(e: Event) {
  if (!(dialect === "ODIN_DRAGON")) {
    send({
      message: "Invalid file format",
      type: "error",
    });
    return;
  }
  const { rootUnits } = parseOdinDragon(workbook, {
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
      <div class="flex-shrink-0 overflow-auto">
        <div class="prose prose-sm max-w-none">
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
          :data="units"
          :columns="newColumns"
          :row-height="40"
          class="max-h-[40vh]"
          show-global-filter
          :initial-state="initialTableState"
        />
      </section>

      <footer class="flex flex-shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>
