/**
 * Sizes unit symbols by echelon, after tactrace's `echelonSize.ts` (its ADR-0063):
 * the map symbol size counts as a Battalion and every echelon takes its ratio of it.
 * Units are screen-sized here, so there is no ground size or anchor zoom to keep.
 */
import { Sidc } from "@/symbology/sidc";
import { getFullUnitSidc } from "@/symbology/helpers";
import { UNIT_SYMBOLSET_VALUE } from "@/symbology/values";

/** The table key for symbols without an echelon: equipment, installations,
 *  activities and Unspecified. Matches the Unspecified echelon code. */
export const NO_ECHELON = "00";

/** Ratio of the map symbol size per echelon code. Tactrace's seed table, so a
 *  scenario looks alike in both apps: the stencils' order, but a compressed spread
 *  that ends at Command twice a Battalion rather than past 4×. A table only stores
 *  the rows a user changed; every other row reads from here. */
export const SEED_ECHELON_RATIOS: Readonly<Record<string, number>> = Object.freeze({
  [NO_ECHELON]: 1,
  "11": 0.6,
  "12": 0.67,
  "13": 0.73,
  "14": 0.8,
  "15": 0.87,
  "16": 1,
  "17": 1.13,
  "18": 1.27,
  "21": 1.47,
  "22": 1.67,
  "23": 1.8,
  "24": 1.87,
  "25": 1.93,
  "26": 2,
});

/** Below Platoon the echelon amplifier is hard to read, so no echelon size goes
 *  below this. */
export const MIN_ECHELON_SIZE_PX = 12;

/** Bounds for a map symbol size a user types, per unit or per echelon. */
export const MIN_MAP_SYMBOL_SIZE = 8;
export const MAX_MAP_SYMBOL_SIZE = 120;

/** Land units and land civilian units carry an echelon in positions 9–10; other
 *  symbol sets use them for mobility, leadership or nothing. */
const ECHELON_SYMBOL_SETS = new Set([UNIT_SYMBOLSET_VALUE, "11"]);

/** A number a size or ratio can be: a NumberField reads NaN while cleared. */
export function isPositiveNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** The table row a unit sizes from. Takes a plain SIDC or a custom symbol code. */
export function echelonSizeKey(sidc: string): string {
  const parsed = new Sidc(getFullUnitSidc(sidc));
  return ECHELON_SYMBOL_SETS.has(parsed.symbolSet) ? parsed.emt : NO_ECHELON;
}

/** A row's ratio. A table missing the row takes the seed's rather than 1, which
 *  would draw a Corps at Battalion size. */
export function echelonRatio(
  ratios: Readonly<Record<string, number>>,
  key: string,
): number {
  const ratio = ratios[key];
  return isPositiveNumber(ratio) ? ratio : (SEED_ECHELON_RATIOS[key] ?? 1);
}

/** A ratio as stored: enough places that a typed px resolves back to itself. */
export function roundRatio(ratio: number): number {
  return Math.round(ratio * 1000) / 1000;
}

/** The ratio stored for a size typed in px against `basePx`. */
export function ratioForSize(px: number, basePx: number): number {
  return roundRatio(px / basePx);
}

/** The size a ratio of `basePx` draws at, held at the minimum. */
export function sizeForRatio(ratio: number, basePx: number): number {
  return Math.max(MIN_ECHELON_SIZE_PX, Math.round(basePx * ratio));
}

/** The size a unit draws at by echelon. */
export function echelonSymbolSize(
  sidc: string,
  basePx: number,
  ratios: Readonly<Record<string, number>>,
): number {
  return sizeForRatio(echelonRatio(ratios, echelonSizeKey(sidc)), basePx);
}

export interface UnitSymbolSizeSettings {
  mapIconSize: number;
  mapSizeUnitsByEchelon: boolean;
  mapEchelonSizeRatios: Readonly<Record<string, number>>;
}

/** The size a unit without a size of its own draws at on the map. */
export function defaultUnitSymbolSize(
  sidc: string,
  settings: UnitSymbolSizeSettings,
): number {
  if (!settings.mapSizeUnitsByEchelon) return settings.mapIconSize;
  return echelonSymbolSize(sidc, settings.mapIconSize, settings.mapEchelonSizeRatios);
}

/** The size a unit draws at on the map: its own size, or the default for its SIDC. */
export function unitSymbolSize(
  ownSize: number | undefined,
  sidc: string,
  settings: UnitSymbolSizeSettings,
): number {
  return typeof ownSize === "number" ? ownSize : defaultUnitSymbolSize(sidc, settings);
}
