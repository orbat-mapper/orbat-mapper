import type {
  AddLayerObject,
  FilterSpecification,
  GeoJSONSource,
  Map as MlMap,
} from "maplibre-gl";
import circle from "@turf/circle";
import union from "@turf/union";
import { featureCollection } from "@turf/helpers";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import { toRgbaColor } from "@/utils/cssColor";
import type { TScenario } from "@/scenariostore";
import type { NUnit } from "@/types/internalModels";
import { convertToMetric } from "@/utils/convert";
import {
  ALWAYS_VISIBLE_UNIT_GROUP_ID,
  getUnitVisibilityGroup,
  getZoomVisibilityGroup,
  type UnitVisibilityGroup,
} from "@/geo/engines/maplibre/unitLayer";

const RANGE_RING_SOURCE_ID = "rangeRingSource";
export const RANGE_RING_FILL_LAYER_ID = "rangeRingFillLayer";
export const RANGE_RING_LINE_LAYER_ID = "rangeRingLineLayer";

const DEFAULT_STROKE = "#f43f5e";

type RingFeatureProperties = {
  id: string;
  isGroup: boolean;
  visibilityGroup: string;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
};

type RingIdProperties = {
  id: string;
  isGroup: boolean;
  visibilityGroup: string;
};

const MIN_ZOOM = 0;
const MAX_ZOOM = 24;

function getRingLayerIds(visibilityGroupId: string) {
  const suffix =
    visibilityGroupId === ALWAYS_VISIBLE_UNIT_GROUP_ID ? "" : `-${visibilityGroupId}`;
  return {
    fill: `${RANGE_RING_FILL_LAYER_ID}${suffix}`,
    line: `${RANGE_RING_LINE_LAYER_ID}${suffix}`,
  };
}

function createRangeRings(
  unit: NUnit,
  visibilityGroup: UnitVisibilityGroup,
): Feature<Polygon, RingIdProperties>[] {
  if (!unit.rangeRings?.length || !unit._state?.location) return [];
  const out: Feature<Polygon, RingIdProperties>[] = [];
  unit.rangeRings.forEach((r, i) => {
    if (r.hidden) return;
    const ring = circle(
      unit._state!.location!,
      convertToMetric(r.range, r.uom || "km") / 1000,
      {
        properties: {
          id: r.group ? r.group : `${unit.id}-${i}`,
          isGroup: !!r.group,
          visibilityGroup: visibilityGroup.id,
        },
      },
    ) as Feature<Polygon, RingIdProperties>;
    out.push(ring);
  });
  return out;
}

/**
 * Merges the rings of one range ring group. Members can have different zoom ranges,
 * so the zoom axis is split where members appear or disappear, and each interval
 * gets the union of the members visible over it. That way overlapping members never
 * render as separate polygons at the same zoom.
 */
function mergeRingGroup(
  rings: Feature<Polygon, RingIdProperties>[],
  visibilityGroups: Map<string, UnitVisibilityGroup>,
): {
  feature: Feature<Polygon | MultiPolygon, RingIdProperties>;
  group: UnitVisibilityGroup;
}[] {
  // Union the members of each unit zoom range once. Each zoom interval then only
  // combines the few already merged bucket shapes that cover it.
  type Bucket = { minzoom: number; maxzoom: number; rings: typeof rings };
  const buckets = new Map<string, Bucket>();
  for (const ring of rings) {
    const groupId = ring.properties.visibilityGroup;
    let bucket = buckets.get(groupId);
    if (!bucket) {
      const group = visibilityGroups.get(groupId);
      bucket = {
        minzoom: Math.max(group?.minzoom ?? MIN_ZOOM, MIN_ZOOM),
        maxzoom: Math.min(group?.maxzoom ?? MAX_ZOOM, MAX_ZOOM),
        rings: [],
      };
      buckets.set(groupId, bucket);
    }
    bucket.rings.push(ring);
  }

  const mergeFeatures = (
    features: Feature<Polygon | MultiPolygon, RingIdProperties>[],
    properties: RingIdProperties,
  ) =>
    features.length > 1
      ? union(featureCollection(features), { properties })
      : { ...features[0], properties };

  const bucketShapes = [...buckets.values()].flatMap((bucket) => {
    const shape = mergeFeatures(bucket.rings, bucket.rings[0].properties);
    return shape ? [{ ...bucket, shape }] : [];
  });
  const breakpoints = [
    ...new Set([
      MIN_ZOOM,
      MAX_ZOOM,
      ...bucketShapes.flatMap((b) => [b.minzoom, b.maxzoom]),
    ]),
  ].sort((a, b) => a - b);

  const out: ReturnType<typeof mergeRingGroup> = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const minzoom = breakpoints[i];
    const maxzoom = breakpoints[i + 1];
    const visible = bucketShapes
      .filter((b) => b.minzoom <= minzoom && b.maxzoom >= maxzoom)
      .map((b) => b.shape);
    if (!visible.length) continue;
    const group =
      minzoom === MIN_ZOOM && maxzoom === MAX_ZOOM
        ? { id: ALWAYS_VISIBLE_UNIT_GROUP_ID }
        : getZoomVisibilityGroup(minzoom, maxzoom);
    const feature = mergeFeatures(visible, {
      ...visible[0].properties,
      visibilityGroup: group.id,
    });
    if (feature) out.push({ feature, group });
  }
  return out;
}

export function useMaplibreRangeRings(mlMap: MlMap, activeScenario: TScenario) {
  // Playback redraws on every tick. Pushing unchanged data still reloads the source's
  // tiles, and with terrain enabled that re-renders every draped texture it covers.
  let lastSource: GeoJSONSource | undefined;
  let lastData: string | undefined;

  let ringLayersBeforeId: string | undefined;
  const ringLayerIds = new Set<string>();

  function createRingLayerSpecs(group: UnitVisibilityGroup): AddLayerObject[] {
    const ids = getRingLayerIds(group.id);
    // Rings show over the same zoom range as their unit's symbol.
    const zoomRange = {
      ...(group.minzoom !== undefined ? { minzoom: group.minzoom } : {}),
      ...(group.maxzoom !== undefined ? { maxzoom: group.maxzoom } : {}),
    };
    const filter: FilterSpecification = ["==", ["get", "visibilityGroup"], group.id];
    return [
      {
        id: ids.fill,
        type: "fill",
        source: RANGE_RING_SOURCE_ID,
        filter,
        ...zoomRange,
        paint: {
          "fill-color": ["get", "fillColor"],
        },
      },
      {
        id: ids.line,
        type: "line",
        source: RANGE_RING_SOURCE_ID,
        filter,
        ...zoomRange,
        paint: {
          "line-color": ["get", "strokeColor"],
          "line-width": ["get", "strokeWidth"],
        },
      },
    ];
  }

  function syncRingLayers(groups: Iterable<UnitVisibilityGroup> = []) {
    const desiredGroups = new Map<string, UnitVisibilityGroup>([
      [ALWAYS_VISIBLE_UNIT_GROUP_ID, { id: ALWAYS_VISIBLE_UNIT_GROUP_ID }],
    ]);
    for (const group of groups) desiredGroups.set(group.id, group);

    const desiredLayerIds = new Set<string>();
    for (const group of desiredGroups.values()) {
      for (const spec of createRingLayerSpecs(group)) {
        desiredLayerIds.add(spec.id);
        ringLayerIds.add(spec.id);
        if (!mlMap.getLayer(spec.id)) mlMap.addLayer(spec, ringLayersBeforeId);
      }
    }
    for (const layerId of ringLayerIds) {
      if (desiredLayerIds.has(layerId)) continue;
      if (mlMap.getLayer(layerId)) mlMap.removeLayer(layerId);
      ringLayerIds.delete(layerId);
    }
  }

  function setupRangeRingLayers(beforeLayerId?: string) {
    ringLayersBeforeId = beforeLayerId;
    if (!mlMap.getSource(RANGE_RING_SOURCE_ID)) {
      mlMap.addSource(RANGE_RING_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }
    syncRingLayers();
  }

  function resolveRingStyle({
    id,
    isGroup,
    visibilityGroup,
  }: RingIdProperties): RingFeatureProperties {
    let style: Record<string, any> = {};
    if (isGroup) {
      style = activeScenario.store.state.rangeRingGroupMap[id]?.style ?? {};
    } else {
      const sep = id.lastIndexOf("-");
      const unitId = id.slice(0, sep);
      const index = Number(id.slice(sep + 1));
      const unit = activeScenario.helpers.getUnitById(unitId);
      style = unit?.rangeRings?.[index]?.style ?? {};
    }
    const strokeOpacity = style["stroke-opacity"] ?? 1;
    const strokeWidth = style["stroke-width"] ?? 2;
    const strokeColor = toRgbaColor(style.stroke, strokeOpacity, DEFAULT_STROKE);
    const hasFill = style.fill != null && style.fill !== "";
    const fillOpacity = hasFill ? (style["fill-opacity"] ?? 0.5) : 0;
    const fillColor = hasFill
      ? toRgbaColor(style.fill, fillOpacity, DEFAULT_STROKE)
      : "rgba(0, 0, 0, 0)";
    return { id, isGroup, visibilityGroup, strokeColor, strokeWidth, fillColor };
  }

  function drawRangeRings() {
    const source = mlMap.getSource(RANGE_RING_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    const visibilityGroups = new Map<string, UnitVisibilityGroup>();
    const rings = activeScenario.geo.everyVisibleUnit.value
      .filter((u) => u.rangeRings?.length)
      .flatMap((unit) => {
        const visibilityGroup = getUnitVisibilityGroup(unit);
        visibilityGroups.set(visibilityGroup.id, visibilityGroup);
        return createRangeRings(unit, visibilityGroup);
      });

    const layerGroups = new Map<string, UnitVisibilityGroup>();
    const ungrouped: Feature<Polygon, RingIdProperties>[] = [];
    const ringGroups = new Map<string, Feature<Polygon, RingIdProperties>[]>();
    for (const ring of rings) {
      if (ring.properties.isGroup) {
        const members = ringGroups.get(ring.properties.id) ?? [];
        members.push(ring);
        ringGroups.set(ring.properties.id, members);
      } else {
        ungrouped.push(ring);
        const group = visibilityGroups.get(ring.properties.visibilityGroup)!;
        layerGroups.set(group.id, group);
      }
    }

    const merged: Feature<Polygon | MultiPolygon, RingIdProperties>[] = [];
    for (const members of ringGroups.values()) {
      for (const { feature, group } of mergeRingGroup(members, visibilityGroups)) {
        merged.push(feature);
        layerGroups.set(group.id, group);
      }
    }
    syncRingLayers(layerGroups.values());

    const features: Feature<Polygon | MultiPolygon, RingFeatureProperties>[] = [
      ...merged,
      ...ungrouped,
    ].map((f) => ({
      ...f,
      properties: resolveRingStyle(f.properties),
    }));

    const data = JSON.stringify(features);
    // A basemap swap replaces the source, which must be filled again.
    if (source === lastSource && data === lastData) return;
    lastSource = source;
    lastData = data;
    source.setData({ type: "FeatureCollection", features });
  }

  return { setupRangeRingLayers, drawRangeRings };
}
