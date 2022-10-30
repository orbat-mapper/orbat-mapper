import type { Feature, FeatureCollection, LineString, Point, Position } from "geojson";

type CoordinateSystem = "WGS84" | string;

export interface MilXSymbolProperties {
  ID: string;
  M?: string;
  T?: string;
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

export interface TacticalJsonProperties {
  sidc: string;
  higherFormation?: string; // M
  additionalInformation?: string; // H
}

export interface MilSymbolProperties extends TacticalJsonProperties {
  name?: string;
  shortName?: string;
  description?: string;
}

export type OrbatMapperGeoJsonCollection = FeatureCollection<
  Point | LineString,
  MilSymbolProperties
>;

export type OrbatMapperGeoJsonFeature = Feature<Point | LineString, MilSymbolProperties>;
