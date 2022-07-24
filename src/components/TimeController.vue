<template>
  <div class="flex w-full items-center justify-between p-4">
    <div>
      <p class="text-sm font-medium text-gray-700">
        {{ scenarioTime.format("YYYY-MM-DD") }}
      </p>
      <p class="text-sm font-medium text-gray-900">
        {{ scenarioTime.format("HH:mmZ") }}
      </p>
    </div>

    <BaseToolbar>
      <ToolbarButton @click="openTimeDialog" start>
        <span class="sr-only">Select time and date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="jumpToPrevEvent()">
        <span class="sr-only">Previous</span>
        <SkipPrevious class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="jumpToNextEvent()">
        <span class="sr-only">Next</span>
        <SkipNext class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton type="button" @click="subtract(1, 'day', true)">
        <span class="sr-only">Previous</span>
        <ChevronLeft class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="add(1, 'day', true)" end>
        <span class="sr-only">Next</span>
        <ChevronRight class="h-5 w-5" aria-hidden="true" />
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
import { CalendarIcon } from "@heroicons/vue/solid";

import { ChevronLeft, ChevronRight, SkipNext, SkipPrevious } from "mdue";
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
