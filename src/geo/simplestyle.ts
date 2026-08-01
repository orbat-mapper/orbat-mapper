/**
 * Basic implementation of simplestyle-spec
 *
 * https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
 */

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

export type ArrowType =
  | "none"
  | "arrow"
  | "arrow-open"
  | "arrow-curved"
  | "arrow-stealth"
  | "arrow-double"
  | "arrow-hand-drawn"
  | "arrow-double-hand-drawn"
  | "dot"
  | "square"
  | "diamond"
  | "bar";

export interface ArrowStyleSpec {
  /** Arrow marker at the start of the line (first coordinate) */
  "arrow-start": ArrowType;
  /** Arrow marker at the end of the line (last coordinate) */
  "arrow-end": ArrowType;
}

export interface SimpleStyleSpec
  extends
    StrokeStyleSpec,
    FillStyleSpec,
    MarkerStyleSpec,
    TextStyleSpec,
    VisibilityStyleSpec,
    ArrowStyleSpec {
  title: string;
}

export const defaultStrokeColor = "#555555";
export const defaultStrokeOpacity = 1;
export const defaultStrokeWidth = 2;
export const strokeStyleDashed = [10, 10];
export const strokeStyleDotted = [5, 10];
export const defaultFillColor = "#555555";
export const defaultFillOpacity = 0.25;
