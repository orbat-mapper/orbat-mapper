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
  let engine: BoxDrawEngine | null = null;

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
