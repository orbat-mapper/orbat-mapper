import { MaybeRef } from "@vueuse/core";
import { computed, ref } from "vue";
import { SID, SidValue } from "@/symbology/values";
import { SymbolItem, SymbolValue } from "@/types/constants";
import { echelonItems } from "@/symbology/helpers";
import { Sidc } from "@/symbology/sidc";

export interface UseToolbarUnitSymbolDataOptions {
  currentSid?: MaybeRef<string>;
  currentEchelon?: MaybeRef<string>;
}

export function useToolbarUnitSymbolData(options: UseToolbarUnitSymbolDataOptions = {}) {
  const currentSid = ref(options.currentSid ?? SID.Hostile);
  const currentEchelon = ref(options.currentEchelon ?? "16");
  const customIcon = ref<SymbolValue>({ code: "10031000141211000000", text: "Infantry" });

  const icons: SymbolValue[] = [
    { code: "121100", text: "Infantry" },
    { code: "121000", text: "Combined Arms" },
    { code: "121102", text: "Mechanized" },
    { code: "130300", text: "Artillery" },
    { code: "120500", text: "Armor" },
    { code: "160600", text: "Combat Service Support" },
  ];

  const iconItems = computed(() => {
    return icons.map(({ code, text }): SymbolItem => {
      return {
        code,
        text,
        sidc: "100" + currentSid.value + "10" + "00" + "00" + code + "0000",
      };
    });
  });

  const echelons = computed(() => echelonItems(currentSid.value as SidValue));
  const echelonSidc = computed(
    () => "100" + currentSid.value + "10" + "00" + currentEchelon.value + "0000000000"
  );

  const customSidc = computed(() => {
    const parsedSidc = new Sidc(customIcon.value.code);
    parsedSidc.standardIdentity = currentSid.value;
    parsedSidc.emt = "00";
    parsedSidc.hqtfd = "0";
    return parsedSidc.toString();
  });

  return {
    currentSid,
    currentEchelon,
    iconItems,
    echelons,
    echelonSidc,
    customSidc,
    customIcon,
  };
}
