import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import { createEventHook, onKeyStroke, tryOnBeforeUnmount, type Fn } from "@vueuse/core";
import { type MaybeRefOrGetter, ref, toValue } from "vue";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import OLMap from "ol/Map";
import Draw, { createBox } from "ol/interaction/Draw";
import { transformExtent } from "ol/proj";
import type { Map as MlMap } from "maplibre-gl";
import bboxPolygon from "@turf/bbox-polygon";

const ML_BOX_SOURCE = "__boxDrawSource";
const ML_BOX_FILL = "__boxDrawFill";
const ML_BOX_LINE = "__boxDrawLine";

export function useBoxDraw(mapSource: MaybeRefOrGetter<MapAdapter | null | undefined>) {
  const isActive = ref(false);
  const mapSelectStore = useMapSelectStore();

  type Bbox = [number, number, number, number];
  const onDrawEndHook = createEventHook<[Bbox]>();
  const onCancelHook = createEventHook<void>();

  let activeMap: MapAdapter | null = null;
  let prevCursor = "";
  let prevHoverValue = true;
  let stopEscListener: Fn | undefined;

  // --- OpenLayers ---
  let olDrawInteraction: Draw | null = null;

  function startOL(olMap: OLMap) {
    olDrawInteraction = new Draw({
      type: "Circle",
      geometryFunction: createBox(),
    });

    olDrawInteraction.on("drawend", (e) => {
      const geometry = e.feature.getGeometry();
      if (!geometry) return;
      const extent = geometry.getExtent();
      const bbox = transformExtent(extent, "EPSG:3857", "EPSG:4326");
      cleanUp();
      onDrawEndHook.trigger(bbox as [number, number, number, number]);
    });

    olMap.addInteraction(olDrawInteraction);
  }

  function cleanUpOL() {
    if (!olDrawInteraction) return;
    const map = toValue(mapSource);
    if (map) {
      const native = map.getNativeMap();
      if (native instanceof OLMap) {
        native.removeInteraction(olDrawInteraction);
      }
    }
    olDrawInteraction = null;
  }

  // --- MapLibre ---
  let mlMap: MlMap | null = null;
  let mlStart: [number, number] | null = null;
  let mlClickHandler: ((e: maplibregl.MapMouseEvent) => void) | null = null;
  let mlMouseMoveHandler: ((e: maplibregl.MapMouseEvent) => void) | null = null;

  function addMLPreviewLayers(map: MlMap) {
    if (!map.getSource(ML_BOX_SOURCE)) {
      map.addSource(ML_BOX_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!map.getLayer(ML_BOX_FILL)) {
      map.addLayer({
        id: ML_BOX_FILL,
        type: "fill",
        source: ML_BOX_SOURCE,
        paint: { "fill-color": "rgba(59, 130, 246, 0.15)" },
      });
    }
    if (!map.getLayer(ML_BOX_LINE)) {
      map.addLayer({
        id: ML_BOX_LINE,
        type: "line",
        source: ML_BOX_SOURCE,
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2,
          "line-dasharray": [4, 4],
        },
      });
    }
  }

  function startML(map: MlMap) {
    mlMap = map;

    mlClickHandler = (e: maplibregl.MapMouseEvent) => {
      if (!mlStart) {
        // First click: set start corner, begin preview
        mlStart = [e.lngLat.lng, e.lngLat.lat];
        addMLPreviewLayers(map);
        map.on("mousemove", mlMouseMoveHandler!);
      } else {
        // Second click: finish the box
        const end: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        const bbox = toBbox(mlStart, end);
        cleanUp();
        onDrawEndHook.trigger(bbox);
      }
    };

    mlMouseMoveHandler = (e: maplibregl.MapMouseEvent) => {
      if (!mlStart) return;
      const cur: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      updateMLPreview(mlStart, cur);
    };

    map.on("click", mlClickHandler);
  }

  function toBbox(
    a: [number, number],
    b: [number, number],
  ): [number, number, number, number] {
    return [
      Math.min(a[0], b[0]),
      Math.min(a[1], b[1]),
      Math.max(a[0], b[0]),
      Math.max(a[1], b[1]),
    ];
  }

  function updateMLPreview(start: [number, number], current: [number, number]) {
    if (!mlMap) return;
    const source = mlMap.getSource(ML_BOX_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    const bbox = toBbox(start, current);
    source.setData(bboxPolygon(bbox));
  }

  function cleanUpML() {
    if (!mlMap) return;
    if (mlClickHandler) mlMap.off("click", mlClickHandler);
    if (mlMouseMoveHandler) mlMap.off("mousemove", mlMouseMoveHandler);
    mlClickHandler = null;
    mlMouseMoveHandler = null;
    mlStart = null;

    if (mlMap.getLayer(ML_BOX_LINE)) mlMap.removeLayer(ML_BOX_LINE);
    if (mlMap.getLayer(ML_BOX_FILL)) mlMap.removeLayer(ML_BOX_FILL);
    if (mlMap.getSource(ML_BOX_SOURCE)) mlMap.removeSource(ML_BOX_SOURCE);

    mlMap = null;
  }

  // --- Shared ---

  function start() {
    const adapter = toValue(mapSource);
    if (!adapter) return;
    const native = adapter.getNativeMap();
    if (!native) return;

    activeMap = adapter;
    isActive.value = true;
    prevHoverValue = mapSelectStore.hoverEnabled;
    mapSelectStore.hoverEnabled = false;
    prevCursor = adapter.getTargetElement()?.style.cursor ?? "";
    adapter.setCursor("crosshair");
    stopEscListener = onKeyStroke("Escape", () => cancel());

    if (native instanceof OLMap) {
      startOL(native);
    } else {
      startML(native as MlMap);
    }
  }

  function cleanUp() {
    cleanUpOL();
    cleanUpML();
    if (activeMap) {
      activeMap.setCursor(prevCursor);
    }
    activeMap = null;
    isActive.value = false;
    if (stopEscListener) {
      stopEscListener();
      stopEscListener = undefined;
    }
    mapSelectStore.hoverEnabled = prevHoverValue;
  }

  function cancel() {
    cleanUp();
    onCancelHook.trigger();
  }

  tryOnBeforeUnmount(() => cleanUp());

  return {
    isActive,
    start,
    cancel,
    onDrawEnd: onDrawEndHook.on,
    onCancel: onCancelHook.on,
  };
}
