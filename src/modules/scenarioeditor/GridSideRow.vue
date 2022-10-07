<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";

import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NSide } from "@/types/internalModels";
import GridEditableCell from "@/modules/scenarioeditor/GridEditableCell.vue";

interface Props {
  side: NSide;
  columns: TableColumn[];
  sideOpen: Map<NSide, boolean>;
  itemIndex: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["toggle", "expand", "updateSide", "nextCell"]);
</script>
<template>
  <tr class="divide-x divide-gray-200 bg-slate-50">
    <td></td>
    <td
      @click="emit('toggle', side)"
      class="px-4 py-2 text-left font-bold text-gray-900 hover:cursor-pointer sm:px-0"
    >
      <button
        tabindex="-1"
        @click.stop="emit('toggle', side)"
        class="ml-0 flex items-center"
      >
        <ChevronRightIcon
          class="h-6 w-6 transform text-red-800 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
          :class="{
            'rotate-90': sideOpen.get(side) ?? true,
          }"
        />

        <span class="ml-2">{{ side.name }}</span>
      </button>
    </td>
    <td class="">
      <GridEditableCell
        :value="side.name"
        :col-index="1"
        :row-index="itemIndex"
        @update="emit('updateSide', side.id, { name: $event })"
        @next-cell="emit('nextCell', $event)"
      />
    </td>
    <td :colspan="columns.length - 1"></td>
  </tr>
</template>
