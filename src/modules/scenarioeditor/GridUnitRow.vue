<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NUnit } from "@/types/internalModels";
import GridEditableCell from "@/modules/scenarioeditor/GridEditableCell.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

interface Props {
  unit: NUnit;
  itemIndex: number;
  level: number;
  columns: TableColumn[];
  isActive: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits([
  "toggle",
  "expand",
  "updateUnit",
  "nextCell",
  "activeItem",
  "edit",
]);

const {
  unitActions: { getCombinedSymbolOptions },
} = injectStrict(activeScenarioKey);

function toggleOpen() {
  props.unit._isOpen = !props.unit._isOpen;
}
</script>
<template>
  <tr :id="`item-${unit.id}`" class="divide-x divide-gray-200 hover:bg-gray-100">
    <td class="relative">
      <div v-if="isActive" class="absolute inset-y-0 right-0 w-0.5 bg-indigo-600"></div>
    </td>
    <td>
      <div
        :id="`cell-${itemIndex}-0`"
        class="flex items-center border-2 border-white py-3 text-sm whitespace-nowrap text-gray-900 outline-0 focus-within:border-red-800"
        :style="`padding-left: ${level + 1}rem`"
        tabindex="0"
        @keydown.enter.exact="toggleOpen()"
        @click.self="toggleOpen()"
      >
        <button v-if="unit.subUnits.length" @click="toggleOpen()">
          <ChevronRightIcon
            class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
            :class="{
              'rotate-90': unit._isOpen,
            }"
          />
        </button>
        <MilitarySymbol
          :sidc="unit.sidc"
          class="ml-2"
          :class="{ 'ml-8': !unit.subUnits.length }"
          :options="getCombinedSymbolOptions(unit)"
        />
        <button class="ml-2 truncate hover:underline">{{ unit.name }}</button>
      </div>
    </td>
    <td v-for="(column, colIndex) in columns" :key="column.value" class="">
      <GridEditableCell
        :value="unit[column.value]"
        :row-index="itemIndex"
        :col-index="colIndex + 1"
        :cell-type="column.type"
        @update="emit('updateUnit', unit.id, { [column.value]: $event })"
        @next-cell="emit('nextCell', $event)"
        @active="emit('activeItem', column.value)"
        @edit="emit('edit', unit, column.value, $event)"
      >
      </GridEditableCell>
    </td>
  </tr>
</template>
