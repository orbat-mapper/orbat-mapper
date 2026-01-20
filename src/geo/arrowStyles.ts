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
import type { ArrowType, ArrowStyleSpec } from "./simplestyle";

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

  const fill = new Fill({ color });
  const stroke = new Stroke({ color, width: 2 });
  const size = 10 * scale;

  switch (arrowType) {
    case "arrow":
      return new RegularShape({
        fill,
        stroke,
        points: 3,
        radius: size,
        rotation: -rotation + Math.PI / 2,
        angle: 0,
      });

    case "arrow-open":
      return new RegularShape({
        stroke,
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

    case "dot":
      return new CircleStyle({
        fill,
        stroke: new Stroke({ color: "#fff", width: 1 }),
        radius: size / 2,
      });

    case "square":
      return new RegularShape({
        fill,
        stroke: new Stroke({ color: "#fff", width: 1 }),
        points: 4,
        radius: size * 0.7,
        rotation: Math.PI / 4,
        angle: 0,
      });

    case "diamond":
      return new RegularShape({
        fill,
        stroke: new Stroke({ color: "#fff", width: 1 }),
        points: 4,
        radius: size * 0.7,
        rotation: 0,
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
 * @param opts - Arrow style options
 * @param strokeColor - Fallback color if arrow-color is not specified
 * @returns Array of Style objects for the arrow markers
 */
export function createArrowStyles(
  geometry: Geometry,
  opts: Partial<ArrowStyleSpec>,
  strokeColor: string = "#555555",
): Style[] {
  if (!(geometry instanceof LineString)) return [];

  const styles: Style[] = [];
  const coords = geometry.getCoordinates();
  if (coords.length < 2) return [];

  const arrowColor = opts["arrow-color"] || strokeColor;

  // Start arrow
  if (opts["arrow-start"] && opts["arrow-start"] !== "none") {
    const angle = getLineAngle(coords, "start");
    const image = createArrowMarkerImage(
      opts["arrow-start"],
      arrowColor,
      angle + Math.PI, // Point backward from start
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
    const image = createArrowMarkerImage(opts["arrow-end"], arrowColor, angle);
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
