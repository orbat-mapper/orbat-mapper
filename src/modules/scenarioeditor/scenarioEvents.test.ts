// @vitest-environment jsdom
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGeoStore } from "@/stores/geoStore";
import { useEventLocation } from "@/modules/scenarioeditor/scenarioEvents";
import type { TScenario } from "@/scenariostore";
import type { FeatureCollection, Point } from "geojson";
import type { EventLocation } from "@/types/scenarioModels";

const PADDING = [50, 50, 50, 50];

function createScenario(): TScenario {
  const unitMap: Record<string, unknown> = {
    "unit-1": { id: "unit-1", _state: { location: [10, 60] } },
    "unit-off-map": { id: "unit-off-map", _state: null },
  };
  const layerItemMap: Record<string, unknown> = {
    "pl-blue": {
      id: "pl-blue",
      kind: "tacticalGraphic",
      graphicKind: "phase-line",
      controlPoints: [
        [11, 61],
        [12, 62],
      ],
    },
    "moved-line": {
      id: "moved-line",
      kind: "geometry",
      geometryMeta: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      _state: {
        geometry: {
          type: "LineString",
          coordinates: [
            [5, 5],
            [6, 6],
          ],
        },
      },
    },
    "ring-1": {
      id: "ring-1",
      kind: "geometry",
      geometryMeta: { geometryKind: "Circle", radius: 1000 },
      geometry: { type: "Point", coordinates: [10, 60] },
    },
    "checkpoint-1": {
      id: "checkpoint-1",
      kind: "pointSymbol",
      sidc: "10032500001301000000",
      position: [13, 63],
    },
  };
  return {
    store: { state: { layerItemMap } },
    helpers: { getUnitById: (id: string) => unitMap[id] },
  } as unknown as TScenario;
}

function setup() {
  const geoStore = useGeoStore();
  const zoomToGeometry = vi
    .spyOn(geoStore, "zoomToGeometry")
    .mockImplementation(() => {});
  const { flyToEventLocation } = useEventLocation({ activeScenario: createScenario() });
  const framedFeatures = () =>
    (zoomToGeometry.mock.calls[0][0] as FeatureCollection).features.map(
      (f) => f.geometry,
    );
  return { flyToEventLocation, zoomToGeometry, framedFeatures };
}

describe("useEventLocation", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("leaves the map alone without a location", () => {
    const { flyToEventLocation, zoomToGeometry } = setup();
    flyToEventLocation(undefined);
    expect(zoomToGeometry).not.toHaveBeenCalled();
  });

  it("frames a fixed shape", () => {
    const { flyToEventLocation, zoomToGeometry } = setup();
    const geometry: Point = { type: "Point", coordinates: [1, 2] };
    flyToEventLocation({ type: "geometry", geometry, maxZoom: 9 });
    expect(zoomToGeometry).toHaveBeenCalledWith(geometry, { duration: 900, maxZoom: 9 });
  });

  it("skips units that no longer exist", () => {
    const { flyToEventLocation, zoomToGeometry, framedFeatures } = setup();
    flyToEventLocation({ type: "units", units: ["deleted", "unit-1"] });
    expect(framedFeatures()).toEqual([{ type: "Point", coordinates: [10, 60] }]);
    expect(zoomToGeometry.mock.calls[0][1]).toEqual({
      duration: 900,
      maxZoom: 15,
      padding: PADDING,
    });
  });

  it("leaves the map alone when nothing resolves", () => {
    const { flyToEventLocation, zoomToGeometry } = setup();
    flyToEventLocation({ type: "items", units: ["deleted"], features: ["gone"] });
    expect(zoomToGeometry).not.toHaveBeenCalled();
  });

  it("frames units and control measures in one camera move", () => {
    const { flyToEventLocation, zoomToGeometry, framedFeatures } = setup();
    flyToEventLocation({
      type: "items",
      units: ["unit-1", "unit-off-map"],
      features: ["pl-blue", "gone"],
    });
    expect(zoomToGeometry).toHaveBeenCalledTimes(1);
    expect(zoomToGeometry.mock.calls[0][1]).toEqual({
      duration: 900,
      maxZoom: 15,
      padding: PADDING,
    });
    expect(framedFeatures()).toEqual([
      { type: "Point", coordinates: [10, 60] },
      {
        type: "MultiPoint",
        coordinates: [
          [11, 61],
          [12, 62],
        ],
      },
    ]);
  });

  it("frames items as they are at the current time", () => {
    const { flyToEventLocation, framedFeatures } = setup();
    flyToEventLocation({ type: "items", features: ["moved-line"] });
    expect(framedFeatures()).toEqual([
      {
        type: "LineString",
        coordinates: [
          [5, 5],
          [6, 6],
        ],
      },
    ]);
  });

  it("frames a circle by its ring and a point symbol by its position", () => {
    const { flyToEventLocation, framedFeatures } = setup();
    flyToEventLocation({
      type: "items",
      features: ["ring-1", "checkpoint-1"],
      maxZoom: 11,
    });
    const [ring, checkpoint] = framedFeatures();
    expect(ring.type).toBe("Polygon");
    expect(checkpoint).toEqual({ type: "Point", coordinates: [13, 63] });
  });

  it("ignores location types it does not know", () => {
    const { flyToEventLocation, zoomToGeometry } = setup();
    flyToEventLocation({ type: "somethingNew" } as unknown as EventLocation);
    expect(zoomToGeometry).not.toHaveBeenCalled();
  });
});

describe("event location outline", () => {
  beforeEach(() => setActivePinia(createPinia()));

  function setupOutline() {
    const geoStore = useGeoStore();
    vi.spyOn(geoStore, "zoomToGeometry").mockImplementation(() => {});
    const flashOutline = vi.spyOn(geoStore, "flashOutline").mockImplementation(() => {});
    return {
      flashOutline,
      ...useEventLocation({ activeScenario: createScenario() }),
    };
  }

  it("outlines a map area as drawn", () => {
    const { eventLocationOutline } = setupOutline();
    const geometry: Point = { type: "Point", coordinates: [1, 2] };
    expect(eventLocationOutline({ type: "geometry", geometry })?.geometry).toEqual(
      geometry,
    );
  });

  it("outlines units and items with one box around all of them", () => {
    const { eventLocationOutline } = setupOutline();
    const outline = eventLocationOutline({
      type: "items",
      units: ["unit-1"],
      features: ["pl-blue", "gone"],
    });
    expect(outline?.geometry).toEqual({
      type: "Polygon",
      coordinates: [
        [
          [10, 60],
          [12, 60],
          [12, 62],
          [10, 62],
          [10, 60],
        ],
      ],
    });
  });

  it("rings a location that is a single point", () => {
    const { eventLocationOutline } = setupOutline();
    expect(eventLocationOutline({ type: "units", units: ["unit-1"] })?.geometry).toEqual({
      type: "Point",
      coordinates: [10, 60],
    });
  });

  it("has nothing to outline when nothing resolves", () => {
    const { eventLocationOutline } = setupOutline();
    expect(eventLocationOutline({ type: "units", units: ["deleted"] })).toBeNull();
    expect(eventLocationOutline(undefined)).toBeNull();
  });

  it("flashes the outline when showing the area", () => {
    const { showEventLocation, flashOutline } = setupOutline();
    showEventLocation({ type: "units", units: ["unit-1"] });
    expect(flashOutline).toHaveBeenCalledWith({
      type: "Feature",
      geometry: { type: "Point", coordinates: [10, 60] },
      properties: {},
    });
  });
});
