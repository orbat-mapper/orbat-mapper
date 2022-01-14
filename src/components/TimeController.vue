<template>
  <div class="w-full flex justify-between items-center p-4">
    <div>
      <p class="text-sm font-medium text-gray-700">
        {{ scenarioStore.scenarioTime.format("YYYY-MM-DD") }}
      </p>
      <p class="text-sm font-medium text-gray-900">
        {{ scenarioStore.scenarioTime.format("HH:mmZ") }}
      </p>
    </div>
    <span class="relative z-0 inline-flex shadow-sm rounded-md">
      <button
        @click="showModal = true"
        type="button"
        class="btn-group-btn rounded-l-md px-2"
      >
        <span class="sr-only">Select time and date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        @click="scenarioTimeStore.jumpToPrevEvent()"
        class="-ml-px btn-group-btn px-2"
      >
        <span class="sr-only">Previous</span>
        <SkipPrevious class="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        @click="scenarioTimeStore.jumpToNextEvent()"
        type="button"
        class="-ml-px btn-group-btn px-2"
      >
        <span class="sr-only">Next</span>
        <SkipNext class="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        @click="scenarioTimeStore.subtract(1, 'day')"
        class="-ml-px btn-group-btn px-2"
      >
        <span class="sr-only">Previous</span>
        <ChevronLeft class="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        @click="scenarioTimeStore.add(1, 'day')"
        type="button"
        class="-ml-px btn-group-btn px-2 rounded-r-md"
      >
        <span class="sr-only">Next</span>
        <ChevronRight class="h-5 w-5" aria-hidden="true" />
      </button>
    </span>
    <InputDateModal
      v-if="showModal"
      v-model="showModal"
      dialog-title="Set current scenario time"
      v-model:timestamp="scenarioStore.currentTime"
    />
    <GlobalEvents
      v-if="uiStore.shortcutsEnabled"
      :filter="inputEventFilter"
      @keyup.t="showModal = true"
    />
  </div>
</template>

<script>
import { computed, defineAsyncComponent, defineComponent, ref } from "vue";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/solid";

import { ChevronLeft, ChevronRight, SkipNext, SkipPrevious } from "mdue";
import { GlobalEvents } from "vue-global-events";
import { useScenarioStore } from "../stores/scenarioStore";
import { formatDateString } from "../geo/utils";
import { useUiStore } from "../stores/uiStore";
import { inputEventFilter } from "./helpers";
import { useScenarioTime } from "../stores/scenarioTime";

export default defineComponent({
  name: "TimeController",
  components: {
    InputDateModal: defineAsyncComponent(() => import("./InputDateModal.vue")),
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    GlobalEvents,
    ChevronLeft,
    ChevronRight,
    SkipNext,
    SkipPrevious,
  },
  setup() {
    const uiStore = useUiStore();
    const showModal = ref(false);
    const scenarioStore = useScenarioStore();
    const scenarioTimeStore = useScenarioTime();

    const scenarioTime = computed(() => formatDateString(scenarioStore.currentTime));

    return {
      scenarioTime,
      showModal,
      uiStore,
      inputEventFilter,
      scenarioStore,
      scenarioTimeStore,
    };
  },
});
</script>
