// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, ref, shallowRef } from "vue";
import ScenarioLayersTabPanel from "@/modules/scenarioeditor/ScenarioLayersTabPanel.vue";
import type { NScenarioLayerItem } from "@/types/scenarioLayerItems";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";
import { ScenarioLayerActions } from "@/types/constants";
import { useNewScenarioStore } from "@/scenariostore/newScenarioStore";
import { useGeo } from "@/scenariostore/geo";
import {
  getScenarioFeatureDragItem,
  getScenarioFeatureLayerDragItem,
} from "@/types/draggables";
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

const dragMonitor = vi.hoisted(() => ({ options: null as any }));

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: (options: any) => {
    dragMonitor.options = options;
    return () => {};
  },
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

    const addLayer = vi.fn((layer) => ({ ...layer }));
    const activeLayerId = ref<string | null>(null);
    const wrapper = mount(ScenarioLayersTabPanel, {
      global: {
        provide: {
          [activeLayerKey as symbol]: activeLayerId,
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
              addLayer,
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

    return { wrapper, zoomToMapLayer, addLayer, activeLayerId };
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

  it("explicitly creates and edits an active control-measure layer", () => {
    const { wrapper, addLayer, activeLayerId } = mountComponent(true);
    const splitButton = wrapper.findComponent({ name: "SplitButton" });
    const addControlMeasureLayer = splitButton
      .props("items")
      .find((item: { label: string }) => item.label === "Add control-measure layer");

    addControlMeasureLayer.onClick();

    expect(addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New control-measure layer",
        specialization: "controlMeasure",
        items: [],
      }),
    );
    expect(activeLayerId.value).toBe(addLayer.mock.calls[0]![0].id);
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
      ...(itemIds.length > 0 && itemIds.every((itemId) => itemId.startsWith("cm"))
        ? { specialization: "controlMeasure" as const }
        : {}),
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
      drawingDestinationLayerId,
    }: {
      renderFeed?: { settle: ReturnType<typeof vi.fn> };
      editedControlMeasureId?: string;
      drawingDestinationLayerId?: string;
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
          ...(editedControlMeasureId || drawingDestinationLayerId
            ? {
                [scenarioDrawKey as symbol]: {
                  armed: shallowRef(
                    editedControlMeasureId
                      ? {
                          kind: "cmEdit",
                          featureId: editedControlMeasureId,
                        }
                      : { kind: "cmDraw", graphicKind: "phase-line" },
                  ),
                  controlMeasureDrawDestinationLayerId: shallowRef(
                    drawingDestinationLayerId ?? null,
                  ),
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

  it("shows empty specialized layers with the standard layer and item actions", () => {
    const prepared = {
      ...overlayLayer("prepared", []),
      specialization: "controlMeasure" as const,
    };
    const wrapper = mountWithLayers([{ layer: prepared, items: [] }]);
    const section = wrapper.findComponent({ name: "ControlMeasureLayer" });

    expect(section.exists()).toBe(true);
    expect(section.props("layerMenuItems").map((item: any) => item.action)).toEqual([
      ScenarioLayerActions.Zoom,
      ScenarioLayerActions.SetActive,
      ScenarioLayerActions.Edit,
      ScenarioLayerActions.MoveUp,
      ScenarioLayerActions.MoveDown,
      ScenarioLayerActions.CopyAsGeoJson,
      ScenarioLayerActions.Delete,
    ]);
    expect(section.props("itemMenuItems").map((item: any) => item.action)).toEqual([
      "zoom",
      "pan",
      "moveUp",
      "moveDown",
      "delete",
      "duplicate",
      "copyAsGeoJson",
    ]);
  });

  it("keeps an unspecialized mixed layer in the feature tree", () => {
    const wrapper = mountWithLayers([
      {
        layer: overlayLayer("mixed-layer", ["g1", "cm1"]),
        items: [geometry("g1"), cm("cm1")],
      },
    ]);

    expect(wrapper.find('[data-tree-layer-id="mixed-layer"]').exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: "ControlMeasureLayer" })).toHaveLength(0);
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

  it("settles when deleting a draw's captured destination after active layer changes", () => {
    const renderFeed = { settle: vi.fn() };
    const destination = overlayLayer("cm1-layer", ["cm1"]);
    const nowActive = overlayLayer("cm2-layer", ["cm2"]);
    const wrapper = mountWithLayers(
      [
        { layer: destination, items: [cm("cm1")] },
        { layer: nowActive, items: [cm("cm2")] },
      ],
      { renderFeed, drawingDestinationLayerId: destination.id },
    );
    const layers = wrapper.findAllComponents({ name: "ControlMeasureLayer" });

    layers[0]!.vm.$emit("layer-action", destination, ScenarioLayerActions.Delete);

    expect(renderFeed.settle).toHaveBeenCalledWith("delete");
  });

  it("duplicates, reorders, and moves control measures through the real store", async () => {
    const store = useNewScenarioStore({
      id: "scenario-1",
      type: "ORBAT-mapper",
      version: "3.4.0",
      name: "Scenario",
      startTime: "2025-01-01T00:00:00Z",
      sides: [],
      events: [],
      layerStack: [
        {
          id: "feature-layer",
          kind: "overlay",
          name: "Features",
          items: [],
        },
        {
          id: "cm-a",
          kind: "overlay",
          name: "A",
          specialization: "controlMeasure",
          items: [
            {
              id: "cm-1",
              kind: "tacticalGraphic",
              graphicKind: "phase-line",
              controlPoints: [
                [10, 60],
                [11, 61],
              ],
              options: { smooth: true },
            },
            {
              id: "cm-2",
              kind: "tacticalGraphic",
              graphicKind: "phase-line",
              controlPoints: [
                [12, 62],
                [13, 63],
              ],
            },
          ],
        },
        {
          id: "cm-b",
          kind: "overlay",
          name: "B",
          specialization: "controlMeasure",
          items: [],
        },
      ],
    } as any);
    const geo = useGeo(store);
    const activeLayerId = ref("cm-a");
    const wrapper = mount(ScenarioLayersTabPanel, {
      global: {
        provide: {
          [activeLayerKey as symbol]: activeLayerId,
          [activeScenarioMapEngineKey as symbol]: shallowRef({
            map: {} as never,
            layers: { capabilities: {} },
          }),
          [activeScenarioKey as symbol]: {
            store,
            geo,
          },
        },
        stubs: {
          ChevronPanel: { template: "<div><slot name='label' /><slot /></div>" },
          DotsMenu: true,
          SplitButton: true,
          EditLayerInlineForm: true,
          ScenarioFeatureLayer: true,
        },
      },
    });
    const section = wrapper.findAllComponents({ name: "ControlMeasureLayer" })[0]!;

    section.vm.$emit("item-action", "cm-1", "duplicate");
    const duplicate = geo.layersItems.value
      .find(({ layer }) => layer.id === "cm-a")!
      .items.find((item) => item.id !== "cm-1" && item.id !== "cm-2")!;
    expect(duplicate).toMatchObject({
      kind: "tacticalGraphic",
      graphicKind: "phase-line",
      options: { smooth: true },
      _pid: "cm-a",
    });
    store.undo();
    expect(store.state.layerItemMap[duplicate.id]).toBeUndefined();

    section.vm.$emit("item-action", "cm-1", "moveDown");
    expect(geo.getLayerById("cm-a")!.items).toEqual(["cm-2", "cm-1"]);

    dragMonitor.options.onDrop({
      source: {
        data: getScenarioFeatureDragItem({
          feature: store.state.layerItemMap["cm-1"]!,
        }),
      },
      location: {
        current: {
          dropTargets: [
            {
              data: getScenarioFeatureLayerDragItem({
                layer: geo.getLayerById("cm-b")!,
              }),
            },
          ],
        },
      },
    });
    expect(store.state.layerItemMap["cm-1"]!._pid).toBe("cm-b");
    expect(geo.getLayerById("cm-b")!.items).toEqual(["cm-1"]);
    expect(geo.getLayerById("feature-layer")!.items).toEqual([]);

    store.undo();
    expect(store.state.layerItemMap["cm-1"]!._pid).toBe("cm-a");
    store.redo();
    expect(store.state.layerItemMap["cm-1"]!._pid).toBe("cm-b");

    dragMonitor.options.onDrop({
      source: {
        data: getScenarioFeatureDragItem({
          feature: store.state.layerItemMap["cm-1"]!,
        }),
      },
      location: {
        current: {
          dropTargets: [
            {
              data: getScenarioFeatureLayerDragItem({
                layer: geo.getLayerById("feature-layer")!,
              }),
            },
          ],
        },
      },
    });
    expect(store.state.layerItemMap["cm-1"]!._pid).toBe("cm-b");

    geo.updateLayer("cm-b", { locked: true });
    const lockedSection = wrapper.findAllComponents({ name: "ControlMeasureLayer" })[1]!;
    lockedSection.vm.$emit("item-action", "cm-1", "duplicate");
    lockedSection.vm.$emit("item-action", "cm-1", "moveUp");
    lockedSection.vm.$emit("item-action", "cm-1", "delete");
    expect(geo.getLayerById("cm-b")!.items).toEqual(["cm-1"]);

    activeLayerId.value = "cm-b";
    lockedSection.vm.$emit(
      "layer-action",
      geo.getLayerById("cm-b")!,
      ScenarioLayerActions.Delete,
    );
    expect(activeLayerId.value).toBe("cm-a");
    expect(geo.getLayerById("cm-b")).toBeUndefined();

    await nextTick();
    wrapper
      .findComponent({ name: "ControlMeasureLayer" })
      .vm.$emit("layer-action", geo.getLayerById("cm-a")!, ScenarioLayerActions.Delete);
    expect(activeLayerId.value).toBe("feature-layer");
  });
});
