import type { MapAdapter, MapEvent } from "@/geo/mapAdapter";
import {
  createEventHook,
  type Fn,
  onClickOutside,
  onKeyStroke,
  tryOnBeforeUnmount,
} from "@vueuse/core";
import { ref } from "vue";
import type { Position } from "geojson";
import { useMapSelectStore } from "@/stores/mapSelectStore";

export interface UseGetMapLocationOptions {
  cancelOnClickOutside?: boolean;
  stopPropagationOnClickOutside?: boolean;
}

export function useGetMapLocation(
  map: MapAdapter | null | undefined,
  options: UseGetMapLocationOptions = {},
) {
  const { cancelOnClickOutside = true, stopPropagationOnClickOutside = true } = options;

  const isActive = ref(false);
  const mapSelectStore = useMapSelectStore();

  const el = map?.getTargetElement();
  const prevCursor = el?.style.cursor ?? "";
  let unsubscribeClick: Fn | undefined;
  let stopEscListener: Fn;
  let stopClickOutside: Fn | undefined;

  const onGetLocationHook = createEventHook<[Position]>();
  const onCancelHook = createEventHook();
  const onStartHook = createEventHook();
  let prevHoverValue = true;

  function start() {
    if (!map) return;
    isActive.value = true;
    onStartHook.trigger(null);
    prevHoverValue = mapSelectStore.hoverEnabled;
    mapSelectStore.hoverEnabled = false;
    map.setCursor("crosshair");
    const targetEl = map.getTargetElement();
    if (cancelOnClickOutside && targetEl) {
      stopClickOutside = onClickOutside(targetEl, (e) => {
        if (stopPropagationOnClickOutside) e.stopPropagation();
        cancel();
      });
    }
    stopEscListener = onKeyStroke("Escape", () => cancel());
    unsubscribeClick = map.once("click", handleMapClickEvent);
  }

  function handleMapClickEvent(event: MapEvent) {
    event.stopPropagation();
    cleanUp();
    if (event.coordinate) {
      onGetLocationHook.trigger(event.coordinate);
    }
  }

  function cleanUp() {
    map?.setCursor(prevCursor);
    isActive.value = false;
    if (unsubscribeClick) unsubscribeClick();
    if (stopEscListener) stopEscListener();
    if (stopClickOutside) stopClickOutside();
    mapSelectStore.hoverEnabled = prevHoverValue;
  }

  function cancel() {
    cleanUp();
    onCancelHook.trigger(null);
  }

  tryOnBeforeUnmount(() => cleanUp());

  return {
    isActive,
    cancel,
    start,
    onStart: onStartHook.on,
    onGetLocation: onGetLocationHook.on,
    onCancel: onCancelHook.on,
  };
}
