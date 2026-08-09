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
import type { KmlControlMeasureLabelMode } from "@/types/importExport";

export type ControlMeasureLabelImage = {
  path: string;
  text: string;
  fontSize: number;
  textStyle?: FeaturePartProps["textStyle"];
  textJustify?: FeaturePartProps["textJustify"];
  color: string;
  textBackground: boolean;
  textHalo: boolean;
  textHaloColor: string;
};

export type ControlMeasureKmlExport = {
  features: Feature<Geometry, GeoJsonProperties>[];
  styles: StyleSettings[];
  labelImages: ControlMeasureLabelImage[];
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

function nativeKmlStyleForPart(
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

function headingFromRotation(rotation: number | undefined): number {
  if (rotation === undefined) return 0;
  const heading = 180 - (rotation * 180) / Math.PI;
  return ((heading % 360) + 360) % 360;
}

function labelImageKey(image: Omit<ControlMeasureLabelImage, "path">): string {
  return JSON.stringify(image, Object.keys(image).sort());
}

function renderedLabelImage(
  properties: FeaturePartProps,
): Omit<ControlMeasureLabelImage, "path"> {
  const style = properties.style ?? {};
  return {
    text: properties.text ?? "",
    fontSize: properties.textSizePixels ?? 14,
    ...(properties.textStyle ? { textStyle: properties.textStyle } : {}),
    ...(properties.textJustify ? { textJustify: properties.textJustify } : {}),
    color: style.strokeColor ?? "#000000",
    textBackground: properties.textBackground === true,
    textHalo: properties.textHalo === true,
    textHaloColor: properties.textHaloColor ?? "#ffffff",
  };
}

function renderedLabelStyle(path: string, properties: FeaturePartProps): StyleSettings {
  const anchorX =
    properties.textAnchor === "start" ? 0 : properties.textAnchor === "end" ? 1 : 0.5;
  return {
    id: "",
    iconHref: path,
    iconHeading: headingFromRotation(properties.rotation),
    xOffset: anchorX,
    yOffset: 0.5,
    xUnits: "fraction",
    yUnits: "fraction",
    labelScale: 0,
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
  options: { labelMode?: KmlControlMeasureLabelMode } = {},
): ControlMeasureKmlExport {
  const features: Feature<Geometry, GeoJsonProperties>[] = [];
  const styles: StyleSettings[] = [];
  const labelImages: ControlMeasureLabelImage[] = [];
  const styleIds = new Map<string, string>();
  const labelImagePaths = new Map<string, string>();
  let hasDash = false;
  let hasPattern = false;
  let hasGroundSizedLabel = false;

  for (const item of items) {
    if (!isSupportedTacticalGraphic(item)) continue;
    const rendered = renderControlMeasure(toControlMeasure(item), {
      validationMode: "silent",
    });
    const itemProperties = toTacticalGraphicGeoJsonProperties(item);

    for (const feature of rendered.features) {
      const isLabel =
        feature.geometry.type === "Point" && typeof feature.properties.text === "string";
      let candidate: StyleSettings;
      if (isLabel && options.labelMode === "rendered") {
        const image = renderedLabelImage(feature.properties);
        const imageKey = labelImageKey(image);
        let path = labelImagePaths.get(imageKey);
        if (!path) {
          path = `icons/control-measure-labels/label-${labelImages.length}.png`;
          labelImagePaths.set(imageKey, path);
          labelImages.push({ path, ...image });
        }
        candidate = renderedLabelStyle(path, feature.properties);
        hasGroundSizedLabel ||= feature.properties.textSizeMeters !== undefined;
      } else {
        candidate = nativeKmlStyleForPart("", feature.geometry, feature.properties);
      }
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
      const exportedItemProperties = { ...itemProperties };
      if (isLabel && options.labelMode === "rendered") {
        delete exportedItemProperties.name;
      }

      features.push({
        type: "Feature",
        id: feature.id,
        geometry: feature.geometry,
        properties: {
          ...exportedItemProperties,
          cmId: item.id,
          part: feature.properties.part,
          index: feature.properties.index,
          styleUrl: `#${id}`,
          ...(isLabel && options.labelMode !== "rendered"
            ? { name: feature.properties.text }
            : {}),
          ...(isLabel && options.labelMode === "rendered"
            ? { labelText: feature.properties.text }
            : {}),
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
  if (hasGroundSizedLabel) {
    warnings.push(
      "KML point icons cannot retain meter-based label sizing across zoom levels; affected rendered labels use the 14px engine fallback.",
    );
  }
  return { features, styles, labelImages, warnings };
}

function fontForLabel(image: ControlMeasureLabelImage): string {
  const fontStyle = image.textStyle === "italic" ? "italic" : "normal";
  const fontWeight = image.textStyle === "light" ? "300" : "400";
  return `${fontStyle} ${fontWeight} ${image.fontSize}px sans-serif`;
}

/** Rasterize one rendered-label resource for packaging inside a KMZ archive. */
export async function renderControlMeasureLabelBlob(
  image: ControlMeasureLabelImage,
): Promise<Blob> {
  const text = image.textStyle === "caps" ? image.text.toUpperCase() : image.text;
  const lines = text.split("\n");
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  if (!measureContext) throw new Error("Failed to create label measurement context");
  measureContext.font = fontForLabel(image);
  const lineHeight = Math.ceil(image.fontSize * 1.2);
  const widestLine = Math.max(
    1,
    ...lines.map((line) => Math.ceil(measureContext.measureText(line).width)),
  );
  const effectWidth = image.textBackground
    ? Math.max(3, image.fontSize * 0.22)
    : image.textHalo
      ? Math.max(2, image.fontSize / 4)
      : 0;
  const padding = Math.ceil(effectWidth + 2);
  const canvas = document.createElement("canvas");
  canvas.width = widestLine + padding * 2;
  canvas.height = lineHeight * Math.max(1, lines.length) + padding * 2;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Failed to create label canvas context");

  context.font = fontForLabel(image);
  context.textBaseline = "top";
  context.textAlign = image.textJustify ?? "center";
  context.fillStyle = image.color;
  const textX =
    context.textAlign === "left"
      ? padding
      : context.textAlign === "right"
        ? canvas.width - padding
        : canvas.width / 2;
  if (image.textBackground || image.textHalo) {
    context.strokeStyle = image.textBackground ? "#ffffff" : image.textHaloColor;
    context.lineWidth = effectWidth;
    context.lineJoin = "round";
  }
  lines.forEach((line, index) => {
    const y = padding + index * lineHeight;
    if (image.textBackground || image.textHalo) context.strokeText(line, textX, y);
    context.fillText(line, textX, y);
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Failed to encode rendered control-measure label");
  return blob;
}
