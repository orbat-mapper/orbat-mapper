import type { KmlFeatureStyle } from "@/geo/kml/types";
import { normalizeCssColor, normalizeOpacity } from "@/geo/kml/kmlColor";

export function parseKmlFeatureStyle(
  properties: Record<string, unknown>,
  extractStyles: boolean,
): KmlFeatureStyle {
  if (!extractStyles) return {};
  return {
    icon: {
      href: stringProp(properties.icon),
      scale: numberProp(properties["icon-scale"]),
      heading: numberProp(properties["icon-heading"]),
      color: normalizeCssColor(properties["icon-color"]),
      opacity: normalizeOpacity(properties["icon-opacity"]),
    },
    label: {
      color: normalizeCssColor(properties["label-color"]),
      opacity: normalizeOpacity(properties["label-opacity"]),
      scale: numberProp(properties["label-scale"]),
    },
    line: {
      color: normalizeCssColor(properties.stroke),
      opacity: normalizeOpacity(properties["stroke-opacity"]),
      width: numberProp(properties["stroke-width"]),
    },
    polygon: {
      color: normalizeCssColor(properties.fill),
      opacity: normalizeOpacity(properties["fill-opacity"]),
      fill: properties["fill-opacity"] === 0 ? false : undefined,
      outline: properties["stroke-opacity"] === 0 ? false : undefined,
    },
  };
}

function stringProp(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberProp(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
