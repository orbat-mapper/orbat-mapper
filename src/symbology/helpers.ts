import { standardIdentityValues } from "@/symbology/values";
import type { SymbolItem } from "@/types/constants";

export const sidItems = standardIdentityValues.map(({ code, text }): SymbolItem => {
  return {
    code,
    text,
    sidc: "100" + code + 10 + "00" + "00" + "0000000000",
  };
});
