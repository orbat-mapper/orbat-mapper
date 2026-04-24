// @vitest-environment jsdom
import { mount, flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MapContainer from "@/components/MapContainer.vue";

const {
  addLayer,
  mapOn,
  setTarget,
  viewConstructor,
  fromLonLat,
  selectLayer,
  initializeBaseLayers,
  createBaseLayerInstances,
} = vi.hoisted(() => ({
  addLayer: vi.fn(),
  mapOn: vi.fn(() => "moveend-key"),
  setTarget: vi.fn(),
  viewConstructor: vi.fn(),
  fromLonLat: vi.fn((coordinate) => ["projected", ...coordinate]),
  selectLayer: vi.fn(),
  initializeBaseLayers: vi.fn().mockResolvedValue(undefined),
  createBaseLayerInstances: vi.fn(() => []),
}));

vi.mock("ol/Map", () => ({
  default: class MockMap {
    constructor(_options: unknown) {}
    addLayer = addLayer;
    on = mapOn;
    setTarget = setTarget;
  },
}));

vi.mock("ol/View", () => ({
  default: class MockView {
    constructor(options: unknown) {
      viewConstructor(options);
    }
  },
}));

vi.mock("ol/proj", () => ({
  fromLonLat,
}));

vi.mock("ol/control/defaults", () => ({
  defaults: vi.fn(() => "controls"),
}));

vi.mock("@/composables/openlayersHelpers", () => ({
  useOlEvent: vi.fn(),
}));

vi.mock("@/geo/baseLayers", () => ({
  createBaseLayerInstances,
}));

vi.mock("@/stores/baseLayersStore", () => ({
  useBaseLayersStore: () => ({
    initialize: initializeBaseLayers,
    layers: [{ name: "osm", opacity: 1 }],
    activeLayerName: "osm",
    selectLayer,
  }),
}));

describe("MapContainer", () => {
  beforeEach(() => {
    addLayer.mockClear();
    mapOn.mockClear();
    setTarget.mockClear();
    viewConstructor.mockClear();
    fromLonLat.mockClear();
    selectLayer.mockClear();
    initializeBaseLayers.mockClear();
    createBaseLayerInstances.mockClear();
  });

  it("initializes OpenLayers from an initial lon/lat center, zoom, and rotation", async () => {
    mount(MapContainer, {
      props: {
        initialView: {
          center: [12.5, 63.4],
          zoom: 7.25,
          rotation: Math.PI / 3,
        },
      },
    });

    await flushPromises();

    expect(fromLonLat).toHaveBeenCalledWith([12.5, 63.4]);
    expect(viewConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        center: ["projected", 12.5, 63.4],
        zoom: 7.25,
        rotation: Math.PI / 3,
        showFullExtent: true,
      }),
    );
  });
});
