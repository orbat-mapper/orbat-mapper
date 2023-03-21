<script setup lang="ts">
import { computed, Ref, ref, watch } from "vue";
import {
  IconChevronRight,
  IconCursorDefaultOutline,
  IconCursorMove,
  IconDotsHorizontal,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMapMarkerPath,
  IconVectorPolylineEdit,
} from "@iconify-prerendered/vue-mdi";
import { Float } from "@headlessui-float/vue";
import OLMap from "ol/Map";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import FloatingPanel from "@/components/FloatingPanel.vue";
import PanelSection from "@/components/PanelSection.vue";
import { SymbolItem, SymbolValue } from "@/types/constants";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey, sidcModalKey } from "@/components/injects";
import { useToggle } from "@vueuse/core";
import PanelToggle from "@/components/PanelToggle.vue";
import { SID_INDEX, Sidc } from "@/symbology/sidc";
import PanelButton from "@/components/PanelButton.vue";
import PanelSymbolButton from "@/components/PanelSymbolButton.vue";
import { echelonItems } from "@/symbology/helpers";
import { SID, SidValue } from "@/symbology/values";
import MilitarySymbol from "@/components/MilitarySymbol.vue";

const [addMultiple, toggleAddMultiple] = useToggle(false);

const activeUnitId = injectStrict(activeUnitKey);
const {
  unitActions,
  geo: { addUnitPosition },
  store: { state, groupUpdate },
} = injectStrict(activeScenarioKey);

const { getModalSidc } = injectStrict(sidcModalKey);

const activeUnit = computed(
  () => (activeUnitId.value && state.getUnitById(activeUnitId.value)) || null
);

const geoStore = useGeoStore();
const unitSettings = useUnitSettingsStore();

const icons: SymbolValue[] = [
  { code: "121100", text: "Infantry" },
  { code: "121000", text: "Combined Arms" },
  { code: "121102", text: "Mechanized" },
  { code: "130300", text: "Artillery" },
  { code: "120500", text: "Armor" },
  { code: "160600", text: "Combat Service Support" },
];

const customIcon = ref<SymbolValue>({ code: "10031000141211000000", text: "Infantry" });

const currentSid = ref<string>(SID.Friend);
const currentEchelon = ref<string>("16");

const iconItems = computed(() => {
  return icons.map(({ code, text }): SymbolItem => {
    return {
      code,
      text,
      sidc: "100" + currentSid.value + "10" + "00" + "00" + code + "0000",
    };
  });
});
const echelons = computed(() => echelonItems(currentSid.value as SidValue));

const activeSidc = ref<string | null>(null);
const echelonSidc = computed(
  () => "100" + currentSid.value + "10" + "00" + currentEchelon.value + "0000000000"
);

watch(activeUnit, (unit) => {
  if (!unit) return;
  currentSid.value = unit.sidc[SID_INDEX];
});

const customSidc = computed(() => {
  const parsedSidc = new Sidc(customIcon.value.code);
  parsedSidc.standardIdentity = currentSid.value;
  parsedSidc.emt = "00";
  parsedSidc.hqtfd = "0";
  return parsedSidc.toString();
});

const {
  start: startGetLocation,
  isActive: isGetLocationActive,
  cancel: cancelGetLocation,
  onGetLocation,
  onCancel,
} = useGetMapLocation(geoStore.olMap as OLMap);

function addUnit(sidc: string) {
  activeSidc.value = sidc;
  startGetLocation();
}

onCancel(() => {
  activeSidc.value = null;
});

onGetLocation((location) => {
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
  } else {
    activeSidc.value = null;
  }
});

async function handleChangeSymbol() {
  const newSidcValue = await getModalSidc(customSidc.value, {
    title: "Select symbol",
    hideModifiers: true,
  });
  if (newSidcValue !== undefined) {
    customIcon.value.code = newSidcValue;
    addUnit(customSidc.value);
  }
}

function selectEchelon(sidc: string, closePopover: (ref?: Ref | HTMLElement) => void) {
  currentEchelon.value = new Sidc(sidc).emt;
  closePopover();
}
</script>
<template>
  <div class="">
    <!--    <OrbatBreadcrumbs class="absolute top-4 left-10" />-->
    <FloatingPanel
      class="absolute left-3 top-[100px] flex flex-col"
      v-if="geoStore.olMap"
    >
      <PanelSection label="Tools">
        <div class="grid grid-cols-2 gap-2">
          <PanelButton
            @click="unitSettings.moveUnitEnabled = false"
            title="Select"
            :active="!unitSettings.moveUnitEnabled"
          >
            <IconCursorDefaultOutline class="h-5 w-5" />
          </PanelButton>
          <PanelButton
            @click="unitSettings.moveUnitEnabled = true"
            title="Move units"
            :active="unitSettings.moveUnitEnabled"
          >
            <IconCursorMove class="h-5 w-5" />
          </PanelButton>
        </div>
        <button
          type="button"
          class="absolute top-2 right-2 border-none text-gray-600"
          @click="toggleAddMultiple()"
          title="Lock tool selection"
        >
          <IconLockOutline v-if="addMultiple" class="h-5 w-5" />
          <IconLockOpenVariantOutline v-else class="h-5 w-5" />
        </button>
      </PanelSection>
      <PanelSection label="Add unit">
        <div class="mt-1 grid grid-cols-2 justify-items-center gap-2.5">
          <button
            type="button"
            class="flex items-center justify-center hover:drop-shadow hover:sepia disabled:opacity-50 disabled:hover:sepia-0"
            :class="[activeSidc === customSidc ? 'invert' : '']"
            @click="addUnit(customSidc)"
            :disabled="!activeUnitId"
          >
            <MilitarySymbol :sidc="customSidc" :size="24" class="" />
          </button>
          <PanelButton @click="handleChangeSymbol()" title="Select symbol">
            <IconDotsHorizontal class="h-5 w-5" />
          </PanelButton>
          <PanelSymbolButton
            v-for="{ sidc, text } in iconItems"
            :key="sidc"
            :sidc="sidc"
            :active="activeSidc === sidc"
            :title="text"
            @click="addUnit(sidc)"
            :disabled="!activeUnitId"
          />
          <MilitarySymbol :size="24" :sidc="echelonSidc || ''" class="self-center" />
          <Popover as="template">
            <Float placement="right-start" :offset="12" flip shift portal>
              <PopoverButton as="template">
                <PanelButton title="Select echelon" class=""
                  ><IconChevronRight class="h-5 w-5"
                /></PanelButton>
              </PopoverButton>
              <PopoverPanel focus v-slot="{ close }">
                <FloatingPanel class="grid grid-cols-4 justify-items-center gap-2 p-2">
                  <PanelSymbolButton
                    class="self-end"
                    v-for="{ sidc, text } in echelons"
                    :key="sidc"
                    :sidc="sidc"
                    :title="text"
                    @click="selectEchelon(sidc, close)"
                  />
                </FloatingPanel>
              </PopoverPanel>
            </Float>
          </Popover>
        </div>
      </PanelSection>
      <PanelSection label="Path" class="">
        <div class="grid grid-cols-2 gap-2">
          <PanelToggle v-model="unitSettings.showHistory" title="Show unit path">
            <IconMapMarkerPath class="h-5 w-5" aria-hidden="true" />
          </PanelToggle>
          <PanelToggle
            title="Edit path"
            v-model="unitSettings.editHistory"
            :disabled="!unitSettings.showHistory"
          >
            <IconVectorPolylineEdit class="h-5 w-5" aria-hidden="true" />
          </PanelToggle>
        </div>
      </PanelSection>
    </FloatingPanel>
    <FloatingPanel
      v-if="isGetLocationActive"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 overflow-visible bg-opacity-75 p-2 px-4 text-sm"
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
  </div>
</template>
