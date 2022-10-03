<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NSide } from "@/types/internalModels";

interface Props {
  side: NSide;
  columns: TableColumn[];
  sideOpen: Map<NSide, boolean>;
}

const props = defineProps<Props>();
const emit = defineEmits(["toggle", "expand"]);
</script>
<template>
  <tr class="divide-x divide-gray-200 bg-slate-50">
    <td></td>
    <td class="px-4 py-2 text-left font-bold text-gray-900 sm:px-0">
      <button tabindex="-1" @click="emit('toggle', side)" class="ml-0 flex items-center">
        <ChevronRightIcon
          class="h-6 w-6 transform text-red-800 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
          :class="{
            'rotate-90': sideOpen.get(side) ?? true,
          }"
        />

        <span class="ml-2">{{ side.name }}</span>
      </button>
    </td>
    <td class="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
      {{ side.name }}
    </td>
    <td :colspan="columns.length - 1"></td>
  </tr>
</template>
