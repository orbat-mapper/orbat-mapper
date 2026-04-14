// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import { useGetMapLocation } from "@/composables/geoMapLocation";
import type {
  AnimateOptions,
  FitOptions,
  MapAdapter,
  MapEventHandler,
  MapEventType,
} from "@/geo/contracts/mapAdapter";

type FakeMapAdapter = MapAdapter & {
  targetElement: HTMLElement;
  onceUnsubscribe: ReturnType<typeof vi.fn>;
  onUnsubscribe: ReturnType<typeof vi.fn>;
  getEventCoordinateSpy: ReturnType<typeof vi.fn>;
  emit(event: MapEventType, payload?: { coordinate?: [number, number] }): void;
};

function createFakeMapAdapter(initialCursor = ""): FakeMapAdapter {
  const targetElement = document.createElement("div");
  targetElement.style.cursor = initialCursor;

  const onceHandlers = new Map<MapEventType, MapEventHandler[]>();
  const onHandlers = new Map<MapEventType, MapEventHandler[]>();
  const onceUnsubscribe = vi.fn();
  const onUnsubscribe = vi.fn();
  const getEventCoordinateSpy = vi.fn((_event: MouseEvent) => [0, 0] as [number, number]);

  const removeHandler = (
    handlers: Map<MapEventType, MapEventHandler[]>,
    event: MapEventType,
    handler: MapEventHandler,
  ) => {
    const eventHandlers = handlers.get(event);
    if (!eventHandlers) return;
    handlers.set(
      event,
      eventHandlers.filter((existingHandler) => existingHandler !== handler),
    );
  };

  const adapter: FakeMapAdapter = {
    targetElement,
    onceUnsubscribe,
    onUnsubscribe,
    getEventCoordinateSpy,
    animateView(_options: AnimateOptions) {},
    fitExtent(_bbox: [number, number, number, number], _options?: FitOptions) {},
    fitGeometry(_geojson, _options?: FitOptions) {},
    getViewBbox() {
      return undefined;
    },
    getZoom() {
      return undefined;
    },
    getCenter() {
      return undefined;
    },
    getResolution() {
      return undefined;
    },
    getRotation() {
      return 0;
    },
    getResolutionForZoom(_zoom: number) {
      return undefined;
    },
    getViewConstraints() {
      return {};
    },
    setViewConstraints() {},
    updateSize() {},
    toLonLat(coordinate: number[]) {
      return coordinate as [number, number];
    },
    fromLonLat(position) {
      return position;
    },
    getEventCoordinate: getEventCoordinateSpy,
    getTargetElement() {
      return targetElement;
    },
    setCursor(cursor: string) {
      targetElement.style.cursor = cursor;
    },
    on(event: MapEventType, handler: MapEventHandler) {
      const eventHandlers = onHandlers.get(event) ?? [];
      onHandlers.set(event, [...eventHandlers, handler]);
      return () => {
        onUnsubscribe(event);
        removeHandler(onHandlers, event, handler);
      };
    },
    once(event: MapEventType, handler: MapEventHandler) {
      const eventHandlers = onceHandlers.get(event) ?? [];
      onceHandlers.set(event, [...eventHandlers, handler]);
      return () => {
        onceUnsubscribe(event);
        removeHandler(onceHandlers, event, handler);
      };
    },
    getNativeMap() {
      return undefined;
    },
    emit(event: MapEventType, payload?: { coordinate?: [number, number] }) {
      const mapEvent = {
        coordinate: payload?.coordinate,
        pixel: undefined,
        stopPropagation: vi.fn(),
      };

      for (const handler of onHandlers.get(event) ?? []) {
        handler(mapEvent);
      }
      const onceEventHandlers = onceHandlers.get(event) ?? [];
      onceHandlers.delete(event);
      for (const handler of onceEventHandlers) {
        handler(mapEvent);
      }
    },
  };

  return adapter;
}

describe("useGetMapLocation", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("restores the cursor on the map that started location picking if the source changes", () => {
    const firstMap = createFakeMapAdapter("grab");
    const secondMap = createFakeMapAdapter("default");
    const activeMap = ref<MapAdapter | null>(firstMap);

    const locationPicker = useGetMapLocation(activeMap, {
      cancelOnClickOutside: false,
    });

    locationPicker.start();

    expect(firstMap.targetElement.style.cursor).toBe("crosshair");
    expect(secondMap.targetElement.style.cursor).toBe("default");

    activeMap.value = secondMap;
    locationPicker.cancel();

    expect(firstMap.targetElement.style.cursor).toBe("grab");
    expect(secondMap.targetElement.style.cursor).toBe("default");
    expect(firstMap.onceUnsubscribe).toHaveBeenCalledWith("click");
    expect(secondMap.onceUnsubscribe).not.toHaveBeenCalled();
  });

  it("can capture the next location from a DOM click instead of a map event", () => {
    const map = createFakeMapAdapter("grab");
    map.getEventCoordinateSpy.mockReturnValue([12, 34]);
    const activeMap = ref<MapAdapter | null>(map);
    const locationPicker = useGetMapLocation(activeMap, {
      cancelOnClickOutside: false,
      eventSource: "dom",
    });
    const onGetLocation = vi.fn();

    locationPicker.onGetLocation(onGetLocation);
    locationPicker.start();

    map.targetElement.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 10,
        clientY: 20,
      }),
    );

    expect(onGetLocation).toHaveBeenCalledWith([12, 34]);
    expect(map.getEventCoordinateSpy).toHaveBeenCalledTimes(1);
    expect(map.onceUnsubscribe).not.toHaveBeenCalled();
    expect(locationPicker.isActive.value).toBe(false);
    expect(map.targetElement.style.cursor).toBe("grab");
  });
});
