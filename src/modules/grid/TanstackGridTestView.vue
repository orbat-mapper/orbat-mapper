<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from "vue";
import type { NUnit } from "@/types/internalModels";
import { useScenario } from "@/scenariostore";
import type { MenuItemData } from "@/components/types";
import { type SideAction, SideActions } from "@/types/constants";
import BaseButton from "@/components/BaseButton.vue";
import {
  type ColumnDef,
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type GroupingState,
  type RowSelectionState,
  type SortingState,
  useVueTable,
} from "@tanstack/vue-table";

import MilitarySymbol from "@/components/MilitarySymbol.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { valueUpdater } from "@/modules/grid/helpers";
import { useDebounce } from "@vueuse/core";
import InputGroup from "@/components/InputGroup.vue";

interface ExtendedUnit extends NUnit {
  sideName: string;
  sideGroupName: string;
  sideId: string;
}

const { scenario } = useScenario();

const doSelect = ref(true);
const rowSelection = ref<RowSelectionState>({});
const grouping = ref<GroupingState>([]);
const query = ref("");
const debouncedQuery = useDebounce(query, 200);
const sorting = ref<SortingState>([]);
const parentRef = ref<HTMLElement | null>(null);
const columnHelper = createColumnHelper<ExtendedUnit>();
const selected = ref<ExtendedUnit[]>([]);
const data = ref<ExtendedUnit[]>([]);

const columns = ref<ColumnDef<ExtendedUnit, any>[]>([
  columnHelper.display({
    id: "select",
    size: 80,
    enableResizing: false,
    header: ({ table }) => {
      return h("input", {
        type: "checkbox",
        checked: table.getIsAllRowsSelected(),
        indeterminate: table.getIsSomeRowsSelected(),
        class:
          "m-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6",
        onChange: table.getToggleAllRowsSelectedHandler(),
      });
    },
    cell: ({ row }) => {
      return h("input", {
        type: "checkbox",
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),

        class:
          "m-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6",
        onChange: row.getToggleSelectedHandler(),
      });
    },
  }),
  columnHelper.accessor("sidc", {
    size: 80,
    header: "Icon",
    enableSorting: false,
    cell: ({ row, getValue, cell }) => {
      return h(MilitarySymbol, {
        sidc: getValue(),
        size: 20,
        modifiers: row.original.symbolOptions,
      });
    },
  }),
  {
    header: "Meta",
    columns: [
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("shortName", { header: "Short name" }),
      columnHelper.accessor("externalUrl", { header: "URL" }),
    ],
  },

  columnHelper.accessor("sideName", { header: "Side" }),
  columnHelper.accessor("sideGroupName", { header: "Side group" }),
  columnHelper.accessor("id", { header: "id", enableGlobalFilter: false }),
  {
    header: "Position",
    enableSorting: false,
    accessorFn: (r) => r._state?.location,
  },
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (props) => {
      return h(DotsMenu, {
        class: "text-wrap",
        items: sideMenuItems,
        onAction: (action: SideAction) => onAction(action, props),
        portal: true,
      });
    },
  }),
]);

const table = useVueTable({
  get data() {
    return data.value;
  },
  state: {
    get rowSelection() {
      return rowSelection.value;
    },
    get grouping() {
      return grouping.value;
    },
    get globalFilter() {
      return debouncedQuery.value;
    },
  },
  enableRowSelection: true,
  columnResizeMode: "onChange",
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  autoResetAll: false,
  autoResetExpanded: false,
  getRowId: (row) => row.id,
  onRowSelectionChange: (updateOrValue) => valueUpdater(updateOrValue, rowSelection),
  onGroupingChange: (updateOrValue) => valueUpdater(updateOrValue, grouping),
  onGlobalFilterChange: (updateOrValue) => valueUpdater(updateOrValue, query),
});

const rowVirtualizerOptions = computed(() => {
  return {
    count: rows.value.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => 40,
    overscan: 5,
  };
});
const rows = computed(() => {
  return table.getRowModel().rows;
});

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());

const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const sideMenuItems: MenuItemData<SideAction>[] = [
  // { label: "Expand", action: SideActions.Expand },
  { label: "Edit", action: SideActions.Edit },
  { label: "Add group", action: SideActions.AddGroup },
  { label: "Delete side", action: SideActions.Delete },
  { label: "Move up", action: SideActions.MoveUp },
  { label: "Move down", action: SideActions.MoveDown },
];

onMounted(async () => {
  await scenario.value.io.loadDemoScenario("falkland82");

  const { unitMap, sideGroupMap, sideMap } = scenario.value.store.state;
  const { unitActions } = scenario.value;
  const unitData: ExtendedUnit[] = [];
  Object.keys(sideMap).forEach((sideId) =>
    scenario.value.unitActions.walkSide(
      sideId,
      (unit, level, parent, sideGroup, side) => {
        unitData.push({
          ...unit,
          sideId: side.id,
          sideName: side?.name,
          sideGroupName: sideGroup.name,
          symbolOptions: unitActions.getCombinedSymbolOptions(unit),
        });
      },
    ),
  );
  data.value = unitData;
  // selected.value.push(data.value[10]);
});

function onAction(action: SideAction, props: any) {
  console.log("on action", action, props);
}

function mutateData() {
  // data.value.splice(10, 5);
  const copy = [...data.value];
  copy[0].name = "Mutated";
  data.value = copy;
  // data.value = data.value.slice().reverse();
}

watch(rowSelection, () => {
  console.log(table.getState().rowSelection); //get the row selection state - { 1: true, 2: false, etc... }
  console.log(table.getSelectedRowModel().rows); //get full client-side selected rows
  console.log(table.getFilteredSelectedRowModel().rows); //get filtered client-side selected rows
  console.log(table.getGroupedSelectedRowModel().rows); //g
});
</script>
<template>
  <main class="flex h-full flex-col">
    <div class="flex shrink-0 items-center gap-4 p-4">
      <span
        >Selected: {{ selected.length }} {{ Object.keys(rowSelection) }}
        {{ grouping }}</span
      >
      <BaseButton @click="mutateData()">Mutate</BaseButton>
      <InputGroup v-model="query" placeholder="Search" />
    </div>
    <section
      class="relative h-full overflow-auto rounded-lg border shadow-sm"
      ref="parentRef"
    >
      <table class="grid">
        <thead class="sticky top-0 z-10">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="flex divide-x divide-gray-200"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{
                width: `${header.getSize()}px`,
              }"
              role="columnheader"
              class="relative flex items-center justify-between overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-left text-sm font-semibold text-gray-900 select-none"
              :class="{ 'cursor-pointer': header.column.getCanSort() }"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <template v-if="!header.isPlaceholder">
                <span class="truncate"
                  ><FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                /></span>
                <button
                  v-if="header.column.getCanGroup()"
                  @click.stop="header.column.getToggleGroupingHandler()()"
                >
                  GR
                </button>
                <span
                  v-if="header.column.getCanSort() && header.column.getIsSorted()"
                  class="flex-none rounded text-gray-700 group-hover:bg-gray-300"
                >
                  <ArrowSmallDownIcon
                    v-if="header.column.getIsSorted() === 'asc'"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                  <ArrowSmallUpIcon
                    v-else-if="header.column.getIsSorted() === 'desc'"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
                <div
                  v-if="header.column.getCanResize()"
                  @dblclick="header.column.resetSize()"
                  @mousedown="header.getResizeHandler()($event)"
                  @touchstart="header.getResizeHandler()($event)"
                  @click.stop
                  role="separator"
                  class="absolute top-0 right-0 z-5 h-full w-4 cursor-col-resize hover:bg-red-100 sm:w-2"
                />
              </template>
            </th>
          </tr>
        </thead>
        <tbody class="relative" :style="{ height: `${rowVirtualizer.getTotalSize()}px` }">
          <tr
            v-for="row in virtualRows"
            :key="row.key as string"
            :style="{ transform: `translateY(${row.start}px)` }"
            class="group absolute flex h-10 w-full divide-x divide-gray-200 hover:bg-gray-50"
            :data-index="row.index"
          >
            <td
              v-for="(cell, idx) in rows[row.index].getVisibleCells()"
              :key="cell.id"
              :id="cell.id"
              :style="{
                width: `${cell.column.getSize()}px`,
              }"
              class="cell"
              :data-index="idx"
            >
              <button
                v-if="cell.getIsGrouped()"
                @click="cell.row.toggleExpanded()"
                class="flex items-center"
              >
                <ChevronRightIcon
                  class="h-6 w-6 text-red-800 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
                  :class="{
                    'rotate-90': cell.row.getIsExpanded(),
                  }"
                />

                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />&nbsp; ({{ cell.row.subRows.length }})
              </button>
              <FlexRender
                v-else-if="!cell.getIsPlaceholder()"
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style>
@reference "../../styles.css";

.cell {
  @apply flex shrink-0 items-center overflow-hidden border-b p-4 text-nowrap;
}
</style>
