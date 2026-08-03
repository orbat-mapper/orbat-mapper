import type { PointLike } from "maplibre-gl";
import type { Geometry } from "geojson";
import type { SnapCandidate, SnapCandidateRequest } from "@orbat-mapper/tactical-draw";
import { isUnitLayerId } from "@/geo/engines/maplibre/unitLayer";

/**
 * How far around the pointer to look for rendered units, in pixels.
 *
 * Deliberately wider than tactical-draw's 12px snap tolerance: `queryRenderedFeatures`
 * hits a unit when its *icon* intersects the box, while the engine measures against the
 * anchor coordinate. Querying wide and letting the engine reject on distance is the
 * cheap direction to be wrong in — the reverse drops units that should have snapped.
 */
const UNIT_QUERY_PADDING_PX = 24;

export type RenderedUnitFeature = {
  layer: { id: string };
  geometry: Geometry;
  properties?: Record<string, unknown> | null;
};

/**
 * The minimum of MapLibre's `Map` this needs. Narrowed so tests can hand in a plain
 * object rather than stand up a real map.
 */
export type UnitSnapMap = {
  getLayersOrder(): string[];
  queryRenderedFeatures(
    geometry: PointLike | [PointLike, PointLike],
    options?: { layers?: string[] },
  ): RenderedUnitFeature[];
};

/** Is `nativeMap` a MapLibre map? The OpenLayers map has none of this surface. */
export function isUnitSnapMap(nativeMap: unknown): nativeMap is UnitSnapMap {
  const candidate = nativeMap as UnitSnapMap | null | undefined;
  return (
    typeof candidate?.queryRenderedFeatures === "function" &&
    typeof candidate.getLayersOrder === "function"
  );
}

/**
 * Snap candidates for units rendered on the MapLibre map.
 *
 * tactical-draw only knows about graphics and their generated geometry, so units reach
 * it through `SnappingOptions.sources.external`. Candidates come from what is actually
 * rendered rather than from the scenario store: the rendered layers already encode
 * side/visibility-group filtering and the current time's positions, so a hidden unit is
 * not a snap target without this having to re-derive any of that.
 *
 * Distance filtering is left to the engine, which resolves every source against one
 * tolerance and one priority ordering.
 */
export function getUnitSnapCandidates(
  mlMap: UnitSnapMap,
  request: Pick<SnapCandidateRequest, "pixel">,
): SnapCandidate[] {
  const [x, y] = request.pixel;
  const queryBox: [PointLike, PointLike] = [
    [x - UNIT_QUERY_PADDING_PX, y - UNIT_QUERY_PADDING_PX],
    [x + UNIT_QUERY_PADDING_PX, y + UNIT_QUERY_PADDING_PX],
  ];
  let renderedFeatures: RenderedUnitFeature[];
  try {
    // Scoped to the unit layers, like `MlMapLogic`'s interactive query. Unscoped,
    // MapLibre evaluates every layer in the style — basemap and the whole tactical-draw
    // stack included — on every snap resolution, which here means every pointermove of
    // a draw. Layer ids are read off the live style per call because unit layers come
    // and go and a basemap swap rebuilds the style.
    renderedFeatures = mlMap.queryRenderedFeatures(queryBox, {
      layers: mlMap.getLayersOrder().filter(isUnitLayerId),
    });
  } catch {
    // MapLibre throws while the style is still loading. Snapping is an assist, so a
    // pass with no unit candidates is the right answer, not a failed interaction.
    return [];
  }
  const candidates: SnapCandidate[] = [];
  for (const feature of renderedFeatures) {
    if (!isUnitLayerId(feature.layer.id)) continue;
    if (feature.geometry.type !== "Point") continue;
    const unitId = feature.properties?.id;
    if (typeof unitId !== "string") continue;
    const id = `unit:${unitId}`;
    // A unit rendered into more than one layer comes back once per layer. Linear over
    // a handful of hits beats a Set allocated on every pass, most of which find none.
    if (candidates.some((candidate) => candidate.id === id)) continue;
    candidates.push({
      id,
      coordinate: feature.geometry.coordinates,
      kind: "unit",
      // Above the 0 that graphic control points and generated geometry carry: a unit
      // under the cursor is an explicit target, so it wins a tie against a line that
      // merely passes through it.
      priority: 1,
    });
  }
  return candidates;
}
