<script setup lang="ts">
import { ArrowSmallDownIcon, ArrowSmallUpIcon } from "@heroicons/vue/20/solid";
import type {
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
const emit = defineEmits(["toggleSelect", "update:columnWidths", "sort", "dragging"]);

const widths = useVModel(props, "columnWidths", emit);

function toggleSelectAll(event: Event) {
  const isChecked = (<HTMLInputElement>event.target).checked;
  emit("toggleSelect", isChecked);
}

function updateWidth(columnId: string, newWidth: number) {
  widths.value[columnId] = newWidth;
}

function resetWidth(columnId: string) {
  widths.value[columnId] =
    props.columnDefs.filter((c) => c.id === columnId)[0]?.width || 300;
}

function onColumnClick(column: RuntimeColumnProperties) {
  if (column.sortable) {
    emit("sort", column);
  }
}
</script>

<template>
  <header class="sticky top-0 z-10">
    <div class="flex divide-x divide-gray-200">
      <div
        v-if="select"
        class="bg-muted text-foreground flex w-10 shrink-0 items-center justify-center overflow-hidden border-b px-4 py-3.5"
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
        class="bg-muted text-foreground relative flex w-full flex-0 items-center justify-between overflow-hidden border-b px-4 py-3.5 text-left text-sm font-semibold"
        :class="{ 'cursor-pointer': column.sortable }"
        @click="onColumnClick(column)"
      >
        <span class="truncate">{{ column.label }}</span>
        <span
          v-if="column.sortable && column.sorted"
          class="text-muted-foreground group-hover:bg-accent flex-none rounded"
        >
          <ArrowSmallDownIcon
            v-if="column.sorted === 'asc'"
            class="h-5 w-5"
            aria-hidden="true"
          />
          <ArrowSmallUpIcon v-else class="h-5 w-5" aria-hidden="true" />
        </span>
        <GridHeaderResizeHandle
          v-if="column.resizable"
          @update="updateWidth(column.id, $event)"
          :width="columnWidths[column.id]"
          @dblclick="resetWidth(column.id)"
          @dragging="emit('dragging', $event)"
          class="z-5"
        />
      </div>
      <div></div>
    </div>
  </header>
</template>
