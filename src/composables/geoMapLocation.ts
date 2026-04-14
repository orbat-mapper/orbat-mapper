import type { MapAdapter, MapEvent } from "@/geo/contracts/mapAdapter";
import {
  createEventHook,
  type Fn,
  onClickOutside,
  onKeyStroke,
  tryOnBeforeUnmount,
} from "@vueuse/core";
import { type MaybeRefOrGetter, ref, toValue } from "vue";
import type { Position } from "geojson";
import { useMapSelectStore } from "@/stores/mapSelectStore";

export interface UseGetMapLocationOptions {
  cancelOnClickOutside?: boolean;
  stopPropagationOnClickOutside?: boolean;
  eventSource?: "map" | "dom";
}

export function useGetMapLocation(
  mapSource: MaybeRefOrGetter<MapAdapter | null | undefined>,
  options: UseGetMapLocationOptions = {},
) {
  const {
    cancelOnClickOutside = true,
    stopPropagationOnClickOutside = true,
    eventSource = "map",
  } = options;

  const isActive = ref(false);
  const mapSelectStore = useMapSelectStore();

  let activeMap: MapAdapter | null = null;
  let prevCursor = "";
  let unsubscribeClick: Fn | undefined;
  let stopEscListener: Fn | undefined;
  let stopClickOutside: Fn | undefined;
  let removeNativeClickListener: Fn | undefined;

  const onGetLocationHook = createEventHook<[Position]>();
  const onCancelHook = createEventHook();
  const onStartHook = createEventHook();
  let prevHoverValue = true;

  function start() {
    const map = toValue(mapSource);
    if (!map) return;
    activeMap = map;
    isActive.value = true;
    onStartHook.trigger(null);
    prevHoverValue = mapSelectStore.hoverEnabled;
    mapSelectStore.hoverEnabled = false;
    prevCursor = map.getTargetElement()?.style.cursor ?? "";
    map.setCursor("crosshair");
    const targetEl = map.getTargetElement();
    if (cancelOnClickOutside && targetEl) {
      stopClickOutside = onClickOutside(targetEl, (e) => {
        if (stopPropagationOnClickOutside) e.stopPropagation();
        cancel();
      });
    }
    stopEscListener = onKeyStroke("Escape", () => cancel());
    if (eventSource === "dom" && targetEl) {
      const handleNativeClickEvent = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        cleanUp();
        onGetLocationHook.trigger(map.getEventCoordinate(event));
      };
      targetEl.addEventListener("click", handleNativeClickEvent, { capture: true });
      removeNativeClickListener = () =>
        targetEl.removeEventListener("click", handleNativeClickEvent, { capture: true });
      return;
    }
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
    activeMap?.setCursor(prevCursor);
    activeMap = null;
    isActive.value = false;
    if (unsubscribeClick) unsubscribeClick();
    if (removeNativeClickListener) removeNativeClickListener();
    if (stopEscListener) stopEscListener();
    if (stopClickOutside) stopClickOutside();
    removeNativeClickListener = undefined;
    unsubscribeClick = undefined;
    stopEscListener = undefined;
    stopClickOutside = undefined;
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
