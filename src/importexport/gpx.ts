import { gpx } from "@tmcw/togeojson";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  LineString,
  MultiLineString,
} from "geojson";
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

  addPointTimes(document, converted);

  return converted;
}

function addPointTimes(document: Document, converted: FeatureCollection) {
  addTrackPointTimes(document, converted);
  addRoutePointTimes(document, converted);
}

function addTrackPointTimes(document: Document, converted: FeatureCollection) {
  const trackFeatures = converted.features.filter(isTrackLineFeature);
  if (!trackFeatures.length) return;

  const tracks = Array.from(document.getElementsByTagName("trk"));
  trackFeatures.forEach((feature, index) => {
    const track = tracks[index];
    if (!track) return;

    const segmentTimes = Array.from(track.getElementsByTagName("trkseg")).map((segment) =>
      getChildPointTimes(segment, "trkpt"),
    );
    const times =
      feature.geometry.type === "MultiLineString" ? segmentTimes : segmentTimes[0];

    if (!hasAnyTime(times)) return;

    const properties = getMutableProperties(feature);
    const coordinateProperties = getCoordinateProperties(properties);
    coordinateProperties.times = times;
  });
}

function addRoutePointTimes(document: Document, converted: FeatureCollection) {
  const routeFeatures = converted.features.filter(isRouteLineFeature);
  if (!routeFeatures.length) return;

  const routes = Array.from(document.getElementsByTagName("rte"));
  routeFeatures.forEach((feature, index) => {
    const route = routes[index];
    if (!route) return;

    const times = getChildPointTimes(route, "rtept");

    if (!hasAnyTime(times)) return;

    const properties = getMutableProperties(feature);
    const coordinateProperties = getCoordinateProperties(properties);
    coordinateProperties.times = times;
  });
}

function getChildPointTimes(element: Element, pointTagName: string): (string | null)[] {
  return Array.from(element.getElementsByTagName(pointTagName)).map(
    (point) => point.getElementsByTagName("time")[0]?.textContent?.trim() || null,
  );
}

function hasAnyTime(times: unknown): boolean {
  if (!Array.isArray(times)) return false;
  return times.flat(Infinity).some((time) => typeof time === "string" && !!time);
}

function isTrackLineFeature(
  feature: Feature,
): feature is Feature<LineString | MultiLineString, GeoJsonProperties> {
  return (
    (feature.geometry?.type === "LineString" ||
      feature.geometry?.type === "MultiLineString") &&
    feature.properties?._gpxType === "trk"
  );
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
