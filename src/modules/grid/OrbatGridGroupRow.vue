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
  <div class="group bg-muted/50 hover:bg-muted flex divide-x divide-gray-200">
    <div
      v-if="select"
      class="text-foreground flex w-10 flex-0 items-center justify-center overflow-hidden border-b px-4 py-3.5"
    >
      <input
        type="checkbox"
        :id="item"
        :checked="checked"
        :indeterminate="indeterminate"
        class="text-primary focus:ring-ring rounded border-gray-300 sm:left-6"
        @change="emit('change', $event)"
      />
    </div>
    <div
      class="flex flex-auto cursor-pointer items-center border-b px-2"
      @click="emit('toggle', !open)"
    >
      <button @click.stop="emit('toggle', !open)" class="ml-0">
        <ChevronRightIcon
          class="group-hover:text-foreground dark:text-muted-foreground dark:group-hover:text-foreground h-6 w-6 text-red-800 transition-transform"
          :class="{
            'rotate-90': open,
          }"
        />
      </button>
      <span class="font-bolder">{{ item }}</span>
    </div>
  </div>
</template>
