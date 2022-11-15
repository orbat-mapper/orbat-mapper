import type { Feature, FeatureCollection, LineString, Point, Position } from "geojson";

type CoordinateSystem = "WGS84" | string;

export interface MilXSymbolProperties {
  ID: string;
  M?: string;
  T?: string;
}

export interface GeoJsonSymbolProperties {
  sidc?: string;
  name?: string;
  m?: string;
  t?: string;
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

export interface OrbatMapperGeoJsonCollection extends FeatureCollection {
  type: "FeatureCollection";
  features: OrbatMapperGeoJsonFeature[];
}

export interface OrbatMapperGeoJsonFeature
  extends Feature<Point | LineString, MilSymbolProperties> {
  id: string | number;
}
