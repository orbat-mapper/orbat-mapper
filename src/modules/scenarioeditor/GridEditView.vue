<template>
  <div
    class="relative flex min-h-0 flex-auto"
    @keydown.down="doArrows('down', $event)"
    @keydown.up="doArrows('up', $event)"
    @keydown.left="doArrows('left', $event)"
    @keydown.right="doArrows('right', $event)"
    @keydown.delete="doDelete"
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
          <BaseButton small @click="createNewItem">Create subordinate</BaseButton>
          <BaseButton small @click="duplicateItem">Create unit</BaseButton>
        </div>
      </header>
      <div class="relative min-w-0 max-w-none flex-auto overflow-auto pb-7">
        <table class="w-full table-fixed">
          <GridHeader :columns="columns" />
          <tbody class="divide-y divide-gray-200 bg-white">
            <template v-for="(item, itemIndex) in items" :key="item.id">
              <GridUnitRow
                v-if="item.type === 'unit'"
                :unit="item.unit"
                :columns="columns"
                :level="item.level"
                :item-index="itemIndex"
                @update-unit="updateUnit"
                @next-cell="nextCell"
                @active-item="onActiveItem(item, $event)"
                :is-active="activeItem?.id === item.id"
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
                @active-item="onActiveItem(item, $event)"
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
                @active-item="onActiveItem(item, $event)"
              />
            </template>
          </tbody>
        </table>
      </div>
      <footer class="h-12 flex-shrink-0 border-t border-gray-300 bg-gray-200"></footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounce, useEventListener } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useUiStore } from "@/stores/uiStore";
import { computed, nextTick, onMounted, ref, watch } from "vue";
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
import GridUnitRow from "@/modules/scenarioeditor/GridUnitRow.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useSearchActions } from "@/composables/search";
import { useNotifications } from "@/composables/notifications";
import { inputEventFilter } from "@/components/helpers";

const router = useRouter();
const uiStore = useUiStore();
const target = ref<HTMLDivElement>();

const activeItem = ref<TableItem | null | undefined>();
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
const { send } = useNotifications();

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

useEventListener(document, "paste", onPaste);
useEventListener(document, "copy", onCopy);

onMounted(() => {
  document.getElementById("cell-0-1")?.focus();
});

const { onUnitSelect } = useSearchActions();
onUnitSelect(({ unitId }) => {
  const { parents, side, sideGroup } = unitActions.getUnitHierarchy(unitId);
  sgOpen.value.set(sideGroup, true);
  sideOpen.value.set(side, true);
  parents.forEach((p) => (p._isOpen = true));
  nextTick(() => {
    const el = document.getElementById(`item-${unitId}`);
    if (el) {
      const firstEditableCell = el.querySelector(".editable-cell") as HTMLElement;
      if (firstEditableCell) {
        setTimeout(() => firstEditableCell?.focus(), 200);
      }
    } else {
      send({ message: "Unit is currently filtered out" });
    }
  });
});

function onCopy(c: ClipboardEvent) {
  if (!inputEventFilter(c)) return;
  // Use document.activeElement instead of c.target because Chrome will not
  // emit copy/paste events for programmatically focused div elements.
  const target = document.activeElement as HTMLDivElement;
  if (
    !(
      target?.classList.contains("editable-cell") ||
      target?.parentElement?.classList.contains("editable-cell")
    )
  )
    return;
  const text = target.textContent || "";
  c.clipboardData?.setData("text/plain", text.trim());
  c.preventDefault();
}

function onPaste(e: ClipboardEvent) {
  if (!inputEventFilter(e)) return;
  const target = document.activeElement as HTMLDivElement;
  if (
    !(
      target?.classList.contains("editable-cell") ||
      target?.parentElement?.classList.contains("editable-cell")
    )
  )
    return;
  e.preventDefault();
  const txt = e.clipboardData?.getData("text/plain").trim();
  txt && updateActiveItemValue(txt);
}

function onActiveItem(item: TableItem, column: ColumnField) {
  activeItem.value = item;
  activeColumn.value = column;
}

const createNewItem = () => {
  const item = activeItem.value;
  if (!item) return;
  item.type === "unit" && unitActions.createSubordinateUnit(item.unit.id);
};

const duplicateItem = () => {
  const item = activeItem.value;
  if (!item) return;
  item.type === "unit" && unitActions.cloneUnit(item.unit.id);
};
function updateActiveItemValue(txt: string) {
  const item = activeItem.value;
  const column = activeColumn.value;
  if (item && column) {
    switch (item.type) {
      case "unit":
        updateUnit(item.id, { [column]: txt });
        break;
      case "side":
        updateSide(item.id, { [column]: txt });
        break;
      case "sidegroup":
        updateSideGroup(item.id, { [column]: txt });
        break;
    }
  }
}

function doDelete(e: KeyboardEvent) {
  const target = e.target as HTMLDivElement;
  if (!target?.classList.contains("editable-cell")) return;
  e.preventDefault();

  updateActiveItemValue("");
}
</script>
