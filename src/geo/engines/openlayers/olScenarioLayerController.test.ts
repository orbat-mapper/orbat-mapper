// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import { defineComponent, nextTick, ref } from "vue";
import VectorLayer from "ol/layer/Vector";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { activeFeatureStylesKey } from "@/components/injects";
import { useRoutingStore } from "@/stores/routingStore";
import { useOlScenarioLayerController } from "@/geo/engines/openlayers/olScenarioLayerController";

vi.mock("@/composables/geoImageLayerInteraction", () => ({
  useImageLayerTransformInteraction: () => ({
    startTransform: vi.fn(),
    endTransform: vi.fn(),
    isActive: ref(false),
  }),
}));

describe("useOlScenarioLayerController", () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it("repaints scenario layers immediately when obstacle highlighting changes", async () => {
    const renderSync = vi.fn();
    const olMap = {
      addLayer: vi.fn(),
      renderSync,
      render: vi.fn(),
      getView: vi.fn(() => ({
        getProjection: vi.fn(() => "EPSG:3857"),
        getResolution: vi.fn(() => 1),
        getCenter: vi.fn(() => [0, 0]),
      })),
    } as any;
    const changedSpy = vi.spyOn(VectorLayer.prototype, "changed");

    const overlayLayer = {
      id: "layer-1",
      kind: "overlay",
      name: "Layer 1",
      items: [],
      isHidden: false,
      _hidden: false,
    };
    const off = vi.fn();
    const scenario = {
      geo: {
        stackLayers: ref([overlayLayer]),
        getFullLayerItemsLayer: vi.fn(() => overlayLayer),
        getLayerIndex: vi.fn(() => 0),
        getLayerById: vi.fn(() => overlayLayer),
        getMapLayerById: vi.fn(() => null),
        updateLayer: vi.fn(),
        onFeatureLayerEvent: vi.fn(() => ({ off })),
        onMapLayerEvent: vi.fn(() => ({ off })),
      },
      store: {
        onUndoRedo: vi.fn(() => ({ off })),
      },
    } as any;

    const Harness = defineComponent({
      setup() {
        const controller = useOlScenarioLayerController(olMap);
        controller.bindScenario(scenario);
        return () => null;
      },
    });

    mount(Harness, {
      global: {
        plugins: [pinia],
        provide: {
          [activeFeatureStylesKey as symbol]: {
            scenarioFeatureStyle: vi.fn(),
            clearCache: vi.fn(),
            invalidateStyle: vi.fn(),
          },
        },
      },
    });

    await nextTick();

    const initialRenderCalls = renderSync.mock.calls.length;
    const initialChangedCalls = changedSpy.mock.calls.length;

    useRoutingStore().obstaclePickerOpen = true;
    await nextTick();

    expect(renderSync.mock.calls.length).toBeGreaterThan(initialRenderCalls);
    expect(changedSpy.mock.calls.length).toBeGreaterThan(initialChangedCalls);

    changedSpy.mockRestore();
  });
});
