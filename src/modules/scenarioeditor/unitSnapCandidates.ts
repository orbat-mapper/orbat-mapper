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

type RenderedUnitFeature = {
  layer?: { id?: string | undefined };
  geometry?: Geometry | undefined;
  properties?: Record<string, unknown> | null;
};

/**
 * The minimum of MapLibre's `Map` this needs. Narrowed so tests can hand in a plain
 * object, and so the OpenLayers native map is a type error rather than a runtime one.
 */
export type UnitSnapMap = {
  queryRenderedFeatures(
    geometry: PointLike | [PointLike, PointLike],
  ): RenderedUnitFeature[];
};

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
    renderedFeatures = mlMap.queryRenderedFeatures(queryBox);
  } catch {
    // MapLibre throws while the style is still loading. Snapping is an assist, so a
    // pass with no unit candidates is the right answer, not a failed interaction.
    return [];
  }
  const candidates: SnapCandidate[] = [];
  const seen = new Set<string>();
  for (const feature of renderedFeatures) {
    if (!isUnitLayerId(feature.layer?.id)) continue;
    if (feature.geometry?.type !== "Point") continue;
    const unitId = feature.properties?.id;
    if (typeof unitId !== "string" || seen.has(unitId)) continue;
    seen.add(unitId);
    candidates.push({
      id: `unit:${unitId}`,
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
