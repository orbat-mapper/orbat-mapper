<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import BaseButton from "@/components/BaseButton.vue";
import type { TableColumn } from "@/modules/scenarioeditor/types";
import type { NSideGroup } from "@/types/internalModels";

interface Props {
  sideGroup: NSideGroup;
  columns: TableColumn[];
  sgOpen: Map<NSideGroup, boolean>;
}

const props = defineProps<Props>();
const emit = defineEmits(["toggle", "expand"]);
</script>
<template>
  <tr class="bg-gray-100">
    <td class="sticky top-12 z-10">
      <div
        class="h-12 items-center whitespace-nowrap border-b bg-gray-100 py-2 pr-3 text-sm font-medium text-gray-900"
      ></div>
    </td>
    <td :colspan="columns.length + 1" class="sticky top-12 z-10">
      <div
        class="flex h-12 items-center whitespace-nowrap border-b bg-gray-100 py-2 pr-3 text-sm font-medium text-gray-900"
      >
        <button
          tabindex="-1"
          @click="emit('toggle', sideGroup)"
          class="ml-0 flex items-center"
        >
          <ChevronRightIcon
            class="h-6 w-6 transform text-gray-500 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
            :class="{
              'rotate-90': sgOpen.get(sideGroup) ?? true,
            }"
          />

          <span class="ml-2">{{ sideGroup.name }}</span>
        </button>
        <BaseButton small class="ml-2" tabindex="-1" @click="emit('expand', sideGroup)"
          >Expand/collapse
        </BaseButton>
      </div>
    </td>
  </tr>
</template>
