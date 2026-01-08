<script setup lang="ts">
import { type PropType } from "vue";
import type { ButtonGroupItem } from "./types";

const props = defineProps({
  items: { type: Array as PropType<ButtonGroupItem[]>, required: true },
  small: { type: Boolean, default: false },
});
</script>

<template>
  <span class="relative z-0 inline-flex rounded-md shadow-xs">
    <button
      v-for="(item, index) in items"
      @click="item.onClick"
      type="button"
      :disabled="item.disabled"
      class="text-muted-foreground focus:border-primary focus:ring-ring bg-background hover:bg-muted/50 relative inline-flex items-center border border-gray-300 px-4 font-medium focus:z-10 focus:ring-1 focus:outline-hidden disabled:opacity-50"
      :class="{
        'rounded-l-md': index === 0,
        'rounded-r-md': index === items.length - 1,
        '-ml-px': index > 0,
        'py-1.5 text-xs': small,
        'py-2 text-sm': !small,
      }"
    >
      {{ item.label }}
    </button>
  </span>
</template>
