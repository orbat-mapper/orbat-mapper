export type MapLibreExpression = Array<unknown>;

export function buildAnchorZoomScaleExpression(
  baseScale: number | MapLibreExpression,
  anchorZoomProperty: string,
): MapLibreExpression {
  return [
    "*",
    baseScale,
    ["^", 2, ["-", ["zoom"], ["get", anchorZoomProperty]]],
  ];
}
