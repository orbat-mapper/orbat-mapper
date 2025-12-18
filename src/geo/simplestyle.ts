/**
 * Basic implementation of simplestyle-spec
 *
 * https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 */

import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";

import * as olColor from "ol/color";
import CircleStyle from "ol/style/Circle";
import Style from "ol/style/Style";
import RegularShape from "ol/style/RegularShape";
import Text from "ol/style/Text";

export interface StrokeStyleSpec {
  stroke: string | null | undefined;
  "stroke-opacity": number;
  "stroke-width": number;
  "stroke-style": "solid" | "dashed" | "dotted";
  _stroke?: string | null;
}

export interface FillStyleSpec {
  fill: string | null | undefined;
  "fill-opacity": number;
  _fill?: string | null;
}

export type MarkerSymbol =
  | "square"
  | "triangle"
  | "star"
  | "cross"
  | "x"
  | "circle"
  | "hexagon"
  | "pentagon";

export type MarkerSize = "small" | "medium" | "large";

export interface MarkerStyleSpec {
  "marker-size": MarkerSize;
  "marker-color": string;
  "marker-symbol": MarkerSymbol;
}

export interface TextStyleSpec {
  showLabel: boolean;
  "text-placement": "point" | "line";
  "text-align": "left" | "right" | "center" | "end" | "start";
  "text-offset-x": number;
  "text-offset-y": number;
  textMinZoom: number;
  textMaxZoom: number;
}

export interface VisibilityStyleSpec {
  limitVisibility: boolean;
  minZoom: number;
  maxZoom: number;
}

export interface SimpleStyleSpec
  extends
    StrokeStyleSpec,
    FillStyleSpec,
    MarkerStyleSpec,
    TextStyleSpec,
    VisibilityStyleSpec {
  title: string;
}

const scaleMap: Record<MarkerSize, number> = { medium: 1, large: 1.5, small: 0.75 };

// based on https://openlayers.org/en/latest/examples/regularshape.html
export function createMarkerSymbol(
  markerSymbol: MarkerSymbol,
  size: MarkerSize,
  markerColor: string = "#7e7e7e",
) {
  const sizeScale = scaleMap[size] || 1;
  const fill = new Fill({ color: markerColor });
  const stroke = new Stroke({
    color: ["cross", "x"].includes(markerSymbol) ? markerColor : "#fafafa",
    width: 2,
  });
  switch (markerSymbol) {
    case "square":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10 * sizeScale,
        angle: Math.PI / 4,
      });
    case "pentagon":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 10 * sizeScale,
        angle: 0,
      });

    case "hexagon":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 6,
        radius: 10 * sizeScale,
        angle: Math.PI / 2,
      });

    case "triangle":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: 10 * sizeScale,
        angle: 0,
      });
    case "star":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 10 * sizeScale,
        radius2: 4 * sizeScale,
        angle: 0,
      });
    case "cross":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10 * sizeScale,
        radius2: 0,
        angle: 0,
      });
    case "x":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10 * sizeScale,
        radius2: 0,
        angle: Math.PI / 4,
      });
  }
  return new CircleStyle({
    fill: fill,
    stroke: stroke,
    radius: 5 * sizeScale,
  });
}

export const defaultStrokeColor = "#555555";
export const defaultStrokeOpacity = 1;
export const defaultStrokeWidth = 2;
export const strokeStyleDashed = [10, 10];
export const strokeStyleDotted = [5, 10];
export const defaultSimplestyleStroke = new Stroke({
  color: defaultStrokeColor,
  width: defaultStrokeWidth,
});
export const defaultFillColor = "#555555";
export const defaultFillOpacity = 0.25;
export const defaultSimplestyleFill = new Fill({
  color: [0x55, 0x55, 0x55, defaultFillOpacity],
});
export const defaultSimpleStyleText = new Text({
  font: 'bold 13px "InterVariable"',
  textAlign: "left",
  textBaseline: "middle",
  fill: new Fill({
    color: "#333333",
  }),
  stroke: new Stroke({
    color: "#FBFCFB",
    width: 4,
  }),
  // padding: [3, 3, 3, 3],
  offsetX: 15,
  // offsetY: -15,
});

export function createSimpleStyle(opts: Partial<SimpleStyleSpec>) {
  let stroke: Stroke | undefined = defaultSimplestyleStroke;
  let fill: Fill | undefined = defaultSimplestyleFill;
  let text: Text | undefined = defaultSimpleStyleText;
  const markerSize = opts["marker-size"] || "medium";

  if (
    opts.stroke ||
    opts["stroke-width"] ||
    opts["stroke-opacity"] ||
    opts["stroke-style"]
  ) {
    let strokeColor = [...olColor.fromString(opts.stroke || "#555555")];
    if (opts["stroke-opacity"]) strokeColor[3] = opts["stroke-opacity"];

    stroke = new Stroke({
      color: strokeColor,
      width: opts["stroke-width"] || 2,
    });
    if (opts["stroke-style"] === "dashed") {
      stroke.setLineDash(strokeStyleDashed);
    } else if (opts["stroke-style"] === "dotted") {
      stroke.setLineDash(strokeStyleDotted);
    } else {
    }
  } else if (opts.stroke === null) {
    stroke = undefined;
  }
  if (opts["stroke-opacity"] === 0) stroke = undefined;

  if (opts.fill || opts["fill-opacity"] !== undefined) {
    let fillColor = [...olColor.fromString(opts.fill || defaultFillColor)];
    fillColor[3] = opts["fill-opacity"] ?? 0.5;
    fill = new Fill({ color: fillColor });
  } else if (opts.fill === null) {
    fill = undefined;
  }
  if (opts["fill-opacity"] === 0) fill = undefined;

  if (
    opts["text-placement"] ||
    opts["text-align"] ||
    opts["text-offset-x"] !== undefined ||
    opts["text-offset-y"] !== undefined
  ) {
    text = new Text({
      font: 'bold 13px "InterVariable"',
      placement: opts["text-placement"],
      textAlign: opts["text-align"] ?? "left",
      textBaseline: "middle",
      fill: new Fill({
        color: "#333333",
      }),
      stroke: new Stroke({
        color: "#FBFCFB",
        width: 4,
      }),
      // padding: [3, 3, 3, 3],
      offsetX: opts["text-offset-x"] ?? 15,
      offsetY: opts["text-offset-y"] ?? 0,
      // offsetY: -15,
    });
  }

  return new Style({
    stroke,
    fill,
    text,
    image: createMarkerSymbol(
      opts["marker-symbol"] || "circle",
      markerSize,
      opts["marker-color"] || "#7e7e7e",
    ),
  });
}
