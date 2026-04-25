import Feature from "ol/Feature";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import GeoJSON from "ol/format/GeoJSON";
import { add as addCoordinate } from "ol/coordinate";
import { getLength } from "ol/sphere";
import { toLonLat } from "ol/proj";
import { point } from "@turf/helpers";
import type { Geometry } from "geojson";
import type VectorLayer from "ol/layer/Vector";
import { nanoid } from "@/utils";
import { isCircle } from "@/composables/openlayersHelpers";
import type { TScenario } from "@/scenariostore";
import type { FeatureId } from "@/types/scenarioGeoModels";
import type { GeometryLayerItem } from "@/types/scenarioLayerItems";
import type { SimpleStyleSpec } from "@/geo/simplestyle";

interface DrawTargetLayer {
  id: FeatureId;
  items: FeatureId[];
}

export function convertOlFeatureToScenarioFeature(olFeature: Feature): GeometryLayerItem {
  if (isCircle(olFeature)) {
    const circle = olFeature.getGeometry() as Circle;
    const { geometry, properties = {} } = olFeature.getProperties();
    const center = circle.getCenter();
    const r = addCoordinate([...center], [0, circle.getRadius()]);

    return {
      kind: "geometry",
      id: String(olFeature.getId() || nanoid()),
      geometry: point(toLonLat(circle.getCenter())).geometry,
      geometryMeta: {
        geometryKind: "Circle",
        radius: getLength(new LineString([center, r])),
      },
      userData: properties,
      style: {},
    };
  }

  const gj = new GeoJSON({ featureProjection: "EPSG:3857" }).writeFeatureObject(
    olFeature,
  );

  return {
    kind: "geometry",
    id: String(gj.id ?? nanoid()),
    geometry: gj.geometry,
    userData: gj.properties ?? {},
    style: {},
    geometryMeta: { geometryKind: gj.geometry.type },
  };
}

export function getActiveDrawLayer(
  scenario: TScenario,
  activeLayerId?: FeatureId | null,
): DrawTargetLayer | undefined {
  if (activeLayerId) {
    const activeLayer = scenario.geo.getLayerById(activeLayerId);
    if (activeLayer) return activeLayer as DrawTargetLayer;
  }
  const firstLayer = scenario.geo.layerItemsLayers.value?.[0];
  return firstLayer
    ? {
        id: firstLayer.id,
        items: firstLayer.items.map((item) =>
          typeof item === "string" ? item : item.id,
        ),
      }
    : undefined;
}

export function addScenarioDrawFeature(
  scenario: TScenario,
  feature: GeometryLayerItem,
  activeLayerId?: FeatureId | null,
  style: Partial<SimpleStyleSpec> = {},
): GeometryLayerItem | undefined {
  const scenarioLayer = getActiveDrawLayer(scenario, activeLayerId);
  if (!scenarioLayer) return;

  const { layerItem: lastFeatureInLayer } = scenario.geo.getGeometryLayerItemById(
    scenarioLayer.items[scenarioLayer.items.length - 1],
  );

  const zIndex = Math.max(
    scenarioLayer.items.length,
    (lastFeatureInLayer?._zIndex || 0) + 1,
  );
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

export function addOlDrawFeature(
  scenario: TScenario,
  olFeature: Feature,
  olLayer: VectorLayer<any>,
  style: Partial<SimpleStyleSpec> = {},
): GeometryLayerItem | undefined {
  if (!olFeature.getId()) olFeature.setId(nanoid());
  const scenarioFeature = convertOlFeatureToScenarioFeature(olFeature);
  const addedFeature = addScenarioDrawFeature(
    scenario,
    scenarioFeature,
    olLayer.get("id"),
    style,
  );
  if (addedFeature) {
    olFeature.set("_zIndex", addedFeature._zIndex);
  }
  return addedFeature;
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

export function updateScenarioFeatureGeometryFromOlFeature(
  scenario: TScenario,
  olFeature: Feature,
  updateState = false,
) {
  const converted = convertOlFeatureToScenarioFeature(olFeature);
  const id = olFeature.getId();
  if (!id) return;
  updateScenarioFeatureGeometry(
    scenario,
    String(id),
    converted.geometry,
    converted.geometryMeta,
    converted.userData,
    updateState,
    { noEmit: true },
  );
}
