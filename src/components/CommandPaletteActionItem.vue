<template>
  <li
    :class="[
      'flex cursor-default items-center px-4 py-2 select-none',
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
import { type ActionSearchResult } from "@/components/types";
import {
  IconAddCircleOutline,
  IconContentSaveOutline,
  IconFileDownloadOutline,
  IconFileUploadOutline,
  IconHexagonOutline,
  IconPause,
  IconPlay,
  IconSpeedometer,
  IconSpeedometerSlow,
} from "@iconify-prerendered/vue-mdi";

const iconMap: Record<string, any> = {
  add: IconAddCircleOutline,
  upload: IconFileUploadOutline,
  download: IconFileDownloadOutline,
  save: IconContentSaveOutline,
  default: IconHexagonOutline,
  play: IconPlay,
  pause: IconPause,
  increaseSpeed: IconSpeedometer,
  decreaseSpeed: IconSpeedometerSlow,
};

const props = defineProps<{ item: ActionSearchResult; active?: boolean }>();
</script>
