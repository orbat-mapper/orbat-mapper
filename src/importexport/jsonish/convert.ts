import type { FeatureCollection } from "geojson";
import { nanoid } from "@/utils";
import { convertLetterSidc2NumberSidc } from "@orbat-mapper/convert-symbology";
import type {
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
  const sidc = f.sidc || "10031000000000000000";
  const props: MilSymbolProperties = {
    sidc: isNumeric.test(sidc) ? sidc : convertLetterSidc2NumberSidc(sidc).sidc,
  };
  if (f.m) props.higherFormation = f.m;
  props.name = f.name || f.uniqueDesignation || f.t || "";
  return props;
}
