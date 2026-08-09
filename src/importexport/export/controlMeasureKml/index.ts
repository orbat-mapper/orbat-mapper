/**
 * Temporary KML compatibility layer for @orbat-mapper/control-measures.
 *
 * Keep this module dependency-light and behind the KML export seam: the control
 * measures package is expected to grow its own KML renderer, at which point this
 * folder and the two calls from kmlExport.ts can be removed together.
 */
import {
  renderControlMeasure,
  type ControlMeasureStyle,
  type FeaturePartProps,
} from "@orbat-mapper/control-measures";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import {
  toControlMeasure,
  toTacticalGraphicGeoJsonProperties,
} from "@/geo/controlMeasures";
import { isSupportedTacticalGraphic } from "@/scenariostore/tacticalGraphics";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import type { StyleSettings } from "@/extlib/tokml";

export type ControlMeasureKmlExport = {
  features: Feature<Geometry, GeoJsonProperties>[];
  styles: StyleSettings[];
  warnings: string[];
};

type Rgba = { red: number; green: number; blue: number; alpha: number };

function byte(value: number): string {
  return Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, "0");
}

function parseCssColor(value: string | undefined): Rgba | undefined {
  if (!value) return undefined;
  const color = value.trim();
  const hex = /^#([\da-f]{3,8})$/i.exec(color)?.[1];
  if (hex) {
    const expanded =
      hex.length === 3 || hex.length === 4
        ? [...hex].map((character) => character + character).join("")
        : hex;
    if (expanded.length === 6 || expanded.length === 8) {
      return {
        red: Number.parseInt(expanded.slice(0, 2), 16),
        green: Number.parseInt(expanded.slice(2, 4), 16),
        blue: Number.parseInt(expanded.slice(4, 6), 16),
        alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) : 255,
      };
    }
  }

  const rgb =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+)\s*)?\)$/i.exec(
      color,
    );
  if (!rgb) return undefined;
  return {
    red: Number(rgb[1]),
    green: Number(rgb[2]),
    blue: Number(rgb[3]),
    alpha: rgb[4] === undefined ? 255 : Number(rgb[4]) * 255,
  };
}

/** KML colors are encoded as aabbggrr, rather than CSS's rrggbbaa. */
export function cssColorToKml(value: string | undefined): string | undefined {
  const color = parseCssColor(value);
  if (!color) return undefined;
  return `${byte(color.alpha)}${byte(color.blue)}${byte(color.green)}${byte(color.red)}`;
}

function styleKey(style: StyleSettings): string {
  return JSON.stringify(style, Object.keys(style).sort());
}

function kmlStyleForPart(
  id: string,
  geometry: Geometry,
  properties: FeaturePartProps,
): StyleSettings {
  const style: ControlMeasureStyle = properties.style ?? {};
  const isLabel = geometry.type === "Point" && typeof properties.text === "string";
  return {
    id,
    ...(isLabel
      ? {
          labelColor: cssColorToKml(style.strokeColor),
          labelScale:
            properties.textSizePixels !== undefined
              ? Math.max(0.1, properties.textSizePixels / 16)
              : 1,
          hideIcon: true,
        }
      : {
          lineColor: cssColorToKml(style.strokeColor),
          // MapLibre tactical-draw's adapter default is 2px. KML's default is 1,
          // so leaving this absent would make otherwise unstyled measures too thin.
          lineWidth: style.strokeWidth ?? 2,
          polyColor: cssColorToKml(style.fillColor),
          polyFill: style.fillColor !== undefined,
          polyOutline: style.strokeColor !== undefined,
        }),
  };
}

/**
 * Render stored control measures into styled KML-ready placemarks.
 *
 * KML has no portable line-dash or polygon-pattern primitive. The complete
 * rendered geometry is retained and those two paint hints degrade to the same
 * colors/widths as a solid KML feature; callers receive one aggregate warning.
 */
export function controlMeasuresToKml(
  items: readonly TacticalGraphicLayerItem[],
): ControlMeasureKmlExport {
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  const styles: StyleSettings[] = [];
  const styleIds = new Map<string, string>();
  let hasDash = false;
  let hasPattern = false;

  for (const item of items) {
    if (!isSupportedTacticalGraphic(item)) continue;
    const rendered = renderControlMeasure(toControlMeasure(item), {
      validationMode: "silent",
    });
    const itemProperties = toTacticalGraphicGeoJsonProperties(item);

    for (const feature of rendered.features) {
      const candidate = kmlStyleForPart("", feature.geometry, feature.properties);
      const key = styleKey({ ...candidate, id: "" });
      let id = styleIds.get(key);
      if (!id) {
        id = `cm-${styleIds.size}`;
        styleIds.set(key, id);
        styles.push({ ...candidate, id });
      }

      const partStyle = feature.properties.style;
      hasDash ||= Boolean(partStyle?.strokeDash?.length);
      hasPattern ||= Boolean(partStyle?.fillPattern && partStyle.fillPattern !== "solid");
      const isLabel =
        feature.geometry.type === "Point" && typeof feature.properties.text === "string";

      features.push({
        type: "Feature",
        id: feature.id,
        geometry: feature.geometry,
        properties: {
          ...itemProperties,
          cmId: item.id,
          part: feature.properties.part,
          index: feature.properties.index,
          styleUrl: `#${id}`,
          ...(isLabel ? { name: feature.properties.text } : {}),
          ...(feature.properties.rotation !== undefined
            ? { labelRotation: feature.properties.rotation }
            : {}),
          ...(feature.properties.textAnchor !== undefined
            ? { labelAnchor: feature.properties.textAnchor }
            : {}),
        },
      });
    }
  }

  const warnings: string[] = [];
  if (hasDash || hasPattern) {
    const unsupported = [hasDash && "dash patterns", hasPattern && "fill patterns"]
      .filter(Boolean)
      .join(" and ");
    warnings.push(
      `KML does not define portable ${unsupported}; affected control-measure parts use their resolved color and width as a solid fallback.`,
    );
  }
  return { features, styles, warnings };
}
