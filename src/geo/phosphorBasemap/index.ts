/**
 * The Phosphor basemap: a CRT look, phosphor on black, for a vector archive in the Protomaps
 * schema. It is the look of the hosted Phosphor basemaps (orbat-mapper/naval-basemap), with
 * presets for green (P1) and amber (P3) phosphor.
 *
 * One call gives a style's layers and sprite URL:
 *
 * ```ts
 * registerPhosphorSpriteProtocol(); // once, at startup
 * const { layers, sprite } = phosphorBasemap("archive", { palette: "amber", lang: "de" });
 * ```
 *
 * This folder is self-contained (it imports only `maplibre-gl` and `@protomaps/basemaps`) so
 * it can be copied into another app as is, such as tactrace.
 *
 * The hosted Phosphor styles are written for the OpenMapTiles schema. These are the same layers
 * translated to Protomaps source layers and attributes:
 *
 * - `water` polygons that are not river areas stand in for OpenMapTiles `water`
 * - `water` lines with `kind` river stand in for `waterway`
 * - `boundaries` with `kind_detail` 2 / 4 stand in for `boundary` admin_level 2 / 4
 * - `water` label points with a marine `kind` stand in for `water_name`
 * - `places` with `kind` country / region / locality stand in for `place` country / state / city
 *
 * Labels follow the Protomaps styles: a place or sea name in the chosen language with the local
 * name on a second line when it differs, and a country name in the chosen language only. The
 * expressions come from `@protomaps/basemaps`, which also picks the script for the language.
 * They are `format` expressions, so the upper case of the look is `text-transform`.
 *
 * Fonts are system font family names. They only work with no `glyphs` URL in the style, where
 * MapLibre rasterises labels locally (see orbat-mapper ADR 0003).
 */
import type {
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
  FormattedSpecification,
  LayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";
import { get_country_name, get_multiline_name } from "@protomaps/basemaps";
import { DOTS_IMAGE, phosphorSpriteUrl, SCANLINES_IMAGE } from "./sprite";

export { phosphorSpriteFile, registerPhosphorSpriteProtocol } from "./sprite";

/** The colours of the look. Pattern colour (`line`) must be hex; the rest any CSS colour. */
export interface PhosphorPalette {
  background: string;
  /** Coastlines, borders, and the sea dots and scanlines. */
  line: string;
  /** Rivers and state borders. */
  lineDim: string;
  /** Sea, country and town labels. */
  label: string;
  /** Region labels. */
  labelDim: string;
  /** Label halo when `glow` is on; translucent reads as phosphor bloom. */
  glow: string;
  glowDim: string;
}

export const PHOSPHOR_PALETTES = {
  /** P1 green phosphor, the hosted Phosphor look. */
  green: {
    background: "#000000",
    line: "#3dff5a",
    lineDim: "#22b83c",
    label: "#c8ffd0",
    labelDim: "#8ff09c",
    glow: "rgba(61, 255, 90, 0.25)",
    glowDim: "rgba(34, 184, 60, 0.22)",
  },
  /** P3 amber phosphor. */
  amber: {
    background: "#000000",
    line: "#ffb000",
    lineDim: "#c27c00",
    label: "#ffe4b0",
    labelDim: "#f5c46e",
    glow: "rgba(255, 176, 0, 0.25)",
    glowDim: "rgba(194, 124, 0, 0.22)",
  },
} as const satisfies Record<string, PhosphorPalette>;

export type PhosphorPaletteName = keyof typeof PHOSPHOR_PALETTES;

export interface PhosphorOptions {
  /** A preset to start from. Default `green`. */
  palette?: PhosphorPaletteName;
  /** Overrides on top of the preset. */
  colors?: Partial<PhosphorPalette>;
  /** Label language. Default `en`. */
  lang?: string;
  /** Dot pattern on the sea, in 1x pixels; `false` for none. */
  dots?: false | { spacing?: number; size?: number; opacity?: number };
  /** Scanlines over the whole map, in 1x pixels; `false` for none. */
  scanlines?: false | { spacing?: number; thickness?: number; opacity?: number };
  /** Blurred phosphor halo on labels. `false` gives a crisp outline in the background colour. */
  glow?: boolean;
  /** Font families, first available wins. Default a monospace system stack. */
  fonts?: string[];
  /** Prefix for layer ids. Default `phosphor`. */
  idPrefix?: string;
  /**
   * Set when the style's `sprite` is an array and this sprite gets an id there: pattern names
   * are then written `<spriteId>:phosphor-dots`, as MapLibre requires.
   */
  spriteId?: string;
}

export interface PhosphorBasemap {
  layers: LayerSpecification[];
  /** For the style's `sprite` (needs `registerPhosphorSpriteProtocol()`). */
  sprite: string;
}

const DEFAULT_FONTS = [
  "Menlo",
  "Consolas",
  "DejaVu Sans Mono",
  "Liberation Mono",
  "monospace",
];

const SEA_KINDS = ["sea", "ocean", "bay", "strait", "fjord"];

/**
 * Sea and lake areas: OpenMapTiles `water` minus class river. Protomaps tags river areas with
 * `kind_detail` river, and draws river centrelines as lines in the same layer.
 */
const WATER_AREA: ExpressionSpecification = [
  "all",
  ["==", ["geometry-type"], "Polygon"],
  ["!=", ["get", "kind_detail"], "river"],
];

/** OpenMapTiles `place` class city/town: a Protomaps locality tagged city or town. */
const TOWN_FILTER: ExpressionSpecification = [
  "all",
  ["==", ["get", "kind"], "locality"],
  ["in", ["get", "kind_detail"], ["literal", ["city", "town"]]],
];

type LabelText = DataDrivenPropertyValueSpecification<FormattedSpecification>;
type SymbolPaint = NonNullable<SymbolLayerSpecification["paint"]>;
type SymbolLayout = NonNullable<SymbolLayerSpecification["layout"]>;

/** The layers and sprite URL for the Phosphor basemap, reading every feature from `source`. */
export function phosphorBasemap(
  source: string,
  options: PhosphorOptions = {},
): PhosphorBasemap {
  const {
    palette = "green",
    lang = "en",
    glow = true,
    fonts = DEFAULT_FONTS,
    idPrefix = "phosphor",
    spriteId,
  } = options;
  const colors: PhosphorPalette = { ...PHOSPHOR_PALETTES[palette], ...options.colors };
  const dots = { spacing: 6, size: 1, opacity: 0.35, ...(options.dots || {}) };
  const scanlines = {
    spacing: 3,
    thickness: 1,
    opacity: 0.08,
    ...(options.scanlines || {}),
  };

  const id = (name: string) => `${idPrefix}-${name}`;
  const image = (name: string) => (spriteId ? `${spriteId}:${name}` : name);

  /**
   * MapLibre takes the weight from the first name in the stack (it looks for "Bold" in it). No
   * system has a family called "Phosphor Mono Bold", so the browser skips it and draws the next
   * family in bold.
   */
  const bold = ["Phosphor Mono Bold", ...fonts];
  // One stack entry for the local-name line; MapLibre splits a font stack on commas.
  const text = get_multiline_name(lang, undefined, fonts.join(",")) as LabelText;

  const labelPaint = (dim: boolean): SymbolPaint => ({
    "text-color": dim ? colors.labelDim : colors.label,
    ...(glow
      ? {
          "text-halo-color": dim ? colors.glowDim : colors.glow,
          "text-halo-width": dim ? 2.5 : 3,
          "text-halo-blur": dim ? 2.5 : 3,
        }
      : { "text-halo-color": colors.background, "text-halo-width": 1.5 }),
  });
  const bright = labelPaint(false);

  /** A name label: upper case and bold, wrapping at 12 ems. */
  const label = (
    name: string,
    where: Pick<SymbolLayerSpecification, "source-layer" | "filter" | "minzoom">,
    layout: SymbolLayout,
    paint = bright,
  ): SymbolLayerSpecification => ({
    id: id(name),
    type: "symbol",
    source,
    ...where,
    layout: {
      "text-field": text,
      "text-transform": "uppercase",
      "text-font": bold,
      "text-max-width": 12,
      ...layout,
    },
    paint,
  });

  const layers: (LayerSpecification | false)[] = [
    {
      id: id("background"),
      type: "background",
      paint: { "background-color": colors.background },
    },
    options.dots !== false && {
      id: id("sea-dots"),
      type: "fill",
      source,
      "source-layer": "water",
      filter: WATER_AREA,
      paint: { "fill-pattern": image(DOTS_IMAGE), "fill-opacity": dots.opacity },
    },
    options.scanlines !== false && {
      id: id("scanlines"),
      type: "background",
      paint: {
        "background-pattern": image(SCANLINES_IMAGE),
        "background-opacity": scanlines.opacity,
      },
    },
    glow && {
      id: id("coastline-glow"),
      type: "line",
      source,
      "source-layer": "water",
      filter: WATER_AREA,
      paint: {
        "line-color": colors.line,
        "line-opacity": 0.3,
        "line-blur": 3,
        "line-width": ["interpolate", ["linear"], ["zoom"], 2, 3, 8, 6, 14, 9],
      },
    },
    {
      id: id("coastline"),
      type: "line",
      source,
      "source-layer": "water",
      filter: WATER_AREA,
      paint: {
        "line-color": colors.line,
        "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.8, 8, 1.4, 14, 2.2],
      },
    },
    {
      id: id("rivers"),
      type: "line",
      source,
      "source-layer": "water",
      minzoom: 6,
      filter: [
        "all",
        ["==", ["geometry-type"], "LineString"],
        ["==", ["get", "kind"], "river"],
      ],
      paint: {
        "line-color": colors.lineDim,
        "line-opacity": 0.6,
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 12, 1.2],
      },
    },
    {
      id: id("state-borders"),
      type: "line",
      source,
      "source-layer": "boundaries",
      minzoom: 5,
      filter: ["==", ["get", "kind_detail"], 4],
      paint: {
        "line-color": colors.lineDim,
        "line-opacity": 0.8,
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 10, 1],
        "line-dasharray": [3, 3],
      },
    },
    {
      id: id("borders"),
      type: "line",
      source,
      "source-layer": "boundaries",
      filter: ["<=", ["get", "kind_detail"], 2],
      paint: {
        "line-color": colors.line,
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 2, 0.8, 10, 1.5],
        "line-dasharray": [4, 2],
      },
    },
    label(
      "sea-labels",
      {
        "source-layer": "water",
        filter: [
          "all",
          ["==", ["geometry-type"], "Point"],
          ["in", ["get", "kind"], ["literal", SEA_KINDS]],
        ],
      },
      {
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 19, 4, 25.5, 8, 35],
        "text-letter-spacing": 0.25,
      },
    ),
    label(
      "country-labels",
      { "source-layer": "places", filter: ["==", ["get", "kind"], "country"] },
      {
        // Country name in `lang` only, as the Protomaps styles do.
        "text-field": get_country_name(lang) as LabelText,
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 20, 4, 28, 6, 38],
        "text-letter-spacing": 0.25,
      },
    ),
    label(
      "state-labels",
      { "source-layer": "places", minzoom: 4, filter: ["==", ["get", "kind"], "region"] },
      {
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 16, 8, 23],
        "text-letter-spacing": 0.2,
      },
      labelPaint(true),
    ),
    {
      id: id("town-markers"),
      type: "symbol",
      source,
      "source-layer": "places",
      minzoom: 4,
      filter: TOWN_FILTER,
      layout: {
        "text-field": "■",
        "text-font": fonts,
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 9, 12, 13],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: bright,
    },
    label(
      "town-labels",
      { "source-layer": "places", minzoom: 4, filter: TOWN_FILTER },
      {
        "text-size": ["interpolate", ["linear"], ["zoom"], 4, 14, 12, 19.5],
        "text-letter-spacing": 0.05,
        "text-anchor": "left",
        "text-offset": [0.8, 0],
      },
    ),
  ];

  return {
    layers: layers.filter((layer): layer is LayerSpecification => !!layer),
    sprite: phosphorSpriteUrl({
      color: colors.line,
      dotSpacing: dots.spacing,
      dotSize: dots.size,
      scanlineSpacing: scanlines.spacing,
      scanlineThickness: scanlines.thickness,
    }),
  };
}
