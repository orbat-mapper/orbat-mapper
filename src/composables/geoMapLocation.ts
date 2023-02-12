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

export interface UseGetMapLocationOptions {
  cancelOnClickOutside?: boolean;
  stopPropagationOnClickOutside?: boolean;
}

export function useGetMapLocation(olMap: OLMap, options: UseGetMapLocationOptions = {}) {
  const { cancelOnClickOutside = true } = options;

  const isActive = ref(false);

  const prevCursor = olMap.getTargetElement().style.cursor;
  let clickEventKey: EventsKey;
  let stopEscListener: Fn;
  let stopClickOutside: Fn | undefined;

  const onGetLocationHook = createEventHook<Position>();
  const onCancelHook = createEventHook();

  function start() {
    isActive.value = true;
    olMap.getTargetElement().style.cursor = "crosshair";
    if (cancelOnClickOutside) {
      stopClickOutside = onClickOutside(olMap.getTargetElement(), (e) => {
        e.stopPropagation();
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
      toLonLat(event.coordinate, olMap.getView().getProjection())
    );
  }

  function cleanUp() {
    olMap.getTargetElement().style.cursor = prevCursor;
    isActive.value = false;
    if (clickEventKey) unByKey(clickEventKey);
    if (stopEscListener) stopEscListener();
    if (stopClickOutside) stopClickOutside();
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
    onGetLocation: onGetLocationHook.on,
    onCancel: onCancelHook.on,
  };
}
