import { kml } from "@tmcw/togeojson";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type {
  KmlLayerOptions,
  ParsedKmlFeature,
  ParsedKmlFeatureProperties,
  ParsedKmlLayerData,
} from "@/geo/kml/types";
import { parseKmlFeatureStyle } from "@/geo/kml/parseKmlStyles";
import { getKmlIconImageId, resolveKmlIconHref } from "@/geo/kml/kmlIcons";

export async function loadKmlLayerData(
  input: string,
  options: KmlLayerOptions,
): Promise<ParsedKmlLayerData> {
  const kmlText = await loadKmlText(input);
  const document = new DOMParser().parseFromString(kmlText, "application/xml");
  const parsed = kml(document, { skipNullGeometry: true }) as FeatureCollection<
    Geometry,
    Record<string, unknown>
  >;
  const icons = new Map<string, string>();
  const features = parsed.features
    .filter((feature): feature is Feature<Geometry, Record<string, unknown>> =>
      Boolean(feature.geometry),
    )
    .map((feature, index) => enrichFeature(feature, index, options, icons));

  return {
    featureCollection: {
      type: "FeatureCollection",
      features,
    },
    features,
    icons,
    bbox: computeBbox(features),
  };
}

async function loadKmlText(input: string) {
  const trimmed = input.trimStart();
  if (trimmed.startsWith("<")) return input;
  if (input.startsWith("blob:") || input.includes("://") || input.startsWith("/")) {
    const response = await fetch(input);
    if (!response.ok) throw new Error(`Failed to load KML: ${response.status}`);
    return response.text();
  }
  return input;
}

function enrichFeature(
  feature: Feature<Geometry, Record<string, unknown>>,
  index: number,
  options: KmlLayerOptions,
  icons: Map<string, string>,
): ParsedKmlFeature {
  const sourceProperties = feature.properties ?? {};
  const style = parseKmlFeatureStyle(sourceProperties, options.extractStyles);
  const sourceId = sourceProperties.id;
  const featureId =
    feature.id ??
    (typeof sourceId === "string" || typeof sourceId === "number"
      ? sourceId
      : undefined) ??
    `${options.layerId}-${index}`;
  const name = stringValue(sourceProperties.name);
  const description =
    stringValue(sourceProperties.description) ?? stringValue(sourceProperties.desc);
  const resolvedIconHref = options.extractStyles
    ? resolveKmlIconHref(style.icon?.href ?? sourceProperties.icon)
    : undefined;
  const iconImageId = resolvedIconHref
    ? getKmlIconImageId(options.layerId, resolvedIconHref)
    : undefined;
  if (resolvedIconHref && iconImageId) icons.set(iconImageId, resolvedIconHref);

  const properties: ParsedKmlFeatureProperties = {
    ...sourceProperties,
    __kmlLayerId: options.layerId,
    __kmlLayerName: options.layerName,
    __kmlFeatureId: String(featureId),
    __kmlName: name,
    __kmlDescription: description,
    __kmlLabel:
      options.showPointNames && isPointGeometry(feature.geometry) ? name : undefined,
    __kmlIconHref: resolvedIconHref,
    __kmlIconImageId: iconImageId,
    __kmlIconColor: style.icon?.color,
    __kmlIconScale: style.icon?.scale,
    __kmlIconRotate: style.icon?.heading,
    __kmlStrokeColor: style.line?.color,
    __kmlStrokeOpacity: style.line?.opacity,
    __kmlStrokeWidth: style.line?.width,
    __kmlFillColor: style.polygon?.color,
    __kmlFillOpacity: style.polygon?.fill === false ? 0 : style.polygon?.opacity,
    __kmlLabelColor: style.label?.color,
    __kmlLabelOpacity: style.label?.opacity,
    __kmlLabelScale: style.label?.scale,
  };

  Object.keys(properties).forEach((key) => {
    if (properties[key] === undefined) delete properties[key];
  });

  return {
    ...feature,
    id: featureId,
    geometry: feature.geometry,
    properties,
  };
}

function stringValue(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    typeof value.value === "string"
  ) {
    return value.value;
  }
  return undefined;
}

function isPointGeometry(geometry: Geometry) {
  if (geometry.type === "Point" || geometry.type === "MultiPoint") return true;
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.some(isPointGeometry);
  }
  return false;
}

function computeBbox(
  features: Feature<Geometry, ParsedKmlFeatureProperties>[],
): [number, number, number, number] | undefined {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const feature of features) {
    scanGeometry(feature.geometry);
  }
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return;
  return [minX, minY, maxX, maxY];

  function scanCoordinates(value: unknown): void {
    if (!Array.isArray(value)) return;
    if (typeof value[0] === "number" && typeof value[1] === "number") {
      minX = Math.min(minX, value[0]);
      minY = Math.min(minY, value[1]);
      maxX = Math.max(maxX, value[0]);
      maxY = Math.max(maxY, value[1]);
      return;
    }
    value.forEach(scanCoordinates);
  }

  function scanGeometry(geometry: Geometry): void {
    if (geometry.type === "GeometryCollection") {
      geometry.geometries.forEach(scanGeometry);
      return;
    }
    scanCoordinates(geometry.coordinates);
  }
}
