import type { FeatureLike } from "ol/Feature";
import type BaseLayer from "ol/layer/Base";
import type { ReferenceFeatureSelection } from "@/types/referenceFeature";

export function extractReferenceFeatureSelection(
  feature: FeatureLike,
  layer?: BaseLayer | null,
): ReferenceFeatureSelection {
  const properties = { ...(feature.getProperties?.() ?? {}) };
  delete properties.geometry;

  const featureName =
    typeof properties.name === "string"
      ? properties.name
      : typeof properties.title === "string"
        ? properties.title
        : undefined;

  return {
    layerId: layer?.get("id"),
    layerName: String(layer?.get("title") ?? layer?.get("name") ?? "Reference layer"),
    featureId: feature.getId?.(),
    name: featureName,
    properties,
  };
}

export function formatReferenceFeatureValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
