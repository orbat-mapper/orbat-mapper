import type { Geometry } from "geojson";
import { nanoid } from "@/utils";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import type { SimpleStyleSpec } from "@/geo/simplestyle";

interface DrawTargetLayer {
  id: FeatureId;
  items: FeatureId[];
}

function toDrawTargetLayer(layer: { id: FeatureId; items: unknown[] }): DrawTargetLayer {
  return {
    id: layer.id,
    items: layer.items.map((item) =>
      typeof item === "string" ? item : (item as { id: FeatureId }).id,
    ),
  };
}

export function getActiveDrawLayer(
  scenario: TScenario,
  activeLayerId?: FeatureId | null,
): DrawTargetLayer | undefined {
  if (activeLayerId) {
    const activeLayer = scenario.geo.getLayerById(activeLayerId);
    if (activeLayer && "items" in activeLayer) {
      return toDrawTargetLayer(activeLayer as { id: FeatureId; items: unknown[] });
    }
  }
  const firstLayer = scenario.geo.layerItemsLayers.value?.[0];
  return firstLayer ? toDrawTargetLayer(firstLayer) : undefined;
}

export function addScenarioDrawFeature(
  scenario: TScenario,
  feature: GeometryLayerItem,
  activeLayerId?: FeatureId | null,
  style: Partial<SimpleStyleSpec> = {},
): GeometryLayerItem | undefined {
  const scenarioLayer = getActiveDrawLayer(scenario, activeLayerId);
  if (!scenarioLayer) return;

  const lastItemId = scenarioLayer.items[scenarioLayer.items.length - 1];
  const lastFeatureInLayer = lastItemId
    ? scenario.geo.getGeometryLayerItemById(lastItemId).layerItem
    : undefined;

  const zIndex =
    scenarioLayer.items.length === 0
      ? 0
      : Math.max(scenarioLayer.items.length, (lastFeatureInLayer?._zIndex ?? -1) + 1);
  const scenarioFeature: GeometryLayerItem = {
    ...feature,
    id: feature.id || nanoid(),
    name: feature.name ?? `${feature.geometryMeta.geometryKind} ${zIndex + 1}`,
    _zIndex: zIndex,
    style,
  };

  scenario.geo.addFeature(scenarioFeature, scenarioLayer.id);
  return scenarioFeature;
}

/** The name a lazily created feature layer is given. */
export const FEATURE_LAYER_NAME = "Features";

/**
 * Add a drawn feature to a new feature layer. The layer and the feature are one undo
 * step, so undoing the first drawn feature leaves no empty layer behind.
 */
export function addScenarioDrawFeatureToNewLayer(
  scenario: TScenario,
  feature: GeometryLayerItem,
  style: Partial<SimpleStyleSpec> = {},
): GeometryLayerItem | undefined {
  const featureWithId = { ...feature, id: feature.id || nanoid() };
  let added: GeometryLayerItem | undefined;
  scenario.store.groupUpdate(
    () => {
      const layer = scenario.geo.addLayer({
        id: nanoid(),
        name: FEATURE_LAYER_NAME,
        items: [],
        _isNew: false,
      });
      if (!layer) return;
      added = addScenarioDrawFeature(scenario, featureWithId, layer.id, style);
    },
    { label: "addFeature", value: featureWithId.id },
  );
  return added;
}

export function updateScenarioFeatureGeometry(
  scenario: TScenario,
  featureId: FeatureId,
  geometry: Geometry,
  geometryMeta: Partial<GeometryLayerItem["geometryMeta"]> = {},
  userData: Record<string, unknown> = {},
  updateState = false,
  options: { noEmit?: boolean } = {},
) {
  const { layerItem: feature } = scenario.geo.getGeometryLayerItemById(featureId) || {};
  if (!feature) return;

  if (updateState) {
    scenario.geo.addFeatureStateGeometry(featureId, geometry);
    return;
  }

  scenario.geo.updateFeature(
    featureId,
    {
      geometryMeta: { ...feature.geometryMeta, ...geometryMeta },
      userData: { ...(feature.userData ?? {}), ...userData },
      geometry,
    },
    { noEmit: options.noEmit ?? true },
  );
}
