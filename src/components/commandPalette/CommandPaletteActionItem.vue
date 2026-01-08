<script setup lang="ts">
import { type ActionSearchResult } from "@/components/types.ts";
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

const props = defineProps<{ item: ActionSearchResult }>();
</script>

<template>
  <div class="flex w-7 justify-center">
    <component
      :is="iconMap[item.icon || 'default']"
      class="text-muted-foreground size-8"
    />
  </div>
  <p
    class="ml-3 flex-auto truncate"
    v-html="item.highlight ? item.highlight : item.name"
  />
</template>
