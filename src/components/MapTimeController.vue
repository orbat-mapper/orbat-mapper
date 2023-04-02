<template>
  <div class="flex items-center space-x-2">
    <p
      class="pointer-events-none font-mono text-xl font-bold sm:text-2xl"
      style="text-shadow: white 0 0 5px"
    >
      {{ scenarioTime.format("YYYY-MM-DD") }}
    </p>
    <BaseToolbar>
      <ToolbarButton @click="openTimeDialog" start>
        <span class="sr-only">Select time and date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton type="button" @click="subtract(1, 'day', true)">
        <span class="sr-only">Previous</span>
        <IconChevronLeft class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="add(1, 'day', true)" end>
        <span class="sr-only">Next</span>
        <IconChevronRight class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
    </BaseToolbar>

    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.t="openTimeDialog"
    />
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
import { GlobalEvents } from "vue-global-events";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "./helpers";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";

const {
  store: { state },
  time: { scenarioTime, setCurrentTime, add, subtract, jumpToNextEvent, jumpToPrevEvent },
} = injectStrict(activeScenarioKey);

const { getModalTimestamp } = injectStrict(timeModalKey);

const uiStore = useUiStore();

const openTimeDialog = async () => {
  const newTimestamp = await getModalTimestamp(state.currentTime, {
    timeZone: state.info.timeZone,
  });
  if (newTimestamp !== undefined) {
    setCurrentTime(newTimestamp);
  }
};
</script>
