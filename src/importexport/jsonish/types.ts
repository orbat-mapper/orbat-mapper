import type { Feature, FeatureCollection, LineString, Point } from "geojson";
import type { TextAmpKey, TextAmpValue } from "@/symbology/milsymbwrapper";
import type { ReinforcedStatus, Unit } from "@/types/scenarioModels";

export interface GeoJsonSymbolProperties {
  sidc?: string;
  name?: string;
  m?: string;
  t?: string;
  uniqueDesignation?: string;
  additionalInformation?: string;
}

export interface TacticalJsonProperties extends Partial<
  Omit<Record<TextAmpValue, string>, "direction">
> {
  sidc: string;
  direction?: number;
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

export interface OrbatMapperGeoJsonFeature extends Feature<
  Point | LineString,
  MilSymbolProperties
> {
  id: string | number;
}

export interface ConvertedProperties {
  sidc: string;
  name: string;
  higherFormation?: string;
  uniqueDesignation?: string;
  additionalInformation?: string;
  fillColor?: string;
  staffComments?: string;
  reinforcedStatus?: ReinforcedStatus;
}

export interface ImportGeoJsonProperties {
  originalProperties: Record<string, any>;
  convertedProperties: ConvertedProperties;
}

export interface ImportGeoJsonFeature extends Feature<
  Point | LineString,
  ImportGeoJsonProperties
> {
  id: string;
}

export interface ImportGeoJsonCollection extends FeatureCollection {
  type: "FeatureCollection";
  features: ImportGeoJsonFeature[];
}
