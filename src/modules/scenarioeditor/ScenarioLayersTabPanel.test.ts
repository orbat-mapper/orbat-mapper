// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, shallowRef } from "vue";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import type { NScenarioLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { ScenarioLayerActions } from "@/types/constants";
import {
  activeLayerKey,
  activeScenarioKey,
  activeScenarioMapEngineKey,
  scenarioDrawKey,
  tacticalGraphicRenderFeedKey,
} from "@/components/injects";

vi.mock("@/stores/uiStore", () => ({
  useUiStore: () => ({
    layersPanelActive: false,
    mapLayersPanelOpen: true,
  }),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    selectedFeatureIds: ref(new Set<string>()),
    selectedMapLayerIds: ref(new Set<string>()),
    activeMapLayerId: ref(null),
    activeFeatureId: ref(null),
  }),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: () => () => {},
  draggable: () => () => {},
  dropTargetForElements: () => () => {},
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/combine", () => ({
  combine:
    (...cleanups: Array<() => void>) =>
    () =>
      cleanups.forEach((fn) => fn && fn()),
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge", () => ({
  extractClosestEdge: () => null,
  attachClosestEdge: (data: unknown) => data,
}));

describe("ScenarioLayersTabPanel", () => {
  function mountComponent(canZoomMapLayer: boolean) {
    const zoomToMapLayer = vi.fn();
    const layerController = {
      capabilities: {
        zoomToFeature: true,
        zoomToFeatureSet: true,
        panToFeature: true,
        zoomToScenarioLayer: true,
        zoomToMapLayer: canZoomMapLayer,
        featureTransform: true,
        mapLayerTransform: true,
        mapLayerExtent: canZoomMapLayer,
      },
      zoomToMapLayer,
      zoomToFeature: vi.fn(),
      zoomToFeatures: vi.fn(),
      panToFeature: vi.fn(),
      zoomToScenarioLayer: vi.fn(),
    };

    const dotsMenuStub = {
      name: "DotsMenu",
      props: ["items"],
      template: "<div class='dots-menu-stub' />",
    };

    const wrapper = mount(ScenarioLayersTabPanel, {
      global: {
        provide: {
          [activeLayerKey as symbol]: ref(null),
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {} as any,
            layers: layerController,
          }),
          [activeScenarioKey as symbol]: {
            geo: {
              mapLayers: ref([
                {
                  id: "map-layer-1",
                  type: "ImageLayer",
                  name: "Overlay",
                  isHidden: false,
                },
              ]),
              layerItemsLayers: ref([]),
              deleteMapLayer: vi.fn(),
              moveMapLayer: vi.fn(),
              addLayer: vi.fn(),
              updateMapLayer: vi.fn(),
              deleteLayer: vi.fn(),
              moveLayer: vi.fn(),
              getLayerIndex: vi.fn(() => 0),
              getLayerItemById: vi.fn(),
              getGeometryLayerItemById: vi.fn(),
              duplicateFeature: vi.fn(),
              deleteFeature: vi.fn(),
              moveFeature: vi.fn(),
              addMapLayer: vi.fn(),
            },
            store: {
              groupUpdate: vi.fn((fn: () => void) => fn()),
            },
          },
        },
        stubs: {
          ChevronPanel: {
            template: "<div><slot name='right' /><slot /></div>",
          },
          DotsMenu: dotsMenuStub,
          SplitButton: true,
          ScenarioFeatureLayer: true,
        },
      },
    });

    return { wrapper, zoomToMapLayer };
  }

  it("routes map-layer double click through the layer controller", async () => {
    const { wrapper, zoomToMapLayer } = mountComponent(true);

    await wrapper.find("[data-map-layer-id] button").trigger("dblclick");

    expect(zoomToMapLayer).toHaveBeenCalledWith("map-layer-1");
  });

  it("disables map-layer zoom actions when the engine has no extent support", () => {
    const { wrapper } = mountComponent(false);
    const dotsMenus = wrapper.findAllComponents({ name: "DotsMenu" });
    const mapLayerMenu = dotsMenus[dotsMenus.length - 1];

    expect(mapLayerMenu?.props("items")[0]).toMatchObject({
      label: "Zoom to",
      disabled: true,
    });
  });
});

describe("ScenarioLayersTabPanel control-measures section", () => {
  function overlayLayer(id: string, itemIds: string[]): NScenarioOverlayLayer {
    return {
      id,
      kind: "overlay",
      name: id,
      items: itemIds,
      _isOpen: true,
    } as NScenarioOverlayLayer;
  }

  function cm(id: string): NScenarioLayerItem {
    return {
      id,
      kind: "tacticalGraphic",
      graphicKind: "boundary",
      controlPoints: [
        [10, 60],
        [11, 61],
      ],
      _pid: "cm-layer",
    } as unknown as NScenarioLayerItem;
  }

  function geometry(id: string): NScenarioLayerItem {
    return {
      id,
      kind: "geometry",
      _pid: "mixed-layer",
      geometry: { type: "Point", coordinates: [10, 60] },
      geometryMeta: { geometryKind: "Point" },
      style: {},
    } as unknown as NScenarioLayerItem;
  }

  function mountWithLayers(
    layersItems: { layer: NScenarioOverlayLayer; items: NScenarioLayerItem[] }[],
    {
      renderFeed,
      editedControlMeasureId,
    }: {
      renderFeed?: { settle: ReturnType<typeof vi.fn> };
      editedControlMeasureId?: string;
    } = {},
  ) {
    const stackLayers = layersItems.map(({ layer }) => layer);
    return mount(ScenarioLayersTabPanel, {
      global: {
        provide: {
          [activeLayerKey as symbol]: ref(null),
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {} as never,
            layers: { capabilities: {}, zoomToFeature: vi.fn() },
          }),
          [activeScenarioKey as symbol]: {
            geo: {
              mapLayers: ref([]),
              layerItemsLayers: ref(stackLayers),
              layersItems: ref(layersItems),
              stackLayers: ref(stackLayers),
              getGeometryLayerItemById: (id: string) => ({
                layerItem: layersItems
                  .flatMap((l) => l.items)
                  .find((i) => i.id === id && i.kind === "geometry"),
              }),
              updateLayer: vi.fn(),
              updateLayerItem: vi.fn(),
              deleteFeature: vi.fn(),
              deleteLayer: vi.fn(),
            },
            store: { groupUpdate: vi.fn((fn: () => void) => fn()) },
          },
          ...(renderFeed ? { [tacticalGraphicRenderFeedKey as symbol]: renderFeed } : {}),
          ...(editedControlMeasureId
            ? {
                [scenarioDrawKey as symbol]: {
                  armed: shallowRef({
                    kind: "cmEdit",
                    featureId: editedControlMeasureId,
                  }),
                },
              }
            : {}),
        },
        stubs: {
          ChevronPanel: { template: "<div><slot name='label' /><slot /></div>" },
          DotsMenu: true,
          SplitButton: true,
          EditLayerInlineForm: true,
          ScenarioFeatureLayer: {
            props: ["layer"],
            template: "<div class='tree-layer' :data-tree-layer-id='layer.id' />",
          },
        },
      },
    });
  }

  it("renders nothing until a control measure exists", () => {
    const wrapper = mountWithLayers([
      { layer: overlayLayer("plain", ["g1"]), items: [geometry("g1")] },
    ]);

    expect(wrapper.findAllComponents({ name: "ControlMeasureLayer" })).toHaveLength(0);
    expect(wrapper.findAll(".tree-layer")).toHaveLength(1);
  });

  it("renders one section outside the tree and drops the layer from the tree", () => {
    const wrapper = mountWithLayers([
      { layer: overlayLayer("cm-layer", ["cm1"]), items: [cm("cm1")] },
    ]);

    expect(wrapper.findAllComponents({ name: "ControlMeasureLayer" })).toHaveLength(1);
    // The section IS the layer, so the tree must not also render a header for it.
    expect(wrapper.find('[data-tree-layer-id="cm-layer"]').exists()).toBe(false);
    expect(wrapper.find('[data-feature-id="cm1"]').exists()).toBe(true);
  });

  it("keeps a mixed layer in the tree so its geometry items stay listed", () => {
    const wrapper = mountWithLayers([
      {
        layer: overlayLayer("mixed-layer", ["g1", "cm1"]),
        items: [geometry("g1"), cm("cm1")],
      },
    ]);

    expect(wrapper.find('[data-tree-layer-id="mixed-layer"]').exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: "ControlMeasureLayer" })).toHaveLength(1);
  });

  it("settles only when the layer panel deletes the control measure being edited", () => {
    const renderFeed = { settle: vi.fn() };
    const wrapper = mountWithLayers(
      [
        {
          layer: overlayLayer("cm-layer", ["cm1", "cm2"]),
          items: [cm("cm1"), cm("cm2")],
        },
      ],
      { renderFeed, editedControlMeasureId: "cm1" },
    );
    const controlMeasureLayer = wrapper.findComponent({ name: "ControlMeasureLayer" });

    controlMeasureLayer.vm.$emit("item-action", "cm2", "delete");
    expect(renderFeed.settle).not.toHaveBeenCalled();

    controlMeasureLayer.vm.$emit("item-action", "cm1", "delete");

    expect(renderFeed.settle).toHaveBeenCalledWith("delete");
  });

  it("settles only when deleting the overlay layer containing the active edit", () => {
    const renderFeed = { settle: vi.fn() };
    const cm1Layer = overlayLayer("cm1-layer", ["cm1"]);
    const cm2Layer = overlayLayer("cm2-layer", ["cm2"]);
    const wrapper = mountWithLayers(
      [
        { layer: cm1Layer, items: [cm("cm1")] },
        { layer: cm2Layer, items: [cm("cm2")] },
      ],
      { renderFeed, editedControlMeasureId: "cm1" },
    );
    const layers = wrapper.findAllComponents({ name: "ControlMeasureLayer" });

    layers[1]!.vm.$emit("layer-action", cm2Layer, ScenarioLayerActions.Delete);
    expect(renderFeed.settle).not.toHaveBeenCalled();

    layers[0]!.vm.$emit("layer-action", cm1Layer, ScenarioLayerActions.Delete);
    expect(renderFeed.settle).toHaveBeenCalledWith("delete");
  });
});
