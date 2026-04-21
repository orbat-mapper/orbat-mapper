import type { Feature as GeoJSONFeature, FeatureCollection } from "geojson";
import type { NGeometryLayerItem } from "@/types/internalModels";
import type { FeatureId } from "@/types/scenarioGeoModels";
import { nanoid } from "@/utils";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clonePropertiesRecord(
  properties: GeoJSONFeature["properties"],
): Record<string, unknown> | undefined {
  return isObjectRecord(properties) ? { ...properties } : undefined;
}

export function isGeoJSONFeature(data: unknown): data is GeoJSONFeature {
  return isObjectRecord(data) && data.type === "Feature" && "geometry" in data;
}

export function isGeoJSONFeatureCollection(data: unknown): data is FeatureCollection {
  return (
    isObjectRecord(data) &&
    data.type === "FeatureCollection" &&
    Array.isArray(data.features)
  );
}

export function getGeoJSONFeatures(
  data: unknown,
): GeoJSONFeature[] | null {
  if (isGeoJSONFeatureCollection(data)) return data.features;
  if (isGeoJSONFeature(data)) return [data];
  return null;
}

export function findLikelyNameColumn(columnNames: string[]): string | undefined {
  if (!columnNames.length) return undefined;

  const nameVariations = ["name", "title"];

  for (const columnName of columnNames) {
    if (nameVariations.includes(columnName.trim().toLowerCase())) {
      return columnName;
    }
  }

  for (const columnName of columnNames) {
    if (columnName.toLowerCase().includes("name")) {
      return columnName;
    }
  }

  return columnNames[0];
}

export function normalizeImportedName(rawName: unknown, fallback: string): string {
  if (typeof rawName === "string") return rawName.trim() || fallback;
  return String(rawName ?? fallback);
}

export function getGeoJSONPropertyNames(data: GeoJSONFeature | FeatureCollection): string[] {
  const propertyNames = new Set<string>();
  getGeoJSONFeatures(data)?.forEach((feature) => {
    const properties = clonePropertiesRecord(feature.properties);
    if (!properties) return;
    Object.keys(properties).forEach((key) => propertyNames.add(key));
  });
  return [...propertyNames];
}

export function convertGeoJSONFeatureToScenarioFeature(
  feature: GeoJSONFeature,
  layerId: FeatureId,
  options: {
    nameColumn?: string;
    fallbackName?: string;
  } = {},
): NGeometryLayerItem | null {
  if (!feature.geometry) return null;

  const properties = clonePropertiesRecord(feature.properties) ?? {};
  const nameColumn =
    options.nameColumn ?? findLikelyNameColumn(Object.keys(properties));
  const name = normalizeImportedName(
    nameColumn ? properties[nameColumn] : undefined,
    options.fallbackName ?? "New feature",
  );

  if (nameColumn) delete properties[nameColumn];

  return {
    kind: "geometry",
    _pid: layerId,
    id: nanoid(),
    name,
    geometryMeta: {
      geometryKind: feature.geometry.type,
    },
    geometry: feature.geometry,
    style: {},
    ...(Object.keys(properties).length ? { userData: properties } : {}),
  };
}

export function convertGeoJSONToScenarioFeatures(
  data: GeoJSONFeature | FeatureCollection,
  layerId: FeatureId,
  options: {
    nameColumn?: string;
    fallbackName?: string;
  } = {},
): NGeometryLayerItem[] {
  const features = getGeoJSONFeatures(data) ?? [];
  const nameColumn =
    options.nameColumn ?? findLikelyNameColumn(getGeoJSONPropertyNames(data));

  return features
    .map((feature) =>
      convertGeoJSONFeatureToScenarioFeature(feature, layerId, {
        ...options,
        nameColumn,
      }),
    )
    .filter((feature): feature is NGeometryLayerItem => !!feature);
}
