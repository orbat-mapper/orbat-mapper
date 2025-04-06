import { echelonValues, type SidValue, standardIdentityValues } from "@/symbology/values";
import type { SymbolItem } from "@/types/constants";

export const sidItems = standardIdentityValues.map(({ code, text }): SymbolItem => {
  return {
    code,
    text,
    sidc: "100" + code + 10 + "00" + "00" + "0000000000",
  };
});

export function getNextEchelonBelow(echelon: string): string {
  // brigade -> battalion (skip regiment)
  if (echelon === "18") return "16";
  const idx = echelonValues.findIndex((e) => e.code === echelon);
  if (idx > 0) return echelonValues[idx - 1].code;

  return echelon;
}

export function echelonItems(sid: SidValue) {
  return echelonValues.map(({ code, text }): SymbolItem => {
    return {
      code,
      text,
      sidc: "100" + sid + "10" + "00" + code + "0000000000",
    };
  });
}
