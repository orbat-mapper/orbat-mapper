<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  IconClockEnd,
  IconClockStart,
  IconContentCopy,
  IconPause,
  IconPlay,
  IconSpeedometer,
  IconSpeedometerSlow,
  IconTarget,
} from "@iconify-prerendered/vue-mdi";
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
import { getGeometryIcon, LayerType } from "@/modules/scenarioeditor/featureLayerUtils";
import { injectStrict } from "@/utils";
import { activeScenarioKey, searchActionsKey } from "@/components/injects";
import { NScenarioFeature, NUnit } from "@/types/internalModels";
import { useSelectedItems } from "@/stores/selectedStore";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import type { Position } from "geojson";

const tm = useTimeFormatStore();

const props = defineProps<{ mapRef?: OLMap }>();

const { store, unitActions, geo } = injectStrict(activeScenarioKey);
const { onScenarioActionHook } = injectStrict(searchActionsKey);
const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smallerOrEqual("md");

const { coordinateFormat, showLocation, showScaleLine, showDayNightTerminator } =
  storeToRefs(useMapSettingsStore());

const { measurementUnit } = storeToRefs(useMeasurementsStore());
const uiSettings = useUiStore();

const { send } = useNotifications();
const { copy: copyToClipboard } = useClipboard();
const { activeUnitId, activeFeatureId } = useSelectedItems();
const playback = usePlaybackStore();

const dropPosition = ref<Position>([0, 0]);
const pixelPosition = ref<number[] | null>(null);
const clickedUnits = ref<NUnit[]>([]);
const clickedFeatures = ref<NScenarioFeature[]>([]);
const mapZoomLevel = ref(0);

const formattedPosition = computed(() =>
  getCoordinateFormatFunction(coordinateFormat.value)(dropPosition.value),
);

async function onExport() {
  await onScenarioActionHook.trigger({ action: "exportToImage" });
}

function onContextMenu(e: MouseEvent) {
  const { mapRef } = props;
  if (!mapRef) {
    console.warn("No map ref");
    return;
  }
  mapZoomLevel.value = mapRef.getView()?.getZoom() ?? 0;
  clickedUnits.value = [];
  clickedFeatures.value = [];
  pixelPosition.value = mapRef.getEventPixel(e);
  dropPosition.value = toLonLat(mapRef.getEventCoordinate(e));
  mapRef.forEachFeatureAtPixel(pixelPosition.value, (feature, layer) => {
    const layerType = layer?.get("layerType") as LayerType;
    if (layerType === "UNITS") {
      const unitId = feature.getId() as string;
      const unit = store.state.getUnitById(unitId);
      unit && clickedUnits.value.push(unit);
    } else if (layerType === "SCENARIO_FEATURE") {
      const featureId = feature.getId() as string;
      const { feature: scenarioFeature } = geo.getFeatureById(featureId);
      scenarioFeature && clickedFeatures.value.push(scenarioFeature);
    }
  });
}

function returnMapProviders(lonLat: Position, zoomLevel: number) {
  return [
    {
      name: "Google Maps",
      url: `https://www.google.com/maps/@${lonLat[1]},${lonLat[0]},${zoomLevel}z`,
    },
    {
      name: "Google Street View",
      url:
        "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" +
        lonLat[1] +
        "," +
        lonLat[0],
    },
    {
      name: "Bing Maps",
      url: `https://www.bing.com/maps?cp=${lonLat[1]}~${lonLat[0]}&lvl=${zoomLevel}`,
    },
    {
      name: "OpenStreetMap",
      url: `https://www.openstreetmap.org/#map=15/${lonLat[1]}/${lonLat[0]}`,
    },
    {
      name: "Geohack",
      url: `https://geohack.toolforge.org/geohack.php?params=${lonLat[1]}_N_${lonLat[0]}_E`,
    },
  ];
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

function onFeatureSelect(feature: NScenarioFeature) {
  activeFeatureId.value = feature.id;
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
        <ContextMenuSubContent class="max-h-[95vh] overflow-auto">
          <ContextMenuItem
            v-for="unit in clickedUnits"
            :key="unit.id"
            @select.prevent="onUnitSelect(unit)"
          >
            <div class="flex items-center">
              <span class="flex w-7 items-center">
                <MilitarySymbol
                  :sidc="unit.sidc"
                  :options="unitActions.getCombinedSymbolOptions(unit)"
              /></span>
              <span :class="[activeUnitId === unit.id ? 'font-semibold' : '']">{{
                unit.name
              }}</span>
            </div>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub v-if="clickedFeatures.length > 0">
        <ContextMenuSubTrigger inset
          ><span>Features</span>&nbsp;
          <span class="font-medium text-gray-500"
            >({{ clickedFeatures.length }})</span
          ></ContextMenuSubTrigger
        >
        <ContextMenuSubContent class="max-h-[95vh] overflow-auto">
          <ContextMenuItem
            v-for="feature in clickedFeatures"
            :key="feature.id"
            @select.prevent="onFeatureSelect(feature)"
          >
            <div class="flex items-center">
              <component
                :is="getGeometryIcon(feature)"
                class="mr-1 h-5 w-5 text-gray-400"
              />
              <span :class="[activeFeatureId === feature.id ? 'font-semibold' : '']">{{
                feature.meta.name
              }}</span>
            </div>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator v-if="clickedFeatures.length || clickedUnits.length" />
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
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Export</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem @select="onExport()">Map as image</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Playback</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem @select.prevent="playback.togglePlayback()">
            <IconPause v-if="playback.playbackRunning" class="mr-2 h-4 w-4" />
            <IconPlay v-else class="mr-2 h-4 w-4" />
            <span>{{ playback.playbackRunning ? "Pause" : "Play" }}</span>
            <ContextMenuShortcut>k, alt+p</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @select.prevent="playback.increaseSpeed()">
            <IconSpeedometer class="mr-2 h-4 w-4" />
            <span>Speed up</span>
            <ContextMenuShortcut>&gt;</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem @select.prevent="playback.decreaseSpeed()">
            <IconSpeedometerSlow class="mr-2 h-4 w-4" />
            <span>Slow down</span>
            <ContextMenuShortcut>&lt;</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            v-model:checked="playback.playbackLooping"
            @select.prevent
          >
            Loop playback
          </ContextMenuCheckboxItem>

          <ContextMenuItem
            inset
            @select.prevent="playback.addMarker(store.state.currentTime)"
          >
            Add marker
            <span class="ml-1"
              >({{
                playback.startMarker && playback.endMarker
                  ? 2
                  : playback.startMarker || playback.endMarker
                    ? 1
                    : 0
              }}
              / 2)</span
            >
          </ContextMenuItem>
          <ContextMenuItem
            inset
            @select.prevent="playback.clearMarkers()"
            :disabled="!playback.startMarker && !playback.endMarker"
          >
            Clear markers
          </ContextMenuItem>
          <ContextMenuItem v-if="playback.startMarker !== undefined" disabled>
            <IconClockStart class="mr-2 h-4 w-4" />
            <span>{{
              tm.scenarioFormatter.format(playback.startMarker)
            }}</span></ContextMenuItem
          >
          <ContextMenuItem v-if="playback.endMarker !== undefined" disabled>
            <IconClockEnd class="mr-2 h-4 w-4" />
            <span>{{
              tm.scenarioFormatter.format(playback.endMarker)
            }}</span></ContextMenuItem
          >
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Open in</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem
            v-for="{ name, url } in returnMapProviders(dropPosition, mapZoomLevel)"
            :key="url"
            inset
            as-child
            ><a :href="url" target="_blank">{{ name }}</a></ContextMenuItem
          >
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
      <ContextMenuCheckboxItem
        v-model:checked="uiSettings.showOrbatBreadcrumbs"
        @select.prevent
      >
        Unit breadcrumbs
      </ContextMenuCheckboxItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
