<template>
  <div class="group flex divide-x divide-gray-200 hover:bg-gray-50">
    <div
      v-if="select"
      class="flex w-10 flex-0 items-center justify-center overflow-hidden border-b px-4 py-3.5 text-gray-900"
    >
      <input
        type="checkbox"
        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
      />
    </div>
    <div
      v-for="column in columnDefs"
      :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
      class="group flex flex-0 items-center overflow-hidden border-b p-4"
      tabindex="0"
    >
      <div v-if="column.type === 'sidc'" class="">
        <MilitarySymbol :sidc="data[column.field]" :size="20" />
      </div>
      <DotsMenu
        v-else-if="column.type === 'dots'"
        :items="column.menu"
        @action="emit('action', $event)"
        class="opacity-0 group-hover:opacity-100 group-focus:opacity-100"
      />
      <span
        v-else-if="column.type === 'text'"
        class="truncate text-sm whitespace-nowrap text-gray-500"
        >{{ data[column.field] }}</span
      >
    </div>
    <div class=""></div>
  </div>
</template>

<script setup lang="ts">
import { RuntimeColumnProperties } from "@/modules/grid/gridTypes";
import DotsMenu from "@/components/DotsMenu.vue";
import MilitarySymbol from "@/components/MilitarySymbol.vue";

interface Props {
  columnDefs: RuntimeColumnProperties[];
  data: any;
  select?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["action"]);
</script>
