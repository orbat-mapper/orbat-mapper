<template>
  <div class="flex items-center space-x-2">
    <p
      v-if="!hideTime"
      class="pointer-events-none font-mono text-xl font-bold sm:text-2xl"
      style="text-shadow: white 0 0 5px"
    >
      {{ formatDateString(state.currentTime, state.info.timeZone) }}
    </p>
    <BaseToolbar v-if="showControls">
      <ToolbarButton @click="emit('open-time-modal')" start>
        <span class="sr-only">Select time and date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton type="button" @click="emit('dec-day')">
        <span class="sr-only">Previous</span>
        <IconChevronLeft class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="emit('inc-day')">
        <span class="sr-only">Next</span>
        <IconChevronRight class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="emit('prev-event')">
        <span class="sr-only">Next</span>
        <IconSkipPrevious class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="emit('next-event')" end>
        <span class="sr-only">Next</span>
        <IconSkipNext class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
    </BaseToolbar>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon } from "@heroicons/vue/24/solid";

import {
  IconChevronLeft,
  IconChevronRight,
  IconSkipNext,
  IconSkipPrevious,
} from "@iconify-prerendered/vue-mdi";
import { useUiStore } from "@/stores/uiStore";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { formatDateString } from "@/geo/utils";

const props = withDefaults(
  defineProps<{
    showControls?: boolean;
    hideTime?: boolean;
  }>(),
  { showControls: true, hideTime: false },
);

const emit = defineEmits([
  "open-time-modal",
  "inc-day",
  "dec-day",
  "next-event",
  "prev-event",
]);
const {
  store: { state },
  time: { scenarioTime },
} = injectStrict(activeScenarioKey);

const uiStore = useUiStore();
</script>
