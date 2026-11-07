import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGeoStore } from "@/stores/geoStore";
import { useMapViewStore } from "@/stores/mapViewStore";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { NUnit } from "@/types/internalModels";

function mockAdapter(zoom: number) {
  return {
    animateView: vi.fn(),
    fitGeometry: vi.fn(),
    getZoom: vi.fn(() => zoom),
    getViewBbox: vi.fn(() => [0, 0, 1, 1]),
    on: vi.fn(() => vi.fn()),
  } as unknown as MapAdapter;
}

describe("geoStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("zooms in to a unit when the map is far out", () => {
    const store = useGeoStore();
    const adapter = mockAdapter(4);
    store.setMapAdapter(adapter);

    store.zoomToUnit({ _state: { location: [10, 60] } } as NUnit, 500);

    expect(adapter.animateView).toHaveBeenCalledWith({
      zoom: 15,
      center: [10, 60],
      duration: 500,
    });
  });

  it.each([10, 12, 18])("keeps the zoom at %i when zooming to a unit", (zoom) => {
    const store = useGeoStore();
    const adapter = mockAdapter(zoom);
    store.setMapAdapter(adapter);

    store.zoomToUnit({ _state: { location: [10, 60] } } as NUnit, 500);

    expect(adapter.animateView).toHaveBeenCalledWith({
      zoom,
      center: [10, 60],
      duration: 500,
    });
  });

  it("pans to the middle of several units without zooming", () => {
    const store = useGeoStore();
    const adapter = mockAdapter(8);
    store.setMapAdapter(adapter);
    const units = [
      { _state: { location: [10, 60] } },
      { _state: { location: [14, 61] } },
      { _state: { location: [11, 64] } },
      { _state: {} },
    ] as NUnit[];

    store.panToUnits(units, 500);

    expect(adapter.animateView).toHaveBeenCalledWith({
      center: [12, 62],
      duration: 500,
    });
    expect(adapter.fitGeometry).not.toHaveBeenCalled();
  });

  it("forwards padding when zooming to units", () => {
    const store = useGeoStore();
    const adapter = {
      fitGeometry: vi.fn(),
      getZoom: vi.fn(() => 5),
      getViewBbox: vi.fn(() => [0, 0, 1, 1]),
      on: vi.fn(() => vi.fn()),
    } as unknown as MapAdapter;
    store.setMapAdapter(adapter);
    const units = [
      { _state: { location: [10, 60] } },
      { _state: { location: [11, 61] } },
    ] as NUnit[];

    store.zoomToUnits(units, {
      duration: 900,
      maxZoom: 12,
      padding: [50, 50, 50, 50],
    });

    expect(adapter.fitGeometry).toHaveBeenCalledWith(expect.any(Object), {
      duration: 900,
      maxZoom: 12,
      padding: [50, 50, 50, 50],
    });
  });

  it("tracks the zoom level and visible bbox after every move", () => {
    const store = useGeoStore();
    const mapView = useMapViewStore();
    let onMoveEnd = () => {};
    let bbox = [0, 0, 1, 1];
    const adapter = {
      getZoom: vi.fn(() => 5),
      getViewBbox: vi.fn(() => bbox),
      on: vi.fn((_event: string, handler: () => void) => {
        onMoveEnd = handler;
        return vi.fn();
      }),
    } as unknown as MapAdapter;

    store.setMapAdapter(adapter);
    expect(mapView.viewBbox).toEqual([0, 0, 1, 1]);

    bbox = [10, 50, 20, 60];
    onMoveEnd();
    expect(mapView.viewBbox).toEqual([10, 50, 20, 60]);

    store.setMapAdapter(null);
    expect(mapView.viewBbox).toBeNull();
  });
});
