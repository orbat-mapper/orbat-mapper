<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import type { TableColumn } from "@/modules/scenarioeditor/types";
import { ColumnField } from "@/modules/scenarioeditor/types";
import type { NUnit } from "@/types/internalModels";
import MilSymbol from "@/components/MilSymbol.vue";
import { doFocus } from "@/composables/utils";

interface Props {
  unit: NUnit;
  itemIndex: number;
  level: number;
  columns: TableColumn[];
  activeUnit: NUnit | null | undefined;
  activeColumn: ColumnField | undefined;
}

const props = defineProps<Props>();
const emit = defineEmits([
  "toggle",
  "expand",
  "edit",
  "tab",
  "up",
  "down",
  "submit",
  "update",
]);

const updateValue = (event: Event) => {
  emit("update", <HTMLInputElement>event.target);
};
</script>
<template>
  <tr
    class="divide-x divide-gray-200"
    :class="
      activeUnit === unit ? 'bg-yellow-300 hover:bg-yellow-100' : 'hover:bg-gray-100'
    "
  >
    <td></td>
    <td
      class="flex items-center whitespace-nowrap py-3 text-sm text-gray-900"
      :style="`padding-left: ${level + 1}rem`"
    >
      <button
        v-if="unit.subUnits.length"
        @click="unit._isOpen = !unit._isOpen"
        tabindex="-1"
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
    <td
      v-for="column in columns"
      :key="column.field"
      class="whitespace-nowrap px-3 py-3 text-sm text-gray-500"
      @click="emit('edit', unit, itemIndex, column.field)"
    >
      <form
        v-if="activeUnit === unit && activeColumn === column.field"
        @submit.prevent="emit('submit')"
      >
        <input
          type="text"
          class="-my-3 w-full"
          :value="unit[column.field]"
          @vnode-mounted="doFocus"
          @keydown.tab.prevent.stop="emit('tab', unit, itemIndex, column.field)"
          @keydown.down="emit('down', itemIndex)"
          @keydown.up="emit('up', itemIndex)"
          @input="updateValue"
        />
      </form>
      <span v-else>{{ unit[column.field] }}</span>
    </td>
  </tr>
</template>
