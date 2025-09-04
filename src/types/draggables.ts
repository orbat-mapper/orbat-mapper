import type {
  NScenarioFeature,
  NScenarioLayer,
  NSide,
  NSideGroup,
  NUnit,
} from "@/types/internalModels";
import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

export type ItemState =
  | { type: "idle" }
  | { type: "dragging" }
  | { type: "drag-over"; closestEdge: Edge | null };

export const idle = { type: "idle" } as const;

const privateKey = Symbol("scenarioFeature");
const _scnFeatureLayerKey = Symbol("scenarioFeatureLayer");
const privateUnitDragKey = Symbol("unit");
const privateSideKey = Symbol("side");
const privateSideGroupKey = Symbol("sideGroup");

export type UnitDragItemSource = "orbatTree" | "breadcrumbs" | "detailsPanel";

export type ScenarioFeatureDragItem = {
  [privateKey]: boolean;
  feature: NScenarioFeature;
};

export type ScenarioFeatureLayerDragItem = {
  [_scnFeatureLayerKey]: boolean;
  layer: NScenarioLayer;
};

export type UnitDragItem = {
  [privateUnitDragKey]: boolean;
  unit: NUnit;
  source?: UnitDragItemSource;
};

export type SideGroupDragItem = {
  [privateSideGroupKey]: boolean;
  sideGroup: NSideGroup;
};

export type SideDragItem = {
  [privateSideKey]: boolean;
  side: NSide;
};

export function getSideDragItem(
  data: Omit<SideDragItem, typeof privateSideKey>,
): SideDragItem {
  return {
    [privateSideKey]: true,
    ...data,
  };
}

export function isSideDragItem(
  data: Record<string | symbol, unknown>,
): data is SideDragItem {
  return Boolean(data[privateSideKey]);
}

export function getSideGroupDragItem(
  data: Omit<SideGroupDragItem, typeof privateSideGroupKey>,
): SideGroupDragItem {
  return {
    [privateSideGroupKey]: true,
    ...data,
  };
}

export function isSideGroupDragItem(
  data: Record<string | symbol, unknown>,
): data is SideGroupDragItem {
  return Boolean(data[privateSideGroupKey]);
}

export function getUnitDragItem(
  data: Omit<UnitDragItem, typeof privateUnitDragKey>,
  source?: UnitDragItemSource,
): UnitDragItem {
  return {
    [privateUnitDragKey]: true,
    ...data,
    source,
  };
}

export function isUnitDragItem(
  data: Record<string | symbol, unknown>,
): data is UnitDragItem {
  return Boolean(data[privateUnitDragKey]);
}

export function getScenarioFeatureDragItem(
  data: Omit<ScenarioFeatureDragItem, typeof privateKey>,
): ScenarioFeatureDragItem {
  return {
    [privateKey]: true,
    ...data,
  };
}

export function isScenarioFeatureDragItem(
  data: Record<string | symbol, unknown>,
): data is ScenarioFeatureDragItem {
  return Boolean(data[privateKey]);
}

export function getScenarioFeatureLayerDragItem(
  data: Omit<ScenarioFeatureLayerDragItem, typeof _scnFeatureLayerKey>,
): ScenarioFeatureLayerDragItem {
  return {
    [_scnFeatureLayerKey]: true,
    ...data,
  };
}

export function isScenarioFeatureLayerDragItem(
  data: Record<string | symbol, unknown>,
): data is ScenarioFeatureLayerDragItem {
  return Boolean(data[_scnFeatureLayerKey]);
}
