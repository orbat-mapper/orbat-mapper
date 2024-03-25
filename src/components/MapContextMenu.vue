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

import { IconContentCopy } from "@iconify-prerendered/vue-mdi";
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

const props = defineProps<{ mapRef?: OLMap }>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const { coordinateFormat, showLocation, showScaleLine, showDayNightTerminator } =
  storeToRefs(useMapSettingsStore());

const { measurementUnit } = storeToRefs(useMeasurementsStore());
const uiSettings = useUiStore();

const { send } = useNotifications();
const { copy: copyToClipboard } = useClipboard();

const dropPosition = ref([0, 0]);

const formattedPosition = computed(() =>
  getCoordinateFormatFunction(coordinateFormat.value)(dropPosition.value),
);

function onContextMenu(e: MouseEvent) {
  if (!props.mapRef) {
    console.warn("No map ref");
    return;
  }
  dropPosition.value = toLonLat(props.mapRef.getEventCoordinate(e));
}

async function onCopy() {
  await copyToClipboard(formattedPosition.value);
  send({
    message: `Copied ${formattedPosition.value} to the clipboard`,
  });
}
</script>
<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <slot :onContextMenu="onContextMenu" />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @select="onCopy()">
        <IconContentCopy class="mr-2 h-4 w-4" />
        <span>{{ formattedPosition }}</span></ContextMenuItem
      >
      <ContextMenuSeparator />
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
