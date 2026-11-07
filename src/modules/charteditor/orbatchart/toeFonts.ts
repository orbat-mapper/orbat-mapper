import { DEFAULT_OPTIONS } from "./defaults";
import {
  FONT_KEYS,
  type FontKey,
  type FontOptions,
  LABEL_FONT_OPTIONS,
  type PartialOrbChartOptions,
  TOE_FONT_OPTIONS,
  type ToeFontGroup,
} from "./types";

export const EQUIPMENT_FONT_SCALE = 0.9;

// The font set by `names`, with each unset option taken from `fallback`
function pickFont(
  options: PartialOrbChartOptions,
  names: Readonly<Record<FontKey, keyof PartialOrbChartOptions>>,
  fallback: FontOptions,
): FontOptions {
  return Object.fromEntries(
    FONT_KEYS.map((key) => [key, options[names[key]] ?? fallback[key]]),
  ) as unknown as FontOptions;
}

/**
 * The fonts the personnel and equipment lines are drawn with. Unset personnel options
 * follow the unit label font, unset equipment options follow the personnel ones, with
 * the size at 90%.
 */
export function resolveToeFonts(
  options: PartialOrbChartOptions,
): Record<ToeFontGroup, FontOptions> {
  const label = pickFont(options, LABEL_FONT_OPTIONS, DEFAULT_OPTIONS);
  const personnel = pickFont(options, TOE_FONT_OPTIONS.personnel, label);
  const equipment = pickFont(options, TOE_FONT_OPTIONS.equipment, {
    ...personnel,
    fontSize: personnel.fontSize * EQUIPMENT_FONT_SCALE,
  });
  return { personnel, equipment };
}
