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
  IconVectorPoint,
  IconVectorPointMinus,
} from "@iconify-prerendered/vue-mdi";
import type { Position } from "geojson";
import type { Map as MlMap } from "maplibre-gl";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { computed, ref } from "vue";
import { breakpointsTailwind, useBreakpoints, useClipboard } from "@vueuse/core";
import {
  basemapFlavor,
  basemapIsRemovable,
  getSupportedMaplibreBasemaps,
  resolveMaplibreBasemap,
} from "@/modules/maplibreview/maplibreBasemaps";
import {
  BASEMAP_FLAVORS,
  isBasemapFlavor,
  type BasemapFlavor,
} from "@/geo/maplibreLayerConfigTypes";
import {
  getFeatureIdFromRenderedFeature,
  isManagedScenarioFeatureLayerId,
} from "@/modules/maplibreview/maplibreScenarioFeatures";
import { usePlaybackStore } from "@/stores/playbackStore";
import { useUiStore } from "@/stores/uiStore";
import { useMapSettingsStore } from "@/stores/mapSettingsStore";
import { useMeasurementsStore } from "@/stores/geoStore";
import { getCoordinateFormatFunction } from "@/utils/geoConvert";
import { storeToRefs } from "pinia";
import { useNotifications } from "@/composables/notifications";
import {
  useBasemapArchives,
  type PendingBasemapArchive,
} from "@/composables/basemapArchives";
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
import AddMapServerDialog from "@/components/AddMapServerDialog.vue";
import { queryTrackPointAt, type TrackPointHit } from "@/composables/maplibreUnitHistory";

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
const mapSettings = useMapSettingsStore();
const mainToolbarStore = useMainToolbarStore();
const recordingStore = useRecordingStore();
const { send } = useNotifications();
const { copy: copyToClipboard } = useClipboard();
const {
  coordinateFormat,
  showLocation,
  showScaleLine,
  showFeatureTooltip,
  showDayNightTerminator,
  mapLibreUnitRotationMode,
} = storeToRefs(mapSettings);
const { measurementUnit } = storeToRefs(useMeasurementsStore());
const { activeUnitId, activeFeatureId, selectedUnitIds, selectedFeatureIds } =
  useSelectedItems();
const { activeParent } = useActiveUnitStore();
const { sidc, symbolOptions } = useActiveSidc();

const props = defineProps<{ mapRef?: MlMap }>();
const baseMapId = defineModel<string>("baseMapId", {
  default: "",
});

const basemapOptions = computed(() =>
  getSupportedMaplibreBasemaps(maplibreLayersStore.layers),
);
const {
  openBasemapArchivePicker,
  pendingBasemapArchives,
  activatePendingBasemapArchive,
  removeBasemapArchive,
} = useBasemapArchives();

function pendingArchiveLabel(pending: PendingBasemapArchive) {
  return pending.action === "restore"
    ? `Restore ${pending.fileName}`
    : `Select ${pending.fileName}…`;
}

// A vector PMTiles archive carries no style of its own, so the flavour picks the colours of the
// style ORBAT Mapper generates for it. Raster archives and remote styles have no flavour, and
// `basemapFlavor()` returns undefined for them, which hides the submenu.
const activeBasemapId = computed(
  () => resolveMaplibreBasemap(baseMapId.value, maplibreLayersStore.layers)?.id,
);

/** The active basemap when, and only when, it is an archive the user opened from disk. */
const removableActiveBasemap = computed(() => {
  const layer = maplibreLayersStore.layers.find(
    (entry) => entry.name === activeBasemapId.value,
  );
  return basemapIsRemovable(layer) ? layer : undefined;
});

const activeFlavor = computed(() =>
  basemapFlavor(
    maplibreLayersStore.layers.find((layer) => layer.name === activeBasemapId.value),
  ),
);

function flavorLabel(flavor: BasemapFlavor) {
  return flavor.charAt(0).toUpperCase() + flavor.slice(1);
}

function onSelectFlavor(value: unknown) {
  const id = activeBasemapId.value;
  if (!id || !isBasemapFlavor(value)) return;
  maplibreLayersStore.setLayerFlavor(id, value);
}

/**
 * The map server dialog cannot live inside the menu: the menu unmounts its content when it
 * closes, and the dialog must stay while the user types. It is a sibling of the whole menu, and
 * this flag is what the menu item sets.
 */
const showAddMapServer = ref(false);

/** Lets the user pick a basemap archive from disk. The picker activates whatever it loads. */
function onOpenMapFile() {
  openBasemapArchivePicker();
}

function onActivatePendingArchive(key: string) {
  void activatePendingBasemapArchive(key);
}

function onRemoveActiveArchive() {
  const layer = removableActiveBasemap.value;
  if (layer) void removeBasemapArchive(layer.name);
}
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smallerOrEqual("md");

const triggerRef = ref<HTMLDivElement | null>(null);
const clickedUnits = ref<NUnit[]>([]);
const clickedFeatures = ref<NGeometryLayerItem[]>([]);
const dropPosition = ref<Position>([0, 0]);
const mapZoomLevel = ref(0);
const clickedTrackPoint = ref<TrackPointHit | null>(null);
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
    id: nanoid(),
    name,
    geometryMeta: {
      geometryKind: "Point",
    },
    geometry: {
      type: "Point",
      coordinates: dropPosition.value,
    },
    style: mainToolbarStore.currentDrawStyle ?? {},
  };
  geo.addFeature(newFeature, activeLayer.id);
}

const canConvertWaypoint = computed(() => {
  const hit = clickedTrackPoint.value;
  if (hit?.kind !== "waypoint") return false;
  return unitActions.canConvertWaypointToViaPoint(hit.unitId, hit.stateIndex);
});

const canConvertViaPoint = computed(() => {
  const hit = clickedTrackPoint.value;
  if (hit?.kind !== "via") return false;
  return unitActions.canConvertViaPointToWaypoint(
    hit.unitId,
    hit.stateIndex,
    hit.viaIndex,
  );
});

function onConvertWaypointToViaPoint() {
  const hit = clickedTrackPoint.value;
  if (hit?.kind !== "waypoint") return;
  unitActions.convertWaypointToViaPoint(hit.unitId, hit.stateIndex);
}

function onConvertViaPointToWaypoint() {
  const hit = clickedTrackPoint.value;
  if (hit?.kind !== "via") return;
  unitActions.convertViaPointToWaypoint(hit.unitId, hit.stateIndex, hit.viaIndex);
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
  clickedTrackPoint.value = queryTrackPointAt(mapRef, point);

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
      <template v-if="clickedTrackPoint">
        <ContextMenuItem
          v-if="clickedTrackPoint.kind === 'waypoint'"
          :disabled="!canConvertWaypoint"
          @select.prevent="onConvertWaypointToViaPoint()"
        >
          <IconVectorPointMinus class="mr-2 h-4 w-4" />
          <span>Convert waypoint to via point</span>
        </ContextMenuItem>
        <ContextMenuItem
          v-else
          :disabled="!canConvertViaPoint"
          @select.prevent="onConvertViaPointToWaypoint()"
        >
          <IconVectorPoint class="mr-2 h-4 w-4" />
          <span>Convert via point to waypoint</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
      </template>
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
                  :sidc="unit._state?.sidc ?? unit.sidc"
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
                {{ feature.name }}
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
          <ContextMenuSeparator />
          <ContextMenuItem @select.prevent="onOpenMapFile()">
            Open map file…
          </ContextMenuItem>
          <ContextMenuItem @select="showAddMapServer = true">
            Add map server…
          </ContextMenuItem>
          <ContextMenuItem
            v-for="pending in pendingBasemapArchives"
            :key="pending.key"
            @select.prevent="onActivatePendingArchive(pending.key)"
          >
            {{ pendingArchiveLabel(pending) }}
          </ContextMenuItem>
          <ContextMenuItem
            v-if="removableActiveBasemap"
            @select.prevent="onRemoveActiveArchive()"
          >
            Remove {{ removableActiveBasemap.title || removableActiveBasemap.name }}
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <!-- Only a vector map file has flavours, so this is hidden for every other basemap. -->
      <ContextMenuSub v-if="activeFlavor">
        <ContextMenuSubTrigger inset><span>Map flavour</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuRadioGroup
            :model-value="activeFlavor"
            @update:model-value="onSelectFlavor"
          >
            <ContextMenuRadioItem
              v-for="flavor in BASEMAP_FLAVORS"
              :key="flavor"
              :value="flavor"
              @select.prevent
            >
              {{ flavorLabel(flavor) }}
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuSubContent>
      </ContextMenuSub>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset><span>Map settings</span></ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Coordinate format</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup v-model="coordinateFormat">
                <ContextMenuRadioItem value="dms" @select.prevent>
                  Degrees, minutes, seconds
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="dd" @select.prevent>
                  Decimal degrees
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="MGRS" @select.prevent>
                  MGRS
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>
              <span class="pr-4">Measurement units</span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup v-model="measurementUnit">
                <ContextMenuRadioItem value="metric" @select.prevent>
                  Metric
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="imperial" @select.prevent>
                  Imperial
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="nautical" @select.prevent>
                  Nautical
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Unit rotation</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup v-model="mapLibreUnitRotationMode">
                <ContextMenuRadioItem value="screen" @select.prevent>
                  Screen-aligned
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="mixed" @select.prevent>
                  Mixed
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="map" @select.prevent>
                  Map-aligned
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuCheckboxItem v-model="showLocation" @select.prevent>
            Pointer location
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem v-model="showScaleLine" @select.prevent>
            Scale line
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem v-model="showFeatureTooltip" @select.prevent>
            Feature tooltip
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem v-model="showDayNightTerminator" @select.prevent>
            Day/night terminator
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            v-model="mapSettings.mapUnitLabelBelow"
            @select.prevent
          >
            Unit labels below icons
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            v-if="mapSettings.mapUnitLabelBelow"
            v-model="mapSettings.mapWrapUnitLabels"
            @select.prevent
          >
            Wrap long unit labels
          </ContextMenuCheckboxItem>
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
  <AddMapServerDialog v-model="showAddMapServer" />
</template>
