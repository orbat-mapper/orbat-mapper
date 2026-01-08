<script setup lang="ts">
import type { EventSearchResult } from "@/components/types.ts";
import { IconCalendarClock } from "@iconify-prerendered/vue-mdi";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects.ts";
import { formatDateString } from "@/geo/utils.ts";
const {
  time: { timeZone },
} = injectStrict(activeScenarioKey);
const props = defineProps<{ item: EventSearchResult }>();
</script>

<template>
  <div class="flex w-7 justify-center">
    <IconCalendarClock class="text-muted-foreground size-6" />
  </div>
  <p
    class="ml-3 flex-auto truncate"
    v-html="item.highlight ? item.highlight : item.name"
  />
  <p class="shrink-0 text-xs font-medium">
    {{ formatDateString(item.startTime, timeZone).split("T")[0] }}
  </p>
</template>
