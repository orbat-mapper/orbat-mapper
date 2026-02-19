<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import BaseButton from "@/components/BaseButton.vue";
import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NSideGroup } from "@/types/internalModels";
import GridEditableCell from "@/modules/scenarioeditor/GridEditableCell.vue";

interface Props {
  sideGroup: NSideGroup;
  columns: TableColumn[];
  sgOpen: Map<NSideGroup, boolean>;
  itemIndex: number;
  isActive: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits([
  "toggle",
  "expand",
  "updateSideGroup",
  "nextCell",
  "activeItem",
]);

function toggleOpen() {
  emit("toggle", props.sideGroup);
}
</script>
<template>
  <tr class="bg-muted/40 h-12">
    <td class="relative">
      <div v-if="isActive" class="bg-primary absolute inset-y-0 right-0 w-0.5"></div>
    </td>
    <td class="hover:cursor-pointer" @click="emit('toggle', sideGroup)">
      <div
        :id="`cell-${itemIndex}-0`"
        tabindex="0"
        class="border-card bg-card/80 text-foreground focus-within:border-ring flex h-12 items-center border-2 py-2 pr-3 text-sm font-medium whitespace-nowrap"
        @click.self="toggleOpen()"
        @keydown.enter.exact="toggleOpen()"
      >
        <button
          tabindex="0"
          @click.stop="emit('toggle', sideGroup)"
          class="ml-0 flex items-center"
        >
          <ChevronRightIcon
            class="text-muted-foreground group-hover:text-foreground h-6 w-6 transform transition-transform"
            :class="{
              'rotate-90': sgOpen.get(sideGroup) ?? true,
            }"
          />
        </button>
        <button class="ml-2 text-sm font-semibold hover:underline">
          {{ sideGroup.name }}
        </button>
      </div>
    </td>
    <td class="">
      <GridEditableCell
        :value="sideGroup.name"
        :row-index="itemIndex"
        :col-index="1"
        @update="emit('updateSideGroup', sideGroup.id, { name: $event })"
        @next-cell="emit('nextCell', $event)"
        @active="emit('activeItem', 'name')"
      />
    </td>
    <td :colspan="columns.length - 1" class="">
      <div
        class="text-muted-foreground flex h-12 items-center py-2 pr-3 text-sm font-medium whitespace-nowrap"
      >
        <BaseButton small class="ml-2" @click="emit('expand', sideGroup)">
          Expand/collapse
        </BaseButton>
      </div>
    </td>
  </tr>
</template>
