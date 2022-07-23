<template>
  <h3 class="mt-6 font-medium text-gray-900">Unit state</h3>

  <ul class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
    <li v-for="(s, index) in state" class="relative flex items-center py-4" :key="s.t">
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

      <div class="flex-0 relative flex items-center space-x-0">
        <IconButton @click="changeToState(s)" class="bg-gray-50">
          <CrosshairsGps class="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <!--        <IconButton @click="deleteState(index)" class="bg-gray-50">-->
        <!--          <XIcon class="h-5 w-5" aria-hidden="true" />-->
        <!--          <span class="sr-only">Delete entry</span>-->
        <!--        </IconButton>-->
        <DotsMenu :items="menuItems" @action="onStateAction(index, $event)" />
      </div>
      <div v-if="s.via" class="absolute -top-3 left-1/2">
        <div
          class="relative -left-1/2 flex items-center rounded-full border bg-white px-4 py-0.5"
        >
          <MapMarkerPath class="h-5 w-5 text-gray-500" />
        </div>
      </div>
    </li>
  </ul>
  <InputDateModal
    v-model="showDateModal"
    v-if="showDateModal"
    :timestamp="state[currentStateIndex].t"
    @update:timestamp="updateTimestamp"
    :time-zone="store.state.info.timeZone"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { State } from "@/types/scenarioModels";
import { formatDateString, formatPosition } from "@/geo/utils";
import { CrosshairsGps, MapMarkerPath } from "mdue";
import { XIcon } from "@heroicons/vue/solid";
import IconButton from "@/components/IconButton.vue";
import { useUnitActionsN } from "@/composables/scenarioActions";
import { StateAction, UnitActions } from "@/types/constants";
import type { NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import DotsMenu from "@/components/DotsMenu.vue";
import InputDateModal from "@/components/InputDateModal.vue";
import { MenuItemData } from "@/components/types";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();
const { store, time, unitActions } = injectStrict(activeScenarioKey);

const showDateModal = ref(false);

const { onUnitAction } = useUnitActionsN();
const state = computed(() => props.unit.state || []);

const menuItems: MenuItemData<StateAction>[] = [
  { label: "Delete", action: "delete" },
  { label: "Change time", action: "changeTime" },
  { label: "Convert to initial position", action: "convertToInitialPosition" },
];

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

let currentStateIndex = ref(-1);

function onStateAction(index: number, action: StateAction) {
  if (action === "delete") {
    deleteState(index);
  } else if (action === "convertToInitialPosition") {
    unitActions.convertStateEntryToInitialLocation(props.unit.id, index);
  } else if (action === "changeTime") {
    currentStateIndex.value = index;
    showDateModal.value = true;
  }
}

function updateTimestamp(newTimestamp: number) {
  unitActions.updateUnitStateEntry(props.unit.id, currentStateIndex.value, {
    t: newTimestamp,
  });
}
</script>
