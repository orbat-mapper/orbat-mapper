<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import MapEvent from "ol/MapEvent";
import OLMap from "ol/Map";
import { defaults as defaultControls } from "ol/control";
import View from "ol/View";
import "ol/ol.css";
import { Coordinate } from "ol/coordinate";
import { fromLonLat } from "ol/proj";
import { useOlEvent } from "@/composables/openlayersHelpers";
import { createBaseLayers } from "@/geo/baseLayers";

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
    layers: await createBaseLayers(view, props.baseLayerName),
    view,
    controls: defaultControls({
      attributionOptions: {
        collapsible: true,
      },
    }),
  });
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
</style>
