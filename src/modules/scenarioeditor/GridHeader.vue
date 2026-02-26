<script setup lang="ts">
import GridHeaderResizeHandle from "@/modules/grid/GridHeaderResizeHandle.vue";
import type {
  GridColumnWidths,
  GridResizableColumnKey,
  TableColumn,
} from "@/modules/scenarioeditor/types";

interface Props {
  columns: TableColumn[];
  columnWidths: GridColumnWidths;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:columnWidth": [{ key: GridResizableColumnKey; width: number }];
  "autosize:columnWidth": [{ key: GridResizableColumnKey }];
}>();

function getColumnWidth(key: GridResizableColumnKey) {
  return props.columnWidths[key];
}

function updateColumnWidth(key: GridResizableColumnKey, width: number) {
  emit("update:columnWidth", { key, width });
}

function autosizeColumnWidth(key: GridResizableColumnKey) {
  emit("autosize:columnWidth", { key });
}
</script>
<template>
  <colgroup>
    <col
      :style="{
        width: `${getColumnWidth('__indicator')}px`,
        minWidth: `${getColumnWidth('__indicator')}px`,
      }"
    />
    <col
      :style="{
        width: `${getColumnWidth('__unit')}px`,
        minWidth: `${getColumnWidth('__unit')}px`,
      }"
    />
    <col
      v-for="column in columns"
      :key="column.value"
      :style="{
        width: `${getColumnWidth(column.value)}px`,
        minWidth: `${getColumnWidth(column.value)}px`,
      }"
    />
  </colgroup>
  <thead class="bg-muted text-muted-foreground">
    <tr>
      <th scope="col" class="sticky top-0 z-10">
        <div
          class="border-border bg-card text-foreground relative -m-[1.5px] border-b py-3.5 pr-3 pl-6 text-left text-sm font-semibold"
        >
          &nbsp;
          <GridHeaderResizeHandle
            :width="getColumnWidth('__indicator')"
            @update="updateColumnWidth('__indicator', $event)"
            @dblclick="autosizeColumnWidth('__indicator')"
            class="z-5"
          />
        </div>
      </th>
      <th scope="col" class="sticky top-0 z-10">
        <div
          class="border-border bg-card text-foreground relative -m-[1.5px] border-b py-3.5 pr-3 pl-6 text-left text-sm font-semibold"
        >
          Unit
          <GridHeaderResizeHandle
            :width="getColumnWidth('__unit')"
            @update="updateColumnWidth('__unit', $event)"
            @dblclick="autosizeColumnWidth('__unit')"
            class="z-5"
          />
        </div>
      </th>

      <th
        v-for="column in columns"
        :key="column.value"
        scope="col"
        class="sticky top-0 z-10"
      >
        <div
          class="border-border bg-card text-foreground relative -my-0.5 -ml-0.5 border-b border-l py-3.5 pr-3 pl-3 text-left text-sm font-semibold"
        >
          {{ column.label }}
          <GridHeaderResizeHandle
            :width="getColumnWidth(column.value)"
            @update="updateColumnWidth(column.value, $event)"
            @dblclick="autosizeColumnWidth(column.value)"
            class="z-5"
          />
        </div>
      </th>
    </tr>
  </thead>
</template>
