/**
 * Arrow marker styles for LineString features
 *
 * This module provides functions to create arrow markers at the start and end
 * of line features, with configurable arrow types and colors.
 */

import { type Geometry, LineString, Point } from "ol/geom";
import Style from "ol/style/Style";
import RegularShape from "ol/style/RegularShape";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import Icon from "ol/style/Icon";
import * as olColor from "ol/color";
import type { ArrowType, SimpleStyleSpec } from "./simplestyle";
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
 * Create an arrow marker image (RegularShape or CircleStyle) for a specific arrow type.
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
): RegularShape | CircleStyle | Icon | null {
  if (arrowType === "none") return null;
  const size = 10 * scale;

  // Helper functions to create fill/stroke on demand
  const createFill = () => new Fill({ color });
  const createStroke = () => new Stroke({ color, width: 2 });

  switch (arrowType) {
    case "arrow":
      return new RegularShape({
        fill: createFill(),
        stroke: createStroke(),
        points: 3,
        radius: size,
        rotation: -rotation + Math.PI / 2,
        angle: 0,
      });

    case "arrow-open":
      return new RegularShape({
        stroke: createStroke(),
        points: 3,
        radius: size,
        rotation: -rotation + Math.PI / 2,
        angle: 0,
      });

    case "arrow-curved": {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${color}" d="M2,12 Q6,12 10,4 L22,12 L10,20 Q6,12 2,12 Z" /></svg>`;
      return new Icon({
        src: "data:image/svg+xml;base64," + btoa(svg),
        rotation: -rotation,
        scale: scale * 0.8,
        anchor: [0.5, 0.5],
      });
    }

    case "arrow-stealth": {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${color}" d="M2,2 L22,12 L2,22 L6,12 Z" /></svg>`;
      return new Icon({
        src: "data:image/svg+xml;base64," + btoa(svg),
        rotation: -rotation,
        scale: scale * 0.8,
        anchor: [0.5, 0.5],
      });
    }

    case "arrow-double": {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${color}" d="M2,2 L12,12 L2,22 Z M10,2 L20,12 L10,22 Z" /></svg>`;
      return new Icon({
        src: "data:image/svg+xml;base64," + btoa(svg),
        rotation: -rotation,
        scale: scale * 0.8,
        anchor: [0.5, 0.5],
      });
    }

    case "arrow-hand-drawn": {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <path stroke="${color}" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          d="M 12 10 C 18 16 34 22 44 24 C 34 26 18 32 12 38" />
        <path stroke="${color}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          d="M 14 14 C 20 18 30 22 40 24 C 30 26 20 30 14 34" />
      </svg>`;
      return new Icon({
        src: "data:image/svg+xml;base64," + btoa(svg),
        rotation: -rotation,
        scale: scale * 0.4,
        anchor: [0.5, 0.5],
      });
    }

    case "arrow-double-hand-drawn": {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <!-- First arrow -->
        <path stroke="${color}" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          d="M 4 10 C 10 16 26 22 36 24 C 26 26 10 32 4 38" />
        <path stroke="${color}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          d="M 6 14 C 12 18 22 22 32 24 C 22 26 12 30 6 34" />
        <!-- Second arrow -->
        <path stroke="${color}" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          d="M 12 10 C 18 16 34 22 44 24 C 34 26 18 32 12 38" />
        <path stroke="${color}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          d="M 14 14 C 20 18 30 22 40 24 C 30 26 20 30 14 34" />
      </svg>`;
      return new Icon({
        src: "data:image/svg+xml;base64," + btoa(svg),
        rotation: -rotation,
        scale: scale * 0.4,
        anchor: [0.5, 0.5],
      });
    }

    case "dot":
      return new CircleStyle({
        fill: createFill(),
        radius: size / 2,
      });

    case "square":
      return new RegularShape({
        fill: createFill(),
        points: 4,
        radius: size * 0.7,
        rotation: -rotation + Math.PI / 4,
        angle: 0,
      });

    case "diamond":
      return new RegularShape({
        fill: createFill(),
        points: 4,
        radius: size * 0.7,
        rotation: -rotation,
        angle: 0,
      });

    case "bar":
      return new RegularShape({
        stroke: new Stroke({ color, width: 2 + 4 * scale }),
        points: 2,
        radius: size,
        rotation: -rotation,
        angle: 0,
      });

    default:
      return null;
  }
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
  const scale = Math.max(0.4, strokeWidth / 2.5);

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
