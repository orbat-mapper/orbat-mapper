<script setup lang="ts">
import { computed, ref } from "vue";
import type { WorkBook } from "xlsx";
import { xlsxUtils } from "@/extlib/xlsx-lazy";
import DataGrid from "@/modules/grid/DataGrid.vue";
import BaseButton from "@/components/BaseButton.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { useNotifications } from "@/composables/notifications";

interface Props {
  workbook: WorkBook;
}

const props = defineProps<Props>();
const emit = defineEmits(["cancel", "loaded"]);
const { send } = useNotifications();

const sheetNames = props.workbook.SheetNames;
const activeSheet = ref(sheetNames[0]);
const data = computed(() => {
  const sheet = props.workbook.Sheets[activeSheet.value];
  if (!sheet || !sheet["!ref"]) return [];

  // // Limit to 100 rows for preview performance
  // const range = xlsxUtils.decode_range(sheet["!ref"]);
  // range.e.r = Math.min(range.e.r, range.s.r + 99);
  //
  // return xlsxUtils.sheet_to_json(sheet, { range });
  return xlsxUtils.sheet_to_json(sheet);
});

// console.log("Generic import data preview:", data.value);

const columns = computed<ColumnDef<Record<string, unknown>>[]>(() => {
  if (data.value.length === 0) return [];
  const headers = Object.keys(data.value[0] as object);
  return headers.map((header) => ({
    accessorKey: header,
    header: header,
  }));
});

function onImport() {
  send({
    message: "Generic import is not yet fully implemented. Mapping required.",
    type: "warning",
  });
  // In the future, we would map columns to Unit properties here
  // and emit 'loaded'
}
</script>

<template>
  <div class="flex h-full flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="prose prose-sm dark:prose-invert">
        <h3>Generic Spreadsheet Import</h3>
        <p>
          Previewing first 100 rows from <strong>{{ activeSheet }}</strong>
        </p>
      </div>
      <div v-if="sheetNames.length > 1">
        <select v-model="activeSheet" class="rounded border p-1">
          <option v-for="name in sheetNames" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex-auto overflow-auto rounded border">
      <DataGrid
        v-if="data.length > 0"
        :data="data"
        :columns="columns"
        :row-count="data.length"
        class="max-h-[40vh]"
      />
      <div v-else class="p-8 text-center text-gray-500">No data found in this sheet.</div>
    </div>

    <footer class="flex shrink-0 items-center justify-end space-x-2 pt-4">
      <BaseButton type="submit" primary small @click="onImport">Import</BaseButton>
      <BaseButton small @click="emit('cancel')">Cancel</BaseButton>
    </footer>
  </div>
</template>
