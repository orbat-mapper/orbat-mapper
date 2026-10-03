import type { Position } from "geojson";
import {
  canonicalTextAmplifierKey,
  getControlMeasureMetadata,
  getControlMeasureMetadataByValue,
  getDefaultOptions,
  project,
  renderControlMeasure,
  roundToFixed,
  type ControlMeasureKind,
  type TextAmplifiers as ControlMeasureTextAmplifiers,
} from "@orbat-mapper/control-measures";
import { convertLetterSidc2NumberSidc } from "@orbat-mapper/convert-symbology";
import { buildControlMeasure } from "@/geo/controlMeasures";
import { normalizeRotation } from "@/geo/rotation";
import { controlMeasureEchelonValue } from "@/symbology/controlMeasureEchelon";
import { type TextAmpKey, textAmpMap } from "@/symbology/milsymbwrapper";
import type { SidValue } from "@/symbology/values";
import type { ReinforcedStatus, TextAmplifiers } from "@/types/scenarioModels";
import type { TacticalGraphicLayerItem } from "@/types/scenarioLayerItems";
import { nanoid } from "@/utils";
import { adaptAnchors } from "./anchors";
import { GENERIC_KINDS, genericAppearance, mssColor } from "./genericGraphics";
import type { MilXDocument, MilXGraphic } from "./model";

interface MilXImportEntryBase {
  /** Index into `MilXDocument.layers`. */
  layerIndex: number;
  layerName: string;
  name: string;
  /** The letter SIDC as written in the MilX file. */
  originalSidc: string;
}

export interface MilXUnitEntry extends MilXImportEntryBase {
  type: "unit";
  /** The 20-digit numeric SIDC. */
  sidc: string;
  location: Position;
  textAmplifiers: TextAmplifiers;
  reinforcedStatus?: ReinforcedStatus;
  fillColor?: string;
}

export interface MilXGraphicEntry extends MilXImportEntryBase {
  type: "graphic";
  item: TacticalGraphicLayerItem;
}

export type MilXImportEntry = MilXUnitEntry | MilXGraphicEntry;

export interface MilXImportSummary {
  /** Graphics with no ORBAT Mapper equivalent, e.g. airspace volumes. */
  unsupported: number;
  /** A few of their names, so the author can find them in the source. */
  unsupportedNames: string[];
  /** Graphics whose points or symbol code could not be used. */
  skipped: number;
  omittedLayers: number;
}

export interface MilXImportPlan {
  entries: MilXImportEntry[];
  summary: MilXImportSummary;
}

/** How a MilX symbol code lands in ORBAT Mapper. */
type Resolution =
  | {
      type: "control-measure";
      kind: ControlMeasureKind;
      options: Record<string, unknown>;
      /** The 20-digit numeric SIDC the letter code converts to, if any. */
      sidc?: string;
    }
  | { type: "unit"; sidc: string }
  | { type: "unsupported" };

/** The letter code without its affiliation, status and trailing modifiers, e.g.
 *  `G*G*GLF` for any FLOT. */
const functionKey = (sidc: string) =>
  `${sidc[0]}*${sidc[2]}*${sidc.slice(4, 10).replace(/-+$/, "")}`;

/**
 * Where convert-symbology's numeric code does not reach the right control
 * measure kind or loses a variant. Everything else resolves through it.
 */
const KIND_OVERRIDES: Record<
  string,
  { kind: ControlMeasureKind; options?: Record<string, unknown> } | null
> = {
  // convert-symbology's entity differs from the package's for these two.
  "G*G*GLF": { kind: "flot" },
  "G*M*BCB": { kind: "bridge-or-gap" },
  // The static minefield variants all convert to the generic minefield.
  "G*M*OFS": { kind: "minefield", options: { mineType: "unspecified" } },
  "G*M*OFST": { kind: "minefield", options: { mineType: "antitank" } },
  "G*M*OFSD": { kind: "minefield", options: { mineType: "antitank-antihandling" } },
  "G*M*OFSP": { kind: "minefield", options: { mineType: "antipersonnel" } },
  "G*M*OFSW": { kind: "minefield", options: { mineType: "wide-area-antitank" } },
  // No directional antitank mine type; antipersonnel-directional is another mine.
  "G*M*OFSE": null,
};

export function resolveSymbol(letterSidc: string, pointCount: number): Resolution {
  const key = functionKey(letterSidc);
  const generic = GENERIC_KINDS[key];
  if (generic) {
    return {
      type: "control-measure",
      kind: generic.kind,
      options: { ...generic.options },
    };
  }
  const { sidc } = convertLetterSidc2NumberSidc(letterSidc);
  if (!/^\d{20}$/.test(sidc)) return { type: "unsupported" };
  const override = KIND_OVERRIDES[key];
  if (override === null) return { type: "unsupported" };
  const kind =
    override?.kind ??
    (sidc.slice(4, 6) === "25"
      ? (getControlMeasureMetadataByValue(sidc.slice(10, 16))?.id as
          ControlMeasureKind | undefined)
      : undefined);
  if (kind) {
    const options: Record<string, unknown> = { ...override?.options };
    const echelon = controlMeasureEchelonValue(sidc.slice(8, 10));
    if (kind === "boundary" && echelon && echelon !== "none") options.echelon = echelon;
    return { type: "control-measure", kind, options, sidc };
  }
  // Point graphics without a kind, such as check points, become units.
  return pointCount === 1 ? { type: "unit", sidc } : { type: "unsupported" };
}

const isPosition = (point: Position) =>
  Number.isFinite(point[0]) &&
  Number.isFinite(point[1]) &&
  Math.abs(point[0]) <= 180 &&
  Math.abs(point[1]) <= 90;

const REINFORCED_STATUS: Record<string, ReinforcedStatus> = {
  R: "Reinforced",
  D: "Reduced",
  RD: "ReinforcedReduced",
};
const REINFORCED_TEXT: Record<string, string> = { R: "(+)", D: "(-)", RD: "(±)" };

function unitEntry(
  graphic: MilXGraphic,
  sidc: string,
  base: Omit<MilXImportEntryBase, "name">,
): MilXUnitEntry {
  const { T, F, XO, Q, ...rest } = graphic.attributes;
  const textAmplifiers: TextAmplifiers = {};
  for (const [key, value] of Object.entries(rest)) {
    const field = textAmpMap[key as TextAmpKey];
    const trimmed = value.trim();
    if (!field || field === "direction" || field === "reinforcedReduced" || !trimmed)
      continue;
    (textAmplifiers as Record<string, string>)[field] = trimmed;
  }
  const direction = Number.parseFloat(Q ?? "");
  if (Number.isFinite(direction)) textAmplifiers.direction = normalizeRotation(direction);
  const fillColor = mssColor(XO);
  const reinforcedStatus = F ? REINFORCED_STATUS[F.trim()] : undefined;
  return {
    ...base,
    type: "unit",
    name: T?.trim() || graphic.name,
    sidc,
    location: graphic.points[0],
    textAmplifiers,
    ...(reinforcedStatus ? { reinforcedStatus } : {}),
    ...(fillColor ? { fillColor } : {}),
  };
}

function controlMeasureAmplifiers(
  graphic: MilXGraphic,
): ControlMeasureTextAmplifiers | undefined {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(graphic.attributes)) {
    const canonical = canonicalTextAmplifierKey(key);
    const trimmed = (key === "F" ? (REINFORCED_TEXT[value] ?? value) : value).trim();
    if (canonical && trimmed) result[canonical] = trimmed;
  }
  return Object.keys(result).length ? result : undefined;
}

function controlMeasureItem(
  graphic: MilXGraphic,
  resolution: Extract<Resolution, { type: "control-measure" }>,
): TacticalGraphicLayerItem | undefined {
  const { kind, sidc } = resolution;
  const controlPoints = adaptAnchors(kind, graphic.points, graphic.locationAttributes);
  // A free-format graphic paints from its own colors, read from the MSS style.
  const appearance = sidc ? undefined : genericAppearance(graphic, kind);
  if (!controlPoints || appearance === null) return;
  const textAmplifiers = controlMeasureAmplifiers(graphic);
  const item: TacticalGraphicLayerItem = {
    kind: "tacticalGraphic",
    id: nanoid(),
    graphicKind: kind,
    controlPoints,
    options: {
      ...(getDefaultOptions(kind) as Record<string, unknown>),
      ...resolution.options,
      ...appearance?.options,
    },
    ...(graphic.name ? { name: graphic.name } : {}),
    ...(textAmplifiers ? { textAmplifiers } : {}),
    ...(appearance ? { style: appearance.style } : {}),
    // Standard identity and planned status carry over from the converted code.
    ...(sidc
      ? {
          standardIdentity: sidc[3] as SidValue,
          status: sidc[6] === "1" ? "planned" : "present",
        }
      : {}),
  };
  try {
    // The renderer checks the kind's contract.
    renderControlMeasure(buildControlMeasure(item));
  } catch {
    return;
  }
  return item;
}

/** Labels stay on screen: text that scales with the map is unreadable once
 *  zoomed out. */
const SCREEN_ONLY_SIZES = new Set(["labelSize"]);

/** The largest share of a graphic's extent one decoration may take, so the
 *  teeth of a short fortified line never outgrow the line. */
const MAX_DECORATION_EXTENT = 0.1;

/** The viewport, in CSS px, the import is assumed to be framed in. */
const FRAME_WIDTH_PX = 1024;
const FRAME_HEIGHT_PX = 768;

/** The Web Mercator bounds of `points`, the units the engine draws decorations
 *  in, as `[width, height]`. */
function mercatorSize(points: Position[]): [number, number] {
  const projected = points.map(([lon, lat]) => project(lon, lat));
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
}

/** Web Mercator meters per CSS px when `points` fill the assumed viewport, or
 *  undefined when they have no extent. */
function framedMetersPerPixel(points: Position[]): number | undefined {
  if (!points.length) return;
  const [width, height] = mercatorSize(points);
  const metersPerPixel = Math.max(width / FRAME_WIDTH_PX, height / FRAME_HEIGHT_PX);
  return metersPerPixel > 0 ? metersPerPixel : undefined;
}

/**
 * Size a measure's decorations, such as boundary echelons and fortified-line
 * teeth, on the ground rather than on screen: each takes the meters its default
 * pixel size covers when the import is framed, capped for graphics too small to
 * carry them, or without a frame the engine's default meters. The pixel form
 * wins whenever it is present, so it is removed.
 */
function groundSizedOptions(item: TacticalGraphicLayerItem, metersPerPixel?: number) {
  const options: Record<string, unknown> = { ...item.options };
  const [width, height] = mercatorSize(item.controlPoints);
  const cap = Math.hypot(width, height) * MAX_DECORATION_EXTENT;
  for (const pair of getControlMeasureMetadata(item.graphicKind)?.sizePairs ?? []) {
    if (SCREEN_ONLY_SIZES.has(pair.meters)) continue;
    const pixels = options[pair.pixels];
    if (typeof pixels !== "number") continue;
    delete options[pair.pixels];
    if (metersPerPixel)
      options[pair.meters] = roundToFixed(
        Math.min(pixels * metersPerPixel, cap || Infinity),
        1,
      );
  }
  return options as TacticalGraphicLayerItem["options"];
}

/** Convert every WGS84 layer of a MilX document into import entries. */
export function convertMilX(document: MilXDocument): MilXImportPlan {
  const summary: MilXImportSummary = {
    unsupported: 0,
    unsupportedNames: [],
    skipped: 0,
    omittedLayers: 0,
  };
  const entries: MilXImportEntry[] = [];
  document.layers.forEach((layer, layerIndex) => {
    // Only geographic coordinates can be placed; other systems need a projection.
    if (layer.coordinateSystem.toUpperCase() !== "WGS84") {
      summary.omittedLayers++;
      return;
    }
    const layerName = layer.name || `Layer ${layerIndex + 1}`;
    for (const graphic of layer.graphics) {
      if (!graphic.points.length || !graphic.points.every(isPosition)) {
        summary.skipped++;
        continue;
      }
      const base = { layerIndex, layerName, originalSidc: graphic.sidc };
      const resolution = resolveSymbol(graphic.sidc, graphic.points.length);
      // A radius or width makes a single point a shape, such as a circular ACA.
      const shaped =
        graphic.corridor || Object.keys(graphic.locationAttributes).length > 0;
      if (resolution.type === "unsupported" || (resolution.type === "unit" && shaped)) {
        summary.unsupported++;
        const name = graphic.name || graphic.sidc;
        if (summary.unsupportedNames.length < 3 && name)
          summary.unsupportedNames.push(name);
        continue;
      }
      if (resolution.type === "unit") {
        entries.push(unitEntry(graphic, resolution.sidc, base));
        continue;
      }
      const item = controlMeasureItem(graphic, resolution);
      if (!item) {
        summary.skipped++;
        continue;
      }
      entries.push({
        ...base,
        type: "graphic",
        name: item.name ?? "",
        item,
      });
    }
  });
  // Measures share the scale the whole import is framed at, so their
  // decorations match.
  const metersPerPixel = framedMetersPerPixel(
    entries.flatMap((entry) =>
      entry.type === "unit" ? [entry.location] : entry.item.controlPoints,
    ),
  );
  for (const entry of entries)
    if (entry.type === "graphic")
      entry.item.options = groundSizedOptions(entry.item, metersPerPixel);
  return { entries, summary };
}

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

/** One line per kind of dropped content; empty when nothing was. */
export function summaryCaveats(summary: MilXImportSummary): string[] {
  const examples = summary.unsupportedNames.length
    ? ` (${summary.unsupportedNames.join(", ")}${summary.unsupported > summary.unsupportedNames.length ? ", …" : ""})`
    : "";
  return [
    summary.unsupported &&
      `${plural(summary.unsupported, "graphic")} without an ORBAT Mapper equivalent skipped${examples}.`,
    summary.skipped &&
      `${plural(summary.skipped, "unreadable or unpositioned item")} skipped.`,
    summary.omittedLayers &&
      `${plural(summary.omittedLayers, "layer")} in a non-WGS84 coordinate system omitted.`,
  ].filter((line): line is string => !!line);
}
