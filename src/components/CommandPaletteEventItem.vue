<template>
  <li
    :class="[
      'flex cursor-default select-none items-center px-4 py-2',
      active && 'bg-army text-white',
    ]"
  >
    <div class="flex w-7 justify-center">
      <IconCalendarClock class="h-6 w-6 text-gray-400" />
    </div>
    <p
      class="ml-3 flex-auto truncate"
      v-html="item.highlight ? item.highlight : item.name"
    />
    <p class="flex-shrink-0 text-xs font-medium">
      {{ formatDateString(item.startTime, timeZone).split("T")[0] }}
    </p>
  </li>
</template>
<script setup lang="ts">
import type { EventSearchResult } from "@/components/types";
import { IconCalendarClock } from "@iconify-prerendered/vue-mdi";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { formatDateString } from "@/geo/utils";
const {
  time: { timeZone },
} = injectStrict(activeScenarioKey);
const props = defineProps<{ item: EventSearchResult; active?: boolean }>();
</script>
