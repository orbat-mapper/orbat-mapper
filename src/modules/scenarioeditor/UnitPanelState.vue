<template>
  <h3 class="mt-6 font-medium text-gray-900">Unit state</h3>
  <ul class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
    <li v-for="(s, index) in state" class="flex items-center py-4" :key="s.t">
      <div class="flex min-w-0 flex-auto flex-col text-sm">
        <p
          :class="
            isActive(s, index) ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
          "
        >
          {{ formatDateString(s.t, store.state.info.timeZone) }}
        </p>
        <p>{{ formatPosition(s.location) }}</p>
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

<script setup lang="ts">
import { computed } from "vue";
import { State } from "@/types/scenarioModels";
import { formatDateString, formatPosition } from "@/geo/utils";
import { CrosshairsGps } from "mdue";
import { XIcon } from "@heroicons/vue/solid";
import IconButton from "@/components/IconButton.vue";
import { useUnitActionsN } from "@/composables/scenarioActions";
import { UnitActions } from "@/types/constants";
import type { NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();
const { store, time, unitActions } = injectStrict(activeScenarioKey);

const { onUnitAction } = useUnitActionsN();
const state = computed(() => props.unit.state);

const deleteState = (index: number) => {
  unitActions.deleteUnitStateEntry(props.unit.id, index);
};

const isActive = (s: State, index: number) => {
  if (!state.value?.length) return;
  const nextUnitTimestamp = state.value[index + 1]?.t || Number.MAX_VALUE;
  const currentTime = store.state.currentTime;
  return s.t <= currentTime && nextUnitTimestamp > currentTime;
};

const changeToState = (stateEntry: State) => {
  time.setCurrentTime(stateEntry.t);

  if (stateEntry.location) {
    onUnitAction(props.unit, UnitActions.Pan);
  }
};
</script>
