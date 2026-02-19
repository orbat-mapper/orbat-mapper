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
  <tr class="divide-border bg-muted/50 h-12 divide-x">
    <td class="relative">
      <div v-if="isActive" class="bg-primary absolute inset-y-0 right-0 w-0.5"></div>
    </td>
    <td>
      <div
        :id="`cell-${itemIndex}-0`"
        @click="emit('toggle', side)"
        @keydown.enter.exact="emit('toggle', side)"
        tabindex="0"
        class="border-card text-foreground focus-within:border-ring flex h-12 items-center border-2 px-4 py-2 pr-3 text-left font-semibold whitespace-nowrap hover:cursor-pointer sm:px-0"
      >
        <button @click.stop="emit('toggle', side)" class="ml-0">
          <ChevronRightIcon
            class="text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform"
            :class="{
              'rotate-90': sideOpen.get(side) ?? true,
            }"
          />
        </button>

        <button class="ml-2 text-sm font-semibold hover:underline">
          {{ side.name }}
        </button>
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
