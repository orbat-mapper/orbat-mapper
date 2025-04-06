<script setup lang="ts">
import OrbatGrid from "@/modules/grid/OrbatGrid.vue";

import type { ColumnProperties } from "@/modules/grid/gridTypes";
import type { NUnit } from "@/types/internalModels";
import { onMounted, ref } from "vue";
import { useScenario } from "@/scenariostore";
import type { MenuItemData } from "@/components/types";
import { type SideAction, SideActions } from "@/types/constants";
import ToggleField from "@/components/ToggleField.vue";
import BaseButton from "@/components/BaseButton.vue";

interface ExtendedUnit extends NUnit {
  sideName: string;
  sideId: string;
}
const data = ref<NUnit[]>([]);

const sideMenuItems: MenuItemData<SideAction>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
  { label: "Delete side", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];

const columns = ref<ColumnProperties<ExtendedUnit>[]>([
  // { field: "id", label: "menu", type: "dots", width: 60, menu: sideMenuItems },
  { field: "sidc", label: "Icon", type: "sidc", width: 65, resizable: false },
  { field: "name", label: "Name", sortable: true },
  { field: "shortName", label: "Short name", sortable: true },
  { field: "externalUrl", label: "URL" },
  { field: "sideName", label: "Side", rowGroup: true, sortable: true },
  { field: "id", label: "id" },
  { field: "state.0.location", label: "p[0]" },
]);
const { scenario, isReady } = useScenario();

const selected = ref<ExtendedUnit[]>([]);

onMounted(async () => {
  await scenario.value.io.loadDemoScenario("falkland82");

  const { unitMap, sideGroupMap, sideMap } = scenario.value.store.state;
  const unitData: ExtendedUnit[] = [];
  Object.keys(sideMap).forEach((sideId) =>
    scenario.value.unitActions.walkSide(
      sideId,
      (unit, level, parent, sideGroup, side) => {
        unitData.push({ ...unit, sideId: side.id, sideName: side?.name });
      },
    ),
  );
  data.value = unitData;
  // selected.value.push(data.value[10]);
});

function onAction(action: SideAction, { data, index }: any) {
  console.log("on action", action, data, index);
}

function mutateData() {
  data.value.splice(10, 5);
  data.value = [...data.value];
  // data.value = data.value.slice().reverse();
}

const doSelect = ref(true);
</script>
<template>
  <main class="h-full pt-10 sm:p-10">
    <div class="fixed top-0 z-40 flex items-center gap-4 p-1">
      <ToggleField v-model="doSelect">Select</ToggleField
      ><span v-if="doSelect">Selected: {{ selected.length }}</span>
      <BaseButton @click="mutateData()">Mutate</BaseButton>
    </div>
    <section class="h-full">
      <OrbatGrid
        :data="data"
        :columns="columns"
        @action="onAction"
        :select="doSelect"
        v-model:selected="selected"
      />
    </section>
  </main>
</template>
