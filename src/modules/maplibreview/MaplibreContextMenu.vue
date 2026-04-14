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
  IconMapMarker as PointIcon,
  IconPause,
  IconPlay,
  IconSpeedometer,
  IconSpeedometerSlow,
} from "@iconify-prerendered/vue-mdi";
import type { Position } from "geojson";
import type { Map as MlMap } from "maplibre-gl";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { computed, ref } from "vue";
import { breakpointsTailwind, useBreakpoints, useClipboard } from "@vueuse/core";
import {
  MAPLIBRE_VECTOR_BASEMAP_ID,
  getSupportedMaplibreBasemaps,
} from "@/modules/maplibreview/maplibreBasemaps";
import {
  getFeatureIdFromRenderedFeature,
  isManagedScenarioFeatureLayerId,
} from "@/modules/maplibreview/maplibreScenarioFeatures";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useUiStore } from "@/stores/uiStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";
import { storeToRefs } from "pinia";
import { useNotifications } from "@/composables/notifications";
import { getGeometryIcon } from "@/modules/scenarioeditor/featureLayerUtils";
import { injectStrict, nanoid } from "@/utils";
import {
  activeLayerKey,
  activeScenarioKey,
  searchActionsKey,
} from "@/components/injects";
import type { NGeometryLayerItem, NUnit } from "@/types/internalModels";
import { useSelectedItems } from "@/stores/selectedStore";
import MilitarySymbol from "@/components/MilitarySymbol.vue";
import { useTimeFormatStore } from "@/stores/timeFormatStore";
import { useActiveSidc } from "@/composables/mainToolbarData";
import { useActiveUnitStore } from "@/stores/dragStore";
import { useMainToolbarStore } from "@/stores/mainToolbarStore.ts";
import UnitSymbol from "@/components/UnitSymbol.vue";
import { useRecordingStore } from "@/stores/recordingStore";

const maplibreLayersStore = useMaplibreLayersStore();
const {
  store,
  unitActions,
  geo,
  helpers: { getUnitById },
} = injectStrict(activeScenarioKey);
const activeLayerId = injectStrict(activeLayerKey);
const { onScenarioActionHook } = injectStrict(searchActionsKey);
const playback = usePlaybackStore();
const tm = useTimeFormatStore();
const uiSettings = useUiStore();
const mainToolbarStore = useMainToolbarStore();
const recordingStore = useRecordingStore();
const { send } = useNotifications();
const { copy: copyToClipboard } = useClipboard();
const { coordinateFormat } = storeToRefs(useMapSettingsStore());
const { activeUnitId, activeFeatureId, selectedUnitIds, selectedFeatureIds } =
  useSelectedItems();
const { activeParent } = useActiveUnitStore();
const { sidc, symbolOptions } = useActiveSidc();

const props = defineProps<{ mapRef?: MlMap }>();
const baseMapId = defineModel<string>("baseMapId", {
  default: MAPLIBRE_VECTOR_BASEMAP_ID,
});

const basemapOptions = computed(() =>
  getSupportedMaplibreBasemaps(maplibreLayersStore.layers),
);
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const triggerRef = ref<HTMLDivElement | null>(null);
const clickedUnits = ref<NUnit[]>([]);
const clickedFeatures = ref<NGeometryLayerItem[]>([]);
const dropPosition = ref<Position>([0, 0]);
const mapZoomLevel = ref(0);
const LONG_PRESS_MS = 550;
const MOVE_TOLERANCE_PX = 10;

let longPressTimer: ReturnType<typeof setTimeout> | null = null;
let activePointerId: number | null = null;
let startX = 0;
let startY = 0;

const formattedPosition = computed(() =>
  getCoordinateFormatFunction(coordinateFormat.value)(dropPosition.value),
);

function clearLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function dispatchSyntheticContextMenu(clientX: number, clientY: number) {
  const trigger = triggerRef.value;
  if (!trigger) return;

  trigger.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 2,
      buttons: 0,
      clientX,
      clientY,
    }),
  );
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === "mouse") return;

  clearLongPressTimer();
  activePointerId = event.pointerId;
  startX = event.clientX;
  startY = event.clientY;

  longPressTimer = setTimeout(() => {
    if (activePointerId !== event.pointerId) return;
    dispatchSyntheticContextMenu(startX, startY);
    activePointerId = null;
    longPressTimer = null;
  }, LONG_PRESS_MS);
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return;

  const movedX = Math.abs(event.clientX - startX);
  const movedY = Math.abs(event.clientY - startY);
  if (movedX > MOVE_TOLERANCE_PX || movedY > MOVE_TOLERANCE_PX) {
    clearLongPressTimer();
    activePointerId = null;
  }
}

function onPointerEnd(event: PointerEvent) {
  if (event.pointerId !== activePointerId) return;
  clearLongPressTimer();
  activePointerId = null;
}

function returnMapProviders(lonLat: Position, zoomLevel: number) {
  return [
    {
      name: "Bing Maps",
      url: `https://www.bing.com/maps?cp=${lonLat[1]}~${lonLat[0]}&lvl=${zoomLevel}`,
    },
    {
      name: "Geohack",
      url: `https://geohack.toolforge.org/geohack.php?params=${lonLat[1]}_N_${lonLat[0]}_E`,
    },
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
      name: "OpenStreetMap",
      url: `https://www.openstreetmap.org/#map=15/${lonLat[1]}/${lonLat[0]}`,
    },
  ];
}

async function onCopy() {
  await copyToClipboard(formattedPosition.value);
  send({
    message: `Copied ${formattedPosition.value} to the clipboard`,
  });
}

async function onExport() {
  await onScenarioActionHook.trigger({ action: "exportToImage" });
}

function onUnitSelect(unit: NUnit, event: MouseEvent | PointerEvent | KeyboardEvent) {
  if (event.shiftKey) {
    if (selectedUnitIds.value.has(unit.id)) {
      selectedUnitIds.value.delete(unit.id);
    } else {
      selectedUnitIds.value.add(unit.id);
    }
  } else {
    activeUnitId.value = unit.id;
  }
}

function onFeatureSelect(
  feature: NGeometryLayerItem,
  event: MouseEvent | PointerEvent | KeyboardEvent,
) {
  if (event.shiftKey) {
    if (selectedFeatureIds.value.has(feature.id)) {
      selectedFeatureIds.value.delete(feature.id);
    } else {
      selectedFeatureIds.value.add(feature.id);
    }
  } else {
    activeFeatureId.value = feature.id;
  }
}

function onAddUnit() {
  if (!recordingStore.isRecordingLocation) return;
  store.groupUpdate(() => {
    if (!activeParent.value || unitActions.isUnitLocked(activeParent.value.id)) return;

    const name = `${(activeParent.value.subUnits?.length ?? 0) + 1}`;

    const unitId = unitActions.createSubordinateUnit(activeParent.value.id, {
      sidc: sidc.value,
      name,
    });
    unitId && geo.addUnitPosition(unitId, dropPosition.value);
  });
}

function onAddPoint() {
  const activeLayer = geo.getLayerById(
    activeLayerId.value ?? geo.layerItemsLayers.value[0]?.id,
  );
  if (!activeLayer) return;
  const name = `Point ${(activeLayer.items.length ?? 0) + 1}`;

  const newFeature: Omit<NGeometryLayerItem, "_pid"> = {
    kind: "geometry" as const,
    type: "Feature",
    id: nanoid(),
    meta: {
      type: "Point",
      name,
    },
    geometry: {
      type: "Point",
      coordinates: dropPosition.value,
    },
    style: mainToolbarStore.currentDrawStyle ?? {},
    properties: {},
  };
  geo.addFeature(newFeature, activeLayer.id);
}

function onContextMenu(event: MouseEvent) {
  const { mapRef } = props;
  if (!mapRef) return;

  const rect = mapRef.getContainer().getBoundingClientRect();
  const point: [number, number] = [event.clientX - rect.left, event.clientY - rect.top];
  const lngLat = mapRef.unproject(point);

  dropPosition.value = [lngLat.lng, lngLat.lat];
  mapZoomLevel.value = mapRef.getZoom() ?? 0;
  clickedUnits.value = [];
  clickedFeatures.value = [];

  const seenUnitIds = new Set<string>();
  const seenFeatureIds = new Set<string>();

  for (const renderedFeature of mapRef.queryRenderedFeatures(point)) {
    if (renderedFeature.layer.id === "unitLayer") {
      const unitId = renderedFeature.properties?.id
        ? String(renderedFeature.properties.id)
        : undefined;
      if (!unitId || seenUnitIds.has(unitId)) continue;
      seenUnitIds.add(unitId);
      const unit = getUnitById(unitId);
      unit && clickedUnits.value.push(unit);
      continue;
    }

    if (!isManagedScenarioFeatureLayerId(renderedFeature.layer.id)) continue;

    const featureId = getFeatureIdFromRenderedFeature(renderedFeature);
    if (!featureId || seenFeatureIds.has(featureId)) continue;
    seenFeatureIds.add(featureId);
    const { layerItem } = geo.getGeometryLayerItemById(featureId);
    layerItem && clickedFeatures.value.push(layerItem);
  }
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <div
        ref="triggerRef"
        class="h-full w-full"
        @contextmenu="onContextMenu"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
      >
        <slot />
      </div>
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem @select.prevent="onCopy()">
        <IconContentCopy class="mr-2 h-4 w-4" />
        <span>{{ formattedPosition }}</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuSub v-if="clickedUnits.length > 0">
        <ContextMenuSubTrigger inset
          ><span>Units</span>&nbsp;
          <span class="text-muted-foreground font-medium"
            >({{ clickedUnits.length }})</span
          ></ContextMenuSubTrigger
        >
        <ContextMenuSubContent class="max-h-[95vh] overflow-auto">
          <ContextMenuItem
            v-for="unit in clickedUnits"
            :key="unit.id"
            @select.prevent
            @click="onUnitSelect(unit, $event)"
          >
            <div class="flex items-center">
              <span class="flex w-7 items-center">
                <UnitSymbol
                  :sidc="unit.sidc"
                  class="w-6"
                  :options="unitActions.getCombinedSymbolOptions(unit)"
                />
              </span>
              <span :class="[selectedUnitIds.has(unit.id) ? 'font-semibold' : '']">{{
                unit.name
              }}</span>
            </div>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub v-if="clickedFeatures.length > 0">
        <ContextMenuSubTrigger inset
          ><span>Features</span>&nbsp;
          <span class="text-muted-foreground font-medium"
            >({{ clickedFeatures.length }})</span
          ></ContextMenuSubTrigger
        >
        <ContextMenuSubContent class="max-h-[95vh] overflow-auto">
          <ContextMenuItem
            v-for="feature in clickedFeatures"
            :key="feature.id"
            @select.prevent
            @click="onFeatureSelect(feature, $event)"
          >
            <div class="flex items-center">
              <component
                :is="getGeometryIcon(feature)"
                class="text-muted-foreground mr-1 h-5 w-5"
              />
              <span :class="[selectedFeatureIds.has(feature.id) ? 'font-semibold' : '']">
                {{ feature.meta.name }}
              </span>
            </div>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator v-if="clickedFeatures.length || clickedUnits.length" />
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Add</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem
            @select.prevent="onAddUnit"
            :disabled="!recordingStore.isRecordingLocation"
          >
            <MilitarySymbol
              :sidc="sidc"
              :options="symbolOptions"
              :size="15"
              class="w-8"
            />
            Unit
          </ContextMenuItem>
          <ContextMenuItem @select.prevent="onAddPoint">
            <PointIcon />
            Point/marker
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Export</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem @select.prevent="onExport()">Map as image</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>Map base layer</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuRadioGroup v-model="baseMapId">
            <ContextMenuRadioItem
              v-for="option in basemapOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.title }}
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
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
          >
            <a :href="url" target="_blank">{{ name }}</a>
          </ContextMenuItem>
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
          <ContextMenuCheckboxItem v-model="playback.playbackLooping" @select.prevent>
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
            <span>{{ tm.scenarioFormatter.format(playback.startMarker) }}</span>
          </ContextMenuItem>
          <ContextMenuItem v-if="playback.endMarker !== undefined" disabled>
            <IconClockEnd class="mr-2 h-4 w-4" />
            <span>{{ tm.scenarioFormatter.format(playback.endMarker) }}</span>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem v-model="uiSettings.showToolbar" @select.prevent>
        Map toolbar
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem
        v-if="!isMobile"
        v-model="uiSettings.showLeftPanel"
        @select.prevent
      >
        ORBAT panel
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model="uiSettings.showTimeline" @select.prevent>
        Timeline
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem v-model="uiSettings.showOrbatBreadcrumbs" @select.prevent>
        Unit breadcrumbs
      </ContextMenuCheckboxItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
