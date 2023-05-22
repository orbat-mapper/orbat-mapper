<template>
  <li
    :class="[
      'flex cursor-default select-none items-center px-4 py-2',
      active && 'bg-army text-white',
    ]"
  >
    <div class="flex w-7 justify-center">
      <component :is="IconHexagonOutline" class="h-6 w-6 text-gray-400" />
    </div>
    <p
      class="ml-3 flex-auto truncate"
      v-html="item.highlight ? item.highlight : item.name"
    />
  </li>
</template>
<script setup lang="ts">
import { ActionSearchResult } from "@/components/types";
import { IconHexagonOutline } from "@iconify-prerendered/vue-mdi";

const props = defineProps<{ item: ActionSearchResult; active?: boolean }>();
</script>
