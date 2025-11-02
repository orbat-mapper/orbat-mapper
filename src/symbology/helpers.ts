import { echelonValues, type SidValue, standardIdentityValues } from "@/symbology/values";
import type { SymbolItem } from "@/types/constants";
import { CUSTOM_SYMBOL_PREFIX, CUSTOM_SYMBOL_SLICE } from "@/config/constants.ts";
import { CUSTOM_SYMBOL_SID_INDEX, SID_INDEX } from "@/symbology/sidc.ts";
import { setCharAt } from "@/components/helpers.ts";

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

export function getFullUnitSidc(sidc: string): string {
  if (sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    return sidc.slice(CUSTOM_SYMBOL_PREFIX.length, CUSTOM_SYMBOL_PREFIX.length + 20);
  }
  return sidc;
}

export function getCustomSymbolId(sidc: string): string | null | undefined {
  if (sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    return sidc.slice(CUSTOM_SYMBOL_SLICE);
  }
}

export function setSid(sidc: string, sidValue: string): string {
  if (sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) {
    if (sidc[CUSTOM_SYMBOL_SID_INDEX] !== sidValue) {
      return setCharAt(sidc, CUSTOM_SYMBOL_SID_INDEX, sidValue);
    }
  } else {
    if (sidc[SID_INDEX] !== sidValue) {
      return setCharAt(sidc, SID_INDEX, sidValue);
    }
  }
  return sidc;
}
