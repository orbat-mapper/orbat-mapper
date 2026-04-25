// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useMapLibreDrawInteraction } from "@/composables/maplibreDrawInteraction";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";

function createEvent(lng: number, lat: number, options: { buttons?: number } = {}) {
  return {
    lngLat: { lng, lat },
    point: { x: lng, y: lat },
    preventDefault: vi.fn(),
    originalEvent: {
      buttons: options.buttons ?? 0,
      shiftKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    },
  } as any;
}

function createHarness(
  options: {
    selectedFeatures?: GeometryLayerItem[];
    queryRenderedFeatures?: () => any[];
    translate?: boolean;
    freehand?: boolean;
  } = {},
) {
  const handlers = new Map<string, Function[]>();
  const addFeature = vi.fn();
  const updateFeatures = vi.fn();
  const overlays = new Map<string, unknown>();
  const translate = ref(options.translate ?? false);
  const freehand = ref(options.freehand ?? false);
  const mlMap = {
    on: vi.fn((name: string, handler: Function) => {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    }),
    off: vi.fn(),
    getCanvas: () => ({ style: { cursor: "" } }),
    project: vi.fn(([lng, lat]: [number, number]) => ({ x: lng, y: lat * lat })),
    unproject: vi.fn(([x, y]: [number, number]) => ({ lng: x, lat: Math.sqrt(y) })),
    queryRenderedFeatures: vi.fn(() => options.queryRenderedFeatures?.() ?? []),
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
      isEnabled: vi.fn(() => true),
      disable: vi.fn(),
      enable: vi.fn(),
    },
  };
  const mapAdapter = {
    getNativeMap: () => mlMap,
    addGeoJsonOverlay: vi.fn((id: string, geojson: unknown, overlayOptions: unknown) =>
      overlays.set(id, { geojson, options: overlayOptions }),
    ),
    removeGeoJsonOverlay: vi.fn((id: string) => overlays.delete(id)),
  } as any;

  const wrapper = mount(
    defineComponent({
      setup() {
        const draw = useMapLibreDrawInteraction(mapAdapter, {
          translate,
          freehand,
          getSelectedFeatures: () => options.selectedFeatures ?? [],
          addFeature,
          updateFeatures,
        });
        return { draw };
      },
      template: "<div />",
    }),
  );

  function trigger(name: string, event: any) {
    for (const handler of handlers.get(name) ?? []) handler(event);
  }

  return {
    trigger,
    addFeature,
    updateFeatures,
    overlays,
    mlMap,
    mapAdapter,
    draw: wrapper.vm.draw,
  };
}

function selectedLine(): GeometryLayerItem {
  return {
    kind: "geometry",
    id: "feature-1",
    geometry: {
      type: "LineString",
      coordinates: [
        [10, 20],
        [11, 21],
      ],
    },
    geometryMeta: { geometryKind: "LineString" },
    style: {},
  };
}

describe("useMapLibreDrawInteraction", () => {
  it("creates point, line, polygon, and circle features", () => {
    const harness = createHarness();
    expect(harness.mlMap.on).toHaveBeenCalled();

    harness.draw.startDrawing("Point");
    harness.trigger("click", createEvent(1, 2));
    expect(harness.addFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({
        geometry: { type: "Point", coordinates: [1, 2] },
        geometryMeta: { geometryKind: "Point" },
      }),
    );

    harness.draw.startDrawing("LineString");
    harness.trigger("click", createEvent(1, 2));
    harness.trigger("click", createEvent(3, 4));
    harness.trigger("click", createEvent(3, 4));
    harness.trigger("dblclick", createEvent(3, 4));
    expect(harness.addFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({
        geometry: {
          type: "LineString",
          coordinates: [
            [1, 2],
            [3, 4],
          ],
        },
      }),
    );

    harness.draw.startDrawing("Polygon");
    harness.trigger("click", createEvent(1, 2));
    harness.trigger("click", createEvent(3, 4));
    harness.trigger("click", createEvent(5, 6));
    harness.trigger("click", createEvent(5, 6));
    harness.trigger("dblclick", createEvent(5, 6));
    expect(harness.addFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [1, 2],
              [3, 4],
              [5, 6],
              [1, 2],
            ],
          ],
        },
      }),
    );

    harness.draw.startDrawing("Circle");
    harness.trigger("click", createEvent(10, 20));
    harness.trigger("click", createEvent(10.1, 20));
    expect(harness.addFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({
        geometry: { type: "Point", coordinates: [10, 20] },
        geometryMeta: expect.objectContaining({ geometryKind: "Circle" }),
      }),
    );
  });

  it("translates selected features", () => {
    const feature = selectedLine();
    const harness = createHarness({ selectedFeatures: [feature], translate: true });
    harness.trigger("mousedown", createEvent(10, 20));
    harness.trigger("mousemove", createEvent(10.5, 21));
    harness.trigger("mouseup", createEvent(11, 22));

    expect(harness.mapAdapter.addGeoJsonOverlay).toHaveBeenCalledWith(
      "maplibre-draw-preview",
      expect.anything(),
      expect.objectContaining({
        style: expect.objectContaining({ fillColor: "rgba(37,99,235,0)" }),
      }),
    );
    expect(harness.updateFeatures).toHaveBeenCalledWith([
      expect.objectContaining({
        featureId: "feature-1",
        geometry: {
          type: "LineString",
          coordinates: [
            [11, 22],
            [12, 23],
          ],
        },
      }),
    ]);
  });

  it("unwraps draw vertices across the antimeridian", () => {
    const harness = createHarness();

    harness.draw.startDrawing("LineString");
    harness.trigger("click", createEvent(179, 10));
    harness.trigger("mousemove", createEvent(-179.5, 10));
    harness.trigger("click", createEvent(-179, 11));
    harness.trigger("dblclick", createEvent(-179, 11));

    expect(harness.addFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({
        geometry: {
          type: "LineString",
          coordinates: [
            [179, 10],
            [181, 11],
          ],
        },
      }),
    );
    expect(harness.mapAdapter.addGeoJsonOverlay).toHaveBeenCalledWith(
      "maplibre-draw-preview",
      expect.objectContaining({
        features: expect.arrayContaining([
          expect.objectContaining({
            geometry: {
              type: "LineString",
              coordinates: [
                [179, 10],
                [180.5, 10],
              ],
            },
          }),
        ]),
      }),
      expect.anything(),
    );
  });

  it("updates a dragged vertex in modify mode", () => {
    const feature = selectedLine();
    const harness = createHarness({
      selectedFeatures: [feature],
      queryRenderedFeatures: () => [
        {
          properties: {
            featureId: "feature-1",
            kind: "vertex",
            path: JSON.stringify([1]),
          },
        },
      ],
    });
    harness.draw.startModify();
    harness.trigger("mousedown", createEvent(11, 21));
    harness.trigger("mouseup", createEvent(12, 24));

    expect(harness.updateFeatures).toHaveBeenCalledWith([
      expect.objectContaining({
        featureId: "feature-1",
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 20],
            [12, 24],
          ],
        },
      }),
    ]);
  });

  it("inserts a point by dragging an edge midpoint in modify mode", () => {
    const feature = selectedLine();
    const harness = createHarness({
      selectedFeatures: [feature],
      queryRenderedFeatures: () => [
        {
          properties: {
            featureId: "feature-1",
            kind: "midpoint",
            path: JSON.stringify([1]),
          },
        },
      ],
    });
    harness.draw.startModify();

    expect(harness.mapAdapter.addGeoJsonOverlay).toHaveBeenCalledWith(
      "maplibre-draw-midpoint-handles",
      expect.objectContaining({
        features: expect.arrayContaining([
          expect.objectContaining({
            geometry: {
              type: "Point",
              coordinates: [10.5, Math.sqrt((20 * 20 + 21 * 21) / 2)],
            },
          }),
        ]),
      }),
      expect.objectContaining({
        style: expect.objectContaining({
          circleRadius: 4,
          circleFillColor: "#60a5fa",
        }),
      }),
    );

    harness.trigger("mousedown", createEvent(10.5, 20.5));
    harness.trigger("mouseup", createEvent(10.25, 22));

    expect(harness.updateFeatures).toHaveBeenCalledWith([
      expect.objectContaining({
        featureId: "feature-1",
        geometry: {
          type: "LineString",
          coordinates: [
            [10, 20],
            [10.25, 22],
            [11, 21],
          ],
        },
      }),
    ]);
  });
});
