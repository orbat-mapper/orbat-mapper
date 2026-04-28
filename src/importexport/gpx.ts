import { gpx } from "@tmcw/togeojson";
import type { FeatureCollection } from "geojson";
import { isGeoJSONFeatureCollection } from "@/importexport/geojsonScenarioFeatures";

export function convertGpxToGeoJSON(gpxString: string): FeatureCollection {
  const document = new DOMParser().parseFromString(gpxString, "application/xml");
  const parserError = document.getElementsByTagName("parsererror")[0];

  if (parserError) {
    throw new Error("Could not parse GPX XML");
  }

  const converted = gpx(document);
  if (!isGeoJSONFeatureCollection(converted)) {
    throw new Error("GPX did not convert to a valid GeoJSON feature collection");
  }

  if (!converted.features.length) {
    throw new Error("GPX did not contain any importable features");
  }

  return converted;
}
