import type { MultiPolygon, Position } from "geojson";
import { gridAxes, type DemGrid } from "./grid";
import { Visibility } from "./viewshed";

/** A point in doubled grid space: cell centres at even coordinates, so every
 *  edge midpoint the contour passes through is an integer. */
type Point = [number, number];

/** A square's corners, clockwise from the top left, and its edges, clockwise
 *  from the top; edge i runs from corner i to corner i + 1. */
const CORNERS: Point[] = [
  [0, 0],
  [2, 0],
  [2, 2],
  [0, 2],
];
const MIDPOINTS: Point[] = [
  [1, 0],
  [2, 1],
  [1, 2],
  [0, 1],
];

/**
 * The segments of each of the 16 marching-squares cases, as [from, to] edge
 * pairs, oriented so the visible side is on the left (a positive cross product
 * in y-down space): every crossing then has exactly one way out. A saddle cuts
 * off each visible corner on its own. Bit i of the case is corner i.
 */
const SEGMENTS: [number, number][][] = Array.from({ length: 16 }, (_, index) => {
  const seen = (corner: number) => (index >> corner) & 1;
  const oriented = (from: number, to: number, inside: number): [number, number] => {
    const [fx, fy] = MIDPOINTS[from]!;
    const [tx, ty] = MIDPOINTS[to]!;
    const [ix, iy] = CORNERS[inside]!;
    return (tx - fx) * (iy - fy) - (ty - fy) * (ix - fx) > 0 ? [from, to] : [to, from];
  };
  const crossed = [0, 1, 2, 3].filter((edge) => seen(edge) !== seen((edge + 1) % 4));
  if (crossed.length === 2) {
    const [first, second] = crossed as [number, number];
    const inside = seen(first) ? first : (first + 1) % 4;
    return [oriented(first, second, inside)];
  }
  if (crossed.length === 4)
    // Corner c touches edges c - 1 and c.
    return [0, 1, 2, 3]
      .filter((corner) => seen(corner))
      .map((corner) => oriented((corner + 3) % 4, corner, corner));
  return [];
});

/** Twice the signed shoelace area, in doubled grid space (y down). */
function shoelace(ring: Point[]) {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]!;
    const [x2, y2] = ring[(i + 1) % ring.length]!;
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
}

/** Drops vertices in the middle of a straight run. Exact, as the points are
 *  integers. */
function dropCollinear(ring: Point[]): Point[] {
  return ring.filter((point, i) => {
    const [ax, ay] = ring[(i + ring.length - 1) % ring.length]!;
    const [cx, cy] = ring[(i + 1) % ring.length]!;
    return (point[0] - ax) * (cy - point[1]) !== (point[1] - ay) * (cx - point[0]);
  });
}

function contains(ring: Point[], [x, y]: Point) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

type Box = [minX: number, minY: number, maxX: number, maxY: number];

function boxOf(ring: Point[]): Box {
  const box: Box = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of ring) {
    box[0] = Math.min(box[0], x);
    box[1] = Math.min(box[1], y);
    box[2] = Math.max(box[2], x);
    box[3] = Math.max(box[3], y);
  }
  return box;
}

/**
 * The outline of the visible cells of a viewshed mask, as GeoJSON: one polygon
 * per connected visible area, with a hole for each unseen pocket inside it.
 * Exterior rings run counterclockwise and holes clockwise (RFC 7946).
 *
 * Marching squares over the cell centres, with no data counted as unseen. The
 * contour crosses each edge between a visible and an unseen cell at its
 * midpoint, so corners are cut at 45° rather than drawn as stairs. Cells that
 * touch only at a corner stay apart.
 */
export function maskToPolygons(grid: DemGrid, mask: Uint8Array): MultiPolygon {
  const { width, height } = grid;
  // Points as integer keys; padded by one cell so every contour closes.
  const stride = 2 * width + 4;
  const key = (x: number, y: number) => (y + 2) * stride + x + 2;
  const pointOf = (k: number): Point => [(k % stride) - 2, Math.floor(k / stride) - 2];

  /** Whether each cell of a row is seen, at index column + 1. */
  const rowOf = (row: number, into: Uint8Array<ArrayBuffer>) => {
    into.fill(0);
    if (row < 0 || row >= height) return into;
    for (let column = 0; column < width; column++)
      into[column + 1] = mask[row * width + column] === Visibility.Visible ? 1 : 0;
    return into;
  };
  let above = rowOf(-1, new Uint8Array(width + 2));
  let below = new Uint8Array(width + 2);
  const next = new Map<number, number>();
  for (let row = -1; row < height; row++) {
    below = rowOf(row + 1, below);
    for (let column = -1; column < width; column++) {
      const index =
        above[column + 1]! |
        (above[column + 2]! << 1) |
        (below[column + 2]! << 2) |
        (below[column + 1]! << 3);
      if (index === 0 || index === 15) continue;
      for (const [from, to] of SEGMENTS[index]!) {
        const [fx, fy] = MIDPOINTS[from]!;
        const [tx, ty] = MIDPOINTS[to]!;
        next.set(key(2 * column + fx, 2 * row + fy), key(2 * column + tx, 2 * row + ty));
      }
    }
    [above, below] = [below, above];
  }

  const rings: { ring: Point[]; area: number }[] = [];
  for (const start of next.keys()) {
    const ring: Point[] = [];
    for (let at = start; next.has(at);) {
      const to = next.get(at)!;
      next.delete(at);
      ring.push(pointOf(to));
      at = to;
    }
    if (!ring.length) continue;
    const simplified = dropCollinear(ring);
    rings.push({ ring: simplified, area: shoelace(simplified) });
  }
  if (!rings.length) return { type: "MultiPolygon", coordinates: [] };

  // Visible on the left makes every exterior wind one way and every hole the
  // other; the largest ring is always an exterior, so it tells which is which.
  const exteriorSign = Math.sign(
    rings.reduce(
      (largest, { area }) => (Math.abs(area) > Math.abs(largest) ? area : largest),
      0,
    ),
  );
  const polygons: { exterior: Point[]; area: number; box: Box; holes: Point[][] }[] = [];
  const holes: Point[][] = [];
  for (const { ring, area } of rings) {
    if (Math.sign(area) === exteriorSign)
      polygons.push({ exterior: ring, area, box: boxOf(ring), holes: [] });
    else holes.push(ring);
  }
  // Smallest first, so a hole goes to the innermost exterior around it.
  polygons.sort((a, b) => Math.abs(a.area) - Math.abs(b.area));
  for (const hole of holes) {
    const [x, y] = hole[0]!;
    polygons
      .find(
        ({ exterior, box }) =>
          x > box[0] &&
          x < box[2] &&
          y > box[1] &&
          y < box[3] &&
          contains(exterior, [x, y]),
      )
      ?.holes.push(hole);
  }

  const { lng, lat } = gridAxes(grid);
  // y runs down the grid but latitude up, so a ring that is counterclockwise
  // on the map has a negative area here: exteriors go out reversed when
  // positive, holes when negative.
  const reverse = exteriorSign > 0;
  const toRing = (ring: Point[], flip: boolean): Position[] => {
    const positions = ring.map(([x, y]) => [lng(x / 2), lat(y / 2)]);
    if (flip) positions.reverse();
    positions.push(positions[0]!);
    return positions;
  };
  return {
    type: "MultiPolygon",
    coordinates: polygons.map(({ exterior, holes: inner }) => [
      toRing(exterior, reverse),
      ...inner.map((hole) => toRing(hole, reverse)),
    ]),
  };
}
