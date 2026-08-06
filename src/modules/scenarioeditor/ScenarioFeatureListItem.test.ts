// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { activeScenarioKey } from "@/components/injects";
import ScenarioFeatureListItem from "@/modules/scenarioeditor/ScenarioFeatureListItem.vue";
import {
  getScenarioFeatureDragItem,
  type ScenarioFeatureDragItem,
} from "@/types/draggables";
import type { NGeometryLayerItem } from "@/types/internalModels";

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

function geometry(id: string): NGeometryLayerItem {
  return {
    id,
    kind: "geometry",
    _pid: "ordinary-layer",
    geometry: { type: "Point", coordinates: [10, 60] },
    geometryMeta: { geometryKind: "Point" },
    style: {},
  } as NGeometryLayerItem;
}

function controlMeasure(id: string): ScenarioFeatureDragItem["feature"] {
  return {
    id,
    kind: "tacticalGraphic",
    graphicKind: "boundary",
    controlPoints: [
      [10, 60],
      [11, 61],
    ],
    _pid: "control-measure-layer",
  } as ScenarioFeatureDragItem["feature"];
}

function mountItem() {
  return mount(ScenarioFeatureListItem, {
    props: {
      feature: geometry("geometry-1"),
      layer: { id: "ordinary-layer", isHidden: false },
    },
    global: {
      provide: {
        [activeScenarioKey as symbol]: { geo: {} },
      },
      stubs: {
        DotsMenu: true,
      },
    },
  });
}

describe("ScenarioFeatureListItem drag targets", () => {
  it("does not advertise a geometry item as a target for control measures", () => {
    mountItem();

    expect(
      dnd.targetOptions!.canDrop({
        source: {
          data: getScenarioFeatureDragItem({ feature: controlMeasure("cm-1") }),
        },
      }),
    ).toBe(false);
  });
});
