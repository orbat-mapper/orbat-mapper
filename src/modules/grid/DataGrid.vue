<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from "vue";
import {
  ArrowSmallDownIcon,
  ArrowSmallUpIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import {
  ColumnDef,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  InitialTableState,
  RowSelectionState,
  useVueTable,
} from "@tanstack/vue-table";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { valueUpdater } from "@/modules/grid/helpers";
import { useDebounce } from "@vueuse/core";
import InputGroup from "@/components/InputGroup.vue";

interface Props {
  columns: (ColumnDef<any, any> | false | undefined)[];
  data: any[];
  rowHeight?: number;
  select?: boolean;
  selected?: any[];
  selectAll?: boolean;
  showGlobalFilter?: boolean;
  initialState?: InitialTableState;
  getSubRows?: (row: any) => any[];
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 48,
  select: false,
  selected: () => [],
  selectAll: false,
  showGlobalFilter: false,
});

const emit = defineEmits(["action", "update:selected"]);

const parentRef = ref<HTMLElement | null>(null);
const query = ref("");
const debouncedQuery = useDebounce(query, 200);

const rowSelection = ref<RowSelectionState>({});

const selectColumn: ColumnDef<any, any> = {
  id: "select",
  size: 60,
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
      indeterminate: row.getIsSomeSelected(),
      class:
        "m-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6",
      onChange: row.getToggleSelectedHandler(),
    });
  },
};

onMounted(() => {
  if (props.selectAll) table.toggleAllRowsSelected(true);
});

watch(
  () => props.data,
  () => {
    if (props.selectAll) table.toggleAllRowsSelected(true);
  },
);

const computedColumns = computed((): ColumnDef<any, any>[] => {
  return [props.select && { ...selectColumn }, ...props.columns].filter(
    (e) => e,
  ) as ColumnDef<any, any>[];
});

const table = useVueTable({
  get data() {
    return props.data;
  },
  initialState: props.initialState,
  state: {
    get rowSelection() {
      return rowSelection.value;
    },
    get globalFilter() {
      return debouncedQuery.value;
    },
  },
  enableRowSelection: true,
  columnResizeMode: "onChange",
  get columns() {
    return computedColumns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getGroupedRowModel: getGroupedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  autoResetExpanded: false,
  onRowSelectionChange: (updateOrValue) => valueUpdater(updateOrValue, rowSelection),
  // onGroupingChange: (updateOrValue) => valueUpdater(updateOrValue, grouping),
  onGlobalFilterChange: (updateOrValue) => valueUpdater(updateOrValue, query),
  getSubRows: props.getSubRows,
});

const rowVirtualizerOptions = computed(() => {
  return {
    count: rows.value.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => props.rowHeight,
    overscan: 20,
  };
});
const rows = computed(() => {
  return table.getRowModel().rows;
});

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions);

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());

watch([rowSelection, debouncedQuery], () => {
  const sel: any[] = [];
  table.getFilteredSelectedRowModel().flatRows.forEach((row) => {
    sel.push(row.original);
  });
  emit("update:selected", sel);
});
function onEsc(e: KeyboardEvent) {
  if (query.value.length) {
    e.stopPropagation();
    query.value = "";
  }
}

const filteredRowCount = computed(() => {
  const isGrouped = table.getState().grouping.length > 0;
  if (isGrouped) {
    return table.getRowCount() - table.getGroupedRowModel().rows.length;
  }
  return table.getRowCount();
});
</script>

<template>
  <div class="flex flex-col">
    <header
      v-if="showGlobalFilter"
      class="flex flex-none items-center justify-between pb-2"
    >
      <InputGroup v-model="query" placeholder="Filter rows" @keydown.esc="onEsc" />
      <span class="text-sm">({{ filteredRowCount }} / {{ data.length }})</span>
    </header>
    <section class="relative overflow-auto rounded-lg border shadow" ref="parentRef">
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
              class="flex-0 relative flex w-full select-none items-center justify-between overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
              :class="{ 'cursor-pointer': header.column.getCanSort() }"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <template v-if="!header.isPlaceholder">
                <span class="truncate"
                  ><FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                /></span>
                <!--                <button-->
                <!--                  type="button"-->
                <!--                  v-if="header.column.getCanGroup()"-->
                <!--                  @click.stop="header.column.getToggleGroupingHandler()()"-->
                <!--                >-->
                <!--                  GR-->
                <!--                </button>-->
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
                  class="z-5 absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-red-100 sm:w-2"
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
            class="group absolute flex h-10 w-full divide-x divide-gray-200 text-sm hover:bg-gray-50"
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
                type="button"
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
  </div>
</template>

<style>
.cell {
  @apply flex shrink-0 items-center overflow-hidden text-nowrap border-b p-4;
}
</style>
