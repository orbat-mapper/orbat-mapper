<template>
  <div class="">
    <form @submit.prevent="onLoad" class="mt-4 flex max-h-[80vh] min-h-[25rem] flex-col">
      <div class="flex-auto overflow-auto">
        <div class="prose prose-sm"></div>
        <section class="p-1.5">
          <SymbolCodeSelect
            label="Parent unit"
            :items="rootUnitItems"
            v-model="parentUnitId"
          />
        </section>
        <section class="mt-4">
          <DataGrid
            :data="[props.data]"
            :columns="computedColumns"
            :row-height="40"
            class="max-h-[40vh]"
            :initial-state="{ expanded: true }"
            :get-sub-rows="(row) => row.subOrganizations"
          />
        </section>
        <section class="mt-4 flex gap-4 p-1">
          <InputCheckbox v-model="useFillColor" label="Use custom fill color" />
          <InputCheckbox v-model="expandedStackedUnits" label="Expand stacked units" />
        </section>
      </div>

      <footer class="flex shrink-0 items-center justify-end space-x-2 pt-4">
        <BaseButton type="submit" primary small>Import</BaseButton>
        <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from "vue";
import BaseButton from "@/components/BaseButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import type { NUnit, NUnitAdd } from "@/types/internalModels";
import type { SymbolItem } from "@/types/constants";
import SymbolCodeSelect from "@/components/SymbolCodeSelect.vue";
import { setCharAt } from "@/components/helpers";
import { SID_INDEX } from "@/symbology/sidc";
import {
  mapSpatialIllusionsReinforced,
  type SpatialIllusionsOrbat,
} from "@/types/externalModels";
import type { EntityId } from "@/types/base";
import type { CellContext, ColumnDef } from "@tanstack/vue-table";
import DataGrid from "@/modules/grid/DataGrid.vue";
import OrbatCellRenderer from "@/components/OrbatCellRenderer.vue";
import InputCheckbox from "@/components/InputCheckbox.vue";

interface Props {
  data: SpatialIllusionsOrbat;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { unitActions, store: scnStore, time } = injectStrict(activeScenarioKey);
const { state } = scnStore;

const useFillColor = ref(true);
const expandedStackedUnits = ref(true);

const rootUnitItems = computed((): SymbolItem[] => {
  return Object.values(state.sideGroupMap)
    .map((value) => value.subUnits)
    .flat()
    .map((e) => state.unitMap[e])
    .map((u) => ({
      text: u.name,
      code: u.id,
      sidc: u.sidc,
      symbolOptions: unitActions.getCombinedSymbolOptions(u),
    }));
});

const parentUnitId = ref(rootUnitItems.value[0].code as string);

function renderExpandCell({ getValue, row }: CellContext<SpatialIllusionsOrbat, string>) {
  let symbolOptions: Record<string, any> = {};
  if (useFillColor.value && row.original.options.fillColor) {
    symbolOptions["fillColor"] = row.original.options.fillColor;
  }
  return h(OrbatCellRenderer, {
    value: getValue(),
    sidc: row.original.options.sidc,
    expanded: row.getIsExpanded(),
    level: row.depth,
    canExpand: row.getCanExpand(),
    onToggle: row.getToggleExpandedHandler(),
    symbolOptions,
  });
}

const computedColumns = computed((): (ColumnDef<SpatialIllusionsOrbat> | false)[] => {
  return [
    {
      accessorFn: (f) => f.options.uniqueDesignation,
      id: "name",
      header: "Unit",
      cell: renderExpandCell,
      enableGlobalFilter: false,
      size: 350,
      enableSorting: false,
    },
    {
      id: "additionalInformation",
      header: "Additional information",
      accessorFn: (f) => f.options.additionalInformation,
      enableSorting: false,
    },
    {
      id: "stack",
      header: "Stack",
      accessorFn: (f) => f.options.stack,
      enableSorting: false,
    },
    {
      id: "fillColor",
      header: "Fill color",
      accessorFn: (f) => f.options.fillColor,
      enableSorting: false,
    },

    {
      id: "reinforced",
      header: "Reinforced",
      accessorFn: (f) => f.options.reinforced,
      enableSorting: false,
    },
  ];
});

async function onLoad(e: Event) {
  const { side } = unitActions.getUnitHierarchy(parentUnitId.value);
  const oob = props.data;

  scnStore.groupUpdate(() => {
    function helper(u: SpatialIllusionsOrbat, parentId: EntityId) {
      const { uniqueDesignation: name = "", sidc } = u.options;
      const stack = expandedStackedUnits.value ? u.options.stack || 1 : 1;
      const fillColor = useFillColor.value ? u.options.fillColor : undefined;

      const newUnit: NUnitAdd = {
        name,
        sidc: setCharAt(sidc, SID_INDEX, side.standardIdentity),
        symbolOptions: { fillColor },
        textAmplifiers: {},
        subUnits: [],
        equipment: [],
        personnel: [],
      };
      if (u.options.reinforced) {
        newUnit.reinforcedStatus = mapSpatialIllusionsReinforced(u.options.reinforced);
      }
      if (u.options.additionalInformation) {
        newUnit.textAmplifiers!.additionalInformation = u.options.additionalInformation;
      }
      for (let i = 0; i < stack; i++) {
        const newUnitId = unitActions.addUnit(newUnit as NUnit, parentId);
        u.subOrganizations?.forEach((subUnit) => helper(subUnit, newUnitId));
      }
    }

    helper(oob, parentUnitId.value);
  });

  emit("loaded");
}
</script>
