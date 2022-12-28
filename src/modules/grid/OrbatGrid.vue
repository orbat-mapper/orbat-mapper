<script setup lang="ts">
import {
  CheckedState,
  ColumnProperties,
  RuntimeColumnProperties,
} from "@/modules/grid/gridTypes";
import { computed, ref } from "vue";
import { nanoid } from "@/utils";
import OrbatGridHeader from "@/modules/grid/OrbatGridHeader.vue";
import { useVirtualList, useVModel } from "@vueuse/core";
import OrbatGridRow from "@/modules/grid/OrbatGridRow.vue";
import MilSymbol from "@/components/MilSymbol.vue";
import DotsMenu from "@/components/DotsMenu.vue";

interface Props {
  columns: ColumnProperties[];
  data: any[];
  rowHeight?: number;
  select?: boolean;
  selected?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  rowHeight: 48,
  select: false,
  selected: () => [],
});

const emit = defineEmits(["action", "update:selected"]);

const selectedRows = useVModel(props, "selected", emit);

const columnDefs = computed((): RuntimeColumnProperties[] =>
  props.columns.map((column) => ({
    ...column,
    label: column.label || column.field,
    id: column.id || nanoid(),
    width: column.width || 300,
    type: column.type || "text",
    menu: column.menu || [],
  }))
);

const dd = computed(() => props.data);

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(dd, {
  itemHeight: props.rowHeight,
  overscan: 10,
});

const indeterminate = computed(
  () => selectedRows.value.length > 0 && selectedRows.value.length < props.data.length
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
</script>

<template>
  <div v-bind="containerProps" class="relative h-full rounded-lg border shadow">
    <OrbatGridHeader
      :column-defs="columnDefs"
      :row-height="rowHeight"
      class=""
      :select="select"
      :checked-state="checkedState"
      @toggleSelect="toggleSelectAll"
    />
    <div v-bind="wrapperProps">
      <template v-for="{ index, data: item } in list" :key="index">
        <div
          :style="{
            height: `${rowHeight}px`,
          }"
          class="group flex divide-x divide-gray-200 hover:bg-gray-50"
        >
          <div
            v-if="select"
            class="flex-0 flex w-10 items-center justify-center overflow-hidden border-b px-4 py-3.5 text-gray-900"
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
            v-for="column in columnDefs"
            :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
            class="flex-0 group flex items-center overflow-hidden border-b p-4"
            tabindex="0"
          >
            <div v-if="column.type === 'sidc'" class="">
              <MilSymbol :sidc="item[column.field]" :size="20" />
            </div>
            <DotsMenu
              v-else-if="column.type === 'dots'"
              :items="column.menu"
              @action="emit('action', $event, { data: item, index })"
              class="opacity-0 group-hover:opacity-100 group-focus:opacity-100"
            />
            <span
              v-else-if="column.type === 'text'"
              class="truncate whitespace-nowrap text-sm text-gray-500"
              >{{ item[column.field] }}</span
            >
          </div>
          <div class=""></div>
        </div>
      </template>
    </div>
  </div>
</template>
