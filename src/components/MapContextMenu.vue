<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { IconContentCopy, IconTarget } from "@iconify-prerendered/vue-mdi";
import { computed, ref } from "vue";
import type OLMap from "ol/Map";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";
import { toLonLat } from "ol/proj";
import { storeToRefs } from "pinia";
import { useNotifications } from "@/composables/notifications";
import { breakpointsTailwind, useBreakpoints, useClipboard } from "@vueuse/core";

import { useUiStore } from "@/stores/uiStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import { LayerType } from "@/modules/scenarioeditor/scenarioLayers2";
import { injectStrict } from "@/utils";
import { activeScenarioKey } from "@/components/injects";
import { NUnit } from "@/types/internalModels";
import { useSelectedItems } from "@/stores/selectedStore";

const props = defineProps<{ mapRef?: OLMap }>();

const { store } = injectStrict(activeScenarioKey);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const { coordinateFormat, showLocation, showScaleLine, showDayNightTerminator } =
  storeToRefs(useMapSettingsStore());

const { measurementUnit } = storeToRefs(useMeasurementsStore());
const uiSettings = useUiStore();

const { send } = useNotifications();
const { copy: copyToClipboard } = useClipboard();
const { activeUnitId } = useSelectedItems();

const dropPosition = ref([0, 0]);
const pixelPosition = ref<number[] | null>(null);
const clickedUnits = ref<NUnit[]>([]);

const formattedPosition = computed(() =>
  getCoordinateFormatFunction(coordinateFormat.value)(dropPosition.value),
);

function onContextMenu(e: MouseEvent) {
  const { mapRef } = props;
  if (!mapRef) {
    console.warn("No map ref");
    return;
  }
  clickedUnits.value = [];
  pixelPosition.value = mapRef.getEventPixel(e);
  dropPosition.value = toLonLat(mapRef.getEventCoordinate(e));
  mapRef.forEachFeatureAtPixel(pixelPosition.value, (feature, layer) => {
    const layerType = layer?.get("layerType") as LayerType;

    if (layerType === "UNITS") {
      const unitId = feature.getId() as string;
      const unit = store.state.getUnitById(unitId);
      unit && clickedUnits.value.push(unit);
    }
  });
}

async function onCopy() {
  await copyToClipboard(formattedPosition.value);
  send({
    message: `Copied ${formattedPosition.value} to the clipboard`,
  });
}

function onUnitSelect(unit: NUnit) {
  activeUnitId.value = unit.id;
}

function onContextMenuUpdate(open: boolean) {
  if (!open) {
    pixelPosition.value = null;
  }
}
</script>
<template>
  <ContextMenu @update:open="onContextMenuUpdate">
    <ContextMenuTrigger as-child>
      <slot :onContextMenu="onContextMenu" />
      <div
        v-if="pixelPosition"
        class="absolute flex items-center justify-center"
        :style="{ left: pixelPosition[0] + 'px', top: pixelPosition[1] + 'px' }"
      >
        <IconTarget class="-mx-1/2 -my-1/2 absolute h-8 w-8 text-yellow-500" />
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @select="onCopy()">
        <IconContentCopy class="mr-2 h-4 w-4" />
        <span>{{ formattedPosition }}</span></ContextMenuItem
      >
      <ContextMenuSeparator />
      <ContextMenuSub v-if="clickedUnits.length > 0">
        <ContextMenuSubTrigger inset
          ><span>Units</span>&nbsp;
          <span class="font-medium text-gray-500"
            >({{ clickedUnits.length }})</span
          ></ContextMenuSubTrigger
        >
        <ContextMenuSubContent>
          <ContextMenuItem
            v-for="unit in clickedUnits"
            :key="unit.id"
            @select.prevent="onUnitSelect(unit)"
          >
            <span :class="[activeUnitId === unit.id ? 'font-semibold' : '']">{{
              unit.name
            }}</span>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Map settings</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuCheckboxItem v-model:checked="showScaleLine" @select.prevent>
            Scale line
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem v-model:checked="showLocation" @select.prevent>
            Pointer location
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            v-model:checked="showDayNightTerminator"
            @select.prevent
          >
            Day/nigth terminator
          </ContextMenuCheckboxItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset
              ><span class="pr-4">Measurement units</span></ContextMenuSubTrigger
            >
            <ContextMenuSubContent>
              <ContextMenuRadioGroup v-model="measurementUnit">
                <ContextMenuRadioItem value="metric" @select.prevent
                  >Metric
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="imperial" @select.prevent
                  >Imperial
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="nautical" @select.prevent
                  >Nautical
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Coordinate format</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup v-model="coordinateFormat">
                <ContextMenuRadioItem value="dms" @select.prevent
                  >Degrees, minutes, seconds
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="dd" @select.prevent
                  >Decimal degrees
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="MGRS" @select.prevent
                  >MGRS
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem v-model:checked="uiSettings.showToolbar" @select.prevent
        >Map toolbar
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model:checked="uiSettings.showTimeline" @select.prevent
        >Timeline
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        v-if="!isMobile"
        v-model:checked="uiSettings.showLeftPanel"
        @select.prevent
        >ORBAT panel
      </ContextMenuCheckboxItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
