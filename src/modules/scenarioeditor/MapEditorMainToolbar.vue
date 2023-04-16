<template>
  <nav
    class="pointer-events-auto flex w-full items-center justify-between overflow-x-auto border border-gray-300 bg-gray-50 p-1 text-sm shadow sm:max-w-md sm:rounded-xl"
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
          <Float placement="top" :offset="12" flip shift portal>
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
          class="ml-5"
          :symbol-options="symbolOptions"
          @click="addUnit(activeSidc)"
        />
        <Popover as="template">
          <Float placement="top" :offset="12" flip shift portal>
            <PopoverButton as="template">
              <PanelButton title="Select icons" class="ml-1"
                ><IconChevronUp class="h-6 w-6"
              /></PanelButton>
            </PopoverButton>
            <PopoverPanel focus v-slot="{ close }">
              <FloatingPanel class="grid grid-cols-4 justify-items-center gap-2 p-2">
                <PanelSymbolButton
                  class="self-end"
                  v-for="{ sidc, text } in iconItems"
                  :key="sidc"
                  :sidc="sidc"
                  :title="text"
                  :symbol-options="symbolOptions"
                  @click="addUnit(sidc, close)"
                />
                <PanelSymbolButton
                  class="self-end"
                  :sidc="customSidc"
                  :title="customIcon.text"
                  :symbol-options="symbolOptions"
                  @click="addUnit(customSidc, close)"
                />
                <PanelButton @click="handleChangeSymbol()" title="Select symbol">
                  <IconDotsHorizontal class="h-5 w-5" />
                </PanelButton>
              </FloatingPanel>
            </PopoverPanel>
          </Float>
        </Popover>
      </div>
    </section>
    <section class="flex items-center -space-x-1">
      <div class="h-7 border-l-2 border-gray-300 sm:mx-1" />
      <MainToolbarButton title="Undo" @click="undo()" :disabled="!canUndo">
        <UndoIcon class="h-6 w-6" />
      </MainToolbarButton>
      <MainToolbarButton title="Redo" @click="redo()" :disabled="!canRedo">
        <RedoIcon class="h-6 w-6" />
      </MainToolbarButton>
    </section>
    <FloatingPanel
      v-if="isGetLocationActive"
      class="absolute bottom-14 overflow-visible bg-opacity-75 p-2 px-4 text-sm sm:bottom-16 sm:left-1/2 sm:-translate-x-1/2"
    >
      Click on map to place unit.
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
  IconChevronUp,
  IconCursorDefaultOutline as SelectIcon,
  IconCursorMove as MoveIcon,
  IconDotsHorizontal,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconPencil as DrawIcon,
  IconRedoVariant as RedoIcon,
  IconRulerSquareCompass as MeasurementIcon,
  IconUndoVariant as UndoIcon,
} from "@iconify-prerendered/vue-mdi";
import MainToolbarButton from "@/components/MainToolbarButton.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import { injectStrict } from "@/utils";
import {
  activeMapKey,
  activeScenarioKey,
  activeUnitKey,
  sidcModalKey,
} from "@/components/injects";
import { storeToRefs } from "pinia";
import { useUnitSettingsStore } from "@/stores/geoStore";
import { useToggle } from "@vueuse/core";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { Float } from "@headlessui-float/vue";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import PanelButton from "@/components/PanelButton.vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import { computed, Ref, ref, watch } from "vue";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import { useToolbarUnitSymbolData } from "@/composables/mainToolbarData";

const {
  store: { undo, redo, canRedo, canUndo, groupUpdate, state },
  unitActions,
  geo: { addUnitPosition },
} = injectStrict(activeScenarioKey);
const mapRef = injectStrict(activeMapKey);
const activeUnitId = injectStrict(activeUnitKey);
const { getModalSidc } = injectStrict(sidcModalKey);

const store = useMainToolbarStore();
const { addMultiple } = storeToRefs(store);
const { moveUnitEnabled } = storeToRefs(useUnitSettingsStore());
const selectStore = useMapSelectStore();
const toggleAddMultiple = useToggle(addMultiple);

const {
  currentSid,
  currentEchelon,
  iconItems,
  emtItems,
  echelonSidc,
  customIcon,
  customSidc,
  activeSidc,
} = useToolbarUnitSymbolData({});

const activeParent = ref();

const computedSidc = computed(() => {
  const parsedSidc = new Sidc(activeSidc.value);
  parsedSidc.standardIdentity = currentSid.value;
  parsedSidc.emt = "00";
  parsedSidc.hqtfd = "0";
  return parsedSidc.toString();
});

const toggleMoveUnit = useToggle(moveUnitEnabled);
const activeUnit = computed(
  () => (activeUnitId.value && state.getUnitById(activeUnitId.value)) || null
);

function selectEchelon(sidc: string, closePopover: (ref?: Ref | HTMLElement) => void) {
  currentEchelon.value = new Sidc(sidc).emt;
  closePopover();
}

const symbolOptions = computed(() =>
  activeUnit.value ? unitActions.getCombinedSymbolOptions(activeUnit.value, true) : {}
);

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  cancel: cancelGetLocation,
  onGetLocation,
  onCancel,
  onStart,
} = useGetMapLocation(mapRef.value);

function addUnit(sidc: string, closePopover?: (ref?: Ref | HTMLElement) => void) {
  activeSidc.value = sidc;
  closePopover && closePopover();
  startGetLocation();
}

onCancel(() => {
  selectStore.hoverEnabled = true;
});

onStart(() => {
  selectStore.hoverEnabled = false;
});

onGetLocation((location) => {
  selectStore.hoverEnabled = true;
  groupUpdate(() => {
    if (!activeUnit.value) return;
    const name = `${(activeUnit.value?.subUnits?.length ?? 0) + 1}`;
    const sidc = new Sidc(activeSidc.value!);
    sidc.emt = currentEchelon.value;
    const unitId = unitActions.createSubordinateUnit(activeUnit.value.id, {
      sidc: sidc.toString(),
      name,
    });
    unitId && addUnitPosition(unitId, location);
  });
  if (addMultiple.value && activeSidc.value) {
    addUnit(activeSidc.value);
  }
});

watch(activeUnit, (unit) => {
  if (!unit) return;
  currentSid.value = unit.sidc[SID_INDEX];
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
