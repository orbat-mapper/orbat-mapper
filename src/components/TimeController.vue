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
      <ToolbarButton @click="showModal = true" start>
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
    <InputDateModal
      v-if="showModal"
      v-model="showModal"
      dialog-title="Set current scenario time"
      v-model:timestamp="currentTime"
      :time-zone="state.info.timeZone"
    />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.t="showModal = true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { CalendarIcon } from "@heroicons/vue/solid";

import { ChevronLeft, ChevronRight, SkipNext, SkipPrevious } from "mdue";
import { GlobalEvents } from "vue-global-events";
import { useUiStore } from "@/stores/uiStore";
import { inputEventFilter } from "./helpers";
import BaseToolbar from "./BaseToolbar.vue";
import ToolbarButton from "./ToolbarButton.vue";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

const InputDateModal = defineAsyncComponent(() => import("./InputDateModal.vue"));

const {
  store: { state },
  time: { scenarioTime, setCurrentTime, add, subtract, jumpToNextEvent, jumpToPrevEvent },
} = injectStrict(activeScenarioKey);

const uiStore = useUiStore();
const showModal = ref(false);

const currentTime = computed({
  get() {
    return state.currentTime;
  },
  set(v: number) {
    setCurrentTime(v);
  },
});
</script>
