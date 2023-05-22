<template>
  <li
    :class="[
      'flex cursor-default select-none items-center px-4 py-2',
      active && 'bg-army text-white',
    ]"
  >
    <div class="flex w-7 justify-center">
      <component :is="iconMap[item.icon || 'default']" class="h-8 w-8 text-gray-400" />
    </div>
    <p
      class="ml-3 flex-auto truncate"
      v-html="item.highlight ? item.highlight : item.name"
    />
  </li>
</template>
<script setup lang="ts">
import { ActionSearchResult } from "@/components/types";
import {
  IconHexagonOutline,
  IconAddCircleOutline,
  IconFileUploadOutline,
  IconFileDownloadOutline,
  IconContentSaveOutline,
} from "@iconify-prerendered/vue-mdi";

const iconMap: Record<string, any> = {
  add: IconAddCircleOutline,
  upload: IconFileUploadOutline,
  download: IconFileDownloadOutline,
  save: IconContentSaveOutline,
  default: IconHexagonOutline,
};

const props = defineProps<{ item: ActionSearchResult; active?: boolean }>();
</script>
