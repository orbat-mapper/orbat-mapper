<template>
  <header class="sticky top-0">
    <div class="flex divide-x divide-gray-200">
      <div
        v-if="select"
        class="flex-0 flex w-10 items-center justify-center overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-gray-900"
      >
        <input
          type="checkbox"
          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
          @change="toggleSelectAll"
          :checked="checkedState === 'checked' || checkedState === 'indeterminate'"
          :indeterminate="checkedState === 'indeterminate'"
        />
      </div>
      <div
        v-for="column in columnDefs"
        :key="column.id"
        :style="{
          width: `${widths[column.id]}px`,
          minWidth: `${widths[column.id]}px`,
        }"
        role="columnheader"
        class="flex-0 relative flex w-full overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        <span class="truncate">{{ column.label }}</span>
        <GridHeaderResizeHandle
          v-if="column.resizable"
          @update="updateWidth(column.id, $event)"
          :width="columnWidths[column.id]"
          @dblclick="resetWidth(column.id)"
        />
      </div>
      <div></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  CheckedState,
  ColumnWidths,
  RuntimeColumnProperties,
} from "@/modules/grid/gridTypes";
import GridHeaderResizeHandle from "@/modules/grid/GridHeaderResizeHandle.vue";
import { useVModel } from "@vueuse/core";

interface Props {
  columnDefs: RuntimeColumnProperties[];
  rowHeight?: number;
  select?: boolean;
  checkedState?: CheckedState;
  columnWidths: ColumnWidths;
}

const props = withDefaults(defineProps<Props>(), { select: false, checkedState: false });
const emit = defineEmits(["toggleSelect", "update:columnWidths"]);

const widths = useVModel(props, "columnWidths", emit);

function toggleSelectAll(event: Event) {
  const isChecked = (<HTMLInputElement>event.target).checked;
  emit("toggleSelect", isChecked);
}

function updateWidth(columnId: string, newWidth: number) {
  widths.value[columnId] = newWidth;
}

function resetWidth(columnId: string) {
  console.log("here");
  widths.value[columnId] =
    props.columnDefs.filter((c) => c.id === columnId)[0]?.width || 300;
}
</script>
