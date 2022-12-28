<template>
  <header class="sticky top-0">
    <div class="flex divide-x divide-gray-200">
      <div
        v-if="select"
        class="flex-0 flex w-10 items-center justify-center overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-gray-900"
      >
        <input
          type="checkbox"
          class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
          @change="toggleSelectAll"
          :checked="checkedState === 'checked' || checkedState === 'indeterminate'"
          :indeterminate="checkedState === 'indeterminate'"
        />
      </div>
      <div
        v-for="column in columnDefs"
        :key="column.id"
        :style="{ width: column.width + 'px', minWidth: column.width + 'px' }"
        class="flex-0 flex w-full overflow-hidden border-b bg-gray-100 px-4 py-3.5 text-left text-sm font-semibold text-gray-900"
      >
        <span class="truncate">{{ column.label }}</span>
      </div>
      <div></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { CheckedState, RuntimeColumnProperties } from "@/modules/grid/gridTypes";

interface Props {
  columnDefs: RuntimeColumnProperties[];
  rowHeight?: number;
  select?: boolean;
  checkedState?: CheckedState;
}

const props = withDefaults(defineProps<Props>(), { select: false, checkedState: false });
const emit = defineEmits(["toggleSelect"]);

function toggleSelectAll(event: Event) {
  const isChecked = (<HTMLInputElement>event.target).checked;
  emit("toggleSelect", isChecked);
}
</script>
