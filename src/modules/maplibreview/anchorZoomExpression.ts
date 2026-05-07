export type MapLibreExpression = Array<unknown>;

export function buildAnchorZoomScaleExpression(
  baseScale: number | MapLibreExpression,
  anchorZoomProperty: string,
): MapLibreExpression {
  return [
    "interpolate",
    ["exponential", 2],
    ["zoom"],
    0,
    [
      "case",
      ["has", anchorZoomProperty],
      ["*", baseScale, ["^", 2, ["-", 0, ["get", anchorZoomProperty]]]],
      baseScale,
    ],
    24,
    [
      "case",
      ["has", anchorZoomProperty],
      ["*", baseScale, ["^", 2, ["-", 24, ["get", anchorZoomProperty]]]],
      baseScale,
    ],
  ];
}
