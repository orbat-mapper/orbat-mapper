<template>
  <h3 class="mt-6 font-medium text-gray-900">Unit state</h3>
  <div class="flex items-center justify-between">
    <span class="text-sm">Change</span>
    <div class="flex items-center">
      <UnitStatusPopover @update="setUnitStatus" />
      <SplitButton :items="stateItems" v-model:active-item="uiState.activeStateItem" />
    </div>
  </div>

  <ul class="mt-2 divide-y divide-gray-200 border-b border-t border-gray-200">
    <li v-if="unit.location" class="relative flex items-center py-4">
      <div class="flex min-w-0 flex-auto flex-col text-sm">
        <span class="font-medium text-gray-500">Initial position</span>
        <p class="text-gray-700">{{ formatPosition(unit.location) }}</p>
      </div>
      <div class="flex-0 relative flex items-center space-x-0">
        <DotsMenu :items="initialMenuItems" @action="onStateAction(-1, $event)" />
      </div>
    </li>
    <li
      v-for="(s, index) in state"
      class="relative flex items-center py-4"
      :key="s.id"
      :class="selectedWaypointIds.has(s.id) ? 'bg-yellow-200' : ''"
    >
      <div class="flex min-w-0 flex-auto flex-col text-sm">
        <button
          class="flex"
          :class="
            isActive(s, index) ? 'font-bold text-gray-900' : 'font-medium text-gray-500'
          "
          @click="onStateClick($event, s)"
        >
          {{ fmt.scenarioFormatter.format(s.t) }}
        </button>
        <input
          v-if="s === editedTitle"
          type="text"
          v-model="newTitle"
          @vue:mounted="onVMounted"
          @blur="doneEdit(s)"
          @keyup.enter="doneEdit(s)"
          @keyup.esc="cancelEdit()"
        />
        <p
          v-else-if="s.title"
          class="my-1 font-medium leading-tight text-gray-900"
          @dblclick="editTitle(s)"
        >
          {{ s.title }}
        </p>
        <CoordinateInput
          v-if="s === editedPosition"
          v-model="newPosition"
          :format="coordinateInputFormat"
          @update:format="coordinateInputFormat = $event"
          @blur="doneEdit(s)"
          @keyup.enter="doneEditPosition(s)"
          @keyup.esc="cancelEditPosition()"
          autofocus
        />
        <p class="mt-1 text-gray-700" v-else-if="s.location" @dblclick="editPosition(s)">
          {{ formatPosition(s.location) }}
        </p>
        <IconMapMarkerOffOutline
          v-if="s.location === null"
          class="h-5 w-5 text-gray-600"
        />
        <div class="flex">
          <span
            v-if="s.sidc"
            class="w-12 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
            >sidc</span
          >
          <span
            v-if="s.status"
            class="w-auto rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
            >{{ unitStatusMap[s.status]?.name }}</span
          >
        </div>
      </div>

      <div class="flex-0 relative flex items-center space-x-0">
        <IconButton
          title="Goto Time and Place"
          @click="changeToState(s)"
          class="bg-gray-50"
        >
          <IconCrosshairsGps class="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <DotsMenu :items="menuItems" @action="onStateAction(index, $event)" />
      </div>
      <div
        v-if="s.via?.length || s.viaStartTime !== undefined || s.interpolate === false"
        class="absolute -top-3 left-1/2"
      >
        <div
          class="relative -left-1/2 flex items-center rounded-full border bg-white px-4 py-0.5"
        >
          <IconMapMarkerPath v-if="s.via?.length" class="h-5 w-5 text-gray-500" />
          <IconMapMarkerAlert
            v-else-if="s.interpolate === false"
            class="h-5 w-5 text-gray-500"
          />
          <span v-if="s.viaStartTime" class="ml-2 text-xs text-gray-600">{{
            formatDateString(s.viaStartTime, store.state.info.timeZone)
          }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, VNode } from "vue";
import {
  IconCrosshairsGps,
  IconMapMarkerAlert,
  IconMapMarkerOffOutline,
  IconMapMarkerPath,
} from "@iconify-prerendered/vue-mdi";
import type { State, StateAdd } from "@/types/scenarioModels";
import { formatDateString, formatPosition } from "@/geo/utils";
import IconButton from "@/components/IconButton.vue";
import { useUnitActions } from "@/composables/scenarioActions";
import { StateAction, UnitActions } from "@/types/constants";
import type { NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey, sidcModalKey, timeModalKey } from "@/components/injects";
import DotsMenu from "@/components/DotsMenu.vue";
import CoordinateInput, { CoordinateInputFormat } from "@/components/CoordinateInput.vue";
import { ButtonGroupItem, MenuItemData } from "@/components/types";
import SplitButton from "@/components/SplitButton.vue";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedWaypoints } from "@/stores/selectedWaypoints";
import UnitStatusPopover from "@/modules/scenarioeditor/UnitStatusPopover.vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { useLocalStorage } from "@vueuse/core";

interface Props {
  unit: NUnit;
}
const props = defineProps<Props>();
const { store, time, unitActions } = injectStrict(activeScenarioKey);
const { getModalTimestamp } = injectStrict(timeModalKey);
const { getModalSidc } = injectStrict(sidcModalKey);

const {
  state: { unitStatusMap },
} = store;
const { onUnitAction } = useUnitActions();
const fmt = useTimeFormatStore();
const state = computed(() => props.unit.state || []);
const uiState = useUiStore();
const { selectedWaypointIds } = useSelectedWaypoints();

const menuItems: MenuItemData<StateAction>[] = [
  { label: "Delete", action: "delete" },
  { label: "Duplicate", action: "duplicate" },
  { label: "Change time", action: "changeTime" },
  { label: "Edit title", action: "editTitle" },
  { label: "Edit location", action: "editLocation" },
  { label: "Clear location", action: "clearLocation" },
  { label: "Convert to initial position", action: "convertToInitialPosition" },
  // { label: "Change status", action: "changeStatus" },
];

const initialMenuItems: MenuItemData<StateAction>[] = [
  { label: "Delete", action: "delete" },
];

const stateItems: ButtonGroupItem[] = [
  {
    label: "Change symbol",
    onClick: () => {
      handleChangeSymbol();
    },
  },
  {
    label: "Remove from map",
    onClick: () => {
      handleRemoveFromMap();
    },
  },
];

const coordinateInputFormat = useLocalStorage<CoordinateInputFormat>(
  "coordinateInputFormat",
  "LonLat",
);

const editedTitle = ref<State | null>();
const editedPosition = ref<State | null>();

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
    if (index < 0) {
      unitActions.updateUnit(
        props.unit.id,
        { location: undefined },
        { doUpdateUnitState: true },
      );
    } else {
      deleteState(index);
    }
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
  } else if (action === "editLocation") {
    editPosition(state.value[index]);
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

function onStateClick(e: MouseEvent, s: State) {
  if (s.location) {
    if (selectedWaypointIds.value.has(s.id)) {
      selectedWaypointIds.value.delete(s.id);
    } else {
      if (!e.shiftKey) {
        selectedWaypointIds.value.clear();
      }
      selectedWaypointIds.value.add(s.id);
    }
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

function cancelEdit() {
  editedTitle.value = null;
  newTitle.value = "";
}

const newPosition = ref();
function editPosition(s: State) {
  nextTick(() => (editedPosition.value = s));
  newPosition.value = s.location;
}

function doneEditPosition(s: State) {
  if (!editedPosition.value) return;
  const index = state.value.indexOf(s);
  editedPosition.value = null;
  if (index < 0) return;
  unitActions.updateUnitStateEntry(props.unit.id, index, {
    location: newPosition.value,
  });
  newPosition.value = null;
}

function cancelEditPosition() {
  editedPosition.value = null;
  newPosition.value = null;
}

const onVMounted = ({ el }: VNode) => el?.focus();

async function handleChangeSymbol() {
  const newSidcValue = await getModalSidc(props.unit.sidc, {
    title: `Change symbol at ${formatDateString(
      store.state.currentTime,
      store.state.info.timeZone,
    )}`,
    symbolOptions: unitActions.getCombinedSymbolOptions(props.unit),
  });
  if (newSidcValue !== undefined) {
    const newState: StateAdd = {
      sidc: newSidcValue.sidc,
      t: store.state.currentTime,
      symbolOptions: newSidcValue.symbolOptions,
    };
    unitActions.addUnitStateEntry(props.unit.id, newState, true);
  }
}

function handleRemoveFromMap() {
  const newState: StateAdd = {
    location: null,
    t: store.state.currentTime,
  };
  unitActions.addUnitStateEntry(props.unit.id, newState, true);
}

function setUnitStatus(newStatus?: string | null) {
  const newState: StateAdd = {
    status: newStatus,
    t: store.state.currentTime,
  };
  unitActions.addUnitStateEntry(props.unit.id, newState, true);
}
</script>
