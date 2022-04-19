/**
 * Basic implementation of simplestyle-spec
 *
 * https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 */

import { Circle, Fill, Stroke, Style } from "ol/style";
import * as olColor from "ol/color";

export interface SimpleStyleSpec {
  title: string;
  description: string;
  "marker-size": "small" | "medium" | "large";
  "marker-color": string;
  stroke: string;
  "stroke-opacity": number;
  "stroke-width": number;
  fill: string;
  "fill-opacity": number;
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
    image: new Circle({
      fill: fill,
      stroke: stroke,
      radius: 5,
    }),
  });
}
