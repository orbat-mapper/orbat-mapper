/**
 * Arrow marker styles for LineString features
 *
 * This module provides functions to create arrow markers at the start and end
 * of line features, with configurable arrow types and colors.
 */

import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import * as olColor from "ol/color";
import type { ArrowType, SimpleStyleSpec } from "./simplestyle";
import {
  getArrowOlAnchor,
  getArrowRenderScale,
  getArrowSvgDataUri,
  getArrowSymbolDefinition,
} from "./arrowSymbols";
import {
  defaultStrokeColor,
  defaultStrokeOpacity,
  defaultStrokeWidth,
} from "./simplestyle";

/**
 * Calculate the angle of a line segment at the start or end of a line.
 *
 * @param coordinates - Array of coordinate pairs [[x, y], ...]
 * @param position - Whether to calculate angle at "start" or "end"
 * @returns Angle in radians
 */
export function getLineAngle(coordinates: number[][], position: "start" | "end"): number {
  if (coordinates.length < 2) return 0;

  let dx: number, dy: number;
  if (position === "start") {
    dx = coordinates[1][0] - coordinates[0][0];
    dy = coordinates[1][1] - coordinates[0][1];
  } else {
    const len = coordinates.length;
    dx = coordinates[len - 1][0] - coordinates[len - 2][0];
    dy = coordinates[len - 1][1] - coordinates[len - 2][1];
  }

  return Math.atan2(dy, dx);
}

/**
 * Create an arrow marker image for a specific arrow type.
 *
 * @param arrowType - The type of arrow marker to create
 * @param color - Fill/stroke color for the marker
 * @param rotation - Rotation angle in radians (for directional markers)
 * @param scale - Scale factor for marker size (default 1)
 * @returns The marker image style, or null if arrowType is "none"
 */
export function createArrowMarkerImage(
  arrowType: ArrowType,
  color: string,
  rotation: number,
  scale: number = 1,
): Icon | null {
  const definition = getArrowSymbolDefinition(arrowType);
  const src = getArrowSvgDataUri(arrowType, color);
  if (!(definition && src)) return null;

  return new Icon({
    src,
    rotation: -rotation,
    scale: scale * definition.olScale,
    anchor: getArrowOlAnchor(definition),
  });
}

/**
 * Create arrow styles for a LineString geometry.
 *
 * Returns an array of Style objects to be appended to the main feature style.
 * Each style renders an arrow marker at the appropriate position with correct rotation.
 *
 * @param geometry - The feature geometry (only LineString is supported)
 * @param opts - Style options (including arrows, stroke, etc.)
 * @returns Array of Style objects for the arrow markers
 */
export function createArrowStyles(
  geometry: Geometry,
  opts: Partial<SimpleStyleSpec>,
): Style[] {
  if (!(geometry instanceof LineString)) return [];

  const styles: Style[] = [];
  const coords = geometry.getCoordinates();
  if (coords.length < 2) return [];

  const strokeColor = opts.stroke || defaultStrokeColor;
  const strokeWidth = opts["stroke-width"] || defaultStrokeWidth;
  const strokeOpacity = opts["stroke-opacity"] ?? defaultStrokeOpacity;

  const color = [...olColor.fromString(strokeColor)];
  color[3] = strokeOpacity;
  const rgbaColor = olColor.asString(color);
  const scale = getArrowRenderScale(strokeWidth);

  // Start arrow
  if (opts["arrow-start"] && opts["arrow-start"] !== "none") {
    const angle = getLineAngle(coords, "start");
    const image = createArrowMarkerImage(
      opts["arrow-start"],
      rgbaColor,
      angle + Math.PI, // Point backward from start
      scale,
    );
    if (image) {
      styles.push(
        new Style({
          geometry: new Point(coords[0]),
          image,
        }),
      );
    }
  }

  // End arrow
  if (opts["arrow-end"] && opts["arrow-end"] !== "none") {
    const angle = getLineAngle(coords, "end");
    const image = createArrowMarkerImage(opts["arrow-end"], rgbaColor, angle, scale);
    if (image) {
      styles.push(
        new Style({
          geometry: new Point(coords[coords.length - 1]),
          image,
        }),
      );
    }
  }

  return styles;
}
