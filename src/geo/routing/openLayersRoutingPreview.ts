import { onUnmounted, toValue, watch, type MaybeRefOrGetter } from "vue";
import OLMap from "ol/Map";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import { useRoutingStore } from "@/stores/routingStore";

const format = new GeoJSON({
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
});

const pathStyle = new Style({
  stroke: new Stroke({
    color: "#1d4ed8",
    width: 4,
  }),
});

const pendingPathStyle = new Style({
  stroke: new Stroke({
    color: "#1d4ed8",
    width: 3,
    lineDash: [10, 10],
  }),
});

const pointStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({ color: "#1d4ed8" }),
    stroke: new Stroke({ color: "#ffffff", width: 2 }),
  }),
});

export function useOpenLayersRoutingPreview(
  mapSource: MaybeRefOrGetter<OLMap | undefined>,
) {
  const routingStore = useRoutingStore();
  const pathSource = new VectorSource();
  const pendingPathSource = new VectorSource();
  const pointSource = new VectorSource();
  const pathLayer = new VectorLayer({
    source: pathSource,
    style: pathStyle,
  });
  const pendingPathLayer = new VectorLayer({
    source: pendingPathSource,
    style: pendingPathStyle,
  });
  const pointLayer = new VectorLayer({
    source: pointSource,
    style: pointStyle,
  });
  pathLayer.setZIndex(1000);
  pendingPathLayer.setZIndex(1001);
  pointLayer.setZIndex(1002);
  let currentMap: OLMap | undefined;
  let redrawFrame: number | null = null;

  function redraw() {
    pathSource.clear();
    pendingPathSource.clear();
    pointSource.clear();
    if (!routingStore.active) return;

    if (routingStore.previewRoutePath) {
      const [pathFeature] = format.readFeatures(routingStore.previewRoutePath);
      if (pathFeature) {
        pathSource.addFeature(pathFeature);
      }
    }

    if (routingStore.pendingLegPath) {
      const [pendingPathFeature] = format.readFeatures(routingStore.pendingLegPath);
      if (pendingPathFeature) {
        pendingPathSource.addFeature(pendingPathFeature);
      }
    }

    if (routingStore.cursorLegPath) {
      const [cursorPathFeature] = format.readFeatures(routingStore.cursorLegPath);
      if (cursorPathFeature) {
        pendingPathSource.addFeature(cursorPathFeature);
      }
    }

    if (routingStore.displayStart) {
      const startFeature = new Feature({
        geometry: new Point(routingStore.displayStart).transform(
          "EPSG:4326",
          "EPSG:3857",
        ),
      });
      pointSource.addFeature(startFeature);
    }

    if (routingStore.displayDestination) {
      const endFeature = new Feature({
        geometry: new Point(routingStore.displayDestination).transform(
          "EPSG:4326",
          "EPSG:3857",
        ),
      });
      pointSource.addFeature(endFeature);
    }
  }

  function cancelScheduledRedraw() {
    if (redrawFrame === null) return;
    cancelAnimationFrame(redrawFrame);
    redrawFrame = null;
  }

  function scheduleRedraw() {
    cancelScheduledRedraw();
    redrawFrame = requestAnimationFrame(() => {
      redrawFrame = null;
      redraw();
    });
  }

  watch(
    () => [
      routingStore.active,
      routingStore.routeOrigin,
      routingStore.destination,
      routingStore.isBusy,
      routingStore.start,
      routingStore.currentLegPreview,
      routingStore.draftWaypoints,
      routingStore.cursorLegPath,
    ],
    scheduleRedraw,
    { immediate: true, deep: true, flush: "post" },
  );

  watch(
    () => toValue(mapSource),
    (map) => {
      if (currentMap === map) return;
      if (currentMap && "removeLayer" in currentMap) {
        currentMap.removeLayer(pathLayer);
        currentMap.removeLayer(pendingPathLayer);
        currentMap.removeLayer(pointLayer);
      }
      currentMap = map;
      if (currentMap && "addLayer" in currentMap) {
        currentMap.addLayer(pathLayer);
        currentMap.addLayer(pendingPathLayer);
        currentMap.addLayer(pointLayer);
      }
      scheduleRedraw();
    },
    { immediate: true, flush: "post" },
  );

  onUnmounted(() => {
    cancelScheduledRedraw();
    if (currentMap && "removeLayer" in currentMap) {
      currentMap.removeLayer(pathLayer);
      currentMap.removeLayer(pendingPathLayer);
      currentMap.removeLayer(pointLayer);
    }
  });
}
