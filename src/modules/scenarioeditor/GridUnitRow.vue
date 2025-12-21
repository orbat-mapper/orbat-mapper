<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NUnit } from "@/types/internalModels";
import GridEditableCell from "@/modules/scenarioeditor/GridEditableCell.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import UnitSymbol from "@/components/UnitSymbol.vue";

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
  <tr :id="`item-${unit.id}`" class="divide-border hover:bg-muted/50 divide-x">
    <td class="relative">
      <div v-if="isActive" class="bg-primary absolute inset-y-0 right-0 w-0.5"></div>
    </td>
    <td>
      <div
        :id="`cell-${itemIndex}-0`"
        class="border-card text-foreground focus-within:border-ring flex items-center border-2 py-3 text-sm whitespace-nowrap outline-0"
        :style="`padding-left: ${level + 1}rem`"
        tabindex="0"
        @keydown.enter.exact="toggleOpen()"
        @click.self="toggleOpen()"
      >
        <button v-if="unit.subUnits.length" @click="toggleOpen()">
          <ChevronRightIcon
            class="text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform"
            :class="{
              'rotate-90': unit._isOpen,
            }"
          />
        </button>
        <UnitSymbol
          :sidc="unit.sidc"
          class="ml-2 max-w-10"
          :class="{ 'ml-8': !unit.subUnits.length }"
          :options="{
            ...getCombinedSymbolOptions(unit),
            outlineColor: 'rgba(255, 255, 255, 0.8)',
            outlineWidth: 10,
          }"
        />
        <button class="ml-2 truncate text-sm font-medium hover:underline">
          {{ unit.name }}
        </button>
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
