<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from "vue";
import {
  type ColumnDef,
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type InitialTableState,
  type RowSelectionState,
  type SortingState,
  useVueTable,
} from "@tanstack/vue-table";
import { valueUpdater } from "@/modules/grid/helpers";
import { useDebounce } from "@vueuse/core";
import ToeGridTableMenu from "@/modules/scenarioeditor/ToeGridTableMenu.vue";
import { storeToRefs } from "pinia";
import { type TableStore } from "@/stores/tableStores";
import { Button } from "@/components/ui/button";

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
  isLocked?: boolean;
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
const { columnVisibility, columnSizing, columnSorting } = props.tableStore
  ? storeToRefs(props.tableStore)
  : {
      columnVisibility: ref({}),
      columnSizing: ref({}),
      columnSorting: ref<SortingState>([]),
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

    get sorting() {
      return columnSorting.value;
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
  onSortingChange: (updateOrValue) => valueUpdater(updateOrValue, columnSorting),

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

function onDblClick(row: any, e: MouseEvent) {
  if (props.isLocked) return;
  editMode.value = true;
  editedId.value = row.original.id;
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
          class="w-full border-separate border-spacing-0 text-left text-sm/6"
          tabindex="0"
        >
          <thead class="bg-muted cursor-pointer">
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class=""
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                role="columnheader"
                class="bg-muted sticky top-0 z-10 max-w-0 min-w-0 truncate border-b border-b-slate-950/10 px-4 py-2 font-medium first:border-l-0 first:pl-(--gutter,--spacing(4)) last:pr-(--gutter,--spacing(4)) dark:border-b-white/10"
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
                      class="text-muted-foreground dark:text-muted-foreground flex-none px-1 group-hover:bg-gray-300"
                    >
                      {{ header.column.getIsSorted() === "asc" ? "&darr;" : "&uarr;" }}
                    </span>
                  </div>
                  <div
                    v-if="header.column.getCanResize()"
                    @dblclick="header.column.resetSize()"
                    @mousedown="header.getResizeHandler()($event)"
                    @touchstart="header.getResizeHandler()($event)"
                    @click.stop
                    role="separator"
                    class="absolute top-0 right-0 z-5 h-full w-2 cursor-col-resize border-r-2 border-r-slate-950/5 select-none hover:bg-red-100 dark:border-r-white/10"
                    :class="header.column.getIsResizing() ? 'bg-red-100' : ''"
                  />
                </template>
              </th>
              <th
                class="bg-muted sticky top-0 right-0 z-10 truncate border-b border-b-slate-950/10 px-4 py-2 text-right font-medium first:border-l-0 first:pl-(--gutter,--spacing(4)) last:pr-(--gutter,--spacing(4)) dark:border-b-white/10"
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
                  class="max-w-0 min-w-0 px-4 first:pl-(--gutter,--spacing(4)) last:pr-(--gutter,--spacing(4))"
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
                <td class="bg-card sticky right-0">
                  <div v-if="editMode" class="flex grow-0 items-center justify-end pr-4">
                    <Button
                      variant="outline"
                      size="sm"
                      @click="editedId = row.original.id"
                      >Edit</Button
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
