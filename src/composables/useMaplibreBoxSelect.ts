import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import bboxPolygon from "@turf/bbox-polygon";
import type { EntityId } from "@/types/base";

const BOX_SELECT_SOURCE = "__boxSelectSource";
const BOX_SELECT_FILL = "__boxSelectFill";
const BOX_SELECT_LINE = "__boxSelectLine";
const DRAG_THRESHOLD_PX = 3;

export interface MaplibreBoxSelectOptions<S> {
  getUnitLayerIds: () => string[];
  onBoxStart: () => void;
  onBoxEnd: (unitIds: EntityId[]) => void;
  isEnabled: () => boolean;
  suspend: () => S;
  restore: (suspended: S) => void;
}

export interface MaplibreBoxSelect {
  cleanup: () => void;
}

/**
 * Ctrl/Cmd + drag box-select for units on a MapLibre map. Mirrors the
 * OpenLayers `DragBox({ condition: platformModifierKeyOnly })` behavior used by
 * `useUnitSelectInteraction` in `src/composables/geoUnitLayers.ts`.
 */
export function useMaplibreBoxSelect<S>(
  mlMap: MlMap,
  options: MaplibreBoxSelectOptions<S>,
): MaplibreBoxSelect {
  const container = mlMap.getCanvasContainer();

  type ActiveDrag = {
    startPx: [number, number];
    suspended: S;
  };
  type PendingDrag = {
    startPx: [number, number];
  };
  let pending: PendingDrag | null = null;
  let drag: ActiveDrag | null = null;

  function getPixel(e: MouseEvent): [number, number] {
    const rect = mlMap.getCanvas().getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function addPreviewLayers() {
    if (!mlMap.getSource(BOX_SELECT_SOURCE)) {
      mlMap.addSource(BOX_SELECT_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    if (!mlMap.getLayer(BOX_SELECT_FILL)) {
      mlMap.addLayer({
        id: BOX_SELECT_FILL,
        type: "fill",
        source: BOX_SELECT_SOURCE,
        paint: { "fill-color": "rgba(59, 130, 246, 0.15)" },
      });
    }
    if (!mlMap.getLayer(BOX_SELECT_LINE)) {
      mlMap.addLayer({
        id: BOX_SELECT_LINE,
        type: "line",
        source: BOX_SELECT_SOURCE,
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2,
          "line-dasharray": [4, 4],
        },
      });
    }
  }

  function removePreviewLayers() {
    if (mlMap.getLayer(BOX_SELECT_LINE)) mlMap.removeLayer(BOX_SELECT_LINE);
    if (mlMap.getLayer(BOX_SELECT_FILL)) mlMap.removeLayer(BOX_SELECT_FILL);
    if (mlMap.getSource(BOX_SELECT_SOURCE)) mlMap.removeSource(BOX_SELECT_SOURCE);
  }

  function updatePreview(currentPx: [number, number]) {
    if (!drag) return;
    const source = mlMap.getSource(BOX_SELECT_SOURCE) as GeoJSONSource | undefined;
    if (!source) return;
    const a = mlMap.unproject(drag.startPx);
    const b = mlMap.unproject(currentPx);
    const minLng = Math.min(a.lng, b.lng);
    const maxLng = Math.max(a.lng, b.lng);
    const minLat = Math.min(a.lat, b.lat);
    const maxLat = Math.max(a.lat, b.lat);
    source.setData(bboxPolygon([minLng, minLat, maxLng, maxLat]));
  }

  function onMove(e: MouseEvent) {
    if (pending && !drag) {
      const currentPx = getPixel(e);
      if (
        Math.hypot(currentPx[0] - pending.startPx[0], currentPx[1] - pending.startPx[1]) <
        DRAG_THRESHOLD_PX
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      options.onBoxStart();
      drag = {
        startPx: pending.startPx,
        suspended: options.suspend(),
      };
      pending = null;
      addPreviewLayers();
      updatePreview(currentPx);
      mlMap.getCanvas().style.cursor = "crosshair";
    }
    if (!drag) return;
    e.preventDefault();
    e.stopPropagation();
    updatePreview(getPixel(e));
  }

  function onUp(e: MouseEvent) {
    if (pending && !drag) {
      pending = null;
      detachWindowListeners();
      return;
    }
    if (!drag) return;
    e.preventDefault();
    e.stopPropagation();
    const startPx = drag.startPx;
    const endPx = getPixel(e);
    const minX = Math.min(startPx[0], endPx[0]);
    const minY = Math.min(startPx[1], endPx[1]);
    const maxX = Math.max(startPx[0], endPx[0]);
    const maxY = Math.max(startPx[1], endPx[1]);

    // Treat a zero-area box as a no-op (ends up as a plain click).
    if (maxX - minX < 1 && maxY - minY < 1) {
      finish();
      return;
    }

    const features = mlMap.queryRenderedFeatures(
      [
        [minX, minY],
        [maxX, maxY],
      ],
      { layers: options.getUnitLayerIds() },
    );
    const unitIds = new Set<EntityId>();
    for (const f of features) {
      const id = f.properties?.id;
      if (typeof id === "string" && id) unitIds.add(id);
    }
    options.onBoxEnd([...unitIds]);
    finish();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== "Escape") return;
    pending = null;
    cancel();
    detachWindowListeners();
  }

  function detachWindowListeners() {
    window.removeEventListener("mousemove", onMove, true);
    window.removeEventListener("mouseup", onUp, true);
    window.removeEventListener("keydown", onKey, true);
  }

  function teardown() {
    if (!drag) return;
    const suspended = drag.suspended;
    drag = null;
    detachWindowListeners();
    removePreviewLayers();
    options.restore(suspended);
    mlMap.getCanvas().style.cursor = "";
  }

  function finish() {
    teardown();
  }

  function cancel() {
    teardown();
  }

  function onDown(e: MouseEvent) {
    if (pending || drag) return;
    if (e.button !== 0) return;
    if (!(e.ctrlKey || e.metaKey)) return;
    if (!options.isEnabled()) return;

    pending = {
      startPx: getPixel(e),
    };

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
    window.addEventListener("keydown", onKey, true);
  }

  container.addEventListener("mousedown", onDown, { capture: true });

  return {
    cleanup() {
      container.removeEventListener("mousedown", onDown, { capture: true });
      if (drag) teardown();
    },
  };
}
