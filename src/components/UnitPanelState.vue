<template>
  <h3 class="font-medium text-gray-900 mt-6">Unit state</h3>
  <ul class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
    <li v-for="(s, index) in state" class="py-4 flex items-center">
      <div class="flex-auto min-w-0 text-sm flex flex-col">
        <p
          class="text-gray-500 font-medium"
          :class="{ 'text-gray-900 font-bold': isActive(s, index) }"
        >
          {{ formatDateString(s.t, scenarioStore.timeZone) }}
        </p>
        <p>{{ formatPosition(s.coordinates) }}</p>
      </div>

      <div class="flex-0 flex space-x-0">
        <IconButton @click="changeToState(s)" class="bg-gray-50">
          <CrosshairsGps class="h-5 w-5" aria-hidden="true" />
          <span class="sr-only">Delete entry</span>
        </IconButton>
        <IconButton @click="deleteState(index)" class="bg-gray-50">
          <XIcon class="h-5 w-5" aria-hidden="true" />
          <span class="sr-only">Delete entry</span>
        </IconButton>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, PropType } from "vue";
import { State, Unit } from "../types/models";
import { formatDateString, formatPosition } from "../geo/utils";
import { CrosshairsGps } from "mdue";
import { XIcon } from "@heroicons/vue/solid";
import { useScenarioStore } from "../stores/scenarioStore";
import IconButton from "./IconButton.vue";
import { useUnitActions } from "../composables/scenarioActions";
import { UnitActions } from "../types/constants";

export default defineComponent({
  name: "UnitPanelState",
  props: { unit: { type: Object as PropType<Unit>, required: true } },
  components: { IconButton, XIcon, CrosshairsGps },
  setup(props) {
    const scenarioStore = useScenarioStore();
    const { onUnitAction } = useUnitActions();
    const state = computed(() => props.unit.state);

    const deleteState = (index: number) => {
      scenarioStore.deleteUnitStateEntry(props.unit, index);
    };

    const isActive = (s: State, index: number) => {
      if (!state.value?.length) return;
      const nextUnitTimestamp = state.value[index + 1]?.t || Number.MAX_VALUE;
      const currentTime = scenarioStore.currentTime;
      return s.t <= currentTime && nextUnitTimestamp > currentTime;
    };

    const changeToState = (stateEntry: State) => {
      scenarioStore.setCurrentTime(stateEntry.t);
      if (stateEntry.coordinates) {
        onUnitAction(props.unit, UnitActions.Pan);
      }
    };

    return {
      formatPosition,
      formatDateString,
      deleteState,
      scenarioStore,
      state,
      isActive,
      changeToState,
    };
  },
});
</script>

<style scoped></style>
