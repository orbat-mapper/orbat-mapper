import type { Feature, FeatureCollection, LineString, Point } from "geojson";

export interface GeoJsonSymbolProperties {
  sidc?: string;
  name?: string;
  m?: string;
  t?: string;
  uniqueDesignation?: string;
  additionalInformation?: string;
}

export interface TacticalJsonProperties {
  sidc: string;
  higherFormation?: string; // M
  additionalInformation?: string; // H
}

export interface MilSymbolProperties extends TacticalJsonProperties {
  id?: string;
  name?: string;
  shortName?: string;
  description?: string;
  fillColor?: string;
}

export interface OrbatMapperGeoJsonLayer {
  name: string;
  featureCollection: OrbatMapperGeoJsonCollection;
}

export interface OrbatMapperGeoJsonCollection extends FeatureCollection {
  type: "FeatureCollection";
  features: OrbatMapperGeoJsonFeature[];
}

export interface OrbatMapperGeoJsonFeature
  extends Feature<Point | LineString, MilSymbolProperties> {
  id: string | number;
}
