<template>
  <nav
    class="pointer-events-auto flex w-full items-center justify-between border border-gray-300 bg-gray-50 p-1 text-sm shadow sm:rounded-xl md:w-auto"
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
      <div class="h-7 border-l-2 border-gray-300 sm:mx-1" />
      <div class="ml-2 flex items-center">
        <Popover as="template">
          <Float placement="top" :offset="12" flip shift strategy="fixed">
            <PopoverButton as="template">
              <PanelSymbolButton
                :size="20"
                :sidc="echelonSidc || ''"
                :symbol-options="symbolOptions"
                title="Select echelon"
              />
            </PopoverButton>
            <PopoverPanel focus v-slot="{ close }">
              <FloatingPanel class="grid grid-cols-5 justify-items-center gap-2 p-2">
                <PanelSymbolButton
                  class="self-end"
                  v-for="{ sidc, text } in emtItems"
                  :key="sidc"
                  :sidc="sidc"
                  :title="text"
                  :symbol-options="symbolOptions"
                  @click="selectEchelon(sidc, close)"
                />
              </FloatingPanel>
            </PopoverPanel>
          </Float>
        </Popover>
        <PanelSymbolButton
          :size="22"
          :sidc="computedSidc"
          class="group relative ml-5"
          :symbol-options="symbolOptions"
          @click="addUnit(activeSidc)"
          title="Add unit"
        >
          <AddSymbolIcon
            class="absolute -right-2 bottom-0 h-4 w-4 rounded-full bg-white bg-opacity-70 text-gray-600 group-hover:text-gray-900"
          />
        </PanelSymbolButton>
        <Popover as="template" v-slot="{ open, close }">
          <Float placement="top" :offset="12" flip shift strategy="fixed">
            <PopoverButton
              title="Select icons"
              class="ml-1 rounded p-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              @click="store.clearToolbar()"
              ><IconChevronUp
                class="h-6 w-6"
                :class="{ ' scale-150 text-red-800 ': open }"
              />
            </PopoverButton>
            <PopoverPanel focus v-slot="{ close }">
              <FloatingPanel class="overflow-hidden p-2">
                <RadioGroup
                  v-model="symbolPage"
                  class="isolate -mx-2 -mt-2 flex divide-x divide-gray-200 shadow focus:outline-none"
                  ><RadioGroupOption
                    as="template"
                    v-for="{ id, sidc, title } in symbolTabs"
                    :key="id"
                    v-slot="{ checked, active }"
                    :value="id"
                  >
                    <div
                      :class="[
                        checked ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                        'group relative min-w-0  justify-self-center  overflow-hidden bg-white px-4 py-2 hover:bg-gray-50  focus:z-10 focus:outline-none',
                      ]"
                    >
                      <MilitarySymbol
                        :sidc="sidc"
                        :title="title"
                        :size="15"
                        :options="{
                          monoColor: checked ? 'black' : 'black',
                          strokeWidth: 8,
                        }"
                      />
                      <span
                        aria-hidden="true"
                        :class="[
                          checked ? 'bg-army' : 'bg-transparent',
                          'absolute inset-x-0 bottom-0 h-0.5',
                        ]"
                      />
                    </div>
                  </RadioGroupOption>
                </RadioGroup>
                <div
                  class="mt-3 grid h-20 grid-cols-5 place-items-center items-center gap-2"
                >
                  <PanelSymbolButton
                    class=""
                    v-for="{ sidc, text } in iconItems"
                    :key="sidc"
                    :sidc="sidc"
                    :title="text"
                    :symbol-options="symbolOptions"
                    @click="addUnit(sidc, close)"
                  />
                  <PanelSymbolButton
                    class=""
                    :sidc="customSidc"
                    :title="customIcon.text"
                    :symbol-options="symbolOptions"
                    @click="addUnit(customSidc, close)"
                  />
                  <PanelButton @click="handleChangeSymbol()" title="Add symbol">
                    <AddSymbolIcon class="h-5 w-5" />
                  </PanelButton>
                </div>
              </FloatingPanel>
            </PopoverPanel>
          </Float>
        </Popover>
      </div>
    </section>
    <section class="flex items-center">
      <div class="h-7 border-l-2 border-gray-300 sm:mx-1" />
      <MainToolbarButton title="Undo" @click="undo()" :disabled="!canUndo">
        <UndoIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton title="Redo" @click="redo()" :disabled="!canRedo">
        <RedoIcon class="h-6 w-6" />
      </MainToolbarButton>
      <div class="mx-1 hidden h-7 border-l-2 border-gray-300 sm:block" />
      <MainToolbarButton class="hidden sm:block" @click="emit('open-time-modal')">
        <span class="sr-only">Select time and date</span>
        <CalendarIcon class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton class="hidden sm:block" @click="emit('dec-day')">
        <span class="sr-only">Previous</span>
        <IconChevronLeft class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton class="hidden sm:block" @click="emit('inc-day')">
        <span class="sr-only">Next</span>
        <IconChevronRight class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton class="hidden sm:block" @click="emit('prev-event')">
        <span class="sr-only">Previous event</span>
        <IconSkipPrevious class="h-5 w-5" aria-hidden="true" />
      </MainToolbarButton>
      <MainToolbarButton class="hidden sm:block" @click="emit('next-event')">
        <span class="sr-only">Next event</span>
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
  IconChevronUp,
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconPencil as DrawIcon,
  IconPlus as AddSymbolIcon,
  IconRedoVariant as RedoIcon,
  IconRulerSquareCompass as MeasurementIcon,
  IconUndoVariant as UndoIcon,
  IconSkipPrevious,
  IconSkipNext,
} from "@iconify-prerendered/vue-mdi";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { injectStrict } from "@/utils";
import { activeMapKey, activeScenarioKey, sidcModalKey } from "@/components/injects";
import { storeToRefs } from "pinia";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useEventBus, useToggle } from "@vueuse/core";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Float } from "@headlessui-float/vue";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  RadioGroup,
  RadioGroupOption,
} from "@headlessui/vue";
import PanelButton from "@/components/PanelButton.vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { computed, onMounted, Ref, ref, watch } from "vue";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { useActiveUnitStore } from "@/stores/dragStore";
import { orbatUnitClick } from "@/components/eventKeys";
import ToolbarButton from "@/components/ToolbarButton.vue";
import { CalendarIcon } from "@heroicons/vue/24/solid";

const emit = defineEmits([
  "open-time-modal",
  "inc-day",
  "dec-day",
  "next-event",
  "prev-event",
]);

const {
  store: { undo, redo, canRedo, canUndo, groupUpdate, state },
  unitActions,
  geo: { addUnitPosition },
} = injectStrict(activeScenarioKey);
const mapRef = injectStrict(activeMapKey);
const { getModalSidc } = injectStrict(sidcModalKey);

const store = useMainToolbarStore();
const { addMultiple } = storeToRefs(store);
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());
const selectStore = useMapSelectStore();
const toggleAddMultiple = useToggle(addMultiple);
const bus = useEventBus(orbatUnitClick);
const { activeUnitId, resetActiveParent, activeParent, activeParentId } =
  useActiveUnitStore();

const {
  currentSid,
  currentEchelon,
  iconItems,
  emtItems,
  echelonSidc,
  customIcon,
  customSidc,
  activeSidc,
  symbolPage,
} = useToolbarUnitSymbolData({});

const symbolTabs = ref([
  { title: "Land", sidc: "30031000001211000000", id: "land" },
  { title: "Sea", sidc: "10033000001201000000", id: "sea" },
  { title: "Air", sidc: "30030100001101000000", id: "air" },
]);

const computedSidc = computed(() => {
  const parsedSidc = new Sidc(activeSidc.value);
  parsedSidc.standardIdentity = currentSid.value;
  parsedSidc.emt = "00";
  parsedSidc.hqtfd = "0";
  return parsedSidc.toString();
});

const toggleMoveUnit = useToggle(moveUnitEnabled);

function selectEchelon(sidc: string, closePopover: (ref?: Ref | HTMLElement) => void) {
  currentEchelon.value = new Sidc(sidc).emt;
  closePopover();
}

const symbolOptions = computed(() =>
  activeParent.value
    ? unitActions.getCombinedSymbolOptions(activeParent.value, true)
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
    if (!activeParentId.value) return;
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

async function handleChangeSymbol() {
  const newSidcValue = await getModalSidc(customSidc.value, {
    title: "Select symbol",
    hideModifiers: true,
    symbolOptions: symbolOptions.value,
  });
  if (newSidcValue !== undefined) {
    customIcon.value.code = newSidcValue.sidc;
    addUnit(customSidc.value);
  }
}
</script>
