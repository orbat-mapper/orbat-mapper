<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] flex-col">
      <div class="flex-auto overflow-auto">
        <div class="prose prose-sm">
          <p>
            Import units exported from
            <a href="https://odin.tradoc.army.mil/DATEWORLD"
              >https://odin.tradoc.army.mil/DATEWORLD</a
            >
          </p>
          <p>
            Warning: A large ORBAT will create a lot of units. Use with caution. Only the
            DRAGON Excel export format is currently supported.
          </p>
        </div>

        <section class="space-y-1 px-1 py-2">
          <!--          <InputCheckbox-->
          <!--            label="Expand templates"-->
          <!--            description="Warning: This will create a lot of units! Use with caution."-->
          <!--            v-model="expandTemplates"-->
          <!--          />-->
          <SymbolCodeSelect
            label="Select parent unit"
            :items="rootUnitItems"
            v-model="parentUnitId"
          />
        </section>
        <section class="h-[50vh]">
          <OrbatGrid :data="units" :columns="columns" />
        </section>
      </div>

      <footer class="flex flex-shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { readSpreadsheet } from "@/extlib/xlsx-read-lazy";
import BaseButton from "@/components/BaseButton.vue";
import { useNotifications } from "@/composables/notifications";
import { useImportStore } from "@/stores/importExportStore";

import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { ImportedFileInfo } from "@/importexport/fileHandling";
import { detectSpreadsheetDialect } from "@/importexport/spreadsheets/utils";
import { parseOdinDragon, TestUnit } from "@/importexport/spreadsheets/odinDragon";
import { computed, ref } from "vue";
import { Unit } from "@/types/scenarioModels";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { ColumnProperties } from "@/modules/grid/gridTypes";
import OrbatGrid from "@/modules/grid/OrbatGrid.vue";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { SymbolItem } from "@/types/constants";
import { addUnitHierarchy } from "@/importexport/convertUtils";
import InputCheckbox from "@/components/InputCheckbox.vue";

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

const rootUnitItems = computed((): SymbolItem[] => {
  return Object.values(state.sideGroupMap)
    .map((value) => value.subUnits)
    .flat()
    .map((e) => state.unitMap[e])
    .map((u) => ({ text: u.name, code: u.id, sidc: u.sidc }));
});

const parentUnitId = ref(rootUnitItems.value[0].code as string);

const columns: ColumnProperties[] = [
  {
    type: "sidc",
    width: 65,
    field: "sidc",
    label: "Icon",
  },
  { type: "text", field: "name", label: "Name" },
  { type: "text", field: "PARENT NAME", label: "Parent" },
  { type: "text", field: "TEMPLATE NAME", label: "Template" },
];

const { send } = useNotifications();

const workbook = readSpreadsheet(props.fileInfo.dataAsArrayBuffer);
const dialect = detectSpreadsheetDialect(workbook);
const units = ref<TestUnit[]>([]);
const rootUnitHierarchies = ref<Unit[]>([]);

if (dialect === "ODIN_DRAGON") {
  const { unitRows, rootUnits } = parseOdinDragon(workbook, {
    expandTemplates: expandTemplates.value,
  });
  units.value = unitRows;
  rootUnitHierarchies.value = rootUnits;
}

async function onLoad(e: Event) {
  rootUnitHierarchies.value.forEach((unit) => {
    addUnitHierarchy(unit, parentUnitId.value, scenario);
  });
  emit("loaded");
}
</script>
