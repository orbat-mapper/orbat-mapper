<template>
  <nav
    class="pointer-events-auto flex w-full items-center justify-between border border-gray-300 bg-mpanel p-1 text-sm shadow sm:rounded-xl md:w-auto"
  >
    <section class="flex items-center justify-between">
      <MainToolbarButton
        title="Keep selected tool active after drawing"
        @click="toggleAddMultiple()"
        class="hidden sm:block"
      >
        <IconLockOutline v-if="addMultiple" class="h-5 w-5" />
        <IconLockOpenVariantOutline v-else class="h-5 w-5" />
      </MainToolbarButton>
      <MainToolbarButton @click="toggleMoveUnit(false)" :active="!moveUnitEnabled">
        <SelectIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton
        :active="moveUnitEnabled"
        @click="toggleMoveUnit(true)"
        title="Move unit"
      >
        <MoveIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton
        @click="emit('show-settings')"
        title="Show settings"
        class="hidden md:block"
      >
        <SettingsIcon class="h-6 w-6" />
      </MainToolbarButton>
      <div class="h-7 border-l-2 border-gray-300 sm:mx-1" />
      <MainToolbarButton
        :active="store.currentToolbar === 'measurements'"
        @click="store.toggleToolbar('measurements')"
        title="Measurements"
      >
        <MeasurementIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton
        :active="store.currentToolbar === 'draw'"
        @click="store.toggleToolbar('draw')"
        title="Draw"
      >
        <DrawIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Unit track"
        :active="store.currentToolbar === 'track'"
        @click="store.toggleToolbar('track')"
      >
        <IconMapMarkerPath class="h-6 w-6" />
      </MainToolbarButton>
      <div class="h-7 border-l-2 border-gray-300 sm:mx-1" />
      <div class="ml-2 flex items-center">
        <EchelonPickerPopover
          :symbol-options="symbolOptions"
          :select-echelon="selectEchelon"
        />
        <PanelSymbolButton
          :size="22"
          :sidc="computedSidc"
          class="group relative ml-2 sm:ml-5"
          :symbol-options="symbolOptions"
          @click="addUnit(activeSidc)"
          title="Add unit"
          :disabled="!activeParentId || unitActions.isUnitLocked(activeParentId)"
        >
          <AddSymbolIcon
            class="absolute -right-2 bottom-0 h-4 w-4 rounded-full bg-white bg-opacity-70 text-gray-600 group-hover:text-gray-900"
          />
        </PanelSymbolButton>
        <SymbolPickerPopover :symbol-options="symbolOptions" :add-unit="addUnit" />
      </div>
    </section>
    <section class="flex items-center">
      <div class="-mx-1 h-7 border-l-2 border-gray-300 sm:mx-1" />
      <MainToolbarButton title="Undo" @click="undo()" :disabled="!canUndo">
        <UndoIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton title="Redo" @click="redo()" :disabled="!canRedo">
        <RedoIcon class="h-6 w-6" />
      </MainToolbarButton>
      <div class="mx-1 hidden h-7 border-l-2 border-gray-300 sm:block" />
      <MainToolbarButton
        title="Select Time and Date"
        class="hidden sm:block"
        @click="emit('open-time-modal')"
      >
        <span class="sr-only">Select Time and Date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Previous Day"
        class="hidden sm:block"
        @click="emit('dec-day')"
      >
        <span class="sr-only">Previous Day</span>
        <IconChevronLeft class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Next Day"
        class="hidden sm:block"
        @click="emit('inc-day')"
      >
        <span class="sr-only">Next Day</span>
        <IconChevronRight class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Previous Event"
        class="hidden sm:block"
        @click="emit('prev-event')"
      >
        <span class="sr-only">Previous Event</span>
        <IconSkipPrevious class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton
        title="Next Event"
        class="hidden sm:block"
        @click="emit('next-event')"
      >
        <span class="sr-only">Next Event</span>
        <IconSkipNext class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
    </section>
    <FloatingPanel
      v-if="isGetLocationActive"
      class="absolute bottom-14 overflow-visible bg-opacity-75 p-2 px-4 text-sm sm:bottom-16 sm:left-1/2 sm:-translate-x-1/2"
    >
      Click on map or ORBAT to place unit.
      <button
        type="button"
        class="ml-4 font-medium text-blue-700 hover:text-blue-600"
        @click="cancelGetLocation()"
      >
        Cancel
      </button>
    </FloatingPanel>
  </nav>
</template>
<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconCogOutline as SettingsIcon,
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMapMarkerPath,
  IconPencil as DrawIcon,
  IconPlus as AddSymbolIcon,
  IconRedoVariant as RedoIcon,
  IconRulerSquareCompass as MeasurementIcon,
  IconSkipNext,
  IconSkipPrevious,
  IconUndoVariant as UndoIcon,
} from "@iconify-prerendered/vue-mdi";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { injectStrict } from "@/utils";
import { activeMapKey, activeScenarioKey } from "@/components/injects";
import { storeToRefs } from "pinia";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useEventBus, useToggle } from "@vueuse/core";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { computed, onMounted, Ref, watch } from "vue";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import { useActiveUnitStore } from "@/stores/dragStore";
import { orbatUnitClick } from "@/components/eventKeys";
import { CalendarIcon } from "@heroicons/vue/24/solid";
import SymbolPickerPopover from "@/modules/scenarioeditor/SymbolPickerPopover.vue";
import EchelonPickerPopover from "@/modules/scenarioeditor/EchelonPickerPopover.vue";

const emit = defineEmits([
  "open-time-modal",
  "inc-day",
  "dec-day",
  "next-event",
  "prev-event",
  "show-settings",
]);

const {
  store: { undo, redo, canRedo, canUndo, groupUpdate, state },
  unitActions,
  geo: { addUnitPosition },
} = injectStrict(activeScenarioKey);
const mapRef = injectStrict(activeMapKey);

const store = useMainToolbarStore();
const { addMultiple } = storeToRefs(store);
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());
const selectStore = useMapSelectStore();
const toggleAddMultiple = useToggle(addMultiple);
const bus = useEventBus(orbatUnitClick);
const { activeUnitId, resetActiveParent, activeParent, activeParentId } =
  useActiveUnitStore();

const { currentSid, currentEchelon, activeSidc } = useToolbarUnitSymbolData();

const computedSidc = computed(() => {
  const parsedSidc = new Sidc(activeSidc.value);
  parsedSidc.standardIdentity = currentSid.value;
  parsedSidc.emt = "00";
  parsedSidc.hqtfd = "0";
  return parsedSidc.toString();
});

const toggleMoveUnit = useToggle(moveUnitEnabled);

const symbolOptions = computed(() =>
  activeParent.value
    ? {
        ...unitActions.getCombinedSymbolOptions(activeParent.value, true),
        outlineWidth: 4,
      }
    : {},
);

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  cancel: cancelGetLocation,
  onGetLocation,
  onCancel,
  onStart,
} = useGetMapLocation(mapRef.value, {
  cancelOnClickOutside: false,
  stopPropagationOnClickOutside: false,
});

function addUnit(sidc: string, closePopover?: (ref?: Ref | HTMLElement) => void) {
  activeSidc.value = sidc;
  closePopover && closePopover();
  startGetLocation();
}

onMounted(() => {
  if (!activeParentId.value) resetActiveParent();
});

onCancel(() => {
  selectStore.hoverEnabled = true;
});

onStart(() => {
  selectStore.hoverEnabled = false;
  store.clearToolbar();
});

onGetLocation((location) => {
  selectStore.hoverEnabled = true;
  groupUpdate(() => {
    if (!activeParentId.value || unitActions.isUnitLocked(activeParentId.value)) return;
    const name = `${(activeParent.value?.subUnits?.length ?? 0) + 1}`;
    const sidc = new Sidc(activeSidc.value!);
    sidc.emt = currentEchelon.value;
    sidc.standardIdentity = currentSid.value;
    const unitId = unitActions.createSubordinateUnit(activeParentId.value, {
      sidc: sidc.toString(),
      name,
    });
    unitId && addUnitPosition(unitId, location);
  });
  if (addMultiple.value && activeSidc.value) {
    addUnit(activeSidc.value);
  }
});

bus.on((unit) => {
  if (isGetLocationActive.value) {
    if (!(addMultiple.value && activeSidc.value)) {
      cancelGetLocation();
    }
    const name = `${(activeParent.value?.subUnits?.length ?? 0) + 1}`;
    const sidc = new Sidc(activeSidc.value!);
    sidc.emt = currentEchelon.value;
    sidc.standardIdentity = unit.sidc[SID_INDEX];
    const unitId = unitActions.createSubordinateUnit(unit.id, {
      sidc: sidc.toString(),
      name,
    });
  }
});

watch(activeParent, (unitOrSideGroup) => {
  if (!unitOrSideGroup) return;
  if ("sidc" in unitOrSideGroup) {
    currentSid.value = unitOrSideGroup.sidc[SID_INDEX];
  } else {
    currentSid.value = state.getSideById(unitOrSideGroup._pid).standardIdentity;
  }
});

function selectEchelon(sidc: string, closePopover: (ref?: Ref | HTMLElement) => void) {
  currentEchelon.value = new Sidc(sidc).emt;
  closePopover();
}
</script>
