<template>
  <div class="flex w-full items-center justify-between p-4">
    <div>
      <p class="text-sm font-medium text-gray-700">
        {{ scenarioStore.scenarioTime.format("YYYY-MM-DD") }}
      </p>
      <p class="text-sm font-medium text-gray-900">
        {{ scenarioStore.scenarioTime.format("HH:mmZ") }}
      </p>
    </div>

    <BaseToolbar>
      <ToolbarButton @click="showModal = true" start>
        <span class="sr-only">Select time and date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="scenarioTimeStore.jumpToPrevEvent()">
        <span class="sr-only">Previous</span>
        <SkipPrevious class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="scenarioTimeStore.jumpToNextEvent()">
        <span class="sr-only">Next</span>
        <SkipNext class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton type="button" @click="scenarioTimeStore.subtract(1, 'day')">
        <span class="sr-only">Previous</span>
        <ChevronLeft class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton @click="scenarioTimeStore.add(1, 'day')" end>
        <span class="sr-only">Next</span>
        <ChevronRight class="h-5 w-5" aria-hidden="true" />
      </ToolbarButton>
    </BaseToolbar>
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
import BaseToolbar from "./BaseToolbar.vue";
import BaseButton from "./BaseButton.vue";
import ToolbarButton from "./ToolbarButton.vue";

export default defineComponent({
  name: "TimeController",
  components: {
    ToolbarButton,
    BaseButton,
    BaseToolbar,
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
