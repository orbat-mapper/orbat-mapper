<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon } from "@lucide/vue";
import type { TimelineChange } from "./timelineChanges";
import { DATE_TIME_PATTERN, useTimelineChangeNames } from "./useTimelineChanges";

defineProps<{
  /** Whether nothing is shown in the time range. */
  empty: boolean;
  /** Changes in the time range that the filters hide. */
  hiddenCount: number;
  /** The last change before the time range that the filters let through. */
  previous?: TimelineChange;
  /** The first change after the time range that the filters let through. */
  next?: TimelineChange;
}>();
const emit = defineEmits<{ clearFilters: []; go: [change: TimelineChange] }>();

const { entityName, formatTime } = useTimelineChangeNames();

function describe(change: TimelineChange) {
  const name = entityName(change) || "Unnamed map item";
  return `${formatTime(change.t, DATE_TIME_PATTERN)} · ${name}`;
}
</script>

<template>
  <div
    class="text-muted-foreground flex flex-col items-center gap-1 px-3 text-center text-xs"
    :class="empty ? 'py-6' : 'py-2'"
  >
    <p v-if="empty && hiddenCount">
      {{ hiddenCount === 1 ? "1 change" : `All ${hiddenCount} changes` }} in this time
      range {{ hiddenCount === 1 ? "is" : "are" }} hidden by filters.
      <button
        type="button"
        class="text-foreground underline-offset-2 hover:underline"
        @click="emit('clearFilters')"
      >
        Clear filters
      </button>
    </p>
    <p v-else-if="empty">No changes in this time range</p>
    <!-- On one line when they fit, stacked when they don't. -->
    <div
      v-if="previous || next"
      class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1"
    >
      <button
        v-if="previous"
        type="button"
        class="hover:text-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 tabular-nums"
        title="Go to the previous change"
        @click="emit('go', previous)"
      >
        <ArrowLeftIcon class="size-3" />
        Previous change: {{ describe(previous) }}
      </button>
      <button
        v-if="next"
        type="button"
        class="hover:text-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 tabular-nums"
        title="Go to the next change"
        @click="emit('go', next)"
      >
        Next change: {{ describe(next) }}
        <ArrowRightIcon class="size-3" />
      </button>
    </div>
  </div>
</template>
