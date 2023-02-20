<script setup lang="ts">
import {
  IconCursorDefaultOutline,
  IconCursorMove,
  IconDotsHorizontal,
  IconLockOpenVariantOutline,
  IconLockOutline,
  IconMapMarkerPath,
  IconVectorPolylineEdit,
} from "@iconify-prerendered/vue-mdi";
import FloatingPanel from "@/components/FloatingPanel.vue";
import PanelSection from "@/components/PanelSection.vue";
import MilSymbol from "@/components/MilSymbol.vue";
import { SymbolItem, SymbolValue } from "@/types/constants";
import { computed, ref } from "vue";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import OLMap from "ol/Map";
import { useGeoStore, useUnitSettingsStore } from "@/stores/geoStore";
import { injectStrict } from "@/utils";
import { activeScenarioKey, activeUnitKey, sidcModalKey } from "@/components/injects";
import { useToggle } from "@vueuse/core";
import ToolbarButton from "@/components/ToolbarButton.vue";
import PanelToggle from "@/components/PanelToggle.vue";
import { Sidc } from "@/symbology/sidc";

const [addMultiple, toggleAddMultiple] = useToggle(false);

const activeUnitId = injectStrict(activeUnitKey);
const {
  unitActions,
  geo: { addUnitPosition },
  store: { state, groupUpdate },
} = injectStrict(activeScenarioKey);

const { getModalSidc } = injectStrict(sidcModalKey);

const activeUnit = computed(
  () =>
    (activeUnitId.value &&
      unitActions.expandUnit(state.getUnitById(activeUnitId.value))) ||
    null
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

const customIcon = ref<SymbolValue>({ code: "10031000141211004600", text: "Infantry" });

const iconItems = computed(() => {
  const sid = activeUnit.value?.sidc ? activeUnit.value?.sidc[3] : "3";

  return icons.map(({ code, text }): SymbolItem => {
    return {
      code,
      text,
      sidc: "100" + sid + "10" + "00" + "00" + code + "0000",
    };
  });
});

const activeSidc = ref<string | null>(null);
const activeEchelon = ref<string | null>(null);

const customSidc = computed(() => {
  const sid = activeUnit.value?.sidc ? activeUnit.value?.sidc[3] : "3";
  const parsedSidc = new Sidc(customIcon.value.code);
  parsedSidc.standardIdentity = sid;
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
    const unitId = unitActions.createSubordinateUnit(activeUnit.value.id, {
      sidc: activeSidc.value!,
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
          <ToolbarButton
            @click="unitSettings.moveUnitEnabled = false"
            class="rounded border-none"
            title="Select"
            :active="!unitSettings.moveUnitEnabled"
          >
            <IconCursorDefaultOutline class="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton
            @click="unitSettings.moveUnitEnabled = true"
            class="rounded border-none"
            title="Move units"
            :active="unitSettings.moveUnitEnabled"
          >
            <IconCursorMove class="h-5 w-5" />
          </ToolbarButton>
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
        <div class="mt-1 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="flex items-center justify-center hover:drop-shadow hover:sepia disabled:opacity-50 disabled:hover:sepia-0"
            :class="[activeSidc === customSidc ? 'invert' : '']"
            @click="addUnit(customSidc)"
            :disabled="!activeUnitId"
          >
            <MilSymbol :sidc="customSidc" :size="24" class="" />
          </button>
          <ToolbarButton @click="handleChangeSymbol()">
            <IconDotsHorizontal class="h-5 w-5" />
          </ToolbarButton>
          <button
            type="button"
            v-for="{ sidc, text } in iconItems"
            :key="sidc"
            class="hover:drop-shadow hover:sepia disabled:opacity-50 disabled:hover:sepia-0"
            :class="[activeSidc === sidc ? 'invert' : '']"
            :title="text"
            @click="addUnit(sidc)"
            :disabled="!activeUnitId"
          >
            <MilSymbol :sidc="sidc" :size="24" />
          </button>
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
