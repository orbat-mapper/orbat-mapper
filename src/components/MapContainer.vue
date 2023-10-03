<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import MapEvent from "ol/MapEvent";
import OLMap from "ol/Map";
import { defaults as defaultControls } from "ol/control";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import { Coordinate } from "ol/coordinate";
import { fromLonLat, transformExtent } from "ol/proj";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { useOlEvent } from "@/composables/openlayersHelpers";

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

function createBaseLayers(view: View) {
  const openStreetmapLayer = new TileLayer({
    source: new OSM(),
    visible: props.baseLayerName === "osm",
    preload: Infinity,
    properties: {
      title: "OSM",
      name: "osm",
      layerType: "baselayer",
    },
  });
  const lightGrayLayer = new TileLayer({
    preload: Infinity,
    visible: props.baseLayerName === "grayBasemap",
    source: new XYZ({
      attributions:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/World_Light_Gray_Base/MapServer">ArcGIS</a>',
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/" +
        "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    }),
    properties: {
      title: "Gray Basemap",
      name: "grayBasemap",
      layerType: "baselayer",
    },
  });

  const openTopoMap = new TileLayer({
    source: new XYZ({
      url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      maxZoom: 14,
      attributions:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }),
    visible: props.baseLayerName === "openTopoMap",
    properties: {
      title: "Open topo map",
      name: "openTopoMap",
      layerType: "baselayer",
    },
  });

  const esriWorldImagery = new TileLayer({
    preload: Infinity,
    visible: props.baseLayerName === "esriWorldImagery",
    source: new XYZ({
      transition: 0, // should be set to 0 when opacity is < 1
      attributions:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    }),
    properties: {
      name: "esriWorldImagery",
      title: "ESRI World imagery",
      layerType: "baselayer",
    },
  });

  const kartverketTopo4 = new TileLayer({
    visible: props.baseLayerName === "kartverketTopo4",
    source: new XYZ({
      url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}",
      attributions: '<a href="http://www.kartverket.no/">Kartverket</a>',
    }),
    properties: {
      title: "Topographic Map Norway",
      name: "kartverketTopo4",
      layerType: "baselayer",
    },
    extent: transformExtent([2, 57, 33, 72], "EPSG:4326", view.getProjection()),
  });

  return [
    openStreetmapLayer,
    lightGrayLayer,
    openTopoMap,
    esriWorldImagery,
    kartverketTopo4,
  ];
}

const mapRoot = ref();
let olMap: OLMap;
const moveendHandler = (evt: MapEvent) => {
  emit("moveend", { view: evt.map.getView() });
};

onMounted(() => {
  const view = new View({
    zoom: props.zoom,
    center: fromLonLat(props.center),
    showFullExtent: true,
  });
  olMap = new OLMap({
    target: mapRoot.value,
    maxTilesLoading: 200,
    layers: createBaseLayers(view),
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
.ol-rotate {
  top: 5.5em;
  right: 0.5em;
}

.ol-zoom {
  @apply bottom-12 left-[unset] right-2 top-[unset] sm:bottom-10;
}
</style>
