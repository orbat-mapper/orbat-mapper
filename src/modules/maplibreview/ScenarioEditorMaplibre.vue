<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from "vue";
import type { ShallowRef } from "vue";
import type { Map as MlMap } from "maplibre-gl";
import type OLMap from "ol/Map";
import type Select from "ol/interaction/Select";
import {
  FlaskConicalIcon,
  GridIcon,
  HexagonIcon,
  SlidersHorizontalIcon,
} from "lucide-vue-next";
import { getHexagonAreaAvg, getHexagonEdgeLengthAvg } from "h3-js";
import { injectStrict } from "@/utils";
import { MapLibreMapAdapter } from "@/geo/mapLibreMapAdapter";
import type { ScenarioMapEngine } from "@/geo/contracts/scenarioMapEngine";
import { createMapLibreScenarioLayerController } from "@/geo/engines/maplibre/mapLibreScenarioLayerController";
import { useMaplibreLayersStore } from "@/stores/maplibreLayersStore";
import { useGeoStore } from "@/stores/geoStore";
import { useMapSettingsStore, type MapProjection } from "@/stores/mapSettingsStore";
import {
  activeFeatureSelectInteractionKey,
  activeNativeMapKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
} from "@/components/injects";
import ScenarioMapModeShell from "@/modules/scenarioeditor/ScenarioMapModeShell.vue";
import { useScenarioMapModeController } from "@/modules/scenarioeditor/useScenarioMapModeController";
import ToggleField from "@/components/ToggleField.vue";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import MaplibreContextMenu from "@/modules/maplibreview/MaplibreContextMenu.vue";
import MlMapLogic from "@/modules/maplibreview/MlMapLogic.vue";
import MaplibreMap from "@/modules/maplibreview/MaplibreMap.vue";
import MaplibreSearchScenarioActions from "@/modules/maplibreview/MaplibreSearchScenarioActions.vue";
import MapEditorMainToolbar from "@/modules/scenarioeditor/MapEditorMainToolbar.vue";
import MapEditorUnitTrackToolbar from "@/modules/scenarioeditor/MapEditorUnitTrackToolbar.vue";
import { useMainToolbarStore } from "@/stores/mainToolbarStore";
import {
  MAPLIBRE_VECTOR_BASEMAP_ID,
  resolveMaplibreBasemap,
} from "@/modules/maplibreview/maplibreBasemaps";
import { useH3HexGrid } from "@/modules/maplibreview/h3grid";
import { useMgrsGrid } from "@/modules/maplibreview/mgrsgrid";

const emit = defineEmits(["show-settings"]);

const activeScenario = injectStrict(activeScenarioKey);
const toolbarStore = useMainToolbarStore();

const {
  store: { state },
} = activeScenario;
const {
  ui,
  isMobile,
  showLeftPanel,
  detailsWidth,
  showDetailsPanel,
  openTimeDialog,
  onIncDay,
  onDecDay,
  onShowPlaceSearch,
  onCloseDetailsPanel,
  goToNextScenarioEvent,
  goToPrevScenarioEvent,
} = useScenarioMapModeController(() => {
  mlMap.value?.resize();
});

const mlMap = shallowRef<MlMap>();
const scenarioMapEngineRef = shallowRef<ScenarioMapEngine>();
let cleanupScenarioBinding: (() => void) | null = null;
const nativeMapStub = shallowRef(null) as unknown as ShallowRef<OLMap>;
const featureSelectStub = shallowRef(null) as unknown as ShallowRef<Select>;
provide(
  activeScenarioMapEngineKey,
  scenarioMapEngineRef as ShallowRef<ScenarioMapEngine | undefined>,
);
provide(activeNativeMapKey, nativeMapStub);
provide(activeFeatureSelectInteractionKey, featureSelectStub);

const geoStore = useGeoStore();
const maplibreLayersStore = useMaplibreLayersStore();
const mapSettingsStore = useMapSettingsStore();
const maplibreBaseMapId = ref(MAPLIBRE_VECTOR_BASEMAP_ID);

const effectiveProjection = computed<MapProjection>(() =>
  state.mapSettings.maxExtent ? "mercator" : mapSettingsStore.mapProjection,
);

function onProjectionUpdate(projection: MapProjection) {
  if (!state.mapSettings.maxExtent) {
    mapSettingsStore.mapProjection = projection;
  }
}
const activeMaplibreBasemap = computed(() =>
  resolveMaplibreBasemap(maplibreBaseMapId.value, maplibreLayersStore.layers),
);

function onMapReady(mapInstance: MlMap) {
  cleanupScenarioBinding?.();
  mlMap.value = mapInstance;
  const adapter = new MapLibreMapAdapter(mapInstance);
  const layers = createMapLibreScenarioLayerController(adapter);
  scenarioMapEngineRef.value = {
    map: adapter,
    layers,
    suspendFeatureSelection() {},
    resumeFeatureSelection() {},
  };
  cleanupScenarioBinding = layers.bindScenario(activeScenario);
  geoStore.setMapAdapter(adapter);
}

watch(
  () => ({
    engine: scenarioMapEngineRef.value,
    extent: state.mapSettings.maxExtent,
    minZoom: state.mapSettings.minZoom,
    maxZoom: state.mapSettings.maxZoom,
  }),
  ({ engine, ...settings }) => {
    engine?.map.setViewConstraints({
      extent: settings.extent ?? null,
      minZoom: settings.minZoom ?? null,
      maxZoom: settings.maxZoom ?? null,
    });
  },
  { immediate: true },
);

const { showHexGrid, hexResolution, autoResolution, lineColor, lineOpacity, lineWidth } =
  useH3HexGrid(mlMap);
const {
  showMgrsGrid,
  showLabels: showMgrsLabels,
  lineColor: mgrsLineColor,
  lineOpacity: mgrsLineOpacity,
  lineWidth: mgrsLineWidth,
  currentAccuracy: mgrsAccuracy,
} = useMgrsGrid(mlMap);

const showHexDiameter = ref(true);
const showHexArea = ref(true);
const hexUnitSystem = ref<"si" | "imperial" | "nautical">("si");

const hexResolutionSlider = computed({
  get: () => [hexResolution.value],
  set: ([v]: number[]) => {
    hexResolution.value = v;
  },
});

const lineOpacitySlider = computed({
  get: () => [lineOpacity.value],
  set: ([v]: number[]) => {
    lineOpacity.value = v;
  },
});

const lineWidthSlider = computed({
  get: () => [lineWidth.value],
  set: ([v]: number[]) => {
    lineWidth.value = v;
  },
});

const mgrsLineOpacitySlider = computed({
  get: () => [mgrsLineOpacity.value],
  set: ([v]: number[]) => {
    mgrsLineOpacity.value = v;
  },
});

const mgrsLineWidthSlider = computed({
  get: () => [mgrsLineWidth.value],
  set: ([v]: number[]) => {
    mgrsLineWidth.value = v;
  },
});

function formatLength(km: number): string {
  if (hexUnitSystem.value === "imperial") {
    const mi = km * 0.621371;
    if (mi >= 1) return `${mi.toFixed(mi >= 100 ? 0 : 1)} mi`;
    const ft = mi * 5280;
    return `${ft < 100 ? ft.toFixed(0) : Math.round(ft).toLocaleString()} ft`;
  }
  if (hexUnitSystem.value === "nautical") {
    const nmi = km * 0.539957;
    if (nmi >= 1) return `${nmi.toFixed(nmi >= 100 ? 0 : 1)} nmi`;
    const yd = km * 1093.61;
    return `${yd < 100 ? yd.toFixed(0) : Math.round(yd).toLocaleString()} yd`;
  }
  if (km >= 1) return `${km.toFixed(km >= 100 ? 0 : 1)} km`;
  return `${(km * 1000).toFixed(0)} m`;
}

function formatArea(km2: number): string {
  if (hexUnitSystem.value === "imperial") {
    const mi2 = km2 * 0.386102;
    if (mi2 >= 1) {
      return `${mi2 < 10 ? mi2.toFixed(1) : Math.round(mi2).toLocaleString()} mi²`;
    }
    const ft2 = mi2 * 27878400;
    return `${Math.round(ft2).toLocaleString()} ft²`;
  }
  if (hexUnitSystem.value === "nautical") {
    const nmi2 = km2 * 0.291553;
    if (nmi2 >= 1) {
      return `${nmi2 < 10 ? nmi2.toFixed(1) : Math.round(nmi2).toLocaleString()} nmi²`;
    }
    return `${Math.round(nmi2 * 3_429_904).toLocaleString()} yd²`;
  }
  if (km2 >= 1) {
    return `${km2 < 10 ? km2.toFixed(1) : Math.round(km2).toLocaleString()} km²`;
  }
  return `${(km2 * 1e6).toFixed(0)} m²`;
}

const hexSizeLabel = computed(() => {
  if (!showHexDiameter.value && !showHexArea.value) return "";
  const parts: string[] = [];
  if (showHexDiameter.value) {
    parts.push(
      `${formatLength(getHexagonEdgeLengthAvg(hexResolution.value, "km") * 2)} ⌀`,
    );
  }
  if (showHexArea.value) {
    parts.push(formatArea(getHexagonAreaAvg(hexResolution.value, "km2")));
  }
  return `~${parts.join(" · ")}`;
});

const mgrsPrecisionLabel = computed(() => {
  const accuracy = mgrsAccuracy.value;
  if (accuracy === 0) return "100 km";
  if (accuracy === 1) return "10 km";
  if (accuracy === 2) return "1 km";
  if (accuracy === 3) return "100 m";
  return "10 m";
});

onMounted(() => {
  void maplibreLayersStore.initialize();
  if (
    toolbarStore.currentToolbar === "measurements" ||
    toolbarStore.currentToolbar === "draw"
  ) {
    toolbarStore.clearToolbar();
  }
});

function disposeMaplibreBinding() {
  cleanupScenarioBinding?.();
  cleanupScenarioBinding = null;
  scenarioMapEngineRef.value = undefined;
  geoStore.setMapAdapter(null);
}

onBeforeUnmount(() => {
  disposeMaplibreBinding();
});

const mapReady = computed(() => Boolean(mlMap.value));
const headerControlsStyle = computed(() =>
  !isMobile.value && showDetailsPanel.value && ui.detailsPanelMode === "overlay"
    ? { marginRight: `${detailsWidth.value + 16}px` }
    : undefined,
);
</script>

<template>
  <ScenarioMapModeShell
    :map-ready="mapReady"
    :is-mobile="isMobile"
    :show-left-panel="showLeftPanel"
    :show-details-panel="showDetailsPanel"
    header-class="flex min-w-0 flex-none items-start justify-between sm:p-2"
    header-controls-class="bg-background/85 pointer-events-auto mr-2 flex min-w-0 max-w-[calc(100vw-0.5rem)] items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap rounded-md p-2 shadow-sm backdrop-blur-sm"
    :header-controls-style="headerControlsStyle"
    @open-left-panel="ui.showLeftPanel = true"
    @close-left-panel="ui.showLeftPanel = false"
    @show-settings="emit('show-settings')"
    @open-time-modal="openTimeDialog()"
    @inc-day="onIncDay()"
    @dec-day="onDecDay()"
    @next-event="goToNextScenarioEvent()"
    @prev-event="goToPrevScenarioEvent()"
    @show-place-search="onShowPlaceSearch()"
    @close-details-panel="onCloseDetailsPanel()"
  >
    <template #map>
      <MaplibreContextMenu v-model:base-map-id="maplibreBaseMapId" :map-ref="mlMap">
        <MaplibreMap
          @ready="onMapReady"
          :basemap-id="activeMaplibreBasemap.id"
          :style-spec="activeMaplibreBasemap.style"
          :projection="effectiveProjection"
          @update:projection="onProjectionUpdate"
          class="flex-auto bg-radial from-gray-800 to-gray-950"
        />
      </MaplibreContextMenu>
      <MlMapLogic
        v-if="mlMap"
        :mlMap="mlMap"
        :active-scenario="activeScenario"
        :key="state.id"
      />
    </template>
    <template #after-keyboard>
      <MaplibreSearchScenarioActions />
    </template>
    <template #footer-overlays>
      <footer
        v-if="mlMap && ui.showToolbar"
        class="pointer-events-none flex justify-center sm:absolute sm:bottom-2 sm:w-full sm:p-2"
      >
        <MapEditorMainToolbar
          :can-move-units="true"
          :can-rotate-units="false"
          :can-measure="false"
          :can-draw="false"
          :can-track="true"
          :can-add-units="true"
          location-picker-event-source="dom"
          @open-time-modal="openTimeDialog()"
          @inc-day="onIncDay()"
          @dec-day="onDecDay()"
          @next-event="goToNextScenarioEvent()"
          @prev-event="goToPrevScenarioEvent()"
          @show-settings="emit('show-settings')"
        />
        <MapEditorUnitTrackToolbar
          v-if="toolbarStore.currentToolbar === 'track'"
          class="absolute bottom-14 sm:bottom-16"
        />
      </footer>
    </template>
    <template #header-right-after-search>
      <span
        class="text-muted-foreground inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium"
        title="Work in progress"
      >
        <FlaskConicalIcon class="size-3.5 text-amber-500" />
        <span class="hidden sm:inline">Labs</span>
      </span>
      <Button
        variant="outline"
        size="icon"
        @click="showHexGrid = !showHexGrid"
        title="Toggle H3 hex grid"
        :class="{ 'bg-accent': showHexGrid }"
      >
        <HexagonIcon class="size-4" />
      </Button>
      <template v-if="showHexGrid">
        <ToggleField v-model="autoResolution">Auto</ToggleField>
        <template v-if="!autoResolution">
          <Slider
            v-model="hexResolutionSlider"
            :min="0"
            :max="8"
            :step="1"
            class="w-24"
          />
          <span class="text-muted-foreground w-4 text-xs">{{ hexResolution }}</span>
        </template>
        <span
          v-if="hexSizeLabel"
          class="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
          :title="`H3 resolution ${hexResolution}`"
          >{{ hexSizeLabel }}</span
        >
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" size="icon" title="Hex grid style">
              <SlidersHorizontalIcon class="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-64 space-y-4">
            <div class="space-y-2">
              <Label for="hex-line-color" class="text-xs">Line color</Label>
              <input
                id="hex-line-color"
                v-model="lineColor"
                type="color"
                class="h-8 w-full cursor-pointer rounded border"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Opacity</Label>
                <span class="text-muted-foreground text-xs">
                  {{ lineOpacity.toFixed(2) }}
                </span>
              </div>
              <Slider v-model="lineOpacitySlider" :min="0" :max="1" :step="0.05" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Line width</Label>
                <span class="text-muted-foreground text-xs">
                  {{ lineWidth.toFixed(1) }}
                </span>
              </div>
              <Slider v-model="lineWidthSlider" :min="0.5" :max="5" :step="0.1" />
            </div>
            <div class="space-y-2 border-t pt-3">
              <Label class="text-xs">Size display</Label>
              <ToggleField v-model="showHexDiameter">Show diameter</ToggleField>
              <ToggleField v-model="showHexArea">Show area</ToggleField>
              <div class="flex items-center justify-between pt-1">
                <Label class="text-xs">Units</Label>
                <div class="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    :variant="hexUnitSystem === 'si' ? 'default' : 'outline'"
                    class="h-7 px-2 text-xs"
                    @click="hexUnitSystem = 'si'"
                    >SI</Button
                  >
                  <Button
                    type="button"
                    size="sm"
                    :variant="hexUnitSystem === 'imperial' ? 'default' : 'outline'"
                    class="h-7 px-2 text-xs"
                    @click="hexUnitSystem = 'imperial'"
                    >Imperial</Button
                  >
                  <Button
                    type="button"
                    size="sm"
                    :variant="hexUnitSystem === 'nautical' ? 'default' : 'outline'"
                    class="h-7 px-2 text-xs"
                    @click="hexUnitSystem = 'nautical'"
                    >Nautical</Button
                  >
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </template>
      <Button
        variant="outline"
        size="icon"
        @click="showMgrsGrid = !showMgrsGrid"
        title="Toggle MGRS grid zones"
        :class="{ 'bg-accent': showMgrsGrid }"
      >
        <GridIcon class="size-4" />
      </Button>
      <template v-if="showMgrsGrid">
        <span
          class="text-muted-foreground text-xs whitespace-nowrap tabular-nums"
          title="Current MGRS grid precision"
          >{{ mgrsPrecisionLabel }}</span
        >
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" size="icon" title="MGRS grid style">
              <SlidersHorizontalIcon class="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-64 space-y-4">
            <div class="space-y-2">
              <Label for="mgrs-line-color" class="text-xs">Line color</Label>
              <input
                id="mgrs-line-color"
                v-model="mgrsLineColor"
                type="color"
                class="h-8 w-full cursor-pointer rounded border"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Opacity</Label>
                <span class="text-muted-foreground text-xs">
                  {{ mgrsLineOpacity.toFixed(2) }}
                </span>
              </div>
              <Slider v-model="mgrsLineOpacitySlider" :min="0" :max="1" :step="0.05" />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label class="text-xs">Line width</Label>
                <span class="text-muted-foreground text-xs">
                  {{ mgrsLineWidth.toFixed(1) }}
                </span>
              </div>
              <Slider v-model="mgrsLineWidthSlider" :min="0.5" :max="5" :step="0.1" />
            </div>
            <div class="space-y-2 border-t pt-3">
              <ToggleField v-model="showMgrsLabels">Show labels</ToggleField>
            </div>
          </PopoverContent>
        </Popover>
      </template>
    </template>
  </ScenarioMapModeShell>
</template>
