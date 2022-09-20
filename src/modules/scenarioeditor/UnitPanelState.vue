<template>
  <h3 class="mt-6 font-medium text-gray-900">Unit state</h3>
  <div class="flex items-center">
    <span class="text-sm">Change state</span>
    <SplitButton
      class="ml-2"
      :items="stateItems"
      v-model:active-item="uiState.activeStateItem"
    ></SplitButton>
  </div>

  <ul class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
    <li v-for="(s, index) in state" class="relative flex items-center py-4" :key="s.id">
      <div class="flex min-w-0 flex-auto flex-col text-sm">
        <p
          :class="
            isActive(s, index) ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
          "
        >
          {{ formatDateString(s.t, store.state.info.timeZone) }}
        </p>
        <input
          v-if="s === editedTitle"
          type="text"
          v-model="newTitle"
          @vnode-mounted="onVMounted"
          @blur="doneEdit(s)"
          @keyup.enter="doneEdit(s)"
          @keyup.escape="cancelEdit(s)"
        />
        <p
          v-else-if="s.title"
          class="my-1 font-medium leading-tight text-gray-900"
          @dblclick="editTitle(s)"
        >
          {{ s.title }}
        </p>

        <p class="text-gray-700" v-if="s.location">{{ formatPosition(s.location) }}</p>
        <MapMarkerOffOutline v-if="s.location === null" class="h-5 w-5 text-gray-600" />
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
</template>

<script setup lang="ts">
import { computed, nextTick, ref, VNode } from "vue";
import { State, StateAdd } from "@/types/scenarioModels";
import { formatDateString, formatPosition } from "@/geo/utils";
import { CrosshairsGps, MapMarkerPath, MapMarkerOffOutline } from "mdue";
import IconButton from "@/components/IconButton.vue";
import { useUnitActions } from "@/composables/scenarioActions";
import { StateAction, UnitActions } from "@/types/constants";
import type { NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey, timeModalKey } from "@/components/injects";
import DotsMenu from "@/components/DotsMenu.vue";

import { ButtonGroupItem, MenuItemData } from "@/components/types";
import BaseButton from "@/components/BaseButton.vue";
import SplitButton from "@/components/SplitButton.vue";
import { useUiStore } from "@/stores/uiStore";
import { useNotifications } from "@/composables/notifications";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();
const { store, time, unitActions } = injectStrict(activeScenarioKey);
const { getModalTimestamp } = injectStrict(timeModalKey);

const { onUnitAction } = useUnitActions();
const { send } = useNotifications();
const state = computed(() => props.unit.state || []);
const uiState = useUiStore();

const menuItems: MenuItemData<StateAction>[] = [
  { label: "Delete", action: "delete" },
  { label: "Duplicate", action: "duplicate" },
  { label: "Change time", action: "changeTime" },
  { label: "Edit title", action: "editTitle" },
  { label: "Clear location", action: "clearLocation" },
  { label: "Convert to initial position", action: "convertToInitialPosition" },
];

const stateItems = computed<ButtonGroupItem[]>(() => {
  return [
    {
      label: "Change symbol",
      onClick: () => {
        send({ message: "Not implemented yet" });
      },
    },
    {
      label: "Remove from map",
      onClick: () => {
        const newState: StateAdd = {
          location: null,
          t: store.state.currentTime,
        };
        unitActions.addUnitStateEntry(props.unit.id, newState, true);
      },
    },
  ];
});

const editedTitle = ref<State | null>();

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

async function onStateAction(index: number, action: StateAction) {
  if (action === "delete") {
    deleteState(index);
  } else if (action === "convertToInitialPosition") {
    unitActions.convertStateEntryToInitialLocation(props.unit.id, index);
  } else if (action === "changeTime") {
    const newTimestamp = await getModalTimestamp(state.value[index].t, {
      timeZone: store.state.info.timeZone,
      title: "Set event time",
    });
    if (newTimestamp !== undefined) {
      unitActions.updateUnitStateEntry(props.unit.id, index, {
        t: newTimestamp,
      });
    }
  } else if (action === "editTitle") {
    editTitle(state.value[index]);
  } else if (action === "duplicate") {
    unitActions.addUnitStateEntry(props.unit.id, {
      ...state.value[index],
      t: store.state.currentTime,
    });
  } else if (action === "clearLocation") {
    unitActions.updateUnitStateEntry(props.unit.id, index, {
      location: null,
    });
  }
}

const newTitle = ref();
function editTitle(s: State) {
  nextTick(() => (editedTitle.value = s));
  newTitle.value = s.title || "";
}

function doneEdit(s: State) {
  if (!editedTitle.value) return;
  const index = state.value.indexOf(s);
  editedTitle.value = null;
  if (index < 0) return;
  unitActions.updateUnitStateEntry(props.unit.id, index, {
    title: newTitle.value,
  });
  newTitle.value = "";
}

function cancelEdit(s: State) {
  editedTitle.value = null;
  newTitle.value = "";
}

const onVMounted = ({ el }: VNode) => el?.focus();
</script>
