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
  isActive: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["toggle", "expand", "updateSide", "nextCell", "activeItem"]);
</script>
<template>
  <tr class="divide-x divide-gray-200 bg-slate-50">
    <td class="relative">
      <div v-if="isActive" class="absolute inset-y-0 right-0 w-0.5 bg-indigo-600"></div>
    </td>
    <td>
      <div
        :id="`cell-${itemIndex}-0`"
        @click="emit('toggle', side)"
        @keydown.enter.exact="emit('toggle', side)"
        tabindex="0"
        class="flex h-12 items-center whitespace-nowrap border-2 border-gray-100 px-4 py-2 pr-3 text-left font-bold font-medium text-gray-900 focus-within:border-red-800 hover:cursor-pointer sm:px-0"
      >
        <button @click.stop="emit('toggle', side)" class="ml-0">
          <ChevronRightIcon
            class="h-6 w-6 transform text-red-800 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
            :class="{
              'rotate-90': sideOpen.get(side) ?? true,
            }"
          />
        </button>

        <button class="ml-2 hover:underline">{{ side.name }}</button>
      </div>
    </td>
    <td class="">
      <GridEditableCell
        :value="side.name"
        :col-index="1"
        :row-index="itemIndex"
        @update="emit('updateSide', side.id, { name: $event })"
        @next-cell="emit('nextCell', $event)"
        @active="emit('activeItem', 'name')"
      />
    </td>
    <td :colspan="columns.length - 1"></td>
  </tr>
</template>
