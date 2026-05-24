// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import {
  geodesicCircleGeometry,
  useMapLibreMeasurementInteraction,
} from "@/composables/maplibreMeasurement";
import type { MeasurementTypes, MeasurementUnit } from "@/composables/geoMeasurement";

function expectLineEndpoints(coords: any[], start: number[], end: number[]) {
  expect(coords[0]).toEqual(start);
  expect(coords[coords.length - 1]).toEqual(end);
}

function expectLineThroughVertices(coords: any[], vertices: number[][]) {
  for (const vertex of vertices) {
    expect(
      coords.some(
        (c: number[]) =>
          Math.abs(c[0]! - vertex[0]!) < 1e-9 && Math.abs(c[1]! - vertex[1]!) < 1e-9,
      ),
    ).toBe(true);
  }
}

function createEvent(lng: number, lat: number, options: { timeStamp?: number } = {}) {
  return {
    lngLat: { lng, lat },
    point: { x: lng, y: lat },
    preventDefault: vi.fn(),
    originalEvent: {
      timeStamp: options.timeStamp,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    },
  } as any;
}

function createHarness(
  options: {
    measurementType?: MeasurementTypes;
    measurementUnit?: MeasurementUnit;
    showSegments?: boolean;
    clearPrevious?: boolean;
    showCircle?: boolean;
    showGeodesicPaths?: boolean;
    snap?: boolean;
    queryRenderedFeatures?: (point: unknown, options?: unknown) => any[];
  } = {},
) {
  const handlers = new Map<string, Function[]>();
  const sources = new Map<string, { data: unknown; setData: ReturnType<typeof vi.fn> }>();
  const layerSpecs = new Map<string, any>();
  const layers = new Set<string>();
  const measurementType = ref<MeasurementTypes>(options.measurementType ?? "LineString");
  const measurementUnit = ref<MeasurementUnit>(options.measurementUnit ?? "metric");
  const showSegments = ref(options.showSegments ?? true);
  const clearPrevious = ref(options.clearPrevious ?? true);
  const showCircle = ref(options.showCircle ?? true);
  const showGeodesicPaths = ref(options.showGeodesicPaths ?? true);
  const snap = ref(options.snap ?? true);
  let doubleClickZoomEnabled = true;
  const mlMap = {
    on: vi.fn((name: string, handler: Function) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    }),
    off: vi.fn(),
    addSource: vi.fn((id: string, source: any) => {
      sources.set(id, {
        data: source.data,
        setData: vi.fn((data: unknown) => {
          sources.get(id)!.data = data;
        }),
      });
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    removeSource: vi.fn((id: string) => sources.delete(id)),
    addLayer: vi.fn((spec: any) => {
      layers.add(spec.id);
      layerSpecs.set(spec.id, spec);
    }),
    getLayer: vi.fn((id: string) => (layers.has(id) ? { id } : undefined)),
    removeLayer: vi.fn((id: string) => {
      layers.delete(id);
      layerSpecs.delete(id);
    }),
    getCanvas: () => ({ style: { cursor: "" } }),
    project: vi.fn(([lng, lat]: [number, number]) => ({ x: lng, y: lat })),
    queryRenderedFeatures: vi.fn(
      (point: unknown, queryOptions?: unknown) =>
        options.queryRenderedFeatures?.(point, queryOptions) ?? [],
    ),
    dragPan: {
      isEnabled: vi.fn(() => true),
      disable: vi.fn(),
      enable: vi.fn(),
    },
    touchZoomRotate: {
      isEnabled: vi.fn(() => true),
      disable: vi.fn(),
      enable: vi.fn(),
    },
    doubleClickZoom: {
      isEnabled: vi.fn(() => doubleClickZoomEnabled),
      disable: vi.fn(() => {
        doubleClickZoomEnabled = false;
      }),
      enable: vi.fn(() => {
        doubleClickZoomEnabled = true;
      }),
    },
  };
  const mapAdapter = {
    getNativeMap: () => mlMap,
    on: vi.fn(() => vi.fn()),
  } as any;

  const wrapper = mount(
    defineComponent({
      setup() {
        const interaction = useMapLibreMeasurementInteraction(
          mapAdapter,
          measurementType,
          {
            measurementUnit,
            showSegments,
            clearPrevious,
            showCircle,
            showGeodesicPaths,
            snap,
          },
        );
        return { interaction };
      },
      template: "<div />",
    }),
  );

  function trigger(name: string, event: any) {
    for (const handler of handlers.get(name) ?? []) handler(event);
  }

  function sourceData(id: string) {
    return sources.get(id)?.data as any;
  }

  return {
    wrapper,
    trigger,
    sourceData,
    sources,
    layerSpecs,
    layers,
    mlMap,
    measurementType,
    measurementUnit,
    showSegments,
    clearPrevious,
    showCircle,
    showGeodesicPaths,
    snap,
    interaction: wrapper.vm.interaction,
  };
}

describe("useMapLibreMeasurementInteraction", () => {
  it("creates length measurements and clears previous measurements by default", () => {
    const harness = createHarness();
    const initialAddLayerCalls = harness.mlMap.addLayer.mock.calls.length;

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("mousemove", createEvent(0, 1));
    expect(harness.mlMap.addLayer).toHaveBeenCalledTimes(initialAddLayerCalls);
    expect(harness.mlMap.removeLayer).not.toHaveBeenCalled();
    expect(
      harness
        .sourceData("maplibre-measurement")
        .features.some((feature: any) => feature.id === "range-circle"),
    ).toBe(true);

    harness.trigger("click", createEvent(0, 1));
    expect(
      harness
        .sourceData("maplibre-measurement")
        .features.some((feature: any) => feature.id === "range-circle"),
    ).toBe(true);

    harness.trigger("dblclick", createEvent(0, 1));
    let features = harness.sourceData("maplibre-measurement").features;
    expect(features).toHaveLength(1);
    expect(features[0].id).toBe("measurement-1");
    expect(features[0].geometry.type).toBe("LineString");
    expectLineEndpoints(features[0].geometry.coordinates, [0, 0], [0, 1]);
    expect(
      harness.sourceData("maplibre-measurement-labels").features[0].properties.text,
    ).toMatch(/km$/);

    harness.trigger("click", createEvent(1, 1));
    harness.trigger("click", createEvent(1, 2));
    harness.trigger("dblclick", createEvent(1, 2));
    features = harness.sourceData("maplibre-measurement").features;
    expect(features).toHaveLength(1);
    expect(features[0].id).toBe("measurement-2");
    expect(features[0].geometry.type).toBe("LineString");
    expectLineEndpoints(features[0].geometry.coordinates, [1, 1], [1, 2]);
  });

  it("keeps the range circle visible when touch events do not provide a live pointer", () => {
    const harness = createHarness();

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(0, 1));
    harness.trigger("touchend", createEvent(0, 1));

    expect(
      harness
        .sourceData("maplibre-measurement")
        .features.some((feature: any) => feature.id === "range-circle"),
    ).toBe(true);
  });

  it("ignores effectively zero-length line segments from touch jitter", () => {
    const harness = createHarness();

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(0, 0.00000000001));
    harness.trigger("click", createEvent(0, 1));
    harness.trigger("dblclick", createEvent(0, 1));

    const feature = harness.sourceData("maplibre-measurement").features[0];
    expect(feature.geometry.type).toBe("LineString");
    expectLineEndpoints(feature.geometry.coordinates, [0, 0], [0, 1]);
    expect(
      harness
        .sourceData("maplibre-measurement-labels")
        .features.some((feature: any) => feature.properties.text === "0 m"),
    ).toBe(false);
  });

  it("finishes a line measurement with a mobile double tap", () => {
    const harness = createHarness();

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("touchend", createEvent(0, 0, { timeStamp: 0 }));
    harness.trigger("click", createEvent(0, 1));
    harness.trigger("touchend", createEvent(0, 1, { timeStamp: 1000 }));
    harness.trigger("click", createEvent(0, 1));
    harness.trigger("touchend", createEvent(0, 1, { timeStamp: 1200 }));

    const features = harness.sourceData("maplibre-measurement").features;
    expect(features).toHaveLength(1);
    expect(features[0].id).toBe("measurement-1");
    expect(features[0].geometry.type).toBe("LineString");
    expectLineEndpoints(features[0].geometry.coordinates, [0, 0], [0, 1]);
  });

  it("preserves multiple measurements when clearPrevious is false", () => {
    const harness = createHarness({ clearPrevious: false });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(0, 1));
    harness.trigger("dblclick", createEvent(0, 1));
    harness.trigger("click", createEvent(1, 1));
    harness.trigger("click", createEvent(1, 2));
    harness.trigger("dblclick", createEvent(1, 2));

    expect(harness.sourceData("maplibre-measurement").features).toHaveLength(2);
  });

  it("creates area measurements and toggles segment labels", async () => {
    const harness = createHarness({ measurementType: "Polygon" });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(1, 0));
    harness.trigger("click", createEvent(1, 1));
    harness.trigger("dblclick", createEvent(1, 1));
    const feature = harness.sourceData("maplibre-measurement").features[0];
    expect(feature.geometry.type).toBe("Polygon");
    const ring = feature.geometry.coordinates[0];
    expect(ring[0]).toEqual([0, 0]);
    expect(ring[ring.length - 1]).toEqual([0, 0]);
    expectLineThroughVertices(ring, [
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
    expect(
      harness
        .sourceData("maplibre-measurement-labels")
        .features.some((feature: any) => feature.properties.kind === "segment"),
    ).toBe(true);

    harness.showSegments.value = false;
    await harness.wrapper.vm.$nextTick();
    expect(
      harness
        .sourceData("maplibre-measurement-labels")
        .features.some((feature: any) => feature.properties.kind === "segment"),
    ).toBe(false);
  });

  it("updates labels when measurement units change", async () => {
    const harness = createHarness();
    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(0, 1));
    harness.trigger("dblclick", createEvent(0, 1));

    harness.measurementUnit.value = "imperial";
    await harness.wrapper.vm.$nextTick();

    expect(
      harness.sourceData("maplibre-measurement-labels").features[0].properties.text,
    ).toMatch(/mi$/);
  });

  it("subdivides a completed line segment by dragging a midpoint handle", () => {
    const harness = createHarness({
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (!queryOptions?.layers?.includes("maplibre-measurement-handle")) return [];
        return [
          {
            properties: {
              measurementId: "measurement-1",
              kind: "midpoint",
              path: JSON.stringify([1]),
            },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(10, 0));
    harness.trigger("dblclick", createEvent(10, 0));
    harness.trigger("mousedown", createEvent(5, 0));
    harness.trigger("mousemove", createEvent(5, 5));
    let coords =
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
    expectLineEndpoints(coords, [0, 0], [10, 0]);
    expectLineThroughVertices(coords, [
      [0, 0],
      [5, 5],
      [10, 0],
    ]);
    harness.trigger("mousemove", createEvent(6, 6));
    harness.trigger("mousemove", createEvent(7, 7));
    harness.trigger("mouseup", createEvent(5, 5));

    coords = harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
    expectLineEndpoints(coords, [0, 0], [10, 0]);
    expectLineThroughVertices(coords, [
      [0, 0],
      [7, 7],
      [10, 0],
    ]);
  });

  it("updates a dragged vertex from touchmove events", () => {
    const harness = createHarness({
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (!queryOptions?.layers?.includes("maplibre-measurement-handle")) return [];
        return [
          {
            properties: {
              measurementId: "measurement-1",
              kind: "vertex",
              path: JSON.stringify([1]),
            },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(10, 0));
    harness.trigger("dblclick", createEvent(10, 0));
    harness.trigger("touchstart", createEvent(10, 0));
    harness.trigger("touchmove", createEvent(10, 5));
    harness.trigger("touchend", createEvent(10, 5));

    const coords =
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
    expectLineEndpoints(coords, [0, 0], [10, 5]);
  });

  it("uses distinct styling for measurement midpoint handles", () => {
    const harness = createHarness();

    const handlePaint = harness.layerSpecs.get("maplibre-measurement-handle").paint;

    expect(handlePaint["circle-radius"]).toEqual([
      "case",
      ["==", ["get", "kind"], "midpoint"],
      4,
      5,
    ]);
    expect(handlePaint["circle-color"]).toEqual([
      "case",
      ["==", ["get", "kind"], "midpoint"],
      "rgba(255, 255, 255, 0.9)",
      "rgba(0, 0, 0, 0.4)",
    ]);
  });

  it("subdivides a completed polygon segment by dragging a midpoint handle", () => {
    const harness = createHarness({
      measurementType: "Polygon",
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (!queryOptions?.layers?.includes("maplibre-measurement-handle")) return [];
        return [
          {
            properties: {
              measurementId: "measurement-1",
              kind: "midpoint",
              path: JSON.stringify([0, 1]),
            },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(10, 0));
    harness.trigger("click", createEvent(10, 10));
    harness.trigger("dblclick", createEvent(10, 10));
    harness.trigger("mousedown", createEvent(5, 0));
    harness.trigger("mousemove", createEvent(5, 5));
    harness.trigger("mouseup", createEvent(5, 5));

    const ring =
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates[0];
    expect(ring[0]).toEqual([0, 0]);
    expect(ring[ring.length - 1]).toEqual([0, 0]);
    expectLineThroughVertices(ring, [
      [0, 0],
      [5, 5],
      [10, 0],
      [10, 10],
    ]);
  });

  it("snaps to nearby rendered scenario vertices", () => {
    const harness = createHarness({
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (queryOptions?.layers) return [];
        return [
          {
            layer: { id: "scenario-feature-layer-1" },
            geometry: {
              type: "LineString",
              coordinates: [
                [5, 5],
                [10, 10],
              ],
            },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(5.1, 5.1));
    harness.trigger("click", createEvent(10, 10));
    harness.trigger("dblclick", createEvent(10, 10));

    expect(
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates[0],
    ).toEqual([5, 5]);
  });

  it("snaps to the nearest rendered scenario segment point", () => {
    const harness = createHarness({
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (queryOptions?.layers) return [];
        return [
          {
            layer: { id: "scenario-feature-layer-1" },
            geometry: {
              type: "LineString",
              coordinates: [
                [0, 0],
                [100, 0],
              ],
            },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(40, 1));
    harness.trigger("click", createEvent(100, 0));
    harness.trigger("dblclick", createEvent(100, 0));

    expect(
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates[0],
    ).toEqual([40, 0]);
  });

  describe("great-circle densification", () => {
    it("leaves short segments un-densified", () => {
      const harness = createHarness();
      // ~22 km at the equator — well under the 100 km threshold.
      harness.trigger("click", createEvent(0, 0));
      harness.trigger("click", createEvent(0.2, 0));
      harness.trigger("dblclick", createEvent(0.2, 0));

      const coords =
        harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
      // Below the densification threshold: exactly the two raw vertices.
      expect(coords).toHaveLength(2);
      expect(coords[0]).toEqual([0, 0]);
      expect(coords[1][0]).toBeCloseTo(0.2, 10);
      expect(coords[1][1]).toEqual(0);
    });

    it("skips densification when showGeodesicPaths is off", async () => {
      const harness = createHarness();
      harness.trigger("click", createEvent(0, 0));
      harness.trigger("click", createEvent(60, 30));
      harness.trigger("dblclick", createEvent(60, 30));

      const denseCoords =
        harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
      expect(denseCoords.length).toBeGreaterThan(8);

      harness.showGeodesicPaths.value = false;
      await nextTick();

      const straightCoords =
        harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
      expect(straightCoords).toHaveLength(2);
      expect(straightCoords[0]).toEqual([0, 0]);
      expect(straightCoords[1]).toEqual([60, 30]);
    });

    it("densifies long segments and keeps a monotonic arc", () => {
      const harness = createHarness();
      harness.trigger("click", createEvent(0, 0));
      harness.trigger("click", createEvent(60, 30));
      harness.trigger("dblclick", createEvent(60, 30));

      const coords =
        harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
      expect(coords.length).toBeGreaterThan(8);
      expectLineEndpoints(coords, [0, 0], [60, 30]);
      for (let i = 1; i < coords.length; i++) {
        expect(coords[i][0]).toBeGreaterThanOrEqual(coords[i - 1][0]);
      }
      // Great-circle from equator to (60, 30) bows north of the chord midpoint.
      const midLat = coords[Math.floor(coords.length / 2)][1];
      expect(midLat).toBeGreaterThan(15);
    });

    it("densifies in the unwrapped frame across the antimeridian", () => {
      const harness = createHarness();
      harness.trigger("click", createEvent(170, 0));
      // Crossing the antimeridian eastward; unwrapped second vertex is lng 200.
      harness.trigger("click", createEvent(-160, 0));
      harness.trigger("dblclick", createEvent(-160, 0));

      const coords =
        harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
      // The crossing segment must actually densify, not fall back to a chord.
      expect(coords.length).toBeGreaterThan(8);
      expect(coords[0]).toEqual([170, 0]);
      expect(coords[coords.length - 1][0]).toBeCloseTo(200, 6);
      // Longitudes are monotonically non-decreasing in the unwrapped frame
      // (a duplicate at the antimeridian seam is allowed; reverses are not).
      for (let i = 1; i < coords.length; i++) {
        expect(coords[i][0]).toBeGreaterThanOrEqual(coords[i - 1][0]);
        expect(Math.abs(coords[i][0] - coords[i - 1][0])).toBeLessThan(180);
      }
    });

    it("places the segment label at the great-circle midpoint, not the chord midpoint", () => {
      const harness = createHarness({ clearPrevious: false });
      // Three-vertex line so segment labels are emitted (lineCoordinates.length > 2).
      harness.trigger("click", createEvent(0, 0));
      harness.trigger("click", createEvent(60, 30));
      harness.trigger("click", createEvent(120, 0));
      harness.trigger("dblclick", createEvent(120, 0));

      const segmentLabels = harness
        .sourceData("maplibre-measurement-labels")
        .features.filter((f: any) => f.properties.kind === "segment");
      expect(segmentLabels.length).toBeGreaterThan(0);
      const firstLabel = segmentLabels[0];
      // Chord midpoint of (0,0)→(60,30) is (30, 15); great-circle midpoint
      // bows north of that. Lng also shifts due to the spherical interpolation.
      expect(firstLabel.geometry.coordinates[1]).toBeGreaterThan(15);
      expect(firstLabel.geometry.coordinates[1]).toBeLessThan(30);
    });

    it("places midpoint edit handles on the great-circle arc", () => {
      const harness = createHarness();
      harness.trigger("click", createEvent(0, 0));
      harness.trigger("click", createEvent(60, 30));
      harness.trigger("dblclick", createEvent(60, 30));

      const handles = harness.sourceData("maplibre-measurement-handles").features;
      const midpointHandle = handles.find((f: any) => f.properties.kind === "midpoint");
      expect(midpointHandle).toBeDefined();
      // Chord midpoint is (30, 15); the great-circle midpoint bows north.
      expect(midpointHandle.geometry.coordinates[1]).toBeGreaterThan(15);
    });

    it("densifies polygon ring edges", () => {
      const harness = createHarness({ measurementType: "Polygon" });
      harness.trigger("click", createEvent(0, 0));
      harness.trigger("click", createEvent(60, 0));
      harness.trigger("click", createEvent(60, 30));
      harness.trigger("dblclick", createEvent(60, 30));

      const ring =
        harness.sourceData("maplibre-measurement").features[0].geometry.coordinates[0];
      // Each long edge densifies to >8 points; the ring far exceeds the 4-vertex raw count.
      expect(ring.length).toBeGreaterThan(20);
      expect(ring[0]).toEqual([0, 0]);
      expect(ring[ring.length - 1]).toEqual([0, 0]);
      expectLineThroughVertices(ring, [
        [0, 0],
        [60, 0],
        [60, 30],
      ]);
    });
  });

  describe("geodesicCircleGeometry", () => {
    it("returns a turf Polygon when no pole is enclosed", () => {
      const geom = geodesicCircleGeometry([0, 0], 100, 64);
      expect(geom.type).toBe("Polygon");
    });

    it("returns an unwrapped LineString when the north pole is enclosed", () => {
      // Center at 75°N, radius (~2200 km) reaches past the pole.
      const geom = geodesicCircleGeometry([0, 75], 2200, 128);
      expect(geom.type).toBe("LineString");
      const coords = (geom as any).coordinates as number[][];
      // The ring winds ~360° in unwrapped longitude as it walks past the pole.
      const winding = coords[coords.length - 1]![0] - coords[0]![0];
      expect(Math.abs(winding)).toBeGreaterThan(180);
      // Adjacent points stay continuous (no antimeridian jumps).
      for (let i = 1; i < coords.length; i += 1) {
        expect(Math.abs(coords[i]![0] - coords[i - 1]![0])).toBeLessThan(180);
      }
    });

    it("returns a LineString when the south pole is enclosed", () => {
      const geom = geodesicCircleGeometry([0, -75], 2200, 128);
      expect(geom.type).toBe("LineString");
    });
  });

  it("cleans up layers, sources, and event handlers on unmount", () => {
    const harness = createHarness();

    harness.wrapper.unmount();

    expect(harness.mlMap.off).toHaveBeenCalledWith("click", expect.any(Function));
    expect(harness.layers.size).toBe(0);
    expect(harness.sources.size).toBe(0);
  });

  it("does not touch disposed MapLibre style internals when cleared after unmount", () => {
    const harness = createHarness();

    harness.wrapper.unmount();
    harness.mlMap.getSource.mockImplementation(() => {
      throw new TypeError("Cannot read properties of undefined (reading 'getSource')");
    });

    expect(() => harness.interaction.clear()).not.toThrow();
  });

  it("grabs the handle nearest the tap rather than the topmost hit", () => {
    const harness = createHarness({
      // The midpoint renders on top and is returned first, but the tap lands on
      // the end vertex, so the closer vertex handle should win and move it
      // rather than subdividing the segment.
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (!queryOptions?.layers?.includes("maplibre-measurement-handle")) return [];
        return [
          {
            properties: {
              measurementId: "measurement-1",
              kind: "midpoint",
              path: JSON.stringify([1]),
            },
            geometry: { type: "Point", coordinates: [5, 0] },
          },
          {
            properties: {
              measurementId: "measurement-1",
              kind: "vertex",
              path: JSON.stringify([1]),
            },
            geometry: { type: "Point", coordinates: [10, 0] },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(10, 0));
    harness.trigger("dblclick", createEvent(10, 0));
    harness.trigger("mousedown", createEvent(10, 0));
    harness.trigger("mousemove", createEvent(10, 5));
    harness.trigger("mouseup", createEvent(10, 5));

    // A vertex move shifts the end vertex to the drag target; a midpoint
    // subdivide would instead leave the endpoints untouched at [10, 0].
    const coords =
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates;
    expectLineEndpoints(coords, [0, 0], [10, 5]);
  });

  it("buffers the tap into a box so offset taps still hit a handle", () => {
    const harness = createHarness({
      queryRenderedFeatures: (_point, queryOptions: any) => {
        if (!queryOptions?.layers?.includes("maplibre-measurement-handle")) return [];
        return [
          {
            properties: {
              measurementId: "measurement-1",
              kind: "vertex",
              path: JSON.stringify([1]),
            },
            geometry: { type: "Point", coordinates: [10, 0] },
          },
        ];
      },
    });

    harness.trigger("click", createEvent(0, 0));
    harness.trigger("click", createEvent(10, 0));
    harness.trigger("dblclick", createEvent(10, 0));
    harness.trigger("mousedown", createEvent(10, 0));

    const boxQuery = harness.mlMap.queryRenderedFeatures.mock.calls.find(
      ([geometry, queryOptions]) =>
        (queryOptions as any)?.layers?.includes("maplibre-measurement-handle") &&
        Array.isArray(geometry),
    );
    expect(boxQuery).toBeDefined();
    const [[minX, minY], [maxX, maxY]] = boxQuery![0] as [
      [number, number],
      [number, number],
    ];
    expect(maxX - minX).toBe(24);
    expect(maxY - minY).toBe(24);
  });
});
