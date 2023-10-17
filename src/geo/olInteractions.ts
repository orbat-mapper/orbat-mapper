import { Interaction } from "ol/interaction";
import { MapBrowserEvent } from "ol";
import { click } from "ol/events/condition";

const ctrlKeyOnly = function (mapBrowserEvent: MapBrowserEvent<any>) {
  const originalEvent = mapBrowserEvent.originalEvent;
  return (
    (originalEvent.metaKey || originalEvent.ctrlKey) &&
    !originalEvent.shiftKey &&
    !originalEvent.altKey
  );
};

export interface MapCtrlClickOptions {
  handleCtrlClickEvent?: (
    mapBrowserEvent: MapBrowserEvent<PointerEvent>,
  ) => boolean | void;
}

export class MapCtrlClick extends Interaction {
  constructor(options: MapCtrlClickOptions = {}) {
    super();
    if (options.handleCtrlClickEvent) {
      this.handleCtrlClickEvent = options.handleCtrlClickEvent;
    }
  }

  handleEvent(mapBrowserEvent: MapBrowserEvent<any>) {
    let stopEvent = false;
    if (ctrlKeyOnly(mapBrowserEvent)) {
      stopEvent = true;
      if (click(mapBrowserEvent)) {
        stopEvent = this.handleCtrlClickEvent(mapBrowserEvent) ?? true;
      }
    }
    return !stopEvent;
  }

  handleCtrlClickEvent(mapBrowserEvent: MapBrowserEvent<PointerEvent>): boolean | void {
    console.log("Ctrl click it is", mapBrowserEvent);
  }
}
