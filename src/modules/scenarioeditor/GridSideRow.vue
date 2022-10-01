<script setup lang="ts">
import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NSide } from "@/types/internalModels";

interface Props {
  side: NSide;
  columns: TableColumn[];
}

const props = defineProps<Props>();
const emit = defineEmits(["toggle", "expand"]);
</script>
<template>
  <tr class="divide-x divide-gray-200">
    <td class="px-4 py-2 text-left text-sm font-bold text-gray-900 sm:px-6">
      {{ side.name }}
    </td>
    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
      {{ side.name }}
    </td>
    <td :colspan="columns.length - 1"></td>
  </tr>
</template>
