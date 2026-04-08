// @vitest-environment jsdom
import { createEventHook } from "@vueuse/core";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MlMapLogic from "@/modules/globeview/MlMapLogic.vue";
import {
  activeScenarioMapEngineKey,
  searchActionsKey,
} from "@/components/injects";

vi.mock("@/modules/globeview/useGlobeMapDrop.ts", () => ({
  useGlobeMapDrop: () => ({
    isDragging: ref(false),
    formattedPosition: ref(""),
  }),
}));

vi.mock("@/symbology/milsymbwrapper.ts", () => ({
  symbolGenerator: vi.fn(() => ({
    getSize: () => ({ width: 1, height: 1 }),
    asCanvas: () => ({
      getContext: () => ({
        getImageData: () => new ImageData(2, 2),
      }),
    }),
  })),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual<typeof import("@vueuse/core")>("@vueuse/core");
  return {
    ...actual,
    useRafFn: () => ({
      pause: vi.fn(),
      resume: vi.fn(),
      isActive: ref(false),
    }),
  };
});

function createSearchActions() {
  return {
    onUnitSelectHook: createEventHook<any>(),
    onLayerSelectHook: createEventHook<any>(),
    onImageLayerSelectHook: createEventHook<any>(),
    onFeatureSelectHook: createEventHook<any>(),
    onEventSelectHook: createEventHook<any>(),
    onPlaceSelectHook: createEventHook<any>(),
    onScenarioActionHook: createEventHook<any>(),
  };
}

function createMockMap() {
  const listeners = new Map<string, Set<(event?: unknown) => void>>();
  const sources = new Map<string, { setData: ReturnType<typeof vi.fn> }>();
  const layers = new Map<string, unknown>();

  const map = {
    on: vi.fn((event: string, handler: (event?: unknown) => void) => {
      const handlers = listeners.get(event) ?? new Set();
      handlers.add(handler);
      listeners.set(event, handlers);
    }),
    off: vi.fn((event: string, handler: (event?: unknown) => void) => {
      listeners.get(event)?.delete(handler);
    }),
    getSource: vi.fn((id: string) => sources.get(id)),
    addSource: vi.fn((id: string) => {
      sources.set(id, { setData: vi.fn() });
    }),
    getLayer: vi.fn((id: string) => layers.get(id)),
    addLayer: vi.fn((layer: { id: string }) => {
      layers.set(layer.id, layer);
    }),
    hasImage: vi.fn(() => false),
    addImage: vi.fn(),
    queryRenderedFeatures: vi.fn(() => []),
    getCanvas: vi.fn(() => ({ style: { cursor: "" } })),
    setCenter: vi.fn(),
  };

  return {
    map: map as any,
    getSource(id: string) {
      return sources.get(id);
    },
    emit(event: string, payload?: unknown) {
      listeners.get(event)?.forEach((handler) => handler(payload));
    },
  };
}

describe("MlMapLogic", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("creates the unit layer immediately when mounted after the initial map load", () => {
    const mockMap = createMockMap();
    const activeScenario = {
      store: {
        state: {
          id: "scenario-1",
          currentTime: 0,
        },
      },
      unitActions: {
        getCombinedSymbolOptions: vi.fn(() => ({})),
      },
      geo: {
        everyVisibleUnit: computed(() => [
          {
            id: "unit-1",
            sidc: "SFGPUCI----K",
            shortName: "A1",
            name: "Alpha 1",
            _state: {
              location: [10, 20],
            },
          },
        ]),
      },
      time: {
        setCurrentTime: vi.fn(),
      },
    } as any;

    mount(MlMapLogic, {
      props: {
        mlMap: mockMap.map,
        activeScenario,
      },
      global: {
        plugins: [createPinia()],
        provide: {
          [activeScenarioMapEngineKey as symbol]: shallowRef({ map: {} } as any),
          [searchActionsKey as symbol]: createSearchActions(),
        },
      },
    });

    expect(mockMap.map.addSource).toHaveBeenCalledWith(
      "unitSource",
      expect.objectContaining({ type: "geojson" }),
    );
    expect(mockMap.map.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({ id: "unitLayer", source: "unitSource" }),
    );
    expect(mockMap.getSource("unitSource")?.setData).toHaveBeenCalledTimes(1);
    expect(mockMap.map.setCenter).toHaveBeenCalledWith([10, 20]);
  });
});
