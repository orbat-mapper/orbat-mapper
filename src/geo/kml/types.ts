import type { Feature, FeatureCollection, Geometry, Position } from "geojson";

export type KmlLayerOptions = {
  layerId: string;
  layerName: string;
  extractStyles: boolean;
  showPointNames: boolean;
};

export type KmlColor = {
  color: string;
  opacity: number;
};

export type KmlIconStyle = {
  href?: string;
  resolvedHref?: string;
  imageId?: string;
  scale?: number;
  heading?: number;
  color?: string;
  opacity?: number;
  hotSpot?: {
    x: number;
    y: number;
    xunits: string;
    yunits: string;
  };
};

export type KmlLabelStyle = {
  color?: string;
  opacity?: number;
  scale?: number;
};

export type KmlLineStyle = {
  color?: string;
  opacity?: number;
  width?: number;
};

export type KmlPolygonStyle = {
  color?: string;
  opacity?: number;
  fill?: boolean;
  outline?: boolean;
};

export type KmlFeatureStyle = {
  icon?: KmlIconStyle;
  label?: KmlLabelStyle;
  line?: KmlLineStyle;
  polygon?: KmlPolygonStyle;
};

export type ParsedKmlFeatureProperties = Record<string, unknown> & {
  __kmlLayerId: string;
  __kmlLayerName: string;
  __kmlFeatureId?: string;
  __kmlName?: string;
  __kmlDescription?: string;
  __kmlLabel?: string;
  __kmlIconHref?: string;
  __kmlIconImageId?: string;
  __kmlIconColor?: string;
  __kmlIconScale?: number;
  __kmlIconRotate?: number;
  __kmlStrokeColor?: string;
  __kmlStrokeOpacity?: number;
  __kmlStrokeWidth?: number;
  __kmlFillColor?: string;
  __kmlFillOpacity?: number;
  __kmlLabelColor?: string;
  __kmlLabelOpacity?: number;
  __kmlLabelScale?: number;
};

export type ParsedKmlFeature = Feature<Geometry, ParsedKmlFeatureProperties>;

export type ParsedKmlLayerData = {
  featureCollection: FeatureCollection<Geometry, ParsedKmlFeatureProperties>;
  features: ParsedKmlFeature[];
  icons: Map<string, string>;
  bbox?: [number, number, number, number];
};

export type KmlFeatureLike = {
  id?: string | number;
  geometry?: Geometry | null;
  properties?: Record<string, unknown> | null;
};

export function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}
