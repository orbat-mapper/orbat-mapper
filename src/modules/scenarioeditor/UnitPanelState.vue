<template>
  <h3 class="text-foreground mt-6 font-medium">Unit state</h3>
  <div class="flex items-center justify-between">
    <span class="text-sm">Change</span>
    <div class="flex items-center gap-1">
      <UnitStatusPopover @update="setUnitStatus" :disabled="isLocked" />
      <SplitButton :items="stateItems" v-model:active-item="uiState.activeStateItem" />
    </div>
  </div>

  <ul class="divide-border border-border mt-2 divide-y border-t border-b">
    <li v-if="unit.location" class="relative flex items-center py-4">
      <div class="flex min-w-0 flex-auto flex-col text-sm">
        <span class="text-muted-foreground font-medium">Initial position</span>
        <CoordinateInput
          v-if="editInitialPosition"
          v-model="newPosition"
          :format="coordinateInputFormat"
          @update:format="coordinateInputFormat = $event"
          @outBlur="doneEditInitialPosition()"
          @keyup.enter="doneEditInitialPosition()"
          @keyup.esc="cancelEdit()"
          autofocus
        />
        <p v-else class="text-foreground" @dblclick="startEditInitialPosition()">
          {{ formatPosition(unit.location) }}
        </p>
      </div>
      <div class="relative flex flex-0 items-center space-x-0">
        <DotsMenu :items="initialMenuItems" @action="onStateAction(-1, $event)" portal />
      </div>
    </li>
    <li
      v-for="(s, index) in state"
      class="relative flex items-center py-4"
      :key="s.id"
      :class="selectedWaypointIds.has(s.id) ? 'bg-accent/10' : ''"
    >
      <div class="flex min-w-0 flex-auto flex-col text-sm">
        <button
          class="flex"
          :class="
            isActive(s, index)
              ? 'text-foreground font-bold'
              : 'text-muted-foreground font-medium'
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
          class="text-foreground my-1 leading-tight font-medium"
          @dblclick="editTitle(s)"
        >
          {{ s.title }}
        </p>
        <CoordinateInput
          v-if="s === editedPosition"
          v-model="newPosition"
          :format="coordinateInputFormat"
          @update:format="coordinateInputFormat = $event"
          @outBlur="doneEditPosition(s)"
          @keyup.enter="doneEditPosition(s)"
          @keyup.esc="cancelEdit()"
          autofocus
        />
        <p
          class="text-foreground mt-1"
          v-else-if="s.location"
          @dblclick="editPosition(s)"
        >
          {{ formatPosition(s.location) }}
        </p>
        <IconMapMarkerOffOutline
          v-if="s.location === null"
          class="text-muted-foreground h-5 w-5"
        />
        <div class="mt-1 flex gap-1">
          <span
            v-if="s.sidc"
            class="bg-accent/10 text-accent-foreground w-12 rounded-full px-2.5 py-0.5 text-xs font-medium"
            >sidc</span
          >
          <span
            v-if="s.status"
            class="bg-muted/10 text-muted-foreground w-auto rounded-full px-2.5 py-0.5 text-xs font-medium"
            >{{ unitStatusMap[s.status]?.name }}</span
          >
          <span v-if="s.update?.equipment" class="badge">Equipment</span>
          <span v-if="s.update?.personnel" class="badge">Personnel</span>
          <span v-if="s.update?.supplies" class="badge">Supplies</span>
          <span v-if="s.diff?.equipment" class="badge">±Equipment</span>
          <span v-if="s.diff?.personnel" class="badge">±Personnel</span>
          <span v-if="s.diff?.supplies" class="badge">±Supplies</span>
        </div>
      </div>

      <div class="relative flex flex-0 items-center space-x-0">
        <IconButton title="Goto Time and Place" @click="changeToState(s)">
          <IconCrosshairsGps class="h-5 w-5" aria-hidden="true" />
        </IconButton>
        <DotsMenu :items="menuItems" @action="onStateAction(index, $event)" portal />
      </div>
      <div
        v-if="s.via?.length || s.viaStartTime !== undefined || s.interpolate === false"
        class="absolute -top-3 left-1/2"
      >
        <div
          class="border-border bg-muted relative -left-1/2 flex items-center rounded-full border px-4 py-0.5"
        >
          <IconMapMarkerPath v-if="s.via?.length" class="text-muted-foreground h-5 w-5" />
          <IconMapMarkerAlert
            v-else-if="s.interpolate === false"
            class="text-muted-foreground h-5 w-5"
          />
          <span v-if="s.viaStartTime" class="text-muted-foreground ml-2 text-xs">{{
            formatDateString(s.viaStartTime, store.state.info.timeZone)
          }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, type VNode } from "vue";
import {
  IconCrosshairsGps,
  IconMapMarkerAlert,
  IconMapMarkerOffOutline,
  IconMapMarkerPath,
} from "@iconify-prerendered/vue-mdi";
import type { StateAdd } from "@/types/scenarioModels";
import { formatDateString, formatPosition } from "@/geo/utils";
import IconButton from "@/components/IconButton.vue";
import { useUnitActions } from "@/composables/scenarioActions";
import { type StateAction, UnitActions } from "@/types/constants";
import type { NState, NUnit } from "@/types/internalModels";
import { injectStrict } from "@/utils";
import { activeScenarioKey, sidcModalKey, timeModalKey } from "@/components/injects";
import DotsMenu from "@/components/DotsMenu.vue";
import CoordinateInput, {
  type CoordinateInputFormat,
} from "@/components/CoordinateInput.vue";
import type { ButtonGroupItem, MenuItemData } from "@/components/types";
import SplitButton from "@/components/SplitButton.vue";
import { useUiStore } from "@/stores/uiStore";
import { useSelectedWaypoints } from "@/stores/selectedWaypoints";
import UnitStatusPopover from "@/modules/scenarioeditor/UnitStatusPopover.vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { useLocalStorage } from "@vueuse/core";

interface Props {
  unit: NUnit;
  isLocked?: boolean;
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

const menuItems = computed((): MenuItemData<StateAction>[] => [
  { label: "Delete", action: "delete", disabled: props.isLocked },
  { label: "Duplicate", action: "duplicate", disabled: props.isLocked },
  { label: "Change time", action: "changeTime", disabled: props.isLocked },
  { label: "Edit title", action: "editTitle", disabled: props.isLocked },
  { label: "Edit location", action: "editLocation", disabled: props.isLocked },
  { label: "Clear location", action: "clearLocation", disabled: props.isLocked },
  {
    label: "Convert to initial position",
    action: "convertToInitialPosition",
    disabled: props.isLocked,
  },
  // { label: "Change status", action: "changeStatus" },
]);

const initialMenuItems = computed((): MenuItemData<StateAction>[] => [
  { label: "Delete", action: "delete", disabled: props.isLocked },
  { label: "Edit initial position", action: "editLocation", disabled: props.isLocked },
]);

const stateItems = computed((): ButtonGroupItem[] => [
  {
    label: "Change symbol",
    onClick: () => {
      handleChangeSymbol();
    },
    disabled: props.isLocked,
  },
  {
    label: "Remove from map",
    onClick: () => {
      handleRemoveFromMap();
    },
    disabled: props.isLocked,
  },
]);

const coordinateInputFormat = useLocalStorage<CoordinateInputFormat>(
  "coordinateInputFormat",
  "LonLat",
);

const editedTitle = ref<NState | null>();
const editedPosition = ref<NState | null>();
const editInitialPosition = ref(false);

const deleteState = (index: number) => {
  unitActions.deleteUnitStateEntry(props.unit.id, index);
};

const isActive = (s: NState, index: number) => {
  if (!state.value?.length) return;
  const nextUnitTimestamp = state.value[index + 1]?.t || Number.MAX_VALUE;
  const currentTime = store.state.currentTime;
  return s.t <= currentTime && nextUnitTimestamp > currentTime;
};

const changeToState = (stateEntry: NState) => {
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
    await editTitle(state.value[index]);
  } else if (action === "editLocation") {
    if (index < 0) {
      startEditInitialPosition();
    } else {
      await editPosition(state.value[index]);
    }
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

function onStateClick(e: MouseEvent, s: NState) {
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
async function editTitle(s: NState) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  editedTitle.value = s;
  newTitle.value = s.title || "";
}

function doneEdit(s: NState) {
  if (!editedTitle.value) return;
  const index = state.value.indexOf(s);
  editedTitle.value = null;
  if (index < 0 || newTitle.value === s.title) return;
  unitActions.updateUnitStateEntry(props.unit.id, index, {
    title: newTitle.value,
  });
  newTitle.value = "";
}

function cancelEdit() {
  editedTitle.value = null;
  newTitle.value = "";
  editedPosition.value = null;
  newPosition.value = null;
  editInitialPosition.value = false;
}

const newPosition = ref();

async function editPosition(s: NState) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  editedPosition.value = s;
  newPosition.value = s.location;
}

function doneEditPosition(s: NState) {
  if (!editedPosition.value) return;
  const index = state.value.indexOf(s);
  editedPosition.value = null;
  if (index < 0) return;
  unitActions.updateUnitStateEntry(props.unit.id, index, {
    location: newPosition.value,
  });
  newPosition.value = null;
}

function startEditInitialPosition() {
  nextTick(() => (editInitialPosition.value = true));
  newPosition.value = props.unit.location ?? [0, 0];
}

function doneEditInitialPosition() {
  editInitialPosition.value = false;
  unitActions.updateUnit(
    props.unit.id,
    { location: newPosition.value },
    { doUpdateUnitState: true },
  );
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
