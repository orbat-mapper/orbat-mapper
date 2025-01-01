<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from "vue";
import { ArrowSmallDownIcon, ArrowSmallUpIcon } from "@heroicons/vue/20/solid";
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
import { valueUpdater } from "@/modules/grid/helpers";
import { useDebounce } from "@vueuse/core";
import ToeGridTableMenu from "@/modules/scenarioeditor/ToeGridTableMenu.vue";
import { storeToRefs } from "pinia";
import { TableStore } from "@/stores/tableStores";
import BaseButton from "@/components/BaseButton.vue";

interface Props {
  columns: (ColumnDef<any, any> | false | undefined)[];
  data: any[];
  rowCount?: number;
  select?: boolean;
  selectAll?: boolean;
  showGlobalFilter?: boolean;
  initialState?: InitialTableState;
  getSubRows?: (row: any) => any[];
  noIndeterminate?: boolean;
  dense?: boolean;
  tableStore?: TableStore;
}

const props = withDefaults(defineProps<Props>(), {
  select: false,
  selectAll: false,
  showGlobalFilter: false,
  noIndeterminate: false,
  dense: true,
  editMode: true,
});

const selected = defineModel<any[]>("selected", { default: () => [] });
const editedId = defineModel<string | null>("editedId");
const editMode = defineModel<boolean>("editMode");
const emit = defineEmits(["action"]);

const query = ref("");
const debouncedQuery = useDebounce(query, 200);

const rowSelection = ref<RowSelectionState>({});
const { columnVisibility, columnSizing } = props.tableStore
  ? storeToRefs(props.tableStore)
  : {
      columnVisibility: ref({}),
      columnSizing: ref({}),
    };

const selectColumn: ColumnDef<any, any> = {
  id: "select",
  size: 40,
  enableResizing: false,
  header: ({ table }) => {
    return h("input", {
      type: "checkbox",
      checked: table.getIsAllRowsSelected(),
      indeterminate: selected.value.length,
      class: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
      onChange: table.getToggleAllRowsSelectedHandler(),
    });
  },
  cell: ({ row }) => {
    return h("input", {
      type: "checkbox",
      checked: row.getIsSelected(),
      disabled: !row.getCanSelect(),
      indeterminate: !props.noIndeterminate ? row.getIsSomeSelected() : undefined,
      class: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500",
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

watch(editMode, (newValue) => {
  if (newValue === false) {
    editedId.value = null;
  }
});

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
    get columnVisibility() {
      return columnVisibility.value;
    },
    get columnSizing() {
      return columnSizing.value;
    },
  },
  getRowId: (row) => row.id,
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
  onColumnVisibilityChange: (updateOrValue) =>
    valueUpdater(updateOrValue, columnVisibility),
  onColumnSizingChange: (updateOrValue) => valueUpdater(updateOrValue, columnSizing),

  getSubRows: props.getSubRows,
  filterFromLeafRows: true,
});

const rows = computed(() => {
  return table.getRowModel().rows;
});

watch([rowSelection, debouncedQuery], () => {
  const sel: any[] = [];
  table.getFilteredSelectedRowModel().flatRows.forEach((row) => {
    sel.push(row.original);
  });
  selected.value = sel;
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

function onDblClick(row: any, e: MouseEvent) {
  editMode.value = true;
  editedId.value = row.original.id;
  console.log({ action: "dblclick", data: row.original });
}

watch(
  () => props.select,
  (newValue) => {
    if (!newValue) {
      table.toggleAllRowsSelected(false);
    }
  },
);
</script>

<template>
  <div class="relative flow-root">
    <div class="-mx-4 max-h-96 overflow-x-auto whitespace-nowrap">
      <div class="inline-block min-w-full align-middle">
        <table
          class="w-full border-separate border-spacing-0 text-left text-sm/6 text-slate-950 dark:text-white"
          tabindex="0"
        >
          <thead class="cursor-pointer text-slate-900 dark:text-slate-400">
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class=""
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                role="columnheader"
                class="sticky top-0 z-10 min-w-0 max-w-0 truncate border-b border-b-slate-950/10 bg-mpanel px-4 py-2 font-medium first:border-l-0 first:pl-[var(--gutter,theme(spacing.4))] last:pr-[var(--gutter,theme(spacing.4))] dark:border-b-white/10"
                @click="header.column.getToggleSortingHandler()?.($event)"
                :style="{
                  width: `${header.getSize()}px`,
                }"
              >
                <template v-if="!header.isPlaceholder">
                  <div
                    class="flex items-center"
                    :class="[
                      header.column.columnDef.meta?.align === 'right'
                        ? 'flex-row-reverse'
                        : '',
                    ]"
                  >
                    <span
                      ><FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                    /></span>
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
                  </div>
                  <div
                    v-if="header.column.getCanResize()"
                    @dblclick="header.column.resetSize()"
                    @mousedown="header.getResizeHandler()($event)"
                    @touchstart="header.getResizeHandler()($event)"
                    @click.stop
                    role="separator"
                    class="z-5 absolute right-0 top-0 h-full w-2 cursor-col-resize select-none border-r-2 border-r-slate-950/5 hover:bg-red-100 dark:border-r-white/10"
                    :class="header.column.getIsResizing() ? 'bg-red-100' : ''"
                  />
                </template>
              </th>
              <th
                class="sticky right-0 top-0 z-10 truncate border-b border-b-slate-950/10 bg-mpanel px-4 py-2 text-right font-medium first:border-l-0 first:pl-[var(--gutter,theme(spacing.4))] last:pr-[var(--gutter,theme(spacing.4))] dark:border-b-white/10"
              >
                <ToeGridTableMenu :table="table" />
              </th>
            </tr>
          </thead>
          <tbody class="text-wrap break-words">
            <tr
              v-for="row in rows"
              :key="row.id"
              :data-index="row.index"
              class="even:bg-zinc-950/[2.5%] dark:even:bg-white/[2.5%]"
              @dblclick="onDblClick(row, $event)"
            >
              <template v-if="row.original.id === editedId">
                <td class="" :colspan="row.getVisibleCells().length + 1">
                  <slot name="inline-form" :row="row.original" />
                </td>
              </template>
              <template v-else>
                <td
                  v-for="(cell, idx) in row.getVisibleCells()"
                  :key="cell.id"
                  :id="cell.id"
                  class="min-w-0 max-w-0 px-4 first:pl-[var(--gutter,theme(spacing.4))] last:pr-[var(--gutter,theme(spacing.4))]"
                  :class="[
                    dense ? 'py-2.5' : 'py-4',
                    cell.column.columnDef.meta?.align === 'right' ? 'text-right' : '',
                  ]"
                  :data-index="idx"
                  :style="{
                    width: `${cell.column.getSize()}px`,
                    minWidth: `${cell.column.getSize()}px`,
                  }"
                >
                  <FlexRender
                    v-if="!cell.getIsPlaceholder()"
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </td>
                <td class="sticky right-0">
                  <div v-if="editMode" class="flex grow-0 items-center justify-end pr-4">
                    <BaseButton small @click="editedId = row.original.id"
                      >Edit</BaseButton
                    >
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
