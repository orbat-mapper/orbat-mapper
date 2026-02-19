<script setup lang="ts">
import { useDebounce, useEventListener, useStorage } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { injectStrict } from "@/utils";
import { activeScenarioKey, sidcModalKey } from "@/components/injects";
import type { NSide, NSideGroup, NUnit } from "@/types/internalModels";
import FilterQueryInput from "@/components/FilterQueryInput.vue";
import type { ColumnField, TableColumn, TableItem } from "@/modules/scenarioeditor/types";
import { filterUnits, type NOrbatItemData } from "@/composables/filtering";
import { type NWalkSideGroupCallback } from "@/scenariostore/unitManipulations";
import GridHeader from "@/modules/scenarioeditor/GridHeader.vue";
import GridSideGroupRow from "@/modules/scenarioeditor/GridSideGroupRow.vue";
import GridSideRow from "@/modules/scenarioeditor/GridSideRow.vue";
import GridUnitRow from "@/modules/scenarioeditor/GridUnitRow.vue";
import BaseButton from "@/components/BaseButton.vue";
import { useSearchActions } from "@/composables/searchActions";
import { useNotifications } from "@/composables/notifications";
import { inputEventFilter } from "@/components/helpers";
import CheckboxDropdown from "@/components/CheckboxDropdown.vue";
import { type EntityId } from "@/types/base";
import {
  findNextFocusableRowIndex,
  getRowIndexByEntityId,
  isCellFocusable,
} from "@/modules/scenarioeditor/gridEditVirtualization";

const ROW_HEIGHT = 48;
const VIRTUAL_OVERSCAN = 20;

type GridArrowDirection = "up" | "down" | "left" | "right";
type ScrollAlignment = "auto" | "center" | "end" | "start";

const target = ref<HTMLDivElement | null>(null);
const scrollContainerRef = ref<HTMLDivElement | null>(null);
let focusRequestId = 0;
let isUnmounted = false;

const { getModalSidc } = injectStrict(sidcModalKey);

const activeItem = ref<TableItem | null | undefined>();
const activeColumn = ref<ColumnField>();
const activeScenario = injectStrict(activeScenarioKey);
const {
  store: { state },
  unitActions,
} = activeScenario;

const availableColumns: TableColumn[] = [
  { value: "name", label: "Name", type: "text" },
  { value: "shortName", label: "Short name", type: "text" },
  { value: "sidc", label: "Symbol code", type: "sidc" },
  { value: "externalUrl", label: "URL", type: "text", hidden: true },
  { value: "description", label: "Description", type: "markdown", hidden: true },
  { value: "id", label: "Id", type: "text", hidden: true },
];

const selectedColumns = useStorage(
  "grid-columns-1",
  availableColumns.filter((e) => !(e.hidden === true)).map((e) => e.value),
);

const columns = computed(() =>
  availableColumns.filter((c) => selectedColumns.value.includes(c.value)),
);

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

interface VirtualGridRow {
  key: string | number;
  index: number;
  item: TableItem;
}

watch(debouncedFilterQuery, () => {
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
      const dummyGroups = [...side.groups];
      if (side.subUnits) {
        dummyGroups.push(side.id);
      }
      dummyGroups
        .map((id) => {
          if (id in state.sideGroupMap) {
            return state.sideGroupMap[id];
          } else {
            // Create a dummy side group for root units
            return {
              id: side.id,
              name: "(Root units)",
              shortName: "",
              _pid: side.id,
              subUnits: side.subUnits || [],
            } as NSideGroup;
          }
        })
        .forEach((sideGroup) => {
          const filteredUnits = filterUnits(
            sideGroup.subUnits,
            state.unitMap,
            debouncedFilterQuery.value,
            false,
            resetOpen,
          );
          if (filteredUnits.length) {
            sideGroupList.push({ sideGroup, children: filteredUnits });
          }
        });
      if (sideGroupList.length) {
        sideList.push({ side, children: sideGroupList });
      }
    });
  if (queryHasChanged.value) {
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

const rowVirtualizerOptions = computed(() => ({
  count: items.value.length,
  getScrollElement: () => scrollContainerRef.value,
  estimateSize: () => ROW_HEIGHT,
  overscan: VIRTUAL_OVERSCAN,
}));

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());

const virtualItems = computed<VirtualGridRow[]>(() => {
  const rows: VirtualGridRow[] = [];
  for (const virtualRow of virtualRows.value) {
    const item = items.value[virtualRow.index];
    if (!item) continue;
    rows.push({
      key: typeof virtualRow.key === "bigint" ? virtualRow.key.toString() : virtualRow.key,
      index: virtualRow.index,
      item,
    });
  }
  return rows;
});

const paddingTop = computed(() => virtualRows.value[0]?.start ?? 0);

const paddingBottom = computed(() => {
  const rows = virtualRows.value;
  if (!rows.length) return 0;
  const last = rows[rows.length - 1];
  return Math.max(0, rowVirtualizer.value.getTotalSize() - last.end);
});

const totalColumns = computed(() => columns.value.length + 2);

const rowIndexById = computed(() => getRowIndexByEntityId(items.value));

function walkSideGroupItem(
  sideGroupItem: SideGroupItem,
  callback: NWalkSideGroupCallback,
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

function expandUnit(unitId: EntityId, open: boolean) {
  unitActions.walkSubUnits(unitId, (unit) => (unit._isOpen = open), {
    includeParent: true,
  });
}

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
    expandUnit(unitId, open);
  });
}

function toggleExpandItem() {
  if (!activeItem.value) return;
  const item = activeItem.value;
  const { type } = item;
  if (type === "sidegroup") {
    expandSideGroup(item.sideGroup);
  } else if (type === "unit") {
    const open = !(item.unit._isOpen ?? true);
    expandUnit(item.unit.id, open);
  } else if (type === "side") {
    const open = !(sideOpen.value.get(item.side) ?? true);
    if (open) item.side.groups.forEach((g) => expandSideGroup(state.sideGroupMap[g]));
  }
}

function toggleOpenItem() {
  if (!activeItem.value) return;
  const { type } = activeItem.value;
  if (type === "unit") {
    activeItem.value.unit._isOpen = !activeItem.value.unit._isOpen;
  } else if (type === "side") {
    toggleSide(activeItem.value.side);
  } else if (type === "sidegroup") {
    toggleSideGroup(activeItem.value.sideGroup);
  }
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

function parseCellCoordinates(
  target: HTMLElement,
): { rowIndex: number; colIndex: number } | null {
  const source = target.id.startsWith("cell-")
    ? target
    : target.closest<HTMLElement>("[id^='cell-']");

  if (!source) return null;

  const [prefix, row, col] = source.id.split("-");
  if (prefix !== "cell") return null;

  const rowIndex = Number(row);
  const colIndex = Number(col);

  if (!Number.isInteger(rowIndex) || !Number.isInteger(colIndex)) return null;

  return { rowIndex, colIndex };
}

function sleepFrame() {
  return new Promise<void>((resolve) => window.setTimeout(resolve, 16));
}

async function focusCell(
  rowIndex: number,
  colIndex: number,
  align: ScrollAlignment = "auto",
): Promise<boolean> {
  const currentRequestId = ++focusRequestId;

  if (rowIndex < 0 || rowIndex >= items.value.length) return false;

  rowVirtualizer.value.scrollToIndex(rowIndex, { align });

  for (let attempts = 0; attempts < 12; attempts += 1) {
    if (isUnmounted || currentRequestId !== focusRequestId) return false;

    await nextTick();

    const cell = document.getElementById(
      `cell-${rowIndex}-${colIndex}`,
    ) as HTMLElement | null;

    if (cell) {
      if (isUnmounted || currentRequestId !== focusRequestId) return false;

      activeItem.value = items.value[rowIndex];
      cell.focus({});
      return true;
    }

    rowVirtualizer.value.scrollToIndex(rowIndex, { align });
    await sleepFrame();
  }

  return false;
}

function doArrows(
  direction: GridArrowDirection,
  e: KeyboardEvent | { target: HTMLElement },
) {
  const rawTarget = e.target as HTMLElement | null;
  if (!rawTarget) return;

  const location = parseCellCoordinates(rawTarget);
  if (!location) return;

  if (e instanceof KeyboardEvent) e.preventDefault();

  const { rowIndex, colIndex } = location;

  if (direction === "left" || direction === "right") {
    const item = items.value[rowIndex];
    if (!item) return;

    const nextColIndex = direction === "left" ? colIndex - 1 : colIndex + 1;

    if (!isCellFocusable(item.type, nextColIndex, columns.value.length)) return;

    void focusCell(rowIndex, nextColIndex, "auto");
    return;
  }

  const nextRowIndex = findNextFocusableRowIndex(
    items.value,
    rowIndex,
    colIndex,
    direction,
    columns.value.length,
  );

  if (nextRowIndex === null) return;

  void focusCell(nextRowIndex, colIndex, "auto");
}

function nextCell(element: HTMLElement) {
  doArrows("down", { target: element });
}

useEventListener(document, "paste", onPaste);
useEventListener(document, "copy", onCopy);

onMounted(() => {
  void focusCell(0, 1, "start");
});

onUnmounted(() => {
  isUnmounted = true;
  focusRequestId += 1;
});

const { onUnitSelect } = useSearchActions();
onUnitSelect(({ unitId }) => {
  const { parents, side, sideGroup } = unitActions.getUnitHierarchy(unitId);
  sideGroup && sgOpen.value.set(sideGroup, true);
  sideOpen.value.set(side, true);
  parents.forEach((p) => (p._isOpen = true));

  void nextTick(async () => {
    let rowIndex = rowIndexById.value.get(unitId);

    if (rowIndex === undefined || items.value[rowIndex]?.type !== "unit") {
      rowIndex = items.value.findIndex(
        (item) => item.type === "unit" && item.id === unitId,
      );
    }

    if (rowIndex === -1 || rowIndex === undefined) {
      send({ message: "Unit is currently filtered out" });
      return;
    }

    const focused = await focusCell(rowIndex, 1, "center");

    if (!focused) {
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

const deleteItem = () => {
  const item = activeItem.value;
  if (!item) return;
  item.type === "unit" && unitActions.deleteUnit(item.unit.id);
  item.type === "side" && unitActions.deleteSide(item.side.id);
  item.type === "sidegroup" && unitActions.deleteSideGroup(item.sideGroup.id);
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

async function onUnitEdit(unit: NUnit, b: ColumnField, c: string) {
  if (b === "sidc") {
    const newSidcValue = await getModalSidc(c, {
      symbolOptions: unit.symbolOptions,
      inheritedSymbolOptions: unitActions.getCombinedSymbolOptions(unit, true),
      reinforcedStatus: unit.reinforcedStatus,
    });
    if (newSidcValue !== undefined) {
      updateUnit(unit.id, {
        sidc: newSidcValue.sidc,
        symbolOptions: newSidcValue.symbolOptions,
        reinforcedStatus: newSidcValue.reinforcedStatus,
      });
    }
  }
}
</script>

<template>
  <div
    class="relative flex min-h-0 flex-auto"
    @keydown.down="doArrows('down', $event)"
    @keydown.up="doArrows('up', $event)"
    @keydown.left="doArrows('left', $event)"
    @keydown.right="doArrows('right', $event)"
    @keydown.delete="doDelete"
    @keydown.shift.enter="duplicateItem"
    @keydown.alt.enter="createNewItem"
    @keydown.ctrl.e="toggleExpandItem"
    @keydown.alt.x="toggleOpenItem"
  >
    <div
      ref="target"
      class="border-border bg-card text-foreground flex h-full w-full flex-col overflow-hidden border shadow-sm sm:rounded-lg"
    >
      <header
        class="border-border bg-muted/60 flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6"
      >
        <div class="flex w-full items-center space-x-2 overflow-x-auto sm:w-auto">
          <FilterQueryInput class="" v-model="filterQuery" />
          <BaseButton @click="toggleSides()" small>Toggle sides</BaseButton>
          <BaseButton small @click="createNewItem">Create subordinate</BaseButton>
          <BaseButton small @click="duplicateItem">Duplicate unit</BaseButton>
          <BaseButton small @click="deleteItem" :disabled="!activeItem"
            >Delete item</BaseButton
          >
        </div>
        <CheckboxDropdown :options="availableColumns" v-model="selectedColumns"
          >Columns</CheckboxDropdown
        >
      </header>
      <div
        ref="scrollContainerRef"
        class="relative max-w-none min-w-0 flex-auto overflow-auto pb-7"
      >
        <table class="text-foreground w-full table-fixed text-sm">
          <GridHeader :columns="columns" />
          <tbody class="divide-border bg-card divide-y">
            <tr v-if="paddingTop > 0" aria-hidden="true">
              <td
                class="h-0 border-0 p-0"
                :colspan="totalColumns"
                :style="{ height: `${paddingTop}px` }"
              ></td>
            </tr>

            <template v-for="entry in virtualItems" :key="entry.key">
              <GridUnitRow
                v-if="entry.item.type === 'unit'"
                :unit="entry.item.unit"
                :columns="columns"
                :level="entry.item.level"
                :item-index="entry.index"
                @update-unit="updateUnit"
                @next-cell="nextCell"
                @active-item="onActiveItem(entry.item, $event)"
                :is-active="activeItem?.id === entry.item.id"
                @edit="onUnitEdit"
              />
              <GridSideRow
                v-else-if="entry.item.type === 'side'"
                :side="entry.item.side"
                :columns="columns"
                :side-open="sideOpen"
                @toggle="toggleSide"
                :item-index="entry.index"
                @next-cell="nextCell"
                @update-side="updateSide"
                @active-item="onActiveItem(entry.item, $event)"
                :is-active="activeItem?.id === entry.item.id"
              />
              <GridSideGroupRow
                v-else-if="entry.item.type === 'sidegroup'"
                :side-group="entry.item.sideGroup"
                :columns="columns"
                :sg-open="sgOpen"
                @toggle="toggleSideGroup"
                @expand="expandSideGroup"
                :item-index="entry.index"
                @next-cell="nextCell"
                @update-side-group="updateSideGroup"
                @active-item="onActiveItem(entry.item, $event)"
                :is-active="activeItem?.id === entry.item.id"
              />
            </template>

            <tr v-if="paddingBottom > 0" aria-hidden="true">
              <td
                class="h-0 border-0 p-0"
                :colspan="totalColumns"
                :style="{ height: `${paddingBottom}px` }"
              ></td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="border-border bg-muted/60 h-12 shrink-0 border-t"></footer>
    </div>
  </div>
</template>
