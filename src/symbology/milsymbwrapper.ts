/**
 * Custom milsymbol wrapper
 *
 */

import ms, { type Symbol as MilSymbol, type SymbolOptions } from "milsymbol";
import { SID, type SidValue } from "@/symbology/values";

/** The fill colour this project gives Custom 1. Not derived from any colour mode. */
const CUSTOM1_FILL_COLOR = "rgb(170, 176, 116)";
/** The frame/icon colour this project gives Custom 1. */
const CUSTOM1_FRAME_COLOR = "rgb(65, 70, 22)";

const customColorMode = ms.getColorMode("Light");
customColorMode.Friend = CUSTOM1_FILL_COLOR;

const customIconColor = { ...ms.getColorMode("FrameColor") };
customIconColor.Friend = CUSTOM1_FRAME_COLOR;

const cm2 = ms.getColorMode("Light");
cm2.Friend = cm2.Hostile;

/** The affiliation keys a milsymbol `ColorMode` is indexed by. */
export type MilsymbolAffiliation =
  "Civilian" | "Friend" | "Hostile" | "Neutral" | "Suspect" | "Unknown";

/**
 * milsymbol's own standard-identity digit to affiliation mapping
 * (`milsymbol/src/numbersidc/metadata.js`), plus the 2525E special case where
 * standard identity `5` renders in the Suspect colour rather than Hostile.
 *
 * Custom 1 (`7`) and Custom 2 (`8`) are this project's own and are handled by
 * `resolveStandardIdentity` rather than by this table. Custom 3 (`9`) exists in
 * `SID` but has never had a rendering rule; it falls through to Unknown.
 */
const AFFILIATION_BY_SID: Record<string, MilsymbolAffiliation> = {
  "0": "Unknown",
  "1": "Unknown",
  "2": "Friend",
  "3": "Friend",
  "4": "Neutral",
  "5": "Suspect",
  "6": "Hostile",
};

export interface StandardIdentityResolution {
  /** The milsymbol affiliation whose colour this identity should read. */
  affiliation: MilsymbolAffiliation;
  /**
   * The standard-identity digit milsymbol should actually be handed, when it
   * differs from the requested one. Undefined means "pass the sidc through".
   */
  drawnSid?: SidValue;
  /** `SymbolOptions` that reproduce this identity, or undefined when none apply. */
  symbolOptions?: SymbolOptions;
  /**
   * A literal colour that overrides any colour-mode lookup. Only Custom 1 has one:
   * its colour is authored here, not taken from a milsymbol colour mode.
   */
  color?: string;
}

/**
 * Resolve a standard-identity digit into what milsymbol has to be told to draw it.
 *
 * Extracted from `symbolGenerator` so that identity *colours* can be resolved
 * without building a symbol — see `identityColor` — and so the two agree by
 * construction. Custom 1 and Custom 2 therefore resolve for free.
 */
export function resolveStandardIdentity(
  sid: string | undefined,
): StandardIdentityResolution {
  if (sid === SID.Custom1) {
    return {
      affiliation: "Friend",
      drawnSid: SID.Friend,
      symbolOptions: {
        colorMode: { ...customColorMode },
        frameColor: { ...customIconColor },
        iconColor: { ...customIconColor },
      },
      color: CUSTOM1_FILL_COLOR,
    };
  }
  if (sid === SID.Custom2) {
    // Custom 2 is "Friend frame, Hostile colour", so its colour affiliation is Hostile.
    return {
      affiliation: "Hostile",
      drawnSid: SID.Friend,
      symbolOptions: { colorMode: cm2 },
    };
  }
  return { affiliation: (sid && AFFILIATION_BY_SID[sid]) || "Unknown" };
}

function replaceAt(text: string, index: number, replace: string) {
  return text.substring(0, index) + replace + text.substring(index + 1);
}

export function symbolGenerator(sidc: string, options: SymbolOptions = {}): MilSymbol {
  const { drawnSid, symbolOptions } = resolveStandardIdentity(sidc[3]);
  if (drawnSid === undefined || symbolOptions === undefined) {
    return new ms.Symbol(sidc, options);
  }
  return new ms.Symbol(replaceAt(sidc, 3, drawnSid), { ...symbolOptions, ...options });
}

export const textAmpMap = {
  C: "quantity",
  F: "reinforcedReduced",
  G: "staffComments",
  H: "additionalInformation",
  J: "evaluationRating",
  K: "combatEffectiveness",
  L: "signatureEquipment",
  M: "higherFormation",
  N: "hostile",
  P: "iffSif",
  Q: "direction",
  R: "quantity",
  T: "uniqueDesignation",
  V: "type",
  W: "dtg",
  X: "altitudeDepth",
  Y: "location",
  Z: "speed",
  AA: "specialHeadquarters",
  AC: "country",
  AD: "platformType",
  AE: "equipmentTeardownTime",
  AF: "commonIdentifier",
  AH: "headquartersElement",
  AP: "targetNumber",
  AQ: "guardedUnit",
  AR: "specialDesignator",
  R2: "sigint",
} as const;

export type TextAmpKey = keyof typeof textAmpMap;
export type TextAmpValue = (typeof textAmpMap)[keyof typeof textAmpMap];

export const textAmpMapInv = Object.fromEntries(
  Object.entries(textAmpMap).map(([k, v]) => [v, k]),
);
