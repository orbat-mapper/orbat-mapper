/**
 * Custom milsymbol wrapper
 *
 */

import ms, { type Symbol as MilSymbol, type SymbolOptions } from "milsymbol";

const customColorMode = ms.getColorMode("Light");
customColorMode.Friend = "rgb(170, 176, 116)";

const customIconColor = { ...ms.getColorMode("FrameColor") };
customIconColor.Friend = "rgb(65, 70, 22)";

const cm2 = ms.getColorMode("Light");
cm2.Friend = cm2.Hostile;

function replaceAt(text: string, index: number, replace: string) {
  return text.substring(0, index) + replace + text.substring(index + 1);
}

export function symbolGenerator(sidc: string, options: SymbolOptions = {}): MilSymbol {
  let opts = options;
  if (sidc[3] === "7") {
    sidc = replaceAt(sidc, 3, "3");
    opts = {
      colorMode: { ...customColorMode },
      frameColor: { ...customIconColor },
      iconColor: { ...customIconColor },
      ...options,
    };
  } else if (sidc[3] === "8") {
    sidc = replaceAt(sidc, 3, "3");
    opts = { colorMode: cm2, ...options };
  }
  return new ms.Symbol(sidc, opts);
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
