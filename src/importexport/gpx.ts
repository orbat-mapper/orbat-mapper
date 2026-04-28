import { gpx } from "@tmcw/togeojson";
import type { Feature, FeatureCollection, GeoJsonProperties, LineString } from "geojson";
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

  addRoutePointTimes(document, converted);

  return converted;
}

function addRoutePointTimes(document: Document, converted: FeatureCollection) {
  const routeFeatures = converted.features.filter(isRouteLineFeature);
  if (!routeFeatures.length) return;

  const routes = Array.from(document.getElementsByTagName("rte"));
  routeFeatures.forEach((feature, index) => {
    const route = routes[index];
    if (!route) return;

    const times = Array.from(route.getElementsByTagName("rtept"))
      .map((routePoint) =>
        routePoint.getElementsByTagName("time")[0]?.textContent?.trim(),
      )
      .filter((time): time is string => !!time);

    if (!times.length) return;

    const properties = getMutableProperties(feature);
    const coordinateProperties = getCoordinateProperties(properties);
    coordinateProperties.times = times;
  });
}

function isRouteLineFeature(
  feature: Feature,
): feature is Feature<LineString, GeoJsonProperties> {
  return (
    feature.geometry?.type === "LineString" && feature.properties?._gpxType === "rte"
  );
}

function getMutableProperties(feature: Feature): Record<string, unknown> {
  if (!feature.properties) {
    feature.properties = {};
  }
  return feature.properties;
}

function getCoordinateProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  if (
    typeof properties.coordinateProperties !== "object" ||
    properties.coordinateProperties === null ||
    Array.isArray(properties.coordinateProperties)
  ) {
    properties.coordinateProperties = {};
  }
  return properties.coordinateProperties as Record<string, unknown>;
}
