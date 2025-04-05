<script setup lang="ts">
import {
  CheckedState,
  ColumnProperties,
  ColumnWidths,
  RuntimeColumnProperties,
  SortDirection,
} from "@/modules/grid/gridTypes";
import { computed, onMounted, ref } from "vue";
import { groupBy, nanoid } from "@/utils";
import OrbatGridHeader from "@/modules/grid/OrbatGridHeader.vue";
import { useVirtualList, useVModel } from "@vueuse/core";
import DotsMenu from "@/components/DotsMenu.vue";
import OrbatGridGroupRow from "@/modules/grid/OrbatGridGroupRow.vue";
import { getValue } from "./helpers";
import MilitarySymbol from "@/components/MilitarySymbol.vue";

interface Props {
  columns: ColumnProperties[];
  data: any[];
  rowHeight?: number;
  select?: boolean;
  selected?: any[];
  selectAll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 48,
  select: false,
  selected: () => [],
  selectAll: false,
});

const emit = defineEmits(["action", "update:selected"]);

const selectedRows = useVModel(props, "selected", emit);
const sortDirection = ref<SortDirection>("asc");
const sortField = ref<string | null>(null);
const isDragging = ref(false);

const columnDefs = ref<RuntimeColumnProperties[]>(
  props.columns.map((column) => ({
    ...column,
    label: column.label || column.field,
    id: column.id || nanoid(),
    width: column.width || 300,
    type: column.type || "text",
    menu: column.menu || [],
    resizable: column.resizable ?? true,
    sortable: column.sortable ?? false,
    sorted: null,
    rowGroup: column.rowGroup ?? false,
    hide: column.hide ?? false,
    groupOpen: column.groupOpen ?? true,
    objectPath: column.field.split("."),
  })),
);

const visibleColumnDefs = computed(() => columnDefs.value.filter((c) => !c.hide));

const columnWidths = ref<ColumnWidths>(
  Object.fromEntries(columnDefs.value.map((e) => [e.id, e.width])),
);

function ascending(a: string, b: string) {
  return (a || "") > (b || "") ? 1 : -1;
}

function descending(a: any, b: any) {
  return (a || "") < (b || "") ? 1 : -1;
}

const sortedData = computed(() => {
  if (sortField.value) {
    return [...props.data].sort((a, b) =>
      sortDirection.value === "asc"
        ? ascending(a[sortField.value!], b[sortField.value!])
        : descending(a[sortField.value!], b[sortField.value!]),
    );
  }
  return [...props.data];
});

const groupField = computed(() => columnDefs.value.filter((c) => c.rowGroup)[0]?.field);

const groupedData = computed(() => {
  if (groupField.value) return groupBy(sortedData.value, groupField.value);
  return sortedData.value;
});

const openMap = ref<Map<any, boolean>>(new Map());

const visibleData = computed(() => {
  if (groupField.value) {
    return [...groupedData.value.entries()]
      .map(([g, v]) => [
        { type: "group", item: g },
        openMap.value.get(g) === false
          ? []
          : v.map((e: any) => ({ type: "row", item: e })),
      ])
      .flat(2);
  } else if (Array.isArray(groupedData.value))
    return groupedData.value.map((e: any) => ({ type: "row", item: e }));
  return [];
});

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(visibleData, {
  itemHeight: props.rowHeight,
  overscan: 10,
});

const indeterminate = computed(
  () => selectedRows.value.length > 0 && selectedRows.value.length < props.data.length,
);

const checkedState = computed((): CheckedState => {
  if (selectedRows.value.length > 0 && selectedRows.value.length < props.data.length)
    return "indeterminate";
  if (selectedRows.value.length === props.data.length) return "checked";
  return false;
});

function toggleSelectAll(isChecked: boolean) {
  if (isChecked) {
    selectedRows.value = [...props.data];
  } else {
    selectedRows.value = [];
  }
}

function onColumnSort(column: RuntimeColumnProperties) {
  if (isDragging.value) return;
  if (sortField.value === column.field) {
    sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
  } else {
    sortField.value = column.field;
    sortDirection.value = "asc";
  }
  columnDefs.value.forEach((c) => {
    c.sorted = sortField.value === c.field ? sortDirection.value : null;
  });
}

function onDragging(value: boolean) {
  isDragging.value = value;
}

onMounted(() => {
  if (props.selectAll && props.select) {
    toggleSelectAll(true);
  }
});

function getGroupChecked(item: any) {
  if (props.select) {
    const groupItems = (groupedData.value as Map<any, any>).get(item);
    const checked = groupItems.every((e: any) => selectedRows.value.includes(e));
    return {
      checked,
      indeterminate:
        !checked && groupItems.some((e: any) => selectedRows.value.includes(e)),
    };
  } else {
    return { checked: false, indeterminate: false };
  }
}

function toggleGroupSelect(item: any, event: Event) {
  const isChecked = (<HTMLInputElement>event.target).checked;
  const groupItems = (groupedData.value as Map<any, any>).get(item);

  if (isChecked) {
    selectedRows.value = [...new Set([...selectedRows.value, ...groupItems])];
  } else {
    selectedRows.value = selectedRows.value.filter((id) => !groupItems.includes(id));
  }
}
</script>

<template>
  <div
    v-bind="containerProps"
    class="relative h-full rounded-lg border shadow-sm"
    :class="{ 'touch-none': isDragging }"
  >
    <OrbatGridHeader
      :column-defs="visibleColumnDefs"
      :row-height="rowHeight"
      class=""
      :select="select"
      :checked-state="checkedState"
      @toggleSelect="toggleSelectAll"
      v-model:column-widths="columnWidths"
      @sort="onColumnSort"
      @dragging="onDragging"
    />
    <div v-bind="wrapperProps">
      <template v-for="{ index, data: { item, type } } in list" :key="index">
        <div
          v-if="type === 'row'"
          :style="{
            height: `${rowHeight}px`,
          }"
          class="group flex w-full divide-x divide-gray-200 hover:bg-gray-50"
        >
          <div
            v-if="select"
            class="flex w-10 shrink-0 items-center justify-center overflow-hidden border-b px-4 py-3.5 text-gray-900"
          >
            <input
              type="checkbox"
              :id="item.id"
              :value="item"
              v-model="selectedRows"
              class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
            />
          </div>
          <div
            v-for="column in visibleColumnDefs"
            :style="{
              width: `${columnWidths[column.id]}px`,
              minWidth: `${columnWidths[column.id]}px`,
            }"
            class="group flex flex-0 items-center overflow-hidden border-b p-4"
            tabindex="0"
          >
            <div v-if="column.type === 'sidc'" class="">
              <MilitarySymbol :sidc="getValue(item, column.objectPath)" :size="20" />
            </div>
            <DotsMenu
              v-else-if="column.type === 'dots'"
              :items="column.menu"
              @action="emit('action', $event, { data: item, index })"
              class="opacity-0 group-hover:opacity-100 group-focus:opacity-100"
            />
            <span
              v-else-if="column.type === 'text'"
              class="truncate text-sm whitespace-nowrap text-gray-500"
              >{{ getValue(item, column.objectPath) }}</span
            >
          </div>
          <div class=""></div>
        </div>
        <OrbatGridGroupRow
          v-else-if="type === 'group'"
          :item="item"
          :select="select"
          :style="{
            height: `${rowHeight}px`,
          }"
          :open="openMap.get(item) ?? true"
          @toggle="openMap.set(item, !!$event)"
          v-bind="getGroupChecked(item)"
          @change="toggleGroupSelect(item, $event)"
        />
      </template>
    </div>
  </div>
</template>
