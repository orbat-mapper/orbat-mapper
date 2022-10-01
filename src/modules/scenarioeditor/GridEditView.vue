<template>
  <div class="relative flex min-h-0 flex-auto">
    <div
      ref="target"
      class="flex h-full w-full flex-col overflow-hidden bg-gray-50 shadow sm:rounded-lg"
    >
      <header
        class="flex flex-shrink-0 items-center justify-between border-b border-gray-300 px-4 py-3 sm:px-6"
      >
        <div class="w-full sm:w-auto">
          <FilterQueryInput class="" v-model="filterQuery" />
        </div>
      </header>
      <div class="relative min-w-0 max-w-none flex-auto overflow-auto pb-7">
        <table class="w-full table-fixed">
          <GridHeader :columns="columns" />
          <tbody class="divide-y divide-gray-200 bg-white">
            <template v-for="(item, itemIndex) in items" :key="item.id">
              <GridSideUnitRow
                v-if="item.type === 'unit'"
                :unit="item.unit"
                :columns="columns"
                :level="item.level"
                :item-index="itemIndex"
                :active-unit="activeUnit"
                :active-column="activeColumn"
                @edit="activateEdit"
                @tab="onTab"
                @up="onUp"
                @down="onDown"
                @submit="onSubmit"
                @update="editedValue = $event"
              />
              <GridSideRow
                v-else-if="item.type === 'side'"
                :side="item.side"
                :columns="columns"
              />
              <GridSideGroupRow
                v-else-if="item.type === 'sidegroup'"
                :side-group="item.sideGroup"
                :columns="columns"
                :sg-open="sgOpen"
                @toggle="toggleSideGroup"
                @expand="expandSideGroup"
              />
            </template>
          </tbody>
        </table>
      </div>
      <footer class="h-12 flex-shrink-0 border-t border-gray-300 bg-gray-200"></footer>
    </div>

    <!--    <GlobalEvents @keydown.tab="onTabTest" />-->
  </div>
</template>

<script setup lang="ts">
import { onStartTyping, useDebounce } from "@vueuse/core";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import { computed, ref, VNode } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import MilSymbol from "@/components/MilSymbol.vue";
import FilterQueryInput from "@/components/FilterQueryInput.vue";
import { ColumnField, TableColumn, TableItem } from "@/modules/scenarioeditor/types";
import { filterUnits, NOrbatItemData } from "@/composables/filtering";
import { NWalkSideCallback } from "@/scenariostore/unitManipulations";
import GridHeader from "@/modules/scenarioeditor/GridHeader.vue";
import GridSideGroupRow from "@/modules/scenarioeditor/GridSideGroupRow.vue";
import GridSideRow from "@/modules/scenarioeditor/GridSideRow.vue";
import GridSideUnitRow from "@/modules/scenarioeditor/GridSideUnitRow.vue";

const router = useRouter();
const uiStore = useUiStore();
const target = ref();

const activeUnit = ref<NUnit | null | undefined>();
const activeColumn = ref<ColumnField>();
const activeItemIndex = ref(-1);
const activeScenario = injectStrict(activeScenarioKey);
const editedValue = ref<string | undefined>();
const {
  store: { state },
  unitActions,
} = activeScenario;

const columns = ref<TableColumn[]>([
  { field: "name", title: "Name" },
  { field: "shortName", title: "Short name" },
  { field: "sidc", title: "Symbol code" },
]);

const sgOpen = ref(new Map<NSideGroup, boolean>());

const { updateUnit } = unitActions;
const filterQuery = ref("");

const debouncedFilterQuery = useDebounce(filterQuery, 250);

interface SideItem {
  side: NSide;
  children: SideGroupItem[];
}

interface SideGroupItem {
  sideGroup: NSideGroup;
  children: NOrbatItemData[];
}

const filteredOrbat = computed(() => {
  const sideList: SideItem[] = [];
  state.sides
    .map((id) => state.sideMap[id])
    .forEach((side) => {
      const sideGroupList: SideGroupItem[] = [];
      side.groups
        .map((id) => state.sideGroupMap[id])
        .forEach((sideGroup) => {
          const filteredUnits = filterUnits(
            sideGroup.subUnits,
            state.unitMap,
            debouncedFilterQuery.value
          );
          if (filteredUnits.length) {
            sideGroupList.push({ sideGroup, children: filteredUnits });
          }
        });
      if (sideGroupList.length) {
        sideList.push({ side, children: sideGroupList });
      }
    });
  return sideList;
});

const items = computed(() => {
  const _items: TableItem[] = [];
  filteredOrbat.value.forEach(({ side, children: sideGroups }) => {
    _items.push({ type: "side", side, id: side.id });
    sideGroups.forEach((sg) => {
      const { sideGroup } = sg;
      _items.push({ type: "sidegroup", sideGroup, id: sideGroup.id });
      if (!(sgOpen.value.get(sideGroup) ?? true)) return;
      walkSideGroupItem(sg, (unit, level, parent, sideGroup) => {
        _items.push({ type: "unit", unit, id: unit.id, level });
        if (unit.subUnits.length && unit._isOpen === false) return false;
      });
    });
  });
  return _items;
});

function walkSideGroupItem(
  sideGroupItem: SideGroupItem,
  callback: NWalkSideCallback,
  s = state
) {
  let level = 0;

  function helper({ unit, children }: NOrbatItemData, parent: NUnit | NSideGroup) {
    const r = callback(unit, level, parent, sideGroupItem.sideGroup);
    if (r !== undefined) return r;
    if (children.length) {
      level += 1;
      for (const subUnitId of children) {
        helper(subUnitId, unit);
      }
      level -= 1;
    }
  }

  for (const unitId of sideGroupItem.children) {
    const r = helper(unitId, sideGroupItem.sideGroup);
    if (r === true) break;
  }
}

uiStore.modalOpen = true;
onBeforeRouteLeave(() => {
  uiStore.modalOpen = false;
});

function activateEdit(unit: NUnit, itemIndex: number, column: ColumnField) {
  onSubmit();

  activeUnit.value = unit;
  activeColumn.value = column;
  activeItemIndex.value = itemIndex;
}

function onSubmit(e?: Event) {
  if (activeUnit.value && editedValue.value != undefined) {
    updateUnit(activeUnit.value.id, { [activeColumn.value!]: editedValue.value });
  }

  activeUnit.value = null;
  editedValue.value = undefined;
}

function onTab(unit: NUnit, itemIndex: number, column: ColumnField) {
  if (unit) {
    const columnIndex = columns.value.findIndex((c) => c.field === column);
    let nextIndex = 0;
    if (columnIndex < columns.value.length - 1) {
      nextIndex = columnIndex + 1;
    }
    activateEdit(unit, itemIndex, columns.value[nextIndex].field);
  }
}

function onDown(itemIndex: number) {
  if (!activeUnit.value) return;
  let idx = itemIndex + 1;
  let nextItem = items.value[idx];
  while (nextItem && nextItem.type !== "unit") {
    nextItem = items.value[++idx];
  }
  if (nextItem?.type === "unit") {
    activateEdit(nextItem.unit, itemIndex + 1, activeColumn.value!);
  }
}

function onUp(itemIndex: number) {
  if (!activeUnit.value) return;
  let idx = itemIndex - 1;
  let prevItem = items.value[idx];
  while (prevItem && prevItem.type !== "unit") {
    prevItem = items.value[--idx];
  }
  if (prevItem?.type === "unit") {
    activateEdit(prevItem.unit, itemIndex - 1, activeColumn.value!);
  }
}

function updateValue(event: Event) {
  editedValue.value = (<HTMLInputElement>event.target).value;
}

const onVMounted = ({ el }: VNode) => {
  el?.focus();
};

onStartTyping((e) => {
  // console.log("Start typing", e);
});

const expandMap = new WeakSet<NSideGroup>();

function expandSideGroup(sideGroup: NSideGroup) {
  let open = true;
  if (expandMap.has(sideGroup)) {
    open = false;
    expandMap.delete(sideGroup);
  } else {
    expandMap.add(sideGroup);
    sgOpen.value.set(sideGroup, true);
  }

  sideGroup.subUnits.forEach((unitId) => {
    unitActions.walkSubUnits(unitId, (unit) => (unit._isOpen = open), {
      includeParent: true,
    });
  });
}

function toggleSideGroup(sideGroup: NSideGroup) {
  sgOpen.value.set(sideGroup, !(sgOpen.value.get(sideGroup) ?? true));
}
</script>
