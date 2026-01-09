<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

import MapEvent from "ol/MapEvent";
import OLMap from "ol/Map";
import { defaults as defaultControls } from "ol/control";
import View from "ol/View";
import "ol/ol.css";
import { type Coordinate } from "ol/coordinate";
import { fromLonLat } from "ol/proj";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { createBaseLayerInstances } from "@/geo/baseLayers";
import { useBaseLayersStore } from "@/stores/baseLayersStore";
import type { LayerConfigFile } from "@/geo/layerConfigTypes";

interface Props {
  center?: Coordinate;
  zoom?: number;
  baseLayerName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [30, 60],
  zoom: 5,
  baseLayerName: "osm",
});
const emit = defineEmits(["ready", "moveend"]);

const mapRoot = ref();
let olMap: OLMap;
const baseLayersStore = useBaseLayersStore();

const moveendHandler = (evt: MapEvent) => {
  emit("moveend", { view: evt.map.getView() });
};

onMounted(async () => {
  const view = new View({
    zoom: props.zoom,
    center: fromLonLat(props.center),
    showFullExtent: true,
  });

  olMap = new OLMap({
    target: mapRoot.value,
    maxTilesLoading: 200,
    layers: [],
    view,
    controls: defaultControls({
      attributionOptions: {
        collapsible: true,
      },
    }),
  });

  await baseLayersStore.initialize();

  // Set initial active layer from props if provided and valid, otherwise keep store default
  if (
    props.baseLayerName &&
    baseLayersStore.layers.some((l) => l.name === props.baseLayerName)
  ) {
    baseLayersStore.selectLayer(props.baseLayerName);
  }

  const layers = createBaseLayerInstances(
    baseLayersStore.layers as unknown as LayerConfigFile,
    view,
  );
  layers.forEach((layer) => {
    olMap.addLayer(layer);
    const storeLayer = baseLayersStore.layers.find((l) => l.name === layer.get("name"));
    if (storeLayer) {
      layer.setOpacity(storeLayer.opacity);
    }
  });

  // Sync visibility with store
  watch(
    () => baseLayersStore.activeLayerName,
    (name) => {
      layers.forEach((l) => {
        l.setVisible(l.get("name") === name);
      });
    },
    { immediate: true },
  );

  // Sync opacity with store
  watch(
    () => baseLayersStore.layers,
    (newLayers) => {
      newLayers.forEach((l) => {
        const layer = layers.find((olLayer) => olLayer.get("name") === l.name);
        if (layer) {
          layer.setOpacity(l.opacity);
        }
      });
    },
    { deep: true },
  );

  useOlEvent(olMap.on("moveend", moveendHandler));
  emit("ready", olMap);
});

onUnmounted(() => {
  olMap.setTarget(undefined);
});
</script>

<template>
  <div ref="mapRoot" class="h-full w-full" />
</template>

<style>
@reference "tailwindcss";
.ol-rotate {
  top: 5.5em;
  right: 0.5em;
}

.ol-zoom {
  @apply top-[unset] right-2 bottom-12 left-[unset] sm:bottom-10;
}

.dark .ol-control {
  background-color: color-mix(in srgb, var(--color-card), transparent 10%);
  border: 1px solid var(--color-border);
}

.dark .ol-control:hover {
  background-color: var(--color-card);
}

.dark .ol-control button {
  color: var(--color-foreground);
  background-color: transparent;
}

.dark .ol-control button:hover {
  color: var(--color-primary);
  background-color: color-mix(in srgb, var(--color-primary), transparent 90%);
}

.dark .ol-control button:focus {
  box-shadow: inset 0 0 0 1px var(--color-ring);
  outline: none;
}

.dark .ol-attribution {
  background-color: color-mix(in srgb, var(--color-card), transparent 10%);
  color: var(--color-muted-foreground);
  box-shadow: none;
}

.dark .ol-attribution li {
  color: var(--color-foreground);
  text-shadow: none;
}

.dark .ol-attribution button {
  color: var(--color-muted-foreground);
}

.dark .ol-scale-line {
  background-color: var(--color-card);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
  font-weight: 500;
}

.dark .ol-scale-line-inner {
  color: var(--color-foreground);
}
</style>
