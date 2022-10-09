<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NUnit } from "@/types/internalModels";
import MilSymbol from "@/components/MilSymbol.vue";
import { ref } from "vue";
import GridEditableCell from "@/modules/scenarioeditor/GridEditableCell.vue";

interface Props {
  unit: NUnit;
  itemIndex: number;
  level: number;
  columns: TableColumn[];
  activeUnit: NUnit | null | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits(["toggle", "expand", "updateUnit", "nextCell"]);
</script>
<template>
  <tr :id="`item-${unit.id}`" class="divide-x divide-gray-200 hover:bg-gray-100">
    <td></td>
    <td
      class="flex items-center whitespace-nowrap py-3 text-sm text-gray-900"
      :style="`padding-left: ${level + 1}rem`"
      tabindex="0"
    >
      <button
        v-if="unit.subUnits.length"
        @click="unit._isOpen = !unit._isOpen"
        tabindex="0"
      >
        <ChevronRightIcon
          class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
          :class="{
            'rotate-90': unit._isOpen,
          }"
        />
      </button>
      <MilSymbol
        :sidc="unit.sidc"
        class="ml-2"
        :class="{ 'ml-8': !unit.subUnits.length }"
      />
      <span class="ml-2 truncate">{{ unit.name }}</span>
    </td>
    <td v-for="(column, colIndex) in columns" :key="column.field" class="">
      <GridEditableCell
        :value="unit[column.field]"
        :row-index="itemIndex"
        :col-index="colIndex + 1"
        @update="emit('updateUnit', unit.id, { [column.field]: $event })"
        @next-cell="emit('nextCell', $event)"
      >
      </GridEditableCell>
    </td>
  </tr>
</template>
