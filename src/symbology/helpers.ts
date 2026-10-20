import { echelonValues, type SidValue, standardIdentityValues } from "@/symbology/values";
import type { SymbolItem } from "@/types/constants";
import { CUSTOM_SYMBOL_PREFIX } from "@/config/constants.ts";
import { CUSTOM_SYMBOL_SID_INDEX, SID_INDEX, STATUS_INDEX } from "@/symbology/sidc.ts";
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
  return parseCustomSymbolCode(sidc)?.sidc ?? sidc;
}

/**
 * Splits a custom symbol code, `custom1:<sidc>:<symbolId>`, into its SIDC and symbol ID.
 * The SIDC can be 20 (2525D) or 30 (2525E) characters, so split at the last colon.
 * Symbol IDs are nanoids and never contain a colon.
 */
function parseCustomSymbolCode(
  sidc: string,
): { sidc: string; symbolId: string } | undefined {
  if (!sidc.startsWith(CUSTOM_SYMBOL_PREFIX)) return;
  const separatorIndex = sidc.lastIndexOf(":");
  return {
    sidc: sidc.slice(CUSTOM_SYMBOL_PREFIX.length, separatorIndex),
    symbolId: sidc.slice(separatorIndex + 1),
  };
}

export function getCustomSymbolId(sidc: string): string | undefined {
  return parseCustomSymbolCode(sidc)?.symbolId;
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

/** Sets the status digit, such as "4" for destroyed, of a plain or custom symbol code. */
export function setStatus(sidc: string, status: string): string {
  const offset = sidc.startsWith(CUSTOM_SYMBOL_PREFIX) ? CUSTOM_SYMBOL_PREFIX.length : 0;
  const index = offset + STATUS_INDEX;
  return sidc[index] === status ? sidc : setCharAt(sidc, index, status);
}
