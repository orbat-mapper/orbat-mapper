<template>
  <div
    class="relative flex min-h-0 flex-auto"
    @keydown.down="doArrows('down', $event)"
    @keydown.up="doArrows('up', $event)"
    @keydown.left="doArrows('left', $event)"
    @keydown.right="doArrows('right', $event)"
    tabindex="-1"
  >
    <div
      ref="target"
      class="flex h-full w-full flex-col overflow-hidden bg-gray-50 shadow sm:rounded-lg"
    >
      <header
        class="flex flex-shrink-0 items-center justify-between border-b border-gray-300 px-4 py-3 sm:px-6"
      >
        <div class="flex w-full items-center space-x-2 sm:w-auto">
          <FilterQueryInput class="" v-model="filterQuery" />
          <BaseButton @click="toggleSides()" small>Toggle sides</BaseButton>
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
                @update-unit="updateUnit"
                @next-cell="nextCell"
              />
              <GridSideRow
                v-else-if="item.type === 'side'"
                :side="item.side"
                :columns="columns"
                :side-open="sideOpen"
                @toggle="toggleSide"
                :item-index="itemIndex"
                @next-cell="nextCell"
                @update-side="updateSide"
              />
              <GridSideGroupRow
                v-else-if="item.type === 'sidegroup'"
                :side-group="item.sideGroup"
                :columns="columns"
                :sg-open="sgOpen"
                @toggle="toggleSideGroup"
                @expand="expandSideGroup"
                :item-index="itemIndex"
                @next-cell="nextCell"
                @update-side-group="updateSideGroup"
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
import { useDebounce } from "@vueuse/core";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import { computed, ref, watch } from "vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import FilterQueryInput from "@/components/FilterQueryInput.vue";
import { ColumnField, TableColumn, TableItem } from "@/modules/scenarioeditor/types";
import { filterUnits, NOrbatItemData } from "@/composables/filtering";
import { NWalkSideCallback } from "@/scenariostore/unitManipulations";
import GridHeader from "@/modules/scenarioeditor/GridHeader.vue";
import GridSideGroupRow from "@/modules/scenarioeditor/GridSideGroupRow.vue";
import GridSideRow from "@/modules/scenarioeditor/GridSideRow.vue";
import GridSideUnitRow from "@/modules/scenarioeditor/GridSideUnitRow.vue";
import BaseButton from "@/components/BaseButton.vue";

const router = useRouter();
const uiStore = useUiStore();
const target = ref();

const activeUnit = ref<NUnit | null | undefined>();
const activeColumn = ref<ColumnField>();
const activeScenario = injectStrict(activeScenarioKey);
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
const sideOpen = ref(new Map<NSide, boolean>());

const { updateUnit, updateSide, updateSideGroup } = unitActions;
const filterQuery = ref("");
const sidesToggled = ref(false);
const debouncedFilterQuery = useDebounce(filterQuery, 250);
const queryHasChanged = ref(true);

interface SideItem {
  side: NSide;
  children: SideGroupItem[];
}

interface SideGroupItem {
  sideGroup: NSideGroup;
  children: NOrbatItemData[];
}

watch(debouncedFilterQuery, (v) => {
  queryHasChanged.value = true;
});

const filteredOrbat = computed(() => {
  const sideList: SideItem[] = [];
  const resetOpen = queryHasChanged.value;
  queryHasChanged.value = false;
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
            debouncedFilterQuery.value,
            false,
            resetOpen
          );
          if (filteredUnits.length) {
            sideGroupList.push({ sideGroup, children: filteredUnits });
          }
        });
      if (sideGroupList.length) {
        sideList.push({ side, children: sideGroupList });
      }
    });
  if (queryHasChanged) {
    sgOpen.value.clear();
    sideOpen.value.clear();
  }

  return sideList;
});

const items = computed(() => {
  const _items: TableItem[] = [];
  filteredOrbat.value.forEach(({ side, children: sideGroups }) => {
    _items.push({ type: "side", side, id: side.id });
    if (!(sideOpen.value.get(side) ?? true)) return;
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

function toggleSide(side: NSide) {
  sideOpen.value.set(side, !(sideOpen.value.get(side) ?? true));
}

function toggleSides() {
  state.sides
    .map((id) => state.sideMap[id])
    .forEach((side) => sideOpen.value.set(side, sidesToggled.value));
  sidesToggled.value = !sidesToggled.value;
}

function doArrows(
  direction: "up" | "down" | "left" | "right",
  e: KeyboardEvent | { target: HTMLElement }
) {
  const target = e.target as HTMLElement;
  if (!target.id.startsWith("cell-")) return;
  if (e instanceof KeyboardEvent) e.preventDefault();
  const [_, y, x] = target.id.split("-");
  let nextY = +y;
  let nextX = +x;
  if (direction === "up") nextY--;
  if (direction === "down") nextY++;
  if (direction === "left") nextX--;
  if (direction === "right") nextX++;

  let nextId = `cell-${nextY}-${nextX}`;
  let nextElement = document.getElementById(nextId);
  if (!nextElement && (direction === "up" || direction === "down")) {
    let nextItem = items.value[nextY];

    while (nextItem) {
      nextY = direction === "up" ? nextY - 1 : nextY + 1;
      nextItem = items.value[nextY];
      nextId = `cell-${nextY}-${nextX}`;
      nextElement = document.getElementById(nextId);
      if (nextElement) break;
    }
  }

  nextElement?.focus({});
}

function nextCell(element: HTMLElement) {
  doArrows("down", { target: element });
}
</script>