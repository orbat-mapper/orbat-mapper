<script setup lang="ts">
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
interface Props {
  select?: boolean;
  item: string;
  open?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
}

const props = withDefaults(defineProps<Props>(), { select: false, open: true });
const emit = defineEmits(["toggle", "change"]);
</script>
<template>
  <div class="group flex divide-x divide-gray-200 hover:bg-gray-50">
    <div
      v-if="select"
      class="flex-0 flex w-10 items-center justify-center overflow-hidden border-b px-4 py-3.5 text-gray-900"
    >
      <input
        type="checkbox"
        :id="item"
        :checked="checked"
        :indeterminate="indeterminate"
        class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
        @change="emit('change', $event)"
      />
    </div>
    <div
      class="flex flex-auto cursor-pointer items-center border-b px-2"
      @click="emit('toggle', !open)"
    >
      <button @click.stop="emit('toggle', !open)" class="ml-0">
        <ChevronRightIcon
          class="h-6 w-6 text-red-800 transition-transform group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100"
          :class="{
            'rotate-90': open,
          }"
        />
      </button>
      <span class="font-bolder">{{ item }}</span>
    </div>
  </div>
</template>
