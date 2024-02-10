import type { FeatureCollection } from "geojson";
import { nanoid } from "@/utils";
import { convertLetterSidc2NumberSidc } from "@orbat-mapper/convert-symbology";
import {
  GeoJsonSymbolProperties,
  MilSymbolProperties,
  OrbatMapperGeoJsonCollection,
} from "@/importexport/jsonish/types";

const isNumeric = /^\d+$/;

export function convertGeojsonLayer(
  layer: FeatureCollection,
): OrbatMapperGeoJsonCollection {
  const fc = layer;
  const { features: nFeatures, ...rest } = fc;
  const features = nFeatures
    .filter((f) => f.geometry.type === "Point")
    .map((f) => ({
      ...f,
      id: nanoid(),
      properties: convertGeojsonProperties(f.properties || {}),
    }));
  return { ...fc, features } as OrbatMapperGeoJsonCollection;
}

function convertGeojsonProperties(f: GeoJsonSymbolProperties): MilSymbolProperties {
  const props: MilSymbolProperties = {
    sidc: isNumeric.test(f.sidc!) ? f.sidc! : convertLetterSidc2NumberSidc(f.sidc!).sidc,
  };
  if (f.m) props.higherFormation = f.m;
  props.name = f.name || f.uniqueDesignation || f.t || "";
  return props;
}
