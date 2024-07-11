<script setup lang="ts">
import { NUnit } from "@/types/internalModels";
import { computed, h, onMounted, ref } from "vue";
import { useScenario } from "@/scenariostore";
import { MenuItemData } from "@/components/types";
import { SideAction, SideActions } from "@/types/constants";
import ToggleField from "@/components/ToggleField.vue";
import BaseButton from "@/components/BaseButton.vue";
import {
  ColumnDef,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
} from "@tanstack/vue-table";
import {
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from "@tanstack/vue-table";

import MilitarySymbol from "@/components/MilitarySymbol.vue";
import DotsMenu from "@/components/DotsMenu.vue";
import { ArrowSmallDownIcon, ArrowSmallUpIcon } from "@heroicons/vue/20/solid";
import { useVirtualizer } from "@tanstack/vue-virtual";

interface ExtendedUnit extends NUnit {
  sideName: string;
  sideId: string;
}

const rowSelection = ref<RowSelectionState>({});

const sorting = ref<SortingState>([]);
const parentRef = ref<HTMLElement | null>(null);
const columnHelper = createColumnHelper<ExtendedUnit>();
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
    cell: ({ row, getValue }) => {
      return h(MilitarySymbol, { sidc: getValue(), size: 20 });
    },
  }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("shortName", { header: "Short name" }),
  columnHelper.accessor("externalUrl", { header: "URL" }),
  columnHelper.accessor("sideName", { header: "Side" }),
  columnHelper.accessor("id", { header: "id" }),
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
const data = ref<ExtendedUnit[]>([]);

const table = useVueTable({
  get data() {
    return data.value;
  },
  state: {
    get rowSelection() {
      return rowSelection.value;
    },
  },
  enableRowSelection: true,
  columnResizeMode: "onChange",
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getRowId: (row) => row.id,
  onRowSelectionChange: (updateOrValue) => {
    rowSelection.value =
      typeof updateOrValue === "function"
        ? updateOrValue(rowSelection.value)
        : updateOrValue;
  },
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

function onAction(action: SideAction, props: any) {
  console.log("on action", action, props);
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
      <ToggleField v-model="doSelect">Select</ToggleField>
      <span v-if="doSelect"
        >Selected: {{ selected.length }} {{ Object.keys(rowSelection) }}</span
      >
      <BaseButton @click="mutateData()">Mutate</BaseButton>
    </div>
    <section
      class="relative h-full overflow-auto rounded-lg border shadow"
      ref="parentRef"
    >
      <header class="sticky top-0 z-10">
        <div
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="flex divide-x divide-gray-200"
        >
          <div
            v-for="header in headerGroup.headers"
            :key="header.id"
            :style="{
              width: `${header.getSize()}px`,
              minWidth: `${header.getSize()}px`,
            }"
            role="columnheader"
            class="flex-0 relative flex w-full items-center justify-between overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
            :class="{ 'cursor-pointer select-none': header.column.getCanSort() }"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <span class="truncate"
              ><FlexRender
                v-if="!header.isPlaceholder"
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
            <div
              v-if="header.column.getCanResize()"
              @dblclick="header.column.resetSize()"
              @mousedown="header.getResizeHandler()($event)"
              @touchstart="header.getResizeHandler()($event)"
              @click.stop
              role="separator"
              class="z-5 absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-red-100 sm:w-2"
            />
          </div>
          <div></div>
        </div>
      </header>
      <div
        class="tbody relative"
        :style="{ height: `${rowVirtualizer.getTotalSize()}px` }"
      >
        <div
          v-for="virtualRow in virtualRows"
          :key="virtualRow.key"
          :style="{ transform: `translateY(${virtualRow.start}px)` }"
          class="group absolute flex h-10 w-full divide-x divide-gray-200 hover:bg-gray-50"
        >
          <div
            v-for="cell in rows[virtualRow.index].getVisibleCells()"
            :key="cell.id"
            :style="{
              width: `${cell.column.getSize()}px`,
            }"
            class="flex shrink-0 items-center overflow-hidden text-nowrap border-b p-4"
          >
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
