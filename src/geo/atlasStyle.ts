/**
 * The Atlas basemap, ported from TacTrace's `src/lib/atlasStyle`: a MapLibre style in the manner of
 * military history atlas plates (white low ground, buff-to-brown elevation tints, pale cyan water,
 * light grey borders, letter-spaced country names).
 *
 * Only TacTrace's Alpine elevation bands are ported: tints above 100, 200, 500, 1,000 and 2,000 m.
 * Credit the default vector tiles and glyphs as "OpenFreeMap © OpenMapTiles Data from
 * OpenStreetMap"; the default DEM carries its own attribution.
 */
import type { MultiPolygon } from "geojson";
import type {
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
  FilterSpecification,
  LayerSpecification,
  RasterDEMSourceSpecification,
  SourceSpecification,
  StyleSpecification,
  VectorSourceSpecification,
} from "maplibre-gl";

export interface AtlasStyleOptions {
  /** OpenMapTiles-schema vector tiles. Defaults to the OpenFreeMap planet. */
  vector?: VectorSourceSpecification;
  /** One elevation source; the style derives its zoom-capped copies. Defaults to Mapterhorn. */
  dem?: RasterDEMSourceSpecification;
  /** Glyph URL template serving the Noto Sans Regular, Bold and Italic stacks. */
  glyphs?: string;
}

/** Atlas-plate elevation tints on the five-band scale of the plates for the Alps. */
const ELEVATION_THRESHOLDS = [100, 200, 500, 1000, 2000] as const;
const LOW_GROUND = "rgba(255,255,255,0)";
/** Lightest first, one per threshold. */
const BAND_COLORS = ["#ffe8ba", "#e5d0a7", "#ccba95", "#b2a282", "#998b70"] as const;
/** color-relief only accepts `interpolate`, so a hard edge is a pair of stops this far apart. */
const EDGE = 0.1;
export const ATLAS_ELEVATION_LAYER_PREFIX = "elevation-bands-";

function elevationBandRamp(): ExpressionSpecification {
  const below = [LOW_GROUND, ...BAND_COLORS];
  const stops = ELEVATION_THRESHOLDS.flatMap((threshold, i) => [
    threshold - EDGE,
    below[i]!,
    threshold,
    BAND_COLORS[i]!,
  ]);
  return ["interpolate", ["linear"], ["elevation"], ...stops] as ExpressionSpecification;
}

/** The style always has `layers`, `sources` and `glyphs`. */
export type AtlasStyle = StyleSpecification & { glyphs: string };

const VECTOR = "omt";
const DEFAULT_VECTOR: VectorSourceSpecification = {
  type: "vector",
  url: "https://tiles.openfreemap.org/planet",
};
const DEFAULT_GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const DEFAULT_DEM: RasterDEMSourceSpecification = {
  type: "raster-dem",
  tiles: ["https://tiles.mapterhorn.com/{z}/{x}/{y}.webp"],
  encoding: "terrarium",
  tileSize: 512,
  attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
};

/**
 * Elevation is generalized more strongly the further out: each level reads a
 * copy of the DEM capped at `demZoom`, shows from `fromZoom`, and fades in over
 * the level below it across half a zoom.
 */
const ELEVATION_LEVELS: readonly { demZoom: number; fromZoom?: number }[] = [
  { demZoom: 4 },
  { demZoom: 6, fromZoom: 6 },
  { demZoom: 8, fromZoom: 8 },
  { demZoom: 11, fromZoom: 10.5 },
];
const FADE = 0.5;

const INK = {
  paper: "#ffffff",
  water: "#c9f3ff",
  waterLine: "#26cfff",
  waterText: "#1683b0",
  border: "#7a736a",
  borderRibbon: "#9c9184",
  disputed: "#3d3a36",
  countryText: "#8aa1a4",
  town: "#404040",
} as const;

const REGULAR = ["Noto Sans Regular"];
const ITALIC = ["Noto Sans Italic"];
/** Regular at theatre scale, bold once names have room. */
const COUNTRY_FONT: DataDrivenPropertyValueSpecification<string[]> = [
  "step",
  ["zoom"],
  ["literal", REGULAR],
  5,
  ["literal", ["Noto Sans Bold"]],
];
const NAME: ExpressionSpecification = [
  "coalesce",
  ["get", "name:en"],
  ["get", "name:latin"],
  ["get", "name"],
];

const byZoom = (...stops: number[]): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  ...stops,
];
const rankUpTo = (...steps: number[]): ExpressionSpecification => [
  "<=",
  ["coalesce", ["get", "rank"], 99],
  ["step", ["zoom"], ...steps] as ExpressionSpecification,
];
const notTunnel: FilterSpecification = ["!=", ["get", "brunnel"], "tunnel"];
const isRiver: FilterSpecification = ["==", ["get", "class"], "river"];
const onLand: ExpressionSpecification = ["!=", ["get", "maritime"], 1];
const country: ExpressionSpecification = ["==", ["get", "admin_level"], 2];
/** The border ribbon and its line pick out the same borders. */
const undisputedBorder: FilterSpecification = [
  "all",
  country,
  onLand,
  ["!=", ["get", "disputed"], 1],
];
const disputedBorder: FilterSpecification = [
  "all",
  country,
  onLand,
  ["==", ["get", "disputed"], 1],
];
/** Every town with a dot gets a label, and the reverse. */
const listedTown: FilterSpecification = [
  "all",
  ["match", ["get", "class"], ["city", "town"], true, false],
  rankUpTo(4, 6, 7, 8, 10),
];

/**
 * The United States, loosely: lower 48 inside the Canadian and Mexican
 * borders, Alaska and Hawaii. State borders and names draw only inside it, so
 * other countries' provinces and regions stay off the plate.
 */
const UNITED_STATES: MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [
    [
      [
        [-125.5, 49.3],
        [-95.4, 49.3],
        [-95.4, 49.7],
        [-94.6, 49.7],
        [-93.0, 48.95],
        [-89.4, 48.4],
        [-88.2, 48.6],
        [-84.6, 46.9],
        [-84.0, 46.7],
        [-82.3, 45.4],
        [-82.2, 43.0],
        [-82.8, 42.2],
        [-81.0, 42.4],
        [-79.0, 42.8],
        [-79.0, 43.8],
        [-76.3, 43.8],
        [-74.4, 45.3],
        [-71.4, 45.3],
        [-70.0, 46.6],
        [-69.3, 47.7],
        [-67.6, 47.5],
        [-66.6, 45.0],
        [-66.0, 44.0],
        [-69.0, 42.5],
        [-69.5, 41.0],
        [-75.0, 38.0],
        [-75.2, 35.0],
        [-79.0, 32.0],
        [-79.8, 30.0],
        [-79.8, 26.5],
        [-80.0, 24.3],
        [-82.4, 24.3],
        [-83.5, 24.5],
        [-83.5, 28.5],
        [-85.0, 29.3],
        [-89.0, 28.6],
        [-90.5, 28.6],
        [-94.0, 29.0],
        [-97.0, 25.6],
        [-97.4, 25.6],
        [-99.2, 26.1],
        [-100.0, 27.2],
        [-100.8, 28.6],
        [-101.6, 29.4],
        [-102.7, 28.8],
        [-103.2, 28.7],
        [-104.6, 29.2],
        [-106.6, 31.5],
        [-108.5, 31.5],
        [-108.5, 31.1],
        [-111.2, 31.0],
        [-114.9, 32.3],
        [-117.2, 32.3],
        [-118.5, 32.5],
        [-121.0, 34.0],
        [-124.5, 40.0],
        [-125.5, 49.3],
      ],
    ],
    [
      [
        [-170, 51],
        [-141.2, 51],
        [-141.2, 72],
        [-170, 72],
        [-170, 51],
      ],
    ],
    [
      [
        [-161, 18.5],
        [-154, 18.5],
        [-154, 22.6],
        [-161, 22.6],
        [-161, 18.5],
      ],
    ],
  ],
};
const inUnitedStates: ExpressionSpecification = ["within", UNITED_STATES];

const demSourceId = (demZoom: number) => `dem${demZoom}`;

function elevationLayers(): LayerSpecification[] {
  const ramp = elevationBandRamp();
  return ELEVATION_LEVELS.map(({ demZoom, fromZoom }, i) => {
    const nextFrom = ELEVATION_LEVELS[i + 1]?.fromZoom;
    return {
      id: `${ATLAS_ELEVATION_LAYER_PREFIX}${demZoom}`,
      type: "color-relief",
      source: demSourceId(demZoom),
      ...(fromZoom === undefined ? {} : { minzoom: fromZoom }),
      ...(nextFrom === undefined ? {} : { maxzoom: nextFrom + FADE }),
      paint: {
        "color-relief-color": ramp,
        ...(fromZoom === undefined
          ? {}
          : { "color-relief-opacity": byZoom(fromZoom, 0, fromZoom + FADE, 1) }),
      },
    };
  });
}

function vectorLayers(): LayerSpecification[] {
  return [
    // Rivers and shorelines draw under the water fill, which hides their
    // centre lines and riverbank seams and leaves only the outer edge.
    {
      id: "rivers",
      type: "line",
      source: VECTOR,
      "source-layer": "waterway",
      filter: isRiver,
      paint: { "line-color": INK.waterLine, "line-width": byZoom(4, 0.6, 10, 1.6) },
    },
    {
      id: "shoreline",
      type: "line",
      source: VECTOR,
      "source-layer": "water",
      filter: notTunnel,
      paint: { "line-color": INK.waterLine, "line-width": byZoom(4, 1.2, 10, 2.8) },
    },
    {
      id: "water",
      type: "fill",
      source: VECTOR,
      "source-layer": "water",
      filter: notTunnel,
      paint: { "fill-color": INK.water, "fill-antialias": false },
    },
    {
      id: "state-borders",
      type: "line",
      source: VECTOR,
      "source-layer": "boundary",
      layout: { "line-join": "round", "line-cap": "butt" },
      filter: ["all", ["==", ["get", "admin_level"], 4], onLand, inUnitedStates],
      paint: {
        "line-color": INK.border,
        "line-width": byZoom(4, 0.6, 10, 1.1),
        "line-dasharray": [6, 2, 1, 2],
      },
    },
    {
      id: "border-ribbon",
      type: "line",
      source: VECTOR,
      "source-layer": "boundary",
      layout: { "line-join": "round", "line-cap": "round" },
      filter: undisputedBorder,
      paint: {
        "line-color": INK.borderRibbon,
        "line-opacity": 0.18,
        "line-width": byZoom(4, 3, 10, 6),
      },
    },
    {
      id: "borders",
      type: "line",
      source: VECTOR,
      "source-layer": "boundary",
      layout: { "line-join": "round", "line-cap": "round" },
      filter: undisputedBorder,
      paint: { "line-color": INK.border, "line-width": byZoom(4, 0.8, 10, 1.4) },
    },
    {
      id: "borders-disputed",
      type: "line",
      source: VECTOR,
      "source-layer": "boundary",
      layout: { "line-join": "round", "line-cap": "round" },
      filter: disputedBorder,
      paint: {
        "line-color": INK.disputed,
        "line-opacity": 0.7,
        "line-width": byZoom(4, 1.1, 10, 1.8),
        "line-dasharray": [0, 2.5],
      },
    },
    {
      id: "river-labels",
      type: "symbol",
      source: VECTOR,
      "source-layer": "waterway",
      filter: isRiver,
      minzoom: 6,
      layout: {
        "symbol-placement": "line",
        "text-field": NAME,
        "text-font": ITALIC,
        "text-size": byZoom(6, 10, 12, 13),
        "text-letter-spacing": 0.15,
        "symbol-spacing": byZoom(10, 250, 14, 450),
      },
      paint: {
        "text-color": INK.waterText,
        "text-halo-color": INK.water,
        "text-halo-width": 1.2,
      },
    },
    {
      id: "sea-labels",
      type: "symbol",
      source: VECTOR,
      "source-layer": "water_name",
      layout: {
        "text-field": NAME,
        "text-font": ITALIC,
        "text-transform": "uppercase",
        "text-letter-spacing": 0.5,
        "text-size": byZoom(4, 11, 8, 15),
        "text-max-width": 6,
      },
      paint: { "text-color": INK.waterText },
    },
    {
      id: "state-labels",
      type: "symbol",
      source: VECTOR,
      "source-layer": "place",
      minzoom: 4,
      filter: ["all", ["==", ["get", "class"], "state"], inUnitedStates],
      layout: {
        "text-field": NAME,
        "text-font": COUNTRY_FONT,
        "text-transform": "uppercase",
        "text-letter-spacing": byZoom(4, 0.3, 7, 0.6),
        "text-size": byZoom(4, 9, 6, 12, 8, 17),
        "text-max-width": 20,
        "text-variable-anchor": ["center", "top", "bottom", "left", "right"],
        "text-radial-offset": 1.2,
      },
      paint: { "text-color": INK.countryText },
    },
    {
      id: "country-labels",
      type: "symbol",
      source: VECTOR,
      "source-layer": "place",
      filter: [
        "all",
        ["==", ["get", "class"], "country"],
        // Microstates would crowd their neighbours' names.
        [
          "!",
          [
            "in",
            ["get", "iso_a2"],
            ["literal", ["SM", "VA", "MC", "LI", "AD", "MT", "GI"]],
          ],
        ],
        rankUpTo(1, 4, 2, 5, 3, 6, 6),
      ],
      layout: {
        "text-field": NAME,
        "text-font": COUNTRY_FONT,
        "text-transform": "uppercase",
        "text-letter-spacing": byZoom(3, 0.25, 6, 0.6),
        "text-size": byZoom(3, 9, 5, 12, 6, 15, 8, 22),
        "text-max-width": 20,
      },
      paint: { "text-color": INK.countryText, "text-opacity": byZoom(3, 0.85, 5.5, 1) },
    },
    {
      id: "island-labels",
      type: "symbol",
      source: VECTOR,
      "source-layer": "place",
      filter: ["==", ["get", "class"], "island"],
      minzoom: 6,
      layout: {
        "text-field": NAME,
        "text-font": REGULAR,
        "text-transform": "uppercase",
        "text-size": 9,
        "text-letter-spacing": 0.1,
      },
      paint: { "text-color": INK.countryText },
    },
    {
      id: "town-dots",
      type: "circle",
      source: VECTOR,
      "source-layer": "place",
      filter: listedTown,
      paint: {
        "circle-radius": ["case", ["==", ["get", "capital"], 2], 3.5, 2.5],
        "circle-color": INK.paper,
        "circle-stroke-color": INK.town,
        "circle-stroke-width": 1,
      },
    },
    {
      id: "town-labels",
      type: "symbol",
      source: VECTOR,
      "source-layer": "place",
      filter: listedTown,
      layout: {
        "text-field": NAME,
        "text-font": REGULAR,
        "text-size": byZoom(5, 10, 10, 13),
        "text-anchor": "left",
        "text-offset": [0.5, 0],
      },
      paint: {
        "text-color": INK.town,
        "text-halo-color": INK.paper,
        "text-halo-width": 1,
      },
    },
  ];
}

/**
 * The Atlas basemap: a military history atlas plate with white low ground,
 * buff-to-brown elevation tints, pale cyan water and light grey borders. The
 * result is a plain MapLibre style, fresh on every call.
 */
export function createAtlasStyle(options: AtlasStyleOptions = {}): AtlasStyle {
  const dem = options.dem ?? DEFAULT_DEM;
  const sources: Record<string, SourceSpecification> = {
    [VECTOR]: options.vector ?? DEFAULT_VECTOR,
    ...Object.fromEntries(
      ELEVATION_LEVELS.map(({ demZoom }) => [
        demSourceId(demZoom),
        { ...dem, maxzoom: demZoom },
      ]),
    ),
  };
  return structuredClone({
    version: 8,
    glyphs: options.glyphs ?? DEFAULT_GLYPHS,
    sources,
    layers: [
      { id: "paper", type: "background", paint: { "background-color": INK.paper } },
      ...elevationLayers(),
      ...vectorLayers(),
    ],
  });
}
