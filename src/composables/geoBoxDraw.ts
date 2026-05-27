import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import { createEventHook, onKeyStroke, tryOnBeforeUnmount, type Fn } from "@vueuse/core";
import { type MaybeRefOrGetter, ref, toValue } from "vue";
import { useMapSelectStore } from "@/stores/mapSelectStore";
import OLMap from "ol/Map";
import type { Map as MlMap } from "maplibre-gl";
import type { BoxDrawEngine } from "./boxDrawEngine";
import { createOLBoxDrawEngine } from "./boxDrawEngineOL";
import { createMLBoxDrawEngine } from "./boxDrawEngineML";

type Bbox = [number, number, number, number];

export function useBoxDraw(mapSource: MaybeRefOrGetter<MapAdapter | null | undefined>) {
  const isActive = ref(false);
  const mapSelectStore = useMapSelectStore();

  const onDrawEndHook = createEventHook<[Bbox]>();
  const onCancelHook = createEventHook<void>();

  let activeMap: MapAdapter | null = null;
  let prevCursor = "";
  let prevHoverValue = true;
  let stopEscListener: Fn | undefined;
  let releaseSelectionSuppression: (() => void) | undefined;
  let engine: BoxDrawEngine | null = null;

  function start() {
    const adapter = toValue(mapSource);
    if (!adapter) return;
    const native = adapter.getNativeMap();
    if (!native) return;

    // Restarting while a draw is already in progress (e.g. the user clicks
    // "Draw rectangle" again before placing the box) must tear the previous one
    // down first; otherwise its map listeners and its selection-suppression
    // token would leak, and a leaked token never clears — selection would stay
    // suppressed for the rest of the session.
    if (isActive.value) cleanUp();

    activeMap = adapter;
    isActive.value = true;
    prevHoverValue = mapSelectStore.hoverEnabled;
    mapSelectStore.hoverEnabled = false;
    // Suppress unit/feature selection for the lifetime of the draw: the clicks
    // that place the box would otherwise also fall through to the map's
    // selection handler.
    releaseSelectionSuppression = mapSelectStore.suppressSelection();
    prevCursor = adapter.getTargetElement()?.style.cursor ?? "";
    adapter.setCursor("crosshair");
    stopEscListener = onKeyStroke("Escape", () => cancel());

    engine =
      native instanceof OLMap
        ? createOLBoxDrawEngine(native)
        : createMLBoxDrawEngine(native as MlMap);

    engine.start((bbox) => {
      cleanUp();
      onDrawEndHook.trigger(bbox);
    });
  }

  function cleanUp() {
    engine?.cleanUp();
    engine = null;
    if (activeMap) {
      activeMap.setCursor(prevCursor);
    }
    activeMap = null;
    isActive.value = false;
    releaseSelectionSuppression?.();
    releaseSelectionSuppression = undefined;
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
