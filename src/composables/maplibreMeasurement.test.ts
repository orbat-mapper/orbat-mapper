// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useMapLibreMeasurementInteraction } from "@/composables/maplibreMeasurement";
import type { MeasurementTypes, MeasurementUnit } from "@/composables/geoMeasurement";

function createEvent(lng: number, lat: number) {
  return {
    lngLat: { lng, lat },
    point: { x: lng, y: lat },
    preventDefault: vi.fn(),
    originalEvent: {
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
    harness.trigger("dblclick", createEvent(0, 1));
    expect(harness.sourceData("maplibre-measurement").features).toEqual([
      expect.objectContaining({
        id: "measurement-1",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [0, 1],
          ],
        },
      }),
    ]);
    expect(
      harness.sourceData("maplibre-measurement-labels").features[0].properties.text,
    ).toMatch(/km$/);

    harness.trigger("click", createEvent(1, 1));
    harness.trigger("click", createEvent(1, 2));
    harness.trigger("dblclick", createEvent(1, 2));
    expect(harness.sourceData("maplibre-measurement").features).toEqual([
      expect.objectContaining({
        id: "measurement-2",
        geometry: {
          type: "LineString",
          coordinates: [
            [1, 1],
            [1, 2],
          ],
        },
      }),
    ]);
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
    expect(harness.sourceData("maplibre-measurement").features[0]).toEqual(
      expect.objectContaining({
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 0],
            ],
          ],
        },
      }),
    );
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
    expect(
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates,
    ).toEqual([
      [0, 0],
      [5, 5],
      [10, 0],
    ]);
    harness.trigger("mousemove", createEvent(6, 6));
    harness.trigger("mousemove", createEvent(7, 7));
    harness.trigger("mouseup", createEvent(5, 5));

    expect(
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates,
    ).toEqual([
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

    expect(
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates,
    ).toEqual([
      [0, 0],
      [10, 5],
    ]);
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

    expect(
      harness.sourceData("maplibre-measurement").features[0].geometry.coordinates,
    ).toEqual([
      [
        [0, 0],
        [5, 5],
        [10, 0],
        [10, 10],
        [0, 0],
      ],
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
});
