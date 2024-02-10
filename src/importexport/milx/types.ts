import type { Feature, FeatureCollection, LineString, Point, Position } from "geojson";

type CoordinateSystem = "WGS84" | string;

export interface MilXSymbolProperties {
  ID: string;
  M?: string;
  T?: string;
  XO?: string;
}

export type MilXGeoJsonCollection = FeatureCollection<
  Point | LineString,
  MilXSymbolProperties
>;
export type MilXFeature = Feature<Point | LineString, MilXSymbolProperties>;

export interface MilXLayer {
  name?: string | null;
  coordSystemType?: CoordinateSystem;
  featureCollection: MilXGeoJsonCollection;
}

export interface MilXGraphic {
  symbol?: {};
  points: Position[];
}
