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
import { RegularShape } from "ol/style";

export interface StrokeStyleSpec {
  stroke: string | null;
  "stroke-opacity": number;
  "stroke-width": number;
  _stroke: string | null;
}

export interface FillStyleSpec {
  fill: string | null;
  "fill-opacity": number;
  _fill: string | null;
}

export type MarkerSymbol = "square" | "triangle" | "star" | "cross" | "x" | "circle";

export interface SimpleStyleSpec extends StrokeStyleSpec, FillStyleSpec {
  title: string;
  description: string;
  "marker-size": "small" | "medium" | "large";
  "marker-color": string;
  "marker-symbol": MarkerSymbol;
}

// based on https://openlayers.org/en/latest/examples/regularshape.html
function createMarkerSymbol(
  markerSymbol: MarkerSymbol,
  fill: Fill | undefined,
  stroke: Stroke | undefined
) {
  switch (markerSymbol) {
    case "square":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        angle: Math.PI / 4,
      });
    case "triangle":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: 10,
        rotation: Math.PI / 4,
        angle: 0,
      });
    case "star":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: 10,
        radius2: 4,
        angle: 0,
      });
    case "cross":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        radius2: 0,
        angle: 0,
      });
    case "x":
      return new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        radius2: 0,
        angle: Math.PI / 4,
      });
  }
  return new CircleStyle({
    fill: fill,
    stroke: stroke,
    radius: 5,
  });
}

export const defaultSimplestyleStroke = new Stroke({ color: "#555555", width: 2 });
export const defaultSimplestyleFill = new Fill({ color: [0x55, 0x55, 0x55, 0.25] });

export function createSimpleStyle(opts: Partial<SimpleStyleSpec>) {
  let stroke: Stroke | undefined = defaultSimplestyleStroke;
  let fill: Fill | undefined = defaultSimplestyleFill;
  if (opts.stroke === undefined && opts.fill === undefined) return; // use default layer style

  if (opts.stroke) {
    let strokeColor = [...olColor.fromString(opts.stroke)];
    if (opts["stroke-opacity"]) strokeColor[3] = opts["stroke-opacity"];
    stroke = new Stroke({ color: strokeColor, width: opts["stroke-width"] || 2 });
  } else if (opts.stroke === null) {
    stroke = undefined;
  }

  if (opts.fill) {
    let fillColor = [...olColor.fromString(opts.fill)];
    fillColor[3] = opts["fill-opacity"] ?? 0.5;
    fill = new Fill({ color: fillColor });
  } else if (opts.fill === null) {
    fill = undefined;
  }

  return new Style({
    stroke,
    fill,
    image: createMarkerSymbol(opts["marker-symbol"] || "circle", fill, stroke),
  });
}
