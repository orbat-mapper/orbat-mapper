import type {
  AddLayerObject,
  FilterSpecification,
  GeoJSONSource,
  Map as MlMap,
} from "maplibre-gl";
import bbox from "@turf/bbox";
import circle from "@turf/circle";
import { union, type MultiPolygon as ClipMultiPolygon } from "polygon-clipping";
import type { BBox, Feature, MultiPolygon, Polygon } from "geojson";
import { toRgbaColor } from "@/utils/cssColor";
import type { TScenario } from "@/scenariostore";
import type { NRangeRingGroup, NUnit } from "@/types/internalModels";
import type {
  RangeRing,
  RangeRingStyle,
  RangeRingVisibility,
} from "@/types/scenarioGeoModels";
import { convertToMetric } from "@/utils/convert";
import { isShallowEqual } from "@/utils/objects";
import {
  ALWAYS_VISIBLE_UNIT_GROUP_ID,
  getUnitVisibilityGroup,
  getZoomVisibilityGroup,
  type UnitVisibilityGroup,
} from "@/geo/engines/maplibre/unitLayer";

const RANGE_RING_SOURCE_ID = "rangeRingSource";
export const RANGE_RING_FILL_LAYER_ID = "rangeRingFillLayer";
export const RANGE_RING_LINE_LAYER_ID = "rangeRingLineLayer";

export const DEFAULT_RANGE_RING_STROKE = "#f43f5e";

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

type RingStyledFeature = Feature<
  Polygon | MultiPolygon,
  // A stable feature id, so playback can send MapLibre a diff instead of all rings.
  RingFeatureProperties & { key: string }
>;
type CachedGroup = {
  signature: string;
  parts: ReturnType<typeof mergeRingGroup>;
};

const MIN_ZOOM = 0;
const MAX_ZOOM = 24;

/** Map colors for a ring style. A ring is only filled when it has a fill color. */
export function resolveRingColors(style: Partial<RangeRingStyle>) {
  const strokeColor = toRgbaColor(
    style.stroke,
    style["stroke-opacity"] ?? 1,
    DEFAULT_RANGE_RING_STROKE,
  );
  const strokeWidth = style["stroke-width"] ?? 2;
  const fillColor = style.fill
    ? toRgbaColor(style.fill, style["fill-opacity"] ?? 0.5, DEFAULT_RANGE_RING_STROKE)
    : "rgba(0, 0, 0, 0)";
  return { strokeColor, strokeWidth, fillColor };
}

export function isRangeRingLayerId(layerId: string) {
  return (
    layerId.startsWith(RANGE_RING_FILL_LAYER_ID) ||
    layerId.startsWith(RANGE_RING_LINE_LAYER_ID)
  );
}

function getRingLayerIds(visibilityGroupId: string) {
  const suffix =
    visibilityGroupId === ALWAYS_VISIBLE_UNIT_GROUP_ID ? "" : `-${visibilityGroupId}`;
  return {
    fill: `${RANGE_RING_FILL_LAYER_ID}${suffix}`,
    line: `${RANGE_RING_LINE_LAYER_ID}${suffix}`,
  };
}

/**
 * A ring is drawn only when it, its group (or the ungrouped rings) and range rings as
 * a whole are all shown.
 */
export function isRangeRingHidden(
  ring: RangeRing,
  groupMap: Record<string, NRangeRingGroup>,
  visibility: RangeRingVisibility | undefined,
) {
  if (ring.hidden || visibility?.hidden) return true;
  return ring.group ? !!groupMap[ring.group]?.hidden : !!visibility?.ungroupedHidden;
}

type RingFeature = Feature<Polygon, RingIdProperties>;
type CachedRing = { key: string; signature: string; feature: RingFeature };

function createRangeRings(
  unit: NUnit,
  visibilityGroup: UnitVisibilityGroup,
  isHidden: (ring: RangeRing) => boolean,
  previous: Map<string, CachedRing>,
): CachedRing[] {
  const location = unit._state?.location;
  if (!unit.rangeRings?.length || !location) return [];
  const out: CachedRing[] = [];
  unit.rangeRings.forEach((r, i) => {
    if (isHidden(r)) return;
    const key = `${unit.id}-${i}`;
    const radius = convertToMetric(r.range, r.uom || "km") / 1000;
    const id = r.group ? r.group : key;
    const signature = `${location[0]},${location[1]},${radius},${id},${visibilityGroup.id}`;
    // Most units stand still during playback, so their rings are reused as is.
    let cached = previous.get(key);
    if (cached?.signature !== signature) {
      const feature = circle(location, radius, {
        properties: { id, isGroup: !!r.group, visibilityGroup: visibilityGroup.id },
      }) as RingFeature;
      cached = { key, signature, feature };
    }
    out.push(cached);
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
  rings: RingFeature[],
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

  const bucketShapes = [...buckets.values()].map((bucket) => ({
    ...bucket,
    shape: mergeShapes(bucket.rings, bucket.rings[0].properties),
  }));
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
    const feature = mergeShapes(visible, {
      ...visible[0].properties,
      visibilityGroup: group.id,
    });
    out.push({ feature, group });
  }
  return out;
}

type RingShape = Feature<Polygon | MultiPolygon, RingIdProperties>;

function bboxesOverlap(a: BBox, b: BBox) {
  return a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
}

/**
 * Merges shapes into one feature. A union is costly and playback runs it on every tick
 * a member moves, so only shapes whose bounding boxes touch are unioned. The others
 * cannot overlap and stay separate polygons of the result.
 */
function mergeShapes(shapes: RingShape[], properties: RingIdProperties): RingShape {
  if (shapes.length === 1) return { ...shapes[0], properties };
  const clusters: { box: BBox; polygons: ClipMultiPolygon }[] = [];
  for (const shape of shapes) {
    let box = bbox(shape);
    const { geometry } = shape;
    let polygons = (
      geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
    ) as ClipMultiPolygon;
    let overlapping = 0;
    // Merging clusters grows the box, which can then touch clusters already passed.
    do {
      overlapping = 0;
      for (let i = clusters.length - 1; i >= 0; i--) {
        const cluster = clusters[i];
        if (!bboxesOverlap(box, cluster.box)) continue;
        box = [
          Math.min(box[0], cluster.box[0]),
          Math.min(box[1], cluster.box[1]),
          Math.max(box[2], cluster.box[2]),
          Math.max(box[3], cluster.box[3]),
        ];
        polygons = union(polygons, cluster.polygons);
        clusters.splice(i, 1);
        overlapping++;
      }
    } while (overlapping);
    clusters.push({ box, polygons });
  }
  const polygons = clusters.flatMap((cluster) => cluster.polygons);
  return {
    type: "Feature",
    geometry:
      polygons.length === 1
        ? { type: "Polygon", coordinates: polygons[0] }
        : { type: "MultiPolygon", coordinates: polygons },
    properties,
  };
}

export function useMaplibreRangeRings(mlMap: MlMap, activeScenario: TScenario) {
  // Playback redraws on every tick. setData reloads every tile of the source, and with
  // terrain enabled each reloaded tile re-renders the draped texture it covers. Only
  // the rings that changed are sent with updateData, so MapLibre reloads only the
  // tiles they touch.
  let lastSource: GeoJSONSource | undefined;
  let pushedFeatures = new Map<string, RingStyledFeature>();
  let ringCache = new Map<string, CachedRing>();
  let groupCache = new Map<string, CachedGroup>();

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

  /**
   * Where a new ring layer goes: just above the topmost ring layer already in the
   * style, so the rings stay together wherever the scenario layer controller has
   * moved them. Before any exist, below `ringLayersBeforeId`.
   */
  function getNewRingLayerBeforeId() {
    const layerOrder = mlMap.getLayersOrder();
    let lastRingIndex = -1;
    layerOrder.forEach((id, index) => {
      if (ringLayerIds.has(id)) lastRingIndex = index;
    });
    if (lastRingIndex === -1) return ringLayersBeforeId;
    return layerOrder[lastRingIndex + 1];
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
        if (!mlMap.getLayer(spec.id)) mlMap.addLayer(spec, getNewRingLayerBeforeId());
        ringLayerIds.add(spec.id);
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
        promoteId: "key",
      });
    }
    syncRingLayers();
  }

  function resolveRingStyle({
    id,
    isGroup,
    visibilityGroup,
  }: RingIdProperties): RingFeatureProperties {
    let style: Partial<RangeRingStyle> = {};
    if (isGroup) {
      style = activeScenario.store.state.rangeRingGroupMap[id]?.style ?? {};
    } else {
      const sep = id.lastIndexOf("-");
      const unitId = id.slice(0, sep);
      const index = Number(id.slice(sep + 1));
      const unit = activeScenario.helpers.getUnitById(unitId);
      style = unit?.rangeRings?.[index]?.style ?? {};
    }
    return { id, isGroup, visibilityGroup, ...resolveRingColors(style) };
  }

  function toStyledFeature(
    key: string,
    feature: Feature<Polygon | MultiPolygon, RingIdProperties>,
  ): RingStyledFeature {
    const properties = { key, ...resolveRingStyle(feature.properties) };
    const previous = pushedFeatures.get(key);
    if (
      previous?.geometry === feature.geometry &&
      isShallowEqual(previous.properties, properties)
    ) {
      return previous;
    }
    return { type: "Feature", geometry: feature.geometry, properties };
  }

  function drawRangeRings() {
    const source = mlMap.getSource(RANGE_RING_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    const { rangeRingGroupMap, rangeRingVisibility } = activeScenario.store.state;
    const isHidden = (ring: RangeRing) =>
      isRangeRingHidden(ring, rangeRingGroupMap, rangeRingVisibility);
    const visibilityGroups = new Map<string, UnitVisibilityGroup>();
    const rings = activeScenario.geo.everyVisibleUnit.value
      .filter((u) => u.rangeRings?.length)
      .flatMap((unit) => {
        const visibilityGroup = getUnitVisibilityGroup(unit);
        visibilityGroups.set(visibilityGroup.id, visibilityGroup);
        return createRangeRings(unit, visibilityGroup, isHidden, ringCache);
      });
    ringCache = new Map(rings.map((r) => [r.key, r]));

    const layerGroups = new Map<string, UnitVisibilityGroup>();
    const features: RingStyledFeature[] = [];
    const ungrouped: [string, RingFeature][] = [];
    const ringGroups = new Map<string, CachedRing[]>();
    for (const cached of rings) {
      const { properties } = cached.feature;
      if (properties.isGroup) {
        const members = ringGroups.get(properties.id) ?? [];
        members.push(cached);
        ringGroups.set(properties.id, members);
      } else {
        ungrouped.push([`ring:${cached.key}`, cached.feature]);
        const group = visibilityGroups.get(properties.visibilityGroup)!;
        layerGroups.set(group.id, group);
      }
    }

    const nextGroupCache = new Map<string, CachedGroup>();
    for (const [groupId, members] of ringGroups) {
      // Unions are costly, so a group is merged again only when a member changed.
      const signature = members.map((m) => m.signature).join(";");
      let cached = groupCache.get(groupId);
      if (cached?.signature !== signature) {
        cached = {
          signature,
          parts: mergeRingGroup(
            members.map((m) => m.feature),
            visibilityGroups,
          ),
        };
      }
      nextGroupCache.set(groupId, cached);
      for (const { feature, group } of cached.parts) {
        features.push(toStyledFeature(`group:${groupId}@${group.id}`, feature));
        layerGroups.set(group.id, group);
      }
    }
    groupCache = nextGroupCache;
    for (const [key, feature] of ungrouped) {
      features.push(toStyledFeature(key, feature));
    }
    syncRingLayers(layerGroups.values());

    const nextPushed = new Map(features.map((f) => [f.properties.key, f]));
    if (source !== lastSource) {
      // A basemap swap replaces the source, which must be filled again.
      source.setData({ type: "FeatureCollection", features });
    } else {
      const add = features.filter((f) => pushedFeatures.get(f.properties.key) !== f);
      const remove = [...pushedFeatures.keys()].filter((key) => !nextPushed.has(key));
      if (add.length || remove.length) source.updateData({ add, remove });
    }
    lastSource = source;
    pushedFeatures = nextPushed;
  }

  return { setupRangeRingLayers, drawRangeRings };
}
