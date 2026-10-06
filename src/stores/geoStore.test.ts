import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGeoStore } from "@/stores/geoStore";
import { useMapViewStore } from "@/stores/mapViewStore";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { NUnit } from "@/types/internalModels";

describe("geoStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

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
