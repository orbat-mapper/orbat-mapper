import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGeoStore } from "@/stores/geoStore";
import type { MapAdapter } from "@/geo/contracts/mapAdapter";
import type { NUnit } from "@/types/internalModels";

describe("geoStore", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("forwards padding when zooming to units", () => {
    const store = useGeoStore();
    const adapter = {
      fitGeometry: vi.fn(),
      getZoom: vi.fn(() => 5),
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
});
