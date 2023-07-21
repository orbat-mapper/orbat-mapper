import OLMap from "ol/Map";
import {
  createEventHook,
  Fn,
  onClickOutside,
  onKeyStroke,
  tryOnBeforeUnmount,
} from "@vueuse/core";
import { unByKey } from "ol/Observable";
import { MapBrowserEvent } from "ol";
import { toLonLat } from "ol/proj";
import type { EventsKey } from "ol/events";
import { ref } from "vue";
import type { Position } from "geojson";
import { useMapSelectStore } from "@/stores/mapSelectStore";

export interface UseGetMapLocationOptions {
  cancelOnClickOutside?: boolean;
  stopPropagationOnClickOutside?: boolean;
}

export function useGetMapLocation(olMap: OLMap, options: UseGetMapLocationOptions = {}) {
  const { cancelOnClickOutside = true, stopPropagationOnClickOutside = true } = options;

  const isActive = ref(false);
  const mapSelectStore = useMapSelectStore();

  const prevCursor = olMap.getTargetElement().style.cursor;
  let clickEventKey: EventsKey;
  let stopEscListener: Fn;
  let stopClickOutside: Fn | undefined;

  const onGetLocationHook = createEventHook<Position>();
  const onCancelHook = createEventHook();
  const onStartHook = createEventHook();
  let prevHoverValue = true;

  function start() {
    isActive.value = true;
    onStartHook.trigger(null);
    prevHoverValue = mapSelectStore.hoverEnabled;
    mapSelectStore.hoverEnabled = false;
    olMap.getTargetElement().style.cursor = "crosshair";
    if (cancelOnClickOutside) {
      stopClickOutside = onClickOutside(olMap.getTargetElement(), (e) => {
        if (stopPropagationOnClickOutside) e.stopPropagation();
        cancel();
      });
    }
    stopEscListener = onKeyStroke("Escape", () => cancel());
    clickEventKey = olMap.once("click", handleMapClickEvent);
  }

  function handleMapClickEvent(event: MapBrowserEvent<MouseEvent>) {
    event.stopPropagation();
    cleanUp();
    onGetLocationHook.trigger(
      toLonLat(event.coordinate, olMap.getView().getProjection()),
    );
  }

  function cleanUp() {
    const el = olMap?.getTargetElement();
    if (el) {
      el.style.cursor = prevCursor;
    }
    isActive.value = false;
    if (clickEventKey) unByKey(clickEventKey);
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
