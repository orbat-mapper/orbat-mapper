import type { Position } from "geojson";
import destination from "@turf/destination";
import {
  getControlMeasureMetadata,
  project,
  unproject,
  type ControlMeasureKind,
} from "@orbat-mapper/control-measures";

/**
 * MSS control points follow the MIL-STD-2525C anchor rules (Appendix B), and
 * the control measures package follows 2525E. The two agree point for point,
 * except where 2525C also allows a three-point form that 2525E dropped, and
 * for the free-format shapes, which MSS constructs its own way.
 */
const lerp = (a: Position, b: Position, t: number): Position => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

/** 2525C, three points: the vertex at the supported unit, then both arrow
 *  tips. 2525E Line26: tip, the two ends of the opening around the unit, tip. */
function securityTask(points: Position[]): Position[] {
  if (points.length !== 3) return points;
  const [origin, first, second] = points;
  return [first, lerp(origin, first, 0.2), lerp(origin, second, 0.2), second];
}

/** 2525C, three points: circle center, arrow tip, and a point on the side the
 *  arc bulges toward. 2525E Line27: circle center, a point on the circle where
 *  the arc starts, the arc midpoint, arrow tip. */
function seize(points: Position[]): Position[] {
  if (points.length !== 3) return points;
  const [center, tip, bulge] = points;
  const radius = 0.15 * Math.hypot(tip[0] - center[0], tip[1] - center[1]);
  const length = Math.hypot(bulge[0] - center[0], bulge[1] - center[1]) || 1;
  const start = lerp(center, bulge, radius / length);
  return [center, start, bulge, tip];
}

/** MSS rectangles are a center and the two half-axis ends; the package takes
 *  three adjacent corners. */
function rectangle(points: Position[]): Position[] {
  if (points.length !== 3) return points;
  const [center, first, second] = points.map((point) => project(point[0], point[1]));
  const [cx, cy] = center;
  const [ux, uy, vx, vy] = [first[0] - cx, first[1] - cy, second[0] - cx, second[1] - cy];
  return [
    [cx - ux - vx, cy - uy - vy],
    [cx + ux - vx, cy + uy - vy],
    [cx + ux + vx, cy + uy + vy],
  ].map(([x, y]) => unproject(x, y));
}

/** MSS circles are a center and a `Radius` in meters; the package takes a
 *  point on the circle, here due east. */
function circle(
  points: Position[],
  { Radius: radius }: Record<string, number>,
): Position[] {
  if (points.length !== 1 || !radius || radius <= 0) return points;
  return [points[0], destination(points[0], radius / 1000, 90).geometry.coordinates];
}

/** MSS closes polygon rings by repeating the first vertex; the package does not. */
function openRing(ring: Position[]): Position[] {
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (ring.length > 1 && first[0] === last[0] && first[1] === last[1])
    return ring.slice(0, -1);
  return ring;
}

type Adapter = (
  points: Position[],
  locationAttributes: Record<string, number>,
) => Position[];

const ADAPTERS: Partial<Record<ControlMeasureKind, Adapter>> = {
  cover: securityTask,
  guard: securityTask,
  screen: securityTask,
  seize,
  polygon: openRing,
  rectangle,
  circle,
};

/** The package's control points for MSS control points, or null when the
 *  count does not fit the kind's anchor contract. */
export function adaptAnchors(
  kind: ControlMeasureKind,
  points: Position[],
  locationAttributes: Record<string, number> = {},
): Position[] | null {
  const metadata = getControlMeasureMetadata(kind);
  let result = ADAPTERS[kind]?.(points, locationAttributes) ?? points;
  if (result.length < (metadata.minCoordinates ?? 1) && metadata.rule?.derive)
    result = metadata.rule.derive(result);
  const fits =
    result.length >= (metadata.minCoordinates ?? 1) &&
    (metadata.maxCoordinates === undefined || result.length <= metadata.maxCoordinates);
  return fits ? result : null;
}
