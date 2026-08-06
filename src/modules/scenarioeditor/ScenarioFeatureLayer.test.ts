// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { activeScenarioKey } from "@/components/injects";
import ScenarioFeatureLayer from "@/modules/scenarioeditor/ScenarioFeatureLayer.vue";
import {
  getScenarioFeatureDragItem,
  getScenarioFeatureLayerDragItem,
} from "@/types/draggables";
import type { NScenarioLayer, NScenarioLayerItem } from "@/types/internalModels";
import type { NScenarioOverlayLayer } from "@/types/scenarioStackLayers";

type DndTargetOptions = {
  canDrop: (args: { source: { data: Record<string | symbol, unknown> } }) => boolean;
};

const dnd = vi.hoisted(() => ({ targetOptions: null as DndTargetOptions | null }));

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  draggable: () => () => {},
  dropTargetForElements: (options: DndTargetOptions) => {
    dnd.targetOptions = options;
    return () => {};
  },
}));

vi.mock("@atlaskit/pragmatic-drag-and-drop/combine", () => ({
  combine: (...cleanups: Array<() => void>) => () =>
    cleanups.forEach((cleanup) => cleanup()),
}));

vi.mock("@/stores/selectedStore", () => ({
  useSelectedItems: () => ({
    selectedFeatureIds: new Set<string>(),
    activeFeatureId: null,
  }),
}));

function layer(id: string): NScenarioLayer {
  return {
    id,
    kind: "overlay",
    name: id,
    items: [],
    _isOpen: true,
  } as NScenarioLayer;
}

function controlMeasure(id: string): NScenarioLayerItem {
  return {
    id,
    kind: "tacticalGraphic",
    graphicKind: "boundary",
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    _pid: "control-measure-layer",
  } as unknown as NScenarioLayerItem;
}

function mountLayer() {
  const ordinaryLayer = layer("ordinary-layer");
  mount(ScenarioFeatureLayer, {
    props: {
      layer: ordinaryLayer,
      features: [],
    },
    global: {
      provide: {
        [activeScenarioKey as symbol]: {
          geo: {
            getLayerById: vi.fn(() => ({ locked: false })),
          },
        },
      },
      stubs: {
        ChevronPanel: { template: "<div><slot name='label' /><slot /></div>" },
        DotsMenu: true,
        EditLayerInlineForm: true,
      },
    },
  });
  return ordinaryLayer;
}

describe("ScenarioFeatureLayer drag targets", () => {
  it("does not advertise an ordinary layer as a target for control measures", () => {
    mountLayer();

    expect(
      dnd.targetOptions!.canDrop({
        source: { data: getScenarioFeatureDragItem({ feature: controlMeasure("cm-1") }) },
      }),
    ).toBe(false);
  });

  it("does not advertise an ordinary layer as a target for control-measure layers", () => {
    mountLayer();

    expect(
      dnd.targetOptions!.canDrop({
        source: {
          data: getScenarioFeatureLayerDragItem({
            layer: {
              ...layer("control-measure-layer"),
              specialization: "controlMeasure",
            } as NScenarioOverlayLayer,
          }),
        },
      }),
    ).toBe(false);
  });
});
