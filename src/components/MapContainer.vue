<template>
  <div ref="mapRoot" class="w-full h-full" />
</template>

<script lang="ts">
import {
  defineComponent,
  markRaw,
  onMounted,
  onUnmounted,
  PropType,
  ref,
} from "vue";

import MapEvent from "ol/MapEvent";
import OLMap from "ol/Map";
import { defaults as defaultControls } from "ol/control";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import { Coordinate } from "ol/coordinate";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

function createBaseLayers() {
  const openStreetmapLayer = new TileLayer({
    source: new OSM(),
    visible: false,
    preload: Infinity,
  });
  openStreetmapLayer.set("title", "OSM");
  const lightGrayLayer = new TileLayer({
    preload: Infinity,
    visible: false,
    source: new XYZ({
      attributions:
        'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
        'rest/services/World_Light_Gray_Base/MapServer">ArcGIS</a>',
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/" +
        "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    }),
  });

  lightGrayLayer.set("title", "Gray Basemap");

  const openTopoMap = new TileLayer({
    source: new XYZ({
      url: "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
      maxZoom: 17,
      attributions:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }),
    visible: false,
  });

  openTopoMap.set("title", "Open topo map");

  const esriWorldImagery = new TileLayer({
    preload: Infinity,
    visible: true,
    source: new XYZ({
      attributions:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    }),
  });

  esriWorldImagery.set("title", "ESRI World imagery");

  const kartverketTopo4 = new TileLayer({
    visible: false,
    source: new XYZ({
      url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}",
      attributions: '<a href="http://www.kartverket.no/">Kartverket</a>',
    }),
  });
  kartverketTopo4.set("title", "Topographic Map Norway");

  // https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}

  return [
    openStreetmapLayer,
    lightGrayLayer,
    openTopoMap,
    esriWorldImagery,
    kartverketTopo4,
  ];
}

export default defineComponent({
  name: "MapContainer",
  emits: ["ready", "moveend"],
  props: {
    center: { type: Array as PropType<Coordinate>, default: () => [30, 60] },
    zoom: { default: 5 },
  },

  setup(props, { emit }) {
    const mapRoot = ref();
    let olMap: OLMap;
    const moveendHandler = (evt: MapEvent) => {
      emit("moveend", { view: evt.map.getView() });
    };

    onMounted(() => {
      olMap = new OLMap({
        target: mapRoot.value,
        maxTilesLoading: 200,
        layers: createBaseLayers(),
        view: new View({
          zoom: props.zoom,
          center: fromLonLat(props.center),
          constrainResolution: true,
        }),
        controls: defaultControls({
          attributionOptions: {
            collapsible: true,
          },
        }),
      });
      olMap.on("moveend", moveendHandler);
      emit("ready", markRaw(olMap));
    });

    onUnmounted(() => {
      olMap.un("moveend", moveendHandler);
    });

    return { mapRoot };
  },
});
</script>

<style>
.ol-rotate {
  left: 0.5em;
  top: 5.5em;
  right: initial;
}
</style>
