export type DrawType = "Point" | "LineString" | "Polygon" | "Circle" | "Rectangle";

/**
 * How many pointer-placed points each draw type needs, and accepts at most.
 *
 * Engine-independent policy: the OpenLayers and MapLibre draw adapters and the draw
 * session's progress hint all read it from here so a "can commit" hint can never
 * disagree with what an explicit Done actually accepts.
 */
export const DRAW_TYPE_POINT_LIMITS: Record<DrawType, { min: number; max?: number }> = {
  Point: { min: 1, max: 1 },
  LineString: { min: 2 },
  Polygon: { min: 3 },
  Circle: { min: 2, max: 2 },
  Rectangle: { min: 2, max: 2 },
};

/**
 * Whether an explicit Done/Enter can complete the current sketch.
 *
 * Only the open-ended path types have a Done path at all; the others complete on
 * their own once the required points are placed.
 */
export function canFinishPathDraw(
  drawType: DrawType | null | undefined,
  pointCount: number,
): boolean {
  if (drawType !== "LineString" && drawType !== "Polygon") return false;
  return pointCount >= DRAW_TYPE_POINT_LIMITS[drawType].min;
}
